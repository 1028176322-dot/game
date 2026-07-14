System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Camera, Color, DepthStencilFormat, director, Director, isValid, Node, PixelFormat, RenderTexture, Sprite, SpriteFrame, UITransform, view, DEFAULT_PREVIEW_LAYERS, PreviewLayerPool, SurfaceHandleImpl, PreviewSurface, _crd, RIG_ROOT_NAME, RIG_NODE_NAME, MODEL_ROOT_NAME, CAMERA_NODE_NAME, SURFACE_NODE_NAME, RT_MIN, RT_MAX, RIG_SPACING;

  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  function devicePixelRatio() {
    var _view$getDevicePixelR;

    var dpr = (_view$getDevicePixelR = view.getDevicePixelRatio == null ? void 0 : view.getDevicePixelRatio()) != null ? _view$getDevicePixelR : 1;
    return clamp(dpr, 1, 2);
  }

  function _reportPossibleCrUseOfDEFAULT_PREVIEW_LAYERS(extras) {
    _reporterNs.report("DEFAULT_PREVIEW_LAYERS", "./preview_layer_pool", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPreviewLayerPool(extras) {
    _reporterNs.report("PreviewLayerPool", "./preview_layer_pool", _context.meta, extras);
  }

  _export("PreviewSurface", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Camera = _cc.Camera;
      Color = _cc.Color;
      DepthStencilFormat = _cc.DepthStencilFormat;
      director = _cc.director;
      Director = _cc.Director;
      isValid = _cc.isValid;
      Node = _cc.Node;
      PixelFormat = _cc.PixelFormat;
      RenderTexture = _cc.RenderTexture;
      Sprite = _cc.Sprite;
      SpriteFrame = _cc.SpriteFrame;
      UITransform = _cc.UITransform;
      view = _cc.view;
    }, function (_unresolved_2) {
      DEFAULT_PREVIEW_LAYERS = _unresolved_2.DEFAULT_PREVIEW_LAYERS;
      PreviewLayerPool = _unresolved_2.PreviewLayerPool;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "40cfeAUmjdI5LO9FF3ZXRKZ", "PreviewSurface", undefined);
      /**
       * PreviewSurface.ts — Offscreen 3D preview base for UI (RenderTexture + slot).
       *
       * Root cause: main/splash main cameras are orthographic (projection=0) and do
       * not render 3D; and UI coordinates / camera projection / Canvas scale /
       * resolution / orientation all affect "putting a 3D model on top of UI". That
       * is why CreatePanel kept being "almost right but never right".
       *
       * Curative route (this module): do NOT put the 3D model on the UI. Instead
       * render it offscreen into a RenderTexture, then paste that texture back onto a
       * UI Sprite living inside the business panel's slot node:
       *
       *   3D model (PREVIEW layer, offscreen rig)
       *     -> PreviewCamera (targetTexture = RenderTexture)
       *     -> SpriteFrame(texture = RenderTexture)
       *     -> UI Sprite (child of the slot node, follows its UITransform)
       *
       * Zero coupling with CharacterVisualService / CharacterModelAssembler: this
       * module only exposes `modelRoot` + `previewLayer` for the upper layer (T1B)
       * to mount a model onto.
       *
       * Engine-side (cc); not vitest-runnable. The pure layer pool lives in
       * preview_layer_pool.ts and is unit-tested.
       */


      __checkObsolete__(['Camera', 'Color', 'DepthStencilFormat', 'director', 'Director', 'isValid', 'Node', 'PixelFormat', 'RenderTexture', 'Sprite', 'SpriteFrame', 'UITransform', 'view']);

      RIG_ROOT_NAME = '__UIPreviewRig__';
      RIG_NODE_NAME = '__UIPreviewRigNode__';
      MODEL_ROOT_NAME = '__PreviewModelRoot__';
      CAMERA_NODE_NAME = '__PreviewCamera__';
      SURFACE_NODE_NAME = '__PreviewSurface__';
      RT_MIN = 128;
      RT_MAX = 1024;
      RIG_SPACING = 100000;
      SurfaceHandleImpl = class SurfaceHandleImpl {
        constructor(surfaceNode, modelRoot, previewLayer, camera, renderTexture, _rigNode, _onDestroy) {
          this._destroyed = false;
          this.surfaceNode = surfaceNode;
          this.modelRoot = modelRoot;
          this.previewLayer = previewLayer;
          this.camera = camera;
          this.renderTexture = renderTexture;
          this._rigNode = _rigNode;
          this._onDestroy = _onDestroy;
        }

        get destroyed() {
          return this._destroyed;
        }

        destroy() {
          if (this._destroyed) return;
          this._destroyed = true;
          if (isValid(this._rigNode)) this._rigNode.destroy();
          if (isValid(this.surfaceNode)) this.surfaceNode.destroy();
          if (isValid(this.renderTexture)) this.renderTexture.destroy();

          this._onDestroy(this);
        }

      };

      _export("PreviewSurface", PreviewSurface = class PreviewSurface {
        static get instance() {
          if (!this._instance) this._instance = new PreviewSurface();
          return this._instance;
        }

        constructor() {
          this._layerPool = new (_crd && PreviewLayerPool === void 0 ? (_reportPossibleCrUseOfPreviewLayerPool({
            error: Error()
          }), PreviewLayerPool) : PreviewLayerPool)(_crd && DEFAULT_PREVIEW_LAYERS === void 0 ? (_reportPossibleCrUseOfDEFAULT_PREVIEW_LAYERS({
            error: Error()
          }), DEFAULT_PREVIEW_LAYERS) : DEFAULT_PREVIEW_LAYERS);
          this._rigRoot = null;
          this._seq = 0;
          this._byOwner = new Map();
          this._sceneHookBound = false;
        }
        /**
         * Create an offscreen preview surface for `slotNode`:
         * allocate a layer -> build RT -> build a preview camera (targetTexture=RT)
         * -> attach a Sprite inside the slot showing the RT. Returns a handle, or
         * `null` when the layer pool is exhausted (fail-fast; no surface is created).
         */


        acquire(slotNode, opts) {
          var _opts$ownerId, _opts$cameraDistance, _opts$fov, _opts$clearColor;

          var slotUI = slotNode.getComponent(UITransform);

          if (!slotUI) {
            console.warn('[PreviewSurface] slotNode has no UITransform; cannot size surface');
            return null;
          }

          var ownerId = (_opts$ownerId = opts == null ? void 0 : opts.ownerId) != null ? _opts$ownerId : '__default__';

          var layer = this._layerPool.allocate(ownerId);

          if (layer === null) {
            console.warn('[PreviewSurface] preview layer pool exhausted (fail-fast); no surface created');
            return null;
          }

          var dpr = devicePixelRatio();
          var rtWidth = clamp(Math.ceil(slotUI.width * dpr), RT_MIN, RT_MAX);
          var rtHeight = clamp(Math.ceil(slotUI.height * dpr), RT_MIN, RT_MAX);
          var rt = new RenderTexture();
          rt.reset({
            width: rtWidth,
            height: rtHeight,
            format: PixelFormat.RGBA8888,
            depthStencilFormat: DepthStencilFormat.DEPTH_24
          });

          var rigRoot = this._ensureRigRoot();

          if (!rigRoot) {
            console.warn('[PreviewSurface] no active scene to host the preview rig; aborting');

            this._layerPool.release(layer);

            if (isValid(rt)) rt.destroy();
            return null;
          }

          var rigX = this._seq * RIG_SPACING;
          this._seq++;
          var rigNode = new Node(RIG_NODE_NAME);
          rigNode.layer = layer;
          rigNode.setPosition(rigX, 0, 0);
          rigRoot.addChild(rigNode);
          var modelRoot = new Node(MODEL_ROOT_NAME);
          modelRoot.layer = layer;
          modelRoot.setPosition(0, 0, 0);
          rigNode.addChild(modelRoot);
          var camNode = new Node(CAMERA_NODE_NAME);
          camNode.layer = layer;
          camNode.setPosition(0, 0, (_opts$cameraDistance = opts == null ? void 0 : opts.cameraDistance) != null ? _opts$cameraDistance : 200);
          rigNode.addChild(camNode);
          var camera = camNode.addComponent(Camera);
          camera.projection = Camera.ProjectionType.PERSPECTIVE;
          camera.fov = (_opts$fov = opts == null ? void 0 : opts.fov) != null ? _opts$fov : 45;
          camera.near = 1;
          camera.far = 2000;
          camera.visibility = layer;
          camera.clearFlags = Camera.ClearFlag.SOLID_COLOR;
          camera.clearColor = (_opts$clearColor = opts == null ? void 0 : opts.clearColor) != null ? _opts$clearColor : opts != null && opts.transparent ? new Color(0, 0, 0, 0) : new Color(0, 0, 0, 255);
          camera.targetTexture = rt; // UI Sprite surface inside the slot.

          var existing = slotNode.getChildByName(SURFACE_NODE_NAME);
          if (existing) existing.destroy();
          var surfaceNode = new Node(SURFACE_NODE_NAME);
          var surfUI = surfaceNode.addComponent(UITransform);
          surfUI.setContentSize(slotUI.width, slotUI.height);
          surfUI.anchorX = 0.5;
          surfUI.anchorY = 0.5;
          surfaceNode.setPosition(0, 0, 0);
          surfaceNode.layer = slotNode.layer;
          var sprite = surfaceNode.addComponent(Sprite);
          sprite.sizeMode = Sprite.SizeMode.CUSTOM;
          sprite.type = Sprite.Type.SIMPLE;
          var sf = new SpriteFrame();
          sf.texture = rt;
          sf.flipUVY = true;
          sf.packable = false;
          sprite.spriteFrame = sf;
          slotNode.addChild(surfaceNode);
          if (!this._byOwner.has(ownerId)) this._byOwner.set(ownerId, []);
          var handle = new SurfaceHandleImpl(surfaceNode, modelRoot, layer, camera, rt, rigNode, self => this._releaseHandle(self, ownerId));

          this._byOwner.get(ownerId).push(handle);

          this._ensureSceneHook();

          return handle;
        }
        /** Release every surface owned by `ownerId` (call on panel close). */


        clearOwner(ownerId) {
          var list = this._byOwner.get(ownerId);

          if (!list) return; // Copy: destroying triggers _releaseHandle which mutates the list.

          for (var h of [...list]) h.destroy();

          this._byOwner.delete(ownerId);
        }

        _releaseHandle(handle, ownerId) {
          this._layerPool.release(handle.previewLayer);

          var list = this._byOwner.get(ownerId);

          if (list) {
            var idx = list.indexOf(handle);
            if (idx >= 0) list.splice(idx, 1);
          }
        }

        _ensureRigRoot() {
          if (this._rigRoot && isValid(this._rigRoot)) return this._rigRoot;
          var scene = director.getScene();
          if (!scene) return null;
          var root = new Node(RIG_ROOT_NAME);
          scene.addChild(root);
          this._rigRoot = root;
          return root;
        }

        _ensureSceneHook() {
          if (this._sceneHookBound) return;
          this._sceneHookBound = true;
          director.on(Director.EVENT_BEFORE_SCENE_LAUNCH, this._onSceneLaunch, this);
        }

        _onSceneLaunch() {
          // The rig root lives under the old scene and is destroyed with it.
          // Just release our references + layers.
          for (var list of this._byOwner.values()) {
            for (var h of [...list]) h.destroy();
          }

          this._byOwner.clear();

          this._rigRoot = null;
          this._seq = 0;
        }

      });

      PreviewSurface._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=bd3993686d464e5ddafd3b02c8395b09b579a01e.js.map