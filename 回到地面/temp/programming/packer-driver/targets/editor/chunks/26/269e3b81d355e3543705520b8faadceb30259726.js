System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, PlayerState, eventBus, _dec, _class, _crd, ccclass, property, SkillSlot, SkillSystem;

  function _reportPossibleCrUseOfPlayerState(extras) {
    _reporterNs.report("PlayerState", "../core/Constants", _context.meta, extras);
  }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfIPlayerAgent(extras) {
    _reporterNs.report("IPlayerAgent", "./IPlayerAgent", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
    }, function (_unresolved_2) {
      PlayerState = _unresolved_2.PlayerState;
    }, function (_unresolved_3) {
      eventBus = _unresolved_3.eventBus;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "be6e6jioI5P34lGAXWLegyi", "SkillSystem", undefined);
      /**
       * SkillSystem - 技能系统
       * 管理主动技能（2 槽位）和遗物技能（2 槽位）
       * 技能 CD、释放、状态管理
       * 技能按钮 UI 绑定由外部 UI 组件处理
       */


      __checkObsolete__(['_decorator', 'Component', 'Node']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("SkillSlot", SkillSlot = /*#__PURE__*/function (SkillSlot) {
        SkillSlot["ActiveLeft"] = "activeLeft";
        SkillSlot["ActiveRight"] = "activeRight";
        SkillSlot["RelicLeft"] = "relicLeft";
        SkillSlot["RelicRight"] = "relicRight";
        return SkillSlot;
      }({}));

      _export("SkillSystem", SkillSystem = (_dec = ccclass('SkillSystem'), _dec(_class = class SkillSystem extends Component {
        constructor(...args) {
          super(...args);
          this._skills = new Map();
          this._player = null;
        }

        onLoad() {
          // 初始化 4 个槽位
          this._skills.set(SkillSlot.ActiveLeft, null);

          this._skills.set(SkillSlot.ActiveRight, null);

          this._skills.set(SkillSlot.RelicLeft, null);

          this._skills.set(SkillSlot.RelicRight, null);
        }
        /** 初始化 */


        init(player) {
          this._player = player; // 初始赋予 2 个基础主动技能

          this.equipSkill(SkillSlot.ActiveLeft, {
            id: 'dash',
            name: '冲刺冲锋',
            cd: 5.0,
            duration: 0.3,
            cooldownRemaining: 0,
            isActive: true,
            isRelic: false
          });
          this.equipSkill(SkillSlot.ActiveRight, {
            id: 'shield',
            name: '护盾',
            cd: 6.0,
            duration: 2.0,
            cooldownRemaining: 0,
            isActive: true,
            isRelic: false
          });
        }
        /** 装备技能到指定槽位 */


        equipSkill(slot, skill) {
          this._skills.set(slot, skill);

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('skill:equipped', slot, skill);
        }
        /** 移除技能（遗物丢失时调用） */


        removeSkill(slot) {
          this._skills.set(slot, null);

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('skill:removed', slot);
        }
        /** 释放指定槽位的技能 */


        castSkill(slot) {
          const skill = this._skills.get(slot);

          if (!skill || !this._player) return false; // 检查 CD

          if (skill.cooldownRemaining > 0) return false; // 检查玩家状态

          if (this._player.state === (_crd && PlayerState === void 0 ? (_reportPossibleCrUseOfPlayerState({
            error: Error()
          }), PlayerState) : PlayerState).Dead || this._player.state === (_crd && PlayerState === void 0 ? (_reportPossibleCrUseOfPlayerState({
            error: Error()
          }), PlayerState) : PlayerState).Dodging) return false; // 执行技能效果

          switch (skill.id) {
            case 'dash':
              this._castDash(skill);

              break;

            case 'shield':
              this._castShield(skill);

              break;

            default:
              // 其他技能（遗物技能等）由外部监听 SKILL_CAST 事件处理
              (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                error: Error()
              }), eventBus) : eventBus).emit('skill:cast', slot, skill.id);
              break;
          }

          skill.cooldownRemaining = skill.cd;
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('skill:casting', slot, skill.id); // 通知 UI 更新 CD

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('skill:cooldown_start', slot, skill.cd);
          return true;
        }
        /** 冲刺冲锋：向当前面向快速位移 2 格 */


        _castDash(skill) {
          if (!this._player) return; // 具体位移逻辑由 PlayerController 处理，这里只发射事件

          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('skill:dash', this._player);
        }
        /** 护盾：2 秒内伤害减半 */


        _castShield(skill) {
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('skill:shield', this._player);
        }
        /** 获取技能数据 */


        getSkill(slot) {
          var _this$_skills$get;

          return (_this$_skills$get = this._skills.get(slot)) != null ? _this$_skills$get : null;
        }
        /** 槽位是否有技能 */


        hasSkill(slot) {
          return this._skills.get(slot) !== null;
        }
        /** 获取指定槽位 CD 剩余 */


        getCooldown(slot) {
          var _this$_skills$get$coo, _this$_skills$get2;

          return (_this$_skills$get$coo = (_this$_skills$get2 = this._skills.get(slot)) == null ? void 0 : _this$_skills$get2.cooldownRemaining) != null ? _this$_skills$get$coo : 0;
        }
        /** 获取所有非空技能（用于 UI 渲染） */


        getActiveSkills() {
          const result = [];

          for (const [slot, skill] of this._skills) {
            if (skill) {
              result.push({
                slot,
                data: skill
              });
            }
          }

          return result;
        }

        update(dt) {
          // 减少所有技能 CD
          for (const [, skill] of this._skills) {
            if (skill && skill.cooldownRemaining > 0) {
              const prev = skill.cooldownRemaining;
              skill.cooldownRemaining = Math.max(0, skill.cooldownRemaining - dt); // CD 变化超过 0.5 秒或 CD 刚结束时通知 UI

              if (Math.floor(prev * 2) !== Math.floor(skill.cooldownRemaining * 2) || skill.cooldownRemaining === 0) {// UI 更新由外部监听处理
              }
            }
          }
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=269e3b81d355e3543705520b8faadceb30259726.js.map