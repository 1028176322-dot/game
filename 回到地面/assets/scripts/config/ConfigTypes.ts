/**
 * ConfigTypes - 配置表类型定义
 *
 * 对应 assets/resources/config/*.json 的实际结构
 * 所有 JSON 格式: { metadata: {...}, ...字段... }
 * 不做 { metadata, data } 包装，直接使用根级结构
 */

// ======== 通用 ========

export interface ConfigMetadata {
    version: string;
    lastUpdated: string;
    description?: string;
}

// ======== 战斗配置 (battle.json) ========

export interface AutoAttackConfig {
    baseInterval: number;
    minDamage: number;
    rangeDecayRate: number;
    switchTargetDelay: number;
}

export interface DodgeConfig {
    duration: number;
    cooldown: number;
}

export interface CritConfig {
    diceSides: number;
    triggerValue: number;
    multiplier: number;
    baseChance: number;
}

export interface DamageConfig {
    defReductionFactor: number;
    formulaDiceRange: number;
}

export interface BattleData {
    metadata: ConfigMetadata;
    autoAttack: AutoAttackConfig;
    dodge: DodgeConfig;
    crit: CritConfig;
    damage: DamageConfig;
    skillCastTime: number;
    itemUseTime: number;
}

// ======== 玩家配置 (player.json) ========

export interface PlayerBaseStats {
    atk: number;
    def: number;
    maxHp: number;
    moveSpeed: number;
    attackRange: number;
}

export interface PlayerData {
    metadata: ConfigMetadata;
    base: PlayerBaseStats;
}

// ======== 怪物配置 (monsters.json) ========

export interface MonsterDef {
    name: string;
    hp: number;
    atk: number;
    def: number;
    speed: number;
    ai: 'charger' | 'ranged' | 'defender' | 'suicider' | 'summoner' | 'elite';
    exp: number;
    appearanceWeight: number;
}

export interface MonsterScale {
    eliteHpMultiplier: number;
    eliteAtkMultiplier: number;
    summonHpMultiplier: number;
    summonAtkMultiplier: number;
    maxOnScreen: number;
    summonMaxPerMonster: number;
    summonGlobalCap: number;
}

export interface MonstersData {
    metadata: ConfigMetadata;
    monsterScale: MonsterScale;
    /** zoneId -> monsterId -> MonsterDef（运行时通过 getZoneMonsters 访问） */
}

// ======== 区域配置 (zones.json) ========

export interface ZoneStage {
    rooms: number;
    combatRooms: number;
    specialTypes: string[];
    miniBoss: string;
    miniBossHP: number;
    teaching?: string;
}

export interface FinalBossDef {
    id: string;
    name: string;
    hp: number;
    atk: number;
    def: number;
    phases: number;
    phaseTrigger: number[];
    unlockReward?: string;
    isFinalBoss?: boolean;
}

export interface ZoneDef {
    name: string;
    difficulty: number;
    visualTheme: string;
    stageCount: number;
    monsterPool: string[];
    drops: string;
    stages: Record<string, ZoneStage>;
    finalBoss: FinalBossDef;
}

export interface ZonesData {
    metadata: ConfigMetadata;
    zonePool: string[];
    runsPerGame: number;
    zones: Record<string, ZoneDef>;
    roomTypeWeights: Record<string, number>;
}

// ======== 其他配置（简化类型，按需求扩展） ========

export interface EconomyData {
    metadata: ConfigMetadata;
    [key: string]: unknown;
}

export interface ElementsData {
    metadata: ConfigMetadata;
    [key: string]: unknown;
}

export interface EquipmentData {
    metadata: ConfigMetadata;
    [key: string]: unknown;
}

export interface ItemsData {
    metadata: ConfigMetadata;
    [key: string]: unknown;
}

export interface SkillsData {
    metadata: ConfigMetadata;
    [key: string]: unknown;
}

export interface TextData {
    metadata: ConfigMetadata;
    [key: string]: unknown;
}

// ======== 全配置映射表 ========

export interface GameConfigs {
    battle: BattleData;
    economy: EconomyData;
    elements: ElementsData;
    equipment: EquipmentData;
    items: ItemsData;
    monsters: MonstersData;
    player: PlayerData;
    skills: SkillsData;
    text: TextData;
    zones: ZonesData;
}

export type ConfigName = keyof GameConfigs;
