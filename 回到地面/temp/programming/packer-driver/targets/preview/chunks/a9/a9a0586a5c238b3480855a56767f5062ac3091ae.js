System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Sprite, GameAssetService, RenderAssetService, BackgroundService, _crd;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _reportPossibleCrUseOfGameAssetService(extras) {
    _reporterNs.report("GameAssetService", "../assets/GameAssetService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRenderAssetService(extras) {
    _reporterNs.report("RenderAssetService", "../assets/RenderAssetService", _context.meta, extras);
  }

  _export("BackgroundService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Sprite = _cc.Sprite;
    }, function (_unresolved_2) {
      GameAssetService = _unresolved_2.GameAssetService;
    }, function (_unresolved_3) {
      RenderAssetService = _unresolved_3.RenderAssetService;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "f37e0a+6LdB3rpdixkv5IL2", "BackgroundService", undefined);
      /**
       * BackgroundService — Load and apply background textures by semantic key.
       *
       * Usage:
       *   await BackgroundService.instance.apply(bgNode, 'background.forest.combat');
       */


      __checkObsolete__(['Node', 'Sprite']);

      _export("BackgroundService", BackgroundService = class BackgroundService {
        static get instance() {
          if (!this._instance) this._instance = new BackgroundService();
          return this._instance;
        }
        /**
         * Apply a background image by semantic key.
         * Sets Sprite sizeMode to CUSTOM for proper scaling.
         */


        apply(node, backgroundKey) {
          return _asyncToGenerator(function* () {
            var def = yield (_crd && GameAssetService === void 0 ? (_reportPossibleCrUseOfGameAssetService({
              error: Error()
            }), GameAssetService) : GameAssetService).instance.get(backgroundKey);

            if (!def) {
              console.warn("[BackgroundService] missing background key: " + backgroundKey);
              return false;
            }

            var frame = yield (_crd && RenderAssetService === void 0 ? (_reportPossibleCrUseOfRenderAssetService({
              error: Error()
            }), RenderAssetService) : RenderAssetService).applySpriteById(node, def.assetId);
            if (!frame) return false;
            var sprite = node.getComponent(Sprite);

            if (sprite) {
              sprite.sizeMode = Sprite.SizeMode.CUSTOM;
            }

            return true;
          })();
        }

      });

      BackgroundService._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=a9a0586a5c238b3480855a56767f5062ac3091ae.js.map