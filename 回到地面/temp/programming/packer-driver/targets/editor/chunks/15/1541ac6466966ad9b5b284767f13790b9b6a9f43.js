System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, UITransform, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _crd, ccclass, property, menu, AreaSelectPanelLayout;

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

      _cclegacy._RF.push({}, "ca3f1kvOIJDDo9Z5vyfZPJ7", "AreaSelectPanelLayout", undefined);
      /**
       * AreaSelectPanelLayout - 区域选择面板内部布局组件
       *
       * 挂在 AreaSelectPanel/PanelRoot/PanelFrame/ContentRoot 上。
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'UITransform']);

      ({
        ccclass,
        property,
        menu
      } = _decorator);

      _export("AreaSelectPanelLayout", AreaSelectPanelLayout = (_dec = ccclass('AreaSelectPanelLayout'), _dec2 = menu('UI/AreaSelectPanelLayout'), _dec3 = property(Node), _dec4 = property(Node), _dec5 = property(Node), _dec6 = property(Node), _dec7 = property(Node), _dec8 = property(Node), _dec(_class = _dec2(_class = (_class2 = class AreaSelectPanelLayout extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "titleLabel", _descriptor, this);

          _initializerDefineProperty(this, "playerInfo", _descriptor2, this);

          _initializerDefineProperty(this, "routeContainer", _descriptor3, this);

          _initializerDefineProperty(this, "lockedContainer", _descriptor4, this);

          _initializerDefineProperty(this, "startBtn", _descriptor5, this);

          _initializerDefineProperty(this, "backBtn", _descriptor6, this);
        }

        onEnable() {
          this.applyLayout();
        }

        applyLayout() {
          var _this$titleLabel, _this$playerInfo, _this$routeContainer, _this$lockedContainer, _this$startBtn, _this$backBtn;

          const trans = this.node.getComponent(UITransform);
          if (!trans) return;
          const h = trans.height;
          (_this$titleLabel = this.titleLabel) == null || _this$titleLabel.setPosition(0, h / 2 - 48);
          (_this$playerInfo = this.playerInfo) == null || _this$playerInfo.setPosition(0, h / 2 - 88);
          (_this$routeContainer = this.routeContainer) == null || _this$routeContainer.setPosition(0, 40);
          (_this$lockedContainer = this.lockedContainer) == null || _this$lockedContainer.setPosition(0, -60);
          (_this$startBtn = this.startBtn) == null || _this$startBtn.setPosition(-80, -h / 2 + 56);
          (_this$backBtn = this.backBtn) == null || _this$backBtn.setPosition(80, -h / 2 + 56);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "titleLabel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "playerInfo", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "routeContainer", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "lockedContainer", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "startBtn", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "backBtn", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      })), _class2)) || _class) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=1541ac6466966ad9b5b284767f13790b9b6a9f43.js.map