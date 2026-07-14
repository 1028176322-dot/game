System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, _crd;

  /**
   * Derive a node's UI view state from the runtime state. Priority:
   *   current > completed > reachable > locked.
   * Pure function — no side effects, deterministic.
   */
  function getNodeViewState(nodeId, state) {
    if (state.currentNodeId === nodeId) return 'current';
    if (state.completedNodeIds.includes(nodeId)) return 'completed';
    if (state.reachableNodeIds.includes(nodeId)) return 'reachable';
    return 'locked';
  } // v0.4.4: route combat context, pure data, provided here (not inside RoomFlowController).


  _export("getNodeViewState", getNodeViewState);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "d5d77JPr9VFa42+8zfiGJi1", "RouteSaveTypes", undefined); // assets/scripts/core/save/RouteSaveTypes.ts
      // PURE DATA ONLY: no Cocos import, no controller import.
      //
      // Single source of truth for the route-system pure data types. Both
      // `dungeon/route/` and `core/save/SaveTypes.ts` import from here, eliminating the
      // `core/save -> dungeon/route` inverted-dependency hazard (GDD v0.4.2 ③).
      //
      // Authoritative spec: docs/地牢重做_节点路线图肉鸽_设计v0.4.4.md §3 / §6 / §8.3 / §10.3.
      // §3.3 UI view state — DERIVED, never stored. Single source of truth for how a
      // node should render on the route map. Kept in the pure-data layer (no Cocos) so
      // both dungeon/route/ and a future UI layer import it from one place.


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=c14aaa2ee14000b2ec02129ff8c76c25b489e662.js.map