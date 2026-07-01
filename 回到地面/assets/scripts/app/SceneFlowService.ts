/**
 * SceneFlowService - Scene transition service (Promise-based)
 *
 * ONLY class in the project allowed to call director.loadScene().
 * All other code must go through AppFlowController or RunCoordinator.
 *
 * Returns Promise<void> so callers can await scene load completion
 * before emitting events (fixes "event before listener registered" bug).
 */

import { director } from 'cc';

export type SceneId = 'splash' | 'main' | 'dungeon';

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

    goToSplash(): Promise<void> {
        return this._load('splash');
    }

    goToMain(): Promise<void> {
        return this._load('main');
    }

    goToDungeon(): Promise<void> {
        return this._load('dungeon');
    }

    /** Unified scene transition returning Promise on completion */
    goTo(scene: SceneId): Promise<void> {
        return this._load(scene);
    }

    private _load(scene: SceneId): Promise<void> {
        if (this._currentScene === scene) {
            console.warn(`[SceneFlow] already on scene: ${scene}`);
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            console.log(`[SceneFlow] transitioning: ${this._currentScene} -> ${scene}`);
            director.loadScene(scene, (err: any) => {
                if (err) {
                    console.error(`[SceneFlow] failed to load scene: ${scene}`, err);
                    reject(err);
                    return;
                }
                this._currentScene = scene;
                resolve();
            });
        });
    }
}
