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
  onBeforeTilePlacement?: (context: TilePlacementContext) => { 
    tile: Tile; 
    canPlace: boolean; 
  };
  
  // Called when calculating score for a tile
  onTileScores?: (context: ScoringContext) => number;
  
  // Called after a tile is placed, can modify the board
  onAfterTilePlacement?: (context: TilePlacementContext & { board: (Tile | null)[][] }) => (Tile | null)[][];
  
  // Called at the end of a round, can modify the board
  onRoundEnd?: (context: RoundEndContext) => { 
    board: (Tile | null)[][]; 
    vanishedTiles?: Tile[]; 
  };
  
  // Called when checking if a tile can be placed
  onCanPlaceTile?: (tile: Tile, position: BoardPosition, board: (Tile | null)[][], isFirstTile: boolean) => boolean;
  
  // Called when calculating retrigger count
  onGetRetriggerCount?: (position: BoardPosition, board: (Tile | null)[][]) => number;
}

export interface Relict {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: RelictType;
  color?: 'red' | 'green' | 'blue' | 'yellow';
  multiplier?: number;
  behavior: RelictBehavior;
}

export interface RelictState {
  ownedRelicts: Relict[];
  availableRelicts: Relict[];
  relictSelectionPhase: boolean;
  availableSelection: Relict[];
}