System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, UITransform, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _crd, ccclass, property, menu, CharacterPanelLayout;

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
      UITransform = _cc.UITransform;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "29334JNYAZJAJL9A18jHVsn", "CharacterPanelLayout", undefined);
      /**
       * CharacterPanelLayout - 角色管理面板内部布局组件
       *
       * 挂在 CharacterPanel/PanelRoot/PanelFrame/ContentRoot 上。
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'UITransform']);

      ({
        ccclass,
        property,
        menu
      } = _decorator);

      _export("CharacterPanelLayout", CharacterPanelLayout = (_dec = ccclass('CharacterPanelLayout'), _dec2 = menu('UI/CharacterPanelLayout'), _dec3 = property(Node), _dec4 = property(Node), _dec5 = property(Node), _dec6 = property(Node), _dec7 = property(Node), _dec8 = property(Node), _dec9 = property(Node), _dec(_class = _dec2(_class = (_class2 = class CharacterPanelLayout extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "titleLabel", _descriptor, this);

          _initializerDefineProperty(this, "soulStoneLabel", _descriptor2, this);

          _initializerDefineProperty(this, "currentName", _descriptor3, this);

          _initializerDefineProperty(this, "currentInfo", _descriptor4, this);

          _initializerDefineProperty(this, "currentStats", _descriptor5, this);

          _initializerDefineProperty(this, "slotContainer", _descriptor6, this);

          _initializerDefineProperty(this, "closeBtn", _descriptor7, this);
        }

        onEnable() {
          this.applyLayout();
        }
        /**
         * Ensure a `PreviewSlot [UITransform, Sprite]` exists under `contentRoot`
         * and return it. The 3D character preview from T1B mounts its RenderTexture
         * surface onto this node. Layout (size + position) is applied in applyLayout.
         * Safe to call repeatedly (idempotent).
         */


        static ensurePreviewSlot(contentRoot) {
          var slot = contentRoot.getChildByName('PreviewSlot');

          if (!slot) {
            slot = new Node('PreviewSlot');
            slot.addComponent(UITransform);
            contentRoot.addChild(slot);
          }

          return slot;
        }

        applyLayout() {
          var _this$titleLabel, _this$soulStoneLabel, _this$currentName, _this$currentInfo, _this$currentStats, _this$slotContainer, _this$closeBtn;

          var trans = this.node.getComponent(UITransform);
          if (!trans) return;
          var h = trans.height;
          (_this$titleLabel = this.titleLabel) == null || _this$titleLabel.setPosition(0, h / 2 - 40);
          (_this$soulStoneLabel = this.soulStoneLabel) == null || _this$soulStoneLabel.setPosition(0, h / 2 - 80); // PreviewSlot: current-character 3D showcase, upper-middle partition.
          // Placed just below the soul-stone label, on its own Y band so it never
          // overlaps the text info rows or the card list (SlotContainer).

          var slot = CharacterPanelLayout.ensurePreviewSlot(this.node);
          var slotTrans = slot.getComponent(UITransform);
          var slotSize = Math.round(Math.min(h * 0.28, 180));

          if (slotTrans) {
            slotTrans.setContentSize(slotSize, slotSize);
            slot.setPosition(0, h / 2 - 80 - slotSize / 2 - 16);
          }

          var below = h / 2 - 80 - slotSize - 40;
          (_this$currentName = this.currentName) == null || _this$currentName.setPosition(0, below);
          (_this$currentInfo = this.currentInfo) == null || _this$currentInfo.setPosition(0, below - 36);
          (_this$currentStats = this.currentStats) == null || _this$currentStats.setPosition(0, below - 72);
          (_this$slotContainer = this.slotContainer) == null || _this$slotContainer.setPosition(0, 20);
          (_this$closeBtn = this.closeBtn) == null || _this$closeBtn.setPosition(0, -h / 2 + 56);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "titleLabel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "soulStoneLabel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "currentName", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "currentInfo", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "currentStats", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "slotContainer", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "closeBtn", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=27a2119ec24a7b02969def82eea00beba310c776.js.map