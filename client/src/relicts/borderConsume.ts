import { Relict, RelictBehavior, TilePlacementContext, TilePlacementResult } from '../types/relicts';
import type { Tile, BoardPosition } from '../types/game';
import { isLastBorderSpot } from '../utils/gameLogic';

export const borderConsumeBehavior: RelictBehavior = {
  onAfterTilePlacement: (context: TilePlacementContext) => {
    const { tile, position, board } = context;
    
    // Check if this is the last border spot being filled
    if (isLastBorderSpot(position, board)) {
      // Find all tiles on the board (excluding the newly placed tile and blocks)
      const allTiles: { tile: Tile; position: BoardPosition }[] = [];
      
      for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
          const boardTile = board[row][col];
          if (boardTile && !boardTile.isBlock && !boardTile.isUpgradeField && !boardTile.isGhost) {
            // Don't include the tile we just placed
            if (row !== position.row || col !== position.col) {
              allTiles.push({ tile: boardTile, position: { row, col } });
            }
          }
        }
      }
      
      // Create a new board with all tiles consumed (removed)
      const newBoard = board.map(row => [...row]);
      allTiles.forEach(({ position: tilePos }) => {
        newBoard[tilePos.row][tilePos.col] = null;
      });
      
      // Add the consumed tiles to the consuming tile
      const consumedTiles = allTiles.map(({ tile }) => tile);
      const updatedTile = {
        ...tile,
        number: tile.number + consumedTiles.reduce((sum, consumedTile) => sum + consumedTile.number, 0),
        consumedTiles: [...(tile.consumedTiles || []), ...consumedTiles]
      };
      
      // Place the updated tile back on the board
      newBoard[position.row][position.col] = updatedTile;
      
      return { board: newBoard };
    }
    
    return { board };
  },
};

export const borderConsumeRelict: Relict = {
  id: 'border-consume',
  name: 'Border Consume',
  icon: '🌊',
  description: 'When a Tile is placed, if the **last Spot with a border neighbor** (outside or block) is filled, **Consume all other board tiles**.',
  behavior: borderConsumeBehavior,
};
