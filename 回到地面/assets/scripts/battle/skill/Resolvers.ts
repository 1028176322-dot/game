// Resolvers.ts — pure skill effect resolvers (§3.9 HitResolver / DamageResolver).
// Pure TS, no `cc`. No state, no `switch`. These are the leaf effects applied to a Damageable.
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.9.

import type { GameContext } from '../../core/GameContext';
import type { ILifecycle } from '../../core/LifecycleManager';
import type { Damageable } from './SkillData';

export const IHitResolver = 'IHitResolver';
export const IDamageResolver = 'IDamageResolver';

export class HitResolver implements ILifecycle {
  private _ctx: GameContext | null = null;

  // ILifecycle (§5.1): stateless service; no teardown needed beyond clearing the ctx ref.
  initialize(ctx: GameContext): void {
    this._ctx = ctx;
  }
  enter(): void {}
  exit(): void {}
  pause(): void {}
  resume(): void {}
  destroy(): void {
    this._ctx = null;
  }

  // Apply direct hit damage. Pure: forwards to the target contract.
  resolve(target: Damageable, amount: number, source?: string): void {
    target.applyDamage(amount, source);
  }
}

export class DamageResolver implements ILifecycle {
  private _ctx: GameContext | null = null;

  // ILifecycle (§5.1): stateless service; no teardown needed beyond clearing the ctx ref.
  initialize(ctx: GameContext): void {
    this._ctx = ctx;
  }
  enter(): void {}
  exit(): void {}
  pause(): void {}
  resume(): void {}
  destroy(): void {
    this._ctx = null;
  }

  // Apply a burn damage-over-time effect. Pure: forwards to the target contract.
  applyBurn(target: Damageable, dps: number, duration: number, source?: string): void {
    target.applyBurn(dps, duration, source);
  }
}
