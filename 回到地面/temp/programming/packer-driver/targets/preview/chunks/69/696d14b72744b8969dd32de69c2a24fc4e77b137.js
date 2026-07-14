System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7", "__unresolved_8"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, IEventBus, StatComponent, MovementComponent, AnimationComponent, CombatComponent, TargetComponent, InteractionComponent, StatDamageable, EcsEntityFactory, _crd;

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIEventBus(extras) {
    _reporterNs.report("IEventBus", "../core/GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEventBusManager(extras) {
    _reporterNs.report("EventBusManager", "../core/EventBusManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEntityDescriptor(extras) {
    _reporterNs.report("EntityDescriptor", "./EntityManager", _context.meta, extras);
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

  function _reportPossibleCrUseOfPlayerAnimState(extras) {
    _reporterNs.report("PlayerAnimState", "./AnimationComponent", _context.meta, extras);
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

  function _reportPossibleCrUseOfStatDamageable(extras) {
    _reporterNs.report("StatDamageable", "./StatDamageable", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEntityTeam(extras) {
    _reporterNs.report("EntityTeam", "./StatDamageable", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBattleCommand(extras) {
    _reporterNs.report("BattleCommand", "../battle/combat/CombatCommand", _context.meta, extras);
  }

  _export("EcsEntityFactory", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      IEventBus = _unresolved_2.IEventBus;
    }, function (_unresolved_3) {
      StatComponent = _unresolved_3.StatComponent;
    }, function (_unresolved_4) {
      MovementComponent = _unresolved_4.MovementComponent;
    }, function (_unresolved_5) {
      AnimationComponent = _unresolved_5.AnimationComponent;
    }, function (_unresolved_6) {
      CombatComponent = _unresolved_6.CombatComponent;
    }, function (_unresolved_7) {
      TargetComponent = _unresolved_7.TargetComponent;
    }, function (_unresolved_8) {
      InteractionComponent = _unresolved_8.InteractionComponent;
    }, function (_unresolved_9) {
      StatDamageable = _unresolved_9.StatDamageable;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "b6c3cXoSO5KDIpCJf/40j54", "EcsEntityFactory", undefined); // EcsEntityFactory.ts — assembles a full ECS entity (6 components + Damageable adapter) from
      // GameContext-injected dependencies (§3.12). Pure TS, no `cc`. Used by the engine bridge and
      // by tests. All component initialization is via ctx.get (red line 4: no new services).


      _export("EcsEntityFactory", EcsEntityFactory = class EcsEntityFactory {
        static build(ctx, opts) {
          var _opts$isBoss;

          var stat = new (_crd && StatComponent === void 0 ? (_reportPossibleCrUseOfStatComponent({
            error: Error()
          }), StatComponent) : StatComponent)();
          stat.initialize(opts.baseHP, opts.baseATK, opts.baseDEF, opts.baseSpeed);
          var movement = new (_crd && MovementComponent === void 0 ? (_reportPossibleCrUseOfMovementComponent({
            error: Error()
          }), MovementComponent) : MovementComponent)();
          movement.initialize(ctx, opts.startX, opts.startY);
          var anim = new (_crd && AnimationComponent === void 0 ? (_reportPossibleCrUseOfAnimationComponent({
            error: Error()
          }), AnimationComponent) : AnimationComponent)(opts.clipMap);
          anim.initialize(ctx);
          var combat = new (_crd && CombatComponent === void 0 ? (_reportPossibleCrUseOfCombatComponent({
            error: Error()
          }), CombatComponent) : CombatComponent)();
          combat.initialize(opts.id, opts.dispatch);
          var target = new (_crd && TargetComponent === void 0 ? (_reportPossibleCrUseOfTargetComponent({
            error: Error()
          }), TargetComponent) : TargetComponent)();
          target.initialize(opts.startX, opts.startY);
          var interaction = new (_crd && InteractionComponent === void 0 ? (_reportPossibleCrUseOfInteractionComponent({
            error: Error()
          }), InteractionComponent) : InteractionComponent)();
          interaction.initialize(opts.id, ctx.get(_crd && IEventBus === void 0 ? (_reportPossibleCrUseOfIEventBus({
            error: Error()
          }), IEventBus) : IEventBus));
          var descriptor = {
            id: opts.id,
            team: opts.team,
            stat,
            movement,
            anim,
            combat,
            target,
            interaction
          };
          var damageable = new (_crd && StatDamageable === void 0 ? (_reportPossibleCrUseOfStatDamageable({
            error: Error()
          }), StatDamageable) : StatDamageable)(opts.id, opts.team, stat, movement, (_opts$isBoss = opts.isBoss) != null ? _opts$isBoss : false);
          return {
            descriptor,
            damageable
          };
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=696d14b72744b8969dd32de69c2a24fc4e77b137.js.map