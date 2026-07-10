// tests/core/debug_save_replay.test.ts — §5.5/§5.6/§5.7 DoD verification.
// Pure-TS: DebugPanel / SaveManager / ReplayRecorder have no `cc` import -> node/vitest.
import { describe, it, expect } from 'vitest';
import { GameContext, IDebugService, ICameraBrain, ISaveManager, IReplayRecorder } from '../../assets/scripts/core/GameContext';
import { DebugPanel } from '../../assets/scripts/debug/DebugPanel';
import { SaveManagerImpl, MemorySaveBackend, SAVE_VERSION } from '../../assets/scripts/save/SaveManager';
import { ReplayRecorder, computeConfigHash } from '../../assets/scripts/replay/ReplayRecorder';

describe('§5.5 DebugPanel', () => {
  it('toggles visibility', () => {
    const dp = new DebugPanel();
    expect(dp.isVisible()).toBe(false);
    dp.toggle();
    expect(dp.isVisible()).toBe(true);
    dp.setVisible(false);
    expect(dp.isVisible()).toBe(false);
  });

  it('aggregates registered providers into the snapshot (no switch)', () => {
    const dp = new DebugPanel();
    dp.registerProvider('ai', () => ({ ai: { state: 'chase', distance: 4.2, btNode: 'MoveTo' } }));
    dp.registerProvider('skill', () => ({ skill: { inFlight: 3 } }));
    const snap = dp.sample();
    expect(snap.ai?.state).toBe('chase');
    expect(snap.ai?.distance).toBe(4.2);
    expect(snap.skill?.inFlight).toBe(3);
    expect(snap.visible).toBe(false);
  });

  it('forwards Logger output lines into the Events buffer (ILogger buffer reuse)', () => {
    const ctx = new GameContext();
    const dp = new DebugPanel();
    ctx.register(IDebugService, dp);
    dp.initialize(ctx);
    const sink = (line: string) => dp.pushRaw(line);
    sink('[2026-07-10T00:00:00Z][battle][info] hit 12');
    sink('[2026-07-10T00:00:01Z][ai][warn] no target');
    const ev = dp.sample().events;
    expect(ev.length).toBe(2);
    expect(ev[0].channel).toBe('battle');
    expect(ev[0].level).toBe('info');
    expect(ev[0].msg).toBe('hit 12');
    expect(ev[1].channel).toBe('ai');
  });

  it('caps the event ring buffer at 200 entries', () => {
    const dp = new DebugPanel();
    for (let i = 0; i < 250; i++) dp.pushEvent('battle', 'info', `m${i}`);
    expect(dp.sample().events.length).toBe(200);
    // oldest dropped, newest kept
    expect(dp.sample().events[0].msg).toBe('m50');
    expect(dp.sample().events[199].msg).toBe('m249');
  });

  it('computes fps from frame delta', () => {
    const dp = new DebugPanel();
    dp.update(16.6667);
    expect(dp.sample().fps).toBe(60);
    dp.update(33.3333);
    expect(dp.sample().fps).toBe(30);
  });

  it('wires camera panel only when ICameraBrain exposes getDebugState (duck-typed)', () => {
    const ctx = new GameContext();
    ctx.register(ICameraBrain, {
      getDebugState: () => ({ mode: 'Follow', posX: 1, posY: 2, posZ: 3, pitchDeg: 30 }),
    });
    const dp = new DebugPanel();
    dp.initialize(ctx);
    expect(dp.sample().camera?.mode).toBe('Follow');

    const ctx2 = new GameContext();
    const dp2 = new DebugPanel();
    dp2.initialize(ctx2); // no camera registered
    expect(dp2.sample().camera).toBeUndefined();
  });

  it('implements ILifecycle (initialize + destroy clears state)', () => {
    const ctx = new GameContext();
    const dp = new DebugPanel();
    dp.initialize(ctx);
    dp.registerProvider('seed', () => ({ seed: { seed: 1, frame: 0 } }));
    dp.pushEvent('ui', 'debug', 'x');
    expect(dp.sample().events.length).toBe(1);
    dp.destroy();
    expect(dp.sample().events.length).toBe(0);
    expect(dp.sample().seed).toBeUndefined();
  });
});

describe('§5.6 SaveManager', () => {
  it('saveRun / loadRun roundtrip is deterministic', () => {
    const sm = new SaveManagerImpl(new MemorySaveBackend());
    const run = { version: SAVE_VERSION, seed: 12345, floor: 7, items: ['sword', 'potion'] };
    sm.saveRun(run);
    const back = sm.loadRun();
    expect(back).toEqual(run);
  });

  it('persists all four state layers + seed independently', () => {
    const backend = new MemorySaveBackend();
    const sm = new SaveManagerImpl(backend);
    sm.savePlayer({ version: SAVE_VERSION, unlocks: ['forest'], level: 12, settings: { sfx: 0.5 } });
    sm.saveDungeon({ version: SAVE_VERSION, zone: 'forest', clearedRooms: ['r1'], currentRoom: 'r2' });
    sm.saveEnemy({ version: SAVE_VERSION, id: 'goblin', hp: 30, maxHp: 50 });
    sm.saveSeed(999);
    expect(JSON.parse(backend.load('save:player')!).level).toBe(12);
    expect(JSON.parse(backend.load('save:dungeon')!).zone).toBe('forest');
    expect(JSON.parse(backend.load('save:enemy')!).hp).toBe(30);
    expect(JSON.parse(backend.load('save:seed')!).seed).toBe(999);
    // run slot untouched
    expect(backend.load('save:run')).toBeNull();
  });

  it('implements ILifecycle without throwing', () => {
    const sm = new SaveManagerImpl(new MemorySaveBackend());
    sm.initialize(new GameContext());
    expect(() => sm.destroy()).not.toThrow();
  });
});

describe('§5.7 ReplayRecorder', () => {
  it('startRun sets header; record appends frames in order', () => {
    const r = new ReplayRecorder();
    r.startRun(42, 'abc');
    expect(r.header).toEqual({ seed: 42, version: 1, configHash: 'abc' });
    r.record(0, { type: 'move', data: { x: 1 } });
    r.record(1, { type: 'skill', data: { id: 7 } });
    expect(r.getFrames().map((f) => f.frame)).toEqual([0, 1]);
    expect(r.getFrames()[1].cmd.type).toBe('skill');
  });

  it('play re-emits the frame stream in deterministic order', () => {
    const r = new ReplayRecorder();
    r.startRun(1, 'h');
    r.record(0, { type: 'move', data: { x: 1 } });
    r.record(1, { type: 'move', data: { x: 2 } });
    const seq: Array<[number, string]> = [];
    r.play(r.getFrames(), (frame, cmd) => seq.push([frame, cmd.type]));
    expect(seq).toEqual([[0, 'move'], [1, 'move']]);
  });

  it('same seed + same input stream yields identical replay (determinism proof)', () => {
    const build = (): Array<[number, string]> => {
      const r = new ReplayRecorder();
      r.startRun(777, 'cfg');
      r.record(0, { type: 'move', data: { x: 1 } });
      r.record(1, { type: 'dash', data: { x: -1 } });
      r.record(2, { type: 'skill', data: { id: 3 } });
      const out: Array<[number, string]> = [];
      r.play(r.getFrames(), (frame, cmd) => out.push([frame, cmd.type]));
      return out;
    };
    expect(build()).toEqual(build());
  });

  it('keeps recent N runs in the ring buffer (drops oldest)', () => {
    const r = new ReplayRecorder();
    for (let i = 0; i < 7; i++) {
      r.startRun(i, `h${i}`);
      r.record(0, { type: 'move' });
      r.endRun();
    }
    const runs = r.listRuns();
    expect(runs.length).toBe(5);
    expect(runs[0].header.seed).toBe(2); // oldest (0,1) dropped
    expect(runs[4].header.seed).toBe(6);
  });

  it('throws if record/play called before startRun', () => {
    const r = new ReplayRecorder();
    expect(() => r.record(0, { type: 'move' })).toThrow();
    expect(() => r.play([])).toThrow();
  });

  it('computeConfigHash is deterministic and input-sensitive', () => {
    expect(computeConfigHash({ a: 1 })).toBe(computeConfigHash({ a: 1 }));
    expect(computeConfigHash({ a: 1 })).not.toBe(computeConfigHash({ a: 2 }));
  });

  it('implements ILifecycle (destroy clears)', () => {
    const r = new ReplayRecorder();
    r.startRun(1, 'h');
    r.record(0, { type: 'move' });
    r.initialize(new GameContext());
    r.destroy();
    expect(r.header).toBeNull();
    expect(r.getFrames().length).toBe(0);
    expect(r.listRuns().length).toBe(0);
  });
});
