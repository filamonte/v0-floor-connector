# Chat: <Reconciliation Review Name>

Worktree: `<worktree path>`
Branch: `<branch name>`

This is a reconciliation-only task.

## Required Docs

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `.codex/worktree-rules.md`
- `.codex/active-stream-plan.md`

## Scope

- Inspect branch status and upstream drift.
- Fetch latest remote state.
- Review commits causing ahead/behind state.
- Merge or rebase safely only when requested.
- Preserve all local work.

## Out Of Scope

- Feature work.
- Opportunistic refactors.
- Deleting branches or worktrees.
- Resetting, force-pushing, or discarding local work.

## Expected Files

- None unless conflict resolution is required.

## Validation

- `git status`
- `git branch -vv`
- `pnpm worktree:doctor`
- `pnpm worktree:audit` when platform health is relevant.

## Git Requirements

- Check `git status` and current branch first.
- Inspect ahead/behind state before edits.
- Avoid staging unrelated changes.
- Handle ahead/behind safely.
- Resolve conflicts minimally.
- Validate before committing.
- Stage only intended conflict-resolution files.
- Commit only when reconciliation requires a merge/conflict-resolution commit.

## Final Report

- Previous ahead/behind.
- New ahead/behind.
- Commits reviewed.
- Conflicts encountered.
- Files affected.
- Validation results.
- Final status.
