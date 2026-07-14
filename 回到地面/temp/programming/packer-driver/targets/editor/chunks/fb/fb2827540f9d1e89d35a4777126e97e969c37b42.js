System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _crd;

  function _reportPossibleCrUseOfGridManager(extras) {
    _reporterNs.report("GridManager", "../dungeon/GridManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerStats(extras) {
    _reporterNs.report("PlayerStats", "./PlayerStats", _context.meta, extras);
  }

  function _reportPossibleCrUseOfJoystickEvent(extras) {
    _reporterNs.report("JoystickEvent", "../ui/VirtualJoystick", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerState(extras) {
    _reporterNs.report("PlayerState", "../core/Constants", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "9eeb5KjN21AgKpxyIti2NVL", "IPlayerAgent", undefined);

      // IPlayerAgent.ts — unified player contract (P3-4-C).
      //
      // Decouples every dungeon system (BattleManager, UpgradeManager, SkillSystem,
      // ElementSystem, EquipmentSystem, ItemSystem, EventSystem, MonsterController,
      // RoomFlowController, EventUI, MutationRuntimeService, DungeonManager) from the
      // concrete `PlayerController` monobehaviour. Both the legacy `PlayerController`
      // and the new ECS `EcsEntityBridge` (once it is wired to drive the live
      // player) satisfy this interface, so the runtime swap (remove PlayerController,
      // mount the 6 ECS components) becomes a drop-in with no consumer changes.
      //
      // NOTE: `stats` is intentionally `PlayerStats` (legacy) because 8+ consumers
      // read attack-specific runtime fields (atkSpeed / critChance / attackRange /
      // lifeSteal / damageMultiplier / damageReduction / moveSpeed) that the ECS
      // `StatComponent` does not yet model. The ECS bridge must keep a `PlayerStats`
      // mirror in sync until those fields migrate into the component layer.
      __checkObsolete__(['Node']);

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=fb2827540f9d1e89d35a4777126e97e969c37b42.js.map