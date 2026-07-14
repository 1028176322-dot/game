System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Label, Graphics, Color, tween, UIOpacity, GameConfig, GameManager, GameBootstrap, AppFlowController, UISkinSceneApplier, SceneModelPreview, loadUI3DBackdropConfig, _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, BAR_WIDTH, BAR_HEIGHT, BAR_RADIUS, SplashUI;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfGameConfig(extras) {
    _reporterNs.report("GameConfig", "../core/GameConfig", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameManager(extras) {
    _reporterNs.report("GameManager", "../core/GameManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameBootstrap(extras) {
    _reporterNs.report("GameBootstrap", "../core/GameBootstrap", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAppFlowController(extras) {
    _reporterNs.report("AppFlowController", "../app/AppFlowController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUISkinSceneApplier(extras) {
    _reporterNs.report("UISkinSceneApplier", "./UISkinSceneApplier", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSceneModelPreview(extras) {
    _reporterNs.report("SceneModelPreview", "../render/SceneModelPreview", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPreviewHandle(extras) {
    _reporterNs.report("PreviewHandle", "../render/SceneModelPreview", _context.meta, extras);
  }

  function _reportPossibleCrUseOfloadUI3DBackdropConfig(extras) {
    _reporterNs.report("loadUI3DBackdropConfig", "../config/ui3d", _context.meta, extras);
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
      Node = _cc.Node;
      Label = _cc.Label;
      Graphics = _cc.Graphics;
      Color = _cc.Color;
      tween = _cc.tween;
      UIOpacity = _cc.UIOpacity;
    }, function (_unresolved_2) {
      GameConfig = _unresolved_2.GameConfig;
    }, function (_unresolved_3) {
      GameManager = _unresolved_3.GameManager;
    }, function (_unresolved_4) {
      GameBootstrap = _unresolved_4.GameBootstrap;
    }, function (_unresolved_5) {
      AppFlowController = _unresolved_5.AppFlowController;
    }, function (_unresolved_6) {
      UISkinSceneApplier = _unresolved_6.UISkinSceneApplier;
    }, function (_unresolved_7) {
      SceneModelPreview = _unresolved_7.SceneModelPreview;
    }, function (_unresolved_8) {
      loadUI3DBackdropConfig = _unresolved_8.loadUI3DBackdropConfig;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "84b25Wl3+pFKZ3wJmNVQiu5", "SplashUI", undefined);
      /**
       * SplashUI - Splash screen with loading progress bar
       *
       * 2-second minimum display, click to skip.
       * Shows a progress bar while loading.
       * After loading completes, delegates to AppFlowController.start().
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Label', 'Graphics', 'Color', 'tween', 'UIOpacity']);

      ({
        ccclass,
        property
      } = _decorator);
      BAR_WIDTH = 380;
      BAR_HEIGHT = 24;
      BAR_RADIUS = 6;

      _export("SplashUI", SplashUI = (_dec = ccclass('SplashUI'), _dec2 = property(Label), _dec3 = property(Node), _dec4 = property(Label), _dec5 = property(Node), _dec(_class = (_class2 = class SplashUI extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "skipLabel", _descriptor, this);

          _initializerDefineProperty(this, "splashImage", _descriptor2, this);

          _initializerDefineProperty(this, "loadingLabel", _descriptor3, this);

          _initializerDefineProperty(this, "loadingBar", _descriptor4, this);

          this._elapsed = 0;
          this._hasSkipped = false;
          this._bootstrap = null;
          this._loadingDone = false;
          this._progressPct = 0;
          this._backdropHandle = null;
          // Progress bar nodes (created in code)
          this._barBg = null;
          this._barFill = null;
        }

        onLoad() {
          var _this$node$scene, _this$node$scene2;

          (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).ensure(this.node.scene);
          this._bootstrap = (_crd && GameBootstrap === void 0 ? (_reportPossibleCrUseOfGameBootstrap({
            error: Error()
          }), GameBootstrap) : GameBootstrap).ensure((_this$node$scene = this.node.scene) != null ? _this$node$scene : this.node);
          void (_crd && UISkinSceneApplier === void 0 ? (_reportPossibleCrUseOfUISkinSceneApplier({
            error: Error()
          }), UISkinSceneApplier) : UISkinSceneApplier).applyScene((_this$node$scene2 = this.node.scene) != null ? _this$node$scene2 : this.node, 'splash'); // Create progress bar nodes

          this._createProgressBar(); // Bind bootstrap progress


          if (this._bootstrap) {
            this._bootstrap.onProgress = (pct, msg) => {
              this._progressPct = pct;

              this._updateBar(pct);

              if (this.loadingLabel) {
                this.loadingLabel.string = msg;
              }
            };
          }

          this.node.on(Node.EventType.TOUCH_END, this._onSkip, this); // T5: optional 3D splash backdrop (B-lite, default off). Reuses the
          // existing splashImage as the full-screen slot; degrades to the 2D
          // background if the config is missing or disabled.

          void this._applyBackdropConfig();
        }

        _createProgressBar() {
          var _this$loadingBar;

          // Container for the bar
          const container = (_this$loadingBar = this.loadingBar) != null ? _this$loadingBar : new Node('LoadingBar');
          if (!container.parent) this.node.addChild(container); // Position handled by SplashLayout — no hardcoded setPosition

          this.loadingBar = container; // Background bar (dark gray)

          const bgNode = new Node('Bg');
          this._barBg = bgNode.addComponent(Graphics);
          this._barBg.fillColor = new Color(0x33, 0x33, 0x33, 0xFF);

          this._drawBarBg(0);

          container.addChild(bgNode); // Fill bar (blue)

          const fillNode = new Node('Fill');
          this._barFill = fillNode.addComponent(Graphics);
          this._barFill.fillColor = new Color(0x4A, 0x9E, 0xFF, 0xFF);

          this._drawBarFill(0);

          container.addChild(fillNode);
        }

        _drawBarBg(pct) {
          if (!this._barBg) return;

          this._barBg.clear();

          this._barBg.roundRect(-BAR_WIDTH / 2, -BAR_HEIGHT / 2, BAR_WIDTH, BAR_HEIGHT, BAR_RADIUS);

          this._barBg.fill();
        }

        _drawBarFill(pct) {
          if (!this._barFill) return;
          const fillW = Math.max(BAR_WIDTH * (pct / 100), 0);

          this._barFill.clear();

          if (fillW > 0) {
            this._barFill.roundRect(-BAR_WIDTH / 2, -BAR_HEIGHT / 2, fillW, BAR_HEIGHT, BAR_RADIUS);

            this._barFill.fill();
          }
        }

        _updateBar(pct) {
          this._drawBarFill(pct);
        }

        start() {
          if (!this.splashImage || !this.splashImage.active) {
            this._tryProceed();

            return;
          }

          const opacity = this.splashImage.getComponent(UIOpacity);

          if (opacity) {
            opacity.opacity = 0;
            tween(opacity).to(0.3, {
              opacity: 255
            }).start();
          }
        }

        update(dt) {
          var _this$_bootstrap;

          if (this._hasSkipped) return;
          this._elapsed += dt;

          if (!this._loadingDone && (_this$_bootstrap = this._bootstrap) != null && _this$_bootstrap.ready) {
            this._loadingDone = true;
          }

          if (this._elapsed >= (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).SPLASH_MIN_DURATION && this._loadingDone) {
            this._proceed();
          }

          if (this.skipLabel && this._elapsed > 1.0) {
            this.skipLabel.node.active = true;
          }
        }

        _onSkip() {
          if (this._hasSkipped) return;
          if (this._elapsed < 0.5) return;

          if (this._loadingDone) {
            this._proceed();
          }
        }

        _tryProceed() {
          var _this$_bootstrap2, _this$_bootstrap3;

          if ((_this$_bootstrap2 = this._bootstrap) != null && _this$_bootstrap2.ready || (_this$_bootstrap3 = this._bootstrap) != null && _this$_bootstrap3.error) {
            this._proceed();
          } else {
            this.scheduleOnce(() => this._tryProceed(), 0.2);
          }
        }

        _proceed() {
          var _this$_bootstrap4;

          if (this._hasSkipped) return;

          if ((_this$_bootstrap4 = this._bootstrap) != null && _this$_bootstrap4.error) {
            console.error('[SplashUI] bootstrap error:', this._bootstrap.error);
            return;
          }

          this._hasSkipped = true;
          console.log('[SplashUI] loading done, starting flow');
          (_crd && AppFlowController === void 0 ? (_reportPossibleCrUseOfAppFlowController({
            error: Error()
          }), AppFlowController) : AppFlowController).ensure().start();
        }

        async _applyBackdropConfig() {
          var _cfg$transparent;

          if (!this.splashImage) return; // degrade: keep existing 2D splash

          const cfg = await (_crd && loadUI3DBackdropConfig === void 0 ? (_reportPossibleCrUseOfloadUI3DBackdropConfig({
            error: Error()
          }), loadUI3DBackdropConfig) : loadUI3DBackdropConfig)('splashBackdrop');
          if (!(cfg != null && cfg.enabled) || !cfg.modelAssetId) return; // degrade: keep 2D splash
          // Reuse the existing full-screen splashImage as the RT slot (approach B:
          // no new node). The 3D model renders offscreen into a RenderTexture
          // pasted back onto a Sprite child of splashImage.

          this._backdropHandle = await (_crd && SceneModelPreview === void 0 ? (_reportPossibleCrUseOfSceneModelPreview({
            error: Error()
          }), SceneModelPreview) : SceneModelPreview).instance.showBackdropInSlot(this.splashImage, cfg.modelAssetId, {
            ownerId: 'Splash',
            transparent: (_cfg$transparent = cfg.transparent) != null ? _cfg$transparent : false,
            fallback2dKey: cfg.fallback2dKey
          });
        }

        onDestroy() {
          if (this._backdropHandle) {
            this._backdropHandle.destroy();

            this._backdropHandle = null;
          }

          (_crd && SceneModelPreview === void 0 ? (_reportPossibleCrUseOfSceneModelPreview({
            error: Error()
          }), SceneModelPreview) : SceneModelPreview).instance.clearOwner('Splash');
          this.node.off(Node.EventType.TOUCH_END, this._onSkip, this);
          this.unscheduleAllCallbacks();
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "skipLabel", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "splashImage", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "loadingLabel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "loadingBar", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=252b0eae27b51657684fcefce6878dede71915ab.js.map