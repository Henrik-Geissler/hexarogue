import { Tile, TileColor, BoardPosition, GameState } from '../types/game';

// Create initial deck of 36 tiles (1-9 in 4 colors)
export function createInitialDeck(): Tile[] {
  const colors: TileColor[] = ['red', 'green', 'blue', 'yellow'];
  const deck: Tile[] = [];
  
  for (const color of colors) {
    for (let number = 1; number <= 9; number++) {
      deck.push({
        id: `${color}-${number}-${Math.random()}`,
        number,
        color
      });
    }
  }
  
  return shuffleDeck(deck);
}

// Shuffle deck using Fisher-Yates algorithm
export function shuffleDeck(deck: Tile[]): Tile[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Check if two numbers share at least one digit
export function numbersShareDigit(num1: number, num2: number): boolean {
  const digits1 = num1.toString().split('');
  const digits2 = num2.toString().split('');
  
  return digits1.some(digit => digits2.includes(digit));
}

// Check if a tile can be placed at a specific position
export function canPlaceTile(
  tile: Tile,
  position: BoardPosition,
  board: (Tile | null)[][],
  isFirstTile: boolean
): boolean {
  const { row, col } = position;
  
  // Check if position is within bounds and empty
  if (row < 0 || row >= board.length || col < 0 || col >= board[row].length) {
    return false;
  }
  
  if (board[row][col] !== null) {
    return false;
  }
  
  // First tile can be placed anywhere
  if (isFirstTile) {
    return true;
  }
  
  // Check if position has at least one neighboring tile
  const neighbors = getNeighbors(position, board);
  const neighborTiles = neighbors.filter(neighbor => neighbor !== null);
  
  if (neighborTiles.length === 0) {
    return false;
  }
  
  // Check if all neighboring tiles either match color or share digits
  return neighborTiles.every(neighbor => {
    return neighbor!.color === tile.color || numbersShareDigit(neighbor!.number, tile.number);
  });
}

// Simple hexagon neighbor detection for honeycomb board
export function getNeighbors(position: BoardPosition, board: (Tile | null)[][]): (Tile | null)[] {
  const { row, col } = position;
  const neighbors: (Tile | null)[] = [];
  
  // Standard hexagon neighbors for flat-top orientation
  // Even rows and odd rows have different neighbor patterns
  const isEvenRow = row % 2 === 0;
  
  const neighborOffsets = isEvenRow 
    ? [
        [0, -1], [0, 1],     // left, right
        [-1, -1], [-1, 0],   // upper-left, upper-right
        [1, -1], [1, 0]      // lower-left, lower-right
      ]
    : [
        [0, -1], [0, 1],     // left, right  
        [-1, 0], [-1, 1],    // upper-left, upper-right
        [1, 0], [1, 1]       // lower-left, lower-right
      ];
  
  for (const [rowOffset, colOffset] of neighborOffsets) {
    const neighborRow = row + rowOffset;
    const neighborCol = col + colOffset;
    
    // Check if neighbor is within board bounds
    if (neighborRow >= 0 && neighborRow < board.length &&
        neighborCol >= 0 && neighborCol < board[neighborRow].length) {
      neighbors.push(board[neighborRow][neighborCol]);
    }
  }
  
  return neighbors;
}

// Check if there are any playable cards in hand
export function hasPlayableCards(hand: Tile[], board: (Tile | null)[][]): boolean {
  const isFirstTile = board.every(row => row.every(cell => cell === null));
  
  return hand.some(tile => {
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (canPlaceTile(tile, { row, col }, board, isFirstTile)) {
          return true;
        }
      }
    }
    return false;
  });
}

// Calculate score by summing all tiles on board with relict effects
export function calculateBoardScore(board: (Tile | null)[][], ownedRelicts: any[] = []): number {
  let total = 0;
  for (const row of board) {
    for (const tile of row) {
      if (tile) {
        // Apply color multiplier relicts
        const colorMultiplier = ownedRelicts.find(
          relict => relict.type === 'color-multiplier' && relict.color === tile.color
        );
        const multiplier = colorMultiplier ? (colorMultiplier.multiplier || 1) : 1;
        total += tile.number * multiplier;
      }
    }
  }
  return total;
}

// Initialize a new round  
export function initializeNewRound(currentRound: number, allTiles: Tile[]): Partial<GameState> {
  // No automatic tile upgrades anymore - relicts handle upgrades
  const shuffledDeck = shuffleDeck(allTiles);
  const playerHand = shuffledDeck.splice(0, 7);
  
  return {
    deck: shuffledDeck,
    playerHand,
    board: createEmptyBoard(),
    discardPile: [],
    discards: 4,
    score: 0,
    targetScore: 30 + currentRound * (currentRound+5) , // Double each round starting from 10
    gamePhase: 'playing'
  };
}

// Create empty hexagonal board in proper honeycomb pattern (like Settlers of Catan)
export function createEmptyBoard(): (Tile | null)[][] {
  const board: (Tile | null)[][] = [];
  // Classic hex board: 3-4-5-4-3 pattern (19 hexes total)
  const rowSizes = [6, 5, 6, 5, 6];
  
  for (let i = 0; i < rowSizes.length; i++) {
    board.push(new Array(rowSizes[i]).fill(null));
  }
  
  return board;
}

// Get deck statistics
export function getDeckStats(deck: Tile[]) {
  const colorCounts = { red: 0, green: 0, blue: 0, yellow: 0 };
  const numberCounts: Record<number, number> = {};
  
  deck.forEach(tile => {
    colorCounts[tile.color]++;
    numberCounts[tile.number] = (numberCounts[tile.number] || 0) + 1;
  });
  
  return { colorCounts, numberCounts, total: deck.length };
}
