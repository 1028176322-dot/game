// TileMap.ts — logical tile-grid data for a room (§3.7). Pure TS, NO `cc` import.
//
// Design:
//  - Pure logic layer: walkable / terrain / occupancy. No rendering, no engine.
//  - Consumed by NavigationGrid (pathfinding) and RoomRuntime (entity placement).
//  - Deterministic: no randomness here (layout randomness lives in DungeonGenerator).
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.7 (TileMap = 地块网格数据 可走/地形/占用).

export type TileKind = 'floor' | 'wall' | 'void';

export interface GridCoord {
  x: number;
  y: number;
}

export class TileMap {
  readonly width: number;
  readonly height: number;

  private readonly _kind: TileKind[];
  private readonly _occupied: boolean[];

  constructor(width: number, height: number, fill: TileKind = 'floor') {
    this.width = Math.max(1, width | 0);
    this.height = Math.max(1, height | 0);
    const n = this.width * this.height;
    this._kind = new Array<TileKind>(n).fill(fill);
    this._occupied = new Array<boolean>(n).fill(false);
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  private _idx(x: number, y: number): number {
    return y * this.width + x;
  }

  getKind(x: number, y: number): TileKind {
    if (!this.inBounds(x, y)) return 'void';
    return this._kind[this._idx(x, y)];
  }

  setKind(x: number, y: number, kind: TileKind): void {
    if (!this.inBounds(x, y)) return;
    this._kind[this._idx(x, y)] = kind;
  }

  // A tile is walkable when it is floor terrain AND not currently occupied.
  isWalkable(x: number, y: number): boolean {
    if (!this.inBounds(x, y)) return false;
    const i = this._idx(x, y);
    return this._kind[i] === 'floor' && !this._occupied[i];
  }

  isOccupied(x: number, y: number): boolean {
    if (!this.inBounds(x, y)) return false;
    return this._occupied[this._idx(x, y)];
  }

  occupy(x: number, y: number): void {
    if (!this.inBounds(x, y)) return;
    this._occupied[this._idx(x, y)] = true;
  }

  free(x: number, y: number): void {
    if (!this.inBounds(x, y)) return;
    this._occupied[this._idx(x, y)] = false;
  }

  clearOccupancy(): void {
    this._occupied.fill(false);
  }
}
