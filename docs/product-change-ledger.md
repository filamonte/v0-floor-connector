# Product Change Ledger

Status: Active
Doc Type: Developer Operations

## Purpose

This ledger gives the product owner a readable record of what actually landed.
It is not a planning backlog and it does not replace `docs/current-state.md`.

## Rules

- Add entries when a PR merges or when a change is intentionally tracked as
  Draft / Pending.
- Prefer merged-only entries. Draft / Pending entries must be clearly labeled
  and resolved after the PR merges or is abandoned.
- Write for product-owner readability first, then include enough technical
  detail for traceability.
- Do not use this ledger to claim future or planned capabilities as shipped.
- Include what was not included so follow-up work does not get mistaken for
  done work.

## Entry Template

```md
### YYYY-MM-DD - <Title>

- Status:
- Stream:
- PR:
- Commit:
- User-visible change:
- Technical change:
- Validation:
- Docs updated:
- Not included:
- Follow-up:
```

## Entries

### 2026-05-31 - Retire Superseded Financials Stream

- Status: Draft / Pending until merged
- Stream: Control Tower / Architecture
- PR: Pending
- Commit: Pending
- User-visible change: None. This is development-control hygiene only.
- Technical change: Marks the stale local `stream/financials` branch/worktree
  as retired and superseded by `stream/financials-reporting` in the control
  tower status docs. The local worktree and branch are not removed by this
  commit.
- Validation: `pnpm fc:status` passed. `pnpm fc:preflight:fast` ran with
  Prettier, typecheck, and `git diff --check` passing; lint remains blocked by
  the pre-existing duplicate union constituent issue in
  `packages/types/src/index.ts`.
- Docs updated: `docs/stream-control-board.md`, `active-worktrees.md`,
  `active-waves.md`, and this ledger.
- Not included: No product runtime behavior, schema, migrations, provider
  calls, production env changes, remote branch deletion, local worktree removal,
  or local branch deletion.
- Follow-up: After human review, optionally remove the local retired worktree
  with `git worktree remove C:\FC-worktrees\financials`; delete local or remote
  branches only after explicit confirmation.

### 2026-05-31 - Development Control Tower Phase 0

- Status: Draft / Pending until merged
- Stream: Control Tower / Architecture
- PR: Pending
- Commit: Pending
- User-visible change: Adds developer control tower docs, prompts, local status
  helpers, preflight helpers, PR templates, and handoff folders so parallel
  development is easier to coordinate.
- Technical change: Adds read-only Node scripts for stream status and local
  preflight, repo-native agent handoff templates, Codex stream contracts, GitHub
  advisory prompt templates, a disabled example PR-review workflow, and package
  scripts.
- Validation: Pending in this branch.
- Docs updated: `docs/development-operating-model.md`,
  `docs/stream-control-board.md`, `docs/codex-cloud-setup.md`,
  `docs/local-codex-cli-workflow.md`, and this ledger.
- Not included: No product runtime behavior, schema, migrations, provider
  calls, production env changes, or automatic merge behavior.
- Follow-up: Resolve this entry with the merged PR and commit hash after merge.
