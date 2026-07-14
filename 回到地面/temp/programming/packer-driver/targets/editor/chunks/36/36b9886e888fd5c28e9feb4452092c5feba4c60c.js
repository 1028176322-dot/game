System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, ConfigValidationError, ConfigReferenceError, _crd;

  // ======== 通用校验 ========
  function validateMetadata(configName, raw) {
    if (!raw || typeof raw !== 'object') {
      throw new (_crd && ConfigValidationError === void 0 ? (_reportPossibleCrUseOfConfigValidationError({
        error: Error()
      }), ConfigValidationError) : ConfigValidationError)(configName, 'metadata', 'must be an object');
    }

    const obj = raw;

    if (!obj.metadata || typeof obj.metadata !== 'object') {
      throw new (_crd && ConfigValidationError === void 0 ? (_reportPossibleCrUseOfConfigValidationError({
        error: Error()
      }), ConfigValidationError) : ConfigValidationError)(configName, 'metadata', 'missing or invalid');
    }

    const meta = obj.metadata;

    if (typeof meta.version !== 'string' || !meta.version) {
      throw new (_crd && ConfigValidationError === void 0 ? (_reportPossibleCrUseOfConfigValidationError({
        error: Error()
      }), ConfigValidationError) : ConfigValidationError)(configName, 'metadata.version', 'must be a non-empty string');
    }

    if (typeof meta.lastUpdated !== 'string' || !meta.lastUpdated) {
      throw new (_crd && ConfigValidationError === void 0 ? (_reportPossibleCrUseOfConfigValidationError({
        error: Error()
      }), ConfigValidationError) : ConfigValidationError)(configName, 'metadata.lastUpdated', 'must be a non-empty string');
    }

    return meta;
  }

  function validateNonEmptyString(configName, field, value) {
    if (typeof value !== 'string' || value.length === 0) {
      throw new (_crd && ConfigValidationError === void 0 ? (_reportPossibleCrUseOfConfigValidationError({
        error: Error()
      }), ConfigValidationError) : ConfigValidationError)(configName, field, 'must be a non-empty string');
    }
  }

  function validatePositiveNumber(configName, field, value) {
    if (typeof value !== 'number' || value < 0) {
      throw new (_crd && ConfigValidationError === void 0 ? (_reportPossibleCrUseOfConfigValidationError({
        error: Error()
      }), ConfigValidationError) : ConfigValidationError)(configName, field, 'must be a non-negative number');
    }
  }

  function validateNumberRange(configName, field, value, min, max) {
    if (typeof value !== 'number' || value < min || value > max) {
      throw new (_crd && ConfigValidationError === void 0 ? (_reportPossibleCrUseOfConfigValidationError({
        error: Error()
      }), ConfigValidationError) : ConfigValidationError)(configName, field, `must be between ${min} and ${max}`);
    }
  } // ======== 战斗配置校验 ========


  function validateBattleData(name, data) {
    const obj = data;

    if (obj.autoAttack) {
      const aa = obj.autoAttack;
      validatePositiveNumber(name, 'autoAttack.baseInterval', aa.baseInterval);
      validatePositiveNumber(name, 'autoAttack.minDamage', aa.minDamage);
      validateNumberRange(name, 'autoAttack.rangeDecayRate', aa.rangeDecayRate, 0, 0.5);
    }

    if (obj.dodge) {
      const d = obj.dodge;
      validateNumberRange(name, 'dodge.duration', d.duration, 0.1, 1.0);
      validateNumberRange(name, 'dodge.cooldown', d.cooldown, 1.0, 10.0);
    }
  } // ======== 区域-怪物交叉引用校验 ========


  function validateZoneMonsterRefs(configName, zones, zoneMonsters) {
    for (const zoneId of zones.zonePool) {
      const zone = zones.zones[zoneId];

      if (!zone) {
        throw new (_crd && ConfigReferenceError === void 0 ? (_reportPossibleCrUseOfConfigReferenceError({
          error: Error()
        }), ConfigReferenceError) : ConfigReferenceError)(configName, 'zonePool', `zone '${zoneId}' not found in zones`);
      }

      for (const monsterId of zone.monsterPool) {
        const zoneM = zoneMonsters[zoneId];

        if (!zoneM || typeof zoneM !== 'object') {
          throw new (_crd && ConfigReferenceError === void 0 ? (_reportPossibleCrUseOfConfigReferenceError({
            error: Error()
          }), ConfigReferenceError) : ConfigReferenceError)(configName, `zones.${zoneId}.monsterPool`, `zone '${zoneId}' has no monster data`);
        }

        const monsterDef = zoneM[monsterId];

        if (!monsterDef) {
          throw new (_crd && ConfigReferenceError === void 0 ? (_reportPossibleCrUseOfConfigReferenceError({
            error: Error()
          }), ConfigReferenceError) : ConfigReferenceError)(configName, `zones.${zoneId}.monsterPool`, `monster '${monsterId}' not found in zone '${zoneId}'`);
        }
      }
    }
  }

  function _reportPossibleCrUseOfConfigMetadata(extras) {
    _reporterNs.report("ConfigMetadata", "./ConfigTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfConfigValidationError(extras) {
    _reporterNs.report("ConfigValidationError", "./ConfigError", _context.meta, extras);
  }

  function _reportPossibleCrUseOfConfigReferenceError(extras) {
    _reporterNs.report("ConfigReferenceError", "./ConfigError", _context.meta, extras);
  }

  _export({
    validateMetadata: validateMetadata,
    validateNonEmptyString: validateNonEmptyString,
    validatePositiveNumber: validatePositiveNumber,
    validateNumberRange: validateNumberRange,
    validateBattleData: validateBattleData,
    validateZoneMonsterRefs: validateZoneMonsterRefs
  });

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      ConfigValidationError = _unresolved_2.ConfigValidationError;
      ConfigReferenceError = _unresolved_2.ConfigReferenceError;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "b851cKgnvVP5Lx63hU51Yfw", "ConfigSchemas", undefined);
      /**
       * ConfigSchemas - 配置校验规则
       *
       * 每个配置表的基本校验规则，在 ConfigService.loadAll() 时执行
       * 按需扩展更细粒度的字段校验
       */


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=36b9886e888fd5c28e9feb4452092c5feba4c60c.js.map