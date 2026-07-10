// AssetCache.ts — in-memory reference-counted 3D asset cache (§3.6).
// Implements IAssetCache + ILifecycle.
//
// Design:
//  - Pure TS, NO `cc` import  → runs under node/vitest (DoD: 未引入 cc).
//  - Underlying load is DELEGATED to an injected loader (AssetBundleService), so the
//    cache does NOT re-implement asset loading (reuse rule, §3.6 — 禁止重复实现).
//  - Reference counting: load() +1, release() -1; 0 → deferred drop (Release Queue, 防抖动).
//
// DI token `IAssetCache` (string) is exported from ../core/GameContext (single source, §5.2).
// Register: ctx.register(IAssetCache, new AssetCache(loader)).
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.6.

import type { GameContext } from '../core/GameContext';
import type { ILifecycle } from '../core/LifecycleManager';

export interface IAssetCache {
  load(id: string): Promise<unknown>;
  release(id: string): void;
  refCount(id: string): number;
}

export type AssetCacheLoader = (id: string) => Promise<unknown>;

interface CacheEntry {
  asset: unknown;
  refs: number;
}

export class AssetCache implements IAssetCache, ILifecycle {
  readonly name = 'AssetCache';

  private readonly _entries = new Map<string, CacheEntry>();
  private readonly _pendingRelease = new Set<string>();
  private _ctx: GameContext | null = null;
  private _destroyed = false;

  constructor(
    private readonly _loader: AssetCacheLoader,
    private readonly _releaseDelayMs: number = 1000,
  ) {}

  // --- ILifecycle (§5.1) ---
  initialize(ctx: GameContext): void {
    this._ctx = ctx;
  }
  enter(): void {}
  exit(): void {}
  pause(): void {}
  resume(): void {}
  destroy(): void {
    // Immediate release of all entries on shutdown (no deferred wait).
    this._entries.clear();
    this._pendingRelease.clear();
    this._destroyed = true;
  }

  // --- IAssetCache (§3.6) ---
  async load(id: string): Promise<unknown> {
    if (this._destroyed) {
      throw new Error(`[AssetCache] load after destroy: ${id}`);
    }
    const existing = this._entries.get(id);
    if (existing) {
      existing.refs += 1;
      return existing.asset;
    }
    const asset = await this._loader(id);
    this._entries.set(id, { asset, refs: 1 });
    return asset;
  }

  release(id: string): void {
    const entry = this._entries.get(id);
    if (!entry || entry.refs === 0) return;
    entry.refs -= 1;
    if (entry.refs === 0) {
      this._scheduleRelease(id);
    }
  }

  refCount(id: string): number {
    return this._entries.get(id)?.refs ?? 0;
  }

  // §3.6 Release Queue: defer actual drop to avoid load/release thrash (防抖动).
  private _scheduleRelease(id: string): void {
    if (this._pendingRelease.has(id)) return;
    this._pendingRelease.add(id);
    setTimeout(() => {
      this._pendingRelease.delete(id);
      const entry = this._entries.get(id);
      if (entry && entry.refs === 0) {
        this._entries.delete(id);
      }
    }, this._releaseDelayMs);
  }
}
