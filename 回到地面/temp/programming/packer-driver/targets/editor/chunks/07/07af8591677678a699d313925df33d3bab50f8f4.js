System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, Label, Button, AppFlowController, AppFlowState, PlatformService, StorageService, T, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _crd, ccclass, property, LoginPanel;

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

  function _reportPossibleCrUseOfPlatformService(extras) {
    _reporterNs.report("PlatformService", "../../platform/PlatformService", _context.meta, extras);
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
      AppFlowController = _unresolved_2.AppFlowController;
      AppFlowState = _unresolved_2.AppFlowState;
    }, function (_unresolved_3) {
      PlatformService = _unresolved_3.PlatformService;
    }, function (_unresolved_4) {
      StorageService = _unresolved_4.StorageService;
    }, function (_unresolved_5) {
      T = _unresolved_5.T;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "87fd5mICwRNqbcTf96zdXgp", "LoginPanel", undefined);
      /**
       * LoginPanel - Platform login / guest login panel (Adpater-ready)
       *
       * UIPanel implementation. Opened by AppFlowController when AUTH_CHECK state is active.
       * On login success, calls AppFlowController.goTo(PROFILE_CHECK) for routing.
       *
       * Uses PlatformService (Adapter pattern) instead of direct wx.* calls.
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Label', 'Button', 'Sprite', 'Color']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("LoginPanel", LoginPanel = (_dec = ccclass('LoginPanel'), _dec2 = property(Node), _dec3 = property(Label), _dec4 = property(Label), _dec5 = property(Node), _dec6 = property(Button), _dec7 = property(Label), _dec8 = property(Label), _dec(_class = (_class2 = class LoginPanel extends Component {
        constructor(...args) {
          super(...args);
          this.id = 'login';

          _initializerDefineProperty(this, "panelRoot", _descriptor, this);

          _initializerDefineProperty(this, "titleLabel", _descriptor2, this);

          _initializerDefineProperty(this, "subtitleLabel", _descriptor3, this);

          /** Platform login button — platform-specific (WeChat / TapTap / generic) */
          _initializerDefineProperty(this, "platformLoginBtn", _descriptor4, this);

          _initializerDefineProperty(this, "guestBtn", _descriptor5, this);

          _initializerDefineProperty(this, "agreementLabel", _descriptor6, this);

          _initializerDefineProperty(this, "statusLabel", _descriptor7, this);

          this._retryCount = 0;
        }

        // ── UIPanel ──
        open(_params) {
          if (this.panelRoot) this.panelRoot.active = true;
          this._retryCount = 0;
          if (this.statusLabel) this.statusLabel.string = ''; // Dev mode: auto-skip to logged-in

          const platform = (_crd && PlatformService === void 0 ? (_reportPossibleCrUseOfPlatformService({
            error: Error()
          }), PlatformService) : PlatformService).instance;

          if (platform.isDev) {
            console.log('[LoginPanel] dev mode, auto login');
            (_crd && StorageService === void 0 ? (_reportPossibleCrUseOfStorageService({
              error: Error()
            }), StorageService) : StorageService).instance.set('platform_user_id', 'dev_user');

            this._onLoginSuccess();

            return;
          } // Check if already logged in (platform_user_id exists)


          const existingUserId = platform.getUserId();

          if (existingUserId) {
            console.log('[LoginPanel] already logged in:', existingUserId);

            this._onLoginSuccess();
          }
        }

        close() {
          if (this.panelRoot) this.panelRoot.active = false;
        } // ── Lifecycle ──


        onLoad() {
          if (this.platformLoginBtn) {
            this.platformLoginBtn.on(Node.EventType.TOUCH_END, this._onPlatformLogin, this);
          }

          if (this.guestBtn) {
            this.guestBtn.node.on(Button.EventType.CLICK, this._onGuestLogin, this);
          }

          if (this.agreementLabel) {
            this.agreementLabel.node.on(Node.EventType.TOUCH_END, () => {
              console.log('[LoginPanel] agreement clicked'); // TODO: show agreement detail popup
            });
          }
        } // ── Handlers ──


        async _onPlatformLogin() {
          this._setStatus((_crd && T === void 0 ? (_reportPossibleCrUseOfT({
            error: Error()
          }), T) : T)('ui.loading'));

          this._setButtonsEnabled(false);

          try {
            const platform = (_crd && PlatformService === void 0 ? (_reportPossibleCrUseOfPlatformService({
              error: Error()
            }), PlatformService) : PlatformService).instance;
            const result = await platform.login();

            if (result.success && result.userId) {
              (_crd && StorageService === void 0 ? (_reportPossibleCrUseOfStorageService({
                error: Error()
              }), StorageService) : StorageService).instance.set('platform_user_id', result.userId);
              (_crd && StorageService === void 0 ? (_reportPossibleCrUseOfStorageService({
                error: Error()
              }), StorageService) : StorageService).instance.remove('is_guest');

              this._onLoginSuccess();
            } else {
              this._retryCount++;

              if (this._retryCount >= 3) {
                this._setStatus((_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                  error: Error()
                }), T) : T)('ui.loginFailed'));
              } else {
                this._setStatus((_crd && T === void 0 ? (_reportPossibleCrUseOfT({
                  error: Error()
                }), T) : T)('ui.loginRetry', {
                  n: this._retryCount
                }));
              }

              this._setButtonsEnabled(true);
            }
          } catch (err) {
            console.error('[LoginPanel] platform login error:', err);

            this._setStatus((_crd && T === void 0 ? (_reportPossibleCrUseOfT({
              error: Error()
            }), T) : T)('ui.loginFailed'));

            this._setButtonsEnabled(true);
          }
        }

        _onGuestLogin() {
          const guestId = 'guest_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
          (_crd && StorageService === void 0 ? (_reportPossibleCrUseOfStorageService({
            error: Error()
          }), StorageService) : StorageService).instance.set('platform_user_id', guestId);
          (_crd && StorageService === void 0 ? (_reportPossibleCrUseOfStorageService({
            error: Error()
          }), StorageService) : StorageService).instance.set('is_guest', 'true');
          console.log('[LoginPanel] guest login:', guestId);

          this._onLoginSuccess();
        }

        _onLoginSuccess() {
          console.log('[LoginPanel] login success, proceeding');
          this.close(); // Route to next state

          const appFlow = (_crd && AppFlowController === void 0 ? (_reportPossibleCrUseOfAppFlowController({
            error: Error()
          }), AppFlowController) : AppFlowController).instance;

          if (appFlow) {
            appFlow.goTo((_crd && AppFlowState === void 0 ? (_reportPossibleCrUseOfAppFlowState({
              error: Error()
            }), AppFlowState) : AppFlowState).PROFILE_CHECK);
          }
        } // ── Helpers ──


        _setStatus(msg) {
          if (this.statusLabel) this.statusLabel.string = msg;
        }

        _setButtonsEnabled(enabled) {
          if (this.platformLoginBtn) this.platformLoginBtn.getComponent(Button).interactable = enabled;
          if (this.guestBtn) this.guestBtn.interactable = enabled;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "panelRoot", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "titleLabel", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "subtitleLabel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "platformLoginBtn", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "guestBtn", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "agreementLabel", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "statusLabel", [_dec8], {
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
//# sourceMappingURL=07af8591677678a699d313925df33d3bab50f8f4.js.map