/**
 * DungeonMapUI - 地牢地图 UI
 * 显示 DAG 可视化：房间节点 + 连接线
 * 标记当前房间、已清理房间、可选方向
 */

import { _decorator, Component, Node, Sprite, Label, Color, instantiate, Prefab } from 'cc';
import { RoomType } from '../core/Constants';
import { RoomNode, DungeonDAG } from '../dungeon/DAGGenerator';
import { eventBus } from '../core/EventBus';

const { ccclass, property } = _decorator;

@ccclass('DungeonMapUI')
export class DungeonMapUI extends Component {
    @property(Prefab)
    roomNodePrefab: Prefab | null = null;  // 房间节点预制体
    @property(Node)
    mapContainer: Node | null = null;       // 地图容器
    @property(Sprite)
    lineSprite: Sprite | null = null;       // 连接线精灵

    private _dag: DungeonDAG | null = null;
    private _currentRoomId: number = -1;
    private _nodeMap: Map<number, Node> = new Map();
    private _roomColors: Record<RoomType, Color> = {
        [RoomType.Normal]: new Color(180, 180, 180),
        [RoomType.Elite]: new Color(200, 100, 50),
        [RoomType.Boss]: new Color(200, 30, 30),
        [RoomType.Treasure]: new Color(255, 215, 0),
        [RoomType.Healing]: new Color(50, 200, 100),
        [RoomType.Shop]: new Color(100, 150, 255),
        [RoomType.Upgrade]: new Color(180, 100, 255),
        [RoomType.Event]: new Color(200, 180, 100),
        [RoomType.Rest]: new Color(150, 200, 200),
    };

    onLoad(): void {
        eventBus.on('dungeon:floor_generated', this._onFloorGenerated, this);
        eventBus.on('room:entered', this._onRoomEntered, this);
        eventBus.on('battle:victory', this._onRoomCleared, this);
    }

    onDestroy(): void {
        eventBus.offTarget(this);
    }

    private _onFloorGenerated(floorNumber: number, seed: number, dag: DungeonDAG): void {
        this._dag = dag;
        this._currentRoomId = dag.entryRoomId;
        this._renderMap(dag);
    }

    private _onRoomEntered(room: RoomNode): void {
        this._currentRoomId = room.id;
        this._updateNodeHighlight(room.id);
    }

    private _onRoomCleared(): void {
        // 当前房间标记为已清除
        this._markRoomCleared(this._currentRoomId);
    }

    /** 渲染 DAG 地图 */
    private _renderMap(dag: DungeonDAG): void {
        // 清除旧节点
        this.mapContainer?.removeAllChildren();
        this._nodeMap.clear();

        if (!this.mapContainer) return;

        const roomWidth = 40;
        const roomHeight = 30;
        const marginX = 60;
        const marginY = 50;

        // 按深度分组
        const depthMap = new Map<number, RoomNode[]>();
        for (const [, room] of dag.rooms) {
            if (!depthMap.has(room.depth)) {
                depthMap.set(room.depth, []);
            }
            depthMap.get(room.depth)!.push(room);
        }

        // 渲染每个房间节点
        for (const [depth, rooms] of depthMap) {
            const nodeX = marginX + depth * (roomWidth + 10);
            const roomsAtDepth = rooms.length;

            for (let i = 0; i < roomsAtDepth; i++) {
                const room = rooms[i];
                const nodeY = marginY + (roomsAtDepth > 1 && i === 1 ? roomHeight + 8 : 0);

                const node = this._createRoomNode(room, nodeX, nodeY, roomWidth, roomHeight);
                this.mapContainer.addChild(node);
                this._nodeMap.set(room.id, node);
            }
        }

        // 渲染连接线（简化：在节点间画斜线）
        // （实际项目中用画线组件或 Sprite 拉伸实现）
    }

    private _createRoomNode(room: RoomNode, x: number, y: number, w: number, h: number): Node {
        let node: Node;

        if (this.roomNodePrefab) {
            node = instantiate(this.roomNodePrefab);
        } else {
            node = new Node(`room_${room.id}`);
            const sprite = node.addComponent(Sprite);
        }

        node.setPosition(x, y);

        const sprite = node.getComponent(Sprite);
        if (sprite) {
            const color = this._roomColors[room.type] || new Color(180, 180, 180);
            sprite.color = color;
        }

        // 标签
        const label = node.getComponentInChildren(Label);
        if (label) {
            label.string = this._getRoomShortName(room.type);
        }

        // 当前房间高亮
        if (room.id === this._currentRoomId) {
            this._highlightNode(node);
        }

        return node;
    }

    private _getRoomShortName(type: RoomType): string {
        switch (type) {
            case RoomType.Normal: return '战';
            case RoomType.Elite: return '精';
            case RoomType.Boss: return 'B';
            case RoomType.Treasure: return '宝';
            case RoomType.Healing: return '回';
            case RoomType.Shop: return '商';
            case RoomType.Upgrade: return '强';
            case RoomType.Event: return '?';
            default: return '';
        }
    }

    private _highlightNode(node: Node): void {
        const sprite = node.getComponent(Sprite);
        if (sprite) {
            sprite.color = Color.WHITE;
        }
        const scale = 1.3;
        node.setScale(scale, scale, 1);
    }

    private _updateNodeHighlight(roomId: number): void {
        // 取消旧高亮
        for (const [, node] of this._nodeMap) {
            node.setScale(1, 1, 1);
        }
        // 新高亮
        const currentNode = this._nodeMap.get(roomId);
        if (currentNode) {
            this._highlightNode(currentNode);
        }
    }

    private _markRoomCleared(roomId: number): void {
        const node = this._nodeMap.get(roomId);
        if (node) {
            const sprite = node.getComponent(Sprite);
            if (sprite) {
                // 变淡表示已清理
                const col = sprite.color.clone();
                col.a = 150;
                sprite.color = col;
            }
        }
    }
}
