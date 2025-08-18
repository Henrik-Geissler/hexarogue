import { Relict, RelictBehavior, AreaContext } from '../types/relicts';
import { Tile, BoardPosition } from '../types/game';
import { findArea } from '../utils/gameLogic';

export const areaColorChangeBehavior: RelictBehavior = {
  onAreaFormed: (context: AreaContext) => {
    const { placedTile, area, board } = context;
    
    // Check if area has at least one tile with same digit as placed tile
    const hasSameDigit = area.some(tile => {
      const placedDigits = placedTile.number.toString().split('');
      const tileDigits = tile.number.toString().split('');
      return placedDigits.some(digit => tileDigits.includes(digit));
    });
    
    if (!hasSameDigit) {
      return board; // No effect if no same digit found
    }
    
    // Create new board with color changes
    const newBoard = board.map(row => [...row]);
    
    // Change color of all tiles in area to placed tile's color
    area.forEach(tile => {
      // Find the tile's position on the board
      for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
          if (board[row][col]?.id === tile.id) {
            const newTile = {
              ...tile,
              color: placedTile.color
            };
            newBoard[row][col] = newTile;
            break;
          }
        }
      }
    });
    
    return newBoard;
  },
};

export const areaColorChangeRelict: Relict = {
  id: 'area-color-change',
  name: 'Color Cascade',
  icon: '🎨',
  description: 'When a tile is placed in an **area with shared digits**, all tiles in that area change to the **placed tile\'s color**',
  behavior: areaColorChangeBehavior,
};
