import type { Relict } from '../types/relicts';
import type { Tile, TileColor } from '../types/game';

export const colorChangeUpgradeRelict: Relict = {
  id: 'color-change-upgrade',
  name: 'Color Change Upgrade',
  description: 'Whenever a tile changes its color, upgrade it.',
  icon: '🎨⬆️',
  behavior: {
    onTileColorChanged: (tile: Tile, oldColor: TileColor, newColor: TileColor): Tile => {
        return {
          ...tile,
          number: tile.number + 1
        }; 
    }
  }
};
