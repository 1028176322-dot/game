/**
 * ElementSystem - 元素反应系统 (M2.2)
 * 
 * 6 元素附着 + 11 种反应效果 + 链式反应(≤3 层)
 * 通过 eventBus 与 AutoAttack/MonsterController 集成
 * 
 * 工作流:
 *   attack:performed 事件 → 检查怪物已有元素 → 触发反应/附着
 *   每帧 tick → 元素衰减 + DoT 伤害
 */

import { _decorator, Component, Node, Vec3 } from 'cc';
import { ElementType } from '../core/Constants';
import { GameConfig } from '../core/GameConfig';
import { eventBus } from '../core/EventBus';
import { MonsterController } from './MonsterController';
import { AttackResult } from './AutoAttack';
import { PlayerController } from './PlayerController';
import { BattleManager } from './BattleManager';
import { MathUtils } from '../utils/MathUtils';

const { ccclass, property } = _decorator;

// ======== 元素类型工具 ========

export const ELEMENT_PAIRS: [ElementType, ElementType][] = [
    [ElementType.Fire, ElementType.Frost],
    [ElementType.Fire, ElementType.Lightning],
    [ElementType.Fire, ElementType.Poison],
    [ElementType.Fire, ElementType.Shadow],
    [ElementType.Frost, ElementType.Lightning],
    [ElementType.Frost, ElementType.Poison],
    [ElementType.Frost, ElementType.Shadow],
    [ElementType.Lightning, ElementType.Poison],
    [ElementType.Lightning, ElementType.Shadow],
    [ElementType.Poison, ElementType.Shadow],
    [ElementType.Holy, ElementType.Fire],
    [ElementType.Holy, ElementType.Frost],
    [ElementType.Holy, ElementType.Lightning],
    [ElementType.Holy, ElementType.Poison],
    [ElementType.Holy, ElementType.Shadow],
];

// ======== 元素附着状态 ========

export interface ElementStatus {
    element: ElementType;
    remainingTime: number;
    maxTime: number;
    /** 层数 (用于毒叠层) */
    stacks: number;
    /** DoT 倒计时 (秒) */
    tickTimer: number;
    /** DoT 伤害/次 */
    tickDamage: number;
    /** DoT 间隔 (秒) */
    tickInterval: number;
}

// ======== 反应配置 ========

interface ReactionConfig {
    name: string;
    description: string;
    handler: (system: ElementSystem, monster: MonsterController, pos: Vec3) => void;
}

/** 反应缓存键 (e1 < e2 排序) */
function reactionKey(e1: ElementType, e2: ElementType): string {
    return [e1, e2].sort().join('+');
}

/** 构建反应表 */
function buildReactions(): Map<string, ReactionConfig> {
    const r = new Map<string, ReactionConfig>();

    r.set(reactionKey(ElementType.Fire, ElementType.Frost), {
        name: 'Melt',
        description: '2x 伤害',
        handler: (sys, monster, pos) => {
            // 额外造成一次 100% ATK 伤害
            const extraDmg = Math.max(GameConfig.MIN_DAMAGE, Math.floor((sys._player?.stats.getFinalStats().atk ?? GameConfig.PLAYER_BASE_ATK) * 1.0));
            sys._dealReactionDamage(monster, extraDmg);
        },
    });

    r.set(reactionKey(ElementType.Fire, ElementType.Lightning), {
        name: 'Overload',
        description: 'AoE 爆炸',
        handler: (sys, monster, pos) => {
            const dmg = Math.max(GameConfig.MIN_DAMAGE, Math.floor((sys._player?.stats.getFinalStats().atk ?? GameConfig.PLAYER_BASE_ATK) * 0.8));
            // 对周围 1 格怪物造成 AoE
            sys._aoeDamage(pos, GameConfig.TILE_SIZE * 1.5, dmg, monster);
        },
    });

    r.set(reactionKey(ElementType.Fire, ElementType.Poison), {
        name: 'Burn',
        description: '3s DoT',
        handler: (sys, monster, _pos) => {
            const dmg = Math.max(GameConfig.MIN_DAMAGE, Math.floor((sys._player?.stats.getFinalStats().atk ?? GameConfig.PLAYER_BASE_ATK) * 0.15));
            sys._applyDot(monster, ElementType.Fire, dmg, 1.0, 3);
        },
    });

    r.set(reactionKey(ElementType.Fire, ElementType.Shadow), {
        name: 'Explosion',
        description: '大范围 AoE',
        handler: (sys, monster, pos) => {
            const dmg = Math.max(GameConfig.MIN_DAMAGE, Math.floor((sys._player?.stats.getFinalStats().atk ?? GameConfig.PLAYER_BASE_ATK) * 1.2));
            sys._aoeDamage(pos, GameConfig.TILE_SIZE * 3, dmg, monster);
        },
    });

    r.set(reactionKey(ElementType.Frost, ElementType.Lightning), {
        name: 'Superconduct',
        description: '-50% 防御 5s',
        handler: (_sys, monster, _pos) => {
            monster.applyDefDebuff(0.5, 5);
        },
    });

    r.set(reactionKey(ElementType.Frost, ElementType.Poison), {
        name: 'Freeze',
        description: '定身 2s',
        handler: (_sys, monster, _pos) => {
            monster.freeze(2);
        },
    });

    r.set(reactionKey(ElementType.Frost, ElementType.Shadow), {
        name: 'Brittle',
        description: '+30% 受伤 5s',
        handler: (_sys, monster, _pos) => {
            monster.applyDefDebuff(-0.3, 5); // 负值 = 增加受伤
        },
    });

    r.set(reactionKey(ElementType.Lightning, ElementType.Poison), {
        name: 'Conduct',
        description: '扩散到相邻',
        handler: (sys, monster, pos) => {
            // 给相邻怪物也随机附上 Poison
            const neighbors = sys._getNearestMonsters(pos, GameConfig.TILE_SIZE * 1.6, 2, monster);
            for (const n of neighbors) {
                if (!n.isDead) {
                    sys._attachElement(n, ElementType.Poison, 4, 0, 0, 0, 0, 1);
                }
            }
        },
    });

    r.set(reactionKey(ElementType.Lightning, ElementType.Shadow), {
        name: 'Silence',
        description: '无法攻击 3s',
        handler: (_sys, monster, _pos) => {
            monster.silence(3);
        },
    });

    r.set(reactionKey(ElementType.Poison, ElementType.Shadow), {
        name: 'Decay',
        description: '递增 DoT 5s',
        handler: (sys, monster, _pos) => {
            const baseDmg = Math.max(GameConfig.MIN_DAMAGE, Math.floor((sys._player?.stats.getFinalStats().atk ?? GameConfig.PLAYER_BASE_ATK) * 0.1));
            // 每 1 秒一跳, 伤害递增 20%
            sys._applyDot(monster, ElementType.Shadow, baseDmg, 1.0, 5, true);
        },
    });

    // Holy + any = Purify: 移除该元素 + 回复玩家
    const purgeElements = [ElementType.Fire, ElementType.Frost, ElementType.Lightning, ElementType.Poison, ElementType.Shadow];
    for (const e of purgeElements) {
        r.set(reactionKey(ElementType.Holy, e), {
            name: 'Purify',
            description: `移除 ${e}`,
            handler: (sys, monster, _pos) => {
                // 从 monster 移除该元素
                sys._removeElement(monster, e);
                // 回复玩家 5 HP
                sys._player?.heal(5);
            },
        });
    }

    return r;
}

// ======== 元素反应系统组件 ========

@ccclass('ElementSystem')
export class ElementSystem extends Component {
    private static _REACTIONS: Map<string, ReactionConfig> | null = null;

    private _player: PlayerController | null = null;
    private _monsterStatus: Map<MonsterController, ElementStatus[]> = new Map();
    private _battleManager: BattleManager | null = null;

    /** 最大链式反应深度 */
    private static readonly MAX_CHAIN_DEPTH = 3;

    init(player: PlayerController, battleManager: BattleManager): void {
        this._player = player;
        this._battleManager = battleManager;

        if (!ElementSystem._REACTIONS) {
            ElementSystem._REACTIONS = buildReactions();
        }
    }

    onLoad(): void {
        eventBus.on('attack:performed', this._onAttackPerformed, this);
    }

    onDestroy(): void {
        eventBus.offTarget(this);
        this._monsterStatus.clear();
    }

    /** 清理怪物数据（房间切换/怪物死亡时） */
    clearMonster(monster: MonsterController): void {
        this._monsterStatus.delete(monster);
    }

    /** 获取怪物的元素状态列表 */
    getMonsterElements(monster: MonsterController): ReadonlyArray<ElementStatus> {
        return this._monsterStatus.get(monster) ?? [];
    }

    /** 判断怪物是否有某元素 */
    hasElement(monster: MonsterController, element: ElementType): boolean {
        const statuses = this._monsterStatus.get(monster);
        if (!statuses) return false;
        return statuses.some(s => s.element === element);
    }

    // ======== 攻击事件处理 ========

    private _onAttackPerformed(result: AttackResult): void {
        const { target, element } = result;
        if (element === ElementType.None || element === ElementType.Physical) return;
        if (target.isDead) return;

        // 准备附着参数
        const duration = 6; // 基础附着时间
        const stacks = 1;

        // 检查并触发反应
        const triggered = this._tryTriggerReaction(target, element, target.node.getPosition(), 0);

        if (!triggered) {
            // 无反应: 附着元素
            this._attachElement(target, element, duration, stacks, 0, 0, 0, 1);
        }
    }

    /**
     * 尝试触发反应
     * @returns 是否触发了反应
     */
    private _tryTriggerReaction(
        monster: MonsterController,
        newElement: ElementType,
        pos: Vec3,
        chainDepth: number
    ): boolean {
        if (chainDepth >= ElementSystem.MAX_CHAIN_DEPTH) return false;

        const existing = this._monsterStatus.get(monster);
        if (!existing || existing.length === 0) return false;

        // 检查所有 (existing, new) 配对
        for (const status of existing) {
            if (status.element === newElement) continue; // 同元素不反应
            const key = reactionKey(status.element, newElement);
            const reaction = ElementSystem._REACTIONS?.get(key);
            if (reaction) {
                // 消耗两个参与反应的元素
                this._removeElement(monster, status.element);
                // 新元素已消耗 (不附着)

                // 执行反应效果
                console.log(`[ElementSystem] ${reaction.name}: ${status.element} + ${newElement}`);
                eventBus.emit('element:reaction', reaction.name, pos);
                reaction.handler(this, monster, pos);

                // 链式反应检测: 反应可能产生了新元素组合
                if (chainDepth + 1 < ElementSystem.MAX_CHAIN_DEPTH) {
                    const remaining = this._monsterStatus.get(monster);
                    if (remaining && remaining.length >= 2) {
                        // 检查剩余元素间能否再反应
                        for (let i = 0; i < remaining.length; i++) {
                            for (let j = i + 1; j < remaining.length; j++) {
                                const innerKey = reactionKey(remaining[i].element, remaining[j].element);
                                if (ElementSystem._REACTIONS?.has(innerKey)) {
                                    // 链式触发
                                    this._tryTriggerReaction(monster, remaining[j].element, pos, chainDepth + 1);
                                    return true;
                                }
                            }
                        }
                    }
                }
                return true;
            }
        }
        return false;
    }

    // ======== 元素附着管理 ========

    /**
     * 给怪物附着元素
     */
    private _attachElement(
        monster: MonsterController,
        element: ElementType,
        duration: number,
        stacks: number,
        tickTimer: number,
        tickDamage: number,
        tickInterval: number,
        tickStartDelay: number,
    ): void {
        if (!this._monsterStatus.has(monster)) {
            this._monsterStatus.set(monster, []);
        }
        const list = this._monsterStatus.get(monster)!;

        // 同元素叠加
        const existing = list.find(s => s.element === element);
        if (existing) {
            existing.remainingTime = Math.max(existing.remainingTime, duration);
            existing.stacks = Math.min(existing.stacks + stacks, 5);
            existing.tickDamage = Math.max(existing.tickDamage, tickDamage);
            return;
        }

        // 上限 3 种元素 (移除最旧的)
        if (list.length >= 3) {
            list.shift();
        }

        list.push({
            element,
            remainingTime: duration,
            maxTime: duration,
            stacks,
            tickTimer: tickStartDelay,
            tickDamage,
            tickInterval,
        });

        eventBus.emit('element:applied', monster, element, duration);
    }

    /** 移除指定元素 */
    private _removeElement(monster: MonsterController, element: ElementType): void {
        const list = this._monsterStatus.get(monster);
        if (!list) return;
        const idx = list.findIndex(s => s.element === element);
        if (idx >= 0) {
            list.splice(idx, 1);
            eventBus.emit('element:removed', monster, element);
            if (list.length === 0) {
                this._monsterStatus.delete(monster);
            }
        }
    }

    // ======== 反应效果实现 ========

    /** 对怪物造成反应伤害（直接生效） */
    _dealReactionDamage(monster: MonsterController, damage: number): void {
        if (monster.isDead) return;
        const killed = monster.takeDamage(damage, false);
        if (killed && this._battleManager) {
            this._battleManager.removeMonster(monster);
        }
    }

    /** 区域伤害 */
    private _aoeDamage(center: Vec3, radius: number, damage: number, exclude: MonsterController): void {
        if (!this._battleManager) return;
        const monsters = this._battleManager.getAllMonsters();
        for (const m of monsters) {
            if (m === exclude || m.isDead) continue;
            const d = MathUtils.euclideanDistance(
                center.x, center.y,
                m.node.getPosition().x, m.node.getPosition().y
            );
            if (d <= radius) {
                const killed = m.takeDamage(damage, false);
                if (killed) this._battleManager.removeMonster(m);
            }
        }
    }

    /** 应用 DoT */
    private _applyDot(
        monster: MonsterController,
        element: ElementType,
        tickDamage: number,
        tickInterval: number,
        totalDuration: number,
        rampUp: boolean = false,
    ): void {
        const numTicks = Math.ceil(totalDuration / tickInterval);
        this._attachElement(monster, element, totalDuration, 1, tickInterval, tickDamage, tickInterval, tickInterval);

        let tickCount = 0;
        const doTick = () => {
            if (monster.isDead) return;
            let dmg = tickDamage;
            if (rampUp) {
                dmg = Math.floor(tickDamage * (1 + tickCount * 0.2)); // 每次 +20%
            }
            dmg = Math.max(GameConfig.MIN_DAMAGE, dmg);
            const killed = monster.takeDamage(dmg, false);
            tickCount++;
            if (killed && this._battleManager) {
                this._battleManager.removeMonster(monster);
                return;
            }
            if (tickCount < numTicks && !monster.isDead) {
                this.scheduleOnce(doTick, tickInterval);
            }
        };
        this.scheduleOnce(doTick, tickInterval);
    }

    /** 获取附近的怪物 (排除自身) */
    private _getNearestMonsters(pos: Vec3, radius: number, maxCount: number, exclude: MonsterController): MonsterController[] {
        if (!this._battleManager) return [];
        const all = this._battleManager.getAllMonsters();
        const withinRange = all.filter(m => {
            if (m === exclude || m.isDead) return false;
            const d = MathUtils.euclideanDistance(pos.x, pos.y, m.node.getPosition().x, m.node.getPosition().y);
            return d <= radius;
        });
        return withinRange.slice(0, maxCount);
    }

    // ======== 每帧更新 ========

    update(dt: number): void {
        // 遍历怪物元素状态，衰减和 DoT
        for (const [monster, statuses] of this._monsterStatus.entries()) {
            if (monster.isDead || !monster.node.isValid) {
                this._monsterStatus.delete(monster);
                continue;
            }

            for (let i = statuses.length - 1; i >= 0; i--) {
                const s = statuses[i];

                // 元素衰减
                s.remainingTime -= dt;
                if (s.remainingTime <= 0) {
                    eventBus.emit('element:removed', monster, s.element);
                    statuses.splice(i, 1);
                    if (statuses.length === 0) {
                        this._monsterStatus.delete(monster);
                    }
                    continue;
                }

                // DoT 计时
                if (s.tickDamage > 0 && s.tickInterval > 0) {
                    s.tickTimer -= dt;
                    if (s.tickTimer <= 0) {
                        s.tickTimer = s.tickInterval;
                        const dot = s.tickDamage * s.stacks;
                        if (!monster.isDead) {
                            const killed = monster.takeDamage(dot, false);
                            eventBus.emit('element:dot_tick', monster, s.element, dot);
                            if (killed && this._battleManager) {
                                this._battleManager.removeMonster(monster);
                            }
                        }
                    }
                }
            }
        }
    }
}
