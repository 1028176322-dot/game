System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, eventBus, RewardService, _crd;

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEquipmentSystem(extras) {
    _reporterNs.report("EquipmentSystem", "../battle/EquipmentSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfItemSystem(extras) {
    _reporterNs.report("ItemSystem", "../battle/ItemSystem", _context.meta, extras);
  }

  _export("RewardService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      eventBus = _unresolved_2.eventBus;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "b3725cDuQRIT7RMoUO6BqkZ", "RewardService", undefined);
      /**
       * RewardService - 房间清除奖励
       *
       * 职责:
       * 1. 战斗胜利后生成装备掉落
       * 2. 战斗胜利后生成道具掉落
       *
       * Phase 4: 从 DungeonSceneController 拆分
       */


      _export("RewardService", RewardService = class RewardService {
        constructor(_equipmentSystem, _itemSystem) {
          this._equipmentSystem = _equipmentSystem;
          this._itemSystem = _itemSystem;
        }
        /** 发放房间清除奖励 */


        grantRoomClearRewards(roomType) {
          this._dropEquipment(roomType);

          this._dropItems(roomType);
        }

        _dropEquipment(roomType) {
          if (!this._equipmentSystem) return;

          var drops = this._equipmentSystem.generateDrops(roomType, 1);

          for (var drop of drops) {
            if (drop) {
              var autoPickup = this._equipmentSystem.pickupToBackpack(drop);

              if (autoPickup) {
                console.log("[\u88C5\u5907] \u62FE\u53D6: " + drop.name);
                (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                  error: Error()
                }), eventBus) : eventBus).emit('equip:picked_up', drop);
              }
            }
          }
        }

        _dropItems(roomType) {
          if (!this._itemSystem) return;

          this._itemSystem.tryDrop(roomType);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=43cc52a91c4fa3d5347675c71917c846cbc0ab51.js.map