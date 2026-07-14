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
import { SceneModelPreview } from '../../render/SceneModelPreview';
import type { PreviewHandle } from '../../render/SceneModelPreview';
import { CharacterPanelLayout } from '../layout/CharacterPanelLayout';

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

    // 3D preview (T3): slot + handle + generation token to guard in-flight leaks.
    private _previewSlot: Node | null = null;
    private _previewHandle: PreviewHandle | null = null;
    private _previewGen: number = 0;

    // ── UIPanel ──

    open(_params?: unknown): void {
        if (this.panelRoot) this.panelRoot.active = true;
        void this._refresh();
    }

    close(): void {
        // Drop the 3D preview before hiding so no RT/rig leaks across open/close.
        this._previewGen++;
        this._previewHandle?.destroy();
        this._previewHandle = null;
        SceneModelPreview.instance.clearOwner('CharacterPanel');
        if (this.panelRoot) this.panelRoot.active = false;
    }

    refresh(): void {
        void this._refresh();
    }

    // ── Lifecycle ──

    onLoad(): void {
        if (this.closeBtn) {
            this.closeBtn.node.on(Button.EventType.CLICK, () => this.close(), this);
        }
    }

    // ── Render ──

    private async _refresh(): Promise<void> {
        const pdm = PlayerDataManager.getInstance();

        // Soul stones
        if (this.soulStoneLabel) {
            this.soulStoneLabel.string = T('ui.charSoulStones', { count: pdm.getSoulStones() });
        }

        // Current character card
        const selectedId = pdm.getSelectedCharacterId();
        const slotInfo = CHAR_SLOTS.find(s => s.id === selectedId);
        const className = slotInfo ? T(slotInfo.classKey) : T('ui.unknown');

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

        // 3D character preview in PreviewSlot (T3). Re-acquire every refresh so
        // switching characters swaps the model; destroy the previous handle first.
        this._previewGen++;
        this._previewHandle?.destroy();
        this._previewHandle = null;
        const slot = this._ensurePreviewSlot();
        if (!slot) return; // no slot -> safe no-op, keep text-only UI

        const gen = this._previewGen;
        const handle = await SceneModelPreview.instance.showCharacterInSlot(
            slot, selectedId, 'idle', { ownerId: 'CharacterPanel', forceUnlit: true },
        );
        // A newer refresh may have started while this await was pending; if so,
        // the resolved handle is stale and must be dropped to avoid leaks.
        if (gen !== this._previewGen) {
            handle?.destroy();
            return;
        }
        this._previewHandle = handle;
    }

    private _ensurePreviewSlot(): Node | null {
        if (this._previewSlot) return this._previewSlot;
        // Resolve ContentRoot per structure tree (PanelRoot/PanelFrame/ContentRoot);
        // fall back to panelRoot if the scene tree has no nested ContentRoot.
        const contentRoot = this.panelRoot?.getChildByPath('PanelFrame/ContentRoot')
            ?? this.panelRoot?.getChildByName('ContentRoot')
            ?? this.panelRoot;
        if (!contentRoot) {
            console.warn('[CharacterPanel] no ContentRoot; skip 3D preview');
            return null;
        }
        this._previewSlot = CharacterPanelLayout.ensurePreviewSlot(contentRoot);
        return this._previewSlot;
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
                    void this._refresh();
                });
            } else if (isDefault) {
                this._addRowLabel(row, T('ui.charDefault', { class: className }), -150, 0);
                this._addRowButton(row, T('ui.charSelect'), 160, 0, () => {
                    pdm.selectCharacter(slot.id);
                    void this._refresh();
                });
            } else {
                this._addRowLabel(row, T('ui.charLocked', { class: className, cost: slot.unlockCost }), -150, 0);
                this._addRowButton(row, T('ui.charUnlock'), 160, 0, () => {
                    if (canAfford) {
                        pdm.unlockCharacter(slot.id);
                        void this._refresh();
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
