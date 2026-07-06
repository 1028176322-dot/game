/**
 * IconService — Load and apply icons by semantic key.
 *
 * Usage:
 *   await IconService.instance.apply(iconNode, 'icon.skill.dash');
 */

import { Node } from 'cc';
import { GameAssetService } from '../assets/GameAssetService';
import { RenderAssetService } from '../assets/RenderAssetService';

export class IconService {
    private static _instance: IconService | null = null;

    static get instance(): IconService {
        if (!this._instance) this._instance = new IconService();
        return this._instance;
    }

    /**
     * Apply an icon image onto a node.
     *
     * @param node    Target node with Sprite component
     * @param iconKey Semantic key, e.g. 'icon.skill.dash' or 'icon.item.healingpotion'
     * @returns       true if loaded successfully
     */
    async apply(node: Node, iconKey: string): Promise<boolean> {
        const def = await GameAssetService.instance.get(iconKey);
        if (!def) {
            console.warn(`[IconService] missing icon key: ${iconKey}`);
            return false;
        }
        if (def.type !== 'icon') {
            console.warn(`[IconService] key is not icon type: ${iconKey}, type=${def.type}`);
            return false;
        }

        return (await RenderAssetService.applySpriteById(node, def.assetId)) !== null;
    }
}
