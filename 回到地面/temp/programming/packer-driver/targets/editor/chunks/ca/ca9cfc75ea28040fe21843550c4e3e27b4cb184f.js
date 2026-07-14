System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, _crd;

  function createDefaultRunConfig() {
    return {
      characterId: 'warrior',
      characterName: 'Adventurer',
      zoneRoute: ['forest', 'catacombs', 'volcano'],
      seed: Date.now(),
      difficulty: 1,
      startedAt: Date.now(),
      isContinue: false
    };
  }

  _export("createDefaultRunConfig", createDefaultRunConfig);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "7aff1/INzpBbLdqlfQ3OGwG", "RunStartConfig", undefined);
      /**
       * RunStartConfig - Single data structure for starting a dungeon run
       *
       * Enforced by P0 Architecture Rule: entering dungeon must ONLY use startRun(config).
       * No global variables (GameManager.currentFloor etc.) for run params.
       */


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=ca9cfc75ea28040fe21843550c4e3e27b4cb184f.js.map