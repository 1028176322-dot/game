/**
 * AppFlowController - Application flow state machine (plain service, not Component)
 *
 * Single entry point for all scene/panel transitions.
 * UI code must NOT call director.loadScene() directly.
 */

import { SceneFlowService, SceneId } from './SceneFlowService';
import { eventBus } from '../core/EventBus';
import { PlatformService } from '../platform/PlatformService';
import { PlayerDataManager } from '../core/PlayerDataManager';

export enum AppFlowState {
    BOOT = 'BOOT',
    AUTH_CHECK = 'AUTH_CHECK',
    PROFILE_CHECK = 'PROFILE_CHECK',
    MAIN_HUB = 'MAIN_HUB',
    AREA_SELECT = 'AREA_SELECT',
    DUNGEON = 'DUNGEON',
    SETTLEMENT = 'SETTLEMENT',
}

export class AppFlowController {
    private static _instance: AppFlowController | null = null;
    private _currentState: AppFlowState = AppFlowState.BOOT;
    private _sceneFlow: SceneFlowService = SceneFlowService.instance;

    static get instance(): AppFlowController {
        if (!this._instance) this._instance = new AppFlowController();
        return this._instance;
    }

    static ensure(): AppFlowController {
        return this.instance;
    }

    get currentState(): AppFlowState {
        return this._currentState;
    }

    async start(): Promise<void> {
        console.log('[AppFlow] start flow');

        const platform = PlatformService.instance;
        if (platform.isWX) {
            const loggedIn = false;
            if (!loggedIn) {
                this._currentState = AppFlowState.AUTH_CHECK;
                await this._route();
                return;
            }
        }

        const pdm = PlayerDataManager.getInstance();
        if (pdm.isFirstTime()) {
            this._currentState = AppFlowState.PROFILE_CHECK;
            await this._route();
            return;
        }

        this._currentState = AppFlowState.MAIN_HUB;
        await this._route();
    }

    async goTo(state: AppFlowState): Promise<void> {
        this._currentState = state;
        await this._route();
    }

    async returnToMainHub(): Promise<void> {
        this._currentState = AppFlowState.MAIN_HUB;
        await this._route();
    }

    getTargetScene(): SceneId | null {
        switch (this._currentState) {
            case AppFlowState.BOOT:
                return 'splash';
            case AppFlowState.AUTH_CHECK:
            case AppFlowState.PROFILE_CHECK:
            case AppFlowState.MAIN_HUB:
            case AppFlowState.AREA_SELECT:
            case AppFlowState.SETTLEMENT:
                return 'main';
            case AppFlowState.DUNGEON:
                return 'dungeon';
            default:
                return null;
        }
    }

    private async _route(): Promise<void> {
        const target = this.getTargetScene();
        if (!target) return;

        if (this._sceneFlow.currentScene !== target) {
            await this._sceneFlow.goTo(target);
        }

        // Emit AFTER scene is loaded — MainSceneController listener is guaranteed ready
        eventBus.emit('appflow:state_changed', this._currentState);
    }
}
