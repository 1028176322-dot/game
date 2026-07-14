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

          const rng = new (_crd && Rng === void 0 ? (_reportPossibleCrUseOfRng({
            error: Error()
          }), Rng) : Rng)(seed);
          const rows = (_options$rows = options.rows) != null ? _options$rows : BASE_ROWS + options.floorIndex;

          if (rows < 3) {
            throw new Error(`NodeRouteGenerator: rows must be >= 3, got ${rows}`);
          }

          const nodes = {};
          const edges = new Set(); // dedupe key "from->to"

          const rowIds = [];

          const addEdge = (from, to) => {
            if (from === to) return;
            edges.add(`${from}->${to}`);
          }; // 1. Build nodes per row (start=row0, boss=last row, middle rows 2-4 nodes).


          for (let r = 0; r < rows; r++) {
            const isStart = r === 0;
            const isBoss = r === rows - 1;
            const count = isStart || isBoss ? 1 : rng.int(2, 4);
            const ids = [];

            for (let c = 0; c < count; c++) {
              let type;
              if (isStart) type = 'start';else if (isBoss) type = 'boss';else type = rng.weighted(MIDDLE_TYPE_WEIGHTS, w => w.weight).type;
              const id = `n${r}_${c}`;
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

          const startNodeId = rowIds[0][0];
          const bossNodeId = rowIds[rows - 1][0]; // 2. Edge generation — every non-boss node gets >=1 child; start fans into
          //    2 branches (first + last of row 1) to GUARANTEE >=2 distinct start->boss paths.

          for (let r = 0; r < rows - 1; r++) {
            const cur = rowIds[r];
            const next = rowIds[r + 1];

            for (let i = 0; i < cur.length; i++) {
              const s = cur[i];
              const targets = [];

              if (r === 0) {
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

              for (const t of targets) addEdge(s, t);
            }
          } // 3. Coverage pass — every non-start node must have >=1 parent (no isolated row).


          for (let r = 1; r < rows; r++) {
            const prev = rowIds[r - 1];

            for (const t of rowIds[r]) {
              const hasParent = [...edges].some(e => e.split('->')[1] === t);

              if (!hasParent) {
                var _prev$Math$min;

                const col = nodes[t].col;
                const src = (_prev$Math$min = prev[Math.min(col, prev.length - 1)]) != null ? _prev$Math$min : prev[0];
                addEdge(src, t);
              }
            }
          } // 4. Materialize edges + parents/children (dedupe).


          const edgeList = [];

          for (const e of edges) {
            const [from, to] = e.split('->');
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