export type TileColor = 'red' | 'green' | 'blue' | 'yellow';

export interface Tile {
  id: string;
  number: number;
  color: TileColor;
}

export interface BoardPosition {
  row: number;
  col: number;
}

export interface GameState {
  deck: Tile[];
  playerHand: Tile[];
  board: (Tile | null)[][];
  discardPile: Tile[];
  plays: number;
  discards: number;
  score: number;
  subplays: number;
  targetScore: number;
  round: number;
  gamePhase: 'ready' | 'playing' | 'won' | 'lost' | 'relict-selection';
  draggedTile: Tile | null;
  hoveredPosition: BoardPosition | null;
  // Relicts
  ownedRelicts: import('../types/relicts').Relict[];
  availableRelicts: import('../types/relicts').Relict[];
  relictSelectionOptions: import('../types/relicts').Relict[];
}

export interface GameStats {
  plays: number;
  discards: number;
  score: number;
  targetScore: number;
}
