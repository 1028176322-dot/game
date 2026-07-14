System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, director, SceneFlowService, _crd;

  _export("SceneFlowService", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      director = _cc.director;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "b0946v/EmZL26J6MTxiUhqZ", "SceneFlowService", undefined);
      /**
       * SceneFlowService - Scene transition service (Promise-based)
       *
       * ONLY class in the project allowed to call director.loadScene().
       * All other code must go through AppFlowController or RunCoordinator.
       *
       * Returns Promise<void> so callers can await scene load completion
       * before emitting events (fixes "event before listener registered" bug).
       */


      __checkObsolete__(['director']);

      _export("SceneFlowService", SceneFlowService = class SceneFlowService {
        constructor() {
          this._currentScene = 'splash';
        }

        static get instance() {
          if (!this._instance) this._instance = new SceneFlowService();
          return this._instance;
        }

        get currentScene() {
          return this._currentScene;
        }

        goToSplash() {
          return this._load('splash');
        }

        goToMain() {
          return this._load('main');
        }

        goToDungeon() {
          return this._load('dungeon');
        }
        /** Unified scene transition returning Promise on completion */


        goTo(scene) {
          return this._load(scene);
        }

        _load(scene) {
          if (this._currentScene === scene) {
            console.warn("[SceneFlow] already on scene: " + scene);
            return Promise.resolve();
          }

          return new Promise((resolve, reject) => {
            console.log("[SceneFlow] transitioning: " + this._currentScene + " -> " + scene);
            director.loadScene(scene, err => {
              if (err) {
                console.error("[SceneFlow] failed to load scene: " + scene, err);
                reject(err);
                return;
              }

              this._currentScene = scene;
              resolve();
            });
          });
        }

      });

      SceneFlowService._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=db3d312ff3f0d5b988873231026d2f14e87d3e00.js.map