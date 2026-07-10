// SkillExecutor.ts — runs a skill through its SkillGraph nodes (§3.9).
// Pure TS, no `cc`. Implements ILifecycle (red line 3).
//
// Red line 2: NO `switch(skillId)`. Nodes are dispatched by a kind->handler Map. The executor
//   never reads data.id to choose behavior; the same code path runs for every skill.
// Red line 4: all dependencies are pulled from GameContext via ctx.get (no `new` of services).
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.9 + demo4.md.

import type { GameContext } from '../../core/GameContext';
import type { ILifecycle } from '../../core/LifecycleManager';
import type { Logger } from '../../core/Logger';
import { ILogger, ICollisionService } from '../../core/GameContext';
import type { ICollisionService as ICollisionServiceContract, Collider, Vec3 } from '../../physics/ICollisionService';
import { SkillGraph, ISkillGraph } from './SkillGraph';
import type { Damageable, SkillCaster, SkillData, SkillNode, SkillNodeKind } from './SkillData';
import { HitResolver, DamageResolver } from './Resolvers';

// Service token (co-located with the owning module).
export const ISkillExecutor = 'ISkillExecutor';

// Collider that optionally carries its owning Damageable (engine side wires this at runtime).
interface OwnedCollider extends Collider {
  owner?: Damageable;
}

interface SkillRuntime {
  caster: SkillCaster;
  aim: Vec3;
  collision: ICollisionServiceContract;
  logger: Logger;
  hitTargets: Damageable[];
}

export class SkillExecutor implements ILifecycle {
  readonly name = 'SkillExecutor';

  private _ctx: GameContext | null = null;
  private _logger: Logger | null = null;
  private _collision: ICollisionServiceContract | null = null;
  private _graph: SkillGraph | null = null;
  private _handlers = new Map<SkillNodeKind, (node: SkillNode, rt: SkillRuntime) => void>();
  private _initialized = false;

  // --- ILifecycle (§5.1) ---
  initialize(ctx: GameContext): void {
    this._ctx = ctx;
    // Red line 4: resolve dependencies through the container, never `new` a service.
    this._logger = ctx.get<Logger>(ILogger);
    this._collision = ctx.get<ICollisionServiceContract>(ICollisionService);
    this._graph = ctx.get<SkillGraph>(ISkillGraph);
    this._registerHandlers();
    this._initialized = true;
  }
  enter(): void {}
  exit(): void {}
  pause(): void {}
  resume(): void {}
  destroy(): void {
    this._handlers.clear();
    this._ctx = null;
    this._logger = null;
    this._collision = null;
    this._graph = null;
    this._initialized = false;
  }

  get initialized(): boolean {
    return this._initialized;
  }

  // Red line 2: dispatch by kind via a registry Map, never by `switch(skillId)`.
  private _registerHandlers(): void {
    this._handlers.set('projectile', (node, rt) => {
      const n = node as Extract<SkillNode, { kind: 'projectile' }>;
      rt.logger.channel('battle').info(
        `[Skill] projectile fired speed=${n.speed} radius=${n.radius} duration=${n.duration}`,
      );
      // Projectile travels to the aim point; the explosion node below uses rt.aim as the center.
    });

    this._handlers.set('explosion', (node, rt) => {
      const n = node as Extract<SkillNode, { kind: 'explosion' }>;
      const hits = rt.collision.overlapSphere(rt.aim, n.radius);
      for (const c of hits) {
        const owner = (c as OwnedCollider).owner;
        if (owner) {
          HitResolver.resolve(owner, n.damage, rt.caster.id);
          rt.hitTargets.push(owner);
        }
      }
    });

    this._handlers.set('burn', (node, rt) => {
      const n = node as Extract<SkillNode, { kind: 'burn' }>;
      for (const t of rt.hitTargets) {
        DamageResolver.applyBurn(t, n.dps, n.duration, rt.caster.id);
      }
    });
  }

  // Execute a skill: build the data-driven node chain, then run each node through its handler.
  execute(data: SkillData, caster: SkillCaster, aim: Vec3): void {
    if (!this._graph || !this._collision || !this._logger) {
      throw new Error('[SkillExecutor] not initialized');
    }
    const nodes = this._graph.build(data);
    const rt: SkillRuntime = {
      caster,
      aim,
      collision: this._collision,
      logger: this._logger,
      hitTargets: [],
    };
    for (const node of nodes) {
      const handler = this._handlers.get(node.kind);
      if (!handler) {
        this._logger.channel('battle').warn(`[Skill] no handler registered for node kind: ${node.kind}`);
        continue;
      }
      handler(node, rt);
    }
  }
}
