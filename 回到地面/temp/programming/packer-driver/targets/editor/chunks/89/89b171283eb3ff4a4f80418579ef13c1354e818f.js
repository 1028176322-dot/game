System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, eventBus, SaveService, PlayerDataManager, _crd, CHARACTER_LIST, TALENT_LIST, SAVE_KEY;

  // ======== 默认存档 ========
  function createDefaultSave() {
    return {
      soulStones: 0,
      unlockedCharacters: ['warrior'],
      selectedCharacter: 'warrior',
      selectedTalent: null,
      unlockedRelicPoolExtras: [],
      bestFloor: 0,
      totalKills: 0,
      totalRuns: 0,
      zoneClearCounts: {},
      zoneBestFloors: {},
      version: 1
    };
  } // ======== 存储密钥 ========


  /** Convert new PlayerProfileSave -> legacy PlayerSaveData for backward compat. */
  function profileToSaveData(profile) {
    return {
      soulStones: profile.profile.soulStones,
      unlockedCharacters: profile.profile.unlockedCharacters,
      selectedCharacter: profile.profile.selectedCharacter,
      selectedTalent: profile.profile.selectedTalent,
      unlockedRelicPoolExtras: profile.profile.unlockedRelicPoolExtras,
      bestFloor: profile.stats.bestFloor,
      totalKills: profile.stats.totalKills,
      totalRuns: profile.stats.totalRuns,
      zoneClearCounts: profile.zoneClearCounts,
      zoneBestFloors: profile.zoneBestFloors,
      version: profile.schemaVersion
    };
  }
  /** Convert legacy PlayerSaveData -> PlayerProfileSave */


  function saveDataToProfile(data) {
    var _data$version;

    const now = Date.now();
    return {
      schemaVersion: (_data$version = data.version) != null ? _data$version : 1,
      playerId: 'local_' + String(now),
      updatedAt: now,
      createdAt: now,
      profile: {
        soulStones: data.soulStones,
        unlockedCharacters: data.unlockedCharacters,
        selectedCharacter: data.selectedCharacter,
        selectedTalent: data.selectedTalent,
        unlockedRelicPoolExtras: data.unlockedRelicPoolExtras
      },
      stats: {
        bestFloor: data.bestFloor,
        totalKills: data.totalKills,
        totalRuns: data.totalRuns,
        totalRevives: 0,
        totalAdsWatched: 0
      },
      flags: {
        tutorialFinished: false,
        privacyAccepted: false,
        characterCreated: data.totalRuns > 0 || data.soulStones > 0
      },
      zoneClearCounts: data.zoneClearCounts,
      zoneBestFloors: data.zoneBestFloors
    };
  } // ======== 管理器 ========


  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "./EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSaveService(extras) {
    _reporterNs.report("SaveService", "./save/SaveService", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerProfileSave(extras) {
    _reporterNs.report("PlayerProfileSave", "./save/SaveTypes", _context.meta, extras);
  }

  _export("PlayerDataManager", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      eventBus = _unresolved_2.eventBus;
    }, function (_unresolved_3) {
      SaveService = _unresolved_3.SaveService;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "41d0aB6tlNHupikgbYCWVF0", "PlayerDataManager", undefined);
      /**
       * PlayerDataManager - 永久存档管理器 (M2.4)
       *
       * Single write entry: all soulStone/character/talent operations go through this module.
       * Phase 1: uses SaveService instead of direct StorageService access.
       */


      // ======== 存档数据结构 ========
      // ======== 角色配置 ========
      _export("CHARACTER_LIST", CHARACTER_LIST = [{
        id: 'warrior',
        name: '战士',
        initialAbility: 'shieldReflect',
        initialSkill: 'shield',
        unlockCost: 500,
        description: '初始核心能力: 盾反'
      }, {
        id: 'archer',
        name: '弓手',
        initialAbility: 'ricochet',
        initialSkill: 'snapShot',
        unlockCost: 500,
        description: '初始核心能力: 弹射箭'
      }, {
        id: 'assassin',
        name: '刺客',
        initialAbility: 'phaseWalk',
        initialSkill: 'dash',
        unlockCost: 800,
        description: '初始核心能力: 穿影'
      }, {
        id: 'mage',
        name: '法师',
        initialAbility: 'elementResonance',
        initialSkill: 'elementBurst',
        unlockCost: 1000,
        description: '初始核心能力: 元素共鸣'
      }, {
        id: 'berserker',
        name: '狂战士',
        initialAbility: 'warCry',
        initialSkill: 'healWave',
        unlockCost: 1200,
        description: '初始核心能力: 怒吼'
      }]); // ======== 天赋配置 ========


      _export("TALENT_LIST", TALENT_LIST = [{
        id: 'greed',
        name: '贪婪',
        description: '魂石获取 +15%',
        cost: 1000
      }, {
        id: 'explorer',
        name: '探索者',
        description: '地图全开 + 宝箱房概率+10%',
        cost: 1000
      }, {
        id: 'iron_stomach',
        name: '铁胃',
        description: '回复效果 +30%',
        cost: 1000
      }]);

      SAVE_KEY = 'player_data';

      _export("PlayerDataManager", PlayerDataManager = class PlayerDataManager {
        static getInstance() {
          if (!PlayerDataManager._instance) {
            PlayerDataManager._instance = new PlayerDataManager();
          }

          return PlayerDataManager._instance;
        }

        constructor() {
          this._data = void 0;
          this._data = this._load();
        } // ======== 只读访问 ========


        get soulStones() {
          return this._data.soulStones;
        }

        get selectedCharacter() {
          return this._data.selectedCharacter;
        }

        get selectedTalent() {
          return this._data.selectedTalent;
        }

        get unlockedCharacters() {
          return [...this._data.unlockedCharacters];
        }

        get bestFloor() {
          return this._data.bestFloor;
        }

        get totalKills() {
          return this._data.totalKills;
        }

        get totalRuns() {
          return this._data.totalRuns;
        }

        getSelectedCharacterId() {
          return this.selectedCharacter;
        }
        /** 检查角色是否已解锁 */


        isCharacterUnlocked(charId) {
          return this._data.unlockedCharacters.includes(charId);
        }
        /** 检查天赋是否已购买 */


        isTalentOwned(talentId) {
          return this._data.selectedTalent === talentId;
        } // ======== 额外 Reader 方法 ========

        /** 获取魂石数 */


        getSoulStones() {
          return this._data.soulStones;
        }
        /** 获取角色名 (扩展字段, 从存档的额外数据读取) */


        getCharacterName() {
          const explicitName = this._data.characterName;

          if (explicitName) {
            return explicitName;
          }

          const character = CHARACTER_LIST.find(c => c.id === this.selectedCharacter);
          return character ? character.name : this.selectedCharacter;
        }
        /** 获取角色等级 (预留, 当前固定 1) */


        getCharacterLevel() {
          return 1;
        }
        /** 获取已解锁角色ID列表 */


        getUnlockedCharacterIds() {
          return [...this._data.unlockedCharacters];
        }
        /** 获取历史最高层 (全局) */


        getBestFloor() {
          return this._data.bestFloor;
        }
        /** 获取某区域最高到达层数 */


        getZoneBestFloor(zoneId) {
          var _this$_data$zoneBestF;

          return (_this$_data$zoneBestF = this._data.zoneBestFloors[zoneId]) != null ? _this$_data$zoneBestF : 0;
        }
        /** 记录某区域最高层数 */


        recordZoneBestFloor(zoneId, floor) {
          var _this$_data$zoneBestF2;

          if (floor > ((_this$_data$zoneBestF2 = this._data.zoneBestFloors[zoneId]) != null ? _this$_data$zoneBestF2 : 0)) {
            this._data.zoneBestFloors[zoneId] = floor;

            this._save();
          }
        }
        /** 获取某区域通关次数 */


        getZoneClearCount(zoneId) {
          var _this$_data$zoneClear;

          return (_this$_data$zoneClear = this._data.zoneClearCounts[zoneId]) != null ? _this$_data$zoneClear : 0;
        }
        /** 记录区域通关 */


        recordZoneClear(zoneId) {
          var _this$_data$zoneClear2;

          this._data.zoneClearCounts[zoneId] = ((_this$_data$zoneClear2 = this._data.zoneClearCounts[zoneId]) != null ? _this$_data$zoneClear2 : 0) + 1;

          this._save();
        }
        /** 获取总局数 */


        getTotalRuns() {
          return this._data.totalRuns;
        }
        /** 设置历史最高层 */


        setBestFloor(floor) {
          if (floor > this._data.bestFloor) {
            this._data.bestFloor = floor;

            this._save();
          }
        }
        /** 累加击杀数 */


        addTotalKills(kills) {
          if (kills <= 0) return;
          this._data.totalKills += kills;

          this._save();
        }
        /** 总冒险次数 +1 */


        addTotalRun() {
          this._data.totalRuns++;

          this._save();
        }
        /** 创建角色并初始化存档 (首次使用) */


        createCharacter(name, charType) {
          this._data = {
            soulStones: 0,
            unlockedCharacters: ['warrior'],
            selectedCharacter: charType,
            selectedTalent: null,
            unlockedRelicPoolExtras: [],
            bestFloor: 0,
            totalKills: 0,
            totalRuns: 0,
            zoneClearCounts: {},
            zoneBestFloors: {},
            version: 1
          };
          this._data.characterName = name;
          this._data.createdAt = Date.now();

          this._save();

          console.log('[PlayerData] character created:', name, charType);
        }
        /** 是否为首次启动 */


        isFirstTime() {
          return this._data.totalRuns === 0 && this._data.soulStones === 0 && this._data.totalKills === 0;
        } // ======== 写操作 (单一写入口) ========

        /** 增加魂石 (正向) */


        addSoulStones(amount) {
          if (amount <= 0) return;
          this._data.soulStones += amount;

          this._save();

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('playerdata:soulStones_changed', this._data.soulStones);
        }
        /** 消耗魂石 (反向, 需检查余额) */


        spendSoulStones(amount) {
          if (amount <= 0 || this._data.soulStones < amount) return false;
          this._data.soulStones -= amount;

          this._save();

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('playerdata:soulStones_changed', this._data.soulStones);
          return true;
        }
        /** 解锁角色 */


        unlockCharacter(charId) {
          if (this._data.unlockedCharacters.includes(charId)) return false;
          const charDef = CHARACTER_LIST.find(c => c.id === charId);
          if (!charDef) return false;
          if (!this.spendSoulStones(charDef.unlockCost)) return false;

          this._data.unlockedCharacters.push(charId);

          this._save();

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('playerdata:character_unlocked', charId);
          return true;
        }
        /** 选择当前角色 */


        selectCharacter(charId) {
          if (!this._data.unlockedCharacters.includes(charId)) return false;
          this._data.selectedCharacter = charId;

          this._save();

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('playerdata:character_selected', charId);
          return true;
        }
        /** 购买并选择天赋 */


        purchaseTalent(talentId) {
          const talentDef = TALENT_LIST.find(t => t.id === talentId);
          if (!talentDef) return false;
          if (this._data.selectedTalent === talentId) return true; // 已拥有

          if (!this.spendSoulStones(talentDef.cost)) return false;
          this._data.selectedTalent = talentId;

          this._save();

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('playerdata:talent_changed', talentId);
          return true;
        }
        /** 解锁遗物池扩展 */


        unlockRelicExtra(relicId) {
          if (this._data.unlockedRelicPoolExtras.includes(relicId)) return false;
          if (!this.spendSoulStones(300)) return false; // 固定 300 魂石

          this._data.unlockedRelicPoolExtras.push(relicId);

          this._save();

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('playerdata:relic_unlocked', relicId);
          return true;
        }
        /** 更新一局结束后的统计 (由 DeathUI 调用) */


        commitRunResult(floor, kills, soulStoneEarned) {
          this._data.totalRuns++;
          this._data.totalKills += kills;

          if (floor > this._data.bestFloor) {
            this._data.bestFloor = floor;
          }

          this.addSoulStones(soulStoneEarned);
        } // ======== 重置 ========

        /** 重置所有数据 (测试/设置用) */


        resetAll() {
          this._data = createDefaultSave();

          this._save();

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('playerdata:reset');
        } // ======== 读写存储（Phase 1: 使用 SaveService） ========


        _load() {
          try {
            const saveService = (_crd && SaveService === void 0 ? (_reportPossibleCrUseOfSaveService({
              error: Error()
            }), SaveService) : SaveService).instance;
            const profile = saveService.loadProfile();
            const data = profileToSaveData(profile);
            console.warn('[PlayerDataManager] loaded profile:', {
              selectedCharacter: data.selectedCharacter,
              unlockedCharacters: data.unlockedCharacters,
              version: data.version
            });
            return data;
          } catch (err) {
            console.warn('[PlayerDataManager] 读档失败，使用默认', err);
          }

          return createDefaultSave();
        }

        _save() {
          try {
            const profile = saveDataToProfile(this._data);
            (_crd && SaveService === void 0 ? (_reportPossibleCrUseOfSaveService({
              error: Error()
            }), SaveService) : SaveService).instance.saveProfile(profile);
          } catch (err) {
            console.warn('[PlayerDataManager] 存档失败', err);
          }
        }

      });

      PlayerDataManager._instance = void 0;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=89b171283eb3ff4a4f80418579ef13c1354e818f.js.map