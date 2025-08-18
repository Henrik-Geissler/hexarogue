import { Relict, RelictBehavior, TilePlacementContext, TilePlacementResult, RelictEffectType } from '../types/relicts';
import { Tile, BoardPosition } from '../types/game';

export const blueStackBehavior: RelictBehavior = {
  onCanPlaceTile: (tile: Tile, position: BoardPosition, board: (Tile | null)[][], isFirstTile: boolean) => {
    // Blue tiles can be placed on red tiles if all other placement rules are satisfied
    if (tile.color === 'blue') {
      const targetTile = board[position.row][position.col];
      if (targetTile && targetTile.color === 'red') {
        // Check if all other placement rules are satisfied (except empty spot)
        // This would need to be implemented in the main placement logic
        return true;
      }
    }
    return false; // Let normal placement logic handle other cases
  },
  
  onBeforeTilePlacement: (context: TilePlacementContext): TilePlacementResult => {
    const effects = [];
    const targetTile = context.board[context.position.row][context.position.col];
    
    // If placing a blue tile on a red tile, add stacking effect
    if (context.tile.color === 'blue' && targetTile && targetTile.color === 'red') {
      effects.push({
        type: 'tile-stack' as RelictEffectType,
        relictId: 'blue-stack',
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

export const blueStackRelict: Relict = {
  id: 'blue-stack',
  name: 'Blue Override',
  icon: '🔵',
  description: '**Blue tiles** can be placed on **red tiles**. The new tile **adds** the number below and **removes** the red tile',
  behavior: blueStackBehavior,
};
