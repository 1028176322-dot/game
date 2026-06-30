/**
 * MutationManager - 房间变异系统 (Phase 3, M3.4)
 * 
 * 12 种房间变异，每层随机 1~2 个
 * 变异效果绑定战斗参数（攻击/防御/速度/掉落等）
 * 互斥检查 + DDA 权重修正
 */

import { eventBus } from '../core/EventBus';
import { GameConfig } from '../core/GameConfig';
import { RunRng } from '../core/rng/RunRng';

// ======== 变异定义 ========

export interface MutationEffect {
    /** 玩家攻击修正（绝对值） */
    playerAtkMod?: number;
    /** 玩家防御修正（绝对值） */
    playerDefMod?: number;
    /** 玩家移速修正（百分比，1.0=不变） */
    playerSpeedMod?: number;
    /** 玩家攻速修正（百分比，1.0=不变） */
    playerAttackSpeed?: number;
    /** 治疗效果修正（百分比，1.0=不变） */
    playerHealEffect?: number;
    /** 吸血修正（百分比，1.0=不变） */
    playerLifesteal?: number;
    /** 怪物攻击修正（绝对值） */
    monsterAtkMod?: number;
    /** 怪物防御修正（绝对值） */
    monsterDefMod?: number;
    /** 怪物 HP 修正（百分比，1.0=不变） */
    monsterHpMod?: number;
    /** 怪物速度修正（百分比，1.0=不变） */
    monsterSpeedMod?: number;
    /** 技能 CD 修正（百分比，1.0=不变，0.8=CD-20%） */
    skillCdMod?: number;
    /** 金币掉落修正（百分比，1.0=不变） */
    goldDropMod?: number;
    /** 视野范围（格数） */
    visionRange?: number;
    /** 特殊效果开关 */
    elementStorm?: boolean;
    earthquake?: boolean;
    mist?: boolean;
    unstableSpace?: boolean;
    /** 倒计时（秒），0=无限制 */
    countdown?: number;
}

export interface RoomMutation {
    id: string;
    name: string;
    description: string;
    effect: MutationEffect;
    baseWeight: number;
    /** 层数修正函数 */
    floorWeightMod?: (floorNum: number) => number;
    /** DDA 修正（玩家死前层，给予利好变异） */
    ddaWeightMod?: (playerDiedRecently: boolean) => number;
    /** 利好流派描述 */
    goodFor: string;
    /** 利空流派描述 */
    badFor: string;
}

// ======== 12 种变异定义 ========

const ALL_MUTATIONS: RoomMutation[] = [
    {
        id: 'M01', name: '黑暗降临',
        description: '视野缩减至 2 格，怪物视野不变',
        effect: { visionRange: 2 },
        baseWeight: 15,
        floorWeightMod: (f) => f <= 2 ? 5 : (f >= 4 ? -5 : 0),
        goodFor: '暗影斗篷', badFor: '远程流',
    },
    {
        id: 'M02', name: '绯红之月',
        description: '治疗效果 -50%，汲取效果 ×2',
        effect: { playerHealEffect: 0.5, playerLifesteal: 2.0 },
        baseWeight: 12,
        ddaWeightMod: (died) => died ? 10 : 0,
        goodFor: '生命吸取', badFor: '药水流',
    },
    {
        id: 'M03', name: '奥术风暴',
        description: '每 3 秒全屏随机元素伤害 (3 点)',
        effect: { elementStorm: true },
        baseWeight: 10,
        floorWeightMod: (f) => f >= 4 ? 10 : 0,
        goodFor: '元素共鸣', badFor: '纯物理',
    },
    {
        id: 'M04', name: '时空扭曲',
        description: '怪物移速 -30%，玩家攻速 +20%',
        effect: { monsterSpeedMod: 0.7, playerAttackSpeed: 1.2 },
        baseWeight: 15,
        ddaWeightMod: (died) => died ? 10 : 0,
        goodFor: '所有输出流', badFor: '—',
    },
    {
        id: 'M05', name: '地震',
        description: '每 5 秒地形随机变化（障碍位移）',
        effect: { earthquake: true },
        baseWeight: 8,
        goodFor: '走位好的玩家', badFor: '依赖地形的流派',
    },
    {
        id: 'M06', name: '淘金热',
        description: '金币掉落 ×2，怪物 HP ×1.2',
        effect: { goldDropMod: 2.0, monsterHpMod: 1.2 },
        baseWeight: 12,
        floorWeightMod: (f) => f >= 4 ? 5 : 0,
        goodFor: '贪婪指环', badFor: '生存困难时不敢贪',
    },
    {
        id: 'M07', name: '虚弱诅咒',
        description: '玩家 ATK -2，每击败 1 怪永久 +1 ATK',
        effect: { playerAtkMod: -2 },
        baseWeight: 10,
        ddaWeightMod: (died) => died ? 15 : 0,
        goodFor: '滚雪球流派', badFor: '前期弱的流派',
    },
    {
        id: 'M08', name: '狂乱',
        description: '怪物 ATK+2，SPD+20%，DEF-2',
        effect: { monsterAtkMod: 2, monsterSpeedMod: 1.2, monsterDefMod: -2 },
        baseWeight: 10,
        floorWeightMod: (f) => f >= 4 ? 5 : 0,
        goodFor: '爆发型 Build', badFor: '龟缩型 Build',
    },
    {
        id: 'M09', name: '回声',
        description: '技能 CD -20%',
        effect: { skillCdMod: 0.8 },
        baseWeight: 10,
        goodFor: '技能流', badFor: '普攻流',
    },
    {
        id: 'M10', name: '薄雾',
        description: '穿过荆棘地板不扣血，移速 +10%',
        effect: { mist: true, playerSpeedMod: 1.1 },
        baseWeight: 8,
        floorWeightMod: (f) => f <= 2 ? 5 : 0,
        ddaWeightMod: (died) => died ? 10 : 0,
        goodFor: '所有流派', badFor: '—（纯利好）',
    },
    {
        id: 'M11', name: '倒计时',
        description: '该层限时 60 秒，超时后每秒扣 2 HP',
        effect: { countdown: 60 },
        baseWeight: 5,
        floorWeightMod: (f) => f >= 4 ? 10 : 0,
        goodFor: '爆发速通流', badFor: '慢性子玩家',
    },
    {
        id: 'M12', name: '不稳定空间',
        description: '每进入新房间，随机一个元素布满全场',
        effect: { unstableSpace: true },
        baseWeight: 5,
        floorWeightMod: (f) => f >= 4 ? 10 : 0,
        goodFor: '元素反应流', badFor: '无元素流派',
    },
];

// ======== 互斥表 ========

const MUTATION_EXCLUSIONS: [string, string][] = [
    ['M05', 'M10'], // 地震 + 薄雾 → 玩家迷失
    ['M05', 'M11'], // 倒计时 + 地震 → 无法规划路线
];

export class MutationManager {
    private _activeMutations: RoomMutation[] = [];
    private _floorNumber: number = 1;
    private _playerDiedRecently: boolean = false;
    private _elementStormTimer: number = 0;
    private _countdownTimer: number = 0;
    private _countdownActive: boolean = false;

    /** 为新楼层生成变异 */
    generateMutation(floorNumber: number, playerDiedRecently: boolean = false): RoomMutation[] {
        this._floorNumber = floorNumber;
        this._playerDiedRecently = playerDiedRecently;
        this._activeMutations = [];

        // 选择第 1 个变异
        const first = this._pickMutation([]);
        if (!first) return [];

        this._activeMutations.push(first);

        // 第 2 个变异：30%~70% 概率（层数越高概率越大）
        const secondChance = floorNumber >= 5 ? 0.7 : (floorNumber >= 3 ? 0.5 : 0.3);
        const mutationRng = RunRng.instance.fork(`mutation:second:${floorNumber}`);
        if (mutationRng.chance(secondChance)) {
            const second = this._pickMutation([first.id]);
            if (second) {
                this._activeMutations.push(second);
            }
        }

        this._applyMutations();
        return this._activeMutations;
    }

    /** 按权重选取变异（排除已选的） */
    private _pickMutation(excludeIds: string[]): RoomMutation | null {
        const candidates = ALL_MUTATIONS.filter(m => !excludeIds.includes(m.id));

        // 检查互斥
        const filtered = candidates.filter(m => {
            return !this._activeMutations.some(active => {
                return MUTATION_EXCLUSIONS.some(excl =>
                    (excl[0] === m.id && excl[1] === active.id) ||
                    (excl[1] === m.id && excl[0] === active.id)
                );
            });
        });

        if (filtered.length === 0) return null;

        // 计算权重
        const weighted = filtered.map(m => {
            let weight = m.baseWeight;
            if (m.floorWeightMod) weight += m.floorWeightMod(this._floorNumber);
            if (m.ddaWeightMod) weight += m.ddaWeightMod(this._playerDiedRecently);
            return { mutation: m, weight: Math.max(1, weight) };
        });

        const totalWeight = weighted.reduce((s, w) => s + w.weight, 0);
        const rng = RunRng.instance.fork(`mutation:pick:${this._floorNumber}`);
        let roll = rng.next() * totalWeight;
        for (const w of weighted) {
            roll -= w.weight;
            if (roll <= 0) return w.mutation;
        }

        return weighted[weighted.length - 1]?.mutation ?? null;
    }

    /** 应用变异效果至战斗参数 */
    private _applyMutations(): void {
        for (const mutation of this._activeMutations) {
            const eff = mutation.effect;

            // 发送参数覆盖事件
            eventBus.emit('mutation:apply', {
                id: mutation.id,
                name: mutation.name,
                effect: eff,
            });

            // 特殊效果初始化
            if (eff.elementStorm) {
                this._elementStormTimer = 0;
            }
            if (eff.countdown && eff.countdown > 0) {
                this._countdownTimer = eff.countdown;
                this._countdownActive = true;
            }
        }

        // 通知 UI
        eventBus.emit('hud:mutations', this._activeMutations.map(m => ({
            id: m.id,
            name: m.name,
            description: m.description,
        })));
    }

    /** 每帧更新（用于奥术风暴、倒计时等持续效果） */
    update(dt: number): void {
        // 奥术风暴
        if (this._activeMutations.some(m => m.effect.elementStorm)) {
            this._elementStormTimer += dt;
            if (this._elementStormTimer >= 3.0) {
                this._elementStormTimer = 0;
                eventBus.emit('mutation:element_storm');
            }
        }

        // 倒计时
        if (this._countdownActive) {
            this._countdownTimer -= dt;
            eventBus.emit('mutation:countdown', this._countdownTimer);
            if (this._countdownTimer <= 0) {
                // 超时扣血
                eventBus.emit('mutation:countdown_damage');
                this._countdownTimer = 60; // 重置计时
            }
        }
    }

    /** 清除当前层变异 */
    clearMutations(): void {
        this._activeMutations = [];
        this._countdownActive = false;
        this._elementStormTimer = 0;
        eventBus.emit('mutation:cleared');
    }

    /** 获取当前活跃变异 */
    get activeMutations(): ReadonlyArray<RoomMutation> {
        return this._activeMutations;
    }

    /** 获取所有变异定义 */
    static getAllMutations(): RoomMutation[] {
        return [...ALL_MUTATIONS];
    }
}
