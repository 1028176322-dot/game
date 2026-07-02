/**
 * EventUI - 事件房 UI (Phase 3, M3.4)
 * 
 * 2 选 1 决策面板 - 完全自包含，无需编辑器挂载
 * 运行时创建所有 UI 节点
 * 
 * 显示流程:
 *   room:event 事件触发 → 生成 Event → 显示面板 →
 *   15 秒超时自动选择 A → 应用后果 → 关闭面板
 */

import { _decorator, Component, Node, Button, Label, tween, UITransform, Vec3, Color, Prefab } from 'cc';
import { GameConfig } from '../core/GameConfig';
import { eventBus } from '../core/EventBus';
import { T } from '../core/TextManager';
import { GameManager } from '../core/GameManager';
import { EventSystem, GeneratedEvent } from '../battle/EventSystem';
import { PlayerController } from '../battle/PlayerController';
import { EventVM } from './viewmodel/EventViewModel';

const { ccclass, property } = _decorator;

@ccclass('EventUI')
export class EventUI extends Component {
    /** 未来可绑定 Prefab */
    @property(Prefab) eventPrefab: Prefab | null = null;

    private _eventSystem: EventSystem | null = null;
    private _player: PlayerController | null = null;
    private _currentEvent: GeneratedEvent | null = null;
    private _autoSelectTimer: number = 0;
    private _isActive: boolean = false;

    // UI 元素（运行时创建）
    private _panel: Node | null = null;
    private _descriptionLabel: Label | null = null;
    private _sceneTitle: Label | null = null;
    private _optionABtn: Node | null = null;
    private _optionALabel: Label | null = null;
    private _optionADesc: Label | null = null;
    private _optionBBtn: Node | null = null;
    private _optionBLabel: Label | null = null;
    private _optionBDesc: Label | null = null;
    private _timerLabel: Label | null = null;

    onLoad(): void {
        eventBus.on('room:event', this._onEnterEventRoom, this);
        this._createUI();
        this.node.active = false;
    }

    /** 初始化 */
    init(eventSystem: EventSystem, player: PlayerController): void {
        this._eventSystem = eventSystem;
        this._player = player;
    }

    /** 创建所有 UI 节点（完全自包含） */
    private _createUI(): void {
        // 全屏遮罩
        const mask = new Node('Mask');
        mask.setPosition(0, 0, 0);
        const maskTransform = mask.addComponent(UITransform);
        maskTransform.setContentSize(750, 1334);
        const maskBtn = mask.addComponent(Button);
        // 遮罩点击无效（不关闭面板）
        this.node.addChild(mask);

        // 面板主体
        this._panel = new Node('EventPanel');
        this._panel.setPosition(0, 0, 0);
        const panelTransform = this._panel.addComponent(UITransform);
        panelTransform.setContentSize(600, 500);
        this.node.addChild(this._panel);

        // 标题
        this._sceneTitle = this._createLabel(
            'SceneTitle', '事件', 28, 
            new Color(255, 215, 0), new Vec3(0, 200, 0)
        );

        // 描述文本
        this._descriptionLabel = this._createLabel(
            'Description', '描述', 20,
            new Color(220, 220, 220), new Vec3(0, 120, 0)
        );

        // 选项 A (左侧)
        const aPanel = new Node('OptionA_Container');
        aPanel.setPosition(-180, -80, 0);
        const aTransform = aPanel.addComponent(UITransform);
        aTransform.setContentSize(260, 200);
        const aBtn = aPanel.addComponent(Button);
        aBtn.clickEvents = [{
            target: this.node,
            component: 'EventUI',
            handler: 'onSelectOptionA',
        } as any];
        this._panel.addChild(aPanel);
        this._optionABtn = aPanel;

        this._optionALabel = this._createLabelOn(
            'OptionALabel', '选项A', 22,
            new Color(100, 200, 255), new Vec3(0, 60, 0), aPanel
        );
        this._optionADesc = this._createLabelOn(
            'OptionADesc', '描述', 16,
            new Color(180, 180, 180), new Vec3(0, -30, 0), aPanel
        );

        // 选项 B (右侧)
        const bPanel = new Node('OptionB_Container');
        bPanel.setPosition(180, -80, 0);
        const bTransform = bPanel.addComponent(UITransform);
        bTransform.setContentSize(260, 200);
        const bBtn = bPanel.addComponent(Button);
        bBtn.clickEvents = [{
            target: this.node,
            component: 'EventUI',
            handler: 'onSelectOptionB',
        } as any];
        this._panel.addChild(bPanel);
        this._optionBBtn = bPanel;

        this._optionBLabel = this._createLabelOn(
            'OptionBLabel', '选项B', 22,
            new Color(255, 150, 100), new Vec3(0, 60, 0), bPanel
        );
        this._optionBDesc = this._createLabelOn(
            'OptionBDesc', '描述', 16,
            new Color(180, 180, 180), new Vec3(0, -30, 0), bPanel
        );

        // 计时器
        this._timerLabel = this._createLabel(
            'Timer', '自动选择: 15s', 16,
            new Color(150, 150, 150), new Vec3(0, -260, 0)
        );

        this.node.active = false;
    }

    /** 创建标签辅助方法（挂载到面板） */
    private _createLabel(name: string, text: string, fontSize: number, color: Color, pos: Vec3): Label {
        const node = new Node(name);
        node.setPosition(pos);
        const label = node.addComponent(Label);
        label.string = text;
        label.fontSize = fontSize;
        label.color = color;
        label.lineHeight = fontSize + 4;
        this._panel!.addChild(node);
        return label;
    }

    /** 创建标签（挂载到指定父节点） */
    private _createLabelOn(name: string, text: string, fontSize: number, color: Color, pos: Vec3, parent: Node): Label {
        const node = new Node(name);
        node.setPosition(pos);
        const label = node.addComponent(Label);
        label.string = text;
        label.fontSize = fontSize;
        label.color = color;
        label.lineHeight = fontSize + 4;
        parent.addChild(node);
        return label;
    }

    /** 进入事件房 */
    private _onEnterEventRoom(roomId: number): void {
        if (!this._eventSystem || !this._player) return;

        eventBus.emit('game:pause_request');

        const gm = GameManager.instance;
        const floor = gm ? gm.currentFloor : 1;
        const zoneId = gm ? gm.currentZone : 'forest';
        
        this._currentEvent = this._eventSystem.generateEvent(floor, zoneId);
        this._showEvent(this._currentEvent);
    }

    /** 显示事件 UI */
    private _showEvent(event: GeneratedEvent): void {
        this._isActive = true;
        this._autoSelectTimer = GameConfig.EVENT_AUTO_SELECT_TIMEOUT || 15;
        this.node.active = true;

        this._sceneTitle!.string = event.scene.name;
        this._descriptionLabel!.string = event.description;

        this._optionALabel!.string = event.optionA.label;
        this._optionADesc!.string = event.optionA.description;

        this._optionBLabel!.string = event.optionB.label;
        this._optionBDesc!.string = event.optionB.description;

        // 渐入动画
        if (this._panel) {
            this._panel.setScale(0.8, 0.8, 1);
            tween(this._panel)
                .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
                .start();
        }

        this._updateTimerDisplay();
    }

    /** 选择选项 A */
    onSelectOptionA(): void {
        this._resolveChoice(true);
    }

    /** 选择选项 B */
    onSelectOptionB(): void {
        this._resolveChoice(false);
    }

    /** 执行选择 */
    private _resolveChoice(isA: boolean): void {
        if (!this._isActive || !this._currentEvent) return;
        this._isActive = false;

        const option = isA ? this._currentEvent.optionA : this._currentEvent.optionB;
        if (this._eventSystem) {
            for (const consequence of option.consequences) {
                this._eventSystem.applyConsequence(consequence);
            }
        }
        this._close();
    }

    /** 关闭事件 UI */
    private _close(): void {
        if (this._panel) {
            tween(this._panel)
                .to(0.2, { scale: new Vec3(0, 0, 0) })
                .call(() => {
                    this.node.active = false;
                    eventBus.emit('game:resume_request');
                })
                .start();
        } else {
            this.node.active = false;
            eventBus.emit('game:resume_request');
        }
        this._currentEvent = null;
    }

    /** 更新计时器 */
    private _updateTimerDisplay(): void {
        if (this._timerLabel) {
            const secs = Math.ceil(this._autoSelectTimer);
            this._timerLabel.string = T('ui.autoSelect', { secs });
        }
    }

    update(dt: number): void {
        if (!this._isActive) return;
        this._autoSelectTimer -= dt;
        this._updateTimerDisplay();
        if (this._autoSelectTimer <= 0) {
            this._resolveChoice(true);
        }
    }

    onDestroy(): void {
        eventBus.offTarget(this);
    }
}
