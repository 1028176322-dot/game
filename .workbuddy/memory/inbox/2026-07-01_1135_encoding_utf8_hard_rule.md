# Memory Patch

## Source
- Thread: 编码写入链路根因分析
- Date: 2026-07-01 11:35
- Scope: ENGINEERING
- Status: confirmed

## Proposed Updates
### 工程红线：显式 UTF-8 写入 (Encoding Hard Rule)
所有文件读写必须显式 UTF-8，禁止依赖系统默认编码。
- Python: `open(path, "w", encoding="utf-8", newline="\n")` / `open(path, "r", encoding="utf-8")`
- PowerShell: `Set-Content -Encoding utf8`
- Node.js: `fs.writeFile(path, content, { encoding: "utf8" })`
- Path: `path.read_text(encoding="utf-8")` / `path.write_text(text, encoding="utf-8", newline="\n")`

### 编码审计加强
- `tools/encoding_audit.py` 新增 `replacement_character` 检测（U+FFFD，P0）
- 新增 `comment_swallowed_code` 检测（// 后紧跟 const/let/return 等，P0）
- 修改源码后必须跑 `npm run validate:all`
- encoding-audit 必须 P0=0，发现乱码先修编码再继续功能

## Evidence
- `python tools/encoding_audit.py --ci` → &lt;0 issues&gt;
- `npm run validate:all` → 3/3 通过 (config + bundle + encoding)

## Conflicts
- 无

## Suggested Target
- `topics/ENGINEERING_STANDARDS.md` — 编码规则章节补充 UTF-8 硬规则
