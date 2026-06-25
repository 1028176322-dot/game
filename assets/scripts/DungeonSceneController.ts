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
import { SkillSystem, SkillSlot } from './battle/SkillSystem';
import { UpgradeManager } from './battle/UpgradeManager';
import { ElementSystem } from './battle/ElementSystem';
import { EquipmentSystem } from './battle/EquipmentSystem';
import { EquipmentUI } from './ui/EquipmentUI';
import { ItemSystem } from './battle/ItemSystem';
import { InventoryUI } from './ui/InventoryUI';
import { VirtualJoystick } from './ui/VirtualJoystick';
import { BattleHUD } from './ui/BattleHUD';
import { DungeonMapUI } from './ui/DungeonMapUI';
import { UpgradeUI } from './ui/UpgradeUI';
import { DeathUI } from './ui/DeathUI';
import { PlayerDataManager, CHARACTER_LIST } from './core/PlayerDataManager';

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
    @property(ElementSystem)
    elementSystem: ElementSystem | null = null;
    @property(EquipmentSystem)
    equipmentSystem: EquipmentSystem | null = null;
    @property(EquipmentUI)
    equipmentUI: EquipmentUI | null = null;
    @property(ItemSystem)
    itemSystem: ItemSystem | null = null;
    @property(InventoryUI)
    inventoryUI: InventoryUI | null = null;

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

        // 初始化元素反应系统 (M2.2)
        if (this.elementSystem && this.player && this.battleManager) {
            this.elementSystem.init(this.player, this.battleManager);
        }

        // 初始化装备系统 (M2.3)
        if (this.equipmentSystem && this.player) {
            this.equipmentSystem.init(this.player);
        }
        if (this.equipmentUI && this.equipmentSystem) {
            this.equipmentUI.init(this.equipmentSystem);
        }

        // 初始化道具系统 (M2.5)
        if (this.itemSystem && this.player && this.battleManager) {
            this.itemSystem.init(this.player, this.battleManager);
        }
        if (this.inventoryUI && this.itemSystem) {
            this.inventoryUI.init(this.itemSystem);
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
        eventBus.on('battle:victory', this._onBattleVictory, this);
        eventBus.on('room:shop', this._onEnterShopRoom, this);

        // 应用选中角色初始能力 (M2.4)
        this._applySelectedCharacter();

        const gm = GameManager.instance;
        if (gm) {
            gm.setPhase(GamePhase.Dungeon);
        }
    }

    /** 应用选中角色的初始能力 + 初始技能 */
    private _applySelectedCharacter(): void {
        if (!this.player || !this.skillSystem) return;

        const pdm = PlayerDataManager.getInstance();
        const charId = pdm.selectedCharacter;
        const charDef = CHARACTER_LIST.find(c => c.id === charId);
        if (!charDef) return;

        // 应用初始能力 (相当于选择了一个ability类的upgrade)
        // 通过 UpgradeManager 间接应用
        eventBus.emit('upgrade:selected', { id: charDef.initialAbility, type: 'ability' });

        // 装备初始技能 (替换默认的右边技能槽)
        const skillDef = { id: charDef.initialSkill, name: charDef.name + '初始技', cd: 5.0, duration: 0, cooldownRemaining: 0, isActive: false, isRelic: false };
        this.skillSystem.equipSkill(SkillSlot.ActiveRight, {
            id: charDef.initialSkill,
            name: charDef.name + '初始技',
            cd: 5.0,
            duration: 0,
            cooldownRemaining: 0,
            isActive: true,
            isRelic: false,
        });
    }

    /** 玩家复活 */
    private _onPlayerRevive(): void {
        if (this.battleManager && this.player) {
            this.player.heal(50); // 复活恢复 50HP
            this.battleManager.setPaused(false);
        }
    }

    /** 战斗胜利: 生成装备掉落 (M2.3) + 道具掉落 (M2.5) */
    private _onBattleVictory(): void {
        if (!this.dungeonManager) return;

        const room = this.dungeonManager.currentRoom;
        if (!room) return;

        const roomType = room.type === RoomType.Boss ? 'boss' as const
            : room.type === RoomType.Elite ? 'elite' as const
            : 'normal' as const;

        // 装备掉落 (M2.3)
        if (this.equipmentSystem) {
            const drops = this.equipmentSystem.generateDrops(roomType, 1);
            for (const drop of drops) {
                if (drop) {
                    const autoPickup = this.equipmentSystem.pickupToBackpack(drop);
                    if (autoPickup) {
                        console.log(`[装备] 拾取: ${drop.name}`);
                        eventBus.emit('equip:picked_up', drop);
                    }
                }
            }
        }

        // 道具掉落 (M2.5)
        if (this.itemSystem) {
            this.itemSystem.tryDrop(roomType);
        }
    }

    /** 商店房间: 不卖消耗品 (仅钥匙/卷轴/装备) */
    private _onEnterShopRoom(roomId: number): void {
        eventBus.emit('ui:show_shop', {
            sellItems: ['key', 'advancedKey', 'rerollScroll', 'elementScroll'],
        });
    }

    onDestroy(): void {
        eventBus.offTarget(this);
    }

    update(dt: number): void {
        // 更新在地牢管理器中的战斗回调
    }
}
