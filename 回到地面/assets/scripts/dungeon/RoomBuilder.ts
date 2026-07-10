// RoomBuilder.ts — turns a RoomLayout into concrete room data (§3.7). Pure TS, NO `cc`.
//
// Design:
//  - Single responsibility: instantiate module pieces (floor / wall / decoration) and
//    build the room's TileMap. Produces plain `RoomData`; it does NOT own lifecycle
//    (that is RoomRuntime) and does NOT do pathfinding (NavigationGrid).
//  - Deterministic layout: border ring is wall, interior is floor. Decorations are
//    placed at fixed deterministic anchors (no Math.random) so replays are identical.
//  - `assetIds` lists the assets a RoomRuntime must load/release via IAssetCache (§3.6).
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.7 (RoomBuilder = 按布局实例化模块件, 产出房间数据).

import type { RoomLayout, RoomType } from './DungeonGenerator';
import { TileMap } from './TileMap';

export type PieceKind = 'floor' | 'wall' | 'decoration';

export interface ModulePiece {
  kind: PieceKind;
  assetId: string;
  x: number;
  y: number;
}

export interface RoomData {
  roomId: string;
  type: RoomType;
  tileMap: TileMap;
  pieces: ModulePiece[];
  /** distinct asset ids the room needs at runtime (load/release via AssetCache) */
  assetIds: string[];
}

export class RoomBuilder {
  readonly name = 'RoomBuilder';

  build(layout: RoomLayout): RoomData {
    const { width, height } = layout;
    const tileMap = new TileMap(width, height, 'floor');
    const pieces: ModulePiece[] = [];
    const assetSet = new Set<string>();

    const floorAsset = `tile/${layoutZone(layout.type)}/floor`;
    const wallAsset = `tile/${layoutZone(layout.type)}/wall`;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const isBorder = x === 0 || y === 0 || x === width - 1 || y === height - 1;
        if (isBorder) {
          tileMap.setKind(x, y, 'wall');
          pieces.push({ kind: 'wall', assetId: wallAsset, x, y });
          assetSet.add(wallAsset);
        } else {
          // floor stays 'floor'
          pieces.push({ kind: 'floor', assetId: floorAsset, x, y });
          assetSet.add(floorAsset);
        }
      }
    }

    // Deterministic decoration at the room center for elite/boss/reward rooms.
    if (layout.type !== 'start' && width >= 3 && height >= 3) {
      const cx = (width / 2) | 0;
      const cy = (height / 2) | 0;
      const decoAsset = `decoration/${layout.type}`;
      pieces.push({ kind: 'decoration', assetId: decoAsset, x: cx, y: cy });
      assetSet.add(decoAsset);
    }

    return {
      roomId: layout.id,
      type: layout.type,
      tileMap,
      pieces,
      assetIds: Array.from(assetSet),
    };
  }
}

// Maps a room type to an art zone bucket for asset ids (kept simple + stable).
function layoutZone(type: RoomType): string {
  return type === 'boss' ? 'boss' : 'common';
}
