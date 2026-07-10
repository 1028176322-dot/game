// GameContext.ts — ServiceLocator / DI container (§5.2).
// Pure TS, no `cc` import: runs in node for vitest.
// Authoritative spec: docs/2D转3D全面升级方案.md §5.2.

export const ICollisionService = 'ICollisionService';
export const IAssetCache = 'IAssetCache';
export const IAnimationController = 'IAnimationController';
export const ILogger = 'ILogger';
export const IAudioService = 'IAudioService';
export const IConfigDatabase = 'IConfigDatabase';
export const ISaveManager = 'ISaveManager';
export const IDebugService = 'IDebugService';
export const ICameraBrain = 'ICameraBrain';
export const IEventBus = 'IEventBus';
export const IRuntimeState = 'IRuntimeState';
export const IReplayRecorder = 'IReplayRecorder';

interface Disposable {
  onDestroy?: () => void;
}

export class GameContext {
  private services = new Map<string, unknown>();

  register<T>(token: string, impl: T): void {
    if (this.services.has(token)) {
      throw new Error(`[GameContext] duplicate registration for token: ${token}`);
    }
    this.services.set(token, impl);
  }

  get<T>(token: string): T {
    if (!this.services.has(token)) {
      throw new Error(`[GameContext] service not registered: ${token}`);
    }
    return this.services.get(token) as T;
  }

  // Reverse order: last registered destroyed first (dependents before dependencies).
  onDestroy(): void {
    const tokens = Array.from(this.services.keys());
    for (let i = tokens.length - 1; i >= 0; i--) {
      const svc = this.services.get(tokens[i]) as Disposable | undefined;
      if (svc && typeof svc.onDestroy === 'function') {
        svc.onDestroy();
      }
    }
    this.services.clear();
  }
}
