/**
 * BattleHUD - 战斗 HUD
 * 显示 HP 条、怪物数量、当前层数、伤害数字
 * UI 层：只负责展示，不修改核心数据
 */

import { _decorator, Component, Node, Label, Sprite, ProgressBar, color, Color, UIOpacity, tween, Vec3 } from 'cc';
import { eventBus } from '../core/EventBus';
import { GameManager } from '../core/GameManager';

const { ccclass, property } = _decorator;

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
            this.hpLabel.string = `${currentHP}/${maxHP}`;
        }
    }

    /** 刷新层数 */
    refreshFloor(floor: number): void {
        if (this.floorLabel) {
            this.floorLabel.string = `第 ${floor} 层`;
        }
    }

    /** 刷新击杀数 */
    refreshKills(kills: number): void {
        this._killCount = kills;
        if (this.killLabel) {
            this.killLabel.string = `击杀: ${kills}`;
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

    /** 显示伤害数字 */
    private _showDamageNumber(pos: Vec3, damage: number, isCrit: boolean): void {
        // 可使用对象池或临时节点显示伤害数字
        if (!this.damageNumberPrefab) return;

        const numNode = this.damageNumberPrefab.clone();
        numNode.setPosition(pos);
        this.node.addChild(numNode);

        const label = numNode.getComponent(Label);
        if (label) {
            label.string = isCrit ? `暴击! ${damage}` : `${damage}`;
            label.color = isCrit ? Color.RED : Color.WHITE;
        }

        // 浮动 + 消失
        tween(numNode)
            .to(0.5, { position: new Vec3(pos.x, pos.y + 50, pos.z) })
            .call(() => numNode.destroy())
            .start();
    }
}
