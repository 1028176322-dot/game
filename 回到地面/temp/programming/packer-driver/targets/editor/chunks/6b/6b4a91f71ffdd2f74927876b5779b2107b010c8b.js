System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, director, GamePhase, eventBus, ConfigManager, _dec, _class, _class2, _crd, ccclass, property, GameEvent, GameManager;

  function _reportPossibleCrUseOfGamePhase(extras) {
    _reporterNs.report("GamePhase", "./Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "./EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfConfigManager(extras) {
    _reporterNs.report("ConfigManager", "./ConfigManager", _context.meta, extras);
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
      director = _cc.director;
    }, function (_unresolved_2) {
      GamePhase = _unresolved_2.GamePhase;
    }, function (_unresolved_3) {
      eventBus = _unresolved_3.eventBus;
    }, function (_unresolved_4) {
      ConfigManager = _unresolved_4.ConfigManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "1edd0Dzav5HnK9aJ+pxwG42", "GameManager", undefined);
      /**
       * GameManager - 游戏全局管理器（单例）
       * 负责游戏阶段流转、场景切换、全局生命周期
       * Phase 3: 新增区域/小关追踪
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'director']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("GameEvent", GameEvent = /*#__PURE__*/function (GameEvent) {
        GameEvent["PHASE_CHANGED"] = "game:phaseChanged";
        GameEvent["SAVE_REQUESTED"] = "game:saveRequested";
        GameEvent["GAME_OVER"] = "game:gameOver";
        GameEvent["DUNGEON_ENTER"] = "game:dungeonEnter";
        GameEvent["DUNGEON_EXIT"] = "game:dungeonExit";
        GameEvent["ZONE_CHANGED"] = "zone:changed";
        GameEvent["STAGE_CHANGED"] = "stage:changed";
        GameEvent["ZONE_BOSS_DEFEATED"] = "zone:bossDefeated";
        GameEvent["ALL_ZONES_CLEARED"] = "zone:allCleared";
        return GameEvent;
      }({}));

      _export("GameManager", GameManager = (_dec = ccclass('GameManager'), _dec(_class = (_class2 = class GameManager extends Component {
        constructor(...args) {
          super(...args);
          this._persisted = false;

          /** 当前游戏阶段 */
          this._currentPhase = (_crd && GamePhase === void 0 ? (_reportPossibleCrUseOfGamePhase({
            error: Error()
          }), GamePhase) : GamePhase).Splash;

          /** 当前地牢层数 */
          this._currentFloor = 1;

          /** 游戏是否暂停 */
          this._isPaused = false;
          // ======== Phase 3: 区域/小关系统 ========

          /** 本局游戏选择的区域路线（如: ['forest', 'catacombs', 'volcano']） */
          this._zoneRoute = [];

          /** 当前所在区域在路线中的索引 */
          this._zoneIndex = 0;

          /** 当前所在小关ID（如 'F1-1'） */
          this._currentStageId = '';

          /** 当前区域内已完成的小关索引 */
          this._stageIndex = 0;

          /** 当前区域内的小关列表 */
          this._stageIds = [];
        }

        static get instance() {
          return GameManager._instance;
        }

        static ensure(parent) {
          var _ref;

          if (GameManager._instance) return GameManager._instance;
          const node = new Node('GameManager');
          (_ref = parent != null ? parent : director.getScene()) == null || _ref.addChild(node);
          const manager = node.addComponent(GameManager);

          manager._becomeSingleton();

          return manager;
        }

        onLoad() {
          if (GameManager._instance && GameManager._instance !== this) {
            this.destroy();
            return;
          }

          this._becomeSingleton();
        }

        _becomeSingleton() {
          GameManager._instance = this;

          if (!this._persisted) {
            director.addPersistRootNode(this.node);
            this._persisted = true;
          }
        }

        onDestroy() {
          if (GameManager._instance === this) {
            GameManager._instance = null;
          }
        }

        get currentPhase() {
          return this._currentPhase;
        }

        get currentFloor() {
          return this._currentFloor;
        } // ======== 区域/小关访问器 ========

        /** 当前区域 ID */


        get currentZone() {
          return this._zoneRoute[this._zoneIndex] || 'forest';
        }
        /** 当前区域定义 */


        get currentZoneDef() {
          return (_crd && ConfigManager === void 0 ? (_reportPossibleCrUseOfConfigManager({
            error: Error()
          }), ConfigManager) : ConfigManager).getInstance().getZoneDef(this.currentZone);
        }
        /** 当前小关 ID */


        get currentStageId() {
          return this._currentStageId;
        }
        /** 当前小关配置 */


        get currentStageDef() {
          const cfg = (_crd && ConfigManager === void 0 ? (_reportPossibleCrUseOfConfigManager({
            error: Error()
          }), ConfigManager) : ConfigManager).getInstance();
          const stages = cfg.getStages(this.currentZone);
          return stages ? stages[this._currentStageId] : null;
        }
        /** 整条区域路线 */


        get zoneRoute() {
          return [...this._zoneRoute];
        }
        /** 当前区域在路线中的索引 */


        get zoneIndex() {
          return this._zoneIndex;
        }
        /** 当前区域的小关列表 */


        get stageIds() {
          return [...this._stageIds];
        }
        /** 当前小关索引 */


        get stageIndex() {
          return this._stageIndex;
        }
        /** 是否为最后一个区域 */


        get isLastZone() {
          return this._zoneIndex >= this._zoneRoute.length - 1;
        }
        /** 是否为当前区域的最后一个小关 */


        get isLastStageInZone() {
          return this._stageIndex >= this._stageIds.length - 1;
        }
        /** 当前终结 Boss 配置 */


        get currentFinalBoss() {
          return (_crd && ConfigManager === void 0 ? (_reportPossibleCrUseOfConfigManager({
            error: Error()
          }), ConfigManager) : ConfigManager).getInstance().getFinalBoss(this.currentZone);
        } // ======== 游戏初始化 ========

        /** 初始化新的一局（选择区域路线） */


        initNewRun() {
          this._currentFloor = 1;
          this._currentPhase = (_crd && GamePhase === void 0 ? (_reportPossibleCrUseOfGamePhase({
            error: Error()
          }), GamePhase) : GamePhase).Dungeon;
          this._isPaused = false; // 使用 ConfigManager 选择区域路线

          this._zoneRoute = (_crd && ConfigManager === void 0 ? (_reportPossibleCrUseOfConfigManager({
            error: Error()
          }), ConfigManager) : ConfigManager).getInstance().selectZoneRoute();
          this._zoneIndex = 0; // 进入第一个区域的第一个小关

          this._enterZone(0);

          return this._zoneRoute;
        }
        /** 重置游戏状态（兼容旧接口） */


        resetGame() {
          this.initNewRun();
        } // ======== 区域/小关推进 ========

        /**
         * 进入指定索引的区域
         */


        _enterZone(zoneIndex) {
          if (zoneIndex >= this._zoneRoute.length) {
            // 所有区域已完成 → 通关!
            (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
              error: Error()
            }), eventBus) : eventBus).emit(GameEvent.ALL_ZONES_CLEARED);
            return;
          }

          this._zoneIndex = zoneIndex;
          const zoneId = this._zoneRoute[zoneIndex];
          const cfg = (_crd && ConfigManager === void 0 ? (_reportPossibleCrUseOfConfigManager({
            error: Error()
          }), ConfigManager) : ConfigManager).getInstance();
          this._stageIds = cfg.getStageIds(zoneId);
          this._stageIndex = 0;
          this._currentStageId = this._stageIds[0] || '';
          this._currentFloor = 1;
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit(GameEvent.ZONE_CHANGED, zoneId, zoneIndex);
        }
        /** 推进到当前区域的下一个小关 */


        advanceStage() {
          const zoneId = this.currentZone;
          const cfg = (_crd && ConfigManager === void 0 ? (_reportPossibleCrUseOfConfigManager({
            error: Error()
          }), ConfigManager) : ConfigManager).getInstance();
          const stages = cfg.getStages(zoneId);
          if (!stages) return false; // 下一关

          this._stageIndex++;

          if (this._stageIndex >= this._stageIds.length) {
            // 当前区域完成，触发终结 Boss
            (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
              error: Error()
            }), eventBus) : eventBus).emit(GameEvent.ZONE_BOSS_DEFEATED, zoneId);
            return false; // 需要挑战终结Boss
          }

          this._currentStageId = this._stageIds[this._stageIndex];
          this._currentFloor++;
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit(GameEvent.STAGE_CHANGED, this._currentStageId, this._stageIndex);
          return true; // 进入下一个小关
        }
        /** 击败当前区域的终结 Boss → 进入下一个区域 */


        advanceToNextZone() {
          const nextIdx = this._zoneIndex + 1;

          if (nextIdx >= this._zoneRoute.length) {
            // 所有区域通关!
            (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
              error: Error()
            }), eventBus) : eventBus).emit(GameEvent.ALL_ZONES_CLEARED);
            return false;
          }

          this._enterZone(nextIdx);

          return true;
        } // ======== 阶段切换 ========


        setPhase(phase) {
          const oldPhase = this._currentPhase;
          this._currentPhase = phase;
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit(GameEvent.PHASE_CHANGED, phase, oldPhase);
        }

        nextFloor() {
          this._currentFloor++;
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('floor:changed', this._currentFloor);
        }

        setPaused(paused) {
          this._isPaused = paused;
        }

        get isPaused() {
          return this._isPaused;
        }

      }, _class2._instance = null, _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=6b4a91f71ffdd2f74927876b5779b2107b010c8b.js.map