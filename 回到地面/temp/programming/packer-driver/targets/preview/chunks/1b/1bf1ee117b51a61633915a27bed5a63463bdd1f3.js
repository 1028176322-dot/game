System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Graphics, Node, Sprite, SpriteFrame, UITransform, AssetBundleService, ArtResourceResolver, getSheetInfo, createFrameFromSheet, RenderAssetService, _crd;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _reportPossibleCrUseOfTerrainType(extras) {
    _reporterNs.report("TerrainType", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAssetBundleService(extras) {
    _reporterNs.report("AssetBundleService", "./AssetBundleService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfArtResourceResolver(extras) {
    _reporterNs.report("ArtResourceResolver", "./ArtResourceResolver", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCharacterAction(extras) {
    _reporterNs.report("CharacterAction", "./ArtResourceResolver", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterAction(extras) {
    _reporterNs.report("MonsterAction", "./ArtResourceResolver", _context.meta, extras);
  }

  function _reportPossibleCrUseOfgetSheetInfo(extras) {
    _reporterNs.report("getSheetInfo", "./SpriteSheetUtil", _context.meta, extras);
  }

  function _reportPossibleCrUseOfcreateFrameFromSheet(extras) {
    _reporterNs.report("createFrameFromSheet", "./SpriteSheetUtil", _context.meta, extras);
  }

  _export("RenderAssetService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Graphics = _cc.Graphics;
      Node = _cc.Node;
      Sprite = _cc.Sprite;
      SpriteFrame = _cc.SpriteFrame;
      UITransform = _cc.UITransform;
    }, function (_unresolved_2) {
      AssetBundleService = _unresolved_2.AssetBundleService;
    }, function (_unresolved_3) {
      ArtResourceResolver = _unresolved_3.ArtResourceResolver;
    }, function (_unresolved_4) {
      getSheetInfo = _unresolved_4.getSheetInfo;
      createFrameFromSheet = _unresolved_4.createFrameFromSheet;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "dca4aFgs6tBhKMEvJFpnQ7l", "RenderAssetService", undefined);

      __checkObsolete__(['Component', 'Graphics', 'Node', 'Sprite', 'SpriteFrame', 'Texture2D', 'UITransform']);

      _export("RenderAssetService", RenderAssetService = class RenderAssetService {
        static applySpriteById(node, resourceId) {
          var _this = this;

          return _asyncToGenerator(function* () {
            var sprite = _this._ensureSprite(node); // Route raw Texture2D entries through the wrapper. A raw Texture2D has no
            // `uv`, so assigning it directly to `sprite.spriteFrame` crashes the 2D
            // assembler (Simple.updateUVs: frame.uv[0] -> undefined). Mirrors the
            // guard already present in UISkinService._applyAsset. Without this, any
            // asset registered as type "Texture2D" (e.g. the combat background
            // textures) fed through this method ends up as the sprite's frame.


            var entry = (_crd && AssetBundleService === void 0 ? (_reportPossibleCrUseOfAssetBundleService({
              error: Error()
            }), AssetBundleService) : AssetBundleService).instance.resolve(resourceId);

            if ((entry == null ? void 0 : entry.type) === 'Texture2D') {
              return _this.applyTextureAsSprite(node, resourceId);
            }

            var frame = yield (_crd && AssetBundleService === void 0 ? (_reportPossibleCrUseOfAssetBundleService({
              error: Error()
            }), AssetBundleService) : AssetBundleService).instance.tryLoadSpriteFrame(resourceId);
            if (!frame || !node.isValid) return null;
            sprite.spriteFrame = frame;
            sprite.enabled = true;
            var graphics = node.getComponent(Graphics);
            if (graphics) graphics.enabled = false;
            return frame;
          })();
        }

        static applyCharacterSprite(node, characterId, action) {
          var _this2 = this;

          return _asyncToGenerator(function* () {
            if (action === void 0) {
              action = 'idle';
            }

            var resourceId = (_crd && ArtResourceResolver === void 0 ? (_reportPossibleCrUseOfArtResourceResolver({
              error: Error()
            }), ArtResourceResolver) : ArtResourceResolver).character(characterId, action);
            var sheetInfo = (_crd && getSheetInfo === void 0 ? (_reportPossibleCrUseOfgetSheetInfo({
              error: Error()
            }), getSheetInfo) : getSheetInfo)(resourceId);

            if (sheetInfo) {
              // Multi-frame sprite sheet: load the first frame
              return _this2._applySpriteSheetFrame(node, resourceId, sheetInfo, 0);
            } // Normal single-frame path


            return _this2.applySpriteById(node, resourceId);
          })();
        }
        /**
         * Load a multi-frame sprite sheet and apply only one frame.
         */


        static _applySpriteSheetFrame(node, resourceId, sheetInfo, frameIndex) {
          var _this3 = this;

          return _asyncToGenerator(function* () {
            var sprite = _this3._ensureSprite(node);

            var fullFrame = yield (_crd && AssetBundleService === void 0 ? (_reportPossibleCrUseOfAssetBundleService({
              error: Error()
            }), AssetBundleService) : AssetBundleService).instance.tryLoadSpriteFrame(resourceId);
            if (!fullFrame || !node.isValid) return null;
            var texture = fullFrame.texture;

            if (!texture) {
              console.warn("[RenderAssetService] sprite sheet has no texture: " + resourceId);
              return null;
            }

            var sliced = (_crd && createFrameFromSheet === void 0 ? (_reportPossibleCrUseOfcreateFrameFromSheet({
              error: Error()
            }), createFrameFromSheet) : createFrameFromSheet)(texture, sheetInfo.frameWidth, sheetInfo.frameHeight, frameIndex);
            sprite.spriteFrame = sliced;
            sprite.enabled = true;
            var graphics = node.getComponent(Graphics);
            if (graphics) graphics.enabled = false;
            return sliced;
          })();
        }

        static applyMonsterSprite(node, zoneId, monsterId, action) {
          var _this4 = this;

          return _asyncToGenerator(function* () {
            if (action === void 0) {
              action = 'idle';
            }

            return _this4.applySpriteById(node, (_crd && ArtResourceResolver === void 0 ? (_reportPossibleCrUseOfArtResourceResolver({
              error: Error()
            }), ArtResourceResolver) : ArtResourceResolver).monster(zoneId, monsterId, action));
          })();
        }

        static applyTileSprite(node, zoneId, terrain) {
          var _this5 = this;

          return _asyncToGenerator(function* () {
            return _this5.applySpriteById(node, (_crd && ArtResourceResolver === void 0 ? (_reportPossibleCrUseOfArtResourceResolver({
              error: Error()
            }), ArtResourceResolver) : ArtResourceResolver).tile(zoneId, terrain));
          })();
        }

        static applyTextureAsSprite(node, resourceId) {
          var _this6 = this;

          return _asyncToGenerator(function* () {
            try {
              var texture = yield (_crd && AssetBundleService === void 0 ? (_reportPossibleCrUseOfAssetBundleService({
                error: Error()
              }), AssetBundleService) : AssetBundleService).instance.loadById(resourceId);
              if (!node.isValid) return null;
              var frame = new SpriteFrame();
              frame.texture = texture;

              var sprite = _this6._ensureSprite(node);

              sprite.spriteFrame = frame;
              sprite.enabled = true;
              return frame;
            } catch (err) {
              console.warn("[RenderAssetService] texture sprite load failed: " + resourceId, err);
              return null;
            }
          })();
        }

        static _ensureComponent(node, type) {
          var comp = node.getComponent(type);
          if (!comp) comp = node.addComponent(type);
          return comp;
        }

        static _ensureSprite(node) {
          var _node$getComponent, _visual$getComponent;

          var existing = node.getComponent(Sprite);
          if (existing) return existing; // Check for conflicting renderer components (Label, Graphics, etc.)
          // Cocos nodes cannot have both Label and Sprite — must use a child node.

          var hasLabel = (_node$getComponent = node.getComponent('cc.Label')) != null ? _node$getComponent : null;
          var hasGraphics = node.getComponent(Graphics);

          if (!hasLabel && !hasGraphics) {
            return node.addComponent(Sprite);
          } // Create a child node to host the Sprite, keeping the original renderer intact


          var visual = node.getChildByName('SpriteVisual');

          if (!visual) {
            visual = new Node('SpriteVisual');
            node.addChild(visual);
            var parentTransform = node.getComponent(UITransform);
            var transform = visual.addComponent(UITransform);

            if (parentTransform) {
              transform.setContentSize(parentTransform.contentSize);
            }
          }

          return (_visual$getComponent = visual.getComponent(Sprite)) != null ? _visual$getComponent : visual.addComponent(Sprite);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=1bf1ee117b51a61633915a27bed5a63463bdd1f3.js.map