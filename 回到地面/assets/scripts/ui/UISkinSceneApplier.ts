/**
 * UISkinSceneApplier — Scene-level skin auto-applier
 *
 * Reads ui_skin_bindings.json, traverses the active scene node tree,
 * and applies UISkinService skins by matching node paths to semantic keys.
 *
 * Usage:
 *   await UISkinSceneApplier.applyScene(scene.root, 'splash');
 *   await UISkinSceneApplier.applyScene(scene.root, 'main');
 *   await UISkinSceneApplier.applyScene(scene.root, 'dungeon');
 *
 * This is the entry point for the 3-layer UI skin pipeline:
 *   assets.json -> ui_assets.json -> ui_skin_bindings.json -> UISkinSceneApplier -> UISkinService
 */

import { JsonAsset, Node, resources } from 'cc';
import { AssetBundleService } from '../assets/AssetBundleService';
import { UISkinService } from './UISkinService';

export type SceneKey = 'splash' | 'main' | 'dungeon';
export type SceneSkinBindings = Record<string, string>;

interface UISkinBindingsConfig {
    metadata?: Record<string, unknown>;
    splash?: SceneSkinBindings;
    main?: SceneSkinBindings;
    dungeon?: SceneSkinBindings;
}

export class UISkinSceneApplier {
    private static _config: UISkinBindingsConfig | null = null;
    private static _loading: Promise<void> | null = null;

    /**
     * Apply all skins defined for `sceneKey` onto the scene tree.
     * Fails gracefully with console.warn — does not block game flow.
     */
    static async applyScene(sceneRoot: Node | null, sceneKey: SceneKey): Promise<void> {
        if (!sceneRoot || !sceneRoot.isValid) return;

        await this._loadConfig();
        await AssetBundleService.instance.loadAssetMapFromResources();
        await UISkinService.instance.loadConfig();

        const bindings = this._config?.[sceneKey] ?? {};
        const entries = Object.entries(bindings);
        if (entries.length === 0) {
            console.warn(`[UISkinSceneApplier] no bindings for scene: ${sceneKey}`);
            return;
        }

        let applied = 0;
        let skipped = 0;

        for (const [path, skinKey] of entries) {
            const node = this._findByPath(sceneRoot, path);
            if (!node) {
                console.warn(`[UISkinSceneApplier] node not found: scene=${sceneKey}, path=${path}, key=${skinKey}`);
                skipped++;
                continue;
            }

            const ok = await UISkinService.instance.apply(node, skinKey);
            if (!ok) {
                console.warn(`[UISkinSceneApplier] apply failed: scene=${sceneKey}, path=${path}, key=${skinKey}`);
                skipped++;
            } else {
                applied++;
            }
        }

        console.log(`[UISkinSceneApplier] scene=${sceneKey} applied=${applied} skipped=${skipped}`);
    }

    /**
     * Manually trigger bindings for a single scene (splash/main/dungeon).
     * Used when scene root changes after initial load.
     */
    static async refreshScene(sceneRoot: Node | null, sceneKey: SceneKey): Promise<void> {
        await this.applyScene(sceneRoot, sceneKey);
    }

    /**
     * Look up a skin key by exact scene and node path.
     * Returns null if no binding exists.
     */
    static getBinding(sceneKey: SceneKey, nodePath: string): string | null {
        return this._config?.[sceneKey]?.[nodePath] ?? null;
    }

    /**
     * Get all bindings for a scene (for debugging / gate validation).
     */
    static getBindings(sceneKey: SceneKey): SceneSkinBindings {
        return this._config?.[sceneKey] ?? {};
    }

    /** Load ui_skin_bindings.json (once). */
    private static async _loadConfig(): Promise<void> {
        if (this._config) return;
        if (this._loading) return this._loading;

        this._loading = new Promise<void>((resolve) => {
            resources.load('config/ui_skin_bindings', JsonAsset, (err, asset) => {
                if (err || !asset) {
                    console.error('[UISkinSceneApplier] load config/ui_skin_bindings failed', err);
                    this._config = {};
                    resolve();
                    return;
                }

                this._config = asset.json as UISkinBindingsConfig;
                console.log(`[UISkinSceneApplier] loaded bindings: splash=${this._count('splash')} main=${this._count('main')} dungeon=${this._count('dungeon')}`);
                resolve();
            });
        });

        return this._loading;
    }

    /** Traverse scene node hierarchy by '/' separated path. */
    private static _findByPath(root: Node, path: string): Node | null {
        const parts = path.split('/').filter(Boolean);
        if (parts.length === 0) return root;

        let current: Node | null = root;
        // If root name matches first segment, skip it
        if (current.name === parts[0]) {
            parts.shift();
        }

        for (const part of parts) {
            current = current?.getChildByName(part) ?? null;
            if (!current) return null;
        }

        return current;
    }

    private static _count(sceneKey: SceneKey): number {
        return Object.keys(this._config?.[sceneKey] ?? {}).length;
    }
}
