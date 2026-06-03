# Chat: Portal Operational Trust Stride V1

Branch: `stream/portal-operational-trust-stride-v1`
Worktree: `C:\FC-worktrees\portal-operational-trust-stride`

## Goal

Clarify customer-safe portal continuity across project, contract, invoice, payment, and shared document review paths.

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

- Session/chat name: this prompt starts with `# Chat: Portal Operational Trust Stride V1`.
- Git start: check git status, current branch, and ahead/behind state; fetch origin before editing; preserve unrelated dirty files; stage only intended files.
- Scope: implement only the named stream outcome; keep changes small, reviewable, and inside expected file boundaries.
- Architecture safety: use existing canonical records, tenant-safe loaders/actions, and shared read models; do not add schema, migrations, new tables, new columns, Supabase policies, RLS, auth, env vars, route protection, payment math, provider behavior, duplicate persistence, portal-only copies, dispatch-only systems, disconnected communication models, disconnected scheduling models, disconnected financial models, or AI-only operational truth unless explicitly approved.
- Human approval: do not send customer-facing messages, request signatures, start payments, mutate invoices/payments/signatures/jobs/schedules, call providers, or expose new portal data without explicit human-reviewed workflow support.
- Dependencies: prefer after `project-readiness-stride-v1`; independent only when it does not define readiness behavior.
- Validation: run `pnpm.cmd --filter @floorconnector/web typecheck`, `pnpm.cmd --filter @floorconnector/web lint`, `pnpm.cmd fc:preflight:fast`, `git diff --check`, and focused unit/read-model tests when business shaping logic changes; if no tests are added, explain why existing coverage or presentation-only scope is sufficient.
- Commit/reporting: commit the completed slice, keep PRs draft unless explicitly instructed otherwise, do not auto-merge, and report branch, worktree, starting status, final status, ahead/behind, commit hash/message, changed files, validation results, tests added or why none, schema/migration confirmation, canonical/no-silo confirmation, customer-facing/human-approval confirmation, dependency status, risks, and follow-ups.

## Boundaries

- Do not change portal grants, RLS, auth, or route protection.
- Do not expose internal blockers, Job Notes, provider diagnostics, or contractor-only evidence.
- Do not create portal-specific business records.
- Do not redefine readiness rules; consume or mirror project-readiness language only after the project stream establishes it.
- Do not add portal-owned copies, portal-only payment state, portal-only document truth, or customer-visible internal operations language.
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
- Expected files are limited to portal routes/components and portal tenant-safe read/display helpers.
- Do not sweep unrelated portal, project, financial, auth, or docs files.
- If editing `docs/current-state.md`, coordinate so only one broad current-state editor is active at a time and preserve implemented truth.
- Keep PRs draft by default; do not mark ready for review, auto-merge, push, or merge unless explicitly requested and approved.
- Update docs only if implemented behavior changes.

## Acceptance Criteria

- Portal copy remains customer-safe and scoped by existing access checks.
- Customer actions route to canonical estimate, contract, invoice, and payment records.
- No portal-owned copies or access-rule changes are introduced.
- Customer-facing sends, signatures, payments, provider calls, and portal visibility changes remain human-approved existing workflows.

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
