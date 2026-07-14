System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, Rng, RunRng, _crd;

  function _reportPossibleCrUseOfRng(extras) {
    _reporterNs.report("Rng", "./Rng", _context.meta, extras);
  }

  _export("RunRng", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      Rng = _unresolved_2.Rng;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ef6348gzX5JI4vZfj0Ohyyf", "RunRng", undefined);
      /**
       * RunRng - 一局游戏全局 RNG 管理器
       *
       * 职责:
       * 1. 管理整局游戏的根 seed
       * 2. 通过 fork(scope) 为不同模块分配独立子 Rng
       * 3. 同一 seed 重复同一局时，所有 fork 结果一致
       *
       * 使用方式:
       *   // 开局（通常在 DungeonSceneController 或 RunCoordinator）
       *   RunRng.instance.startRun(Date.now() & 0x7fffffff);
       *
       *   // 各模块获取自己的独立 RNG
       *   const rng = RunRng.instance.fork('dungeon:roomGen');
       *   const selected = rng.pick(candidates);
       *
       *   // 需要更细粒度隔离时追加 label
       *   const monsterRng = RunRng.instance.fork('dungeon:monster:forest');
       *   const dropRng = RunRng.instance.fork('equipment:drop');
       */


      _export("RunRng", RunRng = class RunRng {
        constructor() {
          this._root = new (_crd && Rng === void 0 ? (_reportPossibleCrUseOfRng({
            error: Error()
          }), Rng) : Rng)(1);
          this._seed = 1;
        }

        static get instance() {
          if (!this._instance) this._instance = new RunRng();
          return this._instance;
        }
        /** 开局：设置根 seed */


        startRun(seed) {
          this._seed = seed >>> 0;
          this._root = new (_crd && Rng === void 0 ? (_reportPossibleCrUseOfRng({
            error: Error()
          }), Rng) : Rng)(this._seed);
        }
        /** 创建指定 scope 的子 RNG（隔离各模块的随机序列） */


        fork(scope) {
          return this._root.fork(scope);
        }
        /** 获取当前 seed（用于展示/分享） */


        get seed() {
          return this._seed;
        }
        /** 重置（用于测试） */


        reset() {
          this._seed = 1;
          this._root = new (_crd && Rng === void 0 ? (_reportPossibleCrUseOfRng({
            error: Error()
          }), Rng) : Rng)(1);
        }

      });

      RunRng._instance = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=65e15b6fabfa09275675bf6d3796b1c0cb6a03eb.js.map