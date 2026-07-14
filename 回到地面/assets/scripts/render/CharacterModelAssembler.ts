// CharacterModelAssembler.ts - Route B runtime assembly of a 3D character.
//
// Mounts the character model prefab, then attaches its dependency weapon onto
// the configured socket. All loads go through AssetBundleService.tryLoadById so
// a missing/un-imported asset degrades to a no-op instead of throwing (consistent
// with the PreviewInEditor fix). When the 3D asset is absent the caller (usually
// CharacterVisualService) falls back to the 2D parts/sheet path.
//
// Engine-side (cc); not vitest-runnable. The pure clip-name helper lives in
// model_clip.ts and is unit-tested.

import { Animation, Color, director, DirectionalLight, instantiate, Layers, Material, MeshRenderer, Node, PointLight, Prefab, SkeletalAnimation, SkinnedMeshRenderer, Vec3 } from 'cc';
import { AssetBundleService } from '../assets/AssetBundleService';
import { WeaponAttachService } from './WeaponAttachService';
import { playerClipName } from './model_clip';

export const MODEL_NODE_NAME = '__character_model__';

export class CharacterModelAssembler {
  private static _instance: CharacterModelAssembler | null = null;
  static get instance(): CharacterModelAssembler {
    if (!this._instance) this._instance = new CharacterModelAssembler();
    return this._instance;
  }

  // Imported weapon GLBs often have the mesh pivot offset from the model origin.
  // Shift the weapon root so the mesh's world bounding-box center lands on the
  // socket. This fixes "weapon floating next to hand" without requiring manual
  // prefab edits for every weapon.
  private _alignWeaponToSocket(weaponNode: Node, socket: Node): void {
    const renderer = weaponNode.getComponentInChildren(MeshRenderer);
    const model = renderer?.model;
    const bounds = model?.worldBounds;
    if (!bounds) {
      console.warn('[CharacterModelAssembler] weapon has no bounds, skipping auto-align');
      return;
    }
    const halfExtents = (bounds as unknown as { halfExtents?: Vec3 }).halfExtents;
    const center = halfExtents ? new Vec3(
      bounds.center.x,
      bounds.center.y,
      bounds.center.z,
    ) : bounds.center;
    if (!center) {
      console.warn('[CharacterModelAssembler] weapon bounds center unavailable');
      return;
    }
    // Current mesh center in world space. Socket world position is where we want it.
    const socketPos = socket.worldPosition;
    const deltaWorld = new Vec3(center.x - socketPos.x, center.y - socketPos.y, center.z - socketPos.z);
    // Convert world delta to weapon local space (approximate; assumes socket scale uniform).
    const socketScale = socket.worldScale;
    const invScaleX = socketScale.x !== 0 ? 1 / socketScale.x : 1;
    const invScaleY = socketScale.y !== 0 ? 1 / socketScale.y : 1;
    const invScaleZ = socketScale.z !== 0 ? 1 / socketScale.z : 1;
    const localDelta = new Vec3(deltaWorld.x * invScaleX, deltaWorld.y * invScaleY, deltaWorld.z * invScaleZ);
    weaponNode.setPosition(-localDelta.x, -localDelta.y, -localDelta.z);
    console.warn(
      '[CharacterModelAssembler] aligned weapon; meshCenter=', center.toString(),
      'socketPos=', socketPos.toString(),
      'shift=', localDelta.toString(),
    );
  }

  isMounted(node: Node): boolean {
    return node.getChildByName(MODEL_NODE_NAME) !== null;
  }

  // Cocos 3.8's runtime export of Layers.Enum.UI_2D is not reliable in the
  // packer-driver build used by this project. Resolve the layer by name first,
  // then enum, then fall back to the documented runtime value.
  //
  // Important: nameToLayer returns the layer INDEX (0..31), but Node.layer
  // expects a bitmask. Convert it with 1 << index before assigning.
  private _resolveUiLayer(): number {
    try {
      const index = (Layers as unknown as { nameToLayer?: (name: string) => number }).nameToLayer?.('UI_2D');
      if (typeof index === 'number' && index >= 0 && index < 32) {
        const mask = 1 << index;
        console.warn('[CharacterModelAssembler] resolved UI_2D layer by name: index=', index, 'mask=', mask);
        return mask;
      }
    } catch { /* ignore */ }
    try {
      const enumLayer = (Layers as unknown as { Enum?: { UI_2D?: number } }).Enum?.UI_2D;
      if (typeof enumLayer === 'number' && enumLayer > 0) {
        console.warn('[CharacterModelAssembler] resolved UI_2D layer by enum:', enumLayer);
        return enumLayer;
      }
    } catch { /* ignore */ }
    console.warn('[CharacterModelAssembler] using hardcoded UI_2D layer:', 33554432);
    return 33554432;
  }

  async mount(
    node: Node,
    modelAssetId: string,
    weaponAssetId?: string,
    weaponSocket = 'Weapon',
    action = 'idle',
    forceUnlit = false,
    targetLayerArg?: number,
  ): Promise<boolean> {
    console.warn('[CharacterModelAssembler] mount requested:', modelAssetId, 'on', node.name, 'action=', action, 'parentLayer=', node.layer);
    let modelNode = node.getChildByName(MODEL_NODE_NAME);
    if (!modelNode) {
      const prefab = await AssetBundleService.instance.tryLoadById<Prefab>(modelAssetId);
      if (!prefab) {
        console.warn('[CharacterModelAssembler] FAILED to load prefab:', modelAssetId, '(asset map not loaded or path wrong)');
        return false;
      }
      console.warn('[CharacterModelAssembler] prefab loaded:', modelAssetId, 'instantiating...');
      modelNode = instantiate(prefab);
      modelNode.name = MODEL_NODE_NAME;
      // Imported GLB models often have their mesh vertices offset far from the
      // prefab root origin (e.g. the original exporter placed the mesh at z=-50).
      // If we only reset the root position to (0,0,0), the actual geometry can
      // still sit outside the camera frustum and be clipped. After auto-fit we
      // shift the root so the geometry center lands on the desired local origin.
      modelNode.setPosition(0, 0, 0);
      modelNode.setRotationFromEuler(0, 0, 0);
      modelNode.setScale(1, 1, 1);

      // Imported GLB models often sit on a non-UI layer (e.g. PROFILER / 1073741824)
      // that the Canvas/UI camera does NOT render. Always force the whole model
      // subtree onto the desired layer so it is visible in both dungeon and
      // character preview scenes, regardless of the parent node's layer.
      //
      // Note: Layers.Enum.UI_2D is not reliably available in this engine build, so
      // we resolve the layer by name and fall back to the known runtime value.
      const targetLayer = targetLayerArg ?? this._resolveUiLayer();
      const applyLayer = (n: Node) => { n.layer = targetLayer; n.children.forEach(applyLayer); };
      applyLayer(modelNode);

      node.addChild(modelNode);
      // Keep the model on top of other siblings in the same preview area so it is
      // not overdrawn by UI decorations or background sprites.
      modelNode.setSiblingIndex(node.children.length - 1);
      console.warn(
        '[CharacterModelAssembler] model node added under', node.name,
        'children=', node.children.length,
        'modelLayer=', modelNode.layer,
        'targetLayer=', targetLayer,
        'worldPos=', modelNode.worldPosition?.toString(),
        'worldScale=', modelNode.worldScale?.toString(),
      );

      // UI scenes (e.g. character creation preview) may have no 3D lighting or
      // environment map, so imported PBR models render black there. For those
      // scenes we force a built-in `unlit` material that is guaranteed visible
      // without any lighting. Dungeon keeps the lit (PBR) path via _ensureVisibility.
      if (forceUnlit) {
        this._forceUnlitMaterials(modelNode);
      } else {
        this._ensureVisibility(modelNode);
      }

      // Auto-fit: GLB models are meter-scaled, but the dungeon is a pixel-based UI
      // scene, so at scale 1,1,1 the model would be ~1px tall. Fit its largest
      // extent to a visible target height.
      this._autoFitScale(modelNode, 120);

      if (weaponAssetId) {
        const weapon = await AssetBundleService.instance.tryLoadById<Prefab>(weaponAssetId);
        if (weapon) {
          const socket = WeaponAttachService.resolveSocket(modelNode, weaponSocket, 'RightHand');
          if (socket) {
            const weaponNode = WeaponAttachService.attach(socket, weapon);
            this._alignWeaponToSocket(weaponNode, socket);
          } else {
            console.warn('[CharacterModelAssembler] no socket', weaponSocket, 'found on', modelAssetId);
          }
        } else {
          console.warn('[CharacterModelAssembler] failed to load weapon prefab:', weaponAssetId);
        }
      }
    }
    this._playClip(modelNode, action);
    return true;
  }

  // Scale a freshly mounted model so its largest bounding-box extent matches
  // `targetHeight` (in the parent's coordinate space). Also recenters the model
  // so its geometry center sits at the parent origin; imported GLB meshes often
  // have their vertices shifted far from the root node (e.g. z=-50), which puts
  // them outside the UI camera frustum and makes them invisible.
  private _autoFitScale(modelNode: Node, targetHeight: number): void {
    const renderer =
      modelNode.getComponentInChildren(SkinnedMeshRenderer) ??
      modelNode.getComponentInChildren(MeshRenderer) ??
      modelNode.getComponent(SkinnedMeshRenderer) ??
      modelNode.getComponent(MeshRenderer);
    console.warn('[CharacterModelAssembler] auto-fit renderer search:', renderer ? renderer.node?.name : 'NONE', 'type=', renderer?.constructor?.name);
    const model = renderer?.model;
    if (!model) {
      console.warn('[CharacterModelAssembler] no SkinnedMeshRenderer/MeshRenderer found, using fixed scale fallback');
      modelNode.setScale(60, 60, 60);
      return;
    }
    const bounds = model.worldBounds;
    if (!bounds) {
      console.warn('[CharacterModelAssembler] worldBounds unavailable, using fixed scale fallback');
      modelNode.setScale(60, 60, 60);
      return;
    }
    // Cocos AABB API: halfExtents is always available; size = halfExtents * 2.
    // The getSize() helper does not exist on this engine version.
    const halfExtents = (bounds as unknown as { halfExtents?: Vec3 }).halfExtents;
    if (!halfExtents) {
      console.warn('[CharacterModelAssembler] missing halfExtents, using fixed scale fallback');
      modelNode.setScale(60, 60, 60);
      return;
    }
    const extent = Math.max(halfExtents.x, halfExtents.y, halfExtents.z) * 2;
    if (extent <= 0) {
      console.warn('[CharacterModelAssembler] zero extent, using fixed scale fallback');
      modelNode.setScale(60, 60, 60);
      return;
    }
    const s = targetHeight / extent;
    modelNode.setScale(s, s, s);
    // Recenter: shift the root so the geometry center lands on the parent origin.
    // After setScale, the world bounds are updated in the next frame; use the
    // current bounds center divided by the new scale to estimate the local offset.
    const center = (bounds as unknown as { center?: Vec3 }).center;
    if (center) {
      const localOffset = new Vec3(center.x / s, center.y / s, center.z / s);
      modelNode.setPosition(-localOffset.x, -localOffset.y, -localOffset.z);
      console.warn(
        '[CharacterModelAssembler] auto-fit scale=', s.toFixed(3),
        'extent=', extent.toFixed(3), '-> height~', targetHeight,
        'geometryCenter=', center.toString(),
        'localOffset=', localOffset.toString(),
        'newWorldCenter=', model.worldBounds?.center?.toString() ?? 'N/A',
        'modelWorldPos=', modelNode.worldPosition?.toString(),
      );
    } else {
      console.warn('[CharacterModelAssembler] auto-fit scale=', s.toFixed(3), 'extent=', extent.toFixed(3), '-> height~', targetHeight, 'modelWorldPos=', modelNode.worldPosition?.toString());
    }
  }

  play(node: Node, action: string): void {
    const modelNode = node.getChildByName(MODEL_NODE_NAME);
    if (modelNode) this._playClip(modelNode, action);
  }

  private _playClip(modelNode: Node, action: string): void {
    const anim = modelNode.getComponent(SkeletalAnimation) ?? modelNode.getComponent(Animation);
    if (!anim) return;
    const clip = playerClipName(action);
    const state = anim.getState(clip);
    if (state) {
      anim.play(clip);
      return;
    }
    const idle = anim.getState('idle');
    if (idle) anim.play('idle');
    else anim.play();
  }

  private _ensureVisibility(modelNode: Node): void {
    // Avoid adding duplicate helpers if the model is re-mounted.
    if (modelNode.getChildByName('__model_light__')) return;

    // 1) Local lights so the model is lit even in UI scenes with no scene light.
    const lightNode = new Node('__model_light__');
    const dir = lightNode.addComponent(DirectionalLight);
    dir.illuminance = 120000;
    dir.color = Color.WHITE;
    lightNode.setRotationFromEuler(-45, 30, 0);
    lightNode.setPosition(0, 5, 8);
    modelNode.addChild(lightNode);

    const pointNode = new Node('__model_point__');
    const point = pointNode.addComponent(PointLight);
    point.color = Color.WHITE;
    try { (point as unknown as { intensity?: number }).intensity = 300; } catch { /* prop optional */ }
    try { (point as unknown as { range?: number }).range = 60; } catch { /* prop optional */ }
    pointNode.setPosition(0, 0, 6);
    modelNode.addChild(pointNode);

    // 2) Brighten the global ambient as a cheap fill (wrapped; may be
    //    unavailable in some scenes).
    try {
      const scene = director.getScene();
      const ambient = (scene as unknown as { globals?: { ambient?: { skyColor?: Color; groundColor?: Color; skyIllum?: number } } })?.globals?.ambient;
      if (ambient) {
        if (ambient.skyColor) ambient.skyColor = Color.WHITE;
        if (ambient.groundColor) ambient.groundColor = Color.WHITE;
        if (typeof ambient.skyIllum === 'number') ambient.skyIllum = 1.0;
      }
    } catch (e) {
      console.warn('[CharacterModelAssembler] ambient light adjustment skipped:', e);
    }

    // 3) Self-lit fallback: force every material to a low-metal, slightly
    //    emissive look so metallic / IBL-dependent PBR models still show up in
    //    UI previews where there is no environment map.
    this._makeMaterialsEmissive(modelNode);

    console.warn('[CharacterModelAssembler] ensured model visibility (local lights)');
  }

  // Guaranteed-visible fallback for UI scenes with no lighting / environment
  // map. Replaces every mesh material with the built-in `builtin-unlit` material,
  // which renders a flat color regardless of scene lights. This sidesteps the
  // PBR emissive/IBL type pitfalls that make imported models render black in UI
  // previews. Materials are set per-renderer instance (setMaterial) so the
  // imported shared assets are never mutated.
  private _forceUnlitMaterials(root: Node): void {
    const renderers = root
      .getComponentsInChildren(MeshRenderer)
      .concat(root.getComponentsInChildren(SkinnedMeshRenderer));
    let replaced = 0;
    for (const r of renderers) {
      const count = r.materials.length;
      console.warn('[CharacterModelAssembler] renderer on', r.node?.name, 'materials=', count, 'layer=', r.node?.layer, 'enabled=', r.enabled, 'nodeActive=', r.node?.active);
      for (let i = 0; i < count; i++) {
        try {
          const oldMat = r.getMaterial(i);
          console.warn('[CharacterModelAssembler]   material', i, 'old=', oldMat?.name ?? 'null', 'effect=', (oldMat as unknown as { effectName?: string })?.effectName ?? 'unknown');
          const unlit = new Material();
          unlit.initialize({ effectName: 'builtin-unlit' });
          // Neutral off-white so the model is visible against dark UI scenes without
          // looking like a diagnostic marker. Cocos Color constructor uses 0-255.
          unlit.setProperty('color', new Color(235, 235, 240, 255));
          r.setMaterial(i, unlit);
          console.warn('[CharacterModelAssembler]   material', i, 'replaced with builtin-unlit color=235,235,240,255');
          replaced++;
        } catch (e) {
          console.warn('[CharacterModelAssembler] failed to set unlit material on', r.node?.name, e);
        }
      }
    }
    console.warn('[CharacterModelAssembler] forced unlit materials:', replaced, 'renderers:', renderers.length);
  }

  // Best-effort: make every mesh material visible without depending on scene
  // lighting. Uses scalar props only (metallic / roughness) — no emissive, which
  // trips a FLOAT3 uniform type assertion in this engine build.
  private _makeMaterialsEmissive(root: Node): void {
    const renderers = root
      .getComponentsInChildren(MeshRenderer)
      .concat(root.getComponentsInChildren(SkinnedMeshRenderer));
    let touched = 0;
    const setMatProp = (mat: Record<string, unknown>, key: string, value: unknown) => {
      try {
        if (typeof mat.setProperty === 'function') mat.setProperty(key, value);
      } catch { /* ignore */ }
      try {
        if (key in mat) mat[key] = value;
      } catch { /* ignore */ }
    };
    for (const r of renderers) {
      let mats: unknown[] = [];

      // Cocos 3.8 prefers shared-material APIs; cloned getMaterials() can be
      // empty until the renderer is fully enabled, so shared refs are safer.
      try {
        const shared = (r as unknown as { getSharedMaterials?: () => (unknown | null)[] }).getSharedMaterials?.();
        if (shared) mats = shared.filter((m) => m !== null);
      } catch { /* ignore */ }
      if (!mats.length) {
        try {
          const arr = (r as unknown as { sharedMaterials?: unknown[] }).sharedMaterials;
          if (arr) mats = arr.filter((m) => m !== null);
        } catch { /* ignore */ }
      }
      if (!mats.length) {
        try {
          const m = (r as unknown as { getSharedMaterial?: (index?: number) => unknown }).getSharedMaterial?.(0);
          if (m) mats = [m];
        } catch { /* ignore */ }
      }
      if (!mats.length) {
        try {
          const m = (r as unknown as { sharedMaterial?: unknown }).sharedMaterial;
          if (m) mats = [m];
        } catch { /* ignore */ }
      }

      for (const m of mats) {
        if (!m) continue;
        touched++;
        const mat = m as Record<string, unknown>;
        // Reduce metalness so the surface responds to the local directional
        // light with a diffuse response (a pure-metal PBR surface with no IBL
        // renders black even under direct lights).
        setMatProp(mat, 'metallic', 0);
        setMatProp(mat, 'roughness', 0.7);
        setMatProp(mat, 'pbrMetallic', 0);
        setMatProp(mat, 'pbrRoughness', 0.7);
      }
    }
    console.warn('[CharacterModelAssembler] touched materials:', touched, 'renderers:', renderers.length);
  }
}
