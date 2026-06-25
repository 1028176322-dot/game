/**
 * DungeonSceneController - 地牢场景总控制器
 * 将 GridManager、PlayerController、BattleManager、DungeonManager 等串联
 * 作为地牢场景的入口脚本，挂载在场景根节点上
 */

import { _decorator, Component, Node, director } from 'cc';
import { GamePhase, RoomType } from './core/Constants';
import { eventBus } from './core/EventBus';
import { GameManager } from './core/GameManager';
import { GridManager } from './dungeon/GridManager';
import { DungeonManager } from './dungeon/DungeonManager';
import { RoomTransition } from './dungeon/RoomTransition';
import { BattleManager } from './battle/BattleManager';
import { PlayerController } from './battle/PlayerController';
import { AutoAttack } from './battle/AutoAttack';
import { SkillSystem } from './battle/SkillSystem';
import { UpgradeManager } from './battle/UpgradeManager';
import { VirtualJoystick } from './ui/VirtualJoystick';
import { BattleHUD } from './ui/BattleHUD';
import { DungeonMapUI } from './ui/DungeonMapUI';
import { UpgradeUI } from './ui/UpgradeUI';
import { DeathUI } from './ui/DeathUI';

const { ccclass, property } = _decorator;

@ccclass('DungeonSceneController')
export class DungeonSceneController extends Component {
    @property(GridManager)
    gridManager: GridManager | null = null;
    @property(PlayerController)
    player: PlayerController | null = null;
    @property(BattleManager)
    battleManager: BattleManager | null = null;
    @property(DungeonManager)
    dungeonManager: DungeonManager | null = null;
    @property(RoomTransition)
    roomTransition: RoomTransition | null = null;
    @property(VirtualJoystick)
    joystick: VirtualJoystick | null = null;
    @property(SkillSystem)
    skillSystem: SkillSystem | null = null;
    @property(BattleHUD)
    battleHUD: BattleHUD | null = null;
    @property(DungeonMapUI)
    dungeonMapUI: DungeonMapUI | null = null;
    @property(UpgradeUI)
    upgradeUI: UpgradeUI | null = null;
    @property(DeathUI)
    deathUI: DeathUI | null = null;
    @property(UpgradeManager)
    upgradeManager: UpgradeManager | null = null;

    onLoad(): void {
        // 初始化玩家
        if (this.player && this.gridManager) {
            this.player.init(this.gridManager);
        }

        // 初始化技能系统
        if (this.skillSystem && this.player) {
            this.skillSystem.init(this.player);
        }

        // 初始化战斗管理器
        if (this.battleManager && this.player && this.gridManager) {
            this.battleManager.init(this.player, this.gridManager);
        }

        // 初始化强化管理器 (M2.1)
        if (this.upgradeManager && this.player && this.skillSystem) {
            const autoAttack = this.player.getComponent(AutoAttack);
            this.upgradeManager.init(
                this.player,
                this.skillSystem,
                autoAttack!,
                this.battleManager!,
            );
        }

        // 初始化地牢（随机种子）
        const seed = Math.floor(Math.random() * 2147483647);
        if (this.dungeonManager && this.player) {
            this.dungeonManager.init(this.player, seed);
        }

        // 摇杆绑定
        if (this.joystick && this.player) {
            this.joystick.setMoveCallback((event) => {
                this.player!.handleJoystick(event);
            });
            this.joystick.setEndCallback(() => {
                // 摇杆释放时的额外处理
            });
        }

        // 更新 HUD
        if (this.battleHUD && this.player) {
            const initStats = this.player.stats.getFinalStats();
            this.battleHUD.refreshHP(this.player.currentHP, initStats.maxHP);
            this.player.onHPChanged = (current, max) => {
                this.battleHUD?.refreshHP(current, max);
            };
        }

        // 注册事件
        eventBus.on('player:revive', this._onPlayerRevive, this);

        const gm = GameManager.instance;
        if (gm) {
            gm.setPhase(GamePhase.Dungeon);
        }
    }

    /** 玩家复活 */
    private _onPlayerRevive(): void {
        if (this.battleManager && this.player) {
            this.player.heal(50); // 复活恢复 50HP
            this.battleManager.setPaused(false);
        }
    }

    onDestroy(): void {
        eventBus.offTarget(this);
    }

    update(dt: number): void {
        // 更新在地牢管理器中的战斗回调
    }
}
