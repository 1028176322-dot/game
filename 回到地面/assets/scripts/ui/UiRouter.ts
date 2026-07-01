/**
 * UiRouter - UI navigation router (Phase 8, upgraded v2)
 *
 * Unified Panel lifecycle management.
 * Every Panel must implement the UIPanel interface.
 *
 * Usage:
 *   UiRouter.instance.open('character');
 *   UiRouter.instance.close('character');
 *   UiRouter.instance.refresh('shop');
 */

export type UiPanelId =
    | 'login'
    | 'create_character'
    | 'character'
    | 'area_select'
    | 'shop'
    | 'equipment'
    | 'inventory'
    | 'event'
    | 'upgrade'
    | 'settings'
    | 'adventure_log'
    | 'settlement';

export interface UIPanel {
    id: UiPanelId;
    open(params?: unknown): void;
    close(): void;
    refresh?(): void;
}

type PanelEntry = {
    panel: UIPanel;
    isOpen: boolean;
};

export class UiRouter {
    private static _instance: UiRouter | null = null;
    private _panels = new Map<UiPanelId, PanelEntry>();
    private _history: UiPanelId[] = [];

    static get instance(): UiRouter {
        if (!this._instance) this._instance = new UiRouter();
        return this._instance;
    }

    /** Register a panel implementing UIPanel interface */
    register(panel: UIPanel): void {
        if (this._panels.has(panel.id)) {
            console.warn(`[UiRouter] panel ${panel.id} already registered, overwriting`);
        }
        this._panels.set(panel.id, { panel, isOpen: false });
    }

    /** Open a panel by id */
    open(id: UiPanelId, params?: unknown): void {
        const entry = this._panels.get(id);
        if (!entry) {
            console.warn(`[UiRouter] panel not registered: ${id}`);
            return;
        }
        if (entry.isOpen) {
            console.log(`[UiRouter] panel already open: ${id}`);
            return;
        }
        entry.isOpen = true;
        this._history.push(id);
        entry.panel.open(params);
    }

    /** Close a panel by id */
    close(id: UiPanelId): void {
        const entry = this._panels.get(id);
        if (!entry || !entry.isOpen) return;
        entry.isOpen = false;
        this._history = this._history.filter(h => h !== id);
        entry.panel.close();
    }

    /** Refresh a panel's data */
    refresh(id: UiPanelId): void {
        const entry = this._panels.get(id);
        if (!entry || !entry.isOpen) return;
        entry.panel.refresh?.();
    }

    /** Close all open panels */
    closeAll(): void {
        for (const id of [...this._history]) {
            this.close(id);
        }
        this._history = [];
    }

    /** Check if a panel is open */
    isOpen(id: UiPanelId): boolean {
        return this._panels.get(id)?.isOpen ?? false;
    }

    /** Check if a panel is registered */
    has(id: UiPanelId): boolean {
        return this._panels.has(id);
    }

    /** Close the most recently opened panel */
    closeLast(): void {
        const last = this._history.pop();
        if (last) this.close(last);
    }
}
