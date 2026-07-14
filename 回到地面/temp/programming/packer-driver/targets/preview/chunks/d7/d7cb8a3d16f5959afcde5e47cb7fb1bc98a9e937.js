System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, NodeRouteState, _crd;

  function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

  function _reportPossibleCrUseOfNodeRouteMapDefinition(extras) {
    _reporterNs.report("NodeRouteMapDefinition", "../../core/save/RouteSaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfNodeRouteRuntimeState(extras) {
    _reporterNs.report("NodeRouteRuntimeState", "../../core/save/RouteSaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRouteRunPhase(extras) {
    _reporterNs.report("RouteRunPhase", "../../core/save/RouteSaveTypes", _context.meta, extras);
  }

  _export("NodeRouteState", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "82fd2vhYcZKY7l5/LNpauwa", "NodeRouteState", undefined); // assets/scripts/dungeon/route/NodeRouteState.ts
      //
      // Runtime state for a node route map — the SINGLE SOURCE OF TRUTH for which node
      // the player is at, which nodes are reachable, and which are completed. Pure logic,
      // no Cocos. Derives `reachableNodeIds` from `completedNodeIds` + the static map.
      //
      // Path note: from dungeon/route/, `../../` reaches assets/scripts/.
      //   ../../core/save/RouteSaveTypes -> assets/scripts/core/save/RouteSaveTypes
      //
      // Authoritative spec: GDD v0.4.4 §3.2 / §5.


      _export("NodeRouteState", NodeRouteState = class NodeRouteState {
        constructor(def) {
          this._def = void 0;
          this._state = void 0;
          this._def = def;
          this._state = NodeRouteState.freshState(def);
        }
        /** Read-only access to the current runtime state. */


        get state() {
          return _extends({}, this._state);
        }

        get def() {
          return this._def;
        }
        /** Initial state: player stands at start, start auto-completed, children of start are reachable. */


        static freshState(def) {
          var start = def.startNodeId;
          return {
            currentNodeId: start,
            completedNodeIds: [start],
            reachableNodeIds: [...def.nodes[start].children],
            phase: 'map_select'
          };
        }
        /** Children of all completed nodes, minus completed nodes themselves. */


        computeReachable(completed) {
          if (completed === void 0) {
            completed = this._state.completedNodeIds;
          }

          var done = new Set(completed);
          var set = new Set();

          for (var c of completed) {
            for (var ch of this._def.nodes[c].children) {
              if (!done.has(ch)) set.add(ch);
            }
          }

          return [...set];
        }

        isReachable(nodeId) {
          return this._state.reachableNodeIds.includes(nodeId);
        }
        /** Enter a node (must be reachable). Advances phase to node_entering. */


        enter(nodeId) {
          if (!this.isReachable(nodeId)) return; // anti-spam: ignore invalid clicks

          this._state = _extends({}, this._state, {
            currentNodeId: nodeId,
            phase: 'node_entering'
          });
        }
        /** Mark a node completed; recompute reachable; phase -> node_resolved. */


        complete(nodeId) {
          var completed = this._state.completedNodeIds.includes(nodeId) ? this._state.completedNodeIds : [...this._state.completedNodeIds, nodeId];
          this._state = _extends({}, this._state, {
            completedNodeIds: completed,
            reachableNodeIds: this.computeReachable(completed),
            currentNodeId: nodeId,
            phase: 'node_resolved'
          });
        }
        /** Restore runtime state from a saved snapshot (RouteSavePort). */


        load(state) {
          this._state = _extends({}, state);
        }

        applyPhase(phase) {
          this._state = _extends({}, this._state, {
            phase
          });
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=d7cb8a3d16f5959afcde5e47cb7fb1bc98a9e937.js.map