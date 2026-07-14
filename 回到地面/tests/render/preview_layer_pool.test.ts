import { describe, it, expect } from 'vitest';
import { PreviewLayerPool, DEFAULT_PREVIEW_LAYERS } from '../../assets/scripts/render/preview_layer_pool';

describe('PreviewLayerPool', () => {
  it('allocates unique layers up to pool size', () => {
    const pool = new PreviewLayerPool();
    const a = pool.allocate('A');
    const b = pool.allocate('A');
    const c = pool.allocate('A');
    const d = pool.allocate('A');
    expect([a, b, c, d].sort()).toEqual([...DEFAULT_PREVIEW_LAYERS].sort());
    expect(pool.freeCount).toBe(0);
  });

  it('returns null when exhausted (fail-fast, no reuse of last layer)', () => {
    const pool = new PreviewLayerPool();
    pool.allocate('A');
    pool.allocate('A');
    pool.allocate('A');
    pool.allocate('A');
    const fifth = pool.allocate('A');
    expect(fifth).toBeNull();
  });

  it('releases a layer back to the pool and re-allocates it', () => {
    const pool = new PreviewLayerPool();
    const a = pool.allocate('A')!;
    expect(pool.freeCount).toBe(DEFAULT_PREVIEW_LAYERS.length - 1);
    pool.release(a);
    expect(pool.freeCount).toBe(DEFAULT_PREVIEW_LAYERS.length);
    const again = pool.allocate('B');
    expect(again).toBe(a);
  });

  it('release is idempotent', () => {
    const pool = new PreviewLayerPool();
    const a = pool.allocate('A')!;
    pool.release(a);
    pool.release(a); // second release must be a no-op
    expect(pool.freeCount).toBe(DEFAULT_PREVIEW_LAYERS.length);
  });

  it('releaseByOwner frees all layers of an owner', () => {
    const pool = new PreviewLayerPool();
    pool.allocate('A');
    pool.allocate('A');
    pool.allocate('B');
    expect(pool.freeCount).toBe(DEFAULT_PREVIEW_LAYERS.length - 3);
    const released = pool.releaseByOwner('A');
    expect(released.length).toBe(2);
    expect(pool.freeCount).toBe(DEFAULT_PREVIEW_LAYERS.length - 1);
    const releasedB = pool.releaseByOwner('B');
    expect(releasedB.length).toBe(1);
    expect(pool.freeCount).toBe(DEFAULT_PREVIEW_LAYERS.length);
  });

  it('does not cross-owner reuse on exhaustion', () => {
    const pool = new PreviewLayerPool();
    const aLayers = [
      pool.allocate('A'),
      pool.allocate('A'),
      pool.allocate('A'),
      pool.allocate('A'),
    ];
    expect(pool.allocate('B')).toBeNull(); // B must NOT get any of A's layers
    expect(aLayers.every((l) => l !== null)).toBe(true);
  });
});
