import { AnimationState } from './animations';

export type TileColor = 'red' | 'green' | 'blue' | 'yellow' | 'orange' | 'lime' | 'cyan' | 'purple' | 'brown' | 'white';

export interface Tile {
  id: string;
  number: number;
  color: TileColor;
  isGhost?: boolean;
  isUpgradeField?: boolean;
  isBlock?: boolean;
  mixedColor?: TileColor; // For tiles that have consumed other tiles
  consumedTiles?: Tile[]; // Track consumed tiles for scoring
  
  // Color matching method - checks current color (including mixed colors)
  matchesColor(targetColor: TileColor): boolean;
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
  gold: number; // Add gold currency
}

export interface GameStats {
  discards: number;
  score: number;
  targetScore: number;
}
