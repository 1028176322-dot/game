# 回到地面 (BackToGround)

实时自动攻击 · 战术 Roguelike 地牢探险

> **引擎**: Cocos Creator 3.8.8 + TypeScript
> **平台**: TapTap（安卓原生游戏）(IAA 广告变现)
> **状态**: Phase 1-5 代码完成 ✅ · 美术阶段进行中 · 40 个 TS 文件
> **编码**: UTF-8
> **仓库**: [github.com/1028176322-dot/game](https://github.com/1028176322-dot/game)
> **分支**: `main` (稳定) / `develop` (开发) / `feature/*` (功能)
> **设计完结**: 2026-06-25 · Phase 3 开发完成: 2026-06-25

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
| [启动屏设计](./design/风格/启动屏设计.md) | TapTap 合规启动屏 | v1.0 |
| [战斗系统规格](./docs/战斗系统规格.md) | 实时自动攻击系统完整规格 | v2.0 |
| [地牢生成系统规格](./docs/地牢生成系统规格.md) | DAG 生成/房间类型/地形模板/种子 | v1.0 |
| [关卡内容设计](./docs/关卡内容设计.md) | 6大区域/27小关/33个Boss | v3.1 |
| [技能系统设计](./docs/技能系统设计.md) | 主动/核心/属性/遗物/角色5层体系 | v2.0 |
| [装备系统设计](./docs/装备系统设计.md) | 8槽位/24词缀/6套装/混合套策略 | v2.0 |
| [道具系统设计](./docs/道具系统设计.md) | 消耗品掉落/商店不售/不可带出 | v1.1 |
| [数值系统模型](./docs/数值系统模型.md) | 玩家/怪物/BOSS全链路数值 | v1.0 |
| [数据埋点方案](./docs/数据埋点方案.md) | 12 个核心事件上报 | v1.0 |
| [本地存储设计](./docs/本地存储设计.md) | 存档结构(500字节)/版本迁移 | v1.0 |
| [合规审查报告](./docs/合规审查报告_微信小游戏.md) | 平台合规检测（原微信版，已过时，以 TapTap 迁移文档为准） | v1.0 |
| [实施路线图](./docs/实施路线图.md) | 5 阶段详细实施计划 (Phase 1-5) | v1.0 |
| [配置表规范](./docs/配置表规范.md) | 数据格式/命名/校验/环境隔离/版本管理 | v1.0 |

## 使用步骤

### 初次打开 Cocos Creator

```
1. 打开 Cocos Creator 3.8.8
2. 点击"打开项目" → 选择 E:/game/回到地面
3. 等待项目加载完成 (首次加载约 30-60 秒)
4. 在资源面板中展开 assets/scenes/
5. 双击 dungeon.scene 打开地牢场景
```

**场景节点结构（已挂载完毕，无需操作）：**

| 层级路径 | 已挂载组件 | 说明 |
|----------|-----------|------|
| Canvas/DungeonSceneController | DungeonSceneController + GridManager | 总控 + 网格 |
| Canvas/DungeonSceneController/Player | PlayerController + AutoAttack | 玩家 + 自动攻击 |
| Canvas/DungeonSceneController/VirtualJoystick | VirtualJoystick | 摇杆 |
| Canvas/DungeonSceneController/BattleManager | BattleManager | 战斗管理 |
| Canvas/DungeonSceneController/DungeonManager | DungeonManager | 地牢生成 |
| Canvas/DungeonSceneController/BattleHUD | BattleHUD | 战斗HUD |
| Canvas/DungeonSceneController/SkillUI | SkillUI | 技能按钮 |
| Canvas/DungeonSceneController/DungeonMapUI | DungeonMapUI | 地牢地图 |
| Canvas/DungeonSceneController/UpgradeUI | UpgradeUI | 强化面板 |
| Canvas/DungeonSceneController/DeathUI | DeathUI | 死亡结算 |

> **EventUI 无需场景节点**：事件系统在 DungeonSceneController.onLoad() 中通过
> `new Node('EventUI').addComponent(EventUI)` 动态创建，UI 元素全部由代码生成。

### 构建与发布（TapTap 安卓）

```bash
# 在 Cocos Creator 中
1. 菜单 → 项目 → 构建发布
2. 发布平台: Android（TapTap 联运 / 官网 APK）
3. 构建路径: build/
4. 勾选 "MD5 Cache" (资源缓存)
5. 点击"构建" (首次构建约 40-60 秒)
6. 构建完成后点击"运行" → 在 Android 设备 / 模拟器或 TapTap 开发者工具预览
```

### 开发工作流

```bash
# 修改代码后
1. Ctrl+S 保存所有文件
2. Cocos Creator 自动检测文件变更 (约 2-5 秒)
3. 在微信开发者工具中按 Ctrl+R 刷新预览

# 新增配置表
1. 在 assets/resources/config/ 下新建 JSON 文件
2. 在 ConfigManager.ts 中添加加载逻辑
3. 在 GameConfig.ts 添加对应的数值常量 (可选)

# 新增 UI 组件
1. 在 assets/scripts/ui/ 下新建 .ts 文件
2. 使用 @ccclass 装饰器
3. 在 DungeonSceneController 中动态创建组件
   → 无需在场景中拖拽节点 (如 EventUI 零挂载方案)
```

### Phase 3 新增功能验证

| 功能 | 触发条件 | 预期行为 | 验证方式 |
|------|----------|----------|----------|
| **区域路线** | 进入地牢 | 控制台输出 `[区域路线] 翠绿森林 → 熔岩火山 → 暗影深渊` | 查看 Cocos Creator 控制台 |
| **Boss 阶段** | Boss 战 | HP 低于 50%/25% 时阶段变更 | HUD 显示 "阶段 2/3" 提示 |
| **事件房间** | 进入事件房 (5% 概率) | 2 选 1 决策面板弹出 | 面板描述 + 选项标签 + 15 秒计时 |
| **房间变异** | 进入新楼层 (第 2 层起) | 控制台输出 `[变异] 第 2 层: 血月, 淘金热` | 控制台 + 属性面板可见增益/减益 |
| **迷你 Boss** | 小关末 Boss 房 | Boss 名称读取自 zones.json 配置 | 与配置表名称一致 |
| **区域切换** | 击败终结 Boss | 自动进入下一区域，显示新区域名称 | HUD 显示区域切换提示 |

### 代码结构速查

```
回到地面/assets/scripts/
├── core/           # 基础框架 (7文件)
│   ├── GameManager.ts      # 全局状态 + 区域/小关追踪
│   ├── ConfigManager.ts    # JSON 配置加载器
│   ├── GameConfig.ts       # 150+ 运行时常量
│   └── ...
├── battle/         # 战斗系统 (12文件)
│   ├── PlayerController.ts # 玩家移动/翻滚/受伤
│   ├── MonsterController.ts# 6种AI (charger/ranged/defender/summoner/suicider/elite)
│   ├── EventSystem.ts      # 事件系统 (8场景/12后果) [Phase 3 新增]
│   ├── MutationManager.ts  # 房间变异 (12种) [Phase 3 新增]
│   └── ...
├── dungeon/        # 地牢系统 (4文件)
│   ├── DAGGenerator.ts     # 种子 DAG 生成 (支持区域配置)
│   ├── DungeonManager.ts   # 基于 zones.json 生成怪物
│   └── ...
├── ui/             # UI 层 (12文件)
│   ├── EventUI.ts          # 事件UI (零挂载, 运行时创建) [Phase 3 新增]
│   └── ...
└── utils/          # 工具类 (2文件)
```

```
回到地面/
├── assets/                    # Cocos Creator 资源目录
│   ├── scenes/                # 场景文件
│   │   ├── splash.scene       # 启动屏场景
│   │   ├── main.scene         # 主界面场景
│   │   └── dungeon.scene      # 地牢核心场景
    │   └── scripts/               # TypeScript 脚本 (39 文件)
    │       ├── core/               # 基础框架 (7文件: GameManager/EventBus/Config/Constants/GameConfig/Pool/PlayerData)
    │       ├── battle/             # 战斗系统 (12文件: Player/Monster/AutoAttack/Skill/Battle/PlayerStats/Upgrade/Element/Equipment/Item/EventSystem/MutationManager)
│       ├── dungeon/            # 地牢系统 (4文件: Grid/DAG/Dungeon/Room)
│       ├── ui/                 # UI 层 (12文件: Splash/Main/Joystick/HUD/Skill/Map/Upgrade/Death/Equipment/Shop/Inventory/EventUI)
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
Phase 1 ✅ ─── Phase 2 ✅ ─── Phase 3 ✅ ─── Phase 4 ✅ ─── Phase 5 📋
 3周           3周           3周            1周             2周
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

### Phase 3: 区域内容填充 (3 周) ✅ **100% 完成** (2026-06-25)

**目标**: 实现 6 大区域内容 + 33 个 Boss + 事件系统 + 房间变异 + 基础美术

| 里程碑 | 周期 | 内容 | 状态 |
|--------|------|------|------|
| M3 Foundation: Config连接 | 2 天 | ConfigManager 加载 JSON 配置 (zones/monsters), 区域怪物权重抽取 | ✅ **完成** |
| M3 Foundation: 区域管理 | 1 天 | GameManager 区域路线/小关推进/区域切换 (森林必出+随机3区域) | ✅ **完成** |
| M3 Foundation: 6种AI | 2 天 | Summoner/Suicider/Elite (含 Boss 阶段 3~4 阶段 HP 阈值触发) | ✅ **完成** |
| M3 Foundation: DAG小关 | 1 天 | DAGGenerator 支持区域权重/Boss层/迷你Boss层标记 | ✅ **完成** |
| M3.1-3.3 区域内容 | 5 天 | 6区域/27小关/27迷你Boss+6终结Boss(含4阶段深渊魔王) | ✅ **配置就绪** |
| M3.4 事件系统+房间变异 | 3 天 | 8场景+6检测+12后果+EventUI零挂载 + 12变异+权重+DDA+互斥 | ✅ **代码完成** |
| M3.5 基础美术+音效 | 4 天 | 74个占位符精灵 (6区域×10怪物 + 8UI元素 + 12Tile) | ✅ **占位符已生成** |

**Phase 3 交付清单:**

| 维度 | 交付 |
|------|------|
| 新增文件 | `EventSystem.ts` · `EventUI.ts` · `MutationManager.ts` · `generate_placeholder_art.py` |
| 重写文件 | `ConfigManager.ts` · `GameManager.ts` · `DungeonManager.ts` · `DAGGenerator.ts` · `MonsterController.ts` · `BattleManager.ts` · `DungeonSceneController.ts` · `MainSceneController.ts` |
| 场景依赖 | **零改动** — 所有 Phase 3 代码兼容 Phase 1-2 场景 |
| EventUI 挂载 | **零挂载** — 运行时 `new Node().addComponent(EventUI)`, UI 由代码创建 |

### Phase 4: 广告变现 (1 周) ✅ **100% 完成** (2026-06-25)

**目标**: 所有广告位接入微信广告组件 → 广告收益可追踪 → 跑马灯系统上线

| 里程碑 | 周期 | 内容 | 状态 |
|--------|------|------|------|
| M4.1 激励广告接入 | 3 天 | 7个激励广告位 + 网络异常fallback + CD控制 | ✅ **完成** (代码已有) |
| M4.2 插屏 + Banner | 1 天 | 死亡结算插屏 + 主界面Banner + 战斗隐藏 | ✅ **完成** (代码已有) |
| M4.3 跑马灯系统 | 1 天 | 3格进度条 + 广告点亮 + 钥匙奖励 + 跨层存档 | ✅ **完成** (MarqueeUI.ts 新增) |
| M4.4 数据埋点 + 上报 | 2 天 | 12个核心事件 + 缓存重试(20条) + 启动刷新 | ✅ **完成** (WXAdapter增强) |

**Phase 4 交付清单:**

| 维度 | 交付 |
|------|------|
| 新增文件 | `MarqueeUI.ts` (跑马灯, 零挂载) |
| 修改文件 | `DeathUI.ts` (魂石翻倍) · `WXAdapter.ts` (埋点增强) · `DungeonSceneController.ts` (集成) · `MainSceneController.ts` (Banner+埋点) |
| 场景依赖 | **零改动** |
| 占位广告ID | `_getAdUnitId()` 中7个广告位ID留空 → 上线前填写真实微信广告单元ID |

**Phase 4 验证:**

| 功能 | 触发条件 | 预期行为 |
|------|----------|----------|
| 觉悟广告 | 死亡 → 弹出觉悟战 | 点击复活 → 看30s广告 → 50%HP复活 |
| 魂石翻倍 | 结算面板 | 点击翻倍 → 广告完成 → 魂石×2 |
| 跑马灯 | 战斗胜利 | 弹出3格进度条 → 点击看广告点亮 → 3格满领钥匙 |
| 插屏广告 | 死亡结算后 | 每3局展示一次 |
| Banner | 主界面 | 底部常驻, 进入地牢隐藏 |
| 数据上报 | 各种事件 | 控制台有 `[WXAdapter] 上报: xxx` 日志 |

### Phase 5: 上线准备 (2 周) ✅ **4 份文档已生成**

**目标**: 合规审查 → 软著申请 → 自审报告 → 提审 → 灰度 → 全量

| 里程碑 | 周期 | 内容 | 状态 |
|--------|------|------|:----:|
| M5.1 内部 playtest | 5 天 | 5-10人测试 + 数值调优 | 📋 **测试脚本已就绪** |
| M5.2 软著申请 | 3 天 | 材料整理 + 提交版权中心 | 📋 **源代码清单已就绪** |
| M5.3 自审报告 | 2 天 | 适龄提示(12+) + 广告合规 | ✅ **自审报告已生成** |
| M5.4 提审 + 灰度 | 4 天 | 微信审核 → 灰度5% → 全量 | 📋 **上线检查表已就绪** |

**Phase 5 已交付文档:**

| 文件 | 说明 |
|------|------|
| `docs/自审报告.md` | 自审报告 (7章完整，原微信小游戏版，已过时) |
| `docs/Playtest脚本.md` | 完整测试脚本 (7大模块+边缘情况+性能) |
| `docs/软著源代码清单.md` | 软著申请用代码清单 (40个文件分类) |
| `docs/上线前检查表.md` | 最终提审检查表 (P0/P1/流程/灰度指标) |

> **用户自行操作**: ① 执行playtest ② 提交软著材料 ③ 填写广告单元ID ④ 提交 TapTap 审核

---

## Art Phase: 美术资源搭建 (进行中)

> Phase 1-5 代码开发全部完成。当前进入美术资源搭建阶段。

### 3 个场景当前状态

| 场景 | 节点 | 脚本 | UI 可见性 | 操作状态 |
|------|------|------|----------|---------|
| **splash.scene** | Canvas → SplashUI → SplashImage/SkipButton | ✅ SplashUI | ⚠️ 需纯美术调整 | 基础结构就绪 |
| **main.scene** | Canvas → MainUI → Title/StartButton(Label) | ✅ MainSceneController | ⚠️ 需纯美术调整 | 基础结构就绪 |
| **dungeon.scene** | Canvas → DungeonSceneController + 10个子系统 | ✅ 全部 11 个脚本 | ❌ 全 UI 需搭建 | 节点+脚本就绪 |

### 需要手动完成的 UI 搭建

**SplashImage 图片不显示** → 给 SplashImage 节点的 Sprite Frame 赋值，调整 UITransform

**MainScene 不显示文字** → 设置 Label 字体，调整位置 UI

**Dungeon 场景** → 11 个 UI 子系统全部需要创建视觉元素：
- GridManager → 网格背景 Sprite
- BattleHUD → HP/Floor/Kill 标签 + 伤害数字
- SkillUI → 4 个技能按钮（2主动+2遗物）
- VirtualJoystick → 摇杆背景+摇杆头
- UpgradeUI → 3 选 1 面板
- DungeonMapUI → 小地图
- DeathUI → 觉悟面板 + 结算面板
- EventUI → 零挂载，自动创建
- MarqueeUI → 零挂载，自动创建

**占位资源路径**: `assets/resources/arts/placeholders/` (74 个 PNG)

### 工程规范

| 里程碑 | 代码 | 场景挂载 | 说明 |
|-------|:----:|:--------:|------|
| M1.1 工程搭建 | ✅ | ✅ | Cocos Creator 3.8.8 + TapTap 安卓适配层 |
| M1.2 启动屏+主界面 | ✅ | ✅ | splash.scene + main.scene |
| M1.3 6×6 网格+玩家移动 | ✅ | ✅ | GridManager + VirtualJoystick + PlayerController |
| M1.4 自动攻击+怪物 AI | ✅ | ✅ | AutoAttack + MonsterController(3种AI) + BattleManager |
| M1.5 翻滚+主动技能 | ✅ | ✅ | SkillSystem(4槽位) + SkillUI(遗物隐藏/显示) |
| M1.6 地牢 DAG+房间切换 | ✅ | ✅ | DAGGenerator(种子) + DungeonManager + RoomTransition |
| M1.7 觉悟战+结算 | ✅ | ✅ | DeathUI(觉悟面板+结算统计) |
| **Phase 2** | | | |
| M2.1 Build 3选1+遗物系统 | ✅ | ❌ 需编辑器挂载 | PlayerStats + UpgradeManager(35种选项效果) |
| M2.2 元素反应系统 | ✅ | ❌ 需编辑器挂载 | ElementSystem(11反应+链式) + MonsterController冻结/沉默/减防 |
| M2.3 装备 + 词缀 + 套装 | ✅ | ❌ 需编辑器挂载 | EquipmentSystem(8槽/24词缀/6套装) + EquipmentUI |
| M2.4 魂石商店 + 角色解锁 | ✅ | ❌ 需编辑器挂载 | PlayerDataManager + ShopUI(5角色/3天赋) |
| M2.5 道具系统 + 背包 | ✅ | ❌ 需编辑器挂载 | ItemSystem(8消耗品) + InventoryUI(5格+快捷键) |
| **Phase 3** | | | |
| M3.1-3.3 区域内容(6区/27小关/33Boss) | ✅ | ❌ 需编辑器挂载 | ConfigManager + DungeonManager 连接 zones.json/monsters.json |
| M3.4 事件系统+房间变异 | ✅ | ✅ **零挂载** | EventSystem + EventUI(运行时动态创建) + MutationManager |
| M3.5 基础美术+音效 | ✅ | ✅  | 占位符生成 (74个PNG) |
| **Phase 4** | | | |
| M4.1 激励广告+插屏+Banner | ✅ | ✅ **零挂载** | WXAdapter (CD控制/fallback/频次) |
| M4.2 跑马灯系统 | ✅ | ✅ **零挂载** | MarqueeUI (自包含, 3格进度条) |
| M4.3 数据埋点+上报 | ✅ | ✅ **零挂载** | WXAdapter (12事件/缓存重试/启动刷新) |

**代码统计**: 40 个 TypeScript 文件，~9000+ 行代码，9 个配置表 JSON 文件，74 个占位符 PNG 精灵
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
