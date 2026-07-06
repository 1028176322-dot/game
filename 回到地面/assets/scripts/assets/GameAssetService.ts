/**
 * GameAssetService — Non-UI art asset registry lookup service.
 *
 * Loads game_assets.json and provides typed access to sprite sheet,
 * background, tile, effect, and icon definitions by semantic key.
 *
 * Usage:
 *   await GameAssetService.instance.loadAll();
 *   const def = await GameAssetService.instance.get('character.warrior.idle');
 *
 * This service is the runtime counterpart to game_assets.json.
 */

import { JsonAsset, resources } from 'cc';

export type GameAssetType =
    | 'sprite'
    | 'sprite_sheet'
    | 'background'
    | 'tile'
    | 'effect_sheet'
    | 'icon';

export interface GameAssetDef {
    assetId: string;
    type: GameAssetType;
    category: string;
    frameWidth?: number;
    frameHeight?: number;
    frames?: number;
    layout?: 'vertical' | 'horizontal' | 'grid';
    tileSize?: number;
    format?: 'png' | 'jpg' | 'jpeg';
    fit?: 'cover' | 'contain' | 'stretch';
    blendMode?: 'normal' | 'additive';
    duration?: number;
    loop?: boolean;
    safeReview?: boolean;
}

export class GameAssetService {
    private static _instance: GameAssetService | null = null;
    private _defs: Record<string, GameAssetDef> = {};
    private _loaded = false;
    private _loading: Promise<void> | null = null;

    static get instance(): GameAssetService {
        if (!this._instance) this._instance = new GameAssetService();
        return this._instance;
    }

    get loaded(): boolean {
        return this._loaded;
    }

    /**
     * Load game_assets.json from resources.
     * Safe to call multiple times (only loads once).
     */
    async loadAll(): Promise<void> {
        if (this._loaded) return;
        if (this._loading) return this._loading;

        this._loading = new Promise<void>((resolve) => {
            resources.load('config/game_assets', JsonAsset, (err, asset) => {
                if (err || !asset) {
                    console.error('[GameAssetService] load config/game_assets failed', err);
                    this._loaded = true;
                    resolve();
                    return;
                }

                const raw = asset.json as Record<string, unknown> | { data?: Record<string, unknown> };
                const data = 'data' in raw && raw.data ? raw.data : raw as Record<string, unknown>;

                for (const key of Object.keys(data)) {
                    if (key === 'metadata') continue;
                    this._defs[key] = data[key] as GameAssetDef;
                }
                this._loaded = true;
                console.log(`[GameAssetService] loaded ${Object.keys(this._defs).length} game asset defs`);
                resolve();
            });
        });

        return this._loading;
    }

    /**
     * Get a game asset definition by semantic key.
     * Auto-loads config on first call.
     */
    async get(key: string): Promise<GameAssetDef | null> {
        if (!this._loaded) await this.loadAll();
        return this._defs[key] ?? null;
    }

    /**
     * Get a definition, throwing if missing.
     */
    async require(key: string): Promise<GameAssetDef> {
        const def = await this.get(key);
        if (!def) throw new Error(`[GameAssetService] missing key: ${key}`);
        return def;
    }

    /**
     * Get all registered keys.
     */
    keys(): string[] {
        return Object.keys(this._defs);
    }

    /**
     * Get all keys matching a category.
     */
    keysByCategory(category: string): string[] {
        return Object.entries(this._defs)
            .filter(([, def]) => def.category === category)
            .map(([key]) => key);
    }

    /**
     * Get all keys matching a type.
     */
    keysByType(type: GameAssetType): string[] {
        return Object.entries(this._defs)
            .filter(([, def]) => def.type === type)
            .map(([key]) => key);
    }

    /**
     * Check if a key exists.
     */
    has(key: string): boolean {
        return key in this._defs;
    }
}
