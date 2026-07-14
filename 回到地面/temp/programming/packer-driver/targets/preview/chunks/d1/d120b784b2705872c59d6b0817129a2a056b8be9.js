System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, EntityManager, _crd, IEntityManager;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "../core/LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfStatComponent(extras) {
    _reporterNs.report("StatComponent", "./StatComponent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMovementComponent(extras) {
    _reporterNs.report("MovementComponent", "./MovementComponent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAnimationComponent(extras) {
    _reporterNs.report("AnimationComponent", "./AnimationComponent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCombatComponent(extras) {
    _reporterNs.report("CombatComponent", "./CombatComponent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTargetComponent(extras) {
    _reporterNs.report("TargetComponent", "./TargetComponent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfInteractionComponent(extras) {
    _reporterNs.report("InteractionComponent", "./InteractionComponent", _context.meta, extras);
  }

  _export("EntityManager", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "affca5R0qhOdr8cZJjmbRov", "EntityManager", undefined); // EntityManager.ts — ECS entity registry (§3.12).
      // Pure TS, no `cc`. Implements ILifecycle. Manages all entity components.
      // Entities are registered/deregistered as they enter/leave rooms.
      // CombatSystem's entity pool can be backed by this registry.


      _export("IEntityManager", IEntityManager = 'IEntityManager'); // Minimal entity descriptor — holds all component references.


      _export("EntityManager", EntityManager = class EntityManager {
        constructor() {
          this.name = 'EntityManager';
          this._entities = new Map();
          this._initialized = false;
        }

        // --- ILifecycle ---
        initialize(_ctx) {
          this._initialized = true;
        }

        enter() {}

        exit() {
          this.clear();
        }

        pause() {}

        resume() {}

        destroy() {
          this.clear();
          this._initialized = false;
        }

        get initialized() {
          return this._initialized;
        }

        register(desc) {
          if (this._entities.has(desc.id)) {
            throw new Error("[EntityManager] duplicate entity: " + desc.id);
          }

          this._entities.set(desc.id, desc);
        }

        unregister(entityId) {
          this._entities.delete(entityId);
        }

        get(entityId) {
          return this._entities.get(entityId);
        }

        getAll() {
          return Array.from(this._entities.values());
        }

        getByTeam(team) {
          return this.getAll().filter(e => e.team === team);
        }

        getAlive() {
          return this.getAll().filter(e => e.stat.alive);
        }

        count() {
          return this._entities.size;
        }

        clear() {
          this._entities.clear();
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=d120b784b2705872c59d6b0817129a2a056b8be9.js.map