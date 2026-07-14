System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, RoomType, eventBus, GameManager, GameEvent, WXAdapter, BattleClock, RoomFlowController, _crd;

  function _reportPossibleCrUseOfRoomType(extras) {
    _reporterNs.report("RoomType", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameManager(extras) {
    _reporterNs.report("GameManager", "../core/GameManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameEvent(extras) {
    _reporterNs.report("GameEvent", "../core/GameManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfDungeonManager(extras) {
    _reporterNs.report("DungeonManager", "../dungeon/DungeonManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIPlayerAgent(extras) {
    _reporterNs.report("IPlayerAgent", "../battle/IPlayerAgent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRewardService(extras) {
    _reporterNs.report("RewardService", "./RewardService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfClearedRoomType(extras) {
    _reporterNs.report("ClearedRoomType", "./RewardService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfWXAdapter(extras) {
    _reporterNs.report("WXAdapter", "../utils/WXAdapter", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBattleClock(extras) {
    _reporterNs.report("BattleClock", "../core/time/BattleClock", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRouteEncounterContext(extras) {
    _reporterNs.report("RouteEncounterContext", "../core/save/RouteSaveTypes", _context.meta, extras);
  }

  _export("RoomFlowController", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      RoomType = _unresolved_2.RoomType;
    }, function (_unresolved_3) {
      eventBus = _unresolved_3.eventBus;
    }, function (_unresolved_4) {
      GameManager = _unresolved_4.GameManager;
      GameEvent = _unresolved_4.GameEvent;
    }, function (_unresolved_5) {
      WXAdapter = _unresolved_5.WXAdapter;
    }, function (_unresolved_6) {
      BattleClock = _unresolved_6.BattleClock;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "0bac0fx2hBDboh/KDhkk99B", "RoomFlowController", undefined);
      /**
       * RoomFlowController - 房间生命周期控制
       *
       * 职责:
       * 1. 战斗胜利 → 发放奖励 + 区域推进
       * 2. 区域 Boss 击败 → 进入下一区域
       * 3. 所有区域通关 → 游戏胜利
       * 4. 特殊房间处理（商店/宝箱/回血）
       *
       * Phase 4: 从 DungeonSceneController 拆分
       */


      _export("RoomFlowController", RoomFlowController = class RoomFlowController {
        constructor(_dungeonManager, _rewardService, _player) {
          this._routeCtx = null;
          this._encounterKills = 0;
          this._dungeonManager = _dungeonManager;
          this._rewardService = _rewardService;
          this._player = _player;
        }
        /**
         * v0.4.4 (Demo7): inject the route combat context before entering a route
         * encounter; pass null to leave the route context. The route branch of
         * onBattleVictory reads only from this context (no ad-hoc fields).
         */


        setRouteEncounterContext(ctx) {
          this._routeCtx = ctx;
          this._encounterKills = 0;
        }
        /** v0.4.4 (Demo7) P3: true when a route encounter context is injected (route mode
         *  active). Lets DungeonSceneController route battle victory to onBattleVictory('route')
         *  without changing legacy behavior when no route context is set. */


        get hasRouteContext() {
          return this._routeCtx !== null;
        }
        /** v0.4.4 (Demo7): kill counter for the active route encounter (called by combat). */


        onMonsterKilled() {
          this._encounterKills++;
        }
        /**
         * 战斗胜利处理。
         * @param mode 'legacy' = old multi-room flow (grants reward directly);
         *             'route'  = node-route flow (emits route:encounter_complete only,
         *                        no reward here — prevents double-award with NodeRewardResolver)
         */


        onBattleVictory(mode = 'legacy') {
          if (mode === 'route') {
            const ctx = this._routeCtx;

            if (!ctx) {
              console.warn('[RoomFlowController] route victory without RouteEncounterContext');
              return;
            }

            (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
              error: Error()
            }), eventBus) : eventBus).emit('route:encounter_complete', {
              nodeId: ctx.nodeId,
              nodeType: ctx.nodeType,
              result: 'victory',
              elapsed: Date.now() - ctx.startedAt,
              kills: this._encounterKills
            });
            return;
          }

          const room = this._dungeonManager.currentRoom;
          if (!room) return;
          const roomType = room.type === (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Boss ? 'boss' : room.type === (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Elite ? 'elite' : 'normal'; // 上报战斗胜利

          (_crd && WXAdapter === void 0 ? (_reportPossibleCrUseOfWXAdapter({
            error: Error()
          }), WXAdapter) : WXAdapter).getInstance().reportAnalytics('room_clear', {
            sec: 0,
            hp: 0,
            reactions: 0
          }); // 发放奖励

          this._rewardService.grantRoomClearRewards(roomType); // Boss 房特殊处理


          if (room.type === (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Boss) {
            this._handleBossVictory();
          }
        }
        /** Boss 房的胜利处理 */


        _handleBossVictory() {
          const gm = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).instance;
          const floorState = this._dungeonManager.floorState;

          if (floorState != null && floorState.isMiniBossFloor) {
            // 迷你Boss → 下个小关
            console.log('[区域] 迷你Boss击败，进入下个小关');

            if (gm.advanceStage()) {
              this._dungeonManager.resetForZone(gm.currentZone, gm.currentStageId);
            } else {
              this._dungeonManager.enterNextFloor();
            }
          } else if (gm.isLastStageInZone) {
            // 终结Boss → 区域通关
            (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
              error: Error()
            }), eventBus) : eventBus).emit((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
              error: Error()
            }), GameEvent) : GameEvent).ZONE_BOSS_DEFEATED, gm.currentZone);
          }
        }
        /** 区域终结 Boss 击败 */


        onZoneBossDefeated(zoneId) {
          var _gm$currentZoneDef$na, _gm$currentZoneDef;

          const gm = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).instance;
          console.log(`[区域] ${zoneId} 终结Boss击败!`);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('hud:zone_cleared', zoneId, (_gm$currentZoneDef$na = (_gm$currentZoneDef = gm.currentZoneDef) == null ? void 0 : _gm$currentZoneDef.name) != null ? _gm$currentZoneDef$na : '');

          if (gm.advanceToNextZone()) {
            this._dungeonManager.resetForZone(gm.currentZone, gm.currentStageId);
          }
        }
        /** 所有区域通关 */


        onAllZonesCleared() {
          console.log('[游戏] 恭喜通关!');
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('game:victory');
        }
        /** 玩家复活 */


        onPlayerRevive() {
          if (this._player) {
            this._player.heal(50);
          }

          (_crd && BattleClock === void 0 ? (_reportPossibleCrUseOfBattleClock({
            error: Error()
          }), BattleClock) : BattleClock).instance.paused = false;
        }
        /** 商店房间 */


        onEnterShopRoom(roomId) {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('ui:show_shop', {
            sellItems: ['key', 'advancedKey', 'rerollScroll', 'elementScroll']
          });
        }
        /** 宝箱房间 */


        onEnterTreasureRoom(roomId) {
          console.log(`[宝箱房] 房间 ${roomId}`);
        }
        /** 回血房间 */


        onEnterHealingRoom(roomId) {
          if (this._player) {
            const stats = this._player.stats.getFinalStats();

            const healAmount = Math.floor(stats.maxHP * 0.2);

            this._player.heal(healAmount);

            (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
              error: Error()
            }), eventBus) : eventBus).emit('hud:healing', healAmount);
          }
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=4bab1e565a5bb1fadb70b5b03514f8c4de7c701c.js.map