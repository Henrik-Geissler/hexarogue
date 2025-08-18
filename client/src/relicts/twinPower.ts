import { Relict, RelictBehavior, RoundEndContext, Tile } from '../types/relicts';
import { upgradeTile } from '../utils/relictManager';

export const twinPowerBehavior: RelictBehavior = {
  onRoundEnd: (context: RoundEndContext) => {
    const tiles: (Tile & { row: number; col: number })[] = [];
    context.board.forEach((row, rowIndex) => {
      row.forEach((tile, colIndex) => {
        if (tile) tiles.push({ ...tile, row: rowIndex, col: colIndex });
      });
    });

    const upgradedPositions = new Set<string>();
    const newBoard = context.board.map(row => [...row]);

    for (let i = 0; i < tiles.length; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        const tile1 = tiles[i];
        const tile2 = tiles[j];
        if (tile1.number === tile2.number && tile1.color === tile2.color) {
          const pos1 = `${tile1.row}-${tile1.col}`;
          const pos2 = `${tile2.row}-${tile2.col}`;
          if (!upgradedPositions.has(pos1)) {
            newBoard[tile1.row][tile1.col] = { ...tile1, number: upgradeTile(tile1.number) };
            upgradedPositions.add(pos1);
          }
          if (!upgradedPositions.has(pos2)) {
            newBoard[tile2.row][tile2.col] = { ...tile2, number: upgradeTile(tile2.number) };
            upgradedPositions.add(pos2);
          }
        }
      }
    }

    return { board: newBoard };
  },
};

export const twinPowerRelict: Relict = {
  id: 'identical-tiles-upgrade',
  name: 'Twin Power',
  icon: '👥',
  description: 'At the end of each round, upgrade all pairs of identical tiles',
  type: 'identical-tiles-upgrade',
  behavior: twinPowerBehavior,
};


