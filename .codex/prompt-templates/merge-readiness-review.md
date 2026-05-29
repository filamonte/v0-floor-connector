# Chat: <Merge Readiness Review Name>

Worktree: `<worktree path>`
Branch: `<branch name>`

This is a review-only pass unless explicitly instructed to merge.

## Required Docs

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `.codex/worktree-rules.md`
- `.codex/active-stream-plan.md`
- relevant capability-wave docs

## Scope

- Review changed files and commits.
- Identify overlap, hotspots, forbidden changes, and validation gaps.
- Recommend merge order and exact next commands.

## Out Of Scope

- Performing merges unless explicitly instructed after the review.
- Feature work.
- Deleting branches or worktrees.
- Resetting or force-pushing.

## Expected Files

- None.

## Validation

- `git status`
- `git fetch origin`
- `git diff --name-only main..<branch>`
- `git log --oneline main..<branch>`
- Existing branch summary validation, if available.

## Git Requirements

- Check `git status` and current branch first.
- Inspect ahead/behind state.
- Avoid staging unrelated changes.
- Handle ahead/behind safely.
- Validate review conclusions with concrete commands.
- Do not commit unless explicitly asked and files change.

## Final Report

- Branch status.
- Changed files.
- Overlaps and hotspots.
- Forbidden-change check.
- Validation evidence.
- Recommended merge order.
- Exact next commands.
- Whether it is safe to merge now.
