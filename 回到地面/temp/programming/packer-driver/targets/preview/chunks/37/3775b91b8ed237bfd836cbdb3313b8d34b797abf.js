System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, WebDevPlatformAdapter, _crd, DEV_USER_KEY, DEV_GUEST_KEY;

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

        init(_options) {
          var _this = this;

          return _asyncToGenerator(function* () {
            // Restore saved user
            _this._userId = localStorage.getItem(DEV_USER_KEY);
            _this._isGuest = localStorage.getItem(DEV_GUEST_KEY) === 'true';
            console.log('[WebDevAdapter] init, saved userId:', _this._userId);
          })();
        }

        login() {
          var _this2 = this;

          return _asyncToGenerator(function* () {
            // Dev mode: create/return local dev user
            var userId = 'dev_user_' + Date.now();
            _this2._userId = userId;
            _this2._isGuest = false;
            localStorage.setItem(DEV_USER_KEY, userId);
            localStorage.removeItem(DEV_GUEST_KEY);
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
            localStorage.removeItem(DEV_USER_KEY);
            localStorage.removeItem(DEV_GUEST_KEY);
            console.log('[WebDevAdapter] logout');
          })();
        }

        getUserId() {
          return this._userId;
        }

        checkCompliance(_userId) {
          return _asyncToGenerator(function* () {
            // Dev mode: always allowed
            return {
              isAllowed: true
            };
          })();
        }

        report(eventName, params) {
          console.log("[WebDevAdapter] report: " + eventName, params);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=3775b91b8ed237bfd836cbdb3313b8d34b797abf.js.map