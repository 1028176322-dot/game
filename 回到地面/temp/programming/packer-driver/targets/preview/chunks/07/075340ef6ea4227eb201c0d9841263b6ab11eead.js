System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, resources, JsonAsset, ConfigLoadError, validateMetadata, validateZoneMonsterRefs, loadTextConfig, ConfigService, _crd, CONFIG_NAMES;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

  function _reportPossibleCrUseOfConfigName(extras) {
    _reporterNs.report("ConfigName", "./ConfigTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameConfigs(extras) {
    _reporterNs.report("GameConfigs", "./ConfigTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBattleData(extras) {
    _reporterNs.report("BattleData", "./ConfigTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonstersData(extras) {
    _reporterNs.report("MonstersData", "./ConfigTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfZonesData(extras) {
    _reporterNs.report("ZonesData", "./ConfigTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterDef(extras) {
    _reporterNs.report("MonsterDef", "./ConfigTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMonsterScale(extras) {
    _reporterNs.report("MonsterScale", "./ConfigTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfConfigLoadError(extras) {
    _reporterNs.report("ConfigLoadError", "./ConfigError", _context.meta, extras);
  }

  function _reportPossibleCrUseOfvalidateMetadata(extras) {
    _reporterNs.report("validateMetadata", "./ConfigSchemas", _context.meta, extras);
  }

  function _reportPossibleCrUseOfvalidateZoneMonsterRefs(extras) {
    _reporterNs.report("validateZoneMonsterRefs", "./ConfigSchemas", _context.meta, extras);
  }

  function _reportPossibleCrUseOfloadTextConfig(extras) {
    _reporterNs.report("loadTextConfig", "../core/TextManager", _context.meta, extras);
  }

  _export("ConfigService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      resources = _cc.resources;
      JsonAsset = _cc.JsonAsset;
    }, function (_unresolved_2) {
      ConfigLoadError = _unresolved_2.ConfigLoadError;
    }, function (_unresolved_3) {
      validateMetadata = _unresolved_3.validateMetadata;
      validateZoneMonsterRefs = _unresolved_3.validateZoneMonsterRefs;
    }, function (_unresolved_4) {
      loadTextConfig = _unresolved_4.loadTextConfig;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "8cc427aWPZO140BMUFBG3U5", "ConfigService", undefined);
      /**
       * ConfigService - 配置异步加载服务
       *
       * 职责:
       * 1. 通过 resources.load 异步加载 JSON 配置
       * 2. 加载完成后执行校验（字段存在性 + 交叉引用）
       * 3. 提供类型安全的 typed getter
       * 4. 加载失败明确报错，拒绝静默兜底
       *
       * 使用方式:
       *   await ConfigService.instance.loadAll();
       *   const zones = ConfigService.instance.zones;
       */


      __checkObsolete__(['resources', 'JsonAsset']);

      CONFIG_NAMES = ['battle', 'economy', 'elements', 'equipment', 'items', 'monsters', 'player', 'skills', 'text', 'zones'];

      _export("ConfigService", ConfigService = class ConfigService {
        constructor() {
          this._configs = {};
          this._loaded = false;
        }

        static get instance() {
          if (!this._instance) this._instance = new ConfigService();
          return this._instance;
        }

        get loaded() {
          return this._loaded;
        }
        /** 异步加载全部配置表（必须等待完成再进主界面） */


        loadAll() {
          var _this = this;

          return _asyncToGenerator(function* () {
            var results = yield Promise.all(CONFIG_NAMES.map(name => _this._loadOne(name)));

            for (var [name, data] of results) {
              _this._configs[name] = data;
            } // 交叉引用校验


            _this._validateCrossReferences();

            (_crd && loadTextConfig === void 0 ? (_reportPossibleCrUseOfloadTextConfig({
              error: Error()
            }), loadTextConfig) : loadTextConfig)(_this._configs.text);
            _this._loaded = true;
            console.log('[ConfigService] 所有配置加载完成');
          })();
        }
        /** 加载单个配置文件 */


        _loadOne(name) {
          return new Promise((resolve, reject) => {
            resources.load("config/" + name, JsonAsset, (err, asset) => {
              if (err || !asset) {
                var _err$message;

                reject(new (_crd && ConfigLoadError === void 0 ? (_reportPossibleCrUseOfConfigLoadError({
                  error: Error()
                }), ConfigLoadError) : ConfigLoadError)(name, "\u52A0\u8F7D\u5931\u8D25: " + ((_err$message = err == null ? void 0 : err.message) != null ? _err$message : '未知错误'), err != null ? err : undefined));
                return;
              }

              try {
                var raw = asset.json; // 校验 metadata

                (_crd && validateMetadata === void 0 ? (_reportPossibleCrUseOfvalidateMetadata({
                  error: Error()
                }), validateMetadata) : validateMetadata)(name, raw); // 类型化数据（JSON 结构即最终数据）

                var data = raw;
                resolve([name, data]);
              } catch (e) {
                reject(e instanceof Error ? new (_crd && ConfigLoadError === void 0 ? (_reportPossibleCrUseOfConfigLoadError({
                  error: Error()
                }), ConfigLoadError) : ConfigLoadError)(name, "\u89E3\u6790\u5931\u8D25: " + e.message, e) : new (_crd && ConfigLoadError === void 0 ? (_reportPossibleCrUseOfConfigLoadError({
                  error: Error()
                }), ConfigLoadError) : ConfigLoadError)(name, '未知解析错误'));
              }
            });
          });
        }
        /** 交叉引用校验：zone.monsterPool 引用的怪物必须存在于 monsters.json */


        _validateCrossReferences() {
          var zones = this._configs.zones;
          var monsters = this._configs.monsters;
          if (!zones || !monsters) return; // 收集每个区域的怪物定义

          var zoneMonsters = {};

          for (var key of Object.keys(monsters)) {
            if (key === 'metadata' || key === 'monsterScale') continue;
            zoneMonsters[key] = monsters[key];
          }

          (_crd && validateZoneMonsterRefs === void 0 ? (_reportPossibleCrUseOfvalidateZoneMonsterRefs({
            error: Error()
          }), validateZoneMonsterRefs) : validateZoneMonsterRefs)('config', {
            zonePool: zones.zonePool,
            zones: zones.zones
          }, zoneMonsters);
        } // ======== 类型安全 Getter ========


        get battle() {
          return this._configs.battle;
        }

        get zones() {
          return this._configs.zones;
        }

        get monsters() {
          return this._configs.monsters;
        }
        /** 泛型访问 */


        get(name) {
          var cfg = this._configs[name];

          if (!cfg) {
            throw new (_crd && ConfigLoadError === void 0 ? (_reportPossibleCrUseOfConfigLoadError({
              error: Error()
            }), ConfigLoadError) : ConfigLoadError)(name, "\u914D\u7F6E\u672A\u52A0\u8F7D\uFF08\u8BF7\u5148\u8C03\u7528 loadAll()\uFF09");
          }

          return cfg;
        } // ======== 便捷方法（供旧 ConfigManager 代理调用） ========

        /** 获取某个区域中指定怪物的配置 */


        getMonsterDef(zoneId, monsterId) {
          var _monsterId;

          var monsters = this._configs.monsters;
          if (!monsters) return null;
          var zoneMonsters = monsters[zoneId];
          if (!zoneMonsters || typeof zoneMonsters !== 'object') return null;
          return (_monsterId = zoneMonsters[monsterId]) != null ? _monsterId : null;
        }
        /** 获取怪物缩放参数 */


        getMonsterScale() {
          var monsters = this._configs.monsters;

          if (!monsters) {
            // 失败时返回默认值（仅作为防御措施）
            return {
              eliteHpMultiplier: 1.8,
              eliteAtkMultiplier: 1.5,
              summonHpMultiplier: 0.5,
              summonAtkMultiplier: 0.6,
              maxOnScreen: 10,
              summonMaxPerMonster: 3,
              summonGlobalCap: 8
            };
          }

          return monsters.monsterScale;
        }
        /** 检查状态配置是否已加载（抛异常版） */


        assertLoaded() {
          if (!this._loaded) {
            throw new (_crd && ConfigLoadError === void 0 ? (_reportPossibleCrUseOfConfigLoadError({
              error: Error()
            }), ConfigLoadError) : ConfigLoadError)('ConfigService', '配置尚未加载 - 请在启动时 await ConfigService.instance.loadAll()');
          }
        }

      });

      ConfigService._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=075340ef6ea4227eb201c0d9841263b6ab11eead.js.map