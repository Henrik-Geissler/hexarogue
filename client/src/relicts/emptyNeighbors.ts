import { Relict, RelictBehavior, TilePlacementContext, TilePlacementResult, RelictEffectType } from '../types/relicts';
import { countEmptyNeighbors } from '../utils/relictManager';

export const emptyNeighborsBehavior: RelictBehavior = {
  onBeforeTilePlacement: (context: TilePlacementContext): TilePlacementResult => {
    const effects = [];
    const tileNumber = context.tile.number.toString();
    
    // Check if any digit is 3
    if (tileNumber.includes('3')) {
      const emptyCount = countEmptyNeighbors(context.position, context.board);
      if (emptyCount > 0) {
        effects.push({
          type: 'scoring-twice' as RelictEffectType,
          relictId: 'empty-neighbors-retrigger',
          multiplier: emptyCount // This will trigger scoring emptyCount times
        });
      }
    }
    
    return {
      tile: context.tile,
      canPlace: true,
      effects
    };
  },
};

export const emptyNeighborsRelict: Relict = {
  id: 'empty-neighbors-retrigger',
  name: 'Empty Neighbors',
  icon: '🌫️',
  description: 'Tiles with digit **3** **retrigger** for each **empty neighbor**',
  behavior: emptyNeighborsBehavior,
};
