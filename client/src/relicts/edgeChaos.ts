import { Relict, RelictBehavior, TilePlacementContext } from '../types/relicts';
import { isOnEdge, getRandomColor } from '../utils/relictManager';

export const edgeChaosBehavior: RelictBehavior = {
  onBeforeTilePlacement: (context: TilePlacementContext) => {
    if (isOnEdge(context.position, context.board)) {
      return { tile: { ...context.tile, color: getRandomColor() }, canPlace: true };
    }
    return { tile: context.tile, canPlace: true };
  },
};

export const edgeChaosRelict: Relict = {
  id: 'edge-color-change',
  name: 'Edge Chaos',
  icon: '🌈',
  description: 'Tiles placed on the edge of the board switch to a random color',
  type: 'edge-color-change',
  behavior: edgeChaosBehavior,
};


