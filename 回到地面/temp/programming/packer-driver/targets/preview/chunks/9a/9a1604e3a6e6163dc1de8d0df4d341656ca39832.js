System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, CCInteger, Component, Node, UITransform, clamp, _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _crd, ccclass, property, menu, VerticalPanelLayout;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      CCInteger = _cc.CCInteger;
      Component = _cc.Component;
      Node = _cc.Node;
      UITransform = _cc.UITransform;
      clamp = _cc.clamp;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "b82fbHPjIVLSJQe0oQvxu89", "VerticalPanelLayout", undefined);
      /**
       * Generic vertical zone layout.
       *
       * Mount on ContentRoot. The component positions zone nodes from top to bottom.
       * If available height is smaller than the requested layout, it scales zone
       * heights and gaps down together instead of letting zones overlap.
       */


      __checkObsolete__(['_decorator', 'CCInteger', 'Component', 'Node', 'UITransform', 'clamp']);

      ({
        ccclass,
        property,
        menu
      } = _decorator);

      _export("VerticalPanelLayout", VerticalPanelLayout = (_dec = ccclass('VerticalPanelLayout'), _dec2 = menu('UI/VerticalPanelLayout'), _dec3 = property([Node]), _dec4 = property({
        type: [CCInteger]
      }), _dec(_class = _dec2(_class = (_class2 = class VerticalPanelLayout extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "zones", _descriptor, this);

          _initializerDefineProperty(this, "heights", _descriptor2, this);

          _initializerDefineProperty(this, "gap", _descriptor3, this);

          _initializerDefineProperty(this, "paddingTop", _descriptor4, this);

          _initializerDefineProperty(this, "paddingBottom", _descriptor5, this);
        }

        applyLayout() {
          var rootTrans = this.node.getComponent(UITransform);
          if (!rootTrans) return;
          var totalH = rootTrans.height;
          var totalW = rootTrans.width;
          var count = Math.min(this.zones.length, this.heights.length);
          if (count <= 0) return;
          var requestedH = this.paddingTop + this.paddingBottom;

          for (var i = 0; i < count; i++) {
            var _this$heights$i;

            requestedH += (_this$heights$i = this.heights[i]) != null ? _this$heights$i : 0;
          }

          requestedH += Math.max(0, count - 1) * this.gap;
          var scale = requestedH > 0 ? clamp(totalH / requestedH, 0.45, 1) : 1;
          var gap = this.gap * scale;
          var paddingTop = this.paddingTop * scale;
          var y = totalH / 2 - paddingTop;

          for (var _i = 0; _i < count; _i++) {
            var _this$heights$_i;

            var zone = this.zones[_i];
            if (!zone) continue;
            var h = ((_this$heights$_i = this.heights[_i]) != null ? _this$heights$_i : 0) * scale;
            var trans = zone.getComponent(UITransform);

            if (trans) {
              trans.setContentSize(totalW, h);
            }

            y -= h / 2;
            zone.setPosition(0, y);
            y -= h / 2 + gap;
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "zones", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "heights", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "gap", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 10;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "paddingTop", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 18;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "paddingBottom", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 18;
        }
      })), _class2)) || _class) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=9a1604e3a6e6163dc1de8d0df4d341656ca39832.js.map