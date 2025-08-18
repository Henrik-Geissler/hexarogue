import React, { useCallback } from 'react';
import { BoardPosition, Tile as TileType } from '../../types/game';
import { HexSpot } from './HexSpot';
import { getHexPosition } from '../../utils/hexLayout';
import { canPlaceTile } from '../../utils/gameLogic';
import { RelictManager } from '../../utils/relictManager';
import { AnimatedTile } from './AnimatedTile';
import { AnimationState } from '../../types/animations';
import { cn } from '../../lib/utils';

interface GameBoardProps {
  board: (TileType | null)[][];
  draggedTile: TileType | null;
  hoveredPosition: BoardPosition | null;
  onPlaceTile: (tile: TileType, position: BoardPosition) => Promise<boolean>;
  onHoverPosition: (position: BoardPosition | null) => void;
  ownedRelicts: any[];
  animations: AnimationState[];
  isAnimating: boolean;
}

export function GameBoard({ 
  board, 
  draggedTile, 
  hoveredPosition,
  onPlaceTile,
  onHoverPosition,
  ownedRelicts,
  animations,
  isAnimating
}: GameBoardProps) {
  const isFirstTile = board.every(row => row.every(cell => cell === null || cell.isBlock || cell.isUpgradeField));

  const handleDrop = useCallback(async (e: React.DragEvent, position: BoardPosition) => {
    e.preventDefault();
    if (draggedTile && !isAnimating) {
      await onPlaceTile(draggedTile, position);
    }
    onHoverPosition(null);
  }, [draggedTile, onPlaceTile, onHoverPosition, isAnimating]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback((position: BoardPosition) => {
    if (!isAnimating) {
      onHoverPosition(position);
    }
  }, [onHoverPosition, isAnimating]);

  const handleDragLeave = useCallback(() => {
    // Small delay to prevent flickering when moving between hex spots
    setTimeout(() => onHoverPosition(null), 50);
  }, [onHoverPosition]);

  // Responsive hex sizing
  const HEX_SIZE = Math.min(35, Math.max(20, Math.min(window.innerWidth / 30, window.innerHeight / 20)));
  const hexWidth = HEX_SIZE * Math.sqrt(3);
  const hexHeight = HEX_SIZE * 1.5;
  const maxCols = 7;
  
  const boardWidth = Math.min(maxCols * hexWidth + 60, window.innerWidth - 40);
  const boardHeight = Math.min(board.length * hexHeight + 60, window.innerHeight * 0.6);

  return (
    <div className="bg-gradient-to-br from-green-800 to-green-900 p-4 sm:p-6 lg:p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto">
      <div 
        className="relative mx-auto" 
        style={{ 
          width: `${boardWidth}px`, 
          height: `${boardHeight}px`,
          minWidth: '280px',
          minHeight: '200px',
          maxWidth: '100%'
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((tile, colIndex) => {
            const position: BoardPosition = { row: rowIndex, col: colIndex };
            const { x, y } = getHexPosition(rowIndex, colIndex);
            
            // Create relict manager for this check
            const relictManager = new RelictManager(ownedRelicts);
            const canAccept = draggedTile ? 
              canPlaceTile(draggedTile, position, board, isFirstTile, relictManager) : false;
            const isHovered = hoveredPosition?.row === rowIndex && 
                             hoveredPosition?.col === colIndex;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="absolute"
                style={{
                  left: `${x + 50}px`,
                  top: `${y + 50}px`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <HexSpot
                  position={position}
                  tile={tile ? (
                    <AnimatedTile
                      tile={tile}
                      position={position}
                      animations={animations}
                      className="w-full h-full pointer-events-none" // Make placed tiles non-draggable
                    />
                  ) : null}
                  canAcceptTile={canAccept && !isAnimating}
                  isHovered={isHovered}
                  onDrop={(e) => handleDrop(e, position)}
                  onDragOver={handleDragOver}
                  onDragEnter={() => handleDragEnter(position)}
                  onDragLeave={handleDragLeave}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
