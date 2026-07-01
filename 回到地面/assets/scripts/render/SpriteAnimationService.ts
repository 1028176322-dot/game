/**
 * SpriteAnimationService - JSON config-driven sprite animation player
 *
 * Reads animation configs from assets/resources/config/animations.json
 * and plays frame-based sprite animations on target nodes.
 *
 * Supports:
 *   - Vertical and horizontal sprite sheet layouts
 *   - Configurable FPS, loop, frame count
 *   - Animation completion callbacks
 */

import { _decorator, Component, Node, Sprite, SpriteFrame, Texture2D, Rect, JsonAsset } from 'cc';
import { AssetBundleService } from '../assets/AssetBundleService';

const { ccclass } = _decorator;

export interface AnimationConfig {
    id: string;
    resource: string;          // Path to sprite sheet texture
    frameWidth: number;        // Width of single frame in pixels
    frameHeight: number;       // Height of single frame in pixels
    frames: number;            // Total frame count
    fps: number;               // Frames per second
    loop: boolean;             // Whether to loop
    layout: 'vertical' | 'horizontal';  // Sheet layout direction
}

export interface AnimationPlayOptions {
    onComplete?: () => void;
    onFrame?: (frameIndex: number) => void;
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

@ccclass('SpriteAnimationService')
export class SpriteAnimationService {
    private static _instance: SpriteAnimationService | null = null;
    private _configs = new Map<string, AnimationConfig>();
    private _active = new Map<Node, ActiveAnimation>();
    private _loaded = false;

    static get instance(): SpriteAnimationService {
        if (!this._instance) this._instance = new SpriteAnimationService();
        return this._instance;
    }

    /** Load animations config from JSON */
    async loadAll(): Promise<void> {
        if (this._loaded) return;

        try {
            // Attempt to load from AssetBundleService
            // Fallback: use bundled config
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

    /** Get an animation config by id */
    getConfig(id: string): AnimationConfig | null {
        return this._configs.get(id) ?? null;
    }

    /** Play an animation on a node */
    async play(node: Node, animId: string, options?: AnimationPlayOptions): Promise<void> {
        const config = this._configs.get(animId);
        if (!config) {
            console.warn(`[SpriteAnim] unknown animation: ${animId}`);
            return;
        }

        // Ensure the node has a Sprite component
        let sprite = node.getComponent(Sprite);
        if (!sprite) {
            sprite = node.addComponent(Sprite);
        }

        // Load the sprite sheet texture
        const frame = await this._loadSpriteFrame(config, 0);
        if (frame) {
            sprite.spriteFrame = frame;
        }

        // Store active animation
        this._active.set(node, {
            config,
            node,
            sprite,
            currentFrame: 0,
            elapsed: 0,
            options: options ?? {},
            done: false,
        });
    }

    /** Stop animation on a node */
    stop(node: Node): void {
        this._active.delete(node);
    }

    /** Check if a node has an active animation */
    isPlaying(node: Node): boolean {
        return this._active.has(node);
    }

    /** Stop all animations */
    stopAll(): void {
        this._active.clear();
    }

    /** Tick all active animations (call from dungeon update loop) */
    tick(dt: number): void {
        for (const [node, anim] of this._active) {
            if (anim.done) {
                this._active.delete(node);
                continue;
            }

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

                this._applyFrame(anim);
                anim.options.onFrame?.(anim.currentFrame);
            }
        }
    }

    // ── Private ──

    private async _applyFrame(anim: ActiveAnimation): Promise<void> {
        const frame = await this._loadSpriteFrame(anim.config, anim.currentFrame);
        if (frame) {
            anim.sprite.spriteFrame = frame;
        }
    }

    private async _loadSpriteFrame(config: AnimationConfig, frameIndex: number): Promise<SpriteFrame | null> {
        try {
            const texture = await AssetBundleService.instance.loadAsset(config.resource, Texture2D) as Texture2D;
            if (!texture) return null;

            let x = 0, y = 0;
            if (config.layout === 'vertical') {
                // Vertical strip: frames stacked top-to-bottom
                y = texture.height - (frameIndex + 1) * config.frameHeight;
            } else {
                // Horizontal strip: frames arranged left-to-right
                x = frameIndex * config.frameWidth;
            }

            const rect = new Rect(x, y, config.frameWidth, config.frameHeight);
            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;
            spriteFrame.rect = rect;
            return spriteFrame;
        } catch (err) {
            console.warn(`[SpriteAnim] failed to load frame ${frameIndex} for ${config.id}:`, err);
            return null;
        }
    }

    private async _fetchConfig(): Promise<AnimationConfig[] | null> {
        try {
            const data = await AssetBundleService.instance.loadAsset(
                'config/animations',
                JsonAsset
            ) as any;
            return data?.json ?? null;
        } catch {
            // Config doesn't exist yet - return null gracefully
            return null;
        }
    }
}
