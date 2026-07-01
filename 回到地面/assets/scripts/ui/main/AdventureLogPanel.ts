/**
 * AdventureLogPanel - Adventure history and statistics panel
 *
 * UIPanel implementation. Shows player's historical stats,
 * best records, and achievements.
 */

import { _decorator, Component, Node, Label, Button } from 'cc';
import { UiRouter, UiPanelId, UIPanel } from '../UiRouter';
import { PlayerDataManager } from '../../core/PlayerDataManager';

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

    onLoad(): void {
        if (this.closeBtn) {
            this.closeBtn.node.on(Button.EventType.CLICK, () => this.close(), this);
        }
    }

    private _refresh(): void {
        const pdm = PlayerDataManager.getInstance();

        if (this.titleLabel) this.titleLabel.string = 'Adventure Log';
        if (this.totalRunsLabel) this.totalRunsLabel.string = `Total Runs: ${pdm.getTotalRuns()}`;
        if (this.bestFloorLabel) this.bestFloorLabel.string = `Best Floor: ${pdm.getBestFloor()}`;
        if (this.totalKillsLabel) this.totalKillsLabel.string = `Total Defeated: ${pdm.totalKills}`;
        if (this.soulStonesLabel) this.soulStonesLabel.string = `Soul Stones: ${pdm.getSoulStones()}`;
    }

    onDestroy(): void {
        // cleanup if needed
    }
}
