import { AnimationState } from './animations';

export type TileColor = 'red' | 'green' | 'blue' | 'yellow';

export interface Tile {
  id: string;
  number: number;
  color: TileColor;
  isGhost?: boolean;
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
  gamePhase: GamePhase;
  draggedTile: Tile | null;
  hoveredPosition: BoardPosition | null;
  ownedRelicts: any[];
  availableRelicts: any[];
  relictSelectionOptions: any[];
  animations: AnimationState[];
  isAnimating: boolean;
  animatingRelicts: string[];
}

export interface GameStats {
  discards: number;
  score: number;
  targetScore: number;
}
