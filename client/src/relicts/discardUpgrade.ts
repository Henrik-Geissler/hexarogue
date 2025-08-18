import { Relict, RelictBehavior } from '../types/relicts';
import { Tile } from '../types/game';
import { upgradeTile } from '../utils/gameLogic';

export const discardUpgradeBehavior: RelictBehavior = {
  onDiscardTiles: (tiles: Tile[]) => {
    // Check if all discarded tiles have the same color
    if (tiles.length > 0) {
      const firstColor = tiles[0].color;
      const allSameColor = tiles.every(tile => tile.color === firstColor);
      
      if (allSameColor) {
        // Upgrade all tiles using centralized upgrade function
        return tiles.map(tile => upgradeTile(tile));
      }
    }
    
    return tiles; // Return unchanged if not all same color
  },
};

export const discardUpgradeRelict: Relict = {
  id: 'discard-upgrade',
  name: 'Color Harmony',
  icon: '🎨',
  description: 'When **discarding** tiles of the **same color**, **upgrade** them all',
  behavior: discardUpgradeBehavior,
};
