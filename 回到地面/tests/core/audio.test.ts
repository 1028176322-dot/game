// audio.test.ts — §5.8 AudioSystem unit tests.
import { describe, it, expect } from 'vitest';
import { GameContext, IConfigDatabase, IAudioService } from '../../assets/scripts/core/GameContext';
import {
  AudioSystem,
  MemoryAudioSink,
  AudioCategory,
} from '../../assets/scripts/audio/AudioSystem';
import { MockConfigDatabase } from '../support/MockConfigDatabase';

function makeCtx(): { ctx: GameContext; sink: MemoryAudioSink; audio: AudioSystem } {
  const ctx = new GameContext();
  ctx.register(IConfigDatabase, new MockConfigDatabase());
  const sink = new MemoryAudioSink();
  const audio = new AudioSystem(sink);
  ctx.register(IAudioService, audio);
  audio.initialize(ctx);
  return { ctx, sink, audio };
}

describe('AudioSystem §5.8', () => {
  it('plays each sub-system category (BGM/SFX/Voice/Ambient/3D)', () => {
    const { sink, audio } = makeCtx();
    audio.playBgm('battle_theme');
    audio.playSfx('hit');
    audio.playVoice('boss_line');
    audio.playAmbient('wind');
    audio.play3d('explosion', { x: 0, y: 0, z: 0 });
    const cats = sink.plays.map((p) => p.category);
    expect(cats).toEqual([
      AudioCategory.Bgm,
      AudioCategory.Sfx,
      AudioCategory.Voice,
      AudioCategory.Ambient,
      AudioCategory.Spatial,
    ]);
  });

  it('config-driven volume via IConfigDatabase.getAudio', () => {
    const { ctx, sink, audio } = makeCtx();
    const db = ctx.get<MockConfigDatabase>(IConfigDatabase);
    db.setAudio('hit', { id: 'hit', category: 'sfx', volume: 0.5, loop: false });
    audio.playSfx('hit');
    expect(sink.plays[0].effectiveVolume).toBeCloseTo(0.5, 5);
  });

  it('3D audio attenuates with distance from listener', () => {
    const { sink, audio } = makeCtx();
    audio.setListener({ x: 0, y: 0, z: 0 });
    audio.play3d('near', { x: 5, y: 0, z: 0 }); // within [1,20] -> partial
    audio.play3d('far', { x: 100, y: 0, z: 0 }); // beyond max -> silent
    const near = sink.plays.find((p) => p.id === 'near')!;
    const far = sink.plays.find((p) => p.id === 'far')!;
    expect(near.effectiveVolume).toBeGreaterThan(0);
    expect(near.effectiveVolume).toBeLessThan(1);
    expect(far.effectiveVolume).toBe(0);
  });

  it('snapshot (mix preset) scales subsequent volume', () => {
    const { sink, audio } = makeCtx();
    audio.playBgm('theme'); // calm scale 1 -> 1
    audio.setSnapshot('boss'); // scale 1.2
    audio.playBgm('theme'); // -> 1.2
    expect(sink.plays[0].effectiveVolume).toBeCloseTo(1, 5);
    expect(sink.plays[1].effectiveVolume).toBeCloseTo(1.2, 5);
    expect(sink.snapshots[sink.snapshots.length - 1].name).toBe('boss');
    expect(audio.activeSnapshot).toBe('boss');
  });

  it('stop removes from playing set and notifies sink', () => {
    const { sink, audio } = makeCtx();
    audio.playBgm('theme');
    expect(audio.playingCount).toBe(1);
    audio.stop('theme');
    expect(audio.playingCount).toBe(0);
    expect(sink.stops).toContain('theme');
  });

  it('setListener forwards to sink', () => {
    const { sink, audio } = makeCtx();
    audio.setListener({ x: 3, y: 1, z: 2 });
    expect(sink.listener).toEqual({ x: 3, y: 1, z: 2 });
  });

  it('ILifecycle: initialize sets flag, destroy clears state', () => {
    const { sink, audio } = makeCtx();
    expect(audio.initialized).toBe(true);
    audio.playBgm('theme');
    audio.destroy();
    expect(audio.initialized).toBe(false);
    expect(audio.playingCount).toBe(0);
    expect(sink.stops).toContain('theme');
  });

  it('IAudioService token reused from GameContext (no duplicate token)', () => {
    const { ctx, audio } = makeCtx();
    expect(ctx.get(IAudioService)).toBe(audio);
  });
});
