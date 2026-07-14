# AI Task Execution Standard Protocol

> **Version**: v1.3 | **Encoding**: UTF-8 (no BOM)
> **Purpose**: Unified execution standard for ALL AI agents across conversations.
> **MANDATE (P0, Highest Priority)**: All AI conversations in this project MUST follow this protocol. Before any task execution -- including code changes, art generation, document edits, or resource operations -- the AI MUST first create (or verify) a proper task card following Section 4. This rule overrides all other project rules.
> **Self-Contained**: This file contains the complete methodology. Project-specific references are marked with `[PROJECT: path]` -- the AI skips them if the file doesn't exist. No external files are required to obey this protocol.
> **Entry Rule**: Every session starts by reading this file. No code is written before reading this protocol.

---

## >>> MANDATORY: TASK CARD FIRST <<<

**P0 -- Highest Priority**: Any AI executing a task MUST first create (or verify existence of) a properly formatted task card per Section 4. The task card must specify: Input, Output, Strict Constraints, Allowed Scope, Forbidden Scope, and Definition of Done. No source file may be created or modified before the task card exists. This is the #1 rule of this protocol.

---

## Table of Contents

- [1. General](#1-general)
- [2. Core Constraints (Hard Rules + Red Lines)](#2-core-constraints-hard-rules--red-lines)
- [3. Standard Execution Pipeline](#3-standard-execution-pipeline)
- [4. Task Card Specification](#4-task-card-specification)
- [5. Execution Plan & Approval (Three Modes)](#5-execution-plan--approval-three-modes)
- [6. Validation Gates](#6-validation-gates)
- [7. 3D / Art Task Extra Gates](#7-3d--art-task-extra-gates) [PROJECT]
- [8. Report & Tracking](#8-report--tracking)
- [9. Failure Handling](#9-failure-handling)
- [10. File & Naming Conventions](#10-file--naming-conventions)
- [11. Deliverable Presentation](#11-deliverable-presentation)
- [12. Working Memory & Skill Rules](#12-working-memory--skill-rules)
- [Appendix A: Red Line Check Template](#appendix-a-red-line-check-template)
- [Appendix B: Quick Command Reference](#appendix-b-quick-command-reference)
- [Appendix C: Path Map](#appendix-c-path-map)

---

## 1. General

### 1.1 Scope

This protocol applies to ALL tasks executed by any AI. It defines a universal methodology that works in any project. Sections marked `[PROJECT]` contain project-specific rules that apply only when working on the target project.

### 1.2 Core Principles

| Principle | Meaning |
|---|---|
| **Read first, act second** | Read the task card, authoritative signatures, and existing implementations BEFORE writing code. No reading = no writing |
| **Scope is contract** | Each task has a strict "allowed modification scope". Directories not listed are forbidden by default |
| **Gate = standard** | Project validation (`validate:all`) is the hard pass/fail criterion where available |
| **Honest escalation** | Conflict/out-of-scope/design deviation found -> STOP and report immediately. Never solve privately |
| **Traceable** | Every task has an independent file + independent Execution Plan + independent Checkpoint REPORT |

### 1.3 Session Startup Flow

Every AI session starts by loading context in this order:

```
CORE (always available, this file is self-contained):
  1. Read this protocol file -> complete methodology
  2. Section 2.1 below contains the full 10 Hard Rules (embedded)
  3. Read the target task card (if one exists)
  4. Read latest REPORT_*.md (if any) for progress breakpoint

PROJECT-SPECIFIC (only if the project directory and files exist):
  5. Read _agent_contract.md [PROJECT] -> confirms full contract text (already embedded)
  6. Read _architecture_report.md [PROJECT] -> engineering baseline
  7. For 3D/art tasks: read ART_ASSET_GAP_CHECKLIST.md [PROJECT] and related 3D docs
  8. Load required skills: encoding-pipeline-guard, art-pipeline (if WorkBuddy platform)
```

---

## 2. Core Constraints (Hard Rules + Red Lines)

### 2.1 Ten Hard Rules (Highest Constraint) -- FULL TEXT EMBEDDED

> These 10 rules are the highest constraint. Any conflict with a task card -> hard rules take precedence -> STOP and report.
> Source: `_agent_contract.md` [PROJECT]. The full text is reproduced below so no external file is needed.

```
# Agent Contract -- 10 Rules (Complete)

## 1. No Plan Modification
Do not modify project plans, task cards, or architecture reports. The architecture report
is READ-ONLY by default; only write it when the task card explicitly says "refresh".
Plan errors -> STOP and report, wait for human revision.

## 2. No Interface Modification
Interface signatures/names/responsibilities follow the authoritative design doc.
No new interfaces, no renames, no param changes, no merge/split.
Implementation must be 1:1 with authoritative signatures.

## 3. No Scope Creep
Each module does ONLY what its interface declares.
Example: GameContext does service register/get/destroy only, not config loading.

## 4. No Guessing
Requirements not in the task card must NOT be invented.
For missing info (e.g., a getter's return type missing from ConfigTypes):
use `unknown` + `// TODO` and report. Do NOT invent fields or semantics.

## 5. Conflict = STOP
STOP immediately and output the conflict point when ANY of:
- Conflicts with architecture red lines
- Conflicts with task card's "forbidden modification scope"
- Conflicts with design doc signatures
- Multiple authoritative sources contradict each other

## 6. Out-of-Scope Must Be Reported
ANY change outside allowed scope must be reported.
Even "just fixing a small bug on the side" -> report.
Unlisted directories are forbidden by default.

## 7. No Test Modification
Test failures -> fix IMPLEMENTATION to pass them.
Never delete assertions, change expected values, comment out tests, or use skip.

## 8. No Lint Bypass
No lint config modification. No `// @ts-ignore` to hide type errors.
(Unless explicitly exempted by human, with the reason documented.)

## 9. No Validate Bypass
`npm run validate:all` MUST pass. No .gitignore tricks, no temporary gate disabling.
Validate failure = task incomplete.

## 10. No Architecture Degradation
Red lines cannot be relaxed, temporarily bypassed, or "fixed later".
Any degradation request -> STOP and report.

--- Pre-Execution Gate ---
- Before writing code: output an Execution Plan and wait for "Plan Approved".
- Plan must include: files to add/modify/delete, impact count, forbidden scope, steps.
- No source file may be created/modified before approval.
- Exception: reading/scanning/reporting only (no writes) needs no approval.

--- Violation Consequence ---
Any violation = task failure, even if validate:all passes.
Violation discovered -> roll back and report.
```

**Summary table** (quick reference):

| # | Rule | Essence |
|---|---|---|
| 1 | No plan modification | Plans and task cards are read-only. Errors -> STOP and report |
| 2 | No interface modification | Follow design doc signatures exactly. No new/rename/merge interfaces |
| 3 | No scope creep | Each module does only what its interface declares |
| 4 | No guessing | Missing info? Use `unknown` + `// TODO`. Don't invent |
| 5 | Conflict = STOP | Red line / scope / signature conflict -> STOP immediately |
| 6 | Out-of-scope must be reported | Any change outside allowed scope -> report. Unlisted dirs forbidden |
| 7 | No test modification | Test fails -> fix implementation. Never touch test assertions |
| 8 | No lint bypass | No lint config change, no `@ts-ignore` |
| 9 | No validate bypass | `validate:all` must pass. No gate skipping |
| 10 | No architecture degradation | Red lines cannot be relaxed, even temporarily |

### 2.2 Six Architecture Red Lines [PROJECT]

> These are project-specific constraints. The AI must enforce them when working on this project.

| # | Red Line | Content |
|---|---|---|
| 1 | No direct PhysicsSystem | Business code must NOT `import PhysicsSystem`; only depend on `ICollisionService` |
| 2 | No switch(skillId) | Skills must NOT use `switch(skillId)`; must use `SkillGraph` |
| 3 | Must implement ILifecycle | Runtime systems MUST `implements ILifecycle` and be managed by `LifecycleManager` |
| 4 | No `new` services | Business code must NOT `new` services; use `ctx.get(Token)` |
| 5 | No Math.random | Business code must NOT use `Math.random()`; use `RunRng` |
| 6 | Only SceneFlowService.loadScene | Only `SceneFlowService` may call `director.loadScene()` |

### 2.3 Project-Level Hard Rules [PROJECT]

> Only applies when working on this project. Source: `.workbuddy/memory/MEMORY.md`

- `art-pipeline` Skill must be loaded before any AI image generation, texture generation, crop, compression, replacement, import, or art validation
- `encoding-pipeline-guard` Skill must be loaded before any source/config/doc/memory file write
- Code comments, tool scripts, engineering docs, memory files default to **English/ASCII**. This protocol doc is Chinese (explicitly allowed for developer-facing documentation)
- Player-facing Chinese belongs in `assets/resources/config/text.json`
- **All file reads/writes must use explicit UTF-8**. Never rely on default encoding
- Scene tree changes must update the authoritative scene tree doc
- Resource changes must maintain consistency (prompts <-> master <-> runtime assets <-> registry <-> docs <-> validation scripts)

### 2.4 Anti-Duplication

Before writing any module, search globally for existing same-name / same-responsibility implementations:

```
grep -rn "class XxxDatabase\|interface IXxxService\|function useXxx" assets/scripts
```

If a same-responsibility implementation exists -> STOP and report. Reuse, don't rewrite.

Key cases on this project [PROJECT]:
- `ConfigDatabase` must reuse existing `ConfigService` + `ConfigManager`; no new loader
- `GameContext` must NOT re-implement `GameManager`/`ConfigManager`'s existing singleton management

---

## 3. Standard Execution Pipeline

Each task follows this **8-step pipeline**. No skipping, no reordering.

```
Step0    Scan project       Detect changes; report if architecture report needs update
Step1    Read + dedup       Read task card -> global search for same-name/responsibility impl
Step2    Pre-change diff    List files to add/modify/delete
Step2.5  Approval           Output Execution Plan -> wait for approval (see Section 5)
Step3    Generate code      Follow signatures; max 5 files per task
Step4    Run tests          Project test command (npm test / vitest / etc.)
Step5    Fix errors         Fix only this task's errors (max 3 rounds)
Step6    Validate           Run project validate command (go/no-go gate)
Step7    Commit             [TaskSet][TaskId] format
Step8    Checkpoint         Generate REPORT_<task>.md
```

### Step-by-Step Details

#### Step0 -- Scan Project

Scan scope:
- `package.json` / `tsconfig.json` full read (if project uses these)
- Source code directory tree and file list
- Global search for key class/interface names relevant to the task
- Detect if the architecture report is stale; report changes needed but do NOT write unless the task card explicitly permits

When to run:
- Project initial phase or after major structural changes
- New AI entering the project for the first time
- NOT needed every task -- skip if the architecture report is already current

#### Step1 -- Read + Dedup

- Read the task card's "Input" section completely
- Search globally for same-name or same-responsibility interfaces, classes, services (see Section 2.4)
- Search must cover all relevant source directories

#### Step2 -- Pre-Change Diff

Output format:

```
New files: FileA.ts, FileB.ts
Modified: FileC.ts (brief description)
Deleted: none
Impact: 3 files | new 2 | modified 1 | deleted 0
Scope OK: all changes within task card's "allowed modification scope"
```

#### Step2.5 -- Approval

**Most critical step. No source files may be written before receiving approval** (see Section 5 for mode-specific rules).

#### Step3 -- Generate Code

- **Token Budget**: single task <= **3-5 files**. Exceed? Split into subtasks.
- Implementation must be 1:1 with authoritative signatures.
- No new interfaces, no renames, no merge/split.

#### Step4 -- Run Tests

```
<project test command>   e.g., npm run test, npm.cmd run test, vitest run
```

- Pure logic layers need unit test coverage where feasible.
- UI/rendering layers typically verified in-engine, no unit tests.

#### Step5 -- Fix Errors

- Fix only errors **introduced by this task**.
- Max 3 auto-fix rounds. Still failing? STOP and output diff + error text.
- Design conflict exposed? STOP immediately (see Section 9).

#### Step6 -- Validate

Run the project's validation command. All gates must pass. New failures must be fixed.

#### Step7 -- Commit

Commit message format: `[TaskSet][TaskId] implement <feature>`
No multi-task commits. No out-of-scope changes in commit.

#### Step8 -- Checkpoint (REPORT)

Each task completion generates a `REPORT_<task>.md` file (format in Section 8).
Value: breakpoint recovery. Next session's AI reads the latest REPORT to continue.

---

## 4. Task Card Specification

### 4.1 Task Card Fields

Each task file must include these fields:

| Field | Meaning | Required | Example |
|---|---|---|---|
| **Input** | Referenced docs/interfaces/sections + dedup targets | YES | `section 5.2` + search for existing ServiceLocator |
| **Output** | Files to add/modify, symbols to export | YES | `core/GameContext.ts` export `GameContext` |
| **Strict Constraints** | No creative freedom: no new interfaces/renames/scope creep | YES | Follow section 5.2 exactly; no rewrite of ConfigManager |
| **Allowed Scope** | Directories/files this task can touch | YES | Allow new `core/GameContext.ts` |
| **Forbidden Scope** | Directories this task must NOT touch | YES | Forbid `battle/**` `config/**` |
| **DoD** | Verifiable completion criteria | YES | [OK] tests [OK] validate [OK] specific check |

### 4.2 Deprecated Task Files

When a task is deprecated, **keep the original file** and mark it `[SUPERSEDED]` with migration target. This maintains reference integrity.

```markdown
# T1_scene_model_preview.md -- [SUPERSEDED]

Replaced by T1A + T1B. Content migrated to: `T1A_preview_surface.md` and `T1B_scene_model_preview.md`
```

---

## 5. Execution Plan & Approval (Three Modes)

### 5.1 Mode Overview

Three modes. **Direct Execution overrides Normal** -- if the user says "just do it", skip waiting.

| Mode | Behavior | When Used |
|---|---|---|
| **Read-only Review** | Read files, analyze, plan. NO file writes. NO Plan Approved needed | Research/analysis/audit/review |
| **Normal Execution** | Output Execution Plan -> wait for "Plan Approved" -> write code | Default for any file-modifying task |
| **Direct Execution** | User says "just do it / go ahead / 直接做" -> skip wait, but still report scope, validation, risks | User-authorized fast path |

Priority: **Direct > Read-only > Normal**. Default is Normal unless user explicitly says otherwise.

### 5.2 Read-Only Review Mode

No Execution Plan needed. No file writes allowed. Suitable for:
- Reading documents to understand architecture
- Analyzing code for bugs/vulnerabilities
- Reviewing a task plan or design doc
- Estimating effort or scope

### 5.3 Normal Execution Mode

Write files only after producing an Execution Plan and receiving "Plan Approved".

#### Execution Plan Template

```markdown
## Execution Plan -- <task name>

### Change List
| Op | File | Description |
|---|---|---|
| NEW | path/to/FileA.ts | Responsibility description |
| MOD | path/to/FileB.ts | Summary of changes |
| DEL | -- | -- |

### Impact Count
- New: N files | Modified: N | Deleted: N | Total: N

### Scope Check
- [OK] All changes within task card's "allowed modification scope"
- [SKIP] Will NOT modify: <forbidden directories>
- [SKIP] Will NOT modify: <unlisted directories - forbidden by default>

### Execution Steps
1. Read authoritative signature/document
2. Search for existing implementation (dedup)
3. Implement FileA.ts, FileB.ts
4. Run project tests
5. Run project validation
6. Write REPORT
---

Waiting for **Plan Approved** ...
```

#### When to Wait

Default: always wait. Even for "just fix this small thing" -- give a brief scope note and wait.

EXCEPTION: user has explicitly said earlier in the conversation "approve all" or "just do it" -- brief plan still recommended.

### 5.4 Direct Execution Mode

User triggers:
- "直接做" / "直接按方案改" / "just do it"
- "不用确认了" / "go ahead"
- "依次全部执行" / "execute all in order"

**Rules**:
1. Still output a **brief scope statement** (what files you'll change, what you won't)
2. No need to wait for reply -- proceed immediately
3. Run all verification gates normally
4. After completion, deliver REPORT stating scope + validation result + risks
5. If conflict or uncertainty arises, **fall back to Normal mode**: stop and ask

### 5.5 What Does NOT Need Approval

Never need an Execution Plan in any mode:
- Reading files only (no writes)
- Generating a non-source report (no source file modification)
- General Q&A / consulting
- Already-approved follow-ups within the same session

---

## 6. Validation Gates [PROJECT]

> These gates exist only on the project machine with the validation toolchain installed.
> If tools are unavailable, the AI should run whatever checks are available and report status.

### 6.1 Nine Gates (Main Entry)

```
npm.cmd run validate:all
```

The project has 9 gates:

| # | Gate | Command | Checks |
|---|---|---|---|
| 1 | Config validation | `validate:config` | Config JSON format and metadata |
| 2 | Bundle budget | `validate:bundle` | Bundle size within limit |
| 3 | Encoding audit | `encoding_audit.py --ci` | UTF-8, comment style |
| 4 | Architecture gate | `validate:architecture` | Red lines 1-6 static check |
| 5 | TS static check | `validate:ts-static` | TypeScript compile |
| 6 | Asset registry | `validate:asset-registry` | Asset registry completeness |
| 7 | UI skin binding | `validate:ui-skin` | UI skin consistency |
| 8 | Non-UI asset registry | `validate:non-ui-assets` | Non-UI asset registration |
| 9 | Document consistency | `validate:doc-consistency` | Document references/links |

### 6.2 Baseline FAIL Rule

Known baseline FAILs are tracked in `ART_ASSET_GAP_CHECKLIST.md` [PROJECT] under "Current Gate Baseline".

**Rules**:
- NEW FAIL -> MUST fix
- Baseline FAIL count unchanged -> acceptable
- Baseline FAIL count increased -> find root cause and fix
- If baseline file doesn't exist, report validate output to user and ask for guidance

### 6.3 Encoding Audit P0 Trap

`encoding_audit.py --ci` [PROJECT] has one frequently triggered check:

> `comment_may_swallow_code`: A `//` comment starting with `while`, `if`, `switch`, `for`, or `const` triggers a P0 violation.

Workaround -- do not start such comments on their own line:
```ts
// BAD: while (condition) -- P0 violation
// OK: Continue waiting while condition holds -- safe
```

### 6.4 Validation Failure Handling

See Section 9 (Failure Handling).

---

## 7. 3D / Art Task Extra Gates [PROJECT]

> These apply IN ADDITION to the standard 9 gates when the task involves 3D asset generation, art import, model validation, or resource pipeline.

### 7.1 Required Pre-Reads

Before any 3D/art/resource task, the AI must read (if these files exist):
1. `ART_ASSET_GAP_CHECKLIST.md` -- current gaps and gate baseline
2. `3D资源全自动化资产工厂实施方案.md` -- 3D automation pipeline
3. `3D资源生成流程_完整说明_方案A.md` -- generation workflow

### 7.2 Extra Validation Commands

| Check | Purpose |
|---|---|
| 3D job schema | Validate generated 3d_jobs.json against its schema |
| Gap reconciliation | Compare output against ART_ASSET_GAP_CHECKLIST.md |
| Model validation | Check tri count, bones, texture size, colliders |
| Factory validation | End-to-end factory pipeline test |
| Backdrop config | Verify ui3d.json preconditions |
| Hunyuan3D input bundle | Validate prompt package format |

### 7.3 3D Asset Hard Rules

| Rule | Detail |
|---|---|
| AI must NOT place GLB directly into runtime | All 3D models go through the review/approval pipeline first |
| Hunyuan3D output = prototypes only | Not production-ready. Must be reviewed before import |
| Batch generation requires gap reconciliation | Before any `--full-rebuild`, diff against current gaps. Do not regenerate done assets |
| No import before approval | "Approved" status required before entering `assets/resources/models/` or textures |
| Asset pipeline consistency | prompts <-> master <-> runtime <-> registries <-> docs <-> validation must stay in sync |

### 7.4 Art Asset Security Rules [PROJECT]

> Source: `ART_RESOURCE_RULES.md`

- UI/Effects: no skulls, bones, blood, organs, violent horror cues
- Boss textures: <= 256 KB; effects: <= 160 KB
- Icons: quality preferred (warning at 16 KB, hard limit 32-64 KB)
- Backgrounds: PNG master, JPG runtime (dual-path)
- Text baked into images is forbidden unless explicitly required

---

## 8. Report & Tracking

### 8.1 Checkpoint Report Standard Template

```markdown
# REPORT <task name>

Complete: [OK]
Tests: [OK] (N all passed) or N/A (engine-side)
Validate: [OK] (gates -- N baseline FAILs unchanged; no new FAILs)

## Approach
<one-line summary>

## Files Added / Modified
- NEW `path/to/FileA.ts` (responsibility)
- MOD `path/to/FileB.ts` (change summary)
- DEL `path/to/OldFile.ts` (if any)

## Key Decisions
1. **Decision 1**: <why this approach, rejected alternatives>
2. **Decision 2**: <deviation from plan and reason>

## Design Deviations (if any)
- Plan said A, implemented B, because <reason>

## Validation Results
- Tests: <result>
- Gates: <result>
- Manual verification needed: <items needing in-editor confirmation>

## Risks / Escalations
- <unresolved issues, items needing human confirmation>
- <baseline FAILs>

## DoD Checklist
- [x] Tests passed
- [x] Validate passed (no new FAILs)
- [x] Scope confirmed: all within allowed range
- [x] Red line check: all passed

## Red Line Check [PROJECT]
| # | Red Line | Status | Note |
|---|---|---|---|
| 1 | No direct PhysicsSystem | OK | Not introduced |
| 2 | No switch(skillId) | OK | Not introduced |
| 3 | Must implement ILifecycle | OK | or N/A |
| 4 | No `new` services | OK | Not introduced |
| 5 | No Math.random | OK | Not introduced |
| 6 | Only SceneFlowService.loadScene | OK | Not introduced |
```

### 8.2 Report Storage

Reports live alongside task files in the `docs/ai-tasks/` directory. Convention:

| Task Set | Report File |
|---|---|
| Subtask | `REPORT_D{num}-{sub}.md` |
| Demo | `REPORT_demo{num}.md` |
| UI-3D | `REPORT_T{num}.md` |
| Cross-module | `REPORT_{section}.md` |

### 8.3 Task Set Index

Each subtask directory should have an `INDEX.md` containing:
- All tasks: name, priority, file, dependency, status
- Scope declaration (in-plan vs out-of-plan)
- Key decisions recorded
- Discipline reminders

---

## 9. Failure Handling

### 9.1 Failure Scenarios

| Scenario | Handling |
|---|---|
| Type error / test failure (task-introduced) | Auto-fix max **3 rounds**. Still failing? STOP and output diff + error text |
| `validate:all` new FAIL | Fix gate by gate until all pass |
| `validate:all` exposes design conflict | **STOP immediately**. Do not bypass gates |
| Dependency conflict (out-of-scope file / signature change needed) | **STOP immediately**. Output reason, wait for human |
| Red Herring (architecture/signature/red line mismatch) | **STOP and report**. Do not guess, do not work around |
| Encoding audit P0 (comment_may_swallow_code) | Reword the comment, re-validate |

### 9.2 Forbidden Actions

STRICTLY forbidden. If discovered, roll back and report immediately:

- Commenting out test cases or modifying assertions to pass tests
- Using `xit` / `describe.skip` to skip tests
- Modifying `.gitignore` to bypass gates
- Temporarily disabling gate scripts or `--skip` on critical gates
- Using `// @ts-ignore` to hide type errors
- Modifying lint config to bypass errors
- Silently expanding modification scope outside allowed range
- Inventing requirements not in the task card

---

## 10. File & Naming Conventions

### 10.1 Task Document Naming

| Type | Format | Example |
|---|---|---|
| Infrastructure subtask | `D{num}-{sub}.md` | `D0-0.md` |
| Single Demo task | `demo{num}.md` | `demo1.md` |
| Cross-phase complex | `demo7.md` (multi-phase) | `demo7.md` |
| Feature subtask | `T{num}_{Brief}.md` | `T1A_preview_surface.md` |
| Deprecated file | Keep file, mark [SUPERSEDED] | -- |

### 10.2 Report Document Naming

| Type | Format | Example |
|---|---|---|
| Task report | `REPORT_{task-id}.md` | `REPORT_T1A.md` |
| Demo report | `REPORT_demo{num}.md` | `REPORT_demo1.md` |

### 10.3 System Files (Underscore Prefix)

Files beginning with `_` are system files. AI must NOT modify them:
- `_agent_contract.md` [PROJECT] -- 10 hard rules
- `_architecture_report.md` [PROJECT] -- engineering scan (default read-only; write only when task card explicitly allows)

### 10.4 Other Doc Conventions

- Section reference: `section X.Y` = the referenced design document at that section
- Interface reference = the TS signature given in that section, which is the **sole authoritative signature**
- When design doc and task card conflict: design doc wins; AI must STOP and report
- Developer-facing docs in Chinese (this protocol included); code comments, tool scripts, memory files in **English/ASCII**

---

## 11. Deliverable Presentation

### 11.1 Post-Completion Presentation

After each task completion:
1. Use the platform's file presentation tool to show deliverables
2. Provide a concise **text summary** (what was done, delivered, validation results, items needing user confirmation)
3. Write REPORT (see Section 8)

### 11.2 Summary Format

```
Completed <task name>.

## Deliverables Overview
- New: N files (FileA.ts, FileB.ts)
- Modified: N (FileC.ts)
- Deleted: N

## Key Decisions
1. <decision description>

## Validation Results
- tests: N all passed
- validate: gates (N baseline FAILs unchanged)
- <other verification>

## For Your Confirmation
- <items needing in-editor verification or questions>
```

### 11.3 Presentation Rules

- Do NOT use echo/text blocks instead of file presentation tool -- user needs direct file access
- Do NOT append lengthy explanations after presenting -- the content speaks for itself
- Batch related files in a single presentation, not scattered calls

---

## 12. Working Memory & Skill Rules [PROJECT]

> These rules apply when the project's `.workbuddy/memory/` directory structure exists.

### 12.1 Memory Update Rules

**Default: write REPORT, not memory.** The daily memory log is for durable cross-session knowledge.

Write to working memory ONLY in these cases:
- The user explicitly confirms a **new project convention or long-term rule**
- A **repeatable pitfall** is discovered
- The user directly asks "remember this"

When triggered:
- Project-wide rules -> `MEMORY.md`
- User-level preferences -> `~/.workbuddy/MEMORY.md`
- Work completion log -> `daily/YYYY-MM-DD.md` (append only)

### 12.2 Skill Update Rules

Skills are **not created without user consent**. Create or update a skill ONLY when:
- The user explicitly asks "save this as a skill"
- You find a bug or outdated info in an existing skill -> fix it, notify user

### 12.3 Required Skills to Load [WorkBuddy Platform]

Before writing code/config/docs: load `encoding-pipeline-guard` skill.
Before any art operation: load `art-pipeline` skill.
Load once per session when first needed, not per subtask.

---

## Appendix A: Red Line Check Template

```markdown
## Red Line Check
| # | Red Line | Status | Note |
|---|---|---|---|
| 1 | No direct PhysicsSystem | OK | Not introduced |
| 2 | No switch(skillId) | OK | Not introduced |
| 3 | Must implement ILifecycle | OK | or N/A |
| 4 | No `new` services | OK | Not introduced |
| 5 | No Math.random | OK | Not introduced |
| 6 | Only SceneFlowService.loadScene | OK | Not introduced |
```

---

## Appendix B: Quick Command Reference [PROJECT]

| Purpose | Command |
|---|---|
| Full validation | `npm.cmd run validate:all` |
| Config validation | `python tools/config_pipeline/validate_config.py` |
| Bundle budget | `python tools/bundle/check_bundle_budget.py` |
| Encoding audit | `python tools/encoding_audit.py --ci` |
| Unit tests | `npm.cmd run test` |
| Dedup search | `grep -rn "class Xxx\|interface IXxx" assets/scripts` |

Note: Use `npm.cmd` (not `npm`) for Cocos Creator projects on Windows.

---

## Appendix C: Path Map

### Standalone Methodology

This protocol file is the single entry point. It contains:
- Complete hard rules (Section 2.1, embedded full text)
- Complete execution pipeline (Section 3)
- Complete task card spec (Section 4)
- Three-mode approval system (Section 5)
- Report templates (Section 8)
- Failure handling (Section 9)

### Project-Specific Addenda

When working on the actual project, these additional files may exist:

```
<project-root>/
  docs/
    ai-tasks/
      _agent_contract.md      -- Hard rules (duplicated in Section 2.1)
      _architecture_report.md  -- Engineering baseline
      AI_EXECUTION_PROTOCOL.md  <-- This file
      demo0/...demo6/          -- Task cards
      ui3d_preview/             -- Task cards + INDEX

<project-root>/tools/
  config_pipeline/check_all.py  -- 9-gate entry
  encoding_audit.py             -- Encoding audit
  asset_validate.py             -- 3D asset validation

E:/game/docs/ (cross-project layer)
  ART_ASSET_GAP_CHECKLIST.md    -- Asset gaps + gate baseline
  2D转3D全面升级方案.md          -- Architecture design
  2D转3D实施计划.md              -- Original execution protocol
```

The AI can operate at full effectiveness with just this protocol file alone. All project-specific paths are optional and the AI will skip unreadable files gracefully.
