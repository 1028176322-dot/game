System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, UITransform, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _crd, ccclass, property, menu, AdventureLogPanelLayout;

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

      _cclegacy._RF.push({}, "a6eddc/7EpHA47cjT9bSl0f", "AdventureLogPanelLayout", undefined);
      /**
       * AdventureLogPanelLayout - 冒险日志面板内部布局组件
       *
       * 挂在 AdventureLogPanel/PanelRoot/PanelFrame/ContentRoot 上。
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'UITransform']);

      ({
        ccclass,
        property,
        menu
      } = _decorator);

      _export("AdventureLogPanelLayout", AdventureLogPanelLayout = (_dec = ccclass('AdventureLogPanelLayout'), _dec2 = menu('UI/AdventureLogPanelLayout'), _dec3 = property(Node), _dec4 = property(Node), _dec5 = property(Node), _dec6 = property(Node), _dec7 = property(Node), _dec8 = property(Node), _dec(_class = _dec2(_class = (_class2 = class AdventureLogPanelLayout extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "titleLabel", _descriptor, this);

          _initializerDefineProperty(this, "totalRunsLabel", _descriptor2, this);

          _initializerDefineProperty(this, "bestFloorLabel", _descriptor3, this);

          _initializerDefineProperty(this, "totalKillsLabel", _descriptor4, this);

          _initializerDefineProperty(this, "soulStonesLabel", _descriptor5, this);

          _initializerDefineProperty(this, "closeBtn", _descriptor6, this);
        }

        onEnable() {
          this.applyLayout();
        }

        applyLayout() {
          var _this$titleLabel, _this$totalRunsLabel, _this$bestFloorLabel, _this$totalKillsLabel, _this$soulStonesLabel, _this$closeBtn;

          var trans = this.node.getComponent(UITransform);
          if (!trans) return;
          var h = trans.height;
          (_this$titleLabel = this.titleLabel) == null || _this$titleLabel.setPosition(0, h / 2 - 48);
          (_this$totalRunsLabel = this.totalRunsLabel) == null || _this$totalRunsLabel.setPosition(0, h / 2 - 96);
          (_this$bestFloorLabel = this.bestFloorLabel) == null || _this$bestFloorLabel.setPosition(0, h / 2 - 132);
          (_this$totalKillsLabel = this.totalKillsLabel) == null || _this$totalKillsLabel.setPosition(0, h / 2 - 168);
          (_this$soulStonesLabel = this.soulStonesLabel) == null || _this$soulStonesLabel.setPosition(0, h / 2 - 204);
          (_this$closeBtn = this.closeBtn) == null || _this$closeBtn.setPosition(0, -h / 2 + 56);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "titleLabel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "totalRunsLabel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "bestFloorLabel", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "totalKillsLabel", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "soulStonesLabel", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "closeBtn", [_dec8], {
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
//# sourceMappingURL=5127a9770ccb8b2db860ae2818912afa1c8e8686.js.map