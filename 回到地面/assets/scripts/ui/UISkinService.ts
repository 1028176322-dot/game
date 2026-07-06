/**
 * UISkinService - UI skin unified loading service
 *
 * Responsibilities:
 *   1. Load ui_assets.json registry (semantic key -> assetId)
 *   2. Provide apply(node, key) unified entry point
 *   3. Handle nine_slice type automatically (set Sprite.Type.SLICED)
 *   4. Auto-load config on first apply() call
 *
 * Usage:
 *   await UISkinService.instance.apply(someNode, 'ui.main.start_button');
 *
 * Skin change workflow (no code change):
 *   1. Swap image file in textures/
 *   2. Update assetId in ui_assets.json (or in assets.json)
 *   3. Editor UISkinBinder.assetKey stays unchanged
 */

import { resources, JsonAsset, Node, Sprite, SpriteFrame } from 'cc';
import { RenderAssetService } from '../assets/RenderAssetService';

export interface UIAssetDef {
    assetId: string;
    type: 'sprite' | 'nine_slice' | 'icon' | 'background';
    usage?: string;
}

const VALID_TYPES = new Set(['sprite', 'nine_slice', 'icon', 'background']);

export class UISkinService {
    private static _instance: UISkinService | null = null;
    private _defs: Record<string, UIAssetDef> = {};
    private _loaded = false;
    private _loading = false;

    static get instance(): UISkinService {
        if (!this._instance) this._instance = new UISkinService();
        return this._instance;
    }

    get loaded(): boolean {
        return this._loaded;
    }

    /**
     * Load ui_assets.json registry from resources.
     * Safe to call multiple times (only loads once).
     */
    async loadConfig(): Promise<void> {
        if (this._loaded || this._loading) return;
        this._loading = true;

        try {
            const asset = await new Promise<JsonAsset>((resolve, reject) => {
                resources.load('config/ui_assets', JsonAsset, (err, jsonAsset) => {
                    if (err || !jsonAsset) {
                        reject(err ?? new Error('load config/ui_assets failed'));
                        return;
                    }
                    resolve(jsonAsset);
                });
            });

            const raw = asset.json as { data?: Record<string, UIAssetDef> } | Record<string, UIAssetDef>;
            const data = 'data' in raw && raw.data ? raw.data : raw as Record<string, UIAssetDef>;

            for (const key of Object.keys(data)) {
                if (key === 'metadata') continue;
                const def = data[key];
                // Validate type early
                if (def && def.type && !VALID_TYPES.has(def.type)) {
                    console.warn(`[UISkinService] invalid type '${def.type}' for key '${key}', treating as 'sprite'`);
                    def.type = 'sprite';
                }
                this._defs[key] = def;
            }

            this._loaded = true;
            console.log(`[UISkinService] loaded ${Object.keys(this._defs).length} ui asset defs`);
        } catch (err) {
            console.error('[UISkinService] loadConfig failed', err);
        } finally {
            this._loading = false;
        }
    }

    /**
     * Look up a semantic key in the registry.
     */
    get(key: string): UIAssetDef | null {
        return this._defs[key] ?? null;
    }

    /**
     * Apply the skin identified by `key` onto `node`.
     *
     * Automatically loads config on first call.
     * For nine_slice type, sets Sprite.Type.SLICED for proper border scaling.
     *
     * @param node Target node (must have or auto-create Sprite component)
     * @param key  Semantic key, e.g. 'ui.main.start_button'
     * @returns    true if skin was applied successfully
     */
    async apply(node: Node | null, key: string): Promise<boolean> {
        if (!node || !node.isValid) return false;

        // Auto-load config on first apply
        if (!this._loaded) {
            await this.loadConfig();
        }

        const def = this.get(key);
        if (!def) {
            console.warn(`[UISkinService] missing ui asset key: ${key}`);
            return false;
        }

        // Apply sprite frame
        const frame = await RenderAssetService.applySpriteById(node, def.assetId);
        if (!frame) {
            console.warn(`[UISkinService] apply failed: key=${key}, assetId=${def.assetId}`);
            return this._fallback(node);
        }

        // Handle nine_slice type: set Sprite mode to SLICED
        if (def.type === 'nine_slice') {
            const sprite = this.ensureSprite(node);
            if (sprite) {
                sprite.type = Sprite.Type.SLICED;
                sprite.sizeMode = Sprite.SizeMode.CUSTOM;
            }
        }

        return true;
    }

    /**
     * Apply skin but never throw (for optional skins).
     */
    async applyOptional(node: Node | null, key: string): Promise<void> {
        try {
            await this.apply(node, key);
        } catch (err) {
            console.warn(`[UISkinService] applyOptional failed: key=${key}`, err);
        }
    }

    /**
     * Ensure node has a Sprite component.
     */
    ensureSprite(node: Node): Sprite {
        return node.getComponent(Sprite) ?? node.addComponent(Sprite);
    }

    /**
     * Check if a key exists in the registry.
     */
    has(key: string): boolean {
        return key in this._defs;
    }

    /**
     * Get all registered keys.
     */
    keys(): string[] {
        return Object.keys(this._defs);
    }

    /**
     * Get all referenced assetIds (for cross-validation).
     */
    allAssetIds(): string[] {
        const ids = new Set<string>();
        for (const def of Object.values(this._defs)) {
            if (def.assetId) ids.add(def.assetId);
        }
        return Array.from(ids);
    }

    /**
     * Get all keys filtered by usage.
     */
    keysByUsage(usage: string): string[] {
        return Object.entries(this._defs)
            .filter(([, def]) => def.usage === usage)
            .map(([key]) => key);
    }

    /** Fallback placeholder when apply fails */
    private async _fallback(node: Node): Promise<boolean> {
        if (!this._loaded) return false;
        const def = this.get('ui.placeholder.avatar');
        if (!def) return false;
        const frame = await RenderAssetService.applySpriteById(node, def.assetId);
        return frame !== null;
    }
}
