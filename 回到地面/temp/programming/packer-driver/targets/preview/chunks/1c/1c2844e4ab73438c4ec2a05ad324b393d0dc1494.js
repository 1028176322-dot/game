System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, CameraBrain, _crd, ICameraBrain, CameraMode, MODE_KEY;

  function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

  function defaultParams() {
    return {
      followLerp: 8,
      tiltDeg: 42,
      shakeAmp: 0.3,
      shakeFreq: 22,
      shakeDur: 0.4,
      zoomDist: 8,
      lookAhead: 2
    };
  } // Contract for the camera brain (§3.4).


  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../core/LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfConfigDatabase(extras) {
    _reporterNs.report("ConfigDatabase", "../core/ConfigDatabase", _context.meta, extras);
  }

  _export("CameraBrain", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "bbb1aoj9QtB/L4v5fQBegoF", "CameraBrain", undefined); // CameraBrain.ts — 3D follow camera with strategy modes (§3.4).
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.4 + demo2.md.
      // Pure TS, NO top-level `cc` import: runs in node for vitest (real camera injected at runtime).
      //
      // Design notes:
      //  - Mode parameters are sourced from ConfigDatabase.getCamera(modeKey); nothing tunable is
      //    hardcoded (per demo2 strict constraint). Missing config falls back to safe defaults so the
      //    brain stays functional before camera config exists.
      //  - Camera math uses a plain Vec3Like shape; the engine camera node is attached at runtime and
      //    structurally satisfies ICameraNode (cc.Vec3 has x/y/z). No `cc` import keeps this testable.


      _export("ICameraBrain", ICameraBrain = 'ICameraBrain');

      _export("CameraMode", CameraMode = /*#__PURE__*/function (CameraMode) {
        CameraMode["Follow"] = "follow";
        CameraMode["LockOn"] = "lockon";
        CameraMode["Boss"] = "boss";
        CameraMode["Dialogue"] = "dialogue";
        CameraMode["Cinematic"] = "cinematic";
        CameraMode["Shake"] = "shake";
        CameraMode["Zoom"] = "zoom";
        return CameraMode;
      }({}));

      MODE_KEY = {
        [CameraMode.Follow]: 'follow',
        [CameraMode.LockOn]: 'lockon',
        [CameraMode.Boss]: 'boss',
        [CameraMode.Dialogue]: 'dialogue',
        [CameraMode.Cinematic]: 'cinematic',
        [CameraMode.Shake]: 'shake',
        [CameraMode.Zoom]: 'zoom'
      };

      _export("CameraBrain", CameraBrain = class CameraBrain {
        constructor(db) {
          this._db = void 0;
          this._camera = null;
          this._target = {
            x: 0,
            y: 0,
            z: 0
          };
          this._mode = CameraMode.Follow;
          this._params = {};
          this._shakeTime = 0;
          this._shakeAmp = 0;
          this._shakeDur = 0;
          this._initialized = false;
          this._db = db;
        }

        initialize(_ctx) {
          var keys = Object.values(MODE_KEY);

          for (var key of keys) {
            var raw = this._db.getCamera(key);

            this._params[key] = raw ? _extends({}, defaultParams(), raw) : defaultParams();
          }

          this._mode = CameraMode.Follow;
          this._shakeTime = 0;
          this._initialized = true;
        }

        enter() {
          this._shakeTime = 0;
        }

        exit() {
          /* no per-room teardown needed; camera state persists across rooms */
        }

        pause() {
          /* stop updating externally; state retained */
        }

        resume() {
          /* resume updating externally; state retained */
        }

        destroy() {
          this._camera = null;
          this._target = {
            x: 0,
            y: 0,
            z: 0
          };
          this._mode = CameraMode.Follow;
          this._shakeTime = 0;
          this._shakeAmp = 0;
          this._shakeDur = 0;
        }

        attach(camera) {
          this._camera = camera;
        }

        setTarget(pos) {
          this._target = {
            x: pos.x,
            y: pos.y,
            z: pos.z
          };
        }

        setMode(mode) {
          this._mode = mode;

          if (mode === CameraMode.Shake) {
            this._beginShake();
          }
        }

        triggerShake(amp, dur) {
          this._mode = CameraMode.Shake;

          this._beginShake(amp, dur);
        }

        get currentMode() {
          return this._mode;
        }

        get initialized() {
          return this._initialized;
        }

        _beginShake(amp, dur) {
          var p = this._params[MODE_KEY[CameraMode.Shake]];
          this._shakeAmp = amp != null ? amp : p.shakeAmp;
          this._shakeDur = dur != null ? dur : p.shakeDur;
          this._shakeTime = 0;
        } // Per-frame update. Engine calls this with delta time (seconds).


        lateUpdate(dt) {
          var _this$_params$MODE_KE;

          if (!this._camera) return;
          var p = (_this$_params$MODE_KE = this._params[MODE_KEY[this._mode]]) != null ? _this$_params$MODE_KE : defaultParams();
          var tilt = p.tiltDeg * Math.PI / 180;
          var height = p.zoomDist * Math.sin(tilt);
          var back = p.zoomDist * Math.cos(tilt);
          var desired = {
            x: this._target.x,
            y: this._target.y + height,
            z: this._target.z + back
          }; // Frame-rate independent smoothing.

          var f = 1 - Math.exp(-p.followLerp * dt);
          this._camera.position.x += (desired.x - this._camera.position.x) * f;
          this._camera.position.y += (desired.y - this._camera.position.y) * f;
          this._camera.position.z += (desired.z - this._camera.position.z) * f;
          var shaking = this._mode === CameraMode.Shake || this._shakeTime < this._shakeDur;

          if (shaking) {
            this._shakeTime += dt;
            var decay = Math.max(0, 1 - this._shakeTime / this._shakeDur);

            var _amp = this._shakeAmp * decay;

            this._camera.position.x += Math.sin(this._shakeTime * p.shakeFreq) * _amp;
            this._camera.position.z += Math.cos(this._shakeTime * p.shakeFreq) * _amp;
          }
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=1c2844e4ab73438c4ec2a05ad324b393d0dc1494.js.map