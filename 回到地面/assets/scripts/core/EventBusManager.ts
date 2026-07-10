// EventBusManager.ts — unified typed event bus (§3.11).
// Pure TS, no `cc`. Holds 6 domain emitters (Battle/UI/Audio/Scene/Input/Runtime).
// Registered as IEventBus token in GameContext. Implements ILifecycle.
//
// Each domain has a typed emitter with subscribe/emit/unsubscribe using Map dispatch
// (no switch on event type). Per-domain log toggle for debugging.
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.11.

import type { GameContext } from './GameContext';
import type { ILifecycle } from './LifecycleManager';
import type { BattleEvent } from './events/BattleEvent';
import type { UIEvent } from './events/UIEvent';
import type { AudioEvent } from './events/AudioEvent';
import type { SceneEvent } from './events/SceneEvent';
import type { InputEvent } from './events/InputEvent';
import type { RuntimeEvent } from './events/RuntimeEvent';

// Service token (IEventBus already declared in GameContext; reused here).
// The EventBusManager is registered as IEventBus.

export type EventDomain = 'battle' | 'ui' | 'audio' | 'scene' | 'input' | 'runtime';

// All event types that flow through the bus.
export type AnyEvent = BattleEvent | UIEvent | AudioEvent | SceneEvent | InputEvent | RuntimeEvent;

type EventHandler<T> = (event: T) => void;

// Typed, type-safe emitter for a single domain.
export interface TypedEmitter<T extends { type: string }> {
  subscribe(type: T['type'], handler: EventHandler<T>): void;
  unsubscribe(type: T['type'], handler: EventHandler<T>): void;
  emit(event: T): void;
  clear(): void;
}

class TypedEmitterImpl<T extends { type: string }> implements TypedEmitter<T> {
  private readonly _handlers = new Map<string, EventHandler<T>[]>();
  private readonly _domainName: string;
  private _logEnabled = false;
  private _logger?: (msg: string) => void;

  constructor(domainName: string, logEnabled = false) {
    this._domainName = domainName;
    this._logEnabled = logEnabled;
  }

  setLogEnabled(enabled: boolean, logger?: (msg: string) => void): void {
    this._logEnabled = enabled;
    if (enabled && logger) this._logger = logger;
  }

  subscribe(type: T['type'], handler: EventHandler<T>): void {
    const list = this._handlers.get(type) ?? [];
    list.push(handler);
    this._handlers.set(type, list);
  }

  unsubscribe(type: T['type'], handler: EventHandler<T>): void {
    const list = this._handlers.get(type);
    if (!list) return;
    const idx = list.indexOf(handler);
    if (idx >= 0) list.splice(idx, 1);
    if (list.length === 0) this._handlers.delete(type);
  }

  emit(event: T): void {
    const list = this._handlers.get(event.type);
    if (!list) return;
    for (const handler of list) {
      try {
        handler(event);
      } catch (err) {
        console.error(`[EventBus:${this._domainName}] handler error:`, err);
      }
    }
    if (this._logEnabled) {
      const logger = this._logger ?? console.log;
      logger(`[EventBus] ${this._domainName}/${event.type}`);
    }
  }

  clear(): void {
    this._handlers.clear();
  }
}

export class EventBusManager implements ILifecycle {
  readonly name = 'EventBusManager';

  readonly battle: TypedEmitter<BattleEvent>;
  readonly ui: TypedEmitter<UIEvent>;
  readonly audio: TypedEmitter<AudioEvent>;
  readonly scene: TypedEmitter<SceneEvent>;
  readonly input: TypedEmitter<InputEvent>;
  readonly runtime: TypedEmitter<RuntimeEvent>;

  private readonly _domains: Map<EventDomain, TypedEmitterImpl<AnyEvent>>;
  private _initialized = false;

  constructor() {
    this.battle = new TypedEmitterImpl<BattleEvent>('battle');
    this.ui = new TypedEmitterImpl<UIEvent>('ui');
    this.audio = new TypedEmitterImpl<AudioEvent>('audio');
    this.scene = new TypedEmitterImpl<SceneEvent>('scene');
    this.input = new TypedEmitterImpl<InputEvent>('input');
    this.runtime = new TypedEmitterImpl<RuntimeEvent>('runtime');

    this._domains = new Map<EventDomain, TypedEmitterImpl<AnyEvent>>([
      ['battle', this.battle as unknown as TypedEmitterImpl<AnyEvent>],
      ['ui', this.ui as unknown as TypedEmitterImpl<AnyEvent>],
      ['audio', this.audio as unknown as TypedEmitterImpl<AnyEvent>],
      ['scene', this.scene as unknown as TypedEmitterImpl<AnyEvent>],
      ['input', this.input as unknown as TypedEmitterImpl<AnyEvent>],
      ['runtime', this.runtime as unknown as TypedEmitterImpl<AnyEvent>],
    ]);
  }

  // Enable/disable per-domain debug logging.
  setDomainLog(domain: EventDomain, enabled: boolean, logger?: (msg: string) => void): void {
    const emitter = this._domains.get(domain);
    if (emitter) {
      emitter.setLogEnabled(enabled, logger);
    }
  }

  // Clear all subscribers across all domains.
  clearAll(): void {
    for (const emitter of this._domains.values()) {
      emitter.clear();
    }
  }

  // --- ILifecycle (§5.1) ---
  initialize(_ctx: GameContext): void {
    this._initialized = true;
  }
  enter(): void {}
  exit(): void {
    this.clearAll();
  }
  pause(): void {}
  resume(): void {}
  destroy(): void {
    this.clearAll();
    this._initialized = false;
  }
  get initialized(): boolean {
    return this._initialized;
  }
}
