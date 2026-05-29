# Chat: <Planning Session Name>

Worktree: `<worktree path>`
Branch: `<branch name>`

You are operating as FloorConnector's architecture-coordination stream.

This is a planning/coordination task only unless explicitly widened.

## Required Docs

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `.codex/worktree-rules.md`
- `.codex/parallel-development.md`
- `.codex/active-stream-plan.md`
- relevant capability-wave docs

## Scope

- Clarify sequencing, dependencies, hotspots, and merge order.
- Produce implementation prompts or review guidance.
- Preserve canonical lifecycle and anti-silo rules.

## Out Of Scope

- Feature implementation.
- Schema, migrations, routes, server actions, UI behavior, tests, or provider
  changes unless explicitly requested.
- Claims that planned work is implemented.

## Expected Files

- Coordination docs or prompt templates only, if a file change is requested.

## Validation

- `pnpm worktree:doctor`
- `pnpm prettier --check <changed docs>`
- `git diff --check`

## Git Requirements

- Check `git status` and current branch first.
- Inspect ahead/behind state before edits.
- Avoid staging unrelated changes.
- Handle ahead/behind safely; do not reset or force-push.
- Validate before committing.
- Stage only intended files.
- Commit completed slice when requested.

## Final Report

- Branch and final status.
- Commit hash/message, if committed.
- Files changed.
- Docs read.
- Validation results.
- Remaining risks.
- Exact next implementation prompt.
