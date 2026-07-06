/**
 * EffectService — Play visual effects by semantic key.
 *
 * Creates a temporary node in the effect layer, plays the sprite sheet,
 * and auto-destroys on completion.
 *
 * Usage:
 *   await EffectService.instance.play(effectLayer, 'effect.reaction.burn', worldPos);
 */

import { Node, Vec3 } from 'cc';
import { GameAssetService, GameAssetDef } from '../assets/GameAssetService';
import { SpriteAnimationService } from './SpriteAnimationService';

export class EffectService {
    private static _instance: EffectService | null = null;

    static get instance(): EffectService {
        if (!this._instance) this._instance = new EffectService();
        return this._instance;
    }

    /**
     * Play an effect at a world position.
     *
     * @param effectLayer Parent node for the effect (e.g. EffectLayer)
     * @param effectKey   Semantic key, e.g. 'effect.reaction.burn'
     * @param worldPos    World position to place the effect at
     * @returns           The effect node, or null if failed
     */
    async play(effectLayer: Node, effectKey: string, worldPos: Vec3): Promise<Node | null> {
        const def = await GameAssetService.instance.get(effectKey);
        if (!def) {
            console.warn(`[EffectService] missing effect key: ${effectKey}`);
            return null;
        }

        const node = new Node(`Effect_${effectKey.replace(/\./g, '_')}`);
        effectLayer.addChild(node);
        node.setPosition(worldPos);

        if (def.type === 'effect_sheet' || def.type === 'sprite_sheet') {
            const ok = await SpriteAnimationService.instance.playByAssetDef(node, def, {
                loop: def.loop ?? false,
                fps: 12,
                destroyOnComplete: true,
            });

            if (!ok) {
                node.destroy();
                return null;
            }
        } else {
            // Single-frame effect
            const { RenderAssetService } = await import('../assets/RenderAssetService');
            const ok = await RenderAssetService.applySpriteById(node, def.assetId);
            if (!ok) {
                node.destroy();
                return null;
            }
        }

        return node;
    }

    /**
     * Preload an effect definition so the first play() is faster.
     */
    async preload(effectKey: string): Promise<void> {
        const def = await GameAssetService.instance.get(effectKey);
        if (!def) return;
        const { AssetBundleService } = await import('../assets/AssetBundleService');
        try {
            await AssetBundleService.instance.tryLoadSpriteFrame(def.assetId);
        } catch {
            // Preload failure is non-critical
        }
    }
}
