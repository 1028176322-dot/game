System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, sys, NativeAndroidPlatformAdapter, _crd, ANDROID_USER_KEY, ANDROID_GUEST_KEY;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _reportPossibleCrUseOfPlatformAdapter(extras) {
    _reporterNs.report("PlatformAdapter", "./PlatformAdapter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlatformLoginResult(extras) {
    _reporterNs.report("PlatformLoginResult", "../PlatformTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfComplianceResult(extras) {
    _reporterNs.report("ComplianceResult", "../PlatformTypes", _context.meta, extras);
  }

  _export("NativeAndroidPlatformAdapter", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      sys = _cc.sys;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "bb8a2ySm2NBUpLavONFrIVr", "NativeAndroidPlatformAdapter", undefined);
      /**
       * NativeAndroidPlatformAdapter - Adapter for Android native test builds
       *
       * Used when building to Android without TapTap SDK (P0 debug builds).
       * Behavior:
       * - Fixed local user 'android_local_user'
       * - Skips compliance checks (always allowed)
       * - Logs analytics to console
       */


      __checkObsolete__(['sys']);

      ANDROID_USER_KEY = 'platform_user_id';
      ANDROID_GUEST_KEY = 'is_guest';

      _export("NativeAndroidPlatformAdapter", NativeAndroidPlatformAdapter = class NativeAndroidPlatformAdapter {
        constructor() {
          this.platformId = 'native_android';
          this.platformName = 'Android Native';
          this._userId = null;
          this._isGuest = false;
        }

        init(_options) {
          var _this = this;

          return _asyncToGenerator(function* () {
            // Try to restore saved user from platform storage
            try {
              // sys is provided by the top-level cc import
              // Using sys.localStorage which works in native builds
              if (sys && sys.localStorage) {
                _this._userId = sys.localStorage.getItem(ANDROID_USER_KEY);
                _this._isGuest = sys.localStorage.getItem(ANDROID_GUEST_KEY) === 'true';
              }
            } catch (_unused) {// Fallback: no persistence available
            }

            console.log('[NativeAndroidAdapter] init, saved userId:', _this._userId);
          })();
        }

        login() {
          var _this2 = this;

          return _asyncToGenerator(function* () {
            var userId = _this2._userId || 'android_local_user';
            _this2._userId = userId;
            _this2._isGuest = false;

            try {
              // sys is provided by the top-level cc import
              if (sys && sys.localStorage) {
                sys.localStorage.setItem(ANDROID_USER_KEY, userId);
                sys.localStorage.removeItem(ANDROID_GUEST_KEY);
              }
            } catch (_unused2) {// ignore
            }

            return {
              success: true,
              userId
            };
          })();
        }

        logout() {
          var _this3 = this;

          return _asyncToGenerator(function* () {
            _this3._userId = null;
            _this3._isGuest = false;

            try {
              // sys is provided by the top-level cc import
              if (sys && sys.localStorage) {
                sys.localStorage.removeItem(ANDROID_USER_KEY);
                sys.localStorage.removeItem(ANDROID_GUEST_KEY);
              }
            } catch (_unused3) {// ignore
            }

            console.log('[NativeAndroidAdapter] logout');
          })();
        }

        getUserId() {
          return this._userId;
        }

        checkCompliance(_userId) {
          return _asyncToGenerator(function* () {
            // P0: skip compliance, always allowed
            return {
              isAllowed: true
            };
          })();
        }

        report(eventName, params) {
          console.log("[NativeAndroidAdapter] report: " + eventName, params);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=b9f6efb3c5589f20cd8a8a184cd3b4e0aa6fed22.js.map