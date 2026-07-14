System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, JsonAsset, resources, GameAssetService, _crd;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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


        loadAll() {
          var _this = this;

          return _asyncToGenerator(function* () {
            if (_this._loaded) return;
            if (_this._loading) return _this._loading;
            _this._loading = new Promise(resolve => {
              resources.load('config/game_assets', JsonAsset, (err, asset) => {
                if (err || !asset) {
                  console.error('[GameAssetService] load config/game_assets failed', err);
                  _this._loaded = true;
                  resolve();
                  return;
                }

                var raw = asset.json;
                var data = 'data' in raw && raw.data ? raw.data : raw;

                for (var key of Object.keys(data)) {
                  if (key === 'metadata') continue;
                  _this._defs[key] = data[key];
                }

                _this._loaded = true;
                console.log("[GameAssetService] loaded " + Object.keys(_this._defs).length + " game asset defs");
                resolve();
              });
            });
            return _this._loading;
          })();
        }
        /**
         * Get a game asset definition by semantic key.
         * Auto-loads config on first call.
         */


        get(key) {
          var _this2 = this;

          return _asyncToGenerator(function* () {
            var _this2$_defs$key;

            if (!_this2._loaded) yield _this2.loadAll();
            return (_this2$_defs$key = _this2._defs[key]) != null ? _this2$_defs$key : null;
          })();
        }
        /**
         * Get a definition, throwing if missing.
         */


        require(key) {
          var _this3 = this;

          return _asyncToGenerator(function* () {
            var def = yield _this3.get(key);
            if (!def) throw new Error("[GameAssetService] missing key: " + key);
            return def;
          })();
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
          return Object.entries(this._defs).filter(_ref => {
            var [, def] = _ref;
            return def.category === category;
          }).map(_ref2 => {
            var [key] = _ref2;
            return key;
          });
        }
        /**
         * Get all keys matching a type.
         */


        keysByType(type) {
          return Object.entries(this._defs).filter(_ref3 => {
            var [, def] = _ref3;
            return def.type === type;
          }).map(_ref4 => {
            var [key] = _ref4;
            return key;
          });
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