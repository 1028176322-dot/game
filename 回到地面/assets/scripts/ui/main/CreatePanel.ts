/**
 * CreatePanel - First-time character creation panel
 *
 * Two-phase flow:
 *   1. SELECT: player picks a character class from class buttons
 *      - SelectView: title / model display / class buttons / class info
 *   2. NAMING: player enters a name, then confirms to create character
 *      - NamingView: NamePanel / NameTitleLabel / NameInput / ErrorLabel
 *
 * ActionZone (shared, fixed at bottom of PanelRoot):
 *   - BackOrSkipBtn (left) and ConfirmBtn (right)
 *
 * Layout:
 *   All content nodes are children of PanelRoot (not PanelFrame/ContentRoot).
 *   SelectView and NamingView are mutually exclusive.
 *   ActionZone buttons positioned relative to PanelRoot center/bottom.
 *
 * Skin keys used: ui.create.class_btn, ui.create.class_btn_selected,
 *                 ui.create.confirm_btn, ui.create.skip_btn,
 *                 ui.create.name_panel, ui.create.name_input
 */

import { _decorator, Component, Node, Label, Button, EditBox, Sprite, Color, UITransform, HorizontalTextAlignment, VerticalTextAlignment } from 'cc';
import { UiRouter, UiPanelId, UIPanel } from '../UiRouter';
import { AppFlowController, AppFlowState } from '../../app/AppFlowController';
import { PlayerDataManager } from '../../core/PlayerDataManager';
import { T } from '../../core/TextManager';
import { UISkinService } from '../UISkinService';
import { SceneModelPreview, PreviewHandle } from '../../render/SceneModelPreview';
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

type CreatePhase = 'select' | 'naming';

@ccclass('CreatePanel')
export class CreatePanel extends Component implements UIPanel {
    id: UiPanelId = 'create_character';

    @property(Node) panelRoot: Node | null = null;

    // Dynamic sub-view roots
    private _selectView: Node | null = null;
    private _namingView: Node | null = null;
    private _actionZone: Node | null = null;

    // Select phase nodes
    private _titleLabel: Node | null = null;
    private _modelDisplay: Node | null = null;
    private _previewHandle: PreviewHandle | null = null;
    private _previewGen = 0;
    private _cardRoot: Node | null = null;
    private _selectedInfo: Node | null = null;
    private _selectedDesc: Node | null = null;

    // Naming phase nodes
    private _nameTitleLabel: Node | null = null;
    private _namePanel: Node | null = null;
    private _nameInput: Node | null = null;
    private _errorLabel: Node | null = null;

    // Shared action nodes
    private _confirmBtn: Node | null = null;
    private _skipBtn: Node | null = null;

    private _phase: CreatePhase = 'select';
    private _selectedId = 'warrior';
    private _classCards: Node[] = [];

    // UIPanel

    open(_params?: unknown): void {
        if (this.panelRoot) this.panelRoot.active = true;

        this._setPhase('select');
        this._layoutAll();

        this._buildCards();

        // Default to the player's currently selected character (e.g. archer during 3D testing),
        // falling back to the first unlocked option and finally warrior.
        const pdm = PlayerDataManager.getInstance();
        const selected = pdm.selectedCharacter;
        const defaultId = CHAR_OPTIONS.some(c => c.id === selected) && pdm.isCharacterUnlocked(selected)
            ? selected
            : (CHAR_OPTIONS.find(c => pdm.isCharacterUnlocked(c.id))?.id ?? 'warrior');
        this._selectCharacter(defaultId);

        this.scheduleOnce(() => {
            this._layoutAll();
            void this._updateModelDisplay(this._selectedId);
        }, 0);
    }

    close(): void {
        // T1B: invalidate any in-flight preview + release the surface/handle.
        this._previewGen++;
        this._previewHandle?.destroy();
        this._previewHandle = null;
        SceneModelPreview.instance.clearOwner('CreatePanel');
        if (this.panelRoot) this.panelRoot.active = false;
    }

    // Lifecycle

    onLoad(): void {
        if (this.node.name !== 'CreatePanel') {
            console.warn(`[CreatePanel] disabled on ${this.node.name}`);
            this.enabled = false;
            return;
        }

        this._ensureRuntimeStructure();
        this._prepareIntegratedBackground();

        const confirmButton = this._confirmBtnNode();
        if (confirmButton) {
            confirmButton.node.on(Button.EventType.CLICK, this._onConfirm, this);
        }
        if (this._skipBtn) {
            this._skipBtn.on(Node.EventType.TOUCH_END, this._onSkip, this);
        }
        const editBox = this._editBox();
        if (editBox) {
            editBox.node.on('editing-did-ended', this._onNameEdited, this);
        }
    }

    // Runtime structure

    private _ensureRuntimeStructure(): void {
        if (this._selectView) return; // already built

        const root = this.panelRoot;
        if (!root) return;

        // Remove any runtime-generated nodes from previous structure
        this._removeRuntimeNodes(root);

        // SelectView
        this._selectView = new Node('SelectView');
        root.addChild(this._selectView);

        const headerZone = this._createZone('HeaderZone', this._selectView);
        this._titleLabel = this._createLabelNode('TitleLabel', headerZone, T('ui.createTitle'), 28);

        const previewZone = this._createZone('PreviewZone', this._selectView);
        this._modelDisplay = new Node('ModelDisplay');
        this._modelDisplay.addComponent(UITransform).setContentSize(240, 150);
        previewZone.addChild(this._modelDisplay);

        const choiceZone = this._createZone('ChoiceZone', this._selectView);
        this._cardRoot = new Node('CardRoot');
        this._cardRoot.addComponent(UITransform).setContentSize(620, 52);
        choiceZone.addChild(this._cardRoot);

        const infoZone = this._createZone('InfoZone', this._selectView);
        this._selectedInfo = this._createLabelNode('SelectedInfo', infoZone, '', 22);
        this._selectedDesc = this._createLabelNode('SelectedDesc', infoZone, '', 20);

        // NamingView
        this._namingView = new Node('NamingView');
        this._namingView.active = false;
        root.addChild(this._namingView);

        this._namePanel = new Node('NamePanel');
        this._namePanel.addComponent(UITransform).setContentSize(620, 240);
        this._namePanel.addComponent(Sprite);
        this._namingView.addChild(this._namePanel);
        void UISkinService.instance.applyOptional(this._namePanel, 'ui.create.name_panel');

        this._nameTitleLabel = this._createLabelNode('NameTitleLabel', this._namingView, T('ui.createNamePrompt'), 28);
        const nameTitleLabel = this._nameTitleLabel.getComponent(Label);
        if (nameTitleLabel) nameTitleLabel.color = new Color(92, 62, 32, 255);

        const nameInputNode = new Node('NameInput');
        nameInputNode.addComponent(UITransform).setContentSize(420, 64);
        nameInputNode.addComponent(Sprite);
        const editBox = nameInputNode.addComponent(EditBox);
        editBox.maxLength = 6;
        editBox.placeholder = T('ui.createNamePlaceholder');

        const textLabelNode = new Node('TextLabel');
        textLabelNode.addComponent(UITransform).setContentSize(380, 36);
        const textLabel = textLabelNode.addComponent(Label);
        textLabel.fontSize = 22;
        textLabel.lineHeight = 26;
        textLabel.color = new Color(92, 62, 32, 255);
        nameInputNode.addChild(textLabelNode);
        editBox.textLabel = textLabel;

        const placeholderNode = new Node('PlaceholderLabel');
        placeholderNode.addComponent(UITransform).setContentSize(380, 36);
        const placeholderLabel = placeholderNode.addComponent(Label);
        placeholderLabel.string = T('ui.createNamePlaceholder');
        placeholderLabel.fontSize = 22;
        placeholderLabel.lineHeight = 26;
        placeholderLabel.color = new Color(120, 92, 58, 220);
        nameInputNode.addChild(placeholderNode);
        editBox.placeholderLabel = placeholderLabel;

        void UISkinService.instance.applyOptional(nameInputNode, 'ui.create.name_input');
        this._namingView.addChild(nameInputNode);
        this._nameInput = nameInputNode;

        this._errorLabel = this._createLabelNode('ErrorLabel', this._namingView, '', 18);
        this._errorLabel.active = false;

        // ActionZone
        this._actionZone = new Node('ActionZone');
        root.addChild(this._actionZone);

        this._skipBtn = this._createButtonNode('BackOrSkipBtn', this._actionZone, T('ui.skip'), 'ui.create.skip_btn');
        this._confirmBtn = this._createButtonNode('ConfirmBtn', this._actionZone, T('ui.createConfirm'), 'ui.create.confirm_btn');
    }

    /** Remove any runtime-created nodes (SelectView, NamingView, ActionZone) from PanelRoot. */
    private _removeRuntimeNodes(root: Node): void {
        ['SelectView', 'NamingView', 'ActionZone'].forEach(name => {
            const child = root.getChildByName(name);
            if (child) root.removeChild(child);
        });
    }

    private _prepareIntegratedBackground(): void {
        const root = this.panelRoot;
        const frame = root?.getChildByName('PanelFrame');
        const mask = root?.getChildByName('DimMask');

        // Only disable the background sprites, never deactivate the nodes.
        // PanelFrame carries the ContentRoot subtree with all buttons/inputs.
        const frameSprite = frame?.getComponent(Sprite);
        if (frameSprite) frameSprite.enabled = false;

        const maskSprite = mask?.getComponent(Sprite);
        if (maskSprite) maskSprite.enabled = false;
    }

    // Layout

    /**
     * Position all sub-views and their children relative to PanelRoot.
     * Call after any phase change or content size change.
     */
    private _layoutAll(): void {
        const root = this.panelRoot;
        if (!root) return;
        const rootTrans = root.getComponent(UITransform);
        const pw = rootTrans?.width ?? 1280;
        const ph = rootTrans?.height ?? 720;

        // SelectView: centered, top zone starts at ph/2 - padding
        if (this._selectView) {
            const zoneNames = ['HeaderZone', 'PreviewZone', 'ChoiceZone', 'InfoZone'];
            const zoneHeights = [58, 178, 64, 84];
            const gap = 18;
            const padding = 18;
            const totalH = padding + zoneHeights.reduce((a, b) => a + b, 0) + (zoneHeights.length - 1) * gap + padding;
            let y = ph / 2 - padding;
            for (let i = 0; i < zoneNames.length; i++) {
                const zone = this._selectView.getChildByName(zoneNames[i]);
                if (!zone) continue;
                const trans = zone.getComponent(UITransform);
                if (trans) trans.setContentSize(pw, zoneHeights[i]);
                y -= zoneHeights[i] / 2;
                zone.setPosition(0, y);
                y -= zoneHeights[i] / 2 + gap;
            }
        }

        // NamingView: the panel is centered, with title/input/error inside it.
        if (this._namingView) {
            const panelY = 92;
            this._namePanel?.setPosition(0, panelY);
            this._nameTitleLabel?.setPosition(0, panelY + 72);
            this._nameInput?.setPosition(0, panelY - 12);
            this._errorLabel?.setPosition(0, panelY - 78);
        }

        // ActionZone: anchored to left/right edges of PanelRoot.
        // Confirm button stays on the left, skip/back button stays on the right.
        // Horizontal positions use panel width (pw) so they adapt to resolution.
        if (this._actionZone) {
            const btnW = 200;
            const btnH = 62;
            const marginX = 60;          // margin from left/right panel edge
            const bottomMargin = 54;     // distance from button center to bottom edge
            const btnY = -ph / 2 + bottomMargin;

            this._confirmBtn?.setPosition(-pw / 2 + marginX + btnW / 2, btnY);
            this._skipBtn?.setPosition(pw / 2 - marginX - btnW / 2, btnY);
        }
    }

    // Phase management

    private _setPhase(phase: CreatePhase): void {
        this._phase = phase;
        const isSelect = phase === 'select';
        const isNaming = phase === 'naming';

        if (this._selectView) this._selectView.active = isSelect;
        if (this._namingView) this._namingView.active = isNaming;

        // When entering the naming phase the SelectView (and its PreviewZone
        // slot) is hidden, so the offscreen RT/rig must be released to avoid
        // leaks. Returning to select re-triggers _updateModelDisplay via _onSkip.
        if (isNaming) {
            this._previewGen++;
            this._previewHandle?.destroy();
            this._previewHandle = null;
        }

        // Update button labels
        const skipLabel = this._skipBtn?.getComponentInChildren(Label);
        if (skipLabel) {
            skipLabel.string = isNaming ? T('ui.areaBack') : T('ui.skip');
        }
        const confirmLabel = this._confirmBtn?.getComponentInChildren(Label);
        if (confirmLabel) {
            confirmLabel.string = isNaming ? T('ui.createConfirmName') : T('ui.createConfirm');
        }

        this._clearError();
    }

    // Factories

    private _createZone(name: string, parent: Node): Node {
        const node = new Node(name);
        node.addComponent(UITransform).setContentSize(640, 60);
        parent.addChild(node);
        return node;
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
        node.addComponent(UITransform).setContentSize(200, 62);
        node.addComponent(Sprite);
        node.addComponent(Button);

        const labelNode = new Node('Label');
        labelNode.addComponent(UITransform).setContentSize(180, 50);
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

    // Character cards

    private _buildCards(): void {
        if (!this._cardRoot) return;
        this._cardRoot.removeAllChildren();
        this._classCards = [];

        const totalW = CHAR_OPTIONS.length * CARD_WIDTH + (CHAR_OPTIONS.length - 1) * CARD_GAP;
        const startX = -totalW / 2 + CARD_WIDTH / 2;

        for (let i = 0; i < CHAR_OPTIONS.length; i++) {
            const opt = CHAR_OPTIONS[i];

            const btnNode = new Node(`Btn_${opt.id}`);
            btnNode.setPosition(startX + i * (CARD_WIDTH + CARD_GAP), 0);

            const trans = btnNode.addComponent(UITransform);
            trans.setContentSize(CARD_WIDTH, BUTTON_HEIGHT);

            btnNode.addComponent(Sprite);
            btnNode.addComponent(Button);
            void UISkinService.instance.applyOptional(btnNode, 'ui.create.class_btn');

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

            this._cardRoot.addChild(btnNode);
            this._classCards.push(btnNode);
        }
    }

    // Character selection

    private _selectCharacter(id: string): void {
        this._selectedId = id;
        const opt = CHAR_OPTIONS.find(c => c.id === id);
        if (!opt) return;

        void this._updateModelDisplay(id);

        if (this._selectedInfo) {
            const label = this._selectedInfo.getComponent(Label);
            if (label) label.string = `${T(opt.animalKey)} ${T(opt.classKey)}`;
        }
        if (this._selectedDesc) {
            const label = this._selectedDesc.getComponent(Label);
            if (label) label.string = T(opt.descKey);
        }

        this._refreshSelectedButtonState();
        this._clearError();
    }

    /**
     * Render the selected class's 3D character into the offscreen RenderTexture
     * bound to the runtime ModelDisplay slot (T1A/T1B). `_modelDisplay` is the
     * runtime `PanelRoot/SelectView/PreviewZone/ModelDisplay` node (UITransform +
     * Sprite surface) — NOT a world-space anchor. Its position/size follow layout,
     * so the render adapts to resolution automatically.
     */
    private async _updateModelDisplay(id: string): Promise<void> {
        if (!this._modelDisplay) return;

        // Generation token guards against stale-handle leaks: if a newer request
        // supersedes this in-flight mount, the resolved handle is discarded.
        const gen = ++this._previewGen;

        // Rebuild: release any previous preview first (covers class switching).
        this._previewHandle?.destroy();
        this._previewHandle = null;

        const handle = await SceneModelPreview.instance.showCharacterInSlot(
            this._modelDisplay,
            id,
            'attack',
            { ownerId: 'CreatePanel', forceUnlit: true },
        );

        // If a newer request (class switch / phase change / close) superseded
        // this one while it was loading, discard the now-stale handle.
        if (gen !== this._previewGen) {
            handle?.destroy();
            return;
        }
        this._previewHandle = handle;
    }

    private _refreshSelectedButtonState(): void {
        for (const card of this._classCards) {
            const selected = card.name === `Btn_${this._selectedId}`;
            void UISkinService.instance.applyOptional(
                card,
                selected ? 'ui.create.class_btn_selected' : 'ui.create.class_btn'
            );
            card.setScale(selected ? 1.06 : 1, selected ? 1.06 : 1, 1);
        }
    }

    // Confirm / Skip / Back

    private _onConfirm(): void {
        if (this._phase === 'select') {
            this._setPhase('naming');
            this._layoutAll();
            return;
        }

        const name = this._editBox()?.string.trim() ?? '';
        if (!name) { this._showError(T('ui.createNameRequired')); return; }
        if (name.length > 6) { this._showError(T('ui.createNameTooLong')); return; }
        if (this._hasReservedWords(name)) { this._showError(T('ui.createNameBlocked')); return; }

        PlayerDataManager.getInstance().createCharacter(name, this._selectedId);
        this.close();
        const appFlow = AppFlowController.instance;
        if (appFlow) appFlow.goTo(AppFlowState.MAIN_HUB);
    }

    private _onSkip(): void {
        if (this._phase === 'naming') {
            this._setPhase('select');
            this._layoutAll();
            void this._updateModelDisplay(this._selectedId);
            return;
        }

        PlayerDataManager.getInstance().createCharacter(T('ui.defaultName'), 'warrior');
        this.close();
        const appFlow = AppFlowController.instance;
        if (appFlow) appFlow.goTo(AppFlowState.MAIN_HUB);
    }

    private _onNameEdited(editBox: EditBox): void {
        if (editBox.string.length > 6) {
            editBox.string = editBox.string.slice(0, 6);
        }
        if (editBox.string.trim().length > 0) {
            this._clearError();
        }
    }

    private _hasReservedWords(name: string): boolean {
        const reserved = ['admin', 'test', 'root', 'fuck', 'shit'];
        return reserved.some(w => name.toLowerCase().includes(w));
    }

    private _showError(msg: string): void {
        const label = this._errorLabel?.getComponent(Label);
        if (label) { label.string = msg; label.node.active = true; }
    }

    private _clearError(): void {
        if (this._errorLabel) this._errorLabel.active = false;
        const btn = this._confirmBtn?.getComponent(Button);
        if (btn) btn.interactable = true;
    }

    // Helpers

    private _confirmBtnNode(): Button | null {
        return this._confirmBtn?.getComponent(Button) ?? null;
    }

    private _editBox(): EditBox | null {
        return this._nameInput?.getComponent(EditBox) ?? null;
    }
}
