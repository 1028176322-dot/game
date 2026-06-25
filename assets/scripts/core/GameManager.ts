/**
 * GameManager - 游戏全局管理器（单例）
 * 负责游戏阶段流转、场景切换、全局生命周期
 */

import { _decorator, Component, Node, director } from 'cc';
import { GamePhase, BATTLE_CONSTANTS } from './Constants';
import { eventBus } from './EventBus';

const { ccclass, property } = _decorator;

export enum GameEvent {
    PHASE_CHANGED = 'game:phaseChanged',
    SAVE_REQUESTED = 'game:saveRequested',
    GAME_OVER = 'game:gameOver',
    DUNGEON_ENTER = 'game:dungeonEnter',
    DUNGEON_EXIT = 'game:dungeonExit',
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

    /** 获取当前阶段 */
    get currentPhase(): GamePhase { return this._currentPhase; }

    /** 获取当前层数 */
    get currentFloor(): number { return this._currentFloor; }

    /** 切换游戏阶段（统一方法，禁止散落赋值） */
    setPhase(phase: GamePhase): void {
        const oldPhase = this._currentPhase;
        this._currentPhase = phase;
        eventBus.emit(GameEvent.PHASE_CHANGED, phase, oldPhase);
    }

    /** 进入下一层 */
    nextFloor(): void {
        this._currentFloor++;
        eventBus.emit('floor:changed', this._currentFloor);
    }

    /** 重置游戏状态（新的一局） */
    resetGame(): void {
        this._currentFloor = 1;
        this._currentPhase = GamePhase.Dungeon;
        this._isPaused = false;
    }

    /** 暂停/恢复 */
    setPaused(paused: boolean): void {
        this._isPaused = paused;
    }

    get isPaused(): boolean { return this._isPaused; }
}
