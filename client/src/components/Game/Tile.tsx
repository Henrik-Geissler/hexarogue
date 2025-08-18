import React from 'react';
import { Tile as TileType, TileColor } from '../../types/game';
import { cn } from '../../lib/utils';
import { getMixedColorStyle } from '../../utils/colorMixing';
import { formatTileNumber } from '../../utils/gameLogic';

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
  yellow: { fill: '#eab308', stroke: '#ca8a04', text: 'black' },
  orange: { fill: '#f97316', stroke: '#ea580c', text: 'white' },
  lime: { fill: '#84cc16', stroke: '#65a30d', text: 'black' },
  cyan: { fill: '#06b6d4', stroke: '#0891b2', text: 'white' },
  purple: { fill: '#a855f7', stroke: '#9333ea', text: 'white' },
  brown: { fill: '#a16207', stroke: '#854d0e', text: 'white' },
  white: { fill: '#ffffff', stroke: '#e5e7eb', text: 'black' }
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
  // Get the appropriate color styles
  let colors;
  if (tile.isBlock) {
    colors = blockStyles;
  } else if (tile.mixedColor) {
    colors = getMixedColorStyle(tile.color, tile.mixedColor);
  } else {
    colors = colorStyles[tile.color];
  }

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
          tile.isUpgradeField && "animate-upgrade-field",
          					tile.matchesColor('white') && "white-tile-rainbow",
          className
        )}
        style={{ 
          width: size * 2, 
          height: size * 2,
          '--animation-delay': Math.random() * 4
        } as React.CSSProperties}
      >
        <svg 
          width={size * 2} 
          height={size * 2} 
          viewBox={`-${size} -${size} ${size * 2} ${size * 2}`}
          className="absolute inset-0"
        >
          <defs>
            {tile.mixedColor && (
              <linearGradient id={`gradient-${tile.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colorStyles[tile.color].fill} />
                <stop offset="100%" stopColor={colorStyles[tile.mixedColor].fill} />
              </linearGradient>
            )}
          </defs>
          <path
            d={getHexPath(size)}
            fill={tile.isUpgradeField ? '#f3f4f6' : 
                  (tile.isGhost ? `${colors.fill}80` : 
                   (tile.mixedColor ? `url(#gradient-${tile.id})` : colors.fill))}
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
            "absolute inset-0 flex items-center justify-center font-bold",
            tile.isUpgradeField ? 'text-gray-700' : (colors.text === 'white' ? 'text-white' : 'text-black'),
            tile.isGhost && "opacity-80"
          )}
        >
          {tile.isUpgradeField ? '↑' : (() => {
            const formatted = formatTileNumber(tile.number);
            return (
              <span className={cn(formatted.fontSize, formatted.className)}>
                {formatted.text}
              </span>
            );
          })()}
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
        "w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 flex items-center justify-center cursor-pointer",
        "font-bold select-none transition-all duration-200",
        tile.isUpgradeField ? 'text-gray-700' : (colors.text === 'white' ? 'text-white' : 'text-black'),
        isDragging && "opacity-50 scale-95",
        !isPlayable && "opacity-70 cursor-not-allowed border-dashed",
        isSelected && "ring-2 ring-white ring-offset-2",
        "hover:scale-105 active:scale-95",
        tile.isGhost && "opacity-70",
        tile.isUpgradeField && "animate-upgrade-field",
        className
      )}
      style={{
        background: tile.isUpgradeField ? '#f3f4f6' : 
                   (tile.isGhost ? 'rgba(128, 128, 128, 0.7)' : 
                    (tile.mixedColor ? 
                     `linear-gradient(45deg, ${colorStyles[tile.color].fill}, ${colorStyles[tile.mixedColor].fill})` : 
                     colors.fill)),
        borderColor: tile.isUpgradeField ? '#d1d5db' : (tile.isGhost ? '#666' : colors.stroke),
        color: tile.isUpgradeField ? '#374151' : colors.text
      }}
    >
      {tile.isUpgradeField ? '↑' : (() => {
        const formatted = formatTileNumber(tile.number);
        return (
          <span className={cn(formatted.fontSize, formatted.className)}>
            {formatted.text}
          </span>
        );
      })()}
    </div>
  );
}
