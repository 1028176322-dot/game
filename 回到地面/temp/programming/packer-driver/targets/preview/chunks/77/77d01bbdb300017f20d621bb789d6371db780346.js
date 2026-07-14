System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, BrowserStorageAdapter, _crd;

  function _reportPossibleCrUseOfStorageAdapter(extras) {
    _reporterNs.report("StorageAdapter", "./StorageTypes", _context.meta, extras);
  }

  _export("BrowserStorageAdapter", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "6abe1C5CbhJ97pzVOZ/mwmQ", "BrowserStorageAdapter", undefined);
      /**
       * BrowserStorageAdapter - localStorage adapter for browser / dev environment.
       *
       * Implements StorageAdapter for Cocos preview or non-wechat platforms.
       */


      _export("BrowserStorageAdapter", BrowserStorageAdapter = class BrowserStorageAdapter {
        getString(key) {
          try {
            return localStorage.getItem(key);
          } catch (_unused) {
            return null;
          }
        }

        setString(key, value) {
          try {
            localStorage.setItem(key, value);
            return true;
          } catch (err) {
            console.warn("[BrowserStorageAdapter] write failed: " + key, err);
            return false;
          }
        }

        remove(key) {
          try {
            localStorage.removeItem(key);
          } catch (_unused2) {// Ignore remove failures
          }
        }

        has(key) {
          try {
            return localStorage.getItem(key) !== null;
          } catch (_unused3) {
            return false;
          }
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=77d01bbdb300017f20d621bb789d6371db780346.js.map