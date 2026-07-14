// tests/core/route_view.test.ts
//
// P2 (map UI) unit tests — RouteMapViewState derivation + click-to-enter contract.
// Pure TS, no Cocos. Mirrors tests/core/route.test.ts conventions.

import { describe, it, expect } from 'vitest';
import { NodeRouteGenerator } from '../../assets/scripts/dungeon/route/NodeRouteGenerator';
import { NodeRouteState } from '../../assets/scripts/dungeon/route/NodeRouteState';
import { RouteMapViewState } from '../../assets/scripts/dungeon/route/RouteMapViewState';
import {
    NODE_HIT_AREA_PX,
    NODE_SPACING_X,
    NODE_SPACING_Y,
} from '../../assets/scripts/dungeon/route/RouteMapViewState';
import { getNodeViewState } from '../../assets/scripts/core/save/RouteSaveTypes';

const SEED = 0x1234abcd;
const makeState = () => {
    const def = NodeRouteGenerator.generate(SEED, { floorIndex: 0, rows: 4 });
    const state = new NodeRouteState(def);
    const view = new RouteMapViewState(state);
    return { def, state, view };
};

describe('getNodeViewState (GDD §3.3)', () => {
    it('derives current > completed > reachable > locked', () => {
        const { def, state } = makeState();
        const start = def.startNodeId;
        const child = def.nodes[start].children[0];
        const boss = def.bossNodeId;

        expect(getNodeViewState(start, state.state)).toBe('current');
        expect(getNodeViewState(child, state.state)).toBe('reachable');
        // boss is not a child of start in a 4-row map -> locked
        expect(getNodeViewState(boss, state.state)).toBe('locked');
    });

    it('returns locked for an unknown node id', () => {
        const { state } = makeState();
        expect(getNodeViewState('__nope__', state.state)).toBe('locked');
    });
});

describe('RouteMapViewState.getAllViewStates', () => {
    it('covers every node with a valid view state', () => {
        const { def, view } = makeState();
        const all = view.getAllViewStates();
        expect(Object.keys(all).length).toBe(Object.keys(def.nodes).length);
        for (const v of Object.values(all)) {
            expect(['current', 'completed', 'reachable', 'locked']).toContain(v);
        }
    });
});

describe('RouteMapViewState.isClickable (anti-spam, GDD §5)', () => {
    it('start is not clickable (it is current)', () => {
        const { def, view } = makeState();
        expect(view.isClickable(def.startNodeId)).toBe(false);
    });

    it('a reachable child of start IS clickable', () => {
        const { def, view } = makeState();
        const child = def.nodes[def.startNodeId].children[0];
        expect(view.isClickable(child)).toBe(true);
    });

    it('a locked node is not clickable', () => {
        const { def, view } = makeState();
        expect(view.isClickable(def.bossNodeId)).toBe(false);
    });

    it('blocks clicks while phase != map_select (wrong_phase)', () => {
        const { def, state, view } = makeState();
        const child = def.nodes[def.startNodeId].children[0];
        expect(view.isClickable(child)).toBe(true);
        state.applyPhase('node_entering');
        expect(view.isClickable(child)).toBe(false);
    });
});

describe('RouteMapViewState.tryRequestEnter (click -> encounter request)', () => {
    it('builds RouteEncounterContext and calls handler on a valid click', () => {
        const { def, view } = makeState();
        const child = def.nodes[def.startNodeId].children[0];
        const expectedType = def.nodes[child].type;
        let captured: { nodeId: string; nodeType: string; startedAt: number } | null = null;

        const res = view.tryRequestEnter(child, (ctx) => {
            captured = ctx;
        });

        expect(res.ok).toBe(true);
        expect(res.reason).toBeUndefined();
        expect(res.context?.nodeId).toBe(child);
        expect(res.context?.nodeType).toBe(expectedType);
        expect(typeof res.context?.startedAt).toBe('number');
        expect(captured?.nodeId).toBe(child);
        expect(captured?.nodeType).toBe(expectedType);
    });

    it('rejects a locked node with reason not_reachable', () => {
        const { def, view } = makeState();
        const res = view.tryRequestEnter(def.bossNodeId);
        expect(res.ok).toBe(false);
        expect(res.reason).toBe('not_reachable');
        expect(res.context).toBeUndefined();
    });

    it('does not call handler on a rejected click', () => {
        const { def, view } = makeState();
        let called = false;
        const res = view.tryRequestEnter(def.bossNodeId, () => {
            called = true;
        });
        expect(res.ok).toBe(false);
        expect(called).toBe(false);
    });
});

describe('RouteMapViewState.getMapLayout (GDD §7 data for 2D overlay)', () => {
    it('emits a positioned, row-major layout for every node', () => {
        const { def, view } = makeState();
        const layout = view.getMapLayout();
        expect(layout.length).toBe(Object.keys(def.nodes).length);

        const byId = new Map(layout.map((n) => [n.id, n]));
        for (const id of Object.keys(def.nodes)) {
            const node = byId.get(id)!;
            expect(typeof node.x).toBe('number');
            expect(typeof node.y).toBe('number');
            expect(['current', 'completed', 'reachable', 'locked']).toContain(node.viewState);
            // boss flagged correctly
            expect(node.isBoss).toBe(id === def.bossNodeId);
        }
        // row-major order: first node is the start (row 0), last is boss (last row)
        expect(layout[0].row).toBe(0);
        expect(layout[layout.length - 1].row).toBe(def.rows - 1);
    });

    it('positions nodes by row/col with spacing >= hit area', () => {
        const { view } = makeState();
        const layout = view.getMapLayout();
        // §7: spacing must leave room around the >=72px hit area
        expect(NODE_SPACING_X).toBeGreaterThanOrEqual(NODE_HIT_AREA_PX);
        expect(NODE_SPACING_Y).toBeGreaterThanOrEqual(NODE_HIT_AREA_PX);
        // adjacent columns differ by exactly the horizontal spacing
        const a = layout[0];
        const sameRow = layout.find((n) => n.row === a.row && n.col === a.col + 1);
        if (sameRow) {
            expect(sameRow.x - a.x).toBe(NODE_SPACING_X);
        }
    });
});
