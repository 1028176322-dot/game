System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Label, Button, EditBox, Sprite, Color, UITransform, HorizontalTextAlignment, VerticalTextAlignment, AppFlowController, AppFlowState, PlayerDataManager, T, UISkinService, SceneModelPreview, _dec, _dec2, _class, _class2, _descriptor, _crd, ccclass, property, CHAR_OPTIONS, CARD_WIDTH, BUTTON_HEIGHT, CARD_GAP, CreatePanel;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfUiPanelId(extras) {
    _reporterNs.report("UiPanelId", "../UiRouter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUIPanel(extras) {
    _reporterNs.report("UIPanel", "../UiRouter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAppFlowController(extras) {
    _reporterNs.report("AppFlowController", "../../app/AppFlowController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAppFlowState(extras) {
    _reporterNs.report("AppFlowState", "../../app/AppFlowController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerDataManager(extras) {
    _reporterNs.report("PlayerDataManager", "../../core/PlayerDataManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfT(extras) {
    _reporterNs.report("T", "../../core/TextManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUISkinService(extras) {
    _reporterNs.report("UISkinService", "../UISkinService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSceneModelPreview(extras) {
    _reporterNs.report("SceneModelPreview", "../../render/SceneModelPreview", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPreviewHandle(extras) {
    _reporterNs.report("PreviewHandle", "../../render/SceneModelPreview", _context.meta, extras);
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
      Button = _cc.Button;
      EditBox = _cc.EditBox;
      Sprite = _cc.Sprite;
      Color = _cc.Color;
      UITransform = _cc.UITransform;
      HorizontalTextAlignment = _cc.HorizontalTextAlignment;
      VerticalTextAlignment = _cc.VerticalTextAlignment;
    }, function (_unresolved_2) {
      AppFlowController = _unresolved_2.AppFlowController;
      AppFlowState = _unresolved_2.AppFlowState;
    }, function (_unresolved_3) {
      PlayerDataManager = _unresolved_3.PlayerDataManager;
    }, function (_unresolved_4) {
      T = _unresolved_4.T;
    }, function (_unresolved_5) {
      UISkinService = _unresolved_5.UISkinService;
    }, function (_unresolved_6) {
      SceneModelPreview = _unresolved_6.SceneModelPreview;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "a21346T/DhBIZaiq06lcvZj", "CreatePanel", undefined);
      /**
       * CreatePanel - First-time character creation panel
       *
       * Two-phase flow:
       *   1. SELECT: player picks a character class from class buttons
       *      - SelectView: title / model display / class buttons / class info
       *   2. NAMING: player enters a name, then confirms to create character
       *      - NamingView: NamePanel / NameTitleLabel / NameInput / ErrorLabel
       *
       * ActionZone (shared, fixed at bottom of PanelRoot):
       *   - BackOrSkipBtn (left) and ConfirmBtn (right)
       *
       * Layout:
       *   All content nodes are children of PanelRoot (not PanelFrame/ContentRoot).
       *   SelectView and NamingView are mutually exclusive.
       *   ActionZone buttons positioned relative to PanelRoot center/bottom.
       *
       * Skin keys used: ui.create.class_btn, ui.create.class_btn_selected,
       *                 ui.create.confirm_btn, ui.create.skip_btn,
       *                 ui.create.name_panel, ui.create.name_input
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Label', 'Button', 'EditBox', 'Sprite', 'Color', 'UITransform', 'HorizontalTextAlignment', 'VerticalTextAlignment']);

      ({
        ccclass,
        property
      } = _decorator);
      CHAR_OPTIONS = [{
        id: 'warrior',
        animalKey: 'classAnimal.bear',
        classKey: 'class.bearWarrior',
        descKey: 'classDesc.bearWarrior'
      }, {
        id: 'archer',
        animalKey: 'classAnimal.deer',
        classKey: 'class.deerArcher',
        descKey: 'classDesc.deerArcher'
      }, {
        id: 'assassin',
        animalKey: 'classAnimal.fox',
        classKey: 'class.foxAssassin',
        descKey: 'classDesc.foxAssassin'
      }, {
        id: 'mage',
        animalKey: 'classAnimal.rabbit',
        classKey: 'class.rabbitMage',
        descKey: 'classDesc.rabbitMage'
      }, {
        id: 'berserker',
        animalKey: 'classAnimal.boar',
        classKey: 'class.boarBerserker',
        descKey: 'classDesc.boarBerserker'
      }];
      CARD_WIDTH = 104;
      BUTTON_HEIGHT = 48;
      CARD_GAP = 12;

      _export("CreatePanel", CreatePanel = (_dec = ccclass('CreatePanel'), _dec2 = property(Node), _dec(_class = (_class2 = class CreatePanel extends Component {
        constructor() {
          super(...arguments);
          this.id = 'create_character';

          _initializerDefineProperty(this, "panelRoot", _descriptor, this);

          // Dynamic sub-view roots
          this._selectView = null;
          this._namingView = null;
          this._actionZone = null;
          // Select phase nodes
          this._titleLabel = null;
          this._modelDisplay = null;
          this._previewHandle = null;
          this._previewGen = 0;
          this._cardRoot = null;
          this._selectedInfo = null;
          this._selectedDesc = null;
          // Naming phase nodes
          this._nameTitleLabel = null;
          this._namePanel = null;
          this._nameInput = null;
          this._errorLabel = null;
          // Shared action nodes
          this._confirmBtn = null;
          this._skipBtn = null;
          this._phase = 'select';
          this._selectedId = 'warrior';
          this._classCards = [];
        }

        // UIPanel
        open(_params) {
          var _CHAR_OPTIONS$find$id, _CHAR_OPTIONS$find;

          if (this.panelRoot) this.panelRoot.active = true;

          this._setPhase('select');

          this._layoutAll();

          this._buildCards(); // Default to the player's currently selected character (e.g. archer during 3D testing),
          // falling back to the first unlocked option and finally warrior.


          var pdm = (_crd && PlayerDataManager === void 0 ? (_reportPossibleCrUseOfPlayerDataManager({
            error: Error()
          }), PlayerDataManager) : PlayerDataManager).getInstance();
          var selected = pdm.selectedCharacter;
          var defaultId = CHAR_OPTIONS.some(c => c.id === selected) && pdm.isCharacterUnlocked(selected) ? selected : (_CHAR_OPTIONS$find$id = (_CHAR_OPTIONS$find = CHAR_OPTIONS.find(c => pdm.isCharacterUnlocked(c.id))) == null ? void 0 : _CHAR_OPTIONS$find.id) != null ? _CHAR_OPTIONS$find$id : 'warrior';

          this._selectCharacter(defaultId);

          this.scheduleOnce(() => {
            this._layoutAll();

            void this._updateModelDisplay(this._selectedId);
          }, 0);
        }

        close() {
          var _this$_previewHandle;

          // T1B: invalidate any in-flight preview + release the surface/handle.
          this._previewGen++;
          (_this$_previewHandle = this._previewHandle) == null || _this$_previewHandle.destroy();
          this._previewHandle = null;
          (_crd && SceneModelPreview === void 0 ? (_reportPossibleCrUseOfSceneModelPreview({
            error: Error()
          }), SceneModelPreview) : SceneModelPreview).instance.clearOwner('CreatePanel');
          if (this.panelRoot) this.panelRoot.active = false;
        } // Lifecycle


        onLoad() {
          if (this.node.name !== 'CreatePanel') {
            console.warn("[CreatePanel] disabled on " + this.node.name);
            this.enabled = false;
            return;
          }

          this._ensureRuntimeStructure();

          this._prepareIntegratedBackground();

          var confirmButton = this._confirmBtnNode();

          if (confirmButton) {
            confirmButton.node.on(Button.EventType.CLICK, this._onConfirm, this);
          }

          if (this._skipBtn) {
            this._skipBtn.on(Node.EventType.TOUCH_END, this._onSkip, this);
          }

          var editBox = this._editBox();

          if (editBox) {
            editBox.node.on('editing-did-ended', this._onNameEdited, this);
          }
        } // Runtime structure


        _ensureRuntimeStructure() {
          if (this._selectView) return; // already built

          var root = this.panelRoot;
          if (!root) return; // Remove any runtime-generated nodes from previous structure

          this._removeRuntimeNodes(root); // SelectView


          this._selectView = new Node('SelectView');
          root.addChild(this._selectView);

          var headerZone = this._createZone('HeaderZone', this._selectView);

          this._titleLabel = this._createLabelNode('TitleLabel', headerZone, (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)('ui.createTitle'), 28);

          var previewZone = this._createZone('PreviewZone', this._selectView);

          this._modelDisplay = new Node('ModelDisplay');

          this._modelDisplay.addComponent(UITransform).setContentSize(240, 150);

          previewZone.addChild(this._modelDisplay);

          var choiceZone = this._createZone('ChoiceZone', this._selectView);

          this._cardRoot = new Node('CardRoot');

          this._cardRoot.addComponent(UITransform).setContentSize(620, 52);

          choiceZone.addChild(this._cardRoot);

          var infoZone = this._createZone('InfoZone', this._selectView);

          this._selectedInfo = this._createLabelNode('SelectedInfo', infoZone, '', 22);
          this._selectedDesc = this._createLabelNode('SelectedDesc', infoZone, '', 20); // NamingView

          this._namingView = new Node('NamingView');
          this._namingView.active = false;
          root.addChild(this._namingView);
          this._namePanel = new Node('NamePanel');

          this._namePanel.addComponent(UITransform).setContentSize(620, 240);

          this._namePanel.addComponent(Sprite);

          this._namingView.addChild(this._namePanel);

          void (_crd && UISkinService === void 0 ? (_reportPossibleCrUseOfUISkinService({
            error: Error()
          }), UISkinService) : UISkinService).instance.applyOptional(this._namePanel, 'ui.create.name_panel');
          this._nameTitleLabel = this._createLabelNode('NameTitleLabel', this._namingView, (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)('ui.createNamePrompt'), 28);

          var nameTitleLabel = this._nameTitleLabel.getComponent(Label);

          if (nameTitleLabel) nameTitleLabel.color = new Color(92, 62, 32, 255);
          var nameInputNode = new Node('NameInput');
          nameInputNode.addComponent(UITransform).setContentSize(420, 64);
          nameInputNode.addComponent(Sprite);
          var editBox = nameInputNode.addComponent(EditBox);
          editBox.maxLength = 6;
          editBox.placeholder = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)('ui.createNamePlaceholder');
          var textLabelNode = new Node('TextLabel');
          textLabelNode.addComponent(UITransform).setContentSize(380, 36);
          var textLabel = textLabelNode.addComponent(Label);
          textLabel.fontSize = 22;
          textLabel.lineHeight = 26;
          textLabel.color = new Color(92, 62, 32, 255);
          nameInputNode.addChild(textLabelNode);
          editBox.textLabel = textLabel;
          var placeholderNode = new Node('PlaceholderLabel');
          placeholderNode.addComponent(UITransform).setContentSize(380, 36);
          var placeholderLabel = placeholderNode.addComponent(Label);
          placeholderLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)('ui.createNamePlaceholder');
          placeholderLabel.fontSize = 22;
          placeholderLabel.lineHeight = 26;
          placeholderLabel.color = new Color(120, 92, 58, 220);
          nameInputNode.addChild(placeholderNode);
          editBox.placeholderLabel = placeholderLabel;
          void (_crd && UISkinService === void 0 ? (_reportPossibleCrUseOfUISkinService({
            error: Error()
          }), UISkinService) : UISkinService).instance.applyOptional(nameInputNode, 'ui.create.name_input');

          this._namingView.addChild(nameInputNode);

          this._nameInput = nameInputNode;
          this._errorLabel = this._createLabelNode('ErrorLabel', this._namingView, '', 18);
          this._errorLabel.active = false; // ActionZone

          this._actionZone = new Node('ActionZone');
          root.addChild(this._actionZone);
          this._skipBtn = this._createButtonNode('BackOrSkipBtn', this._actionZone, (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)('ui.skip'), 'ui.create.skip_btn');
          this._confirmBtn = this._createButtonNode('ConfirmBtn', this._actionZone, (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)('ui.createConfirm'), 'ui.create.confirm_btn');
        }
        /** Remove any runtime-created nodes (SelectView, NamingView, ActionZone) from PanelRoot. */


        _removeRuntimeNodes(root) {
          ['SelectView', 'NamingView', 'ActionZone'].forEach(name => {
            var child = root.getChildByName(name);
            if (child) root.removeChild(child);
          });
        }

        _prepareIntegratedBackground() {
          var root = this.panelRoot;
          var frame = root == null ? void 0 : root.getChildByName('PanelFrame');
          var mask = root == null ? void 0 : root.getChildByName('DimMask'); // Only disable the background sprites, never deactivate the nodes.
          // PanelFrame carries the ContentRoot subtree with all buttons/inputs.

          var frameSprite = frame == null ? void 0 : frame.getComponent(Sprite);
          if (frameSprite) frameSprite.enabled = false;
          var maskSprite = mask == null ? void 0 : mask.getComponent(Sprite);
          if (maskSprite) maskSprite.enabled = false;
        } // Layout

        /**
         * Position all sub-views and their children relative to PanelRoot.
         * Call after any phase change or content size change.
         */


        _layoutAll() {
          var _rootTrans$width, _rootTrans$height;

          var root = this.panelRoot;
          if (!root) return;
          var rootTrans = root.getComponent(UITransform);
          var pw = (_rootTrans$width = rootTrans == null ? void 0 : rootTrans.width) != null ? _rootTrans$width : 1280;
          var ph = (_rootTrans$height = rootTrans == null ? void 0 : rootTrans.height) != null ? _rootTrans$height : 720; // SelectView: centered, top zone starts at ph/2 - padding

          if (this._selectView) {
            var zoneNames = ['HeaderZone', 'PreviewZone', 'ChoiceZone', 'InfoZone'];
            var zoneHeights = [58, 178, 64, 84];
            var gap = 18;
            var padding = 18;
            var totalH = padding + zoneHeights.reduce((a, b) => a + b, 0) + (zoneHeights.length - 1) * gap + padding;
            var y = ph / 2 - padding;

            for (var i = 0; i < zoneNames.length; i++) {
              var zone = this._selectView.getChildByName(zoneNames[i]);

              if (!zone) continue;
              var trans = zone.getComponent(UITransform);
              if (trans) trans.setContentSize(pw, zoneHeights[i]);
              y -= zoneHeights[i] / 2;
              zone.setPosition(0, y);
              y -= zoneHeights[i] / 2 + gap;
            }
          } // NamingView: the panel is centered, with title/input/error inside it.


          if (this._namingView) {
            var _this$_namePanel, _this$_nameTitleLabel, _this$_nameInput, _this$_errorLabel;

            var panelY = 92;
            (_this$_namePanel = this._namePanel) == null || _this$_namePanel.setPosition(0, panelY);
            (_this$_nameTitleLabel = this._nameTitleLabel) == null || _this$_nameTitleLabel.setPosition(0, panelY + 72);
            (_this$_nameInput = this._nameInput) == null || _this$_nameInput.setPosition(0, panelY - 12);
            (_this$_errorLabel = this._errorLabel) == null || _this$_errorLabel.setPosition(0, panelY - 78);
          } // ActionZone: anchored to left/right edges of PanelRoot.
          // Confirm button stays on the left, skip/back button stays on the right.
          // Horizontal positions use panel width (pw) so they adapt to resolution.


          if (this._actionZone) {
            var _this$_confirmBtn, _this$_skipBtn;

            var btnW = 200;
            var btnH = 62;
            var marginX = 60; // margin from left/right panel edge

            var bottomMargin = 54; // distance from button center to bottom edge

            var btnY = -ph / 2 + bottomMargin;
            (_this$_confirmBtn = this._confirmBtn) == null || _this$_confirmBtn.setPosition(-pw / 2 + marginX + btnW / 2, btnY);
            (_this$_skipBtn = this._skipBtn) == null || _this$_skipBtn.setPosition(pw / 2 - marginX - btnW / 2, btnY);
          }
        } // Phase management


        _setPhase(phase) {
          var _this$_skipBtn2, _this$_confirmBtn2;

          this._phase = phase;
          var isSelect = phase === 'select';
          var isNaming = phase === 'naming';
          if (this._selectView) this._selectView.active = isSelect;
          if (this._namingView) this._namingView.active = isNaming; // When entering the naming phase the SelectView (and its PreviewZone
          // slot) is hidden, so the offscreen RT/rig must be released to avoid
          // leaks. Returning to select re-triggers _updateModelDisplay via _onSkip.

          if (isNaming) {
            var _this$_previewHandle2;

            this._previewGen++;
            (_this$_previewHandle2 = this._previewHandle) == null || _this$_previewHandle2.destroy();
            this._previewHandle = null;
          } // Update button labels


          var skipLabel = (_this$_skipBtn2 = this._skipBtn) == null ? void 0 : _this$_skipBtn2.getComponentInChildren(Label);

          if (skipLabel) {
            skipLabel.string = isNaming ? (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.areaBack') : (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.skip');
          }

          var confirmLabel = (_this$_confirmBtn2 = this._confirmBtn) == null ? void 0 : _this$_confirmBtn2.getComponentInChildren(Label);

          if (confirmLabel) {
            confirmLabel.string = isNaming ? (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.createConfirmName') : (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.createConfirm');
          }

          this._clearError();
        } // Factories


        _createZone(name, parent) {
          var node = new Node(name);
          node.addComponent(UITransform).setContentSize(640, 60);
          parent.addChild(node);
          return node;
        }

        _createLabelNode(name, parent, text, fontSize) {
          var node = new Node(name);
          node.addComponent(UITransform).setContentSize(360, fontSize + 8);
          var label = node.addComponent(Label);
          label.string = text;
          label.fontSize = fontSize;
          label.lineHeight = fontSize + 4;
          label.overflow = Label.Overflow.SHRINK;
          label.color = Color.WHITE;
          label.horizontalAlign = HorizontalTextAlignment.CENTER;
          label.verticalAlign = VerticalTextAlignment.CENTER;
          parent.addChild(node);
          return node;
        }

        _createButtonNode(name, parent, text, skinKey) {
          var node = new Node(name);
          node.addComponent(UITransform).setContentSize(200, 62);
          node.addComponent(Sprite);
          node.addComponent(Button);
          var labelNode = new Node('Label');
          labelNode.addComponent(UITransform).setContentSize(180, 50);
          var label = labelNode.addComponent(Label);
          label.string = text;
          label.fontSize = 22;
          label.lineHeight = 26;
          label.overflow = Label.Overflow.SHRINK;
          label.color = Color.WHITE;
          label.horizontalAlign = HorizontalTextAlignment.CENTER;
          label.verticalAlign = VerticalTextAlignment.CENTER;
          node.addChild(labelNode);
          parent.addChild(node);
          void (_crd && UISkinService === void 0 ? (_reportPossibleCrUseOfUISkinService({
            error: Error()
          }), UISkinService) : UISkinService).instance.applyOptional(node, skinKey);
          return node;
        } // Character cards


        _buildCards() {
          var _this = this;

          if (!this._cardRoot) return;

          this._cardRoot.removeAllChildren();

          this._classCards = [];
          var totalW = CHAR_OPTIONS.length * CARD_WIDTH + (CHAR_OPTIONS.length - 1) * CARD_GAP;
          var startX = -totalW / 2 + CARD_WIDTH / 2;

          var _loop = function _loop() {
            var opt = CHAR_OPTIONS[i];
            var btnNode = new Node("Btn_" + opt.id);
            btnNode.setPosition(startX + i * (CARD_WIDTH + CARD_GAP), 0);
            var trans = btnNode.addComponent(UITransform);
            trans.setContentSize(CARD_WIDTH, BUTTON_HEIGHT);
            btnNode.addComponent(Sprite);
            btnNode.addComponent(Button);
            void (_crd && UISkinService === void 0 ? (_reportPossibleCrUseOfUISkinService({
              error: Error()
            }), UISkinService) : UISkinService).instance.applyOptional(btnNode, 'ui.create.class_btn');
            var labelNode = new Node('Label');
            labelNode.setPosition(0, 0);
            var label = labelNode.addComponent(Label);
            label.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)(opt.classKey);
            label.fontSize = 16;
            label.lineHeight = 20;
            label.overflow = Label.Overflow.SHRINK;
            label.color = Color.WHITE;
            label.horizontalAlign = HorizontalTextAlignment.CENTER;
            label.verticalAlign = VerticalTextAlignment.CENTER;
            btnNode.addChild(labelNode);
            btnNode.on(Button.EventType.CLICK, () => _this._selectCharacter(opt.id), _this);

            _this._cardRoot.addChild(btnNode);

            _this._classCards.push(btnNode);
          };

          for (var i = 0; i < CHAR_OPTIONS.length; i++) {
            _loop();
          }
        } // Character selection


        _selectCharacter(id) {
          this._selectedId = id;
          var opt = CHAR_OPTIONS.find(c => c.id === id);
          if (!opt) return;
          void this._updateModelDisplay(id);

          if (this._selectedInfo) {
            var label = this._selectedInfo.getComponent(Label);

            if (label) label.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)(opt.animalKey) + " " + (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)(opt.classKey);
          }

          if (this._selectedDesc) {
            var _label = this._selectedDesc.getComponent(Label);

            if (_label) _label.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)(opt.descKey);
          }

          this._refreshSelectedButtonState();

          this._clearError();
        }
        /**
         * Render the selected class's 3D character into the offscreen RenderTexture
         * bound to the runtime ModelDisplay slot (T1A/T1B). `_modelDisplay` is the
         * runtime `PanelRoot/SelectView/PreviewZone/ModelDisplay` node (UITransform +
         * Sprite surface) — NOT a world-space anchor. Its position/size follow layout,
         * so the render adapts to resolution automatically.
         */


        _updateModelDisplay(id) {
          var _this2 = this;

          return _asyncToGenerator(function* () {
            var _this2$_previewHandle;

            if (!_this2._modelDisplay) return; // Generation token guards against stale-handle leaks: if a newer request
            // supersedes this in-flight mount, the resolved handle is discarded.

            var gen = ++_this2._previewGen; // Rebuild: release any previous preview first (covers class switching).

            (_this2$_previewHandle = _this2._previewHandle) == null || _this2$_previewHandle.destroy();
            _this2._previewHandle = null;
            var handle = yield (_crd && SceneModelPreview === void 0 ? (_reportPossibleCrUseOfSceneModelPreview({
              error: Error()
            }), SceneModelPreview) : SceneModelPreview).instance.showCharacterInSlot(_this2._modelDisplay, id, 'attack', {
              ownerId: 'CreatePanel',
              forceUnlit: true
            }); // If a newer request (class switch / phase change / close) superseded
            // this one while it was loading, discard the now-stale handle.

            if (gen !== _this2._previewGen) {
              handle == null || handle.destroy();
              return;
            }

            _this2._previewHandle = handle;
          })();
        }

        _refreshSelectedButtonState() {
          for (var card of this._classCards) {
            var selected = card.name === "Btn_" + this._selectedId;
            void (_crd && UISkinService === void 0 ? (_reportPossibleCrUseOfUISkinService({
              error: Error()
            }), UISkinService) : UISkinService).instance.applyOptional(card, selected ? 'ui.create.class_btn_selected' : 'ui.create.class_btn');
            card.setScale(selected ? 1.06 : 1, selected ? 1.06 : 1, 1);
          }
        } // Confirm / Skip / Back


        _onConfirm() {
          var _this$_editBox$string, _this$_editBox;

          if (this._phase === 'select') {
            this._setPhase('naming');

            this._layoutAll();

            return;
          }

          var name = (_this$_editBox$string = (_this$_editBox = this._editBox()) == null ? void 0 : _this$_editBox.string.trim()) != null ? _this$_editBox$string : '';

          if (!name) {
            this._showError((_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.createNameRequired'));

            return;
          }

          if (name.length > 6) {
            this._showError((_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.createNameTooLong'));

            return;
          }

          if (this._hasReservedWords(name)) {
            this._showError((_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.createNameBlocked'));

            return;
          }

          (_crd && PlayerDataManager === void 0 ? (_reportPossibleCrUseOfPlayerDataManager({
            error: Error()
          }), PlayerDataManager) : PlayerDataManager).getInstance().createCharacter(name, this._selectedId);
          this.close();
          var appFlow = (_crd && AppFlowController === void 0 ? (_reportPossibleCrUseOfAppFlowController({
            error: Error()
          }), AppFlowController) : AppFlowController).instance;
          if (appFlow) appFlow.goTo((_crd && AppFlowState === void 0 ? (_reportPossibleCrUseOfAppFlowState({
            error: Error()
          }), AppFlowState) : AppFlowState).MAIN_HUB);
        }

        _onSkip() {
          if (this._phase === 'naming') {
            this._setPhase('select');

            this._layoutAll();

            void this._updateModelDisplay(this._selectedId);
            return;
          }

          (_crd && PlayerDataManager === void 0 ? (_reportPossibleCrUseOfPlayerDataManager({
            error: Error()
          }), PlayerDataManager) : PlayerDataManager).getInstance().createCharacter((_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)('ui.defaultName'), 'warrior');
          this.close();
          var appFlow = (_crd && AppFlowController === void 0 ? (_reportPossibleCrUseOfAppFlowController({
            error: Error()
          }), AppFlowController) : AppFlowController).instance;
          if (appFlow) appFlow.goTo((_crd && AppFlowState === void 0 ? (_reportPossibleCrUseOfAppFlowState({
            error: Error()
          }), AppFlowState) : AppFlowState).MAIN_HUB);
        }

        _onNameEdited(editBox) {
          if (editBox.string.length > 6) {
            editBox.string = editBox.string.slice(0, 6);
          }

          if (editBox.string.trim().length > 0) {
            this._clearError();
          }
        }

        _hasReservedWords(name) {
          var reserved = ['admin', 'test', 'root', 'fuck', 'shit'];
          return reserved.some(w => name.toLowerCase().includes(w));
        }

        _showError(msg) {
          var _this$_errorLabel2;

          var label = (_this$_errorLabel2 = this._errorLabel) == null ? void 0 : _this$_errorLabel2.getComponent(Label);

          if (label) {
            label.string = msg;
            label.node.active = true;
          }
        }

        _clearError() {
          var _this$_confirmBtn3;

          if (this._errorLabel) this._errorLabel.active = false;
          var btn = (_this$_confirmBtn3 = this._confirmBtn) == null ? void 0 : _this$_confirmBtn3.getComponent(Button);
          if (btn) btn.interactable = true;
        } // Helpers


        _confirmBtnNode() {
          var _this$_confirmBtn$get, _this$_confirmBtn4;

          return (_this$_confirmBtn$get = (_this$_confirmBtn4 = this._confirmBtn) == null ? void 0 : _this$_confirmBtn4.getComponent(Button)) != null ? _this$_confirmBtn$get : null;
        }

        _editBox() {
          var _this$_nameInput$getC, _this$_nameInput2;

          return (_this$_nameInput$getC = (_this$_nameInput2 = this._nameInput) == null ? void 0 : _this$_nameInput2.getComponent(EditBox)) != null ? _this$_nameInput$getC : null;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "panelRoot", [_dec2], {
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
//# sourceMappingURL=bea92498a3270ab44558c9304f2613db3b8069e0.js.map