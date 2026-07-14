System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Label, Button, StorageService, T, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _crd, ccclass, property, SettingsPanel;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfUiPanelId(extras) {
    _reporterNs.report("UiPanelId", "../UiRouter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUIPanel(extras) {
    _reporterNs.report("UIPanel", "../UiRouter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfStorageService(extras) {
    _reporterNs.report("StorageService", "../../platform/StorageService", _context.meta, extras);
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
      Button = _cc.Button;
    }, function (_unresolved_2) {
      StorageService = _unresolved_2.StorageService;
    }, function (_unresolved_3) {
      T = _unresolved_3.T;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "257d3YL04RFTokmQ9Enwcsv", "SettingsPanel", undefined);
      /**
       * SettingsPanel - Settings panel
       *
       * UIPanel implementation. Shows account info, version, reset button.
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Label', 'Button']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("SettingsPanel", SettingsPanel = (_dec = ccclass('SettingsPanel'), _dec2 = property(Node), _dec3 = property(Label), _dec4 = property(Label), _dec5 = property(Button), _dec6 = property(Button), _dec(_class = (_class2 = class SettingsPanel extends Component {
        constructor(...args) {
          super(...args);
          this.id = 'settings';

          _initializerDefineProperty(this, "panelRoot", _descriptor, this);

          _initializerDefineProperty(this, "versionLabel", _descriptor2, this);

          _initializerDefineProperty(this, "accountLabel", _descriptor3, this);

          _initializerDefineProperty(this, "resetBtn", _descriptor4, this);

          _initializerDefineProperty(this, "closeBtn", _descriptor5, this);
        }

        // ── UIPanel ──
        open(_params) {
          if (this.panelRoot) this.panelRoot.active = true;

          this._refresh();
        }

        close() {
          if (this.panelRoot) this.panelRoot.active = false;
        }

        refresh() {
          this._refresh();
        } // ── Lifecycle ──


        onLoad() {
          if (this.closeBtn) {
            this.closeBtn.node.on(Button.EventType.CLICK, () => this.close(), this);
          }

          if (this.resetBtn) {
            this.resetBtn.node.on(Button.EventType.CLICK, this._onReset, this);
          }
        } // ── Internal ──


        _refresh() {
          if (this.versionLabel) {
            this.versionLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.settingsVersion', {
              ver: '0.1.0'
            });
          }

          if (this.accountLabel) {
            const storage = (_crd && StorageService === void 0 ? (_reportPossibleCrUseOfStorageService({
              error: Error()
            }), StorageService) : StorageService).instance;
            const openid = storage.get('platform_user_id', '');
            const isGuest = storage.get('is_guest', 'false') === 'true';
            const type = isGuest ? (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.settingsGuest') : (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.settingsPlatform');
            this.accountLabel.string = (_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.settingsAccount', {
              type,
              id: openid.slice(0, 8) + '...'
            });
          }
        }

        _onReset() {
          // TODO: confirm dialog before reset
          console.log('[SettingsPanel] reset requested');
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "panelRoot", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "versionLabel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "accountLabel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "resetBtn", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "closeBtn", [_dec6], {
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
//# sourceMappingURL=54792493cd71ac851878223cb149f90258de24d4.js.map