// AnimationComponent.ts — wraps IAnimationController for ECS (§3.12).
// Pure TS, no `cc`. Maps entity states to animation clips via a data-driven record.
// No switch on state type — uses a Map<state, clipId> look-up.

import type { GameContext } from '../core/GameContext';
import { IAnimationController } from '../core/GameContext';
import type { IAnimationController as IAnimContract } from '../battle/ai/AnimationStateMachine';

export const IAnimationComponent = 'IAnimationComponent';

export type PlayerAnimState = 'idle' | 'walk' | 'attack' | 'skill' | 'hit' | 'dodge' | 'die';

// Data-driven anim clip mapping (configurable per character).
const DEFAULT_CLIP_MAP: Record<PlayerAnimState, string> = {
  idle:   'player_idle',
  walk:   'player_walk',
  attack: 'player_attack',
  skill:  'player_skill',
  hit:    'player_hit',
  dodge:  'player_dodge',
  die:    'player_die',
};

export class AnimationComponent {
  private _anim: IAnimContract | null = null;
  private _clipMap: Record<PlayerAnimState, string>;
  private _currentState: PlayerAnimState = 'idle';

  constructor(clipMap?: Record<PlayerAnimState, string>) {
    this._clipMap = clipMap ?? DEFAULT_CLIP_MAP;
  }

  initialize(ctx: GameContext): void {
    this._anim = ctx.get<IAnimContract>(IAnimationController);
  }

  get currentState(): PlayerAnimState {
    return this._currentState;
  }

  // Set animation state; drives the IAnimationController.
  setState(state: PlayerAnimState): void {
    if (state === this._currentState) return;
    this._currentState = state;
    const clip = this._clipMap[state];
    if (clip && this._anim) {
      this._anim.play(clip);
      // Map ECS state to the animation state machine.
      this._anim.setState(translateState(state));
    }
  }

  // Direct play (for one-off skill animations).
  playClip(clipId: string): void {
    if (this._anim) {
      this._anim.play(clipId);
    }
  }
}

// Translate ECS state to AIAnimState for the state machine.
function translateState(s: PlayerAnimState): string {
  const map: Record<PlayerAnimState, string> = {
    idle: 'Idle',
    walk: 'Walk',
    attack: 'Attack',
    skill: 'Skill',
    hit: 'HitStun',
    dodge: 'Idle',
    die: 'Dead',
  };
  return map[s] ?? 'Idle';
}
