/**
 * CharacterVisualService — Load and display characters by semantic key.
 *
 * Supports two visual modes:
 *   - 'sheet': legacy sprite sheet animation via SpriteAnimationService.
 *   - 'parts': modular part animation via PartCharacterRenderer + PartAnimationPlayer.
 *
 * Usage:
 *   await CharacterVisualService.instance.applyStatic(node, 'character.warrior.idle');
 *   await CharacterVisualService.instance.play(node, 'character.warrior.idle');
 */

import { JsonAsset, Node, resources } from 'cc';
import { GameAssetService } from '../assets/GameAssetService';
import { RenderAssetService } from '../assets/RenderAssetService';
import { SpriteAnimationService } from './SpriteAnimationService';
import { PartAnimation, PartAnimationPlayer } from './PartAnimationPlayer';
import { CharacterParts, CharacterRig, PartCharacterRenderer } from './PartCharacterRenderer';

interface CharacterVisualConfig {
    mode: 'parts' | 'sheet';
    partsKey?: string;
    rigKey?: string;
    animationsKey?: string;
}

export class CharacterVisualService {
    private static _instance: CharacterVisualService | null = null;

    static get instance(): CharacterVisualService {
        if (!this._instance) this._instance = new CharacterVisualService();
        return this._instance;
    }

    private _visuals: Record<string, CharacterVisualConfig> = {};
    private _parts: Record<string, CharacterParts> = {};
    private _rigs: Record<string, CharacterRig> = {};
    private _animations: Record<string, Record<string, PartAnimation>> = {};
    private _loaded = false;
    private _loading: Promise<void> | null = null;

    /**
     * Load character visual configs (visuals, parts, rigs, animations).
     * Safe to call multiple times.
     */
    async loadAll(): Promise<void> {
        if (this._loaded) return;
        if (this._loading) return this._loading;

        this._loading = this._doLoad();
        return this._loading;
    }

    private async _doLoad(): Promise<void> {
        try {
            const [visuals, parts, rigs, anims] = await Promise.all([
                this._loadJson('config/character_visuals'),
                this._loadJson('config/character_parts'),
                this._loadJson('config/character_rigs'),
                this._loadJson('config/character_part_animations'),
            ]);

            this._visuals = visuals as Record<string, CharacterVisualConfig>;
            this._parts = parts as Record<string, CharacterParts>;
            this._rigs = rigs as Record<string, CharacterRig>;
            this._animations = anims as Record<string, Record<string, PartAnimation>>;
            this._loaded = true;
        } catch (err) {
            console.warn('[CharacterVisualService] failed to load part configs:', err);
            this._loaded = true;
        }
    }

    private _loadJson(path: string): Promise<Record<string, unknown>> {
        return new Promise((resolve, reject) => {
            resources.load(path, JsonAsset, (err, asset) => {
                if (err || !asset) {
                    reject(err ?? new Error(`load ${path} failed`));
                    return;
                }
                const raw = asset.json as Record<string, unknown> | { data?: Record<string, unknown> };
                const data = 'data' in raw && raw.data ? raw.data : raw as Record<string, unknown>;
                resolve(data);
            });
        });
    }

    /**
     * Apply a single static frame onto a node.
     */
    async applyStatic(node: Node, visualKey: string): Promise<boolean> {
        const parsed = this._parseKey(visualKey);
        if (parsed) {
            const visual = await this._getVisualConfig(parsed.id);
            if (visual?.mode === 'parts') {
                return this._applyPartsStatic(node, parsed.id);
            }
        }

        const def = await GameAssetService.instance.get(visualKey);
        if (!def) {
            console.warn(`[CharacterVisualService] missing visual key: ${visualKey}`);
            return false;
        }
        return (await RenderAssetService.applySpriteById(node, def.assetId)) !== null;
    }

    /**
     * Apply preview frame (frame 0) from a sprite sheet — used in cards and selection UI.
     * For parts mode, this assembles the rig in its default pose.
     */
    async applyPreviewFrame(node: Node, visualKey: string): Promise<boolean> {
        const parsed = this._parseKey(visualKey);
        if (parsed) {
            const visual = await this._getVisualConfig(parsed.id);
            if (visual?.mode === 'parts') {
                return this._applyPartsStatic(node, parsed.id);
            }
        }

        const def = await GameAssetService.instance.get(visualKey);
        if (!def) {
            console.warn(`[CharacterVisualService] applyPreviewFrame: missing key ${visualKey}`);
            return false;
        }
        return SpriteAnimationService.instance.applyFrameByAssetDef(node, def, 0);
    }

    /**
     * Play an animation on a node.
     * Falls back to static frame if the asset is not a sprite sheet.
     */
    async play(node: Node, visualKey: string, fps: number = 8): Promise<boolean> {
        const parsed = this._parseKey(visualKey);
        if (parsed) {
            const visual = await this._getVisualConfig(parsed.id);
            if (visual?.mode === 'parts') {
                return this._playParts(node, parsed.id, parsed.action);
            }
        }

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

    private _parseKey(visualKey: string): { id: string; action: string } | null {
        const match = visualKey.match(/^character\.(\w+)\.(\w+)$/);
        if (!match) return null;
        return { id: match[1], action: match[2] };
    }

    private async _getVisualConfig(id: string): Promise<CharacterVisualConfig | null> {
        await this.loadAll();
        return this._visuals[id] ?? null;
    }

    private async _applyPartsStatic(node: Node, characterId: string): Promise<boolean> {
        await this.loadAll();
        const visual = this._visuals[characterId];
        const parts = visual?.partsKey ? this._parts[visual.partsKey] : null;
        const rig = visual?.rigKey ? this._rigs[visual.rigKey] : null;
        if (!parts || !rig) {
            console.warn(`[CharacterVisualService] missing parts/rig for ${characterId}`);
            return false;
        }

        let renderer = node.getComponent(PartCharacterRenderer);
        if (!renderer) {
            renderer = node.addComponent(PartCharacterRenderer);
        }
        await renderer.setup(characterId, parts, rig);
        renderer.resetToRig();
        return true;
    }

    private async _playParts(node: Node, characterId: string, action: string): Promise<boolean> {
        await this.loadAll();
        const visual = this._visuals[characterId];
        const parts = visual?.partsKey ? this._parts[visual.partsKey] : null;
        const rig = visual?.rigKey ? this._rigs[visual.rigKey] : null;
        const anims = visual?.animationsKey ? this._animations[visual.animationsKey] : null;
        const anim = anims?.[action];

        if (!parts || !rig) {
            console.warn(`[CharacterVisualService] missing parts/rig for ${characterId}`);
            return false;
        }

        let renderer = node.getComponent(PartCharacterRenderer);
        if (!renderer || renderer.getCharacterId() !== characterId) {
            renderer = node.getComponent(PartCharacterRenderer);
            if (!renderer) renderer = node.addComponent(PartCharacterRenderer);
            await renderer.setup(characterId, parts, rig);
        }

        let player = node.getComponent(PartAnimationPlayer);
        if (!player) {
            player = node.addComponent(PartAnimationPlayer);
            player.setup(renderer);
        }

        if (anim) {
            player.play(anim);
        } else {
            renderer.resetToRig();
        }
        return true;
    }
}
