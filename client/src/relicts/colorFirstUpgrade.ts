import { Relict, RelictBehavior, TilePlacementContext, TilePlacementResult, RelictEffectType, RelictEffect } from '../types/relicts';
import { getNeighbors } from '../utils/gameLogic';

export const colorFirstUpgradeBehavior: RelictBehavior = {
  onAfterTilePlacement: (context: TilePlacementContext) => {
    const { tile, position, board } = context;
    
    // Get all tiles on the board to check if this is the first tile of this color this round
    const allTiles = board.flat().filter(t => t !== null);
    
    // Check if this is the first tile of this color placed this round
    const tilesOfSameColor = allTiles.filter(t => t!.color === tile.color);
    const isFirstOfColor = tilesOfSameColor.length === 1; // Only the current tile
    
    if (isFirstOfColor) {
      // Get neighboring tiles
      const neighbors = getNeighbors(position, board);
      const neighborTiles = neighbors.filter(n => n !== null);
      
      // Create a new board with upgraded neighbors
      const newBoard = board.map(row => [...row]);
      
      neighborTiles.forEach(neighbor => {
        if (neighbor) {
          // Find the neighbor's position
          for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[row].length; col++) {
              if (board[row][col] && board[row][col]!.id === neighbor.id) {
                // Upgrade the neighbor
                newBoard[row][col] = {
                  ...neighbor,
                  number: neighbor.number + 1
                };
                break;
              }
            }
          }
        }
      });
      
      return newBoard;
    }
    
    return board;
  },
};

export const colorFirstUpgradeRelict: Relict = {
  id: 'color-first-upgrade',
  name: 'Color First Upgrade',
  icon: '🎨',
  description: '**Per Color**: The **first time each round** you play a tile of that color, **upgrade all neighbouring tiles**',
  behavior: colorFirstUpgradeBehavior,
};
