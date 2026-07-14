System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, assetManager, AudioClip, JsonAsset, Prefab, Rect, resources, Size, SpriteFrame, Texture2D, AssetBundleService, _crd;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  _export("AssetBundleService", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      assetManager = _cc.assetManager;
      AudioClip = _cc.AudioClip;
      JsonAsset = _cc.JsonAsset;
      Prefab = _cc.Prefab;
      Rect = _cc.Rect;
      resources = _cc.resources;
      Size = _cc.Size;
      SpriteFrame = _cc.SpriteFrame;
      Texture2D = _cc.Texture2D;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "87295hKNl9LYa/qR1WY9svs", "AssetBundleService", undefined);

      __checkObsolete__(['assetManager', 'Asset', 'AssetManager', 'AudioClip', 'JsonAsset', 'Prefab', 'Rect', 'resources', 'Size', 'SpriteFrame', 'Texture2D']);

      _export("AssetBundleService", AssetBundleService = class AssetBundleService {
        constructor() {
          this._bundles = new Map();
          this._assetMap = null;
          this._mapLoaded = false;
        }

        static get instance() {
          if (!this._instance) this._instance = new AssetBundleService();
          return this._instance;
        }

        get mapLoaded() {
          return this._mapLoaded;
        }

        loadAssetMap(assetMap) {
          var _this = this;

          return _asyncToGenerator(function* () {
            _this._assetMap = assetMap;
            _this._mapLoaded = true;
          })();
        }

        loadAssetMapFromResources() {
          var _this2 = this;

          return _asyncToGenerator(function* () {
            if (_this2._mapLoaded) return;
            var asset = yield new Promise((resolve, reject) => {
              resources.load('config/assets', JsonAsset, (err, jsonAsset) => {
                if (err || !jsonAsset) {
                  reject(err != null ? err : new Error('load config/assets failed'));
                  return;
                }

                resolve(jsonAsset);
              });
            });
            var raw = asset.json;
            var map = 'data' in raw && raw.data ? raw.data : raw;
            yield _this2.loadAssetMap(map);
          })();
        }

        resolve(resourceId) {
          var _this$_assetMap$resou;

          if (!this._mapLoaded || !this._assetMap) {
            console.warn("[AssetBundleService] asset map not loaded: " + resourceId);
            return null;
          }

          return (_this$_assetMap$resou = this._assetMap[resourceId]) != null ? _this$_assetMap$resou : null;
        }

        loadBundle(name) {
          var _this3 = this;

          return _asyncToGenerator(function* () {
            if (name === 'resources') return resources;

            var cached = _this3._bundles.get(name);

            if (cached) return cached;
            return new Promise((resolve, reject) => {
              assetManager.loadBundle(name, (err, bundle) => {
                if (err || !bundle) {
                  reject(err != null ? err : new Error("loadBundle failed: " + name));
                  return;
                }

                _this3._bundles.set(name, bundle);

                resolve(bundle);
              });
            });
          })();
        }

        load(bundleName, path, type) {
          var _this4 = this;

          return _asyncToGenerator(function* () {
            var bundle = yield _this4.loadBundle(bundleName);
            return new Promise((resolve, reject) => {
              bundle.load(path, type, (err, asset) => {
                if (err || !asset) {
                  reject(err != null ? err : new Error("load asset failed: " + bundleName + ":" + path));
                  return;
                }

                resolve(asset);
              });
            });
          })();
        }

        loadById(resourceId) {
          var _this5 = this;

          return _asyncToGenerator(function* () {
            var entry = _this5.resolve(resourceId);

            if (!entry) throw new Error("[AssetBundleService] unknown resource: " + resourceId);

            var type = _this5._resolveType(entry.type);

            var lastError = null;

            for (var path of _this5._candidatePaths(entry)) {
              try {
                return yield _this5.load(entry.bundle, path, type);
              } catch (err) {
                lastError = err;
              }
            }

            throw lastError instanceof Error ? lastError : new Error("[AssetBundleService] load failed: " + resourceId);
          })();
        } // Safe variant: never throws. Returns null when the id is unknown or the
        // asset file is missing, so callers that discard the promise (e.g. editor
        // preview, optional 3D backdrops) cannot produce an unhandled rejection.
        // Mirrors tryLoadSpriteFrame below.


        tryLoadById(resourceId) {
          var _this6 = this;

          return _asyncToGenerator(function* () {
            try {
              return yield _this6.loadById(resourceId);
            } catch (err) {
              console.warn("[AssetBundleService] asset load failed (degraded): " + resourceId, err);
              return null;
            }
          })();
        }

        loadSpriteFrame(resourceId) {
          var _this7 = this;

          return _asyncToGenerator(function* () {
            return _this7.loadById(resourceId);
          })();
        }

        tryLoadSpriteFrame(resourceId) {
          var _this8 = this;

          return _asyncToGenerator(function* () {
            var entry = _this8.resolve(resourceId); // A Texture2D asset can't be used directly as a spriteFrame: it has
            // no `uv`, so the 2D assembler (Simple.updateUVs) throws
            // "Cannot read properties of undefined (reading '0')" once the render
            // loop runs. Wrap it in a SpriteFrame (full-texture quad) instead.
            // Without this, any asset registered as type "Texture2D" fed through a
            // SpriteFrame loader (background textures, raw character/monster PNGs, etc.)
            // crashes the scene the moment it reaches the render loop.


            if ((entry == null ? void 0 : entry.type) === 'Texture2D') {
              try {
                var tex = yield _this8.loadById(resourceId);
                var frame = new SpriteFrame();
                frame.texture = tex;
                frame.rect = new Rect(0, 0, tex.width, tex.height);
                frame.originalSize = new Size(tex.width, tex.height);
                return frame;
              } catch (err) {
                console.warn("[AssetBundleService] texture->sprite wrap failed: " + resourceId, err);
                return null;
              }
            }

            try {
              return yield _this8.loadSpriteFrame(resourceId);
            } catch (err) {
              console.warn("[AssetBundleService] sprite load failed: " + resourceId, err);
              return null;
            }
          })();
        }

        preload(bundleName, paths) {
          var bundle = bundleName === 'resources' ? resources : this._bundles.get(bundleName);

          if (!bundle) {
            console.warn("[AssetBundleService] cannot preload, bundle not loaded: " + bundleName);
            return;
          }

          var _loop = function _loop(p) {
            bundle.load(p, err => {
              if (err) console.warn("[AssetBundleService] preload failed: " + bundleName + ":" + p, err);
            });
          };

          for (var p of paths) {
            _loop(p);
          }
        }

        releaseBundle(name) {
          if (name === 'resources') return;

          var bundle = this._bundles.get(name);

          if (!bundle) return;
          bundle.releaseAll();
          assetManager.removeBundle(bundle);

          this._bundles.delete(name);
        }

        releaseAll() {
          for (var name of this._bundles.keys()) {
            this.releaseBundle(name);
          }
        }

        isLoaded(name) {
          return name === 'resources' || this._bundles.has(name);
        }

        _resolveType(typeName) {
          var _typeMap$typeName;

          var typeMap = {
            SpriteFrame,
            Texture2D,
            Prefab,
            JsonAsset,
            AudioClip
          };
          return (_typeMap$typeName = typeMap[typeName]) != null ? _typeMap$typeName : SpriteFrame;
        }

        _candidatePaths(entry) {
          if (entry.type === 'Texture2D' && !entry.path.endsWith('/texture')) {
            return [entry.path, entry.path + "/texture"];
          }

          return [entry.path];
        }

      });

      AssetBundleService._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=57a5199dc3311ac73b76d9c2ddcce28657e5e2d8.js.map