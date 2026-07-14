// assets/scripts/dungeon/route/NodeRouteState.ts
//
// Runtime state for a node route map — the SINGLE SOURCE OF TRUTH for which node
// the player is at, which nodes are reachable, and which are completed. Pure logic,
// no Cocos. Derives `reachableNodeIds` from `completedNodeIds` + the static map.
//
// Path note: from dungeon/route/, `../../` reaches assets/scripts/.
//   ../../core/save/RouteSaveTypes -> assets/scripts/core/save/RouteSaveTypes
//
// Authoritative spec: GDD v0.4.4 §3.2 / §5.

import type {
    NodeRouteMapDefinition,
    NodeRouteRuntimeState,
    RouteRunPhase,
} from '../../core/save/RouteSaveTypes';

export class NodeRouteState {
    private readonly _def: NodeRouteMapDefinition;
    private _state: NodeRouteRuntimeState;

    constructor(def: NodeRouteMapDefinition) {
        this._def = def;
        this._state = NodeRouteState.freshState(def);
    }

    /** Read-only access to the current runtime state. */
    get state(): NodeRouteRuntimeState {
        return { ...this._state };
    }

    get def(): NodeRouteMapDefinition {
        return this._def;
    }

    /** Initial state: player stands at start, start auto-completed, children of start are reachable. */
    private static freshState(def: NodeRouteMapDefinition): NodeRouteRuntimeState {
        const start = def.startNodeId;
        return {
            currentNodeId: start,
            completedNodeIds: [start],
            reachableNodeIds: [...def.nodes[start].children],
            phase: 'map_select',
        };
    }

    /** Children of all completed nodes, minus completed nodes themselves. */
    computeReachable(completed: string[] = this._state.completedNodeIds): string[] {
        const done = new Set(completed);
        const set = new Set<string>();
        for (const c of completed) {
            for (const ch of this._def.nodes[c].children) {
                if (!done.has(ch)) set.add(ch);
            }
        }
        return [...set];
    }

    isReachable(nodeId: string): boolean {
        return this._state.reachableNodeIds.includes(nodeId);
    }

    /** Enter a node (must be reachable). Advances phase to node_entering. */
    enter(nodeId: string): void {
        if (!this.isReachable(nodeId)) return; // anti-spam: ignore invalid clicks
        this._state = {
            ...this._state,
            currentNodeId: nodeId,
            phase: 'node_entering',
        };
    }

    /** Mark a node completed; recompute reachable; phase -> node_resolved. */
    complete(nodeId: string): void {
        const completed = this._state.completedNodeIds.includes(nodeId)
            ? this._state.completedNodeIds
            : [...this._state.completedNodeIds, nodeId];
        this._state = {
            ...this._state,
            completedNodeIds: completed,
            reachableNodeIds: this.computeReachable(completed),
            currentNodeId: nodeId,
            phase: 'node_resolved',
        };
    }

    /** Restore runtime state from a saved snapshot (RouteSavePort). */
    load(state: NodeRouteRuntimeState): void {
        this._state = { ...state };
    }

    applyPhase(phase: RouteRunPhase): void {
        this._state = { ...this._state, phase };
    }
}
