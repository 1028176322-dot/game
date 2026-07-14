System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7", "__unresolved_8", "__unresolved_9", "__unresolved_10", "__unresolved_11", "__unresolved_12", "__unresolved_13", "__unresolved_14", "__unresolved_15", "__unresolved_16", "__unresolved_17", "__unresolved_18", "__unresolved_19", "__unresolved_20", "__unresolved_21", "__unresolved_22", "__unresolved_23", "__unresolved_24", "__unresolved_25", "__unresolved_26", "__unresolved_27", "__unresolved_28", "__unresolved_29", "__unresolved_30", "__unresolved_31", "__unresolved_32", "__unresolved_33", "__unresolved_34", "__unresolved_35", "__unresolved_36", "__unresolved_37", "__unresolved_38", "__unresolved_39"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Label, Node, Camera, AssetBundleService, ConfigService, ConfigManager, GameManager, SceneFlowService, GameContext, ILogger, IConfigDatabase, IAssetCache, ICameraBrain, ICollisionService, IDebugService, ISaveManager, IReplayRecorder, IAnimationController, IAudioService, IEventBus, IRuntimeState, ILightingService, Logger, RuntimeState, ConfigDatabase, LifecycleManager, AssetCache, CameraBrain, CameraMode, PhysicsCollisionImpl, SkillGraph, ISkillGraph, SkillExecutor, ISkillExecutor, DungeonGenerator, RoomBuilder, NavigationGrid, RoomRuntime, IRoomRuntime, DebugPanel, PerfSampler, SaveManagerImpl, MemorySaveBackend, ReplayRecorder, AudioSystem, MemoryAudioSink, AnimationStateMachine, IAIController, AIController, EventBusManager, LightingService, EntityManager, IEntityManager, MovementComponent, IMovementComponent, AnimationComponent, IAnimationComponent, CombatComponent, ICombatComponent, StatComponent, IStatComponent, TargetComponent, ITargetComponent, InteractionComponent, IInteractionComponent, CombatSystem, ICombatSystem, TargetSelector, ITargetSelector, HitResolver, DamageResolver, IHitResolver, IDamageResolver, _dec, _dec2, _class, _class2, _descriptor, _class3, _crd, ccclass, property, GameBootstrap;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfAssetBundleService(extras) {
    _reporterNs.report("AssetBundleService", "../assets/AssetBundleService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfConfigService(extras) {
    _reporterNs.report("ConfigService", "../config/ConfigService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfConfigManager(extras) {
    _reporterNs.report("ConfigManager", "./ConfigManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameManager(extras) {
    _reporterNs.report("GameManager", "./GameManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSceneFlowService(extras) {
    _reporterNs.report("SceneFlowService", "../app/SceneFlowService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameContext(extras) {
    _reporterNs.report("GameContext", "./GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILogger(extras) {
    _reporterNs.report("ILogger", "./GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIConfigDatabase(extras) {
    _reporterNs.report("IConfigDatabase", "./GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIAssetCache(extras) {
    _reporterNs.report("IAssetCache", "./GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfICameraBrain(extras) {
    _reporterNs.report("ICameraBrain", "./GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfICollisionService(extras) {
    _reporterNs.report("ICollisionService", "./GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIDebugService(extras) {
    _reporterNs.report("IDebugService", "./GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfISaveManager(extras) {
    _reporterNs.report("ISaveManager", "./GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIReplayRecorder(extras) {
    _reporterNs.report("IReplayRecorder", "./GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIAnimationController(extras) {
    _reporterNs.report("IAnimationController", "./GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIAudioService(extras) {
    _reporterNs.report("IAudioService", "./GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIEventBus(extras) {
    _reporterNs.report("IEventBus", "./GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIRuntimeState(extras) {
    _reporterNs.report("IRuntimeState", "./GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILightingService(extras) {
    _reporterNs.report("ILightingService", "./GameContext", _context.meta, extras);
  }

  function _reportPossibleCrUseOfLogger(extras) {
    _reporterNs.report("Logger", "./Logger", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRuntimeState(extras) {
    _reporterNs.report("RuntimeState", "./RuntimeState", _context.meta, extras);
  }

  function _reportPossibleCrUseOfConfigDatabase(extras) {
    _reporterNs.report("ConfigDatabase", "./ConfigDatabase", _context.meta, extras);
  }

  function _reportPossibleCrUseOfLifecycleManager(extras) {
    _reporterNs.report("LifecycleManager", "./LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfILifecycle(extras) {
    _reporterNs.report("ILifecycle", "./LifecycleManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAssetCache(extras) {
    _reporterNs.report("AssetCache", "../assets/AssetCache", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCameraBrain(extras) {
    _reporterNs.report("CameraBrain", "../camera/CameraBrain", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCameraMode(extras) {
    _reporterNs.report("CameraMode", "../camera/CameraBrain", _context.meta, extras);
  }

  function _reportPossibleCrUseOfICameraNode(extras) {
    _reporterNs.report("ICameraNode", "../camera/CameraBrain", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPhysicsCollisionImpl(extras) {
    _reporterNs.report("PhysicsCollisionImpl", "../physics/PhysicsCollisionImpl", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSkillGraph(extras) {
    _reporterNs.report("SkillGraph", "../battle/skill/SkillGraph", _context.meta, extras);
  }

  function _reportPossibleCrUseOfISkillGraph(extras) {
    _reporterNs.report("ISkillGraph", "../battle/skill/SkillGraph", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSkillExecutor(extras) {
    _reporterNs.report("SkillExecutor", "../battle/skill/SkillExecutor", _context.meta, extras);
  }

  function _reportPossibleCrUseOfISkillExecutor(extras) {
    _reporterNs.report("ISkillExecutor", "../battle/skill/SkillExecutor", _context.meta, extras);
  }

  function _reportPossibleCrUseOfDungeonGenerator(extras) {
    _reporterNs.report("DungeonGenerator", "../dungeon/DungeonGenerator", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRoomBuilder(extras) {
    _reporterNs.report("RoomBuilder", "../dungeon/RoomBuilder", _context.meta, extras);
  }

  function _reportPossibleCrUseOfNavigationGrid(extras) {
    _reporterNs.report("NavigationGrid", "../dungeon/NavigationGrid", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRoomRuntime(extras) {
    _reporterNs.report("RoomRuntime", "../dungeon/RoomRuntime", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIRoomRuntime(extras) {
    _reporterNs.report("IRoomRuntime", "../dungeon/RoomRuntime", _context.meta, extras);
  }

  function _reportPossibleCrUseOfDebugPanel(extras) {
    _reporterNs.report("DebugPanel", "../debug/DebugPanel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPerfSampler(extras) {
    _reporterNs.report("PerfSampler", "../debug/PerfSampler", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSaveManagerImpl(extras) {
    _reporterNs.report("SaveManagerImpl", "../save/SaveManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMemorySaveBackend(extras) {
    _reporterNs.report("MemorySaveBackend", "../save/SaveManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfReplayRecorder(extras) {
    _reporterNs.report("ReplayRecorder", "../replay/ReplayRecorder", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAudioSystem(extras) {
    _reporterNs.report("AudioSystem", "../audio/AudioSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMemoryAudioSink(extras) {
    _reporterNs.report("MemoryAudioSink", "../audio/AudioSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAnimationStateMachine(extras) {
    _reporterNs.report("AnimationStateMachine", "../battle/ai/AnimationStateMachine", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIAIController(extras) {
    _reporterNs.report("IAIController", "../battle/ai/IAIController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAIController(extras) {
    _reporterNs.report("AIController", "../battle/ai/AIController", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEventBusManager(extras) {
    _reporterNs.report("EventBusManager", "./EventBusManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfLightingService(extras) {
    _reporterNs.report("LightingService", "../lighting/LightingService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEntityManager(extras) {
    _reporterNs.report("EntityManager", "../ecs/EntityManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIEntityManager(extras) {
    _reporterNs.report("IEntityManager", "../ecs/EntityManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMovementComponent(extras) {
    _reporterNs.report("MovementComponent", "../ecs/MovementComponent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIMovementComponent(extras) {
    _reporterNs.report("IMovementComponent", "../ecs/MovementComponent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfAnimationComponent(extras) {
    _reporterNs.report("AnimationComponent", "../ecs/AnimationComponent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIAnimationComponent(extras) {
    _reporterNs.report("IAnimationComponent", "../ecs/AnimationComponent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCombatComponent(extras) {
    _reporterNs.report("CombatComponent", "../ecs/CombatComponent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfICombatComponent(extras) {
    _reporterNs.report("ICombatComponent", "../ecs/CombatComponent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfStatComponent(extras) {
    _reporterNs.report("StatComponent", "../ecs/StatComponent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIStatComponent(extras) {
    _reporterNs.report("IStatComponent", "../ecs/StatComponent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTargetComponent(extras) {
    _reporterNs.report("TargetComponent", "../ecs/TargetComponent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfITargetComponent(extras) {
    _reporterNs.report("ITargetComponent", "../ecs/TargetComponent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfInteractionComponent(extras) {
    _reporterNs.report("InteractionComponent", "../ecs/InteractionComponent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIInteractionComponent(extras) {
    _reporterNs.report("IInteractionComponent", "../ecs/InteractionComponent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCombatSystem(extras) {
    _reporterNs.report("CombatSystem", "../battle/combat/CombatSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfICombatSystem(extras) {
    _reporterNs.report("ICombatSystem", "../battle/combat/CombatSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTargetSelector(extras) {
    _reporterNs.report("TargetSelector", "../battle/combat/TargetSelector", _context.meta, extras);
  }

  function _reportPossibleCrUseOfITargetSelector(extras) {
    _reporterNs.report("ITargetSelector", "../battle/combat/TargetSelector", _context.meta, extras);
  }

  function _reportPossibleCrUseOfHitResolver(extras) {
    _reporterNs.report("HitResolver", "../battle/skill/Resolvers", _context.meta, extras);
  }

  function _reportPossibleCrUseOfDamageResolver(extras) {
    _reporterNs.report("DamageResolver", "../battle/skill/Resolvers", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIHitResolver(extras) {
    _reporterNs.report("IHitResolver", "../battle/skill/Resolvers", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIDamageResolver(extras) {
    _reporterNs.report("IDamageResolver", "../battle/skill/Resolvers", _context.meta, extras);
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
      Label = _cc.Label;
      Node = _cc.Node;
      Camera = _cc.Camera;
    }, function (_unresolved_2) {
      AssetBundleService = _unresolved_2.AssetBundleService;
    }, function (_unresolved_3) {
      ConfigService = _unresolved_3.ConfigService;
    }, function (_unresolved_4) {
      ConfigManager = _unresolved_4.ConfigManager;
    }, function (_unresolved_5) {
      GameManager = _unresolved_5.GameManager;
    }, function (_unresolved_6) {
      SceneFlowService = _unresolved_6.SceneFlowService;
    }, function (_unresolved_7) {
      GameContext = _unresolved_7.GameContext;
      ILogger = _unresolved_7.ILogger;
      IConfigDatabase = _unresolved_7.IConfigDatabase;
      IAssetCache = _unresolved_7.IAssetCache;
      ICameraBrain = _unresolved_7.ICameraBrain;
      ICollisionService = _unresolved_7.ICollisionService;
      IDebugService = _unresolved_7.IDebugService;
      ISaveManager = _unresolved_7.ISaveManager;
      IReplayRecorder = _unresolved_7.IReplayRecorder;
      IAnimationController = _unresolved_7.IAnimationController;
      IAudioService = _unresolved_7.IAudioService;
      IEventBus = _unresolved_7.IEventBus;
      IRuntimeState = _unresolved_7.IRuntimeState;
      ILightingService = _unresolved_7.ILightingService;
    }, function (_unresolved_8) {
      Logger = _unresolved_8.Logger;
    }, function (_unresolved_9) {
      RuntimeState = _unresolved_9.RuntimeState;
    }, function (_unresolved_10) {
      ConfigDatabase = _unresolved_10.ConfigDatabase;
    }, function (_unresolved_11) {
      LifecycleManager = _unresolved_11.LifecycleManager;
    }, function (_unresolved_12) {
      AssetCache = _unresolved_12.AssetCache;
    }, function (_unresolved_13) {
      CameraBrain = _unresolved_13.CameraBrain;
      CameraMode = _unresolved_13.CameraMode;
    }, function (_unresolved_14) {
      PhysicsCollisionImpl = _unresolved_14.PhysicsCollisionImpl;
    }, function (_unresolved_15) {
      SkillGraph = _unresolved_15.SkillGraph;
      ISkillGraph = _unresolved_15.ISkillGraph;
    }, function (_unresolved_16) {
      SkillExecutor = _unresolved_16.SkillExecutor;
      ISkillExecutor = _unresolved_16.ISkillExecutor;
    }, function (_unresolved_17) {
      DungeonGenerator = _unresolved_17.DungeonGenerator;
    }, function (_unresolved_18) {
      RoomBuilder = _unresolved_18.RoomBuilder;
    }, function (_unresolved_19) {
      NavigationGrid = _unresolved_19.NavigationGrid;
    }, function (_unresolved_20) {
      RoomRuntime = _unresolved_20.RoomRuntime;
      IRoomRuntime = _unresolved_20.IRoomRuntime;
    }, function (_unresolved_21) {
      DebugPanel = _unresolved_21.DebugPanel;
    }, function (_unresolved_22) {
      PerfSampler = _unresolved_22.PerfSampler;
    }, function (_unresolved_23) {
      SaveManagerImpl = _unresolved_23.SaveManagerImpl;
      MemorySaveBackend = _unresolved_23.MemorySaveBackend;
    }, function (_unresolved_24) {
      ReplayRecorder = _unresolved_24.ReplayRecorder;
    }, function (_unresolved_25) {
      AudioSystem = _unresolved_25.AudioSystem;
      MemoryAudioSink = _unresolved_25.MemoryAudioSink;
    }, function (_unresolved_26) {
      AnimationStateMachine = _unresolved_26.AnimationStateMachine;
    }, function (_unresolved_27) {
      IAIController = _unresolved_27.IAIController;
    }, function (_unresolved_28) {
      AIController = _unresolved_28.AIController;
    }, function (_unresolved_29) {
      EventBusManager = _unresolved_29.EventBusManager;
    }, function (_unresolved_30) {
      LightingService = _unresolved_30.LightingService;
    }, function (_unresolved_31) {
      EntityManager = _unresolved_31.EntityManager;
      IEntityManager = _unresolved_31.IEntityManager;
    }, function (_unresolved_32) {
      MovementComponent = _unresolved_32.MovementComponent;
      IMovementComponent = _unresolved_32.IMovementComponent;
    }, function (_unresolved_33) {
      AnimationComponent = _unresolved_33.AnimationComponent;
      IAnimationComponent = _unresolved_33.IAnimationComponent;
    }, function (_unresolved_34) {
      CombatComponent = _unresolved_34.CombatComponent;
      ICombatComponent = _unresolved_34.ICombatComponent;
    }, function (_unresolved_35) {
      StatComponent = _unresolved_35.StatComponent;
      IStatComponent = _unresolved_35.IStatComponent;
    }, function (_unresolved_36) {
      TargetComponent = _unresolved_36.TargetComponent;
      ITargetComponent = _unresolved_36.ITargetComponent;
    }, function (_unresolved_37) {
      InteractionComponent = _unresolved_37.InteractionComponent;
      IInteractionComponent = _unresolved_37.IInteractionComponent;
    }, function (_unresolved_38) {
      CombatSystem = _unresolved_38.CombatSystem;
      ICombatSystem = _unresolved_38.ICombatSystem;
    }, function (_unresolved_39) {
      TargetSelector = _unresolved_39.TargetSelector;
      ITargetSelector = _unresolved_39.ITargetSelector;
    }, function (_unresolved_40) {
      HitResolver = _unresolved_40.HitResolver;
      DamageResolver = _unresolved_40.DamageResolver;
      IHitResolver = _unresolved_40.IHitResolver;
      IDamageResolver = _unresolved_40.IDamageResolver;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "d5a5dZRFe5AXIIKqbVfqhcp", "GameBootstrap", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Label', 'Node', 'Camera']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("GameBootstrap", GameBootstrap = (_dec = ccclass('GameBootstrap'), _dec2 = property(Label), _dec(_class = (_class2 = (_class3 = class GameBootstrap extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "statusLabel", _descriptor, this);

          /** Optional callback: (progressPercent, statusMessage) */
          this.onProgress = null;
          this._ready = false;
          this._error = null;
          this._ctx = null;
          this._lifecycle = null;
        }

        static get context() {
          return GameBootstrap._context;
        }

        get ready() {
          return this._ready;
        }

        get error() {
          return this._error;
        }

        onLoad() {
          var _this = this;

          return _asyncToGenerator(function* () {
            (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
              error: Error()
            }), GameManager) : GameManager).ensure(_this.node.scene);
            yield _this.startup();
          })();
        }

        startup() {
          var _this2 = this;

          return _asyncToGenerator(function* () {
            if (_this2._ready || _this2._error) return;

            try {
              _this2._emitProgress(5, 'Starting...');

              _this2._setStatus('正在加载配置...');

              _this2._emitProgress(10, 'Loading config...');

              yield (_crd && ConfigService === void 0 ? (_reportPossibleCrUseOfConfigService({
                error: Error()
              }), ConfigService) : ConfigService).instance.loadAll();

              _this2._emitProgress(50, 'Loading local config...');

              (_crd && ConfigManager === void 0 ? (_reportPossibleCrUseOfConfigManager({
                error: Error()
              }), ConfigManager) : ConfigManager).getInstance().loadAll();

              _this2._emitProgress(70, 'Loading asset map...');

              yield (_crd && AssetBundleService === void 0 ? (_reportPossibleCrUseOfAssetBundleService({
                error: Error()
              }), AssetBundleService) : AssetBundleService).instance.loadAssetMapFromResources();

              _this2._emitProgress(95, 'Finalizing...');

              _this2._ready = true;

              _this2._emitProgress(100, 'Done');

              _this2._setStatus('加载完成');

              console.log('[GameBootstrap] startup complete'); // Demo0 D0-5: wire GameContext + LifecycleManager (infra only, non-blocking).

              try {
                _this2._wireInfra();
              } catch (infraErr) {
                console.warn('[GameBootstrap] infra wiring demo skipped:', infraErr);
              }
            } catch (err) {
              _this2._error = err instanceof Error ? err.message : String(err);

              _this2._emitProgress(100, "Failed: " + _this2._error);

              _this2._setStatus("\u542F\u52A8\u5931\u8D25\uFF1A" + _this2._error);

              console.error('[GameBootstrap] startup failed:', err);
            }
          })();
        }

        _wireInfra() {
          // Demo0 D0-5: assemble the four core infra via GameContext (ServiceLocator).
          // Proves DI injection + ILifecycle broadcast are wired. Only infra classes are
          // `new`-ed here (no business System, per red line 4).
          // ConfigDatabase does NOT implement ILifecycle, so it is NOT registered into
          // LifecycleManager (avoid faking lifecycle, per D0-5 strict constraint).
          this._ctx = new (_crd && GameContext === void 0 ? (_reportPossibleCrUseOfGameContext({
            error: Error()
          }), GameContext) : GameContext)();
          this._lifecycle = new (_crd && LifecycleManager === void 0 ? (_reportPossibleCrUseOfLifecycleManager({
            error: Error()
          }), LifecycleManager) : LifecycleManager)();
          GameBootstrap._context = this._ctx; // P2-2: IRuntimeState — authoritative run seed + frame counter for the
          // DebugPanel Seed panel and deterministic replay (§2.2 / §5.5). Pure TS
          // (delegates seed to RunRng). Registered early so the seed provider
          // below and any system can read it via ctx.get(IRuntimeState).

          var runtimeState = new (_crd && RuntimeState === void 0 ? (_reportPossibleCrUseOfRuntimeState({
            error: Error()
          }), RuntimeState) : RuntimeState)();

          this._ctx.register(_crd && IRuntimeState === void 0 ? (_reportPossibleCrUseOfIRuntimeState({
            error: Error()
          }), IRuntimeState) : IRuntimeState, runtimeState);

          this._lifecycle.register(runtimeState);

          runtimeState.initialize(this._ctx); // §5.5 DebugPanel (IDebugService) — created before Logger so the Logger sink
          // forwards its output into the DebugPanel "Events" buffer (ILogger buffer reuse).

          var debugPanel = new (_crd && DebugPanel === void 0 ? (_reportPossibleCrUseOfDebugPanel({
            error: Error()
          }), DebugPanel) : DebugPanel)();

          this._ctx.register(_crd && IDebugService === void 0 ? (_reportPossibleCrUseOfIDebugService({
            error: Error()
          }), IDebugService) : IDebugService, debugPanel);

          this._lifecycle.register(debugPanel);

          debugPanel.initialize(this._ctx); // Demo6: PerfSampler — dedicated perf baseline sampler for the 100-monster
          // stress test (§5.5 / §8.1). Wired as DebugPanel's authoritative perf source
          // (smoothed FPS / frame-time / memory / draw-call). Implements ILifecycle.
          // NOTE: DebugPanel + PerfSampler are Dev/Debug-build only (gated by the engine
          // bundler macro at build time); registered here for the demo/headless path.

          var perfSampler = new (_crd && PerfSampler === void 0 ? (_reportPossibleCrUseOfPerfSampler({
            error: Error()
          }), PerfSampler) : PerfSampler)();

          this._lifecycle.register(perfSampler);

          perfSampler.initialize(this._ctx);
          debugPanel.setPerfSampler(perfSampler); // Demo seed provider — now backed by IRuntimeState (P2-2): shows the real
          // RunRng seed instead of a hard-coded placeholder.

          debugPanel.registerProvider('seed', () => ({
            seed: runtimeState.getSeedDebug()
          }));

          this._ctx.register(_crd && ILogger === void 0 ? (_reportPossibleCrUseOfILogger({
            error: Error()
          }), ILogger) : ILogger, new (_crd && Logger === void 0 ? (_reportPossibleCrUseOfLogger({
            error: Error()
          }), Logger) : Logger)(true, undefined, line => {
            console.log(line);
            debugPanel.pushRaw(line);
          }));

          this._ctx.register(_crd && IConfigDatabase === void 0 ? (_reportPossibleCrUseOfIConfigDatabase({
            error: Error()
          }), IConfigDatabase) : IConfigDatabase, new (_crd && ConfigDatabase === void 0 ? (_reportPossibleCrUseOfConfigDatabase({
            error: Error()
          }), ConfigDatabase) : ConfigDatabase)()); // Demo1: AssetCache — loader delegates to existing AssetBundleService (no re-implementation).
          // Implements ILifecycle, so it is registered into LifecycleManager for teardown.


          var assetCache = new (_crd && AssetCache === void 0 ? (_reportPossibleCrUseOfAssetCache({
            error: Error()
          }), AssetCache) : AssetCache)(id => (_crd && AssetBundleService === void 0 ? (_reportPossibleCrUseOfAssetBundleService({
            error: Error()
          }), AssetBundleService) : AssetBundleService).instance.loadById(id));

          this._ctx.register(_crd && IAssetCache === void 0 ? (_reportPossibleCrUseOfIAssetCache({
            error: Error()
          }), IAssetCache) : IAssetCache, assetCache);

          this._lifecycle.register(assetCache); // Demo2: CameraBrain — 7-mode follow camera (§3.4). Implements ILifecycle, so it joins
          // LifecycleManager teardown. Mode params are sourced from ConfigDatabase.getCamera.


          var cameraBrain = new (_crd && CameraBrain === void 0 ? (_reportPossibleCrUseOfCameraBrain({
            error: Error()
          }), CameraBrain) : CameraBrain)(this._ctx.get(_crd && IConfigDatabase === void 0 ? (_reportPossibleCrUseOfIConfigDatabase({
            error: Error()
          }), IConfigDatabase) : IConfigDatabase));

          this._ctx.register(_crd && ICameraBrain === void 0 ? (_reportPossibleCrUseOfICameraBrain({
            error: Error()
          }), ICameraBrain) : ICameraBrain, cameraBrain);

          this._lifecycle.register(cameraBrain);

          var mainCam = this._findMainCamera();

          if (mainCam) {
            cameraBrain.attach(mainCam);
          }

          cameraBrain.setMode((_crd && CameraMode === void 0 ? (_reportPossibleCrUseOfCameraMode({
            error: Error()
          }), CameraMode) : CameraMode).Follow); // P2-1: LightingService (ILightingService) — per-region lighting presets
          // (directional / ambient / fog / skybox) applied to the live scene root.
          // Implements ILifecycle so it joins LifecycleManager teardown (red line 3).

          var lighting = new (_crd && LightingService === void 0 ? (_reportPossibleCrUseOfLightingService({
            error: Error()
          }), LightingService) : LightingService)();

          this._ctx.register(_crd && ILightingService === void 0 ? (_reportPossibleCrUseOfILightingService({
            error: Error()
          }), ILightingService) : ILightingService, lighting);

          this._lifecycle.register(lighting);

          lighting.initialize(this._ctx); // Demo3: PhysicsCollisionImpl — ICollisionService (§3.3). Pure TS, no cc, deterministic.
          // Implements ILifecycle so it joins LifecycleManager teardown (red line 3).

          var collision = new (_crd && PhysicsCollisionImpl === void 0 ? (_reportPossibleCrUseOfPhysicsCollisionImpl({
            error: Error()
          }), PhysicsCollisionImpl) : PhysicsCollisionImpl)();

          this._ctx.register(_crd && ICollisionService === void 0 ? (_reportPossibleCrUseOfICollisionService({
            error: Error()
          }), ICollisionService) : ICollisionService, collision);

          this._lifecycle.register(collision); // P1-3: combat leaf resolvers — TargetSelector / HitResolver / DamageResolver (§3.8 / §3.9).
          // Pure stateless services lifted to instance ILifecycle so CombatSystem and SkillExecutor
          // inject them via GameContext (red line 4: no `new` of services inside consumers).


          var targetSelector = new (_crd && TargetSelector === void 0 ? (_reportPossibleCrUseOfTargetSelector({
            error: Error()
          }), TargetSelector) : TargetSelector)();

          this._ctx.register(_crd && ITargetSelector === void 0 ? (_reportPossibleCrUseOfITargetSelector({
            error: Error()
          }), ITargetSelector) : ITargetSelector, targetSelector);

          this._lifecycle.register(targetSelector);

          targetSelector.initialize(this._ctx);
          var hitResolver = new (_crd && HitResolver === void 0 ? (_reportPossibleCrUseOfHitResolver({
            error: Error()
          }), HitResolver) : HitResolver)();

          this._ctx.register(_crd && IHitResolver === void 0 ? (_reportPossibleCrUseOfIHitResolver({
            error: Error()
          }), IHitResolver) : IHitResolver, hitResolver);

          this._lifecycle.register(hitResolver);

          hitResolver.initialize(this._ctx);
          var damageResolver = new (_crd && DamageResolver === void 0 ? (_reportPossibleCrUseOfDamageResolver({
            error: Error()
          }), DamageResolver) : DamageResolver)();

          this._ctx.register(_crd && IDamageResolver === void 0 ? (_reportPossibleCrUseOfIDamageResolver({
            error: Error()
          }), IDamageResolver) : IDamageResolver, damageResolver);

          this._lifecycle.register(damageResolver);

          damageResolver.initialize(this._ctx); // Demo4: SkillGraph + SkillExecutor (§3.9). Data-driven skills, no switch (red line 2).
          // SkillGraph builds the node chain; SkillExecutor dispatches nodes by kind via a Map.
          // Both implement ILifecycle so they join LifecycleManager teardown (red line 3).

          var skillGraph = new (_crd && SkillGraph === void 0 ? (_reportPossibleCrUseOfSkillGraph({
            error: Error()
          }), SkillGraph) : SkillGraph)();

          this._ctx.register(_crd && ISkillGraph === void 0 ? (_reportPossibleCrUseOfISkillGraph({
            error: Error()
          }), ISkillGraph) : ISkillGraph, skillGraph);

          this._lifecycle.register(skillGraph);

          skillGraph.initialize(this._ctx);
          var skillExecutor = new (_crd && SkillExecutor === void 0 ? (_reportPossibleCrUseOfSkillExecutor({
            error: Error()
          }), SkillExecutor) : SkillExecutor)();

          this._ctx.register(_crd && ISkillExecutor === void 0 ? (_reportPossibleCrUseOfISkillExecutor({
            error: Error()
          }), ISkillExecutor) : ISkillExecutor, skillExecutor);

          this._lifecycle.register(skillExecutor);

          skillExecutor.initialize(this._ctx); // Demo5: dungeon room full lifecycle (§3.7 + §5.1). Build a demo room from a seed
          // (DungeonGenerator -> RoomBuilder -> NavigationGrid), register the RoomRuntime as
          // IRoomRuntime and join LifecycleManager (room-level teardown, red line 3). Pure TS.

          var layout = new (_crd && DungeonGenerator === void 0 ? (_reportPossibleCrUseOfDungeonGenerator({
            error: Error()
          }), DungeonGenerator) : DungeonGenerator)().generate(20260710, 'forest');
          var roomData = new (_crd && RoomBuilder === void 0 ? (_reportPossibleCrUseOfRoomBuilder({
            error: Error()
          }), RoomBuilder) : RoomBuilder)().build(layout.rooms[0]);
          var navGrid = new (_crd && NavigationGrid === void 0 ? (_reportPossibleCrUseOfNavigationGrid({
            error: Error()
          }), NavigationGrid) : NavigationGrid)(roomData.tileMap);
          var roomRuntime = new (_crd && RoomRuntime === void 0 ? (_reportPossibleCrUseOfRoomRuntime({
            error: Error()
          }), RoomRuntime) : RoomRuntime)(roomData, navGrid);

          this._ctx.register(_crd && IRoomRuntime === void 0 ? (_reportPossibleCrUseOfIRoomRuntime({
            error: Error()
          }), IRoomRuntime) : IRoomRuntime, roomRuntime);

          this._lifecycle.register(roomRuntime);

          roomRuntime.initialize(this._ctx); // §5.6 SaveManager (ISaveManager) — layered persistence (crash recovery / daily
          // challenge / cloud save share one snapshot). Backend injected (Memory for demo;
          // engine wires a localStorage-backed backend). Implements ILifecycle.

          var saveBackend = new (_crd && MemorySaveBackend === void 0 ? (_reportPossibleCrUseOfMemorySaveBackend({
            error: Error()
          }), MemorySaveBackend) : MemorySaveBackend)();
          var saveManager = new (_crd && SaveManagerImpl === void 0 ? (_reportPossibleCrUseOfSaveManagerImpl({
            error: Error()
          }), SaveManagerImpl) : SaveManagerImpl)(saveBackend);

          this._ctx.register(_crd && ISaveManager === void 0 ? (_reportPossibleCrUseOfISaveManager({
            error: Error()
          }), ISaveManager) : ISaveManager, saveManager);

          this._lifecycle.register(saveManager);

          saveManager.initialize(this._ctx); // §5.7 ReplayRecorder (IReplayRecorder) — deterministic replay = seed + input
          // stream. Ring buffer keeps recent N runs. Implements ILifecycle.

          var replayRecorder = new (_crd && ReplayRecorder === void 0 ? (_reportPossibleCrUseOfReplayRecorder({
            error: Error()
          }), ReplayRecorder) : ReplayRecorder)();

          this._ctx.register(_crd && IReplayRecorder === void 0 ? (_reportPossibleCrUseOfIReplayRecorder({
            error: Error()
          }), IReplayRecorder) : IReplayRecorder, replayRecorder);

          this._lifecycle.register(replayRecorder);

          replayRecorder.initialize(this._ctx); // §5.8 AudioSystem (IAudioService) — audio orchestration (BGM/SFX/Voice/Ambient/3D +
          // Snapshot). Pure TS; playback delegated to an injected AudioSink (engine wires a
          // cc.AudioSource-backed sink; MemoryAudioSink for headless demo). Implements ILifecycle.

          var audioSystem = new (_crd && AudioSystem === void 0 ? (_reportPossibleCrUseOfAudioSystem({
            error: Error()
          }), AudioSystem) : AudioSystem)(new (_crd && MemoryAudioSink === void 0 ? (_reportPossibleCrUseOfMemoryAudioSink({
            error: Error()
          }), MemoryAudioSink) : MemoryAudioSink)());

          this._ctx.register(_crd && IAudioService === void 0 ? (_reportPossibleCrUseOfIAudioService({
            error: Error()
          }), IAudioService) : IAudioService, audioSystem);

          this._lifecycle.register(audioSystem);

          audioSystem.initialize(this._ctx); // §3.5 / §3.10: AnimationStateMachine (IAnimationController) — state-machine-based
          // animation controller. Pure TS, no cc. Implements ILifecycle.

          var animSM = new (_crd && AnimationStateMachine === void 0 ? (_reportPossibleCrUseOfAnimationStateMachine({
            error: Error()
          }), AnimationStateMachine) : AnimationStateMachine)();

          this._ctx.register(_crd && IAnimationController === void 0 ? (_reportPossibleCrUseOfIAnimationController({
            error: Error()
          }), IAnimationController) : IAnimationController, animSM);

          this._lifecycle.register(animSM);

          animSM.initialize(this._ctx); // §3.10: IAIController — registered as a FACTORY (not a singleton) because
          // AIController is per-owner: its initialize method binds the context and a
          // specific entity owner. Consumers resolve the factory through ctx.get and
          // then invoke it to obtain a dedicated instance, followed by initialize.
          // This removes the previously orphaned infrastructure: the controller was
          // implemented but never registered, so ctx.get(IAIController) used to throw.

          this._ctx.register(_crd && IAIController === void 0 ? (_reportPossibleCrUseOfIAIController({
            error: Error()
          }), IAIController) : IAIController, () => new (_crd && AIController === void 0 ? (_reportPossibleCrUseOfAIController({
            error: Error()
          }), AIController) : AIController)()); // §3.11: EventBusManager (IEventBus) — typed domain event bus with 6 emitters.
          // Pure TS. Implements ILifecycle. Per-domain log toggle available.


          var eventBus = new (_crd && EventBusManager === void 0 ? (_reportPossibleCrUseOfEventBusManager({
            error: Error()
          }), EventBusManager) : EventBusManager)();

          this._ctx.register(_crd && IEventBus === void 0 ? (_reportPossibleCrUseOfIEventBus({
            error: Error()
          }), IEventBus) : IEventBus, eventBus);

          this._lifecycle.register(eventBus);

          eventBus.initialize(this._ctx); // §3.12: EntityManager (IEntityManager) — ECS entity registry.
          // Pure TS. Implements ILifecycle. PlayerController already has the main
          // Cocos component; EntityManager provides the registry side (component lookup).

          var entityManager = new (_crd && EntityManager === void 0 ? (_reportPossibleCrUseOfEntityManager({
            error: Error()
          }), EntityManager) : EntityManager)();

          this._ctx.register(_crd && IEntityManager === void 0 ? (_reportPossibleCrUseOfIEntityManager({
            error: Error()
          }), IEntityManager) : IEntityManager, entityManager);

          this._lifecycle.register(entityManager);

          entityManager.initialize(this._ctx); // §3.12: Player ECS components (P1-4) — 6 components lifted to ILifecycle so they
          // join LifecycleManager teardown and can be resolved via GameContext. These are
          // demo singleton registrations; per-entity instances are assembled by EcsEntityFactory
          // (which `new`s components and calls their typed initialize). Pure TS.

          var movementC = new (_crd && MovementComponent === void 0 ? (_reportPossibleCrUseOfMovementComponent({
            error: Error()
          }), MovementComponent) : MovementComponent)();

          this._ctx.register(_crd && IMovementComponent === void 0 ? (_reportPossibleCrUseOfIMovementComponent({
            error: Error()
          }), IMovementComponent) : IMovementComponent, movementC);

          this._lifecycle.register(movementC);

          movementC.initialize(this._ctx, 0, 0);
          var animC = new (_crd && AnimationComponent === void 0 ? (_reportPossibleCrUseOfAnimationComponent({
            error: Error()
          }), AnimationComponent) : AnimationComponent)();

          this._ctx.register(_crd && IAnimationComponent === void 0 ? (_reportPossibleCrUseOfIAnimationComponent({
            error: Error()
          }), IAnimationComponent) : IAnimationComponent, animC);

          this._lifecycle.register(animC);

          animC.initialize(this._ctx);
          var combatC = new (_crd && CombatComponent === void 0 ? (_reportPossibleCrUseOfCombatComponent({
            error: Error()
          }), CombatComponent) : CombatComponent)();

          this._ctx.register(_crd && ICombatComponent === void 0 ? (_reportPossibleCrUseOfICombatComponent({
            error: Error()
          }), ICombatComponent) : ICombatComponent, combatC);

          this._lifecycle.register(combatC);

          combatC.initialize(this._ctx, 'demo', () => {});
          var statC = new (_crd && StatComponent === void 0 ? (_reportPossibleCrUseOfStatComponent({
            error: Error()
          }), StatComponent) : StatComponent)();

          this._ctx.register(_crd && IStatComponent === void 0 ? (_reportPossibleCrUseOfIStatComponent({
            error: Error()
          }), IStatComponent) : IStatComponent, statC);

          this._lifecycle.register(statC);

          statC.initialize(this._ctx, 100, 10, 5, 60);
          var targetC = new (_crd && TargetComponent === void 0 ? (_reportPossibleCrUseOfTargetComponent({
            error: Error()
          }), TargetComponent) : TargetComponent)();

          this._ctx.register(_crd && ITargetComponent === void 0 ? (_reportPossibleCrUseOfITargetComponent({
            error: Error()
          }), ITargetComponent) : ITargetComponent, targetC);

          this._lifecycle.register(targetC);

          targetC.initialize(this._ctx, 0, 0);
          var interactionC = new (_crd && InteractionComponent === void 0 ? (_reportPossibleCrUseOfInteractionComponent({
            error: Error()
          }), InteractionComponent) : InteractionComponent)();

          this._ctx.register(_crd && IInteractionComponent === void 0 ? (_reportPossibleCrUseOfIInteractionComponent({
            error: Error()
          }), IInteractionComponent) : IInteractionComponent, interactionC);

          this._lifecycle.register(interactionC);

          interactionC.initialize(this._ctx, 'demo', eventBus); // §3.8: CombatSystem — combat orchestration (dispatch/target/effect/projectile/lock-on).
          // Consumes SkillRequest from AI or player CombatComponent, executes through the full
          // combat pipeline. All dependencies resolved via ctx.get. Implements ILifecycle.

          var combatSystem = new (_crd && CombatSystem === void 0 ? (_reportPossibleCrUseOfCombatSystem({
            error: Error()
          }), CombatSystem) : CombatSystem)();

          this._ctx.register(_crd && ICombatSystem === void 0 ? (_reportPossibleCrUseOfICombatSystem({
            error: Error()
          }), ICombatSystem) : ICombatSystem, combatSystem);

          this._lifecycle.register(combatSystem);

          combatSystem.initialize(this._ctx);

          var logger = this._ctx.get(_crd && ILogger === void 0 ? (_reportPossibleCrUseOfILogger({
            error: Error()
          }), ILogger) : ILogger); // Demo probe (NOT a business system): implements ILifecycle so LifecycleManager
          // can broadcast lifecycle events; each method logs via the injected Logger.


          var probe = {
            initialize: () => logger.channel('battle').info('Initialize'),
            enter: () => logger.channel('battle').info('Enter'),
            pause: () => logger.channel('battle').info('Pause'),
            resume: () => logger.channel('battle').info('Resume'),
            exit: () => logger.channel('battle').info('Exit'),
            destroy: () => logger.channel('battle').info('Destroy')
          };

          this._lifecycle.register(probe);

          probe.initialize(this._ctx); // v0.4.4 (Demo7): formal startup keeps all infra services alive for the
          // whole session. The enter/pause/resume/exit/destroy probe is extracted to
          // runLifecycleSmokeTestOnly() so it can run in a test harness without
          // tearing down the real runtime (the old destroyAll() here killed services).
        }
        /**
         * Demo / headless lifecycle smoke test ONLY. Not called by formal startup().
         * Runs the full lifecycle cycle against the wired infra and tears it down.
         * Safe to invoke from a test harness; must NOT be mixed into startup().
         */


        runLifecycleSmokeTestOnly() {
          if (!this._lifecycle) return;

          this._lifecycle.enterAll();

          this._lifecycle.pauseAll();

          this._lifecycle.resumeAll();

          this._lifecycle.exitAll();

          this._lifecycle.destroyAll();
        }

        _findMainCamera() {
          // Locate the scene's main camera node and attach it to CameraBrain.
          // Non-fatal: CameraBrain works in logic-only mode until a camera is attached.
          try {
            var scene = this.node.scene;
            var cam = scene.getComponentInChildren(Camera);
            return cam ? cam.node : null;
          } catch (_unused) {
            return null;
          }
        }

        _emitProgress(pct, msg) {
          if (this.onProgress) {
            this.onProgress(pct, msg);
          }
        }

        goToMain() {
          if (this._error) {
            console.warn('[GameBootstrap] blocked by startup error:', this._error);
            return;
          }

          if (!this._ready) {
            this.scheduleOnce(() => this.goToMain(), 0.2);
            return;
          }

          (_crd && SceneFlowService === void 0 ? (_reportPossibleCrUseOfSceneFlowService({
            error: Error()
          }), SceneFlowService) : SceneFlowService).instance.goToMain();
        }

        _setStatus(text) {
          if (this.statusLabel) {
            this.statusLabel.string = text;
          }
        }

        static find(root) {
          if (!this._isSceneRoot(root)) {
            var own = root.getComponent(GameBootstrap);
            if (own) return own;
          }

          for (var child of root.children) {
            var found = GameBootstrap.find(child);
            if (found) return found;
          }

          return null;
        }

        static ensure(root) {
          var _node$getComponent;

          var existing = GameBootstrap.find(root);
          if (existing) return existing;
          var node = root.getChildByName('GameBootstrap');

          if (!node) {
            node = new Node('GameBootstrap');
            root.addChild(node);
          }

          return (_node$getComponent = node.getComponent(GameBootstrap)) != null ? _node$getComponent : node.addComponent(GameBootstrap);
        }

        static _isSceneRoot(node) {
          var _node$constructor;

          return ((_node$constructor = node.constructor) == null ? void 0 : _node$constructor.name) === 'Scene';
        }

        onDestroy() {
          var _this$_ctx;

          this.unscheduleAllCallbacks();
          (_this$_ctx = this._ctx) == null || _this$_ctx.onDestroy();
        }

      }, _class3._context = null, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "statusLabel", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=b48cf660af2e9d146a608426d3472afc8f8be7e9.js.map