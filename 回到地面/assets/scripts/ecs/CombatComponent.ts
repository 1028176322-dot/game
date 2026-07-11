// CombatComponent.ts — skill queue + combat dispatch for ECS (§3.12).
// Pure TS, no `cc`. Holds a queue of SkillRequests and forwards to CombatSystem.
// No switch on skillId — CombatSystem handles dispatch.

import type { GameContext } from '../core/GameContext';
import type { ILifecycle } from '../core/LifecycleManager';
import type { SkillRequest } from '../battle/ai/IAIController';
import type { BattleCommand } from '../battle/combat/CombatCommand';

export const ICombatComponent = 'ICombatComponent';

export class CombatComponent implements ILifecycle {
  private _queue: SkillRequest[] = [];
  private _cooldowns = new Map<string, number>();
  private _dispatchFn: ((cmd: BattleCommand) => void) | null = null;
  private _entityId = '';

  initialize(entityId: string, dispatch: (cmd: BattleCommand) => void): void;
  initialize(ctx: GameContext): void;
  initialize(ctxOrId: GameContext | string, dispatch?: (cmd: BattleCommand) => void): void {
    if (typeof ctxOrId !== 'string') return; // ILifecycle.initialize(ctx)
    this._entityId = ctxOrId;
    this._dispatchFn = dispatch ?? null;
  }

  enter(): void {}
  exit(): void {}
  pause(): void {}
  resume(): void {}
  destroy(): void {
    this._queue = [];
    this._cooldowns.clear();
  }

  get entityId(): string { return this._entityId; }

  get queueLength(): number { return this._queue.length; }

  // Enqueue a skill request from AI or player input.
  enqueue(req: SkillRequest): void {
    this._queue.push(req);
  }

  // Process one queued request (if cooldown allows).
  process(sourceId: string): boolean {
    if (this._queue.length === 0 || !this._dispatchFn) return false;
    const req = this._queue.shift()!;

    // Check cooldown.
    const remaining = this._cooldowns.get(req.skillId) ?? 0;
    if (remaining > 0) {
      this._queue.unshift(req); // put back, not ready yet
      return false;
    }

    const cmd: BattleCommand = {
      kind: 'skill',
      sourceId,
      entityId: this._entityId,
      skillId: req.skillId,
    };
    this._dispatchFn(cmd);
    // Set cooldown (default 1s if skill config not available).
    this._cooldowns.set(req.skillId, 1.0);
    return true;
  }

  // Tick cooldowns.
  update(dt: number): void {
    const expired: string[] = [];
    for (const [id, remaining] of this._cooldowns) {
      const newRem = remaining - dt;
      if (newRem <= 0) {
        expired.push(id);
      } else {
        this._cooldowns.set(id, newRem);
      }
    }
    for (const id of expired) {
      this._cooldowns.delete(id);
    }
  }

  // Clear all queued skills (on death / stun).
  clear(): void {
    this._queue = [];
  }
}
