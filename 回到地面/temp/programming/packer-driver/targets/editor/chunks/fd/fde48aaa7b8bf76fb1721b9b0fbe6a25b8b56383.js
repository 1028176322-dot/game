System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7", "__unresolved_8", "__unresolved_9", "__unresolved_10", "__unresolved_11", "__unresolved_12"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, GameConfig, MathUtils, eventBus, CombatEntity, StatusController, DamageReceiver, BossPhaseController, ChargerAI, RangedAI, DefenderAI, SummonerAI, SuiciderAI, MonsterAgent, _crd, AI_REGISTRY;

  function _reportPossibleCrUseOfGameConfig(extras) {
    _reporterNs.report("GameConfig", "../../core/GameConfig", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMathUtils(extras) {
    _reporterNs.report("MathUtils", "../../utils/MathUtils", _context.meta, extras);
  }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterConfig(extras) {
    _reporterNs.report("MonsterConfig", "../MonsterController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCombatEntity(extras) {
    _reporterNs.report("CombatEntity", "./CombatEntity", _context.meta, extras);
  }

  function _reportPossibleCrUseOfStatusController(extras) {
    _reporterNs.report("StatusController", "./StatusController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfDamageReceiver(extras) {
    _reporterNs.report("DamageReceiver", "./DamageReceiver", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBossPhaseController(extras) {
    _reporterNs.report("BossPhaseController", "./BossPhaseController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterAI(extras) {
    _reporterNs.report("MonsterAI", "./ai/MonsterAI", _context.meta, extras);
  }

  function _reportPossibleCrUseOfChargerAI(extras) {
    _reporterNs.report("ChargerAI", "./ai/ChargerAI", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRangedAI(extras) {
    _reporterNs.report("RangedAI", "./ai/RangedAI", _context.meta, extras);
  }

  function _reportPossibleCrUseOfDefenderAI(extras) {
    _reporterNs.report("DefenderAI", "./ai/DefenderAI", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSummonerAI(extras) {
    _reporterNs.report("SummonerAI", "./ai/SummonerAI", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSuiciderAI(extras) {
    _reporterNs.report("SuiciderAI", "./ai/SuiciderAI", _context.meta, extras);
  }

  _export("MonsterAgent", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      GameConfig = _unresolved_2.GameConfig;
    }, function (_unresolved_3) {
      MathUtils = _unresolved_3.MathUtils;
    }, function (_unresolved_4) {
      eventBus = _unresolved_4.eventBus;
    }, function (_unresolved_5) {
      CombatEntity = _unresolved_5.CombatEntity;
    }, function (_unresolved_6) {
      StatusController = _unresolved_6.StatusController;
    }, function (_unresolved_7) {
      DamageReceiver = _unresolved_7.DamageReceiver;
    }, function (_unresolved_8) {
      BossPhaseController = _unresolved_8.BossPhaseController;
    }, function (_unresolved_9) {
      ChargerAI = _unresolved_9.ChargerAI;
    }, function (_unresolved_10) {
      RangedAI = _unresolved_10.RangedAI;
    }, function (_unresolved_11) {
      DefenderAI = _unresolved_11.DefenderAI;
    }, function (_unresolved_12) {
      SummonerAI = _unresolved_12.SummonerAI;
    }, function (_unresolved_13) {
      SuiciderAI = _unresolved_13.SuiciderAI;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "fd2eajsEe9AI5BPjBKWDbn4", "MonsterAgent", undefined);
      /**
       * MonsterAgent - 怪物逻辑代理
       *
       * 组合 CombatEntity + StatusController + BossPhaseController + AI 策略
       * 负责移动/攻击/召唤/自爆/死亡等逻辑
       *
       * Phase 7: 从 MonsterController 提取
       */


      AI_REGISTRY = {
        charger: _crd && ChargerAI === void 0 ? (_reportPossibleCrUseOfChargerAI({
          error: Error()
        }), ChargerAI) : ChargerAI,
        ranged: _crd && RangedAI === void 0 ? (_reportPossibleCrUseOfRangedAI({
          error: Error()
        }), RangedAI) : RangedAI,
        defender: _crd && DefenderAI === void 0 ? (_reportPossibleCrUseOfDefenderAI({
          error: Error()
        }), DefenderAI) : DefenderAI,
        summoner: _crd && SummonerAI === void 0 ? (_reportPossibleCrUseOfSummonerAI({
          error: Error()
        }), SummonerAI) : SummonerAI,
        suicider: _crd && SuiciderAI === void 0 ? (_reportPossibleCrUseOfSuiciderAI({
          error: Error()
        }), SuiciderAI) : SuiciderAI,
        elite: _crd && ChargerAI === void 0 ? (_reportPossibleCrUseOfChargerAI({
          error: Error()
        }), ChargerAI) : ChargerAI // elite 使用 charger 基础行为 + BossPhaseController

      };

      _export("MonsterAgent", MonsterAgent = class MonsterAgent {
        constructor(_hooks) {
          this.entity = void 0;
          this.status = void 0;
          this.damageReceiver = void 0;
          this.bossPhase = void 0;
          this.gridX = 0;
          this.gridY = 0;
          this.attackTimer = 0;
          this.attackInterval = 1.5;
          this.eliteAbilityTimer = 0;
          this.eliteAbilityInterval = 4.0;
          this._state = 'idle';
          this._ai = null;
          this._aiInst = null;
          this._aiType = 'charger';
          this._config = null;
          this._hooks = _hooks;
          this.entity = new (_crd && CombatEntity === void 0 ? (_reportPossibleCrUseOfCombatEntity({
            error: Error()
          }), CombatEntity) : CombatEntity)(20, 5, 1, 60);
          this.status = new (_crd && StatusController === void 0 ? (_reportPossibleCrUseOfStatusController({
            error: Error()
          }), StatusController) : StatusController)();
          this.damageReceiver = new (_crd && DamageReceiver === void 0 ? (_reportPossibleCrUseOfDamageReceiver({
            error: Error()
          }), DamageReceiver) : DamageReceiver)(this.entity, this.status, () => this._aiType === 'defender' && this._state === 'defend' ? 0.5 : 1, (_dmg, _crit) => {
            var _this$_hooks$onFlashW, _this$_hooks;

            (_this$_hooks$onFlashW = (_this$_hooks = this._hooks).onFlashWhite) == null || _this$_hooks$onFlashW.call(_this$_hooks);
          });
          this.bossPhase = new (_crd && BossPhaseController === void 0 ? (_reportPossibleCrUseOfBossPhaseController({
            error: Error()
          }), BossPhaseController) : BossPhaseController)({
            isBoss: false,
            phases: 1,
            phaseTriggers: []
          }, this.entity, (p, mp) => (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('boss:phase_changed', this, p, mp));
        }

        get state() {
          return this._state;
        }

        get isDead() {
          return this.entity.isDead;
        }

        get config() {
          return this._config;
        }

        init(config, gridX, gridY) {
          this._config = config;
          this._aiType = config.aiType;
          this.entity.reset(config.hp, config.atk, config.def, config.speed);
          this.gridX = gridX;
          this.gridY = gridY;
          this.attackInterval = this._calcAttackInterval(config.aiType);
          this.attackTimer = 0;
          this.status.reset();
          this.bossPhase.reset(config.isBoss || false, config.phases || 1, config.phaseTrigger || []);
          this._state = 'idle';
          this.eliteAbilityTimer = 0;
          const Cls = AI_REGISTRY[config.aiType];

          if (Cls) {
            var _this$_aiInst$reset, _this$_aiInst;

            this._aiInst = new Cls();
            this._ai = this._aiInst;
            (_this$_aiInst$reset = (_this$_aiInst = this._aiInst).reset) == null || _this$_aiInst$reset.call(_this$_aiInst);
          }

          this._hooks.setOccupied(gridX, gridY, true);
        }

        updateAI(dt, playerGridX, playerGridY) {
          if (this.entity.isDead) return;
          if (this.status.isFrozen) return;
          const dist = (_crd && MathUtils === void 0 ? (_reportPossibleCrUseOfMathUtils({
            error: Error()
          }), MathUtils) : MathUtils).manhattanDistance(this.gridX, this.gridY, playerGridX, playerGridY);
          if (!this.status.isSilenced) this.attackTimer += dt;

          if (this._ai) {
            this._ai.update({
              agent: this,
              playerGridX,
              playerGridY,
              dist,
              dt
            });
          }

          if (this.attackTimer >= this.attackInterval && this._isInAttackRange(dist) && !this.status.isSilenced) {
            this._attackPlayer();

            this.attackTimer = 0;
          }

          if (this._aiType === 'elite' || this._aiType === 'elite') {
            this.bossPhase.checkPhase();
          }
        }

        setState(state) {
          var _this$_hooks$onStateC, _this$_hooks2;

          if (!this._isValidTransition(this._state, state)) return;
          this._state = state;
          (_this$_hooks$onStateC = (_this$_hooks2 = this._hooks).onStateChanged) == null || _this$_hooks$onStateC.call(_this$_hooks2, state);
        } // ======== 移动（由 AI 调用，通过 AIContext 传入玩家坐标） ========


        _moveToCell(dx, dy) {
          const nx = this.gridX + dx;
          const ny = this.gridY + dy;

          if (this._hooks.isWalkable(nx, ny)) {
            this._hooks.setOccupied(this.gridX, this.gridY, false);

            this.gridX = nx;
            this.gridY = ny;

            this._hooks.setOccupied(nx, ny, true);

            const dur = 1 / Math.max(1, this.entity.speed) * (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).TILE_SIZE;

            this._hooks.moveNodeTo(this._hooks.gridToWorldX(nx), this._hooks.gridToWorldY(ny), dur);
          }
        }

        moveTowardPlayer() {// 由 AI 的 AIContext 协调——实际执行在 updateAI 里用 ctx 中的 playerGridX/Y
          // 此处为空占位。MonsterController 会调用 _executeMovement
        }

        retreatFromPlayer() {// 同上
        }
        /** 由 MonsterController 每帧调用，执行实际移动 */


        executeMovement(dirX, dirY) {
          let newX = this.gridX;
          let newY = this.gridY;
          if (Math.abs(dirX) >= Math.abs(dirY) && dirX !== 0) newX += Math.sign(dirX);else if (dirY !== 0) newY += Math.sign(dirY);

          if (this._hooks.isWalkable(newX, newY)) {
            this._hooks.setOccupied(this.gridX, this.gridY, false);

            this.gridX = newX;
            this.gridY = newY;

            this._hooks.setOccupied(newX, newY, true);

            const dur = 1 / Math.max(1, this.entity.speed) * (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).TILE_SIZE;

            this._hooks.moveNodeTo(this._hooks.gridToWorldX(newX), this._hooks.gridToWorldY(newY), dur);
          }
        }

        boostSpeed(factor) {
          this.entity.speed = Math.floor(this.entity.speed * factor);
        }
        /** 由 AI（ChargerAI/DefenderAI）调用 */


        moveTowardTarget(tx, ty) {
          const dx = Math.sign(tx - this.gridX);
          const dy = Math.sign(ty - this.gridY);
          this.executeMovement(dx, dy);
        }
        /** 由 AI（RangedAI/SummonerAI）调用 */


        retreatFromTarget(tx, ty) {
          const dx = Math.sign(this.gridX - tx);
          const dy = Math.sign(this.gridY - ty);
          this.executeMovement(dx, dy);
        } // ======== 攻击 ========


        _attackPlayer() {
          var _this$_hooks$onAttack, _this$_hooks3;

          (_this$_hooks$onAttack = (_this$_hooks3 = this._hooks).onAttackAnimation) == null || _this$_hooks$onAttack.call(_this$_hooks3);
          const isCrit = (_crd && MathUtils === void 0 ? (_reportPossibleCrUseOfMathUtils({
            error: Error()
          }), MathUtils) : MathUtils).chance((_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).CRIT_BASE_CHANCE);
          const dmg = isCrit ? Math.floor(this.entity.atk * (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).CRIT_MULTIPLIER) : this.entity.atk;
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('monster:attacked', this.gridX, this.gridY, dmg, isCrit);
        } // ======== 召唤 ========


        summonMinion() {
          var _this$_config$name, _this$_config, _this$_config$hp, _this$_config2, _this$_config$atk, _this$_config3, _this$_hooks$onSummon, _this$_hooks4;

          const pos = this._findSpawnAdjacent();

          if (!pos) return;
          const cfg = {
            name: ((_this$_config$name = (_this$_config = this._config) == null ? void 0 : _this$_config.name) != null ? _this$_config$name : '') + '_召唤',
            hp: Math.floor(((_this$_config$hp = (_this$_config2 = this._config) == null ? void 0 : _this$_config2.hp) != null ? _this$_config$hp : 10) * 0.4),
            atk: Math.floor(((_this$_config$atk = (_this$_config3 = this._config) == null ? void 0 : _this$_config3.atk) != null ? _this$_config$atk : 5) * 0.5),
            def: 0,
            speed: 70,
            aiType: 'charger',
            exp: 1
          };
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('monster:summon', cfg, pos.x, pos.y);
          (_this$_hooks$onSummon = (_this$_hooks4 = this._hooks).onSummonEffect) == null || _this$_hooks$onSummon.call(_this$_hooks4);
        } // ======== 自爆 ========


        suicideExplode() {
          var _this$_config$atk2, _this$_config4;

          if (this.entity.isDead) return;
          const dmg = Math.floor(((_this$_config$atk2 = (_this$_config4 = this._config) == null ? void 0 : _this$_config4.atk) != null ? _this$_config$atk2 : 5) * 2);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('monster:explosion', this.gridX, this.gridY, dmg);

          this._die();
        } // ======== 死亡 ========


        die() {
          if (this.entity.isDead) return;

          this._die();
        }

        _die() {
          var _this$_hooks$onDieAni, _this$_hooks5, _this$_config$exp, _this$_config5;

          this.entity.markDead();
          this.setState('dead');

          this._hooks.setOccupied(this.gridX, this.gridY, false);

          (_this$_hooks$onDieAni = (_this$_hooks5 = this._hooks).onDieAnimation) == null || _this$_hooks$onDieAni.call(_this$_hooks5);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('monster:death', this.gridX, this.gridY, (_this$_config$exp = (_this$_config5 = this._config) == null ? void 0 : _this$_config5.exp) != null ? _this$_config$exp : 0);
        } // ======== 承受伤害 ========


        takeDamage(rawDamage, isCrit) {
          return this.damageReceiver.takeDamage(rawDamage, isCrit);
        } // ======== 元素状态 ========


        freeze(duration) {
          this.status.freeze(duration);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('monster:status_freeze', this, duration);
        }

        silence(duration) {
          this.status.silence(duration);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('monster:status_silence', this, duration);
        }

        applyDefDebuff(multiplier, duration, isDamageTaken) {
          this.status.applyDefDebuff(multiplier, duration, isDamageTaken);
        }

        updateTimers(dt) {
          this.status.update(dt);
        }
        /** 使用精英特殊能力（供 MonsterController 按怪物名调度） */


        useEliteAbility(_dist) {
          return Math.floor(this.entity.atk * 0.5);
        } // ======== 私有 ========


        _findSpawnAdjacent() {
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
            const nx = this.gridX + dx,
                  ny = this.gridY + dy;
            if (this._hooks.isWalkable(nx, ny)) return {
              x: nx,
              y: ny
            };
          }

          return null;
        }

        _isInAttackRange(dist) {
          return dist <= (this._aiType === 'ranged' || this._aiType === 'summoner' ? 4 : 1);
        }

        _calcAttackInterval(aiType) {
          var _map$aiType;

          const map = {
            charger: (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).MONSTER_ATK_INTERVAL_CHARGER,
            ranged: (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).MONSTER_ATK_INTERVAL_RANGED,
            defender: (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).MONSTER_ATK_INTERVAL_DEFENDER,
            summoner: 3,
            suicider: 2,
            elite: 1.2
          };
          return (_map$aiType = map[aiType]) != null ? _map$aiType : 1.5;
        }

        _isValidTransition(from, to) {
          return from !== 'dead';
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=fde48aaa7b8bf76fb1721b9b0fbe6a25b8b56383.js.map