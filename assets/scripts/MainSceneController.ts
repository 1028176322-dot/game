/**
 * MainSceneController - 主场景总控制器
 * 管理启动屏 → 主界面 → 进入地牢的场景流转
 * 挂载在主场景根节点上
 */

import { _decorator, Component, Node, director } from 'cc';
import { GameManager, GameEvent } from './core/GameManager';
import { eventBus } from './core/EventBus';
import { ConfigManager } from './core/ConfigManager';
import { ShopUI } from './ui/ShopUI';
import { PlayerDataManager } from './core/PlayerDataManager';

const { ccclass, property } = _decorator;

@ccclass('MainSceneController')
export class MainSceneController extends Component {
    @property(ShopUI)
    shopUI: ShopUI | null = null;

    onLoad(): void {
        // 配置同步加载（所有配置均为硬编码，无 I/O）
        const configManager = ConfigManager.getInstance();
        configManager.loadAll();

        // 初始化永久存档管理器
        PlayerDataManager.getInstance();

        // 初始化商店 UI
        if (this.shopUI) {
            this.shopUI.init();
        }

        // 监听进入地牢事件
        eventBus.on('scene:transition', this._onSceneTransition, this);
        eventBus.on(GameEvent.DUNGEON_ENTER, this._onDungeonEnter, this);
        eventBus.on('ui:open_shop', this._onOpenShop, this);
    }

    private _onOpenShop(): void {
        this.shopUI?.show();
    }

    private _onSceneTransition(targetScene: string): void {
        if (targetScene === 'main') {
            // 已经在主场景
        } else if (targetScene === 'dungeon') {
            director.loadScene('dungeon');
        }
    }

    private _onDungeonEnter(floor: number): void {
        director.loadScene('dungeon');
    }

    onDestroy(): void {
        eventBus.offTarget(this);
    }
}
