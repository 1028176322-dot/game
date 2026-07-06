/**
 * UISkinService - UI 皮肤统一加载服务
 *
 * 职责:
 *   1. 加载 ui_assets.json 注册表（语义 key → assetId）
 *   2. 提供 apply(node, key) 统一入口，将资源挂到目标节点
 *   3. apply 失败时自动 fallback 到占位图
 *
 * 使用方式:
 *   await UISkinService.instance.loadConfig();
 *   await UISkinService.instance.apply(someNode, 'ui.main.start_button');
 *
 * 换图流程（不改代码）:
 *   1. assets.json 换 assetId 映射
 *   2. ui_assets.json 换 assetId 指向
 *   3. 编辑器 UISkinBinder.assetKey 不变
 */

import { resources, JsonAsset, Node, Sprite } from 'cc';
import { RenderAssetService } from '../assets/RenderAssetService';

export interface UIAssetDef {
    assetId: string;
    type: 'sprite' | 'nine_slice' | 'icon' | 'background';
    usage?: string;
}

export class UISkinService {
    private static _instance: UISkinService | null = null;
    private _defs: Record<string, UIAssetDef> = {};
    private _loaded = false;

    static get instance(): UISkinService {
        if (!this._instance) this._instance = new UISkinService();
        return this._instance;
    }

    get loaded(): boolean {
        return this._loaded;
    }

    /**
     * 从 resources://config/ui_assets 加载注册表
     */
    async loadConfig(): Promise<void> {
        if (this._loaded) return;

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

        // 跳过 metadata
        for (const key of Object.keys(data)) {
            if (key === 'metadata') continue;
            this._defs[key] = data[key];
        }

        this._loaded = true;
        console.log(`[UISkinService] loaded ${Object.keys(this._defs).length} ui asset defs`);
    }

    /**
     * 查询语义 key 的注册定义
     */
    get(key: string): UIAssetDef | null {
        return this._defs[key] ?? null;
    }

    /**
     * 将语义 key 对应的皮肤应用到 node 上
     *
     * @param node 目标节点（需有或能自动添加 Sprite 组件）
     * @param key  语义 key，如 'ui.main.start_button'
     * @returns    是否应用成功
     */
    async apply(node: Node | null, key: string): Promise<boolean> {
        if (!node || !node.isValid) return false;

        const def = this.get(key);
        if (!def) {
            console.warn(`[UISkinService] missing ui asset key: ${key}`);
            return false;
        }

        const ok = await RenderAssetService.applySpriteById(node, def.assetId);
        if (!ok) {
            console.warn(`[UISkinService] apply failed: key=${key}, assetId=${def.assetId}`);
            // Fallback: try placeholder
            return this._fallback(node);
        }
        return true;
    }

    /**
     * 合入 apply 但永不抛异常（用于可选皮肤）
     */
    async applyOptional(node: Node | null, key: string): Promise<void> {
        try {
            await this.apply(node, key);
        } catch (err) {
            console.warn(`[UISkinService] applyOptional failed: key=${key}`, err);
        }
    }

    /**
     * 确保节点有 Sprite 组件（供外部调用）
     */
    ensureSprite(node: Node): Sprite {
        return node.getComponent(Sprite) ?? node.addComponent(Sprite);
    }

    /**
     * 注册表是否包含指定 key
     */
    has(key: string): boolean {
        return key in this._defs;
    }

    /**
     * 获取所有已注册的 key 列表
     */
    keys(): string[] {
        return Object.keys(this._defs);
    }

    /**
     * 获取所有已注册的 assetId 列表（用于门禁交叉校验）
     */
    allAssetIds(): string[] {
        const ids = new Set<string>();
        for (const def of Object.values(this._defs)) {
            ids.add(def.assetId);
        }
        return Array.from(ids);
    }

    /**
     * 按 usage 分类获取所有 key
     */
    keysByUsage(usage: string): string[] {
        return Object.entries(this._defs)
            .filter(([, def]) => def.usage === usage)
            .map(([key]) => key);
    }

    /** 占位 fallback */
    private async _fallback(node: Node): Promise<boolean> {
        const def = this.get('ui.placeholder.avatar');
        if (!def) return false;
        return RenderAssetService.applySpriteById(node, def.assetId);
    }
}
