import { useState, useCallback, useEffect } from 'react';
import { GameState, Tile, BoardPosition } from '../types/game';
import {
	createInitialDeck,
	canPlaceTile,
	hasPlayableCards,
	initializeNewRound,
	createEmptyBoard,
	findArea,
	findBlueNeighbors,
	findConsumableTiles,
	consumeTiles,
	isLastBorderSpot
} from '../utils/gameLogic';
import { RelictManager, getEmptyNeighborPositions } from '../utils/relictManager';
import { createInitialRelictPool, getRelictSelection } from '../relicts';
import { useAnimations } from './useAnimations';

export function useGameState() {
	const { animations, addAnimation, clearAnimations } = useAnimations();
	
	const [gameState, setGameState] = useState<GameState>(() => ({
		deck: [],
		playerHand: [],
		board: createEmptyBoard(),
		discardPile: [],
		discards: 4,
		score: 0,
		targetScore: 10,
		round: 1,
		gamePhase: 'ready',
		draggedTile: null,
		hoveredPosition: null,
		ownedRelicts: [],
		availableRelicts: createInitialRelictPool(),
		relictSelectionOptions: [],
		animations: [],
		isAnimating: false,
		animatingRelicts: [],
		drawingAnimations: [],
		turnCount: 0, // Add turn counter for upgrade field spawning
		gold: 0 // Initialize gold to 0
	}));

	// Start a new game
			const startNewGame = useCallback(() => {
			setGameState(prev => {
				const allTiles = createInitialDeck();
				const newRoundState = initializeNewRound(1, allTiles, prev.gold);
				const relictManager = new RelictManager(prev.ownedRelicts);
				relictManager.resetBorderCopyFlag();
			
			// Process initial drawn tiles through relict effects
			const initialHand = newRoundState.playerHand || [];
			const processedHand = initialHand.map(tile => relictManager.processDrawTile(tile));
			
			return {
				...prev,
				...newRoundState,
				playerHand: processedHand,
				round: 1,
				gamePhase: 'playing'
			};
		});
	}, []);

	// Start a new round with end-of-round relict effects
			const startNewRound = useCallback(() => {
			setGameState(prev => {
				const currentRelictManager = new RelictManager(prev.ownedRelicts);
				currentRelictManager.resetBorderCopyFlag();
			
			// Process round end effects through relict manager
			const { board: boardAfterEffects, vanishedTiles } = currentRelictManager.processRoundEnd(prev.board, prev.round);
			
			// Collect all tiles for new round (including vanished tiles)
			const allTiles = [
				...prev.deck,
				...prev.playerHand,
				...prev.discardPile,
				...boardAfterEffects.flat().filter(tile => tile !== null && !tile.isBlock) as Tile[], // Exclude blocks
				...vanishedTiles
			].filter(tile => !tile.isGhost); // Remove all ghost copies at round end
			
			const newRoundState = initializeNewRound(prev.round + 1, allTiles, prev.gold);
			
			// Check if we should show relict selection
			const relictOptions = getRelictSelection(prev.availableRelicts);
			
			if (relictOptions.length > 0) {
				return {
					...prev,
					...newRoundState,
					round: prev.round + 1,
					gamePhase: 'relict-selection',
					relictSelectionOptions: relictOptions
				};
			} else {
				// No relicts available, draw initial hand immediately
				const relictManager = new RelictManager(prev.ownedRelicts);
				const cardsToDraw = Math.min(7, newRoundState.deck!.length);
				const drawnCards = newRoundState.deck!.slice(0, cardsToDraw);
				const newDeck = newRoundState.deck!.slice(cardsToDraw);
				
				// Process drawn cards through relict effects
				const processedDrawnCards = drawnCards.map(tile => relictManager.processDrawTile(tile));
				
				return {
					...prev,
					...newRoundState,
					round: prev.round + 1,
					playerHand: processedDrawnCards,
					deck: newDeck
				};
			}
		});
	}, []);

	// Helper function to trigger relict animation
	const triggerRelictAnimation = useCallback((relictId: string, duration: number = 1000) => {
		setGameState(prev => ({
			...prev,
			animatingRelicts: [...prev.animatingRelicts, relictId]
		}));

		setTimeout(() => {
			setGameState(prev => ({
				...prev,
				animatingRelicts: prev.animatingRelicts.filter(id => id !== relictId)
			}));
		}, duration);
	}, []);

	// Helper function to add drawing animation
	const addDrawingAnimation = useCallback((tile: Tile, fromPosition: { x: number; y: number }, toPosition: { x: number; y: number }, delay: number) => {
		const animationId = `draw-${Date.now()}-${Math.random()}`;
		setGameState(prev => ({
			...prev,
			drawingAnimations: [...prev.drawingAnimations, {
				id: animationId,
				tile,
				fromPosition,
				toPosition,
				delay
			}]
		}));

		// Remove animation after completion
		setTimeout(() => {
			setGameState(prev => ({
				...prev,
				drawingAnimations: prev.drawingAnimations.filter(anim => anim.id !== animationId)
			}));
		}, delay + 800);
	}, []);

	// Helper function to trigger Green Growth animation
	const triggerGreenGrowth = useCallback(() => {
		triggerRelictAnimation('green-prefix', 600);
	}, [triggerRelictAnimation]);

	// Place a tile on the board with enhanced animations
	const placeTile = useCallback(async (tile: Tile, position: BoardPosition) => {
		// Check if this is the first tile (board is empty of actual tiles, not blocks or upgrade fields)
		const isFirstTile = gameState.board.every(row => 
			row.every(cell => cell === null || cell.isBlock || cell.isUpgradeField)
		);
		const isFirstTileThisRound = gameState.board.every(row => 
			row.every(cell => cell === null || cell.isBlock || cell.isUpgradeField)
		);
		
		const currentRelictManager = new RelictManager(gameState.ownedRelicts);
		
		if (!canPlaceTile(tile, position, gameState.board, isFirstTile, currentRelictManager)) {
			return false;
		}

		// Clear dragged tile immediately so it doesn't hang in the air
		setGameState(prev => ({ ...prev, draggedTile: null, isAnimating: true }));

		// Start placement animation
		addAnimation('placing-starts', position, 500);

		// Wait for placement animation
		await new Promise(resolve => setTimeout(resolve, 500));

		setGameState(prev => {
			const relictManager = new RelictManager(prev.ownedRelicts);
			
			// Process tile placement through relict manager
			const { tile: initialProcessedTile, canPlace, board: newBoard, effects, copiedTiles } = relictManager.processTilePlacement(
				tile, 
				position, 
				prev.board, 
				prev.playerHand,
				isFirstTile, 
				isFirstTileThisRound
			);
			
			if (!canPlace) {
				return prev; // Placement was prevented by a relict
			}

			// Add copied tiles to deck if any were created
			let updatedDeck = prev.deck;
			if (copiedTiles && copiedTiles.length > 0) {
				updatedDeck = [...updatedDeck, ...copiedTiles];
				// Trigger border copy animation
				addAnimation('border-copy', position, 800);
				triggerRelictAnimation('border-copy', 800);
			}
			
			// Check for blue mirror effect
			if (tile.color !== 'blue' && prev.ownedRelicts.some(relict => relict.id === 'blue-mirror')) {
				// Check if any blue neighbors exist
				const blueNeighbors = findBlueNeighbors(position, newBoard);
				if (blueNeighbors.length > 0) {
					addAnimation('blue-mirror', position, 800);
					triggerRelictAnimation('blue-mirror', 800);
				}
			}
			
			// Count doubling effects for cumulative scoring
			let doublingCount = 0;
			let scoringCount = 1; // Start with 1 (normal scoring)
			let ghostPositions: BoardPosition[] = [];
			let processedTile = { ...initialProcessedTile }; // Make mutable for tile stacking

			// Process tile number changes (for digit replacement relict)
			const originalNumber = processedTile.number;
			processedTile = relictManager.processTileNumberChanged(processedTile);
			if (processedTile.number !== originalNumber) {
				addAnimation('digit-replace', position, 600);
				triggerRelictAnimation('digit-replace', 600);
			}
			
			// Apply low gold upgrade effects
			prev.ownedRelicts.forEach(relict => {
				if (relict.behavior.onLowGoldUpgrade) {
					const upgradedTile = relict.behavior.onLowGoldUpgrade(processedTile, prev.gold);
					if (upgradedTile.number !== processedTile.number) {
						processedTile = upgradedTile;
						addAnimation('upgrading', position, 600);
						triggerRelictAnimation('low-gold-upgrade', 600);
					}
				}
			});

			// Process effects and add animations
			if (effects) {
				effects.forEach(effect => {
					switch (effect.type) {
						case 'doubling':
							addAnimation('doubling', position, 800);
							if (effect.relictId) triggerRelictAnimation(effect.relictId, 800);
							doublingCount++;
							// Make doubling permanent by modifying the tile's number
							processedTile = {
								...processedTile,
								number: processedTile.number * 2
							};
							break;
						case 'scoring-twice':
							addAnimation('scoring-twice', position, 800);
							if (effect.relictId) triggerRelictAnimation(effect.relictId, 800);
							// Multiply the scoring count by the multiplier (default 2 for scoring twice)
							const multiplier = effect.multiplier || 2;
							scoringCount *= multiplier;
							break;
						case 'discard-upgrade':
							addAnimation('discard-upgrade', position, 600);
							if (effect.relictId) triggerRelictAnimation(effect.relictId, 600);
							break;
						case 'tile-copy':
							addAnimation('tile-copy', position, 800);
							if (effect.relictId) triggerRelictAnimation(effect.relictId, 800);
							break;
						case 'number-prefix':
							addAnimation('number-prefix', position, 600);
							if (effect.relictId) triggerRelictAnimation(effect.relictId, 600);
							break;
						case 'board-increment':
							addAnimation('board-increment', position, 500);
							if (effect.relictId) triggerRelictAnimation(effect.relictId, 500);
							break;
						case 'consume':
							addAnimation('consume', position, 1000);
							if (effect.relictId) triggerRelictAnimation(effect.relictId, 1000);
							// Handle consume effect: consume the tile at the position
							const targetTile = newBoard[position.row][position.col];
							if (targetTile) {
								// Add the consumed tile's value to the consuming tile
								processedTile = {
									...processedTile,
									number: processedTile.number + targetTile.number
								};
								// Mix colors if the consumed tile has a different color
								if (targetTile.color !== processedTile.color) {
									const mixedColor = mixColors(processedTile.color, targetTile.color);
									processedTile.mixedColor = mixedColor;
								}
								// Remove the consumed tile
								newBoard[position.row][position.col] = null;
							}
							break;

						case 'multiplying':
							addAnimation('multiplying', position, 800, undefined, undefined, effect.multiplier);
							if (effect.relictId) triggerRelictAnimation(effect.relictId, 800);
							// Multiply the round score for multiplying effects
							if (effect.multiplier) {
								newScore = (newScore??0 )* effect.multiplier;
							}
							break;
						case 'upgrading':
							addAnimation('upgrading', position, 600);
							if (effect.relictId) triggerRelictAnimation(effect.relictId, 600);
							break;
						case 'vanishing':
							addAnimation('vanishing', position, 1000);
							if (effect.relictId) triggerRelictAnimation(effect.relictId, 1000);
							// Remove the tile from the board after vanishing animation
							setTimeout(() => {
								setGameState(prev => {
									const newBoard = prev.board.map(row => [...row]);
									newBoard[position.row][position.col] = null;
									return { ...prev, board: newBoard };
								});
							}, 1000);
							break;
						case 'ghost-spawn':
							addAnimation('ghost-spawn', position, 800);
							if (effect.relictId) triggerRelictAnimation(effect.relictId, 800);
							// Get empty neighbor positions for ghost spawning
							const emptyPositions = getEmptyNeighborPositions(position, newBoard);
							ghostPositions = emptyPositions.slice(0, effect.multiplier || 1);
							break;
						case 'relict-trigger':
							addAnimation('relict-trigger', position, 700, effect.relictId);
							if (effect.relictId) triggerRelictAnimation(effect.relictId, 700);
							break;
					}
				});
			}

			// Calculate base score for the tile
			let scoreValue = relictManager.calculateTileScore(processedTile, position, newBoard);
			
			// Apply gold multiplier effects
			prev.ownedRelicts.forEach(relict => {
				if (relict.behavior.onScoringGold) {
					scoreValue = relict.behavior.onScoringGold(scoreValue, prev.gold);
				}
			});
			
			const totalScoreValue = scoreValue * Math.pow(2, doublingCount) * scoringCount;
			
			// Show scoring animation for each scoring event
			for (let i = 0; i < scoringCount; i++) {
				const delay = i * 200; // Stagger the scoring animations
				setTimeout(() => {
					addAnimation('score-popup', position, 1000, undefined, scoreValue * Math.pow(2, doublingCount));
				}, delay);
			}
			
			let newHand = prev.playerHand.filter(handTile => handTile.id !== tile.id);
			let newDeck = updatedDeck;
			
			// Calculate retrigger count for blue neighbor effect
			const retriggerCount = relictManager.getRetriggerCount(position, newBoard);
			
			// Calculate new score after placement (with retriggering)
			let newScore = prev.score;
			// Add the score for the newly placed tile (with retriggering and scoring count)
			for (let i = 0; i < retriggerCount; i++) {
				newScore += relictManager.calculateTileScore(processedTile, position, newBoard) * scoringCount;
			}
			
			// Add cumulative doubling to the score
			newScore += totalScoreValue - (scoreValue * scoringCount);
			
			// Check if target score was reached and process tile copy effects
			const wasTargetReached = prev.score < prev.targetScore && newScore >= prev.targetScore;
			if (wasTargetReached) {
				const copiedTiles = relictManager.processTargetScoreReached(processedTile, position);
				// Add copied tiles to the deck
				newDeck = [...newDeck, ...copiedTiles];
			}
			
			// Process board increment effects
			const boardAfterIncrement = relictManager.processBoardIncrement(newBoard);
			
			// Check if tile was placed on an upgrade field
			const targetTile = prev.board[position.row][position.col];
			if (targetTile && targetTile.isUpgradeField) {
				// Upgrade the tile before scoring
				processedTile = {
					...processedTile,
					number: processedTile.number + 1
				};
				addAnimation('upgrading', position, 600);
				triggerRelictAnimation('upgrade-field-spawn', 600);
			}
			
			// Detect and process areas
			const colorArea = findArea(position, boardAfterIncrement, 'color', processedTile);
			const digitArea = findArea(position, boardAfterIncrement, 'digit', processedTile);
			const sameColorArea = findArea(position, boardAfterIncrement, 'same-color', processedTile);
			
			// Process area effects
			let boardAfterAreas = boardAfterIncrement;
			
			// Process color area effects
			if (colorArea.length > 1) { // More than just the placed tile
				boardAfterAreas = relictManager.processAreaFormed(processedTile, colorArea, 'color', boardAfterAreas);
				// Trigger area color change animation if any tiles changed color
				if (JSON.stringify(boardAfterAreas) !== JSON.stringify(boardAfterIncrement)) {
					addAnimation('area-color-change', position, 800);
					triggerRelictAnimation('area-color-change', 800);
				}
			}
			
			// Process digit area effects
			if (digitArea.length > 1) { // More than just the placed tile
				boardAfterAreas = relictManager.processAreaFormed(processedTile, digitArea, 'digit', boardAfterAreas);
				// Trigger area color change animation if any tiles changed color
				if (JSON.stringify(boardAfterAreas) !== JSON.stringify(boardAfterIncrement)) {
					addAnimation('area-color-change', position, 800);
					triggerRelictAnimation('area-color-change', 800);
				}
			}
			
			// Process same color area effects
			if (sameColorArea.length > 1) { // More than just the placed tile
				boardAfterAreas = relictManager.processAreaFormed(processedTile, sameColorArea, 'same-color', boardAfterAreas);
				// Trigger area upgrade animation if any tiles were upgraded
				if (JSON.stringify(boardAfterAreas) !== JSON.stringify(boardAfterIncrement)) {
					addAnimation('area-upgrade', position, 800);
					triggerRelictAnimation('area-upgrade', 800);
				}
			}
			
			// Check for border consume effect
			if (prev.ownedRelicts.some(relict => relict.id === 'border-consume')) {
				// Check if this is the last border spot being filled
				const isLastBorderSpotResult = isLastBorderSpot(position, boardAfterAreas);
				if (isLastBorderSpotResult) {
					addAnimation('border-consume', position, 1500);
					triggerRelictAnimation('border-consume', 1500);
				}
			}
			
			// Spawn ghost tiles if needed
			if (ghostPositions.length > 0) {
				setTimeout(() => {
					setGameState(prev => {
						const ghostBoard = prev.board.map(row => [...row]);
						ghostPositions.forEach(ghostPos => {
							const ghostTile: Tile = {
								...processedTile,
								id: `ghost-${Date.now()}-${Math.random()}`,
								isGhost: true
							};
							ghostBoard[ghostPos.row][ghostPos.col] = ghostTile;
						});
						return { ...prev, board: ghostBoard };
					});
				}, 800);
			}
			
			// Draw 1 card after each placement
			const cardsToDraw = Math.min(1, newDeck.length);
			const drawnCards = newDeck.slice(0, cardsToDraw);
			newDeck = newDeck.slice(cardsToDraw);
			
			// Process drawn cards through relict effects
			const processedDrawnCards = drawnCards.map(tile => relictManager.processDrawTile(tile));
			
			// Check for special drawing effects
			processedDrawnCards.forEach((tile, index) => {
				// Check for blue trigger relict
				if (tile.color === 'blue' && prev.ownedRelicts.some(relict => relict.id === 'blue-trigger')) {
					// Trigger the blue tile (this would need more complex logic for hand neighbors)
					addAnimation('blue-trigger', position, 700);
					triggerRelictAnimation('blue-trigger', 700);
				}
				
				// Check for green upgrade relict
				if (tile.color === 'green' && prev.ownedRelicts.some(relict => relict.id === 'green-upgrade')) {
					// Upgrade all green tiles on the board
					addAnimation('green-upgrade', position, 700);
					triggerRelictAnimation('green-upgrade', 700);
					
					// Apply the upgrade to all green tiles on the board
					setTimeout(() => {
						setGameState(prev => {
							const newBoard = prev.board.map(row => 
								row.map(tile => 
									tile && tile.color === 'green' 
										? { ...tile, number: tile.number + 1 }
										: tile
								)
							);
							return { ...prev, board: newBoard };
						});
					}, 700);
				}
			});
			
			// Add drawing animations for each card
			processedDrawnCards.forEach((tile, index) => {
				// Calculate positions (this would need to be more sophisticated in practice)
				const fromPosition = { x: 100, y: 100 }; // Deck position
				const toPosition = { x: 200 + index * 50, y: 500 }; // Hand position
				const delay = index * 200; // Stagger the animations
				
				addDrawingAnimation(tile, fromPosition, toPosition, delay);
			});
			
			// Update hand after animation completes
			setTimeout(() => {
				setGameState(prev => {
					const updatedHand = [...newHand, ...processedDrawnCards];
					
					// Process auto-discard after drawing
					const handAfterAutoDiscard = relictManager.processAfterDrawTile(updatedHand, boardAfterIncrement);
					
					return {
						...prev,
						playerHand: handAfterAutoDiscard
					};
				});
			}, processedDrawnCards.length * 200 + 800); // Wait for all animations to complete
			
			// Process auto-discard after placement
			const handAfterPlacement = relictManager.processAfterPlaceTile(newHand, boardAfterIncrement);
			
			// Check if we should spawn upgrade fields (every other turn)
			let finalBoard = boardAfterAreas;
			if ((prev.turnCount + 1) % 2 === 0) {
				finalBoard = relictManager.processEveryOtherTurn(boardAfterAreas);
			}
			
			// Check for single neighbor copy effect
			const emptyPositions = getEmptyNeighborPositions(position, boardAfterAreas);
			if (emptyPositions.length === 1 && prev.ownedRelicts.some(relict => relict.id === 'single-neighbor-copy')) {
				addAnimation('single-neighbor-copy', emptyPositions[0], 800);
				triggerRelictAnimation('single-neighbor-copy', 800);
			}
			
			// Check for color first upgrade effect
			const allTiles = boardAfterAreas.flat().filter(t => t !== null && !t.isBlock && !t.isUpgradeField);
			const tilesOfSameColor = allTiles.filter(t => t!.color === processedTile.color);
			if (tilesOfSameColor.length === 1 && prev.ownedRelicts.some(relict => relict.id === 'color-first-upgrade')) {
				addAnimation('color-first-upgrade', position, 800);
				triggerRelictAnimation('color-first-upgrade', 800);
			}
			
			// Actually place the processed tile on the board
			finalBoard[position.row][position.col] = processedTile;
			
			return {
				...prev,
				board: finalBoard,
				playerHand: handAfterPlacement, // Apply auto-discard
				deck: newDeck,
				score: newScore,
				turnCount: prev.turnCount + 1 // Increment turn counter
			};
		});

		// Wait for animations to complete
		await new Promise(resolve => setTimeout(resolve, 1000));

		// Add placement done animation
		addAnimation('placing-done', position, 300);

		// Wait for final animation
		await new Promise(resolve => setTimeout(resolve, 300));

		// Clear animating state
		setGameState(prev => ({ ...prev, isAnimating: false }));
		
		// Check if target score was reached and go to relict selection instead of won screen
		setGameState(prev => {
			if (prev.score >= prev.targetScore) {
				// Process round end effects first (like vanished tiles, etc.)
				const currentRelictManager = new RelictManager(prev.ownedRelicts);
				const { board: boardAfterEffects, vanishedTiles } = currentRelictManager.processRoundEnd(prev.board, prev.round);
				
				// Calculate gold earnings
				let goldEarned = 50; // Base gold for completing round
				
				// Count free spots on the board
				const freeSpots = boardAfterEffects.flat().filter(tile => tile === null).length;
				goldEarned += freeSpots; // 1 gold per free spot
				
				// Process relict effects for round end gold
				prev.ownedRelicts.forEach(relict => {
					if (relict.behavior.onRoundEndGold) {
						goldEarned += relict.behavior.onRoundEndGold(prev.discards);
					}
				});
				
				const newGold = prev.gold + goldEarned;
				
				// Collect all tiles for new round (including vanished tiles)
				const allTiles = [
					...prev.deck,
					...prev.playerHand,
					...prev.discardPile,
					...boardAfterEffects.flat().filter(tile => tile !== null && !tile.isBlock) as Tile[], // Exclude blocks
					...vanishedTiles
				].filter(tile => !tile.isGhost); // Remove all ghost copies at round end
				
				// Initialize new round state
				const newRoundState = initializeNewRound(prev.round + 1, allTiles, newGold);
				
				// Check if we should show relict selection
				const relictOptions = getRelictSelection(prev.availableRelicts);
				
				if (relictOptions.length > 0) {
					return { 
						...prev,
						...newRoundState,
						round: prev.round + 1,
						gamePhase: 'relict-selection',
						relictSelectionOptions: relictOptions
					};
				} else {
					// If no relicts available, start new round
					return { 
						...prev,
						...newRoundState,
						round: prev.round + 1,
						gamePhase: 'playing'
					};
				}
			}
			return prev;
		});
		
		return true;
	}, [gameState.board, gameState.playerHand, gameState.ownedRelicts, addAnimation, triggerRelictAnimation]);

	// Discard selected tiles
	const discardTiles = useCallback((tilesToDiscard: Tile[]) => {
		if (gameState.discards <= 0 || tilesToDiscard.length === 0) {
			return false;
		}

		setGameState(prev => {
			const relictManager = new RelictManager(prev.ownedRelicts);
			
			// Process discard tiles through relict effects with context
			const { processedTiles, ghostCopies, reduceDrawCount } = relictManager.processDiscardTiles(
				tilesToDiscard, 
				{ board: prev.board, handSize: prev.playerHand.length }
			);
			
			// Calculate gold from yellow tiles
			let goldEarned = 0;
			tilesToDiscard.forEach(tile => {
				if (tile.color === 'yellow') {
					prev.ownedRelicts.forEach(relict => {
						if (relict.behavior.onDiscardYellowTile) {
							goldEarned += relict.behavior.onDiscardYellowTile(tile);
						}
					});
				}
			});
			
			// Show gold earned animation if any gold was earned
			if (goldEarned > 0) {
				addAnimation('gold-earned', { row: 0, col: 0 }, 1000);
			}
			
			const newHand = prev.playerHand.filter(tile => 
				!tilesToDiscard.some(discardTile => discardTile.id === tile.id)
			);
			
			const newDiscardPile = [...prev.discardPile, ...processedTiles];
			
			// Add ghost copies to hand before drawing
			const handWithGhosts = [...newHand, ...ghostCopies];
			
			// Trigger ghost hand animation if ghost copies were created
			if (ghostCopies.length > 0) {
				addAnimation('ghost-hand', { row: 0, col: 0 }, 800);
				triggerRelictAnimation('ghost-hand', 800);
			}
			
			// Draw new cards from deck (reduced by ghost copies)
			const cardsToDraw = Math.min(tilesToDiscard.length - reduceDrawCount, prev.deck.length);
			const drawnCards = prev.deck.slice(0, cardsToDraw);
			const newDeck = prev.deck.slice(cardsToDraw);
			
			// Process drawn cards through relict effects
			const processedDrawnCards = drawnCards.map(tile => relictManager.processDrawTile(tile));
			
			// Check for special drawing effects in discard
			processedDrawnCards.forEach((tile, index) => {
				// Check for blue trigger relict
				if (tile.color === 'blue' && prev.ownedRelicts.some(relict => relict.id === 'blue-trigger')) {
					// Trigger the blue tile (this would need more complex logic for hand neighbors)
					triggerRelictAnimation('blue-trigger', 700);
				}
				
				// Check for green upgrade relict
				if (tile.color === 'green' && prev.ownedRelicts.some(relict => relict.id === 'green-upgrade')) {
					// Upgrade all green tiles on the board
					triggerRelictAnimation('green-upgrade', 700);
					
					// Apply the upgrade to all green tiles on the board
					setTimeout(() => {
						setGameState(prev => {
							const newBoard = prev.board.map(row => 
								row.map(tile => 
									tile && tile.color === 'green' 
										? { ...tile, number: tile.number + 1 }
										: tile
								)
							);
							return { ...prev, board: newBoard };
						});
					}, 700);
				}
			});
			
			return {
				...prev,
				playerHand: [...handWithGhosts, ...processedDrawnCards],
				discardPile: newDiscardPile,
				deck: newDeck,
				discards: prev.discards - 1,
				gold: prev.gold + goldEarned
			};
		});
		
		return true;
	}, [gameState.discards, gameState.playerHand, gameState.deck, gameState.ownedRelicts]);

	// Set dragged tile
	const setDraggedTile = useCallback((tile: Tile | null) => {
		setGameState(prev => ({ ...prev, draggedTile: tile }));
	}, []);

	// Set hovered position
	const setHoveredPosition = useCallback((position: BoardPosition | null) => {
		setGameState(prev => ({ ...prev, hoveredPosition: position }));
	}, []);

	// Check win/lose conditions after each state change
	useEffect(() => {
		if (gameState.gamePhase !== 'playing') return;

		// Check lose conditions - only lose if no playable cards and no discards/deck
		const hasDiscards = gameState.discards > 0;
		const hasCardsInDeck = gameState.deck.length > 0;
		const currentRelictManager = new RelictManager(gameState.ownedRelicts);
		const canPlayCards = hasPlayableCards(gameState.playerHand, gameState.board, currentRelictManager);

		// Player loses if they have no playable cards AND either no discards left OR no cards in deck
		if (!canPlayCards && (!hasDiscards || !hasCardsInDeck)) {
			setGameState(prev => ({ ...prev, gamePhase: 'lost' }));
		}
	}, [gameState.discards, gameState.deck.length, gameState.playerHand, gameState.board, gameState.gamePhase, gameState.ownedRelicts]);

	// Reorder relicts
	const reorderRelicts = useCallback((newOrder: any[]) => {
		setGameState(prev => ({
			...prev,
			ownedRelicts: newOrder
		}));
	}, []);

	// Select relict during selection phase
	const selectRelict = useCallback((relict: any) => {
		setGameState(prev => {
			const relictManager = new RelictManager([...prev.ownedRelicts, relict]);
			
			// Draw initial hand after relict selection (except for first round)
			let newHand = prev.playerHand;
			let newDeck = prev.deck;
			
			if (prev.round > 1) {
				// Draw 7 cards for the initial hand
				const cardsToDraw = Math.min(7, prev.deck.length);
				const drawnCards = prev.deck.slice(0, cardsToDraw);
				newDeck = prev.deck.slice(cardsToDraw);
				
				// Process drawn cards through relict effects
				const processedDrawnCards = drawnCards.map(tile => relictManager.processDrawTile(tile));
				newHand = processedDrawnCards;
			}
			
			return {
				...prev,
				ownedRelicts: [...prev.ownedRelicts, relict],
				availableRelicts: prev.availableRelicts.filter(r => r.id !== relict.id),
				relictSelectionOptions: [],
				playerHand: newHand,
				deck: newDeck,
				gamePhase: 'playing'
			};
		});
	}, []);

	// Sell a relict for gold
	const sellRelict = useCallback((relictId: string) => {
		setGameState(prev => {
			const relictToSell = prev.ownedRelicts.find(r => r.id === relictId);
			if (!relictToSell) return prev;
			
			// Remove the relict and add gold
			const newRelicts = prev.ownedRelicts.filter(r => r.id !== relictId);
			const newGold = prev.gold + 25; // Sell for 25 gold
			
			// Process sell relict effects on remaining relicts
			const relictManager = new RelictManager(newRelicts);
			const newHand = relictManager.processSellRelict(prev.playerHand);
			
			return {
				...prev,
				ownedRelicts: newRelicts,
				gold: newGold,
				playerHand: newHand
			};
		});
	}, []);

	return {
		gameState: { ...gameState, animations },
		actions: {
			startNewGame,
			startNewRound,
			placeTile,
			discardTiles,
			setDraggedTile,
			setHoveredPosition,
			reorderRelicts,
			selectRelict,
			sellRelict
		}
	};
}
