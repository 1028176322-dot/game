/**
 * CharacterVisualService — Load and display character sprite sheets by semantic key.
 *
 * Usage:
 *   await CharacterVisualService.instance.applyStatic(node, 'character.warrior.idle');
 *   await CharacterVisualService.instance.play(node, 'character.warrior.idle');
 */

import { Node } from 'cc';
import { GameAssetService } from '../assets/GameAssetService';
import { RenderAssetService } from '../assets/RenderAssetService';
import { SpriteAnimationService } from './SpriteAnimationService';

export class CharacterVisualService {
    private static _instance: CharacterVisualService | null = null;

    static get instance(): CharacterVisualService {
        if (!this._instance) this._instance = new CharacterVisualService();
        return this._instance;
    }

    /**
     * Apply a single static frame onto a node.
     */
    async applyStatic(node: Node, visualKey: string): Promise<boolean> {
        const def = await GameAssetService.instance.get(visualKey);
        if (!def) {
            console.warn(`[CharacterVisualService] missing visual key: ${visualKey}`);
            return false;
        }
        return (await RenderAssetService.applySpriteById(node, def.assetId)) !== null;
    }

    /**
     * Play a sprite sheet animation on a node.
     * Falls back to static frame if the asset is not a sprite_sheet.
     */
    async play(node: Node, visualKey: string, fps: number = 8): Promise<boolean> {
        const def = await GameAssetService.instance.get(visualKey);
        if (!def) {
            console.warn(`[CharacterVisualService] missing visual key: ${visualKey}`);
            return false;
        }

        if (def.type === 'sprite_sheet') {
            return SpriteAnimationService.instance.playByAssetDef(node, def, {
                loop: true,
                fps,
            });
        }

        return this.applyStatic(node, visualKey);
    }
}
