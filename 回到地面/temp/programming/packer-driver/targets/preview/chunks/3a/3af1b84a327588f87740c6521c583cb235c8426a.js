System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, UITransform, view, Vec3, _dec, _dec2, _class, _crd, ccclass, menu, ResponsiveUIRoot;

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      UITransform = _cc.UITransform;
      view = _cc.view;
      Vec3 = _cc.Vec3;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "e88f6ePimNCRLLNtc7V/u19", "ResponsiveUIRoot", undefined);
      /**
       * ResponsiveUIRoot - 地牢场景 UIRoot 自适应组件
       *
       * 挂载在 Canvas/UIRoot 上。
       * 让 UIRoot 自动铺满可视区域，替代手写 1280x720 固定尺寸。
       */


      __checkObsolete__(['_decorator', 'Component', 'UITransform', 'view', 'Vec3']);

      ({
        ccclass,
        menu
      } = _decorator);

      _export("ResponsiveUIRoot", ResponsiveUIRoot = (_dec = ccclass('ResponsiveUIRoot'), _dec2 = menu('UI/ResponsiveUIRoot'), _dec(_class = _dec2(_class = class ResponsiveUIRoot extends Component {
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
          var uiTransform = this.node.getComponent(UITransform);

          if (uiTransform) {
            uiTransform.setContentSize(size.width, size.height);
          }

          this.node.setPosition(Vec3.ZERO);
        }

      }) || _class) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=3af1b84a327588f87740c6521c583cb235c8426a.js.map