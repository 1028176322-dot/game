System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, TileMap, RoomBuilder, _crd;

  // Maps a room type to an art zone bucket for asset ids (kept simple + stable).
  function layoutZone(type) {
    return type === 'boss' ? 'boss' : 'common';
  }

  function _reportPossibleCrUseOfRoomLayout(extras) {
    _reporterNs.report("RoomLayout", "./DungeonGenerator", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRoomType(extras) {
    _reporterNs.report("RoomType", "./DungeonGenerator", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTileMap(extras) {
    _reporterNs.report("TileMap", "./TileMap", _context.meta, extras);
  }

  _export("RoomBuilder", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      TileMap = _unresolved_2.TileMap;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "afcd7JDqO1FKo2R6lJYOYTK", "RoomBuilder", undefined); // RoomBuilder.ts — turns a RoomLayout into concrete room data (§3.7). Pure TS, NO `cc`.
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


      _export("RoomBuilder", RoomBuilder = class RoomBuilder {
        constructor() {
          this.name = 'RoomBuilder';
        }

        build(layout) {
          const {
            width,
            height
          } = layout;
          const tileMap = new (_crd && TileMap === void 0 ? (_reportPossibleCrUseOfTileMap({
            error: Error()
          }), TileMap) : TileMap)(width, height, 'floor');
          const pieces = [];
          const assetSet = new Set();
          const floorAsset = `tile/${layoutZone(layout.type)}/floor`;
          const wallAsset = `tile/${layoutZone(layout.type)}/wall`;

          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const isBorder = x === 0 || y === 0 || x === width - 1 || y === height - 1;

              if (isBorder) {
                tileMap.setKind(x, y, 'wall');
                pieces.push({
                  kind: 'wall',
                  assetId: wallAsset,
                  x,
                  y
                });
                assetSet.add(wallAsset);
              } else {
                // floor stays 'floor'
                pieces.push({
                  kind: 'floor',
                  assetId: floorAsset,
                  x,
                  y
                });
                assetSet.add(floorAsset);
              }
            }
          } // Deterministic decoration at the room center for elite/boss/reward rooms.


          if (layout.type !== 'start' && width >= 3 && height >= 3) {
            const cx = width / 2 | 0;
            const cy = height / 2 | 0;
            const decoAsset = `decoration/${layout.type}`;
            pieces.push({
              kind: 'decoration',
              assetId: decoAsset,
              x: cx,
              y: cy
            });
            assetSet.add(decoAsset);
          }

          return {
            roomId: layout.id,
            type: layout.type,
            tileMap,
            pieces,
            assetIds: Array.from(assetSet)
          };
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=7eea8901079bca5e05a25d9bbeb5bbf6d834c72e.js.map