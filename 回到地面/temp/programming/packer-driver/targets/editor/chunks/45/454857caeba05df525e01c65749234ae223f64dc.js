System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, NoopRewardedAd, NoopInterstitialAd, NoopBannerAd, NoopAdAdapter, _crd;

  function _reportPossibleCrUseOfAdAdapter(extras) {
    _reporterNs.report("AdAdapter", "./AdAdapter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRewardedAd(extras) {
    _reporterNs.report("RewardedAd", "./AdAdapter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfInterstitialAd(extras) {
    _reporterNs.report("InterstitialAd", "./AdAdapter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBannerAd(extras) {
    _reporterNs.report("BannerAd", "./AdAdapter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAdUnitStyle(extras) {
    _reporterNs.report("AdUnitStyle", "./AdAdapter", _context.meta, extras);
  }

  _export("NoopAdAdapter", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "7cd9fjW2GFJnKYGHIPBXkZm", "NoopAdAdapter", undefined);
      /**
       * NoopAdAdapter - No-operation ad adapter for platforms without advertising
       *
       * Used on Android native / TapTap builds.
       * All ad operations return mock success objects.
       */


      NoopRewardedAd = class NoopRewardedAd {
        constructor() {
          this._onClose = null;
          this._onError = null;
        }

        async show() {
          console.log('[NoopAd] rewarded ad show (simulated)'); // Simulate ad close after a brief delay

          setTimeout(() => {
            var _this$_onClose;

            (_this$_onClose = this._onClose) == null || _this$_onClose.call(this, {
              isEnded: true
            });
          }, 500);
        }

        onClose(callback) {
          this._onClose = callback;
        }

        onError(callback) {
          this._onError = callback;
        }

      };
      NoopInterstitialAd = class NoopInterstitialAd {
        async show() {
          console.log('[NoopAd] interstitial ad show (simulated)');
        }

      };
      NoopBannerAd = class NoopBannerAd {
        show() {
          console.log('[NoopAd] banner show (simulated)');
        }

        hide() {
          console.log('[NoopAd] banner hide (simulated)');
        }

        onError(_callback) {// noop
        }

      };

      _export("NoopAdAdapter", NoopAdAdapter = class NoopAdAdapter {
        constructor() {
          this.isAdSupported = false;
        }

        createRewardedAd(_adUnitId) {
          return new NoopRewardedAd();
        }

        createInterstitialAd(_adUnitId) {
          return new NoopInterstitialAd();
        }

        createBannerAd(_adUnitId, _style) {
          return new NoopBannerAd();
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=454857caeba05df525e01c65749234ae223f64dc.js.map