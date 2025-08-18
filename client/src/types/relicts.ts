export type RelictType = 
  | 'board-upgrade' 
  | 'first-tile-double' 
  | 'green-to-red-upgrade' 
  | 'identical-tiles-upgrade'
  | 'small-number-multiply'
  | 'even-numbers-double'
  | 'odd-tiles-vanish'
  | 'yellow-anywhere'
  | 'edge-color-change'
  | 'blue-neighbor-retrigger';

import type { Tile, BoardPosition } from './game';

export interface GameContext {
  board: (Tile | null)[][];
  score: number;
  round: number;
  isFirstTile: boolean;
  isFirstTileThisRound: boolean;
}

export interface TilePlacementContext {
  tile: Tile;
  position: BoardPosition;
  board: (Tile | null)[][];
  playerHand: Tile[]; // Add player hand for relicts that need to check hand state
  isFirstTile: boolean;
  isFirstTileThisRound: boolean;
}

export interface ScoringContext {
  tile: Tile;
  baseScore: number;
  position: BoardPosition;
  board: (Tile | null)[][];
}

export interface RoundEndContext {
  board: (Tile | null)[][];
  round: number;
}

// Interface for relict behavior hooks
export interface RelictBehavior {
  // Called before a tile is placed, can modify the tile or prevent placement
  onBeforeTilePlacement?: (context: TilePlacementContext) => TilePlacementResult;
  
  // Called when calculating score for a tile
  onTileScores?: (context: ScoringContext) => number;
  
  // Called after a tile is placed, can modify the board
  onAfterTilePlacement?: (context: TilePlacementContext) => (Tile | null)[][] | { board: (Tile | null)[][]; copiedTiles?: Tile[] };
  
  // Called at the end of a round, can modify the board
  onRoundEnd?: (context: RoundEndContext) => RoundEndResult;
  
  // Called when checking if a tile can be placed
  onCanPlaceTile?: (tile: Tile, position: BoardPosition, board: (Tile | null)[][], isFirstTile: boolean) => boolean;
  
  // Called when calculating retrigger count
  onGetRetriggerCount?: (position: BoardPosition, board: (Tile | null)[][]) => number;
  onDiscardTiles?: (tiles: Tile[], context?: { board: (Tile | null)[][], handSize: number }) => Tile[] | { processedTiles: Tile[]; ghostCopies: Tile[]; reduceDrawCount: number };
  onTargetScoreReached?: (tile: Tile, position: BoardPosition) => Tile;
  onDrawTile?: (tile: Tile) => Tile;
  onBoardIncrement?: (board: (Tile | null)[][]) => (Tile | null)[][];
  onAfterDrawTile?: (hand: Tile[], board: (Tile | null)[][]) => Tile[];
  onAfterPlaceTile?: (hand: Tile[], board: (Tile | null)[][]) => Tile[];
  onEveryOtherTurn?: (board: (Tile | null)[][]) => (Tile | null)[][];
  onAreaFormed?: (context: AreaContext) => (Tile | null)[][]; // New area-based behavior
  onTileNumberChanged?: (tile: Tile) => Tile; // New method for when tile numbers change
  
  // New gold-related methods
  onDiscardYellowTile?: (tile: Tile) => number; // Return gold amount to add
  onRoundEndGold?: (discards: number) => number; // Return gold amount to add for remaining discards
  onScoringGold?: (score: number, gold: number) => number; // Return modified score based on gold
  onLowGoldUpgrade?: (tile: Tile, gold: number) => Tile; // Upgrade tile if gold is low
  onSellRelict?: (hand: Tile[]) => Tile[]; // Upgrade hand when another relict is sold
}

export interface Relict {
  id: string;
  name: string;
  description: string;
  icon: string;
  behavior: RelictBehavior;
}

export interface RelictState {
  ownedRelicts: Relict[];
  availableRelicts: Relict[];
  relictSelectionPhase: boolean;
  availableSelection: Relict[];
}

export interface TilePlacementResult {
  tile: Tile;
  canPlace: boolean;
  board: (Tile | null)[][];
  effects?: RelictEffect[];
  copiedTiles?: Tile[]; // New field for copied tiles
}

export interface RoundEndResult {
  board: (Tile | null)[][];
  vanishedTiles?: Tile[];
}

export type RelictEffectType = 'doubling' | 'multiplying' | 'upgrading' | 'vanishing' | 'relict-trigger' | 'ghost-spawn' | 'scoring-twice' | 'discard-upgrade' | 'tile-copy' | 'number-prefix' | 'board-increment' | 'tile-stack' | 'auto-discard' | 'upgrade-field-spawn' | 'area-color-change' | 'area-upgrade' | 'digit-replace' | 'blue-trigger' | 'green-upgrade' | 'consume';

export interface RelictEffect {
  type: RelictEffectType;
  relictId?: string;
  multiplier?: number;
  position?: BoardPosition;
  area?: Tile[]; // Add area to effects
}

// Area rule types
export type AreaRule = 'color' | 'digit' | 'same-color';

// Area context for relict behaviors
export interface AreaContext {
  placedTile: Tile;
  area: Tile[];
  areaRule: AreaRule;
  board: (Tile | null)[][];
}