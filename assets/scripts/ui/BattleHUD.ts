/**
 * BattleHUD - 战斗 HUD
 * 显示 HP 条、怪物数量、当前层数、伤害数字
 * UI 层：只负责展示，不修改核心数据
 */

import { _decorator, Component, Node, Label, Sprite, ProgressBar, color, Color, UIOpacity, tween, Vec3 } from 'cc';
import { eventBus } from '../core/EventBus';
import { GameManager } from '../core/GameManager';
import { T } from '../core/TextManager';

const { ccclass, property } = _decorator;

// 攻击结果载荷类型（与 AutoAttack.AttackResult 一致）
interface AttackResultPayload {
    target: { node: Node };
    damage: number;
    isCrit: boolean;
}

@ccclass('BattleHUD')
export class BattleHUD extends Component {
    @property(ProgressBar)
    hpBar: ProgressBar | null = null;
    @property(Label)
    hpLabel: Label | null = null;
    @property(Label)
    floorLabel: Label | null = null;
    @property(Label)
    killLabel: Label | null = null;
    @property(Node)
    damageNumberPrefab: Node | null = null;  // 伤害数字预制体

    private _hp: number = 100;
    private _maxHP: number = 100;
    private _killCount: number = 0;

    onLoad(): void {
        eventBus.on('player:damaged', this._onPlayerDamaged, this);
        eventBus.on('player:healed', this._onPlayerHealed, this);
        eventBus.on('attack:performed', this._showDamageNumber, this);
        eventBus.on('battle:victory', this._onVictory, this);
        eventBus.on('floor:changed', this._onFloorChanged, this);
        eventBus.on('element:reaction', this._showReactionText, this);
    }

    onDestroy(): void {
        eventBus.offTarget(this);
    }

    /** 刷新 HP 条（由外部调用或事件触发） */
    refreshHP(currentHP: number, maxHP: number): void {
        this._hp = currentHP;
        this._maxHP = maxHP;

        if (this.hpBar) {
            this.hpBar.progress = maxHP > 0 ? currentHP / maxHP : 0;
        }
        if (this.hpLabel) {
            this.hpLabel.string = T('ui.hp', { cur: currentHP, max: maxHP });
        }
    }

    /** 刷新层数 */
    refreshFloor(floor: number): void {
        if (this.floorLabel) {
            this.floorLabel.string = T('ui.floor', { floor });
        }
    }

    /** 刷新击杀数 */
    refreshKills(kills: number): void {
        this._killCount = kills;
        if (this.killLabel) {
            this.killLabel.string = T('ui.defeat', { count: kills });
        }
    }

    private _onPlayerDamaged(damage: number, isCrit: boolean): void {
        this.refreshHP(this._hp - damage, this._maxHP);
    }

    private _onPlayerHealed(amount: number): void {
        this.refreshHP(Math.min(this._maxHP, this._hp + amount), this._maxHP);
    }

    private _onVictory(): void {
        // 战斗胜利闪一下
    }

    private _onFloorChanged(floor: number): void {
        this.refreshFloor(floor);
    }

    /** 显示元素反应文字 */
    private _showReactionText(reactionName: string, pos: Vec3): void {
        // 创建一个临时 Label 节点显示反应名
        const labelNode = new Node('reaction_text');
        labelNode.setPosition(pos.x, pos.y + 30, pos.z);
        this.node.addChild(labelNode);

        const label = labelNode.addComponent(Label);
        label.string = reactionName;
        label.fontSize = 28;
        label.color = new Color(255, 215, 0); // 金色
        label.lineHeight = 32;

        // 上浮 + 放大 + 消失
        const upPos = new Vec3(pos.x, pos.y + 80, pos.z);
        tween(labelNode)
            .to(1.0, { position: upPos, scale: new Vec3(1.3, 1.3, 1) })
            .call(() => labelNode.destroy())
            .start();
    }
}
