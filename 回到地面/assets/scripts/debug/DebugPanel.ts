// assets/scripts/debug/DebugPanel.ts — §5.5 debug framework (Dev/Debug builds only).
// Pure TS, no `cc` import: runs in node for vitest.
// Token: IDebugService (declared in core/GameContext.ts, per §5.x service list).

import { GameContext, ICameraBrain } from '../core/GameContext';
import { ILifecycle } from '../core/LifecycleManager';

export interface RuntimeStatsProvider {
  getMemoryMB(): number | null;
  getDrawCall(): number | null;
}

export type DebugProvider = () => Partial<DebugSnapshot>;

export interface AIDebugInfo {
  state?: string;
  targetId?: string;
  distance?: number;
  btNode?: string;
}
export interface SkillDebugInfo {
  cooldowns?: Record<string, number>;
  inFlight?: number;
}
export interface CollisionDebugInfo {
  overlapRadius?: number;
  raycastActive?: boolean;
}
export interface NavDebugInfo {
  hasPath?: boolean;
  pathLength?: number;
}
export interface AnimDebugInfo {
  stateNode?: string;
  clip?: string;
  frame?: number;
}
export interface CameraDebugInfo {
  mode: string;
  posX: number;
  posY: number;
  posZ: number;
  pitchDeg: number;
}
export interface SeedDebugInfo {
  seed: number;
  frame: number;
}
export interface DebugEvent {
  time: string;
  channel: string;
  level: string;
  msg: string;
}

// 12-category debug snapshot per §5.5 panel layout. Categories whose source
// system is not built yet stay `undefined` until a provider fills them.
export interface DebugSnapshot {
  visible: boolean;
  fps: number;
  frameTimeMs: number;
  memoryMB: number | null;
  drawCall: number | null;
  ai?: AIDebugInfo;
  skill?: SkillDebugInfo;
  collision?: CollisionDebugInfo;
  nav?: NavDebugInfo;
  anim?: AnimDebugInfo;
  camera?: CameraDebugInfo;
  seed?: SeedDebugInfo;
  events: DebugEvent[];
}

export class DebugPanel implements ILifecycle {
  private _ctx: GameContext | null = null;
  private _visible = false;
  private _fps = 0;
  private _frameMs = 0;
  private _mem: number | null = null;
  private _draw: number | null = null;
  private _providers = new Map<string, DebugProvider>();
  private _events: DebugEvent[] = [];
  private _maxEvents = 200;
  private _stats: RuntimeStatsProvider | null = null;

  initialize(ctx: GameContext): void {
    this._ctx = ctx;
    // §5.5 lists ICameraBrain.getDebugState() as a data source. CameraBrain (Demo2)
    // does not implement it yet, so we duck-type: wire the camera provider only if
    // the registered object exposes getDebugState(). No modification of CameraBrain.
    const cam = this._safeGet<{ getDebugState?: () => CameraDebugInfo }>(ICameraBrain);
    if (cam && typeof cam.getDebugState === 'function') {
      this.registerProvider('camera', () => ({ camera: cam.getDebugState!() }));
    }
  }

  private _safeGet<T>(token: string): T | null {
    if (!this._ctx) return null;
    try {
      return this._ctx.get<T>(token);
    } catch {
      return null;
    }
  }

  registerProvider(name: string, provider: DebugProvider): void {
    this._providers.set(name, provider);
  }

  setRuntimeStats(provider: RuntimeStatsProvider | null): void {
    this._stats = provider;
  }

  toggle(): void {
    this._visible = !this._visible;
  }

  setVisible(v: boolean): void {
    this._visible = v;
  }

  isVisible(): boolean {
    return this._visible;
  }

  // Called every frame from the engine loop (dtMs = frame delta in ms).
  update(dtMs: number): void {
    this._frameMs = dtMs;
    this._fps = dtMs > 0 ? Math.round(1000 / dtMs) : 0;
    if (this._stats) {
      this._mem = this._stats.getMemoryMB();
      this._draw = this._stats.getDrawCall();
    }
  }

  pushEvent(channel: string, level: string, msg: string): void {
    this._append({ time: new Date().toISOString(), channel, level, msg });
  }

  // Sink adapter: Logger's output line `[time][channel][level] msg` is forwarded
  // here so the "Events" panel reuses the ILogger buffer (§5.5).
  pushRaw(line: string): void {
    const m = /^\[([^\]]+)\]\[([^\]]+)\]\[([^\]]+)\]\s*(.*)$/.exec(line);
    if (m) {
      this._append({ time: m[1], channel: m[2], level: m[3], msg: m[4] });
    }
  }

  private _append(e: DebugEvent): void {
    this._events.push(e);
    if (this._events.length > this._maxEvents) {
      this._events.shift();
    }
  }

  sample(): DebugSnapshot {
    const snap: DebugSnapshot = {
      visible: this._visible,
      fps: this._fps,
      frameTimeMs: this._frameMs,
      memoryMB: this._mem,
      drawCall: this._draw,
      events: this._events.slice(),
    };
    // Aggregation via provider map (NO switch on category).
    for (const p of this._providers.values()) {
      const part = p();
      if (part) Object.assign(snap, part);
    }
    return snap;
  }

  enter(): void {}
  pause(): void {}
  resume(): void {}
  exit(): void {}
  destroy(): void {
    this._events = [];
    this._providers.clear();
    this._ctx = null;
  }
}
