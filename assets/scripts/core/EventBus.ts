/**
 * EventBus - 全局事件总线
 * 用于模块间解耦通信
 * 单一写入口 + 生命周期安全
 */

type EventCallback = (...args: any[]) => void;

interface EventEntry {
    callback: EventCallback;
    target?: object;
    once: boolean;
}

export class EventBus {
    private static _instance: EventBus;
    private _events: Map<string, Set<EventEntry>> = new Map();
    private _paused: boolean = false;

    static getInstance(): EventBus {
        if (!EventBus._instance) {
            EventBus._instance = new EventBus();
        }
        return EventBus._instance;
    }

    /**
     * 注册事件监听
     * @param event 事件名
     * @param callback 回调
     * @param target 绑定的目标对象（用于自动清理）
     */
    on(event: string, callback: EventCallback, target?: object): void {
        if (!this._events.has(event)) {
            this._events.set(event, new Set());
        }
        this._events.get(event)!.add({ callback, target, once: false });
    }

    /**
     * 一次性事件监听
     */
    once(event: string, callback: EventCallback, target?: object): void {
        if (!this._events.has(event)) {
            this._events.set(event, new Set());
        }
        this._events.get(event)!.add({ callback, target, once: true });
    }

    /**
     * 移除事件监听
     */
    off(event: string, callback: EventCallback): void {
        const entries = this._events.get(event);
        if (!entries) return;
        for (const entry of entries) {
            if (entry.callback === callback) {
                entries.delete(entry);
                break;
            }
        }
        if (entries.size === 0) {
            this._events.delete(event);
        }
    }

    /**
     * 移除某个目标对象的所有监听（场景切换/对象销毁时调用）
     */
    offTarget(target: object): void {
        for (const [event, entries] of this._events) {
            for (const entry of entries) {
                if (entry.target === target) {
                    entries.delete(entry);
                }
            }
            if (entries.size === 0) {
                this._events.delete(event);
            }
        }
    }

    /**
     * 触发事件
     */
    emit(event: string, ...args: any[]): void {
        if (this._paused) return;

        const entries = this._events.get(event);
        if (!entries) return;

        const toRemove: EventEntry[] = [];
        for (const entry of entries) {
            entry.callback(...args);
            if (entry.once) {
                toRemove.push(entry);
            }
        }
        for (const entry of toRemove) {
            entries.delete(entry);
        }
        if (entries.size === 0) {
            this._events.delete(event);
        }
    }

    /** 暂停事件广播（场景切换时防止回调访问已销毁对象） */
    pause(): void { this._paused = true; }

    /** 恢复事件广播 */
    resume(): void { this._paused = false; }

    /** 清理所有事件 */
    clear(): void { this._events.clear(); this._paused = false; }
}

// 便捷引用
export const eventBus = EventBus.getInstance();
