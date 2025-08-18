import { Relict, RelictBehavior, TilePlacementContext, TilePlacementResult, RelictEffectType, RelictEffect } from '../types/relicts';

export const colorVarietyBehavior: RelictBehavior = {
  onBeforeTilePlacement: (context: TilePlacementContext): TilePlacementResult => {
    const effects: RelictEffect[] = [];
    
    // This relict will be handled in the game logic where we have access to the player hand
    // For now, we'll always add the effect and let the game logic determine if it should trigger
    // The actual check will be done in the game state where we have access to the player hand
    
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
