// tests/core/perf.test.ts — Demo6: PerfSampler determinism + DebugPanel integration.
import { describe, it, expect } from 'vitest';
import { PerfSampler, IPerfSource } from '../../assets/scripts/debug/PerfSampler';
import { DebugPanel } from '../../assets/scripts/debug/DebugPanel';

describe('PerfSampler', () => {
  it('computes deterministic FPS from injected frame deltas (~60fps)', () => {
    const s = new PerfSampler(60);
    for (let i = 0; i < 60; i++) s.tick(1000 / 60);
    expect(s.fps()).toBeCloseTo(60, 5);
    expect(s.frameTimeMs()).toBeCloseTo(1000 / 60, 5);
  });

  it('smooths via sliding window (window fully replaced -> ~30fps)', () => {
    const s = new PerfSampler(30);
    for (let i = 0; i < 30; i++) s.tick(1000 / 60); // fill window with 60fps
    expect(s.fps()).toBeCloseTo(60, 5);
    for (let i = 0; i < 30; i++) s.tick(1000 / 30); // replace entire window with 30fps
    expect(s.fps()).toBeCloseTo(30, 5); // window now holds only 30fps samples
  });

  it('reports 0 fps / 0 frame-time for an empty window', () => {
    const s = new PerfSampler();
    expect(s.fps()).toBe(0);
    expect(s.frameTimeMs()).toBe(0);
  });

  it('ignores non-finite and negative deltas', () => {
    const s = new PerfSampler(60);
    s.tick(NaN);
    s.tick(-5);
    s.tick(16.67);
    expect(s.fps()).toBeCloseTo(1000 / 16.67, 1);
  });

  it('reads memory / draw-call from the injected IPerfSource', () => {
    const src: IPerfSource = { getMemoryMB: () => 123.5, getDrawCall: () => 42 };
    const s = new PerfSampler();
    s.setSource(src);
    expect(s.memoryMB()).toBe(123.5);
    expect(s.drawCall()).toBe(42);
  });

  it('returns a provider-compatible snapshot shape', () => {
    const s = new PerfSampler(60);
    for (let i = 0; i < 60; i++) s.tick(16.67);
    const snap = s.getSnapshot();
    expect(snap.fps).toBeCloseTo(60, 0);
    expect(snap.frameTimeMs).toBeCloseTo(16.67, 1);
    expect(snap.memoryMB).toBeNull();
    expect(snap.drawCall).toBeNull();
  });

  it('reset clears the window', () => {
    const s = new PerfSampler(60);
    for (let i = 0; i < 10; i++) s.tick(16.67);
    s.reset();
    expect(s.fps()).toBe(0);
  });

  it('implements ILifecycle without throwing; destroy resets state', () => {
    const s = new PerfSampler(60);
    for (let i = 0; i < 10; i++) s.tick(16.67);
    expect(() => {
      s.initialize({} as any);
      s.enter();
      s.pause();
      s.resume();
      s.exit();
      s.destroy();
    }).not.toThrow();
    expect(s.fps()).toBe(0);
  });
});

describe('DebugPanel + PerfSampler integration', () => {
  it('delegates perf metrics to the wired PerfSampler', () => {
    const panel = new DebugPanel();
    const perf = new PerfSampler(60);
    panel.setPerfSampler(perf);
    for (let i = 0; i < 60; i++) panel.update(1000 / 60);
    const snap = panel.sample();
    expect(snap.fps).toBeCloseTo(60, 0);
    expect(snap.frameTimeMs).toBeCloseTo(1000 / 60, 1);
  });

  it('falls back to instantaneous FPS when no PerfSampler is wired (§5.5 parity)', () => {
    const panel = new DebugPanel();
    panel.update(1000 / 30);
    const snap = panel.sample();
    expect(snap.fps).toBe(30);
  });
});
