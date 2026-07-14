System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, input, Input, Vec2, Vec3, UITransform, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _crd, ccclass, property, JoystickDirection, VirtualJoystick;

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
      input = _cc.input;
      Input = _cc.Input;
      Vec2 = _cc.Vec2;
      Vec3 = _cc.Vec3;
      UITransform = _cc.UITransform;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "50d599BjiNCDr3uyjTMYiNP", "VirtualJoystick", undefined);
      /**
       * VirtualJoystick - 虚拟摇杆
       * 左半屏触摸/鼠标区域，输入延迟 < 50ms
       * 不直接操作游戏数据，仅转发输入方向
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'EventTouch', 'Touch', 'input', 'Input', 'Vec2', 'Vec3', 'tween', 'UITransform']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("JoystickDirection", JoystickDirection = /*#__PURE__*/function (JoystickDirection) {
        JoystickDirection["None"] = "none";
        JoystickDirection["Up"] = "up";
        JoystickDirection["Down"] = "down";
        JoystickDirection["Left"] = "left";
        JoystickDirection["Right"] = "right";
        JoystickDirection["UpLeft"] = "upLeft";
        JoystickDirection["UpRight"] = "upRight";
        JoystickDirection["DownLeft"] = "downLeft";
        JoystickDirection["DownRight"] = "downRight";
        return JoystickDirection;
      }({}));

      _export("VirtualJoystick", VirtualJoystick = (_dec = ccclass('VirtualJoystick'), _dec2 = property(Node), _dec3 = property(Node), _dec(_class = (_class2 = class VirtualJoystick extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "joystickBg", _descriptor, this);

          // 摇杆背景（编辑器拖入）
          _initializerDefineProperty(this, "joystickThumb", _descriptor2, this);

          // 摇杆摇钮（编辑器拖入）
          this._maxRadius = 50;
          this._touchId = null;
          this._isActive = false;
          this._currentDirection = JoystickDirection.None;
          this._centerPos = new Vec3(0, 0, 0);
          this._onMoveCallback = null;
          this._onEndCallback = null;
        }

        /** 设置移动回调 */
        setMoveCallback(cb) {
          this._onMoveCallback = cb;
        }
        /** 设置结束回调 */


        setEndCallback(cb) {
          this._onEndCallback = cb;
        }

        onLoad() {
          this._centerPos = this.node.getPosition();

          this._registerInput();
        }

        _registerInput() {
          input.on(Input.EventType.TOUCH_START, this._onTouchStart, this);
          input.on(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
          input.on(Input.EventType.TOUCH_END, this._onTouchEnd, this);
          input.on(Input.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
        }

        onDestroy() {
          input.off(Input.EventType.TOUCH_START, this._onTouchStart, this);
          input.off(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
          input.off(Input.EventType.TOUCH_END, this._onTouchEnd, this);
          input.off(Input.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
        }

        _onTouchStart(touch, event) {
          var _this$node$parent$get, _this$node$parent;

          if (this._touchId !== null) return; // 已有一个触摸

          var uiPos = touch.getUILocation();
          var halfW = (_this$node$parent$get = (_this$node$parent = this.node.parent) == null || (_this$node$parent = _this$node$parent.getComponent(UITransform)) == null ? void 0 : _this$node$parent.width) != null ? _this$node$parent$get : 720; // 只处理左半屏触摸

          if (uiPos.x > halfW / 2) return;
          this._touchId = touch.getID();
          this._isActive = true;

          this._updateFromTouch(touch);
        }

        _onTouchMove(touch, event) {
          if (touch.getID() !== this._touchId) return;

          this._updateFromTouch(touch);
        }

        _onTouchEnd(touch, event) {
          var _this$_onEndCallback;

          if (touch.getID() !== this._touchId) return;

          this._reset();

          (_this$_onEndCallback = this._onEndCallback) == null || _this$_onEndCallback.call(this);
        }

        _updateFromTouch(touch) {
          var _this$_onMoveCallback;

          if (!this.joystickThumb || !this.joystickBg) return;
          var touchPos = touch.getUILocation();
          var bgWorldPos = this.joystickBg.getWorldPosition();
          var bgTransform = this.joystickBg.getComponent(UITransform);
          if (!bgTransform) return; // 计算偏移

          var offsetX = touchPos.x - bgWorldPos.x;
          var offsetY = touchPos.y - bgWorldPos.y;
          var distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY); // 限制在最大半径内

          var clampedX = offsetX;
          var clampedY = offsetY;
          var normalizedX = distance > 0 ? offsetX / distance : 0;
          var normalizedY = distance > 0 ? offsetY / distance : 0;
          var thumbX = clampedX;
          var thumbY = clampedY;

          if (distance > this._maxRadius) {
            thumbX = normalizedX * this._maxRadius;
            thumbY = normalizedY * this._maxRadius;
          }

          this.joystickThumb.setPosition(thumbX, thumbY, 0); // 计算方向

          var direction = this._getDirection(normalizedX, normalizedY);

          this._currentDirection = direction; // 回调

          (_this$_onMoveCallback = this._onMoveCallback) == null || _this$_onMoveCallback.call(this, {
            direction,
            normalized: new Vec2(normalizedX, normalizedY),
            raw: new Vec2(offsetX, offsetY),
            isActive: true
          });
        }

        _getDirection(nx, ny) {
          var absX = Math.abs(nx);
          var absY = Math.abs(ny);
          var threshold = 0.3;
          if (absX < threshold && absY < threshold) return JoystickDirection.None; // 4 方向判定（取幅度大的方向）

          if (absX > absY) {
            return nx > 0 ? JoystickDirection.Right : JoystickDirection.Left;
          } else {
            return ny > 0 ? JoystickDirection.Up : JoystickDirection.Down;
          }
        }

        _reset() {
          this._touchId = null;
          this._isActive = false;
          this._currentDirection = JoystickDirection.None;

          if (this.joystickThumb) {
            this.joystickThumb.setPosition(Vec3.ZERO);
          }
        }

        get isActive() {
          return this._isActive;
        }

        get currentDirection() {
          return this._currentDirection;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "joystickBg", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "joystickThumb", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=29cd7d95a600fa4de1f67fb552072f1272e10c5e.js.map