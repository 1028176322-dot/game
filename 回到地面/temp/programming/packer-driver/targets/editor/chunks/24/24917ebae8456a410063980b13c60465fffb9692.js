System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, ILogger, ICollisionService, ISkillGraph, IHitResolver, IDamageResolver, SkillExecutor, _crd, ISkillExecutor;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../../core/LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfLogger(extras) {
    _reporterNs.report("Logger", "../../core/Logger", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILogger(extras) {
    _reporterNs.report("ILogger", "../../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfICollisionService(extras) {
    _reporterNs.report("ICollisionService", "../../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfICollisionServiceContract(extras) {
    _reporterNs.report("ICollisionServiceContract", "../../physics/ICollisionService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCollider(extras) {
    _reporterNs.report("Collider", "../../physics/ICollisionService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfVec(extras) {
    _reporterNs.report("Vec3", "../../physics/ICollisionService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSkillGraph(extras) {
    _reporterNs.report("SkillGraph", "./SkillGraph", _context.meta, extras);
  }

  function _reportPossibleCrUseOfISkillGraph(extras) {
    _reporterNs.report("ISkillGraph", "./SkillGraph", _context.meta, extras);
  }

  function _reportPossibleCrUseOfDamageable(extras) {
    _reporterNs.report("Damageable", "./SkillData", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSkillCaster(extras) {
    _reporterNs.report("SkillCaster", "./SkillData", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSkillData(extras) {
    _reporterNs.report("SkillData", "./SkillData", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSkillNode(extras) {
    _reporterNs.report("SkillNode", "./SkillData", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSkillNodeKind(extras) {
    _reporterNs.report("SkillNodeKind", "./SkillData", _context.meta, extras);
  }

  function _reportPossibleCrUseOfHitResolver(extras) {
    _reporterNs.report("HitResolver", "./Resolvers", _context.meta, extras);
  }

  function _reportPossibleCrUseOfDamageResolver(extras) {
    _reporterNs.report("DamageResolver", "./Resolvers", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIHitResolver(extras) {
    _reporterNs.report("IHitResolver", "./Resolvers", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIDamageResolver(extras) {
    _reporterNs.report("IDamageResolver", "./Resolvers", _context.meta, extras);
  }

  _export("SkillExecutor", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      ILogger = _unresolved_2.ILogger;
      ICollisionService = _unresolved_2.ICollisionService;
    }, function (_unresolved_3) {
      ISkillGraph = _unresolved_3.ISkillGraph;
    }, function (_unresolved_4) {
      IHitResolver = _unresolved_4.IHitResolver;
      IDamageResolver = _unresolved_4.IDamageResolver;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "4ecc4TcyOVJw4N+b57C03kK", "SkillExecutor", undefined); // SkillExecutor.ts — runs a skill through its SkillGraph nodes (§3.9).
      // Pure TS, no `cc`. Implements ILifecycle (red line 3).
      //
      // Red line 2: NO `switch(skillId)`. Nodes are dispatched by a kind->handler Map. The executor
      //   never reads data.id to choose behavior; the same code path runs for every skill.
      // Red line 4: all dependencies are pulled from GameContext via ctx.get (no `new` of services).
      //
      // Authoritative spec: docs/2D转3D全面升级方案.md §3.9 + demo4.md.


      // Service token (co-located with the owning module).
      _export("ISkillExecutor", ISkillExecutor = 'ISkillExecutor'); // Collider that optionally carries its owning Damageable (engine side wires this at runtime).


      _export("SkillExecutor", SkillExecutor = class SkillExecutor {
        constructor() {
          this.name = 'SkillExecutor';
          this._ctx = null;
          this._logger = null;
          this._collision = null;
          this._graph = null;
          this._hitResolver = null;
          this._damageResolver = null;
          this._handlers = new Map();
          this._initialized = false;
        }

        // --- ILifecycle (§5.1) ---
        initialize(ctx) {
          this._ctx = ctx; // Red line 4: resolve dependencies through the container, never `new` a service.

          this._logger = ctx.get(_crd && ILogger === void 0 ? (_reportPossibleCrUseOfILogger({
            error: Error()
          }), ILogger) : ILogger);
          this._collision = ctx.get(_crd && ICollisionService === void 0 ? (_reportPossibleCrUseOfICollisionService({
            error: Error()
          }), ICollisionService) : ICollisionService);
          this._graph = ctx.get(_crd && ISkillGraph === void 0 ? (_reportPossibleCrUseOfISkillGraph({
            error: Error()
          }), ISkillGraph) : ISkillGraph);
          this._hitResolver = ctx.get(_crd && IHitResolver === void 0 ? (_reportPossibleCrUseOfIHitResolver({
            error: Error()
          }), IHitResolver) : IHitResolver);
          this._damageResolver = ctx.get(_crd && IDamageResolver === void 0 ? (_reportPossibleCrUseOfIDamageResolver({
            error: Error()
          }), IDamageResolver) : IDamageResolver);

          this._registerHandlers();

          this._initialized = true;
        }

        enter() {}

        exit() {}

        pause() {}

        resume() {}

        destroy() {
          this._handlers.clear();

          this._ctx = null;
          this._logger = null;
          this._collision = null;
          this._graph = null;
          this._initialized = false;
        }

        get initialized() {
          return this._initialized;
        } // Red line 2: dispatch by kind via a registry Map, never by `switch(skillId)`.


        _registerHandlers() {
          this._handlers.set('projectile', (node, rt) => {
            const n = node;
            rt.logger.channel('battle').info(`[Skill] projectile fired speed=${n.speed} radius=${n.radius} duration=${n.duration}`); // Projectile travels to the aim point; the explosion node below uses rt.aim as the center.
          });

          this._handlers.set('explosion', (node, rt) => {
            const n = node;
            const hits = rt.collision.overlapSphere(rt.aim, n.radius);

            for (const c of hits) {
              const owner = c.owner;

              if (owner) {
                this._hitResolver.resolve(owner, n.damage, rt.caster.id);

                rt.hitTargets.push(owner);
              }
            }
          });

          this._handlers.set('burn', (node, rt) => {
            const n = node;

            for (const t of rt.hitTargets) {
              this._damageResolver.applyBurn(t, n.dps, n.duration, rt.caster.id);
            }
          });
        } // Execute a skill: build the data-driven node chain, then run each node through its handler.


        execute(data, caster, aim) {
          if (!this._graph || !this._collision || !this._logger || !this._hitResolver || !this._damageResolver) {
            throw new Error('[SkillExecutor] not initialized');
          }

          const nodes = this._graph.build(data);

          const rt = {
            caster,
            aim,
            collision: this._collision,
            logger: this._logger,
            hitTargets: []
          };

          for (const node of nodes) {
            const handler = this._handlers.get(node.kind);

            if (!handler) {
              this._logger.channel('battle').warn(`[Skill] no handler registered for node kind: ${node.kind}`);

              continue;
            }

            handler(node, rt);
          }
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=24917ebae8456a410063980b13c60465fffb9692.js.map