/**
 * UISkinBinder - UI 皮肤绑定组件
 *
 * 挂载在需要换图的节点上，在编辑器中配置 assetKey。
 * onLoad 时自动通过 UISkinService 加载对应皮肤。
 *
 * 编辑器用法:
 *   1. 在节点上添加 Component → UISkinBinder
 *   2. 填写 assetKey 属性（如 "ui.main.start_button"）
 *   3. 需要 Sprinted 效果的可直接挂 Sprite 组件，
 *      没有 Sprite 组件的 UISkinBinder 会自动添加。
 *
 * 运行时也可通过 refresh() 手动触发重新加载。
 */

import { _decorator, Component, Node, Sprite } from 'cc';
import { UISkinService } from './UISkinService';

const { ccclass, property, menu } = _decorator;

@ccclass('UISkinBinder')
@menu('UI/UISkinBinder')
export class UISkinBinder extends Component {
    @property
    assetKey = '';

    /** 是否在 onLoad 时自动加载（场景中已存在的节点建议 true） */
    @property
    autoLoad = true;

    /** debug 模式：加载失败时打印更多信息 */
    @property
    debug = false;

    onLoad(): void {
        if (!this.autoLoad) return;
        // 延迟一帧确保 Sprite 组件已就绪
        this.scheduleOnce(() => this.refresh(), 0);
    }

    onEnable(): void {
        // 如果节点被重复启用，确保皮肤重新应用
        // 但避免在 onLoad 之后重复加载
    }

    /**
     * 手动刷新皮肤（可按需调用）
     */
    async refresh(): Promise<boolean> {
        if (!this.assetKey) {
            if (this.debug) {
                console.warn(`[UISkinBinder] ${this.node.name}: assetKey is empty`);
            }
            return false;
        }

        // 确保有 Sprite 组件
        this._ensureSprite();

        const ok = await UISkinService.instance.apply(this.node, this.assetKey);
        if (!ok && this.debug) {
            console.warn(`[UISkinBinder] ${this.node.name}: apply failed for key=${this.assetKey}`);
        }
        return ok;
    }

    /**
     * 设置新的 assetKey 并重新加载
     */
    async setKey(key: string): Promise<boolean> {
        this.assetKey = key;
        return this.refresh();
    }

    private _ensureSprite(): void {
        if (!this.node.getComponent(Sprite)) {
            this.node.addComponent(Sprite);
        }
    }
}
