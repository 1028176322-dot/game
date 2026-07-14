System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, instantiate, SkeletalAnimation, Animation, IAssetCache, ModelRenderService, _crd;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIAssetCache(extras) {
    _reporterNs.report("IAssetCache", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAssetCache(extras) {
    _reporterNs.report("AssetCache", "../assets/AssetCache", _context.meta, extras);
  }

  _export("ModelRenderService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      instantiate = _cc.instantiate;
      SkeletalAnimation = _cc.SkeletalAnimation;
      Animation = _cc.Animation;
    }, function (_unresolved_2) {
      IAssetCache = _unresolved_2.IAssetCache;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "b33beVpRqtCzY8kmk5M00y+", "ModelRenderService", undefined); // ModelRenderService.ts — mounts a 3D model, plays idle, drives release via AssetCache (§3.6 / Demo1).
      //
      // This class references `cc` (engine runtime), so it CANNOT run under node/vitest.
      // Its ref-count logic is delegated to AssetCache (pure TS, unit-tested). Engine-side
      // verification (load a .glb, play idle, release on ref-zero) requires the Cocos runtime
      // + 3D assets, and is documented as not CI-runnable (see REPORT_demo1.md).
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.6.


      __checkObsolete__(['Node', 'Prefab', 'instantiate', 'SkeletalAnimation', 'Animation']);

      _export("ModelRenderService", ModelRenderService = class ModelRenderService {
        constructor(_ctx) {
          this._ctx = _ctx;
        }
        /** Load (ref+1) the model prefab via AssetCache and mount it under `node`. Plays idle. */


        async attach(node, modelId) {
          var _modelNode$getCompone;

          const cache = this._ctx.get(_crd && IAssetCache === void 0 ? (_reportPossibleCrUseOfIAssetCache({
            error: Error()
          }), IAssetCache) : IAssetCache);

          const prefab = await cache.load(modelId);
          const modelNode = instantiate(prefab);
          node.addChild(modelNode);
          const anim = (_modelNode$getCompone = modelNode.getComponent(SkeletalAnimation)) != null ? _modelNode$getCompone : modelNode.getComponent(Animation);

          if (anim) {
            // Prefer an explicit idle clip; fall back to default. Best-effort, non-fatal.
            const idle = anim.getState('idle');
            if (idle) anim.play('idle');else anim.play();
          }

          return modelNode;
        }
        /** Release (ref-1) the model in AssetCache. Node teardown is owned by the caller/scene. */


        detach(modelId) {
          const cache = this._ctx.get(_crd && IAssetCache === void 0 ? (_reportPossibleCrUseOfIAssetCache({
            error: Error()
          }), IAssetCache) : IAssetCache);

          cache.release(modelId);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=bc40b24776c81fb1da722ac64caab69d015142eb.js.map