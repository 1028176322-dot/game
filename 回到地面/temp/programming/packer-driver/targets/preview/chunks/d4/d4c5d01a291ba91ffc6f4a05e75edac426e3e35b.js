System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7", "__unresolved_8", "__unresolved_9", "__unresolved_10", "__unresolved_11", "__unresolved_12", "__unresolved_13", "__unresolved_14", "__unresolved_15", "__unresolved_16", "__unresolved_17", "__unresolved_18", "__unresolved_19", "__unresolved_20", "__unresolved_21", "__unresolved_22", "__unresolved_23", "__unresolved_24", "__unresolved_25", "__unresolved_26", "__unresolved_27", "__unresolved_28", "__unresolved_29", "__unresolved_30", "__unresolved_31", "__unresolved_32", "__unresolved_33", "__unresolved_34"], function (_export, _context2) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Color, Graphics, Label, Layers, Node, ProgressBar, Sprite, Vec3, ArtResourceResolver, RenderAssetService, AutoAttack, BattleManager, ElementSystem, EquipmentSystem, ItemSystem, PlayerController, SkillSystem, BackgroundService, CharacterVisualService, UpgradeManager, DungeonManager, GridManager, DungeonGenerator, RoomBuilder, NavigationGrid, RoomRuntime, EcsEntityBridge, RoomTransition, BattleHUD, DeathUI, DungeonMapUI, EquipmentUI, InventoryUI, SkillUI, UpgradeUI, VirtualJoystick, ResponsiveUIRoot, DungeonHudLayout, F, RuntimeLayerService, LayerType, GameBootstrap, ILightingService, DungeonSceneInstaller, _crd;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _reportPossibleCrUseOfArtResourceResolver(extras) {
    _reporterNs.report("ArtResourceResolver", "../assets/ArtResourceResolver", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfRenderAssetService(extras) {
    _reporterNs.report("RenderAssetService", "../assets/RenderAssetService", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfAutoAttack(extras) {
    _reporterNs.report("AutoAttack", "../battle/AutoAttack", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfBattleManager(extras) {
    _reporterNs.report("BattleManager", "../battle/BattleManager", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfElementSystem(extras) {
    _reporterNs.report("ElementSystem", "../battle/ElementSystem", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfEquipmentSystem(extras) {
    _reporterNs.report("EquipmentSystem", "../battle/EquipmentSystem", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfItemSystem(extras) {
    _reporterNs.report("ItemSystem", "../battle/ItemSystem", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerController(extras) {
    _reporterNs.report("PlayerController", "../battle/PlayerController", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfSkillSystem(extras) {
    _reporterNs.report("SkillSystem", "../battle/SkillSystem", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfBackgroundService(extras) {
    _reporterNs.report("BackgroundService", "../render/BackgroundService", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfCharacterVisualService(extras) {
    _reporterNs.report("CharacterVisualService", "../render/CharacterVisualService", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfUpgradeManager(extras) {
    _reporterNs.report("UpgradeManager", "../battle/UpgradeManager", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfDungeonManager(extras) {
    _reporterNs.report("DungeonManager", "../dungeon/DungeonManager", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfGridManager(extras) {
    _reporterNs.report("GridManager", "../dungeon/GridManager", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfDungeonGenerator(extras) {
    _reporterNs.report("DungeonGenerator", "../dungeon/DungeonGenerator", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfRoomBuilder(extras) {
    _reporterNs.report("RoomBuilder", "../dungeon/RoomBuilder", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfNavigationGrid(extras) {
    _reporterNs.report("NavigationGrid", "../dungeon/NavigationGrid", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfRoomRuntime(extras) {
    _reporterNs.report("RoomRuntime", "../dungeon/RoomRuntime", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfEcsEntityBridge(extras) {
    _reporterNs.report("EcsEntityBridge", "../ecs/EcsEntityBridge", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfRoomTransition(extras) {
    _reporterNs.report("RoomTransition", "../dungeon/RoomTransition", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfBattleHUD(extras) {
    _reporterNs.report("BattleHUD", "../ui/BattleHUD", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfDeathUI(extras) {
    _reporterNs.report("DeathUI", "../ui/DeathUI", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfDungeonMapUI(extras) {
    _reporterNs.report("DungeonMapUI", "../ui/DungeonMapUI", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfEquipmentUI(extras) {
    _reporterNs.report("EquipmentUI", "../ui/EquipmentUI", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfInventoryUI(extras) {
    _reporterNs.report("InventoryUI", "../ui/InventoryUI", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfSkillUI(extras) {
    _reporterNs.report("SkillUI", "../ui/SkillUI", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfUpgradeUI(extras) {
    _reporterNs.report("UpgradeUI", "../ui/UpgradeUI", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfVirtualJoystick(extras) {
    _reporterNs.report("VirtualJoystick", "../ui/VirtualJoystick", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfResponsiveUIRoot(extras) {
    _reporterNs.report("ResponsiveUIRoot", "../ui/ResponsiveUIRoot", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfDungeonHudLayout(extras) {
    _reporterNs.report("DungeonHudLayout", "../ui/layout/DungeonHudLayout", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfF(extras) {
    _reporterNs.report("F", "./SceneNodeFactory", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfRuntimeLayerService(extras) {
    _reporterNs.report("RuntimeLayerService", "../render/RuntimeLayerService", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfLayerType(extras) {
    _reporterNs.report("LayerType", "../render/RuntimeLayerService", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfGameBootstrap(extras) {
    _reporterNs.report("GameBootstrap", "../core/GameBootstrap", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfILightingService(extras) {
    _reporterNs.report("ILightingService", "../core/GameContext", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfLightingService(extras) {
    _reporterNs.report("LightingService", "../lighting/LightingService", _context2.meta, extras);
  }

  function _reportPossibleCrUseOfLightingRegion(extras) {
    _reporterNs.report("LightingRegion", "../lighting/LightingService", _context2.meta, extras);
  }

  _export("DungeonSceneInstaller", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Color = _cc.Color;
      Graphics = _cc.Graphics;
      Label = _cc.Label;
      Layers = _cc.Layers;
      Node = _cc.Node;
      ProgressBar = _cc.ProgressBar;
      Sprite = _cc.Sprite;
      Vec3 = _cc.Vec3;
    }, function (_unresolved_2) {
      ArtResourceResolver = _unresolved_2.ArtResourceResolver;
    }, function (_unresolved_3) {
      RenderAssetService = _unresolved_3.RenderAssetService;
    }, function (_unresolved_4) {
      AutoAttack = _unresolved_4.AutoAttack;
    }, function (_unresolved_5) {
      BattleManager = _unresolved_5.BattleManager;
    }, function (_unresolved_6) {
      ElementSystem = _unresolved_6.ElementSystem;
    }, function (_unresolved_7) {
      EquipmentSystem = _unresolved_7.EquipmentSystem;
    }, function (_unresolved_8) {
      ItemSystem = _unresolved_8.ItemSystem;
    }, function (_unresolved_9) {
      PlayerController = _unresolved_9.PlayerController;
    }, function (_unresolved_10) {
      SkillSystem = _unresolved_10.SkillSystem;
    }, function (_unresolved_11) {
      BackgroundService = _unresolved_11.BackgroundService;
    }, function (_unresolved_12) {
      CharacterVisualService = _unresolved_12.CharacterVisualService;
    }, function (_unresolved_13) {
      UpgradeManager = _unresolved_13.UpgradeManager;
    }, function (_unresolved_14) {
      DungeonManager = _unresolved_14.DungeonManager;
    }, function (_unresolved_15) {
      GridManager = _unresolved_15.GridManager;
    }, function (_unresolved_16) {
      DungeonGenerator = _unresolved_16.DungeonGenerator;
    }, function (_unresolved_17) {
      RoomBuilder = _unresolved_17.RoomBuilder;
    }, function (_unresolved_18) {
      NavigationGrid = _unresolved_18.NavigationGrid;
    }, function (_unresolved_19) {
      RoomRuntime = _unresolved_19.RoomRuntime;
    }, function (_unresolved_20) {
      EcsEntityBridge = _unresolved_20.EcsEntityBridge;
    }, function (_unresolved_21) {
      RoomTransition = _unresolved_21.RoomTransition;
    }, function (_unresolved_22) {
      BattleHUD = _unresolved_22.BattleHUD;
    }, function (_unresolved_23) {
      DeathUI = _unresolved_23.DeathUI;
    }, function (_unresolved_24) {
      DungeonMapUI = _unresolved_24.DungeonMapUI;
    }, function (_unresolved_25) {
      EquipmentUI = _unresolved_25.EquipmentUI;
    }, function (_unresolved_26) {
      InventoryUI = _unresolved_26.InventoryUI;
    }, function (_unresolved_27) {
      SkillUI = _unresolved_27.SkillUI;
    }, function (_unresolved_28) {
      UpgradeUI = _unresolved_28.UpgradeUI;
    }, function (_unresolved_29) {
      VirtualJoystick = _unresolved_29.VirtualJoystick;
    }, function (_unresolved_30) {
      ResponsiveUIRoot = _unresolved_30.ResponsiveUIRoot;
    }, function (_unresolved_31) {
      DungeonHudLayout = _unresolved_31.DungeonHudLayout;
    }, function (_unresolved_32) {
      F = _unresolved_32.SceneNodeFactory;
    }, function (_unresolved_33) {
      RuntimeLayerService = _unresolved_33.RuntimeLayerService;
      LayerType = _unresolved_33.LayerType;
    }, function (_unresolved_34) {
      GameBootstrap = _unresolved_34.GameBootstrap;
    }, function (_unresolved_35) {
      ILightingService = _unresolved_35.ILightingService;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "0f296818qdIMJyZXptckpXr", "DungeonSceneInstaller", undefined);

      __checkObsolete__(['Color', 'Graphics', 'Label', 'Layers', 'Node', 'ProgressBar', 'Sprite', 'UITransform', 'Vec3']);

      _export("DungeonSceneInstaller", DungeonSceneInstaller = class DungeonSceneInstaller {
        constructor() {
          this._installed = false;
        }

        install(controllerNode, overrides) {
          var _controllerNode$paren, _findChildByName, _ref, _overrides$gridManage, _overrides$player$nod, _overrides$player, _overrides$player2, _ref2, _overrides$battleMana, _ref3, _overrides$dungeonMan, _ref4, _overrides$roomTransi, _ref5, _overrides$skillSyste, _ref6, _overrides$upgradeMan, _ref7, _overrides$elementSys, _ref8, _overrides$equipmentS, _ref9, _overrides$itemSystem, _ref10, _overrides$joystick, _ref11, _overrides$battleHUD, _ref12, _overrides$dungeonMap, _findComponentInChild, _ref13, _overrides$upgradeUI, _ref14, _overrides$deathUI, _ref15, _overrides$equipmentU, _ref16, _overrides$inventoryU, _context;

          if (overrides === void 0) {
            overrides = {};
          }

          if (this._installed) {
            console.warn('[DungeonSceneInstaller] install called twice — returning cached refs');
          }

          this._installed = true;
          var sceneRoot = (_controllerNode$paren = controllerNode.parent) != null ? _controllerNode$paren : controllerNode;
          var canvas = (_findChildByName = (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).findChildByName(sceneRoot, 'Canvas')) != null ? _findChildByName : sceneRoot;
          var world = (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureChild(canvas, 'World');
          world.setPosition(Vec3.ZERO);
          world.layer = Layers.Enum.UI_2D;
          var systems = (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureChild(canvas, 'Systems');
          var uiRoot = (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureChild(canvas, 'UIRoot');
          (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent(uiRoot, _crd && ResponsiveUIRoot === void 0 ? (_reportPossibleCrUseOfResponsiveUIRoot({
            error: Error()
          }), ResponsiveUIRoot) : ResponsiveUIRoot);
          uiRoot.layer = Layers.Enum.UI_2D; // Initialize RuntimeLayerService for standardized 5-layer rendering

          var layerService = (_crd && RuntimeLayerService === void 0 ? (_reportPossibleCrUseOfRuntimeLayerService({
            error: Error()
          }), RuntimeLayerService) : RuntimeLayerService).instance;
          layerService.ensureLayers(world);
          var backgroundLayer = layerService.getLayer((_crd && LayerType === void 0 ? (_reportPossibleCrUseOfLayerType({
            error: Error()
          }), LayerType) : LayerType).Background);
          var tileLayer = layerService.getLayer((_crd && LayerType === void 0 ? (_reportPossibleCrUseOfLayerType({
            error: Error()
          }), LayerType) : LayerType).Tile);
          var actorLayer = layerService.getLayer((_crd && LayerType === void 0 ? (_reportPossibleCrUseOfLayerType({
            error: Error()
          }), LayerType) : LayerType).Actor);
          var effectLayer = layerService.getLayer((_crd && LayerType === void 0 ? (_reportPossibleCrUseOfLayerType({
            error: Error()
          }), LayerType) : LayerType).Effect);
          var doorLayer = layerService.getLayer((_crd && LayerType === void 0 ? (_reportPossibleCrUseOfLayerType({
            error: Error()
          }), LayerType) : LayerType).Door);

          if (!backgroundLayer || !tileLayer || !actorLayer || !effectLayer || !doorLayer) {
            throw new Error('[DungeonSceneInstaller] render layers not initialized');
          }

          var backgroundNode = this._ensureChild(backgroundLayer, 'Background');

          backgroundNode.setSiblingIndex(0);
          backgroundNode.setPosition(0, 0, -10);
          backgroundNode.layer = Layers.Enum.UI_2D;
          var gridManager = (_ref = (_overrides$gridManage = overrides.gridManager) != null ? _overrides$gridManage : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).findComponentInChildren(sceneRoot, _crd && GridManager === void 0 ? (_reportPossibleCrUseOfGridManager({
            error: Error()
          }), GridManager) : GridManager)) != null ? _ref : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent((_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureChild(systems, 'GridManager'), _crd && GridManager === void 0 ? (_reportPossibleCrUseOfGridManager({
            error: Error()
          }), GridManager) : GridManager);
          gridManager.setTileContainer(tileLayer);
          var playerNode = (_overrides$player$nod = (_overrides$player = overrides.player) == null ? void 0 : _overrides$player.node) != null ? _overrides$player$nod : this._ensureChild(actorLayer, 'Player');

          this._normalizeActorNode(playerNode, actorLayer, 'Player', 50);

          (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent(playerNode, Sprite);
          (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent(playerNode, _crd && AutoAttack === void 0 ? (_reportPossibleCrUseOfAutoAttack({
            error: Error()
          }), AutoAttack) : AutoAttack);
          var player = (_overrides$player2 = overrides.player) != null ? _overrides$player2 : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent(playerNode, _crd && PlayerController === void 0 ? (_reportPossibleCrUseOfPlayerController({
            error: Error()
          }), PlayerController) : PlayerController); // P3-4-B: additively mount the ECS bridge as a parallel, inert-by-
          // default player agent. It implements IPlayerAgent but its onLoad/update
          // early-return while EcsEntityBridge.USE_ECS_PLAYER is false, so the
          // live PlayerController stays authoritative and is never fought for node
          // position. Flip the flag together with the D step (remove
          // PlayerController/AutoAttack) only after editor verification (audit S10.1).

          var bridge = (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent(playerNode, _crd && EcsEntityBridge === void 0 ? (_reportPossibleCrUseOfEcsEntityBridge({
            error: Error()
          }), EcsEntityBridge) : EcsEntityBridge);
          var center = Math.floor(gridManager.gridSize / 2);
          bridge.setSpawn(center, center, 'player');
          bridge.init(gridManager);
          var battleManager = (_ref2 = (_overrides$battleMana = overrides.battleManager) != null ? _overrides$battleMana : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).findComponentInChildren(sceneRoot, _crd && BattleManager === void 0 ? (_reportPossibleCrUseOfBattleManager({
            error: Error()
          }), BattleManager) : BattleManager)) != null ? _ref2 : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent((_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureChild(systems, 'BattleManager'), _crd && BattleManager === void 0 ? (_reportPossibleCrUseOfBattleManager({
            error: Error()
          }), BattleManager) : BattleManager);
          var dungeonManager = (_ref3 = (_overrides$dungeonMan = overrides.dungeonManager) != null ? _overrides$dungeonMan : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).findComponentInChildren(sceneRoot, _crd && DungeonManager === void 0 ? (_reportPossibleCrUseOfDungeonManager({
            error: Error()
          }), DungeonManager) : DungeonManager)) != null ? _ref3 : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent((_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureChild(systems, 'DungeonManager'), _crd && DungeonManager === void 0 ? (_reportPossibleCrUseOfDungeonManager({
            error: Error()
          }), DungeonManager) : DungeonManager);
          var roomTransition = (_ref4 = (_overrides$roomTransi = overrides.roomTransition) != null ? _overrides$roomTransi : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).findComponentInChildren(sceneRoot, _crd && RoomTransition === void 0 ? (_reportPossibleCrUseOfRoomTransition({
            error: Error()
          }), RoomTransition) : RoomTransition)) != null ? _ref4 : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent((_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureChild(systems, 'RoomTransition'), _crd && RoomTransition === void 0 ? (_reportPossibleCrUseOfRoomTransition({
            error: Error()
          }), RoomTransition) : RoomTransition);
          dungeonManager.gridManager = gridManager;
          dungeonManager.battleManager = battleManager;
          dungeonManager.roomTransition = roomTransition;
          roomTransition.roomContainer = world;
          roomTransition.doorNode = this._ensureDoor(doorLayer);
          var skillSystem = (_ref5 = (_overrides$skillSyste = overrides.skillSystem) != null ? _overrides$skillSyste : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).findComponentInChildren(sceneRoot, _crd && SkillSystem === void 0 ? (_reportPossibleCrUseOfSkillSystem({
            error: Error()
          }), SkillSystem) : SkillSystem)) != null ? _ref5 : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent((_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureChild(systems, 'SkillSystem'), _crd && SkillSystem === void 0 ? (_reportPossibleCrUseOfSkillSystem({
            error: Error()
          }), SkillSystem) : SkillSystem);
          var upgradeManager = (_ref6 = (_overrides$upgradeMan = overrides.upgradeManager) != null ? _overrides$upgradeMan : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).findComponentInChildren(sceneRoot, _crd && UpgradeManager === void 0 ? (_reportPossibleCrUseOfUpgradeManager({
            error: Error()
          }), UpgradeManager) : UpgradeManager)) != null ? _ref6 : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent((_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureChild(systems, 'UpgradeManager'), _crd && UpgradeManager === void 0 ? (_reportPossibleCrUseOfUpgradeManager({
            error: Error()
          }), UpgradeManager) : UpgradeManager);
          var elementSystem = (_ref7 = (_overrides$elementSys = overrides.elementSystem) != null ? _overrides$elementSys : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).findComponentInChildren(sceneRoot, _crd && ElementSystem === void 0 ? (_reportPossibleCrUseOfElementSystem({
            error: Error()
          }), ElementSystem) : ElementSystem)) != null ? _ref7 : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent((_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureChild(systems, 'ElementSystem'), _crd && ElementSystem === void 0 ? (_reportPossibleCrUseOfElementSystem({
            error: Error()
          }), ElementSystem) : ElementSystem);
          var equipmentSystem = (_ref8 = (_overrides$equipmentS = overrides.equipmentSystem) != null ? _overrides$equipmentS : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).findComponentInChildren(sceneRoot, _crd && EquipmentSystem === void 0 ? (_reportPossibleCrUseOfEquipmentSystem({
            error: Error()
          }), EquipmentSystem) : EquipmentSystem)) != null ? _ref8 : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent((_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureChild(systems, 'EquipmentSystem'), _crd && EquipmentSystem === void 0 ? (_reportPossibleCrUseOfEquipmentSystem({
            error: Error()
          }), EquipmentSystem) : EquipmentSystem);
          var itemSystem = (_ref9 = (_overrides$itemSystem = overrides.itemSystem) != null ? _overrides$itemSystem : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).findComponentInChildren(sceneRoot, _crd && ItemSystem === void 0 ? (_reportPossibleCrUseOfItemSystem({
            error: Error()
          }), ItemSystem) : ItemSystem)) != null ? _ref9 : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent((_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureChild(systems, 'ItemSystem'), _crd && ItemSystem === void 0 ? (_reportPossibleCrUseOfItemSystem({
            error: Error()
          }), ItemSystem) : ItemSystem);
          var joystick = (_ref10 = (_overrides$joystick = overrides.joystick) != null ? _overrides$joystick : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).findComponentInChildren(sceneRoot, _crd && VirtualJoystick === void 0 ? (_reportPossibleCrUseOfVirtualJoystick({
            error: Error()
          }), VirtualJoystick) : VirtualJoystick)) != null ? _ref10 : this._ensureJoystick(uiRoot);
          var battleHUD = (_ref11 = (_overrides$battleHUD = overrides.battleHUD) != null ? _overrides$battleHUD : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).findComponentInChildren(sceneRoot, _crd && BattleHUD === void 0 ? (_reportPossibleCrUseOfBattleHUD({
            error: Error()
          }), BattleHUD) : BattleHUD)) != null ? _ref11 : this._ensureBattleHUD(uiRoot);
          var dungeonMapUI = (_ref12 = (_overrides$dungeonMap = overrides.dungeonMapUI) != null ? _overrides$dungeonMap : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).findComponentInChildren(sceneRoot, _crd && DungeonMapUI === void 0 ? (_reportPossibleCrUseOfDungeonMapUI({
            error: Error()
          }), DungeonMapUI) : DungeonMapUI)) != null ? _ref12 : this._ensureDungeonMapUI(uiRoot);
          var skillUI = (_findComponentInChild = (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).findComponentInChildren(sceneRoot, _crd && SkillUI === void 0 ? (_reportPossibleCrUseOfSkillUI({
            error: Error()
          }), SkillUI) : SkillUI)) != null ? _findComponentInChild : this._ensureSkillUI(uiRoot);
          var upgradeUI = (_ref13 = (_overrides$upgradeUI = overrides.upgradeUI) != null ? _overrides$upgradeUI : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).findComponentInChildren(sceneRoot, _crd && UpgradeUI === void 0 ? (_reportPossibleCrUseOfUpgradeUI({
            error: Error()
          }), UpgradeUI) : UpgradeUI)) != null ? _ref13 : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent((_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureChild(uiRoot, 'UpgradeUI'), _crd && UpgradeUI === void 0 ? (_reportPossibleCrUseOfUpgradeUI({
            error: Error()
          }), UpgradeUI) : UpgradeUI);
          var deathUI = (_ref14 = (_overrides$deathUI = overrides.deathUI) != null ? _overrides$deathUI : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).findComponentInChildren(sceneRoot, _crd && DeathUI === void 0 ? (_reportPossibleCrUseOfDeathUI({
            error: Error()
          }), DeathUI) : DeathUI)) != null ? _ref14 : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent((_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureChild(uiRoot, 'DeathUI'), _crd && DeathUI === void 0 ? (_reportPossibleCrUseOfDeathUI({
            error: Error()
          }), DeathUI) : DeathUI);
          var equipmentUI = (_ref15 = (_overrides$equipmentU = overrides.equipmentUI) != null ? _overrides$equipmentU : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).findComponentInChildren(sceneRoot, _crd && EquipmentUI === void 0 ? (_reportPossibleCrUseOfEquipmentUI({
            error: Error()
          }), EquipmentUI) : EquipmentUI)) != null ? _ref15 : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent((_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureChild(uiRoot, 'EquipmentUI'), _crd && EquipmentUI === void 0 ? (_reportPossibleCrUseOfEquipmentUI({
            error: Error()
          }), EquipmentUI) : EquipmentUI);
          var inventoryUI = (_ref16 = (_overrides$inventoryU = overrides.inventoryUI) != null ? _overrides$inventoryU : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).findComponentInChildren(sceneRoot, _crd && InventoryUI === void 0 ? (_reportPossibleCrUseOfInventoryUI({
            error: Error()
          }), InventoryUI) : InventoryUI)) != null ? _ref16 : (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent((_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureChild(uiRoot, 'InventoryUI'), _crd && InventoryUI === void 0 ? (_reportPossibleCrUseOfInventoryUI({
            error: Error()
          }), InventoryUI) : InventoryUI); // Reparent all pre-placed UI nodes to UIRoot for consistent layout management

          this._reparentToUIRoot(uiRoot, joystick == null ? void 0 : joystick.node, battleHUD == null ? void 0 : battleHUD.node, dungeonMapUI == null ? void 0 : dungeonMapUI.node, skillUI == null ? void 0 : skillUI.node, upgradeUI == null ? void 0 : upgradeUI.node, deathUI == null ? void 0 : deathUI.node, equipmentUI == null ? void 0 : equipmentUI.node, inventoryUI == null ? void 0 : inventoryUI.node); // Bind DungeonHudLayout to auto-position HUD elements


          var dungeonHUD = (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent(uiRoot, _crd && DungeonHudLayout === void 0 ? (_reportPossibleCrUseOfDungeonHudLayout({
            error: Error()
          }), DungeonHudLayout) : DungeonHudLayout);
          dungeonHUD.battleHUD = battleHUD.node;
          dungeonHUD.joystick = joystick.node;
          dungeonHUD.skillUI = skillUI.node;
          dungeonHUD.dungeonMapUI = dungeonMapUI.node;
          dungeonHUD.applyLayout(); // P1-6: wire the new Dungeon five-class pipeline (DungeonGenerator ->
          // RoomBuilder -> TileMap -> NavigationGrid -> RoomRuntime) into the REAL
          // scene-install path so they are no longer only demo-wired in GameBootstrap.
          // TileMap is produced inside RoomBuilder.build; the resulting RoomRuntime is
          // exposed on the refs for dungeon systems to consume. Seed/zone use demo
          // defaults here; wire from GameManager's run seed at runtime when available
          // (keeps this install path deterministic in headless tests).

          var sceneSeed = 20260711;
          var sceneZone = 'forest';
          var builtLayout = new (_crd && DungeonGenerator === void 0 ? (_reportPossibleCrUseOfDungeonGenerator({
            error: Error()
          }), DungeonGenerator) : DungeonGenerator)().generate(sceneSeed, sceneZone);
          var builtRoom = new (_crd && RoomBuilder === void 0 ? (_reportPossibleCrUseOfRoomBuilder({
            error: Error()
          }), RoomBuilder) : RoomBuilder)().build(builtLayout.rooms[0]);
          var builtNav = new (_crd && NavigationGrid === void 0 ? (_reportPossibleCrUseOfNavigationGrid({
            error: Error()
          }), NavigationGrid) : NavigationGrid)(builtRoom.tileMap);
          var roomRuntime = new (_crd && RoomRuntime === void 0 ? (_reportPossibleCrUseOfRoomRuntime({
            error: Error()
          }), RoomRuntime) : RoomRuntime)(builtRoom, builtNav); // P2-1: apply the region lighting preset to the live scene root via the
          // registered LightingService (best-effort; no-op in headless). Mirrors the
          // P1-6 Dungeon five-class wiring into this real install path. The actual
          // 3D look must be verified in the Cocos Creator editor.

          var lighting = (_context = (_crd && GameBootstrap === void 0 ? (_reportPossibleCrUseOfGameBootstrap({
            error: Error()
          }), GameBootstrap) : GameBootstrap).context) == null ? void 0 : _context.getOptional(_crd && ILightingService === void 0 ? (_reportPossibleCrUseOfILightingService({
            error: Error()
          }), ILightingService) : ILightingService);

          if (lighting) {
            lighting.apply(sceneZone);
          }

          return {
            canvas,
            world,
            backgroundLayer,
            tileLayer,
            actorLayer,
            effectLayer,
            doorLayer,
            systems,
            uiRoot,
            backgroundNode,
            gridManager,
            player,
            battleManager,
            dungeonManager,
            roomTransition,
            joystick,
            skillSystem,
            battleHUD,
            dungeonMapUI,
            upgradeUI,
            deathUI,
            upgradeManager,
            elementSystem,
            equipmentSystem,
            equipmentUI,
            itemSystem,
            inventoryUI,
            skillUI,
            roomRuntime
          };
        }

        loadInitialArt(refs, characterId, zoneId) {
          return _asyncToGenerator(function* () {
            if (characterId === void 0) {
              characterId = 'warrior';
            }

            if (zoneId === void 0) {
              zoneId = 'forest';
            }

            // Background via semantic key
            var bgKey = "background.bg_combat_" + zoneId;
            var bgOk = yield (_crd && BackgroundService === void 0 ? (_reportPossibleCrUseOfBackgroundService({
              error: Error()
            }), BackgroundService) : BackgroundService).instance.apply(refs.backgroundNode, bgKey);

            if (!bgOk) {
              // Fallback: direct asset load
              console.warn("[DungeonSceneInstaller] background not found via semantic key: " + bgKey);
              yield (_crd && RenderAssetService === void 0 ? (_reportPossibleCrUseOfRenderAssetService({
                error: Error()
              }), RenderAssetService) : RenderAssetService).applyTextureAsSprite(refs.backgroundNode, (_crd && ArtResourceResolver === void 0 ? (_reportPossibleCrUseOfArtResourceResolver({
                error: Error()
              }), ArtResourceResolver) : ArtResourceResolver).backgroundCombat(zoneId));
            } // Character via semantic key


            var charKey = "character." + characterId + ".idle";
            var charOk = yield (_crd && CharacterVisualService === void 0 ? (_reportPossibleCrUseOfCharacterVisualService({
              error: Error()
            }), CharacterVisualService) : CharacterVisualService).instance.applyStatic(refs.player.node, charKey);

            if (!charOk) {
              console.warn("[DungeonSceneInstaller] character sprite missing via semantic key: " + charKey);
              var frame = yield (_crd && RenderAssetService === void 0 ? (_reportPossibleCrUseOfRenderAssetService({
                error: Error()
              }), RenderAssetService) : RenderAssetService).applyCharacterSprite(refs.player.node, characterId, 'idle');

              if (!frame) {
                console.warn('[DungeonSceneInstaller] player sprite missing', characterId);
              }
            }
          })();
        }

        _ensureLayer(parent, name, index) {
          var node = this._ensureChild(parent, name);

          node.setPosition(0, 0, 0);
          node.setScale(1, 1, 1);
          node.setSiblingIndex(index);
          node.layer = Layers.Enum.UI_2D;
          (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureTransform(node, 1280, 720);
          return node;
        }

        _ensureChild(parent, name) {
          var children = parent.children.filter(n => n.name === name);

          if (children.length > 0) {
            // Keep the first match; destroy any duplicates
            for (var i = 1; i < children.length; i++) {
              var dup = children[i];
              console.warn("[DungeonSceneInstaller] removing duplicate node \"" + name + "\" under \"" + parent.name + "\"");
              dup.removeFromParent();
              dup.destroy();
            }

            return children[0];
          }

          var child = new Node(name);
          parent.addChild(child);
          return child;
        }

        _normalizeActorNode(node, parent, name, gridY) {
          if (node.parent !== parent) {
            node.removeFromParent();
            parent.addChild(node);
          }

          node.name = name;
          node.active = true;
          node.layer = Layers.Enum.UI_2D; // Use RuntimeLayerService for Y-axis sort order

          var sortIndex = (_crd && RuntimeLayerService === void 0 ? (_reportPossibleCrUseOfRuntimeLayerService({
            error: Error()
          }), RuntimeLayerService) : RuntimeLayerService).instance.getSortOrder(gridY);
          node.setSiblingIndex(sortIndex);
          node.setScale(1, 1, 1);
          (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureTransform(node, 96, 96);
        }

        _ensureDoor(parent) {
          var node = this._ensureChild(parent, 'ExitDoor');

          node.layer = Layers.Enum.UI_2D;
          (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureTransform(node, 56, 80);
          var graphics = (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent(node, Graphics);
          graphics.clear();
          graphics.fillColor = new Color(90, 60, 30, 180);
          graphics.rect(-28, -40, 56, 80);
          graphics.fill();
          return node;
        }

        _ensureJoystick(parent) {
          var node = this._ensureChild(parent, 'VirtualJoystick');

          node.layer = Layers.Enum.UI_2D;
          (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureTransform(node, 160, 160);
          var joystick = (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent(node, _crd && VirtualJoystick === void 0 ? (_reportPossibleCrUseOfVirtualJoystick({
            error: Error()
          }), VirtualJoystick) : VirtualJoystick);

          var bg = this._ensureChild(node, 'JoystickBg');

          (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureTransform(bg, 120, 120);

          this._fillRect(bg, 120, 120, new Color(80, 120, 180, 120));

          var thumb = this._ensureChild(bg, 'JoystickThumb');

          (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureTransform(thumb, 48, 48);

          this._fillRect(thumb, 48, 48, new Color(180, 220, 255, 180));

          joystick.joystickBg = bg;
          joystick.joystickThumb = thumb;
          return joystick;
        }

        _ensureBattleHUD(parent) {
          var node = this._ensureChild(parent, 'BattleHUD');

          node.layer = Layers.Enum.UI_2D;
          var hud = (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent(node, _crd && BattleHUD === void 0 ? (_reportPossibleCrUseOfBattleHUD({
            error: Error()
          }), BattleHUD) : BattleHUD);
          hud.hpLabel = this._ensureLabel((_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureChild(node, 'HPLabel'), 'HP');
          hud.floorLabel = this._ensureLabel((_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureChild(node, 'FloorLabel'), '1F');
          hud.killLabel = this._ensureLabel((_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureChild(node, 'KillLabel'), '0');

          var hpBarNode = this._ensureChild(node, 'HPBar');

          (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureTransform(hpBarNode, 220, 16);

          this._fillRect(hpBarNode, 220, 16, new Color(80, 180, 90, 220));

          hud.hpBar = (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent(hpBarNode, ProgressBar);
          return hud;
        }

        _ensureDungeonMapUI(parent) {
          var node = this._ensureChild(parent, 'DungeonMapUI');

          node.layer = Layers.Enum.UI_2D;
          var map = (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent(node, _crd && DungeonMapUI === void 0 ? (_reportPossibleCrUseOfDungeonMapUI({
            error: Error()
          }), DungeonMapUI) : DungeonMapUI);
          map.mapContainer = (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureChild(node, 'MapContainer');
          return map;
        }

        _ensureSkillUI(parent) {
          var node = this._ensureChild(parent, 'SkillUI');

          node.layer = Layers.Enum.UI_2D;
          return (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent(node, _crd && SkillUI === void 0 ? (_reportPossibleCrUseOfSkillUI({
            error: Error()
          }), SkillUI) : SkillUI);
        }

        _reparentToUIRoot(uiRoot) {
          for (var _len = arguments.length, nodes = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            nodes[_key - 1] = arguments[_key];
          }

          for (var node of nodes) {
            if (!node || node.parent === uiRoot) continue;
            node.removeFromParent();
            uiRoot.addChild(node);
          }
        }

        _ensureLabel(node, text) {
          node.layer = Layers.Enum.UI_2D;
          var label = (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent(node, Label);
          label.string = text;
          label.fontSize = 18;
          label.color = Color.WHITE;
          return label;
        }

        _fillRect(node, width, height, color) {
          node.layer = Layers.Enum.UI_2D;
          var graphics = (_crd && F === void 0 ? (_reportPossibleCrUseOfF({
            error: Error()
          }), F) : F).ensureComponent(node, Graphics);
          graphics.clear();
          graphics.fillColor = color;
          graphics.rect(-width / 2, -height / 2, width, height);
          graphics.fill();
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=d4c5d01a291ba91ffc6f4a05e75edac426e3e35b.js.map