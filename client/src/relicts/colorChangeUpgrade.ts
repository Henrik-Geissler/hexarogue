import type { Relict } from '../types/relicts';
import type { Tile, TileColor } from '../types/game';

export const colorChangeUpgradeRelict: Relict = {
  id: 'color-change-upgrade',
  name: 'Color Change Upgrade',
  description: 'Whenever a tile changes its color, upgrade it.',
  icon: '🎨⬆️',
  behavior: {
    onTileColorChanged: (tile: Tile, oldColor: TileColor, newColor: TileColor): Tile => {
      // Return the tile as-is - the upgrade will be handled centrally
      // The relict manager will detect this and apply the upgrade
      return upgradeTile(tile);
    }
  }
};
