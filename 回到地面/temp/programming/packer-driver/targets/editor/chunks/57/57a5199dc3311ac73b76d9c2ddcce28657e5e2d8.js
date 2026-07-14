System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, assetManager, AudioClip, JsonAsset, Prefab, Rect, resources, Size, SpriteFrame, Texture2D, AssetBundleService, _crd;

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

        async loadAssetMap(assetMap) {
          this._assetMap = assetMap;
          this._mapLoaded = true;
        }

        async loadAssetMapFromResources() {
          if (this._mapLoaded) return;
          const asset = await new Promise((resolve, reject) => {
            resources.load('config/assets', JsonAsset, (err, jsonAsset) => {
              if (err || !jsonAsset) {
                reject(err != null ? err : new Error('load config/assets failed'));
                return;
              }

              resolve(jsonAsset);
            });
          });
          const raw = asset.json;
          const map = 'data' in raw && raw.data ? raw.data : raw;
          await this.loadAssetMap(map);
        }

        resolve(resourceId) {
          var _this$_assetMap$resou;

          if (!this._mapLoaded || !this._assetMap) {
            console.warn(`[AssetBundleService] asset map not loaded: ${resourceId}`);
            return null;
          }

          return (_this$_assetMap$resou = this._assetMap[resourceId]) != null ? _this$_assetMap$resou : null;
        }

        async loadBundle(name) {
          if (name === 'resources') return resources;

          const cached = this._bundles.get(name);

          if (cached) return cached;
          return new Promise((resolve, reject) => {
            assetManager.loadBundle(name, (err, bundle) => {
              if (err || !bundle) {
                reject(err != null ? err : new Error(`loadBundle failed: ${name}`));
                return;
              }

              this._bundles.set(name, bundle);

              resolve(bundle);
            });
          });
        }

        async load(bundleName, path, type) {
          const bundle = await this.loadBundle(bundleName);
          return new Promise((resolve, reject) => {
            bundle.load(path, type, (err, asset) => {
              if (err || !asset) {
                reject(err != null ? err : new Error(`load asset failed: ${bundleName}:${path}`));
                return;
              }

              resolve(asset);
            });
          });
        }

        async loadById(resourceId) {
          const entry = this.resolve(resourceId);
          if (!entry) throw new Error(`[AssetBundleService] unknown resource: ${resourceId}`);

          const type = this._resolveType(entry.type);

          let lastError = null;

          for (const path of this._candidatePaths(entry)) {
            try {
              return await this.load(entry.bundle, path, type);
            } catch (err) {
              lastError = err;
            }
          }

          throw lastError instanceof Error ? lastError : new Error(`[AssetBundleService] load failed: ${resourceId}`);
        } // Safe variant: never throws. Returns null when the id is unknown or the
        // asset file is missing, so callers that discard the promise (e.g. editor
        // preview, optional 3D backdrops) cannot produce an unhandled rejection.
        // Mirrors tryLoadSpriteFrame below.


        async tryLoadById(resourceId) {
          try {
            return await this.loadById(resourceId);
          } catch (err) {
            console.warn(`[AssetBundleService] asset load failed (degraded): ${resourceId}`, err);
            return null;
          }
        }

        async loadSpriteFrame(resourceId) {
          return this.loadById(resourceId);
        }

        async tryLoadSpriteFrame(resourceId) {
          const entry = this.resolve(resourceId); // A Texture2D asset can't be used directly as a spriteFrame: it has
          // no `uv`, so the 2D assembler (Simple.updateUVs) throws
          // "Cannot read properties of undefined (reading '0')" once the render
          // loop runs. Wrap it in a SpriteFrame (full-texture quad) instead.
          // Without this, any asset registered as type "Texture2D" fed through a
          // SpriteFrame loader (background textures, raw character/monster PNGs, etc.)
          // crashes the scene the moment it reaches the render loop.

          if ((entry == null ? void 0 : entry.type) === 'Texture2D') {
            try {
              const tex = await this.loadById(resourceId);
              const frame = new SpriteFrame();
              frame.texture = tex;
              frame.rect = new Rect(0, 0, tex.width, tex.height);
              frame.originalSize = new Size(tex.width, tex.height);
              return frame;
            } catch (err) {
              console.warn(`[AssetBundleService] texture->sprite wrap failed: ${resourceId}`, err);
              return null;
            }
          }

          try {
            return await this.loadSpriteFrame(resourceId);
          } catch (err) {
            console.warn(`[AssetBundleService] sprite load failed: ${resourceId}`, err);
            return null;
          }
        }

        preload(bundleName, paths) {
          const bundle = bundleName === 'resources' ? resources : this._bundles.get(bundleName);

          if (!bundle) {
            console.warn(`[AssetBundleService] cannot preload, bundle not loaded: ${bundleName}`);
            return;
          }

          for (const p of paths) {
            bundle.load(p, err => {
              if (err) console.warn(`[AssetBundleService] preload failed: ${bundleName}:${p}`, err);
            });
          }
        }

        releaseBundle(name) {
          if (name === 'resources') return;

          const bundle = this._bundles.get(name);

          if (!bundle) return;
          bundle.releaseAll();
          assetManager.removeBundle(bundle);

          this._bundles.delete(name);
        }

        releaseAll() {
          for (const name of this._bundles.keys()) {
            this.releaseBundle(name);
          }
        }

        isLoaded(name) {
          return name === 'resources' || this._bundles.has(name);
        }

        _resolveType(typeName) {
          var _typeMap$typeName;

          const typeMap = {
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
            return [entry.path, `${entry.path}/texture`];
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