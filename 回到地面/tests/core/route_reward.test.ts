// Unit tests for NodeRewardResolver — P4 full per-node-type resolution.
// Pure logic, no Cocos. Deterministic (deriveSeed + Rng).

import { describe, it, expect } from 'vitest';
import { NodeRewardResolver } from '../../assets/scripts/dungeon/route/NodeRewardResolver';
import { deriveSeed } from '../../assets/scripts/dungeon/route/RouteSeed';
import type {
    RouteNodeEncounterConfig,
    RouteNodeType,
} from '../../assets/scripts/core/save/RouteSaveTypes';

function makeConfig(
    nodeType: RouteNodeType,
    viewType: RouteNodeEncounterConfig['encounterViewType'],
    seedSalt: number,
    difficulty = 3,
): RouteNodeEncounterConfig {
    return {
        runId: 'r',
        floorIndex: 0,
        nodeId: `n_${nodeType}`,
        nodeType,
        zoneId: 'forest',
        difficulty,
        seed: deriveSeed(seedSalt, `enc:${nodeType}`),
        encounterSceneId: 'dungeon',
        encounterViewType: viewType,
        rewardProfileId: nodeType, // [PLACEHOLDER] salt; deterministic
    };
}

const resolver = new NodeRewardResolver();
const victory = { result: 'victory' as const, elapsed: 1000, kills: 5 };

describe('P4 NodeRewardResolver per-type semantics', () => {
    it('combat: positive gold + exp, no heal', () => {
        const r = resolver.resolve(makeConfig('combat', 'combat', 11), victory);
        expect(r.gold).toBeGreaterThan(0);
        expect(r.exp).toBeGreaterThan(0);
        expect(r.heal).toBe(0);
        expect(r.items).toHaveLength(0);
    });

    it('elite: ~2x combat gold, items empty', () => {
        // same seed + same rewardProfileId (salt) as combat -> identical variance ->
        // the elite multiplier is exactly 2x. (In production rewardProfileId = nodeType,
        // so elite has its own variance; this is an isolated multiplier check.)
        const combatCfg = makeConfig('combat', 'combat', 11);
        const combat = resolver.resolve(combatCfg, victory);
        const elite = resolver.resolve({ ...combatCfg, nodeType: 'elite', encounterViewType: 'elite' }, victory);
        expect(elite.gold).toBe(combat.gold * 2);
        expect(elite.exp).toBe(combat.exp * 2);
        expect(elite.items).toHaveLength(0);
        expect(elite.effect).toBe('elite');
    });

    it('boss: ~4x gold, ~3x exp, grants boss_token', () => {
        const combatCfg = makeConfig('combat', 'combat', 11);
        const combat = resolver.resolve(combatCfg, victory);
        const boss = resolver.resolve({ ...combatCfg, nodeType: 'boss', encounterViewType: 'boss' }, victory);
        expect(boss.gold).toBe(combat.gold * 4);
        expect(boss.exp).toBe(combat.exp * 3);
        expect(boss.items).toContain('boss_token');
        expect(boss.effect).toBe('boss');
    });

    it('treasure: pure gold (no exp), generous', () => {
        const t = resolver.resolve(makeConfig('treasure', 'treasure', 7), victory);
        expect(t.gold).toBeGreaterThan(0);
        expect(t.exp).toBe(0);
        expect(t.heal).toBe(0);
        expect(t.effect).toBe('treasure');
    });

    it('rest: heal only, no currency', () => {
        const r = resolver.resolve(makeConfig('rest', 'rest', 5), victory);
        expect(r.heal).toBeGreaterThan(0);
        expect(r.gold).toBe(0);
        expect(r.exp).toBe(0);
        expect(r.effect).toBe('rest');
    });

    it('event: deterministic 4-way effect, all branches reachable', () => {
        const effects = new Set<string>();
        // sweep many seeds; rng.int(0,3) must hit all four branches
        for (let s = 1; s <= 40; s++) {
            const r = resolver.resolve(makeConfig('event', 'event', s), victory);
            effects.add(r.effect);
        }
        expect(effects.size).toBe(4);
        expect(effects).toEqual(new Set(['event_gold', 'event_heal', 'event_item', 'event_curse']));

        // determinism: same seed -> same effect + same numbers
        const a = resolver.resolve(makeConfig('event', 'event', 23), victory);
        const b = resolver.resolve(makeConfig('event', 'event', 23), victory);
        expect(a).toEqual(b);
    });

    it('shop: no auto-reward (real trade UI wired later), marked visited', () => {
        const s = resolver.resolve(makeConfig('shop', 'shop', 3), victory);
        expect(s.gold).toBe(0);
        expect(s.exp).toBe(0);
        expect(s.heal).toBe(0);
        expect(s.items).toHaveLength(0);
        expect(s.effect).toBe('shop');
    });

    it('upgrade: grants upgrade_token, small exp, no gold', () => {
        const u = resolver.resolve(makeConfig('upgrade', 'upgrade', 9), victory);
        expect(u.items).toContain('upgrade_token');
        expect(u.exp).toBeGreaterThan(0);
        expect(u.gold).toBe(0);
        expect(u.effect).toBe('upgrade');
    });

    it('defeat: zero reward across all types', () => {
        const types: Array<[RouteNodeType, RouteNodeEncounterConfig['encounterViewType']]> = [
            ['combat', 'combat'], ['elite', 'elite'], ['boss', 'boss'],
            ['treasure', 'treasure'], ['rest', 'rest'], ['event', 'event'],
            ['shop', 'shop'], ['upgrade', 'upgrade'],
        ];
        for (const [nt, vt] of types) {
            const r = resolver.resolve(makeConfig(nt, vt, 42), { result: 'defeat', elapsed: 0, kills: 0 });
            expect(r.gold).toBe(0);
            expect(r.exp).toBe(0);
            expect(r.heal).toBe(0);
            expect(r.items).toHaveLength(0);
        }
    });

    it('determinism: same config + outcome -> identical reward for every type', () => {
        const types: Array<[RouteNodeType, RouteNodeEncounterConfig['encounterViewType']]> = [
            ['combat', 'combat'], ['elite', 'elite'], ['boss', 'boss'],
            ['treasure', 'treasure'], ['rest', 'rest'], ['event', 'event'],
            ['shop', 'shop'], ['upgrade', 'upgrade'],
        ];
        for (const [nt, vt] of types) {
            const cfg = makeConfig(nt, vt, 777);
            const a = resolver.resolve(cfg, victory);
            const b = resolver.resolve(cfg, victory);
            expect(a).toEqual(b);
        }
    });

    it('preview mirrors resolve(victory) (no bait-and-switch)', () => {
        const cfg = makeConfig('boss', 'boss', 555);
        expect(resolver.preview(cfg)).toEqual(resolver.resolve(cfg, victory));
    });
});
