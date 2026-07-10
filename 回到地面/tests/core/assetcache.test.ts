// tests/core/assetcache.test.ts — D1 DoD verification (§3.6).
// Pure-TS logic only: reference counting, deferred release (Release Queue), destroy.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AssetCache } from '../../assets/scripts/assets/AssetCache';

function makeLoader(assets: Record<string, unknown>) {
  return vi.fn((id: string) => {
    if (!(id in assets)) return Promise.reject(new Error(`missing: ${id}`));
    return Promise.resolve(assets[id]);
  });
}

describe('AssetCache', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('loads once and increments ref count on repeat load', async () => {
    const loader = makeLoader({ m1: { id: 'm1' } });
    const cache = new AssetCache(loader as any);
    const a = await cache.load('m1');
    const b = await cache.load('m1');
    expect(a).toBe(b);
    expect(cache.refCount('m1')).toBe(2);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('release decrements ref count; entry dropped after release delay', async () => {
    const loader = makeLoader({ m1: {} });
    const cache = new AssetCache(loader as any, 1000);
    await cache.load('m1');
    cache.release('m1');
    expect(cache.refCount('m1')).toBe(0);
    // entry still cached during deferral window
    vi.advanceTimersByTime(1000);
    // after drop, a new load re-invokes the loader
    await cache.load('m1');
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('re-load during release delay reuses cached asset (防抖动)', async () => {
    const loader = makeLoader({ m1: {} });
    const cache = new AssetCache(loader as any, 1000);
    await cache.load('m1');
    cache.release('m1');
    expect(cache.refCount('m1')).toBe(0);
    // re-load before timer fires → reuse, no new loader call
    await cache.load('m1');
    expect(cache.refCount('m1')).toBe(1);
    expect(loader).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1000);
    // still referenced (refs=1), must NOT be dropped
    expect(cache.refCount('m1')).toBe(1);
  });

  it('release of unknown id is a no-op', () => {
    const loader = makeLoader({});
    const cache = new AssetCache(loader as any);
    expect(() => cache.release('nope')).not.toThrow();
    expect(cache.refCount('nope')).toBe(0);
  });

  it('destroy clears all entries and rejects further loads', async () => {
    const loader = makeLoader({ m1: {} });
    const cache = new AssetCache(loader as any, 1000);
    await cache.load('m1');
    cache.destroy();
    expect(cache.refCount('m1')).toBe(0);
    await expect(cache.load('m1')).rejects.toThrow();
  });
});
