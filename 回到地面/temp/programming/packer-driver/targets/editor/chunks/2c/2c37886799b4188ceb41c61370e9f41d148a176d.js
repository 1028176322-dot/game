System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, Rng, DungeonGenerator, _crd;

  function pickType(index, count) {
    if (index === 0) return 'start';
    if (index === count - 1) return 'boss'; // Elite roughly two-thirds along the spine; the rest are battle rooms.

    if (index === Math.floor((count - 1) * 2 / 3)) return 'elite';
    return 'battle';
  }

  function oddSize(rng, min, max) {
    const v = rng.int(min, max);
    return v % 2 === 0 ? v + 1 : v; // odd so a room has a single center tile
  }

  function connect(a, b) {
    if (!a.connections.includes(b.id)) a.connections.push(b.id);
    if (!b.connections.includes(a.id)) b.connections.push(a.id);
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function _reportPossibleCrUseOfRng(extras) {
    _reporterNs.report("Rng", "../core/rng/Rng", _context.meta, extras);
  }

  _export("DungeonGenerator", void 0);

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

      _cclegacy._RF.push({}, "72268G/YkRFAbK1HRWcZn+V", "DungeonGenerator", undefined); // DungeonGenerator.ts — dungeon room-layout generation (§3.7, first stage of the
      // GridManager split). Pure TS, NO `cc` import -> node/vitest testable.
      //
      // Design:
      //  - Deterministic: seeded via the existing xorshift32 `Rng` (core/rng/Rng), NEVER
      //    Math.random (red line 5). Same seed + zone -> identical layout.
      //  - Reuses the original DAG room-type vocabulary (start/battle/elite/reward/boss)
      //    conceptually; produces a plain data `DungeonLayout` consumed by RoomBuilder.
      //  - Single responsibility: layout ONLY. It does not build tiles/pieces (RoomBuilder)
      //    nor run navigation (NavigationGrid) nor own lifecycle (RoomRuntime).
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.7 + demo5.md.


      _export("DungeonGenerator", DungeonGenerator = class DungeonGenerator {
        constructor() {
          this.name = 'DungeonGenerator';
        }

        // Deterministic layout: linear spine (start -> ... -> boss) with occasional side
        // branches. All randomness comes from the seeded Rng, so replays are identical.
        generate(seed, zone, opts = {}) {
          var _opts$roomCount, _opts$minSize, _opts$maxSize;

          const rng = new (_crd && Rng === void 0 ? (_reportPossibleCrUseOfRng({
            error: Error()
          }), Rng) : Rng)(seed);
          const count = clamp((_opts$roomCount = opts.roomCount) != null ? _opts$roomCount : 6, 3, 12);
          const minSize = (_opts$minSize = opts.minSize) != null ? _opts$minSize : 6;
          const maxSize = (_opts$maxSize = opts.maxSize) != null ? _opts$maxSize : 10;
          const rooms = []; // Spine along +X. Each room gets a deterministic interior size.

          for (let i = 0; i < count; i++) {
            const type = pickType(i, count);
            rooms.push({
              id: `r${i}`,
              type,
              gridX: i,
              gridY: 0,
              width: oddSize(rng, minSize, maxSize),
              height: oddSize(rng, minSize, maxSize),
              connections: []
            });
          } // Connect the spine sequentially.


          for (let i = 0; i < count - 1; i++) {
            connect(rooms[i], rooms[i + 1]);
          } // Deterministic side branches: for interior rooms, sometimes add a branch room
          // offset on +Y. Kept simple + bounded so tests stay stable.


          for (let i = 1; i < count - 1; i++) {
            if (rng.chance(0.35)) {
              const branch = {
                id: `r${i}b`,
                type: 'reward',
                gridX: i,
                gridY: 1,
                width: oddSize(rng, minSize, maxSize),
                height: oddSize(rng, minSize, maxSize),
                connections: []
              };
              connect(rooms[i], branch);
              rooms.push(branch);
            }
          }

          return {
            seed: seed >>> 0,
            zone,
            rooms,
            startRoomId: rooms[0].id,
            bossRoomId: rooms[count - 1].id
          };
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=2c37886799b4188ceb41c61370e9f41d148a176d.js.map