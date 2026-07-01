# Engineering Standards

## Status

Active. These rules are mandatory for all conversations and tools working in this workspace.

## Layering Rules

| Layer | Owns | Must Not Do |
| --- | --- | --- |
| Gameplay logic | Rules, state transitions, formulas, persistence triggers | Depend on UI node names or hardcoded asset paths |
| UI | Display, input, animations, operation forwarding | Mutate core gameplay state directly |
| Config | Defaults, validation ranges, enum values, compatibility | Crash silently when keys are missing |
| Assets | Loading, fallback, resource mapping | Bypass `AssetBundleService` / `RenderAssetService` |
| Runtime assembly | Creating scene layers and runtime nodes | Require manual SpriteFrame binding in Cocos as the production path |

## Naming And Code Style

- State fields and enum-like values must have a single source of truth.
- Side-effect methods must have explicit names such as `useItem`, `grantReward`, or `saveProgress`.
- Boolean values should start with `is`, `has`, `can`, or `should`.
- Avoid generic names such as `data`, `info`, or `temp` when the domain meaning is known.
- Async callbacks must tolerate destroyed nodes and stale references.
- Validate config keys, foreign-key references, numeric ranges, empty strings, and invalid enum values.

## Encoding Write Policy

All source, config, docs, memory, and pipeline files must be UTF-8. Do not rely on OS/editor/tool default encodings.

### ASCII Source Policy

Default to English/ASCII for:
- source code comments
- TypeScript and Python tool logs
- engineering docs
- memory files
- temporary handoff notes
- commit messages and changelog entries

Player-facing Chinese text belongs in:
- `assets/resources/config/text.json`

Chinese is allowed in design/product docs only when needed for communication. Those files still must pass `encoding_audit`.

Do not hardcode runtime UI Chinese in source files. UI text must be loaded from `text.json` through the text/config service.

### Required Write Patterns

```python
from pathlib import Path
text = Path(path).read_text(encoding="utf-8")
Path(path).write_text(text, encoding="utf-8", newline="
")
```

```python
open(path, "r", encoding="utf-8")
open(path, "w", encoding="utf-8", newline="
")
```

```powershell
Set-Content -LiteralPath $path -Value $content -Encoding utf8
```

```js
await fs.writeFile(path, content, { encoding: "utf8" });
```

### Forbidden

- Python `open(path, "w")` or `open(path, "r")` without encoding.
- PowerShell `Set-Content` without `-Encoding utf8`.
- Any AI/editor/tool write that depends on GBK/ANSI/default encoding.
- Preserving mojibake tokens or U+FFFD replacement characters.
- Keeping comments that may swallow code.
- Editing from mojibake as if it were valid source text.
- Adding Chinese comments to source code when an English/ASCII comment would be sufficient.

### Known Failure Chain

```text
default GBK/ANSI write
-> UTF-8 source text is re-encoded incorrectly
-> Chinese comments/strings become mojibake or U+FFFD
-> some // comment lines are truncated or merge with code
-> code boundaries change
-> Cocos compile/runtime failures
```

## Validation Gates

After any source/config/doc/memory edit, run:

```bash
npm.cmd run validate:all
```

Encoding acceptance:
- `encoding-audit` issues=0.
- P0=0 and P1=0.
- No U+FFFD replacement characters.
- No mojibake tokens in `assets/scripts`, `assets/resources/config`, `tools`, docs, or memory.
- No dangerous comment swallowing patterns.

## Development Workflow

Before development:
- Clarify the requirement and acceptance criteria.
- List affected modules.
- Read the existing implementation before changing code.

During development:
- Prefer small, verifiable changes.
- Implement core logic before visual polish.
- Add or update validation when a bug can recur.
- Preserve unrelated user changes.

Self-test:
- Main flow.
- Failure recovery.
- Repeated clicks.
- Fast open/close UI flows.
- WeChat resource-missing behavior.

Before handoff:
- Run validation gates.
- Review `git diff`.
- Report known warnings separately from failures.

## Risk Checklist

- Null reference from `getComponent`, `find`, async load, or stale node?
- Async callback touching a destroyed node?
- Missing config fallback or missing explicit error?
- Duplicate reward, payment, save, or event listener?
- Old save data compatibility affected?
- Resource exists but mapping or runtime visual wiring missing?
- Text hardcoded outside `text.json`?
- Any file write lacking explicit UTF-8?

## Recent Changes

- 2026-07-01: Encoding audit added to `validate:all`.
- 2026-07-01: Memory files are included in encoding audit.
- 2026-07-01: `MEMORY.md` rewritten as stable ASCII/UTF-8 index.
- 2026-07-01: ASCII source policy added: source/tools/memory default to English/ASCII; player-facing Chinese stays in `text.json`.
