/**
 * SkillSystem - 技能系统
 * 管理主动技能（2 槽位）和遗物技能（2 槽位）
 * 技能 CD、释放、状态管理
 * 技能按钮 UI 绑定由外部 UI 组件处理
 */

import { _decorator, Component, Node } from 'cc';
import { PlayerState } from '../core/Constants';
import { GameConfig } from '../core/GameConfig';
import { eventBus } from '../core/EventBus';
import { IPlayerAgent } from './IPlayerAgent';

const { ccclass, property } = _decorator;

export enum SkillSlot {
    ActiveLeft = 'activeLeft',
    ActiveRight = 'activeRight',
    RelicLeft = 'relicLeft',
    RelicRight = 'relicRight',
}

export interface SkillData {
    id: string;
    name: string;
    cd: number;
    duration: number;
    cooldownRemaining: number;
    isActive: boolean;
    isRelic: boolean;
    icon?: string;
}

@ccclass('SkillSystem')
export class SkillSystem extends Component {
    private _skills: Map<SkillSlot, SkillData | null> = new Map();
    private _player: IPlayerAgent | null = null;

    onLoad(): void {
        // 初始化 4 个槽位
        this._skills.set(SkillSlot.ActiveLeft, null);
        this._skills.set(SkillSlot.ActiveRight, null);
        this._skills.set(SkillSlot.RelicLeft, null);
        this._skills.set(SkillSlot.RelicRight, null);
    }

    /** 初始化 */
    init(player: IPlayerAgent): void {
        this._player = player;
        // 初始赋予 2 个基础主动技能
        this.equipSkill(SkillSlot.ActiveLeft, {
            id: 'dash', name: '冲刺冲锋', cd: 5.0, duration: 0.3,
            cooldownRemaining: 0, isActive: true, isRelic: false,
        });
        this.equipSkill(SkillSlot.ActiveRight, {
            id: 'shield', name: '护盾', cd: 6.0, duration: 2.0,
            cooldownRemaining: 0, isActive: true, isRelic: false,
        });
    }

    /** 装备技能到指定槽位 */
    equipSkill(slot: SkillSlot, skill: SkillData): void {
        this._skills.set(slot, skill);
        eventBus.emit('skill:equipped', slot, skill);
    }

    /** 移除技能（遗物丢失时调用） */
    removeSkill(slot: SkillSlot): void {
        this._skills.set(slot, null);
        eventBus.emit('skill:removed', slot);
    }

    /** 释放指定槽位的技能 */
    castSkill(slot: SkillSlot): boolean {
        const skill = this._skills.get(slot);
        if (!skill || !this._player) return false;

        // 检查 CD
        if (skill.cooldownRemaining > 0) return false;
        // 检查玩家状态
        if (this._player.state === PlayerState.Dead || this._player.state === PlayerState.Dodging) return false;

        // 执行技能效果
        switch (skill.id) {
            case 'dash':
                this._castDash(skill);
                break;
            case 'shield':
                this._castShield(skill);
                break;
            default:
                // 其他技能（遗物技能等）由外部监听 SKILL_CAST 事件处理
                eventBus.emit('skill:cast', slot, skill.id);
                break;
        }

        skill.cooldownRemaining = skill.cd;
        eventBus.emit('skill:casting', slot, skill.id);

        // 通知 UI 更新 CD
        eventBus.emit('skill:cooldown_start', slot, skill.cd);
        return true;
    }

    /** 冲刺冲锋：向当前面向快速位移 2 格 */
    private _castDash(skill: SkillData): void {
        if (!this._player) return;
        // 具体位移逻辑由 PlayerController 处理，这里只发射事件
        eventBus.emit('skill:dash', this._player);
    }

    /** 护盾：2 秒内伤害减半 */
    private _castShield(skill: SkillData): void {
        eventBus.emit('skill:shield', this._player);
    }

    /** 获取技能数据 */
    getSkill(slot: SkillSlot): SkillData | null {
        return this._skills.get(slot) ?? null;
    }

    /** 槽位是否有技能 */
    hasSkill(slot: SkillSlot): boolean {
        return this._skills.get(slot) !== null;
    }

    /** 获取指定槽位 CD 剩余 */
    getCooldown(slot: SkillSlot): number {
        return this._skills.get(slot)?.cooldownRemaining ?? 0;
    }

    /** 获取所有非空技能（用于 UI 渲染） */
    getActiveSkills(): { slot: SkillSlot; data: SkillData }[] {
        const result: { slot: SkillSlot; data: SkillData }[] = [];
        for (const [slot, skill] of this._skills) {
            if (skill) {
                result.push({ slot, data: skill });
            }
        }
        return result;
    }

    update(dt: number): void {
        // 减少所有技能 CD
        for (const [, skill] of this._skills) {
            if (skill && skill.cooldownRemaining > 0) {
                const prev = skill.cooldownRemaining;
                skill.cooldownRemaining = Math.max(0, skill.cooldownRemaining - dt);
                // CD 变化超过 0.5 秒或 CD 刚结束时通知 UI
                if (Math.floor(prev * 2) !== Math.floor(skill.cooldownRemaining * 2) || skill.cooldownRemaining === 0) {
                    // UI 更新由外部监听处理
                }
            }
        }
    }
}
