// assets/scripts/core/RuntimeState.ts — P2-2 (§2.2 / §5.5).
// Authoritative per-run runtime state: seed + frame counter, exposed to the
// DebugPanel Seed panel and deterministic replay. Pure TS (delegates the seed
// to RunRng); no `cc` import so it runs under vitest.

import { GameContext } from './GameContext';
import { ILifecycle } from './LifecycleManager';
import { RunRng } from './rng/RunRng';

export interface SeedDebugInfo {
    seed: number;
    frame: number;
}

export interface IRuntimeState {
    getSeed(): number;
    getFrame(): number;
    getSeedDebug(): SeedDebugInfo;
    tickFrame(): void;
}

export class RuntimeState implements ILifecycle, IRuntimeState {
    private _ctx: GameContext | null = null;
    private _frame = 0;

    initialize(ctx: GameContext): void {
        this._ctx = ctx;
    }

    /** Authoritative run seed (delegated to RunRng, §2.2 deterministic). */
    getSeed(): number {
        return RunRng.instance.seed;
    }

    /** Monotonic in-run frame counter for the DebugPanel Seed panel. */
    getFrame(): number {
        return this._frame;
    }

    /** Advance the per-frame counter; call once per engine frame. */
    tickFrame(): void {
        this._frame++;
    }

    /** Shape matches DebugPanel.SeedDebugInfo so the provider can Object.assign. */
    getSeedDebug(): SeedDebugInfo {
        return { seed: this.getSeed(), frame: this._frame };
    }

    enter(): void {}
    pause(): void {}
    resume(): void {}
    exit(): void {}
    destroy(): void {
        this._frame = 0;
        this._ctx = null;
    }
}
