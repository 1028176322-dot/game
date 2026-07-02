/**
 * CreatePanel - First-time character creation panel
 *
 * UIPanel implementation. Opened by AppFlowController when PROFILE_CHECK detects first-time player.
 * Player chooses a name and selects a character class.
 */

import { _decorator, Component, Node, Label, Button, EditBox, Sprite, Color, Vec3, UITransform } from 'cc';
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

    @property(Node)
    panelRoot: Node | null = null;

    @property(Label)
    titleLabel: Label | null = null;

    @property(EditBox)
    nameInput: EditBox | null = null;

    @property(Node)
    cardRoot: Node | null = null;

    @property(Label)
    selectedInfo: Label | null = null;

    @property(Label)
    selectedDesc: Label | null = null;

    @property(Button)
    confirmBtn: Button | null = null;

    @property(Label)
    errorLabel: Label | null = null;

    @property(Label)
    skipBtn: Label | null = null;

    private _selectedId = 'warrior';
    private _cards: Node[] = [];

    // ── UIPanel ──

    open(_params?: unknown): void {
        if (this.panelRoot) this.panelRoot.active = true;
        this._buildCards();
        this._selectCharacter('warrior');
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

    // ── Cards ──

    private _buildCards(): void {
        if (!this.cardRoot) return;
        this.cardRoot.removeAllChildren();
        this._cards = [];

        CHAR_OPTIONS.forEach((opt, i) => {
            const card = new Node(opt.id);
            card.setPosition((i - 2) * 110, 0);
            const uiTransform = card.addComponent(UITransform);
            uiTransform.setContentSize(96, 112);

            const bg = card.addComponent(Sprite);
            bg.color = new Color(0xF0, 0xF0, 0xF0, 0xFF);

            const animalNode = new Node('Animal');
            animalNode.setPosition(0, 20);
            const animalLbl = animalNode.addComponent(Label);
            animalLbl.string = T(opt.animalKey);
            animalLbl.fontSize = 16;
            animalLbl.color = new Color(0x33, 0x33, 0x33, 0xFF);
            card.addChild(animalNode);

            const classNode = new Node('Class');
            classNode.setPosition(0, -5);
            const classLbl = classNode.addComponent(Label);
            classLbl.string = T(opt.classKey);
            classLbl.fontSize = 13;
            classLbl.color = new Color(0x88, 0x88, 0x88, 0xFF);
            classLbl.position = new Vec3(0, -5, 0);

            card.on(Node.EventType.TOUCH_END, () => this._selectCharacter(opt.id));

            this.cardRoot.addChild(card);
            this._cards.push(card);
        });
    }

    private _selectCharacter(id: string): void {
        if (id !== 'warrior') {
            this._showError(T('ui.createOnlyWarrior'));
            return;
        }

        this._selectedId = id;
        const opt = CHAR_OPTIONS.find(c => c.id === id)!;

        if (this.selectedInfo) {
            this.selectedInfo.string = `${T(opt.animalKey)} ${T(opt.classKey)}`;
        }
        if (this.selectedDesc) {
            this.selectedDesc.string = T(opt.descKey);
        }

        this._cards.forEach((card, i) => {
            const bg = card.getComponent(Sprite);
            if (bg) {
                bg.color = CHAR_OPTIONS[i].id === id
                    ? new Color(0x4A, 0x9E, 0xFF, 0xFF)
                    : new Color(0xF0, 0xF0, 0xF0, 0xFF);
            }
        });

        this._clearError();
    }

    // ── Confirm ──

    private _onConfirm(): void {
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
        pdm.createCharacter('Adventurer', 'warrior');
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
