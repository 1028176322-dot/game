/**
 * EventBus - global event dispatcher.
 *
 * Responsibilities:
 * - decouple gameplay/UI modules
 * - keep listener lifecycle cleanup predictable
 * - prevent one broken listener from crashing the whole battle loop
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
    private _paused = false;

    static getInstance(): EventBus {
        if (!EventBus._instance) {
            EventBus._instance = new EventBus();
        }
        return EventBus._instance;
    }

    on(event: string, callback: EventCallback, target?: object): void {
        if (!this._isValidCallback(event, callback, target)) return;
        if (!this._events.has(event)) {
            this._events.set(event, new Set());
        }
        this._events.get(event)!.add({ callback, target, once: false });
    }

    once(event: string, callback: EventCallback, target?: object): void {
        if (!this._isValidCallback(event, callback, target)) return;
        if (!this._events.has(event)) {
            this._events.set(event, new Set());
        }
        this._events.get(event)!.add({ callback, target, once: true });
    }

    off(event: string, callback: EventCallback, target?: object): void {
        const entries = this._events.get(event);
        if (!entries) return;

        for (const entry of Array.from(entries)) {
            if (entry.callback === callback && (!target || entry.target === target)) {
                entries.delete(entry);
            }
        }

        if (entries.size === 0) {
            this._events.delete(event);
        }
    }

    offTarget(target: object): void {
        for (const [event, entries] of this._events) {
            for (const entry of Array.from(entries)) {
                if (entry.target === target) {
                    entries.delete(entry);
                }
            }
            if (entries.size === 0) {
                this._events.delete(event);
            }
        }
    }

    emit(event: string, ...args: any[]): void {
        if (this._paused) return;

        const entries = this._events.get(event);
        if (!entries) return;

        const toRemove: EventEntry[] = [];
        for (const entry of Array.from(entries)) {
            if (typeof entry.callback !== 'function') {
                console.warn(`[EventBus] invalid callback removed: ${event}`);
                toRemove.push(entry);
                continue;
            }

            try {
                entry.callback.apply(entry.target, args);
            } catch (err) {
                console.error(`[EventBus] listener failed: ${event}`, err);
            }

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

    /** @deprecated Use BattleClock for battle pause control. */
    pause(): void {
        console.warn('[EventBus] pause() is deprecated; use BattleClock.instance.paused');
        this._paused = true;
    }

    /** @deprecated Use BattleClock for battle pause control. */
    resume(): void {
        console.warn('[EventBus] resume() is deprecated; use BattleClock.instance.paused = false');
        this._paused = false;
    }

    clear(): void {
        this._events.clear();
        this._paused = false;
    }

    private _isValidCallback(event: string, callback: EventCallback, target?: object): boolean {
        if (typeof callback === 'function') return true;

        const owner = target?.constructor?.name ?? 'unknown';
        console.warn(`[EventBus] ignored invalid listener: ${event}, target=${owner}`);
        return false;
    }
}

export const eventBus = EventBus.getInstance();
