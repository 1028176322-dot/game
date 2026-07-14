System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, SceneFlowService, eventBus, PlatformService, PlayerDataManager, AppFlowController, _crd, AppFlowState;

  function _reportPossibleCrUseOfSceneFlowService(extras) {
    _reporterNs.report("SceneFlowService", "./SceneFlowService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSceneId(extras) {
    _reporterNs.report("SceneId", "./SceneFlowService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlatformService(extras) {
    _reporterNs.report("PlatformService", "../platform/PlatformService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerDataManager(extras) {
    _reporterNs.report("PlayerDataManager", "../core/PlayerDataManager", _context.meta, extras);
  }

  _export("AppFlowController", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      SceneFlowService = _unresolved_2.SceneFlowService;
    }, function (_unresolved_3) {
      eventBus = _unresolved_3.eventBus;
    }, function (_unresolved_4) {
      PlatformService = _unresolved_4.PlatformService;
    }, function (_unresolved_5) {
      PlayerDataManager = _unresolved_5.PlayerDataManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "4774eKLyblKxL1iwN6f1j/V", "AppFlowController", undefined);
      /**
       * AppFlowController - Application flow state machine (plain service, not Component)
       *
       * Single entry point for all scene/panel transitions.
       * UI code must NOT call director.loadScene() directly.
       */


      _export("AppFlowState", AppFlowState = /*#__PURE__*/function (AppFlowState) {
        AppFlowState["BOOT"] = "BOOT";
        AppFlowState["AUTH_CHECK"] = "AUTH_CHECK";
        AppFlowState["PROFILE_CHECK"] = "PROFILE_CHECK";
        AppFlowState["MAIN_HUB"] = "MAIN_HUB";
        AppFlowState["AREA_SELECT"] = "AREA_SELECT";
        AppFlowState["DUNGEON"] = "DUNGEON";
        AppFlowState["SETTLEMENT"] = "SETTLEMENT";
        return AppFlowState;
      }({}));

      _export("AppFlowController", AppFlowController = class AppFlowController {
        constructor() {
          this._currentState = AppFlowState.BOOT;
          this._sceneFlow = (_crd && SceneFlowService === void 0 ? (_reportPossibleCrUseOfSceneFlowService({
            error: Error()
          }), SceneFlowService) : SceneFlowService).instance;
        }

        static get instance() {
          if (!this._instance) this._instance = new AppFlowController();
          return this._instance;
        }

        static ensure() {
          return this.instance;
        }

        get currentState() {
          return this._currentState;
        }

        async start() {
          console.log('[AppFlow] start flow');
          const platform = (_crd && PlatformService === void 0 ? (_reportPossibleCrUseOfPlatformService({
            error: Error()
          }), PlatformService) : PlatformService).instance; // Initialize platform adapter first

          await platform.init(); // Check if user is already logged in via platform adapter

          const userId = platform.getUserId();
          const isGuest = this._storageGet('is_guest') === 'true';

          if (!userId) {
            // No logged-in user — show login panel
            this._currentState = AppFlowState.AUTH_CHECK;
            await this._route();
            return;
          } // User is logged in (platform login or guest)


          const compliance = await platform.checkCompliance(userId);

          if (!compliance.isAllowed) {
            console.warn('[AppFlow] compliance check failed, re-login required');
            this._currentState = AppFlowState.AUTH_CHECK;
            await this._route();
            return;
          } // Logged in, check first-time player


          const pdm = (_crd && PlayerDataManager === void 0 ? (_reportPossibleCrUseOfPlayerDataManager({
            error: Error()
          }), PlayerDataManager) : PlayerDataManager).getInstance();

          if (pdm.isFirstTime()) {
            this._currentState = AppFlowState.PROFILE_CHECK;
            await this._route();
            return;
          }

          this._currentState = AppFlowState.MAIN_HUB;
          await this._route();
        }

        async goTo(state) {
          this._currentState = state;
          await this._route();
        }

        async returnToMainHub() {
          this._currentState = AppFlowState.MAIN_HUB;
          await this._route();
        }

        getTargetScene() {
          switch (this._currentState) {
            case AppFlowState.BOOT:
              return 'splash';

            case AppFlowState.AUTH_CHECK:
            case AppFlowState.PROFILE_CHECK:
            case AppFlowState.MAIN_HUB:
            case AppFlowState.AREA_SELECT:
            case AppFlowState.SETTLEMENT:
              return 'main';

            case AppFlowState.DUNGEON:
              return 'dungeon';

            default:
              return null;
          }
        }
        /** Safe storage read helper */


        _storageGet(key) {
          try {
            const {
              StorageService
            } = require('../platform/StorageService');

            return StorageService.instance.get(key);
          } catch {
            return '';
          }
        }

        async _route() {
          const target = this.getTargetScene();
          if (!target) return;

          if (this._sceneFlow.currentScene !== target) {
            await this._sceneFlow.goTo(target);
          } // Emit AFTER scene is loaded — MainSceneController listener is guaranteed ready


          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('appflow:state_changed', this._currentState);
        }

      });

      AppFlowController._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=9ced140dbb6971ff7feff49333a91213b40ed920.js.map