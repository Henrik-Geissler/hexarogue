import { Relict, RelictBehavior } from '../types/relicts';
import { Tile } from '../types/game';

export const blueTriggerBehavior: RelictBehavior = {
  onDrawTile: (tile: Tile) => {
    // Check if the drawn tile is blue
    	if (tile.matchesColor('blue')) {
      // Return the same tile but mark it for triggering
      return {
        ...tile,
        // We'll handle the actual triggering logic in the game state
        // This just marks that the relict should trigger
      };
    }
    return tile;
  },
};

export const blueTriggerRelict: Relict = {
  id: 'blue-trigger',
  name: 'Blue Resonance',
  icon: '🔵',
  description: 'When you **draw a blue tile**, **trigger it** (use hand neighbors for triggering)',
  behavior: blueTriggerBehavior,
};
