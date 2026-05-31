# Chat: <SESSION_NAME>

Summarize the PR for FloorConnector stream `<STREAM_NAME>`.

- Branch/worktree: `<BRANCH_OR_WORKTREE>`
- PR: `<PR_URL_OR_NUMBER>`

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
- `.codex/control-tower.md`
- `.codex/stream-contracts/<STREAM_NAME>.md`

## Scope Allowed

Read-only diff review and PR summary generation.

## Scope Not Allowed

Code changes, pushes, merges, approvals, or ready-for-review transitions.

## Validation Commands

Use existing PR checks when available. Do not rerun long tests unless asked.

## Git Requirements

Do not modify files. Preserve dirty state.

## Completion Report

Report summary, user-visible change, technical change, risk areas, validation
evidence, docs updated, not included, and merge notes.
