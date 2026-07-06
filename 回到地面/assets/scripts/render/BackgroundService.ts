/**
 * BackgroundService — Load and apply background textures by semantic key.
 *
 * Usage:
 *   await BackgroundService.instance.apply(bgNode, 'background.forest.combat');
 */

import { Node, Sprite } from 'cc';
import { GameAssetService } from '../assets/GameAssetService';
import { RenderAssetService } from '../assets/RenderAssetService';

export class BackgroundService {
    private static _instance: BackgroundService | null = null;

    static get instance(): BackgroundService {
        if (!this._instance) this._instance = new BackgroundService();
        return this._instance;
    }

    /**
     * Apply a background image by semantic key.
     * Sets Sprite sizeMode to CUSTOM for proper scaling.
     */
    async apply(node: Node, backgroundKey: string): Promise<boolean> {
        const def = await GameAssetService.instance.get(backgroundKey);
        if (!def) {
            console.warn(`[BackgroundService] missing background key: ${backgroundKey}`);
            return false;
        }

        const frame = await RenderAssetService.applySpriteById(node, def.assetId);
        if (!frame) return false;

        const sprite = node.getComponent(Sprite);
        if (sprite) {
            sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        }

        return true;
    }
}
