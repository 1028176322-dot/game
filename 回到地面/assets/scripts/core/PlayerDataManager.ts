/**
 * PlayerDataManager - 永久存档管理器 (M2.4)
 *
 * Single write entry: all soulStone/character/talent operations go through this module.
 * Phase 1: uses SaveService instead of direct StorageService access.
 */

import { GameConfig } from './GameConfig';
import { eventBus } from './EventBus';
import { SaveService } from './save/SaveService';
import {
    PlayerProfileSave,
    SAVE_KEYS,
} from './save/SaveTypes';

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
    /** 各区域通关次数 */
    zoneClearCounts: Record<string, number>;
    /** 各区域最高到达层数 */
    zoneBestFloors: Record<string, number>;
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
        unlockedCharacters: ['warrior'],
        selectedCharacter: 'warrior',
        selectedTalent: null,
        unlockedRelicPoolExtras: [],
        bestFloor: 0,
        totalKills: 0,
        totalRuns: 0,
        zoneClearCounts: {},
        zoneBestFloors: {},
        version: 1,
    };
}

// ======== 存储密钥 ========

const SAVE_KEY = 'player_data';

/** Convert new PlayerProfileSave -> legacy PlayerSaveData for backward compat. */
function profileToSaveData(profile: PlayerProfileSave): PlayerSaveData {
    return {
        soulStones: profile.profile.soulStones,
        unlockedCharacters: profile.profile.unlockedCharacters,
        selectedCharacter: profile.profile.selectedCharacter,
        selectedTalent: profile.profile.selectedTalent,
        unlockedRelicPoolExtras: profile.profile.unlockedRelicPoolExtras,
        bestFloor: profile.stats.bestFloor,
        totalKills: profile.stats.totalKills,
        totalRuns: profile.stats.totalRuns,
        zoneClearCounts: profile.zoneClearCounts,
        zoneBestFloors: profile.zoneBestFloors,
        version: profile.schemaVersion,
    };
}

/** Convert legacy PlayerSaveData -> PlayerProfileSave */
function saveDataToProfile(data: PlayerSaveData): PlayerProfileSave {
    const now = Date.now();
    return {
        schemaVersion: data.version ?? 1,
        playerId: 'local_' + String(now),
        updatedAt: now,
        createdAt: now,
        profile: {
            soulStones: data.soulStones,
            unlockedCharacters: data.unlockedCharacters,
            selectedCharacter: data.selectedCharacter,
            selectedTalent: data.selectedTalent,
            unlockedRelicPoolExtras: data.unlockedRelicPoolExtras,
        },
        stats: {
            bestFloor: data.bestFloor,
            totalKills: data.totalKills,
            totalRuns: data.totalRuns,
            totalRevives: 0,
            totalAdsWatched: 0,
        },
        flags: {
            tutorialFinished: false,
            privacyAccepted: false,
            characterCreated: data.totalRuns > 0 || data.soulStones > 0,
        },
        zoneClearCounts: data.zoneClearCounts,
        zoneBestFloors: data.zoneBestFloors,
    };
}

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
    getSelectedCharacterId(): string { return this.selectedCharacter; }

    /** 检查角色是否已解锁 */
    isCharacterUnlocked(charId: string): boolean {
        return this._data.unlockedCharacters.includes(charId);
    }

    /** 检查天赋是否已购买 */
    isTalentOwned(talentId: string): boolean {
        return this._data.selectedTalent === talentId;
    }

    // ======== 额外 Reader 方法 ========

    /** 获取魂石数 */
    getSoulStones(): number { return this._data.soulStones; }

    /** 获取角色名 (扩展字段, 从存档的额外数据读取) */
    getCharacterName(): string {
        const explicitName = (this._data as any).characterName;
        if (explicitName) {
            return explicitName;
        }
        const character = CHARACTER_LIST.find((c) => c.id === this.selectedCharacter);
        return character ? character.name : this.selectedCharacter;
    }

    /** 获取角色等级 (预留, 当前固定 1) */
    getCharacterLevel(): number { return 1; }

    /** 获取已解锁角色ID列表 */
    getUnlockedCharacterIds(): string[] { return [...this._data.unlockedCharacters]; }

    /** 获取历史最高层 (全局) */
    getBestFloor(): number { return this._data.bestFloor; }

    /** 获取某区域最高到达层数 */
    getZoneBestFloor(zoneId: string): number {
        return this._data.zoneBestFloors[zoneId] ?? 0;
    }

    /** 记录某区域最高层数 */
    recordZoneBestFloor(zoneId: string, floor: number): void {
        if (floor > (this._data.zoneBestFloors[zoneId] ?? 0)) {
            this._data.zoneBestFloors[zoneId] = floor;
            this._save();
        }
    }

    /** 获取某区域通关次数 */
    getZoneClearCount(zoneId: string): number {
        return this._data.zoneClearCounts[zoneId] ?? 0;
    }

    /** 记录区域通关 */
    recordZoneClear(zoneId: string): void {
        this._data.zoneClearCounts[zoneId] = (this._data.zoneClearCounts[zoneId] ?? 0) + 1;
        this._save();
    }

    /** 获取总局数 */
    getTotalRuns(): number { return this._data.totalRuns; }

    /** 设置历史最高层 */
    setBestFloor(floor: number): void {
        if (floor > this._data.bestFloor) {
            this._data.bestFloor = floor;
            this._save();
        }
    }

    /** 累加击杀数 */
    addTotalKills(kills: number): void {
        if (kills <= 0) return;
        this._data.totalKills += kills;
        this._save();
    }

    /** 总冒险次数 +1 */
    addTotalRun(): void {
        this._data.totalRuns++;
        this._save();
    }

    /** 创建角色并初始化存档 (首次使用) */
    createCharacter(name: string, charType: string): void {
        this._data = {
            soulStones: 0,
            unlockedCharacters: ['warrior'],
            selectedCharacter: charType,
            selectedTalent: null,
            unlockedRelicPoolExtras: [],
            bestFloor: 0,
            totalKills: 0,
            totalRuns: 0,
            zoneClearCounts: {},
            zoneBestFloors: {},
            version: 1,
        };
        (this._data as any).characterName = name;
        (this._data as any).createdAt = Date.now();
        this._save();
        console.log('[PlayerData] character created:', name, charType);
    }

    /** 是否为首次启动 */
    isFirstTime(): boolean {
        return this._data.totalRuns === 0
            && this._data.soulStones === 0
            && this._data.totalKills === 0;
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

    // ======== 读写存储（Phase 1: 使用 SaveService） ========

    private _load(): PlayerSaveData {
        try {
            const saveService = SaveService.instance;
            const profile = saveService.loadProfile();
            const data = profileToSaveData(profile);
            console.warn('[PlayerDataManager] loaded profile:', {
                selectedCharacter: data.selectedCharacter,
                unlockedCharacters: data.unlockedCharacters,
                version: data.version,
            });
            return data;
        } catch (err) {
            console.warn('[PlayerDataManager] 读档失败，使用默认', err);
        }
        return createDefaultSave();
    }

    private _save(): void {
        try {
            const profile = saveDataToProfile(this._data);
            SaveService.instance.saveProfile(profile);
        } catch (err) {
            console.warn('[PlayerDataManager] 存档失败', err);
        }
    }
}
