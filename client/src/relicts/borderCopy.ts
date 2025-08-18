import { Relict, RelictBehavior, TilePlacementContext, TilePlacementResult, RelictEffectType, RelictEffect } from '../types/relicts';
import type { Tile, BoardPosition } from '../types/game';

export const borderCopyBehavior: RelictBehavior = {
  onAfterTilePlacement: (context: TilePlacementContext) => {
    const { tile, position, board } = context;
    
    // Check if this tile is next to the border (including blocks)
    const isNextToBorder = isPositionNextToBorder(position, board);
    
    if (isNextToBorder) {
      // Get all tiles on the board (excluding blocks and upgrade fields)
      const allTiles = board.flat().filter((t): t is Tile => t !== null && !t.isBlock && !t.isUpgradeField);
      
      // Create copies of all tiles and add them to the deck
      const copiedTiles: Tile[] = allTiles.map(tile => ({
        ...tile,
        id: `copy-${tile.id}-${Date.now()}-${Math.random()}`
      }));
      
      // Return the copied tiles to be added to the deck
      return {
        board,
        copiedTiles
      };
    }
    
    return { board, copiedTiles: [] };
  },
};

// Helper function to check if a position is next to the border
function isPositionNextToBorder(position: { row: number; col: number }, board: (Tile | null)[][]): boolean {
  const { row, col } = position;
  
  // Check if position is at the edge of the board
  if (row === 0 || row === board.length - 1 || 
      col === 0 || col === board[row].length - 1) {
    return true;
  }
  
  // Check if position is next to a block (blocks count as border)
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];
  
  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;
    
    if (newRow >= 0 && newRow < board.length && 
        newCol >= 0 && newCol < board[newRow].length) {
      const neighbor = board[newRow][newCol];
      if (neighbor && neighbor.isBlock) {
        return true;
      }
    }
  }
  
  return false;
}

export const borderCopyRelict: Relict = {
  id: 'border-copy',
  name: 'Border Copy',
  icon: '🔄',
  description: 'When for the **first time in a round** a Tile is next to the **border** (Blocks count as Border and edge, otherwise the outside of the board) create a **copy of each tile** on the board and **permanently add them** to your deck',
  behavior: borderCopyBehavior,
};
