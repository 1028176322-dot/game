System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, instantiate, Vec3, PoolManager, _crd;

  _export("PoolManager", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      instantiate = _cc.instantiate;
      Vec3 = _cc.Vec3;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "0f640nSHfdI+6uKBRTh12sX", "PoolManager", undefined);
      /**
       * PoolManager - 对象池管理器
       * 通过对象池复用减少实例化开销，优化 Draw Call 和 GC
       * 所有对象池资源通过统一接口管理
       */


      __checkObsolete__(['Node', 'Prefab', 'instantiate', 'Vec3']);

      _export("PoolManager", PoolManager = class PoolManager {
        constructor() {
          this._pools = new Map();
        }

        static getInstance() {
          if (!PoolManager._instance) {
            PoolManager._instance = new PoolManager();
          }

          return PoolManager._instance;
        }
        /** 注册对象池（在场景初始化时调用） */


        registerPool(name, prefab, preCreate = 5, maxSize = 20) {
          if (this._pools.has(name)) {
            console.warn(`[PoolManager] 对象池 "${name}" 已存在，跳过注册`);
            return;
          }

          const pool = [];
          const entry = {
            prefab,
            pool,
            maxSize
          }; // 预创建对象

          for (let i = 0; i < preCreate; i++) {
            const node = instantiate(prefab);
            node.active = false;
            node.name = `${name}_pool_${i}`;
            pool.push(node);
          }

          this._pools.set(name, entry);
        }
        /** 从对象池获取一个对象（没有则创建） */


        get(name, parent) {
          const entry = this._pools.get(name);

          if (!entry) {
            console.warn(`[PoolManager] 对象池 "${name}" 不存在`);
            return null;
          }

          let node = null; // 找池中空闲对象

          for (let i = entry.pool.length - 1; i >= 0; i--) {
            if (!entry.pool[i].active) {
              node = entry.pool[i];
              break;
            }
          } // 池中无空闲且未达上限则创建


          if (!node && entry.pool.length < entry.maxSize) {
            node = instantiate(entry.prefab);
            node.name = `${name}_pool_${entry.pool.length}`;
            entry.pool.push(node);
          }

          if (node) {
            node.active = true;

            if (parent) {
              node.parent = parent;
            }

            node.setPosition(Vec3.ZERO);
          }

          return node;
        }
        /** 回收对象 */


        recycle(node) {
          if (!node) return;
          node.active = false;
          node.removeFromParent();
        }
        /** 清空对象池（场景切换时调用） */


        clear() {
          for (const [, entry] of this._pools) {
            for (const node of entry.pool) {
              node.destroy();
            }
          }

          this._pools.clear();
        }

      });

      PoolManager._instance = void 0;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=17e3a5da13eb7b5fed0be0ac8bfbe67889a87e99.js.map