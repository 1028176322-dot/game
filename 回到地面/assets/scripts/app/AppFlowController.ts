/**
 * AppFlowController - Application flow state machine
 *
 * Single entry point for all scene/panel transitions.
 * UI code must NOT call director.loadScene() directly.
 *
 * Flow states:
 *   BOOT -> AUTH_CHECK -> PROFILE_CHECK -> MAIN_HUB -> AREA_SELECT -> DUNGEON -> SETTLEMENT -> MAIN_HUB (loop)
 */

import { _decorator, Component } from 'cc';
import { SceneFlowService, SceneId } from './SceneFlowService';
import { eventBus } from '../core/EventBus';

const { ccclass } = _decorator;

export enum AppFlowState {
    BOOT = 'BOOT',
    AUTH_CHECK = 'AUTH_CHECK',
    PROFILE_CHECK = 'PROFILE_CHECK',
    MAIN_HUB = 'MAIN_HUB',
    AREA_SELECT = 'AREA_SELECT',
    DUNGEON = 'DUNGEON',
    SETTLEMENT = 'SETTLEMENT',
}

@ccclass('AppFlowController')
export class AppFlowController extends Component {
    private static _instance: AppFlowController | null = null;
    private _currentState: AppFlowState = AppFlowState.BOOT;
    private _sceneFlow: SceneFlowService = SceneFlowService.instance;

    static get instance(): AppFlowController {
        return this._instance!;
    }

    static ensure(): AppFlowController {
        if (!this._instance) {
            this._instance = new AppFlowController();
        }
        return this._instance;
    }

    get currentState(): AppFlowState {
        return this._currentState;
    }

    /** Start the flow machine from boot */
    start(): void {
        console.log('[AppFlow] start from BOOT');
        this._currentState = AppFlowState.AUTH_CHECK;
        this._route();
    }

    /** Navigate to a specific flow state. Panel code uses this instead of director.loadScene(). */
    goTo(state: AppFlowState): void {
        console.log(`[AppFlow] goTo: ${this._currentState} -> ${state}`);
        this._currentState = state;
        this._route();
    }

    /** Return to main hub (from settlement, cancel, etc.) */
    returnToMainHub(): void {
        console.log('[AppFlow] return to main hub');
        this._currentState = AppFlowState.MAIN_HUB;
        this._route();
    }

    /** Get target scene for current state */
    getTargetScene(): SceneId | null {
        switch (this._currentState) {
            case AppFlowState.BOOT:
            case AppFlowState.AUTH_CHECK:
            case AppFlowState.PROFILE_CHECK:
                return 'splash';
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

    private _route(): void {
        const target = this.getTargetScene();
        if (!target) {
            console.warn('[AppFlow] no target scene for state:', this._currentState);
            return;
        }

        if (this._sceneFlow.currentScene !== target) {
            switch (target) {
                case 'splash':
                    this._sceneFlow.goToSplash();
                    break;
                case 'main':
                    this._sceneFlow.goToMain();
                    break;
                case 'dungeon':
                    this._sceneFlow.goToDungeon();
                    break;
            }
        }

        // Emit state change event for panel/hub code to react
        eventBus.emit('appflow:state_changed', this._currentState);
    }
}
