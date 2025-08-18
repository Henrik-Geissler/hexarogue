import { BoardPosition } from '../types/game';

export const HEX_SIZE = 30;
export const HEX_WIDTH = HEX_SIZE * 2;
export const HEX_HEIGHT = HEX_SIZE * Math.sqrt(3);

// Simple honeycomb positioning - standard hexagonal grid
export function getHexPosition(row: number, col: number): { x: number, y: number } {
  // Standard flat-top hexagon grid spacing
  const hexWidth = HEX_SIZE * Math.sqrt(3); // Width between hex centers
  const hexHeight = HEX_SIZE * 1.5;         // Height between hex centers
  
  // Basic hexagon grid positioning
  const x = col * hexWidth + (row % 2) * (hexWidth / 2);
  const y = row * hexHeight;
  
  return { x, y };
}

// Generate SVG path for hexagon (rotated 30 degrees for flat-top orientation)
export function getHexPath(size: number = HEX_SIZE): string {
  const points: string[] = [];
  
  for (let i = 0; i < 6; i++) {
    // Add 30 degrees (π/6) to rotate the hexagon for flat-top orientation
    const angle = (i * Math.PI) / 3 + Math.PI / 6;
    const x = size * Math.cos(angle);
    const y = size * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  
  return `M ${points.join(' L ')} Z`;
}

// Check if point is inside hexagon (for click detection)
export function pointInHex(x: number, y: number, hexX: number, hexY: number, size: number = HEX_SIZE): boolean {
  const dx = Math.abs(x - hexX);
  const dy = Math.abs(y - hexY);
  
  const a = 0.25 * Math.sqrt(3.0) * size;
  const b = 0.5 * size;
  
  return (dx <= a + b * Math.max((b - dy) / b, 0.0));
}
