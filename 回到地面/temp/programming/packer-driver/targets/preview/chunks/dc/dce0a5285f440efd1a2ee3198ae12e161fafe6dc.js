System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, EventBus, _crd, eventBus;

  _export("EventBus", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "771aecjpERKFaKaNH+6vxZl", "EventBus", undefined);
      /**
       * EventBus - global event dispatcher.
       *
       * Responsibilities:
       * - decouple gameplay/UI modules
       * - keep listener lifecycle cleanup predictable
       * - prevent one broken listener from crashing the whole battle loop
       */


      _export("EventBus", EventBus = class EventBus {
        constructor() {
          this._events = new Map();
          this._paused = false;
        }

        static getInstance() {
          if (!EventBus._instance) {
            EventBus._instance = new EventBus();
          }

          return EventBus._instance;
        }

        on(event, callback, target) {
          if (!this._isValidCallback(event, callback, target)) return;

          if (!this._events.has(event)) {
            this._events.set(event, new Set());
          }

          this._events.get(event).add({
            callback,
            target,
            once: false
          });
        }

        once(event, callback, target) {
          if (!this._isValidCallback(event, callback, target)) return;

          if (!this._events.has(event)) {
            this._events.set(event, new Set());
          }

          this._events.get(event).add({
            callback,
            target,
            once: true
          });
        }

        off(event, callback, target) {
          var entries = this._events.get(event);

          if (!entries) return;

          for (var entry of Array.from(entries)) {
            if (entry.callback === callback && (!target || entry.target === target)) {
              entries.delete(entry);
            }
          }

          if (entries.size === 0) {
            this._events.delete(event);
          }
        }

        offTarget(target) {
          for (var [event, entries] of this._events) {
            for (var entry of Array.from(entries)) {
              if (entry.target === target) {
                entries.delete(entry);
              }
            }

            if (entries.size === 0) {
              this._events.delete(event);
            }
          }
        }

        emit(event) {
          if (this._paused) return;

          var entries = this._events.get(event);

          if (!entries) return;
          var toRemove = [];

          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          for (var entry of Array.from(entries)) {
            if (typeof entry.callback !== 'function') {
              console.warn("[EventBus] invalid callback removed: " + event);
              toRemove.push(entry);
              continue;
            }

            try {
              entry.callback.apply(entry.target, args);
            } catch (err) {
              console.error("[EventBus] listener failed: " + event, err);
            }

            if (entry.once) {
              toRemove.push(entry);
            }
          }

          for (var _entry of toRemove) {
            entries.delete(_entry);
          }

          if (entries.size === 0) {
            this._events.delete(event);
          }
        }
        /** @deprecated Use BattleClock for battle pause control. */


        pause() {
          console.warn('[EventBus] pause() is deprecated; use BattleClock.instance.paused');
          this._paused = true;
        }
        /** @deprecated Use BattleClock for battle pause control. */


        resume() {
          console.warn('[EventBus] resume() is deprecated; use BattleClock.instance.paused = false');
          this._paused = false;
        }

        clear() {
          this._events.clear();

          this._paused = false;
        }

        _isValidCallback(event, callback, target) {
          var _target$constructor$n, _target$constructor;

          if (typeof callback === 'function') return true;
          var owner = (_target$constructor$n = target == null || (_target$constructor = target.constructor) == null ? void 0 : _target$constructor.name) != null ? _target$constructor$n : 'unknown';
          console.warn("[EventBus] ignored invalid listener: " + event + ", target=" + owner);
          return false;
        }

      });

      EventBus._instance = void 0;

      _export("eventBus", eventBus = EventBus.getInstance());

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=dce0a5285f440efd1a2ee3198ae12e161fafe6dc.js.map