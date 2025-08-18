import { Relict, RelictBehavior } from '../types/relicts';
import { upgradeTile } from '../utils/relictManager';

export const lowGoldUpgradeBehavior: RelictBehavior = {
  onLowGoldUpgrade: (tile, gold) => {
    // Upgrade the tile if gold is below 20
    if (gold < 20) {
      return {
        ...tile,
        number: upgradeTile(tile.number)
      };
    }
    return tile;
  },
};

export const lowGoldUpgradeRelict: Relict = {
  id: 'low-gold-upgrade',
  name: 'Low Gold Upgrade',
  icon: '⬆️',
  description: 'While your **gold is below 20**, **upgrade** every played card',
  behavior: lowGoldUpgradeBehavior,
};
