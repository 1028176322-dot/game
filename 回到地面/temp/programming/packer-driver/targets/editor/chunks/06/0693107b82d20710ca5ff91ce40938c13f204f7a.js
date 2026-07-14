System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Prefab, input, Input, KeyCode, eventBus, InventoryView, _dec, _dec2, _class, _class2, _descriptor, _crd, ccclass, property, InventoryUI;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfItemSystem(extras) {
    _reporterNs.report("ItemSystem", "../battle/ItemSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfInventoryView(extras) {
    _reporterNs.report("InventoryView", "./view/InventoryView", _context.meta, extras);
  }

  function _reportPossibleCrUseOfInventoryVM(extras) {
    _reporterNs.report("InventoryVM", "./viewmodel/InventoryViewModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfInventorySlotVM(extras) {
    _reporterNs.report("InventorySlotVM", "./viewmodel/InventoryViewModel", _context.meta, extras);
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
      input = _cc.input;
      Input = _cc.Input;
      KeyCode = _cc.KeyCode;
    }, function (_unresolved_2) {
      eventBus = _unresolved_2.eventBus;
    }, function (_unresolved_3) {
      InventoryView = _unresolved_3.InventoryView;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "54a8aJEIzRHMYLGT9X0EbBL", "InventoryUI", undefined);
      /**
       * InventoryUI - 背包 UI (Phase 8 重构版)
       *
       * [Phase 8] ViewModel 化重构:
       * - 渲染委托给 InventoryView
       * - 布局在 View 层面管理
       * - 快捷键/交互逻辑保留在此
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Prefab', 'input', 'Input', 'KeyCode', 'EventKeyboard']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("InventoryUI", InventoryUI = (_dec = ccclass('InventoryUI'), _dec2 = property(Prefab), _dec(_class = (_class2 = class InventoryUI extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "inventoryPrefab", _descriptor, this);

          this._itemSystem = null;
          this._isOpen = false;
          this._view = null;
        }

        init(system) {
          var _this$getComponent;

          this._itemSystem = system;
          this._view = (_this$getComponent = this.getComponent(_crd && InventoryView === void 0 ? (_reportPossibleCrUseOfInventoryView({
            error: Error()
          }), InventoryView) : InventoryView)) != null ? _this$getComponent : this.node.addComponent(_crd && InventoryView === void 0 ? (_reportPossibleCrUseOfInventoryView({
            error: Error()
          }), InventoryView) : InventoryView);

          this._view.buildFallbackLayout();

          this._view.bindCallbacks(index => this._useItem(index));

          this.node.active = false;
        }

        onLoad() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('bag:changed', () => this._isOpen && this._refreshAll(), this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('item:dropped', () => this._refreshAll(), this);
          input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        }

        onDestroy() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).offTarget(this);
          input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
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

        _useItem(index) {
          var _this$_itemSystem;

          (_this$_itemSystem = this._itemSystem) == null || _this$_itemSystem.useItem(index);

          this._refreshAll();
        }

        _onKeyDown(event) {
          if (!this._isOpen) return;
          const keyMap = {
            [KeyCode.DIGIT_1]: 0,
            [KeyCode.DIGIT_2]: 1,
            [KeyCode.DIGIT_3]: 2,
            [KeyCode.DIGIT_4]: 3,
            [KeyCode.DIGIT_5]: 4
          };
          const idx = keyMap[event.keyCode];
          if (idx !== undefined) this._useItem(idx);
        }

        _refreshAll() {
          if (!this._itemSystem || !this._view) return;

          const vm = this._buildVM();

          this._view.render(vm);
        }

        _buildVM() {
          const bag = this._itemSystem.getBag();

          const slots = bag.map((stack, i) => {
            var _stack$def$id, _stack$def, _stack$def$name, _stack$def2, _stack$count;

            return {
              id: (_stack$def$id = stack == null || (_stack$def = stack.def) == null ? void 0 : _stack$def.id) != null ? _stack$def$id : `empty_${i}`,
              icon: '',
              name: (_stack$def$name = stack == null || (_stack$def2 = stack.def) == null ? void 0 : _stack$def2.name) != null ? _stack$def$name : '',
              count: (_stack$count = stack == null ? void 0 : stack.count) != null ? _stack$count : 0,
              usable: stack != null,
              keyHint: `${i + 1}`
            };
          });
          return {
            slots,
            selectedItemId: null,
            hintText: '按 1-5 使用'
          };
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "inventoryPrefab", [_dec2], {
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
//# sourceMappingURL=0693107b82d20710ca5ff91ce40938c13f204f7a.js.map