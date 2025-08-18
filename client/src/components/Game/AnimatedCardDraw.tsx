import React, { useEffect, useState } from 'react';
import { Tile } from '../../types/game';

interface AnimatedCardDrawProps {
  tile: Tile;
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
  onComplete: () => void;
  delay: number;
  onGreenGrowth?: () => void;
}

export function AnimatedCardDraw({ 
  tile, 
  fromPosition, 
  toPosition, 
  onComplete, 
  delay,
  onGreenGrowth 
}: AnimatedCardDrawProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showGreenGrowth, setShowGreenGrowth] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
      
      // Check if this is a green tile that should trigger Green Growth
      if (tile.color === 'green' && !tile.number.toString().includes('1') && onGreenGrowth) {
        setTimeout(() => {
          setShowGreenGrowth(true);
          onGreenGrowth();
        }, 300); // Show Green Growth effect halfway through animation
      }
      
      setTimeout(() => {
        onComplete();
      }, 800); // Total animation duration
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, onComplete, tile, onGreenGrowth]);

  if (!isAnimating) return null;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: isAnimating ? toPosition.x : fromPosition.x,
        top: isAnimating ? toPosition.y : fromPosition.y,
        transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transform: isAnimating ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.8)',
      }}
    >
      <div className="relative">
        {/* Tile representation */}
        <div className="w-8 h-8 bg-blue-500 rounded border-2 border-blue-300 flex items-center justify-center text-white text-xs font-bold">
          {tile.number}
        </div>
        
        {/* Green Growth effect */}
        {showGreenGrowth && (
          <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold animate-pulse">
            1
          </div>
        )}
      </div>
    </div>
  );
}
