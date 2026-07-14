System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Node, GameAssetService, SpriteAnimationService, EffectService, _crd;

  function _reportPossibleCrUseOfGameAssetService(extras) {
    _reporterNs.report("GameAssetService", "../assets/GameAssetService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSpriteAnimationService(extras) {
    _reporterNs.report("SpriteAnimationService", "./SpriteAnimationService", _context.meta, extras);
  }

  _export("EffectService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Node = _cc.Node;
    }, function (_unresolved_2) {
      GameAssetService = _unresolved_2.GameAssetService;
    }, function (_unresolved_3) {
      SpriteAnimationService = _unresolved_3.SpriteAnimationService;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "42952QQmbNICrIDcqq2J2+l", "EffectService", undefined);
      /**
       * EffectService — Play visual effects by semantic key.
       *
       * Creates a temporary node in the effect layer, plays the sprite sheet,
       * and auto-destroys on completion.
       *
       * Usage:
       *   await EffectService.instance.play(effectLayer, 'effect.reaction.burn', worldPos);
       */


      __checkObsolete__(['Node', 'Vec3']);

      _export("EffectService", EffectService = class EffectService {
        static get instance() {
          if (!this._instance) this._instance = new EffectService();
          return this._instance;
        }
        /**
         * Play an effect at a world position.
         *
         * @param effectLayer Parent node for the effect (e.g. EffectLayer)
         * @param effectKey   Semantic key, e.g. 'effect.reaction.burn'
         * @param worldPos    World position to place the effect at
         * @returns           The effect node, or null if failed
         */


        async play(effectLayer, effectKey, worldPos) {
          const def = await (_crd && GameAssetService === void 0 ? (_reportPossibleCrUseOfGameAssetService({
            error: Error()
          }), GameAssetService) : GameAssetService).instance.get(effectKey);

          if (!def) {
            console.warn(`[EffectService] missing effect key: ${effectKey}`);
            return null;
          }

          const node = new Node(`Effect_${effectKey.replace(/\./g, '_')}`);
          effectLayer.addChild(node);
          node.setPosition(worldPos);

          if (def.type === 'effect_sheet' || def.type === 'sprite_sheet') {
            var _def$loop;

            const ok = await (_crd && SpriteAnimationService === void 0 ? (_reportPossibleCrUseOfSpriteAnimationService({
              error: Error()
            }), SpriteAnimationService) : SpriteAnimationService).instance.playByAssetDef(node, def, {
              loop: (_def$loop = def.loop) != null ? _def$loop : false,
              fps: 12,
              destroyOnComplete: true
            });

            if (!ok) {
              node.destroy();
              return null;
            }
          } else {
            // Single-frame effect
            const {
              RenderAssetService
            } = await _context.import("__unresolved_3");
            const ok = await RenderAssetService.applySpriteById(node, def.assetId);

            if (!ok) {
              node.destroy();
              return null;
            }
          }

          return node;
        }
        /**
         * Preload an effect definition so the first play() is faster.
         */


        async preload(effectKey) {
          const def = await (_crd && GameAssetService === void 0 ? (_reportPossibleCrUseOfGameAssetService({
            error: Error()
          }), GameAssetService) : GameAssetService).instance.get(effectKey);
          if (!def) return;
          const {
            AssetBundleService
          } = await _context.import("__unresolved_4");

          try {
            await AssetBundleService.instance.tryLoadSpriteFrame(def.assetId);
          } catch {// Preload failure is non-critical
          }
        }

      });

      EffectService._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=5de18cd702a8ae747e7a69e1c79c62c00741c9dd.js.map