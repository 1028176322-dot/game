# Memory Patch

## Source
- Thread: 编码质量专项治理对话
- Date: 2026-07-01 10:50
- Scope: ENGINEERING
- Status: merged

## Proposed Updates
- 编码审计脚本 `tools/encoding_audit.py` 已创建，支持扫描乱码特征词/注释吞代码/未闭合块注释/字符串乱码，输出 CSV 报告，支持 `--ci` 模式
- `.editorconfig` 已添加到项目根目录，强制 UTF-8/LF/末尾换行/修剪行尾空格
- CLI 门禁：`check_all.py` 已接入编码审计，`validate:all` 会自动执行 `encoding_audit.py --ci`
- 验收标准：`python tools/encoding_audit.py --ci` 输出必须 `issues=0, p0=0`
- AI 协作编码规则已写入 `topics/ENGINEERING_STANDARDS.md`的「编码规则（Encoding Rules）」章节，包括修改前确认 UTF-8 / 发现乱码立即修或删 / 修改后运行审计 / 禁止默认编码覆写 / 显式 UTF-8 写文件 / 运行时文本来自 text.json
- 真实乱码修复：`docs/Phase2开发方案.md` (装�备UI → 装备UI), `docs/实施路线图.md` (地牢地图 → 地牢地图)
- 假阳性排除：Python `//` 整除运算符、`{varName}` 文档注释、字符串内 `/*`、自排除报告和源码

## Evidence
- `python tools/encoding_audit.py --ci` → issues=0, p0=0, exit=0
- `python tools/config_pipeline/check_all.py` → 3/3 全部通过
- `tools/encoding_audit.py` 扫描 242 个文件，报告保存到 `art_source/encoding_audit_report.csv`

## Conflicts
- 无

## Suggested Target
- `topics/ENGINEERING_STANDARDS.md` — 编码规则章节（已写入，需后续合并审核确认）
