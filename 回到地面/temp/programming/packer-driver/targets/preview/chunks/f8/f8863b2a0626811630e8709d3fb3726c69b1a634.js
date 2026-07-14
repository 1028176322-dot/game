System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, eventBus, NodeRouteGenerator, NodeRouteState, validateRouteStructure, NodeRewardResolver, deriveSeed, RouteRunController, _crd, TOTAL_FLOORS;

  function toEncounterViewType(t) {
    // start never enters an encounter; combat/elite/boss/shop/rest/event/treasure/upgrade map 1:1.
    return t === 'start' ? 'combat' : t;
  }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfNodeRouteMapDefinition(extras) {
    _reporterNs.report("NodeRouteMapDefinition", "../../core/save/RouteSaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRouteEncounterContext(extras) {
    _reporterNs.report("RouteEncounterContext", "../../core/save/RouteSaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRouteNodeEncounterConfig(extras) {
    _reporterNs.report("RouteNodeEncounterConfig", "../../core/save/RouteSaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRouteNodeType(extras) {
    _reporterNs.report("RouteNodeType", "../../core/save/RouteSaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRouteRunPhase(extras) {
    _reporterNs.report("RouteRunPhase", "../../core/save/RouteSaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRouteRunSnapshot(extras) {
    _reporterNs.report("RouteRunSnapshot", "../../core/save/RouteSaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRouteSavePort(extras) {
    _reporterNs.report("RouteSavePort", "../../core/save/RouteSaveTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfNodeRouteGenerator(extras) {
    _reporterNs.report("NodeRouteGenerator", "./NodeRouteGenerator", _context.meta, extras);
  }

  function _reportPossibleCrUseOfNodeRouteState(extras) {
    _reporterNs.report("NodeRouteState", "./NodeRouteState", _context.meta, extras);
  }

  function _reportPossibleCrUseOfvalidateRouteStructure(extras) {
    _reporterNs.report("validateRouteStructure", "./NodeRouteValidator", _context.meta, extras);
  }

  function _reportPossibleCrUseOfNodeRewardResolver(extras) {
    _reporterNs.report("NodeRewardResolver", "./NodeRewardResolver", _context.meta, extras);
  }

  function _reportPossibleCrUseOfResolvedReward(extras) {
    _reporterNs.report("ResolvedReward", "./NodeRewardResolver", _context.meta, extras);
  }

  function _reportPossibleCrUseOfderiveSeed(extras) {
    _reporterNs.report("deriveSeed", "./RouteSeed", _context.meta, extras);
  }

  _export("RouteRunController", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      eventBus = _unresolved_2.eventBus;
    }, function (_unresolved_3) {
      NodeRouteGenerator = _unresolved_3.NodeRouteGenerator;
    }, function (_unresolved_4) {
      NodeRouteState = _unresolved_4.NodeRouteState;
    }, function (_unresolved_5) {
      validateRouteStructure = _unresolved_5.validateRouteStructure;
    }, function (_unresolved_6) {
      NodeRewardResolver = _unresolved_6.NodeRewardResolver;
    }, function (_unresolved_7) {
      deriveSeed = _unresolved_7.deriveSeed;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "37d8aLAtLFEzLcdRWBOBt22", "RouteRunController", undefined); // assets/scripts/dungeon/route/RouteRunController.ts
      //
      // The ONLY module that advances node-route flow (GDD v0.4.4 §5). UI clicks only
      // call requestEnter(nodeId). The controller:
      //   - owns the 7-phase state machine (map_select -> node_entering -> encounter_running
      //     -> reward_pending -> node_resolved -> [map_select | floor_cleared] / run_settled)
      //   - generates the floor map (NodeRouteGenerator) and drives runtime state (NodeRouteState)
      //   - on combat victory listens to 'route:encounter_complete' (emitted by RoomFlowController
      //     in 'route' mode) then settles via NodeRewardResolver (single grant point, anti-double)
      //   - does NOT call director.loadScene itself; the scene transition is injected as
      //     `sceneLoader` (production wires SceneFlowService.instance.goToDungeon() there).
      //     This keeps the controller free of any `cc` dependency and unit-testable.
      //
      // Path note: from dungeon/route/, `../../` reaches assets/scripts/.
      //   ../../core/save/RouteSaveTypes -> pure data types
      //   ../../core/EventBus           -> pure global event bus (no cc)
      //
      // Authoritative spec: GDD v0.4.4 §5 / §8.5 / §9.3 / §10.3.


      /** Total floors in a run. [PLACEHOLDER] — tune for pacing. */
      TOTAL_FLOORS = 10;
      /** Injected side-effects so the controller stays cc-free and testable. */

      _export("RouteRunController", RouteRunController = class RouteRunController {
        constructor(deps) {
          this._deps = void 0;
          this._resolver = new (_crd && NodeRewardResolver === void 0 ? (_reportPossibleCrUseOfNodeRewardResolver({
            error: Error()
          }), NodeRewardResolver) : NodeRewardResolver)();
          this._state = void 0;
          this._activeEncounter = null;
          this._lastResolved = null;
          this._runId = '';
          this._zoneId = '';
          this._floorIndex = 0;
          this._difficulty = 1;
          this._runSeed = 0;
          this._floorSeed = 0;
          this._routeSeed = 0;
          this._activated = false;

          // ── encounter-complete handler (subscribed to eventBus) ─────────────────────
          this._onComplete = payload => {
            var _this$_state, _payload$elapsed, _payload$kills;

            var rt = (_this$_state = this._state) == null ? void 0 : _this$_state.state;
            if (!rt || rt.phase !== 'encounter_running') return;
            if (!this._activeEncounter || payload.nodeId !== this._activeEncounter.nodeId) return;

            this._resolve(payload.result, (_payload$elapsed = payload.elapsed) != null ? _payload$elapsed : 0, (_payload$kills = payload.kills) != null ? _payload$kills : 0);
          };

          this._deps = deps;
        } // ── lifecycle ────────────────────────────────────────────────────────────

        /** Subscribe to the route encounter-complete event. Call once after construction. */


        activate() {
          if (this._activated) return;
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('route:encounter_complete', this._onComplete);
          this._activated = true;
        }
        /** Unsubscribe. Always call before discarding the controller. */


        deactivate() {
          if (!this._activated) return;
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).off('route:encounter_complete', this._onComplete);
          this._activated = false;
        } // ── floor setup ───────────────────────────────────────────────────────────


        startFloor(input) {
          this._runId = input.runId;
          this._zoneId = input.zoneId;
          this._floorIndex = input.floorIndex;
          this._difficulty = input.difficulty;
          this._runSeed = input.runSeed;
          this._floorSeed = (_crd && deriveSeed === void 0 ? (_reportPossibleCrUseOfderiveSeed({
            error: Error()
          }), deriveSeed) : deriveSeed)(this._runSeed, "f" + input.floorIndex);
          this._routeSeed = (_crd && deriveSeed === void 0 ? (_reportPossibleCrUseOfderiveSeed({
            error: Error()
          }), deriveSeed) : deriveSeed)(this._floorSeed, 'route');
          var def = (_crd && NodeRouteGenerator === void 0 ? (_reportPossibleCrUseOfNodeRouteGenerator({
            error: Error()
          }), NodeRouteGenerator) : NodeRouteGenerator).generate(this._routeSeed, {
            floorIndex: input.floorIndex,
            zoneId: input.zoneId,
            rows: input.rows
          });
          var v = (_crd && validateRouteStructure === void 0 ? (_reportPossibleCrUseOfvalidateRouteStructure({
            error: Error()
          }), validateRouteStructure) : validateRouteStructure)(def);

          if (!v.ok) {
            console.warn('[RouteRunController] generated map failed validation', v.issues);
          }

          this._state = new (_crd && NodeRouteState === void 0 ? (_reportPossibleCrUseOfNodeRouteState({
            error: Error()
          }), NodeRouteState) : NodeRouteState)(def);
          this._activeEncounter = null;
          this._lastResolved = null;

          this._persist();

          return def;
        }
        /**
         * Advance to the next floor after the current floor's boss is cleared.
         * Guard: only valid from `floor_cleared`. On the final floor, transitions to
         * `run_settled` instead of generating a new map.
         *
         * Determinism: the next floor's map is derived from `runSeed + (floorIndex+1)`
         * via buildSeedChain (see startFloor), so the same runSeed always yields the
         * same sequence of maps — the basis for daily / seed challenges.
         */


        advanceFloor() {
          var _this$_state2;

          var rt = (_this$_state2 = this._state) == null ? void 0 : _this$_state2.state;
          if (!rt || rt.phase !== 'floor_cleared') return false; // guard (GDD §5)

          if (this._floorIndex + 1 >= TOTAL_FLOORS) {
            this._state.applyPhase('run_settled');

            this._persist();

            return true;
          } // Reuse startFloor's generation + persistence path for the next floor.


          this.startFloor({
            runId: this._runId,
            zoneId: this._zoneId,
            floorIndex: this._floorIndex + 1,
            difficulty: this._difficulty,
            runSeed: this._runSeed
          });
          return true;
        } // ── the single entry point ─────────────────────────────────────────────────

        /** UI click handler. Returns false if ignored (anti-spam / invalid click). */


        requestEnter(nodeId) {
          var _this$_state3;

          var rt = (_this$_state3 = this._state) == null ? void 0 : _this$_state3.state;
          if (!rt || rt.phase !== 'map_select') return false; // anti-spam (GDD §5)

          if (!this._state.isReachable(nodeId)) return false;
          if (rt.currentNodeId === nodeId) return false;

          this._state.enter(nodeId); // phase -> node_entering


          var nodeType = this._state.def.nodes[nodeId].type;
          var nodeSeed = (_crd && deriveSeed === void 0 ? (_reportPossibleCrUseOfderiveSeed({
            error: Error()
          }), deriveSeed) : deriveSeed)(this._floorSeed, nodeId);
          var encounterSeed = (_crd && deriveSeed === void 0 ? (_reportPossibleCrUseOfderiveSeed({
            error: Error()
          }), deriveSeed) : deriveSeed)(nodeSeed, 'encounter');
          var config = {
            runId: this._runId,
            floorIndex: this._floorIndex,
            nodeId,
            nodeType,
            zoneId: this._zoneId,
            difficulty: this._difficulty,
            seed: encounterSeed,
            encounterSceneId: 'dungeon',
            // GDD §8.5: reuse existing SceneId
            encounterViewType: toEncounterViewType(nodeType),
            rewardProfileId: nodeType // [PLACEHOLDER] -> real profile key in P4/P5

          };
          this._activeEncounter = config;

          this._deps.injectContext({
            nodeId,
            nodeType,
            startedAt: Date.now()
          });

          this._persist();

          var isCombat = nodeType === 'combat' || nodeType === 'elite' || nodeType === 'boss';

          if (isCombat) {
            // GDD §8.5: only SceneFlowService (via injected sceneLoader) may loadScene.
            this._state.applyPhase('encounter_running');

            void this._deps.sceneLoader(config);
          } else {
            // P3: non-combat resolves straight through the resolver (P4 wires the
            // actual interaction — shop UI / rest / event choices — before settle).
            this._resolve('victory', 0, 0);
          }

          return true;
        }

        // ── resolution ───────────────────────────────────────────────────────────
        _resolve(result, elapsed, kills) {
          if (!this._activeEncounter) return;
          var nodeId = this._activeEncounter.nodeId;
          var isBoss = this._activeEncounter.nodeType === 'boss';

          if (result === 'defeat') {
            // Node not completed; return to map. (No reward — resolver returns 0 on defeat.)
            this._activeEncounter = null;

            this._deps.injectContext(null);

            this._state.applyPhase('map_select');

            this._persist();

            return;
          } // Single grant point (GDD §9.3): only NodeRewardResolver emits a reward.


          this._state.applyPhase('reward_pending');

          this._lastResolved = this._resolver.resolve(this._activeEncounter, {
            result,
            elapsed,
            kills
          });
          this._activeEncounter = null;

          this._deps.injectContext(null);

          this._state.complete(nodeId); // phase -> node_resolved, recomputes reachable


          this._state.applyPhase(isBoss ? 'floor_cleared' : 'map_select');

          this._persist();
        } // ── snapshot / recovery (GDD §10.3) ─────────────────────────────────────────


        getSnapshot() {
          var _this$_activeEncounte;

          var rt = this._state.state;
          return {
            schemaVersion: 1,
            runId: this._runId,
            zoneId: this._zoneId,
            floorIndex: this._floorIndex,
            routeMap: this._state.def,
            runtime: rt,
            activeEncounter: (_this$_activeEncounte = this._activeEncounter) != null ? _this$_activeEncounte : undefined,
            seedState: {
              runSeed: this._runSeed,
              floorSeed: this._floorSeed,
              routeSeed: this._routeSeed
            }
          };
        }

        restoreFromSnapshot(snap) {
          var _snap$activeEncounter;

          this._runId = snap.runId;
          this._zoneId = snap.zoneId;
          this._floorIndex = snap.floorIndex;
          this._runSeed = snap.seedState.runSeed;
          this._floorSeed = snap.seedState.floorSeed;
          this._routeSeed = snap.seedState.routeSeed;
          var state = new (_crd && NodeRouteState === void 0 ? (_reportPossibleCrUseOfNodeRouteState({
            error: Error()
          }), NodeRouteState) : NodeRouteState)(snap.routeMap);
          state.load(snap.runtime);
          this._state = state;
          this._activeEncounter = (_snap$activeEncounter = snap.activeEncounter) != null ? _snap$activeEncounter : null;
          this._lastResolved = null; // Idempotent re-entry: if we were mid-encounter, re-load the same scene with
          // the same encounterSeed (no reward yet — guarded by phase).

          if (snap.runtime.phase === 'encounter_running' && this._activeEncounter) {
            void this._deps.sceneLoader(this._activeEncounter);
          }
        }
        /**
         * Recovery entry point (GDD §10.3): load the last persisted snapshot from the
         * injected `savePort` and rebuild controller state. Returns false when there is
         * nothing to restore (e.g. fresh run, or savePort not provided).
         *
         * Idempotent: if the saved phase was `encounter_running`, restoreFromSnapshot
         * re-enters the same scene with the same encounterSeed.
         */


        loadPersisted() {
          if (!this._deps.savePort) return false;

          var snap = this._deps.savePort.loadRoute();

          if (!snap) return false;
          this.restoreFromSnapshot(snap);
          return true;
        } // ── read accessors (for UI / RunCoordinator) ────────────────────────────────


        get phase() {
          return this._state.state.phase;
        }

        get activeEncounter() {
          return this._activeEncounter;
        }

        get lastResolved() {
          return this._lastResolved;
        }

        get state() {
          return this._state;
        }
        /** Current floor index (0-based). Useful for UI progress + recovery assertions. */


        get floorIndex() {
          return this._floorIndex;
        }
        /** Total floors in a run (constant). Useful for UI progress display. */


        get totalFloors() {
          return TOTAL_FLOORS;
        } // ── persistence helper ──────────────────────────────────────────────────────


        _persist() {
          if (this._deps.savePort) {
            this._deps.savePort.saveRoute(this.getSnapshot());
          }
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=f8863b2a0626811630e8709d3fb3726c69b1a634.js.map