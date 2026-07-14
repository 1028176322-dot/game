System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, LockOnManager, _crd, ILockOnManager;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../../core/LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCombatEntity(extras) {
    _reporterNs.report("CombatEntity", "./CombatCommand", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTargetResult(extras) {
    _reporterNs.report("TargetResult", "./CombatCommand", _context.meta, extras);
  }

  _export("LockOnManager", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "2eb27EHdB1G4o/yWuNTU+zq", "LockOnManager", undefined); // LockOnManager.ts — manages target lock-on (§3.8).
      // Pure TS, no `cc`. Implements ILifecycle (red line 3). exit() forces release (no dangling lock).
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.8 "锁定：选敌/解除/相机取景" + §6.2 flow.


      _export("ILockOnManager", ILockOnManager = 'ILockOnManager');

      _export("LockOnManager", LockOnManager = class LockOnManager {
        constructor() {
          this.name = 'LockOnManager';
          this._ctx = null;
          this._target = null;
          this._locked = false;
          this._lockTime = 0;
          this._initialized = false;
        }

        // --- ILifecycle (§5.1) ---
        initialize(ctx) {
          this._ctx = ctx;
          this._initialized = true;
        }

        enter() {}

        exit() {
          this.release();
        }

        pause() {}

        resume() {}

        destroy() {
          this.release();
          this._ctx = null;
          this._initialized = false;
        }

        get initialized() {
          return this._initialized;
        } // Acquire lock on a target.


        acquire(target) {
          if (!target.alive) {
            this.release();
            return false;
          }

          if (this._target && this._target.id === target.id && this._locked) return true; // already locked

          this._target = target;
          this._locked = true;
          this._lockTime = 0;
          return true;
        } // Release current lock.


        release() {
          this._target = null;
          this._locked = false;
          this._lockTime = 0;
        } // Cycle to next target in the pool (or nearest).


        cycle(pool, selfId) {
          var candidates = pool.filter(e => e.alive && e.id !== selfId);

          if (candidates.length === 0) {
            this.release();
            return null;
          } // If current target is still valid, find the next one in the list.


          if (this._target && this._locked) {
            var idx = candidates.findIndex(e => e.id === this._target.id);

            if (idx >= 0 && idx < candidates.length - 1) {
              var next = candidates[idx + 1];
              this.acquire(next);
              return next;
            }
          } // Default to the first candidate.


          var first = candidates[0];
          this.acquire(first);
          return first;
        } // Check if the target is still valid (alive, in range).


        validate(range, self) {
          if (!this._target || !this._locked) return false;

          if (!this._target.alive) {
            this.release();
            return false;
          }

          var dist = Math.abs(self.gridX - this._target.gridX) + Math.abs(self.gridY - this._target.gridY);

          if (dist > range) {
            this.release();
            return false;
          }

          return true;
        } // Apply to a TargetResult: auto-acquire if a lock-on target is present.


        apply(result) {
          if (result.lockOn) {
            this.acquire(result.lockOn);
          }
        } // Update lock timer (call per frame).


        update(dt) {
          if (this._locked) {
            this._lockTime += dt;
          }
        }

        get state() {
          return {
            target: this._target,
            locked: this._locked,
            lockTime: this._lockTime
          };
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=e213f07c5e388d8c52a02292b2f75f779444b2ac.js.map