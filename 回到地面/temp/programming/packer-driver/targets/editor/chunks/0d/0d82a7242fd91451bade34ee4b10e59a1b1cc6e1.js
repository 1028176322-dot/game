System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, tween, UIOpacity, GameConfig, eventBus, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _crd, ccclass, property, RoomTransition;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfGameConfig(extras) {
    _reporterNs.report("GameConfig", "../core/GameConfig", _context.meta, extras);
  }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
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
      tween = _cc.tween;
      UIOpacity = _cc.UIOpacity;
    }, function (_unresolved_2) {
      GameConfig = _unresolved_2.GameConfig;
    }, function (_unresolved_3) {
      eventBus = _unresolved_3.eventBus;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "0b5bdp314ZFobTiaFJDZ0Bd", "RoomTransition", undefined);
      /**
       * RoomTransition - 房间切换过渡
       * 处理房间切换的过渡动画、入口/出口逻辑
       * 战斗房不全清 → 出口关闭
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'tween', 'Vec3', 'UIOpacity']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("RoomTransition", RoomTransition = (_dec = ccclass('RoomTransition'), _dec2 = property(Node), _dec3 = property(Node), _dec(_class = (_class2 = class RoomTransition extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "roomContainer", _descriptor, this);

          // 房间内容容器（淡入淡出）
          _initializerDefineProperty(this, "doorNode", _descriptor2, this);

          // 出口门节点
          this._isTransitioning = false;
          this._isDoorOpen = false;
        }

        onLoad() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('battle:victory', this._onVictory, this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('battle:started', this._onBattleStarted, this);
        }

        onDestroy() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).offTarget(this);
        }
        /** 进入房间过渡动画 */


        enterRoom(callback) {
          var _this$roomContainer;

          if (this._isTransitioning) return;
          this._isTransitioning = true;
          this._isDoorOpen = false; // 默认出口关闭

          this._setDoorOpen(false); // 淡入动画


          const opacity = (_this$roomContainer = this.roomContainer) == null ? void 0 : _this$roomContainer.getComponent(UIOpacity);

          if (opacity) {
            opacity.opacity = 0;
            tween(opacity).to((_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).ROOM_TRANSITION_DURATION, {
              opacity: 255
            }).call(() => {
              this._isTransitioning = false;
              callback == null || callback();
            }).start();
          } else {
            this.scheduleOnce(() => {
              this._isTransitioning = false;
              callback == null || callback();
            }, (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).ROOM_TRANSITION_DURATION);
          }
        }
        /** 退出房间过渡动画 */


        exitRoom(callback) {
          var _this$roomContainer2;

          if (this._isTransitioning) return;
          this._isTransitioning = true;
          const opacity = (_this$roomContainer2 = this.roomContainer) == null ? void 0 : _this$roomContainer2.getComponent(UIOpacity);

          if (opacity) {
            tween(opacity).to((_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).ROOM_TRANSITION_DURATION, {
              opacity: 0
            }).call(() => {
              this._isTransitioning = false;
              callback == null || callback();
            }).start();
          } else {
            this.scheduleOnce(() => {
              this._isTransitioning = false;
              callback == null || callback();
            }, (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).ROOM_TRANSITION_DURATION);
          }
        }
        /** 战斗胜利 → 开启出口 */


        _onVictory() {
          this._setDoorOpen(true);
        }
        /** 战斗开始 → 关闭出口 */


        _onBattleStarted() {
          this._setDoorOpen(false);
        }

        _setDoorOpen(open) {
          this._isDoorOpen = open;

          if (this.doorNode) {
            this.doorNode.active = !open;
          }

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('room:door_changed', open);
        }

        get isTransitioning() {
          return this._isTransitioning;
        }

        get isDoorOpen() {
          return this._isDoorOpen;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "roomContainer", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "doorNode", [_dec3], {
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
//# sourceMappingURL=0d82a7242fd91451bade34ee4b10e59a1b1cc6e1.js.map