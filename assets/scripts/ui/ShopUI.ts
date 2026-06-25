/**
 * ShopUI - 魂石商店界面 (M2.4)
 * 代码生成节点 (无 Prefab 依赖)
 * 角色解锁 + 天赋购买 + 遗物池扩展
 */

import { _decorator, Component, Node, Button, Label, Color, UITransform, Vec3 } from 'cc';
import { eventBus } from '../core/EventBus';
import { PlayerDataManager, CHARACTER_LIST, TALENT_LIST, CharacterDef, TalentDef } from '../core/PlayerDataManager';

const { ccclass, property } = _decorator;

/** 标签页 */
type ShopTab = 'characters' | 'talents' | 'extras';

@ccclass('ShopUI')
export class ShopUI extends Component {
    private _dataManager: PlayerDataManager = PlayerDataManager.getInstance();
    private _isOpen: boolean = false;
    private _currentTab: ShopTab = 'characters';

    // UI 节点
    private _panel: Node | null = null;
    private _tabButtons: Map<ShopTab, Node> = new Map();
    private _contentRoot: Node | null = null;
    private _soulStoneLabel: Label | null = null;
    private _closeBtn: Node | null = null;

    // 内容项节点列表
    private _contentItems: Node[] = [];

    onLoad(): void {
        eventBus.on('playerdata:soulStones_changed', this._onSoulStonesChanged, this);
        eventBus.on('playerdata:character_unlocked', this._refreshCurrentTab, this);
        eventBus.on('playerdata:talent_changed', this._refreshCurrentTab, this);
    }

    onDestroy(): void {
        eventBus.offTarget(this);
    }

    init(): void {
        this._buildUI();
        this.node.active = false;
    }

    toggle(): void {
        if (this._isOpen) this.hide();
        else this.show();
    }

    show(): void {
        this._isOpen = true;
        this.node.active = true;
        this._switchTab('characters');
    }

    hide(): void {
        this._isOpen = false;
        this.node.active = false;
    }

    get isOpen(): boolean { return this._isOpen; }

    // ======== UI 构建 ========

    private _buildUI(): void {
        this._panel = new Node('shopPanel');
        this.node.addChild(this._panel);
        const panelTransform = this._panel.addComponent(UITransform);
        panelTransform.setContentSize(500, 400);

        // === 标题 ===
        const titleNode = new Node('title');
        titleNode.setPosition(0, 180, 0);
        this._panel.addChild(titleNode);
        const titleLabel = titleNode.addComponent(Label);
        titleLabel.string = '魂石商店';
        titleLabel.fontSize = 22;
        titleLabel.color = Color.WHITE;

        // === 魂石数量 ===
        const ssNode = new Node('soulStone');
        ssNode.setPosition(0, 150, 0);
        this._panel.addChild(ssNode);
        this._soulStoneLabel = ssNode.addComponent(Label);
        this._soulStoneLabel.fontSize = 16;
        this._soulStoneLabel.color = new Color(255, 215, 0); // 金色
        this._refreshSoulStoneLabel();

        // === 标签页按钮 ===
        const tabs: { tab: ShopTab; label: string; x: number }[] = [
            { tab: 'characters', label: '角色', x: -120 },
            { tab: 'talents', label: '天赋', x: 0 },
            { tab: 'extras', label: '扩展', x: 120 },
        ];
        for (const t of tabs) {
            const btn = new Node(`tab_${t.tab}`);
            btn.setPosition(t.x, 110, 0);
            this._panel!.addChild(btn);
            btn.addComponent(UITransform).setContentSize(80, 30);
            const label = btn.addComponent(Label);
            label.string = t.label;
            label.fontSize = 14;
            label.color = Color.GRAY;
            btn.on(Node.EventType.TOUCH_END, () => this._switchTab(t.tab));
            this._tabButtons.set(t.tab, btn);
            // 存储 label 组件用于切换高亮
            (btn as any)._label = label;
        }

        // === 内容容器 ===
        this._contentRoot = new Node('content');
        this._contentRoot.setPosition(0, 60, 0);
        this._panel.addChild(this._contentRoot);

        // === 关闭按钮 ===
        this._closeBtn = new Node('closeBtn');
        this._closeBtn.setPosition(220, 180, 0);
        this._panel.addChild(this._closeBtn);
        this._closeBtn.addComponent(UITransform).setContentSize(40, 30);
        const closeLabel = this._closeBtn.addComponent(Label);
        closeLabel.string = '✕';
        closeLabel.fontSize = 20;
        closeLabel.color = Color.RED;
        this._closeBtn.on(Node.EventType.TOUCH_END, () => this.hide());
    }

    // ======== 标签页切换 ========

    private _switchTab(tab: ShopTab): void {
        this._currentTab = tab;

        // 高亮当前标签
        for (const [t, btn] of this._tabButtons) {
            const label = (btn as any)._label as Label;
            if (label) {
                label.color = t === tab ? Color.WHITE : Color.GRAY;
            }
        }

        this._refreshContent();
    }

    private _refreshContent(): void {
        // 清除旧内容
        for (const node of this._contentItems) {
            node.destroy();
        }
        this._contentItems = [];

        switch (this._currentTab) {
            case 'characters': this._buildCharacterList(); break;
            case 'talents': this._buildTalentList(); break;
            case 'extras': this._buildExtrasList(); break;
        }
    }

    private _refreshCurrentTab(): void {
        this._refreshContent();
        this._refreshSoulStoneLabel();
    }

    private _refreshSoulStoneLabel(): void {
        if (this._soulStoneLabel) {
            this._soulStoneLabel.string = `💎 魂石: ${this._dataManager.soulStones}`;
        }
    }

    private _onSoulStonesChanged(amount: number): void {
        if (this._isOpen) {
            this._refreshSoulStoneLabel();
        }
    }

    // ======== 角色列表 ========

    private _buildCharacterList(): void {
        for (let i = 0; i < CHARACTER_LIST.length; i++) {
            const charDef = CHARACTER_LIST[i];
            const node = this._createShopItem(
                charDef.name,
                charDef.description,
                this._dataManager.isCharacterUnlocked(charDef.id),
                charDef.unlockCost,
                charDef.isDefault ? undefined : () => {
                    if (!this._dataManager.isCharacterUnlocked(charDef.id)) {
                        this._dataManager.unlockCharacter(charDef.id);
                    } else {
                        this._dataManager.selectCharacter(charDef.id);
                    }
                    this._refreshCurrentTab();
                },
                180 - i * 40,
            );
            this._contentItems.push(node);
        }
    }

    // ======== 天赋列表 ========

    private _buildTalentList(): void {
        for (let i = 0; i < TALENT_LIST.length; i++) {
            const talent = TALENT_LIST[i];
            const isOwned = this._dataManager.selectedTalent === talent.id;
            const node = this._createShopItem(
                talent.name,
                talent.description,
                isOwned,
                talent.cost,
                () => {
                    if (!isOwned) {
                        this._dataManager.purchaseTalent(talent.id);
                    }
                    this._refreshCurrentTab();
                },
                180 - i * 40,
            );
            this._contentItems.push(node);
        }
    }

    // ======== 扩展列表 (简化) ========

    private _buildExtrasList(): void {
        const extras = [
            { id: 'extra_relic_pool', name: '遗物池扩展', desc: '解锁更多遗物进入选项池', cost: 300 },
        ];
        for (let i = 0; i < extras.length; i++) {
            const ext = extras[i];
            const purchased = this._dataManager['unlockedRelicPoolExtras']?.includes(ext.id);
            const node = this._createShopItem(
                ext.name,
                ext.desc,
                !!purchased,
                ext.cost,
                () => {
                    if (!purchased) {
                        this._dataManager.unlockRelicExtra(ext.id);
                    }
                    this._refreshCurrentTab();
                },
                180 - i * 40,
            );
            this._contentItems.push(node);
        }
    }

    // ======== 通用商店项 ========

    private _createShopItem(
        name: string,
        desc: string,
        owned: boolean,
        cost: number,
        onAction: (() => void) | undefined,
        yPos: number,
    ): Node {
        const node = new Node(`item_${name}`);
        node.setPosition(0, yPos, 0);
        this._contentRoot!.addChild(node);
        node.addComponent(UITransform).setContentSize(420, 35);

        // 名称
        const nameNode = new Node('name');
        nameNode.setPosition(-160, 0, 0);
        node.addChild(nameNode);
        const nameLabel = nameNode.addComponent(Label);
        nameLabel.string = name;
        nameLabel.fontSize = 14;
        nameLabel.color = Color.WHITE;

        // 描述
        const descNode = new Node('desc');
        descNode.setPosition(10, 0, 0);
        node.addChild(descNode);
        const descLabel = descNode.addComponent(Label);
        descLabel.string = desc;
        descLabel.fontSize = 11;
        descLabel.color = new Color(180, 180, 180);

        // 状态/按钮
        const actionNode = new Node('action');
        actionNode.setPosition(170, 0, 0);
        node.addChild(actionNode);
        const actionLabel = actionNode.addComponent(Label);
        actionLabel.fontSize = 12;

        if (owned) {
            actionLabel.string = this._dataManager.selectedCharacter === name || this._dataManager.selectedTalent === name ? '已装备' : '选择';
            actionLabel.color = new Color(0, 200, 0);
            if (onAction) {
                actionNode.on(Node.EventType.TOUCH_END, onAction);
            }
        } else {
            const canAfford = this._dataManager.soulStones >= cost;
            actionLabel.string = `💎${cost}`;
            actionLabel.color = canAfford ? new Color(255, 215, 0) : Color.RED;
            if (onAction && canAfford) {
                actionNode.on(Node.EventType.TOUCH_END, onAction);
            }
        }

        // 分隔线
        const lineNode = new Node('line');
        lineNode.setPosition(0, -18, 0);
        node.addChild(lineNode);
        const lineLabel = lineNode.addComponent(Label);
        lineLabel.string = '───';
        lineLabel.fontSize = 8;
        lineLabel.color = new Color(60, 60, 60);

        return node;
    }
}
