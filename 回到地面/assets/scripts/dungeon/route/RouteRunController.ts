// assets/scripts/dungeon/route/RouteRunController.ts
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

import { eventBus } from '../../core/EventBus';
import type {
    NodeRouteMapDefinition,
    RouteEncounterContext,
    RouteNodeEncounterConfig,
    RouteNodeType,
    RouteRunPhase,
    RouteRunSnapshot,
    RouteSavePort,
} from '../../core/save/RouteSaveTypes';
import { NodeRouteGenerator } from './NodeRouteGenerator';
import { NodeRouteState } from './NodeRouteState';
import { validateRouteStructure } from './NodeRouteValidator';
import { NodeRewardResolver, type ResolvedReward } from './NodeRewardResolver';
import { deriveSeed } from './RouteSeed';

/** Total floors in a run. [PLACEHOLDER] — tune for pacing. */
const TOTAL_FLOORS = 10;

/** Injected side-effects so the controller stays cc-free and testable. */
export interface RouteRunControllerDeps {
    /** Load the 3D encounter scene. Production wires SceneFlowService.instance.goToDungeon(). */
    sceneLoader: (config: RouteNodeEncounterConfig) => Promise<void>;
    /** Inject the route context into RoomFlowController before the encounter (null to clear). */
    injectContext: (ctx: RouteEncounterContext | null) => void;
    /** Optional persistence; default no-op (production passes RouteSaveAdapter). */
    savePort?: RouteSavePort;
}

interface StartFloorInput {
    runId: string;
    zoneId: string;
    floorIndex: number;
    difficulty: number;
    runSeed: number;
    /** [PLACEHOLDER] override rows for small/test maps (default 10 + floorIndex). */
    rows?: number;
}

interface EncounterCompletePayload {
    nodeId: string;
    nodeType: RouteNodeType;
    result: 'victory' | 'defeat';
    elapsed: number;
    kills: number;
}

function toEncounterViewType(t: RouteNodeType): RouteNodeEncounterConfig['encounterViewType'] {
    // start never enters an encounter; combat/elite/boss/shop/rest/event/treasure/upgrade map 1:1.
    return t === 'start' ? 'combat' : t;
}

export class RouteRunController {
    private readonly _deps: RouteRunControllerDeps;
    private readonly _resolver = new NodeRewardResolver();

    private _state!: NodeRouteState;
    private _activeEncounter: RouteNodeEncounterConfig | null = null;
    private _lastResolved: ResolvedReward | null = null;

    private _runId = '';
    private _zoneId = '';
    private _floorIndex = 0;
    private _difficulty = 1;
    private _runSeed = 0;
    private _floorSeed = 0;
    private _routeSeed = 0;

    private _activated = false;

    constructor(deps: RouteRunControllerDeps) {
        this._deps = deps;
    }

    // ── lifecycle ────────────────────────────────────────────────────────────

    /** Subscribe to the route encounter-complete event. Call once after construction. */
    activate(): void {
        if (this._activated) return;
        eventBus.on('route:encounter_complete', this._onComplete);
        this._activated = true;
    }

    /** Unsubscribe. Always call before discarding the controller. */
    deactivate(): void {
        if (!this._activated) return;
        eventBus.off('route:encounter_complete', this._onComplete);
        this._activated = false;
    }

    // ── floor setup ───────────────────────────────────────────────────────────

    startFloor(input: StartFloorInput): NodeRouteMapDefinition {
        this._runId = input.runId;
        this._zoneId = input.zoneId;
        this._floorIndex = input.floorIndex;
        this._difficulty = input.difficulty;
        this._runSeed = input.runSeed;
        this._floorSeed = deriveSeed(this._runSeed, `f${input.floorIndex}`);
        this._routeSeed = deriveSeed(this._floorSeed, 'route');

        const def = NodeRouteGenerator.generate(this._routeSeed, {
            floorIndex: input.floorIndex,
            zoneId: input.zoneId,
            rows: input.rows,
        });
        const v = validateRouteStructure(def);
        if (!v.ok) {
            console.warn('[RouteRunController] generated map failed validation', v.issues);
        }

        this._state = new NodeRouteState(def);
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
    advanceFloor(): boolean {
        const rt = this._state?.state;
        if (!rt || rt.phase !== 'floor_cleared') return false; // guard (GDD §5)

        if (this._floorIndex + 1 >= TOTAL_FLOORS) {
            this._state.applyPhase('run_settled');
            this._persist();
            return true;
        }

        // Reuse startFloor's generation + persistence path for the next floor.
        this.startFloor({
            runId: this._runId,
            zoneId: this._zoneId,
            floorIndex: this._floorIndex + 1,
            difficulty: this._difficulty,
            runSeed: this._runSeed,
        });
        return true;
    }

    // ── the single entry point ─────────────────────────────────────────────────

    /** UI click handler. Returns false if ignored (anti-spam / invalid click). */
    requestEnter(nodeId: string): boolean {
        const rt = this._state?.state;
        if (!rt || rt.phase !== 'map_select') return false; // anti-spam (GDD §5)
        if (!this._state.isReachable(nodeId)) return false;
        if (rt.currentNodeId === nodeId) return false;

        this._state.enter(nodeId); // phase -> node_entering

        const nodeType = this._state.def.nodes[nodeId].type;
        const nodeSeed = deriveSeed(this._floorSeed, nodeId);
        const encounterSeed = deriveSeed(nodeSeed, 'encounter');
        const config: RouteNodeEncounterConfig = {
            runId: this._runId,
            floorIndex: this._floorIndex,
            nodeId,
            nodeType,
            zoneId: this._zoneId,
            difficulty: this._difficulty,
            seed: encounterSeed,
            encounterSceneId: 'dungeon', // GDD §8.5: reuse existing SceneId
            encounterViewType: toEncounterViewType(nodeType),
            rewardProfileId: nodeType, // [PLACEHOLDER] -> real profile key in P4/P5
        };
        this._activeEncounter = config;
        this._deps.injectContext({ nodeId, nodeType, startedAt: Date.now() });
        this._persist();

        const isCombat = nodeType === 'combat' || nodeType === 'elite' || nodeType === 'boss';
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

    // ── encounter-complete handler (subscribed to eventBus) ─────────────────────

    private _onComplete = (payload: EncounterCompletePayload): void => {
        const rt = this._state?.state;
        if (!rt || rt.phase !== 'encounter_running') return;
        if (!this._activeEncounter || payload.nodeId !== this._activeEncounter.nodeId) return;
        this._resolve(payload.result, payload.elapsed ?? 0, payload.kills ?? 0);
    };

    // ── resolution ───────────────────────────────────────────────────────────

    private _resolve(result: 'victory' | 'defeat', elapsed: number, kills: number): void {
        if (!this._activeEncounter) return;
        const nodeId = this._activeEncounter.nodeId;
        const isBoss = this._activeEncounter.nodeType === 'boss';

        if (result === 'defeat') {
            // Node not completed; return to map. (No reward — resolver returns 0 on defeat.)
            this._activeEncounter = null;
            this._deps.injectContext(null);
            this._state.applyPhase('map_select');
            this._persist();
            return;
        }

        // Single grant point (GDD §9.3): only NodeRewardResolver emits a reward.
        this._state.applyPhase('reward_pending');
        this._lastResolved = this._resolver.resolve(this._activeEncounter, { result, elapsed, kills });

        this._activeEncounter = null;
        this._deps.injectContext(null);
        this._state.complete(nodeId); // phase -> node_resolved, recomputes reachable
        this._state.applyPhase(isBoss ? 'floor_cleared' : 'map_select');
        this._persist();
    }

    // ── snapshot / recovery (GDD §10.3) ─────────────────────────────────────────

    getSnapshot(): RouteRunSnapshot {
        const rt = this._state.state;
        return {
            schemaVersion: 1,
            runId: this._runId,
            zoneId: this._zoneId,
            floorIndex: this._floorIndex,
            routeMap: this._state.def,
            runtime: rt,
            activeEncounter: this._activeEncounter ?? undefined,
            seedState: {
                runSeed: this._runSeed,
                floorSeed: this._floorSeed,
                routeSeed: this._routeSeed,
            },
        };
    }

    restoreFromSnapshot(snap: RouteRunSnapshot): void {
        this._runId = snap.runId;
        this._zoneId = snap.zoneId;
        this._floorIndex = snap.floorIndex;
        this._runSeed = snap.seedState.runSeed;
        this._floorSeed = snap.seedState.floorSeed;
        this._routeSeed = snap.seedState.routeSeed;

        const state = new NodeRouteState(snap.routeMap);
        state.load(snap.runtime);
        this._state = state;
        this._activeEncounter = snap.activeEncounter ?? null;
        this._lastResolved = null;

        // Idempotent re-entry: if we were mid-encounter, re-load the same scene with
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
    loadPersisted(): boolean {
        if (!this._deps.savePort) return false;
        const snap = this._deps.savePort.loadRoute();
        if (!snap) return false;
        this.restoreFromSnapshot(snap);
        return true;
    }

    // ── read accessors (for UI / RunCoordinator) ────────────────────────────────

    get phase(): RouteRunPhase {
        return this._state.state.phase;
    }

    get activeEncounter(): RouteNodeEncounterConfig | null {
        return this._activeEncounter;
    }

    get lastResolved(): ResolvedReward | null {
        return this._lastResolved;
    }

    get state(): NodeRouteState {
        return this._state;
    }

    /** Current floor index (0-based). Useful for UI progress + recovery assertions. */
    get floorIndex(): number {
        return this._floorIndex;
    }

    /** Total floors in a run (constant). Useful for UI progress display. */
    get totalFloors(): number {
        return TOTAL_FLOORS;
    }

    // ── persistence helper ──────────────────────────────────────────────────────

    private _persist(): void {
        if (this._deps.savePort) {
            this._deps.savePort.saveRoute(this.getSnapshot());
        }
    }
}
