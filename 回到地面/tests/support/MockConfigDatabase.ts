// MockConfigDatabase.ts — minimal config source double (§5.11).
// Injectable into systems that read config via IConfigDatabase (e.g. AudioSystem.getAudio).
// Only the surface used by tests is implemented; everything else returns undefined so a
// system under test fails loudly instead of silently passing.

import type { AudioConfigSource } from '../../assets/scripts/audio/AudioSystem';

export class MockConfigDatabase implements AudioConfigSource {
  private readonly _audio = new Map<string, unknown>();

  setAudio(id: string, cfg: unknown): void {
    this._audio.set(id, cfg);
  }

  getAudio(id: string): unknown {
    return this._audio.get(id);
  }

  // Unused by current tests; present for structural completeness / future growth.
  getSkill(_id: string): unknown { return undefined; }
  getMonster(_id: string): unknown { return undefined; }
  getBoss(_id: string): unknown { return undefined; }
  getEffect(_id: string): unknown { return undefined; }
  getAI(_id: string): unknown { return undefined; }
  getCamera(_id: string): unknown { return undefined; }
}
