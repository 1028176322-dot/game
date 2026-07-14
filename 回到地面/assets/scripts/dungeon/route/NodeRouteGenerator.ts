// assets/scripts/dungeon/route/NodeRouteGenerator.ts
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

import { Rng } from '../../core/rng/Rng';
import type {
    NodeRouteMapDefinition,
    NodeRouteNodeDef,
    RouteNodeType,
} from '../../core/save/RouteSaveTypes';

// [PLACEHOLDER] tuning: base rows per floor. GDD §4.1 = 10 + floorIndex.
const BASE_ROWS = 10;

// [PLACEHOLDER] middle-row node-type weights (sum need not equal 100).
const MIDDLE_TYPE_WEIGHTS: ReadonlyArray<{ type: RouteNodeType; weight: number }> = [
    { type: 'combat', weight: 50 },
    { type: 'elite', weight: 12 },
    { type: 'event', weight: 10 },
    { type: 'treasure', weight: 8 },
    { type: 'shop', weight: 8 },
    { type: 'rest', weight: 7 },
    { type: 'upgrade', weight: 5 },
];

export interface RouteGenOptions {
    floorIndex: number;
    zoneId?: string;
    // [PLACEHOLDER] override row count for small/test maps (default 10 + floorIndex).
    rows?: number;
}

export class NodeRouteGenerator {
    /**
     * Generate a deterministic node route map.
     * @param seed pre-derived numeric seed (uint32). Same seed + options -> identical map.
     * @param options floorIndex (and optional rows override / zoneId).
     */
    static generate(seed: number, options: RouteGenOptions): NodeRouteMapDefinition {
        const rng = new Rng(seed);
        const rows = options.rows ?? (BASE_ROWS + options.floorIndex);
        if (rows < 3) {
            throw new Error(`NodeRouteGenerator: rows must be >= 3, got ${rows}`);
        }

        const nodes: Record<string, NodeRouteNodeDef> = {};
        const edges = new Set<string>(); // dedupe key "from->to"
        const rowIds: string[][] = [];

        const addEdge = (from: string, to: string): void => {
            if (from === to) return;
            edges.add(`${from}->${to}`);
        };

        // 1. Build nodes per row (start=row0, boss=last row, middle rows 2-4 nodes).
        for (let r = 0; r < rows; r++) {
            const isStart = r === 0;
            const isBoss = r === rows - 1;
            const count = isStart || isBoss ? 1 : rng.int(2, 4);
            const ids: string[] = [];
            for (let c = 0; c < count; c++) {
                let type: RouteNodeType;
                if (isStart) type = 'start';
                else if (isBoss) type = 'boss';
                else type = rng.weighted(MIDDLE_TYPE_WEIGHTS, (w) => w.weight).type;
                const id = `n${r}_${c}`;
                nodes[id] = { id, row: r, col: c, type, parents: [], children: [] };
                ids.push(id);
            }
            rowIds.push(ids);
        }

        const startNodeId = rowIds[0][0];
        const bossNodeId = rowIds[rows - 1][0];

        // 2. Edge generation — every non-boss node gets >=1 child; start fans into
        //    2 branches (first + last of row 1) to GUARANTEE >=2 distinct start->boss paths.
        for (let r = 0; r < rows - 1; r++) {
            const cur = rowIds[r];
            const next = rowIds[r + 1];
            for (let i = 0; i < cur.length; i++) {
                const s = cur[i];
                const targets: string[] = [];
                if (r === 0) {
                    // start -> first AND last of row 1: two independent branches
                    targets.push(next[0]);
                    targets.push(next[next.length - 1]);
                } else {
                    // keep left spine (col 0) and right spine (last col) alive across rows
                    if (i === 0) targets.push(next[0]);
                    if (i === cur.length - 1) targets.push(next[next.length - 1]);
                }
                // guarantee >=1 child if this node got none from the spine rules
                if (targets.length === 0) {
                    targets.push(next[Math.min(i, next.length - 1)]);
                }
                // extra cross edge for branch variety (forward-only, deterministic)
                if (next.length > 1 && rng.chance(0.5)) {
                    targets.push(next[rng.int(0, next.length - 1)]);
                }
                for (const t of targets) addEdge(s, t);
            }
        }

        // 3. Coverage pass — every non-start node must have >=1 parent (no isolated row).
        for (let r = 1; r < rows; r++) {
            const prev = rowIds[r - 1];
            for (const t of rowIds[r]) {
                const hasParent = [...edges].some((e) => e.split('->')[1] === t);
                if (!hasParent) {
                    const col = nodes[t].col;
                    const src = prev[Math.min(col, prev.length - 1)] ?? prev[0];
                    addEdge(src, t);
                }
            }
        }

        // 4. Materialize edges + parents/children (dedupe).
        const edgeList: Array<{ from: string; to: string }> = [];
        for (const e of edges) {
            const [from, to] = e.split('->');
            edgeList.push({ from, to });
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
            seed,
        };
    }
}
