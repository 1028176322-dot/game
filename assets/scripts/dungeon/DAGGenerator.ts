/**
 * DAGGenerator - 地牢 DAG 生成器 (Phase 3)
 * 按种子生成有向无环图地牢地图
 * 支持区域/小关配置、Boss房标记
 */

import { RoomType } from '../core/Constants';
import { MathUtils } from '../utils/MathUtils';
import { ConfigManager } from '../core/ConfigManager';

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

/** 生成选项 */
export interface DAGOptions {
    zoneId: string;
    isFinalBossFloor: boolean;   // 是否为终结Boss层
    isMiniBossFloor: boolean;    // 是否为迷你Boss层
    stageRoomCount: number;      // 小关总房间数
}

export class DAGGenerator {
    /**
     * 生成地牢 DAG
     * @param seed 种子
     * @param floorNumber 楼层号
     * @param roomCount 房间数
     * @param options 区域/小关选项（可选）
     */
    static generate(
        seed: number,
        floorNumber: number,
        roomCount: number = 5,
        options?: DAGOptions
    ): DungeonDAG {
        const rand = MathUtils.seededRandom(seed);
        const rooms = new Map<number, RoomNode>();
        let nextId = 0;

        const isBossFloor = options?.isMiniBossFloor || options?.isFinalBossFloor;

        // ======== 第 1 层：入口 ========
        const entryId = nextId++;
        rooms.set(entryId, {
            id: entryId, type: RoomType.Normal, depth: 0,
            connections: [], parent: null,
            x: 3, y: 0,
        });

        // ======== 中间层：分支 ========
        const depthCount = isBossFloor
            ? Math.max(1, roomCount - 3)  // Boss层：入口→战斗→强化→Boss
            : roomCount - 1;               // 普通层：去掉Boss层和强化层
        let prevDepthRooms = [entryId];

        for (let depth = 1; depth <= depthCount; depth++) {
            const currentDepthRooms: number[] = [];
            const roomsThisDepth = depth === depthCount ? 1 : (rand() < 0.6 ? 1 : 2);

            for (let i = 0; i < roomsThisDepth; i++) {
                const roomId = nextId++;
                const roomType = this._determineRoomType(rand, depth, depthCount, i, options);

                rooms.set(roomId, {
                    id: roomId, type: roomType, depth,
                    connections: [], parent: null,
                    x: i === 0 ? 2 : 4,
                    y: depth,
                });

                for (const prevId of prevDepthRooms) {
                    rooms.get(prevId)!.connections.push(roomId);
                }
                rooms.get(roomId)!.parent = prevDepthRooms[0];
                currentDepthRooms.push(roomId);
            }

            prevDepthRooms = currentDepthRooms;
        }

        if (isBossFloor) {
            // ======== Boss 前：强化房（Boss层强化房合并） ========
            if (prevDepthRooms.length > 0) {
                const upgradeId = nextId++;
                rooms.set(upgradeId, {
                    id: upgradeId, type: RoomType.Upgrade, depth: depthCount + 1,
                    connections: [], parent: prevDepthRooms[0],
                    x: 3, y: depthCount + 1,
                });
                for (const prevId of prevDepthRooms) {
                    rooms.get(prevId)!.connections.push(upgradeId);
                }
                prevDepthRooms = [upgradeId];
            }

            // ======== 末端：Boss 房 ========
            const bossId = nextId++;
            rooms.set(bossId, {
                id: bossId, type: RoomType.Boss, depth: depthCount + 2,
                connections: [], parent: prevDepthRooms[0],
                x: 3, y: depthCount + 2,
            });
            if (prevDepthRooms.length > 0) {
                rooms.get(prevDepthRooms[0])!.connections.push(bossId);
            }

            return {
                rooms,
                entryRoomId: entryId,
                bossRoomId: bossId,
                upgradeRoomId: prevDepthRooms[0] || entryId,
                maxDepth: depthCount + 2,
            };
        }

        // ======== 普通层：最后一层前强化房 ========
        const upgradeId = nextId++;
        rooms.set(upgradeId, {
            id: upgradeId, type: RoomType.Upgrade, depth: depthCount + 1,
            connections: [], parent: prevDepthRooms[0],
            x: 3, y: depthCount + 1,
        });
        for (const prevId of prevDepthRooms) {
            rooms.get(prevId)!.connections.push(upgradeId);
        }

        // ======== 末端：Boss 房（对于非Boss层，是区域传送门） ========
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

    /** 确定房间类型（带权重，支持区域配置） */
    private static _determineRoomType(
        rand: () => number,
        depth: number,
        maxDepth: number,
        branchIndex: number,
        options?: DAGOptions
    ): RoomType {
        if (depth === maxDepth) return RoomType.Boss;

        // 使用区域配置的权重
        const weights = options?.zoneId
            ? ConfigManager.getInstance().getRoomTypeWeights()
            : { combat: 55, treasure: 12, healing: 10, shop: 10, event: 5, upgrade: 8 };

        const roll = rand() * 100;

        // 深度 > 2 时可以出精英房
        if (depth > 2 && roll < 8) return RoomType.Elite; // ~8% elite

        let cumulative = 0;
        cumulative += weights.combat || 55;
        if (roll < cumulative) return RoomType.Normal;

        cumulative += weights.treasure || 12;
        if (roll < cumulative && branchIndex === 0) return RoomType.Treasure;

        cumulative += weights.healing || 10;
        if (roll < cumulative) return RoomType.Healing;

        cumulative += weights.shop || 10;
        if (roll < cumulative && depth > 1) return RoomType.Shop;

        cumulative += weights.event || 5;
        if (roll < cumulative && depth > 1) return RoomType.Event;

        return RoomType.Normal;
    }
}
