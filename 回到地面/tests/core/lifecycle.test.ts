// tests/core/lifecycle.test.ts — D0-1 DoD verification (§5.1).
import { describe, it, expect } from 'vitest';
import { LifecycleManager } from '../../assets/scripts/core/LifecycleManager';
import type { ILifecycle } from '../../assets/scripts/core/LifecycleManager';

// Shared log records the GLOBAL call sequence, so ordering tests reflect reality.
class MockSystem implements ILifecycle {
  constructor(private name: string, private log: string[]) {}
  initialize(): void {
    this.log.push(`initialize:${this.name}`);
  }
  enter(): void {
    this.log.push(`enter:${this.name}`);
  }
  exit(): void {
    this.log.push(`exit:${this.name}`);
  }
  pause(): void {
    this.log.push(`pause:${this.name}`);
  }
  resume(): void {
    this.log.push(`resume:${this.name}`);
  }
  destroy(): void {
    this.log.push(`destroy:${this.name}`);
  }
}

describe('LifecycleManager', () => {
  it('enterAll calls systems in registration order', () => {
    const log: string[] = [];
    const mgr = new LifecycleManager();
    mgr.register(new MockSystem('a', log));
    mgr.register(new MockSystem('b', log));
    mgr.register(new MockSystem('c', log));
    mgr.enterAll();
    expect(log).toEqual(['enter:a', 'enter:b', 'enter:c']);
  });

  it('destroyAll calls systems in reverse (registration) order', () => {
    const log: string[] = [];
    const mgr = new LifecycleManager();
    mgr.register(new MockSystem('a', log));
    mgr.register(new MockSystem('b', log));
    mgr.register(new MockSystem('c', log));
    mgr.destroyAll();
    // reverse order overall: c -> b -> a
    expect(log).toEqual(['destroy:c', 'destroy:b', 'destroy:a']);
  });

  it('pause/resume/exit broadcast to every system in registration order', () => {
    const log: string[] = [];
    const mgr = new LifecycleManager();
    mgr.register(new MockSystem('a', log));
    mgr.register(new MockSystem('b', log));
    mgr.pauseAll();
    mgr.resumeAll();
    mgr.exitAll();
    expect(log).toEqual([
      'pause:a', 'pause:b',
      'resume:a', 'resume:b',
      'exit:a', 'exit:b',
    ]);
  });
});
