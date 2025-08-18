import { 
  Relict, 
  TilePlacementContext, 
  ScoringContext, 
  RoundEndContext,
  RelictEffect
} from '../types/relicts';
import type { Tile, BoardPosition } from '../types/game';

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
      if (neighbor && neighbor.color === 'blue') {
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
  const isEvenRow = row % 2 === 0;
  const neighborOffsets = isEvenRow 
    ? [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]]
    : [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]];
  
  const emptyPositions: BoardPosition[] = [];
  for (const [rowOffset, colOffset] of neighborOffsets) {
    const neighborRow = row + rowOffset;
    const neighborCol = col + colOffset;
    
    if (neighborRow >= 0 && neighborRow < board.length &&
        neighborCol >= 0 && neighborCol < board[neighborRow]?.length) {
      const neighbor = board[neighborRow][neighborCol];
      if (!neighbor) {
        emptyPositions.push({ row: neighborRow, col: neighborCol });
      }
    }
  }
  
  return emptyPositions;
}

export function upgradeTile(number: number): number {
  const str = number.toString();
  const firstDigit = parseInt(str[0]);
  const upgraded = (firstDigit + 1).toString() + str.slice(1);
  return parseInt(upgraded);
}

// Relict Manager - handles calling all relict behaviors in order
export class RelictManager {
  constructor(private ownedRelicts: Relict[]) {}

  // Process tile placement through all relicts
  processTilePlacement(
    tile: Tile, 
    position: BoardPosition, 
    board: (Tile | null)[][], 
    isFirstTile: boolean, 
    isFirstTileThisRound: boolean
  ): { tile: Tile; canPlace: boolean; board: (Tile | null)[][]; effects?: RelictEffect[] } {
    let currentTile = { ...tile };
    let canPlace = true;
    let currentBoard = board.map(row => [...row]);
    let effects: RelictEffect[] = [];

    // Create placement context
    const placementContext: TilePlacementContext = {
      tile: currentTile,
      position,
      board: currentBoard,
      isFirstTile,
      isFirstTileThisRound
    };

    // Call onBeforeTilePlacement for all relicts in order
    for (const relict of this.ownedRelicts) {
      if (relict.behavior.onBeforeTilePlacement) {
        const result = relict.behavior.onBeforeTilePlacement(placementContext);
        currentTile = result.tile;
        canPlace = canPlace && result.canPlace;
        
        // Collect effects
        if (result.effects) {
          effects.push(...result.effects.map(effect => ({
            ...effect,
            relictId: effect.relictId || relict.id
          })));
        }
        
        // Update context for next relict
        placementContext.tile = currentTile;
      }
    }

    // If placement is allowed, place the tile and call onAfterTilePlacement
    if (canPlace) {
      currentBoard[position.row][position.col] = currentTile;
      
      // Call onAfterTilePlacement for all relicts in order
      for (const relict of this.ownedRelicts) {
        if (relict.behavior.onAfterTilePlacement) {
          const afterContext = { ...placementContext, board: currentBoard };
          currentBoard = relict.behavior.onAfterTilePlacement(afterContext);
        }
      }
    }

    return { tile: currentTile, canPlace, board: currentBoard, effects: effects.length > 0 ? effects : undefined };
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
  processDiscardTiles(tiles: Tile[]): Tile[] {
    let processedTiles = [...tiles];
    
    for (const relict of this.ownedRelicts) {
      if (relict.behavior.onDiscardTiles) {
        processedTiles = relict.behavior.onDiscardTiles(processedTiles);
      }
    }
    
    return processedTiles;
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
}
