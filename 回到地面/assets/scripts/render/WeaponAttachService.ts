// WeaponAttachService.ts - Route B runtime weapon attach.
//
// The character GLB exposes named socket nodes (e.g. "Weapon", "RightHand").
// The weapon GLB is a standalone dependency (assetmeta.depends). At runtime we
// load both prefabs and parent the weapon under the socket node, so weapon
// swapping / weapon skins remain possible without baking the weapon in.
//
// Engine-side (cc) code cannot run under node/vitest; the pure socket resolver
// lives in model_clip.ts and is unit-tested with mock nodes.

import { instantiate, Layers, Node, Prefab } from 'cc';
import { resolveSocketByName, SocketNodeLike } from './model_clip';

export const WeaponAttachService = {
  resolveSocket(root: Node, name: string, fallback?: string): Node | null {
    const found = resolveSocketByName(root as unknown as SocketNodeLike, name, fallback);
    return (found as unknown as Node) ?? null;
  },

  attach(socket: Node, weaponPrefab: Prefab): Node {
    const weapon = instantiate(weaponPrefab);
    // Reset the weapon root's local transform so it spawns exactly at the socket.
    weapon.setPosition(0, 0, 0);
    weapon.setRotationFromEuler(0, 0, 0);
    weapon.setScale(1, 1, 1);
    // Imported weapon prefabs may live on a non-UI layer (e.g. PROFILER). Force
    // the whole subtree to the fixed UI_2D layer so the UI camera draws it in any
    // scene (dungeon or character preview), regardless of the socket's layer.
    const targetLayer = Layers.Enum.UI_2D;
    const applyLayer = (n: Node) => { n.layer = targetLayer; n.children.forEach(applyLayer); };
    applyLayer(weapon);
    socket.addChild(weapon);
    console.warn(
      '[WeaponAttachService] attached weapon to socket', socket.name,
      'socketWorldPos=', socket.worldPosition?.toString(),
      'weaponWorldPos=', weapon.worldPosition?.toString(),
      'targetLayer=', targetLayer,
    );
    return weapon;
  },
};
