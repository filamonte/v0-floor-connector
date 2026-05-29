# Chat: <Verification Wave Name>

Worktree: `<worktree path>`
Branch: `<branch name>`

You are operating as FloorConnector's verification stream.

## Required Docs

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `.codex/worktree-rules.md`
- `.codex/active-stream-plan.md`
- relevant QA or capability docs

## Scope

- Validate implemented behavior against current truth.
- Improve verification docs or tests only when scoped.
- Report blockers honestly.

## Out Of Scope

- Feature implementation.
- Schema, migrations, routes, business logic, auth bypasses, fake data, or
  local-only persistence.
- Treating redirects, 404s, or missing fixtures as successful QA unless that is
  the expected negative case.

## Expected Files

- E2E specs, QA docs, fixture validation scripts, or no files if this is
  verification-only.

## Validation

- `pnpm worktree:doctor`
- Targeted test/smoke command.
- `pnpm worktree:audit` when validating merge readiness.
- Prettier for changed docs/specs.

## Git Requirements

- Check `git status` and current branch first.
- Inspect ahead/behind state before edits.
- Avoid staging unrelated changes.
- Handle ahead/behind safely.
- Validate before committing.
- Stage only intended files.
- Commit completed test/docs slice when files change.

## Final Report

- Branch and final status.
- Commit hash/message, if committed.
- Files changed.
- Docs read.
- Validation commands and outcomes.
- Confirmed behavior.
- Blockers and residual risk.
