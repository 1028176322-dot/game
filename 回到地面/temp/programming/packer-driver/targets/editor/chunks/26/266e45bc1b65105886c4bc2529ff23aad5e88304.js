System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, UITransform, Vec3, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _descriptor3, _crd, ccclass, property, menu, ResponsivePanelContent;

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
      Vec3 = _cc.Vec3;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "8e754npL4BN1Yp8t9TS0aXS", "ResponsivePanelContent", undefined);
      /**
       * ResponsivePanelContent - 内容区自适应组件
       *
       * 挂载在 PanelFrame/ContentRoot 上。
       * 根据 PanelFrame 尺寸自动计算 ContentRoot 大小，保留 padding。
       *
       * 用法：
       *   拖入 PanelFrame 引用，设 paddingX / paddingY。
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'UITransform', 'Vec3']);

      ({
        ccclass,
        property,
        menu
      } = _decorator);

      _export("ResponsivePanelContent", ResponsivePanelContent = (_dec = ccclass('ResponsivePanelContent'), _dec2 = menu('UI/ResponsivePanelContent'), _dec3 = property(Node), _dec(_class = _dec2(_class = (_class2 = class ResponsivePanelContent extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "panelFrame", _descriptor, this);

          _initializerDefineProperty(this, "paddingX", _descriptor2, this);

          _initializerDefineProperty(this, "paddingY", _descriptor3, this);
        }

        onLoad() {
          this.applyLayout();
        }

        onEnable() {
          this.applyLayout();
        }

        applyLayout() {
          var _this$panelFrame;

          const frame = (_this$panelFrame = this.panelFrame) != null ? _this$panelFrame : this.node.parent;
          if (!frame) return;
          const frameTrans = frame.getComponent(UITransform);
          const contentTrans = this.node.getComponent(UITransform);
          if (!frameTrans || !contentTrans) return;
          const width = Math.max(0, frameTrans.width - this.paddingX * 2);
          const height = Math.max(0, frameTrans.height - this.paddingY * 2);
          contentTrans.setContentSize(width, height);
          this.node.setPosition(Vec3.ZERO); // Trigger child layout components on the same node

          const components = this.node.components;

          for (const comp of components) {
            if (comp === this) continue;

            if (typeof comp.applyLayout === 'function') {
              comp.applyLayout();
            }
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "panelFrame", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "paddingX", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 48;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "paddingY", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 56;
        }
      })), _class2)) || _class) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=266e45bc1b65105886c4bc2529ff23aad5e88304.js.map