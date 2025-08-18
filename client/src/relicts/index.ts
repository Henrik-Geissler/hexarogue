import { Relict } from '../types/relicts';
import { alchemyRelict } from './alchemy';
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
import { yellowGoldRelict } from './yellowGold';
import { discardGoldRelict } from './discardGold';
import { goldMultiplierRelict } from './goldMultiplier';
import { lowGoldUpgradeRelict } from './lowGoldUpgrade';
import { sellUpgradeRelict } from './sellUpgrade';

export const ALL_RELICTS: Relict[] = [
  alchemyRelict,
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
  yellowGoldRelict,
  discardGoldRelict,
  goldMultiplierRelict,
  lowGoldUpgradeRelict,
  sellUpgradeRelict,
];

export function createInitialRelictPool(): Relict[] {
  return [
    alchemyRelict,
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
    yellowGoldRelict,
    discardGoldRelict,
    goldMultiplierRelict,
    lowGoldUpgradeRelict,
    sellUpgradeRelict,
  ];
}

export function getRelictSelection(availableRelicts: Relict[]): Relict[] {
  if (availableRelicts.length === 0) return [];
  if (availableRelicts.length <= 3) return [...availableRelicts];
  const shuffled = [...availableRelicts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}


