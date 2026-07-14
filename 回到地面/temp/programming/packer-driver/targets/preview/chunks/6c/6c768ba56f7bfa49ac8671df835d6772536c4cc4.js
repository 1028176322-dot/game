System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, ConstantsRoomType, _crd;

  /**
   * Map a routing node type to the legacy Constants.RoomType.
   * `start` returns null (no room event for the entry node).
   */
  function toLegacyRoomType(type) {
    switch (type) {
      case 'start':
        return null;
      // no room event for start node

      case 'combat':
        return (_crd && ConstantsRoomType === void 0 ? (_reportPossibleCrUseOfConstantsRoomType({
          error: Error()
        }), ConstantsRoomType) : ConstantsRoomType).Normal;

      case 'elite':
        return (_crd && ConstantsRoomType === void 0 ? (_reportPossibleCrUseOfConstantsRoomType({
          error: Error()
        }), ConstantsRoomType) : ConstantsRoomType).Elite;

      case 'boss':
        return (_crd && ConstantsRoomType === void 0 ? (_reportPossibleCrUseOfConstantsRoomType({
          error: Error()
        }), ConstantsRoomType) : ConstantsRoomType).Boss;

      case 'treasure':
        return (_crd && ConstantsRoomType === void 0 ? (_reportPossibleCrUseOfConstantsRoomType({
          error: Error()
        }), ConstantsRoomType) : ConstantsRoomType).Treasure;

      case 'shop':
        return (_crd && ConstantsRoomType === void 0 ? (_reportPossibleCrUseOfConstantsRoomType({
          error: Error()
        }), ConstantsRoomType) : ConstantsRoomType).Shop;

      case 'event':
        return (_crd && ConstantsRoomType === void 0 ? (_reportPossibleCrUseOfConstantsRoomType({
          error: Error()
        }), ConstantsRoomType) : ConstantsRoomType).Event;

      case 'upgrade':
        return (_crd && ConstantsRoomType === void 0 ? (_reportPossibleCrUseOfConstantsRoomType({
          error: Error()
        }), ConstantsRoomType) : ConstantsRoomType).Upgrade;

      case 'rest':
        return (_crd && ConstantsRoomType === void 0 ? (_reportPossibleCrUseOfConstantsRoomType({
          error: Error()
        }), ConstantsRoomType) : ConstantsRoomType).Rest;
      // legacy Healing also maps here

      default:
        return null;
    }
  }
  /**
   * Map a legacy Constants.RoomType back to a routing node type.
   * `Healing` and `Rest` both collapse to `rest`; null -> `start`.
   */


  function fromLegacyRoomType(rt) {
    if (rt === null) return 'start';

    switch (rt) {
      case (_crd && ConstantsRoomType === void 0 ? (_reportPossibleCrUseOfConstantsRoomType({
        error: Error()
      }), ConstantsRoomType) : ConstantsRoomType).Normal:
        return 'combat';

      case (_crd && ConstantsRoomType === void 0 ? (_reportPossibleCrUseOfConstantsRoomType({
        error: Error()
      }), ConstantsRoomType) : ConstantsRoomType).Elite:
        return 'elite';

      case (_crd && ConstantsRoomType === void 0 ? (_reportPossibleCrUseOfConstantsRoomType({
        error: Error()
      }), ConstantsRoomType) : ConstantsRoomType).Boss:
        return 'boss';

      case (_crd && ConstantsRoomType === void 0 ? (_reportPossibleCrUseOfConstantsRoomType({
        error: Error()
      }), ConstantsRoomType) : ConstantsRoomType).Treasure:
        return 'treasure';

      case (_crd && ConstantsRoomType === void 0 ? (_reportPossibleCrUseOfConstantsRoomType({
        error: Error()
      }), ConstantsRoomType) : ConstantsRoomType).Shop:
        return 'shop';

      case (_crd && ConstantsRoomType === void 0 ? (_reportPossibleCrUseOfConstantsRoomType({
        error: Error()
      }), ConstantsRoomType) : ConstantsRoomType).Event:
        return 'event';

      case (_crd && ConstantsRoomType === void 0 ? (_reportPossibleCrUseOfConstantsRoomType({
        error: Error()
      }), ConstantsRoomType) : ConstantsRoomType).Upgrade:
        return 'upgrade';

      case (_crd && ConstantsRoomType === void 0 ? (_reportPossibleCrUseOfConstantsRoomType({
        error: Error()
      }), ConstantsRoomType) : ConstantsRoomType).Healing:
      case (_crd && ConstantsRoomType === void 0 ? (_reportPossibleCrUseOfConstantsRoomType({
        error: Error()
      }), ConstantsRoomType) : ConstantsRoomType).Rest:
        return 'rest';

      default:
        return 'combat';
    }
  }

  function _reportPossibleCrUseOfConstantsRoomType(extras) {
    _reporterNs.report("ConstantsRoomType", "../../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRouteNodeType(extras) {
    _reporterNs.report("RouteNodeType", "../../core/save/RouteSaveTypes", _context.meta, extras);
  }

  _export({
    toLegacyRoomType: toLegacyRoomType,
    fromLegacyRoomType: fromLegacyRoomType
  });

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      ConstantsRoomType = _unresolved_2.RoomType;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ed2fczOOLNKkLeNo5VElcaC", "RouteNodeTypeAdapter", undefined); // assets/scripts/dungeon/route/RouteNodeTypeAdapter.ts
      //
      // Bridge between the new routing-layer type (RouteNodeType) and the legacy
      // room type (Constants.RoomType). `start` has no legacy room -> returns null.
      //
      // Path note: from dungeon/route/, `../../` reaches assets/scripts/.
      //   ../../core/Constants        -> assets/scripts/core/Constants
      //   ../../core/save/RouteSaveTypes -> assets/scripts/core/save/RouteSaveTypes
      //
      // Authoritative spec: GDD v0.4.4 §6.2.


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=6c768ba56f7bfa49ac8671df835d6772536c4cc4.js.map