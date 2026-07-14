System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, UITransform, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _crd, ccclass, property, menu, SettlementPanelLayout;

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

      _cclegacy._RF.push({}, "5d0a7obBJFCEa2QNj/5GNTt", "SettlementPanelLayout", undefined);
      /**
       * SettlementPanelLayout - 结算面板内部布局组件
       *
       * 挂在 SettlementPanel/PanelRoot/PanelFrame/ContentRoot 上。
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'UITransform']);

      ({
        ccclass,
        property,
        menu
      } = _decorator);

      _export("SettlementPanelLayout", SettlementPanelLayout = (_dec = ccclass('SettlementPanelLayout'), _dec2 = menu('UI/SettlementPanelLayout'), _dec3 = property(Node), _dec4 = property(Node), _dec5 = property(Node), _dec6 = property(Node), _dec7 = property(Node), _dec8 = property(Node), _dec9 = property(Node), _dec10 = property(Node), _dec(_class = _dec2(_class = (_class2 = class SettlementPanelLayout extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "titleLabel", _descriptor, this);

          _initializerDefineProperty(this, "zoneLabel", _descriptor2, this);

          _initializerDefineProperty(this, "floorLabel", _descriptor3, this);

          _initializerDefineProperty(this, "killLabel", _descriptor4, this);

          _initializerDefineProperty(this, "soulStoneLabel", _descriptor5, this);

          _initializerDefineProperty(this, "timeLabel", _descriptor6, this);

          _initializerDefineProperty(this, "doubleBtn", _descriptor7, this);

          _initializerDefineProperty(this, "backBtn", _descriptor8, this);
        }

        onEnable() {
          this.applyLayout();
        }

        applyLayout() {
          var _this$titleLabel, _this$zoneLabel, _this$floorLabel, _this$killLabel, _this$soulStoneLabel, _this$timeLabel, _this$doubleBtn, _this$backBtn;

          const trans = this.node.getComponent(UITransform);
          if (!trans) return;
          const h = trans.height;
          (_this$titleLabel = this.titleLabel) == null || _this$titleLabel.setPosition(0, h / 2 - 48);
          (_this$zoneLabel = this.zoneLabel) == null || _this$zoneLabel.setPosition(0, h / 2 - 96);
          (_this$floorLabel = this.floorLabel) == null || _this$floorLabel.setPosition(0, h / 2 - 132);
          (_this$killLabel = this.killLabel) == null || _this$killLabel.setPosition(0, h / 2 - 168);
          (_this$soulStoneLabel = this.soulStoneLabel) == null || _this$soulStoneLabel.setPosition(0, h / 2 - 204);
          (_this$timeLabel = this.timeLabel) == null || _this$timeLabel.setPosition(0, h / 2 - 240);
          (_this$doubleBtn = this.doubleBtn) == null || _this$doubleBtn.setPosition(-80, -h / 2 + 56);
          (_this$backBtn = this.backBtn) == null || _this$backBtn.setPosition(80, -h / 2 + 56);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "titleLabel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "zoneLabel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "floorLabel", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "killLabel", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "soulStoneLabel", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "timeLabel", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "doubleBtn", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "backBtn", [_dec10], {
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
//# sourceMappingURL=86ae41f4db27be7553a382300cf7e55d8cd1f88b.js.map