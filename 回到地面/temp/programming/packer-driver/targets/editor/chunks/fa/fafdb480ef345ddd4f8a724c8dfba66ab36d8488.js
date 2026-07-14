System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7", "__unresolved_8"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, ILogger, IConfigDatabase, ISkillGraph, ISkillExecutor, IHitResolver, IDamageResolver, ITargetSelector, EffectExecutor, ProjectileSystem, LockOnManager, CombatSystem, _crd, ICombatSystem;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../../core/LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILogger(extras) {
    _reporterNs.report("ILogger", "../../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIConfigDatabase(extras) {
    _reporterNs.report("IConfigDatabase", "../../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfLogger(extras) {
    _reporterNs.report("Logger", "../../core/Logger", _context.meta, extras);
  }

  function _reportPossibleCrUseOfConfigDatabase(extras) {
    _reporterNs.report("ConfigDatabase", "../../core/ConfigDatabase", _context.meta, extras);
  }

  function _reportPossibleCrUseOfISkillGraph(extras) {
    _reporterNs.report("ISkillGraph", "../skill/SkillGraph", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSkillGraph(extras) {
    _reporterNs.report("SkillGraph", "../skill/SkillGraph", _context.meta, extras);
  }

  function _reportPossibleCrUseOfISkillExecutor(extras) {
    _reporterNs.report("ISkillExecutor", "../skill/SkillExecutor", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSkillExecutor(extras) {
    _reporterNs.report("SkillExecutor", "../skill/SkillExecutor", _context.meta, extras);
  }

  function _reportPossibleCrUseOfHitResolver(extras) {
    _reporterNs.report("HitResolver", "../skill/Resolvers", _context.meta, extras);
  }

  function _reportPossibleCrUseOfDamageResolver(extras) {
    _reporterNs.report("DamageResolver", "../skill/Resolvers", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIHitResolver(extras) {
    _reporterNs.report("IHitResolver", "../skill/Resolvers", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIDamageResolver(extras) {
    _reporterNs.report("IDamageResolver", "../skill/Resolvers", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSkillData(extras) {
    _reporterNs.report("SkillData", "../skill/SkillData", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTargetSelector(extras) {
    _reporterNs.report("TargetSelector", "./TargetSelector", _context.meta, extras);
  }

  function _reportPossibleCrUseOfITargetSelector(extras) {
    _reporterNs.report("ITargetSelector", "./TargetSelector", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEffectExecutor(extras) {
    _reporterNs.report("EffectExecutor", "./EffectExecutor", _context.meta, extras);
  }

  function _reportPossibleCrUseOfProjectileSystem(extras) {
    _reporterNs.report("ProjectileSystem", "./ProjectileSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfHitRecord(extras) {
    _reporterNs.report("HitRecord", "./ProjectileSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfLockOnManager(extras) {
    _reporterNs.report("LockOnManager", "./LockOnManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBattleCommand(extras) {
    _reporterNs.report("BattleCommand", "./CombatCommand", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCombatEntity(extras) {
    _reporterNs.report("CombatEntity", "./CombatCommand", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTargetResult(extras) {
    _reporterNs.report("TargetResult", "./CombatCommand", _context.meta, extras);
  }

  function _reportPossibleCrUseOfDamageable(extras) {
    _reporterNs.report("Damageable", "../skill/SkillData", _context.meta, extras);
  }

  function _reportPossibleCrUseOfVec(extras) {
    _reporterNs.report("Vec3", "../../physics/ICollisionService", _context.meta, extras);
  }

  _export("CombatSystem", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      ILogger = _unresolved_2.ILogger;
      IConfigDatabase = _unresolved_2.IConfigDatabase;
    }, function (_unresolved_3) {
      ISkillGraph = _unresolved_3.ISkillGraph;
    }, function (_unresolved_4) {
      ISkillExecutor = _unresolved_4.ISkillExecutor;
    }, function (_unresolved_5) {
      IHitResolver = _unresolved_5.IHitResolver;
      IDamageResolver = _unresolved_5.IDamageResolver;
    }, function (_unresolved_6) {
      ITargetSelector = _unresolved_6.ITargetSelector;
    }, function (_unresolved_7) {
      EffectExecutor = _unresolved_7.EffectExecutor;
    }, function (_unresolved_8) {
      ProjectileSystem = _unresolved_8.ProjectileSystem;
    }, function (_unresolved_9) {
      LockOnManager = _unresolved_9.LockOnManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "622f8z7SkVKqqX0Y24loYJi", "CombatSystem", undefined); // CombatSystem.ts — combat orchestration dispatcher (§3.8).
      // Pure TS, no `cc`. Implements ILifecycle (red line 3). Dependencies resolved via ctx.get.
      //
      // Flow per §6.2:
      //   BattleCommand -> TargetSelector -> HitResolver -> DamageResolver -> [EffectExecutor, ProjectileSystem]
      //   LockOnManager runs alongside HitResolver for lock-on camera.
      //
      // Red line 2: dispatch uses a Map<BattleCommandKind, handler> (no switch on id).
      // Red line 4: all services pulled from GameContext (no `new` of services here).
      // Red line 5: no Math.random; all damage is deterministic.
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.8 + §6.2.


      _export("ICombatSystem", ICombatSystem = 'ICombatSystem'); // Dispatch handler registry (Map, no switch on kind).


      _export("CombatSystem", CombatSystem = class CombatSystem {
        constructor() {
          this.name = 'CombatSystem';
          this._ctx = null;
          this._logger = null;
          this._configDB = null;
          this._skillGraph = null;
          this._skillExecutor = null;
          this._selector = null;
          this._hitResolver = null;
          this._damageResolver = null;
          this._effects = new (_crd && EffectExecutor === void 0 ? (_reportPossibleCrUseOfEffectExecutor({
            error: Error()
          }), EffectExecutor) : EffectExecutor)();
          this._projectiles = new (_crd && ProjectileSystem === void 0 ? (_reportPossibleCrUseOfProjectileSystem({
            error: Error()
          }), ProjectileSystem) : ProjectileSystem)();
          this._lockOn = new (_crd && LockOnManager === void 0 ? (_reportPossibleCrUseOfLockOnManager({
            error: Error()
          }), LockOnManager) : LockOnManager)();
          this._handlers = new Map();
          this._pool = [];
          this._initialized = false;

          // Map dispatch per BattleCommandKind (no switch).
          this._handlers.set('skill', this._handleSkill.bind(this));

          this._handlers.set('move', this._handleMove.bind(this));
        } // --- ILifecycle (§5.1) ---


        initialize(ctx) {
          this._ctx = ctx;
          this._logger = ctx.get(_crd && ILogger === void 0 ? (_reportPossibleCrUseOfILogger({
            error: Error()
          }), ILogger) : ILogger);
          this._configDB = ctx.get(_crd && IConfigDatabase === void 0 ? (_reportPossibleCrUseOfIConfigDatabase({
            error: Error()
          }), IConfigDatabase) : IConfigDatabase);
          this._skillGraph = ctx.get(_crd && ISkillGraph === void 0 ? (_reportPossibleCrUseOfISkillGraph({
            error: Error()
          }), ISkillGraph) : ISkillGraph);
          this._skillExecutor = ctx.get(_crd && ISkillExecutor === void 0 ? (_reportPossibleCrUseOfISkillExecutor({
            error: Error()
          }), ISkillExecutor) : ISkillExecutor);
          this._selector = ctx.get(_crd && ITargetSelector === void 0 ? (_reportPossibleCrUseOfITargetSelector({
            error: Error()
          }), ITargetSelector) : ITargetSelector);
          this._hitResolver = ctx.get(_crd && IHitResolver === void 0 ? (_reportPossibleCrUseOfIHitResolver({
            error: Error()
          }), IHitResolver) : IHitResolver);
          this._damageResolver = ctx.get(_crd && IDamageResolver === void 0 ? (_reportPossibleCrUseOfIDamageResolver({
            error: Error()
          }), IDamageResolver) : IDamageResolver);

          this._effects.initialize(ctx);

          this._projectiles.initialize(ctx);

          this._lockOn.initialize(ctx);

          this._initialized = true;
        }

        enter() {}

        exit() {
          this._pool.length = 0;

          this._effects.exit();

          this._projectiles.exit();

          this._lockOn.exit();
        }

        pause() {}

        resume() {}

        destroy() {
          this._pool.length = 0;

          this._effects.destroy();

          this._projectiles.destroy();

          this._lockOn.destroy();

          this._ctx = null;
          this._logger = null;
          this._configDB = null;
          this._skillGraph = null;
          this._skillExecutor = null;
          this._initialized = false;
        }

        get initialized() {
          return this._initialized;
        } // ---- Entity pool management ----


        register(entity) {
          if (!this._pool.some(e => e.id === entity.id)) {
            this._pool.push(entity);
          }
        }

        unregister(entityId) {
          const idx = this._pool.findIndex(e => e.id === entityId);

          if (idx >= 0) this._pool.splice(idx, 1);
        }

        get entities() {
          return this._pool;
        } // ---- Subsystem accessors (for test / debug) ----


        get effects() {
          return this._effects;
        }

        get projectiles() {
          return this._projectiles;
        }

        get lockOn() {
          return this._lockOn;
        }

        get selector() {
          return this._selector;
        } // ---- Dispatch entry point ----


        dispatch(cmd) {
          if (!this._ctx || !this._logger || !this._selector) {
            throw new Error('[CombatSystem] not initialized');
          }

          const selector = this._selector;

          const self = this._pool.find(e => e.id === cmd.entityId);

          if (!self || !self.alive) {
            this._logger.channel('battle').warn(`[CombatSystem] entity not found or dead: ${cmd.entityId}`);

            return;
          }

          const result = selector.resolve(cmd, this._pool, self);

          this._lockOn.apply(result);

          const handler = this._handlers.get(cmd.kind);

          if (handler) {
            handler(cmd, self, this._pool, result);
          } else {
            this._logger.channel('battle').warn(`[CombatSystem] unhandled command kind: ${cmd.kind}`);
          }
        } // Per-frame update: projectile flight + status ticking.


        update(dt) {
          // Advance projectiles.
          const hits = this._projectiles.update(dt, this._pool);

          for (const h of hits) {
            this._applyProjectileHit(h);
          } // Tick active status effects.


          this._effects.update(dt); // Lock-on timer.


          this._lockOn.update(dt);
        } // ---- Private handlers (registered in the Map, no switch) ----


        _handleSkill(cmd, self, _pool, result) {
          var _cmd$skillId, _cmd$aimPosition, _this$_logger2, _result$primary$id, _result$primary;

          if (!this._configDB || !this._skillGraph || !this._skillExecutor || !this._hitResolver || !this._damageResolver) return;
          const skillId = (_cmd$skillId = cmd.skillId) != null ? _cmd$skillId : 'melee_attack';

          const skillConfig = this._configDB.getSkill(skillId);

          const data = skillConfig;

          if (!data) {
            var _this$_logger;

            (_this$_logger = this._logger) == null || _this$_logger.channel('battle').warn(`[CombatSystem] skill config not found: ${skillId}`);
            return;
          }

          const nodes = this._skillGraph.build(data);

          const aim = (_cmd$aimPosition = cmd.aimPosition) != null ? _cmd$aimPosition : {
            x: self.gridX,
            y: 0,
            z: self.gridY
          };
          const caster = {
            id: cmd.sourceId,
            position: {
              x: self.gridX,
              y: 0,
              z: self.gridY
            }
          }; // Execute the skill; the SkillExecutor resolves via ICollisionService internally.

          this._skillExecutor.execute(data, caster, aim); // Apply hit results to the primary target.


          if (result.primary) {
            var _data$onHit$damage, _data$onHit, _data$onHit2;

            const dmg = (_data$onHit$damage = (_data$onHit = data.onHit) == null ? void 0 : _data$onHit.damage) != null ? _data$onHit$damage : 0;

            this._hitResolver.resolve(result.primary, dmg, cmd.sourceId);

            if ((_data$onHit2 = data.onHit) != null && _data$onHit2.burn) {
              this._damageResolver.applyBurn(result.primary, data.onHit.burn.dps, data.onHit.burn.duration, cmd.sourceId);
            }
          } // Spawn projectiles if the skill has projectile data.


          if (data.projectile && result.primary) {
            var _data$onHit$damage2, _data$onHit3;

            this._projectiles.spawn({
              id: `${skillId}_${cmd.sourceId}_${Date.now()}`,
              speed: data.projectile.speed,
              radius: data.projectile.radius,
              maxDuration: data.projectile.duration,
              damage: (_data$onHit$damage2 = (_data$onHit3 = data.onHit) == null ? void 0 : _data$onHit3.damage) != null ? _data$onHit$damage2 : 0,
              sourceId: cmd.sourceId,
              fromX: self.gridX,
              fromY: self.gridY,
              toX: result.primary.gridX,
              toY: result.primary.gridY
            });
          }

          (_this$_logger2 = this._logger) == null || _this$_logger2.channel('battle').info(`[CombatSystem] skill=${skillId} caster=${cmd.sourceId} target=${(_result$primary$id = (_result$primary = result.primary) == null ? void 0 : _result$primary.id) != null ? _result$primary$id : 'none'}`);
        }

        _handleMove(_cmd, _self, _pool, _result) {
          var _this$_logger3;

          // Move handling is delegated to MovementComponent (Phase 3 ECS).
          // For Phase 1, this is a no-op placeholder.
          (_this$_logger3 = this._logger) == null || _this$_logger3.channel('battle').info(`[CombatSystem] move command received (ECS Phase 3)`);
        }

        _applyProjectileHit(hit) {
          if (!this._hitResolver) return;

          const target = this._pool.find(e => e.id === hit.targetId);

          if (target && target.alive) {
            var _this$_logger4;

            this._hitResolver.resolve(target, hit.damage, hit.sourceId);

            (_this$_logger4 = this._logger) == null || _this$_logger4.channel('battle').info(`[CombatSystem] projectile hit ${hit.targetId} dmg=${hit.damage}`);
          }
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=fafdb480ef345ddd4f8a724c8dfba66ab36d8488.js.map