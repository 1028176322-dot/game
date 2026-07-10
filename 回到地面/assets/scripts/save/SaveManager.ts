// assets/scripts/save/SaveManager.ts — §5.6 SaveGame architecture + crash recovery.
// Pure TS, no `cc` import: persistence backend is injected (MemorySaveBackend for
// tests / fallback; engine wires a localStorage-backed backend in GameBootstrap).
// Token: ISaveManager (declared in core/GameContext.ts, per §5.x service list).

import { GameContext } from '../core/GameContext';
import { ILifecycle } from '../core/LifecycleManager';

export interface SaveBackend {
  load(key: string): string | null;
  save(key: string, value: string): void;
  remove(key: string): void;
}

export class MemorySaveBackend implements SaveBackend {
  private _store = new Map<string, string>();

  load(key: string): string | null {
    return this._store.has(key) ? (this._store.get(key) as string) : null;
  }
  save(key: string, value: string): void {
    this._store.set(key, value);
  }
  remove(key: string): void {
    this._store.delete(key);
  }
}

export const SAVE_VERSION = 1;

// State shapes grounded in the plan's prose (§5.6):
//   RunState   — "局内：种子/层数/已获道具"
//   PlayerState— "跨局：解锁/等级/设置"
//   DungeonState / EnemyState — minimal layered snapshots; fields extend later.
export interface RunState {
  version: number;
  seed: number;
  floor: number;
  items: unknown[];
}
export interface PlayerState {
  version: number;
  unlocks: string[];
  level: number;
  settings: Record<string, unknown>;
}
export interface DungeonState {
  version: number;
  zone: string;
  clearedRooms: string[];
  currentRoom: string;
}
export interface EnemyState {
  version: number;
  id: string;
  hp: number;
  maxHp: number;
}

// 1:1 with the plan's `interface SaveManager` (§5.6). No extra public methods.
export interface SaveManager {
  saveRun(state: RunState): void;
  savePlayer(state: PlayerState): void;
  saveDungeon(state: DungeonState): void;
  saveEnemy(state: EnemyState): void;
  saveSeed(seed: number): void;
  loadRun(): RunState | null;
}

const KEY = {
  run: 'save:run',
  player: 'save:player',
  dungeon: 'save:dungeon',
  enemy: 'save:enemy',
  seed: 'save:seed',
} as const;

export class SaveManagerImpl implements SaveManager, ILifecycle {
  private readonly _backend: SaveBackend;
  private _ctx: GameContext | null = null;

  constructor(backend: SaveBackend) {
    this._backend = backend;
  }

  initialize(ctx: GameContext): void {
    this._ctx = ctx;
  }

  private _write(key: string, value: unknown): void {
    this._backend.save(key, JSON.stringify(value));
  }

  private _read<T>(key: string): T | null {
    const raw = this._backend.load(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  saveRun(state: RunState): void {
    this._write(KEY.run, state);
  }
  savePlayer(state: PlayerState): void {
    this._write(KEY.player, state);
  }
  saveDungeon(state: DungeonState): void {
    this._write(KEY.dungeon, state);
  }
  saveEnemy(state: EnemyState): void {
    this._write(KEY.enemy, state);
  }
  saveSeed(seed: number): void {
    this._write(KEY.seed, { seed });
  }
  loadRun(): RunState | null {
    return this._read<RunState>(KEY.run);
  }

  destroy(): void {
    // Nothing buffered in memory; the backend owns persistence.
    this._ctx = null;
  }
}
