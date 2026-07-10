// LifecycleManager.ts — unified lifecycle management (§5.1).
// Pure TS, no `cc` import: runs in node for vitest.
// Authoritative spec: docs/2D转3D全面升级方案.md §5.1.
// Strict 1:1 implementation: no extra methods, no extra responsibilities, no DI here.

import type { GameContext } from './GameContext';

export interface ILifecycle {
  initialize(ctx: GameContext): void; // called on creation: register services/listeners, read config
  enter(): void;                       // enter room/scene: activate, prewarm
  exit(): void;                        // leave room/scene: pause logic, keep instance
  pause(): void;                       // pause (background / pause menu): stop updates
  resume(): void;                      // resume: continue updates
  destroy(): void;                     // destroy: unregister listeners, release resources, clear state
}

export class LifecycleManager {
  private systems: ILifecycle[] = [];

  register(s: ILifecycle): void {
    this.systems.push(s);
  }

  enterAll(): void {
    for (const s of this.systems) {
      s.enter();
    }
  }

  exitAll(): void {
    for (const s of this.systems) {
      s.exit();
    }
  }

  pauseAll(): void {
    for (const s of this.systems) {
      s.pause();
    }
  }

  resumeAll(): void {
    for (const s of this.systems) {
      s.resume();
    }
  }

  // Reverse order: last registered destroyed first (dependents before dependencies).
  destroyAll(): void {
    for (let i = this.systems.length - 1; i >= 0; i--) {
      this.systems[i].destroy();
    }
    this.systems = [];
  }
}
