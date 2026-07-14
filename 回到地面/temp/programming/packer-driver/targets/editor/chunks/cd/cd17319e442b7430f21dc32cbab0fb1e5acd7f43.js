System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Label, Sprite, Color, UITransform, Vec3, EquipmentSlot, EQUIPMENT_SLOTS, SLOT_NAMES, T, _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, RARITY_COLORS, EquipmentView;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function v3(x, y, z = 0) {
    return new Vec3(x, y, z);
  }

  function _reportPossibleCrUseOfEquipmentSlot(extras) {
    _reporterNs.report("EquipmentSlot", "../../battle/EquipmentSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEQUIPMENT_SLOTS(extras) {
    _reporterNs.report("EQUIPMENT_SLOTS", "../../battle/EquipmentSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSLOT_NAMES(extras) {
    _reporterNs.report("SLOT_NAMES", "../../battle/EquipmentSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEquipmentVM(extras) {
    _reporterNs.report("EquipmentVM", "../viewmodel/EquipmentViewModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEquippedSlotVM(extras) {
    _reporterNs.report("EquippedSlotVM", "../viewmodel/EquipmentViewModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBackpackSlotVM(extras) {
    _reporterNs.report("BackpackSlotVM", "../viewmodel/EquipmentViewModel", _context.meta, extras);
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
      Vec3 = _cc.Vec3;
    }, function (_unresolved_2) {
      EquipmentSlot = _unresolved_2.EquipmentSlot;
      EQUIPMENT_SLOTS = _unresolved_2.EQUIPMENT_SLOTS;
      SLOT_NAMES = _unresolved_2.SLOT_NAMES;
    }, function (_unresolved_3) {
      T = _unresolved_3.T;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "3cd122KLkFNu7nzghPdf3wY", "EquipmentView", undefined);
      /**
       * EquipmentView - 装备界面渲染层
       *
       * 职责:
       * 1. 根据 EquipmentVM 驱动节点显示
       * 2. 负责布局（硬编码坐标作为 fallback）
       * 3. 不包含任何业务逻辑
       *
       * Phase 8: UI Prefab + ViewModel 化
       * 当有 Prefab 时可替换为 prefab 节点绑定
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Label', 'Sprite', 'Color', 'UITransform', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);
      RARITY_COLORS = {
        common: new Color(204, 204, 204),
        uncommon: new Color(74, 144, 217),
        rare: new Color(255, 165, 0),
        epic: new Color(255, 69, 0)
      };

      _export("EquipmentView", EquipmentView = (_dec = ccclass('EquipmentView'), _dec2 = property(Node), _dec3 = property(Node), _dec4 = property(Node), _dec5 = property(Node), _dec(_class = (_class2 = class EquipmentView extends Component {
        constructor(...args) {
          super(...args);

          /** 当有 Prefab 后，此处可绑定 Prefab 节点引用 */
          _initializerDefineProperty(this, "slotContainer", _descriptor, this);

          _initializerDefineProperty(this, "backpackContainer", _descriptor2, this);

          _initializerDefineProperty(this, "setInfoContainer", _descriptor3, this);

          _initializerDefineProperty(this, "statsContainer", _descriptor4, this);

          this._slotNodes = new Map();
          this._backpackNodes = [];
          this._setInfoLabel = null;
          this._statsLabel = null;
          this._onSlotClick = null;
          this._onBackpackClick = null;
        }

        /** 绑定交互回调 */
        bindCallbacks(slotClick, backpackClick) {
          this._onSlotClick = slotClick;
          this._onBackpackClick = backpackClick;
        }
        /** 构建 UI（无 Prefab 时的 fallback 代码生成） */


        buildFallbackLayout() {
          if (this.slotContainer) return; // 已有 Prefab 绑定，跳过
          // 面板

          const panel = new Node('equipPanel');
          panel.addComponent(UITransform).setContentSize(500, 420);
          this.node.addChild(panel); // 标题

          const titleN = new Node('title');
          titleN.setPosition(0, 190);
          panel.addChild(titleN);
          const titleL = titleN.addComponent(Label);
          titleL.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)('ui.equipment');
          titleL.fontSize = 24;
          titleL.color = Color.WHITE; // 8 个槽位

          const slotPositions = {
            [(_crd && EquipmentSlot === void 0 ? (_reportPossibleCrUseOfEquipmentSlot({
              error: Error()
            }), EquipmentSlot) : EquipmentSlot).Head]: v3(-140, 130),
            [(_crd && EquipmentSlot === void 0 ? (_reportPossibleCrUseOfEquipmentSlot({
              error: Error()
            }), EquipmentSlot) : EquipmentSlot).Chest]: v3(-140, 70),
            [(_crd && EquipmentSlot === void 0 ? (_reportPossibleCrUseOfEquipmentSlot({
              error: Error()
            }), EquipmentSlot) : EquipmentSlot).Weapon]: v3(-200, 10),
            [(_crd && EquipmentSlot === void 0 ? (_reportPossibleCrUseOfEquipmentSlot({
              error: Error()
            }), EquipmentSlot) : EquipmentSlot).Offhand]: v3(-80, 10),
            [(_crd && EquipmentSlot === void 0 ? (_reportPossibleCrUseOfEquipmentSlot({
              error: Error()
            }), EquipmentSlot) : EquipmentSlot).Ring1]: v3(-200, -50),
            [(_crd && EquipmentSlot === void 0 ? (_reportPossibleCrUseOfEquipmentSlot({
              error: Error()
            }), EquipmentSlot) : EquipmentSlot).Ring2]: v3(-80, -50),
            [(_crd && EquipmentSlot === void 0 ? (_reportPossibleCrUseOfEquipmentSlot({
              error: Error()
            }), EquipmentSlot) : EquipmentSlot).Boots]: v3(-140, -110),
            [(_crd && EquipmentSlot === void 0 ? (_reportPossibleCrUseOfEquipmentSlot({
              error: Error()
            }), EquipmentSlot) : EquipmentSlot).Amulet]: v3(-140, -170)
          };

          for (const slot of _crd && EQUIPMENT_SLOTS === void 0 ? (_reportPossibleCrUseOfEQUIPMENT_SLOTS({
            error: Error()
          }), EQUIPMENT_SLOTS) : EQUIPMENT_SLOTS) {
            const node = this._buildSlotNode(slot, slotPositions[slot]);

            panel.addChild(node.root);

            this._slotNodes.set(slot, node);
          } // 12 格背包


          const bpStartX = 80,
                bpStartY = 140,
                cell = 65,
                pad = 8;

          for (let i = 0; i < 12; i++) {
            const col = i % 3,
                  row = Math.floor(i / 3);
            const x = bpStartX + col * (cell + pad),
                  y = bpStartY - row * (cell + pad);

            const node = this._buildBackpackCell(i, x, y);

            panel.addChild(node.root);

            this._backpackNodes.push(node);
          } // 套装信息


          const siN = new Node('setInfo');
          siN.setPosition(-140, -220);
          panel.addChild(siN);
          this._setInfoLabel = siN.addComponent(Label);
          this._setInfoLabel.fontSize = 14;
          this._setInfoLabel.color = new Color(200, 200, 200); // 统计

          const stN = new Node('stats');
          stN.setPosition(80, -220);
          panel.addChild(stN);
          this._statsLabel = stN.addComponent(Label);
          this._statsLabel.fontSize = 12;
          this._statsLabel.color = Color.GRAY;
        }
        /** 渲染整个界面 */


        render(vm) {
          this.renderSlots(vm.slots);
          this.renderBackpack(vm.backpack);
          this.renderSetInfo(vm.setInfo);
          this.renderStats(vm.statsText);
        }

        renderSlots(slots) {
          for (const s of slots) {
            const node = this._slotNodes.get(s.slot);

            if (!node) continue;

            if (s.item) {
              var _RARITY_COLORS$s$item;

              node.label.string = s.item.name.length > 6 ? s.item.name.slice(0, 6) + '..' : s.item.name;
              node.label.color = (_RARITY_COLORS$s$item = RARITY_COLORS[s.item.rarity]) != null ? _RARITY_COLORS$s$item : Color.WHITE;
            } else {
              node.label.string = `[${s.slotLabel}]`;
              node.label.color = Color.GRAY;
            }
          }
        }

        renderBackpack(backpack) {
          for (let i = 0; i < this._backpackNodes.length && i < backpack.length; i++) {
            var _RARITY_COLORS$item$r;

            const node = this._backpackNodes[i];
            const item = backpack[i].item;
            node.label.string = item ? item.name.length > 6 ? item.name.slice(0, 6) + '..' : item.name : '';
            node.label.color = item ? (_RARITY_COLORS$item$r = RARITY_COLORS[item.rarity]) != null ? _RARITY_COLORS$item$r : Color.WHITE : Color.WHITE;
          }
        }

        renderSetInfo(sets) {
          if (this._setInfoLabel) {
            this._setInfoLabel.string = sets.length > 0 ? '套装:\n' + sets.join('\n') : '';
          }
        }

        renderStats(text) {
          if (this._statsLabel) this._statsLabel.string = text;
        }

        _buildSlotNode(slot, pos) {
          var _slot;

          const root = new Node(`slot_${slot}`);
          root.setPosition(pos);
          const t = root.addComponent(UITransform);
          t.setContentSize(90, 50);
          const bg = new Node('bg');
          bg.addComponent(UITransform).setContentSize(90, 50);
          bg.addComponent(Sprite).color = new Color(50, 50, 50, 200);
          root.addChild(bg);
          const nameN = new Node('name');
          root.addChild(nameN);
          const label = nameN.addComponent(Label);
          label.fontSize = 14;
          label.color = Color.WHITE;
          const slotN = new Node('slotName');
          slotN.setPosition(0, -16);
          root.addChild(slotN);
          const sLabel = slotN.addComponent(Label);
          sLabel.string = (_slot = (_crd && SLOT_NAMES === void 0 ? (_reportPossibleCrUseOfSLOT_NAMES({
            error: Error()
          }), SLOT_NAMES) : SLOT_NAMES)[slot]) != null ? _slot : slot;
          sLabel.fontSize = 12;
          sLabel.color = Color.GRAY;
          root.on(Node.EventType.TOUCH_END, () => {
            var _this$_onSlotClick;

            return (_this$_onSlotClick = this._onSlotClick) == null ? void 0 : _this$_onSlotClick.call(this, slot);
          });
          return {
            root,
            label
          };
        }

        _buildBackpackCell(index, x, y) {
          const root = new Node(`bp_${index}`);
          root.setPosition(x, y);
          const t = root.addComponent(UITransform);
          t.setContentSize(65, 55);
          const bg = new Node('bg');
          bg.addComponent(UITransform).setContentSize(65, 55);
          bg.addComponent(Sprite).color = new Color(40, 40, 40, 180);
          root.addChild(bg);
          const nameN = new Node('name');
          root.addChild(nameN);
          const label = nameN.addComponent(Label);
          label.fontSize = 10;
          label.color = Color.WHITE;
          root.on(Node.EventType.TOUCH_END, () => {
            var _this$_onBackpackClic;

            return (_this$_onBackpackClic = this._onBackpackClick) == null ? void 0 : _this$_onBackpackClic.call(this, index);
          });
          return {
            root,
            label
          };
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "slotContainer", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "backpackContainer", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "setInfoContainer", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "statsContainer", [_dec5], {
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
//# sourceMappingURL=cd17319e442b7430f21dc32cbab0fb1e5acd7f43.js.map