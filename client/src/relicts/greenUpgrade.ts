import { Relict, RelictBehavior } from '../types/relicts';
import { Tile } from '../types/game';

export const greenUpgradeBehavior: RelictBehavior = {
  onDrawTile: (tile: Tile) => {
    // Check if the drawn tile is green
    	if (tile.matchesColor('green')) {
      // Return the same tile but mark it for green upgrade effect
      return {
        ...tile,
        // We'll handle the actual board upgrade logic in the game state
        // This just marks that the relict should trigger
      };
    }
    return tile;
  },
};

export const greenUpgradeRelict: Relict = {
  id: 'green-upgrade',
  name: 'Green Growth',
  icon: '🌿',
  description: 'When you **draw a green tile**, **upgrade all green tiles** on the board',
  behavior: greenUpgradeBehavior,
};
