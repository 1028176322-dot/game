System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _crd;

  function _reportPossibleCrUseOfVec(extras) {
    _reporterNs.report("Vec3", "../../physics/ICollisionService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfDamageable(extras) {
    _reporterNs.report("Damageable", "../skill/SkillData", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "bf932cuH9FHZK2eQLTIq2j8", "CombatCommand", undefined); // CombatCommand.ts — unified battle command for CombatSystem (§3.8).
      // Pure TS, no `cc`. Discriminated by `kind`; dispatch uses a Map (no switch on id).
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.8 + §6.2.
      //
      // Combat layering (§2.5): commands are produced by AI (IAIController -> SkillRequest/MoveCommand)
      // or by the player's SkillSystem, and consumed by CombatSystem. No system writes state directly.
      // ---- Command types ----
      // ---- Combat entity contract (pure TS, for targeting & damage) ----
      // The engine-side entity implements this. Keeps combat layer free of `cc`.
      // ---- Target selection results ----


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=668482ed2540fa72c27f2fda8b601a6c392710c4.js.map