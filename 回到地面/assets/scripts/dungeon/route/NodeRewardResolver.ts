// assets/scripts/dungeon/route/NodeRewardResolver.ts
//
// Node unified reward resolution (GDD v0.4.4 §9.3). The SINGLE grant point for
// node rewards — RoomFlowController's 'route' mode must NOT grant (anti-double-award,
// GDD §9.1). Pure logic, deterministic (seeded via deriveSeed -> Rng), no Cocos.
//
// P4 (2026-07-13): full per-node-type resolution. Previously only elite/boss had a
// multiplier; combat/treasure/rest/event/shop/upgrade now each resolve with their own
// semantics. Deterministic: same config + outcome -> identical reward (event rng is
// seeded from the encounter seed, so recovery in P5 reproduces the exact reward).
//
// Path note: from dungeon/route/, `../../` reaches assets/scripts/.
//   ../../core/rng/Rng          -> assets/scripts/core/rng/Rng
//   ./RouteSeed                 -> same-folder deriveSeed (FNV-1a hex -> uint32)
//
// Authoritative spec: GDD v0.4.4 §8.3 / §9.3 / §10.1.

import { Rng } from '../../core/rng/Rng';
import type { RouteNodeEncounterConfig } from '../../core/save/RouteSaveTypes';
import { deriveSeed } from './RouteSeed';

export interface EncounterOutcome {
    result: 'victory' | 'defeat';
    elapsed: number;
    kills: number;
}

export interface ResolvedReward {
    gold: number;
    exp: number;
    /** Upgrade / event tokens granted (wire to content tables in P4/P5). */
    items: string[];
    /** Rest node: HP recovered (applied to RunSave.player.hp on settle). May be
     *  negative for an event curse (e.g. -10). */
    heal: number;
    /** Human-readable effect tag for the UI (e.g. 'rest' | 'event_curse' | 'shop'). */
    effect: string;
    profileId: string;
}

export class NodeRewardResolver {
    /**
     * Resolve the reward for a completed node encounter.
     * @param config the encounter config produced by RouteRunController.
     * @param outcome combat result (victory/defeat), elapsed ms, kill count.
     * @returns deterministic reward (same config + outcome -> identical reward).
     */
    resolve(config: RouteNodeEncounterConfig, outcome: EncounterOutcome): ResolvedReward {
        // Reward seed is derived from the encounter seed so recovery (P5) reproduces
        // the exact same reward for the same node — deterministic, no Math.random.
        const rewardSeed = deriveSeed(config.seed, `reward:${config.rewardProfileId}`);
        const rng = new Rng(rewardSeed);

        // [PLACEHOLDER] tuning rationale (playtest before shipping):
        //   base gold/exp scale with difficulty so deeper floors feel rewarding;
        //   the small rng band is a variable reward schedule (GDD advanced econ) to
        //   keep opening nodes engaging.
        const baseGold = 10 + config.difficulty * 5;
        const baseExp = 5 + config.difficulty * 2;
        const variance = rng.int(0, config.difficulty * 3); // [0, difficulty*3]

        // Defeat grants nothing (placeholder: partial/consolation later).
        if (outcome.result === 'defeat') {
            return { gold: 0, exp: 0, items: [], heal: 0, effect: '', profileId: config.rewardProfileId };
        }

        // Per-node-type resolution (GDD §8.3 encounterViewType semantics).
        switch (config.encounterViewType) {
            case 'combat':
                return {
                    gold: baseGold + variance,
                    exp: baseExp,
                    items: [],
                    heal: 0,
                    effect: '',
                    profileId: config.rewardProfileId,
                };

            case 'elite': // same combat base, richer payout (GDD §8.3)
                return {
                    gold: (baseGold + variance) * 2,
                    exp: baseExp * 2,
                    items: [],
                    heal: 0,
                    effect: 'elite',
                    profileId: config.rewardProfileId,
                };

            case 'boss': // boss: biggest payout (GDD §8.3)
                return {
                    gold: (baseGold + variance) * 4,
                    exp: baseExp * 3,
                    items: ['boss_token'],
                    heal: 0,
                    effect: 'boss',
                    profileId: config.rewardProfileId,
                };

            case 'treasure': // pure gold, generous, no exp
                return {
                    gold: (baseGold + variance) * 3,
                    exp: 0,
                    items: [],
                    heal: 0,
                    effect: 'treasure',
                    profileId: config.rewardProfileId,
                };

            case 'rest': // heal only, no currency
                return {
                    gold: 0,
                    exp: 0,
                    items: [],
                    heal: 30 + config.difficulty * 5 + rng.int(0, config.difficulty * 2),
                    effect: 'rest',
                    profileId: config.rewardProfileId,
                };

            case 'event': {
                // Deterministic 4-way event (seeded, so identical on replay/recovery).
                const roll = rng.int(0, 3); // [0, 3]
                if (roll === 0) {
                    return { gold: baseGold * 2, exp: 0, items: [], heal: 0, effect: 'event_gold', profileId: config.rewardProfileId };
                }
                if (roll === 1) {
                    return { gold: 0, exp: 0, items: [], heal: 20 + config.difficulty * 3, effect: 'event_heal', profileId: config.rewardProfileId };
                }
                if (roll === 2) {
                    return { gold: 0, exp: 0, items: ['event_token'], heal: 0, effect: 'event_item', profileId: config.rewardProfileId };
                }
                // roll === 3: minor curse (negative heal, halved gold)
                return { gold: Math.floor(baseGold / 2), exp: 0, items: [], heal: -10, effect: 'event_curse', profileId: config.rewardProfileId };
            }

            case 'shop':
                // No auto-reward: the real trade UI is wired in a later UI phase
                // (ui/** is out of Demo7 scope). The node still resolves (marked
                // visited) so map flow advances. effect='shop' lets the UI show a
                // storefront on entry.
                return { gold: 0, exp: 0, items: [], heal: 0, effect: 'shop', profileId: config.rewardProfileId };

            case 'upgrade': // grants an upgrade token; small exp, no gold
                return {
                    gold: 0,
                    exp: baseExp,
                    items: ['upgrade_token'],
                    heal: 0,
                    effect: 'upgrade',
                    profileId: config.rewardProfileId,
                };

            default:
                return { gold: baseGold + variance, exp: baseExp, items: [], heal: 0, effect: '', profileId: config.rewardProfileId };
        }
    }

    /** Map preview shown on the node BEFORE entering. Mirrors resolve() (no bait-and-switch). */
    preview(config: RouteNodeEncounterConfig): ResolvedReward {
        return this.resolve(config, { result: 'victory', elapsed: 0, kills: 0 });
    }
}
