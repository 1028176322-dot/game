System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, PlatformService, T, ComplianceService, _crd;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _reportPossibleCrUseOfPlatformService(extras) {
    _reporterNs.report("PlatformService", "./PlatformService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfComplianceResult(extras) {
    _reporterNs.report("ComplianceResult", "./PlatformService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfT(extras) {
    _reporterNs.report("T", "../core/TextManager", _context.meta, extras);
  }

  _export("ComplianceService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      PlatformService = _unresolved_2.PlatformService;
    }, function (_unresolved_3) {
      T = _unresolved_3.T;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "abf9e/cgc9ID7Rp+8qWJ0kZ", "ComplianceService", undefined);
      /**
       * ComplianceService - 合规检查（实名 + 防沉迷）
       *
       * 职责:
       * 1. 登录后检查用户合规状态
       * 2. 开局前检查（缓存状态避免频繁接口调用）
       * 3. 合规阻断/提醒 UI
       *
       * 流程: AppFlowController.start() → ComplianceService.check() → 通过/阻断
       *       RunCoordinator.startRun() → ComplianceService.canStartRun() → 通过/阻断
       */


      _export("ComplianceService", ComplianceService = class ComplianceService {
        constructor() {
          this._cachedResult = null;
          this._lastCheckTime = 0;
          this._cacheTTL = 5 * 60 * 1000;
          // 5分钟缓存
          this._checkInProgress = false;
        }

        static get instance() {
          if (!this._instance) this._instance = new ComplianceService();
          return this._instance;
        }
        /** 登录后执行合规检查 */


        verifyAfterLogin(userId) {
          var _this = this;

          return _asyncToGenerator(function* () {
            if (_this._checkInProgress) {
              // 并发保护：等待上次检查完成
              return new Promise(resolve => {
                var check = () => {
                  if (!_this._checkInProgress) {
                    resolve(_this._cachedResult || {
                      isAllowed: true
                    });
                  } else {
                    setTimeout(check, 200);
                  }
                };

                check();
              });
            }

            _this._checkInProgress = true;

            try {
              var platform = (_crd && PlatformService === void 0 ? (_reportPossibleCrUseOfPlatformService({
                error: Error()
              }), PlatformService) : PlatformService).instance;
              var result = yield platform.checkCompliance(userId);
              _this._cachedResult = result;
              _this._lastCheckTime = Date.now();

              if (!result.isAllowed) {
                console.warn('[Compliance] blocked:', result.reason || 'unknown');
              } else if (result.remainingMinutes !== undefined) {
                console.log("[Compliance] allowed, remaining: " + result.remainingMinutes + "min");
              }

              return result;
            } finally {
              _this._checkInProgress = false;
            }
          })();
        }
        /** 开局前快速检查（使用缓存） */


        canStartRun() {
          var now = Date.now(); // 有缓存且在 TTL 内

          if (this._cachedResult && now - this._lastCheckTime < this._cacheTTL) {
            return this._cachedResult.isAllowed;
          } // 需要重新检查


          return 'need_recheck';
        }
        /** 刷新缓存（忽略 TTL） */


        refreshCheck(userId) {
          var _this2 = this;

          return _asyncToGenerator(function* () {
            return _this2.verifyAfterLogin(userId);
          })();
        }
        /** 清除缓存（登出时调用） */


        clearCache() {
          this._cachedResult = null;
          this._lastCheckTime = 0;
        }
        /** 获取剩余游戏时间（分钟），未成年人限时用 */


        getRemainingMinutes() {
          var _this$_cachedResult;

          return (_this$_cachedResult = this._cachedResult) == null ? void 0 : _this$_cachedResult.remainingMinutes;
        }
        /** 是否被合规阻止 */


        get isBlocked() {
          return this._cachedResult !== null && !this._cachedResult.isAllowed;
        }
        /** 合规提示文本 */


        getBlockMessage() {
          if (!this._cachedResult) return '';

          if (!this._cachedResult.isAllowed) {
            return this._cachedResult.reason || (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.complianceBlocked');
          }

          if (this._cachedResult.remainingMinutes !== undefined) {
            return (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.complianceRemaining', {
              minutes: this._cachedResult.remainingMinutes
            });
          }

          return '';
        }

      });

      ComplianceService._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=c44f744108410be73f2cb2e1f96c77a5649b57d3.js.map