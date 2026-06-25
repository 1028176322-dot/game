/**
 * MainSceneController - 主场景总控制器
 * 管理启动屏 → 主界面 → 进入地牢的场景流转
 * 挂载在主场景根节点上
 */

import { _decorator, Component, Node, director } from 'cc';
import { GamePhase } from './core/Constants';
import { GameManager, GameEvent } from './core/GameManager';
import { eventBus } from './core/EventBus';
import { ConfigManager } from './core/ConfigManager';

const { ccclass, property } = _decorator;

@ccclass('MainSceneController')
export class MainSceneController extends Component {
    async onLoad(): Promise<void> {
        // 加载配置
        const configManager = ConfigManager.getInstance();
        await configManager.loadAll();

        // 监听进入地牢事件
        eventBus.on('scene:transition', this._onSceneTransition, this);
        eventBus.on(GameEvent.DUNGEON_ENTER, this._onDungeonEnter, this);
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
