System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, RoomType, MathUtils, ConfigManager, DAGGenerator, _crd;

  function _reportPossibleCrUseOfRoomType(extras) {
    _reporterNs.report("RoomType", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMathUtils(extras) {
    _reporterNs.report("MathUtils", "../utils/MathUtils", _context.meta, extras);
  }

  function _reportPossibleCrUseOfConfigManager(extras) {
    _reporterNs.report("ConfigManager", "../core/ConfigManager", _context.meta, extras);
  }

  _export("DAGGenerator", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      RoomType = _unresolved_2.RoomType;
    }, function (_unresolved_3) {
      MathUtils = _unresolved_3.MathUtils;
    }, function (_unresolved_4) {
      ConfigManager = _unresolved_4.ConfigManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "098f8Yo941ENbvhrrMfCkbL", "DAGGenerator", undefined);
      /**
       * @deprecated (Demo7, 2026-07-13): the node-route roguelike now uses
       * dungeon/route/NodeRouteGenerator for Spire-style maps. This DAGGenerator is
       * kept as a legacy multi-room fallback and will be removed gradually; do NOT use
       * it in the new route path.
       *
       * DAGGenerator - 地牢 DAG 生成器 (Phase 3)
       * 按种子生成有向无环图地牢地图
       * 支持区域/小关配置、Boss房标记
       */


      /** DAG 房间节点 */

      /** 生成的 DAG 地牢 */

      /** 生成选项 */
      _export("DAGGenerator", DAGGenerator = class DAGGenerator {
        /**
         * 生成地牢 DAG
         * @param seed 种子
         * @param floorNumber 楼层号
         * @param roomCount 房间数
         * @param options 区域/小关选项（可选）
         */
        static generate(seed, floorNumber, roomCount = 5, options) {
          const rand = (_crd && MathUtils === void 0 ? (_reportPossibleCrUseOfMathUtils({
            error: Error()
          }), MathUtils) : MathUtils).seededRandom(seed);
          const rooms = new Map();
          let nextId = 0;
          const isBossFloor = (options == null ? void 0 : options.isMiniBossFloor) || (options == null ? void 0 : options.isFinalBossFloor); // ======== 第 1 层：入口 ========

          const entryId = nextId++;
          rooms.set(entryId, {
            id: entryId,
            type: (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
              error: Error()
            }), RoomType) : RoomType).Normal,
            depth: 0,
            connections: [],
            parent: null,
            x: 3,
            y: 0
          }); // ======== 中间层：分支 ========

          const depthCount = isBossFloor ? Math.max(1, roomCount - 3) // Boss层：入口→战斗→强化→Boss
          : roomCount - 1; // 普通层：去掉Boss层和强化层

          let prevDepthRooms = [entryId];

          for (let depth = 1; depth <= depthCount; depth++) {
            const currentDepthRooms = [];
            const roomsThisDepth = depth === depthCount ? 1 : rand() < 0.6 ? 1 : 2;

            for (let i = 0; i < roomsThisDepth; i++) {
              const roomId = nextId++;

              const roomType = this._determineRoomType(rand, depth, depthCount, i, options);

              rooms.set(roomId, {
                id: roomId,
                type: roomType,
                depth,
                connections: [],
                parent: null,
                x: i === 0 ? 2 : 4,
                y: depth
              });

              for (const prevId of prevDepthRooms) {
                rooms.get(prevId).connections.push(roomId);
              }

              rooms.get(roomId).parent = prevDepthRooms[0];
              currentDepthRooms.push(roomId);
            }

            prevDepthRooms = currentDepthRooms;
          }

          if (isBossFloor) {
            // ======== Boss 前：强化房（Boss层强化房合并） ========
            if (prevDepthRooms.length > 0) {
              const upgradeId = nextId++;
              rooms.set(upgradeId, {
                id: upgradeId,
                type: (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
                  error: Error()
                }), RoomType) : RoomType).Upgrade,
                depth: depthCount + 1,
                connections: [],
                parent: prevDepthRooms[0],
                x: 3,
                y: depthCount + 1
              });

              for (const prevId of prevDepthRooms) {
                rooms.get(prevId).connections.push(upgradeId);
              }

              prevDepthRooms = [upgradeId];
            } // ======== 末端：Boss 房 ========


            const bossId = nextId++;
            rooms.set(bossId, {
              id: bossId,
              type: (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
                error: Error()
              }), RoomType) : RoomType).Boss,
              depth: depthCount + 2,
              connections: [],
              parent: prevDepthRooms[0],
              x: 3,
              y: depthCount + 2
            });

            if (prevDepthRooms.length > 0) {
              rooms.get(prevDepthRooms[0]).connections.push(bossId);
            }

            return {
              rooms,
              entryRoomId: entryId,
              bossRoomId: bossId,
              upgradeRoomId: prevDepthRooms[0] || entryId,
              maxDepth: depthCount + 2
            };
          } // ======== 普通层：最后一层前强化房 ========


          const upgradeId = nextId++;
          rooms.set(upgradeId, {
            id: upgradeId,
            type: (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
              error: Error()
            }), RoomType) : RoomType).Upgrade,
            depth: depthCount + 1,
            connections: [],
            parent: prevDepthRooms[0],
            x: 3,
            y: depthCount + 1
          });

          for (const prevId of prevDepthRooms) {
            rooms.get(prevId).connections.push(upgradeId);
          } // ======== 末端：Boss 房（对于非Boss层，是区域传送门） ========


          const bossId = nextId++;
          rooms.set(bossId, {
            id: bossId,
            type: (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
              error: Error()
            }), RoomType) : RoomType).Boss,
            depth: depthCount + 2,
            connections: [],
            parent: upgradeId,
            x: 3,
            y: depthCount + 2
          });
          rooms.get(upgradeId).connections.push(bossId);
          return {
            rooms,
            entryRoomId: entryId,
            bossRoomId: bossId,
            upgradeRoomId: upgradeId,
            maxDepth: depthCount + 2
          };
        }
        /** 确定房间类型（带权重，支持区域配置） */


        static _determineRoomType(rand, depth, maxDepth, branchIndex, options) {
          if (depth === maxDepth) return (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Boss; // 使用区域配置的权重

          const weights = options != null && options.zoneId ? (_crd && ConfigManager === void 0 ? (_reportPossibleCrUseOfConfigManager({
            error: Error()
          }), ConfigManager) : ConfigManager).getInstance().getRoomTypeWeights() : {
            combat: 55,
            treasure: 12,
            healing: 10,
            shop: 10,
            event: 5,
            upgrade: 8
          };
          const roll = rand() * 100; // 深度 > 2 时可以出精英房

          if (depth > 2 && roll < 8) return (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Elite; // ~8% elite

          let cumulative = 0;
          cumulative += weights.combat || 55;
          if (roll < cumulative) return (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Normal;
          cumulative += weights.treasure || 12;
          if (roll < cumulative && branchIndex === 0) return (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Treasure;
          cumulative += weights.healing || 10;
          if (roll < cumulative) return (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Healing;
          cumulative += weights.shop || 10;
          if (roll < cumulative && depth > 1) return (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Shop;
          cumulative += weights.event || 5;
          if (roll < cumulative && depth > 1) return (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Event;
          return (_crd && RoomType === void 0 ? (_reportPossibleCrUseOfRoomType({
            error: Error()
          }), RoomType) : RoomType).Normal;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=8feaac252a50360a0867b337b96d52322cb47890.js.map