/**
 * RunCoordinator - 一局游戏的启动协调器
 *
 * 职责:
 * 1. 创建游戏种子
 * 2. 初始化 RunRng
 * 3. 启动 GameManager 的新局
 *
 * Phase 4: 从 DungeonSceneController 拆分
 */

import { GameManager, GameEvent } from '../core/GameManager';
import { RunRng } from '../core/rng/RunRng';

export class RunCoordinator {
    /** 开始一局新游戏 */
    startNewRun(seed?: number): void {
        const runSeed = seed ?? (Date.now() & 0x7fffffff);
        RunRng.instance.startRun(runSeed);
        GameManager.instance.initNewRun();
    }

    /** 获取当前种子（用于分享/显示） */
    get currentSeed(): number {
        return RunRng.instance.seed;
    }
}
