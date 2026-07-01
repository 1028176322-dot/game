/**
 * CharacterPanel - Character selection and management panel
 *
 * UIPanel implementation. Shows all unlocked/locked character slots.
 * Allows switching active character, unlocking new ones, and creating new characters.
 */

import { _decorator, Component, Node, Label, Button, Sprite, Color, Vec3 } from 'cc';
import { UiRouter, UiPanelId, UIPanel } from '../UiRouter';
import { PlayerDataManager } from '../../core/PlayerDataManager';

const { ccclass, property } = _decorator;

interface CharSlot {
    id: string;
    label: string;
    unlockCost: number;
}

const CHAR_SLOTS: CharSlot[] = [
    { id: 'warrior',   label: 'Bear Warrior',   unlockCost: 500 },
    { id: 'archer',    label: 'Deer Archer',    unlockCost: 500 },
    { id: 'assassin',  label: 'Fox Assassin',   unlockCost: 800 },
    { id: 'mage',      label: 'Rabbit Mage',    unlockCost: 1000 },
    { id: 'berserker', label: 'Boar Berserker', unlockCost: 1200 },
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
            this.soulStoneLabel.string = `Soul Stones: ${pdm.getSoulStones()}`;
        }

        // Current character card
        const selectedId = pdm.getSelectedCharacterId();
        const slot = CHAR_SLOTS.find(s => s.id === selectedId);
        if (this.currentName) {
            this.currentName.string = slot?.label ?? 'Unknown';
        }
        if (this.currentInfo) {
            this.currentInfo.string = `${pdm.getCharacterName() || 'Adventurer'} | Best: Floor ${pdm.getBestFloor()}`;
        }
        if (this.currentStats) {
            this.currentStats.string = `Total runs: ${pdm.getTotalRuns()}`;
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

            const row = new Node(slot.id);
            row.setPosition(0, 0);

            if (isUnlocked) {
                // Already unlocked: show [Select] button
                this._addRowLabel(row, slot.label + ' (Unlocked)', -150, 0);
                this._addRowButton(row, 'Select', 160, 0, () => {
                    pdm.selectCharacter(slot.id);
                    this._refresh();
                });
            } else if (isDefault) {
                // Default character: always unlocked
                this._addRowLabel(row, slot.label + ' (Default)', -150, 0);
                this._addRowButton(row, 'Select', 160, 0, () => {
                    pdm.selectCharacter(slot.id);
                    this._refresh();
                });
            } else {
                // Locked: show price and [Unlock] button
                this._addRowLabel(row, `${slot.label} [Cost: ${slot.unlockCost}]`, -150, 0);
                this._addRowButton(row, 'Unlock', 160, 0, () => {
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
