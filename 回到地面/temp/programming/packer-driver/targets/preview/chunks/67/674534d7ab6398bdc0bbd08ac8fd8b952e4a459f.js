System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7", "__unresolved_8", "__unresolved_9"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec3, tween, Sprite, Animation, GameConfig, PlayerState, eventBus, GameEvent, JoystickDirection, PlayerStats, RunRng, runEvents, PlayerDataManager, _dec, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, PlayerController;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfGameConfig(extras) {
    _reporterNs.report("GameConfig", "../core/GameConfig", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerState(extras) {
    _reporterNs.report("PlayerState", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameEvent(extras) {
    _reporterNs.report("GameEvent", "../core/GameManager", _context.meta, extras);
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

  function _reportPossibleCrUseOfPlayerStats(extras) {
    _reporterNs.report("PlayerStats", "./PlayerStats", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIPlayerAgent(extras) {
    _reporterNs.report("IPlayerAgent", "./IPlayerAgent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRunRng(extras) {
    _reporterNs.report("RunRng", "../core/rng/RunRng", _context.meta, extras);
  }

  function _reportPossibleCrUseOfrunEvents(extras) {
    _reporterNs.report("runEvents", "../core/events", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerDataManager(extras) {
    _reporterNs.report("PlayerDataManager", "../core/PlayerDataManager", _context.meta, extras);
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
      Vec3 = _cc.Vec3;
      tween = _cc.tween;
      Sprite = _cc.Sprite;
      Animation = _cc.Animation;
    }, function (_unresolved_2) {
      GameConfig = _unresolved_2.GameConfig;
    }, function (_unresolved_3) {
      PlayerState = _unresolved_3.PlayerState;
    }, function (_unresolved_4) {
      eventBus = _unresolved_4.eventBus;
    }, function (_unresolved_5) {
      GameEvent = _unresolved_5.GameEvent;
    }, function (_unresolved_6) {
      JoystickDirection = _unresolved_6.JoystickDirection;
    }, function (_unresolved_7) {
      PlayerStats = _unresolved_7.PlayerStats;
    }, function (_unresolved_8) {
      RunRng = _unresolved_8.RunRng;
    }, function (_unresolved_9) {
      runEvents = _unresolved_9.runEvents;
    }, function (_unresolved_10) {
      PlayerDataManager = _unresolved_10.PlayerDataManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ad1e84OUmpG6bFHceXQ2mGE", "PlayerController", undefined);
      /**
       * PlayerController - 玩家角色控制器
       * 负责角色移动、4 方向动画、翻滚、HP 管理
       * 运行时属性通过 PlayerStats 叠加层计算
       * 状态切换走统一 setState，禁止散落赋值
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3', 'tween', 'Sprite', 'Animation']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * @deprecated PlayerController is being decomposed into the 6 ECS components
       * (Movement/Animation/Combat/Stat/Target/Interaction, §3.12). Runtime behavior
       * is unchanged by this marker; the scene-node swap (remove PlayerController,
       * mount the 6 components on the Player node) is an in-editor task (P1-2).
       */

      _export("PlayerController", PlayerController = (_dec = ccclass('PlayerController'), _dec(_class = (_class2 = class PlayerController extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "maxHP", _descriptor, this);

          _initializerDefineProperty(this, "atk", _descriptor2, this);

          _initializerDefineProperty(this, "def", _descriptor3, this);

          _initializerDefineProperty(this, "moveSpeed", _descriptor4, this);

          /** 运行时属性叠加层（外部通过此对象访问最终属性） */
          this.stats = (_crd && PlayerStats === void 0 ? (_reportPossibleCrUseOfPlayerStats({
            error: Error()
          }), PlayerStats) : PlayerStats).createDefault();
          this._currentHP = 100;
          this._state = (_crd && PlayerState === void 0 ? (_reportPossibleCrUseOfPlayerState({
            error: Error()
          }), PlayerState) : PlayerState).Idle;
          this._gridX = 3;
          this._gridY = 3;
          this._targetPos = new Vec3(0, 0, 0);
          this._isMoving = false;
          this._gridManager = null;
          this._dodgeTimer = 0;
          this._dodgeCooldown = 0;
          this._isDodging = false;
          this._sprite = null;
          this._animation = null;
          this._lastClickTime = 0;
          this._lastClickDir = (_crd && JoystickDirection === void 0 ? (_reportPossibleCrUseOfJoystickDirection({
            error: Error()
          }), JoystickDirection) : JoystickDirection).None;

          /** 生命值变化回调 */
          this.onHPChanged = null;
        }

        onLoad() {
          // 从 @property 默认值初始化属性叠加层基础值
          this.stats = (_crd && PlayerStats === void 0 ? (_reportPossibleCrUseOfPlayerStats({
            error: Error()
          }), PlayerStats) : PlayerStats).createFromBase({
            atk: this.atk,
            def: this.def,
            maxHP: this.maxHP,
            moveSpeed: this.moveSpeed,
            atkSpeed: (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).AUTO_ATTACK_INTERVAL,
            attackRange: 2,
            critChance: (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).CRIT_BASE_CHANCE,
            critMultiplier: (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).CRIT_MULTIPLIER
          });
          this._currentHP = this.stats.getFinalStats().maxHP;
          this._sprite = this.getComponent(Sprite);
          this._animation = this.getComponent(Animation);
        }
        /** 初始化网格引用 */


        init(gridManager) {
          this._gridManager = gridManager; // 重置玩家属性（新的一局）

          this.stats = (_crd && PlayerStats === void 0 ? (_reportPossibleCrUseOfPlayerStats({
            error: Error()
          }), PlayerStats) : PlayerStats).createFromBase({
            atk: this.atk,
            def: this.def,
            maxHP: this.maxHP,
            moveSpeed: this.moveSpeed,
            atkSpeed: (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).AUTO_ATTACK_INTERVAL,
            attackRange: 2,
            critChance: (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).CRIT_BASE_CHANCE,
            critMultiplier: (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).CRIT_MULTIPLIER
          });
          this._currentHP = this.stats.getFinalStats().maxHP; // 出生点：网格中心

          var center = Math.floor(gridManager.gridSize / 2);
          this._gridX = center;
          this._gridY = center;
          this._targetPos = gridManager.gridToWorld(this._gridX, this._gridY);
          this.node.setPosition(this._targetPos);
          gridManager.setOccupied(this._gridX, this._gridY, true);
        }
        /** 处理摇杆输入 */


        handleJoystick(event) {
          if (this._state === (_crd && PlayerState === void 0 ? (_reportPossibleCrUseOfPlayerState({
            error: Error()
          }), PlayerState) : PlayerState).Dead || this._state === (_crd && PlayerState === void 0 ? (_reportPossibleCrUseOfPlayerState({
            error: Error()
          }), PlayerState) : PlayerState).Dodging) return;

          if (!event.isActive) {
            this._setState((_crd && PlayerState === void 0 ? (_reportPossibleCrUseOfPlayerState({
              error: Error()
            }), PlayerState) : PlayerState).Idle);

            return;
          }

          var dx = 0,
              dy = 0;

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
          } // 双击同方向 → 翻滚


          if (dx !== 0 || dy !== 0) {
            var now = Date.now();

            if (event.direction === this._lastClickDir && now - this._lastClickTime < 300) {
              this._tryDodge(dx, dy);

              this._lastClickTime = 0;
              return;
            }

            this._lastClickTime = now;
            this._lastClickDir = event.direction;
          }

          this._tryMove(dx, dy);
        }
        /** 尝试移动（使用最终 moveSpeed） */


        _tryMove(dx, dy) {
          if (this._isMoving) return;
          if (!this._gridManager) return;
          var newX = this._gridX + dx;
          var newY = this._gridY + dy;

          if (this._gridManager.isWalkable(newX, newY)) {
            var speed = this.stats.getFinalStats().moveSpeed;

            this._gridManager.setOccupied(this._gridX, this._gridY, false);

            this._gridX = newX;
            this._gridY = newY;

            this._gridManager.setOccupied(newX, newY, true);

            this._targetPos = this._gridManager.gridToWorld(newX, newY);

            this._setState((_crd && PlayerState === void 0 ? (_reportPossibleCrUseOfPlayerState({
              error: Error()
            }), PlayerState) : PlayerState).Moving);

            this._isMoving = true;
            tween(this.node).to(1 / speed * (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).TILE_SIZE, {
              position: this._targetPos
            }).call(() => {
              this._isMoving = false;

              if (this._state !== (_crd && PlayerState === void 0 ? (_reportPossibleCrUseOfPlayerState({
                error: Error()
              }), PlayerState) : PlayerState).Dodging) {
                this._setState((_crd && PlayerState === void 0 ? (_reportPossibleCrUseOfPlayerState({
                  error: Error()
                }), PlayerState) : PlayerState).Idle);
              }
            }).start(); // 面向方向（用于动画）

            this._updateFacing(dx, dy);
          }
        }
        /** 尝试翻滚 */


        _tryDodge(dx, dy) {
          if (this._dodgeCooldown > 0) return;
          if (this._isDodging) return;

          this._setState((_crd && PlayerState === void 0 ? (_reportPossibleCrUseOfPlayerState({
            error: Error()
          }), PlayerState) : PlayerState).Dodging);

          this._isDodging = true;
          this._dodgeCooldown = (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).DODGE_COOLDOWN;
          this._dodgeTimer = (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).DODGE_DURATION;
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('player:dodged'); // M2.1: 触发穿影标记

          (_crd && runEvents === void 0 ? (_reportPossibleCrUseOfrunEvents({
            error: Error()
          }), runEvents) : runEvents).emit('player:dodged', {}); // 翻滚位移（固定 1 格）

          var newX = this._gridX + dx;
          var newY = this._gridY + dy;

          if (this._gridManager && this._gridManager.isWalkable(newX, newY)) {
            this._gridManager.setOccupied(this._gridX, this._gridY, false);

            this._gridX = newX;
            this._gridY = newY;

            this._gridManager.setOccupied(newX, newY, true);

            this._targetPos = this._gridManager.gridToWorld(newX, newY);
            tween(this.node).to(0.3, {
              position: this._targetPos
            }).call(() => {
              this._isDodging = false;

              this._setState((_crd && PlayerState === void 0 ? (_reportPossibleCrUseOfPlayerState({
                error: Error()
              }), PlayerState) : PlayerState).Idle);
            }).start();
          } else {
            // 翻滚撞墙：原地触发无敌帧
            this._dodgeTimer = (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).DODGE_DURATION;
            this.scheduleOnce(() => {
              this._isDodging = false;

              if (this._state === (_crd && PlayerState === void 0 ? (_reportPossibleCrUseOfPlayerState({
                error: Error()
              }), PlayerState) : PlayerState).Dodging) {
                this._setState((_crd && PlayerState === void 0 ? (_reportPossibleCrUseOfPlayerState({
                  error: Error()
                }), PlayerState) : PlayerState).Idle);
              }
            }, (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).DODGE_DURATION);
          }
        }
        /** 状态切换（统一入口，禁止散落赋值） */


        _setState(state) {
          var oldState = this._state;
          this._state = state;

          switch (state) {
            case (_crd && PlayerState === void 0 ? (_reportPossibleCrUseOfPlayerState({
              error: Error()
            }), PlayerState) : PlayerState).Idle:
              this._playAnimation('idle');

              break;

            case (_crd && PlayerState === void 0 ? (_reportPossibleCrUseOfPlayerState({
              error: Error()
            }), PlayerState) : PlayerState).Moving:
              this._playAnimation('walk');

              break;

            case (_crd && PlayerState === void 0 ? (_reportPossibleCrUseOfPlayerState({
              error: Error()
            }), PlayerState) : PlayerState).Dodging:
              this._playAnimation('dodge');

              break;

            case (_crd && PlayerState === void 0 ? (_reportPossibleCrUseOfPlayerState({
              error: Error()
            }), PlayerState) : PlayerState).Dead:
              this._playAnimation('die');

              break;
          }
        }
        /** 更新面向方向 */


        _updateFacing(dx, dy) {
          if (this._sprite) {
            if (dx < 0) {
              this.node.setScale(new Vec3(-1, 1, 1));
            } else if (dx > 0) {
              this.node.setScale(new Vec3(1, 1, 1));
            }
          }
        }
        /** 播放动画（缺失时兜底不做处理） */


        _playAnimation(name) {
          if (this._animation) {
            try {
              this._animation.play(name);
            } catch (err) {// 动画缺失：不做处理，不崩溃
            }
          }
        }
        /** 受到伤害（使用最终 DEF + 减伤） */


        takeDamage(rawDamage, isCrit) {
          var _this$onHPChanged;

          if (isCrit === void 0) {
            isCrit = false;
          }

          if (this._isDodging) return; // 无敌帧免疫伤害

          var finalStats = this.stats.getFinalStats();

          var actualDamage = this._calcDamage(rawDamage, finalStats);

          this._currentHP = Math.max(0, this._currentHP - actualDamage);
          var maxHP = finalStats.maxHP;
          (_this$onHPChanged = this.onHPChanged) == null || _this$onHPChanged.call(this, this._currentHP, maxHP);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('player:damaged', actualDamage, isCrit);
          (_crd && runEvents === void 0 ? (_reportPossibleCrUseOfrunEvents({
            error: Error()
          }), runEvents) : runEvents).emit('player:damaged', {
            amount: actualDamage,
            isCrit
          });

          if (this._currentHP <= 0) {
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
        /** 伤害公式：rawDamage + d6 - (DEF × 0.5)，再 × 减伤因子 */


        _calcDamage(rawDamage, stats) {
          var dmgRng = (_crd && RunRng === void 0 ? (_reportPossibleCrUseOfRunRng({
            error: Error()
          }), RunRng) : RunRng).instance.fork('player:damageCalc');
          var d6Roll = dmgRng.d6();
          var reduced = Math.floor(stats.def * (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).DAMAGE_FORMULA_DEF_FACTOR);
          var afterDef = Math.max((_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).MIN_DAMAGE, rawDamage + d6Roll - reduced); // 应用减伤百分比

          return Math.floor(afterDef * (1 - stats.damageReduction));
        }
        /** 回血（使用最终 maxHP，含铁胃天赋增益） */


        heal(amount) {
          var _this$onHPChanged2;

          // 铁胃天赋: 回复效果 +30%
          var pdm = (_crd && PlayerDataManager === void 0 ? (_reportPossibleCrUseOfPlayerDataManager({
            error: Error()
          }), PlayerDataManager) : PlayerDataManager).getInstance();
          var effectiveAmount = pdm.selectedTalent === 'iron_stomach' ? Math.floor(amount * 1.3) : amount;
          var maxHP = this.stats.getFinalStats().maxHP;
          this._currentHP = Math.min(maxHP, this._currentHP + effectiveAmount);
          (_this$onHPChanged2 = this.onHPChanged) == null || _this$onHPChanged2.call(this, this._currentHP, maxHP);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('player:healed', effectiveAmount);
          (_crd && runEvents === void 0 ? (_reportPossibleCrUseOfrunEvents({
            error: Error()
          }), runEvents) : runEvents).emit('player:healed', {
            amount: effectiveAmount
          });
        }
        /** 更新 CD + PlayerStats 倒计时修饰符（每帧调用） */


        update(dt) {
          if (this._dodgeCooldown > 0) {
            this._dodgeCooldown = Math.max(0, this._dodgeCooldown - dt);
          }

          if (this._dodgeTimer > 0) {
            this._dodgeTimer = Math.max(0, this._dodgeTimer - dt);
          } // 更新属性修饰符计时


          this.stats.update(dt);
        } // ======== 属性访问 ========


        get state() {
          return this._state;
        }

        get currentHP() {
          return this._currentHP;
        }

        get gridX() {
          return this._gridX;
        }

        get gridY() {
          return this._gridY;
        }

        get isDodging() {
          return this._isDodging;
        }

        get isAlive() {
          return this._currentHP > 0;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "maxHP", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 100;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "atk", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 10;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "def", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 3;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "moveSpeed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).PLAYER_MOVE_SPEED;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=674534d7ab6398bdc0bbd08ac8fd8b952e4a459f.js.map