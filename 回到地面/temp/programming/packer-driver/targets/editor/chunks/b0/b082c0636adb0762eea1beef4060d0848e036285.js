System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Button, Label, tween, UITransform, Vec3, Color, Prefab, GameConfig, eventBus, T, GameManager, _dec, _dec2, _class, _class2, _descriptor, _crd, ccclass, property, EventUI;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfGameConfig(extras) {
    _reporterNs.report("GameConfig", "../core/GameConfig", _context.meta, extras);
  }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfT(extras) {
    _reporterNs.report("T", "../core/TextManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameManager(extras) {
    _reporterNs.report("GameManager", "../core/GameManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEventSystem(extras) {
    _reporterNs.report("EventSystem", "../battle/EventSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGeneratedEvent(extras) {
    _reporterNs.report("GeneratedEvent", "../battle/EventSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIPlayerAgent(extras) {
    _reporterNs.report("IPlayerAgent", "../battle/IPlayerAgent", _context.meta, extras);
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
      Vec3 = _cc.Vec3;
      Color = _cc.Color;
      Prefab = _cc.Prefab;
    }, function (_unresolved_2) {
      GameConfig = _unresolved_2.GameConfig;
    }, function (_unresolved_3) {
      eventBus = _unresolved_3.eventBus;
    }, function (_unresolved_4) {
      T = _unresolved_4.T;
    }, function (_unresolved_5) {
      GameManager = _unresolved_5.GameManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "99700IkXDlBKqbIC+Jp8mEC", "EventUI", undefined);
      /**
       * EventUI - 事件房 UI (Phase 3, M3.4)
       * 
       * 2 选 1 决策面板 - 完全自包含，无需编辑器挂载
       * 运行时创建所有 UI 节点
       * 
       * 显示流程:
       *   room:event 事件触发 → 生成 Event → 显示面板 →
       *   15 秒超时自动选择 A → 应用后果 → 关闭面板
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Button', 'Label', 'tween', 'UITransform', 'Vec3', 'Color', 'Prefab']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("EventUI", EventUI = (_dec = ccclass('EventUI'), _dec2 = property(Prefab), _dec(_class = (_class2 = class EventUI extends Component {
        constructor(...args) {
          super(...args);

          /** 未来可绑定 Prefab */
          _initializerDefineProperty(this, "eventPrefab", _descriptor, this);

          this._eventSystem = null;
          this._player = null;
          this._currentEvent = null;
          this._autoSelectTimer = 0;
          this._isActive = false;
          // UI 元素（运行时创建）
          this._panel = null;
          this._descriptionLabel = null;
          this._sceneTitle = null;
          this._optionABtn = null;
          this._optionALabel = null;
          this._optionADesc = null;
          this._optionBBtn = null;
          this._optionBLabel = null;
          this._optionBDesc = null;
          this._timerLabel = null;
        }

        onLoad() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('room:event', this._onEnterEventRoom, this);

          this._createUI();

          this.node.active = false;
        }
        /** 初始化 */


        init(eventSystem, player) {
          this._eventSystem = eventSystem;
          this._player = player;
        }
        /** 创建所有 UI 节点（完全自包含） */


        _createUI() {
          // 全屏遮罩
          const mask = new Node('Mask');
          mask.setPosition(0, 0, 0);
          const maskTransform = mask.addComponent(UITransform);
          maskTransform.setContentSize(750, 1334);
          const maskBtn = mask.addComponent(Button); // 遮罩点击无效（不关闭面板）

          this.node.addChild(mask); // 面板主体

          this._panel = new Node('EventPanel');

          this._panel.setPosition(0, 0, 0);

          const panelTransform = this._panel.addComponent(UITransform);

          panelTransform.setContentSize(600, 500);
          this.node.addChild(this._panel); // 标题

          this._sceneTitle = this._createLabel('SceneTitle', '事件', 28, new Color(255, 215, 0), new Vec3(0, 200, 0)); // 描述文本

          this._descriptionLabel = this._createLabel('Description', '描述', 20, new Color(220, 220, 220), new Vec3(0, 120, 0)); // 选项 A (左侧)

          const aPanel = new Node('OptionA_Container');
          aPanel.setPosition(-180, -80, 0);
          const aTransform = aPanel.addComponent(UITransform);
          aTransform.setContentSize(260, 200);
          const aBtn = aPanel.addComponent(Button);
          aBtn.clickEvents = [{
            target: this.node,
            component: 'EventUI',
            handler: 'onSelectOptionA'
          }];

          this._panel.addChild(aPanel);

          this._optionABtn = aPanel;
          this._optionALabel = this._createLabelOn('OptionALabel', '选项A', 22, new Color(100, 200, 255), new Vec3(0, 60, 0), aPanel);
          this._optionADesc = this._createLabelOn('OptionADesc', '描述', 16, new Color(180, 180, 180), new Vec3(0, -30, 0), aPanel); // 选项 B (右侧)

          const bPanel = new Node('OptionB_Container');
          bPanel.setPosition(180, -80, 0);
          const bTransform = bPanel.addComponent(UITransform);
          bTransform.setContentSize(260, 200);
          const bBtn = bPanel.addComponent(Button);
          bBtn.clickEvents = [{
            target: this.node,
            component: 'EventUI',
            handler: 'onSelectOptionB'
          }];

          this._panel.addChild(bPanel);

          this._optionBBtn = bPanel;
          this._optionBLabel = this._createLabelOn('OptionBLabel', '选项B', 22, new Color(255, 150, 100), new Vec3(0, 60, 0), bPanel);
          this._optionBDesc = this._createLabelOn('OptionBDesc', '描述', 16, new Color(180, 180, 180), new Vec3(0, -30, 0), bPanel); // 计时器

          this._timerLabel = this._createLabel('Timer', '自动选择: 15s', 16, new Color(150, 150, 150), new Vec3(0, -260, 0));
          this.node.active = false;
        }
        /** 创建标签辅助方法（挂载到面板） */


        _createLabel(name, text, fontSize, color, pos) {
          const node = new Node(name);
          node.setPosition(pos);
          const label = node.addComponent(Label);
          label.string = text;
          label.fontSize = fontSize;
          label.color = color;
          label.lineHeight = fontSize + 4;

          this._panel.addChild(node);

          return label;
        }
        /** 创建标签（挂载到指定父节点） */


        _createLabelOn(name, text, fontSize, color, pos, parent) {
          const node = new Node(name);
          node.setPosition(pos);
          const label = node.addComponent(Label);
          label.string = text;
          label.fontSize = fontSize;
          label.color = color;
          label.lineHeight = fontSize + 4;
          parent.addChild(node);
          return label;
        }
        /** 进入事件房 */


        _onEnterEventRoom(roomId) {
          if (!this._eventSystem || !this._player) return;
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('game:pause_request');
          const gm = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).instance;
          const floor = gm ? gm.currentFloor : 1;
          const zoneId = gm ? gm.currentZone : 'forest';
          this._currentEvent = this._eventSystem.generateEvent(floor, zoneId);

          this._showEvent(this._currentEvent);
        }
        /** 显示事件 UI */


        _showEvent(event) {
          this._isActive = true;
          this._autoSelectTimer = (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).EVENT_AUTO_SELECT_TIMEOUT || 15;
          this.node.active = true;
          this._sceneTitle.string = event.scene.name;
          this._descriptionLabel.string = event.description;
          this._optionALabel.string = event.optionA.label;
          this._optionADesc.string = event.optionA.description;
          this._optionBLabel.string = event.optionB.label;
          this._optionBDesc.string = event.optionB.description; // 渐入动画

          if (this._panel) {
            this._panel.setScale(0.8, 0.8, 1);

            tween(this._panel).to(0.3, {
              scale: new Vec3(1, 1, 1)
            }, {
              easing: 'backOut'
            }).start();
          }

          this._updateTimerDisplay();
        }
        /** 选择选项 A */


        onSelectOptionA() {
          this._resolveChoice(true);
        }
        /** 选择选项 B */


        onSelectOptionB() {
          this._resolveChoice(false);
        }
        /** 执行选择 */


        _resolveChoice(isA) {
          if (!this._isActive || !this._currentEvent) return;
          this._isActive = false;
          const option = isA ? this._currentEvent.optionA : this._currentEvent.optionB;

          if (this._eventSystem) {
            for (const consequence of option.consequences) {
              this._eventSystem.applyConsequence(consequence);
            }
          }

          this._close();
        }
        /** 关闭事件 UI */


        _close() {
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

          this._currentEvent = null;
        }
        /** 更新计时器 */


        _updateTimerDisplay() {
          if (this._timerLabel) {
            const secs = Math.ceil(this._autoSelectTimer);
            this._timerLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.autoSelect', {
              secs
            });
          }
        }

        update(dt) {
          if (!this._isActive) return;
          this._autoSelectTimer -= dt;

          this._updateTimerDisplay();

          if (this._autoSelectTimer <= 0) {
            this._resolveChoice(true);
          }
        }

        onDestroy() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).offTarget(this);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "eventPrefab", [_dec2], {
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
//# sourceMappingURL=b082c0636adb0762eea1beef4060d0848e036285.js.map