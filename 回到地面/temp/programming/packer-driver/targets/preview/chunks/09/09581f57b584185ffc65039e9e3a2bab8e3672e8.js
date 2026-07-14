System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Button, Component, Label, eventBus, WXAdapter, T, _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, MainUI;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfWXAdapter(extras) {
    _reporterNs.report("WXAdapter", "../utils/WXAdapter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfT(extras) {
    _reporterNs.report("T", "../core/TextManager", _context.meta, extras);
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
      Label = _cc.Label;
    }, function (_unresolved_2) {
      eventBus = _unresolved_2.eventBus;
    }, function (_unresolved_3) {
      WXAdapter = _unresolved_3.WXAdapter;
    }, function (_unresolved_4) {
      T = _unresolved_4.T;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "6f234To5uFMxqboL70sNxvM", "MainUI", undefined);
      /**
       * MainUI - main scene UI interaction
       * Displays the start button and main UI text.
       */


      __checkObsolete__(['_decorator', 'Button', 'Component', 'Label']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("MainUI", MainUI = (_dec = ccclass('MainUI'), _dec2 = property(Button), _dec3 = property(Button), _dec4 = property(Button), _dec5 = property(Label), _dec(_class = (_class2 = class MainUI extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "startButton", _descriptor, this);

          _initializerDefineProperty(this, "shopButton", _descriptor2, this);

          _initializerDefineProperty(this, "settingsButton", _descriptor3, this);

          _initializerDefineProperty(this, "versionLabel", _descriptor4, this);
        }

        onLoad() {
          if (this.versionLabel) {
            this.versionLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.version');
          }

          if (!this.startButton) {
            var _this$node$getChildBy, _this$node$getChildBy2;

            this.startButton = (_this$node$getChildBy = (_this$node$getChildBy2 = this.node.getChildByName('StartButton')) == null ? void 0 : _this$node$getChildBy2.getComponent(Button)) != null ? _this$node$getChildBy : null;
          }

          if (this.startButton) {
            this.startButton.node.on(Button.EventType.CLICK, this._onStartTap, this);
          } else {
            console.warn('[MainUI] startButton is not assigned');
          }

          if (this.shopButton) {
            this.shopButton.node.on(Button.EventType.CLICK, this._onShopTap, this);
          }

          if (this.settingsButton) {
            this.settingsButton.node.on(Button.EventType.CLICK, this._onSettingsTap, this);
          }

          (_crd && WXAdapter === void 0 ? (_reportPossibleCrUseOfWXAdapter({
            error: Error()
          }), WXAdapter) : WXAdapter).getInstance().showBanner();
        }

        onStartClick() {
          (_crd && WXAdapter === void 0 ? (_reportPossibleCrUseOfWXAdapter({
            error: Error()
          }), WXAdapter) : WXAdapter).getInstance().hideBanner();
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('ui:open_area_select');
        }

        onShopClick() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('ui:open_shop');
        }

        onSettingsClick() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('ui:open_settings');
        }

        onDestroy() {
          if (this.startButton) {
            this.startButton.node.off(Button.EventType.CLICK, this._onStartTap, this);
          }

          if (this.shopButton) {
            this.shopButton.node.off(Button.EventType.CLICK, this._onShopTap, this);
          }

          if (this.settingsButton) {
            this.settingsButton.node.off(Button.EventType.CLICK, this._onSettingsTap, this);
          }

          (_crd && WXAdapter === void 0 ? (_reportPossibleCrUseOfWXAdapter({
            error: Error()
          }), WXAdapter) : WXAdapter).getInstance().showBanner();
        }

        _onStartTap() {
          this.onStartClick();
        }

        _onShopTap() {
          this.onShopClick();
        }

        _onSettingsTap() {
          this.onSettingsClick();
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "startButton", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "shopButton", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "settingsButton", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "versionLabel", [_dec5], {
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
//# sourceMappingURL=09581f57b584185ffc65039e9e3a2bab8e3672e8.js.map