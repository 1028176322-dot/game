System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, find, PreviewSurface, CharacterVisualService, CharacterModelAssembler, PreviewHandleImpl, SceneModelPreview, _crd, BACKDROP_SLOT_BY_OWNER, DEFAULT_OWNER, DEFAULT_FPS, DEFAULT_ACTION;

  function _reportPossibleCrUseOfPreviewSurface(extras) {
    _reporterNs.report("PreviewSurface", "./PreviewSurface", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSurfaceHandle(extras) {
    _reporterNs.report("SurfaceHandle", "./PreviewSurface", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCharacterVisualService(extras) {
    _reporterNs.report("CharacterVisualService", "./CharacterVisualService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCharacterModelAssembler(extras) {
    _reporterNs.report("CharacterModelAssembler", "./CharacterModelAssembler", _context.meta, extras);
  }

  _export("SceneModelPreview", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      find = _cc.find;
    }, function (_unresolved_2) {
      PreviewSurface = _unresolved_2.PreviewSurface;
    }, function (_unresolved_3) {
      CharacterVisualService = _unresolved_3.CharacterVisualService;
    }, function (_unresolved_4) {
      CharacterModelAssembler = _unresolved_4.CharacterModelAssembler;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "dc75e36gH9HDb4IWvWSXgdS", "SceneModelPreview", undefined);
      /**
       * SceneModelPreview.ts — Panel-level facade for UI 3D previews.
       *
       * T1A (PreviewSurface) only provides the "offscreen base" (RenderTexture +
       * camera + user layer + slot Sprite); it knows nothing about characters.
       * Business panels (CreatePanel / CharacterPanel / MainMenu / Splash) want a
       * one-liner: "show this character/model inside this slot node".
       *
       * This module is that facade:
       *   slotNode -> PreviewSurface.acquire() -> mount model onto handle.modelRoot
       *   (100% delegated to the existing CharacterVisualService /
       *   CharacterModelAssembler chain) -> return a PreviewHandle.
       *
       * It implements NO mounting / scaling / material logic of its own (that all
       * lives in CharacterVisualService / CharacterModelAssembler). It only wires:
       *   接 slot -> 拿底座 -> 委托挂载 -> 管 handle。
       *
       * Engine-side (cc); not vitest-runnable. The pure layer pool it depends on
       * (via PreviewSurface) is unit-tested in preview_layer_pool.test.ts.
       */


      __checkObsolete__(['find', 'Node']);

      /** ownerId -> full-screen backdrop slot path. Nodes are created by T4/T5, NOT here. */
      BACKDROP_SLOT_BY_OWNER = {
        MainScene: 'Canvas/MainMenuBackdrop3D',
        Splash: 'Canvas/SplashBackdrop3D'
      };
      DEFAULT_OWNER = '__default__';
      DEFAULT_FPS = 8;
      DEFAULT_ACTION = 'idle';
      PreviewHandleImpl = class PreviewHandleImpl {
        constructor(_surface, _setActionFn) {
          this._surface = _surface;
          this._setActionFn = _setActionFn;
        }

        get surfaceNode() {
          return this._surface.surfaceNode;
        }

        get modelRoot() {
          return this._surface.modelRoot;
        }

        setAction(action) {
          this._setActionFn(action);
        }

        destroy() {
          this._surface.destroy();
        }

      };

      _export("SceneModelPreview", SceneModelPreview = class SceneModelPreview {
        static get instance() {
          if (!this._instance) this._instance = new SceneModelPreview();
          return this._instance;
        }

        constructor() {}
        /**
         * Show a character (3D preferred, 2D fallback) inside a UI slot. Most common.
         * visualKey is composed internally as `character.${id}.${action}`.
         * Returns null on a safe no-op (layer pool exhausted or render failed).
         */


        async showCharacterInSlot(slotNode, characterId, action = DEFAULT_ACTION, opts) {
          var _opts$ownerId, _opts$fps, _opts$forceUnlit;

          const ownerId = (_opts$ownerId = opts == null ? void 0 : opts.ownerId) != null ? _opts$ownerId : DEFAULT_OWNER;
          const surface = (_crd && PreviewSurface === void 0 ? (_reportPossibleCrUseOfPreviewSurface({
            error: Error()
          }), PreviewSurface) : PreviewSurface).instance.acquire(slotNode, {
            width: opts == null ? void 0 : opts.width,
            height: opts == null ? void 0 : opts.height,
            transparent: opts == null ? void 0 : opts.transparent,
            ownerId
          });

          if (!surface) {
            console.warn('[SceneModelPreview] no preview surface available (layer pool exhausted)');
            return null;
          }

          const fps = (_opts$fps = opts == null ? void 0 : opts.fps) != null ? _opts$fps : DEFAULT_FPS;
          const forceUnlit = (_opts$forceUnlit = opts == null ? void 0 : opts.forceUnlit) != null ? _opts$forceUnlit : true;
          const visualKey = `character.${characterId}.${action}`;
          const ok = await (_crd && CharacterVisualService === void 0 ? (_reportPossibleCrUseOfCharacterVisualService({
            error: Error()
          }), CharacterVisualService) : CharacterVisualService).instance.play(surface.modelRoot, visualKey, fps, forceUnlit, surface.previewLayer);

          if (!ok) {
            surface.destroy();
            return null;
          }

          return new PreviewHandleImpl(surface, a => {
            // play() re-uses the mounted model (isMounted -> clip swap), so this is cheap.
            void (_crd && CharacterVisualService === void 0 ? (_reportPossibleCrUseOfCharacterVisualService({
              error: Error()
            }), CharacterVisualService) : CharacterVisualService).instance.play(surface.modelRoot, `character.${characterId}.${a}`, fps, forceUnlit, surface.previewLayer);
          });
        }
        /**
         * Show an arbitrary model asset (no character key, e.g. equipment/props)
         * inside a UI slot. Returns null on a safe no-op.
         */


        async showModelInSlot(slotNode, modelAssetId, opts) {
          var _opts$ownerId2, _opts$forceUnlit2, _opts$action;

          const ownerId = (_opts$ownerId2 = opts == null ? void 0 : opts.ownerId) != null ? _opts$ownerId2 : DEFAULT_OWNER;
          const surface = (_crd && PreviewSurface === void 0 ? (_reportPossibleCrUseOfPreviewSurface({
            error: Error()
          }), PreviewSurface) : PreviewSurface).instance.acquire(slotNode, {
            width: opts == null ? void 0 : opts.width,
            height: opts == null ? void 0 : opts.height,
            transparent: opts == null ? void 0 : opts.transparent,
            ownerId
          });

          if (!surface) {
            console.warn('[SceneModelPreview] no preview surface available (layer pool exhausted)');
            return null;
          }

          const forceUnlit = (_opts$forceUnlit2 = opts == null ? void 0 : opts.forceUnlit) != null ? _opts$forceUnlit2 : true;
          const action = (_opts$action = opts == null ? void 0 : opts.action) != null ? _opts$action : DEFAULT_ACTION;
          const ok = await (_crd && CharacterModelAssembler === void 0 ? (_reportPossibleCrUseOfCharacterModelAssembler({
            error: Error()
          }), CharacterModelAssembler) : CharacterModelAssembler).instance.mount(surface.modelRoot, modelAssetId, undefined, 'Weapon', action, forceUnlit, surface.previewLayer);

          if (!ok) {
            surface.destroy();
            return null;
          }

          return new PreviewHandleImpl(surface, a => {
            (_crd && CharacterModelAssembler === void 0 ? (_reportPossibleCrUseOfCharacterModelAssembler({
              error: Error()
            }), CharacterModelAssembler) : CharacterModelAssembler).instance.play(surface.modelRoot, a);
          });
        }
        /**
         * Full-screen 3D backdrop — canonical API: caller passes the already-created
         * full-screen slot node. Internally equivalent to
         * `showModelInSlot(slotNode, backdropModelAssetId, opts)` (semantic alias).
         */


        async showBackdropInSlot(slotNode, backdropModelAssetId, opts) {
          if (!backdropModelAssetId) return null; // no-op; keep existing 2D background

          return this.showModelInSlot(slotNode, backdropModelAssetId, {
            ownerId: opts == null ? void 0 : opts.ownerId,
            transparent: opts == null ? void 0 : opts.transparent
          });
        }
        /**
         * Full-screen 3D backdrop convenience wrapper: resolves the full-screen slot
         * by ownerId convention, then delegates to `showBackdropInSlot`.
         *   - ownerId='MainScene' -> resolves `Canvas/MainMenuBackdrop3D` (node created by T4)
         *   - ownerId='Splash'    -> resolves `Canvas/SplashBackdrop3D`   (node created by T5)
         * If the slot node does not exist -> returns null (does NOT auto-create nodes;
         * node creation is T4/T5's responsibility). Config source + 2D fallback also
         * live in T4/T5 (this facade does not read config).
         */


        async showBackdrop(backdropModelAssetId, opts) {
          var _opts$ownerId3;

          if (!backdropModelAssetId) return null; // no-op; keep existing 2D background

          const ownerId = (_opts$ownerId3 = opts == null ? void 0 : opts.ownerId) != null ? _opts$ownerId3 : 'MainScene';
          const slotPath = BACKDROP_SLOT_BY_OWNER[ownerId];

          if (!slotPath) {
            console.warn(`[SceneModelPreview] unknown backdrop ownerId: ${ownerId}`);
            return null;
          }

          const slotNode = find(slotPath);

          if (!slotNode) {
            console.warn(`[SceneModelPreview] backdrop slot not found: ${slotPath} (node creation is T4/T5's job)`);
            return null;
          }

          return this.showBackdropInSlot(slotNode, backdropModelAssetId, opts);
        }
        /** Release every preview owned by `ownerId` (call on panel close). */


        clearOwner(ownerId) {
          // Single source of truth: T1A owns the surface registry + layer recycling.
          (_crd && PreviewSurface === void 0 ? (_reportPossibleCrUseOfPreviewSurface({
            error: Error()
          }), PreviewSurface) : PreviewSurface).instance.clearOwner(ownerId);
        }

      });

      SceneModelPreview._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=79eeb45ecdd6064833b1dfea5446185ec8e5cb8b.js.map