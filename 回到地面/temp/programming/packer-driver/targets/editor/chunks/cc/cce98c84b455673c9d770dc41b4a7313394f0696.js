System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Prefab, eventBus, EQUIPMENT_SLOTS, SLOT_NAMES, EquipmentView, _dec, _dec2, _class, _class2, _descriptor, _crd, ccclass, property, RARITY_COLOR_MAP, EquipmentUI;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEquipmentSystem(extras) {
    _reporterNs.report("EquipmentSystem", "../battle/EquipmentSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEquipmentSlot(extras) {
    _reporterNs.report("EquipmentSlot", "../battle/EquipmentSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEQUIPMENT_SLOTS(extras) {
    _reporterNs.report("EQUIPMENT_SLOTS", "../battle/EquipmentSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSLOT_NAMES(extras) {
    _reporterNs.report("SLOT_NAMES", "../battle/EquipmentSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEquipmentView(extras) {
    _reporterNs.report("EquipmentView", "./view/EquipmentView", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEquipmentVM(extras) {
    _reporterNs.report("EquipmentVM", "./viewmodel/EquipmentViewModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEquippedSlotVM(extras) {
    _reporterNs.report("EquippedSlotVM", "./viewmodel/EquipmentViewModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBackpackSlotVM(extras) {
    _reporterNs.report("BackpackSlotVM", "./viewmodel/EquipmentViewModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEquippedItemVM(extras) {
    _reporterNs.report("EquippedItemVM", "./viewmodel/EquipmentViewModel", _context.meta, extras);
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
      Prefab = _cc.Prefab;
    }, function (_unresolved_2) {
      eventBus = _unresolved_2.eventBus;
    }, function (_unresolved_3) {
      EQUIPMENT_SLOTS = _unresolved_3.EQUIPMENT_SLOTS;
      SLOT_NAMES = _unresolved_3.SLOT_NAMES;
    }, function (_unresolved_4) {
      EquipmentView = _unresolved_4.EquipmentView;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ed2deUjkRtGZZu0EfNxEvIA", "EquipmentUI", undefined);
      /**
       * EquipmentUI - 装备界面 (Phase 8 重构版)
       *
       * [Phase 8] ViewModel 化重构:
       * - 渲染委托给 EquipmentView
       * - 布局在 View 层面管理
       * - 业务逻辑保留在此（属性和交互）
       * - 支持 @property(Prefab) 未来绑定
       */


      __checkObsolete__(['_decorator', 'Component', 'Prefab', 'instantiate']);

      ({
        ccclass,
        property
      } = _decorator);
      RARITY_COLOR_MAP = {
        common: {
          r: 204,
          g: 204,
          b: 204
        },
        uncommon: {
          r: 74,
          g: 144,
          b: 217
        },
        rare: {
          r: 255,
          g: 165,
          b: 0
        },
        epic: {
          r: 255,
          g: 69,
          b: 0
        }
      };

      _export("EquipmentUI", EquipmentUI = (_dec = ccclass('EquipmentUI'), _dec2 = property(Prefab), _dec(_class = (_class2 = class EquipmentUI extends Component {
        constructor(...args) {
          super(...args);

          /** 未来可绑定 Prefab */
          _initializerDefineProperty(this, "equipPanelPrefab", _descriptor, this);

          this._equipSystem = null;
          this._isOpen = false;
          this._view = null;
        }

        init(system) {
          var _this$getComponent;

          this._equipSystem = system;
          this._view = (_this$getComponent = this.getComponent(_crd && EquipmentView === void 0 ? (_reportPossibleCrUseOfEquipmentView({
            error: Error()
          }), EquipmentView) : EquipmentView)) != null ? _this$getComponent : this.node.addComponent(_crd && EquipmentView === void 0 ? (_reportPossibleCrUseOfEquipmentView({
            error: Error()
          }), EquipmentView) : EquipmentView);

          this._view.buildFallbackLayout();

          this._view.bindCallbacks(slot => this._onSlotClick(slot), index => this._onBackpackClick(index));

          this.node.active = false;
        }

        onLoad() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('equip:changed', () => this._isOpen && this._refreshAll(), this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('equip:unequipped', () => this._isOpen && this._refreshAll(), this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('equip:picked_up', () => this._isOpen && this._refreshAll(), this);
        }

        onDestroy() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).offTarget(this);
        }

        toggle() {
          this._isOpen ? this.hide() : this.show();
        }

        show() {
          this._isOpen = true;
          this.node.active = true;

          this._refreshAll();
        }

        hide() {
          this._isOpen = false;
          this.node.active = false;
        }

        get isOpen() {
          return this._isOpen;
        }

        _refreshAll() {
          if (!this._equipSystem || !this._view) return;

          const vm = this._buildVM();

          this._view.render(vm);
        }

        _buildVM() {
          const es = this._equipSystem;
          const slots = (_crd && EQUIPMENT_SLOTS === void 0 ? (_reportPossibleCrUseOfEQUIPMENT_SLOTS({
            error: Error()
          }), EQUIPMENT_SLOTS) : EQUIPMENT_SLOTS).map(slot => {
            var _slot;

            return {
              slot,
              slotLabel: (_slot = (_crd && SLOT_NAMES === void 0 ? (_reportPossibleCrUseOfSLOT_NAMES({
                error: Error()
              }), SLOT_NAMES) : SLOT_NAMES)[slot]) != null ? _slot : slot,
              item: this._toItemVM(es.getEquipped(slot))
            };
          });
          const bp = es.getBackpack();
          const backpack = bp.map((item, i) => ({
            index: i,
            item: this._toItemVM(item)
          }));
          const sets = es.getActiveSetBonuses();
          return {
            slots,
            backpack,
            setInfo: sets.map(s => `${s.name} (${s.count})`),
            statsText: `战力: ${es.getTotalPowerLevel()}  背包: ${es.freeBackpackSlots}/12`
          };
        }

        _toItemVM(item) {
          var _RARITY_COLOR_MAP$ite;

          if (!item) return null;
          return {
            id: item.id,
            name: item.name,
            rarity: item.rarity,
            rarityColor: (_RARITY_COLOR_MAP$ite = RARITY_COLOR_MAP[item.rarity]) != null ? _RARITY_COLOR_MAP$ite : {
              r: 255,
              g: 255,
              b: 255
            }
          };
        }

        _onSlotClick(slot) {
          if (!this._equipSystem) return;

          const item = this._equipSystem.getEquipped(slot);

          if (item) this._equipSystem.unequip(slot);

          this._refreshAll();
        }

        _onBackpackClick(index) {
          if (!this._equipSystem) return;

          const bp = this._equipSystem.getBackpack();

          const item = bp[index];
          if (!item) return;

          this._equipSystem.equip(item);

          this._equipSystem.discardFromBackpack(index);

          this._refreshAll();
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "equipPanelPrefab", [_dec2], {
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
//# sourceMappingURL=cce98c84b455673c9d770dc41b4a7313394f0696.js.map