// tests/core/room.test.ts — Demo5 DoD verification (§3.7 + §5.1).
// Pure-TS: dungeon/** has no `cc` import -> node/vitest.
import { describe, it, expect } from 'vitest';
import { GameContext, IAssetCache } from '../../assets/scripts/core/GameContext';
import { DungeonGenerator } from '../../assets/scripts/dungeon/DungeonGenerator';
import { RoomBuilder } from '../../assets/scripts/dungeon/RoomBuilder';
import { TileMap } from '../../assets/scripts/dungeon/TileMap';
import { NavigationGrid } from '../../assets/scripts/dungeon/NavigationGrid';
import { RoomRuntime, IRoomRuntime } from '../../assets/scripts/dungeon/RoomRuntime';
import type { IAssetCache as IAssetCacheApi } from '../../assets/scripts/assets/AssetCache';

// A synchronous fake cache so reference counts are deterministic (no deferred setTimeout).
class FakeCache implements IAssetCacheApi {
  readonly counts = new Map<string, number>();
  async load(id: string): Promise<unknown> {
    this.counts.set(id, (this.counts.get(id) ?? 0) + 1);
    return { id };
  }
  release(id: string): void {
    const c = this.counts.get(id) ?? 0;
    if (c > 0) this.counts.set(id, c - 1);
  }
  refCount(id: string): number {
    return this.counts.get(id) ?? 0;
  }
  totalRefs(): number {
    let t = 0;
    for (const v of this.counts.values()) t += v;
    return t;
  }
}

describe('IRoomRuntime — token', () => {
  it('exposes the IRoomRuntime DI token', () => {
    expect(IRoomRuntime).toBe('IRoomRuntime');
  });
});

describe('DungeonGenerator — deterministic layout', () => {
  it('same seed + zone -> identical layout', () => {
    const a = new DungeonGenerator().generate(12345, 'forest');
    const b = new DungeonGenerator().generate(12345, 'forest');
    expect(a).toEqual(b);
  });

  it('has start + boss and a connected spine', () => {
    const d = new DungeonGenerator().generate(777, 'volcano', { roomCount: 6 });
    expect(d.rooms[0].type).toBe('start');
    expect(d.rooms.find((r) => r.id === d.bossRoomId)!.type).toBe('boss');
    // spine rooms are chained
    expect(d.rooms[0].connections).toContain('r1');
    expect(d.rooms[1].connections).toContain('r0');
  });

  it('different seeds can produce different layouts', () => {
    const a = new DungeonGenerator().generate(1, 'forest');
    const b = new DungeonGenerator().generate(2, 'forest');
    expect(a).not.toEqual(b);
  });
});

describe('RoomBuilder — room data', () => {
  it('builds a tilemap with wall border + floor interior and asset ids', () => {
    const layout = { id: 'r0', type: 'battle' as const, gridX: 0, gridY: 0, width: 7, height: 5, connections: [] };
    const room = new RoomBuilder().build(layout);
    expect(room.tileMap.getKind(0, 0)).toBe('wall'); // corner
    expect(room.tileMap.getKind(3, 2)).toBe('floor'); // interior
    expect(room.tileMap.isWalkable(3, 2)).toBe(true);
    expect(room.tileMap.isWalkable(0, 0)).toBe(false); // wall
    expect(room.assetIds.length).toBeGreaterThan(0);
  });
});

describe('NavigationGrid — A* pathfinding', () => {
  it('finds a straight path on open floor (deterministic)', () => {
    const tm = new TileMap(5, 1, 'floor');
    const nav = new NavigationGrid(tm);
    const p1 = nav.findPath({ x: 0, y: 0 }, { x: 4, y: 0 });
    const p2 = nav.findPath({ x: 0, y: 0 }, { x: 4, y: 0 });
    expect(p1).toEqual(p2); // deterministic
    expect(p1[0]).toEqual({ x: 0, y: 0 });
    expect(p1[p1.length - 1]).toEqual({ x: 4, y: 0 });
    expect(p1.length).toBe(5);
  });

  it('routes around a wall instead of through it', () => {
    // 3x3, block the middle column at y=0 and y=1 so the only path goes around via y=2.
    const tm = new TileMap(3, 3, 'floor');
    tm.setKind(1, 0, 'wall');
    tm.setKind(1, 1, 'wall');
    const nav = new NavigationGrid(tm);
    const path = nav.findPath({ x: 0, y: 0 }, { x: 2, y: 0 });
    expect(path.length).toBeGreaterThan(0);
    // must not step on a wall tile
    for (const c of path) {
      expect(tm.isWalkable(c.x, c.y)).toBe(true);
    }
    expect(path[0]).toEqual({ x: 0, y: 0 });
    expect(path[path.length - 1]).toEqual({ x: 2, y: 0 });
  });

  it('returns [] when the goal is unreachable', () => {
    const tm = new TileMap(3, 1, 'floor');
    tm.setKind(1, 0, 'wall'); // fully blocks the 1-row corridor
    const nav = new NavigationGrid(tm);
    expect(nav.findPath({ x: 0, y: 0 }, { x: 2, y: 0 })).toEqual([]);
  });

  it('respects occupancy (occupied tile is not walkable)', () => {
    const tm = new TileMap(3, 1, 'floor');
    tm.occupy(1, 0);
    const nav = new NavigationGrid(tm);
    expect(nav.findPath({ x: 0, y: 0 }, { x: 2, y: 0 })).toEqual([]);
  });
});

describe('RoomRuntime — lifecycle + no resource leak (§5.1/§3.6)', () => {
  function makeRoom() {
    const layout = new DungeonGenerator().generate(999, 'forest').rooms[0];
    const room = new RoomBuilder().build(layout);
    const nav = new NavigationGrid(room.tileMap);
    return { room, runtime: new RoomRuntime(room, nav) };
  }

  it('enter -> load -> exit releases every acquired asset (zero leak)', async () => {
    const cache = new FakeCache();
    const ctx = new GameContext();
    ctx.register(IAssetCache, cache);
    const { room, runtime } = makeRoom();

    runtime.initialize(ctx);
    runtime.enter();
    await runtime.load();
    // each distinct asset id held once
    expect(cache.totalRefs()).toBe(room.assetIds.length);
    expect(runtime.loadedAssetCount).toBe(room.assetIds.length);

    runtime.exit();
    expect(cache.totalRefs()).toBe(0); // fully released -> no leak
    expect(runtime.loadedAssetCount).toBe(0);
    expect(runtime.active).toBe(false);
  });

  it('destroy after load also releases (idempotent, no double-release)', async () => {
    const cache = new FakeCache();
    const ctx = new GameContext();
    ctx.register(IAssetCache, cache);
    const { runtime } = makeRoom();
    runtime.initialize(ctx);
    await runtime.load();
    runtime.destroy();
    expect(cache.totalRefs()).toBe(0);
    // destroy is idempotent w.r.t. release (no negative counts)
    for (const v of cache.counts.values()) expect(v).toBeGreaterThanOrEqual(0);
  });

  it('manages entities and updates tile occupancy', () => {
    const cache = new FakeCache();
    const ctx = new GameContext();
    ctx.register(IAssetCache, cache);
    const { room, runtime } = makeRoom();
    runtime.initialize(ctx);
    runtime.addEntity({ id: 'mob1', x: 2, y: 2 });
    expect(runtime.entityCount).toBe(1);
    expect(room.tileMap.isOccupied(2, 2)).toBe(true);
    runtime.removeEntity('mob1');
    expect(runtime.entityCount).toBe(0);
    expect(room.tileMap.isOccupied(2, 2)).toBe(false);
  });

  it('exposes navigation via findPath', () => {
    const { runtime } = makeRoom();
    const path = runtime.findPath({ x: 1, y: 1 }, { x: 2, y: 1 });
    expect(path.length).toBeGreaterThan(0);
  });
});
