System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, StatDamageable, _crd;

  function _reportPossibleCrUseOfDamageable(extras) {
    _reporterNs.report("Damageable", "../battle/skill/SkillData", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCombatEntity(extras) {
    _reporterNs.report("CombatEntity", "../battle/combat/CombatCommand", _context.meta, extras);
  }

  function _reportPossibleCrUseOfStatComponent(extras) {
    _reporterNs.report("StatComponent", "./StatComponent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMovementComponent(extras) {
    _reporterNs.report("MovementComponent", "./MovementComponent", _context.meta, extras);
  }

  _export("StatDamageable", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "510fcdjqzxOaq/brFCyEmyi", "StatDamageable", undefined); // StatDamageable.ts — adapts the ECS StatComponent to the combat-layer Damageable/CombatEntity
      // contract (§3.8 / §3.12). Pure TS, no `cc`. Lets CombatSystem target ECS entities without
      // knowing about components. Grid position is sourced from MovementComponent so the entity
      // stays in sync with its grid cell.


      _export("StatDamageable", StatDamageable = class StatDamageable {
        constructor(_id, _team, _stat, _movement, _isBoss = false) {
          this._id = _id;
          this._team = _team;
          this._stat = _stat;
          this._movement = _movement;
          this._isBoss = _isBoss;
        }

        applyDamage(amount, _sourceId) {
          this._stat.takeDamage(amount);
        }

        get hp() {
          return this._stat.hp;
        }

        get maxHP() {
          return this._stat.maxHP;
        }

        get alive() {
          return this._stat.alive;
        }

        get id() {
          return this._id;
        }

        get team() {
          return this._team;
        }

        get gridX() {
          return this._movement.gridX;
        }

        get gridY() {
          return this._movement.gridY;
        }

        get isBoss() {
          return this._isBoss;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=f8db871a3e357a1a6fad51c9a85c4a3a9e619715.js.map