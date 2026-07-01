import { _decorator, Color, Component, Graphics, Node, Sprite, UITransform } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('MonsterRuntimeView')
export class MonsterRuntimeView extends Component {
    @property(Sprite)
    bodySprite: Sprite | null = null;

    @property(Node)
    hpBar: Node | null = null;

    @property(Node)
    hpFill: Node | null = null;

    @property(Node)
    effectSocket: Node | null = null;

    @property(Node)
    shadow: Node | null = null;

    private _hpBarWidth = 80;
    private _hpBarHeight = 8;

    initRefs(bodySprite: Sprite, hpBar: Node, hpFill: Node, effectSocket: Node, shadow: Node): void {
        this.bodySprite = bodySprite;
        this.hpBar = hpBar;
        this.hpFill = hpFill;
        this.effectSocket = effectSocket;
        this.shadow = shadow;
        this.setHP(1, 1);
    }

    setHP(current: number, max: number): void {
        if (!this.hpFill) return;
        const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
        const transform = this.hpFill.getComponent(UITransform);
        if (transform) {
            transform.setContentSize(this._hpBarWidth * ratio, this._hpBarHeight);
        }
        this._drawFill(ratio);
    }

    showHP(visible: boolean): void {
        if (this.hpBar) this.hpBar.active = visible;
    }

    flashHit(): void {
        if (!this.bodySprite) return;
        this.bodySprite.color = new Color(255, 220, 220, 255);
        this.scheduleOnce(() => {
            if (this.bodySprite && this.bodySprite.node.isValid) {
                this.bodySprite.color = Color.WHITE;
            }
        }, 0.08);
    }

    private _drawFill(ratio: number): void {
        if (!this.hpFill) return;
        const graphics = this.hpFill.getComponent(Graphics);
        if (!graphics) return;
        graphics.clear();
        graphics.fillColor = ratio > 0.35 ? new Color(85, 220, 105, 230) : new Color(245, 170, 60, 230);
        graphics.rect(-this._hpBarWidth / 2, -this._hpBarHeight / 2, this._hpBarWidth * ratio, this._hpBarHeight);
        graphics.fill();
    }
}
