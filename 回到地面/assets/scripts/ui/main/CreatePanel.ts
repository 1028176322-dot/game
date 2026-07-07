/**
 * CreatePanel - First-time character creation panel
 *
 * Two-phase flow:
 *   1. SELECT: player picks a character class from class buttons
 *      - title / model display (current character attack animation) / class buttons / class info / confirm+skip
 *   2. NAMING: player enters a name, then confirms to create character
 *      - title / name input / confirm
 *
 * Layout:
 *   ContentRoot [VerticalPanelLayout, CreatePanelLayout]
 *   - HeaderZone / TitleLabel
 *   - PreviewZone / ModelDisplay / CharacterPreview
 *   - ChoiceZone / CardRoot / five class buttons
 *   - InfoZone / SelectedInfo + SelectedDesc
 *   - ActionZone / ConfirmBtn + SkipBtn + ErrorLabel
 *   - NameInput, only active during naming phase
 *
 * Skin keys used: ui.main.character_button
 */

import { _decorator, Component, Node, Label, Button, EditBox, Sprite, Color, UITransform, HorizontalTextAlignment, VerticalTextAlignment } from 'cc';
import { UiRouter, UiPanelId, UIPanel } from '../UiRouter';
import { AppFlowController, AppFlowState } from '../../app/AppFlowController';
import { PlayerDataManager } from '../../core/PlayerDataManager';
import { T } from '../../core/TextManager';
import { UISkinService } from '../UISkinService';
import { CharacterVisualService } from '../../render/CharacterVisualService';
import { VerticalPanelLayout } from '../layout/VerticalPanelLayout';
import { CreatePanelLayout } from '../layout/CreatePanelLayout';
import { NodeRef } from '../../utils/NodeRef';

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

const CARD_WIDTH = 104;
const BUTTON_HEIGHT = 48;
const CARD_GAP = 12;

@ccclass('CreatePanel')
export class CreatePanel extends Component implements UIPanel {
    id: UiPanelId = 'create_character';

    @property(Node) panelRoot: Node | null = null;
    @property(Node) contentRoot: Node | null = null;
    @property(Node) titleLabel: Node | null = null;
    @property(Node) modelDisplay: Node | null = null;
    @property(Node) cardRoot: Node | null = null;
    @property(Node) selectedInfo: Node | null = null;
    @property(Node) selectedDesc: Node | null = null;
    @property(Node) confirmBtn: Node | null = null;
    @property(Node) errorLabel: Node | null = null;
    @property(Node) skipBtnRef: Node | null = null;
    @property(Node) nameInput: Node | null = null;

    private _selectedId = 'warrior';
    private _classCards: Node[] = [];
    private _isNaming = false;
    private _runtimeStructureReady = false;

    // UIPanel

    open(_params?: unknown): void {
        if (this.panelRoot) this.panelRoot.active = true;

        this._isNaming = false;
        this._clearError();
        this._applyPhase();

        // Ensure layout is applied first so ModelDisplay/CardRoot have correct sizes
        this._reLayout();
        this._buildCards();
        this._selectCharacter('warrior');

        // Next frame: re-apply layout after dynamic nodes are built, then start animation
        this.scheduleOnce(() => {
            this._reLayout();
            this._updateModelDisplay(this._selectedId);
        }, 0);
    }

    close(): void {
        if (this.panelRoot) this.panelRoot.active = false;
    }

    // Lifecycle

    onLoad(): void {
        if (this.node.name !== 'CreatePanel') {
            console.warn(`[CreatePanel] disabled unexpected duplicate component on ${this.node.name}`);
            this.enabled = false;
            return;
        }

        this._ensureRuntimeStructure();
        this._prepareIntegratedBackground();

        // Mount VerticalPanelLayout on ContentRoot. Cocos cannot serialize
        // new script class IDs in scene files, so mount at runtime here.
        this._ensureVerticalPanelLayout();
        
        const confirmButton = this._confirmButton();
        if (confirmButton) {
            confirmButton.node.on(Button.EventType.CLICK, this._onConfirm, this);
        }
        // Find skip btn by editor binding or fallback (handles stale scene bindings)
        if (!this.skipBtnRef) {
            const cr = this._getContentRoot();
            const actionZone = cr?.getChildByName('ActionZone');
            if (actionZone) {
                this.skipBtnRef = actionZone.getChildByName('SkipBtn');
            }
        }
        if (this.skipBtnRef) {
            this.skipBtnRef.on(Node.EventType.TOUCH_END, this._onSkip, this);
        }
        const editBox = this._nameEditBox();
        if (editBox) {
            editBox.node.on('editing-did-ended', this._onNameEdited, this);
        }
    }

    // Phase management

    private _applyPhase(): void {
        const selectPhase = !this._isNaming;
        if (this.modelDisplay) this.modelDisplay.active = selectPhase;
        if (this.cardRoot) this.cardRoot.active = selectPhase;
        const selectedInfoNode = this._labelNode(this.selectedInfo, 'InfoZone/SelectedInfo');
        const selectedDescNode = this._labelNode(this.selectedDesc, 'InfoZone/SelectedDesc');
        if (selectedInfoNode) selectedInfoNode.active = selectPhase;
        if (selectedDescNode) selectedDescNode.active = selectPhase;
        if (this.skipBtnRef) this.skipBtnRef.active = selectPhase;
        const nameInputNode = this._nodeFromRef(this.nameInput) ?? this._findInContent('NameInput');
        if (nameInputNode) nameInputNode.active = this._isNaming;
        const title = this._label(this.titleLabel, 'HeaderZone/TitleLabel');
        if (title) {
            title.string = this._isNaming ? T('ui.createNamePrompt') : T('ui.createTitle');
        }
        const confirmButton = this._confirmButton();
        if (confirmButton) {
            const btnLabel = confirmButton.getComponentInChildren(Label);
            if (btnLabel) {
                btnLabel.string = this._isNaming ? T('ui.createConfirmName') : T('ui.createConfirm');
            }
        }
    }

    private _ensureRuntimeStructure(): void {
        if (this._runtimeStructureReady) return;

        const contentRoot = this._getContentRoot();
        if (!contentRoot) {
            console.warn('[CreatePanel] cannot build runtime structure: ContentRoot not found');
            return;
        }

        contentRoot.removeAllChildren();

        const headerZone = this._createZone('HeaderZone', contentRoot);
        const previewZone = this._createZone('PreviewZone', contentRoot);
        const choiceZone = this._createZone('ChoiceZone', contentRoot);
        const infoZone = this._createZone('InfoZone', contentRoot);
        const actionZone = this._createZone('ActionZone', contentRoot);

        this.titleLabel = this._createLabelNode('TitleLabel', headerZone, T('ui.createTitle'), 28);

        this.modelDisplay = new Node('ModelDisplay');
        this.modelDisplay.addComponent(UITransform).setContentSize(240, 150);
        previewZone.addChild(this.modelDisplay);

        this.cardRoot = new Node('CardRoot');
        this.cardRoot.addComponent(UITransform).setContentSize(620, 52);
        choiceZone.addChild(this.cardRoot);

        this.selectedInfo = this._createLabelNode('SelectedInfo', infoZone, '', 22);
        this.selectedDesc = this._createLabelNode('SelectedDesc', infoZone, '', 20);

        this.confirmBtn = this._createButtonNode('ConfirmBtn', actionZone, T('ui.createConfirm'), 'ui.create.confirm_btn');
        this.skipBtnRef = this._createButtonNode('SkipBtn', actionZone, T('ui.skip'), 'ui.create.skip_btn');
        this.errorLabel = this._createLabelNode('ErrorLabel', actionZone, '', 18);
        this.errorLabel.active = false;

        this.nameInput = this._createNameInput(contentRoot);
        this.nameInput.active = false;

        if (!contentRoot.getComponent(CreatePanelLayout)) {
            contentRoot.addComponent(CreatePanelLayout);
        }

        this._runtimeStructureReady = true;
    }

    private _createZone(name: string, parent: Node): Node {
        const node = new Node(name);
        node.addComponent(UITransform).setContentSize(640, 60);
        parent.addChild(node);
        return node;
    }

    private _prepareIntegratedBackground(): void {
        const panelRoot = this.panelRoot;
        const frame = panelRoot?.getChildByName('PanelFrame');
        const mask = panelRoot?.getChildByName('DimMask');

        const frameSprite = frame?.getComponent(Sprite);
        if (frameSprite) {
            frameSprite.enabled = false;
        }

        const maskSprite = mask?.getComponent(Sprite);
        if (maskSprite) {
            maskSprite.enabled = false;
        }
    }

    private _createLabelNode(name: string, parent: Node, text: string, fontSize: number): Node {
        const node = new Node(name);
        node.addComponent(UITransform).setContentSize(360, fontSize + 8);
        const label = node.addComponent(Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 4;
        label.overflow = Label.Overflow.SHRINK;
        label.color = Color.WHITE;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        parent.addChild(node);
        return node;
    }

    private _createButtonNode(name: string, parent: Node, text: string, skinKey: string): Node {
        const node = new Node(name);
        node.addComponent(UITransform).setContentSize(128, 42);
        node.addComponent(Sprite);
        node.addComponent(Button);

        const labelNode = new Node('Label');
        labelNode.addComponent(UITransform).setContentSize(116, 34);
        const label = labelNode.addComponent(Label);
        label.string = text;
        label.fontSize = 22;
        label.lineHeight = 26;
        label.overflow = Label.Overflow.SHRINK;
        label.color = Color.WHITE;
        label.horizontalAlign = HorizontalTextAlignment.CENTER;
        label.verticalAlign = VerticalTextAlignment.CENTER;
        node.addChild(labelNode);

        parent.addChild(node);
        void UISkinService.instance.applyOptional(node, skinKey);
        return node;
    }

    private _createNameInput(parent: Node): Node {
        const node = new Node('NameInput');
        node.addComponent(UITransform).setContentSize(420, 46);
        const editBox = node.addComponent(EditBox);
        editBox.maxLength = 6;
        editBox.placeholder = T('ui.createNamePlaceholder');

        const textLabelNode = new Node('TextLabel');
        textLabelNode.addComponent(UITransform).setContentSize(380, 36);
        const textLabel = textLabelNode.addComponent(Label);
        textLabel.fontSize = 22;
        textLabel.lineHeight = 26;
        textLabel.color = Color.WHITE;
        node.addChild(textLabelNode);
        editBox.textLabel = textLabel;

        const placeholderNode = new Node('PlaceholderLabel');
        placeholderNode.addComponent(UITransform).setContentSize(380, 36);
        const placeholderLabel = placeholderNode.addComponent(Label);
        placeholderLabel.string = T('ui.createNamePlaceholder');
        placeholderLabel.fontSize = 22;
        placeholderLabel.lineHeight = 26;
        placeholderLabel.color = new Color(210, 210, 210, 255);
        node.addChild(placeholderNode);
        editBox.placeholderLabel = placeholderLabel;

        parent.addChild(node);
        return node;
    }

    // Character cards

    /**
     * Build 5 class selection buttons (no full character models).
     *
     * Structure per button:
     *   Btn_{id} (CARD_WIDTH x BUTTON_HEIGHT)
     *   - Sprite: ui.main.character_button skin, tinted on selection.
     *   - Label: class name from text.json.
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

            const btnNode = new Node(`Btn_${opt.id}`);
            btnNode.setPosition(startX + i * (CARD_WIDTH + CARD_GAP), 0);

            const trans = btnNode.addComponent(UITransform);
            trans.setContentSize(CARD_WIDTH, BUTTON_HEIGHT);

            const sprite = btnNode.addComponent(Sprite);
            sprite.color = new Color(0xFF, 0xFF, 0xFF, 0x30);
            void UISkinService.instance.applyOptional(btnNode, 'ui.main.character_button');

            btnNode.addComponent(Button);

            const labelNode = new Node('Label');
            labelNode.setPosition(0, 0);
            const label = labelNode.addComponent(Label);
            label.string = T(opt.classKey);
            label.fontSize = 16;
            label.lineHeight = 20;
            label.overflow = Label.Overflow.SHRINK;
            label.color = Color.WHITE;
            label.horizontalAlign = HorizontalTextAlignment.CENTER;
            label.verticalAlign = VerticalTextAlignment.CENTER;
            btnNode.addChild(labelNode);

            btnNode.on(Button.EventType.CLICK, () => this._selectCharacter(opt.id), this);

            this.cardRoot.addChild(btnNode);
            this._classCards.push(btnNode);
        }
    }

    /**
     * Mount VerticalPanelLayout on ContentRoot at startup.
     * Cocos cannot serialize new script class IDs in scene files, so we mount at runtime.
     * Called once from onLoad().
     */
    private _ensureVerticalPanelLayout(): void {
        const cr = this._getContentRoot();
        if (!cr) return;

        const vpl = cr.getComponent(VerticalPanelLayout) ?? cr.addComponent(VerticalPanelLayout);
        const zoneNames = ['HeaderZone', 'PreviewZone', 'ChoiceZone', 'InfoZone', 'ActionZone'];
        const zoneHeights = [58, 178, 64, 84, 64];
        const zones: Node[] = [];
        const heights: number[] = [];
        for (let i = 0; i < zoneNames.length; i++) {
            const zone = cr.getChildByName(zoneNames[i]);
            if (zone) { zones.push(zone); heights.push(zoneHeights[i]); }
        }
        if (zones.length > 0) {
            vpl.zones = zones;
            vpl.heights = heights;
            vpl.gap = 18;
            vpl.paddingTop = 18;
            vpl.paddingBottom = 18;
        }
        console.log(`[CreatePanel] VerticalPanelLayout bound with ${zones.length} zones`);
    }

    /** Re-trigger layout: zones first (VerticalPanelLayout), then internal (CreatePanelLayout). */
    private _reLayout(): void {
        const contentRoot = this._getContentRoot();
        if (!contentRoot) {
            console.warn('[CreatePanel] ContentRoot not found');
            return;
        }

        const verticalLayout = contentRoot.getComponent(VerticalPanelLayout);
        if (!verticalLayout) {
            console.warn('[CreatePanel] VerticalPanelLayout missing on ContentRoot');
            return;
        }
        verticalLayout.applyLayout();

        const internalLayout = contentRoot.getComponent(CreatePanelLayout);
        if (internalLayout) internalLayout.applyLayout();
    }

    /** Get ContentRoot node from editor binding or fallback path traversal. */
    private _getContentRoot(): Node | null {
        if (this.contentRoot?.isValid) return this.contentRoot;
        // Fallback: traverse from panelRoot
        return this.panelRoot
            ?.getChildByName('PanelFrame')
            ?.getChildByName('ContentRoot') ?? null;
    }

    // Character selection

    private _selectCharacter(id: string): void {
        this._selectedId = id;
        const opt = CHAR_OPTIONS.find(c => c.id === id);
        if (!opt) return;

        // Update model display to selected character looping attack animation
        void this._updateModelDisplay(id);

        const selectedInfo = this._label(this.selectedInfo, 'InfoZone/SelectedInfo');
        const selectedDesc = this._label(this.selectedDesc, 'InfoZone/SelectedDesc');
        if (selectedInfo) {
            selectedInfo.string = `${T(opt.animalKey)} ${T(opt.classKey)}`;
        }
        if (selectedDesc) {
            selectedDesc.string = T(opt.descKey);
        }

        this._refreshSelectedButtonState();
        this._clearError();
    }

    /** Update the top model display to show selected character's attack animation, scaled to fit PreviewZone. */
    private async _updateModelDisplay(id: string): Promise<void> {
        if (!this.modelDisplay) return;

        this.modelDisplay.removeAllChildren();

        const previewNode = new Node('CharacterPreview');
        const trans = previewNode.addComponent(UITransform);
        trans.setContentSize(128, 128);
        previewNode.setPosition(0, 0);

        // Keep the character inside the stage without affecting the stage skin.
        previewNode.setScale(0.82, 0.82, 1);

        this.modelDisplay.addChild(previewNode);

        await CharacterVisualService.instance.play(previewNode, `character.${id}.attack`, 8);
    }

    /** Refresh button visual state based on current selection. */
    private _refreshSelectedButtonState(): void {
        for (const card of this._classCards) {
            const selected = card.name === `Btn_${this._selectedId}`;
            const sprite = card.getComponent(Sprite);

            if (sprite) {
                sprite.color = selected
                    ? new Color(255, 255, 255, 255)
                    : new Color(180, 180, 180, 255);
            }

            card.setScale(selected ? 1.06 : 1, selected ? 1.06 : 1, 1);
        }
    }

    // Confirm

    private _onConfirm(): void {
        if (!this._isNaming) {
            this._isNaming = true;
            this._clearError();
            this._applyPhase();
            const nameInputNode = this._nodeFromRef(this.nameInput) ?? this._findInContent('NameInput');
            if (nameInputNode) {
                nameInputNode.active = true;
            }
            this._reLayout();
            return;
        }

        const name = this._nameEditBox()?.string.trim() ?? '';
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
        const error = this._label(this.errorLabel, 'ActionZone/ErrorLabel');
        if (error) { error.string = msg; error.node.active = true; }
        const confirmButton = this._confirmButton();
        if (confirmButton) confirmButton.interactable = false;
    }

    private _clearError(): void {
        const errorNode = this._labelNode(this.errorLabel, 'ActionZone/ErrorLabel');
        if (errorNode) errorNode.active = false;
        const confirmButton = this._confirmButton();
        if (confirmButton) confirmButton.interactable = true;
    }

    private _confirmButton(): Button | null {
        return NodeRef.component(this.confirmBtn, Button, this._getContentRoot(), 'ActionZone/ConfirmBtn');
    }

    private _nameEditBox(): EditBox | null {
        return NodeRef.component(this.nameInput, EditBox, this._getContentRoot(), 'NameInput');
    }

    private _label(ref: unknown, path: string): Label | null {
        return NodeRef.component(ref as any, Label, this._getContentRoot(), path);
    }

    private _labelNode(ref: unknown, path: string): Node | null {
        return NodeRef.node(ref as any) ?? this._findInContent(path);
    }

    private _nodeFromRef(ref: unknown): Node | null {
        return NodeRef.node(ref as any);
    }

    private _findInContent(path: string): Node | null {
        return NodeRef.find(this._getContentRoot(), path);
    }
}
