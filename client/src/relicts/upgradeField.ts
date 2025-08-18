import { Relict, RelictBehavior } from '../types/relicts';
import { Tile, BoardPosition } from '../types/game';

export const upgradeFieldBehavior: RelictBehavior = {
  onEveryOtherTurn: (board: (Tile | null)[][]) => {
    return spawnUpgradeField(board);
  },
};

// Helper function to spawn an upgrade field on a random free spot
function spawnUpgradeField(board: (Tile | null)[][]): (Tile | null)[][] {
  const newBoard = board.map(row => [...row]);
  const freePositions: BoardPosition[] = [];
  
  // Find all free positions
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === null) {
        freePositions.push({ row, col });
      }
    }
  }
  
  // If there are free positions, place an upgrade field randomly
  if (freePositions.length > 0) {
    const randomIndex = Math.floor(Math.random() * freePositions.length);
    const position = freePositions[randomIndex];
    
    const upgradeField: Tile = {
      id: `upgrade-field-${Date.now()}-${Math.random()}`,
      number: 0, // Upgrade fields don't have a meaningful number
      color: 'yellow', // Default color, could be made more distinctive
      isUpgradeField: true
    };
    
    newBoard[position.row][position.col] = upgradeField;
  }
  
  return newBoard;
}

export const upgradeFieldRelict: Relict = {
  id: 'upgrade-field-spawn',
  name: 'Growth Fields',
  icon: '🌱',
  description: 'Every **other turn**, spawn an **upgrade field** on a random free spot',
  behavior: upgradeFieldBehavior,
};
