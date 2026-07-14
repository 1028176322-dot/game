System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, computeConfigHash, _crd;

  // hex string -> uint32 number seed (deterministic: same input + salt -> same number)
  function deriveSeed(input, salt) {
    const hex = (_crd && computeConfigHash === void 0 ? (_reportPossibleCrUseOfcomputeConfigHash({
      error: Error()
    }), computeConfigHash) : computeConfigHash)({
      input,
      salt
    });
    return parseInt(hex, 16) >>> 0;
  } // Seed chain (all numeric, fed into Rng). Mirrors GDD v0.4.4 §10.1.


  function buildSeedChain(userSeed, floorIndex, nodeId) {
    const runSeed = userSeed;
    const floorSeed = deriveSeed(runSeed, `f${floorIndex}`);
    const routeSeed = deriveSeed(floorSeed, 'route'); // NodeRouteMapDefinition.seed

    const nodeSeed = deriveSeed(floorSeed, nodeId);
    const rewardSeed = deriveSeed(nodeSeed, 'reward');
    const encounterSeed = deriveSeed(nodeSeed, 'encounter'); // -> config.seed

    return {
      runSeed,
      floorSeed,
      routeSeed,
      nodeSeed,
      rewardSeed,
      encounterSeed
    };
  }

  function _reportPossibleCrUseOfcomputeConfigHash(extras) {
    _reporterNs.report("computeConfigHash", "../../replay/ReplayRecorder", _context.meta, extras);
  }

  _export({
    deriveSeed: deriveSeed,
    buildSeedChain: buildSeedChain
  });

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      computeConfigHash = _unresolved_2.computeConfigHash;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "8d66dGxYSlLdoWL1MAozY7p", "RouteSeed", undefined); // assets/scripts/dungeon/route/RouteSeed.ts
      // Deterministic seed derivation. ReplayRecorder.computeConfigHash returns a hex
      // string (FNV-1a); Rng needs a number, so deriveSeed() converts it to uint32.
      //
      // Path note: from dungeon/route/, `../../` reaches assets/scripts/ (two levels up).
      //   ../../replay/ReplayRecorder  -> assets/scripts/replay/ReplayRecorder
      //   ../../core/rng/Rng           -> assets/scripts/core/rng/Rng
      //
      // Authoritative spec: docs/地牢重做_节点路线图肉鸽_设计v0.4.4.md §10.1.


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=7b8eab27b5c41cc677a87f9845e7d478702a2bd4.js.map