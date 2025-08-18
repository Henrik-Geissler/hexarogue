import { Tile, TileColor, BoardPosition, GameState } from '../types/game';
import { RelictManager } from './relictManager';
import { TilePlacementContext } from '../types/relicts';

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

// Get neighbors for a position
export function getNeighbors(position: BoardPosition, board: (Tile | null)[][]): (Tile | null)[] {
  const { row, col } = position;
  const neighbors: (Tile | null)[] = [];
  
  // Standard hexagon neighbors for flat-top orientation
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

// Check if a tile can be placed at a specific position (basic logic only)
export function canPlaceTileBasic(
  tile: Tile,
  position: BoardPosition,
  board: (Tile | null)[][],
  isFirstTile: boolean
): boolean {
  const { row, col } = position;
  
  // Check if position is within bounds and empty or is an upgrade field
  if (row < 0 || row >= board.length || col < 0 || col >= board[row].length) {
    return false;
  }
  
  const targetTile = board[row][col];
  if (targetTile !== null && !targetTile.isUpgradeField) {
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

// Check if a tile can be placed (with relict manager)
export function canPlaceTile(
  tile: Tile,
  position: BoardPosition,
  board: (Tile | null)[][],
  isFirstTile: boolean,
  relictManager?: RelictManager
): boolean {
  // Check if position is within bounds
  if (position.row < 0 || position.row >= board.length || 
      position.col < 0 || position.col >= board[0].length) {
    return false;
  }

  // Check if position is already occupied (excluding upgrade fields and blocks)
  const targetTile = board[position.row][position.col];
  if (targetTile !== null && !targetTile.isUpgradeField) {
    return false;
  }

  // First tile can be placed anywhere (check if board is empty of actual tiles, not blocks or upgrade fields)
  if (isFirstTile) {
    return true;
  }

  // Get neighboring tiles (excluding blocks and upgrade fields)
  const neighbors = getNeighbors(position, board);
  const validNeighbors = neighbors.filter(n => n !== null && !n.isBlock && !n.isUpgradeField);

  // Must have at least one neighbor
  if (validNeighbors.length === 0) {
    return false;
  }

  // Check if all neighboring tiles either match color or share digits
  return validNeighbors.every(neighbor => {
    return neighbor!.color === tile.color || numbersShareDigit(neighbor!.number, tile.number);
  });
}

// Check if there are any playable cards in hand
export function hasPlayableCards(hand: Tile[], board: (Tile | null)[][], relictManager: RelictManager): boolean {
  return hand.some(tile => {
    // Check if this tile can be placed anywhere on the board
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const position = { row, col };
        // Check if position is occupied (excluding upgrade fields and blocks)
        const targetTile = board[row][col];
        if (targetTile !== null && !targetTile.isUpgradeField) {
          continue; // Skip occupied positions
        }
        
        // Check if tile can be placed at this position
        if (canPlaceTile(tile, position, board, false, relictManager)) {
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

export function createBlock(): Tile {
  return {
    id: `block-${Date.now()}-${Math.random()}`,
    color: 'red', // Blocks can have any color, but they're not functional tiles
    number: 0,
    isBlock: true
  };
}

export function placeRandomBlocks(board: (Tile | null)[][]): (Tile | null)[][] {
  // Pick a random number between 2 and 5
  const blockCount = Math.floor(Math.random() * 4) + 2; // 2 to 5 blocks
  
  // Get all free positions on the board
  const freePositions: { row: number; col: number }[] = [];
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === null) {
        freePositions.push({ row, col });
      }
    }
  }
  
  // Shuffle free positions and take the first blockCount positions
  const shuffledPositions = [...freePositions].sort(() => Math.random() - 0.5);
  const selectedPositions = shuffledPositions.slice(0, Math.min(blockCount, freePositions.length));
  
  // Create new board with blocks placed
  const newBoard = board.map(row => [...row]);
  selectedPositions.forEach(pos => {
    newBoard[pos.row][pos.col] = createBlock();
  });
  
  return newBoard;
}

// Initialize a new round  
export function initializeNewRound(currentRound: number, allTiles: Tile[], currentGold: number = 0): Partial<GameState> {
  const shuffledDeck = shuffleDeck(allTiles);
  
  // Create empty board and place random blocks
  const emptyBoard = createEmptyBoard();
  const boardWithBlocks = placeRandomBlocks(emptyBoard);
  
  // Draw initial hand (7 cards) for first round only
  let playerHand: Tile[] = [];
  if (currentRound === 1) {
    const cardsToDraw = Math.min(7, shuffledDeck.length);
    playerHand = shuffledDeck.slice(0, cardsToDraw);
    shuffledDeck.splice(0, cardsToDraw);
  }
  
  return {
    deck: shuffledDeck,
    playerHand,
    board: boardWithBlocks,
    discardPile: [],
    discards: 4,
    score: 0,
    targetScore: 30 + currentRound * (currentRound+5),
    gamePhase: 'playing',
    turnCount: 0, // Reset turn counter for new round
    gold: currentGold // Keep the current gold amount
  };
}

// Create empty hexagonal board in proper honeycomb pattern
export function createEmptyBoard(): (Tile | null)[][] {
  const board: (Tile | null)[][] = [];
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

// Area detection functions
export function findArea(
  startPosition: BoardPosition,
  board: (Tile | null)[][],
  areaRule: 'color' | 'digit' | 'same-color',
  placedTile: Tile
): Tile[] {
  const visited = new Set<string>();
  const area: Tile[] = [];
  
  function dfs(position: BoardPosition) {
    const key = `${position.row},${position.col}`;
    if (visited.has(key)) return;
    
    visited.add(key);
    const tile = board[position.row]?.[position.col];
    if (!tile || tile.isUpgradeField || tile.isBlock) return; // Exclude blocks and upgrade fields
    
    // Check if tile belongs to the area based on rule
    let belongsToArea = false;
    switch (areaRule) {
      case 'color':
        belongsToArea = tile.color === placedTile.color;
        break;
      case 'digit':
        belongsToArea = numbersShareDigit(tile.number, placedTile.number);
        break;
      case 'same-color':
        belongsToArea = tile.color === placedTile.color;
        break;
    }
    
    if (!belongsToArea) return;
    
    area.push(tile);
    
    // Get neighbors and continue DFS
    const neighbors = getNeighbors(position, board);
    for (let i = 0; i < neighbors.length; i++) {
      if (neighbors[i]) {
        const neighborPos = getNeighborPosition(position, i);
        if (neighborPos) {
          dfs(neighborPos);
        }
      }
    }
  }
  
  dfs(startPosition);
  return area;
}

// Helper function to get neighbor position by index
function getNeighborPosition(position: BoardPosition, neighborIndex: number): BoardPosition | null {
  const { row, col } = position;
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
  
  const [rowOffset, colOffset] = neighborOffsets[neighborIndex];
  return { row: row + rowOffset, col: col + colOffset };
}

// Helper function to find blue neighbors
export function findBlueNeighbors(position: BoardPosition, board: (Tile | null)[][]): BoardPosition[] {
  const { row, col } = position;
  const blueNeighbors: BoardPosition[] = [];
  
  // Define the 6 hexagonal directions (flat-top orientation)
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],  // Top row
    [0, -1], [0, 1],              // Middle row
    [1, -1], [1, 0], [1, 1]       // Bottom row
  ];
  
  directions.forEach(([dRow, dCol]) => {
    const newRow = row + dRow;
    const newCol = col + dCol;
    
    if (newRow >= 0 && newRow < board.length && 
        newCol >= 0 && newCol < board[newRow].length) {
      const tile = board[newRow][newCol];
      if (tile && tile.color === 'blue' && !tile.isBlock) {
        blueNeighbors.push({ row: newRow, col: newCol });
      }
    }
  });
  
  return blueNeighbors;
}
