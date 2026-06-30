/**
 * CharacterStartService - 角色初始能力应用
 *
 * 职责:
 * 1. 根据选中的角色应用初始能力
 * 2. 为角色装备初始技能
 *
 * Phase 4: 从 DungeonSceneController 拆分
 */

import { eventBus } from '../core/EventBus';
import { PlayerDataManager, CHARACTER_LIST } from '../core/PlayerDataManager';
import { SkillSystem, SkillSlot } from '../battle/SkillSystem';

export class CharacterStartService {
    constructor(
        private readonly _skillSystem: SkillSystem | null,
    ) {}

    /** 应用选中角色的初始能力 + 初始技能 */
    applySelectedCharacter(): void {
        if (!this._skillSystem) return;

        const pdm = PlayerDataManager.getInstance();
        const charId = pdm.selectedCharacter;
        const charDef = CHARACTER_LIST.find(c => c.id === charId);
        if (!charDef) return;

        // 触发初始能力
        eventBus.emit('upgrade:selected', { id: charDef.initialAbility, type: 'ability' });

        // 装备初始技能
        this._skillSystem.equipSkill(SkillSlot.ActiveRight, {
            id: charDef.initialSkill,
            name: charDef.name + '初始技',
            cd: 5.0,
            duration: 0,
            cooldownRemaining: 0,
            isActive: true,
            isRelic: false,
        });
    }
}
