/**
 * DAGGenerator - 地牢 DAG 生成器
 * 按种子生成有向无环图地牢地图
 * 同一种子生成完全一致的地牢
 */

import { RoomType } from '../core/Constants';
import { MathUtils } from '../utils/MathUtils';

/** DAG 房间节点 */
export interface RoomNode {
    id: number;
    type: RoomType;
    depth: number;           // 层深（入口=0）
    connections: number[];   // 连向下一个房间的 ID
    parent: number | null;   // 入口方向房间 ID
    x: number;               // 地图显示位置
    y: number;
}

/** 生成的 DAG 地牢 */
export interface DungeonDAG {
    rooms: Map<number, RoomNode>;
    entryRoomId: number;     // 入口房间 ID
    bossRoomId: number;      // Boss 房 ID
    upgradeRoomId: number;   // 强化房 ID
    maxDepth: number;
}

@ccclass('DAGGenerator')  // 注意：实际作为纯数据类，实际使用中可能不需要 ccclass
export class DAGGenerator {
    /** 生成地牢 DAG */
    static generate(seed: number, floorNumber: number, roomCount: number = 5): DungeonDAG {
        const rand = MathUtils.seededRandom(seed);
        const rooms = new Map<number, RoomNode>();
        let nextId = 0;

        // ======== 第 1 层：入口 ========
        const entryId = nextId++;
        rooms.set(entryId, {
            id: entryId, type: RoomType.Normal, depth: 0,
            connections: [], parent: null,
            x: 3, y: 0,
        });

        // ======== 中间层：分支 ========
        const depthCount = roomCount - 1; // 去掉 Boss 层和强化层
        let prevDepthRooms = [entryId];

        for (let depth = 1; depth <= depthCount; depth++) {
            const currentDepthRooms: number[] = [];
            // 本层房间数：1~2 个分支
            const roomsThisDepth = depth === depthCount ? 1 : (rand() < 0.6 ? 1 : 2);

            for (let i = 0; i < roomsThisDepth; i++) {
                const roomId = nextId++;
                const roomType = this._determineRoomType(rand, depth, depthCount, i);

                rooms.set(roomId, {
                    id: roomId, type: roomType, depth,
                    connections: [], parent: null,
                    x: i === 0 ? 2 : 4,
                    y: depth,
                });

                // 连接到上一层所有房间（有分支合并）
                for (const prevId of prevDepthRooms) {
                    rooms.get(prevId)!.connections.push(roomId);
                }
                rooms.get(roomId)!.parent = prevDepthRooms[0];
                currentDepthRooms.push(roomId);
            }

            prevDepthRooms = currentDepthRooms;
        }

        // ======== 最后一层前：强化房 ========
        const upgradeId = nextId++;
        rooms.set(upgradeId, {
            id: upgradeId, type: RoomType.Upgrade, depth: depthCount + 1,
            connections: [], parent: prevDepthRooms[0],
            x: 3, y: depthCount + 1,
        });
        for (const prevId of prevDepthRooms) {
            rooms.get(prevId)!.connections.push(upgradeId);
        }

        // ======== 末端：Boss 房 ========
        const bossId = nextId++;
        rooms.set(bossId, {
            id: bossId, type: RoomType.Boss, depth: depthCount + 2,
            connections: [], parent: upgradeId,
            x: 3, y: depthCount + 2,
        });
        rooms.get(upgradeId)!.connections.push(bossId);

        return {
            rooms,
            entryRoomId: entryId,
            bossRoomId: bossId,
            upgradeRoomId: upgradeId,
            maxDepth: depthCount + 2,
        };
    }

    /** 确定房间类型（带权重） */
    private static _determineRoomType(rand: () => number, depth: number, maxDepth: number, branchIndex: number): RoomType {
        if (depth === maxDepth) return RoomType.Boss; // 不会执行到这里，安全起见

        const roll = rand();
        // 深度 > 2 时可以出精英房
        if (depth > 2 && roll < 0.2) return RoomType.Elite;
        if (roll < 0.35 && branchIndex === 0) return RoomType.Treasure;
        if (roll < 0.45) return RoomType.Healing;
        if (roll < 0.55 && depth > 1) return RoomType.Shop;
        if (roll < 0.60 && depth > 1) return RoomType.Event;
        return RoomType.Normal;
    }
}
