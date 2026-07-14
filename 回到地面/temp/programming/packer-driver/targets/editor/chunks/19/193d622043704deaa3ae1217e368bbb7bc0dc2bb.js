System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, CombatEntity, _crd;

  _export("CombatEntity", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "e11b9/2SGNGwqx6ZhhC1EtA", "CombatEntity", undefined);

      /**
       * CombatEntity - 战斗实体基类
       *
       * 职责:
       * 1. 基本属性（HP/ATK/DEF/SPD）
       * 2. HP 管理（最大HP、当前HP、百分比）
       * 3. 状态管理（存活/死亡）
       */
      _export("CombatEntity", CombatEntity = class CombatEntity {
        constructor(hp, atk, def, speed) {
          this.hp = void 0;
          this.maxHP = void 0;
          this.atk = void 0;
          this.def = void 0;
          this.speed = void 0;
          this._isDead = false;
          this.hp = hp;
          this.maxHP = hp;
          this.atk = atk;
          this.def = def;
          this.speed = speed;
        }

        get isDead() {
          return this._isDead;
        }

        get hpPercent() {
          return this.maxHP > 0 ? this.hp / this.maxHP : 0;
        }
        /** 标记死亡 */


        markDead() {
          this._isDead = true;
        }
        /** 重置状态 */


        reset(hp, atk, def, speed) {
          this.hp = hp;
          this.maxHP = hp;
          this.atk = atk;
          this.def = def;
          this.speed = speed;
          this._isDead = false;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=193d622043704deaa3ae1217e368bbb7bc0dc2bb.js.map