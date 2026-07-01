import { Component, Graphics, Node, Sprite, SpriteFrame, Texture2D, UITransform } from 'cc';
import { TerrainType } from '../core/Constants';
import { AssetBundleService } from './AssetBundleService';
import { ArtResourceResolver, CharacterAction, MonsterAction } from './ArtResourceResolver';
import { getSheetInfo, createFrameFromSheet } from './SpriteSheetUtil';

export class RenderAssetService {
    static async applySpriteById(node: Node, resourceId: string): Promise<SpriteFrame | null> {
        const sprite = this._ensureSprite(node);
        const frame = await AssetBundleService.instance.tryLoadSpriteFrame(resourceId);
        if (!frame || !node.isValid) return null;

        sprite.spriteFrame = frame;
        const graphics = node.getComponent(Graphics);
        if (graphics) graphics.enabled = false;
        return frame;
    }

    static async applyCharacterSprite(node: Node, characterId: string, action: CharacterAction = 'idle'): Promise<SpriteFrame | null> {
        const resourceId = ArtResourceResolver.character(characterId, action);
        const sheetInfo = getSheetInfo(resourceId);

        if (sheetInfo) {
            // Multi-frame sprite sheet: load the first frame
            return this._applySpriteSheetFrame(node, resourceId, sheetInfo, 0);
        }

        // Normal single-frame path
        return this.applySpriteById(node, resourceId);
    }

    /**
     * Load a multi-frame sprite sheet and apply only one frame.
     */
    private static async _applySpriteSheetFrame(
        node: Node,
        resourceId: string,
        sheetInfo: { frameWidth: number; frameHeight: number; frameCount: number },
        frameIndex: number,
    ): Promise<SpriteFrame | null> {
        const sprite = this._ensureSprite(node);
        const fullFrame = await AssetBundleService.instance.tryLoadSpriteFrame(resourceId);
        if (!fullFrame || !node.isValid) return null;

        const texture = fullFrame.texture;
        if (!texture) {
            console.warn(`[RenderAssetService] sprite sheet has no texture: ${resourceId}`);
            return null;
        }

        const sliced = createFrameFromSheet(texture, sheetInfo.frameWidth, sheetInfo.frameHeight, frameIndex);
        sprite.spriteFrame = sliced;
        const graphics = node.getComponent(Graphics);
        if (graphics) graphics.enabled = false;
        return sliced;
    }

    static async applyMonsterSprite(node: Node, zoneId: string, monsterId: string, action: MonsterAction = 'idle'): Promise<SpriteFrame | null> {
        return this.applySpriteById(node, ArtResourceResolver.monster(zoneId, monsterId, action));
    }

    static async applyTileSprite(node: Node, zoneId: string, terrain: TerrainType): Promise<SpriteFrame | null> {
        return this.applySpriteById(node, ArtResourceResolver.tile(zoneId, terrain));
    }

    static async applyTextureAsSprite(node: Node, resourceId: string): Promise<SpriteFrame | null> {
        try {
            const texture = await AssetBundleService.instance.loadById<Texture2D>(resourceId);
            if (!node.isValid) return null;
            const frame = new SpriteFrame();
            frame.texture = texture;
            const sprite = this._ensureSprite(node);
            sprite.spriteFrame = frame;
            return frame;
        } catch (err) {
            console.warn(`[RenderAssetService] texture sprite load failed: ${resourceId}`, err);
            return null;
        }
    }

    private static _ensureComponent<T extends Component>(node: Node, type: any): T {
        let comp = node.getComponent(type) as T | null;
        if (!comp) comp = node.addComponent(type) as T;
        return comp;
    }

    private static _ensureSprite(node: Node): Sprite {
        const existing = node.getComponent(Sprite);
        if (existing) return existing;

        if (!node.getComponent(Graphics)) {
            return node.addComponent(Sprite);
        }

        let visual = node.getChildByName('SpriteVisual');
        if (!visual) {
            visual = new Node('SpriteVisual');
            node.addChild(visual);
            const parentTransform = node.getComponent(UITransform);
            const transform = visual.addComponent(UITransform);
            if (parentTransform) {
                transform.setContentSize(parentTransform.contentSize);
            }
        }

        return visual.getComponent(Sprite) ?? visual.addComponent(Sprite);
    }
}
