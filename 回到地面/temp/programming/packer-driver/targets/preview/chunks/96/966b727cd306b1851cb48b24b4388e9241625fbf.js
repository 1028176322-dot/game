System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, ICameraBrain, DebugPanel, _crd;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfICameraBrain(extras) {
    _reporterNs.report("ICameraBrain", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../core/LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPerfSampler(extras) {
    _reporterNs.report("PerfSampler", "./PerfSampler", _context.meta, extras);
  }

  _export("DebugPanel", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      ICameraBrain = _unresolved_2.ICameraBrain;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "972a60Kqj1ETJNEKCGrshe6", "DebugPanel", undefined); // assets/scripts/debug/DebugPanel.ts — §5.5 debug framework (Dev/Debug builds only).
      // Pure TS, no `cc` import: runs in node for vitest.
      // Token: IDebugService (declared in core/GameContext.ts, per §5.x service list).


      // 12-category debug snapshot per §5.5 panel layout. Categories whose source
      // system is not built yet stay `undefined` until a provider fills them.
      _export("DebugPanel", DebugPanel = class DebugPanel {
        constructor() {
          this._ctx = null;
          this._visible = false;
          this._fps = 0;
          this._frameMs = 0;
          this._mem = null;
          this._draw = null;
          this._providers = new Map();
          this._events = [];
          this._maxEvents = 200;
          this._stats = null;
          this._perf = null;
        }

        initialize(ctx) {
          this._ctx = ctx; // §5.5 lists ICameraBrain.getDebugState() as a data source. CameraBrain (Demo2)
          // does not implement it yet, so we duck-type: wire the camera provider only if
          // the registered object exposes getDebugState(). No modification of CameraBrain.

          var cam = this._safeGet(_crd && ICameraBrain === void 0 ? (_reportPossibleCrUseOfICameraBrain({
            error: Error()
          }), ICameraBrain) : ICameraBrain);

          if (cam && typeof cam.getDebugState === 'function') {
            this.registerProvider('camera', () => ({
              camera: cam.getDebugState()
            }));
          }
        }

        _safeGet(token) {
          if (!this._ctx) return null;

          try {
            return this._ctx.get(token);
          } catch (_unused) {
            return null;
          }
        }

        registerProvider(name, provider) {
          this._providers.set(name, provider);
        }

        setRuntimeStats(provider) {
          this._stats = provider;
        } // Demo6: wire the dedicated PerfSampler as the authoritative perf source
        // (smoothed FPS/frame-time/memory/draw-call) for the 100-monster stress baseline.


        setPerfSampler(sampler) {
          this._perf = sampler;
        }

        toggle() {
          this._visible = !this._visible;
        }

        setVisible(v) {
          this._visible = v;
        }

        isVisible() {
          return this._visible;
        } // Called every frame from the engine loop (dtMs = frame delta in ms).


        update(dtMs) {
          if (this._perf) {
            this._perf.tick(dtMs);

            this._fps = this._perf.fps();
            this._frameMs = this._perf.frameTimeMs();
            this._mem = this._perf.memoryMB();
            this._draw = this._perf.drawCall();
            return;
          } // Fallback when no PerfSampler is wired (kept for §5.5 parity).


          this._frameMs = dtMs;
          this._fps = dtMs > 0 ? Math.round(1000 / dtMs) : 0;

          if (this._stats) {
            this._mem = this._stats.getMemoryMB();
            this._draw = this._stats.getDrawCall();
          }
        }

        pushEvent(channel, level, msg) {
          this._append({
            time: new Date().toISOString(),
            channel,
            level,
            msg
          });
        } // Sink adapter: Logger's output line `[time][channel][level] msg` is forwarded
        // here so the "Events" panel reuses the ILogger buffer (§5.5).


        pushRaw(line) {
          var m = /^\[([^\]]+)\]\[([^\]]+)\]\[([^\]]+)\]\s*(.*)$/.exec(line);

          if (m) {
            this._append({
              time: m[1],
              channel: m[2],
              level: m[3],
              msg: m[4]
            });
          }
        }

        _append(e) {
          this._events.push(e);

          if (this._events.length > this._maxEvents) {
            this._events.shift();
          }
        }

        sample() {
          var snap = {
            visible: this._visible,
            fps: this._fps,
            frameTimeMs: this._frameMs,
            memoryMB: this._mem,
            drawCall: this._draw,
            events: this._events.slice()
          }; // Aggregation via provider map (NO switch on category).

          for (var p of this._providers.values()) {
            var part = p();
            if (part) Object.assign(snap, part);
          }

          return snap;
        }

        enter() {}

        pause() {}

        resume() {}

        exit() {}

        destroy() {
          this._events = [];

          this._providers.clear();

          this._ctx = null;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=966b727cd306b1851cb48b24b4388e9241625fbf.js.map