System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, ConfigLoadError, ConfigValidationError, ConfigReferenceError, _crd;

  _export({
    ConfigLoadError: void 0,
    ConfigValidationError: void 0,
    ConfigReferenceError: void 0
  });

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "cd87edFIqxEFptrnvfeBe71", "ConfigError", undefined);

      /**
       * ConfigError - 配置系统专用错误类型
       * 
       * 职责:
       * 1. 区分加载失败 / 校验失败 / 引用缺失三种错误
       * 2. 每个错误携带配置文件名和具体原因
       */
      _export("ConfigLoadError", ConfigLoadError = class ConfigLoadError extends Error {
        constructor(configName, message, innerError) {
          super(`[Config] ${configName}: ${message}`);
          this.configName = configName;
          this.innerError = innerError;
          this.name = 'ConfigLoadError';
        }

      });

      _export("ConfigValidationError", ConfigValidationError = class ConfigValidationError extends Error {
        constructor(configName, field, message) {
          super(`[Config] ${configName}.${field}: ${message}`);
          this.configName = configName;
          this.field = field;
          this.name = 'ConfigValidationError';
        }

      });

      _export("ConfigReferenceError", ConfigReferenceError = class ConfigReferenceError extends Error {
        constructor(sourceConfig, sourceField, missingRef) {
          super(`[Config] ${sourceConfig}.${sourceField}: missing reference '${missingRef}'`);
          this.sourceConfig = sourceConfig;
          this.sourceField = sourceField;
          this.missingRef = missingRef;
          this.name = 'ConfigReferenceError';
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=454576a29ac8e4414185c16a2ef0d3f96bd53627.js.map