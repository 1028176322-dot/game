// AudioSystem.ts — audio orchestration (§5.8).
// Pure TS, NO `cc` import: runs in node for vitest. Actual playback is delegated to an
// injected AudioSink (the engine wires a cc.AudioSource-backed sink at runtime).
// Authoritative spec: docs/2D转3D全面升级方案.md §5.8.
//
// Design notes:
//  - Implements the IAudioService contract (token exported from GameContext, reused here).
//  - Six sub-systems: BGM / SFX / Voice / Ambient / 3D (positional) + Snapshot (mix presets).
//  - 3D audio attenuation is distance-based from an injectable listener position; the engine
//    feeds the listener each frame (typically CameraBrain's world position) via setListener.
//  - Parameters are config-driven (IConfigDatabase.getAudio) so planners tune JSON w/o code.
//  - No `switch` over category; dispatch is a single map (red line 2 not applicable to audio,
//    but we keep the same data-driven discipline).

import type { GameContext } from '../core/GameContext';
import type { ILifecycle } from '../core/LifecycleManager';
import { IAudioService, IConfigDatabase } from '../core/GameContext';
import type { Vec3 } from '../physics/ICollisionService';

export enum AudioCategory {
  Bgm = 'bgm',
  Sfx = 'sfx',
  Voice = 'voice',
  Ambient = 'ambient',
  Spatial = '3d',
}

export interface AudioConfig {
  id: string;
  category: AudioCategory;
  volume: number; // base volume 0..1
  loop: boolean;
  minDistance: number; // spatial only
  maxDistance: number; // spatial only
}

export interface AudioEvent {
  id: string;
  category?: AudioCategory;
  worldPos?: Vec3;
}

/** Minimal config source surface AudioSystem needs (structural, no cc). */
export interface AudioConfigSource {
  getAudio(id: string): unknown;
}

/** Backend seam: engine implements this with cc.AudioSource; tests use MemoryAudioSink. */
export interface AudioSink {
  play(config: AudioConfig, effectiveVolume: number): void;
  stop(id: string): void;
  setSnapshot(name: string, volumeScale: number): void;
  setListener(pos: Vec3): void;
}

export interface SnapshotConfig {
  volumeScale: number;
}

export class AudioSystem implements ILifecycle {
  private readonly _sink: AudioSink;
  private _db: AudioConfigSource | null = null;
  private readonly _snapshots = new Map<string, SnapshotConfig>();
  private _activeSnapshot = 'calm';
  private _volumeScale = 1;
  private _listener: Vec3 = { x: 0, y: 0, z: 0 };
  private readonly _playing = new Set<string>();
  private _initialized = false;

  constructor(sink: AudioSink) {
    this._sink = sink;
  }

  initialize(ctx: GameContext): void {
    this._db = ctx.get<AudioConfigSource>(IConfigDatabase);
    this._snapshots.set('calm', { volumeScale: 1 });
    this._snapshots.set('combat', { volumeScale: 0.9 });
    this._snapshots.set('boss', { volumeScale: 1.2 });
    this._activeSnapshot = 'calm';
    this._volumeScale = 1;
    this._playing.clear();
    this._initialized = true;
  }

  // --- Listener (3D audio) ---
  setListener(pos: Vec3): void {
    this._listener = { x: pos.x, y: pos.y, z: pos.z };
    this._sink.setListener(this._listener);
  }

  // --- Snapshot (mix preset) ---
  registerSnapshot(name: string, scale: number): void {
    this._snapshots.set(name, { volumeScale: scale });
  }

  setSnapshot(name: string): void {
    const s = this._snapshots.get(name);
    if (!s) return;
    this._activeSnapshot = name;
    this._volumeScale = s.volumeScale;
    this._sink.setSnapshot(name, this._volumeScale);
  }

  get activeSnapshot(): string {
    return this._activeSnapshot;
  }

  get initialized(): boolean {
    return this._initialized;
  }

  get playingCount(): number {
    return this._playing.size;
  }

  // --- Public play API (§5.8 sub-systems) ---
  play(event: AudioEvent): void {
    this._play(event.id, event.category ?? AudioCategory.Sfx, event.worldPos);
  }

  playBgm(id: string): void {
    this._play(id, AudioCategory.Bgm);
  }

  playSfx(id: string): void {
    this._play(id, AudioCategory.Sfx);
  }

  playVoice(id: string): void {
    this._play(id, AudioCategory.Voice);
  }

  playAmbient(id: string): void {
    this._play(id, AudioCategory.Ambient);
  }

  play3d(id: string, worldPos: Vec3): void {
    this._play(id, AudioCategory.Spatial, worldPos);
  }

  stop(id: string): void {
    this._sink.stop(id);
    this._playing.delete(id);
  }

  // --- ILifecycle ---
  enter(): void {}
  exit(): void {}
  pause(): void {}
  resume(): void {}

  destroy(): void {
    for (const id of this._playing) this._sink.stop(id);
    this._playing.clear();
    this._activeSnapshot = 'calm';
    this._volumeScale = 1;
    this._listener = { x: 0, y: 0, z: 0 };
    this._initialized = false;
  }

  // --- Internals ---
  private _play(id: string, category: AudioCategory, worldPos?: Vec3): void {
    const cfg = this._resolveConfig(id, category);
    let volume = cfg.volume * this._volumeScale;
    if (category === AudioCategory.Spatial && worldPos) {
      volume *= this._attenuation(worldPos, cfg);
    }
    this._sink.play({ ...cfg, category, volume }, volume);
    this._playing.add(id);
  }

  private _resolveConfig(id: string, category: AudioCategory): AudioConfig {
    const raw = this._db ? (this._db.getAudio(id) as Partial<AudioConfig> | undefined) : undefined;
    return {
      id,
      category,
      volume: raw?.volume ?? 1,
      loop: raw?.loop ?? (category === AudioCategory.Bgm || category === AudioCategory.Ambient),
      minDistance: raw?.minDistance ?? 1,
      maxDistance: raw?.maxDistance ?? 20,
    };
  }

  private _attenuation(pos: Vec3, cfg: AudioConfig): number {
    const min = cfg.minDistance;
    const max = Math.max(cfg.minDistance + 0.0001, cfg.maxDistance);
    const dx = pos.x - this._listener.x;
    const dy = pos.y - this._listener.y;
    const dz = pos.z - this._listener.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist <= min) return 1;
    if (dist >= max) return 0;
    return 1 - (dist - min) / (max - min); // linear distance attenuation
  }
}

/** In-memory sink for tests / headless demo wiring (no cc). */
export class MemoryAudioSink implements AudioSink {
  readonly plays: Array<{ id: string; category: AudioCategory; effectiveVolume: number }> = [];
  readonly stops: string[] = [];
  readonly snapshots: Array<{ name: string; scale: number }> = [];
  listener: Vec3 = { x: 0, y: 0, z: 0 };

  play(config: AudioConfig, effectiveVolume: number): void {
    this.plays.push({ id: config.id, category: config.category, effectiveVolume });
  }

  stop(id: string): void {
    this.stops.push(id);
  }

  setSnapshot(name: string, volumeScale: number): void {
    this.snapshots.push({ name, scale: volumeScale });
  }

  setListener(pos: Vec3): void {
    this.listener = { x: pos.x, y: pos.y, z: pos.z };
  }
}
