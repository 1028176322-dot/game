System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, Rng, NodeRouteGenerator, _crd, BASE_ROWS, MIDDLE_TYPE_WEIGHTS;

  function _reportPossibleCrUseOfRng(extras) {
    _reporterNs.report("Rng", "../../core/rng/Rng", _context.meta, extras);
  }

  function _reportPossibleCrUseOfNodeRouteMapDefinition(extras) {
    _reporterNs.report("NodeRouteMapDefinition", "../../core/save/RouteSaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfNodeRouteNodeDef(extras) {
    _reporterNs.report("NodeRouteNodeDef", "../../core/save/RouteSaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRouteNodeType(extras) {
    _reporterNs.report("RouteNodeType", "../../core/save/RouteSaveTypes", _context.meta, extras);
  }

  _export("NodeRouteGenerator", void 0);

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

      _cclegacy._RF.push({}, "d1593jbiKJBH5mZDr64U97m", "NodeRouteGenerator", undefined); // assets/scripts/dungeon/route/NodeRouteGenerator.ts
      //
      // Generates a Slay-the-Spire-style node route map (NodeRouteMapDefinition).
      // Pure logic — no Cocos import. `seed` is a PRE-DERIVED uint32 number (the
      // caller obtains it via deriveSeed() in RouteSeed.ts and feeds Rng); this keeps
      // the generator deterministic and unit-testable without pulling in cc/ReplayRecorder.
      //
      // Path note: from dungeon/route/, `../../` reaches assets/scripts/.
      //   ../../core/rng/Rng               -> assets/scripts/core/rng/Rng
      //   ../../core/save/RouteSaveTypes   -> assets/scripts/core/save/RouteSaveTypes
      //
      // Authoritative spec: GDD v0.4.4 §3 / §4.


      // [PLACEHOLDER] tuning: base rows per floor. GDD §4.1 = 10 + floorIndex.
      BASE_ROWS = 10; // [PLACEHOLDER] middle-row node-type weights (sum need not equal 100).

      MIDDLE_TYPE_WEIGHTS = [{
        type: 'combat',
        weight: 50
      }, {
        type: 'elite',
        weight: 12
      }, {
        type: 'event',
        weight: 10
      }, {
        type: 'treasure',
        weight: 8
      }, {
        type: 'shop',
        weight: 8
      }, {
        type: 'rest',
        weight: 7
      }, {
        type: 'upgrade',
        weight: 5
      }];

      _export("NodeRouteGenerator", NodeRouteGenerator = class NodeRouteGenerator {
        /**
         * Generate a deterministic node route map.
         * @param seed pre-derived numeric seed (uint32). Same seed + options -> identical map.
         * @param options floorIndex (and optional rows override / zoneId).
         */
        static generate(seed, options) {
          var _options$rows;

          var rng = new (_crd && Rng === void 0 ? (_reportPossibleCrUseOfRng({
            error: Error()
          }), Rng) : Rng)(seed);
          var rows = (_options$rows = options.rows) != null ? _options$rows : BASE_ROWS + options.floorIndex;

          if (rows < 3) {
            throw new Error("NodeRouteGenerator: rows must be >= 3, got " + rows);
          }

          var nodes = {};
          var edges = new Set(); // dedupe key "from->to"

          var rowIds = [];

          var addEdge = (from, to) => {
            if (from === to) return;
            edges.add(from + "->" + to);
          }; // 1. Build nodes per row (start=row0, boss=last row, middle rows 2-4 nodes).


          for (var r = 0; r < rows; r++) {
            var isStart = r === 0;
            var isBoss = r === rows - 1;
            var count = isStart || isBoss ? 1 : rng.int(2, 4);
            var ids = [];

            for (var c = 0; c < count; c++) {
              var type = void 0;
              if (isStart) type = 'start';else if (isBoss) type = 'boss';else type = rng.weighted(MIDDLE_TYPE_WEIGHTS, w => w.weight).type;
              var id = "n" + r + "_" + c;
              nodes[id] = {
                id,
                row: r,
                col: c,
                type,
                parents: [],
                children: []
              };
              ids.push(id);
            }

            rowIds.push(ids);
          }

          var startNodeId = rowIds[0][0];
          var bossNodeId = rowIds[rows - 1][0]; // 2. Edge generation — every non-boss node gets >=1 child; start fans into
          //    2 branches (first + last of row 1) to GUARANTEE >=2 distinct start->boss paths.

          for (var _r = 0; _r < rows - 1; _r++) {
            var cur = rowIds[_r];
            var next = rowIds[_r + 1];

            for (var i = 0; i < cur.length; i++) {
              var s = cur[i];
              var targets = [];

              if (_r === 0) {
                // start -> first AND last of row 1: two independent branches
                targets.push(next[0]);
                targets.push(next[next.length - 1]);
              } else {
                // keep left spine (col 0) and right spine (last col) alive across rows
                if (i === 0) targets.push(next[0]);
                if (i === cur.length - 1) targets.push(next[next.length - 1]);
              } // guarantee >=1 child if this node got none from the spine rules


              if (targets.length === 0) {
                targets.push(next[Math.min(i, next.length - 1)]);
              } // extra cross edge for branch variety (forward-only, deterministic)


              if (next.length > 1 && rng.chance(0.5)) {
                targets.push(next[rng.int(0, next.length - 1)]);
              }

              for (var t of targets) addEdge(s, t);
            }
          } // 3. Coverage pass — every non-start node must have >=1 parent (no isolated row).


          for (var _r2 = 1; _r2 < rows; _r2++) {
            var prev = rowIds[_r2 - 1];

            var _loop = function _loop(_t) {
              var hasParent = [...edges].some(e => e.split('->')[1] === _t);

              if (!hasParent) {
                var _prev$Math$min;

                var col = nodes[_t].col;
                var src = (_prev$Math$min = prev[Math.min(col, prev.length - 1)]) != null ? _prev$Math$min : prev[0];
                addEdge(src, _t);
              }
            };

            for (var _t of rowIds[_r2]) {
              _loop(_t);
            }
          } // 4. Materialize edges + parents/children (dedupe).


          var edgeList = [];

          for (var e of edges) {
            var [from, to] = e.split('->');
            edgeList.push({
              from,
              to
            });
            if (!nodes[from].children.includes(to)) nodes[from].children.push(to);
            if (!nodes[to].parents.includes(from)) nodes[to].parents.push(from);
          }

          return {
            floorIndex: options.floorIndex,
            rows,
            nodes,
            edges: edgeList,
            startNodeId,
            bossNodeId,
            seed
          };
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=6e35c5668e14290558ba3bb0e5875cf0ebd1816e.js.map