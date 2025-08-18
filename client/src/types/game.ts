import { AnimationState } from './animations';

export type TileColor = 'red' | 'green' | 'blue' | 'yellow';

export interface Tile {
  id: string;
  number: number;
  color: TileColor;
  isGhost?: boolean;
  isUpgradeField?: boolean; // New field for upgrade fields
}

export interface BoardPosition {
  row: number;
  col: number;
}

export type GamePhase = 'ready' | 'playing' | 'relict-selection' | 'won' | 'lost';

export interface GameState {
  deck: Tile[];
  playerHand: Tile[];
  board: (Tile | null)[][];
  discardPile: Tile[];
  discards: number;
  score: number;
  targetScore: number;
  round: number;
  gamePhase: 'ready' | 'playing' | 'won' | 'lost' | 'relict-selection';
  draggedTile: Tile | null;
  hoveredPosition: BoardPosition | null;
  ownedRelicts: any[];
  availableRelicts: any[];
  relictSelectionOptions: any[];
  animations: any[];
  isAnimating: boolean;
  animatingRelicts: string[];
  drawingAnimations: Array<{
    id: string;
    tile: Tile;
    fromPosition: { x: number; y: number };
    toPosition: { x: number; y: number };
    delay: number;
  }>;
  turnCount: number; // Add turn counter
}

export interface GameStats {
  discards: number;
  score: number;
  targetScore: number;
}
