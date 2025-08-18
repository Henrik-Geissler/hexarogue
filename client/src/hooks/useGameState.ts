import { useState, useCallback, useEffect } from 'react';
import { GameState, Tile, BoardPosition } from '../types/game';
import {
	createInitialDeck,
	canPlaceTile,
	hasPlayableCards,
	initializeNewRound,
	createEmptyBoard
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
		animatingRelicts: []
	}));

	// Create relict manager instance
	const relictManager = new RelictManager(gameState.ownedRelicts);

	// Start a new game
	const startNewGame = useCallback(() => {
		const allTiles = createInitialDeck();
		const newRoundState = initializeNewRound(1, allTiles);
		
		setGameState(prev => {
			const relictManager = new RelictManager(prev.ownedRelicts);
			
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
			
			// Process round end effects through relict manager
			const { board: boardAfterEffects, vanishedTiles } = currentRelictManager.processRoundEnd(prev.board, prev.round);
			
			// Collect all tiles for new round (including vanished tiles)
			const allTiles = [
				...prev.deck,
				...prev.playerHand,
				...prev.discardPile,
				...boardAfterEffects.flat().filter(tile => tile !== null) as Tile[],
				...vanishedTiles
			];
			
			const newRoundState = initializeNewRound(prev.round + 1, allTiles);
			
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
				return {
					...prev,
					...newRoundState,
					round: prev.round + 1
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

	// Place a tile on the board with enhanced animations
	const placeTile = useCallback(async (tile: Tile, position: BoardPosition) => {
		const isFirstTile = gameState.board.every(row => row.every(cell => cell === null));
		const isFirstTileThisRound = gameState.board.every(row => row.every(cell => cell === null));
		
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
			
			// Check for Color Variety relict (4 different colors in hand)
			const colorsInHand = new Set(prev.playerHand.map(tile => tile.color));
			const hasColorVariety = colorsInHand.size >= 4;
			
			// Process tile placement through relict manager
			const { tile: initialProcessedTile, canPlace, board: newBoard, effects } = relictManager.processTilePlacement(
				tile, 
				position, 
				prev.board, 
				isFirstTile, 
				isFirstTileThisRound
			);
			
			if (!canPlace) {
				return prev; // Placement was prevented by a relict
			}

			// Count doubling effects for cumulative scoring
			let doublingCount = 0;
			let scoringCount = 1; // Start with 1 (normal scoring)
			let ghostPositions: BoardPosition[] = [];
			let processedTile = { ...initialProcessedTile }; // Make mutable for tile stacking

			// Add Color Variety doubling effect if applicable (only if player owns the relict)
			const hasColorVarietyRelict = prev.ownedRelicts.some(relict => relict.id === 'color-variety-double');
			if (hasColorVarietyRelict && hasColorVariety) {
				doublingCount++;
				addAnimation('doubling', position, 800);
				triggerRelictAnimation('color-variety-double', 800);
			}

			// Process effects and add animations
			if (effects) {
				effects.forEach(effect => {
					switch (effect.type) {
						case 'doubling':
							addAnimation('doubling', position, 800);
							if (effect.relictId) triggerRelictAnimation(effect.relictId, 800);
							doublingCount++;
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
						case 'tile-stack':
							addAnimation('tile-stack', position, 800);
							if (effect.relictId) triggerRelictAnimation(effect.relictId, 800);
							// Handle tile stacking: add the number of the tile below and remove it
							const targetTile = newBoard[position.row][position.col];
							if (targetTile) {
								processedTile = {
									...processedTile,
									number: processedTile.number + targetTile.number
								};
								// Remove the tile below (it will be replaced by the new tile)
								newBoard[position.row][position.col] = null;
							}
							break;
						case 'multiplying':
							addAnimation('multiplying', position, 800, undefined, undefined, effect.multiplier);
							if (effect.relictId) triggerRelictAnimation(effect.relictId, 800);
							// Multiply the round score for multiplying effects
							if (effect.multiplier) {
								newScore = newScore * effect.multiplier;
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
			const scoreValue = relictManager.calculateTileScore(processedTile, position, newBoard);
			const totalScoreValue = scoreValue * Math.pow(2, doublingCount) * scoringCount;
			
			// Show scoring animation for each scoring event
			for (let i = 0; i < scoringCount; i++) {
				const delay = i * 200; // Stagger the scoring animations
				setTimeout(() => {
					addAnimation('score-popup', position, 1000, undefined, scoreValue * Math.pow(2, doublingCount));
				}, delay);
			}
			
			let newHand = prev.playerHand.filter(handTile => handTile.id !== tile.id);
			let newDeck = prev.deck;
			
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
			newHand = [...newHand, ...processedDrawnCards];
			
			return {
				...prev,
				board: boardAfterIncrement,
				playerHand: newHand,
				deck: newDeck,
				score: newScore
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
		
		// Check win condition after turn is complete
		setGameState(prev => {
			if (prev.score >= prev.targetScore) {
				return { ...prev, gamePhase: 'won' };
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
			
			// Process discard tiles through relict effects
			const processedTiles = relictManager.processDiscardTiles(tilesToDiscard);
			
			const newHand = prev.playerHand.filter(tile => 
				!tilesToDiscard.some(discardTile => discardTile.id === tile.id)
			);
			
			const newDiscardPile = [...prev.discardPile, ...processedTiles];
			
			// Draw new cards from deck
			const cardsToDraw = Math.min(tilesToDiscard.length, prev.deck.length);
			const drawnCards = prev.deck.slice(0, cardsToDraw);
			const newDeck = prev.deck.slice(cardsToDraw);
			
			// Process drawn cards through relict effects
			const processedDrawnCards = drawnCards.map(tile => relictManager.processDrawTile(tile));
			
			return {
				...prev,
				playerHand: [...newHand, ...processedDrawnCards],
				discardPile: newDiscardPile,
				deck: newDeck,
				discards: prev.discards - 1
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

		if (!canPlayCards && !hasDiscards && !hasCardsInDeck) {
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
		setGameState(prev => ({
			...prev,
			ownedRelicts: [...prev.ownedRelicts, relict],
			availableRelicts: prev.availableRelicts.filter(r => r.id !== relict.id),
			relictSelectionOptions: [],
			gamePhase: 'playing'
		}));
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
			selectRelict
		}
	};
}
