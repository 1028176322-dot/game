System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, PlatformService, NoopAdAdapter, WeChatAdAdapter, AdPlacement, AdService, _crd;

  function _reportPossibleCrUseOfPlatformService(extras) {
    _reporterNs.report("PlatformService", "./PlatformService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAdAdapter(extras) {
    _reporterNs.report("AdAdapter", "./adapters/AdAdapter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfNoopAdAdapter(extras) {
    _reporterNs.report("NoopAdAdapter", "./adapters/NoopAdAdapter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfWeChatAdAdapter(extras) {
    _reporterNs.report("WeChatAdAdapter", "./adapters/WeChatAdAdapter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAdPlacement(extras) {
    _reporterNs.report("AdPlacement", "../core/Constants", _context.meta, extras);
  }

  _export("AdService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      PlatformService = _unresolved_2.PlatformService;
    }, function (_unresolved_3) {
      NoopAdAdapter = _unresolved_3.NoopAdAdapter;
    }, function (_unresolved_4) {
      WeChatAdAdapter = _unresolved_4.WeChatAdAdapter;
    }, function (_unresolved_5) {
      AdPlacement = _unresolved_5.AdPlacement;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "29542qVDd9Eqae/eFt7pCJR", "AdService", undefined);
      /**
       * AdService - 广告管理服务
       *
       * 职责:
       * 1. 激励视频广告（复活/翻倍等）
       * 2. 插屏广告（局间展示）
       * 3. Banner 广告（主界面）
       *
       * 平台策略:
       * - 通过 AdAdapter 委托给平台特定实现
       * - 开发环境: 模拟成功
       * - Android/TapTap: NoopAdAdapter（无广告）
       * - 微信: WeChatAdAdapter
       */


      _export("AdService", AdService = class AdService {
        static get instance() {
          if (!this._instance) this._instance = new AdService();
          return this._instance;
        }

        constructor() {
          this._platform = void 0;
          this._adapter = null;
          this._adCache = new Map();
          this._adCD = new Map();
          this._cdDuration = 60;
          // 同位置 60 秒 CD

          /** 正式环境是否允许广告失败发奖励（false = 不发） */
          this.prodRewardFallback = false;
          // ======== 插屏广告 ========
          this._interstitialCount = 0;
          this._interstitialThreshold = 3;
          // ======== Banner ========
          this._bannerAd = null;
          this._platform = (_crd && PlatformService === void 0 ? (_reportPossibleCrUseOfPlatformService({
            error: Error()
          }), PlatformService) : PlatformService).instance;
        } // ======== 激励视频 ========

        /** 播放激励视频广告 */


        playRewardedAd(placement, callback) {
          if (this._isAdOnCD(placement)) {
            callback == null || callback({
              success: false,
              rewarded: false,
              error: 'ad_cd'
            });
            return;
          }

          if (this._platform.isDev) {
            console.log(`[AdService] 开发环境模拟广告: ${placement}`);
            callback == null || callback({
              success: true,
              rewarded: true
            });
            return;
          }

          this._initAdapter();

          const adUnitId = this._getAdUnitId(placement);

          if (!adUnitId || !this._adapter) {
            this._fallback(callback);

            return;
          }

          try {
            let wrapperRewardedAd = this._adCache.get(placement);

            if (!wrapperRewardedAd) {
              const ad = this._adapter.createRewardedAd(adUnitId);

              ad.onError(err => {
                console.warn(`[AdService] 广告加载失败 ${placement}: ${err.errMsg || err}`);
              });
              const wrapper = {
                raw: ad,
                show: () => {
                  return new Promise((resolve, reject) => {
                    ad.onClose(res => {
                      var _res$isEnded;

                      this._setAdCD(placement);

                      const rewarded = (_res$isEnded = res == null ? void 0 : res.isEnded) != null ? _res$isEnded : false;
                      callback == null || callback({
                        success: true,
                        rewarded
                      });
                    });
                    ad.show().catch(err => {
                      console.warn(`[AdService] 广告展示失败 ${placement}: ${err.errMsg || err}`);
                      ad.show().catch(() => this._fallback(callback));
                    });
                    resolve();
                  });
                }
              };

              this._adCache.set(placement, wrapper);
            }

            wrapperRewardedAd.show();
          } catch (err) {
            console.warn(`[AdService] 广告异常 ${placement}:`, err);

            this._fallback(callback);
          }
        }

        /** 尝试展示插屏广告（按频次控制） */
        tryShowInterstitial() {
          this._interstitialCount++;
          if (this._interstitialCount < this._interstitialThreshold) return;
          this._interstitialCount = 0;

          this._initAdapter();

          if (!this._adapter) return;

          try {
            const adUnitId = this._getAdUnitId((_crd && AdPlacement === void 0 ? (_reportPossibleCrUseOfAdPlacement({
              error: Error()
            }), AdPlacement) : AdPlacement).Interstitial);

            if (!adUnitId) return;

            const ad = this._adapter.createInterstitialAd(adUnitId);

            ad.show().catch(() => {});
          } catch {
            /* 忽略 */
          }
        }

        /** 展示 Banner */
        showBanner() {
          this._initAdapter();

          if (!this._adapter) return;

          if (this._bannerAd) {
            this._bannerAd.show();

            return;
          }

          try {
            const adUnitId = this._getAdUnitId((_crd && AdPlacement === void 0 ? (_reportPossibleCrUseOfAdPlacement({
              error: Error()
            }), AdPlacement) : AdPlacement).Banner);

            if (!adUnitId) return;

            const bAd = this._adapter.createBannerAd(adUnitId, {
              left: 0,
              top: 0,
              width: 320
            });

            bAd.onError(() => {});
            this._bannerAd = bAd;
          } catch {
            /* 忽略 */
          }
        }
        /** 隐藏 Banner */


        hideBanner() {
          if (this._bannerAd) {
            try {
              this._bannerAd.hide();
            } catch {
              /* 忽略 */
            }
          }
        } // ======== 私有方法 ========

        /** 延迟初始化适配器（懒加载） */


        _initAdapter() {
          if (this._adapter) return;

          if (this._platform.isWX) {
            this._adapter = new (_crd && WeChatAdAdapter === void 0 ? (_reportPossibleCrUseOfWeChatAdAdapter({
              error: Error()
            }), WeChatAdAdapter) : WeChatAdAdapter)();
          } else {
            this._adapter = new (_crd && NoopAdAdapter === void 0 ? (_reportPossibleCrUseOfNoopAdAdapter({
              error: Error()
            }), NoopAdAdapter) : NoopAdAdapter)();
          }
        }

        _fallback(callback) {
          if (!this._platform.isDev && !this.prodRewardFallback) {
            console.log('[AdService] 正式环境广告失败，不发奖励');
            callback == null || callback({
              success: false,
              rewarded: false,
              error: 'ad_failed'
            });
            return;
          }

          console.log('[AdService] 广告异常 fallback：直接发放奖励');
          callback == null || callback({
            success: true,
            rewarded: true
          });
        }

        _getAdUnitId(placement) {
          const adMap = {
            [(_crd && AdPlacement === void 0 ? (_reportPossibleCrUseOfAdPlacement({
              error: Error()
            }), AdPlacement) : AdPlacement).Revive]: '',
            [(_crd && AdPlacement === void 0 ? (_reportPossibleCrUseOfAdPlacement({
              error: Error()
            }), AdPlacement) : AdPlacement).Treasure]: '',
            [(_crd && AdPlacement === void 0 ? (_reportPossibleCrUseOfAdPlacement({
              error: Error()
            }), AdPlacement) : AdPlacement).UpgradeExtra]: '',
            [(_crd && AdPlacement === void 0 ? (_reportPossibleCrUseOfAdPlacement({
              error: Error()
            }), AdPlacement) : AdPlacement).ShopDiscount]: '',
            [(_crd && AdPlacement === void 0 ? (_reportPossibleCrUseOfAdPlacement({
              error: Error()
            }), AdPlacement) : AdPlacement).CoinDouble]: '',
            [(_crd && AdPlacement === void 0 ? (_reportPossibleCrUseOfAdPlacement({
              error: Error()
            }), AdPlacement) : AdPlacement).DailyReward]: '',
            [(_crd && AdPlacement === void 0 ? (_reportPossibleCrUseOfAdPlacement({
              error: Error()
            }), AdPlacement) : AdPlacement).Marquee]: '',
            [(_crd && AdPlacement === void 0 ? (_reportPossibleCrUseOfAdPlacement({
              error: Error()
            }), AdPlacement) : AdPlacement).Interstitial]: '',
            [(_crd && AdPlacement === void 0 ? (_reportPossibleCrUseOfAdPlacement({
              error: Error()
            }), AdPlacement) : AdPlacement).Banner]: ''
          };
          return adMap[placement] || null;
        }

        _isAdOnCD(placement) {
          const last = this._adCD.get(placement) || 0;
          return Date.now() - last < this._cdDuration * 1000;
        }

        _setAdCD(placement) {
          this._adCD.set(placement, Date.now());
        }

      });

      AdService._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=ff337a7fff8fde18516286237bdb344bf8fb028f.js.map