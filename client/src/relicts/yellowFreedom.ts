import { Relict, RelictBehavior, Tile, BoardPosition } from '../types/relicts';

export const yellowFreedomBehavior: RelictBehavior = {
  onCanPlaceTile: (tile: Tile, _position: BoardPosition, _board: (Tile | null)[][], _isFirstTile: boolean) => {
    if (tile.color === 'yellow') {
      return true;
    }
    return false;
  },
};

export const yellowFreedomRelict: Relict = {
  id: 'yellow-anywhere',
  name: 'Yellow Freedom',
  icon: '🌟',
  description: 'Yellow tiles can be placed anywhere, removing placement requirements',
  type: 'yellow-anywhere',
  behavior: yellowFreedomBehavior,
};


