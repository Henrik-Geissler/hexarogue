import { Relict, RelictBehavior, ScoringContext, TilePlacementContext, TilePlacementResult, RelictEffectType } from '../types/relicts';

export const smallWondersBehavior: RelictBehavior = {
  onBeforeTilePlacement: (context: TilePlacementContext): TilePlacementResult => {
    const effects = [];
    if (context.tile.number < 10) {
      effects.push({
        type: 'multiplying' as RelictEffectType,
        relictId: 'small-number-multiply',
        multiplier: context.tile.number
      });
    }
    
    return {
      tile: context.tile,
      canPlace: true,
      effects
    };
  },
};

export const smallWondersRelict: Relict = {
  id: 'small-number-multiply',
  name: 'Small Wonders',
  icon: '🔢',
  description: 'Tiles with numbers **smaller than 10** **multiply** the round score instead of adding',
  behavior: smallWondersBehavior,
};


