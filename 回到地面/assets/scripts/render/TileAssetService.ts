/**
 * TileAssetService — Resolve tile assetIds by semantic key.
 *
 * Usage:
 *   const assetId = await TileAssetService.instance.getTileAssetId('tile.forest.floor');
 *   if (assetId) await RenderAssetService.applySpriteById(tileNode, assetId);
 */

import { GameAssetService } from '../assets/GameAssetService';

export class TileAssetService {
    private static _instance: TileAssetService | null = null;

    static get instance(): TileAssetService {
        if (!this._instance) this._instance = new TileAssetService();
        return this._instance;
    }

    /**
     * Get the assetId for a tile by semantic key.
     * Returns null if key is missing or is not a tile type.
     */
    async getTileAssetId(tileKey: string): Promise<string | null> {
        const def = await GameAssetService.instance.get(tileKey);
        if (!def) {
            console.warn(`[TileAssetService] missing tile key: ${tileKey}`);
            return null;
        }
        if (def.type !== 'tile') {
            console.warn(`[TileAssetService] key is not tile type: ${tileKey}, type=${def.type}`);
            return null;
        }
        return def.assetId;
    }
}
