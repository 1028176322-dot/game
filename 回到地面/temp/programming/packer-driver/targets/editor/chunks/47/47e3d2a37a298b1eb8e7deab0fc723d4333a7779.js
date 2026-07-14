System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, StatComponent, _crd, IStatComponent;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../core/LifecycleManager", _context.meta, extras);
  }

  _export("StatComponent", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "b10c1wzzatGWIr/RpBrXIjp", "StatComponent", undefined); // StatComponent.ts — entity attribute container (§3.12 ECS).
      // Pure TS, no `cc`. Holds base + buff-modified stats.
      // Buff stacking uses record-based additive modifiers (no switch on stat type).


      _export("IStatComponent", IStatComponent = 'IStatComponent');

      _export("StatComponent", StatComponent = class StatComponent {
        constructor() {
          this._baseHP = 100;
          this._baseATK = 10;
          this._baseDEF = 5;
          this._baseSpeed = 60;
          this._hp = 100;
          this._alive = true;
          this._modifiers = [];
        }

        // Base stats.
        get baseHP() {
          return this._baseHP;
        }

        get baseATK() {
          return this._baseATK;
        }

        get baseDEF() {
          return this._baseDEF;
        }

        get baseSpeed() {
          return this._baseSpeed;
        } // Effective (modified) stats.


        get hp() {
          return Math.max(0, Math.min(this.maxHP, this._hp));
        }

        get maxHP() {
          return this._compute('hp', this._baseHP);
        }

        get atk() {
          return this._compute('atk', this._baseATK);
        }

        get def() {
          return this._compute('def', this._baseDEF);
        }

        get speed() {
          return this._compute('speed', this._baseSpeed);
        }

        get alive() {
          return this._alive;
        }

        initialize(ctxOrBaseHP, baseATK, baseDEF, baseSpeed) {
          if (typeof ctxOrBaseHP !== 'number') return; // ILifecycle.initialize(ctx): no stat config to apply

          this._baseHP = ctxOrBaseHP;
          this._baseATK = baseATK != null ? baseATK : 0;
          this._baseDEF = baseDEF != null ? baseDEF : 0;
          this._baseSpeed = baseSpeed != null ? baseSpeed : 0;
          this._hp = ctxOrBaseHP;
          this._alive = true;
          this._modifiers = [];
        }

        enter() {}

        exit() {}

        pause() {}

        resume() {}

        destroy() {
          this._modifiers = [];
          this._alive = false;
          this._hp = 0;
        }

        takeDamage(amount) {
          if (!this._alive) return;
          this._hp = Math.max(0, this._hp - Math.max(0, amount));
          if (this._hp <= 0) this._alive = false;
        }

        heal(amount) {
          if (!this._alive) return;
          this._hp = Math.min(this.maxHP, this._hp + amount);
        }

        addModifier(mod) {
          this._modifiers.push(mod);
        }

        clearModifiers() {
          this._modifiers = [];
        }

        update(dt) {
          const alive = [];

          for (const m of this._modifiers) {
            if (m.duration > 0) {
              m.duration -= dt;
              if (m.duration <= 0) continue;
            }

            alive.push(m);
          }

          this._modifiers = alive;
        }

        _compute(stat, base) {
          let flat = 0;
          let mult = 1;

          for (const m of this._modifiers) {
            if (m.stat === stat) {
              flat += m.value;
              mult *= m.multiplier;
            }
          }

          return Math.max(0, Math.floor((base + flat) * mult));
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=47e3d2a37a298b1eb8e7deab0fc723d4333a7779.js.map