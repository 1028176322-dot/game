System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, TargetComponent, _crd, ITargetComponent;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../core/LifecycleManager", _context.meta, extras);
  }

  _export("TargetComponent", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "cf576yOSMNAhKHRAfl9BJDY", "TargetComponent", undefined); // TargetComponent.ts — holds the current target reference for ECS (§3.12).
      // Pure TS, no `cc`. Works with LockOnManager for target acquisition/cycling.


      _export("ITargetComponent", ITargetComponent = 'ITargetComponent');

      _export("TargetComponent", TargetComponent = class TargetComponent {
        constructor() {
          this._targetId = null;
          this._selfX = 0;
          this._selfY = 0;
          this._locked = false;
        }

        initialize(ctxOrX, selfY) {
          if (typeof ctxOrX !== 'number') return; // ILifecycle.initialize(ctx)

          this._selfX = ctxOrX;
          this._selfY = selfY != null ? selfY : 0;
        }

        enter() {}

        exit() {}

        pause() {}

        resume() {}

        destroy() {
          this.clear();
        }

        get targetId() {
          return this._targetId;
        }

        get locked() {
          return this._locked;
        }

        setTarget(entityId, locked) {
          this._targetId = entityId;
          this._locked = locked;
        }

        clear() {
          this._targetId = null;
          this._locked = false;
        }

        updatePosition(x, y) {
          this._selfX = x;
          this._selfY = y;
        }

        getInfo(targetX, targetY) {
          if (!this._targetId) return null;
          const dist = Math.abs(this._selfX - targetX) + Math.abs(this._selfY - targetY);
          return {
            targetId: this._targetId,
            distance: dist,
            isBoss: false,
            isLocked: this._locked
          };
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=28fe9add28ff89cd4834ece8d4e1ad3b384a8588.js.map