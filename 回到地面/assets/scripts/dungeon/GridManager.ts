import { _decorator, Color, Component, Graphics, instantiate, Node, Prefab, Sprite, UITransform, Vec3 } from 'cc';
import { GameConfig } from '../core/GameConfig';
import { TerrainType } from '../core/Constants';
import { RunRng } from '../core/rng/RunRng';
import { RenderAssetService } from '../assets/RenderAssetService';

const { ccclass, property } = _decorator;

export interface GridCell {
    x: number;
    y: number;
    terrain: TerrainType;
    walkable: boolean;
    occupied: boolean;
    node: Node | null;
}

@ccclass('GridManager')
export class GridManager extends Component {
    @property(Prefab)
    tilePrefab: Prefab | null = null;

    private _grid: GridCell[][] = [];
    private _tileSize: number = GameConfig.TILE_SIZE;
    private _gridSize: number = GameConfig.GRID_SIZE;
    private _zoneId: string = 'forest';

    private _terrainColors: Partial<Record<TerrainType, Color>> = {
        [TerrainType.Floor]: new Color(200, 190, 170),
        [TerrainType.Wall]: new Color(80, 70, 60),
        [TerrainType.Water]: new Color(60, 120, 200),
        [TerrainType.Lava]: new Color(220, 80, 30),
        [TerrainType.Ice]: new Color(200, 220, 240),
        [TerrainType.Swamp]: new Color(100, 140, 80),
        [TerrainType.Grass]: new Color(120, 180, 80),
        [TerrainType.Stone]: new Color(150, 150, 150),
    };

    onLoad(): void {
        this._initGrid();
    }

    private _initGrid(): void {
        for (let y = 0; y < this._gridSize; y++) {
            this._grid[y] = [];
            for (let x = 0; x < this._gridSize; x++) {
                const cell = this._createCell(x, y);
                this._grid[y][x] = cell;
            }
        }
    }

    private _createCell(x: number, y: number): GridCell {
        const terrain = this._getDefaultTerrain(x, y);
        const cell: GridCell = {
            x,
            y,
            terrain,
            walkable: terrain !== TerrainType.Wall && terrain !== TerrainType.Water,
            occupied: false,
            node: null,
        };

        const tileNode = this._renderTile(cell);
        if (tileNode) {
            cell.node = tileNode;
            tileNode.setPosition(this.gridToWorld(x, y));
            this.node.addChild(tileNode);
        }

        return cell;
    }

    private _renderTile(cell: GridCell): Node | null {
        let tileNode: Node | null = null;

        if (this.tilePrefab) {
            tileNode = instantiate(this.tilePrefab);
        } else {
            tileNode = new Node(`tile_${cell.x}_${cell.y}`);
            tileNode.addComponent(UITransform);
            tileNode.addComponent(Sprite);

            const graphics = tileNode.addComponent(Graphics);
            graphics.fillColor = this._terrainColors[cell.terrain] ?? Color.WHITE;
            graphics.rect(-this._tileSize / 2, -this._tileSize / 2, this._tileSize - 2, this._tileSize - 2);
            graphics.fill();

            void RenderAssetService.applyTileSprite(tileNode, this._zoneId, cell.terrain);
        }

        const transform = tileNode?.getComponent(UITransform);
        if (transform) {
            transform.setContentSize(this._tileSize, this._tileSize);
        }

        return tileNode;
    }

    private _getDefaultTerrain(x: number, y: number): TerrainType {
        if (x === 0 || x === this._gridSize - 1 || y === 0 || y === this._gridSize - 1) {
            return TerrainType.Wall;
        }

        const gridRng = RunRng.instance.fork(`grid:terrain:${x}:${y}`);
        const rand = gridRng.next();
        if (rand < 0.6) return TerrainType.Floor;
        if (rand < 0.75) return TerrainType.Grass;
        if (rand < 0.85) return TerrainType.Stone;
        if (rand < 0.92) return TerrainType.Water;
        return TerrainType.Floor;
    }

    gridToWorld(gx: number, gy: number): Vec3 {
        return new Vec3(
            (gx - (this._gridSize - 1) / 2) * this._tileSize,
            ((this._gridSize - 1) / 2 - gy) * this._tileSize,
            0,
        );
    }

    worldToGrid(worldPos: Vec3): { x: number; y: number } | null {
        const gx = Math.round(worldPos.x / this._tileSize + (this._gridSize - 1) / 2);
        const gy = Math.round((this._gridSize - 1) / 2 - worldPos.y / this._tileSize);
        if (gx < 0 || gx >= this._gridSize || gy < 0 || gy >= this._gridSize) return null;
        return { x: gx, y: gy };
    }

    isWalkable(x: number, y: number): boolean {
        if (x < 0 || x >= this._gridSize || y < 0 || y >= this._gridSize) return false;
        const cell = this._grid[y][x];
        return cell.walkable && !cell.occupied;
    }

    setOccupied(x: number, y: number, occupied: boolean): void {
        if (x >= 0 && x < this._gridSize && y >= 0 && y < this._gridSize) {
            this._grid[y][x].occupied = occupied;
        }
    }

    setZone(zoneId: string): void {
        this._zoneId = zoneId || 'forest';
    }

    isOccupied(x: number, y: number): boolean {
        if (x < 0 || x >= this._gridSize || y < 0 || y >= this._gridSize) return true;
        return this._grid[y][x]?.occupied ?? true;
    }

    generateWithSeed(seed: number): void {
        for (let y = 0; y < this._gridSize; y++) {
            for (let x = 0; x < this._gridSize; x++) {
                this._grid[y]?.[x]?.node?.destroy();
            }
        }
        this._grid = [];
        this._initGrid();
    }

    getTerrain(x: number, y: number): TerrainType {
        if (x < 0 || x >= this._gridSize || y < 0 || y >= this._gridSize) return TerrainType.Wall;
        return this._grid[y][x].terrain;
    }

    get gridSize(): number { return this._gridSize; }
    get tileSize(): number { return this._tileSize; }
    get grid(): GridCell[][] { return this._grid; }
}
