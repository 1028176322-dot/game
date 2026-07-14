System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, _crd;

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "0a048kvpkZBZJrJiFWzVi0v", "ConfigTypes", undefined);
      /**
       * ConfigTypes - 配置表类型定义
       *
       * 对应 assets/resources/config/*.json 的实际结构
       * 所有 JSON 格式: { metadata: {...}, ...字段... }
       * 不做 { metadata, data } 包装，直接使用根级结构
       */
      // ======== 通用 ========
      // ======== 战斗配置 (battle.json) ========
      // ======== 玩家配置 (player.json) ========
      // ======== 怪物配置 (monsters.json) ========
      // ======== 区域配置 (zones.json) ========
      // ======== 其他配置（简化类型，按需求扩展） ========
      // ======== 全配置映射表 ========


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=45c843587e067c34fde9f6a5518e526339e58623.js.map