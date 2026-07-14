System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, _crd, ALL_MASK;

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "5b2a9xNbE5Abb3QsmjoGUMn", "ICollisionService", undefined); // ICollisionService.ts — collision abstraction interface (§3.3).
      // Pure TS, NO `cc` import: business code depends ONLY on this interface, never on
      // PhysicsSystem (red line 1). The DI token `ICollisionService` is exported from
      // ../core/GameContext (single source of truth, §5.2) — do NOT re-declare it here.
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.3.
      // 1:1 with the spec signature (raycast / overlapSphere / overlapCapsule / checkGround).
      // Vec3 etc. are plain shapes so the interface is node-testable without the engine.
      // A lightweight collider descriptor. The engine side converts cc.Collider / Cocos physics
      // bodies into this shape and feeds them into the implementation's registry at runtime
      // (see PhysicsCollisionImpl.registerCollider). This keeps the math pure TS and deterministic
      // (required by Replay, §5.7) and keeps `cc` out of the contract entirely.


      // Default query mask: match every layer.
      _export("ALL_MASK", ALL_MASK = 0xffffffff);

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=feb45da86ff5c77f2f85101393a1d6faa2c98341.js.map