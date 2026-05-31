# Chat: <SESSION_NAME>

You are working on FloorConnector stream `<STREAM_NAME>`.

- Branch/worktree: `<BRANCH_OR_WORKTREE>`
- Goal: implement the smallest complete slice described below.

## Required Start

Run:

```powershell
git status --short --branch
git branch --show-current
git fetch origin
```

Preserve ahead/behind state safely. Do not touch unrelated dirty files.

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

`<SCOPE_NOT_ALLOWED>`

## Validation Commands

```powershell
pnpm fc:preflight:fast
git diff --check
```

Add focused tests for touched helpers or behavior.

## Git Requirements

- Stage only intended files.
- Commit the completed slice.
- Do not push unless explicitly asked.
- Do not merge to `main`.

## Completion Report

Report final branch/status, commit hash/message, changed files, validation
results, skipped commands, and follow-up.
