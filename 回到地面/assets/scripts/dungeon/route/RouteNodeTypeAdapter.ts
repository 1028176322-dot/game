// assets/scripts/dungeon/route/RouteNodeTypeAdapter.ts
//
// Bridge between the new routing-layer type (RouteNodeType) and the legacy
// room type (Constants.RoomType). `start` has no legacy room -> returns null.
//
// Path note: from dungeon/route/, `../../` reaches assets/scripts/.
//   ../../core/Constants        -> assets/scripts/core/Constants
//   ../../core/save/RouteSaveTypes -> assets/scripts/core/save/RouteSaveTypes
//
// Authoritative spec: GDD v0.4.4 §6.2.

import { RoomType as ConstantsRoomType } from '../../core/Constants';
import type { RouteNodeType } from '../../core/save/RouteSaveTypes';

/**
 * Map a routing node type to the legacy Constants.RoomType.
 * `start` returns null (no room event for the entry node).
 */
export function toLegacyRoomType(type: RouteNodeType): ConstantsRoomType | null {
    switch (type) {
        case 'start': return null;                 // no room event for start node
        case 'combat': return ConstantsRoomType.Normal;
        case 'elite': return ConstantsRoomType.Elite;
        case 'boss': return ConstantsRoomType.Boss;
        case 'treasure': return ConstantsRoomType.Treasure;
        case 'shop': return ConstantsRoomType.Shop;
        case 'event': return ConstantsRoomType.Event;
        case 'upgrade': return ConstantsRoomType.Upgrade;
        case 'rest': return ConstantsRoomType.Rest; // legacy Healing also maps here
        default: return null;
    }
}

/**
 * Map a legacy Constants.RoomType back to a routing node type.
 * `Healing` and `Rest` both collapse to `rest`; null -> `start`.
 */
export function fromLegacyRoomType(rt: ConstantsRoomType | null): RouteNodeType {
    if (rt === null) return 'start';
    switch (rt) {
        case ConstantsRoomType.Normal: return 'combat';
        case ConstantsRoomType.Elite: return 'elite';
        case ConstantsRoomType.Boss: return 'boss';
        case ConstantsRoomType.Treasure: return 'treasure';
        case ConstantsRoomType.Shop: return 'shop';
        case ConstantsRoomType.Event: return 'event';
        case ConstantsRoomType.Upgrade: return 'upgrade';
        case ConstantsRoomType.Healing:
        case ConstantsRoomType.Rest: return 'rest';
        default: return 'combat';
    }
}
