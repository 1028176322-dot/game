System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Label, Sprite, Color, UITransform, T, _dec, _dec2, _class, _class2, _descriptor, _crd, ccclass, property, InventoryView;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfInventoryVM(extras) {
    _reporterNs.report("InventoryVM", "../viewmodel/InventoryViewModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfT(extras) {
    _reporterNs.report("T", "../../core/TextManager", _context.meta, extras);
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
      UITransform = _cc.UITransform;
    }, function (_unresolved_2) {
      T = _unresolved_2.T;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "525c6IW5jtBa60BX6V7XfWq", "InventoryView", undefined);
      /**
       * InventoryView - 道具背包渲染层
       *
       * Phase 8: UI Prefab + ViewModel 化
       * 无 Prefab 时使用 fallback 代码布局
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Label', 'Sprite', 'Color', 'UITransform', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("InventoryView", InventoryView = (_dec = ccclass('InventoryView'), _dec2 = property(Node), _dec(_class = (_class2 = class InventoryView extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "slotContainer", _descriptor, this);

          this._slots = [];
          this._hintLabel = null;
          this._onSlotClick = null;
        }

        bindCallbacks(slotClick) {
          this._onSlotClick = slotClick;
        }

        buildFallbackLayout() {
          if (this.slotContainer) return;
          const panel = new Node('inventoryPanel');
          panel.addComponent(UITransform).setContentSize(360, 260);
          this.node.addChild(panel);
          const title = new Node('title');
          title.setPosition(0, 110);
          panel.addChild(title);
          const tl = title.addComponent(Label);
          tl.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)('ui.inventory');
          tl.fontSize = 22;
          tl.color = Color.WHITE;
          const cell = 70,
                pad = 8,
                startX = -140,
                startY = 60;

          for (let i = 0; i < 5; i++) {
            const x = startX + i * (cell + pad);

            const node = this._buildSlot(i, x, startY);

            panel.addChild(node.root);

            this._slots.push(node);
          }

          const hint = new Node('hint');
          hint.setPosition(0, -100);
          panel.addChild(hint);
          this._hintLabel = hint.addComponent(Label);
          this._hintLabel.fontSize = 12;
          this._hintLabel.color = Color.GRAY;
        }

        render(vm) {
          for (let i = 0; i < this._slots.length; i++) {
            const slot = this._slots[i];
            const data = vm.slots[i];

            if (data) {
              slot.label.string = data.name.length > 4 ? data.name.slice(0, 4) : data.name;
              slot.label.color = data.usable ? Color.WHITE : Color.GRAY;
              slot.countLabel.string = data.count > 1 ? `x${data.count}` : '';
              slot.keyLabel.string = data.keyHint;
            } else {
              slot.label.string = '';
              slot.countLabel.string = '';
              slot.keyLabel.string = '';
            }
          }

          if (this._hintLabel) this._hintLabel.string = vm.hintText;
        }

        _buildSlot(index, x, y) {
          const root = new Node(`slot_${index}`);
          root.setPosition(x, y);
          root.addComponent(UITransform).setContentSize(70, 70);
          const bg = new Node('bg');
          bg.addComponent(UITransform).setContentSize(70, 70);
          bg.addComponent(Sprite).color = new Color(40, 40, 40, 180);
          root.addChild(bg);
          const nameN = new Node('name');
          root.addChild(nameN);
          const label = nameN.addComponent(Label);
          label.fontSize = 14;
          label.color = Color.WHITE;
          const countN = new Node('count');
          countN.setPosition(20, -20);
          root.addChild(countN);
          const countLabel = countN.addComponent(Label);
          countLabel.fontSize = 13;
          countLabel.color = Color.YELLOW;
          const keyN = new Node('key');
          keyN.setPosition(0, -28);
          root.addChild(keyN);
          const keyLabel = keyN.addComponent(Label);
          keyLabel.fontSize = 12;
          keyLabel.color = new Color(150, 150, 150);
          root.on(Node.EventType.TOUCH_END, () => {
            var _this$_onSlotClick;

            return (_this$_onSlotClick = this._onSlotClick) == null ? void 0 : _this$_onSlotClick.call(this, index);
          });
          return {
            root,
            label,
            countLabel,
            keyLabel
          };
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "slotContainer", [_dec2], {
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
//# sourceMappingURL=8bded4b3a5b748dd27392a945a48036eaaa26812.js.map