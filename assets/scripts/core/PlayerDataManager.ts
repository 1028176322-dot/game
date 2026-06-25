/**
 * PlayerDataManager - 永久存档管理器 (M2.4)
 * 
 * 单一写入口: 所有魂石/角色/天赋的存档操作必须通过此模块
 * 使用 WXAdapter localStorage, 兼容旧存档
 */

import { GameConfig } from './GameConfig';
import { eventBus } from './EventBus';

// ======== 存档数据结构 ========

export interface PlayerSaveData {
    /** 永久魂石总量 */
    soulStones: number;
    /** 已解锁角色ID列表 */
    unlockedCharacters: string[];
    /** 当前选中的角色ID */
    selectedCharacter: string;
    /** 当前选中的天赋ID (字符串或空) */
    selectedTalent: string | null;
    /** 已解锁的永久遗物池扩展 */
    unlockedRelicPoolExtras: string[];
    /** 历史最高层数 */
    bestFloor: number;
    /** 总击杀数 */
    totalKills: number;
    /** 总游戏局数 */
    totalRuns: number;
    /** 数据版本号 (用于迁移) */
    version: number;
}

// ======== 角色配置 ========

export interface CharacterDef {
    id: string;
    name: string;
    initialAbility: string;
    initialSkill: string;
    unlockCost: number;
    description: string;
}

export const CHARACTER_LIST: CharacterDef[] = [
    { id: 'warrior', name: '战士', initialAbility: 'shieldReflect', initialSkill: 'shield', unlockCost: 500, description: '初始核心能力: 盾反' },
    { id: 'archer', name: '弓手', initialAbility: 'ricochet', initialSkill: 'snapShot', unlockCost: 500, description: '初始核心能力: 弹射箭' },
    { id: 'assassin', name: '刺客', initialAbility: 'phaseWalk', initialSkill: 'dash', unlockCost: 800, description: '初始核心能力: 穿影' },
    { id: 'mage', name: '法师', initialAbility: 'elementResonance', initialSkill: 'elementBurst', unlockCost: 1000, description: '初始核心能力: 元素共鸣' },
    { id: 'berserker', name: '狂战士', initialAbility: 'warCry', initialSkill: 'healWave', unlockCost: 1200, description: '初始核心能力: 怒吼' },
];

// ======== 天赋配置 ========

export interface TalentDef {
    id: string;
    name: string;
    description: string;
    /** 魂石消耗 */
    cost: number;
}

export const TALENT_LIST: TalentDef[] = [
    { id: 'greed', name: '贪婪', description: '魂石获取 +15%', cost: 1000 },
    { id: 'explorer', name: '探索者', description: '地图全开 + 宝箱房概率+10%', cost: 1000 },
    { id: 'iron_stomach', name: '铁胃', description: '回复效果 +30%', cost: 1000 },
];

// ======== 默认存档 ========

function createDefaultSave(): PlayerSaveData {
    return {
        soulStones: 0,
        unlockedCharacters: ['warrior'], // 默认解锁战士
        selectedCharacter: 'warrior',
        selectedTalent: null,
        unlockedRelicPoolExtras: [],
        bestFloor: 0,
        totalKills: 0,
        totalRuns: 0,
        version: 1,
    };
}

// ======== 存储密钥 ========

const SAVE_KEY = 'player_data';

// ======== 管理器 ========

export class PlayerDataManager {
    private static _instance: PlayerDataManager;
    private _data: PlayerSaveData;

    static getInstance(): PlayerDataManager {
        if (!PlayerDataManager._instance) {
            PlayerDataManager._instance = new PlayerDataManager();
        }
        return PlayerDataManager._instance;
    }

    private constructor() {
        this._data = this._load();
    }

    // ======== 只读访问 ========

    get soulStones(): number { return this._data.soulStones; }
    get selectedCharacter(): string { return this._data.selectedCharacter; }
    get selectedTalent(): string | null { return this._data.selectedTalent; }
    get unlockedCharacters(): string[] { return [...this._data.unlockedCharacters]; }
    get bestFloor(): number { return this._data.bestFloor; }
    get totalKills(): number { return this._data.totalKills; }
    get totalRuns(): number { return this._data.totalRuns; }

    /** 检查角色是否已解锁 */
    isCharacterUnlocked(charId: string): boolean {
        return this._data.unlockedCharacters.includes(charId);
    }

    /** 检查天赋是否已购买 */
    isTalentOwned(talentId: string): boolean {
        return this._data.selectedTalent === talentId;
    }

    // ======== 写操作 (单一写入口) ========

    /** 增加魂石 (正向) */
    addSoulStones(amount: number): void {
        if (amount <= 0) return;
        this._data.soulStones += amount;
        this._save();
        eventBus.emit('playerdata:soulStones_changed', this._data.soulStones);
    }

    /** 消耗魂石 (反向, 需检查余额) */
    spendSoulStones(amount: number): boolean {
        if (amount <= 0 || this._data.soulStones < amount) return false;
        this._data.soulStones -= amount;
        this._save();
        eventBus.emit('playerdata:soulStones_changed', this._data.soulStones);
        return true;
    }

    /** 解锁角色 */
    unlockCharacter(charId: string): boolean {
        if (this._data.unlockedCharacters.includes(charId)) return false;
        const charDef = CHARACTER_LIST.find(c => c.id === charId);
        if (!charDef) return false;
        if (!this.spendSoulStones(charDef.unlockCost)) return false;
        this._data.unlockedCharacters.push(charId);
        this._save();
        eventBus.emit('playerdata:character_unlocked', charId);
        return true;
    }

    /** 选择当前角色 */
    selectCharacter(charId: string): boolean {
        if (!this._data.unlockedCharacters.includes(charId)) return false;
        this._data.selectedCharacter = charId;
        this._save();
        eventBus.emit('playerdata:character_selected', charId);
        return true;
    }

    /** 购买并选择天赋 */
    purchaseTalent(talentId: string): boolean {
        const talentDef = TALENT_LIST.find(t => t.id === talentId);
        if (!talentDef) return false;
        if (this._data.selectedTalent === talentId) return true; // 已拥有
        if (!this.spendSoulStones(talentDef.cost)) return false;
        this._data.selectedTalent = talentId;
        this._save();
        eventBus.emit('playerdata:talent_changed', talentId);
        return true;
    }

    /** 解锁遗物池扩展 */
    unlockRelicExtra(relicId: string): boolean {
        if (this._data.unlockedRelicPoolExtras.includes(relicId)) return false;
        if (!this.spendSoulStones(300)) return false; // 固定 300 魂石
        this._data.unlockedRelicPoolExtras.push(relicId);
        this._save();
        eventBus.emit('playerdata:relic_unlocked', relicId);
        return true;
    }

    /** 更新一局结束后的统计 (由 DeathUI 调用) */
    commitRunResult(floor: number, kills: number, soulStoneEarned: number): void {
        this._data.totalRuns++;
        this._data.totalKills += kills;
        if (floor > this._data.bestFloor) {
            this._data.bestFloor = floor;
        }
        this.addSoulStones(soulStoneEarned);
    }

    // ======== 重置 ========

    /** 重置所有数据 (测试/设置用) */
    resetAll(): void {
        this._data = createDefaultSave();
        this._save();
        eventBus.emit('playerdata:reset');
    }

    // ======== 读写存储 ========

    private _load(): PlayerSaveData {
        try {
            if (typeof wx !== 'undefined' && wx.getStorageSync) {
                const raw = wx.getStorageSync(SAVE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw) as PlayerSaveData;
                    // 兼容旧存档: 补充缺失字段
                    return {
                        ...createDefaultSave(),
                        ...parsed,
                    };
                }
            } else {
                // 开发环境: 从 localStorage 加载
                const raw = localStorage.getItem(SAVE_KEY);
                if (raw) {
                    return { ...createDefaultSave(), ...JSON.parse(raw) };
                }
            }
        } catch (err) {
            console.warn('[PlayerDataManager] 读档失败，使用默认', err);
        }
        return createDefaultSave();
    }

    private _save(): void {
        try {
            const raw = JSON.stringify(this._data);
            if (typeof wx !== 'undefined' && wx.setStorageSync) {
                wx.setStorageSync(SAVE_KEY, raw);
            } else {
                localStorage.setItem(SAVE_KEY, raw);
            }
        } catch (err) {
            console.warn('[PlayerDataManager] 存档失败', err);
        }
    }
}
