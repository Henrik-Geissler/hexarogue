import { TileColor } from '../types/game';

// Color mixing lookup table - all possible combinations of two colors
export const COLOR_MIXING: Record<string, TileColor> = {
  // Red combinations
  'red+green': 'brown',
  'red+blue': 'purple',
  'red+yellow': 'orange',
  'red+brown': 'brown',
  'red+white': 'red',
  'red+lime': 'brown', 
  'red+cyan': 'brown', 
  'red+orange': 'orange', 
  'red+purple': 'purple', 
  
  // Green combinations
  'green+blue': 'cyan',
  'green+yellow': 'lime',
  'green+orange': 'brown',  
  'green+lime': 'lime',  
  'green+cyan': 'cyan',
  'green+purple': 'brown',
  'green+brown': 'brown',
  'green+white': 'green',
  
  // Blue combinations
  'blue+yellow': 'brown',
  'blue+orange': 'brown',
  'blue+lime': 'brown',
  'blue+cyan': 'cyan',
  'blue+purple': 'purple',
  'blue+brown': 'brown',
  'blue+white': 'blue',
  
  // Yellow combinations
  'yellow+orange': 'orange',
  'yellow+lime': 'lime',
  'yellow+cyan': 'brown',
  'yellow+purple': 'brown',
  'yellow+brown': 'brown',
  'yellow+white': 'yellow',
  
  // Orange combinations
  'orange+lime': 'brown',
  'orange+cyan': 'brown',
  'orange+purple': 'brown',
  'orange+brown': 'brown',
  'orange+white': 'orange',
  
  // Lime combinations
  'lime+cyan': 'brown',
  'lime+purple': 'brown',
  'lime+brown': 'brown',
  'lime+white': 'lime',
  
  // Cyan combinations
  'cyan+purple': 'brown',
  'cyan+brown': 'brown',
  'cyan+white': 'cyan',
  
  // Purple combinations
  'purple+brown': 'brown',
  'purple+white': 'purple',
  
  // Brown combinations
  'brown+white': 'brown',
};

// Helper function to mix two colors
export function mixColors(color1: TileColor, color2: TileColor): TileColor {
  // Sort colors alphabetically to ensure consistent lookup
  const sortedColors = [color1, color2].sort();
  const key = `${sortedColors[0]}+${sortedColors[1]}`;
  
  return COLOR_MIXING[key] || color1; // Default to first color if no mix found
}

// Helper function to get the mixed color style
export function getMixedColorStyle(baseColor: TileColor, mixedColor: TileColor) {
  const baseStyles = {
    red: { fill: '#ef4444', stroke: '#dc2626', text: 'white' },
    green: { fill: '#22c55e', stroke: '#16a34a', text: 'white' },
    blue: { fill: '#3b82f6', stroke: '#2563eb', text: 'white' },
    yellow: { fill: '#eab308', stroke: '#ca8a04', text: 'black' },
    orange: { fill: '#f97316', stroke: '#ea580c', text: 'white' },
    lime: { fill: '#84cc16', stroke: '#65a30d', text: 'black' },
    cyan: { fill: '#06b6d4', stroke: '#0891b2', text: 'white' },
    purple: { fill: '#a855f7', stroke: '#9333ea', text: 'white' },
    brown: { fill: '#a16207', stroke: '#854d0e', text: 'white' },
    white: { fill: '#ffffff', stroke: '#e5e7eb', text: 'black' }
  };
  
  // Create a gradient effect between the two colors
  return {
    fill: `linear-gradient(45deg, ${baseStyles[baseColor].fill}, ${baseStyles[mixedColor].fill})`,
    stroke: baseStyles[mixedColor].stroke,
    text: baseStyles[mixedColor].text
  };
}
