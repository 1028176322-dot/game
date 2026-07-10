// KinematicMover.ts — deterministic kinematic movement (Demo3).
// Pure TS, NO `cc` import -> node/vitest testable.
//
// Design:
//  - Depends ONLY on ICollisionService (interface) -> business never touches PhysicsSystem
//    (red line 1). The engine runtime injects the registered PhysicsCollisionImpl.
//  - Deterministic: position += velocity*dt with axis-separated slide resolution
//    (X, then Z, then Y) so the same input stream always yields the same path. This is the
//    MoveCommand executor foundation for §2.6 (network) and §5.7 (Replay).
//  - Implements ILifecycle (red line 3): destroy() resets state.
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.3 + demo3.md.

import type { GameContext } from '../core/GameContext';
import type { ILifecycle } from '../core/LifecycleManager';
import type { ICollisionService, Vec3 } from './ICollisionService';
import { ALL_MASK } from './ICollisionService';

export interface KinematicMoverOptions {
  radius?: number;
  mask?: number;
}

export class KinematicMover implements ILifecycle {
  readonly name = 'KinematicMover';

  private _pos: Vec3;
  private _vel: Vec3 = { x: 0, y: 0, z: 0 };
  private readonly _radius: number;
  private readonly _mask: number;
  private _ctx: GameContext | null = null;
  private _initialized = false;

  constructor(
    private readonly _collision: ICollisionService,
    start: Vec3 = { x: 0, y: 0, z: 0 },
    opts: KinematicMoverOptions = {},
  ) {
    this._pos = { x: start.x, y: start.y, z: start.z };
    this._radius = opts.radius ?? 0.4;
    this._mask = opts.mask ?? ALL_MASK;
  }

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
    this._pos = { x: 0, y: 0, z: 0 };
    this._vel = { x: 0, y: 0, z: 0 };
    this._ctx = null;
    this._initialized = false;
  }

  // --- API ---
  setVelocity(v: Vec3): void {
    this._vel = { x: v.x, y: v.y, z: v.z };
  }
  get velocity(): Vec3 {
    return { x: this._vel.x, y: this._vel.y, z: this._vel.z };
  }
  getPosition(): Vec3 {
    return { x: this._pos.x, y: this._pos.y, z: this._pos.z };
  }
  setPosition(p: Vec3): void {
    this._pos = { x: p.x, y: p.y, z: p.z };
  }
  get initialized(): boolean {
    return this._initialized;
  }

  // Deterministic integration: axis-separated slide (no random, fixed order X -> Z -> Y).
  update(dt: number): void {
    const next: Vec3 = {
      x: this._pos.x + this._vel.x * dt,
      y: this._pos.y + this._vel.y * dt,
      z: this._pos.z + this._vel.z * dt,
    };
    const resolved: Vec3 = { x: this._pos.x, y: this._pos.y, z: this._pos.z };

    // X axis
    if (!this._blocked({ x: next.x, y: this._pos.y, z: this._pos.z })) {
      resolved.x = next.x;
    }
    // Z axis
    if (!this._blocked({ x: resolved.x, y: this._pos.y, z: next.z })) {
      resolved.z = next.z;
    }
    // Y axis
    if (!this._blocked({ x: resolved.x, y: next.y, z: resolved.z })) {
      resolved.y = next.y;
    }
    this._pos = resolved;
  }

  private _blocked(p: Vec3): boolean {
    return this._collision.overlapSphere(p, this._radius, this._mask).length > 0;
  }
}
