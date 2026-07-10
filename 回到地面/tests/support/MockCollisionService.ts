// MockCollisionService.ts — test double for ICollisionService (§5.11).
// Lets logic unit tests run without the engine: preset overlap/raycast results and
// record calls. Implements the exact ICollisionService signature (§3.3).

import type { Collider, ICollisionService, RaycastHit, Vec3 } from '../../assets/scripts/physics/ICollisionService';
import { ALL_MASK } from '../../assets/scripts/physics/ICollisionService';

export class MockCollisionService implements ICollisionService {
  /** radius -> colliders returned by overlapSphere for that radius. */
  private _overlapByRadius = new Map<number, Collider[]>();
  /** Ordered raycast hits; raycast() returns the first (or null). */
  rayHits: RaycastHit[] = [];
  /** Recorded call descriptors for assertions. */
  readonly calls: string[] = [];

  setOverlap(radius: number, colliders: Collider[]): void {
    this._overlapByRadius.set(radius, colliders);
  }

  clearOverlap(): void {
    this._overlapByRadius.clear();
  }

  raycast(_origin: Vec3, _dir: Vec3, _maxDist: number, _mask: number = ALL_MASK): RaycastHit | null {
    this.calls.push('raycast');
    return this.rayHits.length > 0 ? this.rayHits[0] : null;
  }

  overlapSphere(center: Vec3, radius: number, _mask: number = ALL_MASK): Collider[] {
    this.calls.push(`overlapSphere:r=${radius}@(${center.x},${center.y},${center.z})`);
    return this._overlapByRadius.get(radius) ?? [];
  }

  overlapCapsule(_center: Vec3, _radius: number, _height: number, _mask: number = ALL_MASK): Collider[] {
    this.calls.push('overlapCapsule');
    return [];
  }

  checkGround(_pos: Vec3, _mask: number = ALL_MASK): boolean {
    this.calls.push('checkGround');
    return false;
  }
}
