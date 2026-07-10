# Progress Tracking Rules

> Last updated: 2026-07-09
> This file documents the progress tracking rule system for `docs/` scheme files.

## Rule Overview

Every scheme/plan document under `docs/` must have a corresponding progress tracking file under `docs/progress/`. This ensures that:
- Implementation status is tracked independently from the spec document
- Stakeholders can quickly see what has been done and what remains
- Dependencies between schemes are visible
- Historical progress is preserved

## File Structure

```
docs/
├── 方案A.md               ← scheme document (unchanged)
├── 方案B.md
├── ...
└── progress/              ← dedicated progress tracking folder
    ├── PROGRESS_RULES.md  ← this file: the rule system
    ├── _index.md          ← master progress summary across all schemes
    ├── 方案A.md           ← individual progress for scheme A
    ├── 方案B.md           ← individual progress for scheme B
    └── ...
```

## Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Progress directory | `progress/` under `docs/` | `docs/progress/` |
| Master progress file | `_index.md` (underscore prefix for top sort) | `docs/progress/_index.md` |
| Individual progress file | Same filename as scheme document | `docs/游戏流程总览.md` → `docs/progress/游戏流程总览.md` |
| Rules file | `PROGRESS_RULES.md` (all caps for distinction) | `docs/progress/PROGRESS_RULES.md` |

## Individual Progress File Template

Each progress file must follow this structure:

```markdown
# Progress: [Scheme Name]

> **Scheme**: `docs/[scheme-filename]`
> **Last updated**: YYYY-MM-DD
> **Status**: [not_started | in_progress | completed | deprecated]

## Overall Status

- **Completion**: XX% (estimated)
- **Blockers**: [list any blocking issues]
- **Priority**: [P0/P1/P2]

## Completed Items

- [ ] Task A
- [x] Task B ← completed

## Pending Items

- [ ] Task C ... (depends on: scheme-X)
- [ ] Task D

## Verification Notes

How to verify this scheme's implementation is complete.
```

## Status Values

| Status | Meaning |
|---|---|
| `not_started` | Scheme agreed but no implementation begun |
| `in_progress` | Implementation actively underway |
| `completed` | All items verified as done |
| `deprecated` | Scheme superseded or abandoned |

## Enforcement

- When a new `*.md` file is added to `docs/`, a corresponding progress file must be created in `docs/progress/`
- When implementation status changes, update both the individual progress file AND `_index.md`
- The `PROGRESS_REPORT_SYNC` rule in `MEMORY.md` must reference this system
