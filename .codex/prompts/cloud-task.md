# Chat: <SESSION_NAME>

You are Codex Cloud working on FloorConnector stream `<STREAM_NAME>`.

- Branch/worktree expectation: `<BRANCH_OR_WORKTREE>`
- Open a pull request. Do not merge it.

## Required Start

Check branch/status first, fetch origin, and preserve ahead/behind state safely.
Avoid unrelated changes.

## Required Docs

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `.codex/control-tower.md`
- `.codex/stream-contracts/<STREAM_NAME>.md`

## Scope Allowed

`<SCOPE_ALLOWED>`

## Scope Not Allowed

No production env changes, secrets, remote Supabase migrations, provider sends,
payment/signature/portal-access mutations, broad rewrites, or unrelated
formatting churn.

## Validation Commands

```powershell
pnpm fc:preflight:fast
git diff --check
```

Run focused tests for touched helpers when available.

## Git Requirements

- Stage only intended files.
- Commit the completed slice.
- Push the branch only for PR creation.
- Open a PR against `main`.
- Keep the PR draft unless the human owner explicitly requested ready state.
- Do not merge.

## PR Completion Report

In the PR body include final branch/status, commit hash/message, changed files,
validation results, skipped commands and why, shared-risk files, docs updated,
not included, and follow-up.
