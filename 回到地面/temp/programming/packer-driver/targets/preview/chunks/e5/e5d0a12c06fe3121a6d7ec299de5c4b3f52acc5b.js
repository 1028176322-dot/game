System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, resources, JsonAsset, _crd, DEFAULT_MAIN, DEFAULT_SPLASH;

  function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

  function fallback(group) {
    return group === 'mainBackdrop' ? _extends({}, DEFAULT_MAIN) : _extends({}, DEFAULT_SPLASH);
  }
  /**
   * Load one backdrop group from assets/resources/config/ui3d.json.
   * Never throws: on missing file / parse error / missing group it returns a
   * safe default (enabled=false) so callers degrade to the 2D background.
   */


  function loadUI3DBackdropConfig(group) {
    return new Promise(resolve => {
      resources.load('config/ui3d', JsonAsset, (err, asset) => {
        if (err || !asset) {
          resolve(fallback(group));
          return;
        }

        try {
          var _groupRaw$modelAssetI, _groupRaw$fallback2dK, _groupRaw$quality, _groupRaw$transparent;

          var raw = asset.json;
          var groupRaw = raw == null ? void 0 : raw[group];

          if (!groupRaw || typeof groupRaw !== 'object') {
            resolve(fallback(group));
            return;
          }

          resolve({
            enabled: !!groupRaw.enabled,
            modelAssetId: (_groupRaw$modelAssetI = groupRaw.modelAssetId) != null ? _groupRaw$modelAssetI : '',
            fallback2dKey: (_groupRaw$fallback2dK = groupRaw.fallback2dKey) != null ? _groupRaw$fallback2dK : fallback(group).fallback2dKey,
            quality: (_groupRaw$quality = groupRaw.quality) != null ? _groupRaw$quality : 'auto',
            transparent: (_groupRaw$transparent = groupRaw.transparent) != null ? _groupRaw$transparent : false
          });
        } catch (_unused) {
          resolve(fallback(group));
        }
      });
    });
  }

  _export("loadUI3DBackdropConfig", loadUI3DBackdropConfig);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      resources = _cc.resources;
      JsonAsset = _cc.JsonAsset;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "6895d+R0+tAhZ548y5RgL0K", "ui3d", undefined);
      /**
       * ui3d.ts — B-lite config for UI 3D backgrounds (T4 main menu / T5 splash).
       *
       * The file assets/resources/config/ui3d.json ships DEFAULT-CLOSED:
       *   { enabled:false, modelAssetId:'' } -> no 3D backdrop, keep the 2D one.
       * When the backdrop model asset is ready, flip enabled=true + set modelAssetId
       * in ui3d.json only; no code change required.
       *
       * Loaded via resources.load (NOT ConfigService, which is a fixed-name registry
       * with cross-reference validation that ui3d is intentionally excluded from).
       */


      __checkObsolete__(['resources', 'JsonAsset']);

      DEFAULT_MAIN = {
        enabled: false,
        modelAssetId: '',
        fallback2dKey: 'ui.main.bg',
        quality: 'auto',
        transparent: false
      };
      DEFAULT_SPLASH = {
        enabled: false,
        modelAssetId: '',
        fallback2dKey: 'ui.splash.bg',
        quality: 'auto',
        transparent: false
      };

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=e5d0a12c06fe3121a6d7ec299de5c4b3f52acc5b.js.map