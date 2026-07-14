System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, WebDevPlatformAdapter, _crd, DEV_USER_KEY, DEV_GUEST_KEY;

  function _reportPossibleCrUseOfPlatformAdapter(extras) {
    _reporterNs.report("PlatformAdapter", "./PlatformAdapter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlatformLoginResult(extras) {
    _reporterNs.report("PlatformLoginResult", "../PlatformTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfComplianceResult(extras) {
    _reporterNs.report("ComplianceResult", "../PlatformTypes", _context.meta, extras);
  }

  _export("WebDevPlatformAdapter", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "7e9b3QuPwRHN6JZ38hqQBtY", "WebDevPlatformAdapter", undefined);
      /**
       * WebDevPlatformAdapter - Platform adapter for browser / Cocos editor preview
       *
       * Provides dev-friendly behavior:
       * - localStorage-based user simulation
       * - Skips compliance checks (always allowed)
       * - Logs analytics to console
       */


      DEV_USER_KEY = 'platform_user_id';
      DEV_GUEST_KEY = 'is_guest';

      _export("WebDevPlatformAdapter", WebDevPlatformAdapter = class WebDevPlatformAdapter {
        constructor() {
          this.platformId = 'web_dev';
          this.platformName = 'Web Dev';
          this._userId = null;
          this._isGuest = false;
        }

        async init(_options) {
          // Restore saved user
          this._userId = localStorage.getItem(DEV_USER_KEY);
          this._isGuest = localStorage.getItem(DEV_GUEST_KEY) === 'true';
          console.log('[WebDevAdapter] init, saved userId:', this._userId);
        }

        async login() {
          // Dev mode: create/return local dev user
          const userId = 'dev_user_' + Date.now();
          this._userId = userId;
          this._isGuest = false;
          localStorage.setItem(DEV_USER_KEY, userId);
          localStorage.removeItem(DEV_GUEST_KEY);
          return {
            success: true,
            userId
          };
        }

        async logout() {
          this._userId = null;
          this._isGuest = false;
          localStorage.removeItem(DEV_USER_KEY);
          localStorage.removeItem(DEV_GUEST_KEY);
          console.log('[WebDevAdapter] logout');
        }

        getUserId() {
          return this._userId;
        }

        async checkCompliance(_userId) {
          // Dev mode: always allowed
          return {
            isAllowed: true
          };
        }

        report(eventName, params) {
          console.log(`[WebDevAdapter] report: ${eventName}`, params);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=3775b91b8ed237bfd836cbdb3313b8d34b797abf.js.map