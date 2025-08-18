export type AnimationType = 
  | 'placing-starts' 
  | 'placing-done' 
  | 'score-popup' 
  | 'doubling' 
  | 'scoring-twice' 
  | 'discard-upgrade' 
  | 'tile-copy' 
  | 'number-prefix' 
  | 'board-increment' 
  | 'multiplying' 
  | 'upgrading' 
  | 'vanishing' 
  | 'ghost-spawn' 
  | 'relict-trigger' 
  | 'gold-earned' 
  | 'single-neighbor-copy' 
  | 'color-first-upgrade' 
  | 'border-copy' 
  | 'ghost-hand' 
  | 'blue-mirror' 
  | 'consume' 
  | 'color-mixing' 
  | 'border-consume'
  | 'color-change-upgrade'
  | 'tile-stack'
  | 'auto-discard'
  | 'upgrade-field-spawn'
  | 'area-color-change'
  | 'area-upgrade'
  | 'digit-replace'
  | 'blue-trigger'
  | 'green-upgrade';

export interface AnimationState {
  id: string;
  type: AnimationType;
  position: { row: number; col: number };
  relictId?: string;
  scoreValue?: number;
  multiplier?: number;
  duration: number;
  startTime: number;
  isActive: boolean;
}

export interface AnimationContext {
  animations: AnimationState[];
  addAnimation: (animation: Omit<AnimationState, 'id' | 'startTime' | 'isActive'>) => void;
  removeAnimation: (id: string) => void;
  clearAnimations: () => void;
}
