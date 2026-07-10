// tests/core/configdatabase.test.ts — D0-3 DoD verification (§5.3).
import { describe, it, expect } from 'vitest';
import { ConfigDatabase } from '../../assets/scripts/core/ConfigDatabase';
import type { GameConfigs } from '../../assets/scripts/config/ConfigTypes';

describe('ConfigDatabase', () => {
  it('getSkill / getMonster return correct data from injected source', () => {
    const configs: Partial<GameConfigs> = {
      skills: { fireball: { name: 'fireball', dmg: 10 } } as unknown as GameConfigs['skills'],
      monsters: { goblin: { name: 'goblin', hp: 20 } } as unknown as GameConfigs['monsters'],
    };
    const db = new ConfigDatabase(configs);
    expect(db.getSkill('fireball')).toEqual({ name: 'fireball', dmg: 10 });
    expect(db.getMonster('goblin')).toEqual({ name: 'goblin', hp: 20 });
  });

  it('loadAll throws when no config data injected', async () => {
    const db = new ConfigDatabase();
    await expect(db.loadAll()).rejects.toThrow();
  });

  it('loadAll succeeds with injected data and getters resolve per-id', async () => {
    const configs: Partial<GameConfigs> = {
      skills: { frost: { name: 'frost' } } as unknown as GameConfigs['skills'],
      battle: { ai: { strategy: 'BT' } } as unknown as GameConfigs['battle'],
    };
    const db = new ConfigDatabase(configs);
    await db.loadAll();
    expect(db.getSkill('frost')).toEqual({ name: 'frost' });
    expect(db.getAI('ai')).toEqual({ strategy: 'BT' });
  });

  it('getter returns undefined for unknown id', () => {
    const db = new ConfigDatabase({ skills: {} as unknown as GameConfigs['skills'] });
    expect(db.getSkill('missing')).toBeUndefined();
  });
});
