import { Relict, RelictType } from '../types/relicts';
import { TileColor } from '../types/game';

// Create the initial pool of relicts
export function createInitialRelictPool(): Relict[] {
  const colors: TileColor[] = ['red', 'green', 'blue', 'yellow'];
  const relicts: Relict[] = [];

  // Create color multiplier relicts
  colors.forEach(color => {
    relicts.push({
      id: `${color}-multiplier`,
      name: `${color.charAt(0).toUpperCase() + color.slice(1)} Multiplier`,
      icon: '✦',
      description: `${color.charAt(0).toUpperCase() + color.slice(1)} cards count twice when scoring`,
      type: 'color-multiplier',
      color,
      multiplier: 2
    });
  });

  // Add board upgrade relict
  relicts.push({
    id: 'board-upgrade',
    name: 'Board Upgrade',
    icon: '⬆',
    description: 'At the end of each round, upgrade all tiles on the board',
    type: 'board-upgrade'
  });

  // Add first tile double relict
  relicts.push({
    id: 'first-tile-double',
    name: 'First Strike',
    icon: '⚡',
    description: 'Double the number of the first tile played each round',
    type: 'first-tile-double'
  });

  // Add green to red upgrade relict
  relicts.push({
    id: 'green-to-red-upgrade',
    name: 'Alchemy',
    icon: '🔄',
    description: 'When you place a green tile, upgrade it and turn it red',
    type: 'green-to-red-upgrade'
  });

  // Add identical tiles upgrade relict
  relicts.push({
    id: 'identical-tiles-upgrade',
    name: 'Twin Power',
    icon: '👥',
    description: 'At the end of each round, upgrade all pairs of identical tiles',
    type: 'identical-tiles-upgrade'
  });

  return relicts;
}

// Get 3 random relicts for selection (or fewer if pool is small)
export function getRelictSelection(availableRelicts: Relict[]): Relict[] {
  if (availableRelicts.length === 0) return [];
  if (availableRelicts.length <= 3) return [...availableRelicts];
  
  const shuffled = [...availableRelicts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

// Remove selected relict from available pool
export function selectRelict(availableRelicts: Relict[], selectedRelict: Relict): Relict[] {
  return availableRelicts.filter(relict => relict.id !== selectedRelict.id);
}

// Upgrade a tile number by incrementing first digit
export function upgradeTile(number: number): number {
  const str = number.toString();
  const firstDigit = parseInt(str[0]);
  const upgraded = (firstDigit + 1).toString() + str.slice(1);
  return parseInt(upgraded);
}

// Calculate score multiplier based on owned relicts
export function calculateScoreWithRelicts(
  baseScore: number, 
  tileColor: TileColor, 
  ownedRelicts: Relict[]
): number {
  const colorMultiplier = ownedRelicts.find(
    relict => relict.type === 'color-multiplier' && relict.color === tileColor
  );
  
  return colorMultiplier ? baseScore * (colorMultiplier.multiplier || 1) : baseScore;
}

// Apply first tile double effect
export function applyFirstTileDouble(tile: any, ownedRelicts: Relict[], isFirstTile: boolean): any {
  if (!isFirstTile) return tile;
  
  const hasFirstTileDouble = ownedRelicts.some(r => r.type === 'first-tile-double');
  if (!hasFirstTileDouble) return tile;
  
  return {
    ...tile,
    number: tile.number * 2
  };
}

// Apply green to red conversion
export function applyGreenToRedUpgrade(tile: any, ownedRelicts: Relict[]): any {
  const hasGreenToRed = ownedRelicts.some(r => r.type === 'green-to-red-upgrade');
  if (!hasGreenToRed || tile.color !== 'green') return tile;
  
  return {
    ...tile,
    color: 'red',
    number: upgradeTile(tile.number)
  };
}

// Apply board upgrade at end of round
export function applyBoardUpgrade(board: any[][], ownedRelicts: Relict[]): any[][] {
  const hasBoardUpgrade = ownedRelicts.some(r => r.type === 'board-upgrade');
  if (!hasBoardUpgrade) return board;
  
  return board.map(row => 
    row.map(tile => 
      tile ? { ...tile, number: upgradeTile(tile.number) } : null
    )
  );
}

// Apply identical tiles upgrade at end of round
export function applyIdenticalTilesUpgrade(board: any[][], ownedRelicts: Relict[]): any[][] {
  const hasIdenticalUpgrade = ownedRelicts.some(r => r.type === 'identical-tiles-upgrade');
  if (!hasIdenticalUpgrade) return board;
  
  // Find all tiles on board
  const tiles: any[] = [];
  board.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      if (tile) {
        tiles.push({ ...tile, row: rowIndex, col: colIndex });
      }
    });
  });
  
  // Find identical pairs
  const upgradedPositions = new Set<string>();
  const newBoard = board.map(row => [...row]);
  
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      const tile1 = tiles[i];
      const tile2 = tiles[j];
      
      if (tile1.number === tile2.number && tile1.color === tile2.color) {
        const pos1 = `${tile1.row}-${tile1.col}`;
        const pos2 = `${tile2.row}-${tile2.col}`;
        
        if (!upgradedPositions.has(pos1)) {
          newBoard[tile1.row][tile1.col] = { 
            ...tile1, 
            number: upgradeTile(tile1.number) 
          };
          upgradedPositions.add(pos1);
        }
        
        if (!upgradedPositions.has(pos2)) {
          newBoard[tile2.row][tile2.col] = { 
            ...tile2, 
            number: upgradeTile(tile2.number) 
          };
          upgradedPositions.add(pos2);
        }
      }
    }
  }
  
  return newBoard;
}