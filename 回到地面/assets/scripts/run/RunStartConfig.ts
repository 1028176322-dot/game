/**
 * RunStartConfig - Single data structure for starting a dungeon run
 *
 * Enforced by P0 Architecture Rule: entering dungeon must ONLY use startRun(config).
 * No global variables (GameManager.currentFloor etc.) for run params.
 */

export interface RunStartConfig {
    characterId: string;      // warrior / archer / assassin / mage / berserker
    characterName: string;    // Player-chosen name
    zoneRoute: string[];      // Zone IDs: ['forest', 'catacombs', 'volcano']
    seed: number;             // Random seed for reproducibility
    difficulty: number;       // Difficulty multiplier (1-5)
    startedAt: number;        // Unix timestamp at start
    isContinue: boolean;      // true = resuming previous run
}

export function createDefaultRunConfig(): RunStartConfig {
    return {
        characterId: 'warrior',
        characterName: 'Adventurer',
        zoneRoute: ['forest', 'catacombs', 'volcano'],
        seed: Date.now(),
        difficulty: 1,
        startedAt: Date.now(),
        isContinue: false,
    };
}
