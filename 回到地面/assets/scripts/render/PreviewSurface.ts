/**
 * PreviewSurface.ts — Offscreen 3D preview base for UI (RenderTexture + slot).
 *
 * Root cause: main/splash main cameras are orthographic (projection=0) and do
 * not render 3D; and UI coordinates / camera projection / Canvas scale /
 * resolution / orientation all affect "putting a 3D model on top of UI". That
 * is why CreatePanel kept being "almost right but never right".
 *
 * Curative route (this module): do NOT put the 3D model on the UI. Instead
 * render it offscreen into a RenderTexture, then paste that texture back onto a
 * UI Sprite living inside the business panel's slot node:
 *
 *   3D model (PREVIEW layer, offscreen rig)
 *     -> PreviewCamera (targetTexture = RenderTexture)
 *     -> SpriteFrame(texture = RenderTexture)
 *     -> UI Sprite (child of the slot node, follows its UITransform)
 *
 * Zero coupling with CharacterVisualService / CharacterModelAssembler: this
 * module only exposes `modelRoot` + `previewLayer` for the upper layer (T1B)
 * to mount a model onto.
 *
 * Engine-side (cc); not vitest-runnable. The pure layer pool lives in
 * preview_layer_pool.ts and is unit-tested.
 */

import {
  Camera,
  Color,
  DepthStencilFormat,
  director,
  Director,
  isValid,
  Node,
  PixelFormat,
  RenderTexture,
  Sprite,
  SpriteFrame,
  UITransform,
  view,
} from 'cc';

import { DEFAULT_PREVIEW_LAYERS, PreviewLayerPool } from './preview_layer_pool';

export interface SurfaceHandle {
  /** UI-side node: a Sprite child placed inside the slot, displaying the RT. */
  readonly surfaceNode: Node;
  /** 3D-side node: empty node under the offscreen rig, on the preview layer. Mount models here. */
  readonly modelRoot: Node;
  /** Preview layer bitmask this surface uses (mount models with this layer). */
  readonly previewLayer: number;
  readonly camera: Camera;
  readonly renderTexture: RenderTexture;
  destroy(): void;
}

const RIG_ROOT_NAME = '__UIPreviewRig__';
const RIG_NODE_NAME = '__UIPreviewRigNode__';
const MODEL_ROOT_NAME = '__PreviewModelRoot__';
const CAMERA_NODE_NAME = '__PreviewCamera__';
const SURFACE_NODE_NAME = '__PreviewSurface__';
const RT_MIN = 128;
const RT_MAX = 1024;
const RIG_SPACING = 100000;

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

function devicePixelRatio(): number {
  const dpr = view.getDevicePixelRatio?.() ?? 1;
  return clamp(dpr, 1, 2);
}

class SurfaceHandleImpl implements SurfaceHandle {
  private _destroyed = false;

  constructor(
    public readonly surfaceNode: Node,
    public readonly modelRoot: Node,
    public readonly previewLayer: number,
    public readonly camera: Camera,
    public readonly renderTexture: RenderTexture,
    private readonly _rigNode: Node,
    private readonly _onDestroy: (self: SurfaceHandleImpl) => void,
  ) {}

  get destroyed(): boolean {
    return this._destroyed;
  }

  destroy(): void {
    if (this._destroyed) return;
    this._destroyed = true;

    if (isValid(this._rigNode)) this._rigNode.destroy();
    if (isValid(this.surfaceNode)) this.surfaceNode.destroy();
    if (isValid(this.renderTexture)) this.renderTexture.destroy();

    this._onDestroy(this);
  }
}

export class PreviewSurface {
  private static _instance: PreviewSurface | null = null;

  static get instance(): PreviewSurface {
    if (!this._instance) this._instance = new PreviewSurface();
    return this._instance;
  }

  private readonly _layerPool = new PreviewLayerPool(DEFAULT_PREVIEW_LAYERS);
  private _rigRoot: Node | null = null;
  private _seq = 0;
  private readonly _byOwner = new Map<string, SurfaceHandleImpl[]>();
  private _sceneHookBound = false;

  private constructor() {}

  /**
   * Create an offscreen preview surface for `slotNode`:
   * allocate a layer -> build RT -> build a preview camera (targetTexture=RT)
   * -> attach a Sprite inside the slot showing the RT. Returns a handle, or
   * `null` when the layer pool is exhausted (fail-fast; no surface is created).
   */
  acquire(slotNode: Node, opts?: {
    width?: number;
    height?: number;
    transparent?: boolean;
    clearColor?: Color;
    fov?: number;
    cameraDistance?: number;
    ownerId?: string;
  }): SurfaceHandle | null {
    const slotUI = slotNode.getComponent(UITransform);
    if (!slotUI) {
      console.warn('[PreviewSurface] slotNode has no UITransform; cannot size surface');
      return null;
    }

    const ownerId = opts?.ownerId ?? '__default__';
    const layer = this._layerPool.allocate(ownerId);
    if (layer === null) {
      console.warn('[PreviewSurface] preview layer pool exhausted (fail-fast); no surface created');
      return null;
    }

    const dpr = devicePixelRatio();
    const rtWidth = clamp(Math.ceil(slotUI.width * dpr), RT_MIN, RT_MAX);
    const rtHeight = clamp(Math.ceil(slotUI.height * dpr), RT_MIN, RT_MAX);

    const rt = new RenderTexture();
    rt.reset({
      width: rtWidth,
      height: rtHeight,
      format: PixelFormat.RGBA8888,
      depthStencilFormat: DepthStencilFormat.DEPTH_24,
    });

    const rigRoot = this._ensureRigRoot();
    if (!rigRoot) {
      console.warn('[PreviewSurface] no active scene to host the preview rig; aborting');
      this._layerPool.release(layer);
      if (isValid(rt)) rt.destroy();
      return null;
    }

    const rigX = this._seq * RIG_SPACING;
    this._seq++;

    const rigNode = new Node(RIG_NODE_NAME);
    rigNode.layer = layer;
    rigNode.setPosition(rigX, 0, 0);
    rigRoot.addChild(rigNode);

    const modelRoot = new Node(MODEL_ROOT_NAME);
    modelRoot.layer = layer;
    modelRoot.setPosition(0, 0, 0);
    rigNode.addChild(modelRoot);

    const camNode = new Node(CAMERA_NODE_NAME);
    camNode.layer = layer;
    camNode.setPosition(0, 0, opts?.cameraDistance ?? 200);
    rigNode.addChild(camNode);

    const camera = camNode.addComponent(Camera);
    camera.projection = Camera.ProjectionType.PERSPECTIVE;
    camera.fov = opts?.fov ?? 45;
    camera.near = 1;
    camera.far = 2000;
    camera.visibility = layer;
    camera.clearFlags = Camera.ClearFlag.SOLID_COLOR;
    camera.clearColor = opts?.clearColor ?? (opts?.transparent ? new Color(0, 0, 0, 0) : new Color(0, 0, 0, 255));
    camera.targetTexture = rt;

    // UI Sprite surface inside the slot.
    const existing = slotNode.getChildByName(SURFACE_NODE_NAME);
    if (existing) existing.destroy();

    const surfaceNode = new Node(SURFACE_NODE_NAME);
    const surfUI = surfaceNode.addComponent(UITransform);
    surfUI.setContentSize(slotUI.width, slotUI.height);
    surfUI.anchorX = 0.5;
    surfUI.anchorY = 0.5;
    surfaceNode.setPosition(0, 0, 0);
    surfaceNode.layer = slotNode.layer;

    const sprite = surfaceNode.addComponent(Sprite);
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    sprite.type = Sprite.Type.SIMPLE;

    const sf = new SpriteFrame();
    sf.texture = rt;
    sf.flipUVY = true;
    sf.packable = false;
    sprite.spriteFrame = sf;

    slotNode.addChild(surfaceNode);

    if (!this._byOwner.has(ownerId)) this._byOwner.set(ownerId, []);

    const handle = new SurfaceHandleImpl(
      surfaceNode,
      modelRoot,
      layer,
      camera,
      rt,
      rigNode,
      (self) => this._releaseHandle(self, ownerId),
    );
    this._byOwner.get(ownerId)!.push(handle);

    this._ensureSceneHook();

    return handle;
  }

  /** Release every surface owned by `ownerId` (call on panel close). */
  clearOwner(ownerId: string): void {
    const list = this._byOwner.get(ownerId);
    if (!list) return;
    // Copy: destroying triggers _releaseHandle which mutates the list.
    for (const h of [...list]) h.destroy();
    this._byOwner.delete(ownerId);
  }

  private _releaseHandle(handle: SurfaceHandleImpl, ownerId: string): void {
    this._layerPool.release(handle.previewLayer);
    const list = this._byOwner.get(ownerId);
    if (list) {
      const idx = list.indexOf(handle);
      if (idx >= 0) list.splice(idx, 1);
    }
  }

  private _ensureRigRoot(): Node | null {
    if (this._rigRoot && isValid(this._rigRoot)) return this._rigRoot;
    const scene = director.getScene();
    if (!scene) return null;
    const root = new Node(RIG_ROOT_NAME);
    scene.addChild(root);
    this._rigRoot = root;
    return root;
  }

  private _ensureSceneHook(): void {
    if (this._sceneHookBound) return;
    this._sceneHookBound = true;
    director.on(Director.EVENT_BEFORE_SCENE_LAUNCH, this._onSceneLaunch, this);
  }

  private _onSceneLaunch(): void {
    // The rig root lives under the old scene and is destroyed with it.
    // Just release our references + layers.
    for (const list of this._byOwner.values()) {
      for (const h of [...list]) h.destroy();
    }
    this._byOwner.clear();
    this._rigRoot = null;
    this._seq = 0;
  }
}
