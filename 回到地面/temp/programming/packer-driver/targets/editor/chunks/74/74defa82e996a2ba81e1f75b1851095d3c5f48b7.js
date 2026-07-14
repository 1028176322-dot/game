System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _crd;

  // Convert a grid cell to a world position.
  function gridToWorld(gridX, gridY, originX, originY, tileSize) {
    return {
      x: originX + gridX * tileSize,
      y: originY + gridY * tileSize
    };
  } // Pick the auto-driven animation state from movement.
  // Returns the state to drive, or null if it equals the last auto state (no change).
  // Attack/skill/die are driven explicitly elsewhere and must NOT be overridden here.


  function pickAutoAnimState(moving, lastAuto) {
    const next = moving ? 'walk' : 'idle';
    if (next === lastAuto) return null;
    return next;
  }

  function _reportPossibleCrUseOfPlayerAnimState(extras) {
    _reporterNs.report("PlayerAnimState", "./AnimationComponent", _context.meta, extras);
  }

  _export({
    gridToWorld: gridToWorld,
    pickAutoAnimState: pickAutoAnimState
  });

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "e2ddfGbLqhCur0UK4665hDc", "EcsSyncMath", undefined); // EcsSyncMath.ts — pure-TS math helpers for ECS <-> engine node sync (§3.12 bridge).
      // No `cc` import: this file is unit-tested in node (vitest) and reused by the cc bridge.
      // Deterministic, no Math.random.


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=74defa82e996a2ba81e1f75b1851095d3c5f48b7.js.map