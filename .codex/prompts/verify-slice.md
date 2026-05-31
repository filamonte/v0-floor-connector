# Chat: <SESSION_NAME>

Verify FloorConnector stream `<STREAM_NAME>` without widening scope.

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
- `.codex/control-tower.md`
- `.codex/stream-contracts/<STREAM_NAME>.md`

## Scope Allowed

Read-only audit, validation, PR readiness, and tiny test/documentation fixes
needed to make existing intended validation truthful.

## Scope Not Allowed

New product features, schema, migrations, provider calls, production env,
remote database writes, or unrelated refactors.

## Validation Commands

```powershell
pnpm fc:status
pnpm fc:preflight:fast
git diff --check
```

Run focused stream tests if present.

## Git Requirements

If fixes are required, stage only intended files and commit the completed fix.
Otherwise create no commit.

## Completion Report

Report branch state, dirty state, validation results, blockers, commit if any,
and PR readiness.
