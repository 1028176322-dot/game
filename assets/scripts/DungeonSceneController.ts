/**
 * DungeonSceneController - 地牢场景总控制器 (Phase 4)
 * 连接所有子系统：区域管理、战斗、地牢生成、UI
 * Phase 3: 区域/小关切换、Boss阶段事件、事件系统、房间变异
 * Phase 4: 广告变现、跑马灯、数据埋点
 * 
 * 【设计原则】
 * - 所有 @property 引用通过编辑器绑定（已有节点）+ 运行时动态创建（新 UI）
 * - EventUI 和 MarqueeUI 在 onLoad 中动态创建，无需在场景中拖拽节点
 * - 新增系统不会破坏现有场景文件的兼容性
 */

import { _decorator, Component, Node, director } from 'cc';
import { GamePhase, RoomType, AdPlacement } from './core/Constants';
import { eventBus } from './core/EventBus';
import { GameManager, GameEvent } from './core/GameManager';
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
import { EventSystem } from './battle/EventSystem';
import { MutationManager } from './battle/MutationManager';
import { EquipmentUI } from './ui/EquipmentUI';
import { EventUI } from './ui/EventUI';
import { MarqueeUI } from './ui/MarqueeUI';
import { ItemSystem } from './battle/ItemSystem';
import { InventoryUI } from './ui/InventoryUI';
import { VirtualJoystick } from './ui/VirtualJoystick';
import { BattleHUD } from './ui/BattleHUD';
import { DungeonMapUI } from './ui/DungeonMapUI';
import { UpgradeUI } from './ui/UpgradeUI';
import { DeathUI } from './ui/DeathUI';
import { PlayerDataManager, CHARACTER_LIST } from './core/PlayerDataManager';
import { WXAdapter } from './utils/WXAdapter';

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

    /** Phase 3: 运行时创建的子系统 (无需编辑器挂载) */
    private _eventSystem: EventSystem | null = null;
    private _eventUI: EventUI | null = null;
    mutationManager: MutationManager | null = null;
    /** Phase 4: 运行时创建的子系统 */
    private _marqueeUI: MarqueeUI | null = null;

    onLoad(): void {
        const gm = GameManager.instance;

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

        // 初始化强化管理器
        if (this.upgradeManager && this.player && this.skillSystem) {
            const autoAttack = this.player.getComponent(AutoAttack);
            this.upgradeManager.init(
                this.player,
                this.skillSystem,
                autoAttack!,
                this.battleManager!,
            );
        }

        // 初始化元素反应系统
        if (this.elementSystem && this.player && this.battleManager) {
            this.elementSystem.init(this.player, this.battleManager);
        }

        // 初始化装备系统
        if (this.equipmentSystem && this.player) {
            this.equipmentSystem.init(this.player);
        }
        if (this.equipmentUI && this.equipmentSystem) {
            this.equipmentUI.init(this.equipmentSystem);
        }

        // 初始化道具系统
        if (this.itemSystem && this.player && this.battleManager) {
            this.itemSystem.init(this.player, this.battleManager);
        }
        if (this.inventoryUI && this.itemSystem) {
            this.inventoryUI.init(this.itemSystem);
        }

        // === Phase 3: 事件系统 (运行时创建，无需编辑器挂载) ===
        this._eventSystem = new EventSystem();
        this._eventSystem.init(this.player!);

        // EventUI 运行时动态创建节点并附加组件
        const eventUINode = new Node('EventUI');
        this._eventUI = eventUINode.addComponent(EventUI);
        this.node.addChild(eventUINode);
        this._eventUI.init(this._eventSystem, this.player!);

        // === Phase 3: 房间变异系统 (运行时创建) ===
        this.mutationManager = new MutationManager();

        // === Phase 4: 跑马灯系统 (运行时创建) ===
        const marqueeNode = new Node('MarqueeUI');
        this._marqueeUI = marqueeNode.addComponent(MarqueeUI);
        this.node.addChild(marqueeNode);

        // === Phase 4: 刷新上报缓存 (启动时) ===
        WXAdapter.getInstance().flushAnalyticsCache();

        // === Phase 4: 进入地牢时隐藏 Banner ===
        WXAdapter.getInstance().hideBanner();

        // 初始化地牢（使用 GameManager 的区域系统）
        const seed = Math.floor(Math.random() * 2147483647);
        if (this.dungeonManager && this.player) {
            this.dungeonManager.init(this.player, seed);
        }

        // 摇杆绑定
        if (this.joystick && this.player) {
            this.joystick.setMoveCallback((event) => {
                this.player!.handleJoystick(event);
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
        eventBus.on('room:treasure', this._onEnterTreasureRoom, this);
        eventBus.on('room:healing', this._onEnterHealingRoom, this);
        eventBus.on(GameEvent.ZONE_BOSS_DEFEATED, this._onZoneBossDefeated, this);
        eventBus.on(GameEvent.ALL_ZONES_CLEARED, this._onAllZonesCleared, this);
        eventBus.on('mutation:generate', this._onMutationGenerate, this);
        eventBus.on('mutation:cleared', this._onMutationCleared, this);
        eventBus.on('boss:phase_changed', this._onBossPhaseChanged, this);
        eventBus.on(GameEvent.GAME_OVER, this._onGameOver, this);
        eventBus.on('mutation:element_storm', this._onElementStorm, this);

        // 应用选中角色初始能力
        this._applySelectedCharacter();

        // 设置区域标题 HUD
        this._showZoneIntro();

        if (gm) {
            gm.setPhase(GamePhase.Dungeon);
        }
    }

    /** 显示区域介绍 */
    private _showZoneIntro(): void {
        const gm = GameManager.instance;
        const zoneDef = gm.currentZoneDef;
        if (zoneDef) {
            eventBus.emit('hud:zone_intro', zoneDef.name, zoneDef.visualTheme);
        }
    }

    /** 应用选中角色的初始能力 + 初始技能 */
    private _applySelectedCharacter(): void {
        if (!this.player || !this.skillSystem) return;

        const pdm = PlayerDataManager.getInstance();
        const charId = pdm.selectedCharacter;
        const charDef = CHARACTER_LIST.find(c => c.id === charId);
        if (!charDef) return;

        eventBus.emit('upgrade:selected', { id: charDef.initialAbility, type: 'ability' });

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
            this.player.heal(50);
            this.battleManager.setPaused(false);
        }
    }

    /** 战斗胜利 */
    private _onBattleVictory(): void {
        if (!this.dungeonManager) return;

        const room = this.dungeonManager.currentRoom;
        if (!room) return;

        const roomType = room.type === RoomType.Boss ? 'boss' as const
            : room.type === RoomType.Elite ? 'elite' as const
            : 'normal' as const;

        // Phase 4: 上报战斗胜利事件
        WXAdapter.getInstance().reportAnalytics('room_clear', {
            sec: 0,
            hp: 0,
            reactions: 0,
        });

        // 装备掉落
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

        // 道具掉落
        if (this.itemSystem) {
            this.itemSystem.tryDrop(roomType);
        }

        // 检查是否是 Boss 房
        if (room.type === RoomType.Boss) {
            const gm = GameManager.instance;

            if (this.dungeonManager.floorState?.isMiniBossFloor) {
                // 迷你Boss击败 → 进入下一个小关
                console.log('[区域] 迷你Boss击败，进入下个小关');
                if (gm.advanceStage()) {
                    this.dungeonManager.resetForZone(gm.currentZone, gm.currentStageId);
                    this._showZoneIntro();
                } else {
                    this.dungeonManager.enterNextFloor();
                }
            } else if (gm.isLastStageInZone) {
                // 终结Boss击败 → 进入下一个区域
                eventBus.emit(GameEvent.ZONE_BOSS_DEFEATED, gm.currentZone);
            }
        }
    }

    /** 区域终结Boss被击败 */
    private _onZoneBossDefeated(zoneId: string): void {
        const gm = GameManager.instance;
        console.log(`[区域] ${zoneId} 终结Boss击败!`);
        eventBus.emit('hud:zone_cleared', zoneId, gm.currentZoneDef?.name ?? '');

        if (gm.advanceToNextZone()) {
            if (this.dungeonManager) {
                this.dungeonManager.resetForZone(gm.currentZone, gm.currentStageId);
            }
            this._showZoneIntro();
        }
    }

    /** 所有区域通关 */
    private _onAllZonesCleared(): void {
        console.log('[游戏] 恭喜通关!');
        eventBus.emit('game:victory');
    }

    /** 商店房间 */
    private _onEnterShopRoom(roomId: number): void {
        eventBus.emit('ui:show_shop', {
            sellItems: ['key', 'advancedKey', 'rerollScroll', 'elementScroll'],
        });
    }

    /** 宝箱房间 */
    private _onEnterTreasureRoom(roomId: number): void {
        console.log(`[宝箱房] 房间 ${roomId}`);
    }

    /** 回血房间 */
    private _onEnterHealingRoom(roomId: number): void {
        if (this.player) {
            const stats = this.player.stats.getFinalStats();
            const healAmount = Math.floor(stats.maxHP * 0.2);
            this.player.heal(healAmount);
            eventBus.emit('hud:healing', healAmount);
        }
    }

    /** 生成房间变异 */
    private _onMutationGenerate(floorNumber: number): void {
        if (!this.mutationManager || !this.player) return;

        // 清除旧变异
        this.player.stats.removeModifiersByPrefix('mutation:');
        this.mutationManager.clearMutations();

        const mutations = this.mutationManager.generateMutation(floorNumber);
        if (mutations.length > 0) {
            console.log(`[变异] 第 ${floorNumber} 层: ${mutations.map(m => m.name).join(', ')}`);
            this._applyMutationEffects(mutations);
        }
    }

    /** 将变异参数应用到角色属性 */
    private _applyMutationEffects(mutations: any[]): void {
        if (!this.player) return;
        const stats = this.player.stats;

        for (const mut of mutations) {
            const eff = mut.effect;
            const src = `mutation:${mut.id}`;

            if (eff.playerAtkMod !== undefined) {
                stats.applyModifier({ source: `${src}:atk`, stat: 'atk', value: eff.playerAtkMod, type: 'flat', duration: 0 });
            }
            if (eff.playerDefMod !== undefined) {
                stats.applyModifier({ source: `${src}:def`, stat: 'def', value: eff.playerDefMod, type: 'flat', duration: 0 });
            }
            if (eff.playerSpeedMod !== undefined) {
                stats.applyModifier({ source: `${src}:speed`, stat: 'moveSpeed', value: eff.playerSpeedMod - 1, type: 'percent', duration: 0 });
            }
            if (eff.playerAttackSpeed !== undefined) {
                stats.applyModifier({ source: `${src}:atkSpeed`, stat: 'atkSpeed', value: eff.playerAttackSpeed - 1, type: 'percent', duration: 0 });
            }
            if (eff.playerHealEffect !== undefined) {
                stats.applyModifier({ source: `${src}:heal`, stat: 'lifeSteal', value: eff.playerHealEffect - 1, type: 'percent', duration: 0 });
            }
            if (eff.playerLifesteal !== undefined) {
                stats.applyModifier({ source: `${src}:lifesteal`, stat: 'lifeSteal', value: eff.playerLifesteal - 1, type: 'percent', duration: 0 });
            }
            if (eff.skillCdMod !== undefined) {
                stats.applyModifier({ source: `${src}:cd`, stat: 'atkSpeed', value: 1 / eff.skillCdMod - 1, type: 'percent', duration: 0 });
            }
            if (eff.goldDropMod !== undefined) {
                stats.applyModifier({ source: `${src}:gold`, stat: 'damageMultiplier', value: eff.goldDropMod - 1, type: 'percent', duration: 0 });
            }
        }

        if (this.battleHUD && this.player) {
            const final = this.player.stats.getFinalStats();
            this.battleHUD.refreshHP(this.player.currentHP, final.maxHP);
        }
    }

    /** 变异清除 */
    private _onMutationCleared(): void {
        if (this.player) {
            this.player.stats.removeModifiersByPrefix('mutation:');
        }
    }

    /** Boss 阶段变更通知 */
    private _onBossPhaseChanged(monster: any, phase: number, maxPhase: number): void {
        console.log(`[Boss] 阶段 ${phase}/${maxPhase}`);
        eventBus.emit('hud:boss_phase', phase, maxPhase);
    }

    /** 游戏结束 — 重置跑马灯 + 上报对局数据 */
    private _onGameOver(): void {
        // 跑马灯清零
        if (this._marqueeUI) {
            this._marqueeUI.resetOnDeath();
        }
        // 上报
        const gm = GameManager.instance;
        const pdm = PlayerDataManager.getInstance();
        WXAdapter.getInstance().reportAnalytics('run_end', {
            depth: gm.currentFloor,
            kills: 0,
            time: 0,
            result: 'dead',
            seed: '',
        });
    }

    /** 奥术风暴变异伤害 */
    private _onElementStorm(): void {
        if (this.player) {
            this.player.takeDamage(3, false);
        }
    }

    onDestroy(): void {
        eventBus.offTarget(this);
    }

    update(dt: number): void {
        if (this.mutationManager) {
            this.mutationManager.update(dt);
        }
    }
}
