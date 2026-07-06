# Project Memory Index

> Entry file. Read this first when a new conversation starts.
> Keep this file small, stable, and UTF-8 encoded.

## High Priority Rules

- **ENCODING_WRITE_POLICY - 2026-07-01**: All project file reads/writes must use explicit UTF-8. Never use default-encoding writes such as Python `open(path, "w")`, PowerShell `Set-Content` without `-Encoding utf8`, or any AI/editor tool that writes using GBK/ANSI defaults. This previously caused mojibake, U+FFFD replacement characters, comment truncation, comments swallowing code, and Cocos compile/runtime failures. After any source/config/doc change, run `npm.cmd run validate:all`; `encoding-audit` must pass with issues=0 and p0=0 before continuing. Full rules: `topics/ENGINEERING_STANDARDS.md`.
- **ASCII_SOURCE_POLICY - 2026-07-01**: Source code comments, tool scripts, engineering docs, and memory files should be English/ASCII by default. Player-facing Chinese text belongs in `assets/resources/config/text.json`. Chinese is allowed in design docs only when necessary and must pass encoding audit. This reduces GBK/ANSI write corruption risk.
- **MEMORY_WRITE_RULE - 2026-06-30**: Different conversations must not directly edit long-term memory files unless the user explicitly says to merge main memory. Normal conversations write memory patches to `inbox/` first.
- **ART_STYLE - 2026-06-30**: The art style is cartoon animal fantasy, not pixel art and not dark/gory style. Prompts and generated assets must avoid text, skulls, blood, organs, horror, and review-risk imagery.
- **RUNTIME_ASSEMBLY - 2026-06-30**: Assets must be wired through `AssetBundleService` and `RenderAssetService`. Do not manually bind SpriteFrames in the Cocos editor as the primary production path.
- **ARCH_FOUNDATION - 2026-07-01**: P0 architecture foundation is now live: 3-scene principle, AppFlowController state machine, RunCoordinator for dungeon entry, UiRouter v2 with UIPanel lifecycle, RuntimeLayerService for 5-layer rendering, SpriteAnimationService for config-driven animation. All `director.loadScene()` calls restricted to SceneFlowService only. Design docs updated to v1.2 with P0 Architecture Rules. Full details in `docs/游戏流程总览.md`.
- **TEXT_MIGRATION - 2026-07-02**: All player-visible text centralized in `assets/resources/config/text.json`. All 7 panels + splash + AreaSelectPanel migrated to `T()` calls. LocalizedLabel component for editor-fixed labels. `tools/scan_scene_labels.py` handles per-panel key suggestion. See `docs/场景编辑器搭建手册.md` 文本配置化规则 section.
- **RESPONSIVE_LAYOUT - 2026-07-02**: All PanelRoots use `ResponsivePanelRoot` component instead of fixed 1280x720. DimMask (semi-transparent) + PanelFrame (panel base) with dynamic ratio/min-max sizing. Panel size parameters in docs table. Never hardcode UITransform sizes.
- **ROUTE_UNLOCK - 2026-07-02**: AreaSelectPanel routes use structured `UnlockCondition` type (none/clear_zone/reach_floor/player_level) instead of hardcoded English unlock strings. Display text from text.json keys (unlockNone/unlockClearZone/unlockReachFloor/unlockPlayerLevel). PlayerDataManager has `zoneClearCounts` tracking.

## Memory Write Workflow

Allowed direct writes:
- `inbox/YYYY-MM-DD_HHMM_scope_status.md`
- `daily/YYYY-MM-DD.md`

Do not directly edit unless the user explicitly says "merge main memory":
- `MEMORY.md`
- `topics/*.md`
- `CHANGELOG.md`

Patch workflow:
1. Copy `templates/MEMORY_PATCH_TEMPLATE.md`.
2. Write `inbox/YYYY-MM-DD_HHMM_scope_status.md`.
3. Include Source, Proposed Updates, Evidence, Conflicts, and Suggested Target.
4. Merge into `topics/`, `MEMORY.md`, and `CHANGELOG.md` only after explicit user approval.

## Startup Reading Order

**Mandatory — must follow EVERY time a new turn begins (including after context compression / summarization).**

1. **This file.** Always read first.
2. **Latest daily log.** Read `daily/<today's date>.md`. If it doesn't exist, read the most recent one.
3. **Task-relevant topics.** Based on user intent, read matching files in `topics/`.
4. **If saving memory**, read `README.md` and follow the patch workflow.

After context compression: the system preserves `<working_memory_content>` (this file's content), but daily log details may be summarized away. **Always re-read the latest daily log** after detecting a context compression / summarization boundary to restore granular context.

## Topic Index

| Scope | File |
| --- | --- |
| CONVENTIONS | `topics/CONVENTIONS.md` |
| WECHAT_REVIEW | `topics/WECHAT_REVIEW_RULES.md` |
| ENGINEERING | `topics/ENGINEERING_STANDARDS.md` |
| ARCH_GOVERNANCE | `topics/ARCHITECTURE_GOVERNANCE.md` |
| RUNTIME_ASSEMBLY | `topics/RUNTIME_ASSEMBLY.md` |
| ART_PIPELINE | `topics/ART_PIPELINE.md` |
| RESOURCE_STATUS | `topics/RESOURCE_STATUS.md` |
| DESIGN | `topics/DESIGN_MILESTONES.md` |
| DEV_PROGRESS | `topics/DEV_PROGRESS.md` |

## Current Validation Gates

- Run `npm.cmd run validate:all` after source/config/doc changes. Runs 4 gates: config, bundle, encoding, architecture.
- Encoding gate: `python tools/encoding_audit.py --ci` must pass with issues=0 and p0=0.
- Architecture gate: automated in `validate:all` — `python tools/config_pipeline/check_architecture.py`. Only `SceneFlowService.ts` may call `director.loadScene()`.
- Existing bundle warnings may remain as optimization work, but all 4 gates must pass.
- **Skill available**: `encoding-pipeline-guard` — any file create/modify must route through its 4-phase workflow. Load via: `Skill({ skill: "encoding-pipeline-guard" })`.
