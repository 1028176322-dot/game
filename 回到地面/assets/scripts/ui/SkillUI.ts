/**
 * SkillUI - 技能按钮 UI
 * 展示 4 个技能槽位（左/右主动 + 左/右遗物）
 * 遗物槽位默认隐藏，获得遗物时显示
 * UI 层只负责展示和转发点击，不直接修改核心数据
 */

import { _decorator, Component, Node, Button, Label, Sprite, color, Color } from 'cc';
import { SkillSlot, SkillData, SkillSystem } from '../battle/SkillSystem';
import { eventBus } from '../core/EventBus';

const { ccclass, property } = _decorator;

@ccclass('SkillUI')
export class SkillUI extends Component {
    @property(Node)
    activeLeftBtn: Node | null = null;
    @property(Node)
    activeRightBtn: Node | null = null;
    @property(Node)
    relicLeftBtn: Node | null = null;
    @property(Node)
    relicRightBtn: Node | null = null;

    @property(Label)
    activeLeftCDLabel: Label | null = null;
    @property(Label)
    activeRightCDLabel: Label | null = null;
    @property(Label)
    relicLeftCDLabel: Label | null = null;
    @property(Label)
    relicRightCDLabel: Label | null = null;

    private _skillSystem: SkillSystem | null = null;
    private _buttonMap: Map<SkillSlot, Node | null> = new Map();
    private _cdLabelMap: Map<SkillSlot, Label | null> = new Map();
    private _defaultHidden: Set<SkillSlot> = new Set();

    onLoad(): void {
        this._buttonMap.set(SkillSlot.ActiveLeft, this.activeLeftBtn);
        this._buttonMap.set(SkillSlot.ActiveRight, this.activeRightBtn);
        this._buttonMap.set(SkillSlot.RelicLeft, this.relicLeftBtn);
        this._buttonMap.set(SkillSlot.RelicRight, this.relicRightBtn);

        this._cdLabelMap.set(SkillSlot.ActiveLeft, this.activeLeftCDLabel);
        this._cdLabelMap.set(SkillSlot.ActiveRight, this.activeRightCDLabel);
        this._cdLabelMap.set(SkillSlot.RelicLeft, this.relicLeftCDLabel);
        this._cdLabelMap.set(SkillSlot.RelicRight, this.relicRightCDLabel);

        // 遗物槽位默认隐藏
        this._defaultHidden.add(SkillSlot.RelicLeft);
        this._defaultHidden.add(SkillSlot.RelicRight);
        this._setButtonVisible(SkillSlot.RelicLeft, false);
        this._setButtonVisible(SkillSlot.RelicRight, false);

        // 注册事件
        eventBus.on('skill:equipped', this._onSkillEquipped, this);
        eventBus.on('skill:removed', this._onSkillRemoved, this);
        eventBus.on('skill:cooldown_start', this._onCooldownStart, this);
    }

    onDestroy(): void {
        eventBus.offTarget(this);
    }

    /** 绑定技能系统 */
    bindSkillSystem(system: SkillSystem): void {
        this._skillSystem = system;
    }

    /** 点击技能按钮（从编辑器 Button.onClick 绑定） */
    onSkillButtonClick(slotName: string): void {
        const slot = slotName as SkillSlot;
        if (this._skillSystem) {
            this._skillSystem.castSkill(slot);
        }
    }

    private _onSkillEquipped(slot: SkillSlot, data: SkillData): void {
        this._setButtonVisible(slot, true);
        this._updateSkillUI(slot, data);
    }

    private _onSkillRemoved(slot: SkillSlot): void {
        if (this._defaultHidden.has(slot)) {
            this._setButtonVisible(slot, false);
        }
        this._updateCDLabel(slot, 0);
    }

    private _onCooldownStart(slot: SkillSlot, cd: number): void {
        this._updateCDLabel(slot, cd);
    }

    private _setButtonVisible(slot: SkillSlot, visible: boolean): void {
        const btn = this._buttonMap.get(slot);
        if (btn) btn.active = visible;
    }

    private _updateSkillUI(slot: SkillSlot, data: SkillData): void {
        const btn = this._buttonMap.get(slot);
        if (!btn) return;

        const label = btn.getComponentInChildren(Label);
        if (label) label.string = data.name;

        // 如果是遗物技能，设置金色背景
        if (data.isRelic) {
            const sprite = btn.getComponent(Sprite);
            if (sprite) {
                sprite.color = new Color(255, 215, 0); // 金色
            }
        }
    }

    private _updateCDLabel(slot: SkillSlot, cd: number): void {
        const label = this._cdLabelMap.get(slot);
        if (label) {
            label.string = cd > 0 ? cd.toFixed(1) : '';
        }
    }
}
