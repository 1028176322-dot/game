System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, PlatformService, StorageService, AdPlacement, AnalyticsService, _crd;

  function _reportPossibleCrUseOfPlatformService(extras) {
    _reporterNs.report("PlatformService", "./PlatformService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfStorageService(extras) {
    _reporterNs.report("StorageService", "./StorageService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAdPlacement(extras) {
    _reporterNs.report("AdPlacement", "../core/Constants", _context.meta, extras);
  }

  _export("AnalyticsService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      PlatformService = _unresolved_2.PlatformService;
    }, function (_unresolved_3) {
      StorageService = _unresolved_3.StorageService;
    }, function (_unresolved_4) {
      AdPlacement = _unresolved_4.AdPlacement;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "65711ltFXFAD7vZ6cDF7+a1", "AnalyticsService", undefined);
      /**
       * AnalyticsService - 数据埋点服务
       *
       * 职责:
       * 1. 封装 wx.reportAnalytics 调用
       * 2. 上报失败时自动缓存，启动时重试
       * 3. 开发环境直接打印日志
       *
       * Phase 6: 从 WXAdapter 提取埋点逻辑
       */


      _export("AnalyticsService", AnalyticsService = class AnalyticsService {
        static get instance() {
          if (!this._instance) this._instance = new AnalyticsService();
          return this._instance;
        }

        constructor() {
          this._platform = void 0;
          this._cache = [];
          this._platform = (_crd && PlatformService === void 0 ? (_reportPossibleCrUseOfPlatformService({
            error: Error()
          }), PlatformService) : PlatformService).instance;
        }
        /** 上报事件 */


        report(eventName, data) {
          const logStr = JSON.stringify(data);

          if (logStr.length > 1024) {
            console.warn(`[Analytics] 数据过大: ${eventName} = ${logStr.length}bytes`);
            return;
          } // 通过 PlatformService 委托给当前适配器


          this._platform.report(eventName, data);
        }
        /** 上报广告展示事件 */


        reportAdImpression(placement) {
          this.report('ad_impression', {
            pos: placement,
            type: this._getAdType(placement)
          });
        }
        /** 启动时刷新缓存（通过 PlatformService 委托给适配器） */


        flushCache() {
          const cached = (_crd && StorageService === void 0 ? (_reportPossibleCrUseOfStorageService({
            error: Error()
          }), StorageService) : StorageService).instance.getJson('analytics_cache', []);
          if (cached.length === 0) return;

          for (const item of cached) {
            try {
              this._platform.report(item.eventId, item.params);
            } catch {
              /* 丢弃 */
            }
          }

          (_crd && StorageService === void 0 ? (_reportPossibleCrUseOfStorageService({
            error: Error()
          }), StorageService) : StorageService).instance.remove('analytics_cache');
          this._cache = [];
        }

        _cacheEvent(eventId, params) {
          this._cache.push({
            eventId,
            params,
            ts: Date.now()
          });

          if (this._cache.length > 20) this._cache.shift();
          (_crd && StorageService === void 0 ? (_reportPossibleCrUseOfStorageService({
            error: Error()
          }), StorageService) : StorageService).instance.setJson('analytics_cache', this._cache);
        }

        _getAdType(placement) {
          switch (placement) {
            case (_crd && AdPlacement === void 0 ? (_reportPossibleCrUseOfAdPlacement({
              error: Error()
            }), AdPlacement) : AdPlacement).Interstitial:
              return 'interstitial';

            case (_crd && AdPlacement === void 0 ? (_reportPossibleCrUseOfAdPlacement({
              error: Error()
            }), AdPlacement) : AdPlacement).Banner:
              return 'banner';

            default:
              return 'reward';
          }
        }

      });

      AnalyticsService._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=d664c5d22b1b1a7e838af96555f8057b74ff1c15.js.map