System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Color, director, LightingService, _crd;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../core/LifecycleManager", _context.meta, extras);
  }

  _export("LightingService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Color = _cc.Color;
      director = _cc.director;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "1c21fDyARJBHrBtTN/2BS5X", "LightingService", undefined); // assets/scripts/lighting/LightingService.ts — P2-1 (§3.14).
      // Per-region lighting presets (directional / ambient / fog / skybox) applied to
      // the live scene root. The actual scene-root mutation is best-effort and guarded
      // (no-op in headless); verify the 3D look in the Cocos Creator editor.


      __checkObsolete__(['Color', 'director']); // Local view of the cc Root lighting API. Casting `director.root` to this keeps
      // the file compile-safe across engine versions without depending on exact cc
      // type names (the real mutation is guarded by try/catch).


      _export("LightingService", LightingService = class LightingService {
        constructor() {
          this._ctx = null;
          this._current = null;
          this._presets = {
            forest: {
              directionalColor: 0xfff2c4,
              directionalIntensity: 1.1,
              directionalDir: [0.4, 1.0, 0.3],
              ambientColor: 0x4a6b3a,
              ambientIntensity: 0.6,
              fogColor: 0x9fb8a0,
              fogEnabled: true,
              fogDensity: 0.015,
              fogStart: 300,
              fogEnd: 1200,
              skyboxEnabled: true
            },
            catacombs: {
              directionalColor: 0x6a7cff,
              directionalIntensity: 0.5,
              directionalDir: [0.2, 1.0, -0.2],
              ambientColor: 0x202838,
              ambientIntensity: 0.4,
              fogColor: 0x0a0e18,
              fogEnabled: true,
              fogDensity: 0.04,
              fogStart: 100,
              fogEnd: 700,
              skyboxEnabled: false
            },
            volcano: {
              directionalColor: 0xff8a3c,
              directionalIntensity: 1.3,
              directionalDir: [0.3, 0.9, 0.5],
              ambientColor: 0x4a2418,
              ambientIntensity: 0.5,
              fogColor: 0x3a1208,
              fogEnabled: true,
              fogDensity: 0.02,
              fogStart: 200,
              fogEnd: 1000,
              skyboxEnabled: true
            },
            tundra: {
              directionalColor: 0xcfe6ff,
              directionalIntensity: 1.0,
              directionalDir: [0.1, 1.0, 0.2],
              ambientColor: 0x4a5a6a,
              ambientIntensity: 0.7,
              fogColor: 0xd5e6f0,
              fogEnabled: true,
              fogDensity: 0.025,
              fogStart: 250,
              fogEnd: 1100,
              skyboxEnabled: true
            },
            swamp: {
              directionalColor: 0x9fd06a,
              directionalIntensity: 0.7,
              directionalDir: [0.3, 0.9, -0.1],
              ambientColor: 0x2a3a22,
              ambientIntensity: 0.5,
              fogColor: 0x3a4a2a,
              fogEnabled: true,
              fogDensity: 0.035,
              fogStart: 150,
              fogEnd: 800,
              skyboxEnabled: false
            },
            abyss: {
              directionalColor: 0x8a4cff,
              directionalIntensity: 0.4,
              directionalDir: [0.0, 1.0, 0.0],
              ambientColor: 0x140a22,
              ambientIntensity: 0.35,
              fogColor: 0x0a0414,
              fogEnabled: true,
              fogDensity: 0.05,
              fogStart: 80,
              fogEnd: 600,
              skyboxEnabled: false
            }
          };
        }

        initialize(ctx) {
          this._ctx = ctx;
        }

        getPreset(region) {
          return this._presets[region];
        }

        get current() {
          return this._current;
        }
        /** Apply the preset for a region to the live scene root (best-effort). */


        apply(region) {
          this._current = region;

          this._applyToRoot(this._presets[region]);
        }

        _applyToRoot(preset) {
          try {
            var root = director.root;
            if (!root) return;

            if (root.ambient) {
              root.ambient.skyColor = this._toColor(preset.ambientColor);
              root.ambient.skyIllum = preset.ambientIntensity * 1000;
            }

            if (root.fog) {
              root.fog.enabled = preset.fogEnabled;
              root.fog.fogColor = this._toColor(preset.fogColor);
              root.fog.fogDensity = preset.fogDensity;
              root.fog.fogStart = preset.fogStart;
              root.fog.fogEnd = preset.fogEnd;
            }

            if (root.skybox) {
              root.skybox.enabled = preset.skyboxEnabled;
            }
          } catch (_unused) {// Lighting is cosmetic; never break the game loop if the root API
            // differs across engine versions or in headless test runs.
          }
        }

        _toColor(hex) {
          return new Color(hex >> 16 & 255, hex >> 8 & 255, hex & 255);
        }

        enter() {}

        pause() {}

        resume() {}

        exit() {}

        destroy() {
          this._current = null;
          this._ctx = null;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=06381c33a9a14f19aaeee23e61cf3ba865a21ac5.js.map