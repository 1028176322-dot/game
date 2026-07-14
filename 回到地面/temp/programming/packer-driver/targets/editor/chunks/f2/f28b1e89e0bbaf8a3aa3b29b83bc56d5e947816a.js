System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Label, Color, UITransform, _dec, _dec2, _class, _class2, _descriptor, _crd, ccclass, property, ShopView;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfShopVM(extras) {
    _reporterNs.report("ShopVM", "../viewmodel/ShopViewModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfShopItemVM(extras) {
    _reporterNs.report("ShopItemVM", "../viewmodel/ShopViewModel", _context.meta, extras);
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
      Color = _cc.Color;
      UITransform = _cc.UITransform;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "cfa83/HIPxEx7g9lIZsoA3W", "ShopView", undefined);
      /**
       * ShopView - 商店渲染层
       *
       * Phase 8: UI Prefab + ViewModel 化
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Label', 'Sprite', 'Color', 'UITransform', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("ShopView", ShopView = (_dec = ccclass('ShopView'), _dec2 = property(Node), _dec(_class = (_class2 = class ShopView extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "panelRoot", _descriptor, this);

          this._tabs = [];
          this._contentRoot = null;
          this._soulStoneLabel = null;
          this._items = [];
          this._noPrefabPanel = null;
          this._onTabClick = null;
          this._onItemClick = null;
        }

        bindCallbacks(tabClick, itemClick) {
          this._onTabClick = tabClick;
          this._onItemClick = itemClick;
        }

        buildFallbackLayout() {
          if (this.panelRoot) return;
          const panel = new Node('shopPanel');
          panel.addComponent(UITransform).setContentSize(440, 380);
          this.node.addChild(panel);
          this._noPrefabPanel = panel;
          const title = new Node('title');
          title.setPosition(0, 170);
          panel.addChild(title);
          title.addComponent(Label).string = T('ui.shopTitle');
          title.getComponent(Label).fontSize = 22;
          this._soulStoneLabel = this._addLabel(panel, 'soulStone', 140, 170, '', 12, Color.YELLOW); // 3 个标签页占位

          for (let i = 0; i < 3; i++) {
            const tab = new Node(`tab_${i}`);
            tab.setPosition(-120 + i * 120, 130);
            tab.addComponent(UITransform).setContentSize(100, 30);
            const l = tab.addComponent(Label);
            l.fontSize = 14;
            l.color = Color.WHITE;
            panel.addChild(tab);

            this._tabs.push(tab);

            const idx = i;
            tab.on(Node.EventType.TOUCH_END, () => {
              var _this$_onTabClick;

              return (_this$_onTabClick = this._onTabClick) == null ? void 0 : _this$_onTabClick.call(this, `tab_${idx}`);
            });
          }

          this._contentRoot = new Node('content');

          this._contentRoot.setPosition(0, 20);

          panel.addChild(this._contentRoot);

          const closeBtn = this._addLabel(panel, 'closeBtn', 190, 170, 'X', 16, Color.RED);

          closeBtn.on(Node.EventType.TOUCH_END, () => this.node.active = false);
        }

        render(vm) {
          var _this$_contentRoot;

          // 魂石
          if (this._soulStoneLabel) this._soulStoneLabel.string = T('ui.shopSoulStone', {
            count: vm.soulStones.amount
          }); // 标签页

          for (let i = 0; i < this._tabs.length; i++) {
            const tab = vm.tabs[i];

            const label = this._tabs[i].getComponent(Label);

            if (label && tab) {
              label.string = tab.label;
              label.color = tab.active ? Color.WHITE : Color.GRAY;
            }
          } // 商品列表


          (_this$_contentRoot = this._contentRoot) == null || _this$_contentRoot.removeAllChildren();
          this._items = [];

          for (const item of vm.items) {
            var _this$_contentRoot2;

            const node = this._buildItem(item);

            (_this$_contentRoot2 = this._contentRoot) == null || _this$_contentRoot2.addChild(node.root);

            this._items.push(node);
          }
        }

        _buildItem(item) {
          const root = new Node(`item_${item.id}`);
          root.addComponent(UITransform).setContentSize(400, 40);
          const y = -this._items.length * 45;
          root.setPosition(0, y);

          const nameL = this._addLabel(root, 'name', -160, 0, item.name, 13, Color.WHITE);

          const descL = this._addLabel(root, 'desc', -30, 0, item.description, 10, new Color(180, 180, 180));

          const costL = this._addLabel(root, 'cost', 130, 0, `${item.cost}`, 12, item.canAfford ? Color.YELLOW : Color.RED);

          const actionL = this._addLabel(root, 'action', 180, 0, item.actionLabel, 12, item.canAfford ? Color.GREEN : Color.GRAY);

          root.on(Node.EventType.TOUCH_END, () => {
            var _this$_onItemClick;

            return (_this$_onItemClick = this._onItemClick) == null ? void 0 : _this$_onItemClick.call(this, item.id);
          });
          return {
            root,
            nameL,
            descL,
            actionL,
            costL
          };
        }

        _addLabel(parent, name, x, y, text, size, color) {
          const n = new Node(name);
          n.setPosition(x, y);
          parent.addChild(n);
          const l = n.addComponent(Label);
          l.string = text;
          l.fontSize = size;
          l.color = color;
          n.addComponent(UITransform).setContentSize(200, 24);
          return n;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "panelRoot", [_dec2], {
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
//# sourceMappingURL=f28b1e89e0bbaf8a3aa3b29b83bc56d5e947816a.js.map