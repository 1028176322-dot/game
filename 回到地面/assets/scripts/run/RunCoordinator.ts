/**
 * RunCoordinator - Single entry point for starting a dungeon run
 *
 * All dungeon entry must go through startRun(config).
 * This replaces: GameManager.initNewRun(), eventBus.emit(DUNGEON_ENTER), direct director.loadScene('dungeon').
 */

import { _decorator } from 'cc';
import { RunStartConfig, createDefaultRunConfig } from './RunStartConfig';
import { AppFlowController, AppFlowState } from '../app/AppFlowController';
import { SceneFlowService } from '../app/SceneFlowService';
import { ComplianceService } from '../platform/ComplianceService';
import { T } from '../core/TextManager';

const { ccclass } = _decorator;

export interface DungeonRunState {
    config: RunStartConfig;
    currentFloor: number;
    currentZoneIndex: number;
    totalKills: number;
    runSoulStones: number;
    elapsed: number;
    isActive: boolean;
}

@ccclass('RunCoordinator')
export class RunCoordinator {
    private static _instance: RunCoordinator | null = null;
    private _state: DungeonRunState | null = null;

    static get instance(): RunCoordinator {
        if (!this._instance) this._instance = new RunCoordinator();
        return this._instance;
    }

    get state(): DungeonRunState | null {
        return this._state;
    }

    /** Start a new dungeon run with the given config */
    startRun(config: RunStartConfig): void {
        console.log('[RunCoordinator] start run:', config.characterId, config.zoneRoute.join('->'));

        // Compliance check before entering dungeon
        const compliance = ComplianceService.instance;
        const canStart = compliance.canStartRun();
        if (canStart === false) {
            console.warn('[RunCoordinator] compliance blocked, returning to main hub');
            AppFlowController.instance.goTo(AppFlowState.MAIN_HUB);
            return;
        }
        if (canStart === 'need_recheck') {
            // Async re-check while entering
            const userId = ''; // will be populated by platform adapter
            compliance.refreshCheck(userId).then((result) => {
                if (!result.isAllowed) {
                    AppFlowController.instance.goTo(AppFlowState.MAIN_HUB);
                }
            });
        }

        this._state = {
            config,
            currentFloor: 1,
            currentZoneIndex: 0,
            totalKills: 0,
            runSoulStones: 0,
            elapsed: 0,
            isActive: true,
        };

        // Update AppFlow state
        const appFlow = AppFlowController.instance;
        if (appFlow) {
            appFlow.goTo(AppFlowState.DUNGEON);
        } else {
            // Fallback: direct scene load (only if AppFlow not available)
            SceneFlowService.instance.goToDungeon();
        }
    }

    /** Get the current zone ID */
    getCurrentZone(): string {
        if (!this._state) return 'forest';
        return this._state.config.zoneRoute[this._state.currentZoneIndex] ?? 'forest';
    }

    /** Advance to next floor */
    advanceFloor(): void {
        if (this._state) this._state.currentFloor++;
    }

    /** Advance to next zone */
    advanceZone(): boolean {
        if (!this._state) return false;
        const nextIdx = this._state.currentZoneIndex + 1;
        if (nextIdx >= this._state.config.zoneRoute.length) {
            return false; // all zones cleared
        }
        this._state.currentZoneIndex = nextIdx;
        this._state.currentFloor = 1;
        return true;
    }

    /** Add kills */
    addKills(count: number): void {
        if (this._state) this._state.totalKills += count;
    }

    /** Add soul stones */
    addSoulStones(amount: number): void {
        if (this._state) this._state.runSoulStones += amount;
    }

    /** End the current run (death or victory) */
    endRun(): void {
        if (this._state) this._state.isActive = false;
    }

    /** Get run result for settlement */
    getRunResult() {
        if (!this._state) return null;
        return {
            isVictory: false,
            characterName: this._state.config.characterName,
            zoneName: this.getCurrentZone(),
            floorReached: this._state.currentFloor,
            kills: this._state.totalKills,
            soulStones: this._state.runSoulStones,
            elapsed: this._state.elapsed,
        };
    }
}
