System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, tween, Sprite, Vec3, MonsterState, MonsterAIType, MonsterAgent, MonsterRuntimeView, SpriteAnimationService, _dec, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _crd, ccclass, property, MonsterController;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfMonsterState(extras) {
    _reporterNs.report("MonsterState", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterAIType(extras) {
    _reporterNs.report("MonsterAIType", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIPlayerAgent(extras) {
    _reporterNs.report("IPlayerAgent", "./IPlayerAgent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGridManager(extras) {
    _reporterNs.report("GridManager", "../dungeon/GridManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterAgent(extras) {
    _reporterNs.report("MonsterAgent", "./entity/MonsterAgent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAgentState(extras) {
    _reporterNs.report("AgentState", "./entity/MonsterAgent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterRuntimeView(extras) {
    _reporterNs.report("MonsterRuntimeView", "./MonsterRuntimeView", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSpriteAnimationService(extras) {
    _reporterNs.report("SpriteAnimationService", "../render/SpriteAnimationService", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      tween = _cc.tween;
      Sprite = _cc.Sprite;
      Vec3 = _cc.Vec3;
    }, function (_unresolved_2) {
      MonsterState = _unresolved_2.MonsterState;
      MonsterAIType = _unresolved_2.MonsterAIType;
    }, function (_unresolved_3) {
      MonsterAgent = _unresolved_3.MonsterAgent;
    }, function (_unresolved_4) {
      MonsterRuntimeView = _unresolved_4.MonsterRuntimeView;
    }, function (_unresolved_5) {
      SpriteAnimationService = _unresolved_5.SpriteAnimationService;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "01705UDcL5JprlPJip25HKI", "MonsterController", undefined);
      /**
       * MonsterController - 怪物 Cocos 控制器（Phase 7 精简版）
       *
       * 职责:
       * 1. Cocos Component 生命周期（onLoad/init/update）
       * 2. @property 绑定（编辑器可配置默认值）
       * 3. 委托 MonsterAgent 处理所有逻辑
       *   - AI 行为 → AI 策略类 (ai/)
       *   - 属性 → CombatEntity
       *   - 状态 → StatusController
       *   - 阶段 → BossPhaseController
       *   - 受伤 → DamageReceiver
       *
       * Phase 7: 从 667 行精简到 ≤200 行
       */


      __checkObsolete__(['_decorator', 'Component', 'Node', 'tween', 'Sprite', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("MonsterController", MonsterController = (_dec = ccclass('MonsterController'), _dec(_class = (_class2 = class MonsterController extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "hp", _descriptor, this);

          _initializerDefineProperty(this, "atk", _descriptor2, this);

          _initializerDefineProperty(this, "def", _descriptor3, this);

          _initializerDefineProperty(this, "speed", _descriptor4, this);

          _initializerDefineProperty(this, "aiType", _descriptor5, this);

          this._agent = null;
          this._gridManager = null;
          this._sprite = null;
          this._animService = null;
          this._player = null;
          this._battleManagerRef = null;
          this._view = null;
        }

        onLoad() {
          var _ref, _ref2, _this$_view$bodySprit, _this$_view, _this$node$getChildBy;

          this._view = this.getComponent(_crd && MonsterRuntimeView === void 0 ? (_reportPossibleCrUseOfMonsterRuntimeView({
            error: Error()
          }), MonsterRuntimeView) : MonsterRuntimeView);
          this._sprite = (_ref = (_ref2 = (_this$_view$bodySprit = (_this$_view = this._view) == null ? void 0 : _this$_view.bodySprite) != null ? _this$_view$bodySprit : this.getComponent(Sprite)) != null ? _ref2 : (_this$node$getChildBy = this.node.getChildByName('Body')) == null ? void 0 : _this$node$getChildBy.getComponent(Sprite)) != null ? _ref : null;
          this._animService = (_crd && SpriteAnimationService === void 0 ? (_reportPossibleCrUseOfSpriteAnimationService({
            error: Error()
          }), SpriteAnimationService) : SpriteAnimationService).instance;
          this._agent = new (_crd && MonsterAgent === void 0 ? (_reportPossibleCrUseOfMonsterAgent({
            error: Error()
          }), MonsterAgent) : MonsterAgent)({
            onAttackAnimation: () => this._playAnim('attack'),
            onDieAnimation: () => this._playAnim('die'),
            onStateChanged: state => this._onAgentState(state),
            onFlashWhite: () => this._flashWhite(),
            onSummonEffect: () => this._scalePulse(),
            moveNodeTo: (wx, wy, dur) => {
              tween(this.node).to(dur, {
                position: new Vec3(wx, wy, 0)
              }).start();
            },
            isWalkable: (x, y) => {
              var _this$_gridManager$is, _this$_gridManager;

              return (_this$_gridManager$is = (_this$_gridManager = this._gridManager) == null ? void 0 : _this$_gridManager.isWalkable(x, y)) != null ? _this$_gridManager$is : false;
            },
            setOccupied: (x, y, occ) => {
              var _this$_gridManager2;

              return (_this$_gridManager2 = this._gridManager) == null ? void 0 : _this$_gridManager2.setOccupied(x, y, occ);
            },
            gridToWorldX: gx => {
              var _this$_gridManager$gr, _this$_gridManager3;

              return (_this$_gridManager$gr = (_this$_gridManager3 = this._gridManager) == null || (_this$_gridManager3 = _this$_gridManager3.gridToWorld(gx, 0)) == null ? void 0 : _this$_gridManager3.x) != null ? _this$_gridManager$gr : 0;
            },
            gridToWorldY: gy => {
              var _this$_gridManager$gr2, _this$_gridManager4;

              return (_this$_gridManager$gr2 = (_this$_gridManager4 = this._gridManager) == null || (_this$_gridManager4 = _this$_gridManager4.gridToWorld(0, gy)) == null ? void 0 : _this$_gridManager4.y) != null ? _this$_gridManager$gr2 : 0;
            }
          });
        }

        init(config, gridX, gridY, gridManager, battleManager) {
          var _this$_agent, _this$_view2, _this$_view3;

          this._gridManager = gridManager;
          this._battleManagerRef = battleManager;
          this.hp = config.hp;
          this.atk = config.atk;
          this.def = config.def;
          this.speed = config.speed;
          this.aiType = config.aiType;
          (_this$_agent = this._agent) == null || _this$_agent.init(config, gridX, gridY);
          (_this$_view2 = this._view) == null || _this$_view2.setHP(config.hp, config.hp);
          (_this$_view3 = this._view) == null || _this$_view3.showHP(!config.isBoss);
          const pos = gridManager.gridToWorld(gridX, gridY);
          this.node.setPosition(pos);
        }

        setTarget(player) {
          this._player = player;
        }

        updateAI(dt, player) {
          if (!this._agent || this._agent.isDead || !this._gridManager) return;

          this._agent.updateAI(dt, player.gridX, player.gridY);
        }

        takeDamage(rawDamage, isCrit = false) {
          var _this$_agent$takeDama, _this$_agent2, _this$_view4, _this$_agent$entity$h, _this$_agent3, _this$_agent$entity$m, _this$_agent4;

          const died = (_this$_agent$takeDama = (_this$_agent2 = this._agent) == null ? void 0 : _this$_agent2.takeDamage(rawDamage, isCrit)) != null ? _this$_agent$takeDama : false;
          (_this$_view4 = this._view) == null || _this$_view4.setHP((_this$_agent$entity$h = (_this$_agent3 = this._agent) == null ? void 0 : _this$_agent3.entity.hp) != null ? _this$_agent$entity$h : 0, (_this$_agent$entity$m = (_this$_agent4 = this._agent) == null ? void 0 : _this$_agent4.entity.maxHP) != null ? _this$_agent$entity$m : this.maxHP);

          if (died && this._agent) {
            this._agent.die();

            this._dieVisual();
          }

          return died;
        }

        freeze(duration) {
          var _this$_agent5;

          (_this$_agent5 = this._agent) == null || _this$_agent5.freeze(duration);
        }

        silence(duration) {
          var _this$_agent6;

          (_this$_agent6 = this._agent) == null || _this$_agent6.silence(duration);
        }

        applyDefDebuff(multiplier, duration, isDamageTaken) {
          var _this$_agent7;

          (_this$_agent7 = this._agent) == null || _this$_agent7.applyDefDebuff(multiplier, duration, isDamageTaken);
        }

        updateStatusTimers(dt) {
          var _this$_agent8;

          (_this$_agent8 = this._agent) == null || _this$_agent8.updateTimers(dt);
        }

        get state() {
          var _this$_agent$state, _this$_agent9;

          return this._mapState((_this$_agent$state = (_this$_agent9 = this._agent) == null ? void 0 : _this$_agent9.state) != null ? _this$_agent$state : 'idle');
        }

        get gridX() {
          var _this$_agent$gridX, _this$_agent10;

          return (_this$_agent$gridX = (_this$_agent10 = this._agent) == null ? void 0 : _this$_agent10.gridX) != null ? _this$_agent$gridX : 0;
        }

        get gridY() {
          var _this$_agent$gridY, _this$_agent11;

          return (_this$_agent$gridY = (_this$_agent11 = this._agent) == null ? void 0 : _this$_agent11.gridY) != null ? _this$_agent$gridY : 0;
        }

        get isDead() {
          var _this$_agent$isDead, _this$_agent12;

          return (_this$_agent$isDead = (_this$_agent12 = this._agent) == null ? void 0 : _this$_agent12.isDead) != null ? _this$_agent$isDead : false;
        }

        get hpPercent() {
          var _this$_agent$entity$h2, _this$_agent13;

          return (_this$_agent$entity$h2 = (_this$_agent13 = this._agent) == null ? void 0 : _this$_agent13.entity.hpPercent) != null ? _this$_agent$entity$h2 : 0;
        }

        get isFrozen() {
          var _this$_agent$status$i, _this$_agent14;

          return (_this$_agent$status$i = (_this$_agent14 = this._agent) == null ? void 0 : _this$_agent14.status.isFrozen) != null ? _this$_agent$status$i : false;
        }

        get isSilenced() {
          var _this$_agent$status$i2, _this$_agent15;

          return (_this$_agent$status$i2 = (_this$_agent15 = this._agent) == null ? void 0 : _this$_agent15.status.isSilenced) != null ? _this$_agent$status$i2 : false;
        }

        get isBoss() {
          var _this$_agent$bossPhas, _this$_agent16;

          return (_this$_agent$bossPhas = (_this$_agent16 = this._agent) == null ? void 0 : _this$_agent16.bossPhase.isBoss) != null ? _this$_agent$bossPhas : false;
        }

        get currentPhase() {
          var _this$_agent$bossPhas2, _this$_agent17;

          return (_this$_agent$bossPhas2 = (_this$_agent17 = this._agent) == null ? void 0 : _this$_agent17.bossPhase.currentPhase) != null ? _this$_agent$bossPhas2 : 1;
        }

        get maxPhases() {
          var _this$_agent$bossPhas3, _this$_agent18;

          return (_this$_agent$bossPhas3 = (_this$_agent18 = this._agent) == null ? void 0 : _this$_agent18.bossPhase.maxPhases) != null ? _this$_agent$bossPhas3 : 1;
        }

        get maxHP() {
          var _this$_agent$entity$m2, _this$_agent19;

          return (_this$_agent$entity$m2 = (_this$_agent19 = this._agent) == null ? void 0 : _this$_agent19.entity.maxHP) != null ? _this$_agent$entity$m2 : 20;
        }

        get config() {
          var _this$_agent$config, _this$_agent20;

          return (_this$_agent$config = (_this$_agent20 = this._agent) == null ? void 0 : _this$_agent20.config) != null ? _this$_agent$config : null;
        }

        _onAgentState(state) {
          this._playAnim(state === 'attack' ? 'attack' : state === 'chase' ? 'walk' : 'idle');
        }

        _playAnim(name) {
          if (!this._animService) return; // Try monster-specific anim first, fallback to generic

          const animId = `monster_${name}`;

          if (this._animService.getConfig(animId)) {
            this._animService.play(this.node, animId);
          }
        }

        _flashWhite() {
          if (this._view) {
            this._view.flashHit();

            return;
          }

          if (!this._sprite) return;
          this._sprite.color = {
            r: 255,
            g: 80,
            b: 80,
            a: 255
          };
          this.scheduleOnce(() => {
            if (this._sprite && !this.isDead) this._sprite.color = {
              r: 255,
              g: 255,
              b: 255,
              a: 255
            };
          }, 0.1);
        }

        _dieVisual() {
          this._flashWhite();

          tween(this.node).to(0.05, {
            scale: new Vec3(1.2, 1.2, 1)
          }).to(0.25, {
            scale: new Vec3(0, 0, 1)
          }).call(() => {
            if (this.node.isValid) this.node.destroy();
          }).start();
        }

        _scalePulse() {
          tween(this.node).to(0.1, {
            scale: new Vec3(1.2, 1.2, 1)
          }).to(0.1, {
            scale: new Vec3(1, 1, 1)
          }).start();
        }

        _mapState(s) {
          var _map$s;

          const map = {
            idle: (_crd && MonsterState === void 0 ? (_reportPossibleCrUseOfMonsterState({
              error: Error()
            }), MonsterState) : MonsterState).Idle,
            chase: (_crd && MonsterState === void 0 ? (_reportPossibleCrUseOfMonsterState({
              error: Error()
            }), MonsterState) : MonsterState).Chase,
            attack: (_crd && MonsterState === void 0 ? (_reportPossibleCrUseOfMonsterState({
              error: Error()
            }), MonsterState) : MonsterState).Attack,
            retreat: (_crd && MonsterState === void 0 ? (_reportPossibleCrUseOfMonsterState({
              error: Error()
            }), MonsterState) : MonsterState).Retreat,
            defend: (_crd && MonsterState === void 0 ? (_reportPossibleCrUseOfMonsterState({
              error: Error()
            }), MonsterState) : MonsterState).Defend,
            dead: (_crd && MonsterState === void 0 ? (_reportPossibleCrUseOfMonsterState({
              error: Error()
            }), MonsterState) : MonsterState).Dead
          };
          return (_map$s = map[s]) != null ? _map$s : (_crd && MonsterState === void 0 ? (_reportPossibleCrUseOfMonsterState({
            error: Error()
          }), MonsterState) : MonsterState).Idle;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "hp", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 20;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "atk", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 5;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "def", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "speed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 60;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "aiType", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return (_crd && MonsterAIType === void 0 ? (_reportPossibleCrUseOfMonsterAIType({
            error: Error()
          }), MonsterAIType) : MonsterAIType).Charger;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=1e9fe634325c90f434683823f1080775f3126a7e.js.map