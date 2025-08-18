import { Relict, RelictBehavior, TilePlacementContext, TilePlacementResult, RelictEffectType, RelictEffect } from '../types/relicts';
import type { Tile } from '../types/game';

export const ghostHandBehavior: RelictBehavior = {
  onDiscardTiles: (tiles: Tile[], context?: { board: (Tile | null)[][], handSize: number }) => {
    // If we have context and this is a full hand discard
    if (context && tiles.length === context.handSize) {
      // Get all tiles on the board (excluding blocks and upgrade fields)
      const boardTiles = context.board.flat().filter((t): t is Tile => t !== null && !t.isBlock && !t.isUpgradeField);
      
      // Create ghost copies of all board tiles
      const ghostCopies = boardTiles.map(tile => ({
        ...tile,
        id: `ghost-${tile.id}-${Date.now()}-${Math.random()}`,
        isGhost: true
      }));
      
      // Return the ghost copies to be added to hand before redrawing
      return {
        processedTiles: tiles,
        ghostCopies,
        reduceDrawCount: ghostCopies.length
      };
    }
    
    // Normal discard behavior
    return {
      processedTiles: tiles,
      ghostCopies: [],
      reduceDrawCount: 0
    };
  },
};

export const ghostHandRelict: Relict = {
  id: 'ghost-hand',
  name: 'Ghost Hand',
  icon: '👻',
  description: 'If you **discard your whole hand** at once, for each **Tile on the board** add a **ghost copy** to your hand **Before Redrawing**. Only redraw as many cards as you would have minus the created ghost copies.',
  behavior: ghostHandBehavior,
};
