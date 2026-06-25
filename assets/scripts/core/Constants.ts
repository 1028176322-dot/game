/**
 * 游戏常量与枚举定义
 * 所有状态字段集中定义，禁止散落魔法值
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
    True = 'true',       // 真实伤害（无视防御）
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
    Charger = 'charger',       // 冲锋型：追击玩家，近战攻击
    Ranged = 'ranged',         // 远程型：保持距离，远程攻击
    Defender = 'defender',      // 防御型：架盾格挡，低移速高防御
}

// ======== 房间类型 ========
export enum RoomType {
    Normal = 'normal',
    Elite = 'elite',           // 精英房
    Boss = 'boss',             // Boss 房
    Treasure = 'treasure',     // 宝箱房
    Healing = 'healing',       // 回复房
    Shop = 'shop',             // 商店房
    Upgrade = 'upgrade',       // 强化房
    Event = 'event',           // 事件房
    Rest = 'rest',             // 休息房
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
}

// ======== 游戏阶段 ========
export enum GamePhase {
    Splash = 'splash',         // 启动屏
    MainMenu = 'mainMenu',     // 主界面
    CharacterSelect = 'charSelect',
    Dungeon = 'dungeon',       // 地牢中
    Battle = 'battle',         // 战斗中
    UpgradeRoom = 'upgrade',   // 强化房
    DeathScreen = 'death',     // 死亡/觉悟战
    Settlement = 'settlement', // 结算
}

// ======== 玩家状态 ========
export enum PlayerState {
    Idle = 'idle',
    Moving = 'moving',
    Dodging = 'dodging',       // 翻滚中（无敌帧）
    Attacking = 'attacking',
    Casting = 'casting',       // 释放技能
    Stunned = 'stunned',
    Dead = 'dead',
}

// ======== 怪物状态 ========
export enum MonsterState {
    Idle = 'idle',
    Chase = 'chase',           // 追击
    Attack = 'attack',         // 攻击
    Retreat = 'retreat',       // 后退（远程型）
    Defend = 'defend',         // 防御
    Stunned = 'stunned',
    Dead = 'dead',
}

// ======== 战斗阶段 ========
export enum BattlePhase {
    Init = 'init',              // 初始化：怪物生成中
    InProgress = 'inProgress',  // 战斗中
    Victory = 'victory',        // 战斗胜利
    Defeat = 'defeat',          // 玩家死亡
}

// ======== UI 状态 ========
export enum UIState {
    Closed = 'closed',
    Opening = 'opening',
    Open = 'open',
    Closing = 'closing',
}

// ======== 数值常量 ========
export const BATTLE_CONSTANTS = {
    AUTO_ATTACK_INTERVAL: 1.0,            // 自动攻击间隔（秒）
    DODGE_DURATION: 0.3,                  // 翻滚无敌帧时长（秒）
    DODGE_COOLDOWN: 3.0,                  // 翻滚 CD（秒）
    DAMAGE_FORMULA_BASE_ATK: 10,          // 基础攻击力
    DAMAGE_FORMULA_DEF_FACTOR: 0.5,       // 防御系数
    CRIT_MULTIPLIER: 1.5,                 // 暴击倍率
    CRIT_BASE_CHANCE: 0.05,               // 基础暴击率
    D6_DICE_SIDES: 6,                     // D6 骰子面数
    GRID_SIZE: 6,                         // 网格 6×6
    TILE_SIZE: 64,                        // 每格像素
    PLAYER_MOVE_SPEED: 200,               // 移动速度（像素/秒）
    ROOM_TRANSITION_DURATION: 0.5,        // 房间切换过渡时长
    SPLASH_DURATION: 2.0,                 // 启动屏时长（秒）
    MONSTER_ATTACK_INTERVAL_CHARGER: 1.5, // 冲锋型攻击间隔
    MONSTER_ATTACK_INTERVAL_RANGED: 2.0,  // 远程型攻击间隔
    MONSTER_ATTACK_INTERVAL_DEFENDER: 2.5,// 防御型攻击间隔
    SWITCH_TARGET_DELAY: 0.2,             // 切换目标延迟（秒）
} as const;

// ======== 广告位类型 ========
export enum AdPlacement {
    Revive = 'revive',          // 觉悟复活
    Treasure = 'treasure',      // 宝箱翻倍
    UpgradeExtra = 'upgradeExtra', // 强化额外选项
    ShopDiscount = 'shopDiscount',
    CoinDouble = 'coinDouble',
    DailyReward = 'dailyReward',
    Marquee = 'marquee',        // 跑马灯
    Interstitial = 'interstitial',
    Banner = 'banner',
}
