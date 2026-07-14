System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Node, Sprite, tween, Vec3, Color, UITransform, director, Camera, Canvas, eventBus, CharacterVisualService, PlayerDataManager, CombatEffectService, _crd, FLASH_DURATION, SHAKE_DURATION, SHAKE_INTENSITY;

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCharacterVisualService(extras) {
    _reporterNs.report("CharacterVisualService", "../render/CharacterVisualService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerDataManager(extras) {
    _reporterNs.report("PlayerDataManager", "../core/PlayerDataManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAttackResult(extras) {
    _reporterNs.report("AttackResult", "./AutoAttack", _context.meta, extras);
  }

  _export("CombatEffectService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Node = _cc.Node;
      Sprite = _cc.Sprite;
      tween = _cc.tween;
      Vec3 = _cc.Vec3;
      Color = _cc.Color;
      UITransform = _cc.UITransform;
      director = _cc.director;
      Camera = _cc.Camera;
      Canvas = _cc.Canvas;
    }, function (_unresolved_2) {
      eventBus = _unresolved_2.eventBus;
    }, function (_unresolved_3) {
      CharacterVisualService = _unresolved_3.CharacterVisualService;
    }, function (_unresolved_4) {
      PlayerDataManager = _unresolved_4.PlayerDataManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "99ad1wedqhDYb6Ydm6erQOF", "CombatEffectService", undefined);
      /**
       * CombatEffectService - ARPG 战斗视觉效果服务
       *
       * 监听 eventBus 战斗事件，触发：
       *   - 角色帧动画（attack/hit/dodge）
       *   - 攻击弹道
       *   - 受击闪白 + 抖动
       *   - 屏幕震动
       *   - 死亡增强
       *
       * 帧动画使用 CharacterVisualService 读取 game_assets.json 中的
       * sprite sheet 定义（5 角色 × 7 动作，竖排 4 帧，每帧 192×192）。
       */


      __checkObsolete__(['Node', 'Sprite', 'tween', 'Vec3', 'Color', 'UITransform', 'director', 'Camera', 'Canvas']);

      FLASH_DURATION = 0.08;
      SHAKE_DURATION = 0.15;
      SHAKE_INTENSITY = 6;

      _export("CombatEffectService", CombatEffectService = class CombatEffectService {
        constructor() {
          this._initialized = false;
          this._playerNode = null;
          this._cameraNode = null;
          this._cameraOrig = new Vec3(0, 0, 0);
          this._characterClass = 'warrior';
        }

        static get instance() {
          if (!this._instance) this._instance = new CombatEffectService();
          return this._instance;
        }
        /** 初始化：传入玩家节点，自动查找相机，挂载事件 */


        init(playerNode) {
          var _selectedCharacter, _this$_cameraNode$get, _this$_cameraNode;

          if (this._initialized) return;
          this._playerNode = playerNode;
          this._characterClass = (_selectedCharacter = (_crd && PlayerDataManager === void 0 ? (_reportPossibleCrUseOfPlayerDataManager({
            error: Error()
          }), PlayerDataManager) : PlayerDataManager).getInstance().selectedCharacter) != null ? _selectedCharacter : 'warrior';

          this._findCamera();

          this._cameraOrig = (_this$_cameraNode$get = (_this$_cameraNode = this._cameraNode) == null || (_this$_cameraNode = _this$_cameraNode.getPosition()) == null ? void 0 : _this$_cameraNode.clone()) != null ? _this$_cameraNode$get : new Vec3(0, 0, 0); // 玩家入场播放 idle 动画（循环）

          this._playAnim('idle', true, 6);

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('attack:performed', this._onAttackPerformed, this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('player:damaged', this._onPlayerDamaged, this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('element:reaction', this._onElementReaction, this);
          this._initialized = true;
          console.log('[CombatEffectService] initialized (class=' + this._characterClass + ')');
        }

        destroy() {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).offTarget(this);
          this._initialized = false;
        } // ── 角色帧动画接口 ────────────────────────

        /**
         * 播放角色动画。action 取值: idle/walk/attack/hit/dodge/skill/death
         * loop=true 时循环播放（idle/walk），否则播放一次后回到 idle
         */


        playCharacterAnim(action, loop = false) {
          this._playAnim(action, loop, action === 'idle' ? 6 : 10);
        } // ── 内部 ──────────────────────────────────


        _findCamera() {
          var _director$getScene;

          const cams = (_director$getScene = director.getScene()) == null ? void 0 : _director$getScene.getComponentsInChildren(Camera);

          if (cams && cams.length > 0) {
            this._cameraNode = cams[0].node;
          }

          if (!this._cameraNode) {
            var _director$getScene$ch, _director$getScene2;

            this._cameraNode = (_director$getScene$ch = (_director$getScene2 = director.getScene()) == null ? void 0 : _director$getScene2.children[0]) != null ? _director$getScene$ch : null;
          }
        }
        /** 核心动画播放函数 */


        _playAnim(action, loop, fps) {
          if (!this._playerNode) return;
          const key = `character.${this._characterClass}.${action}`;
          (_crd && CharacterVisualService === void 0 ? (_reportPossibleCrUseOfCharacterVisualService({
            error: Error()
          }), CharacterVisualService) : CharacterVisualService).instance.play(this._playerNode, key, fps).then(ok => {
            if (!ok && action !== 'idle') {
              // fallback: 动画缺失时回到 idle
              this._playAnim('idle', true, 6);
            }
          });
        } // ── 事件处理 ──────────────────────────────


        _onAttackPerformed(result) {
          var _result$target, _result$target$node, _result$target2, _result$target$node2;

          // 1. 播放攻击动画（非循环，10fps → 0.4s 播完 4 帧）
          this._playAnim('attack', false, 10); // 2. 刀光弹道


          if (this._playerNode && (_result$target = result.target) != null && _result$target.isValid && (_result$target$node = result.target.node) != null && _result$target$node.isValid) {
            this._spawnProjectile(this._playerNode.getPosition(), result.target.node.getPosition(), result.isCrit);
          } // 3. 受击闪白 + 抖动


          if ((_result$target2 = result.target) != null && _result$target2.isValid && (_result$target$node2 = result.target.node) != null && _result$target$node2.isValid) {
            this._flashWhite(result.target.node);

            this._jolt(result.target.node, SHAKE_INTENSITY);
          } // 4. 屏幕震动（暴击更猛）


          this._screenShake(result.isCrit ? SHAKE_INTENSITY * 1.5 : SHAKE_INTENSITY, SHAKE_DURATION); // 5. 攻击动画结束后回到 idle（非循环动画自动停止后, CharacterVisualService
          //    的 loop:false 动画播完最后一帧会静置，这里延迟切回 idle）


          this._scheduleIdleAfterAttack();
        }

        _onPlayerDamaged(_damage, _isCrit) {
          if (!this._playerNode) return; // 1. 受击动画

          this._playAnim('hit', false, 10); // 2. 闪白 + 震屏


          this._flashWhite(this._playerNode);

          this._screenShake(SHAKE_INTENSITY * 0.8, SHAKE_DURATION);
        }

        _onElementReaction(_reaction) {
          this._screenShake(SHAKE_INTENSITY * 1.3, SHAKE_DURATION * 1.4);
        }
        /** 攻击动画完成后恢复 idle（约 0.5s 后） */


        _scheduleIdleAfterAttack() {
          setTimeout(() => {
            var _this$_playerNode;

            if (!((_this$_playerNode = this._playerNode) != null && _this$_playerNode.isValid)) return;

            this._playAnim('idle', true, 6);
          }, 500);
        } // ── 特效函数 ──────────────────────────────


        _flashWhite(node) {
          const sprite = node.getComponent(Sprite);
          if (!sprite) return;
          const orig = sprite.color.clone();
          sprite.color = Color.WHITE;
          tween(sprite).delay(FLASH_DURATION).call(() => {
            if (sprite.isValid) sprite.color = orig;
          }).start();
        }

        _jolt(node, intensity) {
          const orig = node.getPosition();
          const dx = (Math.random() - 0.5) * intensity;
          const dy = (Math.random() - 0.5) * intensity;
          tween(node).to(0.025, {
            position: new Vec3(orig.x + dx, orig.y + dy, orig.z)
          }).to(0.025, {
            position: orig
          }).start();
        }

        _screenShake(intensity, duration) {
          if (!this._cameraNode) return;
          const orig = this._cameraOrig;
          const steps = Math.floor(duration / 0.03);

          for (let i = 0; i < steps; i++) {
            const t = i * 30;
            setTimeout(() => {
              var _this$_cameraNode2;

              if (!((_this$_cameraNode2 = this._cameraNode) != null && _this$_cameraNode2.isValid)) return;
              const decay = 1 - i / steps;
              const ox = (Math.random() - 0.5) * intensity * decay;
              const oy = (Math.random() - 0.5) * intensity * decay;

              this._cameraNode.setPosition(orig.x + ox, orig.y + oy, orig.z);
            }, t);
          }

          setTimeout(() => {
            var _this$_cameraNode3;

            if ((_this$_cameraNode3 = this._cameraNode) != null && _this$_cameraNode3.isValid) this._cameraNode.setPosition(orig);
          }, duration * 1000 + 50);
        }

        _spawnProjectile(from, to, isCrit) {
          var _director$getScene3;

          const canvas = (_director$getScene3 = director.getScene()) == null ? void 0 : _director$getScene3.getComponentInChildren(Canvas);
          if (!canvas) return;
          const proj = new Node('_projectile');
          const uiTransform = proj.addComponent(UITransform);
          const size = isCrit ? 32 : 20;
          uiTransform.setContentSize(size, size);
          const sprite = proj.addComponent(Sprite);

          if (isCrit) {
            sprite.color = new Color(255, 215, 0, 220);
          } else {
            sprite.color = new Color(255, 255, 200, 200);
          }

          canvas.node.addChild(proj);
          proj.setPosition(from);
          const mid = new Vec3((from.x + to.x) * 0.5, (from.y + to.y) * 0.5 + 20, 0);
          tween(proj).to(0.08, {
            position: mid
          }).to(0.06, {
            position: to
          }).call(() => {
            uiTransform.setContentSize(size * 2, size * 2);
          }).to(0.04, {
            scale: new Vec3(0.2, 0.2, 1),
            opacity: 0
          }).call(() => {
            if (proj.isValid) proj.destroy();
          }).start();
        }

      });

      CombatEffectService._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=9c06cf049a3464b41837d28718d7f0a58de86fb8.js.map