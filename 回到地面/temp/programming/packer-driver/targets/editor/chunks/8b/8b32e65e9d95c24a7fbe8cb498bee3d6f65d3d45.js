System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, TileMap, _crd;

  _export("TileMap", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "02b21Y7oApOOp/9OlE+i2U8", "TileMap", undefined); // TileMap.ts — logical tile-grid data for a room (§3.7). Pure TS, NO `cc` import.
      //
      // Design:
      //  - Pure logic layer: walkable / terrain / occupancy. No rendering, no engine.
      //  - Consumed by NavigationGrid (pathfinding) and RoomRuntime (entity placement).
      //  - Deterministic: no randomness here (layout randomness lives in DungeonGenerator).
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.7 (TileMap = 地块网格数据 可走/地形/占用).


      _export("TileMap", TileMap = class TileMap {
        constructor(width, height, fill = 'floor') {
          this.width = void 0;
          this.height = void 0;
          this._kind = void 0;
          this._occupied = void 0;
          this.width = Math.max(1, width | 0);
          this.height = Math.max(1, height | 0);
          const n = this.width * this.height;
          this._kind = new Array(n).fill(fill);
          this._occupied = new Array(n).fill(false);
        }

        inBounds(x, y) {
          return x >= 0 && y >= 0 && x < this.width && y < this.height;
        }

        _idx(x, y) {
          return y * this.width + x;
        }

        getKind(x, y) {
          if (!this.inBounds(x, y)) return 'void';
          return this._kind[this._idx(x, y)];
        }

        setKind(x, y, kind) {
          if (!this.inBounds(x, y)) return;
          this._kind[this._idx(x, y)] = kind;
        } // A tile is walkable when it is floor terrain AND not currently occupied.


        isWalkable(x, y) {
          if (!this.inBounds(x, y)) return false;

          const i = this._idx(x, y);

          return this._kind[i] === 'floor' && !this._occupied[i];
        }

        isOccupied(x, y) {
          if (!this.inBounds(x, y)) return false;
          return this._occupied[this._idx(x, y)];
        }

        occupy(x, y) {
          if (!this.inBounds(x, y)) return;
          this._occupied[this._idx(x, y)] = true;
        }

        free(x, y) {
          if (!this.inBounds(x, y)) return;
          this._occupied[this._idx(x, y)] = false;
        }

        clearOccupancy() {
          this._occupied.fill(false);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=8b32e65e9d95c24a7fbe8cb498bee3d6f65d3d45.js.map