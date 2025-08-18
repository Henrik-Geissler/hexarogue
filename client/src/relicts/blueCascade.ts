import { Relict, RelictBehavior, BoardPosition, Tile } from '../types/relicts';
import { countBlueNeighbors } from '../utils/relictManager';

export const blueCascadeBehavior: RelictBehavior = {
  onGetRetriggerCount: (position: BoardPosition, board: (Tile | null)[][]) => {
    return countBlueNeighbors(position, board) + 1;
  },
};

export const blueCascadeRelict: Relict = {
  id: 'blue-neighbor-retrigger',
  name: 'Blue Cascade',
  icon: '🌊',
  description: 'Tiles retrigger for each blue neighbor (score and effects again)',
  type: 'blue-neighbor-retrigger',
  behavior: blueCascadeBehavior,
};


