import { Relict, RelictBehavior, TilePlacementContext, TilePlacementResult, RelictEffectType, RelictEffect } from '../types/relicts';
import type { Tile, BoardPosition } from '../types/game';

export const blueMirrorBehavior: RelictBehavior = {
  onAfterTilePlacement: (context: TilePlacementContext) => {
    const { tile, position, board } = context;
    
    // Only trigger for non-blue tiles
    if (tile.color === 'blue') {
      return { board, copiedTiles: [] };
    }
    
    // Find blue neighbors
    const blueNeighbors = findBlueNeighbors(position, board);
    const ghostCopies: Tile[] = [];
    
    // For each blue neighbor, check if the opposite position is free
    for (const blueNeighborPos of blueNeighbors) {
      const oppositePos = getOppositePosition(position, blueNeighborPos);
      
      // Check if opposite position is within bounds and free
      if (isValidPosition(oppositePos, board) && board[oppositePos.row][oppositePos.col] === null) {
        // Create ghost copy of the placed tile
        const ghostCopy: Tile = {
          ...tile,
          id: `ghost-mirror-${tile.id}-${Date.now()}-${Math.random()}`,
          isGhost: true
        };
        
        ghostCopies.push(ghostCopy);
      }
    }
    
    return { board, copiedTiles: ghostCopies };
  },
};

// Helper function to find blue neighbors
function findBlueNeighbors(position: BoardPosition, board: (Tile | null)[][]): BoardPosition[] {
  const { row, col } = position;
  const blueNeighbors: BoardPosition[] = [];
  
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
        newCol >= 0 && newCol < board[newRow].length) {
      const tile = board[newRow][newCol];
      if (tile && tile.color === 'blue' && !tile.isBlock && !tile.isUpgradeField) {
        blueNeighbors.push({ row: newRow, col: newCol });
      }
    }
  });
  
  return blueNeighbors;
}

// Helper function to get the opposite position
function getOppositePosition(placedPos: BoardPosition, bluePos: BoardPosition): BoardPosition {
  const rowDiff = bluePos.row - placedPos.row;
  const colDiff = bluePos.col - placedPos.col;
  
  return {
    row: bluePos.row + rowDiff,
    col: bluePos.col + colDiff
  };
}

// Helper function to check if position is valid
function isValidPosition(position: BoardPosition, board: (Tile | null)[][]): boolean {
  return position.row >= 0 && position.row < board.length &&
         position.col >= 0 && position.col < board[position.row].length;
}

export const blueMirrorRelict: Relict = {
  id: 'blue-mirror',
  name: 'Blue Mirror',
  icon: '🪞',
  description: '**Blue Tiles** act like a **Mirror** for other Colors: If you place a **not blue Tile** next to a **Blue Tile** and the **Spot on the opposite Side** of the Blue Tile is free, place a **ghost copy** of the not blue Tile there.',
  behavior: blueMirrorBehavior,
};
