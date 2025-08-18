import { Relict, RelictBehavior, TilePlacementContext, TilePlacementResult, RelictEffectType } from '../types/relicts';
import { upgradeTile } from '../utils/gameLogic';

export const boardIncrementBehavior: RelictBehavior = {
  onBeforeTilePlacement: (context: TilePlacementContext): TilePlacementResult => {
    const effects = [];
    
    // Add board increment effect for every tile placement
    effects.push({
      type: 'board-increment' as RelictEffectType,
      relictId: 'board-increment'
    });
    
    return {
      tile: context.tile,
      canPlace: true,
      effects
    };
  },
  
  onBoardIncrement: (board: (Tile | null)[][]) => {
    // Increment all tiles on the board by 1
    return board.map(row => 
      row.map(tile => 
        tile ? upgradeTile(tile) : null
      )
    );
  },
};

export const boardIncrementRelict: Relict = {
  id: 'board-increment',
  name: 'Growth Spurt',
  icon: '📈',
  description: 'Whenever you **play a tile**, **increment** all board tiles by **1**',
  behavior: boardIncrementBehavior,
};
