# Chat: Project Readiness Stride V1

Branch: `stream/project-readiness-stride-v1`
Worktree: `C:\FC-worktrees\project-readiness-stride`

## Goal

Tighten Project Workspace readiness and next-action continuity over existing project, estimate, contract, job, invoice, and payment records.

## Required Docs

Read these before implementation:

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `docs/system-overview.md`
- `.codex/worktree-rules.md`
- `.codex/active-stream-plan.md`

## FloorConnector Codex Prompt Baseline Safeguards

- Session/chat name: this prompt starts with `# Chat: Project Readiness Stride V1`.
- Git start: check git status, current branch, and ahead/behind state; fetch origin before editing; preserve unrelated dirty files; stage only intended files.
- Scope: implement only the named stream outcome; keep changes small, reviewable, and inside expected file boundaries.
- Architecture safety: use existing canonical records, tenant-safe loaders/actions, and shared read models; do not add schema, migrations, new tables, new columns, Supabase policies, RLS, auth, env vars, route protection, payment math, provider behavior, duplicate persistence, portal-only copies, dispatch-only systems, disconnected communication models, disconnected scheduling models, disconnected financial models, or AI-only operational truth unless explicitly approved.
- Human approval: do not send customer-facing messages, request signatures, start payments, mutate invoices/payments/signatures/jobs/schedules, call providers, or expose new portal data without explicit human-reviewed workflow support.
- Dependencies: this is the source stream for wave readiness language and should run first.
- Validation: run `pnpm.cmd --filter @floorconnector/web typecheck`, `pnpm.cmd --filter @floorconnector/web lint`, `pnpm.cmd fc:preflight:fast`, `git diff --check`, and focused unit/read-model tests when business shaping logic changes; if no tests are added, explain why existing coverage or presentation-only scope is sufficient.
- Commit/reporting: commit the completed slice, keep PRs draft unless explicitly instructed otherwise, do not auto-merge, and report branch, worktree, starting status, final status, ahead/behind, commit hash/message, changed files, validation results, tests added or why none, schema/migration confirmation, canonical/no-silo confirmation, customer-facing/human-approval confirmation, dependency status, risks, and follow-ups.

## Boundaries

- Do not create a project activity table or duplicate project state.
- Do not mutate source records from read-model surfaces.
- Do not expose portal-only or contractor-only data incorrectly.
- Do not add autonomous AI behavior or AI-owned operational truth.
- Do not create duplicate readiness state; derive from existing project, estimate, contract, job, invoice, payment, communication, field, and portal context where already available.
- Do not change schema, migrations, Supabase policies, RLS, auth, env vars, route protection, payment math, provider behavior, or unrelated business logic.
- Do not create duplicate business models or portal-owned operational state.

## Required Git And Validation Workflow

- Start by checking git status, current branch, and ahead/behind state.
- Run git fetch origin.
- Avoid staging unrelated changes.
- Run git diff --check.
- Stage only intended files.
- Commit the completed slice.

## Implementation Requirements

- Preserve existing repo conventions and canonical records.
- Keep the slice bounded to the named product outcome.
- Expected files are limited to project detail/workspace components, project readiness and next-action read models, and a narrow `docs/current-state.md` update if implemented truth changes.
- Do not sweep unrelated project, financial, schedule, portal, or docs files.
- Own this wave's shared readiness language so downstream streams can consume it instead of redefining it.
- Keep PRs draft by default; do not mark ready for review, auto-merge, push, or merge unless explicitly requested and approved.
- Update docs only if implemented behavior changes.

## Acceptance Criteria

- Project-facing changes use existing canonical records and read models.
- No schema, auth, RLS, payment math, provider, or route-protection changes are made.
- Users can identify the next safe operational action more quickly.
- Customer-facing sends, signatures, payments, scheduling commitments, provider calls, and portal visibility remain human-approved existing workflows.

## Validation

Run:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
```

Add or update focused unit/read-model tests if this stream changes business shaping logic. If no tests are added, explain why the change is presentation-only or already covered.

## Final Response Requirements

Report branch name, worktree, starting status, final status, ahead/behind, commit hash and message, files changed, validation commands/results, tests added/updated or reason none, schema/migration confirmation, canonical/no-silo confirmation, customer-facing action/human-approval confirmation, dependency status, risks/follow-ups, skipped checks, assumptions, and limitations.
