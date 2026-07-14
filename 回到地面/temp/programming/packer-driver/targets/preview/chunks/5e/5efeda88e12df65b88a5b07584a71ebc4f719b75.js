System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Label, Sprite, Color, SkillSlot, eventBus, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _crd, ccclass, property, SkillUI;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfSkillSlot(extras) {
    _reporterNs.report("SkillSlot", "../battle/SkillSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSkillData(extras) {
    _reporterNs.report("SkillData", "../battle/SkillSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSkillSystem(extras) {
    _reporterNs.report("SkillSystem", "../battle/SkillSystem", _context.meta, extras);
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
      Label = _cc.Label;
      Sprite = _cc.Sprite;
      Color = _cc.Color;
    }, function (_unresolved_2) {
      SkillSlot = _unresolved_2.SkillSlot;
    }, function (_unresolved_3) {
      eventBus = _unresolved_3.eventBus;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "a0b31IuviRKOJqYlGnzk+id", "SkillUI", undefined);
      /**
       * SkillUI - 技能按钮 UI
       * 展示 4 个技能槽位（左/右主动 + 左/右遗物）
       * 遗物槽位默认隐藏，获得遗物时显示
       * UI 层只负责展示和转发点击，不直接修改核心数据
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Button', 'Label', 'Sprite', 'color', 'Color']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("SkillUI", SkillUI = (_dec = ccclass('SkillUI'), _dec2 = property(Node), _dec3 = property(Node), _dec4 = property(Node), _dec5 = property(Node), _dec6 = property(Label), _dec7 = property(Label), _dec8 = property(Label), _dec9 = property(Label), _dec(_class = (_class2 = class SkillUI extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "activeLeftBtn", _descriptor, this);

          _initializerDefineProperty(this, "activeRightBtn", _descriptor2, this);

          _initializerDefineProperty(this, "relicLeftBtn", _descriptor3, this);

          _initializerDefineProperty(this, "relicRightBtn", _descriptor4, this);

          _initializerDefineProperty(this, "activeLeftCDLabel", _descriptor5, this);

          _initializerDefineProperty(this, "activeRightCDLabel", _descriptor6, this);

          _initializerDefineProperty(this, "relicLeftCDLabel", _descriptor7, this);

          _initializerDefineProperty(this, "relicRightCDLabel", _descriptor8, this);

          this._skillSystem = null;
          this._buttonMap = new Map();
          this._cdLabelMap = new Map();
          this._defaultHidden = new Set();
        }

        onLoad() {
          this._buttonMap.set((_crd && SkillSlot === void 0 ? (_reportPossibleCrUseOfSkillSlot({
            error: Error()
          }), SkillSlot) : SkillSlot).ActiveLeft, this.activeLeftBtn);

          this._buttonMap.set((_crd && SkillSlot === void 0 ? (_reportPossibleCrUseOfSkillSlot({
            error: Error()
          }), SkillSlot) : SkillSlot).ActiveRight, this.activeRightBtn);

          this._buttonMap.set((_crd && SkillSlot === void 0 ? (_reportPossibleCrUseOfSkillSlot({
            error: Error()
          }), SkillSlot) : SkillSlot).RelicLeft, this.relicLeftBtn);

          this._buttonMap.set((_crd && SkillSlot === void 0 ? (_reportPossibleCrUseOfSkillSlot({
            error: Error()
          }), SkillSlot) : SkillSlot).RelicRight, this.relicRightBtn);

          this._cdLabelMap.set((_crd && SkillSlot === void 0 ? (_reportPossibleCrUseOfSkillSlot({
            error: Error()
          }), SkillSlot) : SkillSlot).ActiveLeft, this.activeLeftCDLabel);

          this._cdLabelMap.set((_crd && SkillSlot === void 0 ? (_reportPossibleCrUseOfSkillSlot({
            error: Error()
          }), SkillSlot) : SkillSlot).ActiveRight, this.activeRightCDLabel);

          this._cdLabelMap.set((_crd && SkillSlot === void 0 ? (_reportPossibleCrUseOfSkillSlot({
            error: Error()
          }), SkillSlot) : SkillSlot).RelicLeft, this.relicLeftCDLabel);

          this._cdLabelMap.set((_crd && SkillSlot === void 0 ? (_reportPossibleCrUseOfSkillSlot({
            error: Error()
          }), SkillSlot) : SkillSlot).RelicRight, this.relicRightCDLabel); // 遗物槽位默认隐藏


          this._defaultHidden.add((_crd && SkillSlot === void 0 ? (_reportPossibleCrUseOfSkillSlot({
            error: Error()
          }), SkillSlot) : SkillSlot).RelicLeft);

          this._defaultHidden.add((_crd && SkillSlot === void 0 ? (_reportPossibleCrUseOfSkillSlot({
            error: Error()
          }), SkillSlot) : SkillSlot).RelicRight);

          this._setButtonVisible((_crd && SkillSlot === void 0 ? (_reportPossibleCrUseOfSkillSlot({
            error: Error()
          }), SkillSlot) : SkillSlot).RelicLeft, false);

          this._setButtonVisible((_crd && SkillSlot === void 0 ? (_reportPossibleCrUseOfSkillSlot({
            error: Error()
          }), SkillSlot) : SkillSlot).RelicRight, false); // 注册事件


          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('skill:equipped', this._onSkillEquipped, this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('skill:removed', this._onSkillRemoved, this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('skill:cooldown_start', this._onCooldownStart, this);
        }

        onDestroy() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).offTarget(this);
        }
        /** 绑定技能系统 */


        bindSkillSystem(system) {
          this._skillSystem = system;
        }
        /** 点击技能按钮（从编辑器 Button.onClick 绑定） */


        onSkillButtonClick(slotName) {
          var slot = slotName;

          if (this._skillSystem) {
            this._skillSystem.castSkill(slot);
          }
        }

        _onSkillEquipped(slot, data) {
          this._setButtonVisible(slot, true);

          this._updateSkillUI(slot, data);
        }

        _onSkillRemoved(slot) {
          if (this._defaultHidden.has(slot)) {
            this._setButtonVisible(slot, false);
          }

          this._updateCDLabel(slot, 0);
        }

        _onCooldownStart(slot, cd) {
          this._updateCDLabel(slot, cd);
        }

        _setButtonVisible(slot, visible) {
          var btn = this._buttonMap.get(slot);

          if (btn) btn.active = visible;
        }

        _updateSkillUI(slot, data) {
          var btn = this._buttonMap.get(slot);

          if (!btn) return;
          var label = btn.getComponentInChildren(Label);
          if (label) label.string = data.name; // 如果是遗物技能，设置金色背景

          if (data.isRelic) {
            var sprite = btn.getComponent(Sprite);

            if (sprite) {
              sprite.color = new Color(255, 215, 0); // 金色
            }
          }
        }

        _updateCDLabel(slot, cd) {
          var label = this._cdLabelMap.get(slot);

          if (label) {
            label.string = cd > 0 ? cd.toFixed(1) : '';
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "activeLeftBtn", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "activeRightBtn", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "relicLeftBtn", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "relicRightBtn", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "activeLeftCDLabel", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "activeRightCDLabel", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "relicLeftCDLabel", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "relicRightCDLabel", [_dec9], {
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
//# sourceMappingURL=5efeda88e12df65b88a5b07584a71ebc4f719b75.js.map