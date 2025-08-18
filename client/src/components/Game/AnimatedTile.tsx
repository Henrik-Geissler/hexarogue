import React, { useEffect, useState } from 'react';
import { Tile } from '../../types/game';
import { AnimationState } from '../../types/animations';

interface AnimatedTileProps {
  tile: Tile;
  position: { row: number; col: number };
  animations: AnimationState[];
  className?: string;
}

export function AnimatedTile({ tile, position, animations, className = '' }: AnimatedTileProps) {
  const [effectText, setEffectText] = useState<string>('');
  const [effectColor, setEffectColor] = useState<string>('');
  const [isPlacing, setIsPlacing] = useState(false);

  // Find active animations for this position
  const positionAnimations = animations.filter(
    anim => anim.position.row === position.row && anim.position.col === position.col && anim.isActive
  );

  useEffect(() => {
    if (positionAnimations.length === 0) {
      setEffectText('');
      setIsPlacing(false);
      return;
    }

    const animation = positionAnimations[0];

    switch (animation.type) {
      case 'placing-starts':
        setIsPlacing(true);
        setEffectText('⬇');
        setEffectColor('text-blue-400');
        setTimeout(() => {
          setIsPlacing(false);
          setEffectText('');
        }, 500);
        break;

      case 'relict-trigger':
        setEffectText(animation.relictId || '✨');
        setEffectColor('text-orange-400');
        setTimeout(() => {
          setEffectText('');
        }, 700);
        break;

      case 'score-popup':
        setEffectText(`+${animation.scoreValue || tile.number}`);
        setEffectColor('text-green-400');
        setTimeout(() => {
          setEffectText('');
        }, 1000);
        break;

      case 'placing-done':
        setEffectText('✓');
        setEffectColor('text-green-400');
        setTimeout(() => {
          setEffectText('');
        }, 300);
        break;
    }
  }, [positionAnimations, tile.number]);

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-500';
      case 'green': return 'bg-green-500';
      case 'blue': return 'bg-blue-500';
      case 'yellow': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`
        w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg
        ${getColorClass(tile.color)}
        ${isPlacing ? 'animate-bounce' : ''}
        transition-all duration-300
      `}>
        {tile.number}
      </div>
      
      {effectText && (
        <div className={`
          absolute inset-0 flex items-center justify-center
          text-2xl font-bold animate-pulse
          ${effectColor}
        `}>
          {effectText}
        </div>
      )}
    </div>
  );
}
