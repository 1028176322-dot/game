System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, WXStorageAdapter, _crd;

  function _reportPossibleCrUseOfStorageAdapter(extras) {
    _reporterNs.report("StorageAdapter", "./StorageTypes", _context.meta, extras);
  }

  _export("WXStorageAdapter", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "c626bFFLZJDbpNpd48R9+ZZ", "WXStorageAdapter", undefined);
      /**
       * WXStorageAdapter - WeChat wx.setStorageSync / wx.getStorageSync adapter.
       *
       * Implements StorageAdapter for the wechat mini-game environment.
       */


      _export("WXStorageAdapter", WXStorageAdapter = class WXStorageAdapter {
        getString(key) {
          try {
            var raw = wx.getStorageSync(key);
            if (raw === null || raw === undefined || raw === '') return null;
            return String(raw);
          } catch (_unused) {
            return null;
          }
        }

        setString(key, value) {
          try {
            wx.setStorageSync(key, value);
            return true;
          } catch (err) {
            console.warn("[WXStorageAdapter] write failed: " + key, err);
            return false;
          }
        }

        remove(key) {
          try {
            wx.removeStorageSync(key);
          } catch (_unused2) {// Ignore remove failures
          }
        }

        has(key) {
          try {
            return wx.getStorageSync(key) !== undefined && wx.getStorageSync(key) !== null;
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
//# sourceMappingURL=65c3a6b980dfbaf2bbb6b8fcea4ace255950a4ff.js.map