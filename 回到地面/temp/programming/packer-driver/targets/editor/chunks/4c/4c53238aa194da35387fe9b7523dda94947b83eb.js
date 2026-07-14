System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Color, Component, Graphics, Node, Sprite, UITransform, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _crd, ccclass, property, MonsterRuntimeView;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Color = _cc.Color;
      Component = _cc.Component;
      Graphics = _cc.Graphics;
      Node = _cc.Node;
      Sprite = _cc.Sprite;
      UITransform = _cc.UITransform;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "155ff61MotH3aGgHIqZVwOg", "MonsterRuntimeView", undefined);

      __checkObsolete__(['_decorator', 'Color', 'Component', 'Graphics', 'Node', 'Sprite', 'UITransform']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("MonsterRuntimeView", MonsterRuntimeView = (_dec = ccclass('MonsterRuntimeView'), _dec2 = property(Sprite), _dec3 = property(Node), _dec4 = property(Node), _dec5 = property(Node), _dec6 = property(Node), _dec(_class = (_class2 = class MonsterRuntimeView extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "bodySprite", _descriptor, this);

          _initializerDefineProperty(this, "hpBar", _descriptor2, this);

          _initializerDefineProperty(this, "hpFill", _descriptor3, this);

          _initializerDefineProperty(this, "effectSocket", _descriptor4, this);

          _initializerDefineProperty(this, "shadow", _descriptor5, this);

          this._hpBarWidth = 80;
          this._hpBarHeight = 8;
        }

        initRefs(bodySprite, hpBar, hpFill, effectSocket, shadow) {
          this.bodySprite = bodySprite;
          this.hpBar = hpBar;
          this.hpFill = hpFill;
          this.effectSocket = effectSocket;
          this.shadow = shadow;
          this.setHP(1, 1);
        }

        setHP(current, max) {
          if (!this.hpFill) return;
          const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
          const transform = this.hpFill.getComponent(UITransform);

          if (transform) {
            transform.setContentSize(this._hpBarWidth * ratio, this._hpBarHeight);
          }

          this._drawFill(ratio);
        }

        showHP(visible) {
          if (this.hpBar) this.hpBar.active = visible;
        }

        flashHit() {
          if (!this.bodySprite) return;
          this.bodySprite.color = new Color(255, 220, 220, 255);
          this.scheduleOnce(() => {
            if (this.bodySprite && this.bodySprite.node.isValid) {
              this.bodySprite.color = Color.WHITE;
            }
          }, 0.08);
        }

        _drawFill(ratio) {
          if (!this.hpFill) return;
          const graphics = this.hpFill.getComponent(Graphics);
          if (!graphics) return;
          graphics.clear();
          graphics.fillColor = ratio > 0.35 ? new Color(85, 220, 105, 230) : new Color(245, 170, 60, 230);
          graphics.rect(-this._hpBarWidth / 2, -this._hpBarHeight / 2, this._hpBarWidth * ratio, this._hpBarHeight);
          graphics.fill();
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "bodySprite", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "hpBar", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "hpFill", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "effectSocket", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "shadow", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=4c53238aa194da35387fe9b7523dda94947b83eb.js.map