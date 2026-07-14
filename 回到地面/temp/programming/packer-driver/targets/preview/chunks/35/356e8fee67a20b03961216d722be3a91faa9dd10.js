System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Button, Label, tween, UITransform, Color, Vec3, Prefab, eventBus, AdPlacement, WXAdapter, SaveService, LEGACY_KEYS, T, _dec, _dec2, _class, _class2, _descriptor, _crd, ccclass, property, MAX_LIGHTS, MarqueeUI;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAdPlacement(extras) {
    _reporterNs.report("AdPlacement", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfWXAdapter(extras) {
    _reporterNs.report("WXAdapter", "../utils/WXAdapter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSaveService(extras) {
    _reporterNs.report("SaveService", "../core/save/SaveService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfLEGACY_KEYS(extras) {
    _reporterNs.report("LEGACY_KEYS", "../core/save/SaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfT(extras) {
    _reporterNs.report("T", "../core/TextManager", _context.meta, extras);
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
      Button = _cc.Button;
      Label = _cc.Label;
      tween = _cc.tween;
      UITransform = _cc.UITransform;
      Color = _cc.Color;
      Vec3 = _cc.Vec3;
      Prefab = _cc.Prefab;
    }, function (_unresolved_2) {
      eventBus = _unresolved_2.eventBus;
    }, function (_unresolved_3) {
      AdPlacement = _unresolved_3.AdPlacement;
    }, function (_unresolved_4) {
      WXAdapter = _unresolved_4.WXAdapter;
    }, function (_unresolved_5) {
      SaveService = _unresolved_5.SaveService;
    }, function (_unresolved_6) {
      LEGACY_KEYS = _unresolved_6.LEGACY_KEYS;
    }, function (_unresolved_7) {
      T = _unresolved_7.T;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "8168fi6X+lK7YX2jDfnuAi+", "MarqueeUI", undefined);
      /**
       * MarqueeUI - 跑马灯系统 (Phase 4, M4.3)
       *
       * 战斗结束后弹出跑马灯面板，3 格进度条
       * 看广告点亮1格，3格满领钥匙
       * 进度跨层保留，结算清零
       *
       * 完全自包含，零编辑器挂载 (运行时创建 UI 节点)
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Button', 'Label', 'tween', 'UITransform', 'Color', 'Vec3', 'Prefab']);

      ({
        ccclass,
        property
      } = _decorator);
      MAX_LIGHTS = 3;

      _export("MarqueeUI", MarqueeUI = (_dec = ccclass('MarqueeUI'), _dec2 = property(Prefab), _dec(_class = (_class2 = class MarqueeUI extends Component {
        constructor() {
          super(...arguments);

          /** 未来可绑定 Prefab */
          _initializerDefineProperty(this, "marqueePrefab", _descriptor, this);

          /** 3 格灯: true=已点亮 */
          this._lights = [false, false, false];
          this._isShowing = false;
          this._panel = null;
          this._lightNodes = [];
          this._keyLabel = null;
          this._progressLabel = null;
          this._adInProgress = false;
        }

        onLoad() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('battle:victory', this._onBattleVictory, this);

          this._createUI();

          this.node.active = false;
        }
        /** 创建跑马灯 UI（自包含） */


        _createUI() {
          // 背景遮罩
          var mask = new Node('MarqueeMask');
          var maskTransform = mask.addComponent(UITransform);
          maskTransform.setContentSize(750, 400);
          this.node.addChild(mask); // 面板主体

          this._panel = new Node('MarqueePanel');

          var panelTransform = this._panel.addComponent(UITransform);

          panelTransform.setContentSize(600, 300);
          this.node.addChild(this._panel); // 标题

          var titleLabel = this._createLabelOn('Title', (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)('ui.marqueeTitle'), 28, new Color(255, 215, 0), new Vec3(0, 110, 0), this._panel); // 提示文字


          this._progressLabel = this._createLabelOn('Progress', (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)('ui.marqueeHint'), 18, new Color(200, 200, 200), new Vec3(0, 70, 0), this._panel); // 3 个灯

          for (var i = 0; i < MAX_LIGHTS; i++) {
            var lightNode = new Node("Light_" + i);
            lightNode.setPosition((i - 1) * 120, 10, 0);
            var lt = lightNode.addComponent(UITransform);
            lt.setContentSize(60, 60);
            var lightBtn = lightNode.addComponent(Button);
            lightBtn.clickEvents = [{
              target: this.node,
              component: 'MarqueeUI',
              handler: 'onLightClick'
            }];

            this._panel.addChild(lightNode);

            this._lightNodes.push(lightNode);
          } // 钥匙获得提示


          this._keyLabel = this._createLabelOn('KeyLabel', '', 22, new Color(255, 215, 0), new Vec3(0, -80, 0), this._panel); // 关闭按钮

          var closeBtn = new Node('CloseButton');
          closeBtn.setPosition(0, -130, 0);
          var closeTransform = closeBtn.addComponent(UITransform);
          closeTransform.setContentSize(200, 50);
          var closeButton = closeBtn.addComponent(Button);
          var closeLabel = closeBtn.addComponent(Label);
          closeLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)('ui.marqueeContinue');
          closeLabel.fontSize = 20;
          closeLabel.color = new Color(255, 255, 255);
          closeButton.clickEvents = [{
            target: this.node,
            component: 'MarqueeUI',
            handler: 'onCloseClick'
          }];

          this._panel.addChild(closeBtn); // 加载存档进度


          this._loadProgress();

          this.node.active = false;
        }

        _createLabelOn(name, text, fontSize, color, pos, parent) {
          var node = new Node(name);
          node.setPosition(pos);
          var label = node.addComponent(Label);
          label.string = text;
          label.fontSize = fontSize;
          label.color = color;
          label.lineHeight = fontSize + 4;
          parent.addChild(node);
          return label;
        }
        /** 战斗胜利时触发 */


        _onBattleVictory() {
          // 延迟片刻弹出，让胜利感延续
          this.scheduleOnce(() => {
            this._show();
          }, 0.5);
        }
        /** 显示跑马灯 */


        _show() {
          this._isShowing = true;
          this.node.active = true;

          this._updateDisplay(); // 渐入


          if (this._panel) {
            this._panel.setScale(0.8, 0.8, 1);

            tween(this._panel).to(0.3, {
              scale: new Vec3(1, 1, 1)
            }, {
              easing: 'backOut'
            }).start();
          }

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('game:pause_request');
        }
        /** 点击灯的按钮 */


        onLightClick() {
          if (this._adInProgress) return; // 找第一个未点亮的灯

          var nextIdx = this._lights.findIndex(light => !light);

          if (nextIdx < 0) {
            // 已经全亮
            return;
          }

          this._adInProgress = true;
          (_crd && WXAdapter === void 0 ? (_reportPossibleCrUseOfWXAdapter({
            error: Error()
          }), WXAdapter) : WXAdapter).getInstance().playRewardedAd((_crd && AdPlacement === void 0 ? (_reportPossibleCrUseOfAdPlacement({
            error: Error()
          }), AdPlacement) : AdPlacement).Marquee, result => {
            this._adInProgress = false;

            if (result.rewarded) {
              this._lights[nextIdx] = true;

              this._saveProgress();

              this._updateDisplay(); // 检查是否全满


              if (this._lights.every(l => l)) {
                this._grantKey();
              }
            }
          });
        }
        /** 发放钥匙奖励 */


        _grantKey() {
          if (this._keyLabel) {
            this._keyLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.marqueeGetKey');
          }

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('key:change', 1); // 全亮后重置进度

          this._lights = [false, false, false];

          this._saveProgress();
        }
        /** 关闭跑马灯 */


        onCloseClick() {
          this._close();
        }

        _close() {
          this._isShowing = false;

          if (this._panel) {
            tween(this._panel).to(0.2, {
              scale: new Vec3(0, 0, 0)
            }).call(() => {
              this.node.active = false;
              (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                error: Error()
              }), eventBus) : eventBus).emit('game:resume_request');
            }).start();
          } else {
            this.node.active = false;
            (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
              error: Error()
            }), eventBus) : eventBus).emit('game:resume_request');
          }
        }
        /** 更新显示状态 */


        _updateDisplay() {
          for (var i = 0; i < MAX_LIGHTS; i++) {
            var node = this._lightNodes[i];
            if (!node) continue;
            node.getComponent(Button).interactable = !this._lights[i];
          }

          var litCount = this._lights.filter(l => l).length;

          if (this._progressLabel) {
            this._progressLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.marqueeProgress', {
              lit: litCount,
              total: MAX_LIGHTS
            });
          }
        }
        /** 保存进度（跨层保留） */


        _saveProgress() {
          try {
            (_crd && SaveService === void 0 ? (_reportPossibleCrUseOfSaveService({
              error: Error()
            }), SaveService) : SaveService).instance.storage.setJson((_crd && LEGACY_KEYS === void 0 ? (_reportPossibleCrUseOfLEGACY_KEYS({
              error: Error()
            }), LEGACY_KEYS) : LEGACY_KEYS).MARQUEE_PROGRESS, this._lights);
          } catch (err) {
            console.warn('[MarqueeUI] 保存进度失败');
          }
        }
        /** 加载进度 */


        _loadProgress() {
          try {
            var loaded = (_crd && SaveService === void 0 ? (_reportPossibleCrUseOfSaveService({
              error: Error()
            }), SaveService) : SaveService).instance.storage.getJson((_crd && LEGACY_KEYS === void 0 ? (_reportPossibleCrUseOfLEGACY_KEYS({
              error: Error()
            }), LEGACY_KEYS) : LEGACY_KEYS).MARQUEE_PROGRESS, []);

            if (Array.isArray(loaded.value) && loaded.value.length === MAX_LIGHTS) {
              this._lights = loaded.value;
            }
          } catch (err) {
            console.warn('[MarqueeUI] 加载进度失败');
          }
        }
        /** 死亡时清空进度 */


        resetOnDeath() {
          this._lights = [false, false, false];

          this._saveProgress();
        }

        onDestroy() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).offTarget(this);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "marqueePrefab", [_dec2], {
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
//# sourceMappingURL=356e8fee67a20b03961216d722be3a91faa9dd10.js.map