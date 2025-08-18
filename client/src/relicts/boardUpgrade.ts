import { Relict, RelictBehavior, RoundEndContext } from '../types/relicts';
import { upgradeTile } from '../utils/relictManager';

export const boardUpgradeBehavior: RelictBehavior = {
  onRoundEnd: (context: RoundEndContext) => {
    const newBoard = context.board.map(row =>
      row.map(tile => (tile ? { ...tile, number: upgradeTile(tile.number) } : null))
    );
    return { board: newBoard };
  },
};

export const boardUpgradeRelict: Relict = {
  id: 'board-upgrade',
  name: 'Board Upgrade',
  icon: '⬆',
  description: 'At the end of each round, upgrade all tiles on the board',
  type: 'board-upgrade',
  behavior: boardUpgradeBehavior,
};


