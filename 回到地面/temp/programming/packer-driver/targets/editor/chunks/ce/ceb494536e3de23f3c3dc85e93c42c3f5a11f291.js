System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7", "__unresolved_8"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Button, Component, Node, UITransform, Vec2, MainMenuBackdrop, PlayerDataManager, ShopUI, WXAdapter, UiRouter, AppFlowController, AppFlowState, eventBus, UISkinSceneApplier, _dec, _dec2, _class, _class2, _descriptor, _crd, ccclass, property, MainSceneController;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfMainMenuBackdrop(extras) {
    _reporterNs.report("MainMenuBackdrop", "./ui/main/MainMenuBackdrop", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerDataManager(extras) {
    _reporterNs.report("PlayerDataManager", "./core/PlayerDataManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfShopUI(extras) {
    _reporterNs.report("ShopUI", "./ui/ShopUI", _context.meta, extras);
  }

  function _reportPossibleCrUseOfWXAdapter(extras) {
    _reporterNs.report("WXAdapter", "./utils/WXAdapter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUiRouter(extras) {
    _reporterNs.report("UiRouter", "./ui/UiRouter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUIPanel(extras) {
    _reporterNs.report("UIPanel", "./ui/UiRouter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAppFlowController(extras) {
    _reporterNs.report("AppFlowController", "./app/AppFlowController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAppFlowState(extras) {
    _reporterNs.report("AppFlowState", "./app/AppFlowController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "./core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUISkinSceneApplier(extras) {
    _reporterNs.report("UISkinSceneApplier", "./ui/UISkinSceneApplier", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Button = _cc.Button;
      Component = _cc.Component;
      Node = _cc.Node;
      UITransform = _cc.UITransform;
      Vec2 = _cc.Vec2;
    }, function (_unresolved_2) {
      MainMenuBackdrop = _unresolved_2.MainMenuBackdrop;
    }, function (_unresolved_3) {
      PlayerDataManager = _unresolved_3.PlayerDataManager;
    }, function (_unresolved_4) {
      ShopUI = _unresolved_4.ShopUI;
    }, function (_unresolved_5) {
      WXAdapter = _unresolved_5.WXAdapter;
    }, function (_unresolved_6) {
      UiRouter = _unresolved_6.UiRouter;
    }, function (_unresolved_7) {
      AppFlowController = _unresolved_7.AppFlowController;
      AppFlowState = _unresolved_7.AppFlowState;
    }, function (_unresolved_8) {
      eventBus = _unresolved_8.eventBus;
    }, function (_unresolved_9) {
      UISkinSceneApplier = _unresolved_9.UISkinSceneApplier;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "72818UqmOdAM5Tu6bqMVEkB", "MainSceneController", undefined);
      /**
       * MainSceneController - Main scene bootstrap (simplified)
       *
       * Responsibilities:
       *   1. Listen for flow state changes
       *   2. Register and initialize all main-scene panels with UiRouter
       *   3. No longer manages dungeon entry directly
       */


      __checkObsolete__(['_decorator', 'Button', 'Component', 'Node', 'UITransform', 'Vec2']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("MainSceneController", MainSceneController = (_dec = ccclass('MainSceneController'), _dec2 = property(_crd && ShopUI === void 0 ? (_reportPossibleCrUseOfShopUI({
        error: Error()
      }), ShopUI) : ShopUI), _dec(_class = (_class2 = class MainSceneController extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "shopUI", _descriptor, this);

          this._startButton = null;
        }

        onLoad() {
          var _this$shopUI, _this$node$scene;

          (_crd && PlayerDataManager === void 0 ? (_reportPossibleCrUseOfPlayerDataManager({
            error: Error()
          }), PlayerDataManager) : PlayerDataManager).getInstance();
          (_this$shopUI = this.shopUI) == null || _this$shopUI.init();

          this._ensurePersistentMainBackground();

          void (_crd && UISkinSceneApplier === void 0 ? (_reportPossibleCrUseOfUISkinSceneApplier({
            error: Error()
          }), UISkinSceneApplier) : UISkinSceneApplier).applyScene((_this$node$scene = this.node.scene) != null ? _this$node$scene : this.node, 'main');
          (_crd && WXAdapter === void 0 ? (_reportPossibleCrUseOfWXAdapter({
            error: Error()
          }), WXAdapter) : WXAdapter).getInstance().showBanner();
          (_crd && WXAdapter === void 0 ? (_reportPossibleCrUseOfWXAdapter({
            error: Error()
          }), WXAdapter) : WXAdapter).getInstance().reportAnalytics('game_start', {
            day: new Date().getDate()
          });

          this._registerPanels();

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('appflow:state_changed', this._onFlowState, this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('ui:open_area_select', this._onOpenAreaSelect, this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('ui:open_shop', this._onOpenShop, this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('ui:open_settings', this._onOpenSettings, this);

          this._bindFallbackStartButton();

          this.scheduleOnce(() => this._bindFallbackStartButton(), 0.1);
        }

        _registerPanels() {
          const router = (_crd && UiRouter === void 0 ? (_reportPossibleCrUseOfUiRouter({
            error: Error()
          }), UiRouter) : UiRouter).instance;
          const candidates = ['LoginPanel', 'CreatePanel', 'CharacterPanel', 'AreaSelectPanel', 'SettlementPanel', 'SettingsPanel', 'AdventureLogPanel']; // Search from scene root (panels are children of Canvas, not of MainSceneController)

          const sceneRoot = this.node.scene;

          for (const name of candidates) {
            // Search from scene root, recursively
            const node = this._findChildRecursive(sceneRoot != null ? sceneRoot : this.node, name);

            if (!node) {
              console.warn(`[MainScene] panel node not found in scene: ${name}`);
              continue;
            }

            const comp = node.getComponent(name);

            if (comp && typeof comp.open === 'function' && typeof comp.close === 'function') {
              router.register(comp);
              console.log(`[MainScene] registered panel: ${name}`);
            } else {
              console.warn(`[MainScene] panel found but no UIPanel interface: ${name}`);
            }
          }
        }

        _findChildRecursive(parent, name) {
          if (parent.name === name) return parent;

          for (const child of parent.children) {
            const found = this._findChildRecursive(child, name);

            if (found) return found;
          }

          return null;
        }

        _ensurePersistentMainBackground() {
          var _this$node$scene2;

          const canvas = this._findChildRecursive((_this$node$scene2 = this.node.scene) != null ? _this$node$scene2 : this.node, 'Canvas');

          if (!canvas) {
            console.warn('[MainScene] Canvas not found; main background cannot be created');
            return null;
          }

          let bg = canvas.getChildByName('MainBackground');

          if (!bg) {
            bg = new Node('MainBackground');
            bg.layer = canvas.layer;
            canvas.addChild(bg);
          }

          bg.setSiblingIndex(0);
          bg.active = true; // T4: ensure the 3D backdrop slot. It renders behind all foreground UI
          // (above the 2D MainBackground placeholder) so the 3D backdrop can
          // replace the 2D one when enabled, without being hidden behind it.
          // Node creation is T4's job; the actual 3D render is driven by the
          // MainMenuBackdrop component (reads ui3d.json) mounted on this node.

          let backdrop3D = canvas.getChildByName('MainMenuBackdrop3D');

          if (!backdrop3D) {
            backdrop3D = new Node('MainMenuBackdrop3D');
            backdrop3D.layer = canvas.layer;
            const ui = backdrop3D.addComponent(UITransform);
            ui.anchorMin = new Vec2(0, 0);
            ui.anchorMax = new Vec2(1, 1);
            ui.anchorPoint = new Vec2(0.5, 0.5);
            backdrop3D.addComponent(_crd && MainMenuBackdrop === void 0 ? (_reportPossibleCrUseOfMainMenuBackdrop({
              error: Error()
            }), MainMenuBackdrop) : MainMenuBackdrop);
            canvas.addChild(backdrop3D);
          } // Order: MainBackground (0) at the very bottom, MainMenuBackdrop3D (1)
          // just above it, still below MainUI / panels.


          bg.setSiblingIndex(0);
          backdrop3D.setSiblingIndex(1);
          backdrop3D.active = true;
          return bg;
        }

        _onFlowState(state) {
          var _this$node$parent$get, _this$node$parent, _this$node$scene3;

          const router = (_crd && UiRouter === void 0 ? (_reportPossibleCrUseOfUiRouter({
            error: Error()
          }), UiRouter) : UiRouter).instance; // Show MainUI only when in main hub, hide during all modal panels (area select, settings, etc.)
          // Robust lookup: the controller may live as a direct Canvas child or elsewhere; find MainUI by name.

          const mainUI = (_this$node$parent$get = (_this$node$parent = this.node.parent) == null ? void 0 : _this$node$parent.getChildByName('MainUI')) != null ? _this$node$parent$get : this._findChildRecursive((_this$node$scene3 = this.node.scene) != null ? _this$node$scene3 : this.node, 'MainUI');
          const showMainUI = state === (_crd && AppFlowState === void 0 ? (_reportPossibleCrUseOfAppFlowState({
            error: Error()
          }), AppFlowState) : AppFlowState).MAIN_HUB;
          if (mainUI) mainUI.active = showMainUI; // Close all panels before opening the next one to prevent stacking

          router.closeAll();

          switch (state) {
            case (_crd && AppFlowState === void 0 ? (_reportPossibleCrUseOfAppFlowState({
              error: Error()
            }), AppFlowState) : AppFlowState).AREA_SELECT:
              router.open('area_select');
              break;

            case (_crd && AppFlowState === void 0 ? (_reportPossibleCrUseOfAppFlowState({
              error: Error()
            }), AppFlowState) : AppFlowState).AUTH_CHECK:
              router.open('login');
              break;

            case (_crd && AppFlowState === void 0 ? (_reportPossibleCrUseOfAppFlowState({
              error: Error()
            }), AppFlowState) : AppFlowState).PROFILE_CHECK:
              router.open('create_character');
              break;

            case (_crd && AppFlowState === void 0 ? (_reportPossibleCrUseOfAppFlowState({
              error: Error()
            }), AppFlowState) : AppFlowState).SETTLEMENT:
              router.open('settlement');
              break;

            default:
              break;
          }
        }

        _onOpenShop() {
          if (this.shopUI) {
            this.shopUI.show();
          } else {
            console.warn('[MainScene] shopUI not bound');
          }
        }

        _onOpenSettings() {
          (_crd && UiRouter === void 0 ? (_reportPossibleCrUseOfUiRouter({
            error: Error()
          }), UiRouter) : UiRouter).instance.open('settings');
        }

        _onOpenAreaSelect() {
          console.log('[MainScene] _onOpenAreaSelect triggered');
          (_crd && AppFlowController === void 0 ? (_reportPossibleCrUseOfAppFlowController({
            error: Error()
          }), AppFlowController) : AppFlowController).instance.goTo((_crd && AppFlowState === void 0 ? (_reportPossibleCrUseOfAppFlowState({
            error: Error()
          }), AppFlowState) : AppFlowState).AREA_SELECT).catch(err => console.error('[MainScene] failed to enter AREA_SELECT', err));
        }

        onDestroy() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).offTarget(this);

          this._unbindStartButton();

          this.unscheduleAllCallbacks();
        }

        _bindFallbackStartButton() {
          var _ref, _parentNode$getChildB, _startNode$getCompone;

          if (this._startButton) {
            const existing = this._startButton;

            this._unbindStartButton(existing);

            this._bindStartButton(existing);

            this._startButton = existing;
            console.log('[MainScene] bound fallback start button click to area select flow');
            return;
          }

          const parentNode = this.node.parent;
          const startNode = (_ref = (_parentNode$getChildB = parentNode == null ? void 0 : parentNode.getChildByName('StartButton')) != null ? _parentNode$getChildB : this.node.getChildByName('StartButton')) != null ? _ref : this._findStartButtonInScene();
          const startButton = (_startNode$getCompone = startNode == null ? void 0 : startNode.getComponent(Button)) != null ? _startNode$getCompone : null;

          if (!startButton) {
            console.warn('[MainScene] StartButton not found; game start button may not be bound');
            return;
          }

          this._startButton = startButton;

          this._bindStartButton(this._startButton);

          console.log('[MainScene] bound fallback start button click to area select flow');
        }

        _bindStartButton(button) {
          const node = button == null ? void 0 : button.node;
          if (!node || !node.isValid) return;
          node.on(Button.EventType.CLICK, this._onOpenAreaSelect, this);
        }

        _unbindStartButton(button = this._startButton) {
          const node = button == null ? void 0 : button.node;

          if (!node || !node.isValid) {
            if (this._startButton === button) {
              this._startButton = null;
            }

            return;
          }

          node.off(Button.EventType.CLICK, this._onOpenAreaSelect, this);

          if (this._startButton === button) {
            this._startButton = null;
          }
        }

        _findStartButtonInScene() {
          const scene = this.node.scene;
          if (!scene) return null;

          const search = node => {
            if (node.name === 'StartButton') return node;

            for (const child of node.children) {
              const found = search(child);
              if (found) return found;
            }

            return null;
          };

          return search(scene);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "shopUI", [_dec2], {
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
//# sourceMappingURL=ceb494536e3de23f3c3dc85e93c42c3f5a11f291.js.map