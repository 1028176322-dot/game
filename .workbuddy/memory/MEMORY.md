# Project Memory Index

> Entry file. Read this first when a new conversation starts.
> Keep this file small, stable, and UTF-8 encoded.

## High Priority Rules

- **ENCODING_WRITE_POLICY - 2026-07-01**: All project file reads/writes must use explicit UTF-8. Never use default-encoding writes such as Python `open(path, "w")`, PowerShell `Set-Content` without `-Encoding utf8`, or any AI/editor tool that writes using GBK/ANSI defaults. This previously caused mojibake, U+FFFD replacement characters, comment truncation, comments swallowing code, and Cocos compile/runtime failures. After any source/config/doc change, run `npm.cmd run validate:all`; `encoding-audit` must pass with issues=0 and p0=0 before continuing. Full rules: `topics/ENGINEERING_STANDARDS.md`.
- **ASCII_SOURCE_POLICY - 2026-07-01**: Source code comments, tool scripts, engineering docs, and memory files should be English/ASCII by default. Player-facing Chinese text belongs in `assets/resources/config/text.json`. Chinese is allowed in design docs only when necessary and must pass encoding audit. This reduces GBK/ANSI write corruption risk.
- **MEMORY_WRITE_RULE - 2026-06-30**: Different conversations must not directly edit long-term memory files unless the user explicitly says to merge main memory. Normal conversations write memory patches to `inbox/` first.
- **ART_STYLE - 2026-06-30**: The art style is cartoon animal fantasy, not pixel art and not dark/gory style. Prompts and generated assets must avoid text, skulls, blood, organs, horror, and review-risk imagery.
- **RUNTIME_ASSEMBLY - 2026-06-30**: Assets must be wired through `AssetBundleService` and `RenderAssetService`. Do not manually bind SpriteFrames in the Cocos editor as the primary production path.
- **RESOURCE_STATUS - 2026-06-30**: Asset exists, `assets.json` mapping exists, and runtime visual wiring exists are three different statuses. Do not claim all 418 assets are visually integrated unless runtime wiring has been verified.

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

1. Read this file.
2. Read task-relevant files under `topics/`.
3. If saving memory, read `README.md` and follow the patch workflow.

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

- Run `npm.cmd run validate:all` after source/config/doc changes.
- Encoding gate: `python tools/encoding_audit.py --ci` must pass with issues=0 and p0=0.
- Existing bundle warnings may remain as optimization work, but config and encoding gates must pass.
