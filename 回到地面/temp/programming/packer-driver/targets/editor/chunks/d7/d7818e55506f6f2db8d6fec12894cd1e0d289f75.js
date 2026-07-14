System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, UITransform, Label, HorizontalTextAlignment, VerticalTextAlignment, Size, NodeRef, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _crd, ccclass, property, menu, CreatePanelLayout;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfNodeRef(extras) {
    _reporterNs.report("NodeRef", "../../utils/NodeRef", _context.meta, extras);
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
      UITransform = _cc.UITransform;
      Label = _cc.Label;
      HorizontalTextAlignment = _cc.HorizontalTextAlignment;
      VerticalTextAlignment = _cc.VerticalTextAlignment;
      Size = _cc.Size;
    }, function (_unresolved_2) {
      NodeRef = _unresolved_2.NodeRef;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "658716fJAtL7JV52O725hCS", "CreatePanelLayout", undefined);
      /**
       * Zone-internal layout for CreatePanel.
       *
       * This component is code-driven. Scene references may become stale after node
       * moves, so every lookup falls back to stable child paths under ContentRoot.
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'UITransform', 'Label', 'HorizontalTextAlignment', 'VerticalTextAlignment', 'Size']);

      ({
        ccclass,
        property,
        menu
      } = _decorator);

      _export("CreatePanelLayout", CreatePanelLayout = (_dec = ccclass('CreatePanelLayout'), _dec2 = menu('UI/CreatePanelLayout'), _dec3 = property(Node), _dec4 = property(Node), _dec5 = property(Node), _dec6 = property(Node), _dec7 = property(Node), _dec8 = property(Node), _dec9 = property(Node), _dec10 = property(Node), _dec11 = property(Node), _dec(_class = _dec2(_class = (_class2 = class CreatePanelLayout extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "titleLabel", _descriptor, this);

          _initializerDefineProperty(this, "modelDisplay", _descriptor2, this);

          _initializerDefineProperty(this, "cardRoot", _descriptor3, this);

          _initializerDefineProperty(this, "selectedInfo", _descriptor4, this);

          _initializerDefineProperty(this, "selectedDesc", _descriptor5, this);

          _initializerDefineProperty(this, "confirmBtn", _descriptor6, this);

          _initializerDefineProperty(this, "skipBtn", _descriptor7, this);

          _initializerDefineProperty(this, "errorLabel", _descriptor8, this);

          _initializerDefineProperty(this, "nameInput", _descriptor9, this);
        }

        onEnable() {
          this.applyLayout();
        }

        applyLayout() {
          var _this$node$getCompone, _this$node$getCompone2;

          const contentSize = (_this$node$getCompone = (_this$node$getCompone2 = this.node.getComponent(UITransform)) == null ? void 0 : _this$node$getCompone2.contentSize) != null ? _this$node$getCompone : new Size(680, 500);

          this._layoutTitle(contentSize);

          this._layoutPreview(contentSize);

          this._layoutChoices(contentSize);

          this._layoutInfo(contentSize);

          this._layoutActions(contentSize);

          this._layoutNameInput(contentSize);
        }

        _layoutTitle(contentSize) {
          const title = this._node(this.titleLabel, 'HeaderZone/TitleLabel');

          this._setSize(title, Math.min(contentSize.width, 520), 40);

          title == null || title.setPosition(0, 0);

          this._formatLabel(title, 28, 34, Label.Overflow.SHRINK);
        }

        _layoutPreview(contentSize) {
          const preview = this._node(this.modelDisplay, 'PreviewZone/ModelDisplay');

          this._setSize(preview, Math.min(contentSize.width - 48, 260), 150);

          preview == null || preview.setPosition(0, 0);
        }

        _layoutChoices(contentSize) {
          const cards = this._node(this.cardRoot, 'ChoiceZone/CardRoot');

          this._setSize(cards, Math.min(contentSize.width - 32, 620), 52);

          cards == null || cards.setPosition(0, 0);
        }

        _layoutInfo(contentSize) {
          const info = this._node(this.selectedInfo, 'InfoZone/SelectedInfo');

          const desc = this._node(this.selectedDesc, 'InfoZone/SelectedDesc');

          this._setSize(info, Math.min(contentSize.width - 64, 480), 28);

          this._setSize(desc, Math.min(contentSize.width - 64, 560), 40);

          info == null || info.setPosition(0, 17);
          desc == null || desc.setPosition(0, -18);

          this._formatLabel(info, 22, 26, Label.Overflow.SHRINK);

          this._formatLabel(desc, 20, 24, Label.Overflow.SHRINK);
        }

        _layoutActions(contentSize) {
          var _this$node$parent, _panelRootTrans$width, _panelRootTrans$heigh;

          const confirm = this._node(this.confirmBtn, 'ConfirmBtn');

          const skip = this._node(this.skipBtn, 'SkipBtn');

          const error = this._node(this.errorLabel, 'ActionZone/ErrorLabel');

          this._setSize(confirm, 200, 62);

          this._setSize(skip, 200, 62);

          this._setSize(error, Math.min(contentSize.width - 64, 480), 22); // Confirm/Skip buttons are now children of PanelRoot so they can be
          // freely positioned at the bottom-left / bottom-right corners of the panel.


          const panelRoot = (_this$node$parent = this.node.parent) == null ? void 0 : _this$node$parent.parent; // ContentRoot -> PanelFrame -> PanelRoot

          const panelRootTrans = panelRoot == null ? void 0 : panelRoot.getComponent(UITransform);
          const panelW = (_panelRootTrans$width = panelRootTrans == null ? void 0 : panelRootTrans.width) != null ? _panelRootTrans$width : 1280;
          const panelH = (_panelRootTrans$heigh = panelRootTrans == null ? void 0 : panelRootTrans.height) != null ? _panelRootTrans$heigh : 720;
          const marginX = 24; // margin from left/right panel edge

          const marginY = 20; // margin from bottom panel edge

          const btnHalfW = 100; // 200 / 2

          const btnHalfH = 31; // 62 / 2

          const leftX = -panelW / 2 + marginX + btnHalfW;
          const rightX = panelW / 2 - marginX - btnHalfW;
          const bottomY = -panelH / 2 + marginY + btnHalfH;
          confirm == null || confirm.setPosition(leftX, bottomY);
          skip == null || skip.setPosition(rightX, bottomY); // Error label stays centered above the buttons.

          error == null || error.setPosition(0, bottomY + 50);

          this._formatButtonLabel(confirm, 22);

          this._formatButtonLabel(skip, 22);

          this._formatLabel(error, 18, 22, Label.Overflow.SHRINK);
        }

        _layoutNameInput(contentSize) {
          const input = this._node(this.nameInput, 'NameInput');

          this._setSize(input, Math.min(contentSize.width - 96, 420), 46);

          input == null || input.setPosition(0, 0);
        }

        _setSize(node, width, height) {
          var _transform;

          let transform = node == null ? void 0 : node.getComponent(UITransform);

          if (node && !transform) {
            transform = node.addComponent(UITransform);
          }

          (_transform = transform) == null || _transform.setContentSize(width, height);
        }

        _formatButtonLabel(node, fontSize) {
          const label = node == null ? void 0 : node.getComponentInChildren(Label);
          if (!label) return;

          this._applyLabelStyle(label, fontSize, fontSize + 4, Label.Overflow.SHRINK);
        }

        _formatLabel(node, fontSize, lineHeight, overflow) {
          var _node$getComponent;

          const label = (_node$getComponent = node == null ? void 0 : node.getComponent(Label)) != null ? _node$getComponent : node == null ? void 0 : node.getComponentInChildren(Label);
          if (!label) return;

          this._applyLabelStyle(label, fontSize, lineHeight, overflow);
        }

        _applyLabelStyle(label, fontSize, lineHeight, overflow) {
          label.fontSize = fontSize;
          label.lineHeight = lineHeight;
          label.overflow = overflow;
          label.horizontalAlign = HorizontalTextAlignment.CENTER;
          label.verticalAlign = VerticalTextAlignment.CENTER;
        }

        _node(ref, path) {
          var _find;

          return (_find = (_crd && NodeRef === void 0 ? (_reportPossibleCrUseOfNodeRef({
            error: Error()
          }), NodeRef) : NodeRef).find(this.node, path)) != null ? _find : (_crd && NodeRef === void 0 ? (_reportPossibleCrUseOfNodeRef({
            error: Error()
          }), NodeRef) : NodeRef).node(ref);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "titleLabel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "modelDisplay", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "cardRoot", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "selectedInfo", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "selectedDesc", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "confirmBtn", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "skipBtn", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "errorLabel", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "nameInput", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      })), _class2)) || _class) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=d7818e55506f6f2db8d6fec12894cd1e0d289f75.js.map