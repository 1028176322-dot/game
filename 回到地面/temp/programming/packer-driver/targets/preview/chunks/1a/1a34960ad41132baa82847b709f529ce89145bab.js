System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, GameConfig, MathUtils, DamageReceiver, _crd;

  function _reportPossibleCrUseOfGameConfig(extras) {
    _reporterNs.report("GameConfig", "../../core/GameConfig", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCombatEntity(extras) {
    _reporterNs.report("CombatEntity", "./CombatEntity", _context.meta, extras);
  }

  function _reportPossibleCrUseOfStatusController(extras) {
    _reporterNs.report("StatusController", "./StatusController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMathUtils(extras) {
    _reporterNs.report("MathUtils", "../../utils/MathUtils", _context.meta, extras);
  }

  _export("DamageReceiver", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      GameConfig = _unresolved_2.GameConfig;
    }, function (_unresolved_3) {
      MathUtils = _unresolved_3.MathUtils;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "6fe605xPOhL75F+sMrrBJVN", "DamageReceiver", undefined);
      /**
       * DamageReceiver - 伤害接收与计算
       *
       * 职责:
       * 1. 伤害公式计算（原始伤害 + D6 - 有效防御 × 系数）
       * 2. 防御倍率和受伤倍率修正
       * 3. 闪白反馈
       *
       * Phase 7: 从 MonsterController 提取
       */


      _export("DamageReceiver", DamageReceiver = class DamageReceiver {
        constructor(_entity, _status, _getShieldMultiplier, _onDamageTaken) {
          this._entity = _entity;
          this._status = _status;
          this._getShieldMultiplier = _getShieldMultiplier;
          this._onDamageTaken = _onDamageTaken;
        }
        /** 承受伤害。返回 true 表示死亡 */


        takeDamage(rawDamage, isCrit) {
          var _this$_onDamageTaken;

          if (isCrit === void 0) {
            isCrit = false;
          }

          var shieldMult = this._getShieldMultiplier();

          var effectiveDef = Math.floor(this._entity.def * this._status.defMultiplier);
          var d6Roll = (_crd && MathUtils === void 0 ? (_reportPossibleCrUseOfMathUtils({
            error: Error()
          }), MathUtils) : MathUtils).d6();
          var actualDamage = Math.max((_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).MIN_DAMAGE, Math.floor((rawDamage + d6Roll - effectiveDef * (_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
            error: Error()
          }), GameConfig) : GameConfig).DAMAGE_FORMULA_DEF_FACTOR) * shieldMult * this._status.damageTakenMultiplier));
          this._entity.hp = Math.max(0, this._entity.hp - actualDamage);
          (_this$_onDamageTaken = this._onDamageTaken) == null || _this$_onDamageTaken.call(this, actualDamage, isCrit);
          if (this._entity.hp <= 0) return true;
          return false;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=1a34960ad41132baa82847b709f529ce89145bab.js.map