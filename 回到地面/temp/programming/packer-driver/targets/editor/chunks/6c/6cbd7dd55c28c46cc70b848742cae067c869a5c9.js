System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, RunRng, RuntimeState, _crd;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "./GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "./LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRunRng(extras) {
    _reporterNs.report("RunRng", "./rng/RunRng", _context.meta, extras);
  }

  _export("RuntimeState", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      RunRng = _unresolved_2.RunRng;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "cbf22cnDqBA1Y7EO11eNiYM", "RuntimeState", undefined); // assets/scripts/core/RuntimeState.ts — P2-2 (§2.2 / §5.5).
      // Authoritative per-run runtime state: seed + frame counter, exposed to the
      // DebugPanel Seed panel and deterministic replay. Pure TS (delegates the seed
      // to RunRng); no `cc` import so it runs under vitest.


      _export("RuntimeState", RuntimeState = class RuntimeState {
        constructor() {
          this._ctx = null;
          this._frame = 0;
        }

        initialize(ctx) {
          this._ctx = ctx;
        }
        /** Authoritative run seed (delegated to RunRng, §2.2 deterministic). */


        getSeed() {
          return (_crd && RunRng === void 0 ? (_reportPossibleCrUseOfRunRng({
            error: Error()
          }), RunRng) : RunRng).instance.seed;
        }
        /** Monotonic in-run frame counter for the DebugPanel Seed panel. */


        getFrame() {
          return this._frame;
        }
        /** Advance the per-frame counter; call once per engine frame. */


        tickFrame() {
          this._frame++;
        }
        /** Shape matches DebugPanel.SeedDebugInfo so the provider can Object.assign. */


        getSeedDebug() {
          return {
            seed: this.getSeed(),
            frame: this._frame
          };
        }

        enter() {}

        pause() {}

        resume() {}

        exit() {}

        destroy() {
          this._frame = 0;
          this._ctx = null;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=6cbd7dd55c28c46cc70b848742cae067c869a5c9.js.map