import { Relict, RelictBehavior } from '../types/relicts';
import { Tile, BoardPosition } from '../types/game';

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
  description: '**Yellow** tiles can be placed on any **free spot**, ignoring neighbor requirements',
  behavior: yellowFreedomBehavior,
};


