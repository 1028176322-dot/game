System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, JsonAsset, resources, GameAssetService, RenderAssetService, SpriteAnimationService, PartAnimationPlayer, PartCharacterRenderer, CharacterModelAssembler, CharacterVisualService, _crd;

  function _reportPossibleCrUseOfGameAssetService(extras) {
    _reporterNs.report("GameAssetService", "../assets/GameAssetService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRenderAssetService(extras) {
    _reporterNs.report("RenderAssetService", "../assets/RenderAssetService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSpriteAnimationService(extras) {
    _reporterNs.report("SpriteAnimationService", "./SpriteAnimationService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPartAnimation(extras) {
    _reporterNs.report("PartAnimation", "./PartAnimationPlayer", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPartAnimationPlayer(extras) {
    _reporterNs.report("PartAnimationPlayer", "./PartAnimationPlayer", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCharacterParts(extras) {
    _reporterNs.report("CharacterParts", "./PartCharacterRenderer", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCharacterRig(extras) {
    _reporterNs.report("CharacterRig", "./PartCharacterRenderer", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPartCharacterRenderer(extras) {
    _reporterNs.report("PartCharacterRenderer", "./PartCharacterRenderer", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCharacterModelAssembler(extras) {
    _reporterNs.report("CharacterModelAssembler", "./CharacterModelAssembler", _context.meta, extras);
  }

  _export("CharacterVisualService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      JsonAsset = _cc.JsonAsset;
      resources = _cc.resources;
    }, function (_unresolved_2) {
      GameAssetService = _unresolved_2.GameAssetService;
    }, function (_unresolved_3) {
      RenderAssetService = _unresolved_3.RenderAssetService;
    }, function (_unresolved_4) {
      SpriteAnimationService = _unresolved_4.SpriteAnimationService;
    }, function (_unresolved_5) {
      PartAnimationPlayer = _unresolved_5.PartAnimationPlayer;
    }, function (_unresolved_6) {
      PartCharacterRenderer = _unresolved_6.PartCharacterRenderer;
    }, function (_unresolved_7) {
      CharacterModelAssembler = _unresolved_7.CharacterModelAssembler;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "88fe4djsCVA5LEB4Vzgzv2S", "CharacterVisualService", undefined);
      /**
       * CharacterVisualService — Load and display characters by semantic key.
       *
       * Supports two visual modes:
       *   - 'sheet': legacy sprite sheet animation via SpriteAnimationService.
       *   - 'parts': modular part animation via PartCharacterRenderer + PartAnimationPlayer.
       *
       * Usage:
       *   await CharacterVisualService.instance.applyStatic(node, 'character.warrior.idle');
       *   await CharacterVisualService.instance.play(node, 'character.warrior.idle');
       */


      __checkObsolete__(['JsonAsset', 'Node', 'resources']);

      _export("CharacterVisualService", CharacterVisualService = class CharacterVisualService {
        constructor() {
          this._visuals = {};
          this._parts = {};
          this._rigs = {};
          this._animations = {};
          this._loaded = false;
          this._loading = null;
        }

        static get instance() {
          if (!this._instance) this._instance = new CharacterVisualService();
          return this._instance;
        }

        /**
         * Load character visual configs (visuals, parts, rigs, animations).
         * Safe to call multiple times.
         */
        async loadAll() {
          if (this._loaded) return;
          if (this._loading) return this._loading;
          this._loading = this._doLoad();
          return this._loading;
        }

        async _doLoad() {
          try {
            const [visuals, parts, rigs, anims] = await Promise.all([this._loadJson('config/character_visuals'), this._loadJson('config/character_parts'), this._loadJson('config/character_rigs'), this._loadJson('config/character_part_animations')]);
            this._visuals = visuals;
            this._parts = parts;
            this._rigs = rigs;
            this._animations = anims;
            this._loaded = true;
          } catch (err) {
            console.warn('[CharacterVisualService] failed to load part configs:', err);
            this._loaded = true;
          }
        }

        _loadJson(path) {
          return new Promise((resolve, reject) => {
            resources.load(path, JsonAsset, (err, asset) => {
              if (err || !asset) {
                reject(err != null ? err : new Error(`load ${path} failed`));
                return;
              }

              const raw = asset.json;
              const data = 'data' in raw && raw.data ? raw.data : raw;
              resolve(data);
            });
          });
        }
        /**
         * Apply a single static frame onto a node.
         */


        async applyStatic(node, visualKey, forceUnlit = false, targetLayer) {
          const parsed = this._parseKey(visualKey);

          if (parsed) {
            const visual = await this._getVisualConfig(parsed.id);

            if (visual != null && visual.modelAssetId) {
              var _visual$weaponSocket;

              console.warn('[CharacterVisualService] try mount 3D model for', parsed.id, 'modelAssetId=', visual.modelAssetId);
              const ok = await (_crd && CharacterModelAssembler === void 0 ? (_reportPossibleCrUseOfCharacterModelAssembler({
                error: Error()
              }), CharacterModelAssembler) : CharacterModelAssembler).instance.mount(node, visual.modelAssetId, visual.weaponAssetId, (_visual$weaponSocket = visual.weaponSocket) != null ? _visual$weaponSocket : 'Weapon', 'idle', forceUnlit, targetLayer);
              if (ok) return true;
              console.warn('[CharacterVisualService] 3D model mount failed, falling back to 2D for', parsed.id);
            }

            if ((visual == null ? void 0 : visual.mode) === 'parts') {
              return this._applyPartsStatic(node, parsed.id);
            }
          }

          const def = await (_crd && GameAssetService === void 0 ? (_reportPossibleCrUseOfGameAssetService({
            error: Error()
          }), GameAssetService) : GameAssetService).instance.get(visualKey);

          if (!def) {
            console.warn(`[CharacterVisualService] missing visual key: ${visualKey}`);
            return false;
          }

          return (await (_crd && RenderAssetService === void 0 ? (_reportPossibleCrUseOfRenderAssetService({
            error: Error()
          }), RenderAssetService) : RenderAssetService).applySpriteById(node, def.assetId)) !== null;
        }
        /**
         * Apply preview frame (frame 0) from a sprite sheet — used in cards and selection UI.
         * For parts mode, this assembles the rig in its default pose.
         */


        async applyPreviewFrame(node, visualKey, forceUnlit = false, targetLayer) {
          const parsed = this._parseKey(visualKey);

          if (parsed) {
            const visual = await this._getVisualConfig(parsed.id);

            if (visual != null && visual.modelAssetId) {
              var _visual$weaponSocket2;

              const ok = await (_crd && CharacterModelAssembler === void 0 ? (_reportPossibleCrUseOfCharacterModelAssembler({
                error: Error()
              }), CharacterModelAssembler) : CharacterModelAssembler).instance.mount(node, visual.modelAssetId, visual.weaponAssetId, (_visual$weaponSocket2 = visual.weaponSocket) != null ? _visual$weaponSocket2 : 'Weapon', 'idle', forceUnlit, targetLayer);
              if (ok) return true;
            }

            if ((visual == null ? void 0 : visual.mode) === 'parts') {
              return this._applyPartsStatic(node, parsed.id);
            }
          }

          const def = await (_crd && GameAssetService === void 0 ? (_reportPossibleCrUseOfGameAssetService({
            error: Error()
          }), GameAssetService) : GameAssetService).instance.get(visualKey);

          if (!def) {
            console.warn(`[CharacterVisualService] applyPreviewFrame: missing key ${visualKey}`);
            return false;
          }

          return (_crd && SpriteAnimationService === void 0 ? (_reportPossibleCrUseOfSpriteAnimationService({
            error: Error()
          }), SpriteAnimationService) : SpriteAnimationService).instance.applyFrameByAssetDef(node, def, 0);
        }
        /**
         * Play an animation on a node.
         * Falls back to static frame if the asset is not a sprite sheet.
         */


        async play(node, visualKey, fps = 8, forceUnlit = false, targetLayer) {
          const parsed = this._parseKey(visualKey);

          if (parsed) {
            const visual = await this._getVisualConfig(parsed.id);

            if (visual != null && visual.modelAssetId) {
              var _visual$weaponSocket3;

              if ((_crd && CharacterModelAssembler === void 0 ? (_reportPossibleCrUseOfCharacterModelAssembler({
                error: Error()
              }), CharacterModelAssembler) : CharacterModelAssembler).instance.isMounted(node)) {
                (_crd && CharacterModelAssembler === void 0 ? (_reportPossibleCrUseOfCharacterModelAssembler({
                  error: Error()
                }), CharacterModelAssembler) : CharacterModelAssembler).instance.play(node, parsed.action);
                return true;
              }

              const ok = await (_crd && CharacterModelAssembler === void 0 ? (_reportPossibleCrUseOfCharacterModelAssembler({
                error: Error()
              }), CharacterModelAssembler) : CharacterModelAssembler).instance.mount(node, visual.modelAssetId, visual.weaponAssetId, (_visual$weaponSocket3 = visual.weaponSocket) != null ? _visual$weaponSocket3 : 'Weapon', parsed.action, forceUnlit, targetLayer);
              if (ok) return true;
            }

            if ((visual == null ? void 0 : visual.mode) === 'parts') {
              return this._playParts(node, parsed.id, parsed.action);
            }
          }

          const def = await (_crd && GameAssetService === void 0 ? (_reportPossibleCrUseOfGameAssetService({
            error: Error()
          }), GameAssetService) : GameAssetService).instance.get(visualKey);

          if (!def) {
            console.warn(`[CharacterVisualService] missing visual key: ${visualKey}`);
            return false;
          }

          if (def.type === 'sprite_sheet') {
            return (_crd && SpriteAnimationService === void 0 ? (_reportPossibleCrUseOfSpriteAnimationService({
              error: Error()
            }), SpriteAnimationService) : SpriteAnimationService).instance.playByAssetDef(node, def, {
              loop: true,
              fps
            });
          }

          return this.applyStatic(node, visualKey);
        }

        _parseKey(visualKey) {
          const match = visualKey.match(/^character\.(\w+)\.(\w+)$/);
          if (!match) return null;
          return {
            id: match[1],
            action: match[2]
          };
        }

        async _getVisualConfig(id) {
          var _this$_visuals$id;

          await this.loadAll();
          return (_this$_visuals$id = this._visuals[id]) != null ? _this$_visuals$id : null;
        }

        async _applyPartsStatic(node, characterId) {
          await this.loadAll();
          const visual = this._visuals[characterId];
          const parts = visual != null && visual.partsKey ? this._parts[visual.partsKey] : null;
          const rig = visual != null && visual.rigKey ? this._rigs[visual.rigKey] : null;

          if (!parts || !rig) {
            console.warn(`[CharacterVisualService] missing parts/rig for ${characterId}`);
            return false;
          }

          let renderer = node.getComponent(_crd && PartCharacterRenderer === void 0 ? (_reportPossibleCrUseOfPartCharacterRenderer({
            error: Error()
          }), PartCharacterRenderer) : PartCharacterRenderer);

          if (!renderer) {
            renderer = node.addComponent(_crd && PartCharacterRenderer === void 0 ? (_reportPossibleCrUseOfPartCharacterRenderer({
              error: Error()
            }), PartCharacterRenderer) : PartCharacterRenderer);
          }

          await renderer.setup(characterId, parts, rig);
          renderer.resetToRig();
          return true;
        }

        async _playParts(node, characterId, action) {
          await this.loadAll();
          const visual = this._visuals[characterId];
          const parts = visual != null && visual.partsKey ? this._parts[visual.partsKey] : null;
          const rig = visual != null && visual.rigKey ? this._rigs[visual.rigKey] : null;
          const anims = visual != null && visual.animationsKey ? this._animations[visual.animationsKey] : null;
          const anim = anims == null ? void 0 : anims[action];

          if (!parts || !rig) {
            console.warn(`[CharacterVisualService] missing parts/rig for ${characterId}`);
            return false;
          }

          let renderer = node.getComponent(_crd && PartCharacterRenderer === void 0 ? (_reportPossibleCrUseOfPartCharacterRenderer({
            error: Error()
          }), PartCharacterRenderer) : PartCharacterRenderer);

          if (!renderer || renderer.getCharacterId() !== characterId) {
            renderer = node.getComponent(_crd && PartCharacterRenderer === void 0 ? (_reportPossibleCrUseOfPartCharacterRenderer({
              error: Error()
            }), PartCharacterRenderer) : PartCharacterRenderer);
            if (!renderer) renderer = node.addComponent(_crd && PartCharacterRenderer === void 0 ? (_reportPossibleCrUseOfPartCharacterRenderer({
              error: Error()
            }), PartCharacterRenderer) : PartCharacterRenderer);
            await renderer.setup(characterId, parts, rig);
          }

          let player = node.getComponent(_crd && PartAnimationPlayer === void 0 ? (_reportPossibleCrUseOfPartAnimationPlayer({
            error: Error()
          }), PartAnimationPlayer) : PartAnimationPlayer);

          if (!player) {
            player = node.addComponent(_crd && PartAnimationPlayer === void 0 ? (_reportPossibleCrUseOfPartAnimationPlayer({
              error: Error()
            }), PartAnimationPlayer) : PartAnimationPlayer);
            player.setup(renderer);
          }

          if (anim) {
            player.play(anim);
          } else {
            renderer.resetToRig();
          }

          return true;
        }

      });

      CharacterVisualService._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=d7044483d28c7e847604e806951ce64e9be13bdb.js.map