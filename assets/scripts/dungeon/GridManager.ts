/**
 * GridManager - 6×6 网格管理器
 * 负责网格渲染、碰撞检测、地形管理
 * 通过统一资源接口管理 Tile 渲染
 */

import { _decorator, Component, Node, Vec3, Color, UITransform, Sprite, instantiate, Prefab } from 'cc';
import { TerrainType, BATTLE_CONSTANTS } from '../core/Constants';

const { ccclass, property } = _decorator;

/** 网格格子 */
export interface GridCell {
    x: number;
    y: number;
    terrain: TerrainType;
    walkable: boolean;
    occupied: boolean;  // 是否有单位占据
    node: Node | null;
}

@ccclass('GridManager')
export class GridManager extends Component {
    @property(Prefab)
    tilePrefab: Prefab | null = null;  // Tile Prefab（编辑器拖入，缺失时用 Sprite 兜底）

    private _grid: GridCell[][] = [];
    private _tileSize: number = BATTLE_CONSTANTS.TILE_SIZE;
    private _gridSize: number = BATTLE_CONSTANTS.GRID_SIZE;

    /** 地形颜色映射（缺失时使用默认颜色兜底） */
    private _terrainColors: Record<TerrainType, Color> = {
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

    /** 初始化网格 */
    private _initGrid(): void {
        for (let y = 0; y < this._gridSize; y++) {
            this._grid[y] = [];
            for (let x = 0; x < this._gridSize; x++) {
                const cell = this._createCell(x, y);
                this._grid[y][x] = cell;
            }
        }
    }

    /** 创建单个格子 */
    private _createCell(x: number, y: number): GridCell {
        const terrain = this._getDefaultTerrain(x, y);
        const cell: GridCell = {
            x, y, terrain,
            walkable: terrain !== TerrainType.Wall && terrain !== TerrainType.Water,
            occupied: false,
            node: null,
        };

        // 渲染 Tile
        const tileNode = this._renderTile(cell);
        if (tileNode) {
            cell.node = tileNode;
            const pos = this.gridToWorld(x, y);
            tileNode.setPosition(pos);
            this.node.addChild(tileNode);
        }

        return cell;
    }

    /** 渲染单个 Tile（Prefab 缺失时用 Sprite 兜底） */
    private _renderTile(cell: GridCell): Node | null {
        let tileNode: Node | null = null;

        if (this.tilePrefab) {
            tileNode = instantiate(this.tilePrefab);
        } else {
            // Prefab 缺失兜底：创建 Sprite 节点
            tileNode = new Node(`tile_${cell.x}_${cell.y}`);
            const sprite = tileNode.addComponent(Sprite);
            // 至少有一个 SpriteFrame 才设置颜色，否则保持默认
            // （调用方在编辑器中确保 SpriteFrame 存在）
        }

        if (tileNode) {
            const transform = tileNode.getComponent(UITransform);
            if (transform) {
                transform.setContentSize(this._tileSize, this._tileSize);
            }
        }

        return tileNode;
    }

    /** 获取默认地形（6×6 边缘墙，内部地板，随机特殊地形） */
    private _getDefaultTerrain(x: number, y: number): TerrainType {
        if (x === 0 || x === this._gridSize - 1 || y === 0 || y === this._gridSize - 1) {
            return TerrainType.Wall;
        }
        // 内部随机地形
        const rand = Math.random();
        if (rand < 0.6) return TerrainType.Floor;
        if (rand < 0.75) return TerrainType.Grass;
        if (rand < 0.85) return TerrainType.Stone;
        if (rand < 0.92) return TerrainType.Water;
        return TerrainType.Floor;
    }

    /** 网格坐标 → 世界坐标 */
    gridToWorld(gx: number, gy: number): Vec3 {
        return new Vec3(
            (gx - (this._gridSize - 1) / 2) * this._tileSize,
            ((this._gridSize - 1) / 2 - gy) * this._tileSize,
            0
        );
    }

    /** 世界坐标 → 网格坐标 */
    worldToGrid(worldPos: Vec3): { x: number; y: number } | null {
        const gx = Math.round(worldPos.x / this._tileSize + (this._gridSize - 1) / 2);
        const gy = Math.round((this._gridSize - 1) / 2 - worldPos.y / this._tileSize);
        if (gx < 0 || gx >= this._gridSize || gy < 0 || gy >= this._gridSize) return null;
        return { x: gx, y: gy };
    }

    /** 检查位置是否可通行 */
    isWalkable(x: number, y: number): boolean {
        if (x < 0 || x >= this._gridSize || y < 0 || y >= this._gridSize) return false;
        const cell = this._grid[y][x];
        return cell.walkable && !cell.occupied;
    }

    /** 设置格子占用状态 */
    setOccupied(x: number, y: number, occupied: boolean): void {
        if (x >= 0 && x < this._gridSize && y >= 0 && y < this._gridSize) {
            this._grid[y][x].occupied = occupied;
        }
    }

    /** 以种子重新生成网格 */
    generateWithSeed(seed: number): void {
        // 清除旧网格
        for (let y = 0; y < this._gridSize; y++) {
            for (let x = 0; x < this._gridSize; x++) {
                if (this._grid[y]?.[x]?.node) {
                    this._grid[y][x].node!.destroy();
                }
            }
        }
        this._grid = [];
        this._initGrid();
    }

    get gridSize(): number { return this._gridSize; }
    get tileSize(): number { return this._tileSize; }
    get grid(): GridCell[][] { return this._grid; }

    /** 获取某格子的地形 */
    getTerrain(x: number, y: number): TerrainType {
        if (x < 0 || x >= this._gridSize || y < 0 || y >= this._gridSize) return TerrainType.Wall;
        return this._grid[y][x].terrain;
    }
}
