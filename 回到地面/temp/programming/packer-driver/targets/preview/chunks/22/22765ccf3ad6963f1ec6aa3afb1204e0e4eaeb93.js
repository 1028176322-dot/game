System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, Logger, _crd, LogLevel, LOG_LEVEL_RANK, DEFAULT_CHANNELS, LEVEL_TAG;

  _export("Logger", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "3f9db+IZyJPJ4ydiiQWXbCs", "Logger", undefined);

      // assets/scripts/core/Logger.ts — D0-4 (§5.4)
      // Independent categorized logging system. Pure TS, no `cc` import.
      // Replaces scattered console.log across systems via ctx.get("ILogger").
      _export("LogLevel", LogLevel = /*#__PURE__*/function (LogLevel) {
        LogLevel[LogLevel["Debug"] = 0] = "Debug";
        LogLevel[LogLevel["Info"] = 1] = "Info";
        LogLevel[LogLevel["Warn"] = 2] = "Warn";
        LogLevel[LogLevel["Error"] = 3] = "Error";
        return LogLevel;
      }({}));

      LOG_LEVEL_RANK = {
        [LogLevel.Debug]: 0,
        [LogLevel.Info]: 1,
        [LogLevel.Warn]: 2,
        [LogLevel.Error]: 3
      };
      DEFAULT_CHANNELS = ["battle", "ai", "scene", "physics", "asset", "ui", "audio"];
      LEVEL_TAG = {
        [LogLevel.Debug]: "debug",
        [LogLevel.Info]: "info",
        [LogLevel.Warn]: "warn",
        [LogLevel.Error]: "error"
      }; // Contract for the categorized logger (§5.4). Lets consumers depend on the
      // interface rather than the concrete Logger class.

      _export("Logger", Logger = class Logger {
        constructor(isDev, channelLevels, sink) {
          if (isDev === void 0) {
            isDev = true;
          }

          this.sink = void 0;
          this.levels = new Map();
          this.channels = new Map();
          this.sink = sink != null ? sink : line => console.log(line);
          var defaultLevel = isDev ? LogLevel.Debug : LogLevel.Error;

          for (var _name of DEFAULT_CHANNELS) {
            var _channelLevels$_name;

            this.levels.set(_name, (_channelLevels$_name = channelLevels == null ? void 0 : channelLevels[_name]) != null ? _channelLevels$_name : defaultLevel);
            this.channels.set(_name, this.makeChannel(_name));
          }
        }

        channel(name) {
          var ch = this.channels.get(name);

          if (!ch) {
            throw new Error("Unknown log channel: " + name);
          }

          return ch;
        }

        makeChannel(name) {
          var emit = (level, msg, meta) => {
            var _this$levels$get;

            var threshold = (_this$levels$get = this.levels.get(name)) != null ? _this$levels$get : LogLevel.Debug;

            if (LOG_LEVEL_RANK[level] < LOG_LEVEL_RANK[threshold]) {
              return;
            }

            var time = new Date().toISOString();
            var metaStr = meta !== undefined ? " " + JSON.stringify(meta) : "";
            this.sink("[" + time + "][" + name + "][" + LEVEL_TAG[level] + "] " + msg + metaStr);
          };

          return {
            debug: (m, meta) => emit(LogLevel.Debug, m, meta),
            info: (m, meta) => emit(LogLevel.Info, m, meta),
            warn: (m, meta) => emit(LogLevel.Warn, m, meta),
            error: (m, meta) => emit(LogLevel.Error, m, meta)
          };
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=22765ccf3ad6963f1ec6aa3afb1204e0e4eaeb93.js.map