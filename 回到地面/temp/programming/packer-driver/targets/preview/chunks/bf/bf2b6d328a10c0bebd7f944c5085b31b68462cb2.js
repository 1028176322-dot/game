System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, PerfSampler, _crd;

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../core/LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfDebugSnapshot(extras) {
    _reporterNs.report("DebugSnapshot", "./DebugPanel", _context.meta, extras);
  }

  _export("PerfSampler", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "204c3g+J79IML1lNqb8CwlQ", "PerfSampler", undefined); // assets/scripts/debug/PerfSampler.ts — Demo6 performance baseline sampler (§5.5 / §8.1).
      // Pure TS, no `cc` import: runs in node for vitest.
      // Dedicated sampler for the 100-monsters-on-screen stress baseline. Produces smoothed
      // FPS / frame-time / memory / draw-call consumed by DebugPanel (§5.5). No Math.random
      // (red line 5): FPS is derived purely from injected frame deltas, fully deterministic.
      // Engine feeds real per-frame memory (MB) and draw-call counts. Injected so the
      // sampler stays pure-TS and testable without a runtime.


      _export("PerfSampler", PerfSampler = class PerfSampler {
        constructor(windowSize) {
          if (windowSize === void 0) {
            windowSize = 60;
          }

          this._window = [];
          this._capacity = void 0;
          this._source = null;
          this._capacity = Math.max(1, windowSize | 0);
        }

        setSource(src) {
          this._source = src;
        } // Record one frame's delta (ms) into the sliding window for smoothed metrics.


        tick(dtMs) {
          if (!Number.isFinite(dtMs) || dtMs < 0) return;

          this._window.push(dtMs);

          if (this._window.length > this._capacity) {
            this._window.shift();
          }
        } // Smoothed FPS over the window. Deterministic: count * 1000 / sum(dt).


        fps() {
          var sum = this._sum();

          if (sum <= 0) return 0;
          return this._window.length * 1000 / sum;
        }

        frameTimeMs() {
          if (this._window.length === 0) return 0;
          return this._sum() / this._window.length;
        }

        memoryMB() {
          return this._source ? this._source.getMemoryMB() : null;
        }

        drawCall() {
          return this._source ? this._source.getDrawCall() : null;
        } // Provider-compatible snapshot for DebugPanel aggregation (Map, no switch).


        getSnapshot() {
          return {
            fps: this.fps(),
            frameTimeMs: this.frameTimeMs(),
            memoryMB: this.memoryMB(),
            drawCall: this.drawCall()
          };
        }

        reset() {
          this._window = [];
        }

        _sum() {
          var s = 0;

          for (var v of this._window) s += v;

          return s;
        } // ILifecycle (red line 3): no external resources; only destroy clears state.


        initialize(_ctx) {}

        enter() {}

        pause() {}

        resume() {}

        exit() {}

        destroy() {
          this.reset();
          this._source = null;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=bf2b6d328a10c0bebd7f944c5085b31b68462cb2.js.map