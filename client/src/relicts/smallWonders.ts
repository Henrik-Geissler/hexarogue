import { Relict, RelictBehavior, ScoringContext } from '../types/relicts';

export const smallWondersBehavior: RelictBehavior = {
  onTileScores: (context: ScoringContext) => {
    if (context.tile.number < 10) {
      return context.baseScore * context.baseScore;
    }
    return context.baseScore;
  },
};

export const smallWondersRelict: Relict = {
  id: 'small-number-multiply',
  name: 'Small Wonders',
  icon: '🔢',
  description: 'Tiles with numbers smaller than 10 multiply the score instead of adding',
  type: 'small-number-multiply',
  behavior: smallWondersBehavior,
};


