import { Color, Graphics, Label, Node, ProgressBar, Sprite, UIOpacity, Vec3 } from 'cc';
import { AutoAttack } from '../battle/AutoAttack';
import { BattleManager } from '../battle/BattleManager';
import { ElementSystem } from '../battle/ElementSystem';
import { EquipmentSystem } from '../battle/EquipmentSystem';
import { ItemSystem } from '../battle/ItemSystem';
import { PlayerController } from '../battle/PlayerController';
import { SkillSystem } from '../battle/SkillSystem';
import { UpgradeManager } from '../battle/UpgradeManager';
import { DungeonManager } from '../dungeon/DungeonManager';
import { GridManager } from '../dungeon/GridManager';
import { RoomTransition } from '../dungeon/RoomTransition';
import { BattleHUD } from '../ui/BattleHUD';
import { DeathUI } from '../ui/DeathUI';
import { DungeonMapUI } from '../ui/DungeonMapUI';
import { EquipmentUI } from '../ui/EquipmentUI';
import { InventoryUI } from '../ui/InventoryUI';
import { SkillUI } from '../ui/SkillUI';
import { UpgradeUI } from '../ui/UpgradeUI';
import { VirtualJoystick } from '../ui/VirtualJoystick';
import { ArtResourceResolver } from '../assets/ArtResourceResolver';
import { RenderAssetService } from '../assets/RenderAssetService';
import { SceneNodeFactory as F } from './SceneNodeFactory';

export interface DungeonSceneRefs {
    backgroundNode: Node;
    gridManager: GridManager;
    player: PlayerController;
    battleManager: BattleManager;
    dungeonManager: DungeonManager;
    roomTransition: RoomTransition;
    joystick: VirtualJoystick;
    skillSystem: SkillSystem;
    battleHUD: BattleHUD;
    dungeonMapUI: DungeonMapUI;
    upgradeUI: UpgradeUI;
    deathUI: DeathUI;
    upgradeManager: UpgradeManager;
    elementSystem: ElementSystem;
    equipmentSystem: EquipmentSystem;
    equipmentUI: EquipmentUI;
    itemSystem: ItemSystem;
    inventoryUI: InventoryUI;
    skillUI: SkillUI;
}

export interface DungeonSceneOverrides {
    gridManager?: GridManager | null;
    player?: PlayerController | null;
    battleManager?: BattleManager | null;
    dungeonManager?: DungeonManager | null;
    roomTransition?: RoomTransition | null;
    joystick?: VirtualJoystick | null;
    skillSystem?: SkillSystem | null;
    battleHUD?: BattleHUD | null;
    dungeonMapUI?: DungeonMapUI | null;
    upgradeUI?: UpgradeUI | null;
    deathUI?: DeathUI | null;
    upgradeManager?: UpgradeManager | null;
    elementSystem?: ElementSystem | null;
    equipmentSystem?: EquipmentSystem | null;
    equipmentUI?: EquipmentUI | null;
    itemSystem?: ItemSystem | null;
    inventoryUI?: InventoryUI | null;
}

export class DungeonSceneInstaller {
    install(controllerNode: Node, overrides: DungeonSceneOverrides = {}): DungeonSceneRefs {
        const sceneRoot = controllerNode.parent ?? controllerNode;
        const canvas = F.findChildByName(sceneRoot, 'Canvas') ?? sceneRoot;

        const world = F.ensureChild(canvas, 'World');
        world.setPosition(Vec3.ZERO);
        F.ensureTransform(world, 1280, 720);
        F.ensureComponent<UIOpacity>(world, UIOpacity);
        const backgroundNode = F.ensureChild(world, 'Background');
        backgroundNode.setSiblingIndex(0);
        F.ensureTransform(backgroundNode, 1280, 720);
        F.ensureComponent<Sprite>(backgroundNode, Sprite);

        const systems = F.ensureChild(canvas, 'Systems');
        const uiRoot = F.ensureChild(canvas, 'UIRoot');
        F.ensureTransform(uiRoot, 1280, 720);

        const gridNode = F.ensureChild(world, 'Grid');
        gridNode.setPosition(0, 0, 0);
        const gridManager = overrides.gridManager
            ?? F.findComponentInChildren<GridManager>(sceneRoot, GridManager)
            ?? F.ensureComponent<GridManager>(gridNode, GridManager);

        const playerNode = F.ensureChild(world, 'Player');
        F.ensureTransform(playerNode, 96, 96);
        F.ensureComponent<Sprite>(playerNode, Sprite);
        F.ensureComponent<AutoAttack>(playerNode, AutoAttack);
        const player = overrides.player
            ?? F.findComponentInChildren<PlayerController>(sceneRoot, PlayerController)
            ?? F.ensureComponent<PlayerController>(playerNode, PlayerController);

        const battleManager = overrides.battleManager
            ?? F.findComponentInChildren<BattleManager>(sceneRoot, BattleManager)
            ?? F.ensureComponent<BattleManager>(F.ensureChild(systems, 'BattleManager'), BattleManager);
        const dungeonManager = overrides.dungeonManager
            ?? F.findComponentInChildren<DungeonManager>(sceneRoot, DungeonManager)
            ?? F.ensureComponent<DungeonManager>(F.ensureChild(systems, 'DungeonManager'), DungeonManager);
        const roomTransition = overrides.roomTransition
            ?? F.findComponentInChildren<RoomTransition>(sceneRoot, RoomTransition)
            ?? F.ensureComponent<RoomTransition>(F.ensureChild(systems, 'RoomTransition'), RoomTransition);

        dungeonManager.gridManager = gridManager;
        dungeonManager.battleManager = battleManager;
        dungeonManager.roomTransition = roomTransition;
        roomTransition.roomContainer = world;
        roomTransition.doorNode = this._ensureDoor(world);

        const skillSystem = overrides.skillSystem
            ?? F.findComponentInChildren<SkillSystem>(sceneRoot, SkillSystem)
            ?? F.ensureComponent<SkillSystem>(F.ensureChild(systems, 'SkillSystem'), SkillSystem);
        const upgradeManager = overrides.upgradeManager
            ?? F.findComponentInChildren<UpgradeManager>(sceneRoot, UpgradeManager)
            ?? F.ensureComponent<UpgradeManager>(F.ensureChild(systems, 'UpgradeManager'), UpgradeManager);
        const elementSystem = overrides.elementSystem
            ?? F.findComponentInChildren<ElementSystem>(sceneRoot, ElementSystem)
            ?? F.ensureComponent<ElementSystem>(F.ensureChild(systems, 'ElementSystem'), ElementSystem);
        const equipmentSystem = overrides.equipmentSystem
            ?? F.findComponentInChildren<EquipmentSystem>(sceneRoot, EquipmentSystem)
            ?? F.ensureComponent<EquipmentSystem>(F.ensureChild(systems, 'EquipmentSystem'), EquipmentSystem);
        const itemSystem = overrides.itemSystem
            ?? F.findComponentInChildren<ItemSystem>(sceneRoot, ItemSystem)
            ?? F.ensureComponent<ItemSystem>(F.ensureChild(systems, 'ItemSystem'), ItemSystem);

        const joystick = overrides.joystick
            ?? F.findComponentInChildren<VirtualJoystick>(sceneRoot, VirtualJoystick)
            ?? this._ensureJoystick(uiRoot);
        const battleHUD = overrides.battleHUD
            ?? F.findComponentInChildren<BattleHUD>(sceneRoot, BattleHUD)
            ?? this._ensureBattleHUD(uiRoot);
        const dungeonMapUI = overrides.dungeonMapUI
            ?? F.findComponentInChildren<DungeonMapUI>(sceneRoot, DungeonMapUI)
            ?? this._ensureDungeonMapUI(uiRoot);
        const skillUI = F.findComponentInChildren<SkillUI>(sceneRoot, SkillUI)
            ?? this._ensureSkillUI(uiRoot);
        const upgradeUI = overrides.upgradeUI
            ?? F.findComponentInChildren<UpgradeUI>(sceneRoot, UpgradeUI)
            ?? F.ensureComponent<UpgradeUI>(F.ensureChild(uiRoot, 'UpgradeUI'), UpgradeUI);
        const deathUI = overrides.deathUI
            ?? F.findComponentInChildren<DeathUI>(sceneRoot, DeathUI)
            ?? F.ensureComponent<DeathUI>(F.ensureChild(uiRoot, 'DeathUI'), DeathUI);
        const equipmentUI = overrides.equipmentUI
            ?? F.findComponentInChildren<EquipmentUI>(sceneRoot, EquipmentUI)
            ?? F.ensureComponent<EquipmentUI>(F.ensureChild(uiRoot, 'EquipmentUI'), EquipmentUI);
        const inventoryUI = overrides.inventoryUI
            ?? F.findComponentInChildren<InventoryUI>(sceneRoot, InventoryUI)
            ?? F.ensureComponent<InventoryUI>(F.ensureChild(uiRoot, 'InventoryUI'), InventoryUI);

        return {
            backgroundNode,
            gridManager,
            player,
            battleManager,
            dungeonManager,
            roomTransition,
            joystick,
            skillSystem,
            battleHUD,
            dungeonMapUI,
            upgradeUI,
            deathUI,
            upgradeManager,
            elementSystem,
            equipmentSystem,
            equipmentUI,
            itemSystem,
            inventoryUI,
            skillUI,
        };
    }

    async loadInitialArt(refs: DungeonSceneRefs, characterId: string = 'warrior', zoneId: string = 'forest'): Promise<void> {
        await RenderAssetService.applyTextureAsSprite(refs.backgroundNode, ArtResourceResolver.backgroundCombat(zoneId));
        const playerSprite = refs.player.getComponent(Sprite);
        if (playerSprite) {
            await RenderAssetService.applyCharacterSprite(refs.player.node, characterId, 'idle');
        }
    }

    private _ensureDoor(world: Node): Node {
        const node = F.ensureChild(world, 'ExitDoor');
        F.ensureTransform(node, 56, 80);
        const graphics = F.ensureComponent<Graphics>(node, Graphics);
        graphics.clear();
        graphics.fillColor = new Color(90, 60, 30, 180);
        graphics.rect(-28, -40, 56, 80);
        graphics.fill();
        return node;
    }

    private _ensureJoystick(parent: Node): VirtualJoystick {
        const node = F.ensureChild(parent, 'VirtualJoystick');
        node.setPosition(-470, -250, 0);
        F.ensureTransform(node, 160, 160);
        const joystick = F.ensureComponent<VirtualJoystick>(node, VirtualJoystick);

        const bg = F.ensureChild(node, 'JoystickBg');
        F.ensureTransform(bg, 120, 120);
        this._fillRect(bg, 120, 120, new Color(80, 120, 180, 120));

        const thumb = F.ensureChild(bg, 'JoystickThumb');
        F.ensureTransform(thumb, 48, 48);
        this._fillRect(thumb, 48, 48, new Color(180, 220, 255, 180));

        joystick.joystickBg = bg;
        joystick.joystickThumb = thumb;
        return joystick;
    }

    private _ensureBattleHUD(parent: Node): BattleHUD {
        const node = F.ensureChild(parent, 'BattleHUD');
        node.setPosition(-560, 315, 0);
        const hud = F.ensureComponent<BattleHUD>(node, BattleHUD);
        hud.hpLabel = this._ensureLabel(F.ensureChild(node, 'HPLabel'), 'HP');
        hud.floorLabel = this._ensureLabel(F.ensureChild(node, 'FloorLabel'), '1F');
        hud.killLabel = this._ensureLabel(F.ensureChild(node, 'KillLabel'), '0');

        const hpBarNode = F.ensureChild(node, 'HPBar');
        F.ensureTransform(hpBarNode, 220, 16);
        this._fillRect(hpBarNode, 220, 16, new Color(80, 180, 90, 220));
        hud.hpBar = F.ensureComponent<ProgressBar>(hpBarNode, ProgressBar);
        return hud;
    }

    private _ensureDungeonMapUI(parent: Node): DungeonMapUI {
        const node = F.ensureChild(parent, 'DungeonMapUI');
        node.setPosition(320, 160, 0);
        const map = F.ensureComponent<DungeonMapUI>(node, DungeonMapUI);
        map.mapContainer = F.ensureChild(node, 'MapContainer');
        return map;
    }

    private _ensureSkillUI(parent: Node): SkillUI {
        const node = F.ensureChild(parent, 'SkillUI');
        node.setPosition(390, -265, 0);
        return F.ensureComponent<SkillUI>(node, SkillUI);
    }

    private _ensureLabel(node: Node, text: string): Label {
        const label = F.ensureComponent<Label>(node, Label);
        label.string = text;
        label.fontSize = 18;
        label.color = Color.WHITE;
        return label;
    }

    private _fillRect(node: Node, width: number, height: number, color: Color): void {
        const graphics = F.ensureComponent<Graphics>(node, Graphics);
        graphics.clear();
        graphics.fillColor = color;
        graphics.rect(-width / 2, -height / 2, width, height);
        graphics.fill();
    }

}
