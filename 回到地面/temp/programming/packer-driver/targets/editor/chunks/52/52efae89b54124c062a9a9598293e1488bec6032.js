System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, isTapTapSDKAvailable, initTapTapSDK, tapLogin, checkCompliance, StorageService, TapTapAndroidAdapter, _crd;

  function _reportPossibleCrUseOfPlatformAdapter(extras) {
    _reporterNs.report("PlatformAdapter", "./PlatformAdapter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlatformLoginResult(extras) {
    _reporterNs.report("PlatformLoginResult", "../PlatformTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfComplianceResult(extras) {
    _reporterNs.report("ComplianceResult", "../PlatformTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfisTapTapSDKAvailable(extras) {
    _reporterNs.report("isTapTapSDKAvailable", "../taptap/TapTapBridge", _context.meta, extras);
  }

  function _reportPossibleCrUseOfinitTapTapSDK(extras) {
    _reporterNs.report("initTapTapSDK", "../taptap/TapTapBridge", _context.meta, extras);
  }

  function _reportPossibleCrUseOftapLogin(extras) {
    _reporterNs.report("tapLogin", "../taptap/TapTapBridge", _context.meta, extras);
  }

  function _reportPossibleCrUseOfcheckCompliance(extras) {
    _reporterNs.report("checkCompliance", "../taptap/TapTapBridge", _context.meta, extras);
  }

  function _reportPossibleCrUseOfStorageService(extras) {
    _reporterNs.report("StorageService", "../StorageService", _context.meta, extras);
  }

  _export("TapTapAndroidAdapter", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      isTapTapSDKAvailable = _unresolved_2.isTapTapSDKAvailable;
      initTapTapSDK = _unresolved_2.initTapTapSDK;
      tapLogin = _unresolved_2.tapLogin;
      checkCompliance = _unresolved_2.checkCompliance;
    }, function (_unresolved_3) {
      StorageService = _unresolved_3.StorageService;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "82607yFJB9J2o/K3dKg21e4", "TapTapAndroidAdapter", undefined);
      /**
       * TapTapAndroidAdapter - Platform adapter for TapTap Android builds
       *
       * Uses TapTapBridge (jsb.reflection) for TapSDK communication.
       * Falls back gracefully when jsb.reflection is not available (dev mode).
       */


      _export("TapTapAndroidAdapter", TapTapAndroidAdapter = class TapTapAndroidAdapter {
        constructor() {
          this.platformId = 'taptap_android';
          this.platformName = 'TapTap Android';
          this._userId = null;
          this._sdkAvailable = false;
        }

        async init(_options) {
          this._sdkAvailable = (_crd && isTapTapSDKAvailable === void 0 ? (_reportPossibleCrUseOfisTapTapSDKAvailable({
            error: Error()
          }), isTapTapSDKAvailable) : isTapTapSDKAvailable)();

          if (this._sdkAvailable) {
            // In production, clientId should come from a config or build-time constant
            const result = await (_crd && initTapTapSDK === void 0 ? (_reportPossibleCrUseOfinitTapTapSDK({
              error: Error()
            }), initTapTapSDK) : initTapTapSDK)('YOUR_TAPTAP_CLIENT_ID');

            if (!result.success) {
              console.warn('[TapTapAdapter] TapSDK init failed:', result.error);
            }
          } else {
            console.log('[TapTapAdapter] jsb.reflection not available (dev mode)');
          } // Try to restore saved user


          this._userId = (_crd && StorageService === void 0 ? (_reportPossibleCrUseOfStorageService({
            error: Error()
          }), StorageService) : StorageService).instance.get('platform_user_id', null);
          console.log('[TapTapAdapter] init, saved userId:', this._userId);
        }

        async login() {
          if (this._sdkAvailable) {
            try {
              const result = await (_crd && tapLogin === void 0 ? (_reportPossibleCrUseOftapLogin({
                error: Error()
              }), tapLogin) : tapLogin)();

              if (result.success && result.userId) {
                this._userId = result.userId;
                (_crd && StorageService === void 0 ? (_reportPossibleCrUseOfStorageService({
                  error: Error()
                }), StorageService) : StorageService).instance.set('platform_user_id', result.userId);
                return {
                  success: true,
                  userId: result.userId,
                  nickname: result.nickname,
                  avatar: result.avatar
                };
              }

              return {
                success: false,
                userId: null,
                error: result.error || 'login failed'
              };
            } catch (err) {
              console.error('[TapTapAdapter] login error:', err);
              return {
                success: false,
                userId: null,
                error: String(err)
              };
            }
          } // Dev fallback


          const userId = 'tt_dev_' + Date.now();
          this._userId = userId;
          (_crd && StorageService === void 0 ? (_reportPossibleCrUseOfStorageService({
            error: Error()
          }), StorageService) : StorageService).instance.set('platform_user_id', userId);
          return {
            success: true,
            userId
          };
        }

        async logout() {
          this._userId = null;
          (_crd && StorageService === void 0 ? (_reportPossibleCrUseOfStorageService({
            error: Error()
          }), StorageService) : StorageService).instance.remove('platform_user_id');
          console.log('[TapTapAdapter] logout');
        }

        getUserId() {
          if (this._userId) return this._userId;
          return (_crd && StorageService === void 0 ? (_reportPossibleCrUseOfStorageService({
            error: Error()
          }), StorageService) : StorageService).instance.get('platform_user_id', null);
        }

        async checkCompliance(userId) {
          if (this._sdkAvailable) {
            try {
              const result = await (_crd && checkCompliance === void 0 ? (_reportPossibleCrUseOfcheckCompliance({
                error: Error()
              }), checkCompliance) : checkCompliance)(userId);
              return {
                isAllowed: result.isAllowed,
                reason: result.reason,
                remainingMinutes: result.remainingMinutes
              };
            } catch (err) {
              console.warn('[TapTapAdapter] compliance check error:', err);
            }
          } // Fallback: allow


          return {
            isAllowed: true
          };
        }

        report(eventName, params) {
          console.log(`[TapTapAdapter] report: ${eventName}`, params); // TapTap analytics integration can be added here in P3
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=52efae89b54124c062a9a9598293e1488bec6032.js.map