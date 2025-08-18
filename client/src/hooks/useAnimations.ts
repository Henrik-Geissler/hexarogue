import { useState, useCallback } from 'react';
import { AnimationState, AnimationType } from '../types/animations';

export function useAnimations() {
  const [animations, setAnimations] = useState<AnimationState[]>([]);

  const addAnimation = useCallback((
    type: AnimationType,
    position: { row: number; col: number },
    duration: number = 1000,
    relictId?: string,
    scoreValue?: number
  ) => {
    const id = `${type}-${position.row}-${position.col}-${Date.now()}`;
    const newAnimation: AnimationState = {
      id,
      type,
      position,
      relictId,
      scoreValue,
      duration,
      startTime: Date.now(),
      isActive: true
    };

    setAnimations(prev => [...prev, newAnimation]);

    // Auto-remove animation after duration
    setTimeout(() => {
      removeAnimation(id);
    }, duration);
  }, []);

  const removeAnimation = useCallback((id: string) => {
    setAnimations(prev => prev.filter(anim => anim.id !== id));
  }, []);

  const clearAnimations = useCallback(() => {
    setAnimations([]);
  }, []);

  return {
    animations,
    addAnimation,
    removeAnimation,
    clearAnimations
  };
}
