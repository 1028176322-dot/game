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

      _cclegacy._RF.push({}, "997daeAlzdACbmnNU3FlIw7", "BattleEvent", undefined); // BattleEvent.ts — combat domain event types (§3.11).
      // Pure TS, no `cc`. Discriminated union; dispatch uses Map on type, not switch on id.


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=6d805ff2a3a4c92852f6a4a36dad9d0fc99a3ac4.js.map