/**
 * AdventureLogPanel - Adventure records panel
 *
 * UIPanel implementation. Shows total runs, best floor, total kills, soul stones.
 */

import { _decorator, Component, Node, Label, Button } from 'cc';
import { UiRouter, UiPanelId, UIPanel } from '../UiRouter';
import { PlayerDataManager } from '../../core/PlayerDataManager';
import { T } from '../../core/TextManager';

const { ccclass, property } = _decorator;

@ccclass('AdventureLogPanel')
export class AdventureLogPanel extends Component implements UIPanel {
    id: UiPanelId = 'adventure_log';

    @property(Node)
    panelRoot: Node | null = null;

    @property(Label)
    titleLabel: Label | null = null;

    @property(Label)
    totalRunsLabel: Label | null = null;

    @property(Label)
    bestFloorLabel: Label | null = null;

    @property(Label)
    totalKillsLabel: Label | null = null;

    @property(Label)
    soulStonesLabel: Label | null = null;

    @property(Button)
    closeBtn: Button | null = null;

    // ── UIPanel ──

    open(_params?: unknown): void {
        if (this.panelRoot) this.panelRoot.active = true;
        this._refresh();
    }

    close(): void {
        if (this.panelRoot) this.panelRoot.active = false;
    }

    refresh(): void {
        this._refresh();
    }

    // ── Lifecycle ──

    onLoad(): void {
        if (this.closeBtn) {
            this.closeBtn.node.on(Button.EventType.CLICK, () => this.close(), this);
        }
    }

    // ── Internal ──

    private _refresh(): void {
        const pdm = PlayerDataManager.getInstance();

        if (this.titleLabel) this.titleLabel.string = T('ui.logTitle');
        if (this.totalRunsLabel) this.totalRunsLabel.string = T('ui.logTotalRuns', { count: pdm.getTotalRuns() });
        if (this.bestFloorLabel) this.bestFloorLabel.string = T('ui.logBestFloor', { floor: pdm.getBestFloor() });
        if (this.totalKillsLabel) this.totalKillsLabel.string = T('ui.logTotalKills', { count: pdm.totalKills });
        if (this.soulStonesLabel) this.soulStonesLabel.string = T('ui.logSoulStones', { count: pdm.getSoulStones() });
    }
}
