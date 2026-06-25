/**
 * UpgradeUI - 强化房 UI
 * 3 选 1 能力选择
 * 选项池确保连续 3 局不出现完全相同的组合
 */

import { _decorator, Component, Node, Button, Label } from 'cc';
import { eventBus } from '../core/EventBus';
import { MathUtils } from '../utils/MathUtils';

const { ccclass, property } = _decorator;

export interface UpgradeOption {
    id: string;
    name: string;
    description: string;
    type: 'ability' | 'stat' | 'relic';
    rarity: 'common' | 'rare' | 'epic';
}

@ccclass('UpgradeUI')
export class UpgradeUI extends Component {
    @property(Node)
    panelNode: Node | null = null;
    @property(Node)
    option1: Node | null = null;
    @property(Node)
    option2: Node | null = null;
    @property(Node)
    option3: Node | null = null;

    private _options: UpgradeOption[] = [];
    private _globalHistory: string[][] = [];  // 历史选项组合 ID 列表

    onLoad(): void {
        eventBus.on('room:upgrade', this._onEnterUpgradeRoom, this);
        this.node.active = false;
    }

    onDestroy(): void {
        eventBus.offTarget(this);
    }

    private _onEnterUpgradeRoom(roomId: number): void {
        this._generateOptions();
        this._showPanel();
    }

    /** 生成 3 个不同选项 */
    private _generateOptions(): void {
        const allOptions = this._getAllOptions();

        // 避免连续相同组合：排除上一次的 3 个选项 ID
        const excluded = this._globalHistory.length > 0
            ? this._globalHistory[this._globalHistory.length - 1]
            : [];

        const available = allOptions.filter(o => !excluded.includes(o.id));
        const pool = available.length >= 3 ? available : allOptions;
        const picked = MathUtils.randomPickN(pool, 3);

        // 确保 3 个不同类型
        if (picked.length < 3) {
            // 兜底：直接用所有选项
            this._options = MathUtils.randomPickN(allOptions, 3);
        } else {
            this._options = picked;
        }

        // 记录历史（最多保留 3 局）
        this._globalHistory.push(this._options.map(o => o.id));
        if (this._globalHistory.length > 3) {
            this._globalHistory.shift();
        }
    }

    /** 获取所有可选的强化选项 */
    private _getAllOptions(): UpgradeOption[] {
        return [
            // ======== 核心能力 (12 种) ========
            { id: 'double_strike', name: '二段斩', description: '普通攻击有 30% 概率触发第二次攻击', type: 'ability', rarity: 'rare' },
            { id: 'shadow_step', name: '穿影', description: '翻滚后下次攻击必定暴击', type: 'ability', rarity: 'rare' },
            { id: 'war_cry', name: '怒吼', description: '进入战斗时周围怪物 2 秒减速 50%', type: 'ability', rarity: 'common' },
            { id: 'whirlwind', name: '旋风斩', description: '攻击时有 15% 概率对周围 1 格范围造成伤害', type: 'ability', rarity: 'epic' },
            { id: 'life_steal', name: '吸血', description: '每次造成伤害恢复伤害值 10% 的 HP', type: 'ability', rarity: 'rare' },
            { id: 'frost_armor', name: '冰甲', description: '被攻击时有 20% 概率冻结攻击者 1 秒', type: 'ability', rarity: 'rare' },
            { id: 'fire_aura', name: '火焰光环', description: '每秒对周围 1 格敌人造成 3 点火属性伤害', type: 'ability', rarity: 'epic' },
            { id: 'chain_lightning', name: '闪电链', description: '攻击时有 10% 概率弹射到相邻敌人', type: 'ability', rarity: 'epic' },
            { id: 'poison_blade', name: '淬毒', description: '攻击附带中毒效果，3 秒内造成 12 点毒伤害', type: 'ability', rarity: 'common' },
            { id: 'holy_shield', name: '圣盾', description: '每 10 秒获得一次伤害免疫', type: 'ability', rarity: 'epic' },
            { id: 'shadow_cloak', name: '暗影斗篷', description: '脱离战斗后 3 秒隐身，下次攻击额外造成 50% 伤害', type: 'ability', rarity: 'rare' },
            { id: 'time_warp', name: '时序加速', description: '每次击杀敌人后 2 秒内攻速提升 30%', type: 'ability', rarity: 'rare' },

            // ======== 属性取舍 (7 种) ========
            { id: 'atk_up', name: '+ATK -HP', description: '攻击 +3，最大生命 -15', type: 'stat', rarity: 'common' },
            { id: 'def_up', name: '+DEF -SPD', description: '防御 +2，移动速度 -10%', type: 'stat', rarity: 'common' },
            { id: 'hp_up', name: '+HP -ATK', description: '最大生命 +25，攻击 -2', type: 'stat', rarity: 'common' },
            { id: 'crit_up', name: '+暴击 -DEF', description: '暴击率 +5%，防御 -1', type: 'stat', rarity: 'common' },
            { id: 'spd_up', name: '+速度 -HP', description: '移动速度 +15%，最大生命 -10', type: 'stat', rarity: 'common' },
            { id: 'range_up', name: '+攻击范围', description: '攻击范围 +0.5 格', type: 'stat', rarity: 'rare' },
            { id: 'atk_spd_up', name: '+攻速', description: '攻击间隔 -0.15 秒', type: 'stat', rarity: 'rare' },

            // ======== 遗物 (16 种 - 简要版) ========
            { id: 'thorn_armor', name: '荆棘甲', description: '受到伤害时反弹 20% 伤害给攻击者', type: 'relic', rarity: 'rare' },
            { id: 'lucky_coin', name: '幸运币', description: '怪物掉落概率 +10%', type: 'relic', rarity: 'rare' },
            { id: 'berserk_axe', name: '狂战斧', description: 'HP 低于 30% 时攻击力翻倍', type: 'relic', rarity: 'epic' },
            { id: 'immortal_stone', name: '不朽石', description: '死亡时满血复活一次（每局一次）', type: 'relic', rarity: 'epic' },
            { id: 'echo_orb', name: '回响之珠', description: '技能 CD 减少 20%', type: 'relic', rarity: 'rare' },
            { id: 'haste_gloves', name: '急速手套', description: '攻击间隔 -0.2 秒', type: 'relic', rarity: 'rare' },
            { id: 'iron_armor', name: '铁甲', description: '受到的伤害 -2', type: 'relic', rarity: 'common' },
        ];
    }

    private _showPanel(): void {
        if (!this.panelNode) return;
        this.panelNode.active = true;

        const optionNodes = [this.option1, this.option2, this.option3];
        for (let i = 0; i < optionNodes.length && i < this._options.length; i++) {
            this._setupOptionButton(optionNodes[i], this._options[i]);
        }
    }

    private _setupOptionButton(btnNode: Node | null, option: UpgradeOption): void {
        if (!btnNode) return;

        const label = btnNode.getComponentInChildren(Label);
        if (label) {
            label.string = `${option.name}\n${option.description}`;
        }

        // 绑定点击事件（按钮本身）
        const button = btnNode.getComponent(Button);
        if (button) {
            // 使用 clickEvents 或代码绑定
            btnNode.off(Node.EventType.TOUCH_END);
            btnNode.on(Node.EventType.TOUCH_END, () => {
                this._onSelectOption(option);
            }, this);
        }
    }

    private _onSelectOption(option: UpgradeOption): void {
        eventBus.emit('upgrade:selected', option);
        this._hidePanel();
    }

    private _hidePanel(): void {
        if (this.panelNode) {
            this.panelNode.active = false;
        }
        eventBus.emit('room:upgrade_complete');
    }
}
