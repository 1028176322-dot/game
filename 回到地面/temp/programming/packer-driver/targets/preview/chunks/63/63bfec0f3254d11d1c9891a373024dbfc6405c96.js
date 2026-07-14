System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, _crd, DamageType, ElementType, MonsterAIType, RoomType, TerrainType, GamePhase, PlayerState, MonsterState, BattlePhase, UIState, Rarity, EquipSlot, AdPlacement, SetType, MODIFIER_SOURCE;

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "5da6dA8KV5MV7q+peh9POjM", "Constants", undefined);

      /**
       * 游戏常量与枚举定义
       * 所有数值型配置已迁移至 GameConfig.ts，此文件仅保留枚举与类型
       * 
       * 【规则】
       * - 枚举在此定义，枚举值用可读字符串
       * - 所有数值常量请到 GameConfig.ts 中定义和修改
       */
      // ======== 伤害类型 ========
      _export("DamageType", DamageType = /*#__PURE__*/function (DamageType) {
        DamageType["Physical"] = "physical";
        DamageType["Fire"] = "fire";
        DamageType["Frost"] = "frost";
        DamageType["Lightning"] = "lightning";
        DamageType["Poison"] = "poison";
        DamageType["Shadow"] = "shadow";
        DamageType["Holy"] = "holy";
        DamageType["True"] = "true";
        return DamageType;
      }({})); // ======== 元素类型 ========


      _export("ElementType", ElementType = /*#__PURE__*/function (ElementType) {
        ElementType["None"] = "none";
        ElementType["Fire"] = "fire";
        ElementType["Frost"] = "frost";
        ElementType["Lightning"] = "lightning";
        ElementType["Poison"] = "poison";
        ElementType["Shadow"] = "shadow";
        ElementType["Holy"] = "holy";
        return ElementType;
      }({})); // ======== 怪物 AI 类型 ========


      _export("MonsterAIType", MonsterAIType = /*#__PURE__*/function (MonsterAIType) {
        MonsterAIType["Charger"] = "charger";
        MonsterAIType["Ranged"] = "ranged";
        MonsterAIType["Defender"] = "defender";
        MonsterAIType["Summoner"] = "summoner";
        MonsterAIType["Suicider"] = "suicider";
        MonsterAIType["Elite"] = "elite";
        return MonsterAIType;
      }({})); // ======== 房间类型 ========


      _export("RoomType", RoomType = /*#__PURE__*/function (RoomType) {
        RoomType["Normal"] = "normal";
        RoomType["Elite"] = "elite";
        RoomType["Boss"] = "boss";
        RoomType["Treasure"] = "treasure";
        RoomType["Healing"] = "healing";
        RoomType["Shop"] = "shop";
        RoomType["Upgrade"] = "upgrade";
        RoomType["Event"] = "event";
        RoomType["Rest"] = "rest";
        return RoomType;
      }({})); // ======== 地形类型 ========


      _export("TerrainType", TerrainType = /*#__PURE__*/function (TerrainType) {
        TerrainType["Floor"] = "floor";
        TerrainType["Wall"] = "wall";
        TerrainType["Water"] = "water";
        TerrainType["Lava"] = "lava";
        TerrainType["Ice"] = "ice";
        TerrainType["Swamp"] = "swamp";
        TerrainType["Grass"] = "grass";
        TerrainType["Stone"] = "stone";
        TerrainType["Thorn"] = "thorn";
        TerrainType["HealPad"] = "healPad";
        TerrainType["HighGround"] = "highGround";
        TerrainType["DarkZone"] = "darkZone";
        return TerrainType;
      }({})); // ======== 游戏阶段 ========


      _export("GamePhase", GamePhase = /*#__PURE__*/function (GamePhase) {
        GamePhase["Splash"] = "splash";
        GamePhase["MainMenu"] = "mainMenu";
        GamePhase["CharacterSelect"] = "charSelect";
        GamePhase["Dungeon"] = "dungeon";
        GamePhase["Battle"] = "battle";
        GamePhase["UpgradeRoom"] = "upgrade";
        GamePhase["DeathScreen"] = "death";
        GamePhase["Settlement"] = "settlement";
        return GamePhase;
      }({})); // ======== 玩家状态 ========


      _export("PlayerState", PlayerState = /*#__PURE__*/function (PlayerState) {
        PlayerState["Idle"] = "idle";
        PlayerState["Moving"] = "moving";
        PlayerState["Dodging"] = "dodging";
        PlayerState["Attacking"] = "attacking";
        PlayerState["Casting"] = "casting";
        PlayerState["Stunned"] = "stunned";
        PlayerState["Dead"] = "dead";
        return PlayerState;
      }({})); // ======== 怪物状态 ========


      _export("MonsterState", MonsterState = /*#__PURE__*/function (MonsterState) {
        MonsterState["Idle"] = "idle";
        MonsterState["Chase"] = "chase";
        MonsterState["Attack"] = "attack";
        MonsterState["Retreat"] = "retreat";
        MonsterState["Defend"] = "defend";
        MonsterState["Stunned"] = "stunned";
        MonsterState["Dead"] = "dead";
        return MonsterState;
      }({})); // ======== 战斗阶段 ========


      _export("BattlePhase", BattlePhase = /*#__PURE__*/function (BattlePhase) {
        BattlePhase["Init"] = "init";
        BattlePhase["InProgress"] = "inProgress";
        BattlePhase["Victory"] = "victory";
        BattlePhase["Defeat"] = "defeat";
        return BattlePhase;
      }({})); // ======== UI 状态 ========


      _export("UIState", UIState = /*#__PURE__*/function (UIState) {
        UIState["Closed"] = "closed";
        UIState["Opening"] = "opening";
        UIState["Open"] = "open";
        UIState["Closing"] = "closing";
        return UIState;
      }({})); // ======== 物品稀有度 ========


      _export("Rarity", Rarity = /*#__PURE__*/function (Rarity) {
        Rarity["Common"] = "common";
        Rarity["Magic"] = "magic";
        Rarity["Rare"] = "rare";
        Rarity["Legendary"] = "legendary";
        return Rarity;
      }({})); // ======== 装备槽位 ========


      _export("EquipSlot", EquipSlot = /*#__PURE__*/function (EquipSlot) {
        EquipSlot["Weapon"] = "weapon";
        EquipSlot["Ring"] = "ring";
        EquipSlot["Necklace"] = "necklace";
        EquipSlot["Helmet"] = "helmet";
        EquipSlot["Chest"] = "chest";
        EquipSlot["Legs"] = "legs";
        EquipSlot["Shoes"] = "shoes";
        EquipSlot["Gloves"] = "gloves";
        return EquipSlot;
      }({})); // ======== 广告位类型 ========


      _export("AdPlacement", AdPlacement = /*#__PURE__*/function (AdPlacement) {
        AdPlacement["Revive"] = "revive";
        AdPlacement["Treasure"] = "treasure";
        AdPlacement["UpgradeExtra"] = "upgradeExtra";
        AdPlacement["ShopDiscount"] = "shopDiscount";
        AdPlacement["CoinDouble"] = "coinDouble";
        AdPlacement["DailyReward"] = "dailyReward";
        AdPlacement["Marquee"] = "marquee";
        AdPlacement["Interstitial"] = "interstitial";
        AdPlacement["Banner"] = "banner";
        return AdPlacement;
      }({})); // ======== 套装类型 ========


      _export("SetType", SetType = /*#__PURE__*/function (SetType) {
        SetType["Tempest"] = "tempest";
        SetType["Ironwall"] = "ironwall";
        SetType["Shadow"] = "shadow";
        SetType["Fury"] = "fury";
        SetType["Frostbite"] = "frostbite";
        SetType["Radiance"] = "radiance";
        return SetType;
      }({})); // ======== 修饰符来源前缀 ========


      _export("MODIFIER_SOURCE", MODIFIER_SOURCE = {
        ABILITY_PREFIX: 'ability:',
        RELIC_PREFIX: 'relic:',
        EQUIP_PREFIX: 'equip:',
        SET_PREFIX: 'set:',
        BUFF_PREFIX: 'buff:',
        ITEM_PREFIX: 'item:'
      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=63bfec0f3254d11d1c9891a373024dbfc6405c96.js.map