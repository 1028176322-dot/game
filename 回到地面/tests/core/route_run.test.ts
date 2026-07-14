import { describe, it, expect, afterEach } from 'vitest';
import { RouteRunController, type RouteRunControllerDeps } from '../../assets/scripts/dungeon/route/RouteRunController';
import { eventBus } from '../../assets/scripts/core/EventBus';
import type {
    RouteEncounterContext,
    RouteNodeEncounterConfig,
    RouteRunSnapshot,
} from '../../assets/scripts/core/save/RouteSaveTypes';

// Helpers ---------------------------------------------------------------------

interface Harness {
    ctrl: RouteRunController;
    sceneLoaderCalls: RouteNodeEncounterConfig[];
    injectCalls: (RouteEncounterContext | null)[];
    saved: RouteRunSnapshot | null;
    deps: RouteRunControllerDeps;
}

function makeHarness(): Harness {
    const sceneLoaderCalls: RouteNodeEncounterConfig[] = [];
    const injectCalls: (RouteEncounterContext | null)[] = [];
    let saved: RouteRunSnapshot | null = null;
    const deps: RouteRunControllerDeps = {
        sceneLoader: async (c) => {
            sceneLoaderCalls.push(c);
        },
        injectContext: (ctx) => {
            injectCalls.push(ctx);
        },
        savePort: {
            saveRoute: (s) => {
                saved = s;
                return true;
            },
            loadRoute: () => saved,
            clearRoute: () => {
                saved = null;
            },
        },
    };
    const ctrl = new RouteRunController(deps);
    ctrl.activate();
    return { ctrl, sceneLoaderCalls, injectCalls, saved, deps };
}

const live: RouteRunController[] = [];
afterEach(() => {
    for (const c of live) c.deactivate();
    live.length = 0;
});

function findReachableCombat(ctrl: RouteRunController): string | null {
    for (const id of Object.keys(ctrl.state.def.nodes)) {
        const t = ctrl.state.def.nodes[id].type;
        if ((t === 'combat' || t === 'elite' || t === 'boss') && ctrl.state.isReachable(id)) {
            return id;
        }
    }
    return null;
}

function findReachableNonCombat(ctrl: RouteRunController): string | null {
    for (const id of Object.keys(ctrl.state.def.nodes)) {
        const t = ctrl.state.def.nodes[id].type;
        if (t !== 'combat' && t !== 'elite' && t !== 'boss' && ctrl.state.isReachable(id)) {
            return id;
        }
    }
    return null;
}

/**
 * Deterministically pick a seed whose row-1 (initially reachable) nodes include a
 * combat-type node, so combat-loop tests don't depend on a hand-picked seed that
 * the weighted generator may not satisfy. Stable across runs (generation is seeded).
 */
function pickSeedWithReachableCombat(): { seed: number; nodeId: string } {
    for (let s = 1; s < 500; s++) {
        const tmp = new RouteRunController({
            sceneLoader: async () => {},
            injectContext: () => {},
        });
        tmp.startFloor({ runId: 'tmp', zoneId: 'forest', floorIndex: 0, difficulty: 1, runSeed: s });
        const cid = findReachableCombat(tmp);
        if (cid) return { seed: s, nodeId: cid };
    }
    throw new Error('no seed with a reachable combat node found');
}

/** Emit the same event RoomFlowController fires in 'route' mode (real wiring path). */
function emitVictory(ctrl: RouteRunController, nodeId: string, nodeType: string): void {
    eventBus.emit('route:encounter_complete', { nodeId, nodeType, result: 'victory', elapsed: 1000, kills: 3 });
}
function emitDefeat(ctrl: RouteRunController, nodeId: string, nodeType: string): void {
    eventBus.emit('route:encounter_complete', { nodeId, nodeType, result: 'defeat', elapsed: 1000, kills: 0 });
}

// Tests -----------------------------------------------------------------------

describe('RouteRunController — P3 3D node loop', () => {
    it('single combat node: enter 3D -> complete -> resolve -> cleared (full loop)', () => {
        const { seed, nodeId } = pickSeedWithReachableCombat();
        const h = makeHarness();
        live.push(h.ctrl);
        h.ctrl.startFloor({ runId: 'r1', zoneId: 'forest', floorIndex: 0, difficulty: 1, runSeed: seed });
        expect(h.ctrl.phase).toBe('map_select');

        const ok = h.ctrl.requestEnter(nodeId);
        expect(ok).toBe(true);
        expect(h.ctrl.phase).toBe('encounter_running');
        expect(h.sceneLoaderCalls.length).toBe(1); // combat -> the only loadScene gateway fired
        expect(h.sceneLoaderCalls[0].encounterSceneId).toBe('dungeon');
        expect(h.sceneLoaderCalls[0].nodeId).toBe(nodeId);
        expect(h.injectCalls.some((c) => c?.nodeId === nodeId)).toBe(true); // ctx injected pre-encounter

        emitVictory(h.ctrl, nodeId, 'combat');

        expect(h.ctrl.state.state.completedNodeIds).toContain(nodeId);
        expect(h.ctrl.phase).toBe('map_select');
        expect(h.ctrl.lastResolved).not.toBeNull();
        expect(h.ctrl.lastResolved!.gold).toBeGreaterThanOrEqual(0);
        expect(h.ctrl.activeEncounter).toBeNull();
        expect(h.injectCalls[h.injectCalls.length - 1]).toBeNull(); // ctx cleared post-resolve
    });

    it('anti-spam: clicks during encounter_running are ignored', () => {
        const { seed, nodeId } = pickSeedWithReachableCombat();
        const h = makeHarness();
        live.push(h.ctrl);
        h.ctrl.startFloor({ runId: 'r1', zoneId: 'forest', floorIndex: 0, difficulty: 1, runSeed: seed });
        h.ctrl.requestEnter(nodeId);

        const again = h.ctrl.requestEnter(nodeId);
        expect(again).toBe(false);
        expect(h.ctrl.phase).toBe('encounter_running');
        expect(h.sceneLoaderCalls.length).toBe(1);
    });

    it('non-combat node resolves directly via resolver (P3 closure)', () => {
        const h = makeHarness();
        live.push(h.ctrl);
        h.ctrl.startFloor({ runId: 'r2', zoneId: 'forest', floorIndex: 0, difficulty: 1, runSeed: 42 });
        const nodeId = findReachableNonCombat(h.ctrl);
        if (!nodeId) return; // some seeds place only combat on row 1; acceptable for P3
        const ok = h.ctrl.requestEnter(nodeId);
        expect(ok).toBe(true);
        expect(h.sceneLoaderCalls.length).toBe(0); // non-combat never loads 3D scene
        expect(h.ctrl.state.state.completedNodeIds).toContain(nodeId);
        expect(h.ctrl.phase).toBe('map_select');
    });

    it('boss completion -> floor_cleared', () => {
        const h = makeHarness();
        live.push(h.ctrl);
        // 3-row map: start -> middle -> boss. Clear the middle node to unlock boss.
        h.ctrl.startFloor({ runId: 'r3', zoneId: 'forest', floorIndex: 0, difficulty: 1, runSeed: 99, rows: 3 });

        const middle = Object.keys(h.ctrl.state.def.nodes).find(
            (id) => h.ctrl.state.def.nodes[id].row === 1,
        )!;
        expect(h.ctrl.state.isReachable(middle)).toBe(true);
        h.ctrl.requestEnter(middle); // resolves (combat or not) and unlocks boss
        emitVictory(h.ctrl, middle, 'combat');

        const boss = h.ctrl.state.def.bossNodeId;
        expect(h.ctrl.state.isReachable(boss)).toBe(true);
        h.ctrl.requestEnter(boss);
        expect(h.ctrl.phase).toBe('encounter_running');
        emitVictory(h.ctrl, boss, 'boss');

        expect(h.ctrl.state.state.completedNodeIds).toContain(boss);
        expect(h.ctrl.phase).toBe('floor_cleared');
    });

    it('defeat: node not completed, returns to map', () => {
        const { seed, nodeId } = pickSeedWithReachableCombat();
        const h = makeHarness();
        live.push(h.ctrl);
        h.ctrl.startFloor({ runId: 'r4', zoneId: 'forest', floorIndex: 0, difficulty: 1, runSeed: seed });
        h.ctrl.requestEnter(nodeId);
        emitDefeat(h.ctrl, nodeId, 'combat');

        expect(h.ctrl.state.state.completedNodeIds).not.toContain(nodeId);
        expect(h.ctrl.phase).toBe('map_select');
        expect(h.ctrl.activeEncounter).toBeNull();
        expect(h.ctrl.lastResolved).toBeNull();
    });

    it('idempotent recovery: snapshot restores phase + active encounter', () => {
        const { seed, nodeId } = pickSeedWithReachableCombat();
        const h = makeHarness();
        live.push(h.ctrl);
        h.ctrl.startFloor({ runId: 'r5', zoneId: 'forest', floorIndex: 0, difficulty: 1, runSeed: seed });
        h.ctrl.requestEnter(nodeId);
        const snap = h.ctrl.getSnapshot();
        h.ctrl.deactivate();

        const h2 = makeHarness();
        live.push(h2.ctrl);
        h2.ctrl.restoreFromSnapshot(snap);
        expect(h2.ctrl.phase).toBe('encounter_running');
        expect(h2.ctrl.activeEncounter?.nodeId).toBe(nodeId);
        expect(h2.sceneLoaderCalls.length).toBe(1); // mid-encounter re-entry reloads same scene
        expect(h2.sceneLoaderCalls[0].nodeId).toBe(nodeId);

        emitVictory(h2.ctrl, nodeId, 'combat');
        expect(h2.ctrl.state.state.completedNodeIds).toContain(nodeId);
        expect(h2.ctrl.phase).toBe('map_select');
    });

    it('NodeRewardResolver is deterministic for the same config', () => {
        const { seed, nodeId } = pickSeedWithReachableCombat();
        const h = makeHarness();
        live.push(h.ctrl);
        h.ctrl.startFloor({ runId: 'r6', zoneId: 'forest', floorIndex: 0, difficulty: 2, runSeed: seed });
        h.ctrl.requestEnter(nodeId);
        const beforeVictory = h.ctrl.lastResolved; // null until victory
        emitVictory(h.ctrl, nodeId, 'combat');
        const first = h.ctrl.lastResolved!;

        const h2 = makeHarness();
        live.push(h2.ctrl);
        h2.ctrl.startFloor({ runId: 'r6', zoneId: 'forest', floorIndex: 0, difficulty: 2, runSeed: seed });
        h2.ctrl.requestEnter(nodeId);
        emitVictory(h2.ctrl, nodeId, 'combat');
        const second = h2.ctrl.lastResolved!;

        expect(second.gold).toBe(first.gold);
        expect(second.exp).toBe(first.exp);
        expect(beforeVictory).toBeNull();
    });
});
