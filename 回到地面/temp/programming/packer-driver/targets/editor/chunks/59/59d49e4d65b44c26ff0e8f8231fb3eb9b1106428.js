System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, CombatComponent, _crd, ICombatComponent;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../core/LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSkillRequest(extras) {
    _reporterNs.report("SkillRequest", "../battle/ai/IAIController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBattleCommand(extras) {
    _reporterNs.report("BattleCommand", "../battle/combat/CombatCommand", _context.meta, extras);
  }

  _export("CombatComponent", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "e0b78L3Yq1AzaStW346TiOt", "CombatComponent", undefined); // CombatComponent.ts — skill queue + combat dispatch for ECS (§3.12).
      // Pure TS, no `cc`. Holds a queue of SkillRequests and forwards to CombatSystem.
      // No switch on skillId — CombatSystem handles dispatch.


      _export("ICombatComponent", ICombatComponent = 'ICombatComponent'); // AutoAttack logic absorption (P1-2): the pure atk-speed-gated crit / damage-
      // multiplier / life-steal / distance judgment now lives in the ECS component
      // layer (testable) instead of only inside the deprecated AutoAttack monobehaviour.
      // The runtime monobehaviour still drives the live player until the scene-node
      // swap (PlayerController/AutoAttack -> 6 components) is done in the editor.


      _export("CombatComponent", CombatComponent = class CombatComponent {
        constructor() {
          this._queue = [];
          this._cooldowns = new Map();
          this._dispatchFn = null;
          this._entityId = '';
        }

        initialize(ctxOrId, dispatch) {
          if (typeof ctxOrId !== 'string') return; // ILifecycle.initialize(ctx)

          this._entityId = ctxOrId;
          this._dispatchFn = dispatch != null ? dispatch : null;
        }

        enter() {}

        exit() {}

        pause() {}

        resume() {}

        destroy() {
          this._queue = [];

          this._cooldowns.clear();
        }

        get entityId() {
          return this._entityId;
        }

        get queueLength() {
          return this._queue.length;
        } // Enqueue a skill request from AI or player input.


        enqueue(req) {
          this._queue.push(req);
        } // Process one queued request (if cooldown allows).


        process(sourceId) {
          var _this$_cooldowns$get;

          if (this._queue.length === 0 || !this._dispatchFn) return false;

          const req = this._queue.shift(); // Check cooldown.


          const remaining = (_this$_cooldowns$get = this._cooldowns.get(req.skillId)) != null ? _this$_cooldowns$get : 0;

          if (remaining > 0) {
            this._queue.unshift(req); // put back, not ready yet


            return false;
          }

          const cmd = {
            kind: 'skill',
            sourceId,
            entityId: this._entityId,
            skillId: req.skillId
          };

          this._dispatchFn(cmd); // Set cooldown (default 1s if skill config not available).


          this._cooldowns.set(req.skillId, 1.0);

          return true;
        } // Tick cooldowns.


        update(dt) {
          const expired = [];

          for (const [id, remaining] of this._cooldowns) {
            const newRem = remaining - dt;

            if (newRem <= 0) {
              expired.push(id);
            } else {
              this._cooldowns.set(id, newRem);
            }
          }

          for (const id of expired) {
            this._cooldowns.delete(id);
          }
        } // Pure auto-attack resolution (P1-2 absorption). Encapsulates the crit roll,
        // damage multiplier, distance gate, and life-steal heal that AutoAttack used to
        // own. `rollCrit` injects determinism (defaults to Math.random); consumers wire
        // it to RunRng for seeded runs so the result stays reproducible.


        static resolveAutoAttack(ctx, target, rollCrit = () => Math.random() < ctx.critChance) {
          if (!target) {
            return {
              performed: false,
              damage: 0,
              isCrit: false,
              killed: false,
              lifeStealHeal: 0
            };
          }

          if (target.distanceInTiles > ctx.attackRange) {
            return {
              performed: false,
              damage: 0,
              isCrit: false,
              killed: false,
              lifeStealHeal: 0
            };
          }

          const isCrit = rollCrit();
          const raw = isCrit ? Math.floor(ctx.atk * ctx.critMultiplier) : ctx.atk;
          const damage = Math.max(1, Math.floor(raw * ctx.damageMultiplier));
          const killed = target.applyDamage(damage, isCrit);
          const lifeStealHeal = damage > 0 && ctx.lifeSteal > 0 ? Math.max(1, Math.floor(damage * ctx.lifeSteal)) : 0;
          return {
            performed: true,
            damage,
            isCrit,
            killed,
            lifeStealHeal
          };
        } // Clear all queued skills (on death / stun).


        clear() {
          this._queue = [];
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=59d49e4d65b44c26ff0e8f8231fb3eb9b1106428.js.map