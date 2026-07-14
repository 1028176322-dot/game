System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7", "__unresolved_8", "__unresolved_9", "__unresolved_10", "__unresolved_11", "__unresolved_12", "__unresolved_13", "__unresolved_14"], function (_export, _context2) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, instantiate, Prefab, UITransform, Vec3, GameConfig, BattlePhase, eventBus, MathUtils, BattleClock, runEvents, MonsterController, AutoAttack, RenderAssetService, MonsterRuntimeFactory, MonsterRuntimeView, CharacterVisualService, GameBootstrap, ICombatSystem, _dec, _dec2, _class, _class2, _descriptor, _crd, ccclass, property, BattleManager;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfGameConfig(extras) {
    _reporterNs.report("GameConfig", "../core/GameConfig", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfBattlePhase(extras) {
    _reporterNs.report("BattlePhase", "../core/Constants", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfMathUtils(extras) {
    _reporterNs.report("MathUtils", "../utils/MathUtils", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfBattleClock(extras) {
    _reporterNs.report("BattleClock", "../core/time/BattleClock", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfrunEvents(extras) {
    _reporterNs.report("runEvents", "../core/events", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfIPlayerAgent(extras) {
    _reporterNs.report("IPlayerAgent", "./IPlayerAgent", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterController(extras) {
    _reporterNs.report("MonsterController", "./MonsterController", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterConfig(extras) {
    _reporterNs.report("MonsterConfig", "./MonsterController", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfAutoAttack(extras) {
    _reporterNs.report("AutoAttack", "./AutoAttack", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfGridManager(extras) {
    _reporterNs.report("GridManager", "../dungeon/GridManager", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfRenderAssetService(extras) {
    _reporterNs.report("RenderAssetService", "../assets/RenderAssetService", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterRuntimeFactory(extras) {
    _reporterNs.report("MonsterRuntimeFactory", "./MonsterRuntimeFactory", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterRuntimeView(extras) {
    _reporterNs.report("MonsterRuntimeView", "./MonsterRuntimeView", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfCharacterVisualService(extras) {
    _reporterNs.report("CharacterVisualService", "../render/CharacterVisualService", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfGameBootstrap(extras) {
    _reporterNs.report("GameBootstrap", "../core/GameBootstrap", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfCombatSystem(extras) {
    _reporterNs.report("CombatSystem", "./combat/CombatSystem", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfICombatSystem(extras) {
    _reporterNs.report("ICombatSystem", "./combat/CombatSystem", _context2.meta, extras);
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
      instantiate = _cc.instantiate;
      Prefab = _cc.Prefab;
      UITransform = _cc.UITransform;
      Vec3 = _cc.Vec3;
    }, function (_unresolved_2) {
      GameConfig = _unresolved_2.GameConfig;
    }, function (_unresolved_3) {
      BattlePhase = _unresolved_3.BattlePhase;
    }, function (_unresolved_4) {
      eventBus = _unresolved_4.eventBus;
    }, function (_unresolved_5) {
      MathUtils = _unresolved_5.MathUtils;
    }, function (_unresolved_6) {
      BattleClock = _unresolved_6.BattleClock;
    }, function (_unresolved_7) {
      runEvents = _unresolved_7.runEvents;
    }, function (_unresolved_8) {
      MonsterController = _unresolved_8.MonsterController;
    }, function (_unresolved_9) {
      AutoAttack = _unresolved_9.AutoAttack;
    }, function (_unresolved_10) {
      RenderAssetService = _unresolved_10.RenderAssetService;
    }, function (_unresolved_11) {
      MonsterRuntimeFactory = _unresolved_11.MonsterRuntimeFactory;
    }, function (_unresolved_12) {
      MonsterRuntimeView = _unresolved_12.MonsterRuntimeView;
    }, function (_unresolved_13) {
      CharacterVisualService = _unresolved_13.CharacterVisualService;
    }, function (_unresolved_14) {
      GameBootstrap = _unresolved_14.GameBootstrap;
    }, function (_unresolved_15) {
      ICombatSystem = _unresolved_15.ICombatSystem;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "aff11qUsDhLRrc2sCWBmIE9", "BattleManager", undefined);

      __checkObsolete__(['_decorator', 'Component', 'instantiate', 'Node', 'Prefab', 'UITransform', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);

      /**
       * @deprecated BattleManager is a legacy battle facade. Per the 2D to 3D upgrade
       * plan §3.8 and decision F, combat resolution is migrating to CombatSystem and
       * the seven combat subsystems. New code must resolve combat through the
       * ICombatSystem service token instead of this class. Existing callers keep
       * working; this class will be removed once the feature/3d-* runtime wiring lands.
       */
      _export("BattleManager", BattleManager = (_dec = ccclass('BattleManager'), _dec2 = property(Prefab), _dec(_class = (_class2 = class BattleManager extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "monsterPrefab", _descriptor, this);

          this._phase = (_crd && BattlePhase === void 0 ? (_reportPossibleCrUseOfBattlePhase({
            error: Error()
          }), BattlePhase) : BattlePhase).Init;
          this._player = null;
          this._autoAttack = null;
          this._gridManager = null;
          this._actorLayer = null;
          this._monsters = [];
          this._roomMonsterCount = 0;
          this._totalMonsters = 0;
          this._killCount = 0;
          this._isRoomCleared = false;
          // P0-1 §3.8: handle to the new combat engine; null until a GameContext is wired.
          this._combatSystem = null;
        }

        init(player, gridManager, actorLayer) {
          var _this$_autoAttack, _context$getOptional, _context;

          this._player = player;
          this._gridManager = gridManager;
          this._actorLayer = actorLayer != null ? actorLayer : null;
          this._autoAttack = player.node.getComponent(_crd && AutoAttack === void 0 ? (_reportPossibleCrUseOfAutoAttack({
            error: Error()
          }), AutoAttack) : AutoAttack);
          (_this$_autoAttack = this._autoAttack) == null || _this$_autoAttack.init(this);

          this._setPhase((_crd && BattlePhase === void 0 ? (_reportPossibleCrUseOfBattlePhase({
            error: Error()
          }), BattlePhase) : BattlePhase).Init);

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('monster:summon', this._onSummonMonster, this); // P0-1 §3.8: resolve the new combat engine through the service locator.
          // Null-safe: when no GameContext is wired this stays null and the legacy
          // battle flow is preserved unchanged. Use getOptional because GameBootstrap
          // registers ICombatSystem at the tail of its async startup(); the dungeon
          // scene may wire systems before that registration completes (race). A missing
          // token must NOT throw — it just means the legacy flow is used.

          this._combatSystem = (_context$getOptional = (_context = (_crd && GameBootstrap === void 0 ? (_reportPossibleCrUseOfGameBootstrap({
            error: Error()
          }), GameBootstrap) : GameBootstrap).context) == null ? void 0 : _context.getOptional(_crd && ICombatSystem === void 0 ? (_reportPossibleCrUseOfICombatSystem({
            error: Error()
          }), ICombatSystem) : ICombatSystem)) != null ? _context$getOptional : null;
        }

        startBattle(monsterConfigs) {
          this._clearMonsters();

          this._killCount = 0;
          this._totalMonsters = monsterConfigs.length;
          this._isRoomCleared = false;
          this._roomMonsterCount = monsterConfigs.length;

          for (const config of monsterConfigs) {
            const spawnPos = this._findSpawnPosition();

            if (spawnPos) {
              this._spawnMonster(config, spawnPos.x, spawnPos.y);
            }
          }

          this._setPhase((_crd && BattlePhase === void 0 ? (_reportPossibleCrUseOfBattlePhase({
            error: Error()
          }), BattlePhase) : BattlePhase).InProgress);

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('battle:started', this._totalMonsters);
          (_crd && runEvents === void 0 ? (_reportPossibleCrUseOfrunEvents({
            error: Error()
          }), runEvents) : runEvents).emit('battle:started', {
            total: this._totalMonsters
          });
        }

        _clearMonsters() {
          for (const entry of this._monsters) {
            var _entry$monster;

            this._releaseGrid(entry.monster);

            if ((_entry$monster = entry.monster) != null && (_entry$monster = _entry$monster.node) != null && _entry$monster.isValid) {
              entry.monster.node.destroy();
            }
          }

          this._monsters = [];
        }

        _spawnMonster(config, gridX, gridY, isSummon = false) {
          if (!this._actorLayer || !this._gridManager) {
            console.warn('[BattleManager] actorLayer/gridManager not ready');
            return;
          }

          const prefab = !isSummon ? this.monsterPrefab : null;
          const runtime = prefab ? this._createFromPrefab(config, gridX, gridY, prefab) : (_crd && MonsterRuntimeFactory === void 0 ? (_reportPossibleCrUseOfMonsterRuntimeFactory({
            error: Error()
          }), MonsterRuntimeFactory) : MonsterRuntimeFactory).create(`monster_${gridX}_${gridY}`);
          const monsterNode = runtime.root;

          this._actorLayer.addChild(monsterNode);

          const pos = this._gridManager.gridToWorld(gridX, gridY);

          monsterNode.setPosition(pos);
          monsterNode.setSiblingIndex(100 + gridY);
          runtime.controller.init(config, gridX, gridY, this._gridManager, this);

          if (this._player) {
            runtime.controller.setTarget(this._player);
          }

          this._gridManager.setOccupied(gridX, gridY, true);

          this._monsters.push({
            monster: runtime.controller,
            config
          });

          void this._applyMonsterVisual(monsterNode, config);

          if (isSummon) {
            this._totalMonsters++;
          }
        }

        _createFromPrefab(config, gridX, gridY, prefab) {
          var _config$id, _root$getComponent, _root$getChildByName;

          const root = instantiate(prefab);
          root.name = `monster_${(_config$id = config.id) != null ? _config$id : gridX}_${gridY}`;

          if (!root.getComponent(UITransform)) {
            root.addComponent(UITransform).setContentSize(96, 96);
          }

          const controller = (_root$getComponent = root.getComponent(_crd && MonsterController === void 0 ? (_reportPossibleCrUseOfMonsterController({
            error: Error()
          }), MonsterController) : MonsterController)) != null ? _root$getComponent : root.addComponent(_crd && MonsterController === void 0 ? (_reportPossibleCrUseOfMonsterController({
            error: Error()
          }), MonsterController) : MonsterController);
          return {
            root,
            body: (_crd && MonsterRuntimeFactory === void 0 ? (_reportPossibleCrUseOfMonsterRuntimeFactory({
              error: Error()
            }), MonsterRuntimeFactory) : MonsterRuntimeFactory).getBodyNode(root),
            effectSocket: (_root$getChildByName = root.getChildByName('EffectSocket')) != null ? _root$getChildByName : root,
            controller,
            view: root.getComponent(_crd && MonsterRuntimeView === void 0 ? (_reportPossibleCrUseOfMonsterRuntimeView({
              error: Error()
            }), MonsterRuntimeView) : MonsterRuntimeView)
          };
        }

        async _applyMonsterVisual(monsterNode, config) {
          if (!config.zoneId || !config.id) return;
          const bodyNode = (_crd && MonsterRuntimeFactory === void 0 ? (_reportPossibleCrUseOfMonsterRuntimeFactory({
            error: Error()
          }), MonsterRuntimeFactory) : MonsterRuntimeFactory).getBodyNode(monsterNode); // Priority 1: explicit config.visual (boss, miniBoss, or monster with visual override)

          if (config.visual) {
            const visualOk = await (_crd && CharacterVisualService === void 0 ? (_reportPossibleCrUseOfCharacterVisualService({
              error: Error()
            }), CharacterVisualService) : CharacterVisualService).instance.applyStatic(bodyNode, config.visual);

            if (visualOk) {
              this._scaleMonster(monsterNode, config);

              return;
            }
          } // Priority 2: auto-generated semantic key: monster.{zone}.{id}


          const visualKey = `monster.${config.zoneId}.${config.id.toLowerCase()}`;
          const visualOk = await (_crd && CharacterVisualService === void 0 ? (_reportPossibleCrUseOfCharacterVisualService({
            error: Error()
          }), CharacterVisualService) : CharacterVisualService).instance.applyStatic(bodyNode, visualKey);

          if (visualOk) {
            this._scaleMonster(monsterNode, config);

            return;
          } // Fallback: direct path via ArtResourceResolver


          const frame = await (_crd && RenderAssetService === void 0 ? (_reportPossibleCrUseOfRenderAssetService({
            error: Error()
          }), RenderAssetService) : RenderAssetService).applyMonsterSprite(bodyNode, config.zoneId, config.id, 'idle');
          if (!frame || !monsterNode.isValid) return;

          this._scaleMonster(monsterNode, config);
        }

        _scaleMonster(monsterNode, config) {
          const transform = monsterNode.getComponent(UITransform);
          if (transform) transform.setContentSize(96, 96);
          monsterNode.setScale(config.isBoss ? 1.6 : 1, config.isBoss ? 1.6 : 1, 1);
        }

        _onSummonMonster(config, gridX, gridY) {
          this._spawnMonster(config, gridX, gridY, true);
        }

        _findSpawnPosition() {
          var _this$_player$gridX, _this$_player, _this$_player$gridY, _this$_player2;

          if (!this._gridManager) return null;
          const gridSize = this._gridManager.gridSize;
          const playerX = (_this$_player$gridX = (_this$_player = this._player) == null ? void 0 : _this$_player.gridX) != null ? _this$_player$gridX : Math.floor(gridSize / 2);
          const playerY = (_this$_player$gridY = (_this$_player2 = this._player) == null ? void 0 : _this$_player2.gridY) != null ? _this$_player$gridY : Math.floor(gridSize / 2);

          for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
              if (this._gridManager.isWalkable(x, y) && !this._gridManager.isOccupied(x, y)) {
                const dist = (_crd && MathUtils === void 0 ? (_reportPossibleCrUseOfMathUtils({
                  error: Error()
                }), MathUtils) : MathUtils).manhattanDistance(x, y, playerX, playerY);

                if (dist >= 2 && dist <= 4) {
                  return {
                    x,
                    y
                  };
                }
              }
            }
          }

          for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
              if (this._gridManager.isWalkable(x, y) && !this._gridManager.isOccupied(x, y)) {
                return {
                  x,
                  y
                };
              }
            }
          }

          return null;
        }

        getNearestMonster(position, range) {
          this._pruneInvalidMonsters();

          let nearest = null;
          let nearestDist = range * (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).TILE_SIZE + 1;

          for (const entry of this._monsters) {
            const node = entry.monster.node;
            if (!node || !node.isValid || entry.monster.isDead) continue;
            const dist = Vec3.distance(position, node.getPosition());

            if (dist < nearestDist) {
              nearestDist = dist;
              nearest = entry;
            }
          }

          return nearest;
        }

        removeMonster(monster) {
          this._releaseGrid(monster);

          const idx = this._monsters.findIndex(e => e.monster === monster);

          if (idx >= 0) {
            this._monsters.splice(idx, 1);

            this._killCount++;

            if (this._monsters.length === 0 && this._totalMonsters > 0) {
              this._onRoomCleared();
            }
          }
        }

        _releaseGrid(monster) {
          if (!this._gridManager || !monster || !monster.isValid) return;

          this._gridManager.setOccupied(monster.gridX, monster.gridY, false);
        }

        _pruneInvalidMonsters() {
          this._monsters = this._monsters.filter(entry => {
            const monster = entry.monster;

            if (!monster || !monster.isValid || !monster.node || !monster.node.isValid || monster.isDead) {
              this._releaseGrid(monster);

              return false;
            }

            return true;
          });
        }

        _onRoomCleared() {
          this._isRoomCleared = true;

          this._setPhase((_crd && BattlePhase === void 0 ? (_reportPossibleCrUseOfBattlePhase({
            error: Error()
          }), BattlePhase) : BattlePhase).Victory);

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('battle:victory');
          (_crd && runEvents === void 0 ? (_reportPossibleCrUseOfrunEvents({
            error: Error()
          }), runEvents) : runEvents).emit('battle:victory', {
            roomId: 0,
            roomType: 'normal',
            isBoss: false
          });
        }

        onPlayerDeath() {
          this._setPhase((_crd && BattlePhase === void 0 ? (_reportPossibleCrUseOfBattlePhase({
            error: Error()
          }), BattlePhase) : BattlePhase).Defeat);

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('battle:defeat');
          (_crd && runEvents === void 0 ? (_reportPossibleCrUseOfrunEvents({
            error: Error()
          }), runEvents) : runEvents).emit('battle:defeat', {});
        }

        setPaused(paused) {
          var _this$_autoAttack2;

          (_this$_autoAttack2 = this._autoAttack) == null || _this$_autoAttack2.setActive(!paused);
          (_crd && BattleClock === void 0 ? (_reportPossibleCrUseOfBattleClock({
            error: Error()
          }), BattleClock) : BattleClock).instance.paused = paused;
        }

        _setPhase(phase) {
          this._phase = phase;
        }

        update(dt) {
          var _this$_combatSystem;

          (_crd && BattleClock === void 0 ? (_reportPossibleCrUseOfBattleClock({
            error: Error()
          }), BattleClock) : BattleClock).instance.tick(dt); // Advance the new combat engine when wired; no effect until entities register.

          (_this$_combatSystem = this._combatSystem) == null || _this$_combatSystem.update(dt);
          if (this._phase !== (_crd && BattlePhase === void 0 ? (_reportPossibleCrUseOfBattlePhase({
            error: Error()
          }), BattlePhase) : BattlePhase).InProgress) return;

          this._pruneInvalidMonsters();

          if (this._player) {
            for (const entry of this._monsters) {
              entry.monster.updateAI(dt, this._player);
              entry.monster.updateStatusTimers(dt);
            }
          }
        }

        onDestroy() {
          this._clearMonsters();

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).offTarget(this);
        }

        get phase() {
          return this._phase;
        }

        get isRoomCleared() {
          return this._isRoomCleared;
        }

        get killCount() {
          return this._killCount;
        }

        get totalMonsters() {
          return this._totalMonsters;
        }

        get aliveMonsters() {
          return this._monsters.filter(e => {
            var _e$monster;

            return ((_e$monster = e.monster) == null ? void 0 : _e$monster.isValid) && !e.monster.isDead;
          });
        }

        get monsterCount() {
          return this.aliveMonsters.length;
        }

        getAllMonsters() {
          return this.aliveMonsters.map(e => e.monster);
        }
        /** @deprecated Resolve combat through the ICombatSystem service token for new code. */


        get combatSystem() {
          return this._combatSystem;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "monsterPrefab", [_dec2], {
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
//# sourceMappingURL=9257a1c4262692ca4134a98e14e8432e38872710.js.map