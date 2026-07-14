System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Sprite, SpriteFrame, Rect, JsonAsset, resources, AssetBundleService, SpriteAnimationService, _crd;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _reportPossibleCrUseOfAssetBundleService(extras) {
    _reporterNs.report("AssetBundleService", "../assets/AssetBundleService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameAssetDef(extras) {
    _reporterNs.report("GameAssetDef", "../assets/GameAssetService", _context.meta, extras);
  }

  _export("SpriteAnimationService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Sprite = _cc.Sprite;
      SpriteFrame = _cc.SpriteFrame;
      Rect = _cc.Rect;
      JsonAsset = _cc.JsonAsset;
      resources = _cc.resources;
    }, function (_unresolved_2) {
      AssetBundleService = _unresolved_2.AssetBundleService;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "6aa98kzeb1OyJreXJUA+76Z", "SpriteAnimationService", undefined);
      /**
       * SpriteAnimationService - JSON config-driven sprite animation player
       *
       * Fixed: uses AssetBundleService.loadById(), adds SpriteFrame cache,
       * removes @ccclass (plain service, not Component).
       */


      __checkObsolete__(['Node', 'Sprite', 'SpriteFrame', 'Rect', 'JsonAsset', 'resources']);

      _export("SpriteAnimationService", SpriteAnimationService = class SpriteAnimationService {
        constructor() {
          this._configs = new Map();
          this._active = new Map();
          this._frameCache = new Map();
          this._loaded = false;
        }

        static get instance() {
          if (!this._instance) this._instance = new SpriteAnimationService();
          return this._instance;
        }

        loadAll() {
          var _this = this;

          return _asyncToGenerator(function* () {
            if (_this._loaded) return;

            try {
              var cfg = yield _this._fetchConfig();

              if (cfg) {
                for (var anim of cfg) {
                  _this._configs.set(anim.id, anim);
                }
              }

              _this._loaded = true;
              console.log("[SpriteAnim] loaded " + _this._configs.size + " animations");
            } catch (err) {
              console.warn('[SpriteAnim] failed to load configs:', err);
            }
          })();
        }

        getConfig(id) {
          var _this$_configs$get;

          return (_this$_configs$get = this._configs.get(id)) != null ? _this$_configs$get : null;
        }

        play(node, animId, options) {
          var _this2 = this;

          return _asyncToGenerator(function* () {
            var config = _this2._configs.get(animId);

            if (!config) return;
            var sprite = node.getComponent(Sprite);
            if (!sprite) sprite = node.addComponent(Sprite);
            var frame = yield _this2._loadSpriteFrame(config, 0);
            if (frame) sprite.spriteFrame = frame;

            _this2._active.set(node, {
              config,
              node,
              sprite,
              currentFrame: 0,
              elapsed: 0,
              options: options != null ? options : {},
              done: false
            });
          })();
        }

        stop(node) {
          this._active.delete(node);
        }

        isPlaying(node) {
          return this._active.has(node);
        }

        stopAll() {
          this._active.clear();
        }
        /**
         * Play an animation from a GameAssetDef (used by CharacterVisualService / EffectService).
         *
         * Builds an AnimationConfig from the GameAssetDef and plays it.
         * Falls back to single frame if def is not a sprite sheet.
         */


        playByAssetDef(node, def, options) {
          var _this3 = this;

          return _asyncToGenerator(function* () {
            var _options$fps, _options$loop, _ref, _options$destroyOnCom;

            if (!def.assetId || !def.frameWidth || !def.frameHeight || !def.frames) {
              console.warn('[SpriteAnimationService] playByAssetDef: invalid def', def);
              return false;
            }

            var config = {
              id: def.assetId,
              resource: def.assetId,
              frameWidth: def.frameWidth,
              frameHeight: def.frameHeight,
              frames: def.frames,
              fps: (_options$fps = options == null ? void 0 : options.fps) != null ? _options$fps : 8,
              loop: (_options$loop = options == null ? void 0 : options.loop) != null ? _options$loop : true,
              layout: (_ref = def.layout) != null ? _ref : 'vertical'
            };
            var sprite = node.getComponent(Sprite);
            if (!sprite) sprite = node.addComponent(Sprite);
            var frame = yield _this3._loadSpriteFrame(config, 0);
            if (frame) sprite.spriteFrame = frame; // If destroyOnComplete, schedule auto-removal after animation ends

            var destroyOnComplete = (_options$destroyOnCom = options == null ? void 0 : options.destroyOnComplete) != null ? _options$destroyOnCom : false;

            _this3._active.set(node, {
              config,
              node,
              sprite,
              currentFrame: 0,
              elapsed: 0,
              options: {
                onComplete: destroyOnComplete ? () => {
                  if (node.isValid) node.destroy();
                } : undefined
              },
              done: false
            });

            return true;
          })();
        }
        /**
         * Apply a single frame from a sprite sheet by GameAssetDef without starting animation.
         * Used for preview/static display of a specific frame (typically frame 0).
         *
         * Loading path: tryLoadSpriteFrame(assetId) -> SpriteFrame -> .texture -> slice.
         * Non-sprite-sheet (type !== sprite_sheet/effect_sheet) -> return full SpriteFrame as-is.
         */


        applyFrameByAssetDef(node, def, frameIndex) {
          var _this4 = this;

          return _asyncToGenerator(function* () {
            if (frameIndex === void 0) {
              frameIndex = 0;
            }

            if (!def.assetId) {
              console.warn('[SpriteAnimationService] applyFrameByAssetDef: no assetId', def);
              return false;
            }

            var sprite = node.getComponent(Sprite);
            if (!sprite) sprite = node.addComponent(Sprite); // Not a sprite sheet — load SpriteFrame directly and display full

            if (def.type !== 'sprite_sheet' && def.type !== 'effect_sheet') {
              try {
                var fullFrame = yield (_crd && AssetBundleService === void 0 ? (_reportPossibleCrUseOfAssetBundleService({
                  error: Error()
                }), AssetBundleService) : AssetBundleService).instance.tryLoadSpriteFrame(def.assetId);
                if (!fullFrame) return false;
                sprite.spriteFrame = fullFrame;
                return true;
              } catch (err) {
                console.warn("[SpriteAnimationService] applyFrameByAssetDef fallback failed for " + def.assetId + ":", err);
                return false;
              }
            } // Strict validation: sprite sheet must have frame metadata


            if (!def.frameWidth || !def.frameHeight || !def.frames) {
              console.warn("[SpriteAnimationService] applyFrameByAssetDef: " + def.assetId + " is sprite_sheet but missing frame metadata");
              return false;
            }

            var key = def.assetId + ":f" + frameIndex;

            var cached = _this4._frameCache.get(key);

            if (cached) {
              sprite.spriteFrame = cached;
              sprite.sizeMode = Sprite.SizeMode.CUSTOM;
              return true;
            }

            try {
              var _def$layout;

              // Load as SpriteFrame (not Texture2D), then slice from .texture
              var _fullFrame = yield (_crd && AssetBundleService === void 0 ? (_reportPossibleCrUseOfAssetBundleService({
                error: Error()
              }), AssetBundleService) : AssetBundleService).instance.tryLoadSpriteFrame(def.assetId);

              if (!_fullFrame || !_fullFrame.texture) return false;
              var texture = _fullFrame.texture;
              var x = 0,
                  y = 0;
              var layout = (_def$layout = def.layout) != null ? _def$layout : 'vertical';

              if (layout === 'vertical') {
                y = texture.height - (frameIndex + 1) * def.frameHeight;
              } else {
                x = frameIndex * def.frameWidth;
              }

              var frame = new SpriteFrame();
              frame.texture = texture;
              frame.rect = new Rect(x, y, def.frameWidth, def.frameHeight);

              _this4._frameCache.set(key, frame);

              sprite.spriteFrame = frame;
              sprite.sizeMode = Sprite.SizeMode.CUSTOM;
              return true;
            } catch (err) {
              console.warn("[SpriteAnimationService] applyFrameByAssetDef failed for " + def.assetId + ":", err);
              return false;
            }
          })();
        }

        tick(dt) {
          var _this5 = this;

          var _loop = function _loop(anim) {
            if (anim.done) {
              _this5._active.delete(node);

              return 0; // continue
            }

            anim.elapsed += dt;
            var frameDuration = 1 / anim.config.fps;
            var newFrame = Math.floor(anim.elapsed / frameDuration);

            if (newFrame !== anim.currentFrame) {
              anim.currentFrame = newFrame;

              if (newFrame >= anim.config.frames) {
                if (anim.config.loop) {
                  anim.currentFrame = 0;
                  anim.elapsed = 0;
                } else {
                  anim.currentFrame = anim.config.frames - 1;
                  anim.done = true;
                  anim.options.onComplete == null || anim.options.onComplete();
                  return 0; // continue
                }
              }

              _this5._loadSpriteFrame(anim.config, anim.currentFrame).then(frame => {
                if (frame) anim.sprite.spriteFrame = frame;
              });

              anim.options.onFrame == null || anim.options.onFrame(anim.currentFrame);
            }
          },
              _ret;

          for (var [node, anim] of this._active) {
            _ret = _loop(anim);
            if (_ret === 0) continue;
          }
        }

        _loadSpriteFrame(config, frameIndex) {
          var _this6 = this;

          return _asyncToGenerator(function* () {
            var key = config.id + ":" + frameIndex;

            var cached = _this6._frameCache.get(key);

            if (cached) return cached;

            try {
              // Load SpriteFrame (not Texture2D) — assets.json stores these as SpriteFrame type
              var fullFrame = yield (_crd && AssetBundleService === void 0 ? (_reportPossibleCrUseOfAssetBundleService({
                error: Error()
              }), AssetBundleService) : AssetBundleService).instance.tryLoadSpriteFrame(config.resource);
              if (!fullFrame || !fullFrame.texture) return null;
              var texture = fullFrame.texture;
              var x = 0,
                  y = 0;

              if (config.layout === 'vertical') {
                y = texture.height - (frameIndex + 1) * config.frameHeight;
              } else {
                x = frameIndex * config.frameWidth;
              }

              var spriteFrame = new SpriteFrame();
              spriteFrame.texture = texture;
              spriteFrame.rect = new Rect(x, y, config.frameWidth, config.frameHeight);

              _this6._frameCache.set(key, spriteFrame);

              return spriteFrame;
            } catch (err) {
              console.warn("[SpriteAnim] failed to load frame " + frameIndex + " for " + config.id + ":", err);
              return null;
            }
          })();
        }

        _fetchConfig() {
          return _asyncToGenerator(function* () {
            return new Promise(resolve => {
              resources.load('config/animations', JsonAsset, (err, asset) => {
                var _raw$data;

                if (err || !asset) {
                  console.warn('[SpriteAnim] animations.json not found, no animations loaded');
                  resolve(null);
                  return;
                }

                var raw = asset.json;
                var list = Array.isArray(raw) ? raw : (_raw$data = raw == null ? void 0 : raw.data) != null ? _raw$data : [];
                resolve(list.length > 0 ? list : null);
              });
            });
          })();
        }

      });

      SpriteAnimationService._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=f07cac1444721966f6f5007f45bdb19b1191200d.js.map