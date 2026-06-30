/**
 * PoolManager - 对象池管理器
 * 通过对象池复用减少实例化开销，优化 Draw Call 和 GC
 * 所有对象池资源通过统一接口管理
 */

import { Node, Prefab, instantiate, Vec3 } from 'cc';

interface PoolEntry {
    prefab: Prefab;
    pool: Node[];
    maxSize: number;
}

export class PoolManager {
    private static _instance: PoolManager;
    private _pools: Map<string, PoolEntry> = new Map();

    static getInstance(): PoolManager {
        if (!PoolManager._instance) {
            PoolManager._instance = new PoolManager();
        }
        return PoolManager._instance;
    }

    /** 注册对象池（在场景初始化时调用） */
    registerPool(name: string, prefab: Prefab, preCreate: number = 5, maxSize: number = 20): void {
        if (this._pools.has(name)) {
            console.warn(`[PoolManager] 对象池 "${name}" 已存在，跳过注册`);
            return;
        }

        const pool: Node[] = [];
        const entry: PoolEntry = { prefab, pool, maxSize };

        // 预创建对象
        for (let i = 0; i < preCreate; i++) {
            const node = instantiate(prefab);
            node.active = false;
            node.name = `${name}_pool_${i}`;
            pool.push(node);
        }

        this._pools.set(name, entry);
    }

    /** 从对象池获取一个对象（没有则创建） */
    get(name: string, parent?: Node): Node | null {
        const entry = this._pools.get(name);
        if (!entry) {
            console.warn(`[PoolManager] 对象池 "${name}" 不存在`);
            return null;
        }

        let node: Node | null = null;
        // 找池中空闲对象
        for (let i = entry.pool.length - 1; i >= 0; i--) {
            if (!entry.pool[i].active) {
                node = entry.pool[i];
                break;
            }
        }

        // 池中无空闲且未达上限则创建
        if (!node && entry.pool.length < entry.maxSize) {
            node = instantiate(entry.prefab);
            node.name = `${name}_pool_${entry.pool.length}`;
            entry.pool.push(node);
        }

        if (node) {
            node.active = true;
            if (parent) {
                node.parent = parent;
            }
            node.setPosition(Vec3.ZERO);
        }

        return node;
    }

    /** 回收对象 */
    recycle(node: Node): void {
        if (!node) return;
        node.active = false;
        node.removeFromParent();
    }

    /** 清空对象池（场景切换时调用） */
    clear(): void {
        for (const [, entry] of this._pools) {
            for (const node of entry.pool) {
                node.destroy();
            }
        }
        this._pools.clear();
    }
}
