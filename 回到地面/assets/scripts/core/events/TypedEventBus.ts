/**
 * TypedEventBus - 类型安全的事件总线
 *
 * 与旧 EventBus 的区别:
 * - 事件名和参数类型由泛型约束，编译期检查
 * - 不在 emit 时检查 paused 状态（暂停由 BattleClock 控制）
 * - 支持 offTarget(target) 自动清理
 *
 * 使用方式:
 *   const bus = new TypedEventBus<GameEventMap>();
 *   bus.on('battle:victory', ({ roomId }) => { ... }, this);
 *   bus.emit('battle:victory', { roomId: 1, roomType: 'boss', isBoss: true });
 */

type Handler<T> = (payload: T) => void;

interface Entry<T> {
    handler: Handler<T>;
    target?: object;
    once: boolean;
}

export class TypedEventBus<EventMap extends Record<string, unknown>> {
    private _events = new Map<keyof EventMap, Set<Entry<any>>>();

    /**
     * 注册事件监听
     * @param event 事件名
     * @param handler 处理函数
     * @param target 绑定的目标对象（用于 offTarget 自动清理）
     */
    on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>, target?: object): void {
        if (!this._events.has(event)) {
            this._events.set(event, new Set());
        }
        this._events.get(event)!.add({ handler, target, once: false });
    }

    /**
     * 一次性事件监听
     */
    once<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>, target?: object): void {
        if (!this._events.has(event)) {
            this._events.set(event, new Set());
        }
        this._events.get(event)!.add({ handler, target, once: true });
    }

    /**
     * 触发事件
     */
    emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
        const entries = this._events.get(event);
        if (!entries) return;

        const remove: Entry<any>[] = [];
        for (const entry of entries) {
            entry.handler(payload);
            if (entry.once) remove.push(entry);
        }
        for (const entry of remove) {
            entries.delete(entry);
        }
        if (entries.size === 0) {
            this._events.delete(event);
        }
    }

    /**
     * 移除某个目标对象的所有监听
     */
    offTarget(target: object): void {
        for (const [event, entries] of this._events) {
            for (const entry of [...entries]) {
                if (entry.target === target) entries.delete(entry);
            }
            if (entries.size === 0) this._events.delete(event);
        }
    }

    /**
     * 清理所有事件
     */
    clear(): void {
        this._events.clear();
    }
}
