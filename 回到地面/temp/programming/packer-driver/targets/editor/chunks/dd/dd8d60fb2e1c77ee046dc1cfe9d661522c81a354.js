System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _crd, IAIController;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../../core/GameContext", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "d1f32yHXLtEkZ4AXjYvVi2h", "IAIController", undefined); // IAIController.ts — AI controller abstraction (§3.10, v3 upgrade).
      // Pure TS, no `cc`. The concrete AIController implements ILifecycle (red line 3).
      //
      // Red line 2: NO `switch(strategy)`. The active decision policy is selected from a
      //   Map<AIStrategy, AIDecisionPolicy> via setStrategy. Add a 5th strategy = add a policy
      //   entry; the framework stays untouched.
      // Red line 5: NO Math.random. All decisions are deterministic functions of (self, perception).
      //
      // Combat layering (§2.5): the AI only PRODUCES MoveCommand / SkillRequest through the owner's
      //   command sink; it never writes gridX/gridY or applies damage. The combat subsystem executes.
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.10 (+ §2.5 combat layering, §3.5 anim SM).


      // Service token (co-located with the owning module; GameBootstrap registers the animation impl here).
      _export("IAIController", IAIController = 'IAIController'); // Behavior node library (§3.10): Patrol/Search/Chase/Attack/Lost/Return/Dodge/Skill/Die.
      // Animation state-machine leaf states (§3.5): Idle/Walk/Attack/Skill/HitStun/Dead.
      // ---- Combat-layering outputs (AI produces; combat subsystem executes) ----
      // Perception of the world (target). Provided by the combat subsystem / blackboard (§2.6).
      // Minimal owner contract the AI controller depends on (pure TS, testable, no `cc`).
      // The owner is the combat subsystem's representation of this actor; it carries the command
      // sink so the AI can emit MoveCommand/SkillRequest without touching state directly.
      // A single decision: which node is active, what to emit, what anim to play.
      // Pluggable decision policy (BT / FSM / GOAP / Utility). Selected by setStrategy, no switch.
      // ---- IAIController (1:1 with §3.10) ----


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=dd8d60fb2e1c77ee046dc1cfe9d661522c81a354.js.map