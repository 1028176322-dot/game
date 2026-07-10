// ICollisionService.ts — collision abstraction interface (§3.3).
// Pure TS, NO `cc` import: business code depends ONLY on this interface, never on
// PhysicsSystem (red line 1). The DI token `ICollisionService` is exported from
// ../core/GameContext (single source of truth, §5.2) — do NOT re-declare it here.
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.3.
// 1:1 with the spec signature (raycast / overlapSphere / overlapCapsule / checkGround).
// Vec3 etc. are plain shapes so the interface is node-testable without the engine.

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface RaycastHit {
  point: Vec3;
  distance: number;
  normal: Vec3;
  colliderId: string | null;
}

// A lightweight collider descriptor. The engine side converts cc.Collider / Cocos physics
// bodies into this shape and feeds them into the implementation's registry at runtime
// (see PhysicsCollisionImpl.registerCollider). This keeps the math pure TS and deterministic
// (required by Replay, §5.7) and keeps `cc` out of the contract entirely.
export interface Collider {
  id: string;
  position: Vec3;
  radius: number;      // bounding sphere radius
  halfHeight: number;  // capsule cylinder half-height (0 => sphere)
  mask: number;        // layer bitmask; matched via bitwise AND
  enabled?: boolean;
}

export interface ICollisionService {
  raycast(origin: Vec3, dir: Vec3, maxDist: number, mask?: number): RaycastHit | null;
  overlapSphere(center: Vec3, radius: number, mask?: number): Collider[];
  overlapCapsule(center: Vec3, radius: number, height: number, mask?: number): Collider[];
  checkGround(pos: Vec3, mask?: number): boolean;
}

// Default query mask: match every layer.
export const ALL_MASK = 0xffffffff;
