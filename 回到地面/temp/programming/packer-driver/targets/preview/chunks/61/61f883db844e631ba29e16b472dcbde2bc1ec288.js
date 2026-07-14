System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7", "__unresolved_8", "__unresolved_9"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, GameBootstrap, GameEvent, eventBus, PlayerState, IEntityManager, ICombatSystem, EcsEntityFactory, EcsBridgeCore, PlayerStats, JoystickDirection, _dec, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _class3, _crd, ccclass, property, EcsEntityBridge;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfGameBootstrap(extras) {
    _reporterNs.report("GameBootstrap", "../core/GameBootstrap", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameEvent(extras) {
    _reporterNs.report("GameEvent", "../core/GameManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerState(extras) {
    _reporterNs.report("PlayerState", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIEntityManager(extras) {
    _reporterNs.report("IEntityManager", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfICombatSystem(extras) {
    _reporterNs.report("ICombatSystem", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIEmContract(extras) {
    _reporterNs.report("IEmContract", "./EntityManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfICombatContract(extras) {
    _reporterNs.report("ICombatContract", "../battle/combat/CombatSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEcsEntityFactory(extras) {
    _reporterNs.report("EcsEntityFactory", "./EcsEntityFactory", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEntityBuildOptions(extras) {
    _reporterNs.report("EntityBuildOptions", "./EcsEntityFactory", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEcsBridgeCore(extras) {
    _reporterNs.report("EcsBridgeCore", "./EcsBridgeCore", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIPlayerAgent(extras) {
    _reporterNs.report("IPlayerAgent", "../battle/IPlayerAgent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerStats(extras) {
    _reporterNs.report("PlayerStats", "../battle/PlayerStats", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEntityTeam(extras) {
    _reporterNs.report("EntityTeam", "./StatDamageable", _context.meta, extras);
  }

  function _reportPossibleCrUseOfJoystickDirection(extras) {
    _reporterNs.report("JoystickDirection", "../ui/VirtualJoystick", _context.meta, extras);
  }

  function _reportPossibleCrUseOfJoystickEvent(extras) {
    _reporterNs.report("JoystickEvent", "../ui/VirtualJoystick", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGridManager(extras) {
    _reporterNs.report("GridManager", "../dungeon/GridManager", _context.meta, extras);
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
      GameBootstrap = _unresolved_2.GameBootstrap;
    }, function (_unresolved_3) {
      GameEvent = _unresolved_3.GameEvent;
    }, function (_unresolved_4) {
      eventBus = _unresolved_4.eventBus;
    }, function (_unresolved_5) {
      PlayerState = _unresolved_5.PlayerState;
    }, function (_unresolved_6) {
      IEntityManager = _unresolved_6.IEntityManager;
      ICombatSystem = _unresolved_6.ICombatSystem;
    }, function (_unresolved_7) {
      EcsEntityFactory = _unresolved_7.EcsEntityFactory;
    }, function (_unresolved_8) {
      EcsBridgeCore = _unresolved_8.EcsBridgeCore;
    }, function (_unresolved_9) {
      PlayerStats = _unresolved_9.PlayerStats;
    }, function (_unresolved_10) {
      JoystickDirection = _unresolved_10.JoystickDirection;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "8f3baKm/J1H37gbFmmbAN6u", "EcsEntityBridge", undefined); // EcsEntityBridge.ts — Cocos Component glue that binds an ECS entity to a cc.Node
      // (§3.12 engine wiring). All logic lives in the pure-TS EcsBridgeCore; this
      // file only adapts the engine lifecycle (onLoad/update/onDestroy) and injects
      // node-sync callbacks.
      //
      // Now ALSO implements IPlayerAgent (P3-4-B) so it can stand in for the
      // legacy PlayerController once the ECS player path is the live runtime (decision F).
      //
      // This is ADDITIVE: it is mounted on the player node in parallel with the
      // legacy PlayerController. Activation is gated by the static USE_ECS_PLAYER
      // flag (default FALSE) — while false, onLoad/update early-return, so the
      // bridge is fully inert and never fights the live PlayerController for node
      // position. Flipping the flag WITHOUT first removing PlayerController would
      // cause a position tug-of-war (bridge.setNodePosition vs PlayerController
      // tween) and a broken player — so the swap (flip flag + remove
      // PlayerController/AutoAttack) is the D step and MUST be editor-verified
      // (audit §10.1 red line).
      //
      // NOTE on `stats`: IPlayerAgent.stats is the legacy PlayerStats because 8+
      // consumers read attack-specific runtime fields (atkSpeed / critChance /
      // attackRange / lifeSteal / damageMultiplier / damageReduction / moveSpeed)
      // that the ECS StatComponent does not yet model. While the bridge is inert
      // those consumers run against the real PlayerController; once active, the
      // bridge must keep a PlayerStats mirror in sync (TODO, part of the D wiring).


      __checkObsolete__(['_decorator', 'Component']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("EcsEntityBridge", EcsEntityBridge = (_dec = ccclass('EcsEntityBridge'), _dec(_class = (_class2 = (_class3 = class EcsEntityBridge extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "baseHP", _descriptor, this);

          _initializerDefineProperty(this, "baseATK", _descriptor2, this);

          _initializerDefineProperty(this, "baseDEF", _descriptor3, this);

          _initializerDefineProperty(this, "baseSpeed", _descriptor4, this);

          this._core = null;
          this._gridToWorld = null;
          this._gridManager = null;
          this._startX = 0;
          this._startY = 0;
          this._team = 'enemy';
          this._isBoss = false;
          this._state = (_crd && PlayerState === void 0 ? (_reportPossibleCrUseOfPlayerState({
            error: Error()
          }), PlayerState) : PlayerState).Idle;
          this._playerStats = null;
          this.onHPChanged = null;
        }

        /** Inject a grid->world adapter from the spawner (e.g. GridManager.gridToWorld). */
        setGridAdapter(fn) {
          this._gridToWorld = fn;
        }
        /** Configure spawn cell + team before onLoad runs. */


        setSpawn(x, y, team, isBoss) {
          if (isBoss === void 0) {
            isBoss = false;
          }

          this._startX = x;
          this._startY = y;
          this._team = team;
          this._isBoss = isBoss;
        } // IPlayerAgent: bind the grid manager and derive a grid->world adapter.


        init(gridManager) {
          this._gridManager = gridManager;

          this._gridToWorld = (x, y) => {
            var v = gridManager.gridToWorld(x, y);
            return {
              x: v.x,
              y: v.y
            };
          };
        }

        onLoad() {
          if (!EcsEntityBridge.USE_ECS_PLAYER) {
            // Inert while gated: do NOT build an entity, do NOT drive the node.
            return;
          }

          var ctx = (_crd && GameBootstrap === void 0 ? (_reportPossibleCrUseOfGameBootstrap({
            error: Error()
          }), GameBootstrap) : GameBootstrap).context;

          if (!ctx) {
            console.warn('[EcsEntityBridge] GameContext not ready; entity not wired');
            return;
          }

          var opts = {
            id: this.node.name || "ecs_" + this._startX + "_" + this._startY,
            team: this._team,
            baseHP: this.baseHP,
            baseATK: this.baseATK,
            baseDEF: this.baseDEF,
            baseSpeed: this.baseSpeed,
            startX: this._startX,
            startY: this._startY,
            isBoss: this._isBoss,
            dispatch: cmd => {
              var cs = ctx.getOptional(_crd && ICombatSystem === void 0 ? (_reportPossibleCrUseOfICombatSystem({
                error: Error()
              }), ICombatSystem) : ICombatSystem);
              cs == null || cs.dispatch(cmd);
            }
          };
          var built = (_crd && EcsEntityFactory === void 0 ? (_reportPossibleCrUseOfEcsEntityFactory({
            error: Error()
          }), EcsEntityFactory) : EcsEntityFactory).build(ctx, opts);
          var em = ctx.getOptional(_crd && IEntityManager === void 0 ? (_reportPossibleCrUseOfIEntityManager({
            error: Error()
          }), IEntityManager) : IEntityManager);

          if (!em) {
            console.warn('[EcsEntityBridge] EntityManager missing; entity not wired');
            return;
          }

          this._core = new (_crd && EcsBridgeCore === void 0 ? (_reportPossibleCrUseOfEcsBridgeCore({
            error: Error()
          }), EcsBridgeCore) : EcsBridgeCore)(built.descriptor, built.damageable, em, {
            gridToWorld: (x, y) => this._gridToWorld ? this._gridToWorld(x, y) : {
              x: 0,
              y: 0
            },
            setNodePosition: (x, y) => this.node.setPosition(x, y, 0)
          });

          this._core.attach();
        }

        update(dt) {
          var _this$_core;

          if (!EcsEntityBridge.USE_ECS_PLAYER) return;
          (_this$_core = this._core) == null || _this$_core.tick(dt);
        }

        onDestroy() {
          var _this$_core2;

          (_this$_core2 = this._core) == null || _this$_core2.detach();
          this._core = null;
        } // ======== IPlayerAgent surface (only exercised when USE_ECS_PLAYER is true) ========


        handleJoystick(event) {
          if (!this._core || !this._gridManager) return;

          if (!event.isActive) {
            this._setState((_crd && PlayerState === void 0 ? (_reportPossibleCrUseOfPlayerState({
              error: Error()
            }), PlayerState) : PlayerState).Idle);

            return;
          }

          var dx = 0;
          var dy = 0;

          switch (event.direction) {
            case (_crd && JoystickDirection === void 0 ? (_reportPossibleCrUseOfJoystickDirection({
              error: Error()
            }), JoystickDirection) : JoystickDirection).Up:
              dy = -1;
              break;

            case (_crd && JoystickDirection === void 0 ? (_reportPossibleCrUseOfJoystickDirection({
              error: Error()
            }), JoystickDirection) : JoystickDirection).Down:
              dy = 1;
              break;

            case (_crd && JoystickDirection === void 0 ? (_reportPossibleCrUseOfJoystickDirection({
              error: Error()
            }), JoystickDirection) : JoystickDirection).Left:
              dx = -1;
              break;

            case (_crd && JoystickDirection === void 0 ? (_reportPossibleCrUseOfJoystickDirection({
              error: Error()
            }), JoystickDirection) : JoystickDirection).Right:
              dx = 1;
              break;
          }

          if (dx !== 0 || dy !== 0) {
            this._core.submitMove(dx, dy, (x, y) => this._gridManager.isWalkable(x, y));
          }
        }

        takeDamage(rawDamage, isCrit) {
          var _this$onHPChanged;

          if (isCrit === void 0) {
            isCrit = false;
          }

          if (!this._core) return;

          this._core.damageable.applyDamage(rawDamage);

          var hp = this._core.damageable.hp;
          var max = this._core.damageable.maxHP;
          (_this$onHPChanged = this.onHPChanged) == null || _this$onHPChanged.call(this, hp, max);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('player:damaged', rawDamage, isCrit);

          if (!this._core.damageable.alive) {
            this._setState((_crd && PlayerState === void 0 ? (_reportPossibleCrUseOfPlayerState({
              error: Error()
            }), PlayerState) : PlayerState).Dead);

            (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
              error: Error()
            }), eventBus) : eventBus).emit((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
              error: Error()
            }), GameEvent) : GameEvent).GAME_OVER);
          }
        }

        heal(amount) {
          var _this$onHPChanged2;

          if (!this._core) return;

          this._core.descriptor.stat.heal(amount);

          var hp = this._core.damageable.hp;
          var max = this._core.damageable.maxHP;
          (_this$onHPChanged2 = this.onHPChanged) == null || _this$onHPChanged2.call(this, hp, max);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('player:healed', {
            amount
          });
        }

        get stats() {
          if (!this._playerStats) {
            this._playerStats = (_crd && PlayerStats === void 0 ? (_reportPossibleCrUseOfPlayerStats({
              error: Error()
            }), PlayerStats) : PlayerStats).createDefault();
          }

          return this._playerStats;
        }

        get currentHP() {
          var _this$_core$damageabl, _this$_core3;

          return (_this$_core$damageabl = (_this$_core3 = this._core) == null ? void 0 : _this$_core3.damageable.hp) != null ? _this$_core$damageabl : this.baseHP;
        }

        get gridX() {
          var _this$_core$damageabl2, _this$_core4;

          return (_this$_core$damageabl2 = (_this$_core4 = this._core) == null ? void 0 : _this$_core4.damageable.gridX) != null ? _this$_core$damageabl2 : this._startX;
        }

        get gridY() {
          var _this$_core$damageabl3, _this$_core5;

          return (_this$_core$damageabl3 = (_this$_core5 = this._core) == null ? void 0 : _this$_core5.damageable.gridY) != null ? _this$_core$damageabl3 : this._startY;
        }

        get isAlive() {
          var _this$_core$damageabl4, _this$_core6;

          return (_this$_core$damageabl4 = (_this$_core6 = this._core) == null ? void 0 : _this$_core6.damageable.alive) != null ? _this$_core$damageabl4 : true;
        }

        get state() {
          return this._state;
        }

        get isDodging() {
          return false;
        }

        _setState(s) {
          this._state = s;
        }

      }, _class3.USE_ECS_PLAYER = false, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "baseHP", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 100;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "baseATK", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 10;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "baseDEF", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 5;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "baseSpeed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 60;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=61f883db844e631ba29e16b472dcbde2bc1ec288.js.map