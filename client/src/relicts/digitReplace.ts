import { Relict, RelictBehavior } from '../types/relicts';
import { Tile } from '../types/game';

export const digitReplaceBehavior: RelictBehavior = {
  onTileNumberChanged: (tile: Tile) => {
    // Check if tile has digit 1
    if (tile.number.toString().includes('1')) {
      // Replace all 1s with 8s
      const newNumber = parseInt(tile.number.toString().replace(/1/g, '8'));
      return {
        ...tile,
        number: newNumber
      };
    }
    return tile;
  },
  
  onDrawTile: (tile: Tile) => {
    // Check if tile has digit 1
    if (tile.number.toString().includes('1')) {
      // Replace all 1s with 8s
      const newNumber = parseInt(tile.number.toString().replace(/1/g, '8'));
      return {
        ...tile,
        number: newNumber
      };
    }
    return tile;
  },
};

export const digitReplaceRelict: Relict = {
  id: 'digit-replace',
  name: 'Lucky Eight',
  icon: '🎲',
  description: 'Whenever a tile\'s **number changes** or a tile is **drawn**: If there is a **digit 1**, replace it with an **8**',
  behavior: digitReplaceBehavior,
};
