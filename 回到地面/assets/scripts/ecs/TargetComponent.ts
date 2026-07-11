// TargetComponent.ts — holds the current target reference for ECS (§3.12).
// Pure TS, no `cc`. Works with LockOnManager for target acquisition/cycling.

import type { GameContext } from '../core/GameContext';
import type { ILifecycle } from '../core/LifecycleManager';

export const ITargetComponent = 'ITargetComponent';

export interface TargetInfo {
  readonly targetId: string;
  readonly distance: number;
  readonly isBoss: boolean;
  readonly isLocked: boolean;
}

export class TargetComponent implements ILifecycle {
  private _targetId: string | null = null;
  private _selfX = 0;
  private _selfY = 0;
  private _locked = false;

  initialize(selfX: number, selfY: number): void;
  initialize(ctx: GameContext): void;
  initialize(ctxOrX: GameContext | number, selfY?: number): void {
    if (typeof ctxOrX !== 'number') return; // ILifecycle.initialize(ctx)
    this._selfX = ctxOrX;
    this._selfY = selfY ?? 0;
  }

  enter(): void {}
  exit(): void {}
  pause(): void {}
  resume(): void {}
  destroy(): void {
    this.clear();
  }

  get targetId(): string | null { return this._targetId; }
  get locked(): boolean { return this._locked; }

  setTarget(entityId: string, locked: boolean): void {
    this._targetId = entityId;
    this._locked = locked;
  }

  clear(): void {
    this._targetId = null;
    this._locked = false;
  }

  updatePosition(x: number, y: number): void {
    this._selfX = x;
    this._selfY = y;
  }

  getInfo(targetX: number, targetY: number): TargetInfo | null {
    if (!this._targetId) return null;
    const dist = Math.abs(this._selfX - targetX) + Math.abs(this._selfY - targetY);
    return {
      targetId: this._targetId,
      distance: dist,
      isBoss: false,
      isLocked: this._locked,
    };
  }
}
