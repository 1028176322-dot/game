import { assetManager, Asset, AssetManager, AudioClip, JsonAsset, Prefab, resources, SpriteFrame, Texture2D } from 'cc';

export interface AssetMapEntry {
    bundle: string;
    type: 'SpriteFrame' | 'Texture2D' | 'Prefab' | 'JsonAsset' | 'AudioClip';
    path: string;
}

export type AssetMap = Record<string, AssetMapEntry>;

type AssetCtor<T extends Asset> = { new(...args: any[]): T };

export class AssetBundleService {
    private static _instance: AssetBundleService | null = null;
    private _bundles = new Map<string, AssetManager.Bundle>();
    private _assetMap: AssetMap | null = null;
    private _mapLoaded = false;

    static get instance(): AssetBundleService {
        if (!this._instance) this._instance = new AssetBundleService();
        return this._instance;
    }

    get mapLoaded(): boolean {
        return this._mapLoaded;
    }

    async loadAssetMap(assetMap: AssetMap): Promise<void> {
        this._assetMap = assetMap;
        this._mapLoaded = true;
    }

    async loadAssetMapFromResources(): Promise<void> {
        if (this._mapLoaded) return;

        const asset = await new Promise<JsonAsset>((resolve, reject) => {
            resources.load('config/assets', JsonAsset, (err, jsonAsset) => {
                if (err || !jsonAsset) {
                    reject(err ?? new Error('load config/assets failed'));
                    return;
                }
                resolve(jsonAsset);
            });
        });

        const raw = asset.json as { data?: AssetMap } | AssetMap;
        const map = 'data' in raw && raw.data ? raw.data : raw as AssetMap;
        await this.loadAssetMap(map);
    }

    resolve(resourceId: string): AssetMapEntry | null {
        if (!this._mapLoaded || !this._assetMap) {
            console.warn(`[AssetBundleService] asset map not loaded: ${resourceId}`);
            return null;
        }
        return this._assetMap[resourceId] ?? null;
    }

    async loadBundle(name: string): Promise<AssetManager.Bundle> {
        if (name === 'resources') return resources;

        const cached = this._bundles.get(name);
        if (cached) return cached;

        return new Promise((resolve, reject) => {
            assetManager.loadBundle(name, (err, bundle) => {
                if (err || !bundle) {
                    reject(err ?? new Error(`loadBundle failed: ${name}`));
                    return;
                }
                this._bundles.set(name, bundle);
                resolve(bundle);
            });
        });
    }

    async load<T extends Asset>(bundleName: string, path: string, type: AssetCtor<T>): Promise<T> {
        const bundle = await this.loadBundle(bundleName);
        return new Promise((resolve, reject) => {
            bundle.load(path, type, (err, asset) => {
                if (err || !asset) {
                    reject(err ?? new Error(`load asset failed: ${bundleName}:${path}`));
                    return;
                }
                resolve(asset as T);
            });
        });
    }

    async loadById<T extends Asset>(resourceId: string): Promise<T> {
        const entry = this.resolve(resourceId);
        if (!entry) throw new Error(`[AssetBundleService] unknown resource: ${resourceId}`);
        return this.load<T>(entry.bundle, entry.path, this._resolveType(entry.type) as AssetCtor<T>);
    }

    async loadSpriteFrame(resourceId: string): Promise<SpriteFrame> {
        return this.loadById<SpriteFrame>(resourceId);
    }

    async tryLoadSpriteFrame(resourceId: string): Promise<SpriteFrame | null> {
        try {
            return await this.loadSpriteFrame(resourceId);
        } catch (err) {
            console.warn(`[AssetBundleService] sprite load failed: ${resourceId}`, err);
            return null;
        }
    }

    preload(bundleName: string, paths: string[]): void {
        const bundle = bundleName === 'resources' ? resources : this._bundles.get(bundleName);
        if (!bundle) {
            console.warn(`[AssetBundleService] cannot preload, bundle not loaded: ${bundleName}`);
            return;
        }
        for (const p of paths) {
            bundle.load(p, (err: Error | null) => {
                if (err) console.warn(`[AssetBundleService] preload failed: ${bundleName}:${p}`, err);
            });
        }
    }

    releaseBundle(name: string): void {
        if (name === 'resources') return;
        const bundle = this._bundles.get(name);
        if (!bundle) return;
        bundle.releaseAll();
        assetManager.removeBundle(bundle);
        this._bundles.delete(name);
    }

    releaseAll(): void {
        for (const name of this._bundles.keys()) {
            this.releaseBundle(name);
        }
    }

    isLoaded(name: string): boolean {
        return name === 'resources' || this._bundles.has(name);
    }

    private _resolveType(typeName: AssetMapEntry['type']): typeof SpriteFrame | typeof Texture2D | typeof Prefab | typeof JsonAsset | typeof AudioClip {
        const typeMap = {
            SpriteFrame,
            Texture2D,
            Prefab,
            JsonAsset,
            AudioClip,
        };
        return typeMap[typeName] ?? SpriteFrame;
    }
}
