# Development Operating Model

Status: Active
Doc Type: Developer Operations

## Purpose

FloorConnector uses a hybrid development control tower so multiple streams can
move quickly without losing branch truth, product truth, validation truth, or
ownership clarity.

This is development-process guidance only. It does not change product runtime
behavior and does not replace [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
as implemented truth.

## Principles

- Keep `main` as the canonical integration branch.
- Preserve the canonical lifecycle:
  `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`.
- Keep contractor app, portal, reporting, communications, scheduling, field, and
  AI surfaces over shared canonical records.
- Keep streams small enough to review, validate, and merge.
- Prefer early status visibility over late conflict discovery.
- Treat documentation updates as product truth changes only when behavior
  actually changed.
- Automate repeated checks, not risky decisions.

## Stream Classes

- **Control Tower / Architecture**: governance, sequencing, worktree health,
  prompt contracts, PR readiness, and cross-stream drift.
- **Verification**: merge-gate QA, route smoke, fixture/auth health, and
  validation evidence.
- **Feature Stream**: one bounded product or workflow slice on an owned
  worktree and branch.
- **Cleanup Stream**: narrow post-merge hygiene, registry alignment, or tooling
  repair.
- **Paused / Downstream Stream**: preserved for later work, not active until the
  registry says so.
- **Legacy / Review Needed Stream**: preserved local work that needs explicit
  reconciliation before retirement.

## Control Tower Responsibilities

- Keep `active-worktrees.md`, `.codex/active-stream-plan.md`, and
  `docs/stream-control-board.md` aligned with real local state.
- Assign stream ownership and shared-risk file expectations before work starts.
- Recommend merge order and next safe PR.
- Detect branch drift, dirty worktrees, stale PRs, and docs drift.
- Keep reusable prompts and stream contracts current.
- Route product truth changes to the product change ledger after merge.

## Tool Responsibilities

- **ChatGPT**: product owner, architect, planning, audit, PR-readiness review,
  and cross-stream coordination.
- **Local Codex CLI**: local implementation, focused stream work, validation,
  commits, and branch hygiene inside the correct worktree.
- **Codex IDE Extension**: editor-local assistance, local code explanation, and
  optional cloud delegation when the task is safe to hand off.
- **Codex Cloud**: background feature slices and PR creation from GitHub issues
  or cloud tasks. It must open PRs, not merge them.
- **GitHub Actions**: repeatable validation, PR review summaries, CI failure
  analysis, and non-mutating checks.
- **GitHub Issues / PRs**: durable task handoff, review evidence, validation
  results, and merge notes.
- **VS Code Workspace**: local review/debug cockpit across main and selected
  worktrees.
- **Human Owner**: approves risky actions, merge order, production/secrets
  actions, remote database actions, and final merges.

## Integration Rules

- A stream owns its contract files and scoped product files only for the active
  slice.
- Shared-risk files require explicit mention in the task and final report.
- Streams should merge or rebase from `main` only when the current workflow
  calls for it and after local work is clean or safely committed.
- Do not widen an open PR by pushing unrelated local commits.
- PRs stay draft until validation and human confirmation are complete.

## Main Branch Rules

- `main` is the implemented source of truth.
- Pull `main` with fast-forward only when updating local canonical state.
- Do not merge stream branches into `main` locally.
- Do not force-push `main`.
- Do not treat planning docs as implemented status unless `main` contains the
  behavior and `docs/current-state.md` says so.

## Allowed Automatic Actions

- Read-only status checks.
- Formatting checks and formatting of explicitly changed supported files.
- Local lint, typecheck, unit/helper tests, and safe focused browser checks.
- Draft PR creation when the branch is clean and the PR scope matches the
  completed slice.
- PR review summary comments when configured as advisory only.

## Ask-First Actions

- Pushing a branch that already has an open PR with local-only commits.
- Rebasing or rewriting shared branch history.
- Editing active-stream registry files from a feature stream.
- Touching schema, migrations, auth, RLS, payments, signatures, portal access,
  production env, or provider integration code.
- Running long browser suites, remote write tests, or fixtures that mutate
  remote data.
- Enabling new GitHub Actions that require secrets or paid usage.

## Never-Automatic Actions

- Merge to `main`.
- Force-push.
- Apply remote Supabase migrations.
- Modify production environment variables.
- Print, create, commit, or store secrets.
- Send customer email/SMS, provider calls, payment actions, signature actions,
  or autonomous scheduling actions unless a separately approved product slice
  explicitly implements them with human review.

## Daily Workflow

1. Run `pnpm fc:status` or `node scripts/fc-stream-status.mjs`.
2. Review `docs/stream-control-board.md` for active ownership and blockers.
3. Pick one stream and one slice.
4. Start in the correct worktree and run Git start checks.
5. Read required docs and the stream contract.
6. Implement, validate, commit, and report.
7. Open or update a draft PR only when the branch scope is clean.
8. Update the product change ledger only after merge, unless the entry is
   clearly marked Draft / Pending.

## Merge Queue / Integration Guidance

- Merge smallest ready streams first when they unblock larger streams.
- Prefer feature streams that are cleanly ahead of `main`, validated, and have
  low shared-risk overlap.
- Run a post-merge stabilization pass after each important PR.
- Update paused or downstream streams from `main` only when the next slice is
  selected.

## Product Change Ledger Rules

- Use `docs/product-change-ledger.md` for product-owner-readable landed changes.
- Merged entries are the default.
- Draft / Pending entries are allowed only when clearly marked and should be
  resolved after merge or abandoned work.
- The ledger should explain user-visible change, technical change, validation,
  not-included scope, and follow-up.

## Status Dashboard Usage

Use `docs/stream-control-board.md` as the manually editable control board.
It should reflect reality, not aspirations. If Git output, PR state, or local
validation disagrees with the board, update the board or report the mismatch.

Use `pnpm fc:status` for live local evidence before editing the board.

## How This Accelerates Development

This model speeds development by making the next safe action obvious. Streams
can keep moving because ownership, validation, PR readiness, and handoff rules
are explicit. The control tower prevents hidden drift, so parallel work does not
turn into late conflict resolution, duplicated models, stale docs, or unclear
merge order.
