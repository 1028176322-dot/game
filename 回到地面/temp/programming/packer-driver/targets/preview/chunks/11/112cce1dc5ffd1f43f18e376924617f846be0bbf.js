System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Button, Label, UiRouter, PlayerDataManager, WXAdapter, AppFlowState, eventBus, T, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _crd, ccclass, property, MainHubUI;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfUiRouter(extras) {
    _reporterNs.report("UiRouter", "../UiRouter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerDataManager(extras) {
    _reporterNs.report("PlayerDataManager", "../../core/PlayerDataManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfWXAdapter(extras) {
    _reporterNs.report("WXAdapter", "../../utils/WXAdapter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAppFlowState(extras) {
    _reporterNs.report("AppFlowState", "../../app/AppFlowController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfT(extras) {
    _reporterNs.report("T", "../../core/TextManager", _context.meta, extras);
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
      Button = _cc.Button;
      Label = _cc.Label;
    }, function (_unresolved_2) {
      UiRouter = _unresolved_2.UiRouter;
    }, function (_unresolved_3) {
      PlayerDataManager = _unresolved_3.PlayerDataManager;
    }, function (_unresolved_4) {
      WXAdapter = _unresolved_4.WXAdapter;
    }, function (_unresolved_5) {
      AppFlowState = _unresolved_5.AppFlowState;
    }, function (_unresolved_6) {
      eventBus = _unresolved_6.eventBus;
    }, function (_unresolved_7) {
      T = _unresolved_7.T;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "5a96dNzLvpMibrZnq0ysGoT", "MainHubUI", undefined);
      /**
       * MainHubUI - Main city hub entry UI
       *
       * Root UI component on main.scene.
       * Owns TopBar, ActionBar, BottomBar and opens panels via UiRouter.
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Button', 'Label', 'Sprite']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("MainHubUI", MainHubUI = (_dec = ccclass('MainHubUI'), _dec2 = property(Button), _dec3 = property(Button), _dec4 = property(Button), _dec5 = property(Button), _dec6 = property(Button), _dec7 = property(Label), _dec8 = property(Label), _dec9 = property(Label), _dec10 = property(Label), _dec11 = property(Label), _dec(_class = (_class2 = class MainHubUI extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "startBtn", _descriptor, this);

          _initializerDefineProperty(this, "characterBtn", _descriptor2, this);

          _initializerDefineProperty(this, "shopBtn", _descriptor3, this);

          _initializerDefineProperty(this, "logBtn", _descriptor4, this);

          _initializerDefineProperty(this, "settingsBtn", _descriptor5, this);

          _initializerDefineProperty(this, "charNameLabel", _descriptor6, this);

          _initializerDefineProperty(this, "charClassLabel", _descriptor7, this);

          _initializerDefineProperty(this, "levelLabel", _descriptor8, this);

          _initializerDefineProperty(this, "soulStoneLabel", _descriptor9, this);

          _initializerDefineProperty(this, "versionLabel", _descriptor10, this);
        }

        onLoad() {
          this._refreshTopBar();

          this._bindButtons();

          (_crd && WXAdapter === void 0 ? (_reportPossibleCrUseOfWXAdapter({
            error: Error()
          }), WXAdapter) : WXAdapter).getInstance().showBanner(); // Listen for data updates when returning from dungeon

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('appflow:state_changed', this._onFlowStateChanged, this);
        }

        _bindButtons() {
          if (this.startBtn) {
            this.startBtn.node.on(Button.EventType.CLICK, () => {
              // Open area select panel -> RunCoordinator -> dungeon
              (_crd && UiRouter === void 0 ? (_reportPossibleCrUseOfUiRouter({
                error: Error()
              }), UiRouter) : UiRouter).instance.open('area_select');
            }, this);
          }

          if (this.characterBtn) {
            this.characterBtn.node.on(Button.EventType.CLICK, () => {
              (_crd && UiRouter === void 0 ? (_reportPossibleCrUseOfUiRouter({
                error: Error()
              }), UiRouter) : UiRouter).instance.open('character');
            }, this);
          }

          if (this.shopBtn) {
            this.shopBtn.node.on(Button.EventType.CLICK, () => {
              // Shop is NOT a UIPanel — route via eventBus to MainSceneController
              (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                error: Error()
              }), eventBus) : eventBus).emit('ui:open_shop');
            }, this);
          }

          if (this.logBtn) {
            this.logBtn.node.on(Button.EventType.CLICK, () => {
              (_crd && UiRouter === void 0 ? (_reportPossibleCrUseOfUiRouter({
                error: Error()
              }), UiRouter) : UiRouter).instance.open('adventure_log');
            }, this);
          }

          if (this.settingsBtn) {
            this.settingsBtn.node.on(Button.EventType.CLICK, () => {
              (_crd && UiRouter === void 0 ? (_reportPossibleCrUseOfUiRouter({
                error: Error()
              }), UiRouter) : UiRouter).instance.open('settings');
            }, this);
          }
        }

        _refreshTopBar() {
          var pdm = (_crd && PlayerDataManager === void 0 ? (_reportPossibleCrUseOfPlayerDataManager({
            error: Error()
          }), PlayerDataManager) : PlayerDataManager).getInstance();

          if (this.charNameLabel) {
            this.charNameLabel.string = pdm.getCharacterName() || (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.defaultName');
          }

          if (this.charClassLabel) {
            var _names$type;

            var type = pdm.getSelectedCharacterId();
            var names = {
              warrior: (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                error: Error()
              }), T) : T)('class.bearWarrior'),
              archer: (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                error: Error()
              }), T) : T)('class.deerArcher'),
              assassin: (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                error: Error()
              }), T) : T)('class.foxAssassin'),
              mage: (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                error: Error()
              }), T) : T)('class.rabbitMage'),
              berserker: (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                error: Error()
              }), T) : T)('class.boarBerserker')
            };
            this.charClassLabel.string = (_names$type = names[type]) != null ? _names$type : (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.defaultClass');
          }

          if (this.levelLabel) {
            this.levelLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.charLevel', {
              level: pdm.getCharacterLevel()
            });
          }

          if (this.soulStoneLabel) {
            this.soulStoneLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.soulStones', {
              count: pdm.getSoulStones()
            });
          }

          if (this.versionLabel) {
            this.versionLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.appVersion');
          }
        }

        _onFlowStateChanged(state) {
          if (state === (_crd && AppFlowState === void 0 ? (_reportPossibleCrUseOfAppFlowState({
            error: Error()
          }), AppFlowState) : AppFlowState).MAIN_HUB) {
            // Returning from dungeon - refresh all data
            this._refreshTopBar();
          }
        }
        /** Public: called after returning from dungeon or closing a purchase panel */


        refreshAll() {
          this._refreshTopBar();
        }

        onDestroy() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).offTarget(this);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "startBtn", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "characterBtn", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "shopBtn", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "logBtn", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "settingsBtn", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "charNameLabel", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "charClassLabel", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "levelLabel", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "soulStoneLabel", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "versionLabel", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=112cce1dc5ffd1f43f18e376924617f846be0bbf.js.map