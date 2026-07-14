System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, TypedEventBus, _crd;

  _export("TypedEventBus", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "0652aXdyQZMgbnrAnes0qmt", "TypedEventBus", undefined);
      /**
       * TypedEventBus - 类型安全的事件总线
       *
       * 与旧 EventBus 的区别:
       * - 事件名和参数类型由泛型约束，编译期检查
       * - 不在 emit 时检查 paused 状态（暂停由 BattleClock 控制）
       * - 支持 offTarget(target) 自动清理
       *
       * 使用方式:
       *   const bus = new TypedEventBus<GameEventMap>();
       *   bus.on('battle:victory', ({ roomId }) => { ... }, this);
       *   bus.emit('battle:victory', { roomId: 1, roomType: 'boss', isBoss: true });
       */


      _export("TypedEventBus", TypedEventBus = class TypedEventBus {
        constructor() {
          this._events = new Map();
        }

        /**
         * 注册事件监听
         * @param event 事件名
         * @param handler 处理函数
         * @param target 绑定的目标对象（用于 offTarget 自动清理）
         */
        on(event, handler, target) {
          if (!this._events.has(event)) {
            this._events.set(event, new Set());
          }

          this._events.get(event).add({
            handler,
            target,
            once: false
          });
        }
        /**
         * 一次性事件监听
         */


        once(event, handler, target) {
          if (!this._events.has(event)) {
            this._events.set(event, new Set());
          }

          this._events.get(event).add({
            handler,
            target,
            once: true
          });
        }
        /**
         * 触发事件
         */


        emit(event, payload) {
          var entries = this._events.get(event);

          if (!entries) return;
          var remove = [];

          for (var entry of entries) {
            entry.handler(payload);
            if (entry.once) remove.push(entry);
          }

          for (var _entry of remove) {
            entries.delete(_entry);
          }

          if (entries.size === 0) {
            this._events.delete(event);
          }
        }
        /**
         * 移除某个目标对象的所有监听
         */


        offTarget(target) {
          for (var [event, entries] of this._events) {
            for (var entry of [...entries]) {
              if (entry.target === target) entries.delete(entry);
            }

            if (entries.size === 0) this._events.delete(event);
          }
        }
        /**
         * 清理所有事件
         */


        clear() {
          this._events.clear();
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=19bb14ae52c2dbabbe7bcf19f97098a06f03c78d.js.map