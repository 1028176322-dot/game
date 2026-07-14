System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, RunRng, EventSystem, eventBus, _crd, EVENT_SCENES;

  function _reportPossibleCrUseOfIPlayerAgent(extras) {
    _reporterNs.report("IPlayerAgent", "./IPlayerAgent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRunRng(extras) {
    _reporterNs.report("RunRng", "../core/rng/RunRng", _context.meta, extras);
  }

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  _export("EventSystem", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      RunRng = _unresolved_2.RunRng;
    }, function (_unresolved_3) {
      eventBus = _unresolved_3.eventBus;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "9ce82eh/CJF2JqG0ZIHAgcu", "EventSystem", undefined);
      /**
       * EventSystem - 事件系统 (Phase 3, M3.4)
       * 
       * 事件房内 2 选 1 的决策系统
       * 8 种场景 × 6 种状态检测 × 12 种后果
       * 状态匹配生成合理的 A/B 选项
       */


      // ======== 类型定义 ========
      // ======== 事件场景定义 ========
      EVENT_SCENES = [{
        id: 'broken_altar',
        name: '破碎祭坛',
        weight: 20,
        description: '一座破损的献祭台，台面上刻着古老的符文，周围散落着骨骸和金币',
        specialConditions: [{
          check: 'hp_low',
          optionA: {
            label: '献祭',
            description: '消耗 3 HP 换取 8 金币',
            consequences: [{
              type: 'damage',
              value: 3
            }, {
              type: 'gold_gain',
              value: 8
            }]
          },
          optionB: {
            label: '祈祷',
            description: '消耗 5 金币恢复 6 HP',
            consequences: [{
              type: 'gold_loss',
              value: 5
            }, {
              type: 'heal',
              value: 6
            }]
          }
        }]
      }, {
        id: 'glowing_crystal',
        name: '发光水晶',
        weight: 18,
        description: '墙壁上镶嵌着一颗脉动的能量水晶，散发出不稳定的光芒',
        specialConditions: [{
          check: 'hp_low',
          optionA: {
            label: '触碰',
            description: '触碰水晶，回复 8 HP',
            consequences: [{
              type: 'heal',
              value: 8
            }]
          },
          optionB: {
            label: '砸碎',
            description: '砸碎水晶获得 10 金币，但怪物攻击+1',
            consequences: [{
              type: 'gold_gain',
              value: 10
            }, {
              type: 'debuff',
              value: 1,
              duration: 1
            }]
          }
        }, {
          check: 'has_fire',
          optionA: {
            label: '共鸣',
            description: '火焰共鸣，HP 全满，但失去火焰附魔',
            consequences: [{
              type: 'heal',
              value: 999
            }]
          },
          optionB: {
            label: '灌注',
            description: '灌注火焰，下一房怪物全灼烧',
            consequences: [{
              type: 'weaken_next',
              value: 3
            }]
          }
        }]
      }, {
        id: 'ancient_statue',
        name: '古代雕像',
        weight: 15,
        description: '一尊持剑的战士雕像，剑刃上刻着一段褪色的铭文',
        specialConditions: [{
          check: 'has_key',
          optionA: {
            label: '献祭钥匙',
            description: '用钥匙开启雕像底座，获得随机遗物',
            consequences: [{
              type: 'key_loss',
              value: 1
            }, {
              type: 'relic_gain',
              value: 1
            }]
          },
          optionB: {
            label: '检查',
            description: '仔细检查雕像，发现 5 金币',
            consequences: [{
              type: 'gold_gain',
              value: 5
            }]
          }
        }]
      }, {
        id: 'twisted_portal',
        name: '扭曲传送门',
        weight: 14,
        description: '空气扭曲着形成一个旋转的次元裂隙，发出低沉的嗡鸣声',
        specialConditions: [{
          check: 'many_kills',
          optionA: {
            label: '进入',
            description: '跳过下一场战斗，直接到下一房间',
            consequences: [{
              type: 'nothing',
              value: 0
            }]
          },
          optionB: {
            label: '摧毁',
            description: '摧毁传送门，获得 10 金币',
            consequences: [{
              type: 'gold_gain',
              value: 10
            }]
          }
        }]
      }, {
        id: 'magic_well',
        name: '魔法井',
        weight: 13,
        description: '一口深不见底的蓝色井口，水面泛着微弱的荧光'
      }, {
        id: 'mysterious_merchant',
        name: '神秘商人',
        weight: 10,
        description: '一个兜帽遮面的流浪商人蹲在角落，面前摆着几个发光的瓶子',
        specialConditions: [{
          check: 'gold_rich',
          optionA: {
            label: '高阶药水',
            description: '20 金币换取 HP 全满 + ATK+2',
            consequences: [{
              type: 'gold_loss',
              value: 20
            }, {
              type: 'heal',
              value: 999
            }, {
              type: 'buff',
              value: 2,
              duration: 1
            }]
          },
          optionB: {
            label: '幸运符',
            description: '15 金币换取暴击率 +15%',
            consequences: [{
              type: 'gold_loss',
              value: 15
            }, {
              type: 'buff',
              value: 15,
              duration: 1
            }]
          }
        }]
      }, {
        id: 'trap_hallway',
        name: '陷阱走廊',
        weight: 5,
        description: '走廊两侧墙壁布满箭孔，地板上能看到压力板的痕迹'
      }, {
        id: 'dormant_volcano',
        name: '休眠火山',
        weight: 5,
        description: '地面裂开一道缝隙，岩浆在下方缓慢流动，散发着灼热的空气'
      }];

      _export("EventSystem", EventSystem = class EventSystem {
        constructor() {
          this._player = null;
          this._lastEventFloor = 0;
        }

        // 上次触发稀有事件的层数
        init(player) {
          this._player = player;
        }
        /** 生成一个随机事件 */


        generateEvent(currentFloor, zoneId) {
          const scene = this._pickScene();

          const description = this._buildDescription(scene);

          const options = this._generateOptions(scene);

          return {
            scene,
            description,
            optionA: options.optionA,
            optionB: options.optionB
          };
        }
        /** 按权重随机选择场景 */


        _pickScene() {
          const rng = (_crd && RunRng === void 0 ? (_reportPossibleCrUseOfRunRng({
            error: Error()
          }), RunRng) : RunRng).instance.fork('event:pickScene');
          const totalWeight = EVENT_SCENES.reduce((s, sc) => s + sc.weight, 0);
          let roll = rng.next() * totalWeight;

          for (const scene of EVENT_SCENES) {
            roll -= scene.weight;
            if (roll <= 0) return scene;
          }

          return EVENT_SCENES[0];
        }
        /** 构建场景描述（加玩家状态附着） */


        _buildDescription(scene) {
          return scene.description;
        }
        /** 生成 A/B 选项 */


        _generateOptions(scene) {
          // 尝试匹配特殊条件
          if (scene.specialConditions && this._player) {
            for (const cond of scene.specialConditions) {
              if (this._checkCondition(cond.check)) {
                return {
                  optionA: cond.optionA,
                  optionB: cond.optionB
                };
              }
            }
          } // 默认通用选项


          return this._getDefaultOptions(scene);
        }
        /** 检测玩家状态条件 */


        _checkCondition(check) {
          if (!this._player) return false;

          const stats = this._player.stats.getFinalStats();

          const hpRatio = stats.maxHP > 0 ? this._player.currentHP / stats.maxHP : 0;

          switch (check) {
            case 'hp_low':
              return hpRatio < 0.3;

            case 'hp_mid':
              return hpRatio >= 0.3 && hpRatio <= 0.7;

            case 'hp_high':
              return hpRatio > 0.7;

            case 'gold_rich':
              return true;
            // 实际检测由 isAvailable 处理

            case 'gold_poor':
              return true;

            case 'has_key':
              return true;
            // TODO: 钥匙系统

            case 'no_key':
              return true;

            case 'many_kills':
              return true;

            case 'few_kills':
              return true;

            case 'floor_shallow':
              return true;

            case 'floor_deep':
              return true;

            case 'has_fire':
              return true;
            // TODO: 元素附魔检测

            case 'has_frost':
              return true;

            default:
              return false;
          }
        }
        /** 默认选项（通用选项） */


        _getDefaultOptions(scene) {
          const defaultOptions = [{
            labelA: '献祭',
            descA: '消耗 3~5 HP 换 6~10 金币',
            consA: [{
              type: 'damage',
              value: 4
            }, {
              type: 'gold_gain',
              value: 8
            }],
            labelB: '祈祷',
            descB: '消耗 5~8 金币回 5~10 HP',
            consB: [{
              type: 'gold_loss',
              value: 6
            }, {
              type: 'heal',
              value: 8
            }]
          }, {
            labelA: '调查',
            descA: '搜索房间，找到 3 金币',
            consA: [{
              type: 'gold_gain',
              value: 3
            }],
            labelB: '休息',
            descB: '回复 5 HP',
            consB: [{
              type: 'heal',
              value: 5
            }]
          }, {
            labelA: '冒险',
            descA: '尝试打开隐藏机关，可能回血或受伤',
            consA: [{
              type: 'heal',
              value: 8
            }],
            labelB: '谨慎',
            descB: '绕道而行，无事发生',
            consB: [{
              type: 'nothing',
              value: 0
            }]
          }];
          const defaultRng = (_crd && RunRng === void 0 ? (_reportPossibleCrUseOfRunRng({
            error: Error()
          }), RunRng) : RunRng).instance.fork('event:defaultOptions');
          const pick = defaultOptions[defaultRng.int(0, defaultOptions.length - 1)];
          return {
            optionA: {
              label: pick.labelA,
              description: pick.descA,
              consequences: pick.consA
            },
            optionB: {
              label: pick.labelB,
              description: pick.descB,
              consequences: pick.consB
            }
          };
        }
        /** 应用事件后果 */


        applyConsequence(consequence) {
          var _consequence$duration, _consequence$duration2;

          if (!this._player) return;

          switch (consequence.type) {
            case 'heal':
              if (consequence.value >= 999) {
                // 全满
                const stats = this._player.stats.getFinalStats();

                this._player.heal(stats.maxHP);
              } else {
                this._player.heal(consequence.value);
              }

              break;

            case 'damage':
              this._player.takeDamage(consequence.value, false);

              break;

            case 'gold_gain':
              (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                error: Error()
              }), eventBus) : eventBus).emit('gold:change', consequence.value);
              break;

            case 'gold_loss':
              (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                error: Error()
              }), eventBus) : eventBus).emit('gold:change', -consequence.value);
              break;

            case 'key_gain':
              (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                error: Error()
              }), eventBus) : eventBus).emit('key:change', consequence.value);
              break;

            case 'key_loss':
              (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                error: Error()
              }), eventBus) : eventBus).emit('key:change', -consequence.value);
              break;

            case 'buff':
              // 临时 Buff
              (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                error: Error()
              }), eventBus) : eventBus).emit('buff:apply', {
                stat: 'atk',
                value: consequence.value,
                duration: (_consequence$duration = consequence.duration) != null ? _consequence$duration : 1
              });
              break;

            case 'debuff':
              (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                error: Error()
              }), eventBus) : eventBus).emit('debuff:apply', {
                stat: 'monsterAtk',
                value: consequence.value,
                duration: (_consequence$duration2 = consequence.duration) != null ? _consequence$duration2 : 1
              });
              break;

            case 'weaken_next':
              (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                error: Error()
              }), eventBus) : eventBus).emit('battle:next_weaken', consequence.value);
              break;

            case 'strengthen_next':
              (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                error: Error()
              }), eventBus) : eventBus).emit('battle:next_strengthen', consequence.value);
              break;

            case 'relic_gain':
              (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                error: Error()
              }), eventBus) : eventBus).emit('relic:random_grant');
              break;

            case 'nothing':
            default:
              // 无事发生
              break;
          }
        }

      }); // 需要导入 eventBus


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=f6d6648fde2acc7cb650f9b1265774381f466058.js.map