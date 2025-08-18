import { Relict, RelictBehavior, TilePlacementContext, TilePlacementResult, RelictEffectType, RelictEffect } from '../types/relicts';
import { getEmptyNeighborPositions } from '../utils/relictManager';

export const singleNeighborCopyBehavior: RelictBehavior = {
  onAfterTilePlacement: (context: TilePlacementContext) => {
    const { tile, position, board } = context;
    
    // Get empty neighbor positions
    const emptyPositions = getEmptyNeighborPositions(position, board);
    
    // If there's exactly one free neighbor, place a copy there
    if (emptyPositions.length === 1) {
      const copyPosition = emptyPositions[0];
      const copyTile = {
        ...tile,
        id: `copy-${tile.id}-${Date.now()}-${Math.random()}`
      };
      
      // Create a new board with the copy placed
      const newBoard = board.map(row => [...row]);
      newBoard[copyPosition.row][copyPosition.col] = copyTile;
      
      return newBoard;
    }
    
    return board;
  },
};

export const singleNeighborCopyRelict: Relict = {
  id: 'single-neighbor-copy',
  name: 'Single Neighbor Copy',
  icon: '🔄',
  description: 'When the placed Tile has only **one free neighbour spot**: Place a **copy** of the Tile at that spot. The Copy is **permanent** and will stay in the deck.',
  behavior: singleNeighborCopyBehavior,
};
