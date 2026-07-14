System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, StorageServiceV2, StorageService, _crd, DEFAULT_SAVE;

  function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

  function _reportPossibleCrUseOfStorageServiceV(extras) {
    _reporterNs.report("StorageServiceV2", "../core/storage/StorageService", _context.meta, extras);
  }

  _export("StorageService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      StorageServiceV2 = _unresolved_2.StorageService;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "c10faESkvFERomGo74DXXgU", "StorageService", undefined);
      /**
       * StorageService (v1 -> v2 proxy)
       *
       * DEPRECATED: Use core/save/SaveService or core/storage/StorageService instead.
       * This file now delegates to core/storage/StorageService v2 for backward compat.
       */


      DEFAULT_SAVE = {
        schemaVersion: 1,
        updatedAt: Date.now(),
        player: {
          soulStones: 0,
          unlockedCharacters: ['warrior'],
          selectedCharacter: 'warrior',
          selectedTalent: null,
          unlockedRelicPoolExtras: [],
          bestFloor: 0,
          totalKills: 0,
          totalRuns: 0
        },
        settings: {
          sound: true,
          music: true,
          vibration: true
        }
      };

      _export("StorageService", StorageService = class StorageService {
        static get instance() {
          if (!this._instance) this._instance = new StorageService();
          return this._instance;
        }

        constructor() {
          this._v2 = void 0;
          this._v2 = (_crd && StorageServiceV2 === void 0 ? (_reportPossibleCrUseOfStorageServiceV({
            error: Error()
          }), StorageServiceV2) : StorageServiceV2).instance;
        }

        getJson(key, fallback) {
          var result = this._v2.getJson(key, fallback);

          return result.value;
        }

        setJson(key, value) {
          return this._v2.setJson(key, value);
        }

        get(key, fallback) {
          var _this$_v2$getString;

          if (fallback === void 0) {
            fallback = '';
          }

          return (_this$_v2$getString = this._v2.getString(key)) != null ? _this$_v2$getString : fallback;
        }

        set(key, value) {
          return this._v2.setString(key, value);
        }

        remove(key) {
          this._v2.remove(key);
        }

        getSave(key, migrations) {
          return this._v2.readWithMigration(key, DEFAULT_SAVE, migrations);
        }

        get defaultSave() {
          return _extends({}, DEFAULT_SAVE, {
            updatedAt: Date.now()
          });
        }

      });

      StorageService._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=8d8a451e249b9daf00496a9b0c1c569f8e75aac3.js.map