import { Relict, RelictBehavior, ScoringContext } from '../types/relicts';

export const evenLuckBehavior: RelictBehavior = {
  onTileScores: (context: ScoringContext) => {
    if (context.tile.number % 2 === 0) {
      return context.baseScore * 2;
    }
    return context.baseScore;
  },
};

export const evenLuckRelict: Relict = {
  id: 'even-numbers-double',
  name: 'Even Luck',
  icon: '🎲',
  description: 'Tiles with even numbers score twice',
  type: 'even-numbers-double',
  behavior: evenLuckBehavior,
};


