import { Relict } from '../types/relicts';
import { boardUpgradeRelict } from './boardUpgrade';
import { firstStrikeRelict } from './firstStrike';
import { alchemyRelict } from './alchemy';
import { twinPowerRelict } from './twinPower';
import { smallWondersRelict } from './smallWonders';
import { evenLuckRelict } from './evenLuck';
import { oddDisappearanceRelict } from './oddDisappearance';
import { yellowFreedomRelict } from './yellowFreedom';
import { edgeChaosRelict } from './edgeChaos';
import { blueCascadeRelict } from './blueCascade';

export const ALL_RELICTS: Relict[] = [
  boardUpgradeRelict,
  firstStrikeRelict,
  alchemyRelict,
  twinPowerRelict,
  smallWondersRelict,
  evenLuckRelict,
  oddDisappearanceRelict,
  yellowFreedomRelict,
  edgeChaosRelict,
  blueCascadeRelict,
];

export function createInitialRelictPool(): Relict[] {
  return [...ALL_RELICTS];
}

export function getRelictSelection(availableRelicts: Relict[]): Relict[] {
  if (availableRelicts.length === 0) return [];
  if (availableRelicts.length <= 3) return [...availableRelicts];
  const shuffled = [...availableRelicts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}


