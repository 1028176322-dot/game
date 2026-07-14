System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, GameAssetService, TileAssetService, _crd;

  function _reportPossibleCrUseOfGameAssetService(extras) {
    _reporterNs.report("GameAssetService", "../assets/GameAssetService", _context.meta, extras);
  }

  _export("TileAssetService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      GameAssetService = _unresolved_2.GameAssetService;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "3e288OTBYdBeIM0IBtcYltO", "TileAssetService", undefined);
      /**
       * TileAssetService — Resolve tile assetIds by semantic key.
       *
       * Usage:
       *   const assetId = await TileAssetService.instance.getTileAssetId('tile.forest.floor');
       *   if (assetId) await RenderAssetService.applySpriteById(tileNode, assetId);
       */


      _export("TileAssetService", TileAssetService = class TileAssetService {
        static get instance() {
          if (!this._instance) this._instance = new TileAssetService();
          return this._instance;
        }
        /**
         * Get the assetId for a tile by semantic key.
         * Returns null if key is missing or is not a tile type.
         */


        async getTileAssetId(tileKey) {
          const def = await (_crd && GameAssetService === void 0 ? (_reportPossibleCrUseOfGameAssetService({
            error: Error()
          }), GameAssetService) : GameAssetService).instance.get(tileKey);

          if (!def) {
            console.warn(`[TileAssetService] missing tile key: ${tileKey}`);
            return null;
          }

          if (def.type !== 'tile') {
            console.warn(`[TileAssetService] key is not tile type: ${tileKey}, type=${def.type}`);
            return null;
          }

          return def.assetId;
        }

      });

      TileAssetService._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=1dafebdc5142ec83457d278a06d1b1f16f1fe818.js.map