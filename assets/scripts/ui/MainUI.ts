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
            this.versionLabel.string = 'v1.0.0';
        }

        // 展示 Banner 广告
        WXAdapter.getInstance().showBanner();
    }

    /** 点击"开始游戏"（从编辑器 Button.onClick 绑定） */
    onStartClick(): void {
        const gm = GameManager.instance;
        if (gm) {
            // 隐藏 Banner（进入地牢时）
            WXAdapter.getInstance().hideBanner();
            gm.resetGame();
            gm.setPhase(GamePhase.Dungeon);
            eventBus.emit(GameEvent.DUNGEON_ENTER, gm.currentFloor);
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
