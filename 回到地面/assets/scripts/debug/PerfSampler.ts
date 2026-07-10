// assets/scripts/debug/PerfSampler.ts — Demo6 performance baseline sampler (§5.5 / §8.1).
// Pure TS, no `cc` import: runs in node for vitest.
// Dedicated sampler for the 100-monsters-on-screen stress baseline. Produces smoothed
// FPS / frame-time / memory / draw-call consumed by DebugPanel (§5.5). No Math.random
// (red line 5): FPS is derived purely from injected frame deltas, fully deterministic.

import { ILifecycle } from '../core/LifecycleManager';
import type { GameContext } from '../core/GameContext';
import type { DebugSnapshot } from './DebugPanel';

// Engine feeds real per-frame memory (MB) and draw-call counts. Injected so the
// sampler stays pure-TS and testable without a runtime.
export interface IPerfSource {
  getMemoryMB(): number | null;
  getDrawCall(): number | null;
}

export class PerfSampler implements ILifecycle {
  private _window: number[] = [];
  private _capacity: number;
  private _source: IPerfSource | null = null;

  constructor(windowSize = 60) {
    this._capacity = Math.max(1, windowSize | 0);
  }

  setSource(src: IPerfSource | null): void {
    this._source = src;
  }

  // Record one frame's delta (ms) into the sliding window for smoothed metrics.
  tick(dtMs: number): void {
    if (!Number.isFinite(dtMs) || dtMs < 0) return;
    this._window.push(dtMs);
    if (this._window.length > this._capacity) {
      this._window.shift();
    }
  }

  // Smoothed FPS over the window. Deterministic: count * 1000 / sum(dt).
  fps(): number {
    const sum = this._sum();
    if (sum <= 0) return 0;
    return (this._window.length * 1000) / sum;
  }

  frameTimeMs(): number {
    if (this._window.length === 0) return 0;
    return this._sum() / this._window.length;
  }

  memoryMB(): number | null {
    return this._source ? this._source.getMemoryMB() : null;
  }

  drawCall(): number | null {
    return this._source ? this._source.getDrawCall() : null;
  }

  // Provider-compatible snapshot for DebugPanel aggregation (Map, no switch).
  getSnapshot(): Partial<DebugSnapshot> {
    return {
      fps: this.fps(),
      frameTimeMs: this.frameTimeMs(),
      memoryMB: this.memoryMB(),
      drawCall: this.drawCall(),
    };
  }

  reset(): void {
    this._window = [];
  }

  private _sum(): number {
    let s = 0;
    for (const v of this._window) s += v;
    return s;
  }

  // ILifecycle (red line 3): no external resources; only destroy clears state.
  initialize(_ctx: GameContext): void {}
  enter(): void {}
  pause(): void {}
  resume(): void {}
  exit(): void {}
  destroy(): void {
    this.reset();
    this._source = null;
  }
}
