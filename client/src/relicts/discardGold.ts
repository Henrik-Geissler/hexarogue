import { Relict, RelictBehavior } from '../types/relicts';

export const discardGoldBehavior: RelictBehavior = {
  onRoundEndGold: (discards) => {
    // Return 3 gold for each remaining discard
    return discards * 3;
  },
};

export const discardGoldRelict: Relict = {
  id: 'discard-gold',
  name: 'Discard Gold',
  icon: '🏆',
  description: 'At the **end of the round** get **3 Gold** for each **remaining discard**',
  behavior: discardGoldBehavior,
};
