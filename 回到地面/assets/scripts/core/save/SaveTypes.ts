/**
 * SaveTypes - 存档数据类型定义
 *
 * Phase 1 of data storage implementation plan.
 * Separates save data types from PlayerDataManager to avoid circular deps.
 */

// ── Player Profile (局外永久数据) ──

export interface PlayerProfile {
    soulStones: number;
    unlockedCharacters: string[];
    selectedCharacter: string;
    selectedTalent: string | null;
    unlockedRelicPoolExtras: string[];
}

export interface PlayerStats {
    bestFloor: number;
    totalKills: number;
    totalRuns: number;
    totalRevives: number;
    totalAdsWatched: number;
}

export interface PlayerFlags {
    tutorialFinished: boolean;
    privacyAccepted: boolean;
    characterCreated: boolean;
}

export interface PlayerProfileSave {
    schemaVersion: number;
    playerId: string;
    updatedAt: number;
    createdAt: number;
    profile: PlayerProfile;
    stats: PlayerStats;
    flags: PlayerFlags;
    zoneClearCounts: Record<string, number>;
    zoneBestFloors: Record<string, number>;
}

// ── Run Save (单局数据) ──

export interface RunPlayerState {
    hp: number;
    maxHp: number;
    level: number;
    exp: number;
}

export interface RunInventory {
    items: string[];
    equipment: string[];
}

export interface RunRngState {
    runSeed: number;
    combatStep: number;
    lootStep: number;
}

export interface RunSave {
    schemaVersion: number;
    runId: string;
    seed: number;
    startedAt: number;
    updatedAt: number;
    zoneId: string;
    floor: number;
    roomId: string;
    player: RunPlayerState;
    inventory: RunInventory;
    rng: RunRngState;
}

// ── Settings (设置) ──

export interface AudioSettings {
    music: boolean;
    sfx: boolean;
    musicVolume: number;
    sfxVolume: number;
}

export interface DisplaySettings {
    quality: 'auto' | 'high' | 'low';
    damageNumber: boolean;
    screenShake: boolean;
}

export interface ControlSettings {
    joystickMode: 'fixed' | 'floating';
}

export interface SettingsSave {
    schemaVersion: number;
    audio: AudioSettings;
    display: DisplaySettings;
    control: ControlSettings;
}

// ── Storage Keys ──

export const SAVE_KEYS = {
    PROFILE: 'save_profile_v1',
    RUN: 'save_run_v1',
    SETTINGS: 'save_settings_v1',
    CACHE_AD_STATE: 'cache_ad_state_v1',
    CACHE_MARQUEE: 'cache_marquee_v1',
    SYNC_QUEUE: 'sync_queue_v1',
} as const;

// Legacy keys for migration
export const LEGACY_KEYS = {
    PLAYER_DATA: 'player_data',
    MARQUEE_PROGRESS: 'marquee_progress',
    AD_STATE: 'ad_state_cache',
} as const;
