System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, UITransform, view, Vec3, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, menu, SplashLayout;

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
      view = _cc.view;
      Vec3 = _cc.Vec3;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "1492d9BOUtHkJNNbuWKQoeT", "SplashLayout", undefined);
      /**
       * SplashLayout - 启动页自适应布局组件
       *
       * 挂载在 Canvas/SplashUI 上。
       * 负责 SplashImage 居中、LoadingBar 底部安全区定位、
       * SkipButton 右上角定位。
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'UITransform', 'view', 'Vec3']);

      ({
        ccclass,
        property,
        menu
      } = _decorator);

      _export("SplashLayout", SplashLayout = (_dec = ccclass('SplashLayout'), _dec2 = menu('UI/SplashLayout'), _dec3 = property(Node), _dec4 = property(Node), _dec5 = property(Node), _dec6 = property(Node), _dec(_class = _dec2(_class = (_class2 = class SplashLayout extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "splashImage", _descriptor, this);

          _initializerDefineProperty(this, "loadingBar", _descriptor2, this);

          _initializerDefineProperty(this, "loadingLabel", _descriptor3, this);

          _initializerDefineProperty(this, "skipButton", _descriptor4, this);
        }

        onLoad() {
          this.applyLayout();
          view.on('canvas-resize', this.applyLayout, this);
          view.on('design-resolution-changed', this.applyLayout, this);
        }

        onDestroy() {
          view.off('canvas-resize', this.applyLayout, this);
          view.off('design-resolution-changed', this.applyLayout, this);
        }

        applyLayout() {
          var size = view.getVisibleSize();
          var halfW = size.width / 2;
          var halfH = size.height / 2;
          var margin = 36;
          var rootTrans = this.node.getComponent(UITransform);

          if (rootTrans) {
            rootTrans.setContentSize(size.width, size.height);
          }

          if (this.splashImage) {
            this.splashImage.setPosition(Vec3.ZERO);
          }

          if (this.loadingBar) {
            this.loadingBar.setPosition(0, -halfH + 96, 0);
          }

          if (this.loadingLabel) {
            this.loadingLabel.setPosition(0, -halfH + 58, 0);
          }

          if (this.skipButton) {
            this.skipButton.setPosition(halfW - margin - 60, halfH - margin - 24, 0);
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "splashImage", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "loadingBar", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "loadingLabel", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "skipButton", [_dec6], {
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
//# sourceMappingURL=599df401c835c64905297504e69ca87fe6b6b644.js.map