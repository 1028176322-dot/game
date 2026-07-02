/**
 * SettlementPanel - Run settlement panel
 *
 * Shown after returning from dungeon (both death and victory).
 * Displays run statistics, allows soul stone doubling via ad.
 *
 * Implements UIPanel interface for UiRouter lifecycle.
 */

import { _decorator, Component, Node, Label, Button } from 'cc';
import { UiRouter, UiPanelId, UIPanel } from '../UiRouter';
import { RunCoordinator } from '../../run/RunCoordinator';
import { PlayerDataManager } from '../../core/PlayerDataManager';
import { AppFlowController, AppFlowState } from '../../app/AppFlowController';
import { T } from '../../core/TextManager';

const { ccclass, property } = _decorator;

@ccclass('SettlementPanel')
export class SettlementPanel extends Component implements UIPanel {
    id: UiPanelId = 'settlement';

    @property(Node)
    panelRoot: Node | null = null;

    @property(Label)
    titleLabel: Label | null = null;

    @property(Label)
    zoneLabel: Label | null = null;

    @property(Label)
    floorLabel: Label | null = null;

    @property(Label)
    killLabel: Label | null = null;

    @property(Label)
    soulStoneLabel: Label | null = null;

    @property(Label)
    timeLabel: Label | null = null;

    @property(Button)
    doubleBtn: Button | null = null;

    @property(Button)
    backBtn: Button | null = null;

    private _soulStones = 0;
    private _doubled = false;

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
        if (this.doubleBtn) {
            this.doubleBtn.node.on(Button.EventType.CLICK, this._onDouble, this);
        }
        if (this.backBtn) {
            this.backBtn.node.on(Button.EventType.CLICK, this._onBackToHub, this);
        }
    }

    // ── Internal ──

    private _refresh(): void {
        const result = RunCoordinator.instance.getRunResult();
        if (!result) {
            if (this.titleLabel) this.titleLabel.string = T('ui.settlementTitle');
            return;
        }

        this._soulStones = result.soulStones;

        if (this.titleLabel) {
            this.titleLabel.string = result.isVictory
                ? T('ui.settlementVictory')
                : T('ui.settlementTitle');
        }
        if (this.zoneLabel) {
            this.zoneLabel.string = T('ui.settlementZone', { zone: result.zoneName });
        }
        if (this.floorLabel) {
            this.floorLabel.string = T('ui.settlementFloor', { floor: result.floorReached });
        }
        if (this.killLabel) {
            this.killLabel.string = T('ui.settlementKill', { count: result.kills });
        }
        if (this.soulStoneLabel) {
            this.soulStoneLabel.string = T('ui.settlementSoulStone', { count: this._soulStones });
        }
        if (this.timeLabel) {
            const mins = Math.floor(result.elapsed / 60);
            const secs = Math.floor(result.elapsed % 60);
            this.timeLabel.string = T('ui.settlementTime', {
                time: `${mins}:${secs.toString().padStart(2, '0')}`,
            });
        }
    }

    private _onDouble(): void {
        if (this._doubled) return;
        this._soulStones *= 2;
        this._doubled = true;
        if (this.soulStoneLabel) {
            this.soulStoneLabel.string = T('ui.settlementSoulStone', { count: this._soulStones });
        }
        if (this.doubleBtn) {
            this.doubleBtn.interactable = false;
        }
        console.log('[Settlement] soul stones doubled:', this._soulStones);
    }

    private _onBackToHub(): void {
        const result = RunCoordinator.instance.getRunResult();
        if (result) {
            const pdm = PlayerDataManager.getInstance();
            pdm.addSoulStones(this._soulStones);
            pdm.setBestFloor(result.floorReached);
            pdm.addTotalKills(result.kills);
            pdm.addTotalRun();
            pdm.save();
        }

        RunCoordinator.instance.endRun();
        this.close();
        AppFlowController.instance.returnToMainHub();
    }
}
