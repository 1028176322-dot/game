System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, HitResolver, DamageResolver, _crd, IHitResolver, IDamageResolver;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../../core/LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfDamageable(extras) {
    _reporterNs.report("Damageable", "./SkillData", _context.meta, extras);
  }

  _export({
    HitResolver: void 0,
    DamageResolver: void 0
  });

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "de785denNJGS5r8566qWtSy", "Resolvers", undefined); // Resolvers.ts — pure skill effect resolvers (§3.9 HitResolver / DamageResolver).
      // Pure TS, no `cc`. No state, no `switch`. These are the leaf effects applied to a Damageable.
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.9.


      _export("IHitResolver", IHitResolver = 'IHitResolver');

      _export("IDamageResolver", IDamageResolver = 'IDamageResolver');

      _export("HitResolver", HitResolver = class HitResolver {
        constructor() {
          this._ctx = null;
        }

        // ILifecycle (§5.1): stateless service; no teardown needed beyond clearing the ctx ref.
        initialize(ctx) {
          this._ctx = ctx;
        }

        enter() {}

        exit() {}

        pause() {}

        resume() {}

        destroy() {
          this._ctx = null;
        } // Apply direct hit damage. Pure: forwards to the target contract.


        resolve(target, amount, source) {
          target.applyDamage(amount, source);
        }

      });

      _export("DamageResolver", DamageResolver = class DamageResolver {
        constructor() {
          this._ctx = null;
        }

        // ILifecycle (§5.1): stateless service; no teardown needed beyond clearing the ctx ref.
        initialize(ctx) {
          this._ctx = ctx;
        }

        enter() {}

        exit() {}

        pause() {}

        resume() {}

        destroy() {
          this._ctx = null;
        } // Apply a burn damage-over-time effect. Pure: forwards to the target contract.


        applyBurn(target, dps, duration, source) {
          target.applyBurn(dps, duration, source);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=557dcd848e536b6836bca7f81f2d14d7d98a500d.js.map