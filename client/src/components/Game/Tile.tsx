import React from 'react';
import { Tile as TileType } from '../../types/game';
import { cn } from '../../lib/utils';
import { getHexPath } from '../../utils/hexLayout';

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

const colorStyles = {
  red: { fill: '#ef4444', stroke: '#dc2626', text: 'white' },
  green: { fill: '#22c55e', stroke: '#16a34a', text: 'white' },
  blue: { fill: '#3b82f6', stroke: '#2563eb', text: 'white' },
  yellow: { fill: '#eab308', stroke: '#ca8a04', text: 'black' }
};

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
  const colors = colorStyles[tile.color];

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
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth="2"
            className={cn(
              "transition-all duration-200",
              isSelected && "stroke-white stroke-4"
            )}
          />
        </svg>
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center font-bold text-lg",
            colors.text === 'white' ? 'text-white' : 'text-black'
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
        `bg-[${colors.fill}] border-[${colors.stroke}]`,
        colors.text === 'white' ? 'text-white' : 'text-black',
        isDragging && "opacity-50 scale-95",
        !isPlayable && "opacity-70 cursor-not-allowed border-dashed",
        isSelected && "ring-2 ring-white ring-offset-2",
        "hover:scale-105 active:scale-95",
        className
      )}
      style={{
        backgroundColor: colors.fill,
        borderColor: colors.stroke,
        color: colors.text
      }}
    >
      {tile.number}
    </div>
  );
}
