import { Relict, RelictBehavior } from '../types/relicts';
import { Tile, BoardPosition } from '../types/game';
import { canPlaceTile } from '../utils/gameLogic';

export const autoDiscardBehavior: RelictBehavior = {
  onAfterDrawTile: (hand: Tile[], board: (Tile | null)[][]) => {
    return filterUnplayableTiles(hand, board);
  },
  
  onAfterPlaceTile: (hand: Tile[], board: (Tile | null)[][]) => {
    return filterUnplayableTiles(hand, board);
  },
};

// Helper function to filter out unplayable tiles
function filterUnplayableTiles(hand: Tile[], board: (Tile | null)[][]): Tile[] {
  const isFirstTile = board.every(row => row.every(cell => cell === null));
  
  return hand.filter(tile => {
    // Check if this tile can be placed anywhere on the board
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const position: BoardPosition = { row, col };
        if (canPlaceTile(tile, position, board, isFirstTile)) {
          return true; // Tile can be placed, keep it
        }
      }
    }
    return false; // Tile cannot be placed anywhere, remove it
  });
}

export const autoDiscardRelict: Relict = {
  id: 'auto-discard',
  name: 'Clean Sweep',
  icon: '🧹',
  description: '**Automatically discard** all tiles that **cannot be placed** anywhere',
  behavior: autoDiscardBehavior,
};
