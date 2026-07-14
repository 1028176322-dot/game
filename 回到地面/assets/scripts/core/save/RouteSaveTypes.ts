// assets/scripts/core/save/RouteSaveTypes.ts
// PURE DATA ONLY: no Cocos import, no controller import.
//
// Single source of truth for the route-system pure data types. Both
// `dungeon/route/` and `core/save/SaveTypes.ts` import from here, eliminating the
// `core/save -> dungeon/route` inverted-dependency hazard (GDD v0.4.2 ③).
//
// Authoritative spec: docs/地牢重做_节点路线图肉鸽_设计v0.4.4.md §3 / §6 / §8.3 / §10.3.

export type RouteNodeType =
    | 'start' | 'combat' | 'elite' | 'event'
    | 'treasure' | 'shop' | 'rest' | 'upgrade' | 'boss';

export interface NodeRouteNodeDef {
    id: string;
    row: number;
    col: number;
    type: RouteNodeType;
    parents: string[];
    children: string[];
}

export interface NodeRouteMapDefinition {
    floorIndex: number;
    rows: number;
    nodes: Record<string, NodeRouteNodeDef>;
    edges: Array<{ from: string; to: string }>;
    startNodeId: string;
    bossNodeId: string;
    seed: number;
}

export type RouteRunPhase =
    | 'map_select' | 'node_entering' | 'encounter_running'
    | 'reward_pending' | 'node_resolved' | 'floor_cleared' | 'run_settled';

export interface NodeRouteRuntimeState {
    currentNodeId: string;
    reachableNodeIds: string[];
    completedNodeIds: string[];
    phase: RouteRunPhase;
}

// §3.3 UI view state — DERIVED, never stored. Single source of truth for how a
// node should render on the route map. Kept in the pure-data layer (no Cocos) so
// both dungeon/route/ and a future UI layer import it from one place.
export type RouteNodeViewState = 'current' | 'completed' | 'reachable' | 'locked';

/**
 * Derive a node's UI view state from the runtime state. Priority:
 *   current > completed > reachable > locked.
 * Pure function — no side effects, deterministic.
 */
export function getNodeViewState(
    nodeId: string,
    state: NodeRouteRuntimeState,
): RouteNodeViewState {
    if (state.currentNodeId === nodeId) return 'current';
    if (state.completedNodeIds.includes(nodeId)) return 'completed';
    if (state.reachableNodeIds.includes(nodeId)) return 'reachable';
    return 'locked';
}

export interface RouteNodeEncounterConfig {
    runId: string;
    floorIndex: number;
    nodeId: string;
    nodeType: RouteNodeType;
    zoneId: string;
    difficulty: number;
    seed: number;
    encounterSceneId: 'dungeon';
    encounterViewType: 'combat' | 'elite' | 'boss'
                        | 'shop' | 'rest' | 'event' | 'treasure' | 'upgrade';
    rewardProfileId: string;
}

// v0.4.4: route combat context, pure data, provided here (not inside RoomFlowController).
export interface RouteEncounterContext {
    nodeId: string;
    nodeType: RouteNodeType;
    startedAt: number;
}

export interface RouteRunSnapshot {
    schemaVersion: number;
    runId: string;
    zoneId: string;
    floorIndex: number;
    routeMap: NodeRouteMapDefinition;
    runtime: NodeRouteRuntimeState;
    activeEncounter?: RouteNodeEncounterConfig;
    seedState: { runSeed: number; floorSeed: number; routeSeed: number };
}

export interface RouteSavePort {
    saveRoute(snapshot: RouteRunSnapshot): boolean;
    loadRoute(): RouteRunSnapshot | null;
    clearRoute(): void;
}
