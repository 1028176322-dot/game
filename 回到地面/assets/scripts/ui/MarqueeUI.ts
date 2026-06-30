/**
 * MarqueeUI - 跑马灯系统 (Phase 4, M4.3)
 *
 * 战斗结束后弹出跑马灯面板，3 格进度条
 * 看广告点亮1格，3格满领钥匙
 * 进度跨层保留，结算清零
 *
 * 完全自包含，零编辑器挂载 (运行时创建 UI 节点)
 */

import { _decorator, Component, Node, Button, Label, tween, UITransform, Color, Vec3, Prefab } from 'cc';
import { GameConfig } from '../core/GameConfig';
import { eventBus } from '../core/EventBus';
import { AdPlacement } from '../core/Constants';
import { WXAdapter } from '../utils/WXAdapter';
import { StorageService } from '../platform/StorageService';
import { MarqueeVM, MarqueeLightVM } from './viewmodel/MarqueeViewModel';
import { T } from '../core/TextManager';

const { ccclass, property } = _decorator;

const MAX_LIGHTS = 3;

@ccclass('MarqueeUI')
export class MarqueeUI extends Component {
    /** 未来可绑定 Prefab */
    @property(Prefab) marqueePrefab: Prefab | null = null;

    /** 3 格灯: true=已点亮 */
    private _lights: boolean[] = [false, false, false];
    private _isShowing: boolean = false;
    private _panel: Node | null = null;
    private _lightNodes: Node[] = [];
    private _keyLabel: Label | null = null;
    private _progressLabel: Label | null = null;
    private _adInProgress: boolean = false;

    onLoad(): void {
        eventBus.on('battle:victory', this._onBattleVictory, this);
        this._createUI();
        this.node.active = false;
    }

    /** 创建跑马灯 UI（自包含） */
    private _createUI(): void {
        // 背景遮罩
        const mask = new Node('MarqueeMask');
        const maskTransform = mask.addComponent(UITransform);
        maskTransform.setContentSize(750, 400);
        this.node.addChild(mask);

        // 面板主体
        this._panel = new Node('MarqueePanel');
        const panelTransform = this._panel.addComponent(UITransform);
        panelTransform.setContentSize(600, 300);
        this.node.addChild(this._panel);

        // 标题
        const titleLabel = this._createLabelOn('Title', T('ui.marqueeTitle'), 28, new Color(255, 215, 0), new Vec3(0, 110, 0), this._panel);

        // 提示文字
        this._progressLabel = this._createLabelOn('Progress', T('ui.marqueeHint'), 18, new Color(200, 200, 200), new Vec3(0, 70, 0), this._panel);

        // 3 个灯
        for (let i = 0; i < MAX_LIGHTS; i++) {
            const lightNode = new Node(`Light_${i}`);
            lightNode.setPosition((i - 1) * 120, 10, 0);
            const lt = lightNode.addComponent(UITransform);
            lt.setContentSize(60, 60);
            const lightBtn = lightNode.addComponent(Button);
            lightBtn.clickEvents = [{
                target: this.node,
                component: 'MarqueeUI',
                handler: 'onLightClick',
            } as any];
            this._panel.addChild(lightNode);
            this._lightNodes.push(lightNode);
        }

        // 钥匙获得提示
        this._keyLabel = this._createLabelOn('KeyLabel', '', 22, new Color(255, 215, 0), new Vec3(0, -80, 0), this._panel);

        // 关闭按钮
        const closeBtn = new Node('CloseButton');
        closeBtn.setPosition(0, -130, 0);
        const closeTransform = closeBtn.addComponent(UITransform);
        closeTransform.setContentSize(200, 50);
        const closeButton = closeBtn.addComponent(Button);
        const closeLabel = closeBtn.addComponent(Label);
        closeLabel.string = T('ui.marqueeContinue');
        closeLabel.fontSize = 20;
        closeLabel.color = new Color(255, 255, 255);
        closeButton.clickEvents = [{
            target: this.node,
            component: 'MarqueeUI',
            handler: 'onCloseClick',
        } as any];
        this._panel.addChild(closeBtn);

        // 加载存档进度
        this._loadProgress();

        this.node.active = false;
    }

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

    /** 战斗胜利时触发 */
    private _onBattleVictory(): void {
        // 延迟片刻弹出，让胜利感延续
        this.scheduleOnce(() => {
            this._show();
        }, 0.5);
    }

    /** 显示跑马灯 */
    private _show(): void {
        this._isShowing = true;
        this.node.active = true;
        this._updateDisplay();

        // 渐入
        if (this._panel) {
            this._panel.setScale(0.8, 0.8, 1);
            tween(this._panel)
                .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
                .start();
        }

        eventBus.emit('game:pause_request');
    }

    /** 点击灯的按钮 */
    onLightClick(): void {
        if (this._adInProgress) return;

        // 找第一个未点亮的灯
        const nextIdx = this._lights.findIndex(light => !light);
        if (nextIdx < 0) {
            // 已经全亮
            return;
        }

        this._adInProgress = true;
        WXAdapter.getInstance().playRewardedAd(AdPlacement.Marquee, (result) => {
            this._adInProgress = false;
            if (result.rewarded) {
                this._lights[nextIdx] = true;
                this._saveProgress();
                this._updateDisplay();

                // 检查是否全满
                if (this._lights.every(l => l)) {
                    this._grantKey();
                }
            }
        });
    }

    /** 发放钥匙奖励 */
    private _grantKey(): void {
        if (this._keyLabel) {
            this._keyLabel.string = T('ui.marqueeGetKey');
        }
        eventBus.emit('key:change', 1);
        // 全亮后重置进度
        this._lights = [false, false, false];
        this._saveProgress();
    }

    /** 关闭跑马灯 */
    onCloseClick(): void {
        this._close();
    }

    private _close(): void {
        this._isShowing = false;
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
    }

    /** 更新显示状态 */
    private _updateDisplay(): void {
        for (let i = 0; i < MAX_LIGHTS; i++) {
            const node = this._lightNodes[i];
            if (!node) continue;
            node.getComponent(Button)!.interactable = !this._lights[i];
        }

        const litCount = this._lights.filter(l => l).length;
        if (this._progressLabel) {
            this._progressLabel.string = T('ui.marqueeProgress', { lit: litCount, total: MAX_LIGHTS });
        }
    }

    /** 保存进度（跨层保留） */
    private _saveProgress(): void {
        try {
            StorageService.instance.setJson('marquee_progress', this._lights);
        } catch (err) {
            console.warn('[MarqueeUI] 保存进度失败');
        }
    }

    /** 加载进度 */
    private _loadProgress(): void {
        try {
            const loaded = StorageService.instance.getJson<boolean[]>('marquee_progress', []);
            if (Array.isArray(loaded) && loaded.length === MAX_LIGHTS) {
                this._lights = loaded;
            }
        } catch (err) {
            console.warn('[MarqueeUI] 加载进度失败');
        }
    }

    /** 死亡时清空进度 */
    resetOnDeath(): void {
        this._lights = [false, false, false];
        this._saveProgress();
    }

    onDestroy(): void {
        eventBus.offTarget(this);
    }
}
