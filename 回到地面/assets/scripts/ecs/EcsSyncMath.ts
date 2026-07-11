// EcsSyncMath.ts — pure-TS math helpers for ECS <-> engine node sync (§3.12 bridge).
// No `cc` import: this file is unit-tested in node (vitest) and reused by the cc bridge.
// Deterministic, no Math.random.

import type { PlayerAnimState } from './AnimationComponent';

export interface WorldPos {
  readonly x: number;
  readonly y: number;
}

// Convert a grid cell to a world position.
export function gridToWorld(
  gridX: number,
  gridY: number,
  originX: number,
  originY: number,
  tileSize: number,
): WorldPos {
  return {
    x: originX + gridX * tileSize,
    y: originY + gridY * tileSize,
  };
}

// Pick the auto-driven animation state from movement.
// Returns the state to drive, or null if it equals the last auto state (no change).
// Attack/skill/die are driven explicitly elsewhere and must NOT be overridden here.
export function pickAutoAnimState(
  moving: boolean,
  lastAuto: PlayerAnimState | null,
): PlayerAnimState | null {
  const next: PlayerAnimState = moving ? 'walk' : 'idle';
  if (next === lastAuto) return null;
  return next;
}
