import { SpriteFrame, Texture2D, Rect, Size, Vec2 } from 'cc';

export interface SpriteSheetInfo {
    frameWidth: number;
    frameHeight: number;
    frameCount: number;
}

/**
 * Built-in sprite sheet metadata for character textures.
 * Each character PNG is a vertical sprite sheet: 192x768 (4 frames, each 192x192).
 * Key format: the asset resource ID (matches entries in assets.json).
 */
export const BUILTIN_SHEETS: Record<string, SpriteSheetInfo> = {
    // --- Warrior ---
    'textures/characters/warrior/warrior_idle':   { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/warrior/warrior_walk':   { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/warrior/warrior_attack': { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/warrior/warrior_hit':    { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/warrior/warrior_dodge':  { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/warrior/warrior_skill':  { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/warrior/warrior_death':  { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    // --- Archer ---
    'textures/characters/archer/archer_idle':     { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/archer/archer_walk':     { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/archer/archer_attack':   { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/archer/archer_hit':      { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/archer/archer_dodge':    { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/archer/archer_skill':    { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/archer/archer_death':    { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    // --- Assassin ---
    'textures/characters/assassin/assassin_idle':   { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/assassin/assassin_walk':   { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/assassin/assassin_attack': { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/assassin/assassin_hit':    { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/assassin/assassin_dodge':  { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/assassin/assassin_skill':  { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/assassin/assassin_death':  { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    // --- Berserker ---
    'textures/characters/berserker/berserker_idle':   { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/berserker/berserker_walk':   { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/berserker/berserker_attack': { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/berserker/berserker_hit':    { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/berserker/berserker_dodge':  { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/berserker/berserker_skill':  { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/berserker/berserker_death':  { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    // --- Mage ---
    'textures/characters/mage/mage_idle':     { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/mage/mage_walk':     { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/mage/mage_attack':   { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/mage/mage_hit':      { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/mage/mage_dodge':    { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/mage/mage_skill':    { frameWidth: 192, frameHeight: 192, frameCount: 4 },
    'textures/characters/mage/mage_death':    { frameWidth: 192, frameHeight: 192, frameCount: 4 },
};

/**
 * Check if a resource ID corresponds to a multi-frame sprite sheet.
 */
export function getSheetInfo(resourceId: string): SpriteSheetInfo | null {
    return BUILTIN_SHEETS[resourceId] ?? null;
}

/**
 * Create a new SpriteFrame that shows a single frame from a multi-frame sprite sheet.
 *
 * @param texture The source Texture2D (contains all frames).
 * @param frameW Width of a single frame in pixels.
 * @param frameH Height of a single frame in pixels.
 * @param frameIndex Zero-based frame index.
 * @returns A new SpriteFrame showing only the specified frame.
 */
export function createFrameFromSheet(
    texture: Texture2D,
    frameW: number,
    frameH: number,
    frameIndex: number,
): SpriteFrame {
    const frame = new SpriteFrame();
    frame.texture = texture;
    const y = frameIndex * frameH;
    frame.rect = new Rect(0, y, frameW, frameH);
    frame.originalSize = new Size(frameW, frameH);
    frame.offset = new Vec2(0, 0);
    return frame;
}
