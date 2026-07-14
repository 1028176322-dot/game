System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, JsonAsset, resources, GameAssetService, _crd;

  _export("GameAssetService", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      JsonAsset = _cc.JsonAsset;
      resources = _cc.resources;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "b3f9d+Tz9RN/K+OsYJGanR6", "GameAssetService", undefined);
      /**
       * GameAssetService — Non-UI art asset registry lookup service.
       *
       * Loads game_assets.json and provides typed access to sprite sheet,
       * background, tile, effect, and icon definitions by semantic key.
       *
       * Usage:
       *   await GameAssetService.instance.loadAll();
       *   const def = await GameAssetService.instance.get('character.warrior.idle');
       *
       * This service is the runtime counterpart to game_assets.json.
       */


      __checkObsolete__(['JsonAsset', 'resources']);

      _export("GameAssetService", GameAssetService = class GameAssetService {
        constructor() {
          this._defs = {};
          this._loaded = false;
          this._loading = null;
        }

        static get instance() {
          if (!this._instance) this._instance = new GameAssetService();
          return this._instance;
        }

        get loaded() {
          return this._loaded;
        }
        /**
         * Load game_assets.json from resources.
         * Safe to call multiple times (only loads once).
         */


        async loadAll() {
          if (this._loaded) return;
          if (this._loading) return this._loading;
          this._loading = new Promise(resolve => {
            resources.load('config/game_assets', JsonAsset, (err, asset) => {
              if (err || !asset) {
                console.error('[GameAssetService] load config/game_assets failed', err);
                this._loaded = true;
                resolve();
                return;
              }

              const raw = asset.json;
              const data = 'data' in raw && raw.data ? raw.data : raw;

              for (const key of Object.keys(data)) {
                if (key === 'metadata') continue;
                this._defs[key] = data[key];
              }

              this._loaded = true;
              console.log(`[GameAssetService] loaded ${Object.keys(this._defs).length} game asset defs`);
              resolve();
            });
          });
          return this._loading;
        }
        /**
         * Get a game asset definition by semantic key.
         * Auto-loads config on first call.
         */


        async get(key) {
          var _this$_defs$key;

          if (!this._loaded) await this.loadAll();
          return (_this$_defs$key = this._defs[key]) != null ? _this$_defs$key : null;
        }
        /**
         * Get a definition, throwing if missing.
         */


        async require(key) {
          const def = await this.get(key);
          if (!def) throw new Error(`[GameAssetService] missing key: ${key}`);
          return def;
        }
        /**
         * Get all registered keys.
         */


        keys() {
          return Object.keys(this._defs);
        }
        /**
         * Get all keys matching a category.
         */


        keysByCategory(category) {
          return Object.entries(this._defs).filter(([, def]) => def.category === category).map(([key]) => key);
        }
        /**
         * Get all keys matching a type.
         */


        keysByType(type) {
          return Object.entries(this._defs).filter(([, def]) => def.type === type).map(([key]) => key);
        }
        /**
         * Check if a key exists.
         */


        has(key) {
          return key in this._defs;
        }

      });

      GameAssetService._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=99444ea6a5db5d39213d239e9e845a6ae7139768.js.map