System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, JsonAsset, resources, AssetBundleService, UISkinService, UISkinSceneApplier, _crd;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _reportPossibleCrUseOfAssetBundleService(extras) {
    _reporterNs.report("AssetBundleService", "../assets/AssetBundleService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUISkinService(extras) {
    _reporterNs.report("UISkinService", "./UISkinService", _context.meta, extras);
  }

  _export("UISkinSceneApplier", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      JsonAsset = _cc.JsonAsset;
      resources = _cc.resources;
    }, function (_unresolved_2) {
      AssetBundleService = _unresolved_2.AssetBundleService;
    }, function (_unresolved_3) {
      UISkinService = _unresolved_3.UISkinService;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "53946dnxNpMYIW4unSSPj3C", "UISkinSceneApplier", undefined);
      /**
       * UISkinSceneApplier — Scene-level skin auto-applier
       *
       * Reads ui_skin_bindings.json, traverses the active scene node tree,
       * and applies UISkinService skins by matching node paths to semantic keys.
       *
       * Usage:
       *   await UISkinSceneApplier.applyScene(scene.root, 'splash');
       *   await UISkinSceneApplier.applyScene(scene.root, 'main');
       *   await UISkinSceneApplier.applyScene(scene.root, 'dungeon');
       *
       * This is the entry point for the 3-layer UI skin pipeline:
       *   assets.json -> ui_assets.json -> ui_skin_bindings.json -> UISkinSceneApplier -> UISkinService
       */


      __checkObsolete__(['JsonAsset', 'Node', 'resources']);

      _export("UISkinSceneApplier", UISkinSceneApplier = class UISkinSceneApplier {
        /**
         * Apply all skins defined for `sceneKey` onto the scene tree.
         * Fails gracefully with console.warn — does not block game flow.
         */
        static applyScene(sceneRoot, sceneKey) {
          var _this = this;

          return _asyncToGenerator(function* () {
            var _this$_config$sceneKe, _this$_config;

            if (!sceneRoot || !sceneRoot.isValid) return;
            yield _this._loadConfig();
            yield (_crd && AssetBundleService === void 0 ? (_reportPossibleCrUseOfAssetBundleService({
              error: Error()
            }), AssetBundleService) : AssetBundleService).instance.loadAssetMapFromResources();
            yield (_crd && UISkinService === void 0 ? (_reportPossibleCrUseOfUISkinService({
              error: Error()
            }), UISkinService) : UISkinService).instance.loadConfig();
            var bindings = (_this$_config$sceneKe = (_this$_config = _this._config) == null ? void 0 : _this$_config[sceneKey]) != null ? _this$_config$sceneKe : {};
            var entries = Object.entries(bindings);

            if (entries.length === 0) {
              console.warn("[UISkinSceneApplier] no bindings for scene: " + sceneKey);
              return;
            }

            var applied = 0;
            var skipped = 0;

            for (var [path, skinKey] of entries) {
              var node = _this._findByPath(sceneRoot, path);

              if (!node) {
                console.warn("[UISkinSceneApplier] node not found: scene=" + sceneKey + ", path=" + path + ", key=" + skinKey);
                skipped++;
                continue;
              }

              var ok = yield (_crd && UISkinService === void 0 ? (_reportPossibleCrUseOfUISkinService({
                error: Error()
              }), UISkinService) : UISkinService).instance.apply(node, skinKey);

              if (!ok) {
                console.warn("[UISkinSceneApplier] apply failed: scene=" + sceneKey + ", path=" + path + ", key=" + skinKey);
                skipped++;
              } else {
                applied++;
              }
            }

            console.log("[UISkinSceneApplier] scene=" + sceneKey + " applied=" + applied + " skipped=" + skipped);
          })();
        }
        /**
         * Manually trigger bindings for a single scene (splash/main/dungeon).
         * Used when scene root changes after initial load.
         */


        static refreshScene(sceneRoot, sceneKey) {
          var _this2 = this;

          return _asyncToGenerator(function* () {
            yield _this2.applyScene(sceneRoot, sceneKey);
          })();
        }
        /**
         * Look up a skin key by exact scene and node path.
         * Returns null if no binding exists.
         */


        static getBinding(sceneKey, nodePath) {
          var _this$_config$sceneKe2, _this$_config2;

          return (_this$_config$sceneKe2 = (_this$_config2 = this._config) == null || (_this$_config2 = _this$_config2[sceneKey]) == null ? void 0 : _this$_config2[nodePath]) != null ? _this$_config$sceneKe2 : null;
        }
        /**
         * Get all bindings for a scene (for debugging / gate validation).
         */


        static getBindings(sceneKey) {
          var _this$_config$sceneKe3, _this$_config3;

          return (_this$_config$sceneKe3 = (_this$_config3 = this._config) == null ? void 0 : _this$_config3[sceneKey]) != null ? _this$_config$sceneKe3 : {};
        }
        /** Load ui_skin_bindings.json (once). */


        static _loadConfig() {
          var _this3 = this;

          return _asyncToGenerator(function* () {
            if (_this3._config) return;
            if (_this3._loading) return _this3._loading;
            _this3._loading = new Promise(resolve => {
              resources.load('config/ui_skin_bindings', JsonAsset, (err, asset) => {
                if (err || !asset) {
                  console.error('[UISkinSceneApplier] load config/ui_skin_bindings failed', err);
                  _this3._config = {};
                  resolve();
                  return;
                }

                _this3._config = asset.json;
                console.log("[UISkinSceneApplier] loaded bindings: splash=" + _this3._count('splash') + " main=" + _this3._count('main') + " dungeon=" + _this3._count('dungeon'));
                resolve();
              });
            });
            return _this3._loading;
          })();
        }
        /** Traverse scene node hierarchy by '/' separated path. */


        static _findByPath(root, path) {
          var parts = path.split('/').filter(Boolean);
          if (parts.length === 0) return root;
          var current = root; // If root name matches first segment, skip it

          if (current.name === parts[0]) {
            parts.shift();
          }

          for (var part of parts) {
            var _current$getChildByNa, _current;

            current = (_current$getChildByNa = (_current = current) == null ? void 0 : _current.getChildByName(part)) != null ? _current$getChildByNa : null;
            if (!current) return null;
          }

          return current;
        }

        static _count(sceneKey) {
          var _this$_config$sceneKe4, _this$_config4;

          return Object.keys((_this$_config$sceneKe4 = (_this$_config4 = this._config) == null ? void 0 : _this$_config4[sceneKey]) != null ? _this$_config$sceneKe4 : {}).length;
        }

      });

      UISkinSceneApplier._config = null;
      UISkinSceneApplier._loading = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=efa686f153fa0b28c459d490707bb368f1333f68.js.map