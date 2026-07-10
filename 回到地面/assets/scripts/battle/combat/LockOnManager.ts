// LockOnManager.ts — manages target lock-on (§3.8).
// Pure TS, no `cc`. Implements ILifecycle (red line 3). exit() forces release (no dangling lock).
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.8 "锁定：选敌/解除/相机取景" + §6.2 flow.

import type { GameContext } from '../../core/GameContext';
import type { ILifecycle } from '../../core/LifecycleManager';
import type { CombatEntity, TargetResult } from './CombatCommand';

export const ILockOnManager = 'ILockOnManager';

export interface LockOnState {
  readonly target: CombatEntity | null;
  readonly locked: boolean;
  readonly lockTime: number;       // how long the lock has been held
}

export class LockOnManager implements ILifecycle {
  readonly name = 'LockOnManager';

  private _ctx: GameContext | null = null;
  private _target: CombatEntity | null = null;
  private _locked = false;
  private _lockTime = 0;
  private _initialized = false;

  // --- ILifecycle (§5.1) ---
  initialize(ctx: GameContext): void {
    this._ctx = ctx;
    this._initialized = true;
  }
  enter(): void {}
  exit(): void {
    this.release();
  }
  pause(): void {}
  resume(): void {}
  destroy(): void {
    this.release();
    this._ctx = null;
    this._initialized = false;
  }
  get initialized(): boolean {
    return this._initialized;
  }

  // Acquire lock on a target.
  acquire(target: CombatEntity): boolean {
    if (!target.alive) {
      this.release();
      return false;
    }
    if (this._target && this._target.id === target.id && this._locked) return true; // already locked
    this._target = target;
    this._locked = true;
    this._lockTime = 0;
    return true;
  }

  // Release current lock.
  release(): void {
    this._target = null;
    this._locked = false;
    this._lockTime = 0;
  }

  // Cycle to next target in the pool (or nearest).
  cycle(pool: CombatEntity[], selfId: string): CombatEntity | null {
    const candidates = pool.filter((e) => e.alive && e.id !== selfId);
    if (candidates.length === 0) {
      this.release();
      return null;
    }
    // If current target is still valid, find the next one in the list.
    if (this._target && this._locked) {
      const idx = candidates.findIndex((e) => e.id === this._target!.id);
      if (idx >= 0 && idx < candidates.length - 1) {
        const next = candidates[idx + 1];
        this.acquire(next);
        return next;
      }
    }
    // Default to the first candidate.
    const first = candidates[0];
    this.acquire(first);
    return first;
  }

  // Check if the target is still valid (alive, in range).
  validate(range: number, self: CombatEntity): boolean {
    if (!this._target || !this._locked) return false;
    if (!this._target.alive) {
      this.release();
      return false;
    }
    const dist = Math.abs(self.gridX - this._target.gridX) + Math.abs(self.gridY - this._target.gridY);
    if (dist > range) {
      this.release();
      return false;
    }
    return true;
  }

  // Apply to a TargetResult: auto-acquire if a lock-on target is present.
  apply(result: TargetResult): void {
    if (result.lockOn) {
      this.acquire(result.lockOn);
    }
  }

  // Update lock timer (call per frame).
  update(dt: number): void {
    if (this._locked) {
      this._lockTime += dt;
    }
  }

  get state(): LockOnState {
    return {
      target: this._target,
      locked: this._locked,
      lockTime: this._lockTime,
    };
  }
}
