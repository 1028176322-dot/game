System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Animation, Color, director, DirectionalLight, instantiate, Layers, Material, MeshRenderer, Node, PointLight, SkeletalAnimation, SkinnedMeshRenderer, Vec3, AssetBundleService, WeaponAttachService, playerClipName, CharacterModelAssembler, _crd, MODEL_NODE_NAME;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _reportPossibleCrUseOfAssetBundleService(extras) {
    _reporterNs.report("AssetBundleService", "../assets/AssetBundleService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfWeaponAttachService(extras) {
    _reporterNs.report("WeaponAttachService", "./WeaponAttachService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfplayerClipName(extras) {
    _reporterNs.report("playerClipName", "./model_clip", _context.meta, extras);
  }

  _export("CharacterModelAssembler", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Animation = _cc.Animation;
      Color = _cc.Color;
      director = _cc.director;
      DirectionalLight = _cc.DirectionalLight;
      instantiate = _cc.instantiate;
      Layers = _cc.Layers;
      Material = _cc.Material;
      MeshRenderer = _cc.MeshRenderer;
      Node = _cc.Node;
      PointLight = _cc.PointLight;
      SkeletalAnimation = _cc.SkeletalAnimation;
      SkinnedMeshRenderer = _cc.SkinnedMeshRenderer;
      Vec3 = _cc.Vec3;
    }, function (_unresolved_2) {
      AssetBundleService = _unresolved_2.AssetBundleService;
    }, function (_unresolved_3) {
      WeaponAttachService = _unresolved_3.WeaponAttachService;
    }, function (_unresolved_4) {
      playerClipName = _unresolved_4.playerClipName;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "0c01cTuWkJAS5c11jDAeq0e", "CharacterModelAssembler", undefined); // CharacterModelAssembler.ts - Route B runtime assembly of a 3D character.
      //
      // Mounts the character model prefab, then attaches its dependency weapon onto
      // the configured socket. All loads go through AssetBundleService.tryLoadById so
      // a missing/un-imported asset degrades to a no-op instead of throwing (consistent
      // with the PreviewInEditor fix). When the 3D asset is absent the caller (usually
      // CharacterVisualService) falls back to the 2D parts/sheet path.
      //
      // Engine-side (cc); not vitest-runnable. The pure clip-name helper lives in
      // model_clip.ts and is unit-tested.


      __checkObsolete__(['Animation', 'Color', 'director', 'DirectionalLight', 'instantiate', 'Layers', 'Material', 'MeshRenderer', 'Node', 'PointLight', 'Prefab', 'SkeletalAnimation', 'SkinnedMeshRenderer', 'Vec3']);

      _export("MODEL_NODE_NAME", MODEL_NODE_NAME = '__character_model__');

      _export("CharacterModelAssembler", CharacterModelAssembler = class CharacterModelAssembler {
        static get instance() {
          if (!this._instance) this._instance = new CharacterModelAssembler();
          return this._instance;
        } // Imported weapon GLBs often have the mesh pivot offset from the model origin.
        // Shift the weapon root so the mesh's world bounding-box center lands on the
        // socket. This fixes "weapon floating next to hand" without requiring manual
        // prefab edits for every weapon.


        _alignWeaponToSocket(weaponNode, socket) {
          var renderer = weaponNode.getComponentInChildren(MeshRenderer);
          var model = renderer == null ? void 0 : renderer.model;
          var bounds = model == null ? void 0 : model.worldBounds;

          if (!bounds) {
            console.warn('[CharacterModelAssembler] weapon has no bounds, skipping auto-align');
            return;
          }

          var halfExtents = bounds.halfExtents;
          var center = halfExtents ? new Vec3(bounds.center.x, bounds.center.y, bounds.center.z) : bounds.center;

          if (!center) {
            console.warn('[CharacterModelAssembler] weapon bounds center unavailable');
            return;
          } // Current mesh center in world space. Socket world position is where we want it.


          var socketPos = socket.worldPosition;
          var deltaWorld = new Vec3(center.x - socketPos.x, center.y - socketPos.y, center.z - socketPos.z); // Convert world delta to weapon local space (approximate; assumes socket scale uniform).

          var socketScale = socket.worldScale;
          var invScaleX = socketScale.x !== 0 ? 1 / socketScale.x : 1;
          var invScaleY = socketScale.y !== 0 ? 1 / socketScale.y : 1;
          var invScaleZ = socketScale.z !== 0 ? 1 / socketScale.z : 1;
          var localDelta = new Vec3(deltaWorld.x * invScaleX, deltaWorld.y * invScaleY, deltaWorld.z * invScaleZ);
          weaponNode.setPosition(-localDelta.x, -localDelta.y, -localDelta.z);
          console.warn('[CharacterModelAssembler] aligned weapon; meshCenter=', center.toString(), 'socketPos=', socketPos.toString(), 'shift=', localDelta.toString());
        }

        isMounted(node) {
          return node.getChildByName(MODEL_NODE_NAME) !== null;
        } // Cocos 3.8's runtime export of Layers.Enum.UI_2D is not reliable in the
        // packer-driver build used by this project. Resolve the layer by name first,
        // then enum, then fall back to the documented runtime value.
        //
        // Important: nameToLayer returns the layer INDEX (0..31), but Node.layer
        // expects a bitmask. Convert it with 1 << index before assigning.


        _resolveUiLayer() {
          try {
            var _index = Layers.nameToLayer == null ? void 0 : Layers.nameToLayer('UI_2D');

            if (typeof _index === 'number' && _index >= 0 && _index < 32) {
              var mask = 1 << _index;
              console.warn('[CharacterModelAssembler] resolved UI_2D layer by name: index=', _index, 'mask=', mask);
              return mask;
            }
          } catch (_unused) {
            /* ignore */
          }

          try {
            var _Enum;

            var enumLayer = (_Enum = Layers.Enum) == null ? void 0 : _Enum.UI_2D;

            if (typeof enumLayer === 'number' && enumLayer > 0) {
              console.warn('[CharacterModelAssembler] resolved UI_2D layer by enum:', enumLayer);
              return enumLayer;
            }
          } catch (_unused2) {
            /* ignore */
          }

          console.warn('[CharacterModelAssembler] using hardcoded UI_2D layer:', 33554432);
          return 33554432;
        }

        mount(node, modelAssetId, weaponAssetId, weaponSocket, action, forceUnlit, targetLayerArg) {
          var _this = this;

          return _asyncToGenerator(function* () {
            if (weaponSocket === void 0) {
              weaponSocket = 'Weapon';
            }

            if (action === void 0) {
              action = 'idle';
            }

            if (forceUnlit === void 0) {
              forceUnlit = false;
            }

            console.warn('[CharacterModelAssembler] mount requested:', modelAssetId, 'on', node.name, 'action=', action, 'parentLayer=', node.layer);
            var modelNode = node.getChildByName(MODEL_NODE_NAME);

            if (!modelNode) {
              var _modelNode$worldPosit, _modelNode$worldScale;

              var prefab = yield (_crd && AssetBundleService === void 0 ? (_reportPossibleCrUseOfAssetBundleService({
                error: Error()
              }), AssetBundleService) : AssetBundleService).instance.tryLoadById(modelAssetId);

              if (!prefab) {
                console.warn('[CharacterModelAssembler] FAILED to load prefab:', modelAssetId, '(asset map not loaded or path wrong)');
                return false;
              }

              console.warn('[CharacterModelAssembler] prefab loaded:', modelAssetId, 'instantiating...');
              modelNode = instantiate(prefab);
              modelNode.name = MODEL_NODE_NAME; // Imported GLB models often have their mesh vertices offset far from the
              // prefab root origin (e.g. the original exporter placed the mesh at z=-50).
              // If we only reset the root position to (0,0,0), the actual geometry can
              // still sit outside the camera frustum and be clipped. After auto-fit we
              // shift the root so the geometry center lands on the desired local origin.

              modelNode.setPosition(0, 0, 0);
              modelNode.setRotationFromEuler(0, 0, 0);
              modelNode.setScale(1, 1, 1); // Imported GLB models often sit on a non-UI layer (e.g. PROFILER / 1073741824)
              // that the Canvas/UI camera does NOT render. Always force the whole model
              // subtree onto the desired layer so it is visible in both dungeon and
              // character preview scenes, regardless of the parent node's layer.
              //
              // Note: Layers.Enum.UI_2D is not reliably available in this engine build, so
              // we resolve the layer by name and fall back to the known runtime value.

              var targetLayer = targetLayerArg != null ? targetLayerArg : _this._resolveUiLayer();

              var applyLayer = n => {
                n.layer = targetLayer;
                n.children.forEach(applyLayer);
              };

              applyLayer(modelNode);
              node.addChild(modelNode); // Keep the model on top of other siblings in the same preview area so it is
              // not overdrawn by UI decorations or background sprites.

              modelNode.setSiblingIndex(node.children.length - 1);
              console.warn('[CharacterModelAssembler] model node added under', node.name, 'children=', node.children.length, 'modelLayer=', modelNode.layer, 'targetLayer=', targetLayer, 'worldPos=', (_modelNode$worldPosit = modelNode.worldPosition) == null ? void 0 : _modelNode$worldPosit.toString(), 'worldScale=', (_modelNode$worldScale = modelNode.worldScale) == null ? void 0 : _modelNode$worldScale.toString()); // UI scenes (e.g. character creation preview) may have no 3D lighting or
              // environment map, so imported PBR models render black there. For those
              // scenes we force a built-in `unlit` material that is guaranteed visible
              // without any lighting. Dungeon keeps the lit (PBR) path via _ensureVisibility.

              if (forceUnlit) {
                _this._forceUnlitMaterials(modelNode);
              } else {
                _this._ensureVisibility(modelNode);
              } // Auto-fit: GLB models are meter-scaled, but the dungeon is a pixel-based UI
              // scene, so at scale 1,1,1 the model would be ~1px tall. Fit its largest
              // extent to a visible target height.


              _this._autoFitScale(modelNode, 120);

              if (weaponAssetId) {
                var weapon = yield (_crd && AssetBundleService === void 0 ? (_reportPossibleCrUseOfAssetBundleService({
                  error: Error()
                }), AssetBundleService) : AssetBundleService).instance.tryLoadById(weaponAssetId);

                if (weapon) {
                  var socket = (_crd && WeaponAttachService === void 0 ? (_reportPossibleCrUseOfWeaponAttachService({
                    error: Error()
                  }), WeaponAttachService) : WeaponAttachService).resolveSocket(modelNode, weaponSocket, 'RightHand');

                  if (socket) {
                    var weaponNode = (_crd && WeaponAttachService === void 0 ? (_reportPossibleCrUseOfWeaponAttachService({
                      error: Error()
                    }), WeaponAttachService) : WeaponAttachService).attach(socket, weapon);

                    _this._alignWeaponToSocket(weaponNode, socket);
                  } else {
                    console.warn('[CharacterModelAssembler] no socket', weaponSocket, 'found on', modelAssetId);
                  }
                } else {
                  console.warn('[CharacterModelAssembler] failed to load weapon prefab:', weaponAssetId);
                }
              }
            }

            _this._playClip(modelNode, action);

            return true;
          })();
        } // Scale a freshly mounted model so its largest bounding-box extent matches
        // `targetHeight` (in the parent's coordinate space). Also recenters the model
        // so its geometry center sits at the parent origin; imported GLB meshes often
        // have their vertices shifted far from the root node (e.g. z=-50), which puts
        // them outside the UI camera frustum and makes them invisible.


        _autoFitScale(modelNode, targetHeight) {
          var _ref, _ref2, _modelNode$getCompone, _renderer$node, _renderer$constructor;

          var renderer = (_ref = (_ref2 = (_modelNode$getCompone = modelNode.getComponentInChildren(SkinnedMeshRenderer)) != null ? _modelNode$getCompone : modelNode.getComponentInChildren(MeshRenderer)) != null ? _ref2 : modelNode.getComponent(SkinnedMeshRenderer)) != null ? _ref : modelNode.getComponent(MeshRenderer);
          console.warn('[CharacterModelAssembler] auto-fit renderer search:', renderer ? (_renderer$node = renderer.node) == null ? void 0 : _renderer$node.name : 'NONE', 'type=', renderer == null || (_renderer$constructor = renderer.constructor) == null ? void 0 : _renderer$constructor.name);
          var model = renderer == null ? void 0 : renderer.model;

          if (!model) {
            console.warn('[CharacterModelAssembler] no SkinnedMeshRenderer/MeshRenderer found, using fixed scale fallback');
            modelNode.setScale(60, 60, 60);
            return;
          }

          var bounds = model.worldBounds;

          if (!bounds) {
            console.warn('[CharacterModelAssembler] worldBounds unavailable, using fixed scale fallback');
            modelNode.setScale(60, 60, 60);
            return;
          } // Cocos AABB API: halfExtents is always available; size = halfExtents * 2.
          // The getSize() helper does not exist on this engine version.


          var halfExtents = bounds.halfExtents;

          if (!halfExtents) {
            console.warn('[CharacterModelAssembler] missing halfExtents, using fixed scale fallback');
            modelNode.setScale(60, 60, 60);
            return;
          }

          var extent = Math.max(halfExtents.x, halfExtents.y, halfExtents.z) * 2;

          if (extent <= 0) {
            console.warn('[CharacterModelAssembler] zero extent, using fixed scale fallback');
            modelNode.setScale(60, 60, 60);
            return;
          }

          var s = targetHeight / extent;
          modelNode.setScale(s, s, s); // Recenter: shift the root so the geometry center lands on the parent origin.
          // After setScale, the world bounds are updated in the next frame; use the
          // current bounds center divided by the new scale to estimate the local offset.

          var center = bounds.center;

          if (center) {
            var _model$worldBounds$ce, _model$worldBounds, _modelNode$worldPosit2;

            var localOffset = new Vec3(center.x / s, center.y / s, center.z / s);
            modelNode.setPosition(-localOffset.x, -localOffset.y, -localOffset.z);
            console.warn('[CharacterModelAssembler] auto-fit scale=', s.toFixed(3), 'extent=', extent.toFixed(3), '-> height~', targetHeight, 'geometryCenter=', center.toString(), 'localOffset=', localOffset.toString(), 'newWorldCenter=', (_model$worldBounds$ce = (_model$worldBounds = model.worldBounds) == null || (_model$worldBounds = _model$worldBounds.center) == null ? void 0 : _model$worldBounds.toString()) != null ? _model$worldBounds$ce : 'N/A', 'modelWorldPos=', (_modelNode$worldPosit2 = modelNode.worldPosition) == null ? void 0 : _modelNode$worldPosit2.toString());
          } else {
            var _modelNode$worldPosit3;

            console.warn('[CharacterModelAssembler] auto-fit scale=', s.toFixed(3), 'extent=', extent.toFixed(3), '-> height~', targetHeight, 'modelWorldPos=', (_modelNode$worldPosit3 = modelNode.worldPosition) == null ? void 0 : _modelNode$worldPosit3.toString());
          }
        }

        play(node, action) {
          var modelNode = node.getChildByName(MODEL_NODE_NAME);
          if (modelNode) this._playClip(modelNode, action);
        }

        _playClip(modelNode, action) {
          var _modelNode$getCompone2;

          var anim = (_modelNode$getCompone2 = modelNode.getComponent(SkeletalAnimation)) != null ? _modelNode$getCompone2 : modelNode.getComponent(Animation);
          if (!anim) return;
          var clip = (_crd && playerClipName === void 0 ? (_reportPossibleCrUseOfplayerClipName({
            error: Error()
          }), playerClipName) : playerClipName)(action);
          var state = anim.getState(clip);

          if (state) {
            anim.play(clip);
            return;
          }

          var idle = anim.getState('idle');
          if (idle) anim.play('idle');else anim.play();
        }

        _ensureVisibility(modelNode) {
          // Avoid adding duplicate helpers if the model is re-mounted.
          if (modelNode.getChildByName('__model_light__')) return; // 1) Local lights so the model is lit even in UI scenes with no scene light.

          var lightNode = new Node('__model_light__');
          var dir = lightNode.addComponent(DirectionalLight);
          dir.illuminance = 120000;
          dir.color = Color.WHITE;
          lightNode.setRotationFromEuler(-45, 30, 0);
          lightNode.setPosition(0, 5, 8);
          modelNode.addChild(lightNode);
          var pointNode = new Node('__model_point__');
          var point = pointNode.addComponent(PointLight);
          point.color = Color.WHITE;

          try {
            point.intensity = 300;
          } catch (_unused3) {
            /* prop optional */
          }

          try {
            point.range = 60;
          } catch (_unused4) {
            /* prop optional */
          }

          pointNode.setPosition(0, 0, 6);
          modelNode.addChild(pointNode); // 2) Brighten the global ambient as a cheap fill (wrapped; may be
          //    unavailable in some scenes).

          try {
            var _globals;

            var scene = director.getScene();
            var ambient = scene == null || (_globals = scene.globals) == null ? void 0 : _globals.ambient;

            if (ambient) {
              if (ambient.skyColor) ambient.skyColor = Color.WHITE;
              if (ambient.groundColor) ambient.groundColor = Color.WHITE;
              if (typeof ambient.skyIllum === 'number') ambient.skyIllum = 1.0;
            }
          } catch (e) {
            console.warn('[CharacterModelAssembler] ambient light adjustment skipped:', e);
          } // 3) Self-lit fallback: force every material to a low-metal, slightly
          //    emissive look so metallic / IBL-dependent PBR models still show up in
          //    UI previews where there is no environment map.


          this._makeMaterialsEmissive(modelNode);

          console.warn('[CharacterModelAssembler] ensured model visibility (local lights)');
        } // Guaranteed-visible fallback for UI scenes with no lighting / environment
        // map. Replaces every mesh material with the built-in `builtin-unlit` material,
        // which renders a flat color regardless of scene lights. This sidesteps the
        // PBR emissive/IBL type pitfalls that make imported models render black in UI
        // previews. Materials are set per-renderer instance (setMaterial) so the
        // imported shared assets are never mutated.


        _forceUnlitMaterials(root) {
          var renderers = root.getComponentsInChildren(MeshRenderer).concat(root.getComponentsInChildren(SkinnedMeshRenderer));
          var replaced = 0;

          for (var r of renderers) {
            var _r$node, _r$node2, _r$node3;

            var count = r.materials.length;
            console.warn('[CharacterModelAssembler] renderer on', (_r$node = r.node) == null ? void 0 : _r$node.name, 'materials=', count, 'layer=', (_r$node2 = r.node) == null ? void 0 : _r$node2.layer, 'enabled=', r.enabled, 'nodeActive=', (_r$node3 = r.node) == null ? void 0 : _r$node3.active);

            for (var i = 0; i < count; i++) {
              try {
                var _oldMat$name, _effectName;

                var oldMat = r.getMaterial(i);
                console.warn('[CharacterModelAssembler]   material', i, 'old=', (_oldMat$name = oldMat == null ? void 0 : oldMat.name) != null ? _oldMat$name : 'null', 'effect=', (_effectName = oldMat == null ? void 0 : oldMat.effectName) != null ? _effectName : 'unknown');
                var unlit = new Material();
                unlit.initialize({
                  effectName: 'builtin-unlit'
                }); // Neutral off-white so the model is visible against dark UI scenes without
                // looking like a diagnostic marker. Cocos Color constructor uses 0-255.

                unlit.setProperty('color', new Color(235, 235, 240, 255));
                r.setMaterial(i, unlit);
                console.warn('[CharacterModelAssembler]   material', i, 'replaced with builtin-unlit color=235,235,240,255');
                replaced++;
              } catch (e) {
                var _r$node4;

                console.warn('[CharacterModelAssembler] failed to set unlit material on', (_r$node4 = r.node) == null ? void 0 : _r$node4.name, e);
              }
            }
          }

          console.warn('[CharacterModelAssembler] forced unlit materials:', replaced, 'renderers:', renderers.length);
        } // Best-effort: make every mesh material visible without depending on scene
        // lighting. Uses scalar props only (metallic / roughness) — no emissive, which
        // trips a FLOAT3 uniform type assertion in this engine build.


        _makeMaterialsEmissive(root) {
          var renderers = root.getComponentsInChildren(MeshRenderer).concat(root.getComponentsInChildren(SkinnedMeshRenderer));
          var touched = 0;

          var setMatProp = (mat, key, value) => {
            try {
              if (typeof mat.setProperty === 'function') mat.setProperty(key, value);
            } catch (_unused5) {
              /* ignore */
            }

            try {
              if (key in mat) mat[key] = value;
            } catch (_unused6) {
              /* ignore */
            }
          };

          for (var r of renderers) {
            var mats = []; // Cocos 3.8 prefers shared-material APIs; cloned getMaterials() can be
            // empty until the renderer is fully enabled, so shared refs are safer.

            try {
              var shared = r.getSharedMaterials == null ? void 0 : r.getSharedMaterials();
              if (shared) mats = shared.filter(m => m !== null);
            } catch (_unused7) {
              /* ignore */
            }

            if (!mats.length) {
              try {
                var arr = r.sharedMaterials;
                if (arr) mats = arr.filter(m => m !== null);
              } catch (_unused8) {
                /* ignore */
              }
            }

            if (!mats.length) {
              try {
                var m = r.getSharedMaterial == null ? void 0 : r.getSharedMaterial(0);
                if (m) mats = [m];
              } catch (_unused9) {
                /* ignore */
              }
            }

            if (!mats.length) {
              try {
                var _m = r.sharedMaterial;
                if (_m) mats = [_m];
              } catch (_unused10) {
                /* ignore */
              }
            }

            for (var _m2 of mats) {
              if (!_m2) continue;
              touched++;
              var mat = _m2; // Reduce metalness so the surface responds to the local directional
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

      });

      CharacterModelAssembler._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=04d95d11186a26d98e83c846dcddd23640ff5006.js.map