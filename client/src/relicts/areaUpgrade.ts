import { Relict, RelictBehavior, AreaContext } from '../types/relicts';
import { Tile } from '../types/game';
import { upgradeTile } from '../utils/gameLogic';

export const areaUpgradeBehavior: RelictBehavior = {
  onAreaFormed: (context: AreaContext) => {
    const { placedTile, area, board } = context;
    
    // Check if area is of the same color as the placed tile
    const isSameColorArea = area.every(tile => tile.color === placedTile.color);
    
    if (!isSameColorArea) {
      return board; // No effect if not same color area
    }
    
    // Create new board with upgrades
    const newBoard = board.map(row => [...row]);
    
    // Upgrade all tiles in the area
    area.forEach(tile => {
      // Find the tile's position on the board
      for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
          if (board[row][col]?.id === tile.id) {
            const newTile = upgradeTile(tile);
            newBoard[row][col] = newTile;
            break;
          }
        }
      }
    });
    
    return newBoard;
  },
};

export const areaUpgradeRelict: Relict = {
  id: 'area-upgrade',
  name: 'Area Growth',
  icon: '📈',
  description: 'When a tile is placed in an **area of the same color**, **upgrade all tiles** in that area',
  behavior: areaUpgradeBehavior,
};
