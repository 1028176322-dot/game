System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, eventBus, PlayerDataManager, CHARACTER_LIST, SkillSlot, CharacterStartService, _crd;

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlayerDataManager(extras) {
    _reporterNs.report("PlayerDataManager", "../core/PlayerDataManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCHARACTER_LIST(extras) {
    _reporterNs.report("CHARACTER_LIST", "../core/PlayerDataManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSkillSystem(extras) {
    _reporterNs.report("SkillSystem", "../battle/SkillSystem", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSkillSlot(extras) {
    _reporterNs.report("SkillSlot", "../battle/SkillSystem", _context.meta, extras);
  }

  _export("CharacterStartService", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      eventBus = _unresolved_2.eventBus;
    }, function (_unresolved_3) {
      PlayerDataManager = _unresolved_3.PlayerDataManager;
      CHARACTER_LIST = _unresolved_3.CHARACTER_LIST;
    }, function (_unresolved_4) {
      SkillSlot = _unresolved_4.SkillSlot;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "f300ed+vc9PD4H+Y1vYUG4D", "CharacterStartService", undefined);
      /**
       * CharacterStartService - 角色初始能力应用
       *
       * 职责:
       * 1. 根据选中的角色应用初始能力
       * 2. 为角色装备初始技能
       *
       * Phase 4: 从 DungeonSceneController 拆分
       */


      _export("CharacterStartService", CharacterStartService = class CharacterStartService {
        constructor(_skillSystem) {
          this._skillSystem = _skillSystem;
        }
        /** 应用选中角色的初始能力 + 初始技能 */


        applySelectedCharacter() {
          if (!this._skillSystem) return;
          var pdm = (_crd && PlayerDataManager === void 0 ? (_reportPossibleCrUseOfPlayerDataManager({
            error: Error()
          }), PlayerDataManager) : PlayerDataManager).getInstance();
          var charId = pdm.selectedCharacter;
          var charDef = (_crd && CHARACTER_LIST === void 0 ? (_reportPossibleCrUseOfCHARACTER_LIST({
            error: Error()
          }), CHARACTER_LIST) : CHARACTER_LIST).find(c => c.id === charId);
          if (!charDef) return; // 触发初始能力

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('upgrade:selected', {
            id: charDef.initialAbility,
            type: 'ability'
          }); // 装备初始技能

          this._skillSystem.equipSkill((_crd && SkillSlot === void 0 ? (_reportPossibleCrUseOfSkillSlot({
            error: Error()
          }), SkillSlot) : SkillSlot).ActiveRight, {
            id: charDef.initialSkill,
            name: charDef.name + '初始技',
            cd: 5.0,
            duration: 0,
            cooldownRemaining: 0,
            isActive: true,
            isRelic: false
          });
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=f0edd7ff2a2bc1069924eb42c4e665a77c2dd708.js.map