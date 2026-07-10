// CameraBrain.ts — 3D follow camera with strategy modes (§3.4).
// Authoritative spec: docs/2D转3D全面升级方案.md §3.4 + demo2.md.
// Pure TS, NO top-level `cc` import: runs in node for vitest (real camera injected at runtime).
//
// Design notes:
//  - Mode parameters are sourced from ConfigDatabase.getCamera(modeKey); nothing tunable is
//    hardcoded (per demo2 strict constraint). Missing config falls back to safe defaults so the
//    brain stays functional before camera config exists.
//  - Camera math uses a plain Vec3Like shape; the engine camera node is attached at runtime and
//    structurally satisfies ICameraNode (cc.Vec3 has x/y/z). No `cc` import keeps this testable.

import type { GameContext } from '../core/GameContext';
import type { ILifecycle } from '../core/LifecycleManager';
import type { ConfigDatabase } from '../core/ConfigDatabase';

export const ICameraBrain = 'ICameraBrain';

export enum CameraMode {
  Follow = 'follow',
  LockOn = 'lockon',
  Boss = 'boss',
  Dialogue = 'dialogue',
  Cinematic = 'cinematic',
  Shake = 'shake',
  Zoom = 'zoom',
}

export interface Vec3Like {
  x: number;
  y: number;
  z: number;
}

export interface ICameraNode {
  position: Vec3Like;
}

export interface CameraModeParams {
  followLerp: number; // follow smoothing rate (1/s)
  tiltDeg: number;    // perspective tilt angle (degrees)
  shakeAmp: number;   // shake amplitude (world units)
  shakeFreq: number;  // shake frequency (Hz)
  shakeDur: number;   // shake duration (s)
  zoomDist: number;   // camera distance from target
  lookAhead: number;  // lock-on lead distance (reserved)
}

const MODE_KEY: Record<CameraMode, string> = {
  [CameraMode.Follow]: 'follow',
  [CameraMode.LockOn]: 'lockon',
  [CameraMode.Boss]: 'boss',
  [CameraMode.Dialogue]: 'dialogue',
  [CameraMode.Cinematic]: 'cinematic',
  [CameraMode.Shake]: 'shake',
  [CameraMode.Zoom]: 'zoom',
};

function defaultParams(): CameraModeParams {
  return {
    followLerp: 8,
    tiltDeg: 42,
    shakeAmp: 0.3,
    shakeFreq: 22,
    shakeDur: 0.4,
    zoomDist: 8,
    lookAhead: 2,
  };
}

export class CameraBrain implements ILifecycle {
  private _db: ConfigDatabase;
  private _camera: ICameraNode | null = null;
  private _target: Vec3Like = { x: 0, y: 0, z: 0 };
  private _mode: CameraMode = CameraMode.Follow;
  private _params: Record<string, CameraModeParams> = {};
  private _shakeTime = 0;
  private _shakeAmp = 0;
  private _shakeDur = 0;
  private _initialized = false;

  constructor(db: ConfigDatabase) {
    this._db = db;
  }

  initialize(_ctx: GameContext): void {
    const keys = Object.values(MODE_KEY);
    for (const key of keys) {
      const raw = this._db.getCamera(key) as Partial<CameraModeParams> | undefined;
      this._params[key] = raw ? { ...defaultParams(), ...raw } : defaultParams();
    }
    this._mode = CameraMode.Follow;
    this._shakeTime = 0;
    this._initialized = true;
  }

  enter(): void {
    this._shakeTime = 0;
  }

  exit(): void {
    /* no per-room teardown needed; camera state persists across rooms */
  }

  pause(): void {
    /* stop updating externally; state retained */
  }

  resume(): void {
    /* resume updating externally; state retained */
  }

  destroy(): void {
    this._camera = null;
    this._target = { x: 0, y: 0, z: 0 };
    this._mode = CameraMode.Follow;
    this._shakeTime = 0;
    this._shakeAmp = 0;
    this._shakeDur = 0;
  }

  attach(camera: ICameraNode): void {
    this._camera = camera;
  }

  setTarget(pos: Vec3Like): void {
    this._target = { x: pos.x, y: pos.y, z: pos.z };
  }

  setMode(mode: CameraMode): void {
    this._mode = mode;
    if (mode === CameraMode.Shake) {
      this._beginShake();
    }
  }

  triggerShake(amp?: number, dur?: number): void {
    this._mode = CameraMode.Shake;
    this._beginShake(amp, dur);
  }

  get currentMode(): CameraMode {
    return this._mode;
  }

  get initialized(): boolean {
    return this._initialized;
  }

  private _beginShake(amp?: number, dur?: number): void {
    const p = this._params[MODE_KEY[CameraMode.Shake]];
    this._shakeAmp = amp ?? p.shakeAmp;
    this._shakeDur = dur ?? p.shakeDur;
    this._shakeTime = 0;
  }

  // Per-frame update. Engine calls this with delta time (seconds).
  lateUpdate(dt: number): void {
    if (!this._camera) return;

    const p = this._params[MODE_KEY[this._mode]] ?? defaultParams();
    const tilt = (p.tiltDeg * Math.PI) / 180;
    const height = p.zoomDist * Math.sin(tilt);
    const back = p.zoomDist * Math.cos(tilt);

    const desired: Vec3Like = {
      x: this._target.x,
      y: this._target.y + height,
      z: this._target.z + back,
    };

    // Frame-rate independent smoothing.
    const f = 1 - Math.exp(-p.followLerp * dt);
    this._camera.position.x += (desired.x - this._camera.position.x) * f;
    this._camera.position.y += (desired.y - this._camera.position.y) * f;
    this._camera.position.z += (desired.z - this._camera.position.z) * f;

    const shaking = this._mode === CameraMode.Shake || this._shakeTime < this._shakeDur;
    if (shaking) {
      this._shakeTime += dt;
      const decay = Math.max(0, 1 - this._shakeTime / this._shakeDur);
      const amp = this._shakeAmp * decay;
      this._camera.position.x += Math.sin(this._shakeTime * p.shakeFreq) * amp;
      this._camera.position.z += Math.cos(this._shakeTime * p.shakeFreq) * amp;
    }
  }
}
