// assets/scripts/replay/ReplayRecorder.ts — §5.7 replay framework (★★★★★).
// Pure TS, no `cc` import: deterministic replay = same seed (RunRng) + same input
// stream. We only record (frame, InputCommand); re-simulation is the caller's duty.
// Token: IReplayRecorder (declared in core/GameContext.ts, per §5.x service list).

import { GameContext } from '../core/GameContext';
import { ILifecycle } from '../core/LifecycleManager';

export interface InputCommand {
  type: string; // e.g. 'move' | 'skill' | 'dash' | 'interact' (extended by systems)
  data?: Record<string, number>;
}

export interface ReplayHeader {
  seed: number;
  version: number;
  configHash: string;
}

export interface ReplayFrame {
  frame: number;
  cmd: InputCommand;
}

export const REPLAY_VERSION = 1;

// Deterministic FNV-1a hash of a config snapshot — no Math.random (red line 5).
export function computeConfigHash(config: unknown): string {
  const str = JSON.stringify(config);
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

export class ReplayPlayer {
  // Re-emits the recorded frame stream in order. Identical header + frames ->
  // identical callback sequence, which (paired with the same seed) reproduces a run.
  play(
    _header: ReplayHeader,
    frames: ReplayFrame[],
    onReplay?: (frame: number, cmd: InputCommand) => void
  ): void {
    for (const f of frames) {
      if (onReplay) onReplay(f.frame, f.cmd);
    }
  }
}

export class ReplayRecorder implements ILifecycle {
  header: ReplayHeader | null = null;

  private _frames: ReplayFrame[] = [];
  // Ring buffer of completed runs (§5.7: keep recent N runs, tiny footprint).
  private _ring: Array<{ header: ReplayHeader; frames: ReplayFrame[] }> = [];
  private _maxRuns = 5;
  private _maxFrames = 1_000_000;
  private _ctx: GameContext | null = null;

  initialize(ctx: GameContext): void {
    this._ctx = ctx;
  }

  startRun(seed: number, configHash: string, version: number = REPLAY_VERSION): void {
    this.header = { seed, version, configHash };
    this._frames = [];
  }

  record(frame: number, cmd: InputCommand): void {
    if (this.header === null) {
      throw new Error('[ReplayRecorder] record() called before startRun()');
    }
    if (this._frames.length >= this._maxFrames) {
      this._frames.shift();
    }
    this._frames.push({ frame, cmd });
  }

  endRun(): void {
    if (this.header === null) return;
    this._ring.push({ header: this.header, frames: this._frames.slice() });
    if (this._ring.length > this._maxRuns) {
      this._ring.shift();
    }
    this.header = null;
    this._frames = [];
  }

  getFrames(): ReplayFrame[] {
    return this._frames.slice();
  }

  listRuns(): ReadonlyArray<{ header: ReplayHeader; frames: ReplayFrame[] }> {
    return this._ring;
  }

  play(frames: ReplayFrame[], onReplay?: (frame: number, cmd: InputCommand) => void): void {
    if (this.header === null) {
      throw new Error('[ReplayRecorder] play() called before startRun()');
    }
    new ReplayPlayer().play(this.header, frames, onReplay);
  }

  destroy(): void {
    this.header = null;
    this._frames = [];
    this._ring = [];
    this._ctx = null;
  }
}
