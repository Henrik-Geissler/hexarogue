import { Relict, RelictBehavior, TilePlacementContext, TilePlacementResult, RelictEffectType } from '../types/relicts';

export const oddDisappearanceBehavior: RelictBehavior = {
  onBeforeTilePlacement: (context: TilePlacementContext): TilePlacementResult => {
    const effects = [];
    if (context.tile.number % 2 === 1) {
      effects.push({
        type: 'vanishing' as RelictEffectType,
        relictId: 'odd-tiles-vanish',
        position: context.position
      });
    }
    
    return {
      tile: context.tile,
      canPlace: true,
      effects
    };
  },
};

export const oddDisappearanceRelict: Relict = {
  id: 'odd-tiles-vanish',
  name: 'Odd Disappearance',
  icon: '👻',
  description: '**Odd** tiles **disappear** after placement and return to the deck next round',
  behavior: oddDisappearanceBehavior,
};


