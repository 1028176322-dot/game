System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, view, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, menu, DungeonHudLayout;

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
      view = _cc.view;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "4180biOYqVBOq/CoHbj8LbF", "DungeonHudLayout", undefined);
      /**
       * DungeonHudLayout - 地牢 HUD 四角布局组件
       *
       * 挂载在 UIRoot 上。
       * 负责 BattleHUD（左上）、Joystick（左下）、
       * SkillUI（右下）、DungeonMapUI（右上）的定位。
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'view']);

      ({
        ccclass,
        property,
        menu
      } = _decorator);

      _export("DungeonHudLayout", DungeonHudLayout = (_dec = ccclass('DungeonHudLayout'), _dec2 = menu('UI/DungeonHudLayout'), _dec3 = property(Node), _dec4 = property(Node), _dec5 = property(Node), _dec6 = property(Node), _dec(_class = _dec2(_class = (_class2 = class DungeonHudLayout extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "battleHUD", _descriptor, this);

          _initializerDefineProperty(this, "joystick", _descriptor2, this);

          _initializerDefineProperty(this, "skillUI", _descriptor3, this);

          _initializerDefineProperty(this, "dungeonMapUI", _descriptor4, this);
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

          if (this.battleHUD) {
            this.battleHUD.setPosition(-halfW + margin + 120, halfH - margin - 40);
          }

          if (this.joystick) {
            this.joystick.setPosition(-halfW + margin + 120, -halfH + margin + 120);
          }

          if (this.skillUI) {
            this.skillUI.setPosition(halfW - margin - 180, -halfH + margin + 90);
          }

          if (this.dungeonMapUI) {
            this.dungeonMapUI.setPosition(halfW - margin - 180, halfH - margin - 120);
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "battleHUD", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "joystick", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "skillUI", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "dungeonMapUI", [_dec6], {
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
//# sourceMappingURL=17e0a8dcac177ab51727eb2f08f45043e1ba20c2.js.map