/**
 * EquipmentUI - 装备界面 (M2.3)
 * 代码生成节点 (无 Prefab 依赖)
 * 8 槽位面板 + 12 格背包 + 套装计数
 */

import { _decorator, Component, Node, Button, Label, Sprite, Color, UITransform, Vec3, instantiate, tween } from 'cc';
import { eventBus } from '../core/EventBus';
import { EquipmentSystem, Equipment, EquipmentSlot, EQUIPMENT_SLOTS, Rarity, RARITY_WEIGHTS, SLOT_NAMES, RARITY_PREFIX } from '../battle/EquipmentSystem';

const { ccclass, property } = _decorator;

/** 稀有度颜色映射 */
const RARITY_COLORS: Record<string, Color> = {
    common: new Color(204, 204, 204),   // 灰白
    uncommon: new Color(74, 144, 217),  // 蓝
    rare: new Color(255, 165, 0),       // 金
    epic: new Color(255, 69, 0),        // 橙红
};

/** 槽位中文名 (环指去重) */
function slotLabel(slot: EquipmentSlot): string {
    return SLOT_NAMES[slot] ?? slot;
}

@ccclass('EquipmentUI')
export class EquipmentUI extends Component {
    private _equipSystem: EquipmentSystem | null = null;
    private _isOpen: boolean = false;

    /** 根节点 */
    private _panel: Node | null = null;
    /** 槽位节点映射 */
    private _slotNodes: Map<EquipmentSlot, Node> = new Map();
    /** 背包格子节点列表 */
    private _backpackNodes: Node[] = [];
    /** 套装信息标签 */
    private _setInfoLabel: Label | null = null;
    /** 装备统计标签 */
    private _statsLabel: Label | null = null;

    init(system: EquipmentSystem): void {
        this._equipSystem = system;
        this._buildUI();
        this.node.active = false;
    }

    onLoad(): void {
        eventBus.on('equip:changed', this._onEquipChanged, this);
        eventBus.on('equip:unequipped', this._onEquipChanged, this);
        eventBus.on('equip:picked_up', this._refreshAll, this);
    }

    onDestroy(): void {
        eventBus.offTarget(this);
    }

    /** 打开/关闭界面 */
    toggle(): void {
        if (this._isOpen) {
            this.hide();
        } else {
            this.show();
        }
    }

    show(): void {
        this._isOpen = true;
        this.node.active = true;
        this._refreshAll();
    }

    hide(): void {
        this._isOpen = false;
        this.node.active = false;
    }

    get isOpen(): boolean { return this._isOpen; }

    // ======== UI 构建 ========

    private _buildUI(): void {
        this._panel = new Node('equipPanel');
        this.node.addChild(this._panel);

        const panelTransform = this._panel.addComponent(UITransform);
        panelTransform.setContentSize(500, 420);

        // === 标题 ===
        const titleNode = new Node('title');
        titleNode.setPosition(0, 190, 0);
        this._panel.addChild(titleNode);
        const titleLabel = titleNode.addComponent(Label);
        titleLabel.string = '装备';
        titleLabel.fontSize = 24;
        titleLabel.color = Color.WHITE;

        // === 装备槽位 (左半边, 网格布局) ===
        const slotPositions: Record<EquipmentSlot, Vec3> = {
            [EquipmentSlot.Head]: new Vec3(-140, 130, 0),
            [EquipmentSlot.Chest]: new Vec3(-140, 70, 0),
            [EquipmentSlot.Weapon]: new Vec3(-200, 10, 0),
            [EquipmentSlot.Offhand]: new Vec3(-80, 10, 0),
            [EquipmentSlot.Ring1]: new Vec3(-200, -50, 0),
            [EquipmentSlot.Ring2]: new Vec3(-80, -50, 0),
            [EquipmentSlot.Boots]: new Vec3(-140, -110, 0),
            [EquipmentSlot.Amulet]: new Vec3(-140, -170, 0),
        };

        for (const slot of EQUIPMENT_SLOTS) {
            const node = this._createSlotNode(slot, slotPositions[slot]);
            this._slotNodes.set(slot, node);
        }

        // === 背包 (右半边, 3x4 网格) ===
        const backpackStartX = 80;
        const backpackStartY = 140;
        const cellSize = 65;
        const padding = 8;

        for (let i = 0; i < 12; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const x = backpackStartX + col * (cellSize + padding);
            const y = backpackStartY - row * (cellSize + padding);

            const node = this._createBackpackCell(i, x, y);
            this._backpackNodes.push(node);
        }

        // === 套装信息 ===
        const setInfoNode = new Node('setInfo');
        setInfoNode.setPosition(-140, -220, 0);
        this._panel.addChild(setInfoNode);
        this._setInfoLabel = setInfoNode.addComponent(Label);
        this._setInfoLabel.fontSize = 14;
        this._setInfoLabel.color = new Color(200, 200, 200);

        // === 统计 ===
        const statsNode = new Node('stats');
        statsNode.setPosition(80, -220, 0);
        this._panel.addChild(statsNode);
        this._statsLabel = statsNode.addComponent(Label);
        this._statsLabel.fontSize = 12;
        this._statsLabel.color = Color.GRAY;
    }

    /** 创建单个槽位节点 */
    private _createSlotNode(slot: EquipmentSlot, pos: Vec3): Node {
        const node = new Node(`slot_${slot}`);
        node.setPosition(pos);
        this._panel!.addChild(node);

        const transform = node.addComponent(UITransform);
        transform.setContentSize(90, 50);

        // 背景框
        const bg = new Node('bg');
        bg.addComponent(UITransform).setContentSize(90, 50);
        const bgSprite = bg.addComponent(Sprite);
        bgSprite.color = new Color(50, 50, 50, 200);
        node.addChild(bg);

        // 装备名 Label
        const nameNode = new Node('name');
        nameNode.setPosition(0, 0, 0);
        node.addChild(nameNode);
        const label = nameNode.addComponent(Label);
        label.fontSize = 12;
        label.color = Color.WHITE;
        (node as any)._label = label;

        // 槽位名 (小字)
        const slotNameNode = new Node('slotName');
        slotNameNode.setPosition(0, -16, 0);
        node.addChild(slotNameNode);
        const slotLabel = slotNameNode.addComponent(Label);
        slotLabel.string = slotLabel(slot);
        slotLabel.fontSize = 10;
        slotLabel.color = Color.GRAY;

        // 点击事件
        node.on(Node.EventType.TOUCH_END, () => {
            this._onSlotClick(slot);
        });

        return node;
    }

    /** 创建背包格子 */
    private _createBackpackCell(index: number, x: number, y: number): Node {
        const node = new Node(`bp_${index}`);
        node.setPosition(x, y);
        this._panel!.addChild(node);

        const transform = node.addComponent(UITransform);
        transform.setContentSize(65, 55);

        const bg = new Node('bg');
        bg.addComponent(UITransform).setContentSize(65, 55);
        const bgSprite = bg.addComponent(Sprite);
        bgSprite.color = new Color(40, 40, 40, 180);
        node.addChild(bg);

        const nameNode = new Node('name');
        nameNode.setPosition(0, 0, 0);
        node.addChild(nameNode);
        const label = nameNode.addComponent(Label);
        label.fontSize = 10;
        label.color = Color.WHITE;
        (node as any)._label = label;
        (node as any)._index = index;

        node.on(Node.EventType.TOUCH_END, () => {
            this._onBackpackClick(index);
        });

        return node;
    }

    // ======== 交互 ========

    private _onSlotClick(slot: EquipmentSlot): void {
        if (!this._equipSystem) return;
        const item = this._equipSystem.getEquipped(slot);
        if (item) {
            this._equipSystem.unequip(slot);
        }
        this._refreshAll();
    }

    private _onBackpackClick(index: number): void {
        if (!this._equipSystem) return;
        const bp = this._equipSystem.getBackpack();
        const item = bp[index];
        if (!item) return;

        // 直接装备到对应槽位
        const old = this._equipSystem.equip(item);
        if (old !== null) {
            // item 已移到装备槽位, 背包该位置置空
            // (equip 方法会自动找到槽位)
            this._equipSystem.discardFromBackpack(index);
        }
        // 如果装备失败 (背包满 + 被替换), 被替换的回到了背包
        this._refreshAll();
    }

    // ======== 刷新 ========

    private _onEquipChanged(): void {
        if (this._isOpen) this._refreshAll();
    }

    private _refreshAll(): void {
        if (!this._equipSystem) return;
        this._refreshSlots();
        this._refreshBackpack();
        this._refreshSetInfo();
        this._refreshStats();
    }

    private _refreshSlots(): void {
        if (!this._equipSystem) return;
        for (const slot of EQUIPMENT_SLOTS) {
            const node = this._slotNodes.get(slot);
            const label = (node as any)?._label as Label | undefined;
            if (!node || !label) continue;

            const item = this._equipSystem.getEquipped(slot);
            if (item) {
                label.string = item.name.length > 6 ? item.name.slice(0, 6) + '..' : item.name;
                label.color = RARITY_COLORS[item.rarity] ?? Color.WHITE;
            } else {
                label.string = `[${slotLabel(slot)}]`;
                label.color = Color.GRAY;
            }
        }
    }

    private _refreshBackpack(): void {
        if (!this._equipSystem) return;
        const bp = this._equipSystem.getBackpack();
        for (let i = 0; i < this._backpackNodes.length && i < bp.length; i++) {
            const node = this._backpackNodes[i];
            const label = (node as any)?._label as Label | undefined;
            if (!label) continue;

            const item = bp[i];
            if (item) {
                label.string = item.name.length > 6 ? item.name.slice(0, 6) + '..' : item.name;
                label.color = RARITY_COLORS[item.rarity] ?? Color.WHITE;
            } else {
                label.string = '';
            }
        }
    }

    private _refreshSetInfo(): void {
        if (!this._setInfoLabel || !this._equipSystem) return;
        const sets = this._equipSystem.getActiveSetBonuses();
        if (sets.length > 0) {
            this._setInfoLabel.string = '套装:\n' + sets.map(s => `${s.name} (${s.count})`).join('\n');
        } else {
            this._setInfoLabel.string = '';
        }
    }

    private _refreshStats(): void {
        if (!this._statsLabel || !this._equipSystem) return;
        const counts = this._equipSystem.getRarityCounts();
        const power = this._equipSystem.getTotalPowerLevel();
        this._statsLabel.string = `战力: ${power}  背包: ${this._equipSystem.freeBackpackSlots}/12`;
    }
}
