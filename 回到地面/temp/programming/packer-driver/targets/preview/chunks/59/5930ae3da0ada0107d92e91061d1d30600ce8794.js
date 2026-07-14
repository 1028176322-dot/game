System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, WeChatPlatformAdapter, _crd;

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

  _export("WeChatPlatformAdapter", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "1a9a5dEIU5CrJftlylTSVrg", "WeChatPlatformAdapter", undefined);
      /**
       * WeChatPlatformAdapter - Platform adapter for WeChat Mini Game
       *
       * Wraps wx.* API calls into the PlatformAdapter interface.
       * Preserves all existing WeChat login and reporting behavior.
       */


      _export("WeChatPlatformAdapter", WeChatPlatformAdapter = class WeChatPlatformAdapter {
        constructor() {
          this.platformId = 'wechat_minigame';
          this.platformName = 'WeChat';
          this._userId = null;
        }

        init(_options) {
          return _asyncToGenerator(function* () {
            console.log('[WeChatAdapter] init'); // WeChat runtime is ready by the time component onLoad fires
          })();
        }

        login() {
          var _this = this;

          return _asyncToGenerator(function* () {
            return new Promise(resolve => {
              if (typeof wx === 'undefined' || !wx.login) {
                resolve({
                  success: false,
                  userId: null,
                  error: 'wx.login not available'
                });
                return;
              }

              wx.login({
                success: res => {
                  if (res.code) {
                    // In a real app we'd exchange code for openId via backend.
                    // For now use code as offline userId placeholder.
                    var userId = 'wx_' + res.code.slice(0, 16);
                    _this._userId = userId;
                    resolve({
                      success: true,
                      userId
                    });
                  } else {
                    resolve({
                      success: false,
                      userId: null,
                      error: 'wx.login failed: no code'
                    });
                  }
                },
                fail: err => {
                  console.error('[WeChatAdapter] wx.login error:', err);
                  resolve({
                    success: false,
                    userId: null,
                    error: String(err)
                  });
                }
              });
            });
          })();
        }

        logout() {
          var _this2 = this;

          return _asyncToGenerator(function* () {
            _this2._userId = null;
            console.log('[WeChatAdapter] logout');
          })();
        }

        getUserId() {
          return this._userId;
        }

        checkCompliance(userId) {
          return _asyncToGenerator(function* () {
            // Use wx.checkSession / wx.getUserInfo for compliance where available
            // P0: simple session check
            return new Promise(resolve => {
              if (typeof wx === 'undefined' || !wx.checkSession) {
                resolve({
                  isAllowed: true
                });
                return;
              }

              wx.checkSession({
                success: () => {
                  resolve({
                    isAllowed: true
                  });
                },
                fail: () => {
                  // Session expired — user needs to re-login
                  resolve({
                    isAllowed: false,
                    reason: 'session_expired'
                  });
                }
              });
            });
          })();
        }

        report(eventName, params) {
          if (typeof wx !== 'undefined' && wx.reportAnalytics) {
            try {
              wx.reportAnalytics(eventName, params || {});
            } catch (e) {
              console.warn('[WeChatAdapter] reportAnalytics error:', e);
            }
          }
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=5930ae3da0ada0107d92e91061d1d30600ce8794.js.map