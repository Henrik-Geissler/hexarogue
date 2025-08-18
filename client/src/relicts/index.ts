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
import { emptyNeighborsRelict } from './emptyNeighbors';
import { ghostSpawnRelict } from './ghostSpawn';
import { colorVarietyRelict } from './colorVariety';
import { discardUpgradeRelict } from './discardUpgrade';
import { tileCopyRelict } from './tileCopy';
import { thirteenthTileRelict } from './thirteenthTile';
import { greenPrefixRelict } from './greenPrefix';
import { boardIncrementRelict } from './boardIncrement';
import { blueStackRelict } from './blueStack';
import { autoDiscardRelict } from './autoDiscard';
import { upgradeFieldRelict } from './upgradeField';
import { areaColorChangeRelict } from './areaColorChange';
import { areaUpgradeRelict } from './areaUpgrade';
import { digitReplaceRelict } from './digitReplace';
import { blueTriggerRelict } from './blueTrigger';
import { greenUpgradeRelict } from './greenUpgrade';

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
  emptyNeighborsRelict,
  ghostSpawnRelict,
  colorVarietyRelict,
  discardUpgradeRelict,
  tileCopyRelict,
  thirteenthTileRelict,
  greenPrefixRelict,
  boardIncrementRelict,
  blueStackRelict,
  autoDiscardRelict,
  upgradeFieldRelict,
  areaColorChangeRelict,
  areaUpgradeRelict,
  digitReplaceRelict,
  blueTriggerRelict,
  greenUpgradeRelict,
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


