System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, sys, WebDevPlatformAdapter, WeChatPlatformAdapter, TapTapAndroidAdapter, NativeAndroidPlatformAdapter, PlatformService, _crd;

  function _reportPossibleCrUseOfPlatformAdapter(extras) {
    _reporterNs.report("PlatformAdapter", "./adapters/PlatformAdapter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlatformLoginResult(extras) {
    _reporterNs.report("PlatformLoginResult", "./PlatformTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfComplianceResult(extras) {
    _reporterNs.report("ComplianceResult", "./PlatformTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlatformInitOptions(extras) {
    _reporterNs.report("PlatformInitOptions", "./PlatformTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRuntimePlatform(extras) {
    _reporterNs.report("RuntimePlatform", "./PlatformTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfWebDevPlatformAdapter(extras) {
    _reporterNs.report("WebDevPlatformAdapter", "./adapters/WebDevPlatformAdapter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfWeChatPlatformAdapter(extras) {
    _reporterNs.report("WeChatPlatformAdapter", "./adapters/WeChatPlatformAdapter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTapTapAndroidAdapter(extras) {
    _reporterNs.report("TapTapAndroidAdapter", "./adapters/TapTapAndroidAdapter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfNativeAndroidPlatformAdapter(extras) {
    _reporterNs.report("NativeAndroidPlatformAdapter", "./adapters/NativeAndroidPlatformAdapter", _context.meta, extras);
  }

  _export("PlatformService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      sys = _cc.sys;
    }, function (_unresolved_2) {
      WebDevPlatformAdapter = _unresolved_2.WebDevPlatformAdapter;
    }, function (_unresolved_3) {
      WeChatPlatformAdapter = _unresolved_3.WeChatPlatformAdapter;
    }, function (_unresolved_4) {
      TapTapAndroidAdapter = _unresolved_4.TapTapAndroidAdapter;
    }, function (_unresolved_5) {
      NativeAndroidPlatformAdapter = _unresolved_5.NativeAndroidPlatformAdapter;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "64b36vKgVxJebDe7QtXJ6RN", "PlatformService", undefined);
      /**
       * PlatformService - 平台检测与初始化 (Adapter 模式)
       *
       * 统一管理运行环境判断和平台操作：
       * - 根据运行时环境自动选择适配器（WebDev / WeChat / Android / TapTap）
       * - 提供 init / login / logout / getUserId / checkCompliance / report 统一接口
       * - 保留便捷属性 isWX / isTapTap / isDev / hasGlobal
       *
       * 所有业务代码应通过 PlatformService 调用平台能力，不直接操作 wx.* / jsb.*
       */


      __checkObsolete__(['sys']);

      _export("PlatformService", PlatformService = class PlatformService {
        static get instance() {
          if (!this._instance) this._instance = new PlatformService();
          return this._instance;
        }

        constructor() {
          this._adapter = null;
          this._platform = 'unknown';
          this._channel = '';
          // Constructor no longer detects platform — deferred to init()
          this._platform = this._detectPlatform();
        } // ── Initialization ──

        /**
         * Initialize platform adapter. Must be called once at app startup.
         * @param options Optional init options to override auto-detection
         */


        async init(options) {
          const opt = options || {};
          this._channel = opt.channel || '';
          this._adapter = this._createAdapter();
          console.log(`[PlatformService] init: platform=${this._platform}, channel=${this._channel}, adapter=${this._adapter.platformId}`);
          await this._adapter.init(); // Migrate legacy storage keys

          this._migrateLegacyKeys();
        } // ── Platform Detection ──

        /** Detect runtime platform */


        _detectPlatform() {
          // Check WeChat Mini Game first
          if (sys.platform === 'wechatgame' || typeof wx !== 'undefined') {
            try {
              if (typeof wx !== 'undefined' && wx.getSystemInfoSync) return 'wechat_minigame';
            } catch {
              /* ignore */
            }
          } // Check native (Android) via jsb


          if (typeof jsb !== 'undefined') {
            // TapTap channel or plain Android
            return 'native_android';
          } // Fallback: browser / editor preview


          return 'web_dev';
        }
        /** Create the appropriate adapter based on detected platform */


        _createAdapter() {
          if (this._platform === 'wechat_minigame') {
            return new (_crd && WeChatPlatformAdapter === void 0 ? (_reportPossibleCrUseOfWeChatPlatformAdapter({
              error: Error()
            }), WeChatPlatformAdapter) : WeChatPlatformAdapter)();
          }

          if (this._platform === 'native_android') {
            if (this._channel === 'taptap') {
              return new (_crd && TapTapAndroidAdapter === void 0 ? (_reportPossibleCrUseOfTapTapAndroidAdapter({
                error: Error()
              }), TapTapAndroidAdapter) : TapTapAndroidAdapter)();
            }

            return new (_crd && NativeAndroidPlatformAdapter === void 0 ? (_reportPossibleCrUseOfNativeAndroidPlatformAdapter({
              error: Error()
            }), NativeAndroidPlatformAdapter) : NativeAndroidPlatformAdapter)();
          } // Default: Web Dev (browser / editor preview)


          return new (_crd && WebDevPlatformAdapter === void 0 ? (_reportPossibleCrUseOfWebDevPlatformAdapter({
            error: Error()
          }), WebDevPlatformAdapter) : WebDevPlatformAdapter)();
        }
        /** Migrate legacy storage keys (wx_openid → platform_user_id) */


        _migrateLegacyKeys() {
          try {
            const storage = this._getStorage();

            if (!storage) return;
            const platformUserId = storage.getItem('platform_user_id');
            if (platformUserId) return; // already migrated

            const wxOpenId = storage.getItem('wx_openid');

            if (wxOpenId) {
              storage.setItem('legacy_wx_openid', wxOpenId);
              storage.setItem('platform_user_id', wxOpenId);
              console.log('[PlatformService] migrated legacy wx_openid to platform_user_id');
            }
          } catch (e) {
            console.warn('[PlatformService] key migration skipped:', e);
          }
        }
        /** Safely access platform storage */


        _getStorage() {
          try {
            if (this._platform === 'wechat_minigame') {
              return wx.getStorageSync ? {
                getItem: k => wx.getStorageSync(k) || null,
                setItem: (k, v) => wx.setStorageSync(k, v)
              } : null;
            }

            if (typeof sys !== 'undefined' && sys.localStorage) {
              return sys.localStorage;
            }

            if (typeof localStorage !== 'undefined') {
              return localStorage;
            }

            return null;
          } catch {
            return null;
          }
        } // ── Public API ──

        /** Current runtime platform */


        get platform() {
          return this._platform;
        }
        /** Current channel identifier */


        get channel() {
          return this._channel;
        }
        /** Whether the current adapter has been initialized */


        get isInitialized() {
          return this._adapter !== null;
        }
        /** Is WeChat Mini Game environment */


        get isWX() {
          return this._platform === 'wechat_minigame';
        }
        /** Is TapTap Android environment */


        get isTapTap() {
          return this._channel === 'taptap' && this._platform === 'native_android';
        }
        /** Is development mode (Web Dev / editor preview / debug builds) */


        get isDev() {
          return this._platform === 'web_dev';
        }
        /** Get the underlying adapter instance (for advanced use) */


        get adapter() {
          return this._adapter;
        }
        /** Perform platform login */


        async login() {
          if (!this._adapter) {
            return {
              success: false,
              userId: null,
              error: 'PlatformService not initialized'
            };
          }

          return this._adapter.login();
        }
        /** Perform platform logout */


        async logout() {
          if (this._adapter) await this._adapter.logout();
        }
        /** Get current logged-in user ID */


        getUserId() {
          if (this._adapter) return this._adapter.getUserId(); // Fallback: check storage directly

          try {
            const storage = this._getStorage();

            if (storage) return storage.getItem('platform_user_id');
          } catch {
            /* ignore */
          }

          return null;
        }
        /** Check compliance (anti-addiction) status */


        async checkCompliance(userId) {
          if (!this._adapter) {
            return {
              isAllowed: true
            };
          }

          return this._adapter.checkCompliance(userId);
        }
        /** Report analytics event */


        report(eventName, params) {
          if (this._adapter) {
            this._adapter.report(eventName, params);
          }
        }
        /** Safe global variable check (e.g., hasGlobal('wx')) */


        hasGlobal(name) {
          try {
            return typeof window[name] !== 'undefined';
          } catch {
            return false;
          }
        }

      });

      PlatformService._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=897df3af623385420dd9a8395c5d3c722c722d8a.js.map