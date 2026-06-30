/**
 * RunRng - 一局游戏全局 RNG 管理器
 *
 * 职责:
 * 1. 管理整局游戏的根 seed
 * 2. 通过 fork(scope) 为不同模块分配独立子 Rng
 * 3. 同一 seed 重复同一局时，所有 fork 结果一致
 *
 * 使用方式:
 *   // 开局（通常在 DungeonSceneController 或 RunCoordinator）
 *   RunRng.instance.startRun(Date.now() & 0x7fffffff);
 *
 *   // 各模块获取自己的独立 RNG
 *   const rng = RunRng.instance.fork('dungeon:roomGen');
 *   const selected = rng.pick(candidates);
 *
 *   // 需要更细粒度隔离时追加 label
 *   const monsterRng = RunRng.instance.fork('dungeon:monster:forest');
 *   const dropRng = RunRng.instance.fork('equipment:drop');
 */

import { Rng } from './Rng';

export class RunRng {
    private static _instance: RunRng | null = null;
    private _root: Rng = new Rng(1);
    private _seed = 1;

    static get instance(): RunRng {
        if (!this._instance) this._instance = new RunRng();
        return this._instance;
    }

    /** 开局：设置根 seed */
    startRun(seed: number): void {
        this._seed = seed >>> 0;
        this._root = new Rng(this._seed);
    }

    /** 创建指定 scope 的子 RNG（隔离各模块的随机序列） */
    fork(scope: string): Rng {
        return this._root.fork(scope);
    }

    /** 获取当前 seed（用于展示/分享） */
    get seed(): number {
        return this._seed;
    }

    /** 重置（用于测试） */
    reset(): void {
        this._seed = 1;
        this._root = new Rng(1);
    }
}
