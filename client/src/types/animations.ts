export type AnimationType = 
  | 'placing-starts'
  | 'relict-trigger'
  | 'score-popup'
  | 'placing-done'
  | 'doubling'
  | 'vanishing'
  | 'upgrading'
  | 'multiplying'
  | 'ghost-spawn';

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
