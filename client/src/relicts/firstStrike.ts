import { Relict, RelictBehavior, TilePlacementContext } from '../types/relicts';

export const firstStrikeBehavior: RelictBehavior = {
  onBeforeTilePlacement: (context: TilePlacementContext) => {
    if (context.isFirstTileThisRound) {
      return { tile: { ...context.tile, number: context.tile.number * 2 }, canPlace: true };
    }
    return { tile: context.tile, canPlace: true };
  },
};

export const firstStrikeRelict: Relict = {
  id: 'first-tile-double',
  name: 'First Strike',
  icon: '⚡',
  description: 'Double the number of the first tile played each round',
  type: 'first-tile-double',
  behavior: firstStrikeBehavior,
};


