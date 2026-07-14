System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, TypedEmitterImpl, EventBusManager, _crd;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "./GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "./LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBattleEvent(extras) {
    _reporterNs.report("BattleEvent", "./events/BattleEvent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUIEvent(extras) {
    _reporterNs.report("UIEvent", "./events/UIEvent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAudioEvent(extras) {
    _reporterNs.report("AudioEvent", "./events/AudioEvent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSceneEvent(extras) {
    _reporterNs.report("SceneEvent", "./events/SceneEvent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfInputEvent(extras) {
    _reporterNs.report("InputEvent", "./events/InputEvent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRuntimeEvent(extras) {
    _reporterNs.report("RuntimeEvent", "./events/RuntimeEvent", _context.meta, extras);
  }

  _export("EventBusManager", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "7aec24TLMBDiprmpK0/KQvY", "EventBusManager", undefined); // EventBusManager.ts — unified typed event bus (§3.11).
      // Pure TS, no `cc`. Holds 6 domain emitters (Battle/UI/Audio/Scene/Input/Runtime).
      // Registered as IEventBus token in GameContext. Implements ILifecycle.
      //
      // Each domain has a typed emitter with subscribe/emit/unsubscribe using Map dispatch
      // (no switch on event type). Per-domain log toggle for debugging.
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.11.
      // Service token (IEventBus already declared in GameContext; reused here).
      // The EventBusManager is registered as IEventBus.
      // All event types that flow through the bus.
      // Typed, type-safe emitter for a single domain.


      TypedEmitterImpl = class TypedEmitterImpl {
        constructor(domainName, logEnabled = false) {
          this._handlers = new Map();
          this._domainName = void 0;
          this._logEnabled = false;
          this._logger = void 0;
          this._domainName = domainName;
          this._logEnabled = logEnabled;
        }

        setLogEnabled(enabled, logger) {
          this._logEnabled = enabled;
          if (enabled && logger) this._logger = logger;
        }

        subscribe(type, handler) {
          var _this$_handlers$get;

          const list = (_this$_handlers$get = this._handlers.get(type)) != null ? _this$_handlers$get : [];
          list.push(handler);

          this._handlers.set(type, list);
        }

        unsubscribe(type, handler) {
          const list = this._handlers.get(type);

          if (!list) return;
          const idx = list.indexOf(handler);
          if (idx >= 0) list.splice(idx, 1);
          if (list.length === 0) this._handlers.delete(type);
        }

        emit(event) {
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
            var _this$_logger;

            const logger = (_this$_logger = this._logger) != null ? _this$_logger : console.log;
            logger(`[EventBus] ${this._domainName}/${event.type}`);
          }
        }

        clear() {
          this._handlers.clear();
        }

      }; // Contract for the typed event bus (§3.11).

      _export("EventBusManager", EventBusManager = class EventBusManager {
        constructor() {
          this.name = 'EventBusManager';
          this.battle = void 0;
          this.ui = void 0;
          this.audio = void 0;
          this.scene = void 0;
          this.input = void 0;
          this.runtime = void 0;
          this._domains = void 0;
          this._initialized = false;
          this.battle = new TypedEmitterImpl('battle');
          this.ui = new TypedEmitterImpl('ui');
          this.audio = new TypedEmitterImpl('audio');
          this.scene = new TypedEmitterImpl('scene');
          this.input = new TypedEmitterImpl('input');
          this.runtime = new TypedEmitterImpl('runtime');
          this._domains = new Map([['battle', this.battle], ['ui', this.ui], ['audio', this.audio], ['scene', this.scene], ['input', this.input], ['runtime', this.runtime]]);
        } // Enable/disable per-domain debug logging.


        setDomainLog(domain, enabled, logger) {
          const emitter = this._domains.get(domain);

          if (emitter) {
            emitter.setLogEnabled(enabled, logger);
          }
        } // Clear all subscribers across all domains.


        clearAll() {
          for (const emitter of this._domains.values()) {
            emitter.clear();
          }
        } // --- ILifecycle (§5.1) ---


        initialize(_ctx) {
          this._initialized = true;
        }

        enter() {}

        exit() {
          this.clearAll();
        }

        pause() {}

        resume() {}

        destroy() {
          this.clearAll();
          this._initialized = false;
        }

        get initialized() {
          return this._initialized;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=a433f30b2048d987bb208a2dad47d89f36b3c393.js.map