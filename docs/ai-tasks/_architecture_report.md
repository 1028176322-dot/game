# Architecture Report — 工程扫描（Step0 产出）

> **编码**: UTF-8
> 生成: 2026-07-10（基于本次会话真实扫描）
> 作用: `docs/2D转3D实施计划.md` §1.1 Step0 的扫描产出。AI 每次会话开始先读此文件，再读目标任务卡。
> 刷新: 工程结构变化后，重新运行扫描并更新本报告（只读扫描，不修改任何源文件）。

---

## 1. 扫描方法

- `package.json` / `tsconfig.json` 全文读取
- `assets/scripts/**` 目录树与文件清单
- 对关键类名/接口名全局搜索：`Logger` `ServiceLocator` `LifecycleManager` `ConfigDatabase` `ICollisionService` `LogChannel` `ILogger` `Database` `Repository` `DataCenter`

## 2. 构建与脚本（package.json）

- 引擎: Cocos Creator 3.8.8
- `scripts`:
  - `build` / `build:wechat`（cocos build）
  - `validate:config` = `python tools/config_pipeline/validate_config.py`
  - `validate:bundle` = `python tools/bundle/check_bundle_budget.py`
  - `validate:all` = `python tools/config_pipeline/check_all.py` **（9 门禁主入口）**
  - `validate:ci` / `prebuild:wechat` / `typecheck`（typecheck 仅 echo，真类型检查靠 Cocos 编辑器 ccc tsc）
- **关键缺口：无 `test` 脚本、无测试框架（vitest/jest 均未引入）** → Demo0 的 D0-0 必须建立 vitest 基座。
- `dependencies`: {}（无运行时依赖）。

## 3. TypeScript 配置

- `tsconfig.json` 存在于项目根 `回到地面/`（Cocos 默认生成）。

## 4. 目录结构（assets/scripts/）

```
core/      GameBootstrap, PoolManager, Constants, GameManager, ConfigManager,
           EventBus, TextManager, rng/(Rng, RunRng), time/(BattleClock),
           events/(GameEvents, TypedEventBus, index)
ui/        VirtualJoystick, SkillUI, UpgradeUI, *, viewmodel/, view/, main/, layout/, ...
battle/    PlayerStats, SkillSystem, ElementSystem, ItemSystem, EquipmentSystem,
           EventSystem, MutationManager, UpgradeManager, PlayerController,
           BattleManager, AutoAttack, MonsterRuntime*, entity/(CombatEntity,
           StatusController, DamageReceiver, BossPhaseController, ai/*, MonsterAgent)
dungeon/   RoomTransition, DAGGenerator, DungeonManager, GridManager
scene/     SceneNodeFactory, DungeonSceneInstaller
render/    BackgroundService, TileAssetService, EffectService, IconService,
           CharacterVisualService, SpriteAnimationService
assets/    AssetBundleService, ArtResourceResolver, GameAssetService, SpriteSheetUtil
config/    ConfigService, ConfigManager(注: core/ 也有同名), ConfigTypes,
           ConfigSchemas, ConfigError
app/       SceneFlowService
runtime/   RuntimeEntityFactory
run/       RewardService, RoomFlowController, CharacterStartService,
           MutationRuntimeService, RunStartConfig
utils/     MathUtils, WXAdapter, NodeRef
```

## 5. 现有核心模块（core/）

- `GameBootstrap.ts`: 启动引导，`startup()` 依次 `ConfigService.loadAll` → `ConfigManager.loadAll` → `AssetBundleService.loadAssetMap`，`goToMain` 切主场景。**Demo0 仅在其内追加 GameContext 接入**。
- `GameManager.ts`: 单例（`ensure(scene)` 创建/获取节点上组件）。
- `ConfigManager.ts`: 本地配置单例（`getInstance().loadAll()`）。
- `EventBus.ts` / `events/TypedEventBus.ts`: 事件总线（已有 `TypedEventBus` 接口与实现）。
- `rng/RunRng.ts`: 种子随机（对应红线 5，业务应走它而非 `Math.random`）。
- `PoolManager.ts` / `Constants.ts` / `TextManager.ts`: 工具/常量/文本。

## 6. 现有 Service / 接口清单

| 既有 | 位置 | 说明 |
|---|---|---|
| `ConfigService` | config/ConfigService.ts | 配置加载（loadAll） |
| `ConfigManager` | core/ConfigManager.ts | 本地配置单例 |
| `AssetBundleService` | assets/AssetBundleService.ts | 资源包加载 |
| `GameAssetService` | assets/GameAssetService.ts | 游戏资源服务 |
| `SceneFlowService` | app/SceneFlowService.ts | 场景流转（唯一可 loadScene） |
| `TypedEventBus` | core/events/TypedEventBus.ts | 类型化事件总线 |
| `RunRng` | core/rng/RunRng.ts | 种子随机 |
| `PoolManager` | core/PoolManager.ts | 对象池 |

**尚未存在的接口（Demo0 要新建的）**：`ILifecycle` / `LifecycleManager` / `GameContext`(ServiceLocator) / `ConfigDatabase` / `Logger` / `ILogger` / `ICollisionService`(Demo3)。本次扫描确认 `scripts` 中**无**这些符号。

## 7. 既有实现清单（禁止重复实现 ★）

- **ConfigDatabase（D0-3）**：`ConfigService` + `ConfigManager` 已做配置加载。**`ConfigDatabase` 必须复用其已加载数据做类型化封装，禁止再写一套加载器**（见 §1.3）。
- **GameContext（D0-2）**：现有 `GameManager.ensure` / `ConfigManager.getInstance` 是单例获取，但**无统一 ServiceLocator**。GameContext 是新增注册/获取中心，但**不得重实现** GameManager/ConfigManager 的既有单例管理能力——只做服务注册表。
- **Logger（D0-4）**：扫描无既有 Logger/LogChannel → 安全新建。
- **LifecycleManager（D0-1）**：扫描无既有 → 安全新建。

## 8. 结论（对 Demo0）

- 四大基础设施（GameContext / LifecycleManager / ConfigDatabase / Logger）**可安全新增**，无同名冲突。
- 唯一需警惕的重复点：`ConfigDatabase` 必须复用 `ConfigService`/`ConfigManager`，D0-3 严格约束已写明。
- 测试基座缺失 → D0-0 建立 vitest（仅覆盖 `core/` 纯 TS，不引入 `cc`）。
- `GameBootstrap.ts` 是唯一允许修改的源文件（仅 `startup()` 追加）。
