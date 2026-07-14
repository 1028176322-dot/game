// RoomRuntime.ts — runtime instance of a room (§3.7 tail + §5.1 room-level lifecycle).
// Pure TS, NO `cc` import -> node/vitest testable.
//
// Design (§5.1 layering: SceneFlowService -> RoomRuntime.enter/exit -> BattleRuntime):
//  - Implements ILifecycle (red line 3). Room-level lifecycle is owned HERE and driven
//    by LifecycleManager. enter/exit/destroy manage activation + resource release.
//  - Resource leak prevention (§3.6): on load() it acquires this room's assetIds via the
//    injected IAssetCache and reference-counts them; exit()/destroy() release EXACTLY the
//    acquired ids (idempotent) so 返回大厅/重开 never leaks (RoomRuntime.destroy ->
//    batch AssetCache.release, §3.6/§5.1).
//  - No physics dependency: if a room needs collision it must go through ICollisionService
//    (ctx.get), never PhysicsSystem (red line 1). Demo5 itself needs none.
//  - DI token `IRoomRuntime` is co-located here (GameContext has no such token; not in the
//    allowed edit range). Mirrors Demo4's ISkillGraph/ISkillExecutor co-location.
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.7 + §5.1 + demo5.md.

import type { GameContext } from '../core/GameContext';
import { IAssetCache } from '../core/GameContext';
import type { ILifecycle } from '../core/LifecycleManager';
import type { IAssetCache as IAssetCacheApi } from '../assets/AssetCache';
import type { INavigation } from './NavigationGrid';
import type { RoomData } from './RoomBuilder';
import type { GridCoord } from './TileMap';

// DI token — single source for this service (co-located, see header note).
export const IRoomRuntime = 'IRoomRuntime';

export interface RoomEntity {
  id: string;
  x: number;
  y: number;
}

export class RoomRuntime implements ILifecycle {
  readonly name = 'RoomRuntime';

  private _ctx: GameContext | null = null;
  private _cache: IAssetCacheApi | null = null;
  private readonly _loaded: string[] = [];
  private readonly _entities = new Map<string, RoomEntity>();
  private _active = false;

  constructor(
    private readonly _room: RoomData,
    private readonly _nav: INavigation,
  ) {}

  get roomId(): string {
    return this._room.roomId;
  }
  get navigation(): INavigation {
    return this._nav;
  }
  get active(): boolean {
    return this._active;
  }
  get loadedAssetCount(): number {
    return this._loaded.length;
  }

  // --- ILifecycle (§5.1) ---
  initialize(ctx: GameContext): void {
    this._ctx = ctx;
    // Pull the asset cache from the container (red line 4: no `new`, inject via ctx.get).
    // getOptional: GameBootstrap registers IAssetCache at the tail of its async startup();
    // during the dungeon scene's synchronous _wireSystems the token may not be registered
    // yet. _cache is already designed nullable (guarded at lines 99/109), so a missing token
    // just means the new asset-cache pipeline is inactive this run — legacy flow is preserved.
    this._cache = ctx.getOptional<IAssetCacheApi>(IAssetCache);
  }

  enter(): void {
    this._active = true;
  }

  exit(): void {
    // Leaving the room: release this room's assets (§5.1 返回大厅 -> AssetCache 释放本房).
    this._active = false;
    this._releaseAll();
  }

  pause(): void {
    this._active = false;
  }

  resume(): void {
    this._active = true;
  }

  destroy(): void {
    // Reset -> re-initialize path (§5.1). Release any still-held assets (idempotent).
    this._releaseAll();
    this._entities.clear();
    this._active = false;
    this._cache = null;
    this._ctx = null;
  }

  // --- Resource management (§3.6) ---
  // Acquire every asset this room needs, reference-counted through IAssetCache.
  async load(): Promise<void> {
    if (!this._cache) {
      // Legacy flow: IAssetCache not yet registered (e.g., _wireSystems runs before
      // GameBootstrap._wireInfra completes). Skip asset preloading; the new asset-cache
      // pipeline is inactive for this run.
      console.warn('[RoomRuntime] IAssetCache unavailable; skipping asset preload.');
      return;
    }
    for (const id of this._room.assetIds) {
      await this._cache.load(id);
      this._loaded.push(id);
    }
  }

  private _releaseAll(): void {
    if (!this._cache) return;
    for (const id of this._loaded) {
      this._cache.release(id);
    }
    this._loaded.length = 0;
  }

  // --- Entity management ---
  addEntity(e: RoomEntity): void {
    this._entities.set(e.id, { id: e.id, x: e.x, y: e.y });
    this._room.tileMap.occupy(e.x, e.y);
  }

  removeEntity(id: string): void {
    const e = this._entities.get(id);
    if (!e) return;
    this._room.tileMap.free(e.x, e.y);
    this._entities.delete(id);
  }

  get entityCount(): number {
    return this._entities.size;
  }

  // Convenience: path between two grid cells via the room's navigation.
  findPath(start: GridCoord, goal: GridCoord): GridCoord[] {
    return this._nav.findPath(start, goal);
  }
}
