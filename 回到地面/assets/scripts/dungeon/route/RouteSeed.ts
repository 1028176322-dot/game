// assets/scripts/dungeon/route/RouteSeed.ts
// Deterministic seed derivation. ReplayRecorder.computeConfigHash returns a hex
// string (FNV-1a); Rng needs a number, so deriveSeed() converts it to uint32.
//
// Path note: from dungeon/route/, `../../` reaches assets/scripts/ (two levels up).
//   ../../replay/ReplayRecorder  -> assets/scripts/replay/ReplayRecorder
//   ../../core/rng/Rng           -> assets/scripts/core/rng/Rng
//
// Authoritative spec: docs/地牢重做_节点路线图肉鸽_设计v0.4.4.md §10.1.

import { computeConfigHash } from '../../replay/ReplayRecorder';

// hex string -> uint32 number seed (deterministic: same input + salt -> same number)
export function deriveSeed(input: unknown, salt: string): number {
    const hex = computeConfigHash({ input, salt });
    return parseInt(hex, 16) >>> 0;
}

// Seed chain (all numeric, fed into Rng). Mirrors GDD v0.4.4 §10.1.
export interface RouteSeedChain {
    runSeed: number;
    floorSeed: number;
    routeSeed: number;
    nodeSeed: number;
    rewardSeed: number;
    encounterSeed: number;
}

export function buildSeedChain(userSeed: number, floorIndex: number, nodeId: string): RouteSeedChain {
    const runSeed = userSeed;
    const floorSeed = deriveSeed(runSeed, `f${floorIndex}`);
    const routeSeed = deriveSeed(floorSeed, 'route');   // NodeRouteMapDefinition.seed
    const nodeSeed = deriveSeed(floorSeed, nodeId);
    const rewardSeed = deriveSeed(nodeSeed, 'reward');
    const encounterSeed = deriveSeed(nodeSeed, 'encounter'); // -> config.seed
    return { runSeed, floorSeed, routeSeed, nodeSeed, rewardSeed, encounterSeed };
}
