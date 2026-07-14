System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, InteractionComponent, _crd, IInteractionComponent;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../core/LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEventBusManager(extras) {
    _reporterNs.report("EventBusManager", "../core/EventBusManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBattleEvent(extras) {
    _reporterNs.report("BattleEvent", "../core/events/BattleEvent", _context.meta, extras);
  }

  _export("InteractionComponent", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "658e0SM0aROSYMsc+CKgnjE", "InteractionComponent", undefined); // InteractionComponent.ts — handles pickup / dialogue / trigger interactions (§3.12 ECS).
      // Pure TS, no `cc`. Receives interaction intents and emits events via EventBusManager.


      _export("IInteractionComponent", IInteractionComponent = 'IInteractionComponent');

      _export("InteractionComponent", InteractionComponent = class InteractionComponent {
        constructor() {
          this._eventBus = null;
          this._entityId = '';
          this._cooldown = 0;
        }

        initialize(ctxOrId, eventBus) {
          if (typeof ctxOrId !== 'string') return; // ILifecycle.initialize(ctx)

          this._entityId = ctxOrId;
          this._eventBus = eventBus != null ? eventBus : null;
        }

        enter() {}

        exit() {}

        pause() {}

        resume() {}

        destroy() {
          this._cooldown = 0;
        } // Attempt an interaction. Returns true if the interaction was performed.


        interact(type, targetId, data) {
          if (this._cooldown > 0) return false;
          if (!this._eventBus) return false;
          const event = {
            domain: 'battle',
            type: 'status_applied',
            entityId: this._entityId,
            statusKind: `interact_${type}`
          };

          this._eventBus.battle.emit(event);

          this._cooldown = 0.5; // 500ms interaction cooldown

          return true;
        }

        update(dt) {
          if (this._cooldown > 0) {
            this._cooldown -= dt;
          }
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=e7584f57468a613702bbea66ec9e408dd0cbfc5b.js.map