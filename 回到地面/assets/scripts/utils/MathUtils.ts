/**
 * MathUtils - 数学工具函数
 *
 * [Phase 2] 所有随机方法已迁移至 RunRng
 * 请勿新增 Math.random() 调用
 */

import { Rng } from '../core/rng/Rng';
import { RunRng } from '../core/rng/RunRng';

// 模块级计数器：确保每个 fork 产生不同的子 RNG（同时保持确定性） 
let _rngCallId = 0;
function _nextRng(label: string): Rng {
    return RunRng.instance.fork(`MathUtils:${label}:${_rngCallId++}`);
}

export class MathUtils {
    /** 投掷 D6 骰子 */
    static d6(): number {
        return _nextRng('d6').d6();
    }

    /** 投掷 nD6 */
    static rollDice(count: number): number {
        let sum = 0;
        for (let i = 0; i < count; i++) {
            sum += MathUtils.d6();
        }
        return sum;
    }

    /** 概率判定 */
    static chance(probability: number): boolean {
        return _nextRng('chance').next() < probability;
    }

    /** 范围内随机整数 [min, max] */
    static randomInt(min: number, max: number): number {
        return _nextRng('randomInt').int(min, max);
    }

    /** 夹值 */
    static clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    /** 曼哈顿距离 */
    static manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    /** 欧几里得距离 */
    static euclideanDistance(x1: number, y1: number, x2: number, y2: number): number {
        return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    }

    /** 种子随机（简易 LCG）- 已废弃，使用 Rng 替代 */
    static seededRandom(seed: number): () => number {
        let s = seed;
        return () => {
            s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
            return (s >>> 0) / 0xFFFFFFFF;
        };
    }

    /** 从数组中随机取一项 */
    static randomPick<T>(arr: T[]): T {
        return _nextRng('randomPick').pick(arr);
    }

    /** 从数组中随机取 n 项（不重复） */
    static randomPickN<T>(arr: T[], n: number): T[] {
        return _nextRng('randomPickN').shuffle(arr).slice(0, Math.min(n, arr.length));
    }
}
