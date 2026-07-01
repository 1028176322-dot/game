/**
 * BattleHUD - combat status display.
 *
 * UI only: shows HP, floor, kill count, damage numbers and reaction text.
 * Gameplay state remains owned by battle/player systems.
 */

import { _decorator, Color, Component, Label, Node, ProgressBar, tween, Vec3 } from 'cc';
import { eventBus } from '../core/EventBus';
import { T } from '../core/TextManager';

const { ccclass, property } = _decorator;

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
    damageNumberPrefab: Node | null = null;

    private _hp = 100;
    private _maxHP = 100;
    private _killCount = 0;

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

    refreshHP(currentHP: number, maxHP: number): void {
        this._hp = Math.max(0, currentHP);
        this._maxHP = Math.max(1, maxHP);

        if (this.hpBar) {
            this.hpBar.progress = this._hp / this._maxHP;
        }
        if (this.hpLabel) {
            this.hpLabel.string = T('ui.hp', { cur: this._hp, max: this._maxHP });
        }
    }

    refreshFloor(floor: number): void {
        if (this.floorLabel) {
            this.floorLabel.string = T('ui.floor', { floor });
        }
    }

    refreshKills(kills: number): void {
        this._killCount = kills;
        if (this.killLabel) {
            this.killLabel.string = T('ui.defeat', { count: kills });
        }
    }

    private _onPlayerDamaged(damage: number): void {
        this.refreshHP(this._hp - damage, this._maxHP);
    }

    private _onPlayerHealed(amount: number): void {
        this.refreshHP(this._hp + amount, this._maxHP);
    }

    private _onVictory(): void {
        // Reserved for victory feedback.
    }

    private _onFloorChanged(floor: number): void {
        this.refreshFloor(floor);
    }

    private _showDamageNumber(result: AttackResultPayload): void {
        const targetNode = result?.target?.node;
        if (!targetNode || !targetNode.isValid || !this.node.isValid) return;

        const localPos = this._worldToHud(targetNode.worldPosition);
        localPos.y += 42;

        const labelNode = new Node('damage_number');
        labelNode.setPosition(localPos);
        this.node.addChild(labelNode);

        const label = labelNode.addComponent(Label);
        label.string = `${result.isCrit ? '暴击 ' : ''}${result.damage}`;
        label.fontSize = result.isCrit ? 30 : 24;
        label.lineHeight = result.isCrit ? 34 : 28;
        label.color = result.isCrit ? new Color(255, 210, 70) : new Color(255, 255, 255);

        const endPos = new Vec3(localPos.x, localPos.y + 54, localPos.z);
        tween(labelNode)
            .to(0.65, { position: endPos, scale: new Vec3(1.15, 1.15, 1) })
            .call(() => labelNode.destroy())
            .start();
    }

    private _showReactionText(reactionName: string, pos: Vec3): void {
        if (!this.node.isValid) return;

        const labelNode = new Node('reaction_text');
        const localPos = this._worldToHud(pos);
        localPos.y += 30;
        labelNode.setPosition(localPos);
        this.node.addChild(labelNode);

        const label = labelNode.addComponent(Label);
        label.string = reactionName;
        label.fontSize = 28;
        label.color = new Color(255, 215, 0);
        label.lineHeight = 32;

        const endPos = new Vec3(localPos.x, localPos.y + 80, localPos.z);
        tween(labelNode)
            .to(1.0, { position: endPos, scale: new Vec3(1.3, 1.3, 1) })
            .call(() => labelNode.destroy())
            .start();
    }

    private _worldToHud(worldPos: Vec3): Vec3 {
        const localPos = new Vec3();
        this.node.inverseTransformPoint(localPos, worldPos);
        return localPos;
    }
}
