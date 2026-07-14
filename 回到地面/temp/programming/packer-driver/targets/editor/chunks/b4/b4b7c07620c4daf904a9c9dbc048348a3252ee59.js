System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, getNodeViewState, RouteMapViewState, _crd, NODE_HIT_AREA_PX, NODE_SPACING_X, NODE_SPACING_Y, MAP_ORIGIN_X, MAP_ORIGIN_Y, BOSS_HIGHLIGHT;

  function _reportPossibleCrUseOfRouteNodeViewState(extras) {
    _reporterNs.report("RouteNodeViewState", "../../core/save/RouteSaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRouteEncounterContext(extras) {
    _reporterNs.report("RouteEncounterContext", "../../core/save/RouteSaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfNodeRouteRuntimeState(extras) {
    _reporterNs.report("NodeRouteRuntimeState", "../../core/save/RouteSaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfgetNodeViewState(extras) {
    _reporterNs.report("getNodeViewState", "../../core/save/RouteSaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfNodeRouteState(extras) {
    _reporterNs.report("NodeRouteState", "./NodeRouteState", _context.meta, extras);
  }

  _export("RouteMapViewState", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      getNodeViewState = _unresolved_2.getNodeViewState;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "a05fadof8FNkJiONGPpjbOZ", "RouteMapViewState", undefined); // assets/scripts/dungeon/route/RouteMapViewState.ts
      //
      // Route-map VIEW STATE layer — derives per-node UI presentation from the single
      // source of truth (NodeRouteState) and exposes a click-to-enter contract.
      //
      // THIS FILE IS PURE LOGIC (no Cocos import). It does NOT render anything and does
      // NOT load scenes. The actual 2D overlay prefab and the 3D `loadScene` hand-off
      // belong to later stages / the UI layer (P3 wires the enter request to
      // SceneFlowService, the ONLY module allowed to load scenes). Here we only:
      //   - derive `RouteNodeViewState` per node (GDD §3.3)
      //   - expose a clickable predicate (anti-spam per GDD §5)
      //   - build a RouteEncounterContext on a valid click and hand it to an injected
      //     handler, so the route layer never touches SceneFlowService directly.
      //
      // Path note: from dungeon/route/, `../../` reaches assets/scripts/.
      //   ../../core/save/RouteSaveTypes -> assets/scripts/core/save/RouteSaveTypes
      //
      // Authoritative spec: GDD v0.4.4 §3.3 / §5 / §7.


      // §7 mobile UI constants (pure data, consumed by the future 2D overlay).
      // [PLACEHOLDER] tuning: hit area must be >= 72px; spacing leaves room for edges.
      _export("NODE_HIT_AREA_PX", NODE_HIT_AREA_PX = 72);

      _export("NODE_SPACING_X", NODE_SPACING_X = 120);

      _export("NODE_SPACING_Y", NODE_SPACING_Y = 140);

      _export("MAP_ORIGIN_X", MAP_ORIGIN_X = NODE_SPACING_X);

      _export("MAP_ORIGIN_Y", MAP_ORIGIN_Y = NODE_SPACING_Y); // §7: Boss uses a GOLD crown/mark; RED is forbidden.


      _export("BOSS_HIGHLIGHT", BOSS_HIGHLIGHT = 'gold');

      /**
       * View-state facade over a NodeRouteState. One instance per active route map.
       * Holds NO state of its own — always reads from the injected NodeRouteState.
       */
      _export("RouteMapViewState", RouteMapViewState = class RouteMapViewState {
        constructor(_state) {
          this._state = _state;
        }

        get _rt() {
          return this._state.state;
        }
        /** Derive a single node's view state (GDD §3.3). */


        getNodeViewState(nodeId) {
          return (_crd && getNodeViewState === void 0 ? (_reportPossibleCrUseOfgetNodeViewState({
            error: Error()
          }), getNodeViewState) : getNodeViewState)(nodeId, this._rt);
        }
        /** Derive view state for every node in the map. */


        getAllViewStates() {
          const out = {};

          for (const id of Object.keys(this._state.def.nodes)) {
            out[id] = this.getNodeViewState(id);
          }

          return out;
        }
        /**
         * A node is clickable only when: phase is map_select (anti-spam, GDD §5),
         * it is currently reachable, and it is not the node we're already standing on.
         */


        isClickable(nodeId) {
          const rt = this._rt;
          if (rt.phase !== 'map_select') return false;
          if (rt.currentNodeId === nodeId) return false;
          return rt.reachableNodeIds.includes(nodeId);
        }
        /**
         * Handle a node click from the 2D overlay. Validates clickability, builds a
         * RouteEncounterContext, and (optionally) forwards it to the injected handler.
         *
         * The route layer NEVER calls director.loadScene here — that is P3's job,
         * wired through SceneFlowService. We only produce the context + signal success.
         *
         * @param nodeId clicked node id
         * @param onEnter optional handler invoked with the encounter context on success
         */


        tryRequestEnter(nodeId, onEnter) {
          if (!this.isClickable(nodeId)) {
            const rt = this._rt;

            if (rt.phase !== 'map_select') {
              return {
                ok: false,
                reason: 'wrong_phase'
              };
            }

            return {
              ok: false,
              reason: rt.reachableNodeIds.includes(nodeId) ? 'not_clickable' : 'not_reachable'
            };
          }

          const def = this._state.def.nodes[nodeId];
          const ctx = {
            nodeId,
            nodeType: def.type,
            startedAt: Date.now()
          };
          onEnter == null || onEnter(ctx);
          return {
            ok: true,
            context: ctx
          };
        }
        /** Layout data for one node (px position + view state), for the 2D overlay. */


        getNodeLayout(nodeId) {
          const def = this._state.def.nodes[nodeId];
          return {
            id: nodeId,
            row: def.row,
            col: def.col,
            type: def.type,
            x: MAP_ORIGIN_X + def.col * NODE_SPACING_X,
            y: MAP_ORIGIN_Y + def.row * NODE_SPACING_Y,
            viewState: this.getNodeViewState(nodeId),
            isBoss: nodeId === this._state.def.bossNodeId
          };
        }
        /** Full layout for every node, in render order (row-major). */


        getMapLayout() {
          return Object.keys(this._state.def.nodes).map(id => this.getNodeLayout(id)).sort((a, b) => a.row - b.row || a.col - b.col);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=b4b7c07620c4daf904a9c9dbc048348a3252ee59.js.map