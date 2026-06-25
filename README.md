# 回到地面 (BackToGround)

实时自动攻击 · 战术 Roguelike 地牢探险

> **引擎**: Cocos Creator 3.8.8 + TypeScript
> **平台**: 微信小游戏 (IAA 纯广告变现)
> **状态**: Phase 1-2 (核心玩法 + 肉鸽系统) · 代码完成 · 36 个 TS 文件 · 9 个配置表
> **编码**: UTF-8
> **仓库**: [github.com/1028176322-dot/game](https://github.com/1028176322-dot/game)
> **分支**: `main` (稳定) / `develop` (开发) / `feature/*` (功能)

---

## 项目简介

一款**实时自动攻击**的 Roguelike 地牢探险游戏。玩家操控角色深入随机生成的地牢，角色自动攻击敌人，玩家专注于走位、翻滚闪避和技能时机的判断。每层选择强化构筑 Build，触发元素反应组合，直到倒地或触及最深处——然后"回到地面"，重头再来。

**设计支柱**: 走位决策重于手速 · 每次旅程都不同 · 短平快节奏(5-15min) · 垃圾时间也有价值

## 快速入口

| 文件 | 说明 | 版本 |
|------|------|------|
| [GDD 主设计文档](./GDD_回到地面.md) | 项目入口，全局概览 | v0.1(已同步) |
| [主体方案确定](./design/主体方案确定.md) | 所有设计决策记录 | v0.5 |
| [主体系统架构](./design/主体系统架构.md) | 5 层 17 系统完整地图 | v1.0 |
| [玩法与平衡性设计](./design/玩法与平衡性设计.md) | Build系统/资源/数值/广告 | v0.5 |
| [组合性随机性系统](./design/组合性随机性系统设计.md) | 元素反应/词缀/怪物装配/变异 | v0.5 |
| [项目约定与版权声明](./design/项目约定与版权声明.md) | 编码规范/版权规避/提灯对比 | v1.0 |
| [文件管理规范](./design/文件管理规范.md) | 文件命名/备份/版本控制 | v1.0 |
| [启动屏设计](./design/风格/启动屏设计.md) | 微信小游戏合规启动屏 | v1.0 |
| [战斗系统规格](./docs/战斗系统规格.md) | 实时自动攻击系统完整规格 | v2.0 |
| [地牢生成系统规格](./docs/地牢生成系统规格.md) | DAG 生成/房间类型/地形模板/种子 | v1.0 |
| [关卡内容设计](./docs/关卡内容设计.md) | 6大区域/27小关/33个Boss | v3.1 |
| [技能系统设计](./docs/技能系统设计.md) | 主动/核心/属性/遗物/角色5层体系 | v2.0 |
| [装备系统设计](./docs/装备系统设计.md) | 8槽位/24词缀/6套装/混合套策略 | v2.0 |
| [道具系统设计](./docs/道具系统设计.md) | 消耗品掉落/商店不售/不可带出 | v1.1 |
| [数值系统模型](./docs/数值系统模型.md) | 玩家/怪物/BOSS全链路数值 | v1.0 |
| [数据埋点方案](./docs/数据埋点方案.md) | 12 个核心事件/微信上报 | v1.0 |
| [本地存储设计](./docs/本地存储设计.md) | 存档结构(500字节)/版本迁移 | v1.0 |
| [合规审查报告](./docs/合规审查报告_微信小游戏.md) | 微信小游戏平台合规检测 | v1.0 |
| [实施路线图](./docs/实施路线图.md) | 5 阶段详细实施计划 (Phase 1-5) | v1.0 |
| [配置表规范](./docs/配置表规范.md) | 数据格式/命名/校验/环境隔离/版本管理 | v1.0 |

## 项目结构

```
回到地面/
├── assets/                    # Cocos Creator 资源目录
│   ├── scenes/                # 场景文件
│   │   ├── splash.scene       # 启动屏场景
│   │   ├── main.scene         # 主界面场景
│   │   └── dungeon.scene      # 地牢核心场景
│   └── scripts/               # TypeScript 脚本 (36 文件)
│       ├── core/               # 基础框架 (7文件: GameManager/EventBus/Config/Constants/GameConfig/Pool/PlayerData)
│       ├── battle/             # 战斗系统 (10文件: Player/Monster/AutoAttack/Skill/Battle + PlayerStats/Upgrade/Element/Equipment/Item)
│       ├── dungeon/            # 地牢系统 (4文件: Grid/DAG/Dungeon/Room)
│       ├── ui/                 # UI 层 (11文件: Splash/Main/Joystick/HUD/Skill/Map/Upgrade/Death/Equipment/Shop/Inventory)
│       └── utils/              # 工具类 (2文件: Math/WXAdapter)
│   └── resources/
│       └── config/              # 9 个系统配置表 JSON (battle/player/monsters/zones/equipment/skills/items/economy/elements)
│           └── env/             # 环境覆盖层 (dev.json/test.json/prod.json)
├── design/                    # 设计文档
├── docs/                      # 技术文档 (20+ 文件)
├── extensions/                # 编辑器扩展（可选）
├── settings/                  # 引擎设置
├── GDD_回到地面.md             # 主设计文档
├── README.md                  # 本文件
└── 目录索引.md                 # 文件索引
```

## 详细实施计划

> 完整版见 [`docs/实施路线图.md`](./docs/实施路线图.md) · 总周期预估 **10~11 周**

```
Phase 1 ─── Phase 2 ─── Phase 3 ─── Phase 4 ─── Phase 5
 3周         3周         3周         1周          2周
 │           │           │           │           │
 ├ 核心玩法   ├ 肉鸽构筑  ├ 6区域内容  ├ 广告变现  ├ 上线准备
 ├ 战斗系统  ├ Build系统 ├ 区域1-6   ├ 广告接入  ├ 软著
 ├ 地牢系统  ├ 装备+套装  ├ 33个Boss  ├ 跑马灯    ├ 自审报告
 └ 怪物AI    ├ 元素反应  ├ 事件/变异  └ 数据上报  └ 提审
             ├ 魂石商店  └ 美术资源
             └ 道具/背包
```

### Phase 1: 核心玩法 (3 周) ✅ 代码完成

**目标**: 玩家能进入游戏 → 走完 1 层地牢 → 经历至少 1 场完整战斗 → 到达强化房 → 看到结算界面

| 里程碑 | 周期 | 状态 |
|--------|------|------|
| M1.1 Cocos Creator 工程搭建 | 3 天 | ✅ 完成 |
| M1.2 启动屏 + 主界面 | 2 天 | ✅ 完成 |
| M1.3 6×6 网格 + 玩家移动 | 4 天 | ✅ 完成 |
| M1.4 自动攻击 + 怪物 AI | 5 天 | ✅ 完成 |
| M1.5 翻滚 + 主动技能 | 3 天 | ✅ 完成 |
| M1.6 地牢 DAG + 房间切换 | 4 天 | ✅ 完成 |
| M1.7 觉悟战 + 结算流程 | 2 天 | ✅ 完成 |
| **首次构建验证 (WeChat Game)** | — | ✅ 构建通过 (58s) |

### Phase 2: 肉鸽系统 (3 周) ✅ 全部 5 个 Milestone 完成 (M2.1~M2.5)

**目标**: 玩家能构筑 Build → 触发元素反应 → 装备/道具/套装收集 → 魂石商店永久成长

| 里程碑 | 周期 | 内容 | 状态 |
|--------|------|------|------|
| M2.1 Build 3 选 1 + 遗物系统 | 5 天 | 12种核心能力 + 7种属性取舍 + 16种遗物(8被动+8主动) | ✅ **完成** |
| M2.2 元素反应系统 | 3 天 | 6种元素 + 11种两两反应 + 链式反应(可达3层) | ✅ **完成** |
| M2.3 装备系统 + 词缀 + 套装 | 4 天 | 8槽位 + 12前缀/12后缀 + 6套橙色套装(2/6/8件效果) | ✅ **完成** |
| M2.4 魂石商店 + 角色解锁 | 3 天 | 5个角色(战士/弓手/刺客/法师/狂战士) + 3种天赋 | ✅ **完成** |
| M2.5 道具系统 + 背包 | 3 天 | 8种消耗品 + 5格背包 + 区域绑定掉落 + 商店修正 | ✅ **完成** |

### 全局配置化改造 ✅

所有数值型配置已从硬编码中提取，统一通过配置表管理：

| 配置表 | 路径 | 内容 |
|--------|------|------|
| GameConfig.ts | `assets/scripts/core/GameConfig.ts` | 150+ 运行时常量 (战斗/属性边界/掉落/经济/广告) |
| battle.json | `assets/resources/config/battle.json` | 自动攻击/翻滚/暴击/伤害公式参数 |
| player.json | `assets/resources/config/player.json` | 玩家初始属性/边界/5角色配置 |
| monsters.json | `assets/resources/config/monsters.json` | 6区域 × 6种 = 36种怪物属性 |
| zones.json | `assets/resources/config/zones.json` | 6区域/27小关/9Boss/迷你Boss配置 |
| equipment.json | `assets/resources/config/equipment.json` | 8槽位/24词缀/6套装/6武器类型 |
| skills.json | `assets/resources/config/skills.json` | 6主动/12核心/7取舍/16遗物 |
| items.json | `assets/resources/config/items.json` | 8消耗品/6卷轴/5功能道具/掉落率 |
| economy.json | `assets/resources/config/economy.json` | 金币/魂石/商店/广告定价 |
| elements.json | `assets/resources/config/elements.json` | 6元素/11反应/链式参数/附魔 |
| env/dev.json | `assets/resources/config/env/dev.json` | 开发环境覆盖 (攻速/掉率/启动) |

### Phase 3: 区域内容填充 (3 周)

**目标**: 实现 6 大区域内容 + 33 个 Boss + 事件系统 + 房间变异 + 基础美术

| 里程碑 | 周期 | 内容 |
|--------|------|------|
| M3.1 区域 1+2 (森林+墓穴) | 5 天 | 8小关 + 8迷你Boss + 2终结Boss |
| M3.2 区域 3+4 (火山+雪原) | 5 天 | 9小关 + 9迷你Boss + 2终结Boss |
| M3.3 区域 5+6 (沼泽+深渊) | 5 天 | 10小关 + 10迷你Boss + 最终Boss(4阶段) |
| M3.4 事件系统 + 房间变异 | 3 天 | 8种事件场景 + 12种房间变异 |
| M3.5 基础美术资源 + 音效 | 4 天 | 36种怪物 + 27迷你Boss + 6终结Boss + 6区域BGM |

### Phase 4: 广告变现 (1 周)

**目标**: 所有广告位接入微信广告组件 → 广告收益可追踪 → 跑马灯系统上线

| 里程碑 | 周期 | 内容 |
|--------|------|------|
| M4.1 激励广告接入 | 3 天 | 7个激励广告位 + 网络异常fallback |
| M4.2 插屏 + Banner | 1 天 | 死亡结算插屏 + 主界面Banner |
| M4.3 跑马灯系统 | 1 天 | 3格进度条 + 点亮领钥匙 |
| M4.4 数据埋点 + 上报 | 2 天 | 12个核心事件 + 缓存重试 |

### Phase 5: 上线准备 (2 周)

**目标**: 合规审查 → 软著申请 → 自审报告 → 提审 → 灰度 → 全量

| 里程碑 | 周期 | 内容 |
|--------|------|------|
| M5.1 内部 playtest | 5 天 | 5-10人测试 + 数值调优 |
| M5.2 软著申请 | 3 天 | 材料整理 + 提交版权中心 |
| M5.3 自审报告 | 2 天 | 适龄提示(12+) + 广告合规 |
| M5.4 提审 + 灰度 | 4 天 | 微信审核 → 灰度5% → 全量 |

## 工程规范

| 里程碑 | 代码 | 场景挂载 | 说明 |
|-------|:----:|:--------:|------|
| M1.1 工程搭建 | ✅ | ✅ | Cocos Creator 3.8.8 + 微信小游戏适配层 |
| M1.2 启动屏+主界面 | ✅ | ✅ | splash.scene + main.scene |
| M1.3 6×6 网格+玩家移动 | ✅ | ✅ | GridManager + VirtualJoystick + PlayerController |
| M1.4 自动攻击+怪物 AI | ✅ | ✅ | AutoAttack + MonsterController(3种AI) + BattleManager |
| M1.5 翻滚+主动技能 | ✅ | ✅ | SkillSystem(4槽位) + SkillUI(遗物隐藏/显示) |
| M1.6 地牢 DAG+房间切换 | ✅ | ✅ | DAGGenerator(种子) + DungeonManager + RoomTransition |
| M1.7 觉悟战+结算 | ✅ | ✅ | DeathUI(觉悟面板+结算统计) |
| **Phase 2** | | | |
| M2.1 Build + 遗物系统 | ✅ | ❌ 需编辑器挂载 | PlayerStats + UpgradeManager(35种选项效果) |
| M2.2 元素反应系统 | ✅ | ❌ 需编辑器挂载 | ElementSystem(11反应+链式) + MonsterController冻结/沉默/减防 |
| M2.3 装备 + 词缀 + 套装 | ✅ | ❌ 需编辑器挂载 | EquipmentSystem(8槽/24词缀/6套装) + EquipmentUI |
| M2.4 魂石商店 + 角色解锁 | ✅ | ❌ 需编辑器挂载 | PlayerDataManager + ShopUI(5角色/3天赋) |
| M2.5 道具系统 + 背包 | ✅ | ❌ 需编辑器挂载 | ItemSystem(8消耗品) + InventoryUI(5格+快捷键) |

**代码统计**: 36 个 TypeScript 文件，~6000+ 行代码，9 个配置表 JSON 文件
**完整文档**: 20+ 个设计/技术文档，~5000+ 行规格描述

## 工程规范

项目强制遵守 `.workbuddy/memory/MEMORY.md` 中的全部规范，包括：
- 分层职责（业务逻辑 / UI / 数据配置 / 资源层）
- 状态字段集中定义 + 单一写入口
- 异步回调生命周期安全
- 配置/资源缺失兜底
- 单人适配版开发流程

## 设计原则

1. **走位决策重于手速** —— 实时自动攻击解放操作，走位和技能时机决定胜负
2. **每次旅程都不同** —— 种子驱动的地牢生成/怪物装配/强化选项/房间变异
3. **短平快的节奏** —— 单局 5–15 分钟，战斗 30–90 秒/场
4. **垃圾时间也有价值** —— 跑马灯+觉悟战，让每次死亡都有意义
5. **玩家选择驱动广告** —— 所有广告位均不影响不观看玩家的完整体验

## 版权声明

本游戏所有设计文档、系统框架均为独立原创。游戏机制灵感来源于多款经典 Roguelike 作品，但所有系统实现和数值模型均为原创设计。详见 `design/项目约定与版权声明.md` 中的竞品差异对比。
