import { Relict, RelictBehavior } from '../types/relicts';

export const yellowGoldBehavior: RelictBehavior = {
  onDiscardYellowTile: (tile) => {
    // Return 1 gold for each yellow tile discarded
    return 1;
  },
};

export const yellowGoldRelict: Relict = {
  id: 'yellow-gold',
  name: 'Yellow Gold',
  icon: '💰',
  description: 'When you **discard a yellow tile**, get **1 gold**',
  behavior: yellowGoldBehavior,
};
