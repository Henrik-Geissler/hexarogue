import { Relict, RelictBehavior } from '../types/relicts';

export const goldMultiplierBehavior: RelictBehavior = {
  onScoringGold: (score, gold) => {
    // Multiply the score by the amount of gold
    return score * gold;
  },
};

export const goldMultiplierRelict: Relict = {
  id: 'gold-multiplier',
  name: 'Gold Multiplier',
  icon: '⚡',
  description: 'Each time anything **scores**, multiply that scoring with the **amount of gold** you have',
  behavior: goldMultiplierBehavior,
};
