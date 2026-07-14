System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, AppFlowController, AppFlowState, SceneFlowService, ComplianceService, SaveService, _dec, _class, _class2, _crd, ccclass, RunCoordinator;

  function _reportPossibleCrUseOfRunStartConfig(extras) {
    _reporterNs.report("RunStartConfig", "./RunStartConfig", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAppFlowController(extras) {
    _reporterNs.report("AppFlowController", "../app/AppFlowController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAppFlowState(extras) {
    _reporterNs.report("AppFlowState", "../app/AppFlowController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSceneFlowService(extras) {
    _reporterNs.report("SceneFlowService", "../app/SceneFlowService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfComplianceService(extras) {
    _reporterNs.report("ComplianceService", "../platform/ComplianceService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSaveService(extras) {
    _reporterNs.report("SaveService", "../core/save/SaveService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRunSave(extras) {
    _reporterNs.report("RunSave", "../core/save/SaveTypes", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
    }, function (_unresolved_2) {
      AppFlowController = _unresolved_2.AppFlowController;
      AppFlowState = _unresolved_2.AppFlowState;
    }, function (_unresolved_3) {
      SceneFlowService = _unresolved_3.SceneFlowService;
    }, function (_unresolved_4) {
      ComplianceService = _unresolved_4.ComplianceService;
    }, function (_unresolved_5) {
      SaveService = _unresolved_5.SaveService;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "58885aNMohF1qef6G8GiktQ", "RunCoordinator", undefined);
      /**
       * RunCoordinator - Single entry point for starting a dungeon run
       *
       * All dungeon entry must go through startRun(config).
       * This replaces: GameManager.initNewRun(), eventBus.emit(DUNGEON_ENTER), direct director.loadScene('dungeon').
       */


      __checkObsolete__(['_decorator']);

      ({
        ccclass
      } = _decorator);

      _export("RunCoordinator", RunCoordinator = (_dec = ccclass('RunCoordinator'), _dec(_class = (_class2 = class RunCoordinator {
        constructor() {
          this._state = null;
        }

        static get instance() {
          if (!this._instance) this._instance = new RunCoordinator();
          return this._instance;
        }

        get state() {
          return this._state;
        }
        /** Start a new dungeon run with the given config */


        startRun(config) {
          console.log('[RunCoordinator] start run:', config.characterId, config.zoneRoute.join('->')); // Compliance check before entering dungeon

          var compliance = (_crd && ComplianceService === void 0 ? (_reportPossibleCrUseOfComplianceService({
            error: Error()
          }), ComplianceService) : ComplianceService).instance;
          var canStart = compliance.canStartRun();

          if (canStart === false) {
            console.warn('[RunCoordinator] compliance blocked, returning to main hub');
            (_crd && AppFlowController === void 0 ? (_reportPossibleCrUseOfAppFlowController({
              error: Error()
            }), AppFlowController) : AppFlowController).instance.goTo((_crd && AppFlowState === void 0 ? (_reportPossibleCrUseOfAppFlowState({
              error: Error()
            }), AppFlowState) : AppFlowState).MAIN_HUB);
            return;
          }

          if (canStart === 'need_recheck') {
            // Async re-check while entering
            var userId = ''; // will be populated by platform adapter

            compliance.refreshCheck(userId).then(result => {
              if (!result.isAllowed) {
                (_crd && AppFlowController === void 0 ? (_reportPossibleCrUseOfAppFlowController({
                  error: Error()
                }), AppFlowController) : AppFlowController).instance.goTo((_crd && AppFlowState === void 0 ? (_reportPossibleCrUseOfAppFlowState({
                  error: Error()
                }), AppFlowState) : AppFlowState).MAIN_HUB);
              }
            });
          }

          this._state = {
            config,
            currentFloor: 1,
            currentZoneIndex: 0,
            totalKills: 0,
            runSoulStones: 0,
            elapsed: 0,
            isActive: true
          }; // v0.4.4 (Demo7): create + persist a base RunSave (route: undefined) so
          // RouteSaveAdapter has an active run to attach route state to. A new RunSave
          // is ONLY ever created here (red line: RouteSaveAdapter must not fabricate one).
          // NOTE: player/inventory are P0 base defaults; the real character-stat source
          // (PlayerDataManager) is not yet implemented — follow-up to wire actual stats.

          var runId = "run_" + config.startedAt + "_" + config.seed;
          var runSave = {
            schemaVersion: 1,
            runId,
            seed: config.seed,
            startedAt: config.startedAt,
            updatedAt: Date.now(),
            zoneId: this.getCurrentZone(),
            floor: 1,
            roomId: '',
            player: {
              hp: 100,
              maxHp: 100,
              level: 1,
              exp: 0
            },
            inventory: {
              items: [],
              equipment: []
            },
            rng: {
              runSeed: config.seed,
              combatStep: 0,
              lootStep: 0
            },
            route: undefined
          };
          (_crd && SaveService === void 0 ? (_reportPossibleCrUseOfSaveService({
            error: Error()
          }), SaveService) : SaveService).instance.saveRun(runSave); // Update AppFlow state

          var appFlow = (_crd && AppFlowController === void 0 ? (_reportPossibleCrUseOfAppFlowController({
            error: Error()
          }), AppFlowController) : AppFlowController).instance;

          if (appFlow) {
            appFlow.goTo((_crd && AppFlowState === void 0 ? (_reportPossibleCrUseOfAppFlowState({
              error: Error()
            }), AppFlowState) : AppFlowState).DUNGEON);
          } else {
            // Fallback: direct scene load (only if AppFlow not available)
            (_crd && SceneFlowService === void 0 ? (_reportPossibleCrUseOfSceneFlowService({
              error: Error()
            }), SceneFlowService) : SceneFlowService).instance.goToDungeon();
          }
        }
        /** Get the current zone ID */


        getCurrentZone() {
          var _this$_state$config$z;

          if (!this._state) return 'forest';
          return (_this$_state$config$z = this._state.config.zoneRoute[this._state.currentZoneIndex]) != null ? _this$_state$config$z : 'forest';
        }
        /** Advance to next floor */


        advanceFloor() {
          if (this._state) this._state.currentFloor++;
        }
        /** Advance to next zone */


        advanceZone() {
          if (!this._state) return false;
          var nextIdx = this._state.currentZoneIndex + 1;

          if (nextIdx >= this._state.config.zoneRoute.length) {
            return false; // all zones cleared
          }

          this._state.currentZoneIndex = nextIdx;
          this._state.currentFloor = 1;
          return true;
        }
        /** Add kills */


        addKills(count) {
          if (this._state) this._state.totalKills += count;
        }
        /** Add soul stones */


        addSoulStones(amount) {
          if (this._state) this._state.runSoulStones += amount;
        }
        /** End the current run (death or victory) */


        endRun() {
          if (this._state) this._state.isActive = false;
        }
        /** Get run result for settlement */


        getRunResult() {
          if (!this._state) return null;
          return {
            isVictory: false,
            characterName: this._state.config.characterName,
            zoneName: this.getCurrentZone(),
            floorReached: this._state.currentFloor,
            kills: this._state.totalKills,
            soulStones: this._state.runSoulStones,
            elapsed: this._state.elapsed
          };
        }

      }, _class2._instance = null, _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=6f88d2fba7d3f135ad3e15d1a12e824b7cc6fef5.js.map