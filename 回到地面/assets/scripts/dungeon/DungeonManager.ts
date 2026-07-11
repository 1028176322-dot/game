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
import { RoomBuilder } from './RoomBuilder';
import { NavigationGrid } from './NavigationGrid';
import { RoomRuntime } from './RoomRuntime';
import { GameBootstrap } from '../core/GameBootstrap';

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

/**
 * @deprecated DungeonManager is a legacy shell. Room dispatch is now data-driven
 * (no switch, red line 2); floor/room generation still delegates to the legacy
 * DAGGenerator until the new DungeonGenerator five-class pipeline is wired at
 * runtime (P1-6). Runtime behavior is unchanged by this deprecation marker.
 */
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

    // P3-4-A: additive delegation to the new five-class pipeline (RoomRuntime).
    // The legacy DAGGenerator path above is unchanged; these runtimes are built
    // in parallel and exposed for later stages (navigation or asset lifecycle).
    private _roomRuntimes: RoomRuntime[] = [];
    private _enterCount = 0;

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

        this._buildRoomRuntimes(floorSeed, roomCount);

        this._enterRoom(dag.entryRoomId);
        eventBus.emit('dungeon:floor_generated', floorNumber, floorSeed, dag);

        if (floorNumber > 1) {
            eventBus.emit('mutation:generate', floorNumber);
        } else {
            eventBus.emit('mutation:cleared');
        }
    }

    // P3-4-A: build a RoomRuntime per generated room using the new five-class
    // pipeline (DungeonGenerator then RoomBuilder then NavigationGrid then RoomRuntime).
    // Pure additive: the legacy DAGGenerator floor logic is untouched.
    private _buildRoomRuntimes(floorSeed: number, roomCount: number): void {
        this._roomRuntimes = [];
        this._enterCount = 0;
        const ctx = GameBootstrap.context;
        if (!ctx) return;
        const layout = new DungeonGenerator().generate(floorSeed, this._currentZone, { roomCount });
        const builder = new RoomBuilder();
        for (const rl of layout.rooms) {
            const roomData = builder.build(rl);
            const nav = new NavigationGrid(roomData.tileMap);
            const rt = new RoomRuntime(roomData, nav);
            rt.initialize(ctx);
            this._roomRuntimes.push(rt);
        }
    }

    // Activate the RoomRuntime for the current enter sequence. The new pipeline room
    // order is not 1:1 with the legacy DAG room ids (different type vocabulary), so we
    // index by enter order; room assets and navigation are zone-homogeneous either way.
    private _activateRoomRuntime(): void {
        if (this._roomRuntimes.length === 0) return;
        const rt = this._roomRuntimes[this._enterCount % this._roomRuntimes.length];
        this._enterCount++;
        if (!rt) return;
        if (!rt.active) rt.enter();
        rt.load().catch((e) => console.warn(`[DungeonManager] room runtime load failed: ${e}`));
    }

    get roomRuntimes(): RoomRuntime[] {
        return this._roomRuntimes;
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

        this._activateRoomRuntime();

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

    // Data-driven room dispatch (replaces the switch in _onRoomEntered, red line 2:
    // no switch on room type). Each RoomType maps to a side effect; generation logic
    // is untouched. Built lazily and cached (handlers close over `this`/eventBus).
    private _roomHandlerMap: Map<RoomType, (room: RoomNode) => void> | null = null;
    private _roomHandlers(): Map<RoomType, (room: RoomNode) => void> {
        if (this._roomHandlerMap) return this._roomHandlerMap;
        this._roomHandlerMap = new Map<RoomType, (room: RoomNode) => void>([
            [RoomType.Normal, (r) => this._startBattleInRoom(r)],
            [RoomType.Elite, (r) => this._startBattleInRoom(r)],
            [RoomType.Boss, (r) => this._startBattleInRoom(r, true)],
            [RoomType.Treasure, (r) => eventBus.emit('room:treasure', r.id)],
            [RoomType.Healing, (r) => eventBus.emit('room:healing', r.id)],
            [RoomType.Shop, (r) => eventBus.emit('room:shop', r.id)],
            [RoomType.Upgrade, (r) => eventBus.emit('room:upgrade', r.id)],
            [RoomType.Event, (r) => eventBus.emit('room:event', r.id)],
        ]);
        return this._roomHandlerMap;
    }

    private _onRoomEntered(room: RoomNode): void {
        const handler = this._roomHandlers().get(room.type);
        if (handler) {
            handler(room);
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

    onDestroy(): void {
        for (const rt of this._roomRuntimes) {
            if (rt.active) rt.exit();
        }
        this._roomRuntimes = [];
    }
}
