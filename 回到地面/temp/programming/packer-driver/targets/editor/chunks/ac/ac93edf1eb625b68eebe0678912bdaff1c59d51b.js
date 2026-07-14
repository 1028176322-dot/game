System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _crd, _textData;

  /**
   * 加载文本配置
   * 由 ConfigManager 在启动时调用
   */
  function loadTextConfig(data) {
    _textData = data != null ? data : null;
  }
  /**
   * 检查文本键是否存在
   * @param key 点号分隔的键路径，如 "ui.hp"
   */


  function hasTextKey(key) {
    if (!_textData) return false;
    const parts = key.split('.');
    let current = _textData;

    for (const part of parts) {
      if (!current || typeof current !== 'object' || !(part in current)) {
        return false;
      }

      current = current[part];
    }

    return typeof current === 'string';
  }
  /**
   * 文本模板函数
   * @param key 点号分隔的键路径，如 "ui.hp"、"zone.forest"
   * @param params 可选模板变量，如 { cur: 80, max: 100 }
   * @returns 渲染后的文本字符串
   */


  function T(key, params) {
    if (!_textData) {
      console.warn(`[TextManager] text config not loaded: ${key}`);
      return key;
    } // 按点号路径逐层查找


    const parts = key.split('.');
    let current = _textData;

    for (const part of parts) {
      if (!current || typeof current !== 'object') {
        console.warn(`[TextManager] missing key: ${key}`);
        return key;
      }

      current = current[part];
    }

    if (typeof current !== 'string') {
      console.warn(`[TextManager] key is not a string: ${key}`);
      return key;
    } // 模板变量替换 {varName}


    if (params) {
      return current.replace(/\{(\w+)\}/g, (raw, name) => {
        const val = params[name];

        if (val === undefined || val === null) {
          console.warn(`[TextManager] missing param "${name}" for key: ${key}`);
          return raw;
        }

        return String(val);
      });
    }

    return current;
  }
  /**
   * 获取房间类型短名（地图用）
   */


  function getRoomShortName(roomType) {
    const map = {
      'combat': T('room.combat'),
      'treasure': T('room.treasure'),
      'healing': T('room.healing'),
      'shop': T('room.shop'),
      'upgrade': T('room.upgrade'),
      'event': T('room.event'),
      'boss': T('room.boss'),
      'start': T('room.start')
    };
    return map[roomType] || T('room.unknown');
  }

  _export({
    loadTextConfig: loadTextConfig,
    hasTextKey: hasTextKey,
    T: T,
    getRoomShortName: getRoomShortName
  });

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "81a16IInQdKqZo0LkaoBCT3", "TextManager", undefined);

      /**
       * TextManager - 全局文本管理器
       * 
       * 职责：
       *   从 text.json 加载所有玩家可见文本
       *   提供 T(key) 模板函数，支持变量替换
       *   所有 UI 代码中的硬编码文本必须迁移至此
       * 
       * 使用方式：
       *   T('ui.hp', { cur: 80, max: 100 })        -> "生命: 80/100"
       *   T('ui.defeat', { count: 5 })              -> "击败: 5"
       *   T('zone.forest')                           -> "翠绿森林"
       *   hasTextKey('ui.shop.title')                -> true / false
       * 
       * 微信审核优势：
       *   所有玩家可见文本集中在 text.json
       *   检查敏感词只需搜索这一个文件
       *   修改文本无需改动代码
       */
      // 文本数据缓存
      __checkObsolete__(['_decorator']);

      _textData = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=ac93edf1eb625b68eebe0678912bdaff1c59d51b.js.map