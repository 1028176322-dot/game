// PhysicsCollisionImpl.ts — ICollisionService implementation (§3.3).
// Pure TS, NO `cc` import -> node/vitest testable, deterministic (§5.7 Replay).
//
// Design (red line 1 compliant):
//  - Business code never imports PhysicsSystem. This implementation is the ONLY collision
//    backend, and it is written in pure TS over a collider registry. The engine side
//    registers cc.Collider transforms into the registry at runtime (registerCollider), so
//    no `cc` dependency leaks into the contract or the math.
//  - Determinism: all queries iterate colliders in insertion order (Map preserves order),
//    no Math.random, fixed math -> identical input yields identical output. This is strictly
//    better for replay determinism than delegating to a black-box physics engine.
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.3.
// Strict 1:1 with ICollisionService; implements ILifecycle (red line 3).

import type { GameContext } from '../core/GameContext';
import type { ILifecycle } from '../core/LifecycleManager';
import type { Collider, ICollisionService, RaycastHit, Vec3 } from './ICollisionService';
import { ALL_MASK } from './ICollisionService';

const GROUND_PROBE_DIST = 2;

function maskMatch(colliderMask: number, queryMask: number): boolean {
  return (colliderMask & queryMask) !== 0;
}

function dist3(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export class PhysicsCollisionImpl implements ICollisionService, ILifecycle {
  readonly name = 'PhysicsCollisionImpl';

  private readonly _colliders = new Map<string, Collider>();
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
    this.clear();
    this._ctx = null;
    this._initialized = false;
  }

  // --- Registry (engine side feeds cc.Collider transforms here at runtime) ---
  registerCollider(c: Collider): void {
    this._colliders.set(c.id, c);
  }
  unregisterCollider(id: string): void {
    this._colliders.delete(id);
  }
  clear(): void {
    this._colliders.clear();
  }

  get initialized(): boolean {
    return this._initialized;
  }

  // --- ICollisionService (§3.3) ---

  overlapSphere(center: Vec3, radius: number, mask: number = ALL_MASK): Collider[] {
    const hits: Collider[] = [];
    for (const c of this._colliders.values()) {
      if (c.enabled === false) continue;
      if (!maskMatch(c.mask, mask)) continue;
      if (dist3(center, c.position) <= radius + c.radius) {
        hits.push(c);
      }
    }
    return hits;
  }

  overlapCapsule(center: Vec3, radius: number, height: number, mask: number = ALL_MASK): Collider[] {
    const halfH = height / 2;
    const top: Vec3 = { x: center.x, y: center.y + halfH, z: center.z };
    const bottom: Vec3 = { x: center.x, y: center.y - halfH, z: center.z };
    const hits: Collider[] = [];
    for (const c of this._colliders.values()) {
      if (c.enabled === false) continue;
      if (!maskMatch(c.mask, mask)) continue;
      // distance from collider center to the capsule segment [bottom, top]
      let t = 0;
      if (height > 0) {
        t = (c.position.y - bottom.y) / height;
        if (t < 0) t = 0;
        else if (t > 1) t = 1;
      }
      const segPoint: Vec3 = { x: bottom.x, y: bottom.y + (top.y - bottom.y) * t, z: bottom.z };
      if (dist3(c.position, segPoint) <= radius + c.radius) {
        hits.push(c);
      }
    }
    return hits;
  }

  raycast(origin: Vec3, dir: Vec3, maxDist: number, mask: number = ALL_MASK): RaycastHit | null {
    const dl = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z);
    if (dl < 1e-9) return null;
    const d: Vec3 = { x: dir.x / dl, y: dir.y / dl, z: dir.z / dl };

    let bestT = Infinity;
    let bestId: string | null = null;
    for (const c of this._colliders.values()) {
      if (c.enabled === false) continue;
      if (!maskMatch(c.mask, mask)) continue;
      // ray-sphere: |origin + t*d - C|^2 = R^2
      const mx = origin.x - c.position.x;
      const my = origin.y - c.position.y;
      const mz = origin.z - c.position.z;
      const b = mx * d.x + my * d.y + mz * d.z;
      const cc = mx * mx + my * my + mz * mz - c.radius * c.radius;
      const disc = b * b - cc;
      if (disc < 0) continue;
      const sq = Math.sqrt(disc);
      let t = -b - sq; // entry point
      if (t < 0) {
        t = -b + sq; // origin inside sphere -> exit point
        if (t < 0) continue;
      }
      if (t > maxDist) continue;
      if (t < bestT) {
        bestT = t;
        bestId = c.id;
      }
    }
    if (bestId === null) return null;

    const c = this._colliders.get(bestId)!;
    const point: Vec3 = {
      x: origin.x + d.x * bestT,
      y: origin.y + d.y * bestT,
      z: origin.z + d.z * bestT,
    };
    const nx = point.x - c.position.x;
    const ny = point.y - c.position.y;
    const nz = point.z - c.position.z;
    const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    const normal: Vec3 = { x: nx / nl, y: ny / nl, z: nz / nl };
    return { point, distance: bestT, normal, colliderId: bestId };
  }

  checkGround(pos: Vec3, mask: number = ALL_MASK): boolean {
    const origin: Vec3 = { x: pos.x, y: pos.y + 0.1, z: pos.z };
    const down: Vec3 = { x: 0, y: -1, z: 0 };
    return this.raycast(origin, down, GROUND_PROBE_DIST, mask) !== null;
  }
}
