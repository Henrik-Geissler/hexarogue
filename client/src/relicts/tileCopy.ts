import { Relict, RelictBehavior } from '../types/relicts';
import { Tile, BoardPosition } from '../types/game';

export const tileCopyBehavior: RelictBehavior = {
  onTargetScoreReached: (tile: Tile, position: BoardPosition) => {
    // Create an exact copy of the tile that triggered the target score
    return {
      ...tile,
      id: `copy-${Date.now()}-${Math.random()}` // New unique ID
    };
  },
};

export const tileCopyRelict: Relict = {
  id: 'tile-copy',
  name: 'Victory Echo',
  icon: '📋',
  description: 'When a tile **reaches the target score**, create an **exact copy** for the deck',
  behavior: tileCopyBehavior,
};
