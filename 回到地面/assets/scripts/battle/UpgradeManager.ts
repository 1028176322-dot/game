/**
 * UpgradeManager - 强化效果管理器
 * 
 * 监听 upgrade:selected 事件，根据选项类型(ability/stat/relic)
 * 将效果应用到 PlayerStats、SkillSystem、AutoAttack
 * 
 * M2.1 核心：12 能力 + 7 取舍 + 16 遗物的效果实现
 */

import { _decorator, Component, Node, Vec3 } from 'cc';
import { GameConfig } from '../core/GameConfig';
import { eventBus } from '../core/EventBus';
import { GameManager, GameEvent } from '../core/GameManager';
import { PlayerStats, RuntimeStats } from './PlayerStats';
import { IPlayerAgent } from './IPlayerAgent';
import { SkillSystem, SkillSlot, SkillData } from './SkillSystem';
import { AutoAttack, AttackResult } from './AutoAttack';
import { MathUtils } from '../utils/MathUtils';
import { MonsterController } from './MonsterController';
import { BattleManager } from './BattleManager';

const { ccclass, property } = _decorator;

export interface StatModRequest {
    source: string;
    stat: keyof RuntimeStats;
    value: number;
    type: 'flat' | 'percent';
    duration?: number;
}

@ccclass('UpgradeManager')
export class UpgradeManager extends Component {
    private _player: IPlayerAgent | null = null;
    private _skillSystem: SkillSystem | null = null;
    private _autoAttack: AutoAttack | null = null;
    private _battleManager: BattleManager | null = null;

    // ======== 运行时状态 ========
    /** 穿影: 翻滚后下次攻击必暴 */
    private _shadowStepReady: boolean = false;
    /** 圣盾: 免疫倒计时 */
    private _holyShieldTimer: number = 10;
    /** 圣盾: 是否可挡 */
    private _holyShieldReady: boolean = true;
    /** 时序加速: 击杀后计时 */
    private _timeWarpTimer: number = 0;
    /** 暗影斗篷: 脱离战斗计时 */
    private _shadowCloakTimer: number = 0;
    private _shadowCloakBonus: boolean = false;
    /** 不朽石: 是否用过 */
    private _immortalStoneUsed: boolean = false;
    /** 狂战斧: 低血是否激活 */
    private _berserkActive: boolean = false;
    // 活跃能力标记（bitmask 避免重复应用）
    private _activeAbilities: Set<string> = new Set();
    private _activeRelics: Set<string> = new Set();

    init(player: IPlayerAgent, skillSystem: SkillSystem, autoAttack: AutoAttack, battleManager: BattleManager): void {
        this._player = player;
        this._skillSystem = skillSystem;
        this._autoAttack = autoAttack;
        this._battleManager = battleManager;
    }

    onLoad(): void {
        eventBus.on('upgrade:selected', this._applyUpgrade, this);
        eventBus.on('monster:death', this._onMonsterDeath, this);
        eventBus.on('battle:started', this._onBattleStart, this);
        eventBus.on('floor:changed', this._onFloorChanged, this);
        eventBus.on('player:damaged', this._onPlayerDamaged, this);
    }

    onDestroy(): void {
        eventBus.offTarget(this);
    }

    /** 重置运行状态（新地牢） */
    resetRun(): void {
        this._activeAbilities.clear();
        this._activeRelics.clear();
        this._shadowStepReady = false;
        this._holyShieldTimer = 10;
        this._holyShieldReady = true;
        this._timeWarpTimer = 0;
        this._shadowCloakTimer = 0;
        this._shadowCloakBonus = false;
        this._immortalStoneUsed = false;
        this._berserkActive = false;
        // 清除所有修饰符
        if (this._player) {
            this._player.stats.clearAll();
        }
}

    // ======== 主入口 ========

    private _applyUpgrade(option: { id: string; type: 'ability' | 'stat' | 'relic' }): void {
        if (!this._player) return;

        switch (option.type) {
            case 'ability':
                if (this._activeAbilities.has(option.id)) return;
                this._activeAbilities.add(option.id);
                this._applyAbility(option.id);
                break;
            case 'stat':
                this._applyStatTrade(option.id);
                break;
            case 'relic':
                if (this._activeRelics.has(option.id)) return;
                this._activeRelics.add(option.id);
                this._applyRelic(option.id);
                break;
        }
    }

    // ======== 能力效果 (12种) ========

    private _applyAbility(id: string): void {
        const s = this._player!.stats;
        switch (id) {
            case 'double_strike':
                eventBus.on('attack:performed', this._onDoubleStrike, this);
                break;
            case 'shadow_step':
                eventBus.on('player:dodged', this._onShadowStepReady, this);
                // 设置预攻击钩子
                if (this._autoAttack) {
                    this._autoAttack.onBeforeAttack = () => {
                        if (this._shadowStepReady) {
                            this._shadowStepReady = false;
                            return { forceCrit: true };
                        }
                        return { forceCrit: false };
                    };
                }
                break;
            case 'war_cry':
                // 战斗开始时减速周围怪物，在 _onBattleStart 处理
                break;
            case 'whirlwind':
                eventBus.on('attack:performed', this._onWhirlwind, this);
                break;
            case 'life_steal':
                s.applyModifier({ source: 'ability:life_steal', stat: 'lifeSteal', value: 0.1, type: 'flat', duration: 0 });
                break;
            case 'frost_armor':
                // 被攻击时冻结，在 _onPlayerDamaged 处理
                break;
            case 'fire_aura':
                // 每帧检查，用 update 处理
                this._activeAbilities.add('fire_aura_active');
                break;
            case 'chain_lightning':
                eventBus.on('attack:performed', this._onChainLightning, this);
                break;
            case 'poison_blade':
                eventBus.on('attack:performed', this._onPoisonBlade, this);
                break;
            case 'holy_shield':
                this._holyShieldReady = true;
                this._holyShieldTimer = 10;
                break;
            case 'shadow_cloak':
                this._shadowCloakTimer = 3;
                break;
            case 'time_warp':
                // 击杀触发，在 _onMonsterDeath 处理
                break;
        }
    }

    /** 二段斩: 30% 概率第二次攻击 (50%伤害) */
    private _onDoubleStrike(result: AttackResult): void {
        if (!this._player || !this._battleManager || result.target.isDead) return;
        if (!MathUtils.chance(0.3)) return;

        const finalStats = this._player.stats.getFinalStats();
        const secondDmg = Math.max(GameConfig.MIN_DAMAGE, Math.floor(finalStats.atk * 0.5));
        const killed = result.target.takeDamage(secondDmg, false);
        eventBus.emit('attack:double_strike', result.target.node.getPosition(), secondDmg);

        if (killed) {
            this._battleManager.removeMonster(result.target);
        }
    }

    /** 穿影: 翻滚后标记 */
    private _onShadowStepReady(): void {
        this._shadowStepReady = true;
    }

    /** 战吼: 进入战斗时减速周围怪物 */
    private _onWarCry(): void {
        if (!this._battleManager) return;
        const monsters = this._battleManager.getAllMonsters();
        for (const m of monsters) {
            // 减速 50%，持续 2 秒 — 通过事件让怪物监听
            eventBus.emit('monster:slow', m, 0.5, 2);
        }
    }

    /** 旋风斩: 15% 概率范围伤害 */
    private _onWhirlwind(result: AttackResult): void {
        if (!this._player || !this._battleManager || !MathUtils.chance(0.15)) return;
        const pos = result.target.node.getPosition();
        const monsters = this._battleManager.getAllMonsters();
        const atk = this._player.stats.getFinalStats().atk;
        const aoeDmg = Math.max(GameConfig.MIN_DAMAGE, Math.floor(atk * 0.6));

        for (const m of monsters) {
            if (m === result.target || m.isDead) continue;
            const dist = MathUtils.euclideanDistance(
                pos.x, pos.y,
                m.node.getPosition().x, m.node.getPosition().y
            );
            if (dist <= GameConfig.TILE_SIZE * 1.5) {
                const killed = m.takeDamage(aoeDmg, false);
                if (killed) this._battleManager!.removeMonster(m);
            }
        }
        eventBus.emit('attack:whirlwind', pos);
    }

    /** 闪电链: 10% 概率弹射相邻敌人 */
    private _onChainLightning(result: AttackResult): void {
        if (!this._player || !this._battleManager || !MathUtils.chance(0.1)) return;
        const pos = result.target.node.getPosition();
        const monsters = this._battleManager.getAllMonsters();
        const atk = this._player.stats.getFinalStats().atk;
        const chainDmg = Math.max(GameConfig.MIN_DAMAGE, Math.floor(atk * 0.5));

        // 找最近的另一个敌人
        let nearestDist = Infinity;
        let nearest: MonsterController | null = null;
        for (const m of monsters) {
            if (m === result.target || m.isDead) continue;
            const d = MathUtils.euclideanDistance(pos.x, pos.y, m.node.getPosition().x, m.node.getPosition().y);
            if (d < nearestDist) {
                nearestDist = d;
                nearest = m;
            }
        }
        if (nearest && nearestDist <= GameConfig.TILE_SIZE * 2.5) {
            const killed = nearest.takeDamage(chainDmg, false);
            if (killed) this._battleManager!.removeMonster(nearest);
            eventBus.emit('attack:chain_lightning', nearest.node.getPosition(), chainDmg);
        }
    }

    /** 淬毒: 攻击附带 3 秒毒伤 (12 点) */
    private _onPoisonBlade(result: AttackResult): void {
        eventBus.emit('monster:poison', result.target, 4, 3); // 每秒 4 点，持续 3 秒
    }

    /** 被攻击处理 */
    private _onPlayerDamaged(damage: number, isCrit: boolean): void {
        if (!this._player) return;

        // 冰甲: 20% 概率冻结攻击者
        if (this._activeAbilities.has('frost_armor') && MathUtils.chance(0.2)) {
            eventBus.emit('player:freeze_attacker');
        }

        // 圣盾: 免疫一次
        if (this._activeAbilities.has('holy_shield') && this._holyShieldReady) {
            this._holyShieldReady = false;
            this._holyShieldTimer = 10;
            this._player.heal(damage); // 回退伤害
            eventBus.emit('player:holy_shield_blocked');
        }

        // 荆棘甲: 反弹 20%
        if (this._activeRelics.has('thorn_armor')) {
            eventBus.emit('monster:reflect_damage', Math.floor(damage * 0.2));
        }
    }

    /** 击杀处理 */
    private _onMonsterDeath(gridX: number, gridY: number, exp: number): void {
        // 时序加速: 击杀后 2 秒 +30% 攻速
        if (this._activeAbilities.has('time_warp') && this._player) {
            this._player.stats.applyModifier({
                source: 'buff:time_warp',
                stat: 'atkSpeed',
                value: -0.2,  // 攻速间隔减少 0.2 （负值 = 更快）
                type: 'flat',
                duration: 2,
            });
            this._timeWarpTimer = 2;
        }
    }

    /** 战斗开始 */
    private _onBattleStart(): void {
        // 战吼
        if (this._activeAbilities.has('war_cry')) {
            this._onWarCry();
        }
    }

    /** 换层处理 */
    private _onFloorChanged(floor: number): void {
        // 治疗之泉: 每层回复 25% HP
        if (this._activeRelics.has('heal_spring') && this._player) {
            const maxHP = this._player.stats.getFinalStats().maxHP;
            this._player.heal(Math.floor(maxHP * 0.25));
        }
    }

    // ======== 属性取舍 (7种) ========

    private _applyStatTrade(id: string): void {
        const s = this._player!.stats;
        switch (id) {
            case 'atk_up':
                s.applyModifier({ source: 'stat:atk_up_atk', stat: 'atk', value: 3, type: 'flat', duration: 0 });
                s.applyModifier({ source: 'stat:atk_up_hp', stat: 'maxHP', value: -15, type: 'flat', duration: 0 });
                break;
            case 'def_up':
                s.applyModifier({ source: 'stat:def_up_def', stat: 'def', value: 2, type: 'flat', duration: 0 });
                s.applyModifier({ source: 'stat:def_up_spd', stat: 'moveSpeed', value: -0.1, type: 'percent', duration: 0 });
                break;
            case 'hp_up':
                s.applyModifier({ source: 'stat:hp_up_hp', stat: 'maxHP', value: 25, type: 'flat', duration: 0 });
                s.applyModifier({ source: 'stat:hp_up_atk', stat: 'atk', value: -2, type: 'flat', duration: 0 });
                break;
            case 'crit_up':
                s.applyModifier({ source: 'stat:crit_up_crit', stat: 'critChance', value: 0.05, type: 'flat', duration: 0 });
                s.applyModifier({ source: 'stat:crit_up_def', stat: 'def', value: -1, type: 'flat', duration: 0 });
                break;
            case 'spd_up':
                s.applyModifier({ source: 'stat:spd_up_spd', stat: 'moveSpeed', value: 0.15, type: 'percent', duration: 0 });
                s.applyModifier({ source: 'stat:spd_up_hp', stat: 'maxHP', value: -10, type: 'flat', duration: 0 });
                break;
            case 'range_up':
                s.applyModifier({ source: 'stat:range_up', stat: 'attackRange', value: 0.5, type: 'flat', duration: 0 });
                break;
            case 'atk_spd_up':
                s.applyModifier({ source: 'stat:atk_spd_up', stat: 'atkSpeed', value: -0.15, type: 'flat', duration: 0 });
                break;
        }
    }

    // ======== 遗物效果 (16种) ========

    private _applyRelic(id: string): void {
        const s = this._player!.stats;
        switch (id) {
            // --- 现有 7 种 ---
            case 'thorn_armor': // 荆棘甲: 被攻击反弹，在 _onPlayerDamaged 处理
                break;
            case 'lucky_coin': // 幸运币: +10% 掉落，通过事件总线传递
                eventBus.emit('relic:drop_rate', 0.1);
                break;
            case 'berserk_axe': // 狂战斧: HP<30% 攻击翻倍，每帧检查
                this._activeRelics.add('berserk_axe_check');
                break;
            case 'immortal_stone': // 不朽石: 复活一次
                eventBus.on('game:gameOver', this._onImmortalStone, this);
                break;
            case 'echo_orb': // 回响之珠: -20% 技能 CD
                eventBus.emit('relic:cd_reduce', 0.2);
                break;
            case 'haste_gloves': // 急速手套: -0.2s 攻速
                s.applyModifier({ source: 'relic:haste_gloves', stat: 'atkSpeed', value: -0.2, type: 'flat', duration: 0 });
                break;
            case 'iron_armor': // 铁甲: -2 受伤
                s.applyModifier({ source: 'relic:iron_armor', stat: 'damageReduction', value: 0.05, type: 'flat', duration: 0 });
                break;

            // --- 新增 9 种 ---
            case 'life_gem': // 生命宝石: +25% maxHP
                s.applyModifier({ source: 'relic:life_gem', stat: 'maxHP', value: 0.25, type: 'percent', duration: 0 });
                // 立即补血
                this._player!.heal(Math.floor(s.getFinalStats().maxHP * 0.25));
                break;
            case 'power_gem': // 力量宝石: +5 ATK
                s.applyModifier({ source: 'relic:power_gem', stat: 'atk', value: 5, type: 'flat', duration: 0 });
                break;
            case 'guard_gem': // 防御宝石: +3 DEF
                s.applyModifier({ source: 'relic:guard_gem', stat: 'def', value: 3, type: 'flat', duration: 0 });
                break;
            case 'swift_gem': // 迅捷宝石: +15% 移速
                s.applyModifier({ source: 'relic:swift_gem', stat: 'moveSpeed', value: 0.15, type: 'percent', duration: 0 });
                break;
            case 'crit_gem': // 暴击宝石: +5% 暴击
                s.applyModifier({ source: 'relic:crit_gem', stat: 'critChance', value: 0.05, type: 'flat', duration: 0 });
                break;
            case 'crit_dmg_gem': // 暴伤宝石: +25% 暴击伤害
                s.applyModifier({ source: 'relic:crit_dmg_gem', stat: 'critMultiplier', value: 0.25, type: 'flat', duration: 0 });
                break;
            case 'explore_map': // 探险家地图: 地图全开
                eventBus.emit('relic:reveal_map');
                break;
            case 'heal_spring': // 治疗之泉: 每层回复 25% HP，在 _onFloorChanged 处理
                break;

            // --- 主动遗物 (8种, 装备到遗物槽位) ---
            case 'flame_ring':
                this._equipRelicSkill('flame_ring', '烈焰指环', 8, false,
                    () => this._castFlameRing());
                break;
            case 'lightning_totem':
                this._equipRelicSkill('lightning_totem', '闪电图腾', 12, false,
                    () => this._castLightningTotem());
                break;
            case 'ice_prison':
                this._equipRelicSkill('ice_prison', '冰霜牢笼', 10, false,
                    () => this._castIcePrison());
                break;
            case 'poison_cloud':
                this._equipRelicSkill('poison_cloud', '毒雾术', 10, false,
                    () => this._castPoisonCloud());
                break;
            case 'holy_light':
                this._equipRelicSkill('holy_light', '圣光术', 15, false,
                    () => this._castHolyLight());
                break;
            case 'shadow_blink':
                this._equipRelicSkill('shadow_blink', '暗影闪烁', 12, false,
                    () => this._castShadowBlink());
                break;
            case 'rage_potion':
                this._equipRelicSkill('rage_potion', '狂暴药剂', 15, false,
                    () => this._castRagePotion());
                break;
            case 'time_freeze':
                this._equipRelicSkill('time_freeze', '时间冻结', 20, false,
                    () => this._castTimeFreeze());
                break;
        }
    }

    // ======== 不朽石复活 ========

    private _onImmortalStone(): void {
        if (this._immortalStoneUsed || !this._player) return;
        this._immortalStoneUsed = true;
        eventBus.off('game:gameOver', this._onImmortalStone, this);
        // 满血复活
        const maxHP = this._player.stats.getFinalStats().maxHP;
        this._player.heal(maxHP);
        eventBus.emit('player:immortal_resurrect');
        // 重新监听
        eventBus.on('game:gameOver', this._onImmortalStone, this);
    }

    // ======== 主动遗物技能 ========

    /** 装备遗物技能到空闲的遗物槽位 */
    private _equipRelicSkill(
        id: string, name: string, cd: number, isRelic: boolean,
        castFn: () => void
    ): void {
        if (!this._skillSystem) return;

        // 找空闲遗物槽位
        const slots: SkillSlot[] = [SkillSlot.RelicLeft, SkillSlot.RelicRight];
        for (const slot of slots) {
            if (!this._skillSystem.hasSkill(slot)) {
                const skillData: SkillData = {
                    id,
                    name,
                    cd,
                    duration: 0,
                    cooldownRemaining: 0,
                    isActive: true,
                    isRelic,
                };
                this._skillSystem.equipSkill(slot, skillData);
                // 注册技能释放回调（可重复使用）
                eventBus.on('skill:cast', (s: SkillSlot, skillId: string) => {
                    if (skillId === id && this.node?.isValid) {
                        castFn();
                    }
                }, this);
                return;
            }
        }
        // 槽位满了直接应用被动效果（降低CD 10% 作为补偿）
        if (this._player) {
            this._player.stats.applyModifier({
                source: `relic:${id}_fallback`,
                stat: 'atkSpeed',
                value: -0.05,
                type: 'flat',
                duration: 0,
            });
        }
    }

    /** 烈焰指环: 周围 2 格 15 火伤 */
    private _castFlameRing(): void {
        if (!this._player || !this._battleManager) return;
        const pos = this._player.node.getPosition();
        const monsters = this._battleManager.getAllMonsters();
        for (const m of monsters) {
            const d = MathUtils.euclideanDistance(pos.x, pos.y, m.node.getPosition().x, m.node.getPosition().y);
            if (d <= GameConfig.TILE_SIZE * 2) {
                const killed = m.takeDamage(15, false);
                if (killed) this._battleManager.removeMonster(m);
            }
        }
        eventBus.emit('skill:flame_ring', pos);
    }

    /** 闪电图腾: 每 1.5 秒电击最近敌人 */
    private _castLightningTotem(): void {
        if (!this._battleManager) return;
        const schedule = () => {
            const monsters = this._battleManager!.getAllMonsters();
            if (monsters.length === 0) return;
            const target = monsters[0]; // 最近的
            const killed = target.takeDamage(8, false);
            eventBus.emit('skill:lightning_totem_hit', target.node.getPosition());
            if (killed) this._battleManager!.removeMonster(target);
            // 手动调度后续攻击（最多 4 次）
        };
        // 攻击 4 次，每次间隔 1.5 秒
        for (let i = 0; i < 4; i++) {
            this.scheduleOnce(schedule, 1.5 * (i + 1));
        }
    }

    /** 冰霜牢笼: 冻结周围 1 格 2 秒 */
    private _castIcePrison(): void {
        if (!this._player || !this._battleManager) return;
        const pos = this._player.node.getPosition();
        const monsters = this._battleManager.getAllMonsters();
        for (const m of monsters) {
            const d = MathUtils.euclideanDistance(pos.x, pos.y, m.node.getPosition().x, m.node.getPosition().y);
            if (d <= GameConfig.TILE_SIZE * 1.5) {
                eventBus.emit('monster:freeze', m, 2);
            }
        }
        eventBus.emit('skill:ice_prison', pos);
    }

    /** 毒雾术: 5 秒持续伤害 */
    private _castPoisonCloud(): void {
        if (!this._player || !this._battleManager) return;
        const pos = this._player.node.getPosition();
        const monsters = this._battleManager.getAllMonsters();
        for (const m of monsters) {
            const d = MathUtils.euclideanDistance(pos.x, pos.y, m.node.getPosition().x, m.node.getPosition().y);
            if (d <= GameConfig.TILE_SIZE * 2) {
                eventBus.emit('monster:poison', m, 5, 5);
            }
        }
        eventBus.emit('skill:poison_cloud', pos);
    }

    /** 圣光术: 回复 50% HP */
    private _castHolyLight(): void {
        if (!this._player) return;
        const maxHP = this._player.stats.getFinalStats().maxHP;
        this._player.heal(Math.floor(maxHP * 0.5));
        eventBus.emit('skill:holy_light');
    }

    /** 暗影闪烁: 瞬移到安全位置 + 隐身 3 秒 */
    private _castShadowBlink(): void {
        if (!this._player || !this._battleManager) return;
        // 简单实现：随机瞬移到一个空地
        eventBus.emit('player:blink');
        this._shadowCloakTimer = 3;
        eventBus.emit('skill:shadow_blink');
    }

    /** 狂暴药剂: 5 秒 +50% 攻速 +30% 移速 */
    private _castRagePotion(): void {
        if (!this._player) return;
        const s = this._player.stats;
        s.applyModifier({ source: 'buff:rage_atk', stat: 'atkSpeed', value: -0.35, type: 'flat', duration: 5 });
        s.applyModifier({ source: 'buff:rage_spd', stat: 'moveSpeed', value: 0.3, type: 'percent', duration: 5 });
        eventBus.emit('skill:rage_potion');
    }

    /** 时间冻结: 2 秒时间减速 50% */
    private _castTimeFreeze(): void {
        eventBus.emit('skill:time_freeze', 2);
        eventBus.emit('battle:time_scale', 0.5, 2);
    }

    /** 狂战斧检查（每帧） */
    private _checkBerserkAxe(): void {
        if (!this._player) return;
        const hpPercent = this._player.currentHP / this._player.stats.getFinalStats().maxHP;
        const shouldBeActive = hpPercent < 0.3;
        if (shouldBeActive && !this._berserkActive) {
            this._player.stats.applyModifier({ source: 'relic:berserk_axe', stat: 'atk', value: 1, type: 'percent', duration: 0 });
            this._berserkActive = true;
        } else if (!shouldBeActive && this._berserkActive) {
            this._player.stats.removeModifier('relic:berserk_axe');
            this._berserkActive = false;
        }
    }

    /** 火焰光环检查（每帧） */
    private _checkFireAura(): void {
        if (!this._activeAbilities.has('fire_aura_active') || !this._player || !this._battleManager) return;
        this._auraTimer += this._auraDt;
        if (this._auraTimer < 1.0) return;
        this._auraTimer = 0;

        const pos = this._player.node.getPosition();
        const monsters = this._battleManager.getAllMonsters();
        for (const m of monsters) {
            const d = MathUtils.euclideanDistance(pos.x, pos.y, m.node.getPosition().x, m.node.getPosition().y);
            if (d <= GameConfig.TILE_SIZE * 1.5) {
                const killed = m.takeDamage(3, false);
                if (killed) this._battleManager.removeMonster(m);
            }
        }
    }
    private _auraTimer: number = 0;
    private _auraDt: number = 0;

    /** 获取当前已选择的选项ID */
    get activeAbilities(): ReadonlySet<string> { return this._activeAbilities; }
    get activeRelics(): ReadonlySet<string> { return this._activeRelics; }

    update(dt: number): void {
        this._auraDt = dt;

        // 圣盾计时
        if (this._activeAbilities.has('holy_shield') && !this._holyShieldReady) {
            this._holyShieldTimer -= dt;
            if (this._holyShieldTimer <= 0) {
                this._holyShieldReady = true;
                this._holyShieldTimer = 10;
            }
        }

        // 狂战斧检查
        if (this._activeRelics.has('berserk_axe_check')) {
            this._checkBerserkAxe();
        }

        // 火焰光环
        this._checkFireAura();

        // 暗影斗篷隐身计时
        if (this._shadowCloakTimer > 0) {
            this._shadowCloakTimer -= dt;
        }
    }
}
