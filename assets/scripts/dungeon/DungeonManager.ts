/**
 * DungeonManager - 地牢管理器 (Phase 3 重构版)
 * 
 * 管理地牢流程：区域/小关生成 → 房间序列 → 种子管理
 * 使用 ConfigManager 从 JSON 配置读取区域和怪物数据
 * 单一写入口管理地牢状态
 */

import { _decorator, Component, Node } from 'cc';
import { RoomType, BattlePhase, MonsterAIType } from '../core/Constants';
import { eventBus } from '../core/EventBus';
import { DAGGenerator, DungeonDAG, RoomNode } from './DAGGenerator';
import { GridManager } from './GridManager';
import { RoomTransition } from './RoomTransition';
import { BattleManager } from '../battle/BattleManager';
import { PlayerController } from '../battle/PlayerController';
import { MonsterConfig } from '../battle/MonsterController';
import { GameManager } from '../core/GameManager';
import { ConfigManager } from '../core/ConfigManager';
import { MathUtils } from '../utils/MathUtils';

const { ccclass, property } = _decorator;

/** 当前层状态 */
interface FloorState {
    dag: DungeonDAG;
    currentRoomId: number;
    seed: number;
    floorNumber: number;
    clearedRoomIds: Set<number>;
    visitedRoomIds: Set<number>;
    /** 是否为当前小关的迷你Boss房 */
    isMiniBossFloor: boolean;
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
    /** 当前区域 ID */
    private _currentZone: string = 'forest';
    /** 当前小关 ID */
    private _currentStageId: string = '';
    /** 已挑战的小关数 */
    private _stagesCompleted: number = 0;
    /** 当前小关的总房间数 */
    private _stageRoomCount: number = 5;

    /** 初始化地牢 */
    init(player: PlayerController, seed: number): void {
        this._player = player;
        this._globalSeed = seed;
        this._subSeedCounter = 0;
        this._stagesCompleted = 0;

        // 从 GameManager 获取当前区域/小关
        const gm = GameManager.instance;
        this._currentZone = gm.currentZone;
        this._currentStageId = gm.currentStageId;

        // 从小关配置获取房间数
        const stageDef = gm.currentStageDef;
        this._stageRoomCount = stageDef ? stageDef.rooms : 5;

        this._generateFloor(1);
    }

    /** 进入下一层（小关内推进或进入下一小关） */
    enterNextFloor(): void {
        const nextFloor = (this._floorState?.floorNumber ?? 0) + 1;
        this._generateFloor(nextFloor);
    }

    /** 重新用新配置初始化（区域切换时调用） */
    resetForZone(zoneId: string, stageId: string): void {
        this._currentZone = zoneId;
        this._currentStageId = stageId;
        this._stagesCompleted = 0;
        this._subSeedCounter = 0;

        const gm = GameManager.instance;
        const stageDef = gm.currentStageDef;
        this._stageRoomCount = stageDef ? stageDef.rooms : 5;

        this._generateFloor(1);
    }

    /** 生成新楼层 */
    private _generateFloor(floorNumber: number): void {
        const cfg = ConfigManager.getInstance();
        const gm = GameManager.instance;

        // 子种子 = 全局种子 + 层数 * 小关偏移
        const floorSeed = this._globalSeed + floorNumber * 1000 + this._subSeedCounter;
        this._subSeedCounter++;

        // 判断当前楼层是否为迷你Boss层
        const stageDef = gm.currentStageDef;
        const isBossFloor = stageDef ? floorNumber >= (stageDef.rooms) : false;
        const isMiniBoss = isBossFloor && !this._isFinalBossFloor();

        // 生成 DAG（迷你Boss/Boss 房的房间数较少）
        const roomCount = isBossFloor ? Math.min(4, Math.max(3, this._stageRoomCount - 2)) : this._stageRoomCount;
        const dag = DAGGenerator.generate(floorSeed, floorNumber, roomCount, {
            zoneId: this._currentZone,
            isFinalBossFloor: this._isFinalBossFloor(),
            isMiniBossFloor: isMiniBoss,
            stageRoomCount: this._stageRoomCount,
        });

        this._floorState = {
            dag,
            currentRoomId: dag.entryRoomId,
            seed: floorSeed,
            floorNumber,
            clearedRoomIds: new Set(),
            visitedRoomIds: new Set([dag.entryRoomId]),
            isMiniBossFloor: isMiniBoss,
        };

        // 进入入口房间
        this._enterRoom(dag.entryRoomId);

        eventBus.emit('dungeon:floor_generated', floorNumber, floorSeed, dag);

        // Phase 3: 触发房间变异生成 (非入口层)
        if (floorNumber > 1) {
            eventBus.emit('mutation:generate', floorNumber);
        } else {
            // 入口层清除旧变异
            eventBus.emit('mutation:cleared');
        }
    }

    /** 是否为终结Boss层 */
    private _isFinalBossFloor(): boolean {
        const gm = GameManager.instance;
        return gm.isLastStageInZone;
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

    /** 为房间生成怪物配置（基于区域怪物池和配置表） */
    private _generateMonstersForRoom(room: RoomNode, isBoss: boolean): MonsterConfig[] {
        const isElite = room.type === RoomType.Elite;
        const gm = GameManager.instance;
        const cfg = ConfigManager.getInstance();
        const zoneId = this._currentZone;
        const monsterScale = cfg.getMonsterScale();

        const configs: MonsterConfig[] = [];

        if (isBoss) {
            // === Boss 生成 ===
            const isFinalBoss = this._floorState?.isMiniBossFloor === false && this._isFinalBossFloor();
            
            if (isFinalBoss) {
                // 终结 Boss
                const bossDef = cfg.getFinalBoss(zoneId);
                if (bossDef) {
                    configs.push({
                        name: bossDef.name,
                        hp: bossDef.hp,
                        atk: bossDef.atk,
                        def: bossDef.def,
                        speed: 50,
                        aiType: MonsterAIType.Elite,
                        exp: Math.floor(bossDef.hp * 0.5),
                        isBoss: true,
                        phases: bossDef.phases,
                        phaseTrigger: bossDef.phaseTrigger,
                    });
                } else {
                    // 兜底
                    configs.push({
                        name: zoneId + 'Boss', hp: 50, atk: 12, def: 4, speed: 50,
                        aiType: MonsterAIType.Charger, exp: 50,
                        isBoss: true, phases: 3, phaseTrigger: [0.5, 0.25],
                    });
                }
            } else {
                // 迷你 Boss
                const stageDef = gm.currentStageDef;
                if (stageDef) {
                    const miniBossHP = stageDef.miniBossHP;
                    configs.push({
                        name: stageDef.miniBoss,
                        hp: miniBossHP,
                        atk: Math.floor(miniBossHP * 0.4),
                        def: Math.floor(zoneId === 'abyss' ? 3 : zoneId === 'forest' ? 1 : 2),
                        speed: 50,
                        aiType: MonsterAIType.Charger,
                        exp: Math.floor(miniBossHP * 0.5),
                        isBoss: true,
                        phases: 2,
                        phaseTrigger: [0.5],
                    });
                } else {
                    configs.push({
                        name: '迷你Boss', hp: 20, atk: 8, def: 2, speed: 50,
                        aiType: MonsterAIType.Charger, exp: 20,
                        isBoss: true, phases: 2, phaseTrigger: [0.5],
                    });
                }
            }
            return configs;
        }

        // === 普通/精英战斗 ===
        const monsterCount = isElite ? 2 : MathUtils.randomInt(2, 4);

        for (let i = 0; i < monsterCount; i++) {
            const picked = cfg.pickMonsterFromPool(zoneId, !isElite);
            if (!picked) {
                // 兜底
                configs.push({
                    name: '史莱姆', hp: 12, atk: 3, def: 0, speed: 50,
                    aiType: MonsterAIType.Charger, exp: 3,
                });
                continue;
            }

            const def = picked.def;
            let finalHP = def.hp;
            let finalATK = def.atk;

            // 精英房间怪物属性加成
            if (isElite || picked.id.endsWith('Elite')) {
                finalHP = Math.floor(def.hp * (monsterScale.eliteHpMultiplier || 1.8));
                finalATK = Math.floor(def.atk * (monsterScale.eliteAtkMultiplier || 1.5));
            }

            configs.push({
                name: def.name,
                hp: finalHP,
                atk: finalATK,
                def: def.def,
                speed: def.speed,
                aiType: this._stringToAIType(def.ai),
                exp: def.exp,
            });
        }

        return configs;
    }

    /** 将字符串 AI 类型转为枚举 */
    private _stringToAIType(ai: string): MonsterAIType {
        switch (ai) {
            case 'charger': return MonsterAIType.Charger;
            case 'ranged': return MonsterAIType.Ranged;
            case 'defender': return MonsterAIType.Defender;
            case 'summoner': return MonsterAIType.Summoner;
            case 'suicider': return MonsterAIType.Suicider;
            case 'elite': return MonsterAIType.Elite;
            default: return MonsterAIType.Charger;
        }
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
    get currentZone(): string { return this._currentZone; }
    get currentStageId(): string { return this._currentStageId; }

    /** 调试: 同种子的地牢一致性 */
    debugCompareSeed(seed1: number, seed2: number): boolean {
        const dag1 = DAGGenerator.generate(seed1, 1);
        const dag2 = DAGGenerator.generate(seed2, 1);
        return dag1.rooms.size === dag2.rooms.size;
    }
}
