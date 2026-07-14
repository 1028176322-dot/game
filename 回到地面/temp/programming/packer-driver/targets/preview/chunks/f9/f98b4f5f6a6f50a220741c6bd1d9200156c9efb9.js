System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _crd, PATH_COUNT_CAP;

  /** BFS: set of all node ids reachable from `start`. */
  function reachableFrom(def, start) {
    var seen = new Set([start]);
    var queue = [start];

    while (queue.length > 0) {
      var n = queue.shift();

      for (var ch of def.nodes[n].children) {
        if (!seen.has(ch)) {
          seen.add(ch);
          queue.push(ch);
        }
      }
    }

    return seen;
  }
  /** Count distinct simple paths start -> boss (capped to avoid blow-up on dense maps). */


  function countPaths(def, from, to) {
    var count = 0;

    var dfs = node => {
      if (count >= PATH_COUNT_CAP) return;

      if (node === to) {
        count++;
        return;
      }

      for (var ch of def.nodes[node].children) dfs(ch);
    };

    dfs(from);
    return count;
  }
  /**
   * Validate a node route map's STRUCTURE (independent of runtime progress).
   * Returns ok=false with one issue per problem found.
   */


  function validateRouteStructure(def) {
    var issues = [];

    if (!def || !def.nodes || Object.keys(def.nodes).length === 0) {
      return {
        ok: false,
        issues: [{
          code: 'EMPTY',
          message: 'map has no nodes'
        }]
      };
    }

    if (!def.nodes[def.startNodeId] || !def.nodes[def.bossNodeId]) {
      issues.push({
        code: 'EMPTY',
        message: 'missing start or boss node'
      });
      return {
        ok: false,
        issues
      };
    } // CYCLE: every edge must go strictly forward (to.row > from.row)


    for (var e of def.edges) {
      var a = def.nodes[e.from];
      var b = def.nodes[e.to];

      if (!a || !b || b.row <= a.row) {
        issues.push({
          code: 'CYCLE',
          message: "non-forward edge " + e.from + "->" + e.to,
          nodeId: e.from
        });
      }
    } // CONNECTIVITY + COVERAGE: all nodes reachable from start


    var reach = reachableFrom(def, def.startNodeId);

    if (!reach.has(def.bossNodeId)) {
      issues.push({
        code: 'BOSS_UNREACHABLE',
        message: 'boss not reachable from start'
      });
    }

    for (var id of Object.keys(def.nodes)) {
      if (!reach.has(id)) {
        issues.push({
          code: 'DISCONNECTED',
          message: "node " + id + " not reachable from start",
          nodeId: id
        });
      }
    } // DEAD_END: non-boss node must have >=1 child


    for (var _id of Object.keys(def.nodes)) {
      if (_id !== def.bossNodeId && def.nodes[_id].children.length === 0) {
        issues.push({
          code: 'DEAD_END',
          message: "node " + _id + " (" + def.nodes[_id].type + ") has no outgoing edge",
          nodeId: _id
        });
      }
    } // BOSS must have >=1 parent


    if (def.nodes[def.bossNodeId].parents.length === 0) {
      issues.push({
        code: 'BOSS_UNREACHABLE',
        message: 'boss has no parents'
      });
    } // >=2 distinct paths (meaningful choice)


    var paths = countPaths(def, def.startNodeId, def.bossNodeId);

    if (paths < 2) {
      issues.push({
        code: 'SINGLE_PATH',
        message: "only " + paths + " distinct start->boss path(s)"
      });
    }

    return {
      ok: issues.length === 0,
      issues
    };
  }
  /**
   * Runtime boss-reachability (GDD v0.4.1 放宽规则): boss is reachable when SOME
   * parent is completed — NOT all. Standard roguelike: clear one parent -> enter boss.
   */


  function isBossReachable(def, state) {
    return def.nodes[def.bossNodeId].parents.some(p => state.completedNodeIds.includes(p));
  }

  function _reportPossibleCrUseOfNodeRouteMapDefinition(extras) {
    _reporterNs.report("NodeRouteMapDefinition", "../../core/save/RouteSaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfNodeRouteRuntimeState(extras) {
    _reporterNs.report("NodeRouteRuntimeState", "../../core/save/RouteSaveTypes", _context.meta, extras);
  }

  _export({
    validateRouteStructure: validateRouteStructure,
    isBossReachable: isBossReachable
  });

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "02b71hvbBpCeZZC2j+DCspj", "NodeRouteValidator", undefined); // assets/scripts/dungeon/route/NodeRouteValidator.ts
      //
      // Structural validation for a NodeRouteMapDefinition (GDD v0.4.4 §4.2 / §4.3):
      //   - connectivity (BFS start -> boss)
      //   - acyclic (every edge goes strictly forward: to.row > from.row)
      //   - coverage (every non-start node reachable from start; no isolated row)
      //   - no dead-end (non-boss node must have >=1 child)
      //   - boss reachable (boss has >=1 parent)
      //   - >=2 distinct start->boss paths (meaningful choice, not a single corridor)
      // Plus a runtime reachability helper (boss reachable when SOME parent is completed).
      //
      // Pure logic, no Cocos. Authoritative spec: GDD v0.4.4 §4.


      PATH_COUNT_CAP = 10000;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=f98b4f5f6a6f50a220741c6bd1d9200156c9efb9.js.map