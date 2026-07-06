/**
 * CreatePanel - First-time character creation panel
 *
 * Two-phase flow:
 *   1. SELECT: player picks a character class from visual cards
 *      - title / model display (character idle animation) / class cards / class description / confirm+skip
 *   2. NAMING: player enters a name, then confirms to create character
 *      - title / name input / confirm
 *
 * Card structure:
 *   CardRoot
 *   ├── CharacterCard_{id}
 *   │   ├── CardBg    (ui.panel.frame style bg, tinted per class)
 *   │   ├── Preview   (character.warrior.idle via CharacterVisualService)
 *   │   ├── NameLabel (animal name from text.json)
 *   │   └── SelectedMark (blue highlight border when selected)
 *
 * Skin keys used: character.card.{id}, character.preview.{id} (via game_assets)
 */

import { _decorator, Component, Node, Label, Button, EditBox, Sprite, Color, UITransform } from 'cc';
import { UiRouter, UiPanelId, UIPanel } from '../UiRouter';
import { AppFlowController, AppFlowState } from '../../app/AppFlowController';
import { PlayerDataManager } from '../../core/PlayerDataManager';
import { T } from '../../core/TextManager';
import { UISkinService } from '../UISkinService';
import { CharacterVisualService } from '../../render/CharacterVisualService';

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

/** Per-class card tint for bg */
const CARD_TINTS: Record<string, Color> = {
    warrior:   new Color(0x4A, 0x9E, 0xFF, 0x30),
    archer:    new Color(0x5B, 0xD6, 0x6B, 0x30),
    assassin:  new Color(0xA8, 0x5F, 0xE0, 0x30),
    mage:      new Color(0xFF, 0x8C, 0x00, 0x30),
    berserker: new Color(0xE0, 0x4E, 0x4E, 0x30),
};

const SELECTED_TINT = new Color(0x4A, 0x9E, 0xFF, 0xFF);
const UNSELECTED_TINT = new Color(0x80, 0x80, 0x80, 0xFF);

const CARD_WIDTH = 100;
const CARD_HEIGHT = 150;
const CARD_GAP = 14;

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
    private _classCards: Node[] = [];
    private _isNaming = false;

    // ── UIPanel ──

    open(_params?: unknown): void {
        if (this.panelRoot) this.panelRoot.active = true;
        this._isNaming = false;
        this._clearError();
        this._applyPhase();
        this._buildCards();
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

    // ── Character Cards ──

    /**
     * Build visual character cards with bg, preview sprite, name, and selection highlight.
     *
     * Structure per card:
     *   CharacterCard_{id} (CARD_WIDTH x CARD_HEIGHT)
     *   ├── CardBg (Sprite, tinted per class, ui.panel.frame skin)
     *   ├── Preview (Sprite, character idle via CharacterVisualService)
     *   └── NameLabel (16px Label, centered below preview)
     */
    private _buildCards(): void {
        if (!this.cardRoot) return;
        this.cardRoot.removeAllChildren();
        this._classCards = [];

        // Calculate horizontal layout
        const totalW = CHAR_OPTIONS.length * CARD_WIDTH + (CHAR_OPTIONS.length - 1) * CARD_GAP;
        const startX = -totalW / 2 + CARD_WIDTH / 2;

        for (let i = 0; i < CHAR_OPTIONS.length; i++) {
            const opt = CHAR_OPTIONS[i];
            const card = new Node(`Card_${opt.id}`);
            card.setPosition(startX + i * (CARD_WIDTH + CARD_GAP), 0);

            const cardTrans = card.addComponent(UITransform);
            cardTrans.setContentSize(CARD_WIDTH, CARD_HEIGHT);

            // Card background (tinted)
            const bg = card.addComponent(Sprite);
            bg.color = CARD_TINTS[opt.id] ?? new Color(0xFF, 0xFF, 0xFF, 0x30);

            // Try to apply card skin
            UISkinService.instance.applyOptional(card, `character.card.${opt.id}`);

            // Preview area (top portion of card)
            const previewNode = new Node('Preview');
            const previewTrans = previewNode.addComponent(UITransform);
            previewTrans.setContentSize(CARD_WIDTH - 16, CARD_HEIGHT - 50);
            previewNode.setPosition(0, 15);
            previewNode.addComponent(Sprite);
            card.addChild(previewNode);

            // Load character preview sprite
            CharacterVisualService.instance.applyStatic(previewNode, `character.${opt.id}.idle`);

            // Name label below preview
            const nameNode = new Node('Name');
            const nameLabel = nameNode.addComponent(Label);
            nameLabel.string = T(opt.animalKey);
            nameLabel.fontSize = 14;
            nameLabel.color = new Color(0x33, 0x33, 0x33, 0xFF);
            nameNode.setPosition(0, -CARD_HEIGHT / 2 + 18);
            card.addChild(nameNode);

            // Click handler
            card.on(Node.EventType.TOUCH_END, () => this._selectCharacter(opt.id));

            this.cardRoot.addChild(card);
            this._classCards.push(card);
        }
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

    // ── Character Selection ──

    private _selectCharacter(id: string): void {
        if (id !== 'warrior') {
            this._showError(T('ui.createOnlyWarrior'));
            return;
        }

        this._selectedId = id;
        const opt = CHAR_OPTIONS.find(c => c.id === id)!;

        // Update model display with character preview
        if (this.modelDisplay) {
            // Remove old placeholder
            const oldChild = this.modelDisplay.getChildByName('ModelPlaceholder');
            if (oldChild) oldChild.destroy();

            // Create preview node for character idle
            const previewNode = new Node('ModelPlaceholder');
            const previewTrans = previewNode.addComponent(UITransform);
            previewTrans.setContentSize(192, 192);
            previewNode.addComponent(Sprite);
            this.modelDisplay.addChild(previewNode);

            // Load character idle sprite via semantic key
            CharacterVisualService.instance.applyStatic(previewNode, `character.${id}.idle`);

            // Tint background per class
            const bg = this.modelDisplay.getComponent(Sprite);
            if (bg) {
                bg.color = CARD_TINTS[id] ?? new Color(0xFF, 0xFF, 0xFF, 0x50);
            }
        }

        if (this.selectedInfo) {
            this.selectedInfo.string = `${T(opt.animalKey)} ${T(opt.classKey)}`;
        }
        if (this.selectedDesc) {
            this.selectedDesc.string = T(opt.descKey);
        }

        // Highlight selected card
        this._classCards.forEach((card, i) => {
            const bg = card.getComponent(Sprite);
            if (bg) {
                bg.color = CHAR_OPTIONS[i].id === id
                    ? SELECTED_TINT
                    : UNSELECTED_TINT;
            }
        });

        this._clearError();
    }

    // ── Confirm ──

    private _onConfirm(): void {
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
