// AnimationStateMachine.ts — IAnimationController impl (§3.5 animation state machine).
// Pure TS, no `cc`. Driven by the AI (and other systems) via setState/play.
// Holds a small state machine with explicit allowed transitions; Dead is terminal.
//
// §3.5 pipeline: 业务 -> AnimationController.setState("Attack") / .play("SkillA")
//                       -> StateMachine (状态/过渡/blend)
//                       -> AnimationGraph (locomotion/attack/skill/hit/dodge/death)
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.5 (+ §3.10 AI drives anim via setState).

import type { GameContext } from '../../core/GameContext';
import type { ILifecycle } from '../../core/LifecycleManager';
import type { AIAnimState } from './IAIController';

// Service interface (token IAnimationController lives in core/GameContext). 1:1 with §3.5.
export interface IAnimationController {
  setState(state: AIAnimState): void;
  play(clip: string): void;
  readonly currentState: AIAnimState;
}

// Allowed transitions (adjacency). Any state may enter Dead; Dead is terminal.
const TRANSITIONS: Record<AIAnimState, AIAnimState[]> = {
  Idle:    ['Walk', 'Attack', 'Skill', 'HitStun', 'Dead'],
  Walk:    ['Idle', 'Attack', 'Skill', 'HitStun', 'Dead'],
  Attack:  ['Idle', 'Walk', 'HitStun', 'Dead'],
  Skill:   ['Idle', 'Walk', 'HitStun', 'Dead'],
  HitStun: ['Idle', 'Walk', 'Attack', 'Dead'],
  Dead:    [],
};

export class AnimationStateMachine implements IAnimationController, ILifecycle {
  readonly name = 'AnimationStateMachine';

  private _state: AIAnimState = 'Idle';
  private _history: AIAnimState[] = [];
  private _clips: string[] = [];
  private _initialized = false;

  get currentState(): AIAnimState {
    return this._state;
  }
  get history(): readonly AIAnimState[] {
    return this._history;
  }
  get clips(): readonly string[] {
    return this._clips;
  }

  // Reject transitions not in the adjacency table (Dead is terminal, etc.).
  setState(state: AIAnimState): void {
    if (state === this._state) return;
    const allowed = TRANSITIONS[this._state] ?? [];
    if (!allowed.includes(state)) return;
    this._state = state;
    this._history.push(state);
  }

  play(clip: string): void {
    this._clips.push(clip);
  }

  reset(): void {
    this._state = 'Idle';
    this._history = [];
    this._clips = [];
  }

  // --- ILifecycle (§5.1) ---
  initialize(_ctx: GameContext): void {
    this._initialized = true;
  }
  enter(): void {}
  exit(): void {}
  pause(): void {}
  resume(): void {}
  destroy(): void {
    this.reset();
    this._initialized = false;
  }
  get initialized(): boolean {
    return this._initialized;
  }
}
