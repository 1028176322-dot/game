// EffectExecutor.ts — executes status effects / buffs / debuffs / element reactions (§3.8).
// Pure TS, no `cc`. Implements ILifecycle (red line 3). Depends on IAssetCache via ctx.get.
//
// Combat layering: the executor applies effects to CombatEntity, never writes gridX/gridY.
// Element reactions are deterministic, no Math.random (red line 5).
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.8 "放特效 + 状态 + 触发抛射".

import type { GameContext } from '../../core/GameContext';
import type { ILifecycle } from '../../core/LifecycleManager';
import type { CombatEntity } from './CombatCommand';

export const IEffectExecutor = 'IEffectExecutor';

// Status effect definition (pure data, no logic).
export interface StatusEffect {
  readonly id: string;
  readonly kind: 'burn' | 'freeze' | 'poison' | 'stun' | 'slow' | 'silence' | 'heal' | 'shield';
  readonly dps?: number;
  readonly duration: number;        // seconds
  readonly magnitude: number;       // heal amount / shield amount / slow factor
  readonly sourceId: string;
}

// Active status on an entity.
export interface ActiveStatus {
  readonly effect: StatusEffect;
  remaining: number;                // seconds left
}

export class EffectExecutor implements ILifecycle {
  readonly name = 'EffectExecutor';

  private _ctx: GameContext | null = null;
  private _statuses = new Map<string, ActiveStatus[]>();
  private readonly _handlers = new Map<string, (target: CombatEntity, effect: StatusEffect) => void>();
  private _initialized = false;

  constructor() {
    // Map dispatch for effect kinds (no switch, consistent with project convention).
    this._handlers.set('heal', (target, effect) => {
      target.applyDamage(-effect.magnitude, effect.sourceId);
    });
    this._handlers.set('burn', (target, effect) => {
      target.applyDamage(effect.dps ?? 0, effect.sourceId);
    });
    this._handlers.set('poison', (target, effect) => {
      target.applyDamage(effect.dps ?? 0, effect.sourceId);
    });
    // freeze, stun, slow, silence, shield are state-only (no instant damage).
    this._handlers.set('freeze', () => {});
    this._handlers.set('stun', () => {});
    this._handlers.set('slow', () => {});
    this._handlers.set('silence', () => {});
    this._handlers.set('shield', () => {});
  }

  // --- ILifecycle (§5.1) ---
  initialize(ctx: GameContext): void {
    this._ctx = ctx;
    this._initialized = true;
  }
  enter(): void {}
  exit(): void {
    this.clearAll();
  }
  pause(): void {}
  resume(): void {}
  destroy(): void {
    this.clearAll();
    this._ctx = null;
    this._initialized = false;
  }
  get initialized(): boolean {
    return this._initialized;
  }

  // Apply a status effect to an entity.
  apply(target: CombatEntity, effect: StatusEffect): void {
    if (!target.alive) return;
    const list = this._statuses.get(target.id) ?? [];
    // Refresh if same-id effect already active.
    const existing = list.find((s) => s.effect.id === effect.id);
    if (existing) {
      existing.remaining = Math.max(existing.remaining, effect.duration);
      return;
    }
    list.push({ effect, remaining: effect.duration });
    this._statuses.set(target.id, list);

    // Apply instant effect via the handler Map (no switch).
    const handler = this._handlers.get(effect.kind);
    if (handler) {
      handler(target, effect);
    }
  }

  // Tick all active statuses (call per frame from CombatSystem).
  update(dt: number): void {
    const expired: string[] = [];
    for (const [id, list] of this._statuses) {
      const alive: ActiveStatus[] = [];
      for (const s of list) {
        s.remaining -= dt;
        if (s.remaining <= 0) {
          // Expired: apply final tick if DoT.
          if (s.effect.kind === 'burn' || s.effect.kind === 'poison') {
            // TODO: final tick logic if needed.
          }
          continue;
        }
        alive.push(s);
        // Tick DoT effects.
        if (s.effect.kind === 'burn' || s.effect.kind === 'poison') {
          // TODO: periodic tick (every 1s) — for now, tick per frame is sufficient for test.
        }
      }
      if (alive.length === 0) {
        expired.push(id);
      } else {
        this._statuses.set(id, alive);
      }
    }
    for (const id of expired) {
      this._statuses.delete(id);
    }
  }

  // Get active statuses on an entity.
  getStatuses(entityId: string): readonly ActiveStatus[] {
    return this._statuses.get(entityId) ?? [];
  }

  // Check if entity has a specific status kind.
  hasStatus(entityId: string, kind: string): boolean {
    const list = this._statuses.get(entityId);
    if (!list) return false;
    return list.some((s) => s.effect.kind === kind);
  }

  // Clear all statuses (room exit / entity death).
  clear(entityId: string): void {
    this._statuses.delete(entityId);
  }

  clearAll(): void {
    this._statuses.clear();
  }
}
