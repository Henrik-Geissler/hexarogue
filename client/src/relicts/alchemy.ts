import { Relict, RelictBehavior, TilePlacementContext } from '../types/relicts';

export const alchemyBehavior: RelictBehavior = {
  onBeforeTilePlacement: (context: TilePlacementContext) => {
    if (context.tile.color === 'green') {
      return { tile: { ...context.tile, color: 'red', number: context.tile.number * 2 }, canPlace: true };
    }
    return { tile: context.tile, canPlace: true };
  },
};

export const alchemyRelict: Relict = {
  id: 'green-to-red-upgrade',
  name: 'Alchemy',
  icon: '🔄',
  description: 'When you place a green tile, double it and turn it red',
  type: 'green-to-red-upgrade',
  behavior: alchemyBehavior,
};


