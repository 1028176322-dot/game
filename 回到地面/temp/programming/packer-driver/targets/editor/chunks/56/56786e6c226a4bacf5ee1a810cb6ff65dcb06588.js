System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, UITransform, SceneModelPreview, loadUI3DBackdropConfig, _dec, _class, _crd, ccclass, MainMenuBackdrop;

  function _reportPossibleCrUseOfSceneModelPreview(extras) {
    _reporterNs.report("SceneModelPreview", "../../render/SceneModelPreview", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPreviewHandle(extras) {
    _reporterNs.report("PreviewHandle", "../../render/SceneModelPreview", _context.meta, extras);
  }

  function _reportPossibleCrUseOfloadUI3DBackdropConfig(extras) {
    _reporterNs.report("loadUI3DBackdropConfig", "../../config/ui3d", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      UITransform = _cc.UITransform;
    }, function (_unresolved_2) {
      SceneModelPreview = _unresolved_2.SceneModelPreview;
    }, function (_unresolved_3) {
      loadUI3DBackdropConfig = _unresolved_3.loadUI3DBackdropConfig;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "0e6f9Nvjd5MWr2qrIrxWK1R", "MainMenuBackdrop", undefined); // assets/scripts/ui/main/MainMenuBackdrop.ts — T4 (UI 3D preview addendum).
      // Replaces the old "mount ModelComponent directly on a UI node" approach
      // (invisible under the orthographic main camera) with the offscreen-RT
      // route: MainSceneController creates the Canvas/MainMenuBackdrop3D slot
      // node (this component is mounted on it); this component reads ui3d.json and,
      // when enabled, asks SceneModelPreview to render the 3D backdrop into that
      // slot. The 3D model lives on a T1A preview layer (offscreen rig); only a
      // 2D Sprite (the RT) is pasted back onto the slot, so the UI camera and
      // buttons are never touched.


      __checkObsolete__(['_decorator', 'Component', 'Node', 'UITransform']);

      ({
        ccclass
      } = _decorator);

      _export("MainMenuBackdrop", MainMenuBackdrop = (_dec = ccclass('MainMenuBackdrop'), _dec(_class = class MainMenuBackdrop extends Component {
        constructor(...args) {
          super(...args);
          this._handle = null;
        }

        onLoad() {
          // This component is mounted on Canvas/MainMenuBackdrop3D (created by
          // MainSceneController). Ensure the slot has a UITransform so PreviewSurface
          // can size the offscreen RenderTexture from it.
          if (!this.node.getComponent(UITransform)) {
            this.node.addComponent(UITransform);
          }

          void this._applyConfig();
        }

        async _applyConfig() {
          var _cfg$transparent;

          const cfg = await (_crd && loadUI3DBackdropConfig === void 0 ? (_reportPossibleCrUseOfloadUI3DBackdropConfig({
            error: Error()
          }), loadUI3DBackdropConfig) : loadUI3DBackdropConfig)('mainBackdrop'); // Safe degrade: keep the existing 2D background, no error, no block.

          if (!(cfg != null && cfg.enabled) || !cfg.modelAssetId) return; // Bind the slot directly (this.node is the Canvas/MainMenuBackdrop3D slot
          // resolved by convention; passing it avoids any find() timing race).

          this._handle = await (_crd && SceneModelPreview === void 0 ? (_reportPossibleCrUseOfSceneModelPreview({
            error: Error()
          }), SceneModelPreview) : SceneModelPreview).instance.showBackdropInSlot(this.node, cfg.modelAssetId, {
            ownerId: 'MainScene',
            transparent: (_cfg$transparent = cfg.transparent) != null ? _cfg$transparent : false,
            fallback2dKey: cfg.fallback2dKey
          });
        }

        onDestroy() {
          if (this._handle) {
            this._handle.destroy();

            this._handle = null;
          }

          (_crd && SceneModelPreview === void 0 ? (_reportPossibleCrUseOfSceneModelPreview({
            error: Error()
          }), SceneModelPreview) : SceneModelPreview).instance.clearOwner('MainScene');
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=56786e6c226a4bacf5ee1a810cb6ff65dcb06588.js.map