/**
 * CharacterPanel - Character selection and management panel
 *
 * UIPanel implementation. Shows all unlocked/locked character slots.
 * Allows switching active character, unlocking new ones, and creating new characters.
 */

import { _decorator, Component, Node, Label, Button, Sprite, Color, Vec3 } from 'cc';
import { UiRouter, UiPanelId, UIPanel } from '../UiRouter';
import { PlayerDataManager } from '../../core/PlayerDataManager';
import { T } from '../../core/TextManager';

const { ccclass, property } = _decorator;

interface CharSlot {
    id: string;
    classKey: string;
    unlockCost: number;
}

const CHAR_SLOTS: CharSlot[] = [
    { id: 'warrior',   classKey: 'class.bearWarrior',   unlockCost: 500 },
    { id: 'archer',    classKey: 'class.deerArcher',    unlockCost: 500 },
    { id: 'assassin',  classKey: 'class.foxAssassin',   unlockCost: 800 },
    { id: 'mage',      classKey: 'class.rabbitMage',    unlockCost: 1000 },
    { id: 'berserker', classKey: 'class.boarBerserker', unlockCost: 1200 },
];

@ccclass('CharacterPanel')
export class CharacterPanel extends Component implements UIPanel {
    id: UiPanelId = 'character';

    @property(Node)
    panelRoot: Node | null = null;

    @property(Label)
    titleLabel: Label | null = null;

    @property(Label)
    soulStoneLabel: Label | null = null;

    @property(Label)
    currentName: Label | null = null;

    @property(Label)
    currentInfo: Label | null = null;

    @property(Label)
    currentStats: Label | null = null;

    @property(Node)
    slotContainer: Node | null = null;

    @property(Button)
    closeBtn: Button | null = null;

    // ── UIPanel ──

    open(_params?: unknown): void {
        if (this.panelRoot) this.panelRoot.active = true;
        this._refresh();
    }

    close(): void {
        if (this.panelRoot) this.panelRoot.active = false;
    }

    refresh(): void {
        this._refresh();
    }

    // ── Lifecycle ──

    onLoad(): void {
        if (this.closeBtn) {
            this.closeBtn.node.on(Button.EventType.CLICK, () => this.close(), this);
        }
    }

    // ── Render ──

    private _refresh(): void {
        const pdm = PlayerDataManager.getInstance();

        // Soul stones
        if (this.soulStoneLabel) {
            this.soulStoneLabel.string = T('ui.charSoulStones', { count: pdm.getSoulStones() });
        }

        // Current character card
        const selectedId = pdm.getSelectedCharacterId();
        const slot = CHAR_SLOTS.find(s => s.id === selectedId);
        const className = slot ? T(slot.classKey) : T('ui.unknown');

        if (this.currentName) {
            this.currentName.string = className;
        }
        if (this.currentInfo) {
            this.currentInfo.string = T('ui.charInfo', {
                name: pdm.getCharacterName() || T('ui.defaultName'),
                floor: pdm.getBestFloor(),
            });
        }
        if (this.currentStats) {
            this.currentStats.string = T('ui.charStats', { count: pdm.getTotalRuns() });
        }

        // Other character slots
        this._buildSlots(pdm, selectedId);
    }

    private _buildSlots(pdm: PlayerDataManager, selectedId: string): void {
        if (!this.slotContainer) return;
        this.slotContainer.removeAllChildren();

        const unlocked = pdm.getUnlockedCharacterIds();

        CHAR_SLOTS.forEach(slot => {
            if (slot.id === selectedId) return; // skip current

            const isUnlocked = unlocked.includes(slot.id);
            const isDefault = slot.id === 'warrior';
            const canAfford = pdm.getSoulStones() >= slot.unlockCost;
            const className = T(slot.classKey);

            const row = new Node(slot.id);
            row.setPosition(0, 0);

            if (isUnlocked) {
                this._addRowLabel(row, T('ui.charUnlocked', { class: className }), -150, 0);
                this._addRowButton(row, T('ui.charSelect'), 160, 0, () => {
                    pdm.selectCharacter(slot.id);
                    this._refresh();
                });
            } else if (isDefault) {
                this._addRowLabel(row, T('ui.charDefault', { class: className }), -150, 0);
                this._addRowButton(row, T('ui.charSelect'), 160, 0, () => {
                    pdm.selectCharacter(slot.id);
                    this._refresh();
                });
            } else {
                this._addRowLabel(row, T('ui.charLocked', { class: className, cost: slot.unlockCost }), -150, 0);
                this._addRowButton(row, T('ui.charUnlock'), 160, 0, () => {
                    if (canAfford) {
                        pdm.unlockCharacter(slot.id);
                        this._refresh();
                    }
                }, !canAfford);
            }

            this.slotContainer!.addChild(row);
        });
    }

    private _addRowLabel(parent: Node, text: string, x: number, y: number): void {
        const label = parent.addComponent(Label);
        label.string = text;
        label.fontSize = 14;
        label.color = new Color(0x33, 0x33, 0x33, 0xFF);
        label.position = new Vec3(x, y, 0);
    }

    private _addRowButton(parent: Node, text: string, x: number, y: number, cb: () => void, disabled = false): void {
        const btn = new Node('btn_' + text);
        btn.setPosition(x, y);

        if (!disabled) {
            btn.on(Node.EventType.TOUCH_END, cb);
        }

        const label = btn.addComponent(Label);
        label.string = text;
        label.fontSize = 13;
        label.color = disabled ? new Color(0xCC, 0xCC, 0xCC, 0xFF) : new Color(0x4A, 0x9E, 0xFF, 0xFF);

        parent.addChild(btn);
    }
}
