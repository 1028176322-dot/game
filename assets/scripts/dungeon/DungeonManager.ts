/**
 * DungeonManager - 地牢管理器
 * 管理地牢流程：层生成 → 房间序列 → 种子管理
 * 单一写入口管理地牢状态
 */

import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { RoomType, BattlePhase } from '../core/Constants';
import { eventBus } from '../core/EventBus';
import { DAGGenerator, DungeonDAG, RoomNode } from './DAGGenerator';
import { GridManager } from './GridManager';
import { RoomTransition } from './RoomTransition';
import { BattleManager } from '../battle/BattleManager';
import { PlayerController } from '../battle/PlayerController';
import { MonsterConfig, MonsterAIType } from '../battle/MonsterController';
import { GameManager } from '../core/GameManager';

const { ccclass, property } = _decorator;

/** 当前层状态 */
interface FloorState {
    dag: DungeonDAG;
    currentRoomId: number;
    seed: number;
    floorNumber: number;
    clearedRoomIds: Set<number>;
    visitedRoomIds: Set<number>;
}

@ccclass('DungeonManager')
export class DungeonManager extends Component {
    @property(GridManager)
    gridManager: GridManager | null = null;
    @property(RoomTransition)
    roomTransition: RoomTransition | null = null;
    @property(BattleManager)
    battleManager: BattleManager | null = null;

    private _floorState: FloorState | null = null;
    private _player: PlayerController | null = null;
    private _globalSeed: number = 0;
    private _subSeedCounter: number = 0;

    /** 初始化地牢 */
    init(player: PlayerController, seed: number): void {
        this._player = player;
        this._globalSeed = seed;
        this._subSeedCounter = 0;
        this._generateFloor(1);
    }

    /** 进入下一层 */
    enterNextFloor(): void {
        const nextFloor = (this._floorState?.floorNumber ?? 0) + 1;
        this._generateFloor(nextFloor);
    }

    /** 生成新楼层 */
    private _generateFloor(floorNumber: number): void {
        // 子种子 = 全局种子 + 层数
        const floorSeed = this._globalSeed + floorNumber * 1000 + this._subSeedCounter;
        this._subSeedCounter++;

        // 生成 DAG
        const dag = DAGGenerator.generate(floorSeed, floorNumber);

        this._floorState = {
            dag,
            currentRoomId: dag.entryRoomId,
            seed: floorSeed,
            floorNumber,
            clearedRoomIds: new Set(),
            visitedRoomIds: new Set([dag.entryRoomId]),
        };

        // 进入入口房间
        this._enterRoom(dag.entryRoomId);

        eventBus.emit('dungeon:floor_generated', floorNumber, floorSeed, dag);
    }

    /** 进入指定房间 */
    private _enterRoom(roomId: number): void {
        if (!this._floorState) return;
        const room = this._floorState.dag.rooms.get(roomId);
        if (!room) {
            console.warn(`[DungeonManager] 房间 ${roomId} 不存在`);
            return;
        }

        this._floorState.currentRoomId = roomId;
        this._floorState.visitedRoomIds.add(roomId);

        // 格子和过渡
        if (this.gridManager) {
            this.gridManager.generateWithSeed(this._floorState.seed + roomId);
        }

        if (this.roomTransition) {
            this.roomTransition.enterRoom(() => {
                this._onRoomEntered(room);
            });
        } else {
            this._onRoomEntered(room);
        }
    }

    /** 房间进入后处理 */
    private _onRoomEntered(room: RoomNode): void {
        switch (room.type) {
            case RoomType.Normal:
            case RoomType.Elite:
                this._startBattleInRoom(room);
                break;
            case RoomType.Boss:
                this._startBattleInRoom(room, true);
                break;
            case RoomType.Treasure:
                eventBus.emit('room:treasure', room.id);
                break;
            case RoomType.Healing:
                eventBus.emit('room:healing', room.id);
                break;
            case RoomType.Shop:
                eventBus.emit('room:shop', room.id);
                break;
            case RoomType.Upgrade:
                eventBus.emit('room:upgrade', room.id);
                break;
            case RoomType.Event:
                eventBus.emit('room:event', room.id);
                break;
        }

        eventBus.emit('room:entered', room);
    }

    /** 在房间中开始战斗 */
    private _startBattleInRoom(room: RoomNode, isBoss: boolean = false): void {
        if (!this.battleManager || !this._floorState) return;

        const monsterConfigs = this._generateMonstersForRoom(room, isBoss);
        this.battleManager.startBattle(monsterConfigs);
    }

    /** 为房间生成怪物配置 */
    private _generateMonstersForRoom(room: RoomNode, isBoss: boolean): MonsterConfig[] {
        const isElite = room.type === RoomType.Elite;
        const monsterCount = isBoss ? 1 : (isElite ? 3 : MathUtils.randomInt(2, 4));

        const configs: MonsterConfig[] = [];
        for (let i = 0; i < monsterCount; i++) {
            configs.push({
                name: isBoss ? '森林守护者' : this._pickMonsterName(),
                hp: isBoss ? 100 : (isElite ? 40 : MathUtils.randomInt(15, 25)),
                atk: isBoss ? 15 : (isElite ? 10 : MathUtils.randomInt(3, 6)),
                def: isBoss ? 5 : (isElite ? 3 : MathUtils.randomInt(0, 2)),
                speed: 60,
                aiType: isBoss ? MonsterAIType.Charger : MathUtils.randomPick([MonsterAIType.Charger, MonsterAIType.Ranged, MonsterAIType.Defender]),
                exp: isBoss ? 50 : (isElite ? 20 : MathUtils.randomInt(5, 12)),
            });
        }
        return configs;
    }

    private _pickMonsterName(): string {
        const names = ['史莱姆', '骷髅兵', '骷髅弓手', '骷髅盾卫'];
        return MathUtils.randomPick(names);
    }

    /** 选择下一个房间 */
    selectNextRoom(roomId: number): void {
        if (!this._floorState) return;

        const currentRoom = this._floorState.dag.rooms.get(this._floorState.currentRoomId);
        if (!currentRoom) return;

        // 验证当前房间的连接中有该房间
        if (!currentRoom.connections.includes(roomId)) {
            console.warn(`[DungeonManager] 不能选择房间 ${roomId}：当前房间未连接到该房间`);
            return;
        }

        // 如果是战斗房，检查是否全清
        const isBattleRoom = currentRoom.type === RoomType.Normal || currentRoom.type === RoomType.Elite;
        if (isBattleRoom && this.battleManager && !this.battleManager.isRoomCleared) {
            console.warn('[DungeonManager] 战斗房未全清，不能离开');
            return;
        }

        // 退出当前房间过渡
        if (this.roomTransition) {
            this.roomTransition.exitRoom(() => {
                this._enterRoom(roomId);
            });
        } else {
            this._enterRoom(roomId);
        }
    }

    /** 获取当前房间节点 */
    get currentRoom(): RoomNode | null {
        return this._floorState?.dag.rooms.get(this._floorState?.currentRoomId ?? -1) ?? null;
    }

    get floorState(): FloorState | null { return this._floorState; }

    /** 获取同种子的地牢是否一致（调试用） */
    debugCompareSeed(seed1: number, seed2: number): boolean {
        const dag1 = DAGGenerator.generate(seed1, 1);
        const dag2 = DAGGenerator.generate(seed2, 1);
        return dag1.rooms.size === dag2.rooms.size;
    }
}
