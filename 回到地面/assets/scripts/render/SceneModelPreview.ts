/**
 * SceneModelPreview.ts — Panel-level facade for UI 3D previews.
 *
 * T1A (PreviewSurface) only provides the "offscreen base" (RenderTexture +
 * camera + user layer + slot Sprite); it knows nothing about characters.
 * Business panels (CreatePanel / CharacterPanel / MainMenu / Splash) want a
 * one-liner: "show this character/model inside this slot node".
 *
 * This module is that facade:
 *   slotNode -> PreviewSurface.acquire() -> mount model onto handle.modelRoot
 *   (100% delegated to the existing CharacterVisualService /
 *   CharacterModelAssembler chain) -> return a PreviewHandle.
 *
 * It implements NO mounting / scaling / material logic of its own (that all
 * lives in CharacterVisualService / CharacterModelAssembler). It only wires:
 *   接 slot -> 拿底座 -> 委托挂载 -> 管 handle。
 *
 * Engine-side (cc); not vitest-runnable. The pure layer pool it depends on
 * (via PreviewSurface) is unit-tested in preview_layer_pool.test.ts.
 */

import { find, Node } from 'cc';

import { PreviewSurface, SurfaceHandle } from './PreviewSurface';
import { CharacterVisualService } from './CharacterVisualService';
import { CharacterModelAssembler } from './CharacterModelAssembler';

export interface PreviewHandle {
  /** UI-side Sprite node inside the slot (from T1A). */
  readonly surfaceNode: Node;
  /** 3D-side model mount root (from T1A, already on the PREVIEW layer). */
  readonly modelRoot: Node;
  /** Switch action (delegated to the underlying render chain). */
  setAction(action: string): void;
  destroy(): void;
}

/** ownerId -> full-screen backdrop slot path. Nodes are created by T4/T5, NOT here. */
const BACKDROP_SLOT_BY_OWNER: Readonly<Record<string, string>> = {
  MainScene: 'Canvas/MainMenuBackdrop3D',
  Splash: 'Canvas/SplashBackdrop3D',
};

const DEFAULT_OWNER = '__default__';
const DEFAULT_FPS = 8;
const DEFAULT_ACTION = 'idle';

class PreviewHandleImpl implements PreviewHandle {
  constructor(
    private readonly _surface: SurfaceHandle,
    private readonly _setActionFn: (action: string) => void,
  ) {}

  get surfaceNode(): Node {
    return this._surface.surfaceNode;
  }

  get modelRoot(): Node {
    return this._surface.modelRoot;
  }

  setAction(action: string): void {
    this._setActionFn(action);
  }

  destroy(): void {
    this._surface.destroy();
  }
}

export class SceneModelPreview {
  private static _instance: SceneModelPreview | null = null;

  static get instance(): SceneModelPreview {
    if (!this._instance) this._instance = new SceneModelPreview();
    return this._instance;
  }

  private constructor() {}

  /**
   * Show a character (3D preferred, 2D fallback) inside a UI slot. Most common.
   * visualKey is composed internally as `character.${id}.${action}`.
   * Returns null on a safe no-op (layer pool exhausted or render failed).
   */
  async showCharacterInSlot(
    slotNode: Node,
    characterId: string,
    action: string = DEFAULT_ACTION,
    opts?: {
      ownerId?: string;
      forceUnlit?: boolean;
      fps?: number;
      width?: number;
      height?: number;
      transparent?: boolean;
    },
  ): Promise<PreviewHandle | null> {
    const ownerId = opts?.ownerId ?? DEFAULT_OWNER;
    const surface = PreviewSurface.instance.acquire(slotNode, {
      width: opts?.width,
      height: opts?.height,
      transparent: opts?.transparent,
      ownerId,
    });
    if (!surface) {
      console.warn('[SceneModelPreview] no preview surface available (layer pool exhausted)');
      return null;
    }

    const fps = opts?.fps ?? DEFAULT_FPS;
    const forceUnlit = opts?.forceUnlit ?? true;
    const visualKey = `character.${characterId}.${action}`;
    const ok = await CharacterVisualService.instance.play(
      surface.modelRoot, visualKey, fps, forceUnlit, surface.previewLayer,
    );
    if (!ok) {
      surface.destroy();
      return null;
    }

    return new PreviewHandleImpl(surface, (a: string) => {
      // play() re-uses the mounted model (isMounted -> clip swap), so this is cheap.
      void CharacterVisualService.instance.play(
        surface.modelRoot, `character.${characterId}.${a}`, fps, forceUnlit, surface.previewLayer,
      );
    });
  }

  /**
   * Show an arbitrary model asset (no character key, e.g. equipment/props)
   * inside a UI slot. Returns null on a safe no-op.
   */
  async showModelInSlot(
    slotNode: Node,
    modelAssetId: string,
    opts?: {
      ownerId?: string;
      forceUnlit?: boolean;
      action?: string;
      width?: number;
      height?: number;
      transparent?: boolean;
    },
  ): Promise<PreviewHandle | null> {
    const ownerId = opts?.ownerId ?? DEFAULT_OWNER;
    const surface = PreviewSurface.instance.acquire(slotNode, {
      width: opts?.width,
      height: opts?.height,
      transparent: opts?.transparent,
      ownerId,
    });
    if (!surface) {
      console.warn('[SceneModelPreview] no preview surface available (layer pool exhausted)');
      return null;
    }

    const forceUnlit = opts?.forceUnlit ?? true;
    const action = opts?.action ?? DEFAULT_ACTION;
    const ok = await CharacterModelAssembler.instance.mount(
      surface.modelRoot, modelAssetId, undefined, 'Weapon', action, forceUnlit, surface.previewLayer,
    );
    if (!ok) {
      surface.destroy();
      return null;
    }

    return new PreviewHandleImpl(surface, (a: string) => {
      CharacterModelAssembler.instance.play(surface.modelRoot, a);
    });
  }

  /**
   * Full-screen 3D backdrop — canonical API: caller passes the already-created
   * full-screen slot node. Internally equivalent to
   * `showModelInSlot(slotNode, backdropModelAssetId, opts)` (semantic alias).
   */
  async showBackdropInSlot(
    slotNode: Node,
    backdropModelAssetId: string,
    opts?: { ownerId?: string; transparent?: boolean; fallback2dKey?: string },
  ): Promise<PreviewHandle | null> {
    if (!backdropModelAssetId) return null; // no-op; keep existing 2D background
    return this.showModelInSlot(slotNode, backdropModelAssetId, {
      ownerId: opts?.ownerId,
      transparent: opts?.transparent,
    });
  }

  /**
   * Full-screen 3D backdrop convenience wrapper: resolves the full-screen slot
   * by ownerId convention, then delegates to `showBackdropInSlot`.
   *   - ownerId='MainScene' -> resolves `Canvas/MainMenuBackdrop3D` (node created by T4)
   *   - ownerId='Splash'    -> resolves `Canvas/SplashBackdrop3D`   (node created by T5)
   * If the slot node does not exist -> returns null (does NOT auto-create nodes;
   * node creation is T4/T5's responsibility). Config source + 2D fallback also
   * live in T4/T5 (this facade does not read config).
   */
  async showBackdrop(
    backdropModelAssetId: string,
    opts?: { ownerId?: string; transparent?: boolean; fallback2dKey?: string },
  ): Promise<PreviewHandle | null> {
    if (!backdropModelAssetId) return null; // no-op; keep existing 2D background

    const ownerId = opts?.ownerId ?? 'MainScene';
    const slotPath = BACKDROP_SLOT_BY_OWNER[ownerId];
    if (!slotPath) {
      console.warn(`[SceneModelPreview] unknown backdrop ownerId: ${ownerId}`);
      return null;
    }

    const slotNode = find(slotPath);
    if (!slotNode) {
      console.warn(
        `[SceneModelPreview] backdrop slot not found: ${slotPath} (node creation is T4/T5's job)`,
      );
      return null;
    }

    return this.showBackdropInSlot(slotNode, backdropModelAssetId, opts);
  }

  /** Release every preview owned by `ownerId` (call on panel close). */
  clearOwner(ownerId: string): void {
    // Single source of truth: T1A owns the surface registry + layer recycling.
    PreviewSurface.instance.clearOwner(ownerId);
  }
}
