import { _decorator, Component } from 'cc';
import { MonsterAIType, RoomType } from '../core/Constants';
import { eventBus } from '../core/EventBus';
import { ConfigManager } from '../core/ConfigManager';
import { GameManager } from '../core/GameManager';
import { MathUtils } from '../utils/MathUtils';
import { BattleManager } from '../battle/BattleManager';
import { MonsterConfig } from '../battle/MonsterController';
import { PlayerController } from '../battle/PlayerController';
import { DAGGenerator, DungeonDAG, RoomNode } from './DAGGenerator';
import { GridManager } from './GridManager';
import { RoomTransition } from './RoomTransition';

const { ccclass, property } = _decorator;

interface FloorState {
    dag: DungeonDAG;
    currentRoomId: number;
    seed: number;
    floorNumber: number;
    clearedRoomIds: Set<number>;
    visitedRoomIds: Set<number>;
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
    private _currentZone: string = 'forest';
    private _currentStageId: string = '';
    private _stagesCompleted: number = 0;
    private _stageRoomCount: number = 5;

    init(player: PlayerController, seed: number): void {
        this._player = player;
        this._globalSeed = seed;
        this._subSeedCounter = 0;
        this._stagesCompleted = 0;

        const gm = GameManager.instance;
        this._currentZone = gm.currentZone;
        this._currentStageId = gm.currentStageId;
        this._stageRoomCount = gm.currentStageDef?.rooms ?? 5;

        this._generateFloor(1);
    }

    enterNextFloor(): void {
        const nextFloor = (this._floorState?.floorNumber ?? 0) + 1;
        this._generateFloor(nextFloor);
    }

    resetForZone(zoneId: string, stageId: string): void {
        this._currentZone = zoneId;
        this._currentStageId = stageId;
        this._stagesCompleted = 0;
        this._subSeedCounter = 0;
        this._stageRoomCount = GameManager.instance.currentStageDef?.rooms ?? 5;
        this._generateFloor(1);
    }

    private _generateFloor(floorNumber: number): void {
        const gm = GameManager.instance;
        const floorSeed = this._globalSeed + floorNumber * 1000 + this._subSeedCounter;
        this._subSeedCounter++;

        const stageDef = gm.currentStageDef;
        const isBossFloor = stageDef ? floorNumber >= stageDef.rooms : false;
        const isMiniBoss = isBossFloor && !this._isFinalBossFloor();
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

        this._enterRoom(dag.entryRoomId);
        eventBus.emit('dungeon:floor_generated', floorNumber, floorSeed, dag);

        if (floorNumber > 1) {
            eventBus.emit('mutation:generate', floorNumber);
        } else {
            eventBus.emit('mutation:cleared');
        }
    }

    private _isFinalBossFloor(): boolean {
        return GameManager.instance.isLastStageInZone;
    }

    private _enterRoom(roomId: number): void {
        if (!this._floorState) return;

        const room = this._floorState.dag.rooms.get(roomId);
        if (!room) {
            console.warn(`[DungeonManager] room ${roomId} does not exist`);
            return;
        }

        this._floorState.currentRoomId = roomId;
        this._floorState.visitedRoomIds.add(roomId);

        if (this.gridManager) {
            this.gridManager.setZone(this._currentZone);
            this.gridManager.generateWithSeed(this._floorState.seed + roomId);
        }

        if (this.roomTransition) {
            this.roomTransition.enterRoom(() => this._onRoomEntered(room));
        } else {
            this._onRoomEntered(room);
        }
    }

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

    private _startBattleInRoom(room: RoomNode, isBoss: boolean = false): void {
        if (!this.battleManager || !this._floorState) return;

        const monsterConfigs = this._generateMonstersForRoom(room, isBoss);
        this.battleManager.startBattle(monsterConfigs);
    }

    private _generateMonstersForRoom(room: RoomNode, isBoss: boolean): MonsterConfig[] {
        const isElite = room.type === RoomType.Elite;
        const gm = GameManager.instance;
        const cfg = ConfigManager.getInstance();
        const zoneId = this._currentZone;
        const monsterScale = cfg.getMonsterScale();
        const configs: MonsterConfig[] = [];

        if (isBoss) {
            const isFinalBoss = this._floorState?.isMiniBossFloor === false && this._isFinalBossFloor();

            if (isFinalBoss) {
                const bossDef = cfg.getFinalBoss(zoneId);
                if (bossDef) {
                    configs.push({
                        id: bossDef.id,
                        zoneId,
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
                    configs.push({
                        id: `${zoneId}Boss`,
                        zoneId,
                        name: `${zoneId} Boss`,
                        hp: 50,
                        atk: 12,
                        def: 4,
                        speed: 50,
                        aiType: MonsterAIType.Charger,
                        exp: 50,
                        isBoss: true,
                        phases: 3,
                        phaseTrigger: [0.5, 0.25],
                    });
                }
            } else {
                const stageDef = gm.currentStageDef;
                if (stageDef) {
                    const miniBossHP = stageDef.miniBossHP;
                    configs.push({
                        id: stageDef.miniBoss,
                        zoneId,
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
                        id: 'miniBoss',
                        zoneId,
                        name: 'Mini Boss',
                        hp: 20,
                        atk: 8,
                        def: 2,
                        speed: 50,
                        aiType: MonsterAIType.Charger,
                        exp: 20,
                        isBoss: true,
                        phases: 2,
                        phaseTrigger: [0.5],
                    });
                }
            }
            return configs;
        }

        const monsterCount = isElite ? 2 : MathUtils.randomInt(2, 4);
        for (let i = 0; i < monsterCount; i++) {
            const picked = cfg.pickMonsterFromPool(zoneId, !isElite);
            if (!picked) {
                configs.push({
                    id: 'slime',
                    zoneId,
                    name: 'Slime',
                    hp: 12,
                    atk: 3,
                    def: 0,
                    speed: 50,
                    aiType: MonsterAIType.Charger,
                    exp: 3,
                });
                continue;
            }

            const def = picked.def;
            let finalHP = def.hp;
            let finalATK = def.atk;

            if (isElite || picked.id.endsWith('Elite')) {
                finalHP = Math.floor(def.hp * (monsterScale.eliteHpMultiplier || 1.8));
                finalATK = Math.floor(def.atk * (monsterScale.eliteAtkMultiplier || 1.5));
            }

            configs.push({
                id: picked.id,
                zoneId,
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

    selectNextRoom(roomId: number): void {
        if (!this._floorState) return;

        const currentRoom = this._floorState.dag.rooms.get(this._floorState.currentRoomId);
        if (!currentRoom) return;

        if (!currentRoom.connections.includes(roomId)) {
            console.warn(`[DungeonManager] cannot select room ${roomId}: not connected`);
            return;
        }

        const isBattleRoom = currentRoom.type === RoomType.Normal || currentRoom.type === RoomType.Elite;
        if (isBattleRoom && this.battleManager && !this.battleManager.isRoomCleared) {
            console.warn('[DungeonManager] battle room is not cleared yet');
            return;
        }

        if (this.roomTransition) {
            this.roomTransition.exitRoom(() => this._enterRoom(roomId));
        } else {
            this._enterRoom(roomId);
        }
    }

    get currentRoom(): RoomNode | null {
        return this._floorState?.dag.rooms.get(this._floorState?.currentRoomId ?? -1) ?? null;
    }

    get floorState(): FloorState | null { return this._floorState; }
    get currentZone(): string { return this._currentZone; }
    get currentStageId(): string { return this._currentStageId; }

    debugCompareSeed(seed1: number, seed2: number): boolean {
        const dag1 = DAGGenerator.generate(seed1, 1);
        const dag2 = DAGGenerator.generate(seed2, 1);
        return dag1.rooms.size === dag2.rooms.size;
    }
}
