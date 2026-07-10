// ModelRenderService.ts — mounts a 3D model, plays idle, drives release via AssetCache (§3.6 / Demo1).
//
// This class references `cc` (engine runtime), so it CANNOT run under node/vitest.
// Its ref-count logic is delegated to AssetCache (pure TS, unit-tested). Engine-side
// verification (load a .glb, play idle, release on ref-zero) requires the Cocos runtime
// + 3D assets, and is documented as not CI-runnable (see REPORT_demo1.md).
//
// Authoritative spec: docs/2D转3D全面升级方案.md §3.6.

import { Node, Prefab, instantiate, SkeletalAnimation, Animation } from 'cc';
import type { GameContext } from '../core/GameContext';
import { IAssetCache } from '../core/GameContext';
import type { AssetCache } from '../assets/AssetCache';

export class ModelRenderService {
  constructor(private readonly _ctx: GameContext) {}

  /** Load (ref+1) the model prefab via AssetCache and mount it under `node`. Plays idle. */
  async attach(node: Node, modelId: string): Promise<Node> {
    const cache = this._ctx.get<AssetCache>(IAssetCache);
    const prefab = (await cache.load(modelId)) as Prefab;
    const modelNode = instantiate(prefab);
    node.addChild(modelNode);

    const anim = modelNode.getComponent(SkeletalAnimation) ?? modelNode.getComponent(Animation);
    if (anim) {
      // Prefer an explicit idle clip; fall back to default. Best-effort, non-fatal.
      const idle = anim.getState('idle');
      if (idle) anim.play('idle');
      else anim.play();
    }
    return modelNode;
  }

  /** Release (ref-1) the model in AssetCache. Node teardown is owned by the caller/scene. */
  detach(modelId: string): void {
    const cache = this._ctx.get<AssetCache>(IAssetCache);
    cache.release(modelId);
  }
}
