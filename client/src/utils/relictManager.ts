import { 
  Relict, 
  TilePlacementContext, 
  ScoringContext, 
  RoundEndContext,
  RelictEffect,
  TilePlacementResult
} from '../types/relicts';
import type { Tile, BoardPosition } from '../types/game';
import { upgradeTile as upgradeTileNumber } from './gameLogic';

// Utility functions for relict behaviors
export function isOnEdge(position: BoardPosition, board: (Tile | null)[][]): boolean {
  const { row, col } = position;
  
  const isEvenRow = row % 2 === 0;
  const neighborOffsets = isEvenRow 
    ? [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]]
    : [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]];
  
  for (const [rowOffset, colOffset] of neighborOffsets) {
    const neighborRow = row + rowOffset;
    const neighborCol = col + colOffset;
    
    if (neighborRow < 0 || neighborRow >= board.length ||
        neighborCol < 0 || neighborCol >= board[neighborRow]?.length) {
      return true;
    }
  }
  
  return false;
}

export function getRandomColor(): 'red' | 'green' | 'blue' | 'yellow' {
  const colors: ('red' | 'green' | 'blue' | 'yellow')[] = ['red', 'green', 'blue', 'yellow'];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function countBlueNeighbors(position: BoardPosition, board: (Tile | null)[][]): number {
  const { row, col } = position;
  const isEvenRow = row % 2 === 0;
  const neighborOffsets = isEvenRow 
    ? [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]]
    : [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]];
  
  let blueCount = 0;
  for (const [rowOffset, colOffset] of neighborOffsets) {
    const neighborRow = row + rowOffset;
    const neighborCol = col + colOffset;
    
    if (neighborRow >= 0 && neighborRow < board.length &&
        neighborCol >= 0 && neighborCol < board[neighborRow]?.length) {
      const neighbor = board[neighborRow][neighborCol];
      		if (neighbor && neighbor.matchesColor('blue')) {
        blueCount++;
      }
    }
  }
  
  return blueCount;
}

export function countEmptyNeighbors(position: BoardPosition, board: (Tile | null)[][]): number {
  const { row, col } = position;
  const isEvenRow = row % 2 === 0;
  const neighborOffsets = isEvenRow 
    ? [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]]
    : [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]];
  
  let emptyCount = 0;
  for (const [rowOffset, colOffset] of neighborOffsets) {
    const neighborRow = row + rowOffset;
    const neighborCol = col + colOffset;
    
    if (neighborRow >= 0 && neighborRow < board.length &&
        neighborCol >= 0 && neighborCol < board[neighborRow]?.length) {
      const neighbor = board[neighborRow][neighborCol];
      if (!neighbor) {
        emptyCount++;
      }
    }
  }
  
  return emptyCount;
}

export function getEmptyNeighborPositions(position: BoardPosition, board: (Tile | null)[][]): BoardPosition[] {
  const { row, col } = position;
  const emptyPositions: BoardPosition[] = [];
  
  // Define the 6 hexagonal directions (flat-top orientation)
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],  // Top row
    [0, -1], [0, 1],              // Middle row
    [1, -1], [1, 0], [1, 1]       // Bottom row
  ];
  
  directions.forEach(([dRow, dCol]) => {
    const newRow = row + dRow;
    const newCol = col + dCol;
    
    if (newRow >= 0 && newRow < board.length && 
        newCol >= 0 && newCol < board[0].length) {
      const tile = board[newRow][newCol];
      // Only consider positions that are null (not occupied by tiles or blocks)
      if (tile === null) {
        emptyPositions.push({ row: newRow, col: newCol });
      }
    }
  });
  
  return emptyPositions;
}

// Relict Manager - handles calling all relict behaviors in order
export class RelictManager {
  private ownedRelicts: Relict[];
  private borderCopyTriggeredThisRound: boolean = false;

  constructor(ownedRelicts: Relict[]) {
    this.ownedRelicts = ownedRelicts;
  }

  // Reset border copy flag at the start of each round
  resetBorderCopyFlag() {
    this.borderCopyTriggeredThisRound = false;
  }

  processTilePlacement(
    tile: Tile,
    position: BoardPosition,
    board: (Tile | null)[][],
    playerHand: Tile[],
    isFirstTile: boolean,
    isFirstTileThisRound: boolean
  ): TilePlacementResult {
    let processedTile = { ...tile };
    let canPlace = true;
    let effects: RelictEffect[] = [];
    let copiedTiles: Tile[] = [];

    // Process before placement effects
    for (const relict of this.ownedRelicts) {
      if (relict.behavior.onBeforeTilePlacement) {
        const result = relict.behavior.onBeforeTilePlacement({
          tile: processedTile,
          position,
          board,
          isFirstTile,
          isFirstTileThisRound,
          playerHand
        });

        if (result.effects) {
          effects.push(...result.effects);
        }

        if (!result.canPlace) {
          canPlace = false;
        }

        processedTile = result.tile;
      }
    }

    // Place the tile on the board
    const newBoard = board.map(row => [...row]);
    newBoard[position.row][position.col] = processedTile;

    // Process after placement effects
    for (const relict of this.ownedRelicts) {
      if (relict.behavior.onAfterTilePlacement) {
        const result = relict.behavior.onAfterTilePlacement({
          tile: processedTile,
          position,
          board: newBoard,
          isFirstTile,
          isFirstTileThisRound,
          playerHand
        });

        // Handle border copy relict specifically
        if (relict.id === 'border-copy' && typeof result === 'object' && 'copiedTiles' in result && result.copiedTiles && result.copiedTiles.length > 0 && !this.borderCopyTriggeredThisRound) {
          copiedTiles.push(...result.copiedTiles);
          this.borderCopyTriggeredThisRound = true;
        }

        // Update board if relict modified it
        if (typeof result === 'object' && 'board' in result) {
          // Result is an object with board property
          Object.assign(newBoard, result.board);
        } else {
          // Result is just a board array
          Object.assign(newBoard, result);
        }
      }
    }

    return {
      tile: processedTile,
      canPlace,
      board: newBoard,
      effects,
      copiedTiles
    };
  }

  // Calculate score for a tile through all relicts
  calculateTileScore(tile: Tile, position: BoardPosition, board: (Tile | null)[][]): number {
    let score = tile.number;

    const scoringContext: ScoringContext = {
      tile,
      baseScore: score,
      position,
      board
    };

    // Call onTileScores for all relicts in order
    for (const relict of this.ownedRelicts) {
      if (relict.behavior.onTileScores) {
        score = relict.behavior.onTileScores(scoringContext);
        // Update context for next relict
        scoringContext.baseScore = score;
      }
    }

    return score;
  }

  // Calculate board score
  calculateBoardScore(board: (Tile | null)[][]): number {
    let total = 0;
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const tile = board[row][col];
        if (tile) {
          total += this.calculateTileScore(tile, { row, col }, board);
        }
      }
    }
    return total;
  }

  // Check if a tile can be placed
  canPlaceTile(tile: Tile, position: BoardPosition, board: (Tile | null)[][], isFirstTile: boolean): boolean {
    // Call onCanPlaceTile for all relicts in order
    for (const relict of this.ownedRelicts) {
      if (relict.behavior.onCanPlaceTile) {
        const canPlace = relict.behavior.onCanPlaceTile(tile, position, board, isFirstTile);
        if (canPlace) {
          return true; // If any relict allows placement, it's allowed
        }
      }
    }
    
    // If no relict specifically allows it, do not allow here (fallback decided by caller)
    return false;
  }

  // Get retrigger count
  getRetriggerCount(position: BoardPosition, board: (Tile | null)[][]): number {
    let retriggerCount = 1; // Default to 1 (original placement)

    // Call onGetRetriggerCount for all relicts in order
    for (const relict of this.ownedRelicts) {
      if (relict.behavior.onGetRetriggerCount) {
        const count = relict.behavior.onGetRetriggerCount(position, board);
        retriggerCount = Math.max(retriggerCount, count); // Take the highest count
      }
    }

    return retriggerCount;
  }

  // Process round end effects
  processRoundEnd(board: (Tile | null)[][], round: number): { board: (Tile | null)[][]; vanishedTiles: Tile[] } {
    let currentBoard = board.map(row => [...row]);
    let vanishedTiles: Tile[] = [];

    const roundEndContext: RoundEndContext = {
      board: currentBoard,
      round
    };

    // Call onRoundEnd for all relicts in order
    for (const relict of this.ownedRelicts) {
      if (relict.behavior.onRoundEnd) {
        const result = relict.behavior.onRoundEnd(roundEndContext);
        currentBoard = result.board;
        if (result.vanishedTiles) {
          vanishedTiles.push(...result.vanishedTiles);
        }
        
        // Update context for next relict
        roundEndContext.board = currentBoard;
      }
    }

    return { board: currentBoard, vanishedTiles };
  }

  // Process discard tiles through relict effects
  processDiscardTiles(tiles: Tile[], context?: { board: (Tile | null)[][], handSize: number }): { processedTiles: Tile[]; ghostCopies: Tile[]; reduceDrawCount: number } {
    let processedTiles = [...tiles];
    let ghostCopies: Tile[] = [];
    let reduceDrawCount = 0;
    
    for (const relict of this.ownedRelicts) {
      if (relict.behavior.onDiscardTiles) {
        const result = relict.behavior.onDiscardTiles(processedTiles, context);
        
        if (typeof result === 'object' && 'processedTiles' in result) {
          // New return type with ghost copies
          processedTiles = result.processedTiles;
          ghostCopies = [...ghostCopies, ...result.ghostCopies];
          reduceDrawCount += result.reduceDrawCount;
        } else {
          // Old return type (just processed tiles)
          processedTiles = result;
        }
      }
    }
    
    return { processedTiles, ghostCopies, reduceDrawCount };
  }

  // Process target score reached
  processTargetScoreReached(tile: Tile, position: BoardPosition): Tile[] {
    const copiedTiles: Tile[] = [];
    
    for (const relict of this.ownedRelicts) {
      if (relict.behavior.onTargetScoreReached) {
        const copiedTile = relict.behavior.onTargetScoreReached(tile, position);
        copiedTiles.push(copiedTile);
      }
    }
    
    return copiedTiles;
  }

  // Process drawn tile
  processDrawTile(tile: Tile): Tile {
    let processedTile = { ...tile };
    
    for (const relict of this.ownedRelicts) {
      if (relict.behavior.onDrawTile) {
        processedTile = relict.behavior.onDrawTile(processedTile);
      }
    }
    
    return processedTile;
  }

  // Process board increment
  processBoardIncrement(board: (Tile | null)[][]): (Tile | null)[][] {
    let processedBoard = board.map(row => [...row]);

    for (const relict of this.ownedRelicts) {
      if (relict.behavior.onBoardIncrement) {
        processedBoard = relict.behavior.onBoardIncrement(processedBoard);
      }
    }

    return processedBoard;
  }

  // Process after draw tile (for auto-discard)
  processAfterDrawTile(hand: Tile[], board: (Tile | null)[][]): Tile[] {
    let processedHand = [...hand];

    for (const relict of this.ownedRelicts) {
      if (relict.behavior.onAfterDrawTile) {
        processedHand = relict.behavior.onAfterDrawTile(processedHand, board);
      }
    }

    return processedHand;
  }

  // Process after place tile (for auto-discard)
  processAfterPlaceTile(hand: Tile[], board: (Tile | null)[][]): Tile[] {
    let processedHand = [...hand];

    for (const relict of this.ownedRelicts) {
      if (relict.behavior.onAfterPlaceTile) {
        processedHand = relict.behavior.onAfterPlaceTile(processedHand, board);
      }
    }

    return processedHand;
  }

  // Process every other turn (for upgrade field spawn)
  processEveryOtherTurn(board: (Tile | null)[][]): (Tile | null)[][] {
    let processedBoard = board.map(row => [...row]);

    for (const relict of this.ownedRelicts) {
      if (relict.behavior.onEveryOtherTurn) {
        processedBoard = relict.behavior.onEveryOtherTurn(processedBoard);
      }
    }

    return processedBoard;
  }

  // Process area formation
  processAreaFormed(placedTile: Tile, area: Tile[], areaRule: 'color' | 'digit' | 'same-color', board: (Tile | null)[][]): (Tile | null)[][] {
    let processedBoard = board.map(row => [...row]);

    for (const relict of this.ownedRelicts) {
      if (relict.behavior.onAreaFormed) {
        const context = { placedTile, area, areaRule, board: processedBoard };
        processedBoard = relict.behavior.onAreaFormed(context);
      }
    }

    return processedBoard;
  }

  // Process tile number changes
  processTileNumberChanged(tile: Tile): Tile {
    let processedTile = { ...tile };

    for (const relict of this.ownedRelicts) {
      if (relict.behavior.onTileNumberChanged) {
        processedTile = relict.behavior.onTileNumberChanged(processedTile);
      }
    }

    return processedTile;
  }

  // Process sell relict effects
  processSellRelict(hand: Tile[]): Tile[] {
    let processedHand = [...hand];

    for (const relict of this.ownedRelicts) {
      if (relict.behavior.onSellRelict) {
        processedHand = relict.behavior.onSellRelict(processedHand);
      }
    }

    return processedHand;
  }

  // Process tile color changes
  processTileColorChanged(tile: Tile, oldColor: string, newColor: string): { upgradedTile: Tile; shouldUpgrade: boolean; relictId?: string } {
    let processedTile = { ...tile };
    let shouldUpgrade = false;
    let upgradeRelictId: string | undefined;

    // Only upgrade if the color actually changed and is different
    if (oldColor !== newColor) {
      for (const relict of this.ownedRelicts) {
        if (relict.behavior.onTileColorChanged) {
          const result = relict.behavior.onTileColorChanged(processedTile, oldColor as any, newColor as any);
          // If the relict returns the same tile, it wants to upgrade
          if (result === processedTile) {
            shouldUpgrade = true;
            upgradeRelictId = relict.id;
          } else {
            processedTile = result;
          }
        }
      }
    }

    return { upgradedTile: processedTile, shouldUpgrade, relictId: upgradeRelictId };
  }

  // Centralized upgrade method that handles upgrade logic and returns upgrade effect
  upgradeTile(tile: Tile, relictId?: string): { upgradedTile: Tile; effect: RelictEffect } {
    const upgradedTile = upgradeTileNumber(tile);
    return {
      upgradedTile,
      effect: {
        type: 'upgrading',
        relictId
      }
    };
  }
}
