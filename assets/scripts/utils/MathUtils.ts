/**
 * MathUtils - 数学工具函数
 */
export class MathUtils {
    /** 投掷 D6 骰子 */
    static d6(): number {
        return Math.floor(Math.random() * 6) + 1;
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
        return Math.random() < probability;
    }

    /** 范围内随机整数 [min, max] */
    static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
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

    /** 种子随机（简易 LCG） */
    static seededRandom(seed: number): () => number {
        let s = seed;
        return () => {
            s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
            return (s >>> 0) / 0xFFFFFFFF;
        };
    }

    /** 从数组中随机取一项 */
    static randomPick<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /** 从数组中随机取 n 项（不重复） */
    static randomPickN<T>(arr: T[], n: number): T[] {
        const shuffled = [...arr].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(n, shuffled.length));
    }
}
