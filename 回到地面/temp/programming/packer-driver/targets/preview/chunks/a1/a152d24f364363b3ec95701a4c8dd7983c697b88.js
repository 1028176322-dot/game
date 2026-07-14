System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, eventBus, RunRng, MutationManager, _crd, ALL_MUTATIONS, MUTATION_EXCLUSIONS;

  function _reportPossibleCrUseOfeventBus(extras) {
    _reporterNs.report("eventBus", "../core/EventBus", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRunRng(extras) {
    _reporterNs.report("RunRng", "../core/rng/RunRng", _context.meta, extras);
  }

  _export("MutationManager", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      eventBus = _unresolved_2.eventBus;
    }, function (_unresolved_3) {
      RunRng = _unresolved_3.RunRng;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "502814HRb5CsKFEdiKl7/6O", "MutationManager", undefined);
      /**
       * MutationManager - 房间变异系统 (Phase 3, M3.4)
       * 
       * 12 种房间变异，每层随机 1~2 个
       * 变异效果绑定战斗参数（攻击/防御/速度/掉落等）
       * 互斥检查 + DDA 权重修正
       */


      // ======== 变异定义 ========
      // ======== 12 种变异定义 ========
      ALL_MUTATIONS = [{
        id: 'M01',
        name: '黑暗降临',
        description: '视野缩减至 2 格，怪物视野不变',
        effect: {
          visionRange: 2
        },
        baseWeight: 15,
        floorWeightMod: f => f <= 2 ? 5 : f >= 4 ? -5 : 0,
        goodFor: '暗影斗篷',
        badFor: '远程流'
      }, {
        id: 'M02',
        name: '绯红之月',
        description: '治疗效果 -50%，汲取效果 ×2',
        effect: {
          playerHealEffect: 0.5,
          playerLifesteal: 2.0
        },
        baseWeight: 12,
        ddaWeightMod: died => died ? 10 : 0,
        goodFor: '生命吸取',
        badFor: '药水流'
      }, {
        id: 'M03',
        name: '奥术风暴',
        description: '每 3 秒全屏随机元素伤害 (3 点)',
        effect: {
          elementStorm: true
        },
        baseWeight: 10,
        floorWeightMod: f => f >= 4 ? 10 : 0,
        goodFor: '元素共鸣',
        badFor: '纯物理'
      }, {
        id: 'M04',
        name: '时空扭曲',
        description: '怪物移速 -30%，玩家攻速 +20%',
        effect: {
          monsterSpeedMod: 0.7,
          playerAttackSpeed: 1.2
        },
        baseWeight: 15,
        ddaWeightMod: died => died ? 10 : 0,
        goodFor: '所有输出流',
        badFor: '—'
      }, {
        id: 'M05',
        name: '地震',
        description: '每 5 秒地形随机变化（障碍位移）',
        effect: {
          earthquake: true
        },
        baseWeight: 8,
        goodFor: '走位好的玩家',
        badFor: '依赖地形的流派'
      }, {
        id: 'M06',
        name: '淘金热',
        description: '金币掉落 ×2，怪物 HP ×1.2',
        effect: {
          goldDropMod: 2.0,
          monsterHpMod: 1.2
        },
        baseWeight: 12,
        floorWeightMod: f => f >= 4 ? 5 : 0,
        goodFor: '贪婪指环',
        badFor: '生存困难时不敢贪'
      }, {
        id: 'M07',
        name: '虚弱诅咒',
        description: '玩家 ATK -2，每击败 1 怪永久 +1 ATK',
        effect: {
          playerAtkMod: -2
        },
        baseWeight: 10,
        ddaWeightMod: died => died ? 15 : 0,
        goodFor: '滚雪球流派',
        badFor: '前期弱的流派'
      }, {
        id: 'M08',
        name: '狂乱',
        description: '怪物 ATK+2，SPD+20%，DEF-2',
        effect: {
          monsterAtkMod: 2,
          monsterSpeedMod: 1.2,
          monsterDefMod: -2
        },
        baseWeight: 10,
        floorWeightMod: f => f >= 4 ? 5 : 0,
        goodFor: '爆发型 Build',
        badFor: '龟缩型 Build'
      }, {
        id: 'M09',
        name: '回声',
        description: '技能 CD -20%',
        effect: {
          skillCdMod: 0.8
        },
        baseWeight: 10,
        goodFor: '技能流',
        badFor: '普攻流'
      }, {
        id: 'M10',
        name: '薄雾',
        description: '穿过荆棘地板不扣血，移速 +10%',
        effect: {
          mist: true,
          playerSpeedMod: 1.1
        },
        baseWeight: 8,
        floorWeightMod: f => f <= 2 ? 5 : 0,
        ddaWeightMod: died => died ? 10 : 0,
        goodFor: '所有流派',
        badFor: '—（纯利好）'
      }, {
        id: 'M11',
        name: '倒计时',
        description: '该层限时 60 秒，超时后每秒扣 2 HP',
        effect: {
          countdown: 60
        },
        baseWeight: 5,
        floorWeightMod: f => f >= 4 ? 10 : 0,
        goodFor: '爆发速通流',
        badFor: '慢性子玩家'
      }, {
        id: 'M12',
        name: '不稳定空间',
        description: '每进入新房间，随机一个元素布满全场',
        effect: {
          unstableSpace: true
        },
        baseWeight: 5,
        floorWeightMod: f => f >= 4 ? 10 : 0,
        goodFor: '元素反应流',
        badFor: '无元素流派'
      }]; // ======== 互斥表 ========

      MUTATION_EXCLUSIONS = [['M05', 'M10'], // 地震 + 薄雾 → 玩家迷失
      ['M05', 'M11'] // 倒计时 + 地震 → 无法规划路线
      ];

      _export("MutationManager", MutationManager = class MutationManager {
        constructor() {
          this._activeMutations = [];
          this._floorNumber = 1;
          this._playerDiedRecently = false;
          this._elementStormTimer = 0;
          this._countdownTimer = 0;
          this._countdownActive = false;
        }

        /** 为新楼层生成变异 */
        generateMutation(floorNumber, playerDiedRecently) {
          if (playerDiedRecently === void 0) {
            playerDiedRecently = false;
          }

          this._floorNumber = floorNumber;
          this._playerDiedRecently = playerDiedRecently;
          this._activeMutations = []; // 选择第 1 个变异

          var first = this._pickMutation([]);

          if (!first) return [];

          this._activeMutations.push(first); // 第 2 个变异：30%~70% 概率（层数越高概率越大）


          var secondChance = floorNumber >= 5 ? 0.7 : floorNumber >= 3 ? 0.5 : 0.3;
          var mutationRng = (_crd && RunRng === void 0 ? (_reportPossibleCrUseOfRunRng({
            error: Error()
          }), RunRng) : RunRng).instance.fork("mutation:second:" + floorNumber);

          if (mutationRng.chance(secondChance)) {
            var second = this._pickMutation([first.id]);

            if (second) {
              this._activeMutations.push(second);
            }
          }

          this._applyMutations();

          return this._activeMutations;
        }
        /** 按权重选取变异（排除已选的） */


        _pickMutation(excludeIds) {
          var _weighted$mutation, _weighted;

          var candidates = ALL_MUTATIONS.filter(m => !excludeIds.includes(m.id)); // 检查互斥

          var filtered = candidates.filter(m => {
            return !this._activeMutations.some(active => {
              return MUTATION_EXCLUSIONS.some(excl => excl[0] === m.id && excl[1] === active.id || excl[1] === m.id && excl[0] === active.id);
            });
          });
          if (filtered.length === 0) return null; // 计算权重

          var weighted = filtered.map(m => {
            var weight = m.baseWeight;
            if (m.floorWeightMod) weight += m.floorWeightMod(this._floorNumber);
            if (m.ddaWeightMod) weight += m.ddaWeightMod(this._playerDiedRecently);
            return {
              mutation: m,
              weight: Math.max(1, weight)
            };
          });
          var totalWeight = weighted.reduce((s, w) => s + w.weight, 0);
          var rng = (_crd && RunRng === void 0 ? (_reportPossibleCrUseOfRunRng({
            error: Error()
          }), RunRng) : RunRng).instance.fork("mutation:pick:" + this._floorNumber);
          var roll = rng.next() * totalWeight;

          for (var w of weighted) {
            roll -= w.weight;
            if (roll <= 0) return w.mutation;
          }

          return (_weighted$mutation = (_weighted = weighted[weighted.length - 1]) == null ? void 0 : _weighted.mutation) != null ? _weighted$mutation : null;
        }
        /** 应用变异效果至战斗参数 */


        _applyMutations() {
          for (var mutation of this._activeMutations) {
            var eff = mutation.effect; // 发送参数覆盖事件

            (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
              error: Error()
            }), eventBus) : eventBus).emit('mutation:apply', {
              id: mutation.id,
              name: mutation.name,
              effect: eff
            }); // 特殊效果初始化

            if (eff.elementStorm) {
              this._elementStormTimer = 0;
            }

            if (eff.countdown && eff.countdown > 0) {
              this._countdownTimer = eff.countdown;
              this._countdownActive = true;
            }
          } // 通知 UI


          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('hud:mutations', this._activeMutations.map(m => ({
            id: m.id,
            name: m.name,
            description: m.description
          })));
        }
        /** 每帧更新（用于奥术风暴、倒计时等持续效果） */


        update(dt) {
          // 奥术风暴
          if (this._activeMutations.some(m => m.effect.elementStorm)) {
            this._elementStormTimer += dt;

            if (this._elementStormTimer >= 3.0) {
              this._elementStormTimer = 0;
              (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                error: Error()
              }), eventBus) : eventBus).emit('mutation:element_storm');
            }
          } // 倒计时


          if (this._countdownActive) {
            this._countdownTimer -= dt;
            (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
              error: Error()
            }), eventBus) : eventBus).emit('mutation:countdown', this._countdownTimer);

            if (this._countdownTimer <= 0) {
              // 超时扣血
              (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
                error: Error()
              }), eventBus) : eventBus).emit('mutation:countdown_damage');
              this._countdownTimer = 60; // 重置计时
            }
          }
        }
        /** 清除当前层变异 */


        clearMutations() {
          this._activeMutations = [];
          this._countdownActive = false;
          this._elementStormTimer = 0;
          (_crd && eventBus === void 0 ? (_reportPossibleCrUseOfeventBus({
            error: Error()
          }), eventBus) : eventBus).emit('mutation:cleared');
        }
        /** 获取当前活跃变异 */


        get activeMutations() {
          return this._activeMutations;
        }
        /** 获取所有变异定义 */


        static getAllMutations() {
          return [...ALL_MUTATIONS];
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=a152d24f364363b3ec95701a4c8dd7983c697b88.js.map