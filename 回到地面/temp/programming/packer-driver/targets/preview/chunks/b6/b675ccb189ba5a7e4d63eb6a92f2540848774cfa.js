System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, EffectExecutor, _crd, IEffectExecutor;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../../core/LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCombatEntity(extras) {
    _reporterNs.report("CombatEntity", "./CombatCommand", _context.meta, extras);
  }

  _export("EffectExecutor", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "94919wkGU9BXJkXDXkT+nvN", "EffectExecutor", undefined); // EffectExecutor.ts — executes status effects / buffs / debuffs / element reactions (§3.8).
      // Pure TS, no `cc`. Implements ILifecycle (red line 3). Depends on IAssetCache via ctx.get.
      //
      // Combat layering: the executor applies effects to CombatEntity, never writes gridX/gridY.
      // Element reactions are deterministic, no Math.random (red line 5).
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.8 "放特效 + 状态 + 触发抛射".


      _export("IEffectExecutor", IEffectExecutor = 'IEffectExecutor'); // Status effect definition (pure data, no logic).
      // Active status on an entity.


      _export("EffectExecutor", EffectExecutor = class EffectExecutor {
        constructor() {
          this.name = 'EffectExecutor';
          this._ctx = null;
          this._statuses = new Map();
          this._handlers = new Map();
          this._initialized = false;

          // Map dispatch for effect kinds (no switch, consistent with project convention).
          this._handlers.set('heal', (target, effect) => {
            target.applyDamage(-effect.magnitude, effect.sourceId);
          });

          this._handlers.set('burn', (target, effect) => {
            var _effect$dps;

            target.applyDamage((_effect$dps = effect.dps) != null ? _effect$dps : 0, effect.sourceId);
          });

          this._handlers.set('poison', (target, effect) => {
            var _effect$dps2;

            target.applyDamage((_effect$dps2 = effect.dps) != null ? _effect$dps2 : 0, effect.sourceId);
          }); // freeze, stun, slow, silence, shield are state-only (no instant damage).


          this._handlers.set('freeze', () => {});

          this._handlers.set('stun', () => {});

          this._handlers.set('slow', () => {});

          this._handlers.set('silence', () => {});

          this._handlers.set('shield', () => {});
        } // --- ILifecycle (§5.1) ---


        initialize(ctx) {
          this._ctx = ctx;
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
          this._ctx = null;
          this._initialized = false;
        }

        get initialized() {
          return this._initialized;
        } // Apply a status effect to an entity.


        apply(target, effect) {
          var _this$_statuses$get;

          if (!target.alive) return;
          var list = (_this$_statuses$get = this._statuses.get(target.id)) != null ? _this$_statuses$get : []; // Refresh if same-id effect already active.

          var existing = list.find(s => s.effect.id === effect.id);

          if (existing) {
            existing.remaining = Math.max(existing.remaining, effect.duration);
            return;
          }

          list.push({
            effect,
            remaining: effect.duration
          });

          this._statuses.set(target.id, list); // Apply instant effect via the handler Map (no switch).


          var handler = this._handlers.get(effect.kind);

          if (handler) {
            handler(target, effect);
          }
        } // Tick all active statuses (call per frame from CombatSystem).


        update(dt) {
          var expired = [];

          for (var [id, list] of this._statuses) {
            var alive = [];

            for (var s of list) {
              s.remaining -= dt;

              if (s.remaining <= 0) {
                // Expired: apply final tick if DoT.
                if (s.effect.kind === 'burn' || s.effect.kind === 'poison') {// TODO: final tick logic if needed.
                }

                continue;
              }

              alive.push(s); // Tick DoT effects.

              if (s.effect.kind === 'burn' || s.effect.kind === 'poison') {// TODO: periodic tick (every 1s) — for now, tick per frame is sufficient for test.
              }
            }

            if (alive.length === 0) {
              expired.push(id);
            } else {
              this._statuses.set(id, alive);
            }
          }

          for (var _id of expired) {
            this._statuses.delete(_id);
          }
        } // Get active statuses on an entity.


        getStatuses(entityId) {
          var _this$_statuses$get2;

          return (_this$_statuses$get2 = this._statuses.get(entityId)) != null ? _this$_statuses$get2 : [];
        } // Check if entity has a specific status kind.


        hasStatus(entityId, kind) {
          var list = this._statuses.get(entityId);

          if (!list) return false;
          return list.some(s => s.effect.kind === kind);
        } // Clear all statuses (room exit / entity death).


        clear(entityId) {
          this._statuses.delete(entityId);
        }

        clearAll() {
          this._statuses.clear();
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=b675ccb189ba5a7e4d63eb6a92f2540848774cfa.js.map