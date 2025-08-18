import { useState, useCallback, useEffect } from 'react';
import { GameState, Tile, BoardPosition } from '../types/game';
import {
  createInitialDeck,
  canPlaceTile,
  hasPlayableCards,
  calculateBoardScore,
  initializeNewRound,
  createEmptyBoard
} from '../utils/gameLogic';
import { 
  createInitialRelictPool, 
  getRelictSelection, 
  applyFirstTileDouble,
  applyGreenToRedUpgrade,
  applyBoardUpgrade,
  applyIdenticalTilesUpgrade
} from '../utils/relictLogic';

export function useGameState() {
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
    relictSelectionOptions: []
  }));

  // Start a new game
  const startNewGame = useCallback(() => {
    const allTiles = createInitialDeck();
    const newRoundState = initializeNewRound(1, allTiles);
    
    setGameState(prev => ({
      ...prev,
      ...newRoundState,
      round: 1,
      gamePhase: 'playing'
    }));
  }, []);

  // Start a new round with end-of-round relict effects
  const startNewRound = useCallback(() => {
    setGameState(prev => {
      // Apply end-of-round relict effects to board
      let boardWithEffects = [...prev.board];
      
      // Apply board upgrade relict
      boardWithEffects = applyBoardUpgrade(boardWithEffects, prev.ownedRelicts);
      
      // Apply identical tiles upgrade relict
      boardWithEffects = applyIdenticalTilesUpgrade(boardWithEffects, prev.ownedRelicts);
      
      // Collect all tiles for new round
      const allTiles = [
        ...prev.deck,
        ...prev.playerHand,
        ...prev.discardPile,
        ...boardWithEffects.flat().filter(tile => tile !== null) as Tile[]
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

  // Place a tile on the board with relict effects
  const placeTile = useCallback((tile: Tile, position: BoardPosition) => {
    const isFirstTile = gameState.board.every(row => row.every(cell => cell === null));
    const isFirstTileThisRound = gameState.board.every(row => row.every(cell => cell === null));
    
    if (!canPlaceTile(tile, position, gameState.board, isFirstTile)) {
      return false;
    }

    setGameState(prev => {
      let placedTile = { ...tile };
      
      // Apply first tile double effect (only for first tile of the round)
      placedTile = applyFirstTileDouble(placedTile, prev.ownedRelicts, isFirstTileThisRound);
      
      // Apply green to red upgrade effect
      placedTile = applyGreenToRedUpgrade(placedTile, prev.ownedRelicts);
      
      const newBoard = prev.board.map(row => [...row]);
      newBoard[position.row][position.col] = placedTile;
      
      let newHand = prev.playerHand.filter(handTile => handTile.id !== tile.id);
      let newDeck = prev.deck;
      
      // Calculate new score after placement
      const newScore = calculateBoardScore(newBoard, prev.ownedRelicts);
      
      // Draw 1 card after each placement
      const cardsToDraw = Math.min(1, newDeck.length);
      const drawnCards = newDeck.slice(0, cardsToDraw);
      newDeck = newDeck.slice(cardsToDraw);
      newHand = [...newHand, ...drawnCards];
      
      return {
        ...prev,
        board: newBoard,
        playerHand: newHand,
        deck: newDeck,
        score: newScore,
        draggedTile: null
      };
    });
    
    return true;
  }, [gameState.board, gameState.playerHand, gameState.ownedRelicts]);

  // Discard selected tiles
  const discardTiles = useCallback((tilesToDiscard: Tile[]) => {
    if (gameState.discards <= 0 || tilesToDiscard.length === 0) {
      return false;
    }

    setGameState(prev => {
      const newHand = prev.playerHand.filter(tile => 
        !tilesToDiscard.some(discardTile => discardTile.id === tile.id)
      );
      
      const newDiscardPile = [...prev.discardPile, ...tilesToDiscard];
      
      // Draw new cards from deck
      const cardsToDraw = Math.min(tilesToDiscard.length, prev.deck.length);
      const drawnCards = prev.deck.slice(0, cardsToDraw);
      const newDeck = prev.deck.slice(cardsToDraw);
      
      return {
        ...prev,
        playerHand: [...newHand, ...drawnCards],
        discardPile: newDiscardPile,
        deck: newDeck,
        discards: prev.discards - 1
      };
    });
    
    return true;
  }, [gameState.discards, gameState.playerHand, gameState.deck]);

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

    // Check win condition
    if (gameState.score >= gameState.targetScore) {
      setGameState(prev => ({ ...prev, gamePhase: 'won' }));
      return;
    }

    // Check lose conditions - only lose if no playable cards and no discards/deck
    const hasDiscards = gameState.discards > 0;
    const hasCardsInDeck = gameState.deck.length > 0;
    const canPlayCards = hasPlayableCards(gameState.playerHand, gameState.board);

    if (!canPlayCards && !hasDiscards && !hasCardsInDeck) {
      setGameState(prev => ({ ...prev, gamePhase: 'lost' }));
    }
  }, [gameState.score, gameState.targetScore, gameState.discards, 
      gameState.deck.length, gameState.playerHand, gameState.board, gameState.gamePhase]);

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
    gameState,
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
