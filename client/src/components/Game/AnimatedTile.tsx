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
  const [isVanishing, setIsVanishing] = useState(false);
  const [isPlaced, setIsPlaced] = useState(false);

  // Find active animations for this position
  const positionAnimations = animations.filter(
    anim => anim.position.row === position.row && anim.position.col === position.col && anim.isActive
  );

  useEffect(() => {
    if (positionAnimations.length === 0) {
      setEffectText('');
      setIsPlacing(false);
      setIsVanishing(false);
      return;
    }

    const animation = positionAnimations[0];

    switch (animation.type) {
      case 'placing-starts':
        setIsPlacing(true);
        setIsPlaced(false);
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
        setIsPlaced(true);
        setEffectText('');
        setTimeout(() => {
          setEffectText('');
        }, 300);
        break;

      case 'doubling':
        setEffectText('×2');
        setEffectColor('text-purple-400');
        setTimeout(() => {
          setEffectText('');
        }, 800);
        break;

      case 'multiplying':
        setEffectText(`×${animation.multiplier || 2}`);
        setEffectColor('text-purple-400');
        setTimeout(() => {
          setEffectText('');
        }, 800);
        break;

      case 'upgrading':
        setEffectText('⬆');
        setEffectColor('text-yellow-400');
        setTimeout(() => {
          setEffectText('');
        }, 600);
        break;

      case 'vanishing':
        setIsVanishing(true);
        setEffectText('💨');
        setEffectColor('text-gray-400');
        setTimeout(() => {
          setEffectText('');
          setIsVanishing(false);
        }, 1000);
        break;

      case 'ghost-spawn':
        setEffectText('👻');
        setEffectColor('text-gray-300');
        setTimeout(() => {
          setEffectText('');
        }, 800);
        break;

      case 'scoring-twice':
        setEffectText('⚡');
        setEffectColor('text-blue-400');
        setTimeout(() => {
          setEffectText('');
        }, 800);
        break;
    }
  }, [positionAnimations, tile.number]);

  if (isVanishing) {
    return (
      <div className={`relative ${className} animate-pulse opacity-50`}>
        <TileComponent
          tile={tile}
          isHexagonal={true}
          size={30}
          className="transition-all duration-1000 scale-75 opacity-50"
        />
        
        {effectText && (
          <div className={`
            absolute -top-8 left-1/2 transform -translate-x-1/2
            text-2xl font-bold animate-pulse pointer-events-none
            ${effectColor}
          `}>
            {effectText}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <TileComponent
        tile={tile}
        isHexagonal={true}
        size={30}
        className={`
          transition-all duration-300
          ${isPlacing ? 'translate-y-[-8px]' : ''}
          ${isPlaced ? 'translate-y-0' : ''}
        `}
      />
      
      {effectText && (
        <div className={`
          absolute -top-8 left-1/2 transform -translate-x-1/2
          text-2xl font-bold animate-pulse pointer-events-none
          ${effectColor}
        `}>
          {effectText}
        </div>
      )}
    </div>
  );
}
