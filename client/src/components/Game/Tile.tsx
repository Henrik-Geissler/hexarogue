import React from 'react';
import { Tile as TileType, TileColor } from '../../types/game';
import { cn } from '../../lib/utils';

interface TileProps {
  tile: TileType;
  isDragging?: boolean;
  isPlayable?: boolean;
  isSelected?: boolean;
  isHexagonal?: boolean;
  size?: number;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  className?: string;
}

const colorStyles: Record<TileColor, { fill: string; stroke: string; text: string }> = {
  red: { fill: '#ef4444', stroke: '#dc2626', text: 'white' },
  green: { fill: '#22c55e', stroke: '#16a34a', text: 'white' },
  blue: { fill: '#3b82f6', stroke: '#2563eb', text: 'white' },
  yellow: { fill: '#eab308', stroke: '#ca8a04', text: 'black' }
};

const blockStyles = { fill: '#374151', stroke: '#1f2937', text: 'white' };

function getHexPath(size: number): string {
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

export function Tile({ 
  tile, 
  isDragging, 
  isPlayable = true,
  isSelected,
  isHexagonal = false,
  size = 30,
  onClick,
  onDragStart,
  onDragEnd,
  className 
}: TileProps) {
  const colors = tile.isBlock ? blockStyles : colorStyles[tile.color];

  // Don't render blocks at all - they should be invisible
  if (tile.isBlock) {
    return null;
  }

  if (isHexagonal) {
    return (
      <div 
        draggable
        onClick={onClick}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className={cn(
          "relative cursor-pointer select-none transition-all duration-200",
          isDragging && "opacity-50 scale-95",
          !isPlayable && "opacity-70 cursor-not-allowed border-dashed",
          "hover:scale-105 active:scale-95",
          tile.isUpgradeField && "animate-slow-pulse",
          className
        )}
        style={{ width: size * 2, height: size * 2 }}
      >
        <svg 
          width={size * 2} 
          height={size * 2} 
          viewBox={`-${size} -${size} ${size * 2} ${size * 2}`}
          className="absolute inset-0"
        >
          <path
            d={getHexPath(size)}
            fill={tile.isUpgradeField ? '#f3f4f6' : (tile.isGhost ? `${colors.fill}80` : colors.fill)}
            stroke={tile.isUpgradeField ? '#d1d5db' : (tile.isGhost ? `${colors.stroke}80` : colors.stroke)}
            strokeWidth="2"
            className={cn(
              "transition-all duration-200",
              isSelected && "stroke-white stroke-4",
              tile.isGhost && "opacity-70"
            )}
          />
          {tile.isGhost && (
            <path
              d={getHexPath(size * 0.8)}
              fill="none"
              stroke="#fff"
              strokeWidth="1"
              strokeDasharray="2,2"
              className="opacity-50"
            />
          )}
        </svg>
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center font-bold text-lg",
            tile.isUpgradeField ? 'text-gray-700' : (colors.text === 'white' ? 'text-white' : 'text-black'),
            tile.isGhost && "opacity-80"
          )}
        >
          {tile.number}
        </div>
      </div>
    );
  }

  return (
    <div
      draggable
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "w-12 h-12 rounded-lg border-2 flex items-center justify-center cursor-pointer",
        "font-bold text-lg select-none transition-all duration-200",
        `bg-[${tile.isUpgradeField ? '#f3f4f6' : colors.fill}] border-[${tile.isUpgradeField ? '#d1d5db' : colors.stroke}]`,
        tile.isUpgradeField ? 'text-gray-700' : (colors.text === 'white' ? 'text-white' : 'text-black'),
        isDragging && "opacity-50 scale-95",
        !isPlayable && "opacity-70 cursor-not-allowed border-dashed",
        isSelected && "ring-2 ring-white ring-offset-2",
        "hover:scale-105 active:scale-95",
        tile.isGhost && "opacity-70",
        tile.isUpgradeField && "animate-slow-pulse",
        className
      )}
      style={{
        backgroundColor: tile.isUpgradeField ? '#f3f4f6' : (tile.isGhost ? 'rgba(128, 128, 128, 0.7)' : colors.fill),
        borderColor: tile.isUpgradeField ? '#d1d5db' : (tile.isGhost ? '#666' : colors.stroke),
        color: tile.isUpgradeField ? '#374151' : colors.text
      }}
    >
      {tile.isUpgradeField ? '⬆' : tile.number}
    </div>
  );
}
