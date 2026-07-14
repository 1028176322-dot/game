System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, UITransform, view, Vec3, clamp, Sprite, ResponsivePanelContent, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _crd, ccclass, property, menu, ResponsivePanelRoot;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfResponsivePanelContent(extras) {
    _reporterNs.report("ResponsivePanelContent", "./ResponsivePanelContent", _context.meta, extras);
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
      Node = _cc.Node;
      UITransform = _cc.UITransform;
      view = _cc.view;
      Vec3 = _cc.Vec3;
      clamp = _cc.clamp;
      Sprite = _cc.Sprite;
    }, function (_unresolved_2) {
      ResponsivePanelContent = _unresolved_2.ResponsivePanelContent;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "06306+obCdLVKq+FxoKdj/2", "ResponsivePanelRoot", undefined);
      /**
       * ResponsivePanelRoot - 自适应面板布局组件
       *
       * 作用：
       *   让 UIPanel 的 PanelRoot 在不同分辨率下自动适配。
       *   DimMask 铺满全屏，PanelFrame 按比例缩放并限制最大/最小值。
       *   布局后触发 ResponsivePanelContent 刷新内容区尺寸。
       *
       * 用法：
       *   挂到每个 UIPanel 的 PanelRoot 节点上。
       *   拖入 DimMask 和 PanelFrame 引用。
       *   不同面板调整 frameWidthRatio / frameHeightRatio 等参数。
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'UITransform', 'view', 'Vec3', 'clamp', 'Sprite']);

      ({
        ccclass,
        property,
        menu
      } = _decorator);

      _export("ResponsivePanelRoot", ResponsivePanelRoot = (_dec = ccclass('ResponsivePanelRoot'), _dec2 = menu('UI/ResponsivePanelRoot'), _dec3 = property(Node), _dec4 = property(Node), _dec5 = property({
        tooltip: 'PanelFrame 宽度占父节点的比例'
      }), _dec6 = property({
        tooltip: 'PanelFrame 高度占父节点的比例'
      }), _dec(_class = _dec2(_class = (_class2 = class ResponsivePanelRoot extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "dimMask", _descriptor, this);

          _initializerDefineProperty(this, "panelFrame", _descriptor2, this);

          _initializerDefineProperty(this, "frameWidthRatio", _descriptor3, this);

          _initializerDefineProperty(this, "frameHeightRatio", _descriptor4, this);

          _initializerDefineProperty(this, "maxFrameWidth", _descriptor5, this);

          _initializerDefineProperty(this, "maxFrameHeight", _descriptor6, this);

          _initializerDefineProperty(this, "minFrameWidth", _descriptor7, this);

          _initializerDefineProperty(this, "minFrameHeight", _descriptor8, this);
        }

        onLoad() {
          this.applyLayout();
          view.on('canvas-resize', this.applyLayout, this);
          view.on('design-resolution-changed', this.applyLayout, this);
        }

        onEnable() {
          // Enable DimMask and PanelFrame Sprites disabled in scene file
          // (disabled to avoid white triangle placeholder in editor when spriteFrame is null).
          // Engine renders correctly at runtime with default white texture + color tint.
          if (this.dimMask) {
            const sprite = this.dimMask.getComponent(Sprite);
            if (sprite && !sprite.enabled) sprite.enabled = true;
          }

          if (this.panelFrame) {
            const sprite = this.panelFrame.getComponent(Sprite);
            if (sprite && !sprite.enabled) sprite.enabled = true;
          }

          this.applyLayout(); // Delayed re-apply in case view size is not ready during the first frame

          this.scheduleOnce(() => this.applyLayout(), 0);
        }

        onDestroy() {
          view.off('canvas-resize', this.applyLayout, this);
          view.off('design-resolution-changed', this.applyLayout, this);
          this.unscheduleAllCallbacks();
        }

        applyLayout() {
          const visible = view.getVisibleSize();
          let canvasW = visible.width;
          let canvasH = visible.height;
          const parent = this.node.parent;
          const parentTrans = parent == null ? void 0 : parent.getComponent(UITransform);

          if (parentTrans && parentTrans.width > 100 && parentTrans.height > 100) {
            canvasW = parentTrans.width;
            canvasH = parentTrans.height;
          } // Fallback: if view is not ready, use design resolution baseline


          if (canvasW < 100 || canvasH < 100) {
            canvasW = 1280;
            canvasH = 720;
          }

          const rootTrans = this.node.getComponent(UITransform);

          if (rootTrans) {
            rootTrans.setContentSize(canvasW, canvasH);
          }

          this.node.setPosition(Vec3.ZERO); // DimMask = 全屏

          if (this.dimMask) {
            const maskTrans = this.dimMask.getComponent(UITransform);

            if (maskTrans) {
              maskTrans.setContentSize(canvasW, canvasH);
            }

            this.dimMask.setPosition(Vec3.ZERO);
          } // PanelFrame = 比例缩放 + clamp


          if (this.panelFrame) {
            const frameTrans = this.panelFrame.getComponent(UITransform);

            if (frameTrans) {
              const w = clamp(canvasW * this.frameWidthRatio, this.minFrameWidth, this.maxFrameWidth);
              const h = clamp(canvasH * this.frameHeightRatio, this.minFrameHeight, this.maxFrameHeight);
              frameTrans.setContentSize(w, h);
            }

            this.panelFrame.setPosition(Vec3.ZERO); // 触发 ContentRoot 重新布局

            const content = this.panelFrame.getChildByName('ContentRoot');

            if (content) {
              const contentComp = content.getComponent(_crd && ResponsivePanelContent === void 0 ? (_reportPossibleCrUseOfResponsivePanelContent({
                error: Error()
              }), ResponsivePanelContent) : ResponsivePanelContent);

              if (contentComp) {
                contentComp.applyLayout();
              }
            }
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "dimMask", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "panelFrame", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "frameWidthRatio", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.72;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "frameHeightRatio", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0.78;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "maxFrameWidth", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 900;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "maxFrameHeight", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 620;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "minFrameWidth", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 520;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "minFrameHeight", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 360;
        }
      })), _class2)) || _class) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=4651c25dbb2ec32e03e975440d8576adccd7131a.js.map