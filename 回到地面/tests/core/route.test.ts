// tests/core/route.test.ts — Demo7 P1 DoD verification (GDD v0.4.4 §4 / §6.2).
// Pure-TS: dungeon/route/** has no `cc` import -> node/vitest.

import { describe, it, expect } from 'vitest';
import { NodeRouteGenerator } from '../../assets/scripts/dungeon/route/NodeRouteGenerator';
import { NodeRouteState } from '../../assets/scripts/dungeon/route/NodeRouteState';
import {
    validateRouteStructure,
    isBossReachable,
} from '../../assets/scripts/dungeon/route/NodeRouteValidator';
import { toLegacyRoomType } from '../../assets/scripts/dungeon/route/RouteNodeTypeAdapter';
import type {
    NodeRouteMapDefinition,
    NodeRouteNodeDef,
    RouteNodeType,
} from '../../assets/scripts/core/save/RouteSaveTypes';

// ---------- broken-map builders (for validator negative tests) ----------

function node(id: string, row: number, col: number, type: RouteNodeType): NodeRouteNodeDef {
    return { id, row, col, type, parents: [], children: [] };
}

/** Straight vertical corridor: exactly 1 start->boss path. */
function straightLineMap(): NodeRouteMapDefinition {
    const rows = 5;
    const nodes: Record<string, NodeRouteNodeDef> = {};
    const ids: string[] = [];
    for (let r = 0; r < rows; r++) {
        const id = `n${r}_0`;
        nodes[id] = node(id, r, 0, r === 0 ? 'start' : r === rows - 1 ? 'boss' : 'combat');
        ids.push(id);
        if (r > 0) {
            nodes[ids[r - 1]].children.push(id);
            nodes[id].parents.push(ids[r - 1]);
        }
    }
    const edges = ids.slice(1).map((to, i) => ({ from: ids[i], to }));
    return { floorIndex: 0, rows, nodes, edges, startNodeId: ids[0], bossNodeId: ids[rows - 1], seed: 1 };
}

/** Boss has no parents at all (disconnected from the rest). */
function bossUnreachableMap(): NodeRouteMapDefinition {
    const nodes: Record<string, NodeRouteNodeDef> = {};
    nodes['n0_0'] = node('n0_0', 0, 0, 'start');
    nodes['n1_0'] = node('n1_0', 1, 0, 'combat');
    nodes['n2_0'] = node('n2_0', 2, 0, 'combat');
    nodes['n3_0'] = node('n3_0', 3, 0, 'boss');
    nodes['n0_0'].children.push('n1_0');
    nodes['n1_0'].parents.push('n0_0');
    nodes['n1_0'].children.push('n2_0');
    nodes['n2_0'].parents.push('n1_0');
    // n3_0 (boss) has no parents -> unreachable
    const edges = [
        { from: 'n0_0', to: 'n1_0' },
        { from: 'n1_0', to: 'n2_0' },
    ];
    return { floorIndex: 0, rows: 4, nodes, edges, startNodeId: 'n0_0', bossNodeId: 'n3_0', seed: 2 };
}

/** A middle node with no parent (isolated row) while boss stays reachable. */
function isolatedRowMap(): NodeRouteMapDefinition {
    const nodes: Record<string, NodeRouteNodeDef> = {};
    nodes['n0_0'] = node('n0_0', 0, 0, 'start');
    nodes['n1_0'] = node('n1_0', 1, 0, 'combat');
    nodes['n1_1'] = node('n1_1', 1, 1, 'event'); // isolated: no parent
    nodes['n2_0'] = node('n2_0', 2, 0, 'combat');
    nodes['n3_0'] = node('n3_0', 3, 0, 'boss');
    nodes['n0_0'].children.push('n1_0');
    nodes['n1_0'].parents.push('n0_0');
    nodes['n1_0'].children.push('n2_0');
    nodes['n2_0'].parents.push('n1_0');
    nodes['n2_0'].children.push('n3_0');
    nodes['n3_0'].parents.push('n2_0');
    // n1_1 has no parent and no child -> disconnected
    const edges = [
        { from: 'n0_0', to: 'n1_0' },
        { from: 'n1_0', to: 'n2_0' },
        { from: 'n2_0', to: 'n3_0' },
    ];
    return { floorIndex: 0, rows: 4, nodes, edges, startNodeId: 'n0_0', bossNodeId: 'n3_0', seed: 3 };
}

// ---------- NodeRouteGenerator ----------

describe('NodeRouteGenerator — determinism & structure', () => {
    it('same seed + floorIndex -> identical map', () => {
        const a = NodeRouteGenerator.generate(123456, { floorIndex: 0, rows: 8 });
        const b = NodeRouteGenerator.generate(123456, { floorIndex: 0, rows: 8 });
        expect(a).toEqual(b);
    });

    it('different seeds -> different maps', () => {
        const a = NodeRouteGenerator.generate(1, { floorIndex: 0, rows: 8 });
        const b = NodeRouteGenerator.generate(2, { floorIndex: 0, rows: 8 });
        expect(a).not.toEqual(b);
    });

    it('generated map always passes structural validation', () => {
        for (const seed of [1, 7, 42, 999, 123456, 65535, 271828]) {
            const def = NodeRouteGenerator.generate(seed, { floorIndex: 0 });
            const res = validateRouteStructure(def);
            expect(res.ok, `seed ${seed} failed: ${JSON.stringify(res.issues)}`).toBe(true);
        }
    });

    it('boss reachable structurally (has >=1 parent)', () => {
        const def = NodeRouteGenerator.generate(2024, { floorIndex: 0 });
        expect(def.nodes[def.bossNodeId].parents.length).toBeGreaterThanOrEqual(1);
    });

    it('>=2 distinct start->boss paths (meaningful choice)', () => {
        const def = NodeRouteGenerator.generate(2024, { floorIndex: 0 });
        // validated above; assert explicitly via the absence of SINGLE_PATH
        const res = validateRouteStructure(def);
        expect(res.issues.some((i) => i.code === 'SINGLE_PATH')).toBe(false);
    });

    it('acyclic: every edge goes strictly forward (to.row > from.row)', () => {
        const def = NodeRouteGenerator.generate(31415, { floorIndex: 1, rows: 7 });
        for (const e of def.edges) {
            expect(def.nodes[e.to].row).toBeGreaterThan(def.nodes[e.from].row);
        }
    });

    it('start row has a single node, boss row has a single node', () => {
        const def = NodeRouteGenerator.generate(99, { floorIndex: 2 });
        const starts = Object.values(def.nodes).filter((n) => n.type === 'start');
        const bosses = Object.values(def.nodes).filter((n) => n.type === 'boss');
        expect(starts.length).toBe(1);
        expect(bosses.length).toBe(1);
    });
});

// ---------- NodeRouteValidator ----------

describe('NodeRouteValidator — must reject broken maps', () => {
    it('single-path corridor -> SINGLE_PATH', () => {
        const res = validateRouteStructure(straightLineMap());
        expect(res.ok).toBe(false);
        expect(res.issues.some((i) => i.code === 'SINGLE_PATH')).toBe(true);
    });

    it('boss with no parents -> BOSS_UNREACHABLE', () => {
        const res = validateRouteStructure(bossUnreachableMap());
        expect(res.ok).toBe(false);
        expect(res.issues.some((i) => i.code === 'BOSS_UNREACHABLE')).toBe(true);
    });

    it('isolated middle node -> DISCONNECTED', () => {
        const res = validateRouteStructure(isolatedRowMap());
        expect(res.ok).toBe(false);
        expect(res.issues.some((i) => i.code === 'DISCONNECTED')).toBe(true);
    });
});

// ---------- isBossReachable (runtime, v0.4.1 some-parent rule) ----------

describe('isBossReachable — some-parent rule', () => {
    it('false when no parent completed, true when >=1 parent completed', () => {
        const def = NodeRouteGenerator.generate(777, { floorIndex: 0, rows: 6 });
        const parents = def.nodes[def.bossNodeId].parents;
        expect(parents.length).toBeGreaterThanOrEqual(1);

        const empty = { currentNodeId: def.startNodeId, reachableNodeIds: [], completedNodeIds: [def.startNodeId], phase: 'map_select' as const };
        expect(isBossReachable(def, empty)).toBe(false);

        const oneDone = { ...empty, completedNodeIds: [...empty.completedNodeIds, parents[0]] };
        expect(isBossReachable(def, oneDone)).toBe(true);
    });
});

// ---------- NodeRouteState ----------

describe('NodeRouteState — runtime single source of truth', () => {
    it('init: at start, reachable = children of start (>=2 branches)', () => {
        const def = NodeRouteGenerator.generate(555, { floorIndex: 0, rows: 6 });
        const st = new NodeRouteState(def);
        expect(st.state.currentNodeId).toBe(def.startNodeId);
        expect(st.state.reachableNodeIds.length).toBeGreaterThanOrEqual(2);
        expect(st.state.reachableNodeIds).toEqual([...def.nodes[def.startNodeId].children]);
    });

    it('complete a node recomputes reachable (adds its children)', () => {
        const def = NodeRouteGenerator.generate(555, { floorIndex: 0, rows: 6 });
        const st = new NodeRouteState(def);
        const firstReachable = st.state.reachableNodeIds[0];
        st.complete(firstReachable);
        expect(st.state.completedNodeIds).toContain(firstReachable);
        // newly reachable should include children of the completed node
        const expected = st.computeReachable(st.state.completedNodeIds);
        expect(st.state.reachableNodeIds).toEqual(expected);
    });

    it('enter ignores non-reachable nodes (anti-spam)', () => {
        const def = NodeRouteGenerator.generate(555, { floorIndex: 0, rows: 6 });
        const st = new NodeRouteState(def);
        const far = def.bossNodeId; // not reachable at start
        expect(st.isReachable(far)).toBe(false);
        st.enter(far);
        expect(st.state.currentNodeId).toBe(def.startNodeId); // unchanged
        expect(st.state.phase).toBe('map_select');
    });

    it('boss becomes reachable in state after completing a boss parent', () => {
        const def = NodeRouteGenerator.generate(777, { floorIndex: 0, rows: 6 });
        const st = new NodeRouteState(def);
        const parent = def.nodes[def.bossNodeId].parents[0];
        st.complete(parent);
        expect(isBossReachable(def, st.state)).toBe(true);
    });
});

// ---------- RouteNodeTypeAdapter ----------

describe('toLegacyRoomType — mapping (GDD §6.2)', () => {
    it('start -> null (no legacy room)', () => {
        expect(toLegacyRoomType('start')).toBeNull();
    });
    it('combat/elite/boss/treasure/shop/event/upgrade map to Constants.RoomType', () => {
        expect(toLegacyRoomType('combat')).toBe('normal');
        expect(toLegacyRoomType('elite')).toBe('elite');
        expect(toLegacyRoomType('boss')).toBe('boss');
        expect(toLegacyRoomType('treasure')).toBe('treasure');
        expect(toLegacyRoomType('shop')).toBe('shop');
        expect(toLegacyRoomType('event')).toBe('event');
        expect(toLegacyRoomType('upgrade')).toBe('upgrade');
    });
    it('rest -> Rest (legacy Healing also maps here)', () => {
        expect(toLegacyRoomType('rest')).toBe('rest');
    });
});
