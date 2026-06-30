/**
 * EquipmentView - 装备界面渲染层
 *
 * 职责:
 * 1. 根据 EquipmentVM 驱动节点显示
 * 2. 负责布局（硬编码坐标作为 fallback）
 * 3. 不包含任何业务逻辑
 *
 * Phase 8: UI Prefab + ViewModel 化
 * 当有 Prefab 时可替换为 prefab 节点绑定
 */

import { _decorator, Component, Node, Label, Sprite, Color, UITransform, Vec3 } from 'cc';
import { EquipmentSlot, EQUIPMENT_SLOTS, SLOT_NAMES } from '../../battle/EquipmentSystem';
import { EquipmentVM, EquippedSlotVM, BackpackSlotVM } from '../viewmodel/EquipmentViewModel';
import { T } from '../../core/TextManager';

const { ccclass, property } = _decorator;

const RARITY_COLORS: Record<string, Color> = {
    common: new Color(204, 204, 204),
    uncommon: new Color(74, 144, 217),
    rare: new Color(255, 165, 0),
    epic: new Color(255, 69, 0),
};

@ccclass('EquipmentView')
export class EquipmentView extends Component {
    /** 当有 Prefab 后，此处可绑定 Prefab 节点引用 */
    @property(Node) slotContainer: Node | null = null;
    @property(Node) backpackContainer: Node | null = null;
    @property(Node) setInfoContainer: Node | null = null;
    @property(Node) statsContainer: Node | null = null;

    private _slotNodes: Map<EquipmentSlot, { root: Node; label: Label }> = new Map();
    private _backpackNodes: Array<{ root: Node; label: Label }> = [];
    private _setInfoLabel: Label | null = null;
    private _statsLabel: Label | null = null;

    private _onSlotClick: ((slot: EquipmentSlot) => void) | null = null;
    private _onBackpackClick: ((index: number) => void) | null = null;

    /** 绑定交互回调 */
    bindCallbacks(slotClick: (slot: EquipmentSlot) => void, backpackClick: (index: number) => void): void {
        this._onSlotClick = slotClick;
        this._onBackpackClick = backpackClick;
    }

    /** 构建 UI（无 Prefab 时的 fallback 代码生成） */
    buildFallbackLayout(): void {
        if (this.slotContainer) return; // 已有 Prefab 绑定，跳过

        // 面板
        const panel = new Node('equipPanel');
        panel.addComponent(UITransform).setContentSize(500, 420);
        this.node.addChild(panel);

        // 标题
        const titleN = new Node('title');
        titleN.setPosition(0, 190);
        panel.addChild(titleN);
        const titleL = titleN.addComponent(Label);
        titleL.string = T('ui.equipment'); titleL.fontSize = 24; titleL.color = Color.WHITE;

        // 8 个槽位
        const slotPositions: Record<EquipmentSlot, Vec3> = {
            [EquipmentSlot.Head]: v3(-140, 130), [EquipmentSlot.Chest]: v3(-140, 70),
            [EquipmentSlot.Weapon]: v3(-200, 10), [EquipmentSlot.Offhand]: v3(-80, 10),
            [EquipmentSlot.Ring1]: v3(-200, -50), [EquipmentSlot.Ring2]: v3(-80, -50),
            [EquipmentSlot.Boots]: v3(-140, -110), [EquipmentSlot.Amulet]: v3(-140, -170),
        };
        for (const slot of EQUIPMENT_SLOTS) {
            const node = this._buildSlotNode(slot, slotPositions[slot]);
            panel.addChild(node.root);
            this._slotNodes.set(slot, node);
        }

        // 12 格背包
        const bpStartX = 80, bpStartY = 140, cell = 65, pad = 8;
        for (let i = 0; i < 12; i++) {
            const col = i % 3, row = Math.floor(i / 3);
            const x = bpStartX + col * (cell + pad), y = bpStartY - row * (cell + pad);
            const node = this._buildBackpackCell(i, x, y);
            panel.addChild(node.root);
            this._backpackNodes.push(node);
        }

        // 套装信息
        const siN = new Node('setInfo');
        siN.setPosition(-140, -220); panel.addChild(siN);
        this._setInfoLabel = siN.addComponent(Label);
        this._setInfoLabel.fontSize = 14; this._setInfoLabel.color = new Color(200, 200, 200);

        // 统计
        const stN = new Node('stats');
        stN.setPosition(80, -220); panel.addChild(stN);
        this._statsLabel = stN.addComponent(Label);
        this._statsLabel.fontSize = 12; this._statsLabel.color = Color.GRAY;
    }

    /** 渲染整个界面 */
    render(vm: EquipmentVM): void {
        this.renderSlots(vm.slots);
        this.renderBackpack(vm.backpack);
        this.renderSetInfo(vm.setInfo);
        this.renderStats(vm.statsText);
    }

    renderSlots(slots: EquippedSlotVM[]): void {
        for (const s of slots) {
            const node = this._slotNodes.get(s.slot);
            if (!node) continue;
            if (s.item) {
                node.label.string = s.item.name.length > 6 ? s.item.name.slice(0, 6) + '..' : s.item.name;
                node.label.color = RARITY_COLORS[s.item.rarity] ?? Color.WHITE;
            } else {
                node.label.string = `[${s.slotLabel}]`;
                node.label.color = Color.GRAY;
            }
        }
    }

    renderBackpack(backpack: BackpackSlotVM[]): void {
        for (let i = 0; i < this._backpackNodes.length && i < backpack.length; i++) {
            const node = this._backpackNodes[i];
            const item = backpack[i].item;
            node.label.string = item ? (item.name.length > 6 ? item.name.slice(0, 6) + '..' : item.name) : '';
            node.label.color = item ? (RARITY_COLORS[item.rarity] ?? Color.WHITE) : Color.WHITE;
        }
    }

    renderSetInfo(sets: string[]): void {
        if (this._setInfoLabel) {
            this._setInfoLabel.string = sets.length > 0 ? '套装:\n' + sets.join('\n') : '';
        }
    }

    renderStats(text: string): void {
        if (this._statsLabel) this._statsLabel.string = text;
    }

    private _buildSlotNode(slot: EquipmentSlot, pos: Vec3): { root: Node; label: Label } {
        const root = new Node(`slot_${slot}`);
        root.setPosition(pos);
        const t = root.addComponent(UITransform); t.setContentSize(90, 50);
        const bg = new Node('bg'); bg.addComponent(UITransform).setContentSize(90, 50);
        bg.addComponent(Sprite).color = new Color(50, 50, 50, 200);
        root.addChild(bg);
        const nameN = new Node('name'); root.addChild(nameN);
        const label = nameN.addComponent(Label); label.fontSize = 12; label.color = Color.WHITE;
        const slotN = new Node('slotName'); slotN.setPosition(0, -16); root.addChild(slotN);
        const sLabel = slotN.addComponent(Label); sLabel.string = SLOT_NAMES[slot] ?? slot;
        sLabel.fontSize = 10; sLabel.color = Color.GRAY;
        root.on(Node.EventType.TOUCH_END, () => this._onSlotClick?.(slot));
        return { root, label };
    }

    private _buildBackpackCell(index: number, x: number, y: number): { root: Node; label: Label } {
        const root = new Node(`bp_${index}`);
        root.setPosition(x, y);
        const t = root.addComponent(UITransform); t.setContentSize(65, 55);
        const bg = new Node('bg'); bg.addComponent(UITransform).setContentSize(65, 55);
        bg.addComponent(Sprite).color = new Color(40, 40, 40, 180);
        root.addChild(bg);
        const nameN = new Node('name'); root.addChild(nameN);
        const label = nameN.addComponent(Label); label.fontSize = 10; label.color = Color.WHITE;
        root.on(Node.EventType.TOUCH_END, () => this._onBackpackClick?.(index));
        return { root, label };
    }
}

function v3(x: number, y: number, z = 0): Vec3 { return new Vec3(x, y, z); }
