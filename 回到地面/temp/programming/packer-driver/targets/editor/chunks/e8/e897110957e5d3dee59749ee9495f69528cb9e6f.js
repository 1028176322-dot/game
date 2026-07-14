System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7", "__unresolved_8", "__unresolved_9", "__unresolved_10", "__unresolved_11", "__unresolved_12", "__unresolved_13", "__unresolved_14", "__unresolved_15", "__unresolved_16", "__unresolved_17", "__unresolved_18", "__unresolved_19", "__unresolved_20", "__unresolved_21", "__unresolved_22", "__unresolved_23", "__unresolved_24", "__unresolved_25", "__unresolved_26", "__unresolved_27", "__unresolved_28", "__unresolved_29", "__unresolved_30", "__unresolved_31", "__unresolved_32", "__unresolved_33", "__unresolved_34", "__unresolved_35", "__unresolved_36", "__unresolved_37", "__unresolved_38", "__unresolved_39", "__unresolved_40", "__unresolved_41", "__unresolved_42", "__unresolved_43", "__unresolved_44"], function (_export, _context2) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, eventBus, GameEvent, GameManager, ConfigManager, ConfigService, RunCoordinator, SpriteAnimationService, GridManager, DungeonManager, RoomTransition, BattleManager, PlayerController, AutoAttack, SkillSystem, UpgradeManager, ElementSystem, EquipmentSystem, EventSystem, ItemSystem, MutationManager, CombatEffectService, EquipmentUI, EventUI, MarqueeUI, InventoryUI, VirtualJoystick, BattleHUD, DungeonMapUI, UpgradeUI, DeathUI, WXAdapter, RunRng, RoomFlowController, RewardService, CharacterStartService, MutationRuntimeService, AssetBundleService, DungeonSceneInstaller, PlayerDataManager, UISkinSceneApplier, ILightingService, GameBootstrap, SceneFlowService, RouteRunController, RouteSaveAdapter, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _crd, ccclass, property, DungeonSceneController;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "./core/EventBus", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfGameEvent(extras) {
    _reporterNs.report("GameEvent", "./core/GameManager", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfGameManager(extras) {
    _reporterNs.report("GameManager", "./core/GameManager", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfConfigManager(extras) {
    _reporterNs.report("ConfigManager", "./core/ConfigManager", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfConfigService(extras) {
    _reporterNs.report("ConfigService", "./config/ConfigService", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfRunCoordinator(extras) {
    _reporterNs.report("RunCoordinator", "./run/RunCoordinator", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfSpriteAnimationService(extras) {
    _reporterNs.report("SpriteAnimationService", "./render/SpriteAnimationService", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfGridManager(extras) {
    _reporterNs.report("GridManager", "./dungeon/GridManager", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfDungeonManager(extras) {
    _reporterNs.report("DungeonManager", "./dungeon/DungeonManager", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfRoomTransition(extras) {
    _reporterNs.report("RoomTransition", "./dungeon/RoomTransition", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfBattleManager(extras) {
    _reporterNs.report("BattleManager", "./battle/BattleManager", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerController(extras) {
    _reporterNs.report("PlayerController", "./battle/PlayerController", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfAutoAttack(extras) {
    _reporterNs.report("AutoAttack", "./battle/AutoAttack", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfSkillSystem(extras) {
    _reporterNs.report("SkillSystem", "./battle/SkillSystem", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfUpgradeManager(extras) {
    _reporterNs.report("UpgradeManager", "./battle/UpgradeManager", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfElementSystem(extras) {
    _reporterNs.report("ElementSystem", "./battle/ElementSystem", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfEquipmentSystem(extras) {
    _reporterNs.report("EquipmentSystem", "./battle/EquipmentSystem", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfEventSystem(extras) {
    _reporterNs.report("EventSystem", "./battle/EventSystem", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfItemSystem(extras) {
    _reporterNs.report("ItemSystem", "./battle/ItemSystem", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfMutationManager(extras) {
    _reporterNs.report("MutationManager", "./battle/MutationManager", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfCombatEffectService(extras) {
    _reporterNs.report("CombatEffectService", "./battle/CombatEffectService", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfEquipmentUI(extras) {
    _reporterNs.report("EquipmentUI", "./ui/EquipmentUI", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfEventUI(extras) {
    _reporterNs.report("EventUI", "./ui/EventUI", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfMarqueeUI(extras) {
    _reporterNs.report("MarqueeUI", "./ui/MarqueeUI", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfInventoryUI(extras) {
    _reporterNs.report("InventoryUI", "./ui/InventoryUI", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfVirtualJoystick(extras) {
    _reporterNs.report("VirtualJoystick", "./ui/VirtualJoystick", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfBattleHUD(extras) {
    _reporterNs.report("BattleHUD", "./ui/BattleHUD", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfDungeonMapUI(extras) {
    _reporterNs.report("DungeonMapUI", "./ui/DungeonMapUI", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfUpgradeUI(extras) {
    _reporterNs.report("UpgradeUI", "./ui/UpgradeUI", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfDeathUI(extras) {
    _reporterNs.report("DeathUI", "./ui/DeathUI", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfSkillUI(extras) {
    _reporterNs.report("SkillUI", "./ui/SkillUI", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfWXAdapter(extras) {
    _reporterNs.report("WXAdapter", "./utils/WXAdapter", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfRunRng(extras) {
    _reporterNs.report("RunRng", "./core/rng/RunRng", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfRoomFlowController(extras) {
    _reporterNs.report("RoomFlowController", "./run/RoomFlowController", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfRewardService(extras) {
    _reporterNs.report("RewardService", "./run/RewardService", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfCharacterStartService(extras) {
    _reporterNs.report("CharacterStartService", "./run/CharacterStartService", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfMutationRuntimeService(extras) {
    _reporterNs.report("MutationRuntimeService", "./run/MutationRuntimeService", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfAssetBundleService(extras) {
    _reporterNs.report("AssetBundleService", "./assets/AssetBundleService", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfDungeonSceneInstaller(extras) {
    _reporterNs.report("DungeonSceneInstaller", "./scene/DungeonSceneInstaller", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfDungeonSceneRefs(extras) {
    _reporterNs.report("DungeonSceneRefs", "./scene/DungeonSceneInstaller", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerDataManager(extras) {
    _reporterNs.report("PlayerDataManager", "./core/PlayerDataManager", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfUISkinSceneApplier(extras) {
    _reporterNs.report("UISkinSceneApplier", "./ui/UISkinSceneApplier", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfILightingService(extras) {
    _reporterNs.report("ILightingService", "./core/GameContext", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfGameBootstrap(extras) {
    _reporterNs.report("GameBootstrap", "./core/GameBootstrap", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfLightingService(extras) {
    _reporterNs.report("LightingService", "./lighting/LightingService", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfLightingRegion(extras) {
    _reporterNs.report("LightingRegion", "./lighting/LightingService", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfSceneFlowService(extras) {
    _reporterNs.report("SceneFlowService", "./app/SceneFlowService", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfRouteRunController(extras) {
    _reporterNs.report("RouteRunController", "./dungeon/route/RouteRunController", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfRouteSaveAdapter(extras) {
    _reporterNs.report("RouteSaveAdapter", "./core/save/RouteSaveAdapter", _context2.meta, extras);
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
      Node = _cc.Node;
    }, function (_unresolved_2) {
      eventBus = _unresolved_2.eventBus;
    }, function (_unresolved_3) {
      GameEvent = _unresolved_3.GameEvent;
      GameManager = _unresolved_3.GameManager;
    }, function (_unresolved_4) {
      ConfigManager = _unresolved_4.ConfigManager;
    }, function (_unresolved_5) {
      ConfigService = _unresolved_5.ConfigService;
    }, function (_unresolved_6) {
      RunCoordinator = _unresolved_6.RunCoordinator;
    }, function (_unresolved_7) {
      SpriteAnimationService = _unresolved_7.SpriteAnimationService;
    }, function (_unresolved_8) {
      GridManager = _unresolved_8.GridManager;
    }, function (_unresolved_9) {
      DungeonManager = _unresolved_9.DungeonManager;
    }, function (_unresolved_10) {
      RoomTransition = _unresolved_10.RoomTransition;
    }, function (_unresolved_11) {
      BattleManager = _unresolved_11.BattleManager;
    }, function (_unresolved_12) {
      PlayerController = _unresolved_12.PlayerController;
    }, function (_unresolved_13) {
      AutoAttack = _unresolved_13.AutoAttack;
    }, function (_unresolved_14) {
      SkillSystem = _unresolved_14.SkillSystem;
    }, function (_unresolved_15) {
      UpgradeManager = _unresolved_15.UpgradeManager;
    }, function (_unresolved_16) {
      ElementSystem = _unresolved_16.ElementSystem;
    }, function (_unresolved_17) {
      EquipmentSystem = _unresolved_17.EquipmentSystem;
    }, function (_unresolved_18) {
      EventSystem = _unresolved_18.EventSystem;
    }, function (_unresolved_19) {
      ItemSystem = _unresolved_19.ItemSystem;
    }, function (_unresolved_20) {
      MutationManager = _unresolved_20.MutationManager;
    }, function (_unresolved_21) {
      CombatEffectService = _unresolved_21.CombatEffectService;
    }, function (_unresolved_22) {
      EquipmentUI = _unresolved_22.EquipmentUI;
    }, function (_unresolved_23) {
      EventUI = _unresolved_23.EventUI;
    }, function (_unresolved_24) {
      MarqueeUI = _unresolved_24.MarqueeUI;
    }, function (_unresolved_25) {
      InventoryUI = _unresolved_25.InventoryUI;
    }, function (_unresolved_26) {
      VirtualJoystick = _unresolved_26.VirtualJoystick;
    }, function (_unresolved_27) {
      BattleHUD = _unresolved_27.BattleHUD;
    }, function (_unresolved_28) {
      DungeonMapUI = _unresolved_28.DungeonMapUI;
    }, function (_unresolved_29) {
      UpgradeUI = _unresolved_29.UpgradeUI;
    }, function (_unresolved_30) {
      DeathUI = _unresolved_30.DeathUI;
    }, function (_unresolved_31) {
      WXAdapter = _unresolved_31.WXAdapter;
    }, function (_unresolved_32) {
      RunRng = _unresolved_32.RunRng;
    }, function (_unresolved_33) {
      RoomFlowController = _unresolved_33.RoomFlowController;
    }, function (_unresolved_34) {
      RewardService = _unresolved_34.RewardService;
    }, function (_unresolved_35) {
      CharacterStartService = _unresolved_35.CharacterStartService;
    }, function (_unresolved_36) {
      MutationRuntimeService = _unresolved_36.MutationRuntimeService;
    }, function (_unresolved_37) {
      AssetBundleService = _unresolved_37.AssetBundleService;
    }, function (_unresolved_38) {
      DungeonSceneInstaller = _unresolved_38.DungeonSceneInstaller;
    }, function (_unresolved_39) {
      PlayerDataManager = _unresolved_39.PlayerDataManager;
    }, function (_unresolved_40) {
      UISkinSceneApplier = _unresolved_40.UISkinSceneApplier;
    }, function (_unresolved_41) {
      ILightingService = _unresolved_41.ILightingService;
    }, function (_unresolved_42) {
      GameBootstrap = _unresolved_42.GameBootstrap;
    }, function (_unresolved_43) {
      SceneFlowService = _unresolved_43.SceneFlowService;
    }, function (_unresolved_44) {
      RouteRunController = _unresolved_44.RouteRunController;
    }, function (_unresolved_45) {
      RouteSaveAdapter = _unresolved_45.RouteSaveAdapter;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "2939euWIidI2YiU1qw0r42q", "DungeonSceneController", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("DungeonSceneController", DungeonSceneController = (_dec = ccclass('DungeonSceneController'), _dec2 = property(_crd && GridManager === void 0 ? (_reportPossibleCrUseOfGridManager({
        error: Error()
      }), GridManager) : GridManager), _dec3 = property(_crd && PlayerController === void 0 ? (_reportPossibleCrUseOfPlayerController({
        error: Error()
      }), PlayerController) : PlayerController), _dec4 = property(_crd && BattleManager === void 0 ? (_reportPossibleCrUseOfBattleManager({
        error: Error()
      }), BattleManager) : BattleManager), _dec5 = property(_crd && DungeonManager === void 0 ? (_reportPossibleCrUseOfDungeonManager({
        error: Error()
      }), DungeonManager) : DungeonManager), _dec6 = property(_crd && RoomTransition === void 0 ? (_reportPossibleCrUseOfRoomTransition({
        error: Error()
      }), RoomTransition) : RoomTransition), _dec7 = property(_crd && VirtualJoystick === void 0 ? (_reportPossibleCrUseOfVirtualJoystick({
        error: Error()
      }), VirtualJoystick) : VirtualJoystick), _dec8 = property(_crd && SkillSystem === void 0 ? (_reportPossibleCrUseOfSkillSystem({
        error: Error()
      }), SkillSystem) : SkillSystem), _dec9 = property(_crd && BattleHUD === void 0 ? (_reportPossibleCrUseOfBattleHUD({
        error: Error()
      }), BattleHUD) : BattleHUD), _dec10 = property(_crd && DungeonMapUI === void 0 ? (_reportPossibleCrUseOfDungeonMapUI({
        error: Error()
      }), DungeonMapUI) : DungeonMapUI), _dec11 = property(_crd && UpgradeUI === void 0 ? (_reportPossibleCrUseOfUpgradeUI({
        error: Error()
      }), UpgradeUI) : UpgradeUI), _dec12 = property(_crd && DeathUI === void 0 ? (_reportPossibleCrUseOfDeathUI({
        error: Error()
      }), DeathUI) : DeathUI), _dec13 = property(_crd && UpgradeManager === void 0 ? (_reportPossibleCrUseOfUpgradeManager({
        error: Error()
      }), UpgradeManager) : UpgradeManager), _dec14 = property(_crd && ElementSystem === void 0 ? (_reportPossibleCrUseOfElementSystem({
        error: Error()
      }), ElementSystem) : ElementSystem), _dec15 = property(_crd && EquipmentSystem === void 0 ? (_reportPossibleCrUseOfEquipmentSystem({
        error: Error()
      }), EquipmentSystem) : EquipmentSystem), _dec16 = property(_crd && EquipmentUI === void 0 ? (_reportPossibleCrUseOfEquipmentUI({
        error: Error()
      }), EquipmentUI) : EquipmentUI), _dec17 = property(_crd && ItemSystem === void 0 ? (_reportPossibleCrUseOfItemSystem({
        error: Error()
      }), ItemSystem) : ItemSystem), _dec18 = property(_crd && InventoryUI === void 0 ? (_reportPossibleCrUseOfInventoryUI({
        error: Error()
      }), InventoryUI) : InventoryUI), _dec(_class = (_class2 = class DungeonSceneController extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "gridManager", _descriptor, this);

          _initializerDefineProperty(this, "player", _descriptor2, this);

          _initializerDefineProperty(this, "battleManager", _descriptor3, this);

          _initializerDefineProperty(this, "dungeonManager", _descriptor4, this);

          _initializerDefineProperty(this, "roomTransition", _descriptor5, this);

          _initializerDefineProperty(this, "joystick", _descriptor6, this);

          _initializerDefineProperty(this, "skillSystem", _descriptor7, this);

          _initializerDefineProperty(this, "battleHUD", _descriptor8, this);

          _initializerDefineProperty(this, "dungeonMapUI", _descriptor9, this);

          _initializerDefineProperty(this, "upgradeUI", _descriptor10, this);

          _initializerDefineProperty(this, "deathUI", _descriptor11, this);

          _initializerDefineProperty(this, "upgradeManager", _descriptor12, this);

          _initializerDefineProperty(this, "elementSystem", _descriptor13, this);

          _initializerDefineProperty(this, "equipmentSystem", _descriptor14, this);

          _initializerDefineProperty(this, "equipmentUI", _descriptor15, this);

          _initializerDefineProperty(this, "itemSystem", _descriptor16, this);

          _initializerDefineProperty(this, "inventoryUI", _descriptor17, this);

          this._skillUI = null;
          this._roomFlow = null;
          this._mutationRuntime = null;
          this._eventUI = null;
          this._marqueeUI = null;
          this._installer = new (_crd && DungeonSceneInstaller === void 0 ? (_reportPossibleCrUseOfDungeonSceneInstaller({
            error: Error()
          }), DungeonSceneInstaller) : DungeonSceneInstaller)();
          this._installedRefs = null;
          this._booted = false;
          this._routeRun = null;
        }

        onLoad() {
          this._installSceneRefs();

          void this._bootstrap();
        }

        _installSceneRefs() {
          const refs = this._installer.install(this.node, {
            gridManager: this.gridManager,
            player: this.player,
            battleManager: this.battleManager,
            dungeonManager: this.dungeonManager,
            roomTransition: this.roomTransition,
            joystick: this.joystick,
            skillSystem: this.skillSystem,
            battleHUD: this.battleHUD,
            dungeonMapUI: this.dungeonMapUI,
            upgradeUI: this.upgradeUI,
            deathUI: this.deathUI,
            upgradeManager: this.upgradeManager,
            elementSystem: this.elementSystem,
            equipmentSystem: this.equipmentSystem,
            equipmentUI: this.equipmentUI,
            itemSystem: this.itemSystem,
            inventoryUI: this.inventoryUI
          });

          this._installedRefs = refs;
          this.gridManager = refs.gridManager;
          this.player = refs.player;
          this.battleManager = refs.battleManager;
          this.dungeonManager = refs.dungeonManager;
          this.roomTransition = refs.roomTransition;
          this.joystick = refs.joystick;
          this.skillSystem = refs.skillSystem;
          this.battleHUD = refs.battleHUD;
          this.dungeonMapUI = refs.dungeonMapUI;
          this.upgradeUI = refs.upgradeUI;
          this.deathUI = refs.deathUI;
          this.upgradeManager = refs.upgradeManager;
          this.elementSystem = refs.elementSystem;
          this.equipmentSystem = refs.equipmentSystem;
          this.equipmentUI = refs.equipmentUI;
          this.itemSystem = refs.itemSystem;
          this.inventoryUI = refs.inventoryUI;
          this._skillUI = refs.skillUI;
        }

        async _bootstrap() {
          var _context, _this$node$scene;

          if (this._booted) return;
          this._booted = true;

          try {
            await this._ensureStartupReady();
          } catch (err) {
            console.error('[DungeonSceneController] startup failed:', err);
            return;
          }

          const gm = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).ensure(this.node.scene);
          const rc = (_crd && RunCoordinator === void 0 ? (_reportPossibleCrUseOfRunCoordinator({
            error: Error()
          }), RunCoordinator) : RunCoordinator).instance; // P2-1: best-effort region lighting (cosmetic). Applied here (after
          // startup is ready) because GameBootstrap._wireInfra registers
          // ILightingService asynchronously; the synchronous install() path may
          // run before it is registered, so we re-apply once infra is available.

          const lighting = (_context = (_crd && GameBootstrap === void 0 ? (_reportPossibleCrUseOfGameBootstrap({
            error: Error()
          }), GameBootstrap) : GameBootstrap).context) == null ? void 0 : _context.getOptional(_crd && ILightingService === void 0 ? (_reportPossibleCrUseOfILightingService({
            error: Error()
          }), ILightingService) : ILightingService);

          if (lighting) {
            const zone = rc.state ? rc.getCurrentZone() : gm.currentZone;
            lighting.apply(zone);
          } // Ensure run state is initialized from RunCoordinator


          if (!rc.state || !rc.state.isActive) {
            if (gm.zoneRoute.length === 0 || !gm.currentStageId) {
              gm.initNewRun();
            }
          }

          if (this._installedRefs) {
            await this._installer.loadInitialArt(this._installedRefs, (_crd && PlayerDataManager === void 0 ? (_reportPossibleCrUseOfPlayerDataManager({
              error: Error()
            }), PlayerDataManager) : PlayerDataManager).getInstance().selectedCharacter, rc.state ? rc.getCurrentZone() : gm.currentZone);
          }

          await (_crd && UISkinSceneApplier === void 0 ? (_reportPossibleCrUseOfUISkinSceneApplier({
            error: Error()
          }), UISkinSceneApplier) : UISkinSceneApplier).applyScene((_this$node$scene = this.node.scene) != null ? _this$node$scene : this.node, 'dungeon'); // [Phase 10] 打印场景节点树供调试

          this._logSceneTree();

          this._wireSystems();

          this._wireServices();

          this._wireUI();

          this._wireEvents(); // [Phase 10] 打印场景节点树供调试


          this._logSceneTree();
        }

        async _ensureStartupReady() {
          if (!(_crd && ConfigService === void 0 ? (_reportPossibleCrUseOfConfigService({
            error: Error()
          }), ConfigService) : ConfigService).instance.loaded) {
            await (_crd && ConfigService === void 0 ? (_reportPossibleCrUseOfConfigService({
              error: Error()
            }), ConfigService) : ConfigService).instance.loadAll();
          }

          (_crd && ConfigManager === void 0 ? (_reportPossibleCrUseOfConfigManager({
            error: Error()
          }), ConfigManager) : ConfigManager).getInstance().loadAll();
          await (_crd && AssetBundleService === void 0 ? (_reportPossibleCrUseOfAssetBundleService({
            error: Error()
          }), AssetBundleService) : AssetBundleService).instance.loadAssetMapFromResources(); // Load animation configs

          await (_crd && SpriteAnimationService === void 0 ? (_reportPossibleCrUseOfSpriteAnimationService({
            error: Error()
          }), SpriteAnimationService) : SpriteAnimationService).instance.loadAll();
        }

        _wireSystems() {
          var _player$getComponent, _this$upgradeManager, _this$elementSystem, _this$equipmentSystem, _this$equipmentUI, _this$itemSystem, _this$inventoryUI, _this$_skillUI, _this$dungeonManager, _this$joystick;

          const refs = this._installedRefs;

          if (!refs) {
            console.error('[DungeonSceneController] scene refs are not installed.');
            return;
          }

          const player = this.player;
          const gridManager = this.gridManager;
          const battleManager = this.battleManager;
          const skillSystem = this.skillSystem;
          const autoAttack = (_player$getComponent = player.getComponent(_crd && AutoAttack === void 0 ? (_reportPossibleCrUseOfAutoAttack({
            error: Error()
          }), AutoAttack) : AutoAttack)) != null ? _player$getComponent : player.node.addComponent(_crd && AutoAttack === void 0 ? (_reportPossibleCrUseOfAutoAttack({
            error: Error()
          }), AutoAttack) : AutoAttack);
          player.init(gridManager);
          skillSystem.init(player);
          battleManager.init(player, gridManager, refs.actorLayer);
          (_crd && CombatEffectService === void 0 ? (_reportPossibleCrUseOfCombatEffectService({
            error: Error()
          }), CombatEffectService) : CombatEffectService).instance.init(player.node);
          (_this$upgradeManager = this.upgradeManager) == null || _this$upgradeManager.init(player, skillSystem, autoAttack, battleManager);
          (_this$elementSystem = this.elementSystem) == null || _this$elementSystem.init(player, battleManager);
          (_this$equipmentSystem = this.equipmentSystem) == null || _this$equipmentSystem.init(player);
          if (this.equipmentSystem) (_this$equipmentUI = this.equipmentUI) == null || _this$equipmentUI.init(this.equipmentSystem);
          (_this$itemSystem = this.itemSystem) == null || _this$itemSystem.init(player, battleManager);
          if (this.itemSystem) (_this$inventoryUI = this.inventoryUI) == null || _this$inventoryUI.init(this.itemSystem);
          (_this$_skillUI = this._skillUI) == null || _this$_skillUI.bindSkillSystem(skillSystem);
          const seed = Date.now() & 0x7fffffff;
          (_crd && RunRng === void 0 ? (_reportPossibleCrUseOfRunRng({
            error: Error()
          }), RunRng) : RunRng).instance.startRun(seed);
          (_this$dungeonManager = this.dungeonManager) == null || _this$dungeonManager.init(player, seed);
          (_this$joystick = this.joystick) == null || _this$joystick.setMoveCallback(event => player.handleJoystick(event));

          if (this.battleHUD) {
            const initStats = player.stats.getFinalStats();
            this.battleHUD.refreshHP(player.currentHP, initStats.maxHP);

            player.onHPChanged = (current, max) => {
              var _this$battleHUD;

              return (_this$battleHUD = this.battleHUD) == null ? void 0 : _this$battleHUD.refreshHP(current, max);
            };
          }
        }

        _wireServices() {
          const rs = new (_crd && RewardService === void 0 ? (_reportPossibleCrUseOfRewardService({
            error: Error()
          }), RewardService) : RewardService)(this.equipmentSystem, this.itemSystem);
          this._roomFlow = new (_crd && RoomFlowController === void 0 ? (_reportPossibleCrUseOfRoomFlowController({
            error: Error()
          }), RoomFlowController) : RoomFlowController)(this.dungeonManager, rs, this.player);
          new (_crd && CharacterStartService === void 0 ? (_reportPossibleCrUseOfCharacterStartService({
            error: Error()
          }), CharacterStartService) : CharacterStartService)(this.skillSystem).applySelectedCharacter(); // v0.4.4 (Demo7) P3 production wiring: bring RouteRunController live with
          // injected deps. sceneLoader -> only SceneFlowService may loadScene (GDD 8.5);
          // injectContext -> the RoomFlowController that owns the active route context;
          // savePort -> route save adapter (persists via RunSave.route). The controller
          // stays dormant until the 2D map UI (out of scope) calls startFloor + requestEnter.

          const routeRun = new (_crd && RouteRunController === void 0 ? (_reportPossibleCrUseOfRouteRunController({
            error: Error()
          }), RouteRunController) : RouteRunController)({
            sceneLoader: () => (_crd && SceneFlowService === void 0 ? (_reportPossibleCrUseOfSceneFlowService({
              error: Error()
            }), SceneFlowService) : SceneFlowService).instance.goToDungeon(),
            injectContext: ctx => {
              var _this$_roomFlow;

              return (_this$_roomFlow = this._roomFlow) == null ? void 0 : _this$_roomFlow.setRouteEncounterContext(ctx);
            },
            savePort: new (_crd && RouteSaveAdapter === void 0 ? (_reportPossibleCrUseOfRouteSaveAdapter({
              error: Error()
            }), RouteSaveAdapter) : RouteSaveAdapter)()
          });
          routeRun.activate();
          this._routeRun = routeRun;
        }

        _wireUI() {
          const es = new (_crd && EventSystem === void 0 ? (_reportPossibleCrUseOfEventSystem({
            error: Error()
          }), EventSystem) : EventSystem)();
          es.init(this.player);

          if (!this._eventUI) {
            const euin = new Node('EventUI');
            this.node.addChild(euin);
            this._eventUI = euin.addComponent(_crd && EventUI === void 0 ? (_reportPossibleCrUseOfEventUI({
              error: Error()
            }), EventUI) : EventUI);
          }

          this._eventUI.init(es, this.player);

          const mm = new (_crd && MutationManager === void 0 ? (_reportPossibleCrUseOfMutationManager({
            error: Error()
          }), MutationManager) : MutationManager)();
          this._mutationRuntime = new (_crd && MutationRuntimeService === void 0 ? (_reportPossibleCrUseOfMutationRuntimeService({
            error: Error()
          }), MutationRuntimeService) : MutationRuntimeService)(mm, this.player, this.battleHUD);

          if (!this._marqueeUI) {
            const mqn = new Node('MarqueeUI');
            this.node.addChild(mqn);
            this._marqueeUI = mqn.addComponent(_crd && MarqueeUI === void 0 ? (_reportPossibleCrUseOfMarqueeUI({
              error: Error()
            }), MarqueeUI) : MarqueeUI);
          }
        }

        _wireEvents() {
          var _instance;

          const rf = this._roomFlow;
          const mr = this._mutationRuntime;
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('player:revive', () => rf == null ? void 0 : rf.onPlayerRevive(), this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('battle:victory', () => {
            if (rf != null && rf.hasRouteContext()) rf.onBattleVictory('route');else rf == null || rf.onBattleVictory();
          }, this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('room:shop', id => rf == null ? void 0 : rf.onEnterShopRoom(id), this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('room:treasure', id => rf == null ? void 0 : rf.onEnterTreasureRoom(id), this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('room:healing', id => rf == null ? void 0 : rf.onEnterHealingRoom(id), this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
            error: Error()
          }), GameEvent) : GameEvent).ZONE_BOSS_DEFEATED, z => rf == null ? void 0 : rf.onZoneBossDefeated(z), this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
            error: Error()
          }), GameEvent) : GameEvent).ALL_ZONES_CLEARED, () => rf == null ? void 0 : rf.onAllZonesCleared(), this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('mutation:generate', f => mr == null ? void 0 : mr.generateMutation(f), this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('mutation:cleared', () => mr == null ? void 0 : mr.clearMutation(), this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('mutation:element_storm', () => mr == null ? void 0 : mr.onElementStorm(), this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on('boss:phase_changed', (_m, p, mp) => (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('hud:boss_phase', p, mp), this);
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).on((_crd && GameEvent === void 0 ? (_reportPossibleCrUseOfGameEvent({
            error: Error()
          }), GameEvent) : GameEvent).GAME_OVER, () => {
            var _this$_marqueeUI, _gm$currentFloor, _this$battleManager$k, _this$battleManager;

            (_this$_marqueeUI = this._marqueeUI) == null || _this$_marqueeUI.resetOnDeath();
            const gm = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
              error: Error()
            }), GameManager) : GameManager).instance;
            (_crd && WXAdapter === void 0 ? (_reportPossibleCrUseOfWXAdapter({
              error: Error()
            }), WXAdapter) : WXAdapter).getInstance().reportAnalytics('run_end', {
              depth: (_gm$currentFloor = gm == null ? void 0 : gm.currentFloor) != null ? _gm$currentFloor : 1,
              kills: (_this$battleManager$k = (_this$battleManager = this.battleManager) == null ? void 0 : _this$battleManager.killCount) != null ? _this$battleManager$k : 0,
              time: 0,
              result: 'dead',
              seed: ''
            });
          }, this);
          const zoneDef = (_instance = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).instance) == null ? void 0 : _instance.currentZoneDef;
          if (zoneDef) (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('hud:zone_intro', zoneDef.name, zoneDef.visualTheme);
          (_crd && WXAdapter === void 0 ? (_reportPossibleCrUseOfWXAdapter({
            error: Error()
          }), WXAdapter) : WXAdapter).getInstance().flushAnalyticsCache();
          (_crd && WXAdapter === void 0 ? (_reportPossibleCrUseOfWXAdapter({
            error: Error()
          }), WXAdapter) : WXAdapter).getInstance().hideBanner();
        }

        onDestroy() {
          var _this$_routeRun;

          (_this$_routeRun = this._routeRun) == null || _this$_routeRun.deactivate();
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).offTarget(this);
        }
        /** v0.4.4 (Demo7) P3: the live route run controller for the current dungeon
         *  scene. The 2D map UI (out of scope) drives it via startFloor() + requestEnter(). */


        get routeRun() {
          return this._routeRun;
        }
        /** 调试用：打印场景节点树 */


        _logSceneTree() {
          const refs = this._installedRefs;
          if (!refs) return;
          console.log('[SceneTree]', {
            background: refs.backgroundLayer.children.map(n => n.name),
            tiles: refs.tileLayer.children.length,
            actors: refs.actorLayer.children.map(n => ({
              name: n.name,
              active: n.active,
              pos: n.position.toString(),
              layer: n.layer,
              sibling: n.getSiblingIndex()
            })),
            effects: refs.effectLayer.children.length
          });
        }

        update(dt) {
          var _this$_mutationRuntim;

          (_this$_mutationRuntim = this._mutationRuntime) == null || _this$_mutationRuntim.update(dt);
          (_crd && SpriteAnimationService === void 0 ? (_reportPossibleCrUseOfSpriteAnimationService({
            error: Error()
          }), SpriteAnimationService) : SpriteAnimationService).instance.tick(dt);
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "gridManager", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "player", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "battleManager", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "dungeonManager", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "roomTransition", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "joystick", [_dec7], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "skillSystem", [_dec8], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "battleHUD", [_dec9], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "dungeonMapUI", [_dec10], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "upgradeUI", [_dec11], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "deathUI", [_dec12], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "upgradeManager", [_dec13], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "elementSystem", [_dec14], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "equipmentSystem", [_dec15], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "equipmentUI", [_dec16], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "itemSystem", [_dec17], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "inventoryUI", [_dec18], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=e897110957e5d3dee59749ee9495f69528cb9e6f.js.map