System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7", "__unresolved_8", "__unresolved_9", "__unresolved_10", "__unresolved_11", "__unresolved_12", "__unresolved_13", "__unresolved_14"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, MonsterAIType, RoomType, eventBus, ConfigManager, GameManager, MathUtils, BattleManager, DAGGenerator, DungeonGenerator, GridManager, RoomTransition, RoomBuilder, NavigationGrid, RoomRuntime, GameBootstrap, _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _crd, ccclass, property, DungeonManager;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfMonsterAIType(extras) {
    _reporterNs.report("MonsterAIType", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRoomType(extras) {
    _reporterNs.report("RoomType", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfConfigManager(extras) {
    _reporterNs.report("ConfigManager", "../core/ConfigManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameManager(extras) {
    _reporterNs.report("GameManager", "../core/GameManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMathUtils(extras) {
    _reporterNs.report("MathUtils", "../utils/MathUtils", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBattleManager(extras) {
    _reporterNs.report("BattleManager", "../battle/BattleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterConfig(extras) {
    _reporterNs.report("MonsterConfig", "../battle/MonsterController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIPlayerAgent(extras) {
    _reporterNs.report("IPlayerAgent", "../battle/IPlayerAgent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfDAGGenerator(extras) {
    _reporterNs.report("DAGGenerator", "./DAGGenerator", _context.meta, extras);
  }

  function _reportPossibleCrUseOfDungeonDAG(extras) {
    _reporterNs.report("DungeonDAG", "./DAGGenerator", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRoomNode(extras) {
    _reporterNs.report("RoomNode", "./DAGGenerator", _context.meta, extras);
  }

  function _reportPossibleCrUseOfDungeonGenerator(extras) {
    _reporterNs.report("DungeonGenerator", "./DungeonGenerator", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGridManager(extras) {
    _reporterNs.report("GridManager", "./GridManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRoomTransition(extras) {
    _reporterNs.report("RoomTransition", "./RoomTransition", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRoomBuilder(extras) {
    _reporterNs.report("RoomBuilder", "./RoomBuilder", _context.meta, extras);
  }

  function _reportPossibleCrUseOfNavigationGrid(extras) {
    _reporterNs.report("NavigationGrid", "./NavigationGrid", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRoomRuntime(extras) {
    _reporterNs.report("RoomRuntime", "./RoomRuntime", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameBootstrap(extras) {
    _reporterNs.report("GameBootstrap", "../core/GameBootstrap", _context.meta, extras);
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
    }, function (_unresolved_2) {
      MonsterAIType = _unresolved_2.MonsterAIType;
      RoomType = _unresolved_2.RoomType;
    }, function (_unresolved_3) {
      eventBus = _unresolved_3.eventBus;
    }, function (_unresolved_4) {
      ConfigManager = _unresolved_4.ConfigManager;
    }, function (_unresolved_5) {
      GameManager = _unresolved_5.GameManager;
    }, function (_unresolved_6) {
      MathUtils = _unresolved_6.MathUtils;
    }, function (_unresolved_7) {
      BattleManager = _unresolved_7.BattleManager;
    }, function (_unresolved_8) {
      DAGGenerator = _unresolved_8.DAGGenerator;
    }, function (_unresolved_9) {
      DungeonGenerator = _unresolved_9.DungeonGenerator;
    }, function (_unresolved_10) {
      GridManager = _unresolved_10.GridManager;
    }, function (_unresolved_11) {
      RoomTransition = _unresolved_11.RoomTransition;
    }, function (_unresolved_12) {
      RoomBuilder = _unresolved_12.RoomBuilder;
    }, function (_unresolved_13) {
      NavigationGrid = _unresolved_13.NavigationGrid;
    }, function (_unresolved_14) {
      RoomRuntime = _unresolved_14.RoomRuntime;
    }, function (_unresolved_15) {
      GameBootstrap = _unresolved_15.GameBootstrap;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "7c5138KrnZNLafJuBTXo5wx", "DungeonManager", undefined);

      __checkObsolete__(['_decorator', 'Component']);

      ({
        ccclass,
        property
      } = _decorator);

      /**
       * @deprecated DungeonManager is a legacy shell. Room dispatch is now data-driven
       * (no switch, red line 2); floor/room generation still delegates to the legacy
       * DAGGenerator until the new DungeonGenerator five-class pipeline is wired at
       * runtime (P1-6). Runtime behavior is unchanged by this deprecation marker.
       */
      _export("DungeonManager", DungeonManager = (_dec = ccclass('DungeonManager'), _dec2 = property(_crd && GridManager === void 0 ? (_reportPossibleCrUseOfGridManager({
        error: Error()
      }), GridManager) : GridManager), _dec3 = property(_crd && RoomTransition === void 0 ? (_reportPossibleCrUseOfRoomTransition({
        error: Error()
      }), RoomTransition) : RoomTransition), _dec4 = property(_crd && BattleManager === void 0 ? (_reportPossibleCrUseOfBattleManager({
        error: Error()
      }), BattleManager) : BattleManager), _dec(_class = (_class2 = class DungeonManager extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "gridManager", _descriptor, this);

          _initializerDefineProperty(this, "roomTransition", _descriptor2, this);

          _initializerDefineProperty(this, "battleManager", _descriptor3, this);

          this._floorState = null;
          this._player = null;
          this._globalSeed = 0;
          this._subSeedCounter = 0;
          this._currentZone = 'forest';
          this._currentStageId = '';
          this._stagesCompleted = 0;
          this._stageRoomCount = 5;
          // P3-4-A: additive delegation to the new five-class pipeline (RoomRuntime).
          // The legacy DAGGenerator path above is unchanged; these runtimes are built
          // in parallel and exposed for later stages (navigation or asset lifecycle).
          this._roomRuntimes = [];
          this._enterCount = 0;
          // Data-driven room dispatch (replaces the switch in _onRoomEntered, red line 2:
          // no switch on room type). Each RoomType maps to a side effect; generation logic
          // is untouched. Built lazily and cached (handlers close over `this`/eventBus).
          this._roomHandlerMap = null;
        }

        init(player, seed) {
          var _gm$currentStageDef$r, _gm$currentStageDef;

          this._player = player;
          this._globalSeed = seed;
          this._subSeedCounter = 0;
          this._stagesCompleted = 0;
          const gm = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).instance;
          this._currentZone = gm.currentZone;
          this._currentStageId = gm.currentStageId;
          this._stageRoomCount = (_gm$currentStageDef$r = (_gm$currentStageDef = gm.currentStageDef) == null ? void 0 : _gm$currentStageDef.rooms) != null ? _gm$currentStageDef$r : 5;

          this._generateFloor(1);
        }

        enterNextFloor() {
          var _this$_floorState$flo, _this$_floorState;

          const nextFloor = ((_this$_floorState$flo = (_this$_floorState = this._floorState) == null ? void 0 : _this$_floorState.floorNumber) != null ? _this$_floorState$flo : 0) + 1;

          this._generateFloor(nextFloor);
        }

        resetForZone(zoneId, stageId) {
          var _instance$currentStag, _instance$currentStag2;

          this._currentZone = zoneId;
          this._currentStageId = stageId;
          this._stagesCompleted = 0;
          this._subSeedCounter = 0;
          this._stageRoomCount = (_instance$currentStag = (_instance$currentStag2 = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).instance.currentStageDef) == null ? void 0 : _instance$currentStag2.rooms) != null ? _instance$currentStag : 5;

          this._generateFloor(1);
        }

        _generateFloor(floorNumber) {
          const gm = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).instance;
          const floorSeed = this._globalSeed + floorNumber * 1000 + this._subSeedCounter;
          this._subSeedCounter++;
          const stageDef = gm.currentStageDef;
          const isBossFloor = stageDef ? floorNumber >= stageDef.rooms : false;
          const isMiniBoss = isBossFloor && !this._isFinalBossFloor();
          const roomCount = isBossFloor ? Math.min(4, Math.max(3, this._stageRoomCount - 2)) : this._stageRoomCount;
          const dag = (_crd && DAGGenerator === void 0 ? (_reportPossibleCrUseOfDAGGenerator({
            error: Error()
          }), DAGGenerator) : DAGGenerator).generate(floorSeed, floorNumber, roomCount, {
            zoneId: this._currentZone,
            isFinalBossFloor: this._isFinalBossFloor(),
            isMiniBossFloor: isMiniBoss,
            stageRoomCount: this._stageRoomCount
          });
          this._floorState = {
            dag,
            currentRoomId: dag.entryRoomId,
            seed: floorSeed,
            floorNumber,
            clearedRoomIds: new Set(),
            visitedRoomIds: new Set([dag.entryRoomId]),
            isMiniBossFloor: isMiniBoss
          };

          this._buildRoomRuntimes(floorSeed, roomCount);

          this._enterRoom(dag.entryRoomId);

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('dungeon:floor_generated', floorNumber, floorSeed, dag);

          if (floorNumber > 1) {
            (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
              error: Error()
            }), eventBus) : eventBus).emit('mutation:generate', floorNumber);
          } else {
            (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
              error: Error()
            }), eventBus) : eventBus).emit('mutation:cleared');
          }
        } // P3-4-A: build a RoomRuntime per generated room using the new five-class
        // pipeline (DungeonGenerator then RoomBuilder then NavigationGrid then RoomRuntime).
        // Pure additive: the legacy DAGGenerator floor logic is untouched.


        _buildRoomRuntimes(floorSeed, roomCount) {
          this._roomRuntimes = [];
          this._enterCount = 0;
          const ctx = (_crd && GameBootstrap === void 0 ? (_reportPossibleCrUseOfGameBootstrap({
            error: Error()
          }), GameBootstrap) : GameBootstrap).context;
          if (!ctx) return;
          const layout = new (_crd && DungeonGenerator === void 0 ? (_reportPossibleCrUseOfDungeonGenerator({
            error: Error()
          }), DungeonGenerator) : DungeonGenerator)().generate(floorSeed, this._currentZone, {
            roomCount
          });
          const builder = new (_crd && RoomBuilder === void 0 ? (_reportPossibleCrUseOfRoomBuilder({
            error: Error()
          }), RoomBuilder) : RoomBuilder)();

          for (const rl of layout.rooms) {
            const roomData = builder.build(rl);
            const nav = new (_crd && NavigationGrid === void 0 ? (_reportPossibleCrUseOfNavigationGrid({
              error: Error()
            }), NavigationGrid) : NavigationGrid)(roomData.tileMap);
            const rt = new (_crd && RoomRuntime === void 0 ? (_reportPossibleCrUseOfRoomRuntime({
              error: Error()
            }), RoomRuntime) : RoomRuntime)(roomData, nav);
            rt.initialize(ctx);

            this._roomRuntimes.push(rt);
          }
        } // Activate the RoomRuntime for the current enter sequence. The new pipeline room
        // order is not 1:1 with the legacy DAG room ids (different type vocabulary), so we
        // index by enter order; room assets and navigation are zone-homogeneous either way.


        _activateRoomRuntime() {
          if (this._roomRuntimes.length === 0) return;
          const rt = this._roomRuntimes[this._enterCount % this._roomRuntimes.length];
          this._enterCount++;
          if (!rt) return;
          if (!rt.active) rt.enter();
          rt.load().catch(e => console.warn(`[DungeonManager] room runtime load failed: ${e}`));
        }

        get roomRuntimes() {
          return this._roomRuntimes;
        }

        _isFinalBossFloor() {
          return (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).instance.isLastStageInZone;
        }

        _enterRoom(roomId) {
          if (!this._floorState) return;

          const room = this._floorState.dag.rooms.get(roomId);

          if (!room) {
            console.warn(`[DungeonManager] room ${roomId} does not exist`);
            return;
          }

          this._activateRoomRuntime();

          this._floorState.currentRoomId = roomId;

          this._floorState.visitedRoomIds.add(roomId);

          if (this.gridManager) {
            this.gridManager.setZone(this._currentZone);
            this.gridManager.generateWithSeed(this._floorState.seed + roomId);
          }

          if (this.roomTransition) {
            this.roomTransition.enterRoom(() => this._onRoomEntered(room));
          } else {
            this._onRoomEntered(room);
          }
        }

        _roomHandlers() {
          if (this._roomHandlerMap) return this._roomHandlerMap;
          this._roomHandlerMap = new Map([[(_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Normal, r => this._startBattleInRoom(r)], [(_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Elite, r => this._startBattleInRoom(r)], [(_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Boss, r => this._startBattleInRoom(r, true)], [(_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Treasure, r => (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('room:treasure', r.id)], [(_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Healing, r => (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('room:healing', r.id)], [(_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Shop, r => (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('room:shop', r.id)], [(_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Upgrade, r => (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('room:upgrade', r.id)], [(_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Event, r => (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('room:event', r.id)]]);
          return this._roomHandlerMap;
        }

        _onRoomEntered(room) {
          const handler = this._roomHandlers().get(room.type);

          if (handler) {
            handler(room);
          }

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('room:entered', room);
        }

        _startBattleInRoom(room, isBoss = false) {
          if (!this.battleManager || !this._floorState) return;

          const monsterConfigs = this._generateMonstersForRoom(room, isBoss);

          this.battleManager.startBattle(monsterConfigs);
        }

        _generateMonstersForRoom(room, isBoss) {
          const isElite = room.type === (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Elite;
          const gm = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).instance;
          const cfg = (_crd && ConfigManager === void 0 ? (_reportPossibleCrUseOfConfigManager({
            error: Error()
          }), ConfigManager) : ConfigManager).getInstance();
          const zoneId = this._currentZone;
          const monsterScale = cfg.getMonsterScale();
          const configs = [];

          if (isBoss) {
            var _this$_floorState2;

            const isFinalBoss = ((_this$_floorState2 = this._floorState) == null ? void 0 : _this$_floorState2.isMiniBossFloor) === false && this._isFinalBossFloor();

            if (isFinalBoss) {
              const bossDef = cfg.getFinalBoss(zoneId);

              if (bossDef) {
                configs.push({
                  id: bossDef.id,
                  zoneId,
                  name: bossDef.name,
                  hp: bossDef.hp,
                  atk: bossDef.atk,
                  def: bossDef.def,
                  speed: 50,
                  aiType: (_crd && MonsterAIType === void 0 ? (_reportPossibleCrUseOfMonsterAIType({
                    error: Error()
                  }), MonsterAIType) : MonsterAIType).Elite,
                  exp: Math.floor(bossDef.hp * 0.5),
                  isBoss: true,
                  phases: bossDef.phases,
                  phaseTrigger: bossDef.phaseTrigger
                });
              } else {
                configs.push({
                  id: `${zoneId}Boss`,
                  zoneId,
                  name: `${zoneId} Boss`,
                  hp: 50,
                  atk: 12,
                  def: 4,
                  speed: 50,
                  aiType: (_crd && MonsterAIType === void 0 ? (_reportPossibleCrUseOfMonsterAIType({
                    error: Error()
                  }), MonsterAIType) : MonsterAIType).Charger,
                  exp: 50,
                  isBoss: true,
                  phases: 3,
                  phaseTrigger: [0.5, 0.25]
                });
              }
            } else {
              const stageDef = gm.currentStageDef;

              if (stageDef) {
                const miniBossHP = stageDef.miniBossHP;
                configs.push({
                  id: stageDef.miniBoss,
                  zoneId,
                  name: stageDef.miniBoss,
                  hp: miniBossHP,
                  atk: Math.floor(miniBossHP * 0.4),
                  def: Math.floor(zoneId === 'abyss' ? 3 : zoneId === 'forest' ? 1 : 2),
                  speed: 50,
                  aiType: (_crd && MonsterAIType === void 0 ? (_reportPossibleCrUseOfMonsterAIType({
                    error: Error()
                  }), MonsterAIType) : MonsterAIType).Charger,
                  exp: Math.floor(miniBossHP * 0.5),
                  isBoss: true,
                  phases: 2,
                  phaseTrigger: [0.5]
                });
              } else {
                configs.push({
                  id: 'miniBoss',
                  zoneId,
                  name: 'Mini Boss',
                  hp: 20,
                  atk: 8,
                  def: 2,
                  speed: 50,
                  aiType: (_crd && MonsterAIType === void 0 ? (_reportPossibleCrUseOfMonsterAIType({
                    error: Error()
                  }), MonsterAIType) : MonsterAIType).Charger,
                  exp: 20,
                  isBoss: true,
                  phases: 2,
                  phaseTrigger: [0.5]
                });
              }
            }

            return configs;
          }

          const monsterCount = isElite ? 2 : (_crd && MathUtils === void 0 ? (_reportPossibleCrUseOfMathUtils({
            error: Error()
          }), MathUtils) : MathUtils).randomInt(2, 4);

          for (let i = 0; i < monsterCount; i++) {
            const picked = cfg.pickMonsterFromPool(zoneId, !isElite);

            if (!picked) {
              configs.push({
                id: 'slime',
                zoneId,
                name: 'Slime',
                hp: 12,
                atk: 3,
                def: 0,
                speed: 50,
                aiType: (_crd && MonsterAIType === void 0 ? (_reportPossibleCrUseOfMonsterAIType({
                  error: Error()
                }), MonsterAIType) : MonsterAIType).Charger,
                exp: 3
              });
              continue;
            }

            const def = picked.def;
            let finalHP = def.hp;
            let finalATK = def.atk;

            if (isElite || picked.id.endsWith('Elite')) {
              finalHP = Math.floor(def.hp * (monsterScale.eliteHpMultiplier || 1.8));
              finalATK = Math.floor(def.atk * (monsterScale.eliteAtkMultiplier || 1.5));
            }

            configs.push({
              id: picked.id,
              zoneId,
              name: def.name,
              hp: finalHP,
              atk: finalATK,
              def: def.def,
              speed: def.speed,
              aiType: this._stringToAIType(def.ai),
              exp: def.exp
            });
          }

          return configs;
        }

        _stringToAIType(ai) {
          switch (ai) {
            case 'charger':
              return (_crd && MonsterAIType === void 0 ? (_reportPossibleCrUseOfMonsterAIType({
                error: Error()
              }), MonsterAIType) : MonsterAIType).Charger;

            case 'ranged':
              return (_crd && MonsterAIType === void 0 ? (_reportPossibleCrUseOfMonsterAIType({
                error: Error()
              }), MonsterAIType) : MonsterAIType).Ranged;

            case 'defender':
              return (_crd && MonsterAIType === void 0 ? (_reportPossibleCrUseOfMonsterAIType({
                error: Error()
              }), MonsterAIType) : MonsterAIType).Defender;

            case 'summoner':
              return (_crd && MonsterAIType === void 0 ? (_reportPossibleCrUseOfMonsterAIType({
                error: Error()
              }), MonsterAIType) : MonsterAIType).Summoner;

            case 'suicider':
              return (_crd && MonsterAIType === void 0 ? (_reportPossibleCrUseOfMonsterAIType({
                error: Error()
              }), MonsterAIType) : MonsterAIType).Suicider;

            case 'elite':
              return (_crd && MonsterAIType === void 0 ? (_reportPossibleCrUseOfMonsterAIType({
                error: Error()
              }), MonsterAIType) : MonsterAIType).Elite;

            default:
              return (_crd && MonsterAIType === void 0 ? (_reportPossibleCrUseOfMonsterAIType({
                error: Error()
              }), MonsterAIType) : MonsterAIType).Charger;
          }
        }

        selectNextRoom(roomId) {
          if (!this._floorState) return;

          const currentRoom = this._floorState.dag.rooms.get(this._floorState.currentRoomId);

          if (!currentRoom) return;

          if (!currentRoom.connections.includes(roomId)) {
            console.warn(`[DungeonManager] cannot select room ${roomId}: not connected`);
            return;
          }

          const isBattleRoom = currentRoom.type === (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Normal || currentRoom.type === (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Elite;

          if (isBattleRoom && this.battleManager && !this.battleManager.isRoomCleared) {
            console.warn('[DungeonManager] battle room is not cleared yet');
            return;
          }

          if (this.roomTransition) {
            this.roomTransition.exitRoom(() => this._enterRoom(roomId));
          } else {
            this._enterRoom(roomId);
          }
        }

        get currentRoom() {
          var _this$_floorState$dag, _this$_floorState3, _this$_floorState$cur, _this$_floorState4;

          return (_this$_floorState$dag = (_this$_floorState3 = this._floorState) == null ? void 0 : _this$_floorState3.dag.rooms.get((_this$_floorState$cur = (_this$_floorState4 = this._floorState) == null ? void 0 : _this$_floorState4.currentRoomId) != null ? _this$_floorState$cur : -1)) != null ? _this$_floorState$dag : null;
        }

        get floorState() {
          return this._floorState;
        }

        get currentZone() {
          return this._currentZone;
        }

        get currentStageId() {
          return this._currentStageId;
        }

        debugCompareSeed(seed1, seed2) {
          const dag1 = (_crd && DAGGenerator === void 0 ? (_reportPossibleCrUseOfDAGGenerator({
            error: Error()
          }), DAGGenerator) : DAGGenerator).generate(seed1, 1);
          const dag2 = (_crd && DAGGenerator === void 0 ? (_reportPossibleCrUseOfDAGGenerator({
            error: Error()
          }), DAGGenerator) : DAGGenerator).generate(seed2, 1);
          return dag1.rooms.size === dag2.rooms.size;
        }

        onDestroy() {
          for (const rt of this._roomRuntimes) {
            if (rt.active) rt.exit();
          }

          this._roomRuntimes = [];
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "gridManager", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "roomTransition", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "battleManager", [_dec4], {
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
//# sourceMappingURL=9ad87dfeaa2dd0b8ded9034b3c8df2ca277fa6bb.js.map