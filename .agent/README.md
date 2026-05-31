# FloorConnector Agent Handoff

This folder stores repo-native task handoff artifacts so the owner does not
need to copy/paste between ChatGPT, VS Code, local Codex CLI, and Codex Cloud.

## Folders

- `queue/`: task handoff files ready for an agent to run.
- `logs/`: agent run summaries, including branch, commit, validation, and
  blockers.
- `reports/`: integration, status, PR readiness, and audit outputs.
- `templates/`: reusable task and run-summary templates.

Keep secrets out of this folder. Queue files should describe scope, not embed
credentials or private tokens.

## Phase 1 Local Task Runner

Phase 1 adds safe local helpers for repo-native handoff. They create task files,
list queued work, print local Codex instructions, and capture run summaries.
They do not run Codex, push, merge, apply migrations, call providers, touch
secrets, or perform production actions.

Create a queued task:

```powershell
pnpm fc:task:create -- --stream scheduling --title "Add dispatch summary"
```

List queued tasks:

```powershell
pnpm fc:task:list
```

Generate local runner instructions:

```powershell
pnpm fc:agent:run -- --task .agent/queue/<file>.md
```

Run local Codex manually through the CLI or IDE using the printed instruction
block. Local mode is best for work that depends on local worktree state, local
auth, or local validation. Cloud mode is only for bounded PR work that can be
reviewed asynchronously. Review mode is for non-mutating audits and readiness
passes.

Capture the completed run:

```powershell
pnpm fc:task:summary -- --task .agent/queue/<file>.md --status done --commit abc123
```

Before committing a completed slice, run the relevant targeted checks plus:

```powershell
pnpm fc:preflight:fast
git diff --check
```

Human approval remains required for pushes, merges, branch deletion, remote
database actions, production environment changes, provider sends, payment or
signature actions, and any risky automation.
