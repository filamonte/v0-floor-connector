# Chat: <SESSION_NAME>

Run an integration review for FloorConnector stream `<STREAM_NAME>`.

- Branch/worktree: `<BRANCH_OR_WORKTREE>`

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
- `active-worktrees.md`
- `.codex/active-stream-plan.md`
- `.codex/control-tower.md`
- `.codex/stream-contracts/<STREAM_NAME>.md`

## Scope Allowed

Read-only branch, diff, docs, validation, shared-risk, and merge-order review.

## Scope Not Allowed

New product work, merge to `main`, branch deletion, force-push, production env,
remote migrations, or provider actions.

## Validation Commands

```powershell
pnpm fc:status
pnpm wave:status
pnpm fc:preflight:fast
git diff --check
```

## Git Requirements

Create no commit unless a tiny explicitly necessary integration-doc correction
is made. Stage only intended files.

## Completion Report

Report readiness, blockers, changed files if any, validation, stream impact,
and next safest merge or PR action.
