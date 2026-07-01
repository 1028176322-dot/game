import { _decorator, Component, Node } from 'cc';
import { GamePhase } from './core/Constants';
import { eventBus } from './core/EventBus';
import { GameEvent, GameManager } from './core/GameManager';
import { ConfigManager } from './core/ConfigManager';
import { ConfigService } from './config/ConfigService';
import { GridManager } from './dungeon/GridManager';
import { DungeonManager } from './dungeon/DungeonManager';
import { RoomTransition } from './dungeon/RoomTransition';
import { BattleManager } from './battle/BattleManager';
import { PlayerController } from './battle/PlayerController';
import { AutoAttack } from './battle/AutoAttack';
import { SkillSystem } from './battle/SkillSystem';
import { UpgradeManager } from './battle/UpgradeManager';
import { ElementSystem } from './battle/ElementSystem';
import { EquipmentSystem } from './battle/EquipmentSystem';
import { EventSystem } from './battle/EventSystem';
import { ItemSystem } from './battle/ItemSystem';
import { MutationManager } from './battle/MutationManager';
import { EquipmentUI } from './ui/EquipmentUI';
import { EventUI } from './ui/EventUI';
import { MarqueeUI } from './ui/MarqueeUI';
import { InventoryUI } from './ui/InventoryUI';
import { VirtualJoystick } from './ui/VirtualJoystick';
import { BattleHUD } from './ui/BattleHUD';
import { DungeonMapUI } from './ui/DungeonMapUI';
import { UpgradeUI } from './ui/UpgradeUI';
import { DeathUI } from './ui/DeathUI';
import { SkillUI } from './ui/SkillUI';
import { WXAdapter } from './utils/WXAdapter';
import { RunRng } from './core/rng/RunRng';
import { RoomFlowController } from './run/RoomFlowController';
import { RewardService } from './run/RewardService';
import { CharacterStartService } from './run/CharacterStartService';
import { MutationRuntimeService } from './run/MutationRuntimeService';
import { AssetBundleService } from './assets/AssetBundleService';
import { DungeonSceneInstaller, DungeonSceneRefs } from './scene/DungeonSceneInstaller';
import { PlayerDataManager } from './core/PlayerDataManager';

const { ccclass, property } = _decorator;

@ccclass('DungeonSceneController')
export class DungeonSceneController extends Component {
    @property(GridManager) gridManager: GridManager | null = null;
    @property(PlayerController) player: PlayerController | null = null;
    @property(BattleManager) battleManager: BattleManager | null = null;
    @property(DungeonManager) dungeonManager: DungeonManager | null = null;
    @property(RoomTransition) roomTransition: RoomTransition | null = null;
    @property(VirtualJoystick) joystick: VirtualJoystick | null = null;
    @property(SkillSystem) skillSystem: SkillSystem | null = null;
    @property(BattleHUD) battleHUD: BattleHUD | null = null;
    @property(DungeonMapUI) dungeonMapUI: DungeonMapUI | null = null;
    @property(UpgradeUI) upgradeUI: UpgradeUI | null = null;
    @property(DeathUI) deathUI: DeathUI | null = null;
    @property(UpgradeManager) upgradeManager: UpgradeManager | null = null;
    @property(ElementSystem) elementSystem: ElementSystem | null = null;
    @property(EquipmentSystem) equipmentSystem: EquipmentSystem | null = null;
    @property(EquipmentUI) equipmentUI: EquipmentUI | null = null;
    @property(ItemSystem) itemSystem: ItemSystem | null = null;
    @property(InventoryUI) inventoryUI: InventoryUI | null = null;

    private _skillUI: SkillUI | null = null;
    private _roomFlow: RoomFlowController | null = null;
    private _mutationRuntime: MutationRuntimeService | null = null;
    private _eventUI: EventUI | null = null;
    private _marqueeUI: MarqueeUI | null = null;
    private _installer = new DungeonSceneInstaller();
    private _installedRefs: DungeonSceneRefs | null = null;
    private _booted = false;

    onLoad(): void {
        this._installSceneRefs();
        void this._bootstrap();
    }

    private _installSceneRefs(): void {
        const refs = this._installer.install(this.node, {
            gridManager: this.gridManager,
            player: this.player,
            battleManager: this.battleManager,
            dungeonManager: this.dungeonManager,
            roomTransition: this.roomTransition,
            joystick: this.joystick,
            skillSystem: this.skillSystem,
            battleHUD: this.battleHUD,
            dungeonMapUI: this.dungeonMapUI,
            upgradeUI: this.upgradeUI,
            deathUI: this.deathUI,
            upgradeManager: this.upgradeManager,
            elementSystem: this.elementSystem,
            equipmentSystem: this.equipmentSystem,
            equipmentUI: this.equipmentUI,
            itemSystem: this.itemSystem,
            inventoryUI: this.inventoryUI,
        });
        this._installedRefs = refs;

        this.gridManager = refs.gridManager;
        this.player = refs.player;
        this.battleManager = refs.battleManager;
        this.dungeonManager = refs.dungeonManager;
        this.roomTransition = refs.roomTransition;
        this.joystick = refs.joystick;
        this.skillSystem = refs.skillSystem;
        this.battleHUD = refs.battleHUD;
        this.dungeonMapUI = refs.dungeonMapUI;
        this.upgradeUI = refs.upgradeUI;
        this.deathUI = refs.deathUI;
        this.upgradeManager = refs.upgradeManager;
        this.elementSystem = refs.elementSystem;
        this.equipmentSystem = refs.equipmentSystem;
        this.equipmentUI = refs.equipmentUI;
        this.itemSystem = refs.itemSystem;
        this.inventoryUI = refs.inventoryUI;
        this._skillUI = refs.skillUI;
    }

    private async _bootstrap(): Promise<void> {
        if (this._booted) return;
        this._booted = true;

        try {
            await this._ensureStartupReady();
        } catch (err) {
            console.error('[DungeonSceneController] startup failed:', err);
            return;
        }

        const gm = GameManager.ensure(this.node.scene);
        if (gm.zoneRoute.length === 0 || !gm.currentStageId) {
            gm.initNewRun();
        } else {
            gm.setPhase(GamePhase.Dungeon);
        }

        if (this._installedRefs) {
            await this._installer.loadInitialArt(
                this._installedRefs,
                PlayerDataManager.getInstance().selectedCharacter,
                gm.currentZone,
            );
        }

        // [Phase 10] 打印场景节点树供调试
        this._logSceneTree();

        this._wireSystems();
        this._wireServices();
        this._wireUI();
        this._wireEvents();

        // [Phase 10] 打印场景节点树供调试
        this._logSceneTree();
    }

    private async _ensureStartupReady(): Promise<void> {
        if (!ConfigService.instance.loaded) {
            await ConfigService.instance.loadAll();
        }
        ConfigManager.getInstance().loadAll();
        await AssetBundleService.instance.loadAssetMapFromResources();
    }

    private _wireSystems(): void {
        const refs = this._installedRefs;
        if (!refs) {
            console.error('[DungeonSceneController] scene refs are not installed.');
            return;
        }

        const player = this.player!;
        const gridManager = this.gridManager!;
        const battleManager = this.battleManager!;
        const skillSystem = this.skillSystem!;
        const autoAttack = player.getComponent(AutoAttack) ?? player.node.addComponent(AutoAttack);

        player.init(gridManager);
        skillSystem.init(player);
        battleManager.init(player, gridManager, refs.actorLayer);
        this.upgradeManager?.init(player, skillSystem, autoAttack, battleManager);
        this.elementSystem?.init(player, battleManager);
        this.equipmentSystem?.init(player);
        if (this.equipmentSystem) this.equipmentUI?.init(this.equipmentSystem);
        this.itemSystem?.init(player, battleManager);
        if (this.itemSystem) this.inventoryUI?.init(this.itemSystem);
        this._skillUI?.bindSkillSystem(skillSystem);

        const seed = Date.now() & 0x7fffffff;
        RunRng.instance.startRun(seed);
        this.dungeonManager?.init(player, seed);
        this.joystick?.setMoveCallback((event) => player.handleJoystick(event));

        if (this.battleHUD) {
            const initStats = player.stats.getFinalStats();
            this.battleHUD.refreshHP(player.currentHP, initStats.maxHP);
            player.onHPChanged = (current, max) => this.battleHUD?.refreshHP(current, max);
        }
    }

    private _wireServices(): void {
        const rs = new RewardService(this.equipmentSystem, this.itemSystem);
        this._roomFlow = new RoomFlowController(this.dungeonManager!, rs, this.player);
        new CharacterStartService(this.skillSystem).applySelectedCharacter();
    }

    private _wireUI(): void {
        const es = new EventSystem();
        es.init(this.player!);

        if (!this._eventUI) {
            const euin = new Node('EventUI');
            this.node.addChild(euin);
            this._eventUI = euin.addComponent(EventUI);
        }
        this._eventUI.init(es, this.player!);

        const mm = new MutationManager();
        this._mutationRuntime = new MutationRuntimeService(mm, this.player, this.battleHUD);

        if (!this._marqueeUI) {
            const mqn = new Node('MarqueeUI');
            this.node.addChild(mqn);
            this._marqueeUI = mqn.addComponent(MarqueeUI);
        }
    }

    private _wireEvents(): void {
        const rf = this._roomFlow;
        const mr = this._mutationRuntime;
        eventBus.on('player:revive', () => rf?.onPlayerRevive(), this);
        eventBus.on('battle:victory', () => rf?.onBattleVictory(), this);
        eventBus.on('room:shop', (id: number) => rf?.onEnterShopRoom(id), this);
        eventBus.on('room:treasure', (id: number) => rf?.onEnterTreasureRoom(id), this);
        eventBus.on('room:healing', (id: number) => rf?.onEnterHealingRoom(id), this);
        eventBus.on(GameEvent.ZONE_BOSS_DEFEATED, (z: string) => rf?.onZoneBossDefeated(z), this);
        eventBus.on(GameEvent.ALL_ZONES_CLEARED, () => rf?.onAllZonesCleared(), this);
        eventBus.on('mutation:generate', (f: number) => mr?.generateMutation(f), this);
        eventBus.on('mutation:cleared', () => mr?.clearMutation(), this);
        eventBus.on('mutation:element_storm', () => mr?.onElementStorm(), this);
        eventBus.on('boss:phase_changed', (_m: unknown, p: number, mp: number) => eventBus.emit('hud:boss_phase', p, mp), this);
        eventBus.on(GameEvent.GAME_OVER, () => {
            this._marqueeUI?.resetOnDeath();
            const gm = GameManager.instance;
            WXAdapter.getInstance().reportAnalytics('run_end', {
                depth: gm?.currentFloor ?? 1,
                kills: this.battleManager?.killCount ?? 0,
                time: 0,
                result: 'dead',
                seed: '',
            });
        }, this);

        const zoneDef = GameManager.instance?.currentZoneDef;
        if (zoneDef) eventBus.emit('hud:zone_intro', zoneDef.name, zoneDef.visualTheme);
        WXAdapter.getInstance().flushAnalyticsCache();
        WXAdapter.getInstance().hideBanner();
    }

    protected onDestroy(): void {
        eventBus.offTarget(this);
    }

    /** 调试用：打印场景节点树 */
    private _logSceneTree(): void {
        const refs = this._installedRefs;
        if (!refs) return;
        console.log('[SceneTree]', {
            background: refs.backgroundLayer.children.map(n => n.name),
            tiles: refs.tileLayer.children.length,
            actors: refs.actorLayer.children.map(n => ({
                name: n.name,
                active: n.active,
                pos: n.position.toString(),
                layer: n.layer,
                sibling: n.getSiblingIndex(),
            })),
            effects: refs.effectLayer.children.length,
        });
    }

    update(dt: number): void {
        this._mutationRuntime?.update(dt);
    }
}
