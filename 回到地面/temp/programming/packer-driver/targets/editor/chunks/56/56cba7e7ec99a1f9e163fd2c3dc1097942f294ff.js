System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, GameConfig, StatusController, _crd;

  function _reportPossibleCrUseOfGameConfig(extras) {
    _reporterNs.report("GameConfig", "../../core/GameConfig", _context.meta, extras);
  }

  _export("StatusController", void 0);

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

      _cclegacy._RF.push({}, "6ae75mHhUdBo6YKGwTs5fT7", "StatusController", undefined);
      /**
       * StatusController - 怪物状态效果控制器
       *
       * 管辖:
       * - 冻结（停止行动）
       * - 沉默（无法攻击/施法）
       * - 防御减弱 / 受伤加重 debuff
       *
       * Phase 7: 从 MonsterController 提取
       */


      _export("StatusController", StatusController = class StatusController {
        constructor() {
          this.freezeTimer = 0;
          this.silenceTimer = 0;
          this.defMultiplier = 1;
          this.damageTakenMultiplier = 1;
          this._debuffTimer = 0;
        }

        get isFrozen() {
          return this.freezeTimer > 0;
        }

        get isSilenced() {
          return this.silenceTimer > 0;
        }

        freeze(duration) {
          this.freezeTimer = Math.max(this.freezeTimer, duration);
        }

        silence(duration) {
          this.silenceTimer = Math.max(this.silenceTimer, duration);
        }

        applyDefDebuff(multiplier, duration, isDamageTaken = false) {
          if (isDamageTaken) {
            this.damageTakenMultiplier = Math.max((_crd && GameConfig === void 0 ? (_reportPossibleCrUseOfGameConfig({
              error: Error()
            }), GameConfig) : GameConfig).MIN_DAMAGE, multiplier);
          } else {
            this.defMultiplier = Math.min(1, Math.max(0.1, multiplier));
          }

          this._debuffTimer = Math.max(this._debuffTimer, duration);
        }

        update(dt) {
          if (this.freezeTimer > 0) this.freezeTimer = Math.max(0, this.freezeTimer - dt);
          if (this.silenceTimer > 0) this.silenceTimer = Math.max(0, this.silenceTimer - dt);

          if (this._debuffTimer > 0) {
            this._debuffTimer = Math.max(0, this._debuffTimer - dt);

            if (this._debuffTimer <= 0) {
              this.defMultiplier = 1;
              this.damageTakenMultiplier = 1;
            }
          }
        }

        reset() {
          this.freezeTimer = 0;
          this.silenceTimer = 0;
          this.defMultiplier = 1;
          this.damageTakenMultiplier = 1;
          this._debuffTimer = 0;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=56cba7e7ec99a1f9e163fd2c3dc1097942f294ff.js.map