System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, ElementType, GameConfig, MathUtils, eventBus, PlayerController, _dec, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, AutoAttack;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfElementType(extras) {
    _reporterNs.report("ElementType", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameConfig(extras) {
    _reporterNs.report("GameConfig", "../core/GameConfig", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMathUtils(extras) {
    _reporterNs.report("MathUtils", "../utils/MathUtils", _context.meta, extras);
  }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterController(extras) {
    _reporterNs.report("MonsterController", "./MonsterController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBattleManager(extras) {
    _reporterNs.report("BattleManager", "./BattleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerController(extras) {
    _reporterNs.report("PlayerController", "./PlayerController", _context.meta, extras);
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
      ElementType = _unresolved_2.ElementType;
    }, function (_unresolved_3) {
      GameConfig = _unresolved_3.GameConfig;
    }, function (_unresolved_4) {
      MathUtils = _unresolved_4.MathUtils;
    }, function (_unresolved_5) {
      eventBus = _unresolved_5.eventBus;
    }, function (_unresolved_6) {
      PlayerController = _unresolved_6.PlayerController;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "8b95cv55OdFFpCoQedZCNS+", "AutoAttack", undefined);
      /**
       * AutoAttack - 自动攻击组件（挂载在玩家节点上）
       * 通过 PlayerStats 获取最终属性（ATK/攻速/暴击/射程）
       * 支持元素附着接口（由 ElementSystem 通过 eventBus 注入）
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);

      /**
       * @deprecated AutoAttack logic (atk-speed / crit / life-steal / distance judgment)
       * has been absorbed into CombatComponent.resolveAutoAttack (P1-2). This monobehaviour
       * still drives the live player until the scene-node swap (remove AutoAttack, mount
       * the 6 ECS components) is done in the editor. Runtime behavior is unchanged.
       */
      _export("AutoAttack", AutoAttack = (_dec = ccclass('AutoAttack'), _dec(_class = (_class2 = class AutoAttack extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "attackRange", _descriptor, this);

          _initializerDefineProperty(this, "attackInterval", _descriptor2, this);

          _initializerDefineProperty(this, "atk", _descriptor3, this);

          _initializerDefineProperty(this, "critChance", _descriptor4, this);

          this._timer = 0;
          this._battleManager = null;
          this._player = null;
          this._isActive = true;

          /** 当前攻击附着的元素（默认 Physical，由能力/装备/遗物修改） */
          this._attackElement = (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
            error: Error()
          }), ElementType) : ElementType).Physical;

          /** 预攻击钩子: 返回 { forceCrit: boolean }, 用于穿影等能力 */
          this.onBeforeAttack = null;

          /** 后攻击钩子: 攻击后调用, 携带攻击结果 */
          this.onAfterAttack = null;
        }

        /** 初始化战斗管理器引用 */
        init(battleManager) {
          this._battleManager = battleManager;
        }
        /** 设置是否启用 */


        setActive(active) {
          this._isActive = active;
        }
        /** 设置攻击元素（外部系统调用，如 ElementSystem/AbilityResolver） */


        setAttackElement(element) {
          this._attackElement = element;
        }
        /** 重置攻击元素为物理 */


        resetAttackElement() {
          this._attackElement = (_crd && ElementType === void 0 ? (_reportPossibleCrUseOfElementType({
            error: Error()
          }), ElementType) : ElementType).Physical;
        }

        onLoad() {
          // 从父节点获取 PlayerController
          this._player = this.getComponent(_crd && PlayerController === void 0 ? (_reportPossibleCrUseOfPlayerController({
            error: Error()
          }), PlayerController) : PlayerController);
        }

        update(dt) {
          if (!this._isActive || !this._battleManager) return;

          if (!this._player) {
            this._player = this.getComponent(_crd && PlayerController === void 0 ? (_reportPossibleCrUseOfPlayerController({
              error: Error()
            }), PlayerController) : PlayerController);
            if (!this._player) return;
          } // 使用 PlayerStats 的最终攻速


          const finalStats = this._player.stats.getFinalStats();

          const interval = finalStats.atkSpeed;
          this._timer += dt;

          if (this._timer >= interval) {
            this._timer = 0;

            this._performAutoAttack(finalStats);
          }
        }
        /** 执行自动攻击（使用最终属性） */


        _performAutoAttack(stats) {
          var _this$onAfterAttack;

          if (!this._player || !this._battleManager) return;

          const nearestMonster = this._battleManager.getNearestMonster(this.node.getPosition(), stats.attackRange);

          if (!nearestMonster) {
            (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
              error: Error()
            }), eventBus) : eventBus).emit('attack:miss');
            return;
          } // 防御性检查：目标是否仍然有效


          const target = nearestMonster.monster;

          if (!target || !target.isValid || !target.node || !target.node.isValid || target.isDead) {
            (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
              error: Error()
            }), eventBus) : eventBus).emit('attack:miss');
            return;
          } // 精确距离判定（格为单位）


          const dist = (_crd && MathUtils === void 0 ? (_reportPossibleCrUseOfMathUtils({
            error: Error()
          }), MathUtils) : MathUtils).euclideanDistance(this.node.getPosition().x, this.node.getPosition().y, target.node.getPosition().x, target.node.getPosition().y);
          const distInTiles = dist / (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).TILE_SIZE;

          if (distInTiles > stats.attackRange) {
            (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
              error: Error()
            }), eventBus) : eventBus).emit('attack:miss');
            return;
          } // 暴击判定（支持预攻击钩子强制暴击）


          const preAttack = this.onBeforeAttack ? this.onBeforeAttack() : null;
          const isCrit = (preAttack == null ? void 0 : preAttack.forceCrit) || (_crd && MathUtils === void 0 ? (_reportPossibleCrUseOfMathUtils({
            error: Error()
          }), MathUtils) : MathUtils).chance(stats.critChance);
          const rawDamage = isCrit ? Math.floor(stats.atk * stats.critMultiplier) : stats.atk; // 应用伤害倍率

          const finalDamage = Math.max((_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).MIN_DAMAGE, Math.floor(rawDamage * stats.damageMultiplier)); // 施加伤害

          const killed = target.takeDamage(finalDamage, isCrit); // 生命偷取

          if (stats.lifeSteal > 0 && finalDamage > 0) {
            const healAmount = Math.max((_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).MIN_DAMAGE, Math.floor(finalDamage * stats.lifeSteal));

            this._player.heal(healAmount);
          } // 触发攻击事件（携带元素信息）


          const attackResult = {
            target: target,
            damage: finalDamage,
            isCrit,
            element: this._attackElement,
            killed
          };
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('attack:performed', attackResult);
          (_this$onAfterAttack = this.onAfterAttack) == null || _this$onAfterAttack.call(this, attackResult); // 目标死亡处理

          if (killed) {
            this._battleManager.removeMonster(target);
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "attackRange", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).PLAYER_BASE_ATTACK_RANGE;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "attackInterval", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).AUTO_ATTACK_INTERVAL;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "atk", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).PLAYER_BASE_ATK;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "critChance", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).CRIT_BASE_CHANCE;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=1bf6001eae725b8a88443685b0057b374a2b5f84.js.map