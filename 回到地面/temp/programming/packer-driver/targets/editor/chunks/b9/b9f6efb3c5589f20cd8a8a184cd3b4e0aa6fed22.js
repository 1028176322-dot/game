System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, sys, NativeAndroidPlatformAdapter, _crd, ANDROID_USER_KEY, ANDROID_GUEST_KEY;

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

        async init(_options) {
          // Try to restore saved user from platform storage
          try {
            // sys is provided by the top-level cc import
            // Using sys.localStorage which works in native builds
            if (sys && sys.localStorage) {
              this._userId = sys.localStorage.getItem(ANDROID_USER_KEY);
              this._isGuest = sys.localStorage.getItem(ANDROID_GUEST_KEY) === 'true';
            }
          } catch {// Fallback: no persistence available
          }

          console.log('[NativeAndroidAdapter] init, saved userId:', this._userId);
        }

        async login() {
          const userId = this._userId || 'android_local_user';
          this._userId = userId;
          this._isGuest = false;

          try {
            // sys is provided by the top-level cc import
            if (sys && sys.localStorage) {
              sys.localStorage.setItem(ANDROID_USER_KEY, userId);
              sys.localStorage.removeItem(ANDROID_GUEST_KEY);
            }
          } catch {// ignore
          }

          return {
            success: true,
            userId
          };
        }

        async logout() {
          this._userId = null;
          this._isGuest = false;

          try {
            // sys is provided by the top-level cc import
            if (sys && sys.localStorage) {
              sys.localStorage.removeItem(ANDROID_USER_KEY);
              sys.localStorage.removeItem(ANDROID_GUEST_KEY);
            }
          } catch {// ignore
          }

          console.log('[NativeAndroidAdapter] logout');
        }

        getUserId() {
          return this._userId;
        }

        async checkCompliance(_userId) {
          // P0: skip compliance, always allowed
          return {
            isAllowed: true
          };
        }

        report(eventName, params) {
          console.log(`[NativeAndroidAdapter] report: ${eventName}`, params);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=b9f6efb3c5589f20cd8a8a184cd3b4e0aa6fed22.js.map