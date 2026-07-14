System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _crd;

  function _reportPossibleCrUseOfVec(extras) {
    _reporterNs.report("Vec3", "../../physics/ICollisionService", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "deae1eFyeVP7qgVlNLYXCZg", "SkillData", undefined); // SkillData.ts — skill config types (§3.9).
      // Pure TS, no `cc`. The skill is fully data-driven: a single SkillData JSON describes the
      // whole chain (projectile -> explosion -> burn). No `switch(skillId)` anywhere (red line 2).
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.9 (JSON) + §5.3 (SkillConfig).
      // File name per demo4.md task card. Interface is named SkillData; SkillConfig is an alias
      // kept for parity with §5.3 `getSkill(id): SkillConfig`.
      // --- Skill config (the §3.9 JSON shape) ---
      // §5.3 parity alias: ConfigDatabase.getSkill(id): SkillConfig.
      // --- Runtime contracts (pure TS, engine side implements) ---
      // A target that can receive skill damage / burn. Pure-TS contract implemented later by
      // CombatEntity (engine side). Keeps the skill layer free of `cc` and testable in node.
      // Who casts the skill (for logging / ownership). Pure-TS.
      // --- Data-driven skill node (the graph is a list of these) ---
      // Discriminator `kind` is used as a Map key in SkillExecutor (NOT a switch on skillId)
      // -> red line 2 compliant.


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=dc9c86e4bbf084d98a3e5171506e776f466936f6.js.map