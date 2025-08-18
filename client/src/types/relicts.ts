export type RelictType = 'color-multiplier' | 'board-upgrade' | 'first-tile-double' | 'green-to-red-upgrade' | 'identical-tiles-upgrade';

export interface Relict {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: RelictType;
  color?: 'red' | 'green' | 'blue' | 'yellow';
  multiplier?: number;
}

export interface RelictState {
  ownedRelicts: Relict[];
  availableRelicts: Relict[];
  relictSelectionPhase: boolean;
  availableSelection: Relict[];
}