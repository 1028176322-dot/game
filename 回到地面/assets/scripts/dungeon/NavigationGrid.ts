// NavigationGrid.ts — first-stage grid pathfinding (§3.7, decision C). Pure TS, NO `cc`.
//
// Design:
//  - Implements INavigation. Per §3.7/decision C, NavigationGrid and a future
//    NavMeshNavigation share ONE `INavigation` interface so upper layers are unaware
//    of the swap (NavMesh deferred to Phase 4). NavMesh is NOT built here.
//  - Grid A* over a TileMap: 4-neighbour, Manhattan heuristic, DETERMINISTIC neighbour
//    ordering + tie-breaking so the same start/goal always yields the same path
//    (required by Replay §5.7). No randomness.
//  - No physics dependency: pathfinding reads TileMap.isWalkable only; real-time
//    collision (if ever needed by callers) goes through ICollisionService, not here.
//
// NOTE on interface: §3.7 mandates "实现 INavigation 接口" but the plan's §5.x gives no
// explicit INavigation signature. Per Agent Contract #4, a MINIMAL signature is defined
// here (findPath / isWalkable) and co-located; extend only when §5.x specifies more.
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.7 + demo5.md.

import type { GridCoord } from './TileMap';
import { TileMap } from './TileMap';

export interface INavigation {
  /** Returns a walkable path from start to goal (inclusive), or [] if unreachable. */
  findPath(start: GridCoord, goal: GridCoord): GridCoord[];
  isWalkable(coord: GridCoord): boolean;
}

// 4-neighbour offsets in a FIXED order (deterministic expansion): +X, -X, +Y, -Y.
const NEIGHBOURS: ReadonlyArray<GridCoord> = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

export class NavigationGrid implements INavigation {
  readonly name = 'NavigationGrid';

  constructor(private readonly _tiles: TileMap) {}

  isWalkable(coord: GridCoord): boolean {
    return this._tiles.isWalkable(coord.x, coord.y);
  }

  findPath(start: GridCoord, goal: GridCoord): GridCoord[] {
    if (!this.isWalkable(start) || !this.isWalkable(goal)) return [];
    if (start.x === goal.x && start.y === goal.y) return [{ x: start.x, y: start.y }];

    const w = this._tiles.width;
    const key = (x: number, y: number) => y * w + x;
    const startK = key(start.x, start.y);
    const goalK = key(goal.x, goal.y);

    const gScore = new Map<number, number>();
    const cameFrom = new Map<number, number>();
    // Open set as a small array; we pop the lowest f deterministically (f, then insertion).
    const open: Array<{ x: number; y: number; k: number; g: number; f: number; seq: number }> = [];
    let seq = 0;

    const h = (x: number, y: number) => Math.abs(x - goal.x) + Math.abs(y - goal.y);
    gScore.set(startK, 0);
    open.push({ x: start.x, y: start.y, k: startK, g: 0, f: h(start.x, start.y), seq: seq++ });

    while (open.length > 0) {
      // Deterministic selection: lowest f, tie-break by lowest insertion seq.
      let bestIdx = 0;
      for (let i = 1; i < open.length; i++) {
        const a = open[i];
        const b = open[bestIdx];
        if (a.f < b.f || (a.f === b.f && a.seq < b.seq)) bestIdx = i;
      }
      const cur = open.splice(bestIdx, 1)[0];

      if (cur.k === goalK) {
        return reconstruct(cameFrom, cur.k, w);
      }

      for (const off of NEIGHBOURS) {
        const nx = cur.x + off.x;
        const ny = cur.y + off.y;
        if (!this._tiles.isWalkable(nx, ny)) continue;
        const nk = key(nx, ny);
        const tentative = cur.g + 1;
        const known = gScore.get(nk);
        if (known === undefined || tentative < known) {
          gScore.set(nk, tentative);
          cameFrom.set(nk, cur.k);
          open.push({ x: nx, y: ny, k: nk, g: tentative, f: tentative + h(nx, ny), seq: seq++ });
        }
      }
    }
    return []; // unreachable
  }
}

function reconstruct(cameFrom: Map<number, number>, goalK: number, w: number): GridCoord[] {
  const path: GridCoord[] = [];
  let k: number | undefined = goalK;
  while (k !== undefined) {
    path.push({ x: k % w, y: (k / w) | 0 });
    k = cameFrom.get(k);
  }
  path.reverse();
  return path;
}
