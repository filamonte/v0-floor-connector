# Chat: <Implementation Wave Name>

Worktree: `<worktree path>`
Branch: `<branch name>`

You are implementing one bounded FloorConnector capability wave.

## Required Docs

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `.codex/worktree-rules.md`
- `.codex/active-stream-plan.md`
- relevant capability-wave doc

## Scope

- Implement only the named wave.
- Use existing canonical records and local patterns.
- Keep the slice independently testable and reviewable.

## Out Of Scope

- Duplicate business models.
- Unscoped schema or migrations.
- Portal-owned operational state.
- Financial math changes unless explicitly scoped.
- Autonomous AI, provider sends, or hidden workflow state.
- Broad refactors outside the wave.

## Expected Files

- `<list likely files here>`

## Validation

- `pnpm worktree:doctor`
- Prettier check/write for changed supported files.
- Targeted typecheck, unit tests, or route smoke for the changed surface.
- Document any auth, data, or environment blocker honestly.

## Git Requirements

- Check `git status` and current branch first.
- Inspect ahead/behind state before edits.
- Avoid staging unrelated changes.
- Handle ahead/behind safely; reconcile before implementation if needed.
- Validate before committing.
- Stage only intended files.
- Commit completed slice.

## Final Report

- Branch and final status.
- Commit hash/message.
- Files changed.
- Docs read.
- Validation results.
- Behavior changed and behavior intentionally not changed.
- Remaining risks and recommended next wave.
