// CombatSystem.ts — combat orchestration dispatcher (§3.8).
// Pure TS, no `cc`. Implements ILifecycle (red line 3). Dependencies resolved via ctx.get.
//
// Flow per §6.2:
//   BattleCommand -> TargetSelector -> HitResolver -> DamageResolver -> [EffectExecutor, ProjectileSystem]
//   LockOnManager runs alongside HitResolver for lock-on camera.
//
// Red line 2: dispatch uses a Map<BattleCommandKind, handler> (no switch on id).
// Red line 4: all services pulled from GameContext (no `new` of services here).
// Red line 5: no Math.random; all damage is deterministic.
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.8 + §6.2.

import type { GameContext } from '../../core/GameContext';
import type { ILifecycle } from '../../core/LifecycleManager';
import { ILogger, IConfigDatabase } from '../../core/GameContext';
import type { Logger } from '../../core/Logger';
import type { ConfigDatabase } from '../../core/ConfigDatabase';
import { ISkillGraph, SkillGraph } from '../skill/SkillGraph';
import { ISkillExecutor, SkillExecutor } from '../skill/SkillExecutor';
import { HitResolver, DamageResolver, IHitResolver, IDamageResolver } from '../skill/Resolvers';
import type { SkillData } from '../skill/SkillData';
import { TargetSelector, ITargetSelector } from './TargetSelector';
import { EffectExecutor } from './EffectExecutor';
import { ProjectileSystem, type HitRecord } from './ProjectileSystem';
import { LockOnManager } from './LockOnManager';
import type { BattleCommand, CombatEntity, TargetResult } from './CombatCommand';
import type { Damageable } from '../skill/SkillData';
import type { Vec3 } from '../../physics/ICollisionService';

export const ICombatSystem = 'ICombatSystem';

// Dispatch handler registry (Map, no switch on kind).
type CmdHandler = (cmd: BattleCommand, self: CombatEntity, pool: CombatEntity[], result: TargetResult) => void;

export class CombatSystem implements ILifecycle {
  readonly name = 'CombatSystem';

  private _ctx: GameContext | null = null;
  private _logger: Logger | null = null;
  private _configDB: ConfigDatabase | null = null;
  private _skillGraph: SkillGraph | null = null;
  private _skillExecutor: SkillExecutor | null = null;
  private _selector: TargetSelector | null = null;
  private _hitResolver: HitResolver | null = null;
  private _damageResolver: DamageResolver | null = null;
  private readonly _effects = new EffectExecutor();
  private readonly _projectiles = new ProjectileSystem();
  private readonly _lockOn = new LockOnManager();
  private readonly _handlers = new Map<string, CmdHandler>();
  private readonly _pool: CombatEntity[] = [];
  private _initialized = false;

  constructor() {
    // Map dispatch per BattleCommandKind (no switch).
    this._handlers.set('skill', this._handleSkill.bind(this));
    this._handlers.set('move', this._handleMove.bind(this));
  }

  // --- ILifecycle (§5.1) ---
  initialize(ctx: GameContext): void {
    this._ctx = ctx;
    this._logger = ctx.get<Logger>(ILogger);
    this._configDB = ctx.get<ConfigDatabase>(IConfigDatabase);
    this._skillGraph = ctx.get<SkillGraph>(ISkillGraph);
    this._skillExecutor = ctx.get<SkillExecutor>(ISkillExecutor);
    this._selector = ctx.get<TargetSelector>(ITargetSelector);
    this._hitResolver = ctx.get<HitResolver>(IHitResolver);
    this._damageResolver = ctx.get<DamageResolver>(IDamageResolver);
    this._effects.initialize(ctx);
    this._projectiles.initialize(ctx);
    this._lockOn.initialize(ctx);
    this._initialized = true;
  }
  enter(): void {}
  exit(): void {
    this._pool.length = 0;
    this._effects.exit();
    this._projectiles.exit();
    this._lockOn.exit();
  }
  pause(): void {}
  resume(): void {}
  destroy(): void {
    this._pool.length = 0;
    this._effects.destroy();
    this._projectiles.destroy();
    this._lockOn.destroy();
    this._ctx = null;
    this._logger = null;
    this._configDB = null;
    this._skillGraph = null;
    this._skillExecutor = null;
    this._initialized = false;
  }
  get initialized(): boolean {
    return this._initialized;
  }

  // ---- Entity pool management ----
  register(entity: CombatEntity): void {
    if (!this._pool.some((e) => e.id === entity.id)) {
      this._pool.push(entity);
    }
  }
  unregister(entityId: string): void {
    const idx = this._pool.findIndex((e) => e.id === entityId);
    if (idx >= 0) this._pool.splice(idx, 1);
  }
  get entities(): readonly CombatEntity[] {
    return this._pool;
  }

  // ---- Subsystem accessors (for test / debug) ----
  get effects(): EffectExecutor { return this._effects; }
  get projectiles(): ProjectileSystem { return this._projectiles; }
  get lockOn(): LockOnManager { return this._lockOn; }
  get selector(): TargetSelector { return this._selector!; }

  // ---- Dispatch entry point ----
  dispatch(cmd: BattleCommand): void {
    if (!this._ctx || !this._logger || !this._selector) {
      throw new Error('[CombatSystem] not initialized');
    }
    const selector = this._selector;
    const self = this._pool.find((e) => e.id === cmd.entityId);
    if (!self || !self.alive) {
      this._logger.channel('battle').warn(`[CombatSystem] entity not found or dead: ${cmd.entityId}`);
      return;
    }
    const result = selector.resolve(cmd, this._pool, self);
    this._lockOn.apply(result);

    const handler = this._handlers.get(cmd.kind);
    if (handler) {
      handler(cmd, self, this._pool, result);
    } else {
      this._logger.channel('battle').warn(`[CombatSystem] unhandled command kind: ${cmd.kind}`);
    }
  }

  // Per-frame update: projectile flight + status ticking.
  update(dt: number): void {
    // Advance projectiles.
    const hits = this._projectiles.update(dt, this._pool);
    for (const h of hits) {
      this._applyProjectileHit(h);
    }
    // Tick active status effects.
    this._effects.update(dt);
    // Lock-on timer.
    this._lockOn.update(dt);
  }

  // ---- Private handlers (registered in the Map, no switch) ----

  private _handleSkill(cmd: BattleCommand, self: CombatEntity, _pool: CombatEntity[], result: TargetResult): void {
    if (!this._configDB || !this._skillGraph || !this._skillExecutor || !this._hitResolver || !this._damageResolver) return;
    const skillId = cmd.skillId ?? 'melee_attack';
    const skillConfig: unknown = this._configDB.getSkill(skillId);
    const data = skillConfig as SkillData | undefined;
    if (!data) {
      this._logger?.channel('battle').warn(`[CombatSystem] skill config not found: ${skillId}`);
      return;
    }
    const nodes = this._skillGraph.build(data);
    const aim: Vec3 = cmd.aimPosition ?? { x: self.gridX, y: 0, z: self.gridY };
    const caster = { id: cmd.sourceId, position: { x: self.gridX, y: 0, z: self.gridY } };

    // Execute the skill; the SkillExecutor resolves via ICollisionService internally.
    this._skillExecutor.execute(data, caster, aim);

    // Apply hit results to the primary target.
    if (result.primary) {
      const dmg = data.onHit?.damage ?? 0;
      this._hitResolver!.resolve(result.primary as unknown as Damageable, dmg, cmd.sourceId);
      if (data.onHit?.burn) {
        this._damageResolver!.applyBurn(
          result.primary as unknown as Damageable,
          data.onHit.burn.dps,
          data.onHit.burn.duration,
          cmd.sourceId,
        );
      }
    }

    // Spawn projectiles if the skill has projectile data.
    if (data.projectile && result.primary) {
      this._projectiles.spawn({
        id: `${skillId}_${cmd.sourceId}_${Date.now()}`,
        speed: data.projectile.speed,
        radius: data.projectile.radius,
        maxDuration: data.projectile.duration,
        damage: data.onHit?.damage ?? 0,
        sourceId: cmd.sourceId,
        fromX: self.gridX,
        fromY: self.gridY,
        toX: result.primary.gridX,
        toY: result.primary.gridY,
      });
    }

    this._logger?.channel('battle').info(`[CombatSystem] skill=${skillId} caster=${cmd.sourceId} target=${result.primary?.id ?? 'none'}`);
  }

  private _handleMove(_cmd: BattleCommand, _self: CombatEntity, _pool: CombatEntity[], _result: TargetResult): void {
    // Move handling is delegated to MovementComponent (Phase 3 ECS).
    // For Phase 1, this is a no-op placeholder.
    this._logger?.channel('battle').info(`[CombatSystem] move command received (ECS Phase 3)`);
  }

  private _applyProjectileHit(hit: HitRecord): void {
    if (!this._hitResolver) return;
    const target = this._pool.find((e) => e.id === hit.targetId);
    if (target && target.alive) {
      this._hitResolver!.resolve(target as unknown as Damageable, hit.damage, hit.sourceId);
      this._logger?.channel('battle').info(`[CombatSystem] projectile hit ${hit.targetId} dmg=${hit.damage}`);
    }
  }
}
