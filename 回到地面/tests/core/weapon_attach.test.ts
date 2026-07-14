import { describe, it, expect } from 'vitest';
import {
  resolveSocketByName,
  playerClipName,
  SocketNodeLike,
} from '../../assets/scripts/render/model_clip';

function n(name: string, children: SocketNodeLike[] = []): SocketNodeLike {
  return { name, children };
}

describe('resolveSocketByName', () => {
  const tree: SocketNodeLike = n('Root', [
    n('Hips', [n('Spine', [n('RightHand', [n('Weapon')])])]),
    n('mixamorig:Head'),
  ]);

  it('finds the primary socket by name', () => {
    expect(resolveSocketByName(tree, 'Weapon')?.name).toBe('Weapon');
  });

  it('is case-insensitive and strips the mixamorig: prefix', () => {
    expect(resolveSocketByName(tree, 'weapon')?.name).toBe('Weapon');
  });

  it('falls back to RightHand when Weapon is absent', () => {
    const t = n('Root', [n('RightHand')]);
    expect(resolveSocketByName(t, 'Weapon', 'RightHand')?.name).toBe('RightHand');
  });

  it('returns null when neither socket exists', () => {
    const t = n('Root', [n('Head')]);
    expect(resolveSocketByName(t, 'Weapon', 'RightHand')).toBeNull();
  });
});

describe('playerClipName', () => {
  it('prefixes player_ to the action', () => {
    expect(playerClipName('idle')).toBe('player_idle');
    expect(playerClipName('attack')).toBe('player_attack');
    expect(playerClipName('skill')).toBe('player_skill');
  });
});
