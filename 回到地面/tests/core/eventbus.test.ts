// eventbus.test.ts — EventBusManager unit tests (§3.11).
// Covers all 6 domains: subscribe/emit/unsubscribe/clear/ILifecycle.

import { describe, it, expect } from 'vitest';
import { EventBusManager, type EventDomain } from '../../assets/scripts/core/EventBusManager';

describe('EventBusManager §3.11', () => {
  it('battle: subscribe and emit', () => {
    const bus = new EventBusManager();
    const events: string[] = [];
    bus.battle.subscribe('damage_dealt', (e) => events.push(`dmg:${e.amount}`));
    bus.battle.emit({ domain: 'battle', type: 'damage_dealt', sourceId: 'a', targetId: 'b', amount: 30, isCrit: false });
    expect(events).toEqual(['dmg:30']);
    bus.destroy();
  });

  it('ui: subscribe and emit', () => {
    const bus = new EventBusManager();
    const panels: string[] = [];
    bus.ui.subscribe('panel_open', (e) => panels.push(e.panelId));
    bus.ui.emit({ domain: 'ui', type: 'panel_open', panelId: 'inventory', layer: 'main' });
    expect(panels).toEqual(['inventory']);
    bus.destroy();
  });

  it('audio: subscribe and emit', () => {
    const bus = new EventBusManager();
    const clips: string[] = [];
    bus.audio.subscribe('play', (e) => clips.push(e.clipId));
    bus.audio.emit({ domain: 'audio', type: 'play', clipId: 'bgm_main', category: 'bgm' });
    expect(clips).toEqual(['bgm_main']);
    bus.destroy();
  });

  it('scene: subscribe and emit', () => {
    const bus = new EventBusManager();
    const scenes: string[] = [];
    bus.scene.subscribe('enter', (e) => scenes.push(e.sceneId));
    bus.scene.emit({ domain: 'scene', type: 'enter', sceneId: 'dungeon', fromScene: 'menu' });
    expect(scenes).toEqual(['dungeon']);
    bus.destroy();
  });

  it('input: subscribe and emit', () => {
    const bus = new EventBusManager();
    const keys: string[] = [];
    bus.input.subscribe('key_down', (e) => keys.push(e.key));
    bus.input.emit({ domain: 'input', type: 'key_down', key: 'Space' });
    expect(keys).toEqual(['Space']);
    bus.destroy();
  });

  it('runtime: subscribe and emit', () => {
    const bus = new EventBusManager();
    const seeds: number[] = [];
    bus.runtime.subscribe('seed_assigned', (e) => seeds.push(e.seed));
    bus.runtime.emit({ domain: 'runtime', type: 'seed_assigned', seed: 42, fork: 'main' });
    expect(seeds).toEqual([42]);
    bus.destroy();
  });

  it('unsubscribe removes handler', () => {
    const bus = new EventBusManager();
    const events: string[] = [];
    const handler = (e: { domain: 'battle'; type: 'damage_dealt'; sourceId: string; targetId: string; amount: number; isCrit: boolean }) => {
      events.push('x');
    };
    bus.battle.subscribe('damage_dealt', handler);
    bus.battle.unsubscribe('damage_dealt', handler);
    bus.battle.emit({ domain: 'battle', type: 'damage_dealt', sourceId: 'a', targetId: 'b', amount: 10, isCrit: false });
    expect(events).toEqual([]);
    bus.destroy();
  });

  it('clearAll removes all handlers across all domains', () => {
    const bus = new EventBusManager();
    let count = 0;
    bus.battle.subscribe('damage_dealt', () => count++);
    bus.ui.subscribe('panel_open', () => count++);
    bus.clearAll();
    bus.battle.emit({ domain: 'battle', type: 'damage_dealt', sourceId: 'a', targetId: 'b', amount: 10, isCrit: false });
    bus.ui.emit({ domain: 'ui', type: 'panel_open', panelId: 'x', layer: 'y' });
    expect(count).toBe(0);
    bus.destroy();
  });

  it('ILifecycle exit clears handlers', () => {
    const bus = new EventBusManager();
    let called = false;
    bus.audio.subscribe('stop', () => { called = true; });
    bus.exit();
    bus.audio.emit({ domain: 'audio', type: 'stop' });
    expect(called).toBe(false);
    bus.destroy();
  });

  it('ILifecycle destroy clears state', () => {
    const bus = new EventBusManager();
    bus.initialize({} as any);
    expect(bus.initialized).toBe(true);
    bus.destroy();
    expect(bus.initialized).toBe(false);
  });
});
