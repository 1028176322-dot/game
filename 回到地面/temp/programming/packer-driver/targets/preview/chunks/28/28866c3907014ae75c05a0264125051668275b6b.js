System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, ReplayPlayer, ReplayRecorder, _crd, REPLAY_VERSION;

  // Deterministic FNV-1a hash of a config snapshot — no Math.random (red line 5).
  function computeConfigHash(config) {
    var str = JSON.stringify(config);
    var h = 0x811c9dc5;

    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }

    return (h >>> 0).toString(16);
  }

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../core/LifecycleManager", _context.meta, extras);
  }

  _export({
    computeConfigHash: computeConfigHash,
    ReplayPlayer: void 0,
    ReplayRecorder: void 0
  });

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "1961eu4rKNNj6qpp+KwTQ3z", "ReplayRecorder", undefined); // assets/scripts/replay/ReplayRecorder.ts — §5.7 replay framework (★★★★★).
      // Pure TS, no `cc` import: deterministic replay = same seed (RunRng) + same input
      // stream. We only record (frame, InputCommand); re-simulation is the caller's duty.
      // Token: IReplayRecorder (declared in core/GameContext.ts, per §5.x service list).


      _export("REPLAY_VERSION", REPLAY_VERSION = 1);

      _export("ReplayPlayer", ReplayPlayer = class ReplayPlayer {
        // Re-emits the recorded frame stream in order. Identical header + frames ->
        // identical callback sequence, which (paired with the same seed) reproduces a run.
        play(_header, frames, onReplay) {
          for (var f of frames) {
            if (onReplay) onReplay(f.frame, f.cmd);
          }
        }

      });

      _export("ReplayRecorder", ReplayRecorder = class ReplayRecorder {
        constructor() {
          this.header = null;
          this._frames = [];
          // Ring buffer of completed runs (§5.7: keep recent N runs, tiny footprint).
          this._ring = [];
          this._maxRuns = 5;
          this._maxFrames = 1000000;
          this._ctx = null;
        }

        initialize(ctx) {
          this._ctx = ctx;
        }

        startRun(seed, configHash, version) {
          if (version === void 0) {
            version = REPLAY_VERSION;
          }

          this.header = {
            seed,
            version,
            configHash
          };
          this._frames = [];
        }

        record(frame, cmd) {
          if (this.header === null) {
            throw new Error('[ReplayRecorder] record() called before startRun()');
          }

          if (this._frames.length >= this._maxFrames) {
            this._frames.shift();
          }

          this._frames.push({
            frame,
            cmd
          });
        }

        endRun() {
          if (this.header === null) return;

          this._ring.push({
            header: this.header,
            frames: this._frames.slice()
          });

          if (this._ring.length > this._maxRuns) {
            this._ring.shift();
          }

          this.header = null;
          this._frames = [];
        }

        getFrames() {
          return this._frames.slice();
        }

        listRuns() {
          return this._ring;
        }

        play(frames, onReplay) {
          if (this.header === null) {
            throw new Error('[ReplayRecorder] play() called before startRun()');
          }

          new ReplayPlayer().play(this.header, frames, onReplay);
        }

        destroy() {
          this.header = null;
          this._frames = [];
          this._ring = [];
          this._ctx = null;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=28866c3907014ae75c05a0264125051668275b6b.js.map