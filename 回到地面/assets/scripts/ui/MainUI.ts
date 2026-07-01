/**
 * MainUI - 主界面 UI
 * 显示"开始游戏"按钮、角色选择入口
 * UI 层：仅转发操作意图，不直接改游戏数据
 */

import { _decorator, Component, Node, Button, Label } from 'cc';
import { GamePhase, AdPlacement } from '../core/Constants';
import { GameManager, GameEvent } from '../core/GameManager';
import { eventBus } from '../core/EventBus';
import { WXAdapter } from '../utils/WXAdapter';
import { T } from '../core/TextManager';

const { ccclass, property } = _decorator;

@ccclass('MainUI')
export class MainUI extends Component {
    @property(Button)
    startButton: Button | null = null;
    @property(Button)
    shopButton: Button | null = null;
    @property(Button)
    settingsButton: Button | null = null;
    @property(Label)
    versionLabel: Label | null = null;

    onLoad(): void {
        // 版本号
        if (this.versionLabel) {
            this.versionLabel.string = T('ui.version');
        }

        // 展示 Banner 广告
        WXAdapter.getInstance().showBanner();
    }

    /** 点击"开始游戏"（旧版，由新的 MainHubUI + AreaSelectPanel 替代） */
    onStartClick(): void {
        const gm = GameManager.instance;
        if (gm) {
            WXAdapter.getInstance().hideBanner();
            // Delegate to AreaSelectPanel via event (new flow)
            eventBus.emit('ui:open_area_select');
        }
    }

    /** 点击商店按钮 */
    onShopClick(): void {
        eventBus.emit('ui:open_shop');
    }

    /** 点击设置按钮 */
    onSettingsClick(): void {
        eventBus.emit('ui:open_settings');
    }

    onDestroy(): void {
        // 离开主界面时确保 Banner 恢复
        WXAdapter.getInstance().showBanner();
    }
}
