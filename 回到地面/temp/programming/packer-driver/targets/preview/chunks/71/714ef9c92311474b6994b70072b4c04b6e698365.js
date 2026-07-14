System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, UITransform, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, menu, SettingsPanelLayout;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Node = _cc.Node;
      UITransform = _cc.UITransform;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "c5b7e/aKNJE5pzN2oFRxrnQ", "SettingsPanelLayout", undefined);
      /**
       * SettingsPanelLayout - 设置面板内部布局组件
       *
       * 挂在 SettingsPanel/PanelRoot/PanelFrame/ContentRoot 上。
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'UITransform']);

      ({
        ccclass,
        property,
        menu
      } = _decorator);

      _export("SettingsPanelLayout", SettingsPanelLayout = (_dec = ccclass('SettingsPanelLayout'), _dec2 = menu('UI/SettingsPanelLayout'), _dec3 = property(Node), _dec4 = property(Node), _dec5 = property(Node), _dec6 = property(Node), _dec(_class = _dec2(_class = (_class2 = class SettingsPanelLayout extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "versionLabel", _descriptor, this);

          _initializerDefineProperty(this, "accountLabel", _descriptor2, this);

          _initializerDefineProperty(this, "resetBtn", _descriptor3, this);

          _initializerDefineProperty(this, "closeBtn", _descriptor4, this);
        }

        onEnable() {
          this.applyLayout();
        }

        applyLayout() {
          var _this$versionLabel, _this$accountLabel, _this$resetBtn, _this$closeBtn;

          var trans = this.node.getComponent(UITransform);
          if (!trans) return;
          var h = trans.height;
          (_this$versionLabel = this.versionLabel) == null || _this$versionLabel.setPosition(0, h / 2 - 48);
          (_this$accountLabel = this.accountLabel) == null || _this$accountLabel.setPosition(0, h / 2 - 88);
          (_this$resetBtn = this.resetBtn) == null || _this$resetBtn.setPosition(0, 20);
          (_this$closeBtn = this.closeBtn) == null || _this$closeBtn.setPosition(0, -h / 2 + 56);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "versionLabel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "accountLabel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "resetBtn", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "closeBtn", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=714ef9c92311474b6994b70072b4c04b6e698365.js.map