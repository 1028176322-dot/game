/**
 * AutoSetup - 一次性场景配置脚本
 * 创建 dungeon 场景中所有节点并挂载脚本
 * 运行一次后删除此脚本和 AutoSetup 节点
 *
 * 用法：在编辑器中将此脚本拖到 Canvas 节点下的空节点
 * 编辑器会在编译完成后自动执行
 */

import {
    _decorator, Component, Node, Canvas, director,
    UITransform, Sprite, Button, Label, ProgressBar,
    Vec3, Color, game, CC_EDITOR
} from 'cc';

import { DungeonSceneController } from './DungeonSceneController';
import { GridManager } from './dungeon/GridManager';
import { PlayerController } from './battle/PlayerController';
import { AutoAttack } from './battle/AutoAttack';
import { VirtualJoystick } from './ui/VirtualJoystick';
import { BattleManager } from './battle/BattleManager';
import { DungeonManager } from './dungeon/DungeonManager';
import { BattleHUD } from './ui/BattleHUD';
import { SkillUI } from './ui/SkillUI';
import { DungeonMapUI } from './ui/DungeonMapUI';
import { UpgradeUI } from './ui/UpgradeUI';
import { DeathUI } from './ui/DeathUI';

const { ccclass, executeInEditMode } = _decorator;

interface SetupAction {
    name: string;
    setup: () => void;
}

@ccclass('AutoSetup')
@executeInEditMode
export class AutoSetup extends Component {
    private _done: boolean = false;

    onLoad() {
        if (!CC_EDITOR) return;
        if (this._done) return;
        this._done = true;

        // 延迟一帧执行，确保编译完成
        setTimeout(() => this._run(), 100);
    }

    private _run() {
        console.log('[AutoSetup] 开始配置 dungeon 场景...');

        // 获取 Canvas
        let canvas = this.node.getComponent(Canvas);
        if (!canvas) {
            // 如果不在 Canvas 下，找父级
            let parent = this.node.parent;
            while (parent) {
                canvas = parent.getComponent(Canvas);
                if (canvas) break;
                parent = parent.parent;
            }
        }
        if (!canvas) {
            console.warn('[AutoSetup] 找不到 Canvas，请在 Canvas 节点下挂载此脚本');
            return;
        }

        const actions: SetupAction[] = [
            { name: 'DungeonSceneController', setup: () => this._addComp(this.node, DungeonSceneController) },
            { name: 'GridManager', setup: () => this._createChild('GridManager', GridManager) },
            { name: 'Player', setup: () => {
                const n = this._createChild('Player');
                n.addComponent(PlayerController);
                n.addComponent(AutoAttack);
            }},
            { name: 'VirtualJoystick', setup: () => {
                const n = this._createChild('VirtualJoystick', VirtualJoystick);
                this._createJoystickParts(n);
            }},
            { name: 'BattleManager', setup: () => this._createChild('BattleManager', BattleManager) },
            { name: 'DungeonManager', setup: () => this._createChild('DungeonManager', DungeonManager) },
            { name: 'BattleHUD', setup: () => {
                const n = this._createChild('BattleHUD', BattleHUD);
                this._createHUDParts(n);
            }},
            { name: 'SkillUI', setup: () => {
                const n = this._createChild('SkillUI', SkillUI);
                this._createSkillSlots(n);
            }},
            { name: 'DungeonMapUI', setup: () => this._createChild('DungeonMapUI', DungeonMapUI) },
            { name: 'UpgradeUI', setup: () => this._createChild('UpgradeUI', UpgradeUI) },
            { name: 'DeathUI', setup: () => {
                const n = this._createChild('DeathUI', DeathUI);
                this._createDeathParts(n);
            }},
        ];

        for (const action of actions) {
            if (this.node.getChildByName(action.name)) {
                console.log(`[AutoSetup] 节点 "${action.name}" 已存在，跳过`);
                continue;
            }
            action.setup();
            console.log(`[AutoSetup] ✅ 创建: ${action.name}`);
        }

        console.log('[AutoSetup] 🎉 所有节点和组件创建完成！');
        console.log('[AutoSetup] 请删除 AutoSetup.ts 脚本和 AutoSetup 节点');
    }

    private _addComp<T extends Component>(node: Node, type: { new(): T }): T {
        return node.addComponent(type);
    }

    private _createChild(name: string): Node;
    private _createChild<T extends Component>(name: string, compType: { new(): T }): T;
    private _createChild(name: string, compType?: any): any {
        const node = new Node(name);
        node.parent = this.node;
        if (compType) {
            return node.addComponent(compType);
        }
        return node;
    }

    private _createJoystickParts(root: Node) {
        const bg = new Node('JoystickBg');
        bg.parent = root;
        bg.setPosition(-250, -400, 0);
        const bgUI = bg.addComponent(UITransform);
        bgUI.setContentSize(120, 120);
        const bgSp = bg.addComponent(Sprite);
        bgSp.color = new Color(255, 255, 255, 100);

        const thumb = new Node('JoystickThumb');
        thumb.parent = root;
        thumb.setPosition(-250, -400, 0);
        const thUI = thumb.addComponent(UITransform);
        thUI.setContentSize(50, 50);
        const thSp = thumb.addComponent(Sprite);
        thSp.color = new Color(200, 200, 200, 180);
    }

    private _createHUDParts(root: Node) {
        // HP Bar
        const hpBar = new Node('HPBar');
        hpBar.parent = root;
        hpBar.setPosition(0, 600, 0);
        const barUI = hpBar.addComponent(UITransform);
        barUI.setContentSize(200, 20);
        const barPB = hpBar.addComponent(ProgressBar);
        barPB.progress = 1;
        const barSp = hpBar.addComponent(Sprite);
        barSp.color = new Color(255, 80, 80);

        // HP Label
        const hpLbl = new Node('HPLabel');
        hpLbl.parent = root;
        hpLbl.setPosition(0, 575, 0);
        const lblUI = hpLbl.addComponent(UITransform);
        lblUI.setContentSize(200, 30);
        const lbl = hpLbl.addComponent(Label);
        lbl.string = '100/100';
        lbl.fontSize = 16;
    }

    private _createSkillSlots(root: Node) {
        const slots = ['ActiveLeftBtn', 'ActiveRightBtn', 'RelicLeftBtn', 'RelicRightBtn'];
        const positions: [number, number][] = [[-300, -400], [-200, -400], [200, -400], [300, -400]];

        slots.forEach((name, i) => {
            const btn = new Node(name);
            btn.parent = root;
            btn.setPosition(positions[i][0], positions[i][1], 0);
            const ui = btn.addComponent(UITransform);
            ui.setContentSize(60, 60);
            const sp = btn.addComponent(Sprite);
            sp.color = i < 2 ? new Color(80, 80, 230) : new Color(255, 200, 0);
            btn.addComponent(Button);

            // Relic 槽位默认隐藏
            if (i >= 2) btn.active = false;
        });
    }

    private _createDeathParts(root: Node) {
        // 觉悟战面板
        const awaken = new Node('AwakenPanel');
        awaken.parent = root;
        awaken.active = false;

        // 复活按钮
        this._createBtn('ReviveButton', awaken, -80, -50);
        // 结算按钮
        this._createBtn('SettleButton', awaken, 80, -50);

        // 结算面板
        const settle = new Node('SettlementPanel');
        settle.parent = root;
        settle.active = false;

        // 标签
        const infos = [
            ['FloorLabel', '到达层数: 0', 50],
            ['KillLabel', '击杀数: 0', 10],
            ['SoulStoneLabel', '魂石: 0', -30],
        ];
        for (const [name, text, y] of infos) {
            const lbl = new Node(name as string);
            lbl.parent = settle;
            lbl.setPosition(0, y as number, 0);
            const ui = lbl.addComponent(UITransform);
            ui.setContentSize(200, 30);
            const l = lbl.addComponent(Label);
            l.string = text as string;
            l.fontSize = 24;
        }

        // 回到地面按钮
        this._createBtn('BackToMainBtn', settle, 0, -100);
    }

    private _createBtn(name: string, parent: Node, x: number, y: number) {
        const btn = new Node(name);
        btn.parent = parent;
        btn.setPosition(x, y, 0);
        const ui = btn.addComponent(UITransform);
        ui.setContentSize(120, 50);
        btn.addComponent(Sprite);
        btn.addComponent(Button);
    }
}
