System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, WeChatRewardedAd, WeChatInterstitialAd, WeChatBannerAd, WeChatAdAdapter, _crd;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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

  _export("WeChatAdAdapter", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "8fa8dDqBQdCPZYE4EfIbOew", "WeChatAdAdapter", undefined);
      /**
       * WeChatAdAdapter - Ad adapter for WeChat Mini Game
       *
       * Wraps wx.createRewardedVideoAd / createInterstitialAd / createBannerAd
       * into the AdAdapter interface.
       */


      WeChatRewardedAd = class WeChatRewardedAd {
        constructor(ad) {
          this._ad = void 0;
          this._ad = ad;
        }

        show() {
          var _this = this;

          return _asyncToGenerator(function* () {
            return _this._ad.show();
          })();
        }

        onClose(callback) {
          this._ad.onClose(callback);
        }

        onError(callback) {
          this._ad.onError(callback);
        }

      };
      WeChatInterstitialAd = class WeChatInterstitialAd {
        constructor(ad) {
          this._ad = void 0;
          this._ad = ad;
        }

        show() {
          var _this2 = this;

          return _asyncToGenerator(function* () {
            return _this2._ad.show();
          })();
        }

      };
      WeChatBannerAd = class WeChatBannerAd {
        constructor(ad) {
          this._ad = void 0;
          this._ad = ad;
        }

        show() {
          this._ad.show();
        }

        hide() {
          this._ad.hide();
        }

        onError(callback) {
          this._ad.onError(callback);
        }

      };

      _export("WeChatAdAdapter", WeChatAdAdapter = class WeChatAdAdapter {
        constructor() {
          this.isAdSupported = true;
        }

        createRewardedAd(adUnitId) {
          var ad = typeof wx !== 'undefined' ? wx.createRewardedVideoAd({
            adUnitId
          }) : null;
          return new WeChatRewardedAd(ad || this._createMock());
        }

        createInterstitialAd(adUnitId) {
          var ad = typeof wx !== 'undefined' ? wx.createInterstitialAd({
            adUnitId
          }) : null;
          return new WeChatInterstitialAd(ad || {
            show: function () {
              var _show = _asyncToGenerator(function* () {});

              function show() {
                return _show.apply(this, arguments);
              }

              return show;
            }()
          });
        }

        createBannerAd(adUnitId, style) {
          var ad = typeof wx !== 'undefined' ? wx.createBannerAd({
            adUnitId,
            style
          }) : null;
          return new WeChatBannerAd(ad || {
            show() {},

            hide() {},

            onError() {}

          });
        }

        _createMock() {
          return {
            show: function () {
              var _show2 = _asyncToGenerator(function* () {});

              function show() {
                return _show2.apply(this, arguments);
              }

              return show;
            }(),
            onClose: () => {},
            onError: () => {}
          };
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=1d1f0c0620f0987ea531c2e3a12d4fd85035a6a3.js.map