/**
 * DeathUI - 觉悟战/结算 UI
 * 玩家死亡 → 弹出觉悟战（复活/结算选项）→ 结算统计 → 回到主界面
 */

import { _decorator, Component, Node, Button, Label } from 'cc';
import { AdPlacement, GamePhase } from '../core/Constants';
import { GameManager, GameEvent } from '../core/GameManager';
import { T } from '../core/TextManager';
import { eventBus } from '../core/EventBus';
import { WXAdapter } from '../utils/WXAdapter';
import { PlayerDataManager } from '../core/PlayerDataManager';
import { GameConfig } from '../core/GameConfig';
import { RunRng } from '../core/rng/RunRng';

const { ccclass, property } = _decorator;

@ccclass('DeathUI')
export class DeathUI extends Component {
    @property(Node)
    awakenPanel: Node | null = null;    // 觉悟战面板
    @property(Node)
    settlementPanel: Node | null = null; // 结算面板
    @property(Label)
    floorLabel: Node | null = null;
    @property(Label)
    killLabel: Node | null = null;
    @property(Label)
    soulStoneLabel: Node | null = null;
    @property(Button)
    reviveButton: Button | null = null;  // 复活按钮

    private _deathData: DeathData = { floor: 0, kills: 0, soulStones: 0 };
    private _doubleAdInProgress: boolean = false;

    onLoad(): void {
        eventBus.on(GameEvent.GAME_OVER, this._onPlayerDeath, this);
        this.awakenPanel && (this.awakenPanel.active = false);
        this.settlementPanel && (this.settlementPanel.active = false);
    }

    onDestroy(): void {
        eventBus.offTarget(this);
    }

    private _onPlayerDeath(): void {
        // 收集本局数据
        const gm = GameManager.instance;
        this._deathData = {
            floor: gm.currentFloor,
            kills: 0,  // 由外部更新
            soulStones: this._calcSoulStones(gm.currentFloor),
        };

        // 弹出觉悟战面板
        if (this.awakenPanel) {
            this.awakenPanel.active = true;
        }
    }

    /** 点击"看广告复活"按钮 */
    onReviveClick(): void {
        if (this.reviveButton) {
            this.reviveButton.interactable = false;
        }

        WXAdapter.getInstance().playRewardedAd(AdPlacement.Revive, (result) => {
            if (result.rewarded) {
                // 复活成功
                eventBus.emit('player:revive');
                this.awakenPanel && (this.awakenPanel.active = false);
            } else {
                // 广告未看完或失败 → 进入结算
                this._showSettlement();
            }
            if (this.reviveButton) {
                this.reviveButton.interactable = true;
            }
        });
    }

    /** 点击"放弃/结算"按钮 */
    onSettleClick(): void {
        this.awakenPanel && (this.awakenPanel.active = false);
        this._showSettlement();
    }

    private _showSettlement(): void {
        if (!this.settlementPanel) return;

        // 更新结算数据
        const flLabel = this.floorLabel?.getComponent(Label);
        if (flLabel) flLabel.string = T('ui.reachFloor', { floor: this._deathData.floor });

        const klLabel = this.killLabel?.getComponent(Label);
        if (klLabel) klLabel.string = T('ui.defeatCount', { count: this._deathData.kills });

        const ssLabel = this.soulStoneLabel?.getComponent(Label);
        if (ssLabel) ssLabel.string = T('ui.soulStone', { count: this._deathData.soulStones });

        this.settlementPanel.active = true;
        eventBus.emit('ui:settlement_shown', this._deathData);

        // Phase 4: 展示插屏广告 (死亡结算后)
        WXAdapter.getInstance().reportAdImpression(AdPlacement.Interstitial);
    }

    /** 点击"翻倍广告"按钮 (魂石 ×2) */
    onDoubleClick(): void {
        if (this._doubleAdInProgress) return;
        this._doubleAdInProgress = true;

        WXAdapter.getInstance().playRewardedAd(AdPlacement.CoinDouble, (result) => {
            this._doubleAdInProgress = false;
            if (result.rewarded) {
                this._deathData.soulStones *= 2;
                // 刷新显示
                const ssLabel = this.soulStoneLabel?.getComponent(Label);
                if (ssLabel) ssLabel.string = T('ui.soulStoneDouble', { count: this._deathData.soulStones });
            }
        });
    }

    /** 点击"回到地面"按钮 */
    onBackToMainClick(): void {
        if (this.settlementPanel) {
            this.settlementPanel.active = false;
        }

        // 魂石结算存入永久存档 (M2.4)
        const pdm = PlayerDataManager.getInstance();
        pdm.commitRunResult(this._deathData.floor, this._deathData.kills, this._deathData.soulStones);

        // 上报数据
        WXAdapter.getInstance().reportAnalytics('game_settlement', {
            floor: this._deathData.floor,
            kills: this._deathData.kills,
            soulStones: this._deathData.soulStones,
        });

        const gm = GameManager.instance;
        if (gm) {
            eventBus.emit(GameEvent.DUNGEON_EXIT);
        }

        // Return to main city via AppFlowController (P0 Architecture Rule)
        const { AppFlowController } = require('../app/AppFlowController');
        if (AppFlowController.instance) {
            AppFlowController.instance.returnToMainHub();
        }
    }

    /** 魂石结算公式 (来自 GameConfig 配置，含天赋增益) */
    private _calcSoulStones(floor: number): number {
        const base = GameConfig.SOULSTONE_BASE_RATE;
        const perFloor = floor * 8;
        const bossBonus = GameConfig.SOULSTONE_BOSS_BONUS * floor;
        let stones = base + perFloor + bossBonus;

        // 魂石波动（0~9 浮动，基于 seed 确定）
        const rewardRng = RunRng.instance.fork(`death:reward:${floor}`);
        stones += rewardRng.int(0, 9);

        // 贪婪天赋: +15% 魂石
        const pdm = PlayerDataManager.getInstance();
        if (pdm.selectedTalent === 'greed') {
            stones = Math.floor(stones * GameConfig.SOULSTONE_BASE_RATE * 0.15 + stones);
        }

        return stones;
    }

    /** 更新击杀数（由外部在战斗中累计设置） */
    setKillCount(kills: number): void {
        this._deathData.kills = kills;
    }
}

export interface DeathData {
    floor: number;
    kills: number;
    soulStones: number;
}
