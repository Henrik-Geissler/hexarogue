import { Relict, RelictBehavior, TilePlacementContext, TilePlacementResult, RelictEffectType } from '../types/relicts';
import { getEmptyNeighborPositions } from '../utils/relictManager';

export const ghostSpawnBehavior: RelictBehavior = {
  onBeforeTilePlacement: (context: TilePlacementContext): TilePlacementResult => {
    const effects = [];
    const tileNumber = context.tile.number.toString();
    
    // Check if any digit is 4
    if (tileNumber.includes('4')) {
      const emptyPositions = getEmptyNeighborPositions(context.position, context.board);
      if (emptyPositions.length > 0) {
        effects.push({
          type: 'ghost-spawn' as RelictEffectType,
          relictId: 'ghost-spawn',
          position: context.position,
          multiplier: emptyPositions.length
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

export const ghostSpawnRelict: Relict = {
  id: 'ghost-spawn',
  name: 'Ghost Spawn',
  icon: '👻',
  description: 'Tiles with digit **4** spawn **ghost copies** on empty neighbors',
  behavior: ghostSpawnBehavior,
};
