import { Relict, RelictBehavior, TilePlacementContext, TilePlacementResult, RelictEffectType, RelictEffect } from '../types/relicts';

export const colorVarietyBehavior: RelictBehavior = {
  onBeforeTilePlacement: (context: TilePlacementContext): TilePlacementResult => {
    const effects: RelictEffect[] = [];
    
    // Check if player has 4 different colors in hand
    const colorsInHand = new Set(context.playerHand.map(tile => tile.color));
    const hasColorVariety = colorsInHand.size >= 4;
    
    if (hasColorVariety) {
      // Add scoring-twice effect when 4 different colors are in hand
      effects.push({
        type: 'scoring-twice',
        relictId: 'color-variety-double',
        multiplier: 2
      });
    }
    
    return {
      tile: context.tile,
      canPlace: true,
      effects
    };
  },
};

export const colorVarietyRelict: Relict = {
  id: 'color-variety-double',
  name: 'Color Variety',
  icon: '🌈',
  description: 'While you have **4 different colors** in hand, all tiles **score twice**',
  behavior: colorVarietyBehavior,
};
