System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, GameConfig, PlayerStats, _crd, MathUtils;

  function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

  // ======== 运行时属性接口 ========
  // ======== 修饰符类型 ========
  // ======== 默认值 ========
  function createDefaultStats() {
    return {
      atk: 0,
      def: 0,
      maxHP: 0,
      moveSpeed: 0,
      atkSpeed: 0,
      attackRange: 0,
      critChance: 0,
      critMultiplier: 0,
      lifeSteal: 0,
      damageMultiplier: 0,
      damageReduction: 0
    };
  } // ======== 属性叠加器 ========


  function _reportPossibleCrUseOfGameConfig(extras) {
    _reporterNs.report("GameConfig", "../core/GameConfig", _context.meta, extras);
  }

  _export({
    createDefaultStats: createDefaultStats,
    PlayerStats: void 0
  });

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      GameConfig = _unresolved_2.GameConfig;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "0ca715gXcRHb7i7VZ+eLiFD", "PlayerStats", undefined);
      /**
       * PlayerStats - 运行时属性叠加层
       * 统一管理玩家最终属性的计算
       * 
       * 属性来源:
       *   base → 角色基础属性
       *   buff → Build/升级增益
       *   relic → 遗物效果
       *   equip → 装备加成
       *   set   → 套装效果
       * 
       * 所有数值边界均来自 GameConfig，禁止硬编码
       */


      _export("PlayerStats", PlayerStats = class PlayerStats {
        constructor(base) {
          this._base = void 0;
          this._modifiers = [];
          this._base = _extends({}, base);
        }
        /** 设置基础属性 */


        setBase(stats) {
          Object.assign(this._base, stats);
        }
        /** 获取基础属性（外部只读） */


        get base() {
          return this._base;
        }
        /** 添加修饰符 */


        applyModifier(mod) {
          var fullMod = _extends({}, mod, {
            remaining: mod.duration
          }); // 同一 source 不重复叠加（替换旧值）


          var existingIdx = this._modifiers.findIndex(m => m.source === mod.source);

          if (existingIdx >= 0) {
            this._modifiers[existingIdx] = fullMod;
          } else {
            this._modifiers.push(fullMod);
          }

          return mod.source;
        }
        /** 按来源移除修饰符 */


        removeModifier(source) {
          this._modifiers = this._modifiers.filter(m => m.source !== source);
        }
        /** 移除一组来源的修饰符（如某个装备的所有词缀） */


        removeModifiersByPrefix(prefix) {
          this._modifiers = this._modifiers.filter(m => !m.source.startsWith(prefix));
        }
        /** 清除所有修饰符（死亡/重开时） */


        clearAll() {
          this._modifiers = [];
        }
        /** 清除指定类型的修饰符 */


        clearByType(type) {
          this._modifiers = this._modifiers.filter(m => !m.source.startsWith(type));
        }
        /** 计算最终属性 */


        getFinalStats() {
          var final = _extends({}, this._base); // 第1遍: 所有 flat 修饰符


          for (var mod of this._modifiers) {
            if (mod.type === 'flat') {
              final[mod.stat] += mod.value;
            }
          } // 第2遍: 所有 percent 修饰符 (乘算于 base+flat 之后)


          var percentGroups = {};

          for (var _mod of this._modifiers) {
            if (_mod.type === 'percent') {
              percentGroups[_mod.stat] = (percentGroups[_mod.stat] || 0) + _mod.value;
            }
          }

          for (var [stat, totalPercent] of Object.entries(percentGroups)) {
            final[stat] *= 1 + totalPercent;
          } // 确保最小值和边界（所有数值来源: GameConfig.ts）


          final.atk = Math.max((_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).STAT_ATK_MIN, final.atk);
          final.def = Math.max((_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).STAT_DEF_MIN, final.def);
          final.maxHP = Math.max((_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).STAT_MAX_HP_MIN, final.maxHP);
          final.moveSpeed = Math.max((_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).STAT_MOVE_SPEED_MIN, final.moveSpeed);
          final.atkSpeed = MathUtils.clamp(final.atkSpeed, (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).STAT_ATK_SPEED_MIN, (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).STAT_ATK_SPEED_MAX);
          final.attackRange = Math.max((_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).STAT_ATTACK_RANGE_MIN, final.attackRange);
          final.critChance = MathUtils.clamp(final.critChance, 0, (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).STAT_CRIT_CHANCE_MAX);
          final.critMultiplier = Math.max((_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).STAT_CRIT_MULTIPLIER_MIN, final.critMultiplier);
          final.lifeSteal = MathUtils.clamp(final.lifeSteal, 0, (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).STAT_LIFE_STEAL_MAX);
          final.damageMultiplier = Math.max((_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).STAT_DAMAGE_MULTIPLIER_MIN, final.damageMultiplier);
          final.damageReduction = MathUtils.clamp(final.damageReduction, 0, (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).STAT_DAMAGE_REDUCTION_MAX);
          return final;
        }
        /** 获取单个最终属性 */


        getFinalStat(stat) {
          return this.getFinalStats()[stat];
        }
        /** 获取当前所有修饰符 */


        get modifiers() {
          return this._modifiers;
        }
        /** 更新计时类修饰符 (每帧调用) */


        update(dt) {
          var changed = false;

          for (var mod of this._modifiers) {
            if (mod.duration > 0) {
              mod.remaining -= dt;

              if (mod.remaining <= 0) {
                mod.remaining = 0;
                changed = true;
              }
            }
          } // 移除已过期的


          if (changed) {
            this._modifiers = this._modifiers.filter(m => m.duration <= 0 || m.remaining > 0);
          }
        }
        /** 创建指定基础值的 PlayerStats */


        static createFromBase(base) {
          var defaults = createDefaultStats();

          var merged = _extends({}, defaults, base);

          return new PlayerStats(merged);
        }
        /** 初始默认属性（来源: GameConfig.ts） */


        static createDefault() {
          return PlayerStats.createFromBase({
            atk: (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).PLAYER_BASE_ATK,
            def: (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).PLAYER_BASE_DEF,
            maxHP: (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).PLAYER_BASE_MAX_HP,
            moveSpeed: (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).PLAYER_MOVE_SPEED,
            atkSpeed: (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).AUTO_ATTACK_INTERVAL,
            attackRange: (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).PLAYER_BASE_ATTACK_RANGE,
            critChance: (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).CRIT_BASE_CHANCE,
            critMultiplier: (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).CRIT_MULTIPLIER
          });
        }

      }); // 避免循环引用: MathUtils 在 getFinalStats 中使用, 使用内联实现


      MathUtils = {
        clamp: (v, min, max) => Math.max(min, Math.min(max, v))
      };

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=e65d12f877bf04230ba4ee3ea98294cb788975d0.js.map