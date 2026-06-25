/**
 * GameManager - 游戏全局管理器（单例）
 * 负责游戏阶段流转、场景切换、全局生命周期
 * Phase 3: 新增区域/小关追踪
 */

import { _decorator, Component, Node, director } from 'cc';
import { GamePhase } from './Constants';
import { eventBus } from './EventBus';
import { ConfigManager } from './ConfigManager';

const { ccclass, property } = _decorator;

export enum GameEvent {
    PHASE_CHANGED = 'game:phaseChanged',
    SAVE_REQUESTED = 'game:saveRequested',
    GAME_OVER = 'game:gameOver',
    DUNGEON_ENTER = 'game:dungeonEnter',
    DUNGEON_EXIT = 'game:dungeonExit',
    ZONE_CHANGED = 'zone:changed',
    STAGE_CHANGED = 'stage:changed',
    ZONE_BOSS_DEFEATED = 'zone:bossDefeated',
    ALL_ZONES_CLEARED = 'zone:allCleared',
}

@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager | null = null;

    /** 当前游戏阶段 */
    private _currentPhase: GamePhase = GamePhase.Splash;
    /** 当前地牢层数 */
    private _currentFloor: number = 1;
    /** 游戏是否暂停 */
    private _isPaused: boolean = false;

    // ======== Phase 3: 区域/小关系统 ========

    /** 本局游戏选择的区域路线（如: ['forest', 'catacombs', 'volcano']） */
    private _zoneRoute: string[] = [];
    /** 当前所在区域在路线中的索引 */
    private _zoneIndex: number = 0;
    /** 当前所在小关ID（如 'F1-1'） */
    private _currentStageId: string = '';
    /** 当前区域内已完成的小关索引 */
    private _stageIndex: number = 0;
    /** 当前区域内的小关列表 */
    private _stageIds: string[] = [];

    static get instance(): GameManager {
        return GameManager._instance!;
    }

    onLoad(): void {
        if (GameManager._instance) {
            this.destroy();
            return;
        }
        GameManager._instance = this;
        director.addPersistRootNode(this.node);
    }

    onDestroy(): void {
        if (GameManager._instance === this) {
            GameManager._instance = null;
        }
    }

    get currentPhase(): GamePhase { return this._currentPhase; }
    get currentFloor(): number { return this._currentFloor; }

    // ======== 区域/小关访问器 ========

    /** 当前区域 ID */
    get currentZone(): string {
        return this._zoneRoute[this._zoneIndex] || 'forest';
    }

    /** 当前区域定义 */
    get currentZoneDef() {
        return ConfigManager.getInstance().getZoneDef(this.currentZone);
    }

    /** 当前小关 ID */
    get currentStageId(): string { return this._currentStageId; }

    /** 当前小关配置 */
    get currentStageDef() {
        const cfg = ConfigManager.getInstance();
        const stages = cfg.getStages(this.currentZone);
        return stages ? stages[this._currentStageId] : null;
    }

    /** 整条区域路线 */
    get zoneRoute(): string[] { return [...this._zoneRoute]; }

    /** 当前区域在路线中的索引 */
    get zoneIndex(): number { return this._zoneIndex; }

    /** 当前区域的小关列表 */
    get stageIds(): string[] { return [...this._stageIds]; }

    /** 当前小关索引 */
    get stageIndex(): number { return this._stageIndex; }

    /** 是否为最后一个区域 */
    get isLastZone(): boolean {
        return this._zoneIndex >= this._zoneRoute.length - 1;
    }

    /** 是否为当前区域的最后一个小关 */
    get isLastStageInZone(): boolean {
        return this._stageIndex >= this._stageIds.length - 1;
    }

    /** 当前终结 Boss 配置 */
    get currentFinalBoss() {
        return ConfigManager.getInstance().getFinalBoss(this.currentZone);
    }

    // ======== 游戏初始化 ========

    /** 初始化新的一局（选择区域路线） */
    initNewRun(): string[] {
        this._currentFloor = 1;
        this._currentPhase = GamePhase.Dungeon;
        this._isPaused = false;

        // 使用 ConfigManager 选择区域路线
        this._zoneRoute = ConfigManager.getInstance().selectZoneRoute();
        this._zoneIndex = 0;

        // 进入第一个区域的第一个小关
        this._enterZone(0);

        return this._zoneRoute;
    }

    /** 重置游戏状态（兼容旧接口） */
    resetGame(): void {
        this.initNewRun();
    }

    // ======== 区域/小关推进 ========

    /**
     * 进入指定索引的区域
     */
    private _enterZone(zoneIndex: number): void {
        if (zoneIndex >= this._zoneRoute.length) {
            // 所有区域已完成 → 通关!
            eventBus.emit(GameEvent.ALL_ZONES_CLEARED);
            return;
        }

        this._zoneIndex = zoneIndex;
        const zoneId = this._zoneRoute[zoneIndex];
        const cfg = ConfigManager.getInstance();
        this._stageIds = cfg.getStageIds(zoneId);
        this._stageIndex = 0;
        this._currentStageId = this._stageIds[0] || '';
        this._currentFloor = 1;

        eventBus.emit(GameEvent.ZONE_CHANGED, zoneId, zoneIndex);
    }

    /** 推进到当前区域的下一个小关 */
    advanceStage(): boolean {
        const zoneId = this.currentZone;
        const cfg = ConfigManager.getInstance();
        const stages = cfg.getStages(zoneId);
        if (!stages) return false;

        // 下一关
        this._stageIndex++;
        if (this._stageIndex >= this._stageIds.length) {
            // 当前区域完成，触发终结 Boss
            eventBus.emit(GameEvent.ZONE_BOSS_DEFEATED, zoneId);
            return false; // 需要挑战终结Boss
        }

        this._currentStageId = this._stageIds[this._stageIndex];
        this._currentFloor++;
        eventBus.emit(GameEvent.STAGE_CHANGED, this._currentStageId, this._stageIndex);
        return true; // 进入下一个小关
    }

    /** 击败当前区域的终结 Boss → 进入下一个区域 */
    advanceToNextZone(): boolean {
        const nextIdx = this._zoneIndex + 1;
        if (nextIdx >= this._zoneRoute.length) {
            // 所有区域通关!
            eventBus.emit(GameEvent.ALL_ZONES_CLEARED);
            return false;
        }

        this._enterZone(nextIdx);
        return true;
    }

    // ======== 阶段切换 ========

    setPhase(phase: GamePhase): void {
        const oldPhase = this._currentPhase;
        this._currentPhase = phase;
        eventBus.emit(GameEvent.PHASE_CHANGED, phase, oldPhase);
    }

    nextFloor(): void {
        this._currentFloor++;
        eventBus.emit('floor:changed', this._currentFloor);
    }

    setPaused(paused: boolean): void {
        this._isPaused = paused;
    }

    get isPaused(): boolean { return this._isPaused; }
}
