/**
 * preview_layer_pool.ts — Pure-TS preview layer allocator for UI-3D previews.
 *
 * Each PreviewSurface needs an isolated user layer (bit 0-19) so its offscreen
 * preview camera only renders its own model and never cross-renders another
 * surface's model. This module owns a small fixed pool of user-layer bits and
 * hands them out / recycles them by ownerId.
 *
 * IMPORTANT (fail-fast): when the pool is exhausted, `allocate` returns `null`.
 * It MUST NOT silently reuse the last layer — that would make two concurrent
 * surfaces share one layer and cross-render each other's models (very hard to
 * debug). The caller (PreviewSurface / SceneModelPreview) must treat `null` as
 * a safe no-op (the slot simply shows no 3D preview).
 *
 * No `cc` import — unit-testable in plain Node (vitest).
 */

export const DEFAULT_PREVIEW_LAYERS: readonly number[] = [
  1 << 19,
  1 << 18,
  1 << 17,
  1 << 16,
];

export class PreviewLayerPool {
  private readonly _layers: readonly number[];
  private readonly _free: number[];
  private readonly _ownerOf = new Map<number, string>();

  constructor(layers: readonly number[] = DEFAULT_PREVIEW_LAYERS) {
    // Copy + de-dup defensively; the pool must only contain unique bits.
    const unique = Array.from(new Set(layers));
    this._layers = unique;
    this._free = [...unique];
  }

  /** Allocate one free layer for `ownerId`. Returns null when exhausted (fail-fast). */
  allocate(ownerId: string): number | null {
    const layer = this._free.pop();
    if (layer === undefined) {
      return null;
    }
    this._ownerOf.set(layer, ownerId);
    return layer;
  }

  /** Release a single layer back to the pool (idempotent). */
  release(layer: number): void {
    if (!this._ownerOf.has(layer)) {
      return; // not currently allocated (already released / never allocated)
    }
    this._ownerOf.delete(layer);
    this._free.push(layer);
  }

  /** Release every layer owned by `ownerId`. Returns the released layers. */
  releaseByOwner(ownerId: string): number[] {
    const released: number[] = [];
    for (const [layer, owner] of this._ownerOf) {
      if (owner === ownerId) {
        this._ownerOf.delete(layer);
        this._free.push(layer);
        released.push(layer);
      }
    }
    return released;
  }

  get freeCount(): number {
    return this._free.length;
  }

  get totalCount(): number {
    return this._layers.length;
  }
}
