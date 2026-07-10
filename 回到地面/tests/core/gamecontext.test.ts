import { describe, it, expect } from 'vitest';
import {
  GameContext,
  ILogger,
  IEventBus,
} from '../../assets/scripts/core/GameContext';

describe('GameContext', () => {
  it('get throws when token is not registered', () => {
    const ctx = new GameContext();
    expect(() => ctx.get(ILogger)).toThrow();
  });

  it('register then get returns the same instance', () => {
    const ctx = new GameContext();
    const logger = { level: 1 };
    ctx.register(ILogger, logger);
    expect(ctx.get(ILogger)).toBe(logger);
  });

  it('register with a duplicate token throws', () => {
    const ctx = new GameContext();
    ctx.register(ILogger, {});
    expect(() => ctx.register(ILogger, {})).toThrow();
  });

  it('onDestroy disposes services in reverse registration order', () => {
    const ctx = new GameContext();
    const order: string[] = [];
    const mk = (name: string) => ({ onDestroy: () => order.push(name) });
    ctx.register(IEventBus, mk('A'));
    ctx.register(ILogger, mk('B'));
    ctx.onDestroy();
    expect(order).toEqual(['B', 'A']);
  });
});
