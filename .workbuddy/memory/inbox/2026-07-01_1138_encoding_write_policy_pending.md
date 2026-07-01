# Memory Patch: Encoding Write Policy

Source: Codex conversation, 2026-07-01
Status: merged
Suggested Target:
- MEMORY.md: add a high-priority memory bullet
- topics/ENGINEERING_STANDARDS.md: add detailed encoding/write-policy section

## Proposed Main Memory Bullet

- **ENCODING_WRITE_POLICY - 2026-07-01**: All project file reads/writes must use explicit UTF-8. Never use default-encoding writes such as Python `open(path, "w")`, PowerShell `Set-Content` without `-Encoding utf8`, or any AI/editor tool that writes using GBK/ANSI defaults. This previously caused mojibake, U+FFFD replacement characters, comment truncation, comments swallowing code, and Cocos compile/runtime failures. After any source/config/doc change, run `npm.cmd run validate:all`; `encoding-audit` must pass with issues=0 and p0=0 before continuing.

## Proposed Engineering Standards Section

### Encoding Write Policy

All source, config, docs, memory, and pipeline files must be UTF-8. Do not rely on OS/editor/tool default encodings.

Required patterns:

```python
from pathlib import Path
text = Path(path).read_text(encoding="utf-8")
Path(path).write_text(text, encoding="utf-8", newline="\n")
```

```python
open(path, "r", encoding="utf-8")
open(path, "w", encoding="utf-8", newline="\n")
```

```powershell
Set-Content -LiteralPath $path -Value $content -Encoding utf8
```

```js
await fs.writeFile(path, content, { encoding: "utf8" });
```

Forbidden:
- Python `open(path, "w")` / `open(path, "r")` without encoding
- PowerShell `Set-Content` without `-Encoding utf8`
- preserving mojibake tokens such as `MOJIBAKE_U951B`, `MOJIBAKE_U935A`, `MOJIBAKE_U9354`, `MOJIBAKE_U95B0`, `MOJIBAKE_U6D93`, `[corrupt-text]`
- keeping comments that may swallow code
- editing from mojibake as if it were valid source text

Known failure chain:

```text
default GBK/ANSI write
-> UTF-8 source text is re-encoded incorrectly
-> Chinese comments/strings become mojibake or U+FFFD
-> some // comment lines are truncated or merge with code
-> code boundaries change
-> Cocos compile/runtime failures
```

Mandatory verification after edits:

```bash
npm.cmd run validate:all
```

Acceptance:
- `encoding-audit` issues=0
- P0=0
- no U+FFFD replacement characters
- no mojibake tokens in `assets/scripts` or `assets/resources/config`
- no dangerous `// ... const/let/return/}/...` comment swallowing patterns

## Evidence

Recent failures included corrupted comments in `DungeonSceneInstaller.ts` swallowing code declarations such as `const playerNode` and `const battleManager`, causing dungeon scene assembly to break after clicking Start.

## Conflicts

None. This strengthens the existing `ENCODING_AUDIT` rule and should become a top-level high-priority memory because it affects every future code/document write.

Merged To:
- MEMORY.md
- topics/ENGINEERING_STANDARDS.md
