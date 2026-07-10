# Project Memory Index

> Entry file. Read first when a new conversation starts. Keep small, stable, UTF-8.

## High Priority Rules

### Mandatory Skills (load before acting)
- **art-pipeline** — MUST load before ANY art op (AI gen / texture gen / replace / crop / compress / import). AI via Agnes API; procedural panels via its `scripts/generate_panel.py`. Non-pipeline assets must NOT go to `assets/resources/textures/`; backups -> `art_source/textures_review/backup/`.
- **encoding-pipeline-guard** — MUST load before ANY source-file create/edit/write (TS/Python/JSON/MD). Prevents UTF-8 corruption.

### Cross-file & Consistency
- **CROSS_FILE_CONSISTENCY (HIGHEST)**: Any change to rules / data structures / interfaces / config must update ALL dependent or referencing files. Run `npm.cmd run validate:all` (gate 9: doc consistency) after.
- **SKILL_REFERENCE**: `docs/SKILL_REFERENCE.md` is the mandatory-read Skill index. Each turn, check if the task triggers `art-pipeline` (texture/gen) or `encoding-pipeline-guard` (source edit); if so, load it first.
- **SCENE_TREE_DOC_SYNC**: Scene-tree changes in `splash/main/dungeon.scene` must update `docs/三场景完整结构树.md`; run `validate:all`.
- **PROGRESS_REPORT_SYNC**: `docs/progress/_index.md` is the master index; each `docs/*.md` scheme needs a `docs/progress/` file. Update both on status change.

### Art Resources
- **ART_RESOURCE_RULES** — `topics/ART_RESOURCE_RULES.md` holds ALL art rules (style / pipeline / format / safety / registration / validation). Read before any art op. Supersedes legacy `topics/ART_PIPELINE.md`.

### Encoding & Source
- **ENCODING_WRITE_POLICY**: All reads/writes explicit UTF-8. No default-encoding writes (Python `open(w)`, PowerShell without `-Encoding utf8`). After changes run `validate:all`; `encoding-audit --ci` must be issues=0, p0=0.
- **ASCII_SOURCE_POLICY**: Code comments / tool scripts / eng docs / memory -> English/ASCII by default. Player-facing Chinese -> `assets/resources/config/text.json`.
- **RELATIVE_PATH_POLICY**: All path references in project docs / skills MUST be relative, never absolute (`E:/game/...`, `C:/...`). Resolution base = project root `E:/game/回到地面` for the doc-consistency gate (`check_doc_consistency.py` Check3, which since 2026-07-10 ALSO scans fenced ```text code blocks and resolves `../` against project root). Valid relative forms: `docs/` `tools/` `assets/` `.workbuddy/` (gate-resolved) + `../` for parent-level files (`E:/game/docs/`, `E:/game/tools/`, `E:/game/.workbuddy/`). The `回到地面/docs/...` mixed form is NOT portable — gate returns `None` and silently skips validation.
  - **Two-layer docs convention**: `E:/game/docs/` (root) = cross-project PLANNING / AUDIT / REVIEW layer; its docs reference the project via `回到地面/...` root-relative paths (e.g. `art-pipeline升级审查.md`, `2D转3D全面升级方案.md`, `2D转3D实施计划.md`). `回到地面/docs/` (project) = art + game SPEC documents (制作参数总表_3D / 入库规范 / MachineSpec / Workflow / game specs); reference siblings via `docs/X`. CRITICAL: docs that use `回到地面/...` refs MUST stay at root docs — moving them into `回到地面/docs/` breaks those refs. `../docs/X` (pointing to a root planning doc) is valid and now gate-validated (base = project root → parent docs). Use `docs/X` (not `../docs/X`) for siblings inside `回到地面/docs/`.
  - **Cross-level same-name reality (audit 2026-07-10)**: `docs/ assets/ tools/ .workbuddy/ art_source/` exist at BOTH `E:/game/` and `E:/game/回到地面/`; also `config/ memory/ resources/ skills/` collide across levels. Gate anchors each prefix to a FIXED base so automated indexing is safe, but humans/CWD-based resolution is ambiguous. `docs/X.md` + `docs/progress/X.md` twins are by-design (scheme + progress stub). Two `tools/` layers hold IDENTICAL copies of `auto_bind_scene.py`/`gen_scenes.py`/`gen_scenes_simple.py` — consolidate to avoid drift.

### UI / Editor
- **COCOS_EDITOR_BINDING_POLICY**: New UI scripts expose `@property(Node)`, resolve via `NodeRef.component()` with path fallback. Panel controllers on panel root; `ContentRoot` for layout only.
- **RESPONSIVE_LAYOUT**: PanelRoots use `ResponsivePanelRoot` (DimMask + PanelFrame), never hardcode UITransform.
- **TEXT_MIGRATION**: Player text centralized in `text.json`; use `T()` + `LocalizedLabel`. Scan via `tools/scan_scene_labels.py`.
- **ROUTE_UNLOCK**: AreaSelectPanel uses `UnlockCondition` (none/clear_zone/reach_floor/player_level); display text from text.json keys; `PlayerDataManager.zoneClearCounts`.

### Architecture & Runtime
- **ARCH_FOUNDATION**: 3-scene principle; AppFlowController state machine; RunCoordinator; UiRouter v2; RuntimeLayerService (5-layer); SpriteAnimationService. Only `SceneFlowService` may call `director.loadScene()`.
- **RUNTIME_ASSEMBLY**: Assets via `AssetBundleService` + `RenderAssetService`; no manual SpriteFrame binding.
- **MEMORY_WRITE_RULE**: Normal conversations write patches to `inbox/`; do NOT directly edit `MEMORY.md`/`topics/*.md`/`CHANGELOG.md` unless user says "merge main memory".

## Active Initiative
- **2D -> 3D Upgrade** — Architecture blueprint: `docs/2D转3D全面升级方案.md` (v3). Phased: Demo0-6 (infra + feature demos) -> Vertical Slice -> Phase1-6 (render/anim/combat/dungeon/lighting/optimize). Core principles to respect before touching combat/dungeon/render/AI: `ILifecycle`+`LifecycleManager`, `GameContext` DI/ServiceLocator, `ICollisionService` (no direct `PhysicsSystem`), `SkillGraph` (no `switch(id)`), `IAIController` (BT/FSM/GOAP/Utility), `AssetCache`. Reference this doc when modifying those systems.

## Startup Reading Order
1. This file. 2. `docs/SKILL_REFERENCE.md` (load mandatory Skill if triggered). 3. Latest `daily/<date>.md` (or most recent). 4. Relevant `topics/*.md`. 5. `topics/ART_RESOURCE_RULES.md` if any art op. 6. `README.md` if saving memory (follow patch workflow). After context compression, re-read latest daily log.

## Memory Write Workflow
Allowed direct: `inbox/YYYY-MM-DD_HHMM_scope_status.md`, `daily/YYYY-MM-DD.md`. Do NOT directly edit `MEMORY.md` / `topics/*.md` / `CHANGELOG.md` unless user says "merge main memory".
Patch: copy `templates/MEMORY_PATCH_TEMPLATE.md` -> write inbox patch (Source / Proposed / Evidence / Conflicts / Target) -> merge only after explicit approval.

## Topic Index
| Scope | File |
|---|---|
| ART_RESOURCE_RULES | `topics/ART_RESOURCE_RULES.md` |
| CONVENTIONS | `topics/CONVENTIONS.md` |
| WECHAT_REVIEW | `topics/WECHAT_REVIEW_RULES.md` |
| ENGINEERING | `topics/ENGINEERING_STANDARDS.md` |
| ARCH_GOVERNANCE | `topics/ARCHITECTURE_GOVERNANCE.md` |
| RUNTIME_ASSEMBLY | `topics/RUNTIME_ASSEMBLY.md` |
| DESIGN | `topics/DESIGN_MILESTONES.md` |
| DEV_PROGRESS | `topics/DEV_PROGRESS.md` |
| RESOURCE_STATUS | `topics/RESOURCE_STATUS.md` |

## Validation Gates
`npm.cmd run validate:all` -> 9 gates: config, bundle, encoding, architecture, ts-static, asset registry, ui skin, game assets, doc consistency.
- encoding: `python tools/encoding_audit.py --ci` issues=0, p0=0.
- architecture: only `SceneFlowService.ts` may `director.loadScene()` (checked by `tools/config_pipeline/check_architecture.py`).
- doc consistency: `python tools/check_doc_consistency.py` must be 0 issues (ART_RESOURCE_RULES <-> art_pipeline.py; paths in art-pipeline SKILL.md).
