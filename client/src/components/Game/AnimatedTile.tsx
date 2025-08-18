import React, { useEffect, useState } from 'react';
import { Tile } from '../../types/game';
import { AnimationState } from '../../types/animations';
import { Tile as TileComponent } from './Tile';

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

  return (
    <div className={`relative ${className}`}>
      <TileComponent
        tile={tile}
        isHexagonal={true}
        size={30}
        className={`${isPlacing ? 'animate-bounce' : ''} transition-all duration-300`}
      />
      
      {effectText && (
        <div className={`
          absolute inset-0 flex items-center justify-center
          text-2xl font-bold animate-pulse pointer-events-none
          ${effectColor}
        `}>
          {effectText}
        </div>
      )}
    </div>
  );
}
