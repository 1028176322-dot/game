// SkillGraph.ts — builds the data-driven skill node chain from SkillData (§3.9).
// Pure TS, no `cc`. Implements ILifecycle (red line 3) so it is registered in LifecycleManager.
//
// Red line 2: NO `switch(skillId)`. The chain is derived purely from which fields are present
// in SkillData. Adding a Boss skill = adding data (or a node kind) -> the framework is untouched.
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.9.

import type { GameContext } from '../../core/GameContext';
import type { ILifecycle } from '../../core/LifecycleManager';
import type { SkillData, SkillNode } from './SkillData';

// Service token (co-located with the owning module; GameBootstrap registers it here).
export const ISkillGraph = 'ISkillGraph';

export class SkillGraph implements ILifecycle {
  readonly name = 'SkillGraph';

  private _ctx: GameContext | null = null;
  private _initialized = false;

  // --- ILifecycle (§5.1) ---
  initialize(ctx: GameContext): void {
    this._ctx = ctx;
    this._initialized = true;
  }
  enter(): void {}
  exit(): void {}
  pause(): void {}
  resume(): void {}
  destroy(): void {
    this._ctx = null;
    this._initialized = false;
  }

  get initialized(): boolean {
    return this._initialized;
  }

  // Build the node chain from SkillData. Pure function of the data shape -> data-driven.
  build(data: SkillData): SkillNode[] {
    const nodes: SkillNode[] = [];

    if (data.projectile) {
      nodes.push({
        kind: 'projectile',
        speed: data.projectile.speed,
        radius: data.projectile.radius,
        duration: data.projectile.duration,
      });
    }

    if (data.onHit) {
      // Explosion (aoe at the hit point) carries the onHit damage.
      const aoeRadius = data.projectile ? data.projectile.radius : 1;
      nodes.push({ kind: 'explosion', radius: aoeRadius, damage: data.onHit.damage });
      if (data.onHit.burn) {
        nodes.push({ kind: 'burn', dps: data.onHit.burn.dps, duration: data.onHit.burn.duration });
      }
    }

    return nodes;
  }
}
