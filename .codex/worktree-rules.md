# Codex Worktree Rules

Status: Active
Doc Type: Developer Operations

This file is the shared operating rulebook for Codex sessions working in
FloorConnector worktrees. It complements, but does not replace,
`docs/developer-source-of-truth.md` or `docs/current-state.md`.

## Required Docs

Read these before implementation or documentation work:

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`

Use `docs/README.md` to locate supporting docs when a task touches a specific
surface, workflow, or planning stream.

## FloorConnector Guardrails

- Preserve the canonical record chain:
  `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`.
- Do not create duplicate customer, project, estimate, contract, job, invoice,
  payment, portal, field, scheduling, communication, or AI business models.
- Portal surfaces read or act on canonical records through scoped access; they
  must not own operational state.
- Financial work stays on canonical invoices, payments, payment events,
  approved estimate snapshots, schedule of values, and approved change orders.
- Scheduling and field work extend canonical `jobs`, `job_assignments`,
  `daily_logs`, `field_notes`, `execution_attachments`, `people`, `vendors`,
  and time records instead of creating module-local systems.
- Do not bypass workflow gates, project readiness, tenant isolation, Supabase
  RLS, auth boundaries, estimate math, invoice math, payment state, signature
  state, or portal grants.

## Git Requirements

- Inspect `git status --short --branch` before edits.
- Confirm the current branch before edits.
- Treat dirty files you did not create as user-owned.
- Stage only intended files.
- Commit completed slices when the prompt asks for a commit.
- Do not merge, rebase, reset, clean, or force-push unless explicitly asked.

## Validation Requirements

- Run the narrowest meaningful checks for the slice.
- Run Prettier checks or writes on changed supported files.
- Run lint, typecheck, tests, or focused E2E only when applicable to the changed
  surface and safe for the task scope.
- For worktree platform work, run `pnpm worktree:doctor` and
  `pnpm worktree:status`.
- Report checks that could not run and why.

## Commit Reporting Format

Final responses should include:

- branch and final git status
- commit hash and message, when committed
- files added
- files modified
- docs read
- validation commands and results
- blockers or follow-up dependencies

Do not claim planned work is implemented unless `docs/current-state.md` and the
current code prove it.
