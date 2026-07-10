// ProjectileSystem.ts — §3.8 projectile lifecycle. Pure TS, ILifecycle, deterministic.
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.8 "飞行物生命周期" + §6.2 flow.

import type { GameContext } from '../../core/GameContext';
import type { ILifecycle } from '../../core/LifecycleManager';
import type { Vec3 } from '../../physics/ICollisionService';
import { ICollisionService } from '../../core/GameContext';
import type { ICollisionService as ICollisionContract } from '../../physics/ICollisionService';
import type { CombatEntity } from './CombatCommand';

export const IProjectileSystem = 'IProjectileSystem';

export interface ProjectileDef {
  readonly id: string;
  readonly speed: number;         // grid units per second
  readonly radius: number;        // collision radius for overlap hits
  readonly maxDuration: number;   // seconds before auto-expire
  readonly damage: number;
  readonly sourceId: string;
  readonly fromX: number;
  readonly fromY: number;
  readonly toX: number;
  readonly toY: number;
}

interface ActiveProjectile {
  def: ProjectileDef;
  x: number;                    // current interpolated position
  y: number;
  elapsed: number;
  hit: boolean;                 // true once resolved (prevent double-hit)
}

export class ProjectileSystem implements ILifecycle {
  readonly name = 'ProjectileSystem';

  private _ctx: GameContext | null = null;
  private _collision: ICollisionContract | null = null;
  private _projectiles: ActiveProjectile[] = [];
  private _initialized = false;

  // --- ILifecycle (§5.1) ---
  initialize(ctx: GameContext): void {
    this._ctx = ctx;
    this._collision = ctx.get<ICollisionContract>(ICollisionService);
    this._initialized = true;
  }
  enter(): void {}
  exit(): void {
    this._projectiles = [];
  }
  pause(): void {}
  resume(): void {}
  destroy(): void {
    this._projectiles = [];
    this._ctx = null;
    this._collision = null;
    this._initialized = false;
  }
  get initialized(): boolean {
    return this._initialized;
  }

  // Spawn a new projectile.
  spawn(def: ProjectileDef): void {
    this._projectiles.push({
      def,
      x: def.fromX,
      y: def.fromY,
      elapsed: 0,
      hit: false,
    });
  }

  // Advance all projectiles by dt. Returns hit results for this frame.
  update(dt: number, targets: CombatEntity[]): HitRecord[] {
    if (!this._collision) return [];
    const hits: HitRecord[] = [];
    const alive: ActiveProjectile[] = [];

    for (const p of this._projectiles) {
      p.elapsed += dt;

      // Expired -> remove without resolve.
      if (p.elapsed >= p.def.maxDuration) {
        continue;
      }

      // Interpolate position along the line from -> to.
      const t = Math.min(p.elapsed / (p.def.maxDuration || 1), 1);
      p.x = p.def.fromX + (p.def.toX - p.def.fromX) * t;
      p.y = p.def.fromY + (p.def.toY - p.def.fromY) * t;
      alive.push(p);

      // Hit detection: once per projectile.
      if (!p.hit) {
        const aimVec: Vec3 = { x: p.x, y: 0, z: p.y };
        const found = this._collision.overlapSphere(aimVec, p.def.radius);
        if (found.length > 0) {
          // Check if any collider matches a known target.
          for (const tgt of targets) {
            const collided = found.some((c) => {
              // Duck-type: check if the collider's position matches the target's grid position.
              return Math.abs(c.position.x - tgt.gridX) < 0.5 && Math.abs(c.position.z - tgt.gridY) < 0.5;
            });
            if (collided) {
              p.hit = true;
              hits.push({ projectileId: p.def.id, targetId: tgt.id, damage: p.def.damage, sourceId: p.def.sourceId });
              break;
            }
          }
        }
      }
    }

    this._projectiles = alive;
    return hits;
  }

  // Get all active projectiles (for debug / cleanup).
  get active(): readonly ActiveProjectile[] {
    return this._projectiles;
  }

  count(): number {
    return this._projectiles.length;
  }
}

export interface HitRecord {
  readonly projectileId: string;
  readonly targetId: string;
  readonly damage: number;
  readonly sourceId: string;
}
