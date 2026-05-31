# Task: <TITLE>

- Stream:
- Branch/worktree:
- Owner:
- Status:

## Goal

<Describe the intended outcome.>

## Required Docs

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `.codex/control-tower.md`
- `.codex/stream-contracts/<stream>.md`

## Scope Allowed

-

## Scope Not Allowed

-

## Validation

```powershell
pnpm fc:preflight:fast
git diff --check
```

## Completion Report

- final branch/status
- commit hash/message
- changed files
- validation results
- skipped commands
- follow-up
