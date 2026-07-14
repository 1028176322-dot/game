System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, Rng, SingleRoomEncounterBuilder, _crd;

  // Local odd-size helper (mirrors DungeonGenerator.oddSize) so we do not touch
  // DungeonGenerator's module-private helper and keep its multi-room contract intact.
  function oddSize(rng, min, max) {
    const v = rng.int(min, max);
    return v % 2 === 0 ? v + 1 : v; // odd so a room has a single center tile
  }

  function _reportPossibleCrUseOfRng(extras) {
    _reporterNs.report("Rng", "../core/rng/Rng", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEncounterRoomLayoutType(extras) {
    _reporterNs.report("EncounterRoomLayoutType", "./DungeonGenerator", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRoomLayout(extras) {
    _reporterNs.report("RoomLayout", "./DungeonGenerator", _context.meta, extras);
  }

  _export("SingleRoomEncounterBuilder", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      Rng = _unresolved_2.Rng;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "d88fc3wzOlNIoTe5Hc2cVwG", "SingleRoomEncounterBuilder", undefined); // assets/scripts/dungeon/SingleRoomEncounterBuilder.ts
      // Builds a SINGLE room layout for one route-node encounter. It wraps
      // DungeonGenerator's RoomLayout type but does NOT call
      // DungeonGenerator.generate({ roomCount: 1 }) — that clamp()s roomCount to [3,12]
      // (DungeonGenerator.ts:54) and is a multi-room graph generator, the wrong tool for
      // a single node (GDD v0.4.4 §8.1).
      //
      // v0.4.3: EncounterRoomLayoutType aliases DungeonGenerator.RoomType so the union
      // stays in sync if DungeonGenerator.RoomType changes.


      _export("SingleRoomEncounterBuilder", SingleRoomEncounterBuilder = class SingleRoomEncounterBuilder {
        build(opts) {
          var _opts$minSize, _opts$maxSize, _opts$minSize2, _opts$maxSize2;

          const rng = new (_crd && Rng === void 0 ? (_reportPossibleCrUseOfRng({
            error: Error()
          }), Rng) : Rng)(opts.seed);
          return {
            id: opts.roomId,
            type: opts.layoutType,
            // EncounterRoomLayoutType -> RoomLayout.type OK
            gridX: 0,
            gridY: 0,
            width: oddSize(rng, (_opts$minSize = opts.minSize) != null ? _opts$minSize : 7, (_opts$maxSize = opts.maxSize) != null ? _opts$maxSize : 11),
            height: oddSize(rng, (_opts$minSize2 = opts.minSize) != null ? _opts$minSize2 : 7, (_opts$maxSize2 = opts.maxSize) != null ? _opts$maxSize2 : 11),
            connections: []
          };
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=34927f848bbe2827e2ffe3b9237adc5973f1bdbc.js.map