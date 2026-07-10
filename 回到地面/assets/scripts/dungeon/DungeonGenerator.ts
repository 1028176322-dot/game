// DungeonGenerator.ts — dungeon room-layout generation (§3.7, first stage of the
// GridManager split). Pure TS, NO `cc` import -> node/vitest testable.
//
// Design:
//  - Deterministic: seeded via the existing xorshift32 `Rng` (core/rng/Rng), NEVER
//    Math.random (red line 5). Same seed + zone -> identical layout.
//  - Reuses the original DAG room-type vocabulary (start/battle/elite/reward/boss)
//    conceptually; produces a plain data `DungeonLayout` consumed by RoomBuilder.
//  - Single responsibility: layout ONLY. It does not build tiles/pieces (RoomBuilder)
//    nor run navigation (NavigationGrid) nor own lifecycle (RoomRuntime).
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.7 + demo5.md.

import { Rng } from '../core/rng/Rng';

export type RoomType = 'start' | 'battle' | 'elite' | 'reward' | 'boss';

export interface RoomLayout {
  id: string;
  type: RoomType;
  /** grid cell coordinates of the room on the dungeon macro-grid */
  gridX: number;
  gridY: number;
  /** interior tile dimensions (used later by RoomBuilder/TileMap) */
  width: number;
  height: number;
  /** ids of rooms this room connects to (bidirectional edges) */
  connections: string[];
}

export interface DungeonLayout {
  seed: number;
  zone: string;
  rooms: RoomLayout[];
  startRoomId: string;
  bossRoomId: string;
}

export interface DungeonGenOptions {
  /** total rooms including start + boss; clamped to [3, 12] */
  roomCount?: number;
  /** interior size range for a normal room */
  minSize?: number;
  maxSize?: number;
}

export class DungeonGenerator {
  readonly name = 'DungeonGenerator';

  // Deterministic layout: linear spine (start -> ... -> boss) with occasional side
  // branches. All randomness comes from the seeded Rng, so replays are identical.
  generate(seed: number, zone: string, opts: DungeonGenOptions = {}): DungeonLayout {
    const rng = new Rng(seed);
    const count = clamp(opts.roomCount ?? 6, 3, 12);
    const minSize = opts.minSize ?? 6;
    const maxSize = opts.maxSize ?? 10;

    const rooms: RoomLayout[] = [];
    // Spine along +X. Each room gets a deterministic interior size.
    for (let i = 0; i < count; i++) {
      const type = pickType(i, count);
      rooms.push({
        id: `r${i}`,
        type,
        gridX: i,
        gridY: 0,
        width: oddSize(rng, minSize, maxSize),
        height: oddSize(rng, minSize, maxSize),
        connections: [],
      });
    }

    // Connect the spine sequentially.
    for (let i = 0; i < count - 1; i++) {
      connect(rooms[i], rooms[i + 1]);
    }

    // Deterministic side branches: for interior rooms, sometimes add a branch room
    // offset on +Y. Kept simple + bounded so tests stay stable.
    for (let i = 1; i < count - 1; i++) {
      if (rng.chance(0.35)) {
        const branch: RoomLayout = {
          id: `r${i}b`,
          type: 'reward',
          gridX: i,
          gridY: 1,
          width: oddSize(rng, minSize, maxSize),
          height: oddSize(rng, minSize, maxSize),
          connections: [],
        };
        connect(rooms[i], branch);
        rooms.push(branch);
      }
    }

    return {
      seed: seed >>> 0,
      zone,
      rooms,
      startRoomId: rooms[0].id,
      bossRoomId: rooms[count - 1].id,
    };
  }
}

function pickType(index: number, count: number): RoomType {
  if (index === 0) return 'start';
  if (index === count - 1) return 'boss';
  // Elite roughly two-thirds along the spine; the rest are battle rooms.
  if (index === Math.floor((count - 1) * 2 / 3)) return 'elite';
  return 'battle';
}

function oddSize(rng: Rng, min: number, max: number): number {
  const v = rng.int(min, max);
  return v % 2 === 0 ? v + 1 : v; // odd so a room has a single center tile
}

function connect(a: RoomLayout, b: RoomLayout): void {
  if (!a.connections.includes(b.id)) a.connections.push(b.id);
  if (!b.connections.includes(a.id)) b.connections.push(a.id);
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
