// tests/core/collision.test.ts — Demo3 DoD verification (§3.3).
// Pure-TS: PhysicsCollisionImpl & KinematicMover have no `cc` import -> node/vitest.
import { describe, it, expect } from 'vitest';
import { ICollisionService } from '../../assets/scripts/core/GameContext';
import { PhysicsCollisionImpl } from '../../assets/scripts/physics/PhysicsCollisionImpl';
import { KinematicMover } from '../../assets/scripts/physics/KinematicMover';
import type { Collider, Vec3 } from '../../assets/scripts/physics/ICollisionService';

describe('ICollisionService — token reuse', () => {
  it('reuses the shared ICollisionService token from GameContext', () => {
    expect(ICollisionService).toBe('ICollisionService');
  });
});

function mkCollider(id: string, x: number, y: number, z: number, radius = 0.5): Collider {
  return { id, position: { x, y, z }, radius, halfHeight: 0, mask: 0xffffffff };
}

describe('PhysicsCollisionImpl — overlapSphere determinism', () => {
  it('returns identical result for identical input (order-stable)', () => {
    const svc = new PhysicsCollisionImpl();
    svc.registerCollider(mkCollider('a', 1, 0, 0));
    svc.registerCollider(mkCollider('b', 0, 0, 1));
    const center: Vec3 = { x: 0, y: 0, z: 0 };
    const r1 = svc.overlapSphere(center, 1.2);
    const r2 = svc.overlapSphere(center, 1.2);
    expect(r1.map((c) => c.id)).toEqual(r2.map((c) => c.id));
    expect(r1.map((c) => c.id)).toEqual(['a', 'b']);
  });

  it('respects mask filtering', () => {
    const svc = new PhysicsCollisionImpl();
    svc.registerCollider({ id: 'a', position: { x: 0, y: 0, z: 0 }, radius: 0.5, halfHeight: 0, mask: 0b0001 });
    svc.registerCollider({ id: 'b', position: { x: 0, y: 0, z: 0 }, radius: 0.5, halfHeight: 0, mask: 0b0010 });
    const hit = svc.overlapSphere({ x: 0, y: 0, z: 0 }, 1, 0b0001);
    expect(hit.map((c) => c.id)).toEqual(['a']);
  });
});

describe('PhysicsCollisionImpl — raycast determinism', () => {
  it('returns nearest hit deterministically with normal + distance', () => {
    const svc = new PhysicsCollisionImpl();
    svc.registerCollider(mkCollider('near', 5, 0, 0, 0.5));
    svc.registerCollider(mkCollider('far', 9, 0, 0, 0.5));
    const origin: Vec3 = { x: 0, y: 0, z: 0 };
    const dir: Vec3 = { x: 1, y: 0, z: 0 };
    const h1 = svc.raycast(origin, dir, 100);
    const h2 = svc.raycast(origin, dir, 100);
    expect(h1).not.toBeNull();
    expect(h2).not.toBeNull();
    expect(h1!.colliderId).toBe('near');
    expect(h2!.colliderId).toBe('near');
    expect(h1!.distance).toBeCloseTo(4.5, 5);
    expect(h1!.point.x).toBeCloseTo(4.5, 5);
    expect(h1!.normal.x).toBeCloseTo(-1, 5); // points back toward origin
    expect(h1).toEqual(h2);
  });

  it('misses when nothing is in range', () => {
    const svc = new PhysicsCollisionImpl();
    svc.registerCollider(mkCollider('far', 20, 0, 0));
    const h = svc.raycast({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, 5);
    expect(h).toBeNull();
  });
});

describe('PhysicsCollisionImpl — overlapCapsule', () => {
  it('detects colliders within the capsule segment', () => {
    const svc = new PhysicsCollisionImpl();
    svc.registerCollider(mkCollider('mid', 0, 0.5, 0, 0.3));
    const hits = svc.overlapCapsule({ x: 0, y: 0, z: 0 }, 0.5, 2); // height 2 -> covers y 0..1
    expect(hits.map((c) => c.id)).toContain('mid');
  });
});

describe('PhysicsCollisionImpl — checkGround', () => {
  it('reports ground when a collider lies below; false when empty', () => {
    const svc = new PhysicsCollisionImpl();
    svc.registerCollider(mkCollider('floor', 0, -1, 0, 0.5));
    expect(svc.checkGround({ x: 0, y: 0, z: 0 })).toBe(true);
    const empty = new PhysicsCollisionImpl();
    expect(empty.checkGround({ x: 0, y: 0, z: 0 })).toBe(false);
  });
});

describe('PhysicsCollisionImpl — ILifecycle', () => {
  it('initialize marks ready; destroy clears registry', () => {
    const svc = new PhysicsCollisionImpl();
    svc.initialize(null as unknown as Parameters<PhysicsCollisionImpl['initialize']>[0]);
    expect(svc.initialized).toBe(true);
    svc.registerCollider(mkCollider('a', 0, 0, 0));
    expect(svc.overlapSphere({ x: 0, y: 0, z: 0 }, 1).length).toBe(1);
    svc.destroy();
    expect(svc.overlapSphere({ x: 0, y: 0, z: 0 }, 1).length).toBe(0);
    expect(svc.initialized).toBe(false);
  });
});

describe('KinematicMover — deterministic movement + slide', () => {
  it('moves by velocity*dt and is deterministic across runs', () => {
    const svc = new PhysicsCollisionImpl();
    const m = new KinematicMover(svc, { x: 0, y: 0, z: 0 });
    m.setVelocity({ x: 2, y: 0, z: 0 });
    for (let i = 0; i < 10; i++) m.update(0.1); // 1s -> +2 x
    const p1 = m.getPosition();

    const m2 = new KinematicMover(svc, { x: 0, y: 0, z: 0 });
    m2.setVelocity({ x: 2, y: 0, z: 0 });
    for (let i = 0; i < 10; i++) m2.update(0.1);
    const p2 = m2.getPosition();

    expect(p1).toEqual(p2);
    expect(p1.x).toBeCloseTo(2, 5);
  });

  it('slides along a wall instead of passing through', () => {
    const svc = new PhysicsCollisionImpl();
    svc.registerCollider(mkCollider('wall', 6.0, 0, 0, 0.5)); // block when mover x >= 5.1
    const m = new KinematicMover(svc, { x: 0, y: 0, z: 0 }, { radius: 0.4 });
    m.setVelocity({ x: 5, y: 0, z: 0 });
    for (let i = 0; i < 60; i++) m.update(0.1);
    const p = m.getPosition();
    expect(p.x).toBeGreaterThan(4.9);
    expect(p.x).toBeLessThan(5.6);
    expect(p.z).toBeCloseTo(0, 5); // no z drift
  });

  it('implements ILifecycle', () => {
    const svc = new PhysicsCollisionImpl();
    const m = new KinematicMover(svc, { x: 1, y: 2, z: 3 });
    m.initialize(null as unknown as Parameters<KinematicMover['initialize']>[0]);
    expect(m.initialized).toBe(true);
    m.setVelocity({ x: 1, y: 1, z: 1 });
    m.update(0.5);
    m.destroy();
    expect(m.getPosition()).toEqual({ x: 0, y: 0, z: 0 });
    expect(m.velocity).toEqual({ x: 0, y: 0, z: 0 });
    expect(m.initialized).toBe(false);
  });
});
