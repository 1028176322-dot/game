import { TerrainType } from '../core/Constants';

export type CharacterAction = 'idle' | 'attack' | 'walk' | 'dodge' | 'hit' | 'skill' | 'death';
export type MonsterAction = 'idle' | 'attack' | 'death' | 'skill';
export type TileKind = 'floor' | 'wall' | 'thorn' | 'highground';

export class ArtResourceResolver {
    static character(characterId: string, action: CharacterAction = 'idle'): string {
        const id = this._compact(characterId);
        return `textures/characters/${id}/${id}_${action}`;
    }

    static monster(zoneId: string, monsterId: string, action: MonsterAction = 'idle'): string {
        const zone = this._compact(zoneId);
        const monster = this._compact(monsterId);
        return `textures/monsters/${zone}/monster_${zone}_${monster}_${action}`;
    }

    static tile(zoneId: string, terrain: TerrainType): string {
        const zone = this._compact(zoneId);
        const kind = this.tileKind(terrain);
        return `textures/tiles/${zone}/tile_${zone}_${kind}`;
    }

    static backgroundCombat(zoneId: string): string {
        return `textures/backgrounds/bg_combat_${this._compact(zoneId)}`;
    }

    static ui(path: string): string {
        return `textures/ui/${path}`;
    }

    static icon(path: string): string {
        return `textures/icons/${path}`;
    }

    static tileKind(terrain: TerrainType): TileKind {
        switch (terrain) {
            case TerrainType.Wall:
            case TerrainType.Water:
            case TerrainType.Lava:
            case TerrainType.Ice:
            case TerrainType.Swamp:
            case TerrainType.DarkZone:
                return 'wall';
            case TerrainType.Thorn:
                return 'thorn';
            case TerrainType.HighGround:
            case TerrainType.Stone:
                return 'highground';
            case TerrainType.Floor:
            case TerrainType.Grass:
            case TerrainType.HealPad:
            default:
                return 'floor';
        }
    }

    private static _compact(value: string): string {
        return value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    }
}
