/**
 * DungeonHudLayout - 地牢 HUD 四角布局组件
 *
 * 挂载在 UIRoot 上。
 * 负责 BattleHUD（左上）、Joystick（左下）、
 * SkillUI（右下）、DungeonMapUI（右上）的定位。
 */

import { _decorator, Component, Node, view } from 'cc';

const { ccclass, property, menu } = _decorator;

@ccclass('DungeonHudLayout')
@menu('UI/DungeonHudLayout')
export class DungeonHudLayout extends Component {
    @property(Node)
    battleHUD: Node | null = null;

    @property(Node)
    joystick: Node | null = null;

    @property(Node)
    skillUI: Node | null = null;

    @property(Node)
    dungeonMapUI: Node | null = null;

    onLoad(): void {
        this.applyLayout();
        view.on('canvas-resize', this.applyLayout, this);
        view.on('design-resolution-changed', this.applyLayout, this);
    }

    onDestroy(): void {
        view.off('canvas-resize', this.applyLayout, this);
        view.off('design-resolution-changed', this.applyLayout, this);
    }

    applyLayout(): void {
        const size = view.getVisibleSize();
        const halfW = size.width / 2;
        const halfH = size.height / 2;
        const margin = 36;

        if (this.battleHUD) {
            this.battleHUD.setPosition(-halfW + margin + 120, halfH - margin - 40);
        }
        if (this.joystick) {
            this.joystick.setPosition(-halfW + margin + 120, -halfH + margin + 120);
        }
        if (this.skillUI) {
            this.skillUI.setPosition(halfW - margin - 180, -halfH + margin + 90);
        }
        if (this.dungeonMapUI) {
            this.dungeonMapUI.setPosition(halfW - margin - 180, halfH - margin - 120);
        }
    }
}
