System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, NavigationGrid, _crd, NEIGHBOURS;

  function reconstruct(cameFrom, goalK, w) {
    var path = [];
    var k = goalK;

    while (k !== undefined) {
      path.push({
        x: k % w,
        y: k / w | 0
      });
      k = cameFrom.get(k);
    }

    path.reverse();
    return path;
  }

  function _reportPossibleCrUseOfGridCoord(extras) {
    _reporterNs.report("GridCoord", "./TileMap", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTileMap(extras) {
    _reporterNs.report("TileMap", "./TileMap", _context.meta, extras);
  }

  _export("NavigationGrid", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "96830GtB/RKnKNW4BAnMtE/", "NavigationGrid", undefined); // NavigationGrid.ts — first-stage grid pathfinding (§3.7, decision C). Pure TS, NO `cc`.
      //
      // Design:
      //  - Implements INavigation. Per §3.7/decision C, NavigationGrid and a future
      //    NavMeshNavigation share ONE `INavigation` interface so upper layers are unaware
      //    of the swap (NavMesh deferred to Phase 4). NavMesh is NOT built here.
      //  - Grid A* over a TileMap: 4-neighbour, Manhattan heuristic, DETERMINISTIC neighbour
      //    ordering + tie-breaking so the same start/goal always yields the same path
      //    (required by Replay §5.7). No randomness.
      //  - No physics dependency: pathfinding reads TileMap.isWalkable only; real-time
      //    collision (if ever needed by callers) goes through ICollisionService, not here.
      //
      // NOTE on interface: §3.7 mandates "实现 INavigation 接口" but the plan's §5.x gives no
      // explicit INavigation signature. Per Agent Contract #4, a MINIMAL signature is defined
      // here (findPath / isWalkable) and co-located; extend only when §5.x specifies more.
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.7 + demo5.md.


      // 4-neighbour offsets in a FIXED order (deterministic expansion): +X, -X, +Y, -Y.
      NEIGHBOURS = [{
        x: 1,
        y: 0
      }, {
        x: -1,
        y: 0
      }, {
        x: 0,
        y: 1
      }, {
        x: 0,
        y: -1
      }];

      _export("NavigationGrid", NavigationGrid = class NavigationGrid {
        constructor(_tiles) {
          this.name = 'NavigationGrid';
          this._tiles = _tiles;
        }

        isWalkable(coord) {
          return this._tiles.isWalkable(coord.x, coord.y);
        }

        findPath(start, goal) {
          if (!this.isWalkable(start) || !this.isWalkable(goal)) return [];
          if (start.x === goal.x && start.y === goal.y) return [{
            x: start.x,
            y: start.y
          }];
          var w = this._tiles.width;

          var key = (x, y) => y * w + x;

          var startK = key(start.x, start.y);
          var goalK = key(goal.x, goal.y);
          var gScore = new Map();
          var cameFrom = new Map(); // Open set as a small array; we pop the lowest f deterministically (f, then insertion).

          var open = [];
          var seq = 0;

          var h = (x, y) => Math.abs(x - goal.x) + Math.abs(y - goal.y);

          gScore.set(startK, 0);
          open.push({
            x: start.x,
            y: start.y,
            k: startK,
            g: 0,
            f: h(start.x, start.y),
            seq: seq++
          });

          while (open.length > 0) {
            // Deterministic selection: lowest f, tie-break by lowest insertion seq.
            var bestIdx = 0;

            for (var i = 1; i < open.length; i++) {
              var a = open[i];
              var b = open[bestIdx];
              if (a.f < b.f || a.f === b.f && a.seq < b.seq) bestIdx = i;
            }

            var cur = open.splice(bestIdx, 1)[0];

            if (cur.k === goalK) {
              return reconstruct(cameFrom, cur.k, w);
            }

            for (var off of NEIGHBOURS) {
              var nx = cur.x + off.x;
              var ny = cur.y + off.y;
              if (!this._tiles.isWalkable(nx, ny)) continue;
              var nk = key(nx, ny);
              var tentative = cur.g + 1;
              var known = gScore.get(nk);

              if (known === undefined || tentative < known) {
                gScore.set(nk, tentative);
                cameFrom.set(nk, cur.k);
                open.push({
                  x: nx,
                  y: ny,
                  k: nk,
                  g: tentative,
                  f: tentative + h(nx, ny),
                  seq: seq++
                });
              }
            }
          }

          return []; // unreachable
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=f0c0ed99aa0155b9392a5f2202bda9feb752aa4e.js.map