# Project Memory Index

> Entry file for new conversations. Keep this file small, UTF-8, and ASCII-first.

## Must Read First -- HIGHEST PRIORITY

0. **`E:/game/docs/ai-tasks/AI_EXECUTION_PROTOCOL.md`** -- 所有 AI 对话强制执行标准。**任何任务执行前必须先读此文件**，按 §4 规范创建任务卡。此协议优先级高于本文件其他所有规则。
1. `docs/SKILL_REFERENCE.md`
2. Latest `daily/YYYY-MM-DD.md`
3. Relevant `topics/*.md`
4. `topics/ART_RESOURCE_RULES.md` before any art operation
5. `README.md` before saving memory

## Hard Rules

- `art-pipeline` is mandatory before any AI image generation, texture generation, crop, compression, replacement, import, or art validation.
- `encoding-pipeline-guard` is mandatory before any source/config/doc/memory file write.
- Code comments, tool scripts, engineering docs, and memory files should be English/ASCII by default. Player-facing Chinese belongs in `assets/resources/config/text.json`.
- All file reads/writes must use explicit UTF-8. Never rely on default PowerShell/Python encoding.
- Any rule, interface, config, data structure, scene tree, or asset registry change must update all dependent files.
- Scene-tree changes in `splash/main/dungeon.scene` must update the canonical scene-tree doc listed by project docs/progress.
- Run `npm.cmd run validate:all` after cross-file changes.

## Architecture Rules

- Three-scene principle: `splash`, `main`, `dungeon`.
- Only `SceneFlowService` may call `director.loadScene()`.
- Dungeon entry must go through `RunCoordinator.startRun(config)`.
- UI panels use `UiRouter` lifecycle. Panel controllers live on panel roots; `ContentRoot` is layout-only.
- Runtime rendering assets go through `AssetBundleService` + `RenderAssetService` / skin services. Avoid manual SpriteFrame binding.
- New UI scripts expose `@property(Node)` and may use path fallback, but editor bindings remain the preferred production path.
- Cocos local modules must use static top-level `import`; do not use dynamic `require('./relative')` or method-local `require('cc')`.

## Active Initiative

- Mainline is the 2D-to-3D upgrade. 3D encounter is the formal release path; 2D fallback is development-only.
- Current dungeon redesign spec: latest node-route roguelike dungeon redesign v0.4.4 under project `docs/`.
- Demo7 should use the v0.4.4 contract: `RouteSaveTypes`, `RouteSaveAdapter`, `RunCoordinator` base `RunSave`, `RoomFlowController` route context, `SingleRoomEncounterBuilder`, and `GameBootstrap` lifecycle fix.

## Art Rules

- Canonical art rules live in `topics/ART_RESOURCE_RULES.md`; it supersedes old art notes.
- Art assets must be approval-safe, no text baked into images unless explicitly required, no skull/blood/organ/violent horror cues.
- Resource changes must stay consistent across prompts, master assets, runtime assets, registries, docs, and validation scripts.
- Non-pipeline outputs must not be placed directly into `assets/resources/textures/`; use review/backup folders first.

## Path Rules

- Project root is the Cocos project folder containing `assets/`, `project.json`, and project `docs/`.
- Docs should prefer portable relative paths.
- Project `docs/` is the game spec layer.
- `E:/game/docs/` is the cross-project planning/audit layer.
- Be careful: `docs/`, `assets/`, `tools/`, `.workbuddy/`, and `art_source/` exist at both root and project levels.

## Memory Write Workflow

- Allowed direct writes: `inbox/YYYY-MM-DD_HHMM_scope_status.md`, `daily/YYYY-MM-DD.md`.
- Do not directly edit `MEMORY.md`, `topics/*.md`, or `CHANGELOG.md` unless the user explicitly asks to merge/update main memory.
- Patch workflow: copy `templates/MEMORY_PATCH_TEMPLATE.md`, write an inbox patch with source/proposal/evidence/conflicts/target, then merge after approval.

## Topic Index

| Scope | File |
|---|---|
| Art rules | `topics/ART_RESOURCE_RULES.md` |
| Conventions | `topics/CONVENTIONS.md` |
| Engineering | `topics/ENGINEERING_STANDARDS.md` |
| Architecture | `topics/ARCHITECTURE_GOVERNANCE.md` |
| Runtime assembly | `topics/RUNTIME_ASSEMBLY.md` |
| Design milestones | `topics/DESIGN_MILESTONES.md` |
| Dev progress | `topics/DEV_PROGRESS.md` |
| Resource status | `topics/RESOURCE_STATUS.md` |
| WeChat review | `topics/WECHAT_REVIEW_RULES.md` |

## Validation Gates

- Main command: `npm.cmd run validate:all`
- Expected gates: config, bundle, encoding, architecture, ts-static, asset registry, ui skin, game assets, doc consistency.
- Encoding gate: `python tools/encoding_audit.py --ci` must report issues=0 and p0=0.
- Architecture gate: only `SceneFlowService.ts` may load scenes.
- Doc consistency gate must pass after art pipeline, path, or spec changes.
