/**
 * SpriteAnimationService - JSON config-driven sprite animation player
 *
 * Fixed: uses AssetBundleService.loadById(), adds SpriteFrame cache,
 * removes @ccclass (plain service, not Component).
 */

import { Node, Sprite, SpriteFrame, Texture2D, Rect, JsonAsset, resources } from 'cc';
import { AssetBundleService } from '../assets/AssetBundleService';
import { GameAssetDef } from '../assets/GameAssetService';

export interface AnimationConfig {
    id: string;
    resource: string;
    frameWidth: number;
    frameHeight: number;
    frames: number;
    fps: number;
    loop: boolean;
    layout: 'vertical' | 'horizontal';
}

export interface AnimationPlayOptions {
    onComplete?: () => void;
    onFrame?: (frameIndex: number) => void;
}

export interface PlayAssetDefOptions {
    loop?: boolean;
    fps?: number;
    destroyOnComplete?: boolean;
}

interface ActiveAnimation {
    config: AnimationConfig;
    node: Node;
    sprite: Sprite;
    currentFrame: number;
    elapsed: number;
    options: AnimationPlayOptions;
    done: boolean;
}

export class SpriteAnimationService {
    private static _instance: SpriteAnimationService | null = null;
    private _configs = new Map<string, AnimationConfig>();
    private _active = new Map<Node, ActiveAnimation>();
    private _frameCache = new Map<string, SpriteFrame>();
    private _loaded = false;

    static get instance(): SpriteAnimationService {
        if (!this._instance) this._instance = new SpriteAnimationService();
        return this._instance;
    }

    async loadAll(): Promise<void> {
        if (this._loaded) return;
        try {
            const cfg = await this._fetchConfig();
            if (cfg) {
                for (const anim of cfg) {
                    this._configs.set(anim.id, anim);
                }
            }
            this._loaded = true;
            console.log(`[SpriteAnim] loaded ${this._configs.size} animations`);
        } catch (err) {
            console.warn('[SpriteAnim] failed to load configs:', err);
        }
    }

    getConfig(id: string): AnimationConfig | null {
        return this._configs.get(id) ?? null;
    }

    async play(node: Node, animId: string, options?: AnimationPlayOptions): Promise<void> {
        const config = this._configs.get(animId);
        if (!config) return;

        let sprite = node.getComponent(Sprite);
        if (!sprite) sprite = node.addComponent(Sprite);

        const frame = await this._loadSpriteFrame(config, 0);
        if (frame) sprite.spriteFrame = frame;

        this._active.set(node, {
            config, node, sprite,
            currentFrame: 0, elapsed: 0,
            options: options ?? {}, done: false,
        });
    }

    stop(node: Node): void { this._active.delete(node); }

    isPlaying(node: Node): boolean { return this._active.has(node); }

    stopAll(): void { this._active.clear(); }

    /**
     * Play an animation from a GameAssetDef (used by CharacterVisualService / EffectService).
     *
     * Builds an AnimationConfig from the GameAssetDef and plays it.
     * Falls back to single frame if def is not a sprite sheet.
     */
    async playByAssetDef(node: Node, def: GameAssetDef, options?: PlayAssetDefOptions): Promise<boolean> {
        if (!def.assetId || !def.frameWidth || !def.frameHeight || !def.frames) {
            console.warn('[SpriteAnimationService] playByAssetDef: invalid def', def);
            return false;
        }

        const config: AnimationConfig = {
            id: def.assetId,
            resource: def.assetId,
            frameWidth: def.frameWidth,
            frameHeight: def.frameHeight,
            frames: def.frames,
            fps: options?.fps ?? 8,
            loop: options?.loop ?? true,
            layout: (def.layout as 'vertical' | 'horizontal') ?? 'vertical',
        };

        let sprite = node.getComponent(Sprite);
        if (!sprite) sprite = node.addComponent(Sprite);

        const frame = await this._loadSpriteFrame(config, 0);
        if (frame) sprite.spriteFrame = frame;

        // If destroyOnComplete, schedule auto-removal after animation ends
        const destroyOnComplete = options?.destroyOnComplete ?? false;

        this._active.set(node, {
            config, node, sprite,
            currentFrame: 0, elapsed: 0,
            options: {
                onComplete: destroyOnComplete ? () => {
                    if (node.isValid) node.destroy();
                } : undefined,
            },
            done: false,
        });

        return true;
    }

    tick(dt: number): void {
        for (const [node, anim] of this._active) {
            if (anim.done) { this._active.delete(node); continue; }

            anim.elapsed += dt;
            const frameDuration = 1 / anim.config.fps;
            const newFrame = Math.floor(anim.elapsed / frameDuration);

            if (newFrame !== anim.currentFrame) {
                anim.currentFrame = newFrame;

                if (newFrame >= anim.config.frames) {
                    if (anim.config.loop) {
                        anim.currentFrame = 0;
                        anim.elapsed = 0;
                    } else {
                        anim.currentFrame = anim.config.frames - 1;
                        anim.done = true;
                        anim.options.onComplete?.();
                        continue;
                    }
                }
                this._loadSpriteFrame(anim.config, anim.currentFrame).then(frame => {
                    if (frame) anim.sprite.spriteFrame = frame;
                });
                anim.options.onFrame?.(anim.currentFrame);
            }
        }
    }

    private async _loadSpriteFrame(config: AnimationConfig, frameIndex: number): Promise<SpriteFrame | null> {
        const key = `${config.id}:${frameIndex}`;
        const cached = this._frameCache.get(key);
        if (cached) return cached;

        try {
            const texture = await AssetBundleService.instance.loadById<Texture2D>(config.resource);
            if (!texture) return null;

            let x = 0, y = 0;
            if (config.layout === 'vertical') {
                y = texture.height - (frameIndex + 1) * config.frameHeight;
            } else {
                x = frameIndex * config.frameWidth;
            }

            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;
            spriteFrame.rect = new Rect(x, y, config.frameWidth, config.frameHeight);
            this._frameCache.set(key, spriteFrame);
            return spriteFrame;
        } catch (err) {
            console.warn(`[SpriteAnim] failed to load frame ${frameIndex} for ${config.id}:`, err);
            return null;
        }
    }

    private async _fetchConfig(): Promise<AnimationConfig[] | null> {
        return new Promise((resolve) => {
            resources.load('config/animations', JsonAsset, (err: any, asset: JsonAsset | null) => {
                if (err || !asset) {
                    console.warn('[SpriteAnim] animations.json not found, no animations loaded');
                    resolve(null);
                    return;
                }
                const raw = asset.json as any;
                const list: AnimationConfig[] = Array.isArray(raw) ? raw : raw?.data ?? [];
                resolve(list.length > 0 ? list : null);
            });
        });
    }
}
