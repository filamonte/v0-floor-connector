# Local Codex CLI Workflow

Status: Active
Doc Type: Developer Operations

## Purpose

Use one local control cockpit for FloorConnector work instead of disconnected
windows, prompts, and branch state.

## VS Code Workspace

Open `FloorConnector.code-workspace` when reviewing multiple streams. It groups
the canonical repo and known local worktrees that exist on this machine.

## Start Of Work

From the intended repo or worktree:

```powershell
git status --short --branch
git branch --show-current
git fetch origin
pnpm fc:status
```

Then read:

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `.codex/control-tower.md`
- the relevant `.codex/stream-contracts/*.md`

## Queue Files

Use `.agent/queue/*.md` for durable task handoff files. A queue file should
state stream, worktree, scope allowed, scope not allowed, validation, and final
report requirements.

Run local Codex against the task file when the work is ready to execute.

## Phase 1 Task Runner Helpers

Use the Phase 1 helpers to reduce copy/paste while keeping execution manual and
human-approved.

Create a task:

```powershell
pnpm fc:task:create -- --stream scheduling --title "Add dispatch summary"
```

List queued tasks:

```powershell
pnpm fc:task:list
```

Print local Codex CLI instructions for a task:

```powershell
pnpm fc:agent:run -- --task .agent/queue/<file>.md
```

Capture a run summary:

```powershell
pnpm fc:task:summary -- --task .agent/queue/<file>.md --status done --commit abc123
```

Paste the generated instruction block into local Codex CLI or VS Code Codex
after opening the recommended worktree. The runner is instruction-only in Phase
1; it does not run Codex, push, merge, rebase, apply migrations, touch secrets,
or perform provider/production actions.

## Validation

Use:

```powershell
pnpm fc:preflight:fast
```

Run targeted tests or browser checks only when the slice touches behavior that
needs them and the environment is ready.

## Commit And PR Expectations

- Stage only intended files.
- Commit the completed slice.
- Report final branch/status, commit hash/message, changed files, validation,
  skipped checks, and follow-up.
- Open draft PRs; do not merge locally.

## Bringing Summaries Back To ChatGPT

Bring summaries back when a product decision, merge-order decision, architecture
question, or cross-stream risk needs human/product-owner review. Routine local
validation evidence can live in PRs, `.agent/logs/*.md`, and
`.agent/reports/*.md`.
