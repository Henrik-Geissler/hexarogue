import { Relict, RelictBehavior, RoundEndContext, Tile } from '../types/relicts';

export const oddDisappearanceBehavior: RelictBehavior = {
  onRoundEnd: (context: RoundEndContext) => {
    const vanishedTiles: Tile[] = [];
    const newBoard = context.board.map(row =>
      row.map(tile => {
        if (tile && tile.number % 2 === 1) {
          vanishedTiles.push(tile);
          return null;
        }
        return tile;
      })
    );
    return { board: newBoard, vanishedTiles };
  },
};

export const oddDisappearanceRelict: Relict = {
  id: 'odd-tiles-vanish',
  name: 'Odd Disappearance',
  icon: '👻',
  description: 'Odd tiles will be removed from the board after scoring (return next round)',
  type: 'odd-tiles-vanish',
  behavior: oddDisappearanceBehavior,
};


