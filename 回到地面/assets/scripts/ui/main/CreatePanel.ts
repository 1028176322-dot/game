/**
 * CreatePanel - First-time character creation panel
 *
 * Two-phase flow:
 *   1. SELECT: player picks a character class from simple buttons
 *      - title / model display / class buttons / class description / confirm+skip
 *   2. NAMING: player enters a name, then confirms to create character
 *      - title / name input / confirm
 *
 * Skip button always creates a default-named character immediately.
 */

import { _decorator, Component, Node, Label, Button, EditBox, Sprite, Color, UITransform } from 'cc';
import { UiRouter, UiPanelId, UIPanel } from '../UiRouter';
import { AppFlowController, AppFlowState } from '../../app/AppFlowController';
import { PlayerDataManager } from '../../core/PlayerDataManager';
import { T } from '../../core/TextManager';

const { ccclass, property } = _decorator;

interface CharOption {
    id: string;
    animalKey: string;
    classKey: string;
    descKey: string;
}

const CHAR_OPTIONS: CharOption[] = [
    { id: 'warrior',   animalKey: 'classAnimal.bear',   classKey: 'class.bearWarrior',   descKey: 'classDesc.bearWarrior' },
    { id: 'archer',    animalKey: 'classAnimal.deer',   classKey: 'class.deerArcher',    descKey: 'classDesc.deerArcher' },
    { id: 'assassin',  animalKey: 'classAnimal.fox',    classKey: 'class.foxAssassin',   descKey: 'classDesc.foxAssassin' },
    { id: 'mage',      animalKey: 'classAnimal.rabbit', classKey: 'class.rabbitMage',    descKey: 'classDesc.rabbitMage' },
    { id: 'berserker', animalKey: 'classAnimal.boar',   classKey: 'class.boarBerserker', descKey: 'classDesc.boarBerserker' },
];

@ccclass('CreatePanel')
export class CreatePanel extends Component implements UIPanel {
    id: UiPanelId = 'create_character';

    @property(Node) panelRoot: Node | null = null;
    @property(Label) titleLabel: Label | null = null;
    @property(Node) modelDisplay: Node | null = null;
    @property(Node) cardRoot: Node | null = null;
    @property(Label) selectedInfo: Label | null = null;
    @property(Label) selectedDesc: Label | null = null;
    @property(Button) confirmBtn: Button | null = null;
    @property(Label) errorLabel: Label | null = null;
    @property(Label) skipBtn: Label | null = null;
    @property(EditBox) nameInput: EditBox | null = null;

    private _selectedId = 'warrior';
    private _classButtons: Node[] = [];
    private _isNaming = false;

    // ── UIPanel ──

    open(_params?: unknown): void {
        if (this.panelRoot) this.panelRoot.active = true;
        this._isNaming = false;
        this._clearError();
        this._applyPhase();
        this._buildClassButtons();
        this._selectCharacter('warrior');
        this.scheduleOnce(() => this._reLayout(), 0);
    }

    close(): void {
        if (this.panelRoot) this.panelRoot.active = false;
    }

    // ── Lifecycle ──

    onLoad(): void {
        if (this.confirmBtn) {
            this.confirmBtn.node.on(Button.EventType.CLICK, this._onConfirm, this);
        }
        if (this.skipBtn) {
            this.skipBtn.node.on(Node.EventType.TOUCH_END, this._onSkip, this);
        }
        if (this.nameInput) {
            this.nameInput.node.on('editing-did-ended', this._onNameEdited, this);
        }
    }

    // ── Phase Management ──

    private _applyPhase(): void {
        const selectPhase = !this._isNaming;
        if (this.modelDisplay) this.modelDisplay.active = selectPhase;
        if (this.cardRoot) this.cardRoot.active = selectPhase;
        if (this.selectedInfo) this.selectedInfo.node.active = selectPhase;
        if (this.selectedDesc) this.selectedDesc.node.active = selectPhase;
        if (this.skipBtn) this.skipBtn.node.active = selectPhase;
        if (this.nameInput) this.nameInput.node.active = this._isNaming;
        if (this.titleLabel) {
            this.titleLabel.string = this._isNaming ? T('ui.createNamePrompt') : T('ui.createTitle');
        }
        if (this.confirmBtn) {
            const btnLabel = this.confirmBtn.getComponentInChildren(Label);
            if (btnLabel) {
                btnLabel.string = this._isNaming ? T('ui.createConfirmName') : T('ui.createConfirm');
            }
        }
    }

    // ── Class Buttons ──

    private _buildClassButtons(): void {
        if (!this.cardRoot) return;
        this.cardRoot.removeAllChildren();
        this._classButtons = [];

        const rootWidth = this.cardRoot.getComponent(UITransform)?.width ?? 600;
        const gap = Math.min(110, rootWidth / CHAR_OPTIONS.length);
        const btnW = 80;
        const btnH = 40;

        CHAR_OPTIONS.forEach((opt, i) => {
            const btn = new Node(opt.id);
            btn.setPosition((i - (CHAR_OPTIONS.length - 1) / 2) * gap, 0);
            const uiTrans = btn.addComponent(UITransform);
            uiTrans.setContentSize(btnW, btnH);

            const bg = btn.addComponent(Sprite);
            bg.color = new Color(0x4A, 0x9E, 0xFF, 0xFF);

            const labelNode = new Node('Label');
            const label = labelNode.addComponent(Label);
            label.string = T(opt.animalKey);
            label.fontSize = 16;
            label.color = Color.WHITE;
            btn.addChild(labelNode);

            btn.on(Node.EventType.TOUCH_END, () => this._selectCharacter(opt.id));

            this.cardRoot.addChild(btn);
            this._classButtons.push(btn);
        });
    }

    /** Re-trigger layout after dynamic content is built */
    private _reLayout(): void {
        let node: Node | null = this.panelRoot;
        if (!node) return;
        node = node.getChildByName('PanelFrame');
        if (!node) return;
        node = node.getChildByName('ContentRoot');
        if (!node) return;
        for (const comp of node.components) {
            if (typeof (comp as any).applyLayout === 'function') {
                (comp as any).applyLayout();
            }
        }
    }

    private _selectCharacter(id: string): void {
        if (id !== 'warrior') {
            this._showError(T('ui.createOnlyWarrior'));
            return;
        }

        this._selectedId = id;
        const opt = CHAR_OPTIONS.find(c => c.id === id)!;

        // Update model display placeholder (replace with real model later)
        if (this.modelDisplay) {
            // Remove old placeholder
            const oldChild = this.modelDisplay.getChildByName('ModelPlaceholder');
            if (oldChild) oldChild.destroy();

            // Create placeholder label showing class info
            const phNode = new Node('ModelPlaceholder');
            const phLabel = phNode.addComponent(Label);
            phLabel.string = `${T(opt.animalKey)}\n${T(opt.classKey)}`;
            phLabel.fontSize = 24;
            phLabel.color = Color.WHITE;
            phLabel.lineHeight = 36;
            this.modelDisplay.addChild(phNode);

            // Tint background per class
            const bg = this.modelDisplay.getComponent(Sprite);
            if (bg) {
                const tints: Record<string, Color> = {
                    warrior:   new Color(0x4A, 0x9E, 0xFF, 0x50),
                    archer:    new Color(0x5B, 0xD6, 0x6B, 0x50),
                    assassin:  new Color(0xA8, 0x5F, 0xE0, 0x50),
                    mage:      new Color(0xFF, 0x8C, 0x00, 0x50),
                    berserker: new Color(0xE0, 0x4E, 0x4E, 0x50),
                };
                bg.color = tints[id] ?? new Color(0xFF, 0xFF, 0xFF, 0x50);
            }
        }

        if (this.selectedInfo) {
            this.selectedInfo.string = `${T(opt.animalKey)} ${T(opt.classKey)}`;
        }
        if (this.selectedDesc) {
            this.selectedDesc.string = T(opt.descKey);
        }

        // Highlight selected button
        this._classButtons.forEach((btn, i) => {
            const bg = btn.getComponent(Sprite);
            if (bg) {
                bg.color = CHAR_OPTIONS[i].id === id
                    ? new Color(0x4A, 0x9E, 0xFF, 0xFF)
                    : new Color(0x80, 0x80, 0x80, 0xFF);
            }
        });

        this._clearError();
    }

    // ── Confirm ──

    private _onConfirm(): void {
        // Phase 1 → 2: enter naming
        if (!this._isNaming) {
            this._isNaming = true;
            this._clearError();
            this._applyPhase();
            if (this.nameInput) {
                this.nameInput.node.active = true;
            }
            this._reLayout();
            return;
        }

        // Phase 2: validate name and create character
        const name = this.nameInput?.string.trim() ?? '';
        if (!name) { this._showError(T('ui.createNameRequired')); return; }
        if (name.length > 6) { this._showError(T('ui.createNameTooLong')); return; }
        if (this._hasReservedWords(name)) { this._showError(T('ui.createNameBlocked')); return; }

        const pdm = PlayerDataManager.getInstance();
        pdm.createCharacter(name, this._selectedId);
        console.log('[CreatePanel] character created:', name, this._selectedId);

        this.close();
        const appFlow = AppFlowController.instance;
        if (appFlow) appFlow.goTo(AppFlowState.MAIN_HUB);
    }

    private _onSkip(): void {
        const pdm = PlayerDataManager.getInstance();
        pdm.createCharacter(T('ui.defaultName'), 'warrior');
        console.log('[CreatePanel] skipped, default character created');

        this.close();
        const appFlow = AppFlowController.instance;
        if (appFlow) appFlow.goTo(AppFlowState.MAIN_HUB);
    }

    private _onNameEdited(editBox: EditBox): void {
        if (editBox.string.length > 6) {
            editBox.string = editBox.string.slice(0, 6);
        }
    }

    private _hasReservedWords(name: string): boolean {
        const reserved = ['admin', 'test', 'root', 'fuck', 'shit'];
        return reserved.some(w => name.toLowerCase().includes(w));
    }

    private _showError(msg: string): void {
        if (this.errorLabel) { this.errorLabel.string = msg; this.errorLabel.node.active = true; }
        if (this.confirmBtn) this.confirmBtn.interactable = false;
    }

    private _clearError(): void {
        if (this.errorLabel) this.errorLabel.node.active = false;
        if (this.confirmBtn) this.confirmBtn.interactable = true;
    }
}
