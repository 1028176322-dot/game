// assets/scripts/dungeon/SingleRoomEncounterBuilder.ts
// Builds a SINGLE room layout for one route-node encounter. It wraps
// DungeonGenerator's RoomLayout type but does NOT call
// DungeonGenerator.generate({ roomCount: 1 }) — that clamp()s roomCount to [3,12]
// (DungeonGenerator.ts:54) and is a multi-room graph generator, the wrong tool for
// a single node (GDD v0.4.4 §8.1).
//
// v0.4.3: EncounterRoomLayoutType aliases DungeonGenerator.RoomType so the union
// stays in sync if DungeonGenerator.RoomType changes.

import { Rng } from '../core/rng/Rng';
import type { RoomType as EncounterRoomLayoutType, RoomLayout } from './DungeonGenerator';

export interface SingleRoomEncounterOptions {
    roomId: string;
    layoutType: EncounterRoomLayoutType;   // drives RoomLayout.type (== DungeonGenerator.RoomType)
    zone: string;
    seed: number;
    minSize?: number;                       // default 7
    maxSize?: number;                       // default 11
}

// Local odd-size helper (mirrors DungeonGenerator.oddSize) so we do not touch
// DungeonGenerator's module-private helper and keep its multi-room contract intact.
function oddSize(rng: Rng, min: number, max: number): number {
    const v = rng.int(min, max);
    return v % 2 === 0 ? v + 1 : v; // odd so a room has a single center tile
}

export class SingleRoomEncounterBuilder {
    build(opts: SingleRoomEncounterOptions): RoomLayout {
        const rng = new Rng(opts.seed);
        return {
            id: opts.roomId,
            type: opts.layoutType,          // EncounterRoomLayoutType -> RoomLayout.type OK
            gridX: 0,
            gridY: 0,
            width: oddSize(rng, opts.minSize ?? 7, opts.maxSize ?? 11),
            height: oddSize(rng, opts.minSize ?? 7, opts.maxSize ?? 11),
            connections: [],
        };
    }
}
