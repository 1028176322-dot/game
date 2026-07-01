/**
 * SceneFlowService - Scene transition service
 *
 * ONLY class in the project allowed to call director.loadScene().
 * All other code must go through AppFlowController or RunCoordinator.
 *
 * Enforced by P0 Architecture Rule: rg "director\\.loadScene" | grep -v SceneFlowService
 */

import { _decorator, director } from 'cc';

const { ccclass } = _decorator;

export type SceneId = 'splash' | 'main' | 'dungeon';

@ccclass('SceneFlowService')
export class SceneFlowService {
    private static _instance: SceneFlowService | null = null;
    private _currentScene: SceneId = 'splash';

    static get instance(): SceneFlowService {
        if (!this._instance) this._instance = new SceneFlowService();
        return this._instance;
    }

    get currentScene(): SceneId {
        return this._currentScene;
    }

    /** Load splash scene (boot) */
    goToSplash(): void {
        this._load('splash');
    }

    /** Load main scene (hub) */
    goToMain(): void {
        this._load('main');
    }

    /** Load dungeon scene (run) */
    goToDungeon(): void {
        this._load('dungeon');
    }

    private _load(scene: SceneId): void {
        if (this._currentScene === scene) {
            console.warn(`[SceneFlow] already on scene: ${scene}`);
            return;
        }
        console.log(`[SceneFlow] transitioning: ${this._currentScene} -> ${scene}`);
        this._currentScene = scene;
        director.loadScene(scene);
    }
}
