import { Relict, RelictBehavior, ScoringContext, TilePlacementContext, TilePlacementResult, RelictEffectType } from '../types/relicts';

export const evenLuckBehavior: RelictBehavior = {
  onBeforeTilePlacement: (context: TilePlacementContext): TilePlacementResult => {
    const effects = [];
    if (context.tile.number % 2 === 0) {
      effects.push({
        type: 'doubling' as RelictEffectType,
        relictId: 'even-numbers-double'
      });
    }
    
    return {
      tile: context.tile,
      canPlace: true,
      effects
    };
  },
  
  onTileScores: (context: ScoringContext) => {
    // Even Luck doesn't modify the score calculation, it triggers scoring twice
    return context.baseScore;
  },
};

export const evenLuckRelict: Relict = {
  id: 'even-numbers-double',
  name: 'Even Luck',
  icon: '🎲',
  description: 'Tiles with **even** numbers **score twice**',
  behavior: evenLuckBehavior,
};


