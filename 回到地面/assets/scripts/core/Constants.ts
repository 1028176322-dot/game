/**
 * 游戏常量与枚举定义
 * 所有数值型配置已迁移至 GameConfig.ts，此文件仅保留枚举与类型
 * 
 * 【规则】
 * - 枚举在此定义，枚举值用可读字符串
 * - 所有数值常量请到 GameConfig.ts 中定义和修改
 */

// ======== 伤害类型 ========
export enum DamageType {
    Physical = 'physical',
    Fire = 'fire',
    Frost = 'frost',
    Lightning = 'lightning',
    Poison = 'poison',
    Shadow = 'shadow',
    Holy = 'holy',
    True = 'true',
}

// ======== 元素类型 ========
export enum ElementType {
    None = 'none',
    Fire = 'fire',
    Frost = 'frost',
    Lightning = 'lightning',
    Poison = 'poison',
    Shadow = 'shadow',
    Holy = 'holy',
}

// ======== 怪物 AI 类型 ========
export enum MonsterAIType {
    Charger = 'charger',
    Ranged = 'ranged',
    Defender = 'defender',
    Summoner = 'summoner',
    Suicider = 'suicider',
    Elite = 'elite',
}

// ======== 房间类型 ========
export enum RoomType {
    Normal = 'normal',
    Elite = 'elite',
    Boss = 'boss',
    Treasure = 'treasure',
    Healing = 'healing',
    Shop = 'shop',
    Upgrade = 'upgrade',
    Event = 'event',
    Rest = 'rest',
}

// ======== 地形类型 ========
export enum TerrainType {
    Floor = 'floor',
    Wall = 'wall',
    Water = 'water',
    Lava = 'lava',
    Ice = 'ice',
    Swamp = 'swamp',
    Grass = 'grass',
    Stone = 'stone',
    Thorn = 'thorn',
    HealPad = 'healPad',
    HighGround = 'highGround',
    DarkZone = 'darkZone',
}

// ======== 游戏阶段 ========
export enum GamePhase {
    Splash = 'splash',
    MainMenu = 'mainMenu',
    CharacterSelect = 'charSelect',
    Dungeon = 'dungeon',
    Battle = 'battle',
    UpgradeRoom = 'upgrade',
    DeathScreen = 'death',
    Settlement = 'settlement',
}

// ======== 玩家状态 ========
export enum PlayerState {
    Idle = 'idle',
    Moving = 'moving',
    Dodging = 'dodging',
    Attacking = 'attacking',
    Casting = 'casting',
    Stunned = 'stunned',
    Dead = 'dead',
}

// ======== 怪物状态 ========
export enum MonsterState {
    Idle = 'idle',
    Chase = 'chase',
    Attack = 'attack',
    Retreat = 'retreat',
    Defend = 'defend',
    Stunned = 'stunned',
    Dead = 'dead',
}

// ======== 战斗阶段 ========
export enum BattlePhase {
    Init = 'init',
    InProgress = 'inProgress',
    Victory = 'victory',
    Defeat = 'defeat',
}

// ======== UI 状态 ========
export enum UIState {
    Closed = 'closed',
    Opening = 'opening',
    Open = 'open',
    Closing = 'closing',
}

// ======== 物品稀有度 ========
export enum Rarity {
    Common = 'common',
    Magic = 'magic',
    Rare = 'rare',
    Legendary = 'legendary',
}

// ======== 装备槽位 ========
export enum EquipSlot {
    Weapon = 'weapon',
    Ring = 'ring',
    Necklace = 'necklace',
    Helmet = 'helmet',
    Chest = 'chest',
    Legs = 'legs',
    Shoes = 'shoes',
    Gloves = 'gloves',
}

// ======== 广告位类型 ========
export enum AdPlacement {
    Revive = 'revive',
    Treasure = 'treasure',
    UpgradeExtra = 'upgradeExtra',
    ShopDiscount = 'shopDiscount',
    CoinDouble = 'coinDouble',
    DailyReward = 'dailyReward',
    Marquee = 'marquee',
    Interstitial = 'interstitial',
    Banner = 'banner',
}

// ======== 套装类型 ========
export enum SetType {
    Tempest = 'tempest',
    Ironwall = 'ironwall',
    Shadow = 'shadow',
    Fury = 'fury',
    Frostbite = 'frostbite',
    Radiance = 'radiance',
}

// ======== 修饰符来源前缀 ========
export const MODIFIER_SOURCE = {
    ABILITY_PREFIX: 'ability:',
    RELIC_PREFIX: 'relic:',
    EQUIP_PREFIX: 'equip:',
    SET_PREFIX: 'set:',
    BUFF_PREFIX: 'buff:',
    ITEM_PREFIX: 'item:',
} as const;
