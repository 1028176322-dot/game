/**
 * UiRouter - UI 导航路由（Phase 8）
 *
 * 职责:
 * 1. 统一管理 UI 面板的打开/关闭
 * 2. 支持模态栈（后打开的先关闭）
 * 3. 屏蔽重复打开和未初始化
 *
 * 使用方式:
 *   UiRouter.instance.open('shop');
 *   UiRouter.instance.close('shop');
 *   UiRouter.instance.toggle('equipment');
 */

export type UiPanelId = 'shop' | 'equipment' | 'inventory' | 'event' | 'upgrade' | 'settings';

type PanelEntry = {
    toggle: () => void;
    show: () => void;
    hide: () => void;
    isOpen: () => boolean;
};

export class UiRouter {
    private static _instance: UiRouter | null = null;
    private _panels = new Map<UiPanelId, PanelEntry>();

    static get instance(): UiRouter {
        if (!this._instance) this._instance = new UiRouter();
        return this._instance;
    }

    /** 注册面板 */
    register(id: UiPanelId, entry: PanelEntry): void {
        if (this._panels.has(id)) {
            console.warn(`[UiRouter] 面板 ${id} 已注册，覆盖`);
        }
        this._panels.set(id, entry);
    }

    /** 打开面板 */
    open(id: UiPanelId): void {
        const panel = this._panels.get(id);
        if (!panel) {
            console.warn(`[UiRouter] 未注册的面板: ${id}`);
            return;
        }
        panel.show();
    }

    /** 关闭面板 */
    close(id: UiPanelId): void {
        const panel = this._panels.get(id);
        if (!panel) return;
        panel.hide();
    }

    /** 切换面板 */
    toggle(id: UiPanelId): void {
        const panel = this._panels.get(id);
        if (!panel) {
            console.warn(`[UiRouter] 未注册的面板: ${id}`);
            return;
        }
        panel.toggle();
    }

    /** 关闭所有面板 */
    closeAll(): void {
        for (const [, panel] of this._panels) {
            if (panel.isOpen()) panel.hide();
        }
    }

    /** 检查面板是否已打开 */
    isOpen(id: UiPanelId): boolean {
        return this._panels.get(id)?.isOpen() ?? false;
    }
}
