// assets/scripts/dungeon/route/NodeRouteValidator.ts
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

import type {
    NodeRouteMapDefinition,
    NodeRouteRuntimeState,
} from '../../core/save/RouteSaveTypes';

export type RouteValidationCode =
    | 'EMPTY'
    | 'BOSS_UNREACHABLE'
    | 'SINGLE_PATH'
    | 'DEAD_END'
    | 'DISCONNECTED'
    | 'CYCLE';

export interface RouteValidationIssue {
    code: RouteValidationCode;
    message: string;
    nodeId?: string;
}

export interface RouteValidationResult {
    ok: boolean;
    issues: RouteValidationIssue[];
}

const PATH_COUNT_CAP = 10000;

/** BFS: set of all node ids reachable from `start`. */
function reachableFrom(def: NodeRouteMapDefinition, start: string): Set<string> {
    const seen = new Set<string>([start]);
    const queue: string[] = [start];
    while (queue.length > 0) {
        const n = queue.shift() as string;
        for (const ch of def.nodes[n].children) {
            if (!seen.has(ch)) {
                seen.add(ch);
                queue.push(ch);
            }
        }
    }
    return seen;
}

/** Count distinct simple paths start -> boss (capped to avoid blow-up on dense maps). */
function countPaths(def: NodeRouteMapDefinition, from: string, to: string): number {
    let count = 0;
    const dfs = (node: string): void => {
        if (count >= PATH_COUNT_CAP) return;
        if (node === to) {
            count++;
            return;
        }
        for (const ch of def.nodes[node].children) dfs(ch);
    };
    dfs(from);
    return count;
}

/**
 * Validate a node route map's STRUCTURE (independent of runtime progress).
 * Returns ok=false with one issue per problem found.
 */
export function validateRouteStructure(def: NodeRouteMapDefinition): RouteValidationResult {
    const issues: RouteValidationIssue[] = [];

    if (!def || !def.nodes || Object.keys(def.nodes).length === 0) {
        return { ok: false, issues: [{ code: 'EMPTY', message: 'map has no nodes' }] };
    }
    if (!def.nodes[def.startNodeId] || !def.nodes[def.bossNodeId]) {
        issues.push({ code: 'EMPTY', message: 'missing start or boss node' });
        return { ok: false, issues };
    }

    // CYCLE: every edge must go strictly forward (to.row > from.row)
    for (const e of def.edges) {
        const a = def.nodes[e.from];
        const b = def.nodes[e.to];
        if (!a || !b || b.row <= a.row) {
            issues.push({ code: 'CYCLE', message: `non-forward edge ${e.from}->${e.to}`, nodeId: e.from });
        }
    }

    // CONNECTIVITY + COVERAGE: all nodes reachable from start
    const reach = reachableFrom(def, def.startNodeId);
    if (!reach.has(def.bossNodeId)) {
        issues.push({ code: 'BOSS_UNREACHABLE', message: 'boss not reachable from start' });
    }
    for (const id of Object.keys(def.nodes)) {
        if (!reach.has(id)) {
            issues.push({ code: 'DISCONNECTED', message: `node ${id} not reachable from start`, nodeId: id });
        }
    }

    // DEAD_END: non-boss node must have >=1 child
    for (const id of Object.keys(def.nodes)) {
        if (id !== def.bossNodeId && def.nodes[id].children.length === 0) {
            issues.push({ code: 'DEAD_END', message: `node ${id} (${def.nodes[id].type}) has no outgoing edge`, nodeId: id });
        }
    }

    // BOSS must have >=1 parent
    if (def.nodes[def.bossNodeId].parents.length === 0) {
        issues.push({ code: 'BOSS_UNREACHABLE', message: 'boss has no parents' });
    }

    // >=2 distinct paths (meaningful choice)
    const paths = countPaths(def, def.startNodeId, def.bossNodeId);
    if (paths < 2) {
        issues.push({ code: 'SINGLE_PATH', message: `only ${paths} distinct start->boss path(s)` });
    }

    return { ok: issues.length === 0, issues };
}

/**
 * Runtime boss-reachability (GDD v0.4.1 放宽规则): boss is reachable when SOME
 * parent is completed — NOT all. Standard roguelike: clear one parent -> enter boss.
 */
export function isBossReachable(def: NodeRouteMapDefinition, state: NodeRouteRuntimeState): boolean {
    return def.nodes[def.bossNodeId].parents.some((p) => state.completedNodeIds.includes(p));
}
