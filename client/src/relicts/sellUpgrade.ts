import { Relict, RelictBehavior } from '../types/relicts';
import { upgradeTile } from '../utils/relictManager';

export const sellUpgradeBehavior: RelictBehavior = {
  onSellRelict: (hand) => {
    // Upgrade all tiles in hand when another relict is sold
    return hand.map(tile => ({
      ...tile,
      number: upgradeTile(tile.number)
    }));
  },
};

export const sellUpgradeRelict: Relict = {
  id: 'sell-upgrade',
  name: 'Sell Upgrade',
  icon: '🔄',
  description: 'When you **sell another relict**, **upgrade** all tiles in your hand',
  behavior: sellUpgradeBehavior,
};
