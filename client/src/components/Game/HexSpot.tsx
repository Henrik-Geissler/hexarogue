import React from 'react';
import { BoardPosition, Tile as TileType } from '../../types/game';
import { getHexPath } from '../../utils/hexLayout';
import { Tile } from './Tile';
import { cn } from '../../lib/utils';

interface HexSpotProps {
  position: BoardPosition;
  tile: TileType | React.ReactElement | null;
  canAcceptTile: boolean;
  isHovered: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: () => void;
  onDragLeave: () => void;
}

export function HexSpot({ 
  position, 
  tile, 
  canAcceptTile, 
  isHovered,
  onDrop,
  onDragOver,
  onDragEnter,
  onDragLeave
}: HexSpotProps) {
  const hexSize = 30; // Slightly smaller to fit better
  const containerSize = hexSize * 2;

  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ width: containerSize, height: containerSize }}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
    >
      {tile ? (
        // Show tile (either React element or Tile component)
        React.isValidElement(tile) ? (
          tile
        ) : (
          <Tile 
            tile={tile as TileType} 
            isHexagonal={true}
            size={hexSize}
            className="absolute inset-0"
          />
        )
      ) : (
        // Show empty hexagon spot when vacant
        <svg 
          width={containerSize} 
          height={containerSize} 
          viewBox={`-${hexSize} -${hexSize} ${containerSize} ${containerSize}`}
          className="absolute inset-0"
        >
          <path
            d={getHexPath(hexSize)}
            className={cn(
              "transition-all duration-200",
              canAcceptTile && isHovered
                ? "fill-green-100 stroke-green-400"
                : canAcceptTile
                  ? "fill-blue-50 stroke-blue-300"
                  : "fill-gray-50 stroke-gray-300"
            )}
            strokeWidth="2"
          />
        </svg>
      )}
    </div>
  );
}
