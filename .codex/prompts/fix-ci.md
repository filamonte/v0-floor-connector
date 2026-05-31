# Chat: <SESSION_NAME>

Fix CI for FloorConnector stream `<STREAM_NAME>`.

- Branch/worktree: `<BRANCH_OR_WORKTREE>`
- CI failure link/log: `<CI_CONTEXT>`

## Required Start

```powershell
git status --short --branch
git branch --show-current
git fetch origin
```

## Required Docs

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `.codex/control-tower.md`
- `.codex/stream-contracts/<STREAM_NAME>.md`

## Scope Allowed

Only the smallest fix that addresses the CI failure.

## Scope Not Allowed

Broad rewrites, feature expansion, schema/migrations, production env, secrets,
or unrelated formatting churn.

## Validation Commands

Rerun the failing command locally when possible, then:

```powershell
pnpm fc:preflight:fast
git diff --check
```

## Git Requirements

Preserve branch history, stage only intended files, commit the fix, and report
whether pushing would update an existing PR.

## Completion Report

Report root cause, files changed, commit hash/message, validation, skipped
commands, and residual risk.
