// P5: 多层推进 + 断线恢复 + 同种子同图（每日/种子挑战）
// 纯 TS，无 cc 依赖；savePort 用 in-memory mock，避免拉崩 vitest。
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RouteRunController } from '../../assets/scripts/dungeon/route/RouteRunController';
import { eventBus } from '../../assets/scripts/core/EventBus';
import type { RouteRunSnapshot, RouteSavePort, RouteNodeType } from '../../assets/scripts/core/save/RouteSaveTypes';

function makeSavePort(): RouteSavePort & { snapshot: RouteRunSnapshot | null } {
    let snap: RouteRunSnapshot | null = null;
    return {
        saveRoute(s: RouteRunSnapshot): boolean {
            snap = s;
            return true;
        },
        loadRoute(): RouteRunSnapshot | null {
            return snap;
        },
        clearRoute(): void {
            snap = null;
        },
        get snapshot(): RouteRunSnapshot | null {
            return snap;
        },
    };
}

function makeHarness(savePort?: RouteSavePort) {
    const sceneLoader = vi.fn(async () => {});
    const injectContext = vi.fn((_ctx: unknown) => {});
    const ctrl = new RouteRunController({ sceneLoader, injectContext, savePort });
    ctrl.activate();
    return { ctrl, sceneLoader, injectContext, savePort };
}

function emitVictory(ctrl: RouteRunController, nodeId: string, nodeType: RouteNodeType): void {
    eventBus.emit('route:encounter_complete', {
        nodeId,
        nodeType,
        result: 'victory',
        elapsed: 1,
        kills: 1,
    });
}

/** Walk the spine from start to boss: each map_select picks the forward-most reachable node. */
function walkToBoss(ctrl: RouteRunController): void {
    let guard = 0;
    while (guard++ < 200) {
        const rt = ctrl.state.state;
        if (rt.phase === 'floor_cleared' || rt.phase === 'run_settled') break;
        if (rt.phase === 'encounter_running') {
            const id = rt.currentNodeId;
            emitVictory(ctrl, id, ctrl.state.def.nodes[id].type);
            continue;
        }
        // map_select: advance to the reachable node with the greatest row
        const reachable = rt.reachableNodeIds;
        const target = reachable.reduce((best, id) =>
            ctrl.state.def.nodes[id].row > ctrl.state.def.nodes[best].row ? id : best, reachable[0]);
        ctrl.requestEnter(target);
    }
}

describe('P5 · 多层推进', () => {
    it('advanceFloor: floor_cleared -> next floor (map_select, floorIndex+1)', () => {
        const port = makeSavePort();
        const h = makeHarness(port);
        h.ctrl.startFloor({ runId: 'r', zoneId: 'forest', floorIndex: 0, difficulty: 2, runSeed: 777 });
        walkToBoss(h.ctrl);
        expect(h.ctrl.phase).toBe('floor_cleared');

        const ok = h.ctrl.advanceFloor();
        expect(ok).toBe(true);
        expect(h.ctrl.floorIndex).toBe(1);
        expect(h.ctrl.phase).toBe('map_select');
        // new floor starts fresh at the start node
        expect(h.ctrl.state.state.completedNodeIds).toContain(h.ctrl.state.def.startNodeId);
        h.ctrl.deactivate();
    });

    it('advanceFloor: guard — not floor_cleared returns false', () => {
        const h = makeHarness();
        h.ctrl.startFloor({ runId: 'r', zoneId: 'forest', floorIndex: 0, difficulty: 2, runSeed: 777 });
        expect(h.ctrl.phase).toBe('map_select');
        expect(h.ctrl.advanceFloor()).toBe(false);
        // floor unchanged
        expect(h.ctrl.floorIndex).toBe(0);
        h.ctrl.deactivate();
    });

    it('advanceFloor: final floor -> run_settled (no new map)', () => {
        const h = makeHarness();
        h.ctrl.startFloor({ runId: 'r', zoneId: 'forest', floorIndex: 0, difficulty: 2, runSeed: 777 });
        walkToBoss(h.ctrl);
        expect(h.ctrl.phase).toBe('floor_cleared');
        // simulate being on the last floor
        (h.ctrl as unknown as { _floorIndex: number })._floorIndex = h.ctrl.totalFloors - 1;
        expect(h.ctrl.advanceFloor()).toBe(true);
        expect(h.ctrl.phase).toBe('run_settled');
        h.ctrl.deactivate();
    });
});

describe('P5 · 断线恢复', () => {
    it('loadPersisted: mid-run recovery restores exact state', () => {
        const port = makeSavePort();
        const h = makeHarness(port);
        h.ctrl.startFloor({ runId: 'r', zoneId: 'forest', floorIndex: 0, difficulty: 2, runSeed: 777 });
        const firstReach = h.ctrl.state.state.reachableNodeIds[0];
        h.ctrl.requestEnter(firstReach);
        if (h.ctrl.phase === 'encounter_running') {
            emitVictory(h.ctrl, firstReach, h.ctrl.state.def.nodes[firstReach].type);
        }
        const before = h.ctrl.getSnapshot();
        expect(before.runtime.completedNodeIds.length).toBeGreaterThanOrEqual(1);
        h.ctrl.deactivate();

        // a fresh controller, same port -> restore
        const h2 = makeHarness(port);
        expect(h2.ctrl.loadPersisted()).toBe(true);
        const after = h2.ctrl.getSnapshot();
        expect(after.floorIndex).toBe(before.floorIndex);
        expect(after.runtime.phase).toBe(before.runtime.phase);
        expect(after.runtime.currentNodeId).toBe(before.runtime.currentNodeId);
        expect(after.runtime.completedNodeIds).toEqual(before.runtime.completedNodeIds);
        expect(after.routeMap.nodes).toEqual(before.routeMap.nodes);
        expect(after.routeMap.edges).toEqual(before.routeMap.edges);
        expect(after.seedState).toEqual(before.seedState);
        h2.ctrl.deactivate();
    });

    it('loadPersisted: nothing to restore returns false', () => {
        const h = makeHarness(makeSavePort());
        expect(h.ctrl.loadPersisted()).toBe(false);
        h.ctrl.deactivate();
    });

    it('savePort-less controller: no crash on persist, no recovery', () => {
        const h = makeHarness(); // no savePort
        h.ctrl.startFloor({ runId: 'r', zoneId: 'forest', floorIndex: 0, difficulty: 2, runSeed: 777 });
        expect(h.ctrl.getSnapshot().routeMap.startNodeId).toBeTruthy();
        expect(h.ctrl.loadPersisted()).toBe(false);
        h.ctrl.deactivate();
    });
});

describe('P5 · 同种子同图（每日/种子挑战）', () => {
    function genMap(floorIndex: number, runSeed: number): unknown {
        const h = makeHarness();
        const def = h.ctrl.startFloor({ runId: 'r', zoneId: 'forest', floorIndex, difficulty: 2, runSeed });
        const snap = JSON.parse(JSON.stringify(def));
        h.ctrl.deactivate();
        return snap;
    }

    it('same runSeed + floor -> identical map (deterministic)', () => {
        for (const runSeed of [1, 42, 99999]) {
            for (const f of [0, 1, 2]) {
                const a = genMap(f, runSeed);
                const b = genMap(f, runSeed);
                expect(b).toEqual(a);
            }
        }
    });

    it('different runSeed -> different map (not a constant)', () => {
        const a = genMap(0, 111);
        const b = genMap(0, 222);
        expect(JSON.stringify(b)).not.toBe(JSON.stringify(a));
    });

    it('multilayer: same runSeed yields a fixed per-floor sequence', () => {
        // floor 0 and floor 1 maps differ (different floors), but each is reproducible
        const f0a = genMap(0, 555);
        const f0b = genMap(0, 555);
        const f1a = genMap(1, 555);
        const f1b = genMap(1, 555);
        expect(f0b).toEqual(f0a);
        expect(f1b).toEqual(f1a);
        expect(JSON.stringify(f1a)).not.toBe(JSON.stringify(f0a));
    });
});
