// assets/scripts/dungeon/route/RouteMapViewState.ts
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

import type {
    RouteNodeViewState,
    RouteEncounterContext,
    NodeRouteRuntimeState,
} from '../../core/save/RouteSaveTypes';
import { getNodeViewState } from '../../core/save/RouteSaveTypes';
import { NodeRouteState } from './NodeRouteState';

// §7 mobile UI constants (pure data, consumed by the future 2D overlay).
// [PLACEHOLDER] tuning: hit area must be >= 72px; spacing leaves room for edges.
export const NODE_HIT_AREA_PX = 72;
export const NODE_SPACING_X = 120;
export const NODE_SPACING_Y = 140;
export const MAP_ORIGIN_X = NODE_SPACING_X;
export const MAP_ORIGIN_Y = NODE_SPACING_Y;

// §7: Boss uses a GOLD crown/mark; RED is forbidden.
export const BOSS_HIGHLIGHT = 'gold' as const;

export interface RouteMapNodeLayout {
    id: string;
    row: number;
    col: number;
    type: string;
    /** Normalized layout position in px (top-left origin), for the 2D overlay. */
    x: number;
    y: number;
    viewState: RouteNodeViewState;
    /** True for the boss row node — UI should apply the gold highlight. */
    isBoss: boolean;
}

export interface EnterRequestResult {
    ok: boolean;
    context?: RouteEncounterContext;
    reason?: 'not_clickable' | 'not_reachable' | 'wrong_phase';
}

/**
 * View-state facade over a NodeRouteState. One instance per active route map.
 * Holds NO state of its own — always reads from the injected NodeRouteState.
 */
export class RouteMapViewState {
    constructor(private readonly _state: NodeRouteState) {}

    private get _rt(): NodeRouteRuntimeState {
        return this._state.state;
    }

    /** Derive a single node's view state (GDD §3.3). */
    getNodeViewState(nodeId: string): RouteNodeViewState {
        return getNodeViewState(nodeId, this._rt);
    }

    /** Derive view state for every node in the map. */
    getAllViewStates(): Record<string, RouteNodeViewState> {
        const out: Record<string, RouteNodeViewState> = {};
        for (const id of Object.keys(this._state.def.nodes)) {
            out[id] = this.getNodeViewState(id);
        }
        return out;
    }

    /**
     * A node is clickable only when: phase is map_select (anti-spam, GDD §5),
     * it is currently reachable, and it is not the node we're already standing on.
     */
    isClickable(nodeId: string): boolean {
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
    tryRequestEnter(
        nodeId: string,
        onEnter?: (ctx: RouteEncounterContext) => void,
    ): EnterRequestResult {
        if (!this.isClickable(nodeId)) {
            const rt = this._rt;
            if (rt.phase !== 'map_select') {
                return { ok: false, reason: 'wrong_phase' };
            }
            return { ok: false, reason: rt.reachableNodeIds.includes(nodeId) ? 'not_clickable' : 'not_reachable' };
        }
        const def = this._state.def.nodes[nodeId];
        const ctx: RouteEncounterContext = {
            nodeId,
            nodeType: def.type,
            startedAt: Date.now(),
        };
        onEnter?.(ctx);
        return { ok: true, context: ctx };
    }

    /** Layout data for one node (px position + view state), for the 2D overlay. */
    getNodeLayout(nodeId: string): RouteMapNodeLayout {
        const def = this._state.def.nodes[nodeId];
        return {
            id: nodeId,
            row: def.row,
            col: def.col,
            type: def.type,
            x: MAP_ORIGIN_X + def.col * NODE_SPACING_X,
            y: MAP_ORIGIN_Y + def.row * NODE_SPACING_Y,
            viewState: this.getNodeViewState(nodeId),
            isBoss: nodeId === this._state.def.bossNodeId,
        };
    }

    /** Full layout for every node, in render order (row-major). */
    getMapLayout(): RouteMapNodeLayout[] {
        return Object.keys(this._state.def.nodes)
            .map((id) => this.getNodeLayout(id))
            .sort((a, b) => a.row - b.row || a.col - b.col);
    }
}
