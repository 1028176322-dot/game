System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, GameAssetService, RenderAssetService, IconService, _crd;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _reportPossibleCrUseOfGameAssetService(extras) {
    _reporterNs.report("GameAssetService", "../assets/GameAssetService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRenderAssetService(extras) {
    _reporterNs.report("RenderAssetService", "../assets/RenderAssetService", _context.meta, extras);
  }

  _export("IconService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
    }, function (_unresolved_2) {
      GameAssetService = _unresolved_2.GameAssetService;
    }, function (_unresolved_3) {
      RenderAssetService = _unresolved_3.RenderAssetService;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "308bf5vA4pCzaVIvyuxKPPG", "IconService", undefined);

      /**
       * IconService — Load and apply icons by semantic key.
       *
       * Usage:
       *   await IconService.instance.apply(iconNode, 'icon.skill.dash');
       */
      __checkObsolete__(['Node']);

      _export("IconService", IconService = class IconService {
        static get instance() {
          if (!this._instance) this._instance = new IconService();
          return this._instance;
        }
        /**
         * Apply an icon image onto a node.
         *
         * @param node    Target node with Sprite component
         * @param iconKey Semantic key, e.g. 'icon.skill.dash' or 'icon.item.healingpotion'
         * @returns       true if loaded successfully
         */


        apply(node, iconKey) {
          return _asyncToGenerator(function* () {
            var def = yield (_crd && GameAssetService === void 0 ? (_reportPossibleCrUseOfGameAssetService({
              error: Error()
            }), GameAssetService) : GameAssetService).instance.get(iconKey);

            if (!def) {
              console.warn("[IconService] missing icon key: " + iconKey);
              return false;
            }

            if (def.type !== 'icon') {
              console.warn("[IconService] key is not icon type: " + iconKey + ", type=" + def.type);
              return false;
            }

            return (yield (_crd && RenderAssetService === void 0 ? (_reportPossibleCrUseOfRenderAssetService({
              error: Error()
            }), RenderAssetService) : RenderAssetService).applySpriteById(node, def.assetId)) !== null;
          })();
        }

      });

      IconService._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=eca38f58754cabfacf85a47a0bba6a4f4abf3e2d.js.map