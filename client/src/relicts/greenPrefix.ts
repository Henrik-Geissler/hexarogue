import { Relict, RelictBehavior } from '../types/relicts';
import { Tile } from '../types/game';

export const greenPrefixBehavior: RelictBehavior = {
  onDrawTile: (tile: Tile) => {
    // Check if it's a green tile and doesn't contain digit 1
    	if (tile.matchesColor('green') && !tile.number.toString().includes('1')) {
      // Add 1 in front of the number
      const newNumber = parseInt('1' + tile.number.toString());
      return {
        ...tile,
        number: newNumber
      };
    }
    
    return tile; // Return unchanged if not green or already contains 1
  },
};

export const greenPrefixRelict: Relict = {
  id: 'green-prefix',
  name: 'Green Growth',
  icon: '🌱',
  description: 'When you **draw a green tile** without digit **1**, add **1** in front',
  behavior: greenPrefixBehavior,
};
