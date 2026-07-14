System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, AdService, AdResult, AdCallback, AnalyticsService, PlatformService, WXAdapter, _crd;

  function _reportPossibleCrUseOfAdPlacement(extras) {
    _reporterNs.report("AdPlacement", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAdService(extras) {
    _reporterNs.report("AdService", "../platform/AdService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAdResult(extras) {
    _reporterNs.report("AdResult", "../platform/AdService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAdCallback(extras) {
    _reporterNs.report("AdCallback", "../platform/AdService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAnalyticsService(extras) {
    _reporterNs.report("AnalyticsService", "../platform/AnalyticsService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlatformService(extras) {
    _reporterNs.report("PlatformService", "../platform/PlatformService", _context.meta, extras);
  }

  _export("WXAdapter", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      AdService = _unresolved_2.AdService;
      AdResult = _unresolved_2.AdResult;
      AdCallback = _unresolved_2.AdCallback;
    }, function (_unresolved_3) {
      AnalyticsService = _unresolved_3.AnalyticsService;
    }, function (_unresolved_4) {
      PlatformService = _unresolved_4.PlatformService;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "cf670LIZXlOI5KE/mHykRIE", "WXAdapter", undefined);
      /**
       * WXAdapter - 微信小游戏适配层（Phase 6 精简版）
       *
       * [Phase 6] 职责已拆分到 platform/ 服务类:
       *   - 广告 → AdService
       *   - 存储 → StorageService
       *   - 埋点 → AnalyticsService
       *   - 平台检测 → PlatformService
       *
       * 当前保留为兼容代理，新代码请直接使用 platform/ 下的服务
       */


      _export("AdResult", AdResult);

      _export("AdCallback", AdCallback);

      _export("WXAdapter", WXAdapter = class WXAdapter {
        static getInstance() {
          if (!WXAdapter._instance) WXAdapter._instance = new WXAdapter();
          return WXAdapter._instance;
        }

        get isWXEnv() {
          return (_crd && PlatformService === void 0 ? (_reportPossibleCrUseOfPlatformService({
            error: Error()
          }), PlatformService) : PlatformService).instance.isWX;
        } // ======== 广告（代理到 AdService） ========


        playRewardedAd(placement, callback) {
          (_crd && AdService === void 0 ? (_reportPossibleCrUseOfAdService({
            error: Error()
          }), AdService) : AdService).instance.playRewardedAd(placement, callback);
        }

        tryShowInterstitial() {
          (_crd && AdService === void 0 ? (_reportPossibleCrUseOfAdService({
            error: Error()
          }), AdService) : AdService).instance.tryShowInterstitial();
        }

        showBanner() {
          (_crd && AdService === void 0 ? (_reportPossibleCrUseOfAdService({
            error: Error()
          }), AdService) : AdService).instance.showBanner();
        }

        hideBanner() {
          (_crd && AdService === void 0 ? (_reportPossibleCrUseOfAdService({
            error: Error()
          }), AdService) : AdService).instance.hideBanner();
        } // ======== 数据上报（代理到 AnalyticsService） ========


        reportAnalytics(eventName, data) {
          (_crd && AnalyticsService === void 0 ? (_reportPossibleCrUseOfAnalyticsService({
            error: Error()
          }), AnalyticsService) : AnalyticsService).instance.report(eventName, data);
        }

        reportAdImpression(placement) {
          (_crd && AnalyticsService === void 0 ? (_reportPossibleCrUseOfAnalyticsService({
            error: Error()
          }), AnalyticsService) : AnalyticsService).instance.reportAdImpression(placement);
        }

        flushAnalyticsCache() {
          (_crd && AnalyticsService === void 0 ? (_reportPossibleCrUseOfAnalyticsService({
            error: Error()
          }), AnalyticsService) : AnalyticsService).instance.flushCache();
        }

      });

      WXAdapter._instance = void 0;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=f9ad73680335e66af76c23fe6b0cc6545b445663.js.map