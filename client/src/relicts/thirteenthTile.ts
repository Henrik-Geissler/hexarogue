import { Relict, RelictBehavior, TilePlacementContext, TilePlacementResult, RelictEffectType } from '../types/relicts';

export const thirteenthTileBehavior: RelictBehavior = {
  onBeforeTilePlacement: (context: TilePlacementContext): TilePlacementResult => {
    const effects = [];
    
    // Count tiles on the board to determine if this is the 13th tile
    const tilesOnBoard = context.board.flat().filter(tile => tile !== null).length;
    
    if (tilesOnBoard === 12) { // This will be the 13th tile (0-indexed, so 12 means 13th)
      effects.push({
        type: 'doubling' as RelictEffectType,
        relictId: 'thirteenth-tile-double'
      });
    }
    
    return {
      tile: context.tile,
      canPlace: true,
      effects
    };
  },
};

export const thirteenthTileRelict: Relict = {
  id: 'thirteenth-tile-double',
  name: 'Baker\'s Dozen',
  icon: '🍞',
  description: 'The **13th tile** you play each round **doubles**',
  behavior: thirteenthTileBehavior,
};
