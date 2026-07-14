System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, resources, JsonAsset, Sprite, UITransform, view, Vec3, RenderAssetService, AssetBundleService, UISkinService, _crd, VALID_TYPES;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _reportPossibleCrUseOfRenderAssetService(extras) {
    _reporterNs.report("RenderAssetService", "../assets/RenderAssetService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAssetBundleService(extras) {
    _reporterNs.report("AssetBundleService", "../assets/AssetBundleService", _context.meta, extras);
  }

  _export("UISkinService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      resources = _cc.resources;
      JsonAsset = _cc.JsonAsset;
      Sprite = _cc.Sprite;
      UITransform = _cc.UITransform;
      view = _cc.view;
      Vec3 = _cc.Vec3;
    }, function (_unresolved_2) {
      RenderAssetService = _unresolved_2.RenderAssetService;
    }, function (_unresolved_3) {
      AssetBundleService = _unresolved_3.AssetBundleService;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ed433INUplJIYXCLbOScEHe", "UISkinService", undefined);
      /**
       * UISkinService - UI skin unified loading service
       *
       * Responsibilities:
       *   1. Load ui_assets.json registry (semantic key -> assetId)
       *   2. Provide apply(node, key) unified entry point
       *   3. Handle nine_slice type automatically (set Sprite.Type.SLICED)
       *   4. Auto-load config on first apply() call
       *
       * Usage:
       *   await UISkinService.instance.apply(someNode, 'ui.main.start_button');
       *
       * Skin change workflow (no code change):
       *   1. Swap image file in textures/
       *   2. Update assetId in ui_assets.json (or in assets.json)
       *   3. Editor UISkinBinder.assetKey stays unchanged
       */


      __checkObsolete__(['resources', 'JsonAsset', 'Node', 'Sprite', 'SpriteFrame', 'UITransform', 'view', 'Vec3']);

      VALID_TYPES = new Set(['sprite', 'sliced', 'nine_slice', 'icon', 'background']);

      _export("UISkinService", UISkinService = class UISkinService {
        constructor() {
          this._defs = {};
          this._loaded = false;
          this._loading = false;
        }

        static get instance() {
          if (!this._instance) this._instance = new UISkinService();
          return this._instance;
        }

        get loaded() {
          return this._loaded;
        }
        /**
         * Load ui_assets.json registry from resources.
         * Safe to call multiple times (only loads once).
         */


        loadConfig() {
          var _this = this;

          return _asyncToGenerator(function* () {
            if (_this._loaded || _this._loading) return;
            _this._loading = true;

            try {
              var asset = yield new Promise((resolve, reject) => {
                resources.load('config/ui_assets', JsonAsset, (err, jsonAsset) => {
                  if (err || !jsonAsset) {
                    reject(err != null ? err : new Error('load config/ui_assets failed'));
                    return;
                  }

                  resolve(jsonAsset);
                });
              });
              var raw = asset.json;
              var data = 'data' in raw && raw.data ? raw.data : raw;

              for (var key of Object.keys(data)) {
                if (key === 'metadata') continue;
                var def = data[key]; // Validate type early

                if (def && def.type && !VALID_TYPES.has(def.type)) {
                  console.warn("[UISkinService] invalid type '" + def.type + "' for key '" + key + "', treating as 'sprite'");
                  def.type = 'sprite';
                }

                _this._defs[key] = def;
              }

              _this._loaded = true;
              console.log("[UISkinService] loaded " + Object.keys(_this._defs).length + " ui asset defs");
            } catch (err) {
              console.error('[UISkinService] loadConfig failed', err);
            } finally {
              _this._loading = false;
            }
          })();
        }
        /**
         * Look up a semantic key in the registry.
         */


        get(key) {
          var _this$_defs$key;

          return (_this$_defs$key = this._defs[key]) != null ? _this$_defs$key : null;
        }
        /**
         * Apply the skin identified by `key` onto `node`.
         *
         * Automatically loads config on first call.
         * For nine_slice type, sets Sprite.Type.SLICED for proper border scaling.
         *
         * @param node Target node (must have or auto-create Sprite component)
         * @param key  Semantic key, e.g. 'ui.main.start_button'
         * @returns    true if skin was applied successfully
         */


        apply(node, key) {
          var _this2 = this;

          return _asyncToGenerator(function* () {
            if (!node || !node.isValid) return false; // Auto-load config on first apply

            if (!_this2._loaded) {
              yield _this2.loadConfig();
            }

            var def = _this2.get(key);

            if (!def) {
              console.warn("[UISkinService] missing ui asset key: " + key);
              return false;
            }

            var frame = yield _this2._applyAsset(node, def.assetId);

            if (!frame) {
              console.warn("[UISkinService] apply failed: key=" + key + ", assetId=" + def.assetId);
              return _this2._fallback(node);
            }

            if (def.type === 'sliced' || def.type === 'nine_slice') {
              var sprite = _this2.ensureSprite(node);

              if (sprite) {
                sprite.type = Sprite.Type.SLICED;
                sprite.sizeMode = Sprite.SizeMode.CUSTOM;

                _this2._applySlice(sprite, def);
              }
            }

            if (def.type === 'background') {
              _this2._fitBackground(node);
            }

            return true;
          })();
        }
        /**
         * Apply skin but never throw (for optional skins).
         */


        applyOptional(node, key) {
          var _this3 = this;

          return _asyncToGenerator(function* () {
            try {
              yield _this3.apply(node, key);
            } catch (err) {
              console.warn("[UISkinService] applyOptional failed: key=" + key, err);
            }
          })();
        }
        /**
         * Ensure node has a Sprite component.
         */


        ensureSprite(node) {
          var _node$getComponent;

          if (!node.getComponent(UITransform)) {
            node.addComponent(UITransform);
          }

          return (_node$getComponent = node.getComponent(Sprite)) != null ? _node$getComponent : node.addComponent(Sprite);
        }
        /**
         * Check if a key exists in the registry.
         */


        has(key) {
          return key in this._defs;
        }
        /**
         * Get all registered keys.
         */


        keys() {
          return Object.keys(this._defs);
        }
        /**
         * Get all referenced assetIds (for cross-validation).
         */


        allAssetIds() {
          var ids = new Set();

          for (var def of Object.values(this._defs)) {
            if (def.assetId) ids.add(def.assetId);
          }

          return Array.from(ids);
        }

        _applyAsset(node, assetId) {
          return _asyncToGenerator(function* () {
            yield (_crd && AssetBundleService === void 0 ? (_reportPossibleCrUseOfAssetBundleService({
              error: Error()
            }), AssetBundleService) : AssetBundleService).instance.loadAssetMapFromResources();
            var entry = (_crd && AssetBundleService === void 0 ? (_reportPossibleCrUseOfAssetBundleService({
              error: Error()
            }), AssetBundleService) : AssetBundleService).instance.resolve(assetId);

            if ((entry == null ? void 0 : entry.type) === 'Texture2D') {
              return (_crd && RenderAssetService === void 0 ? (_reportPossibleCrUseOfRenderAssetService({
                error: Error()
              }), RenderAssetService) : RenderAssetService).applyTextureAsSprite(node, assetId);
            }

            return (_crd && RenderAssetService === void 0 ? (_reportPossibleCrUseOfRenderAssetService({
              error: Error()
            }), RenderAssetService) : RenderAssetService).applySpriteById(node, assetId);
          })();
        }

        _applySlice(sprite, def) {
          var _slice$left, _slice$right, _slice$top, _slice$bottom;

          var frame = sprite.spriteFrame;
          if (!frame || !def.slice) return;
          var slice = def.slice;
          frame.insetLeft = (_slice$left = slice.left) != null ? _slice$left : frame.insetLeft;
          frame.insetRight = (_slice$right = slice.right) != null ? _slice$right : frame.insetRight;
          frame.insetTop = (_slice$top = slice.top) != null ? _slice$top : frame.insetTop;
          frame.insetBottom = (_slice$bottom = slice.bottom) != null ? _slice$bottom : frame.insetBottom;

          if (def.defaultSize) {
            var _sprite$node$getCompo, _def$defaultSize$widt, _def$defaultSize$heig;

            var transform = (_sprite$node$getCompo = sprite.node.getComponent(UITransform)) != null ? _sprite$node$getCompo : sprite.node.addComponent(UITransform);
            var width = (_def$defaultSize$widt = def.defaultSize.width) != null ? _def$defaultSize$widt : transform.width;
            var height = (_def$defaultSize$heig = def.defaultSize.height) != null ? _def$defaultSize$heig : transform.height;

            if (width > 0 && height > 0) {
              transform.setContentSize(width, height);
            }
          }
        }
        /**
         * Get all keys filtered by usage.
         */


        keysByUsage(usage) {
          return Object.entries(this._defs).filter(_ref => {
            var [, def] = _ref;
            return def.usage === usage;
          }).map(_ref2 => {
            var [key] = _ref2;
            return key;
          });
        }
        /** Fallback placeholder when apply fails */


        _fallback(node) {
          var _this4 = this;

          return _asyncToGenerator(function* () {
            if (!_this4._loaded) return false;

            var def = _this4.get('ui.placeholder.avatar');

            if (!def) return false;
            var frame = yield (_crd && RenderAssetService === void 0 ? (_reportPossibleCrUseOfRenderAssetService({
              error: Error()
            }), RenderAssetService) : RenderAssetService).applySpriteById(node, def.assetId);
            return frame !== null;
          })();
        }

        _fitBackground(node) {
          var _node$getComponent2, _node$parent$getCompo, _node$parent;

          var transform = (_node$getComponent2 = node.getComponent(UITransform)) != null ? _node$getComponent2 : node.addComponent(UITransform);
          var parentTransform = (_node$parent$getCompo = (_node$parent = node.parent) == null ? void 0 : _node$parent.getComponent(UITransform)) != null ? _node$parent$getCompo : null;
          var visible = view.getVisibleSize();
          var width = parentTransform && parentTransform.width > 0 ? parentTransform.width : visible.width || 1280;
          var height = parentTransform && parentTransform.height > 0 ? parentTransform.height : visible.height || 720;
          transform.setContentSize(width, height);
          node.setPosition(Vec3.ZERO);
          var sprite = node.getComponent(Sprite);

          if (sprite) {
            sprite.type = Sprite.Type.SIMPLE;
            sprite.sizeMode = Sprite.SizeMode.CUSTOM;
          }
        }

      });

      UISkinService._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=534ef42a4b2b9ae493e05e44895e207bf97e3e86.js.map