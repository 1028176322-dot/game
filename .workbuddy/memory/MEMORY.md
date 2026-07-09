# Project Memory Index

> Entry file. Read this first when a new conversation starts.
> Keep this file small, stable, and UTF-8 encoded.

## High Priority Rules

- **CROSS_FILE_CONSISTENCY - 2026-07-09** (HIGHEST PRIORITY): When any rule, data structure, interface definition, config item, or other critical information in any file is modified, ALL dependent or referencing files MUST be checked and updated to ensure consistency. Dependent files include but are not limited to: files that directly import/reference the modified content, files that extend or inherit the modified definitions, and files linked via imports, config references, or documentation links. After every critical information modification, immediately trigger a cross-file review and sync update. Run `npm.cmd run validate:all` (gate 9: doc consistency) to verify no cross-file conflicts remain.
- **SKILL_REFERENCE - 2026-07-09** (MANDATORY): `docs/SKILL_REFERENCE.md` is the mandatory-read index of all available Skills. **Image generation / texture operations MUST load `art-pipeline` first. Source code modifications MUST load `encoding-pipeline-guard` first.** At the start of every turn, check whether the current task triggers any MANDATORY Skill. If so, load it before proceeding.
- **ART_RESOURCE_RULES - 2026-07-08**: `topics/ART_RESOURCE_RULES.md` is the dedicated memory file for ALL art resource rules (style, pipeline, format, safety, registration, validation). **Read this before any art-related operation** -- generation, replacement, import, registration, or prompt changes. Supersedes the legacy `topics/ART_PIPELINE.md`.
- **ENCODING_WRITE_POLICY - 2026-07-01**: All project file reads/writes must use explicit UTF-8. Never use default-encoding writes such as Python `open(path, "w")`, PowerShell `Set-Content` without `-Encoding utf8`, or any AI/editor tool that writes using GBK/ANSI defaults. This previously caused mojibake, U+FFFD replacement characters, comment truncation, comments swallowing code, and Cocos compile/runtime failures. After any source/config/doc change, run `npm.cmd run validate:all`; `encoding-audit` must pass with issues=0 and p0=0 before continuing. Full rules: `topics/ENGINEERING_STANDARDS.md`.
- **ASCII_SOURCE_POLICY - 2026-07-01**: Source code comments, tool scripts, engineering docs, and memory files should be English/ASCII by default. Player-facing Chinese text belongs in `assets/resources/config/text.json`. Chinese is allowed in design docs only when necessary and must pass encoding audit. This reduces GBK/ANSI write corruption risk.
- **COCOS_EDITOR_BINDING_POLICY - 2026-07-06**: New UI/panel/HUD scripts should expose `@property(Node)` fields in Inspector, not `Label/Button/Sprite/EditBox` component fields. Resolve components through `NodeRef.component()` with stable path fallback. Panel controllers stay on panel root nodes; `ContentRoot` is for responsive/layout components only. Full rules: `topics/ENGINEERING_STANDARDS.md` and `docs/编辑器节点绑定通用规则.md`.
- **MEMORY_WRITE_RULE - 2026-06-30**: Different conversations must not directly edit long-term memory files unless the user explicitly says to merge main memory. Normal conversations write memory patches to `inbox/` first.
- **ART_GENERATION_PIPELINE - 2026-07-09** (MANDATORY): All art asset operations (AI image gen, texture generation, image replacement/crop/compress/import) **MUST load `art-pipeline` Skill first** -- never skip this. AI generation goes through its built-in Agnes API flow; procedural panels use its bundled `scripts/generate_panel.py`. Assets not processed through the Skill pipeline must NOT be placed directly into `assets/resources/textures/`. Backup files must go to `art_source/textures_review/backup/`, NOT into the project textures directory. After any resource change, always run `npm.cmd run validate:all`.
- **RUNTIME_ASSEMBLY - 2026-06-30**: Assets must be wired through `AssetBundleService` and `RenderAssetService`. Do not manually bind SpriteFrames in the Cocos editor as the primary production path.
- **ARCH_FOUNDATION - 2026-07-01**: P0 architecture foundation is now live: 3-scene principle, AppFlowController state machine, RunCoordinator for dungeon entry, UiRouter v2 with UIPanel lifecycle, RuntimeLayerService for 5-layer rendering, SpriteAnimationService for config-driven animation. All `director.loadScene()` calls restricted to SceneFlowService only. Design docs updated to v1.2 with P0 Architecture Rules. Full details in `docs/游戏流程总览.md`.
- **TEXT_MIGRATION - 2026-07-02**: All player-visible text centralized in `assets/resources/config/text.json`. All 7 panels + splash + AreaSelectPanel migrated to `T()` calls. LocalizedLabel component for editor-fixed labels. `tools/scan_scene_labels.py` handles per-panel key suggestion. See `docs/场景编辑器搭建手册.md` text-configuration rules section.
- **RESPONSIVE_LAYOUT - 2026-07-02**: All PanelRoots use `ResponsivePanelRoot` component instead of fixed 1280x720. DimMask (semi-transparent) + PanelFrame (panel base) with dynamic ratio/min-max sizing. Panel size parameters in docs table. Never hardcode UITransform sizes.
- **ROUTE_UNLOCK - 2026-07-02**: AreaSelectPanel routes use structured `UnlockCondition` type (none/clear_zone/reach_floor/player_level) instead of hardcoded English unlock strings. Display text from text.json keys (unlockNone/unlockClearZone/unlockReachFloor/unlockPlayerLevel). PlayerDataManager has `zoneClearCounts` tracking.
- **SCENE_TREE_DOC_SYNC - 2026-07-06**: Any modification to scene structure trees (add/remove/rename nodes or components in `splash.scene` / `main.scene` / `dungeon.scene`) must immediately update `docs/三场景完整结构树.md`. Failure to sync causes UI binder keys, skin bindings, and layout components to reference stale paths. Validate by running `npm.cmd run validate:all` after each scene change.
- **PROGRESS_REPORT_SYNC - 2026-07-09**: `docs/progress/_index.md` is the master progress index; `docs/progress/PROGRESS_RULES.md` defines the rule system. Each scheme file under `docs/` must have a corresponding progress file under `docs/progress/`. When a new scheme file is added, its progress file must be created. When implementation status changes, update both the individual progress file and `_index.md`.

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

**MANDATORY -- must follow EVERY time a new turn begins (including after context compression / summarization).**

1. **This file.** Always read first.
2. **`docs/SKILL_REFERENCE.md`.** Read immediately after this file. **Determine if the current task triggers `art-pipeline` (any texture/gen operation) or `encoding-pipeline-guard` (any source file modification).** If so, load the corresponding Skill via `Skill({ skill: "..." })` before proceeding.
3. **Latest daily log.** Read `daily/<today's date>.md`. If it doesn't exist, read the most recent one.
4. **Task-relevant topics.** Based on user intent, read matching files in `topics/`.
5. **`topics/ART_RESOURCE_RULES.md`.** If the task involves any art resource operation, read this before proceeding.
6. **If saving memory**, read `README.md` and follow the patch workflow.

After context compression: the system preserves `<working_memory_content>` (this file's content), but daily log details may be summarized away. **Always re-read the latest daily log** after detecting a context compression / summarization boundary to restore granular context.

## Skill Reference

See `docs/SKILL_REFERENCE.md` for detailed usage and trigger conditions. The following lists only project-relevant Skills.

| Skill | Level | Trigger | Must load first |
|---|---|---|---|
| `art-pipeline` | **MANDATORY** | AI image gen, texture gen, image replace/crop/compress/import -- any `assets/resources/textures/` operation | ✅ Load before acting |
| `encoding-pipeline-guard` | **MANDATORY** | Any source file (TS/Python/JSON/MD) create/edit/write -- prevents encoding corruption | ✅ Load before editing |
| `ardot-mindmap-game-system-flow` | On-demand | Game system flow diagram / mind map | Load when relevant |

## Topic Index

| Scope | File | Description |
|---|---|---|
| ART_RESOURCE_RULES | `topics/ART_RESOURCE_RULES.md` | All art resource rules (style/pipeline/format/safety/registration/validation) |
| CONVENTIONS | `topics/CONVENTIONS.md` | |
| WECHAT_REVIEW | `topics/WECHAT_REVIEW_RULES.md` | |
| ENGINEERING | `topics/ENGINEERING_STANDARDS.md` | |
| ARCH_GOVERNANCE | `topics/ARCHITECTURE_GOVERNANCE.md` | |
| RUNTIME_ASSEMBLY | `topics/RUNTIME_ASSEMBLY.md` | |
| ART_PIPELINE | `topics/ART_PIPELINE.md` | (legacy, superseded by ART_RESOURCE_RULES) |
| RESOURCE_STATUS | `topics/RESOURCE_STATUS.md` | |
| DESIGN | `topics/DESIGN_MILESTONES.md` | |
| DEV_PROGRESS | `topics/DEV_PROGRESS.md` | |

## Current Validation Gates

- Run `npm.cmd run validate:all` after source/config/doc changes. Runs 9 gates: config, bundle, encoding, architecture, ts-static, asset registry, ui skin, game assets, **doc consistency**.
- Encoding gate: `python tools/encoding_audit.py --ci` must pass with issues=0 and p0=0.
- Architecture gate: automated in `validate:all` -- `python tools/config_pipeline/check_architecture.py`. Only `SceneFlowService.ts` may call `director.loadScene()`.
- **Doc consistency gate**: `python tools/check_doc_consistency.py` — validates budget alignment between `ART_RESOURCE_RULES.md` and `tools/art_pipeline.py`, category completeness, and path reference validity in `art-pipeline` SKILL.md. Must pass with 0 issues.
- Existing bundle warnings may remain as optimization work, but all 9 gates must pass.
- **Skill available**: `encoding-pipeline-guard` -- any file create/modify must route through its 4-phase workflow. Load via: `Skill({ skill: "encoding-pipeline-guard" })`.
