System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, GameContext, _crd, ICollisionService, IAssetCache, IAnimationController, ILogger, IAudioService, IConfigDatabase, ISaveManager, IDebugService, ICameraBrain, IEventBus, IRuntimeState, ILightingService, IReplayRecorder;

  _export("GameContext", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ed989vtGWZJxpYIHLKw/Xfx", "GameContext", undefined);

      // GameContext.ts — ServiceLocator / DI container (§5.2).
      // Pure TS, no `cc` import: runs in node for vitest.
      // Authoritative spec: docs/2D转3D全面升级方案.md §5.2.
      _export("ICollisionService", ICollisionService = 'ICollisionService');

      _export("IAssetCache", IAssetCache = 'IAssetCache');

      _export("IAnimationController", IAnimationController = 'IAnimationController');

      _export("ILogger", ILogger = 'ILogger');

      _export("IAudioService", IAudioService = 'IAudioService');

      _export("IConfigDatabase", IConfigDatabase = 'IConfigDatabase');

      _export("ISaveManager", ISaveManager = 'ISaveManager');

      _export("IDebugService", IDebugService = 'IDebugService');

      _export("ICameraBrain", ICameraBrain = 'ICameraBrain');

      _export("IEventBus", IEventBus = 'IEventBus');

      _export("IRuntimeState", IRuntimeState = 'IRuntimeState');

      _export("ILightingService", ILightingService = 'ILightingService');

      _export("IReplayRecorder", IReplayRecorder = 'IReplayRecorder');

      _export("GameContext", GameContext = class GameContext {
        constructor() {
          this.services = new Map();
        }

        register(token, impl) {
          if (this.services.has(token)) {
            throw new Error("[GameContext] duplicate registration for token: " + token);
          }

          this.services.set(token, impl);
        }

        get(token) {
          if (!this.services.has(token)) {
            throw new Error("[GameContext] service not registered: " + token);
          }

          return this.services.get(token);
        }
        /** Non-throwing variant: returns undefined when the token is not registered.
         *  Use for best-effort/optional resolution (e.g. cosmetic services) so a
         *  missing registration degrades gracefully instead of crashing the caller. */


        getOptional(token) {
          return this.services.get(token);
        } // Reverse order: last registered destroyed first (dependents before dependencies).


        onDestroy() {
          var tokens = Array.from(this.services.keys());

          for (var i = tokens.length - 1; i >= 0; i--) {
            var svc = this.services.get(tokens[i]);

            if (svc && typeof svc.onDestroy === 'function') {
              svc.onDestroy();
            }
          }

          this.services.clear();
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=3b0cb6457379d50f9def638d3ff3203c53b4d75f.js.map