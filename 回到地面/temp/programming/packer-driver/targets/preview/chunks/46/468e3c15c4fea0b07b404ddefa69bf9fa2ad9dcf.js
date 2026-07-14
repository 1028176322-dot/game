System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Label, Button, Color, Vec3, PlayerDataManager, T, SceneModelPreview, CharacterPanelLayout, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _crd, ccclass, property, CHAR_SLOTS, CharacterPanel;

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

  function _reportPossibleCrUseOfPlayerDataManager(extras) {
    _reporterNs.report("PlayerDataManager", "../../core/PlayerDataManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfT(extras) {
    _reporterNs.report("T", "../../core/TextManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSceneModelPreview(extras) {
    _reporterNs.report("SceneModelPreview", "../../render/SceneModelPreview", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPreviewHandle(extras) {
    _reporterNs.report("PreviewHandle", "../../render/SceneModelPreview", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCharacterPanelLayout(extras) {
    _reporterNs.report("CharacterPanelLayout", "../layout/CharacterPanelLayout", _context.meta, extras);
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
      Color = _cc.Color;
      Vec3 = _cc.Vec3;
    }, function (_unresolved_2) {
      PlayerDataManager = _unresolved_2.PlayerDataManager;
    }, function (_unresolved_3) {
      T = _unresolved_3.T;
    }, function (_unresolved_4) {
      SceneModelPreview = _unresolved_4.SceneModelPreview;
    }, function (_unresolved_5) {
      CharacterPanelLayout = _unresolved_5.CharacterPanelLayout;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "586d18p6P5P4ICdgjBEw+T0", "CharacterPanel", undefined);
      /**
       * CharacterPanel - Character selection and management panel
       *
       * UIPanel implementation. Shows all unlocked/locked character slots.
       * Allows switching active character, unlocking new ones, and creating new characters.
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Label', 'Button', 'Sprite', 'Color', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);
      CHAR_SLOTS = [{
        id: 'warrior',
        classKey: 'class.bearWarrior',
        unlockCost: 500
      }, {
        id: 'archer',
        classKey: 'class.deerArcher',
        unlockCost: 500
      }, {
        id: 'assassin',
        classKey: 'class.foxAssassin',
        unlockCost: 800
      }, {
        id: 'mage',
        classKey: 'class.rabbitMage',
        unlockCost: 1000
      }, {
        id: 'berserker',
        classKey: 'class.boarBerserker',
        unlockCost: 1200
      }];

      _export("CharacterPanel", CharacterPanel = (_dec = ccclass('CharacterPanel'), _dec2 = property(Node), _dec3 = property(Label), _dec4 = property(Label), _dec5 = property(Label), _dec6 = property(Label), _dec7 = property(Label), _dec8 = property(Node), _dec9 = property(Button), _dec(_class = (_class2 = class CharacterPanel extends Component {
        constructor() {
          super(...arguments);
          this.id = 'character';

          _initializerDefineProperty(this, "panelRoot", _descriptor, this);

          _initializerDefineProperty(this, "titleLabel", _descriptor2, this);

          _initializerDefineProperty(this, "soulStoneLabel", _descriptor3, this);

          _initializerDefineProperty(this, "currentName", _descriptor4, this);

          _initializerDefineProperty(this, "currentInfo", _descriptor5, this);

          _initializerDefineProperty(this, "currentStats", _descriptor6, this);

          _initializerDefineProperty(this, "slotContainer", _descriptor7, this);

          _initializerDefineProperty(this, "closeBtn", _descriptor8, this);

          // 3D preview (T3): slot + handle + generation token to guard in-flight leaks.
          this._previewSlot = null;
          this._previewHandle = null;
          this._previewGen = 0;
        }

        // ── UIPanel ──
        open(_params) {
          if (this.panelRoot) this.panelRoot.active = true;
          void this._refresh();
        }

        close() {
          var _this$_previewHandle;

          // Drop the 3D preview before hiding so no RT/rig leaks across open/close.
          this._previewGen++;
          (_this$_previewHandle = this._previewHandle) == null || _this$_previewHandle.destroy();
          this._previewHandle = null;
          (_crd && SceneModelPreview === void 0 ? (_reportPossibleCrUseOfSceneModelPreview({
            error: Error()
          }), SceneModelPreview) : SceneModelPreview).instance.clearOwner('CharacterPanel');
          if (this.panelRoot) this.panelRoot.active = false;
        }

        refresh() {
          void this._refresh();
        } // ── Lifecycle ──


        onLoad() {
          if (this.closeBtn) {
            this.closeBtn.node.on(Button.EventType.CLICK, () => this.close(), this);
          }
        } // ── Render ──


        _refresh() {
          var _this = this;

          return _asyncToGenerator(function* () {
            var _this$_previewHandle2;

            var pdm = (_crd && PlayerDataManager === void 0 ? (_reportPossibleCrUseOfPlayerDataManager({
              error: Error()
            }), PlayerDataManager) : PlayerDataManager).getInstance(); // Soul stones

            if (_this.soulStoneLabel) {
              _this.soulStoneLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                error: Error()
              }), T) : T)('ui.charSoulStones', {
                count: pdm.getSoulStones()
              });
            } // Current character card


            var selectedId = pdm.getSelectedCharacterId();
            var slotInfo = CHAR_SLOTS.find(s => s.id === selectedId);
            var className = slotInfo ? (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)(slotInfo.classKey) : (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.unknown');

            if (_this.currentName) {
              _this.currentName.string = className;
            }

            if (_this.currentInfo) {
              _this.currentInfo.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                error: Error()
              }), T) : T)('ui.charInfo', {
                name: pdm.getCharacterName() || (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                  error: Error()
                }), T) : T)('ui.defaultName'),
                floor: pdm.getBestFloor()
              });
            }

            if (_this.currentStats) {
              _this.currentStats.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                error: Error()
              }), T) : T)('ui.charStats', {
                count: pdm.getTotalRuns()
              });
            } // Other character slots


            _this._buildSlots(pdm, selectedId); // 3D character preview in PreviewSlot (T3). Re-acquire every refresh so
            // switching characters swaps the model; destroy the previous handle first.


            _this._previewGen++;
            (_this$_previewHandle2 = _this._previewHandle) == null || _this$_previewHandle2.destroy();
            _this._previewHandle = null;

            var slot = _this._ensurePreviewSlot();

            if (!slot) return; // no slot -> safe no-op, keep text-only UI

            var gen = _this._previewGen;
            var handle = yield (_crd && SceneModelPreview === void 0 ? (_reportPossibleCrUseOfSceneModelPreview({
              error: Error()
            }), SceneModelPreview) : SceneModelPreview).instance.showCharacterInSlot(slot, selectedId, 'idle', {
              ownerId: 'CharacterPanel',
              forceUnlit: true
            }); // A newer refresh may have started while this await was pending; if so,
            // the resolved handle is stale and must be dropped to avoid leaks.

            if (gen !== _this._previewGen) {
              handle == null || handle.destroy();
              return;
            }

            _this._previewHandle = handle;
          })();
        }

        _ensurePreviewSlot() {
          var _ref, _this$panelRoot$getCh, _this$panelRoot, _this$panelRoot2;

          if (this._previewSlot) return this._previewSlot; // Resolve ContentRoot per structure tree (PanelRoot/PanelFrame/ContentRoot);
          // fall back to panelRoot if the scene tree has no nested ContentRoot.

          var contentRoot = (_ref = (_this$panelRoot$getCh = (_this$panelRoot = this.panelRoot) == null ? void 0 : _this$panelRoot.getChildByPath('PanelFrame/ContentRoot')) != null ? _this$panelRoot$getCh : (_this$panelRoot2 = this.panelRoot) == null ? void 0 : _this$panelRoot2.getChildByName('ContentRoot')) != null ? _ref : this.panelRoot;

          if (!contentRoot) {
            console.warn('[CharacterPanel] no ContentRoot; skip 3D preview');
            return null;
          }

          this._previewSlot = (_crd && CharacterPanelLayout === void 0 ? (_reportPossibleCrUseOfCharacterPanelLayout({
            error: Error()
          }), CharacterPanelLayout) : CharacterPanelLayout).ensurePreviewSlot(contentRoot);
          return this._previewSlot;
        }

        _buildSlots(pdm, selectedId) {
          if (!this.slotContainer) return;
          this.slotContainer.removeAllChildren();
          var unlocked = pdm.getUnlockedCharacterIds();
          CHAR_SLOTS.forEach(slot => {
            if (slot.id === selectedId) return; // skip current

            var isUnlocked = unlocked.includes(slot.id);
            var isDefault = slot.id === 'warrior';
            var canAfford = pdm.getSoulStones() >= slot.unlockCost;
            var className = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)(slot.classKey);
            var row = new Node(slot.id);
            row.setPosition(0, 0);

            if (isUnlocked) {
              this._addRowLabel(row, (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                error: Error()
              }), T) : T)('ui.charUnlocked', {
                class: className
              }), -150, 0);

              this._addRowButton(row, (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                error: Error()
              }), T) : T)('ui.charSelect'), 160, 0, () => {
                pdm.selectCharacter(slot.id);
                void this._refresh();
              });
            } else if (isDefault) {
              this._addRowLabel(row, (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                error: Error()
              }), T) : T)('ui.charDefault', {
                class: className
              }), -150, 0);

              this._addRowButton(row, (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                error: Error()
              }), T) : T)('ui.charSelect'), 160, 0, () => {
                pdm.selectCharacter(slot.id);
                void this._refresh();
              });
            } else {
              this._addRowLabel(row, (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                error: Error()
              }), T) : T)('ui.charLocked', {
                class: className,
                cost: slot.unlockCost
              }), -150, 0);

              this._addRowButton(row, (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                error: Error()
              }), T) : T)('ui.charUnlock'), 160, 0, () => {
                if (canAfford) {
                  pdm.unlockCharacter(slot.id);
                  void this._refresh();
                }
              }, !canAfford);
            }

            this.slotContainer.addChild(row);
          });
        }

        _addRowLabel(parent, text, x, y) {
          var label = parent.addComponent(Label);
          label.string = text;
          label.fontSize = 14;
          label.color = new Color(0x33, 0x33, 0x33, 0xFF);
          label.position = new Vec3(x, y, 0);
        }

        _addRowButton(parent, text, x, y, cb, disabled) {
          if (disabled === void 0) {
            disabled = false;
          }

          var btn = new Node('btn_' + text);
          btn.setPosition(x, y);

          if (!disabled) {
            btn.on(Node.EventType.TOUCH_END, cb);
          }

          var label = btn.addComponent(Label);
          label.string = text;
          label.fontSize = 13;
          label.color = disabled ? new Color(0xCC, 0xCC, 0xCC, 0xFF) : new Color(0x4A, 0x9E, 0xFF, 0xFF);
          parent.addChild(btn);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "panelRoot", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "titleLabel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "soulStoneLabel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "currentName", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "currentInfo", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "currentStats", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "slotContainer", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "closeBtn", [_dec9], {
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
//# sourceMappingURL=468e3c15c4fea0b07b404ddefa69bf9fa2ad9dcf.js.map