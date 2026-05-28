# Operational Capability Waves v1 Coordination

Status: Planning-only
Doc Type: Design Coordination

## Status And Intent

This document coordinates four planning-only capability-wave docs. It is not
implementation truth, does not change current status, and does not authorize
building all four waves at once.

For implemented status, use
[docs/current-state.md](C:/FloorConnector/docs/current-state.md). These plans
describe safe sequencing and cross-stream boundaries for future slices over the
canonical FloorConnector operating system.

## Source Docs Included

- [docs/design/project-workspace-capability-wave-v1.md](C:/FloorConnector/docs/design/project-workspace-capability-wave-v1.md)
- [docs/design/scheduling-capability-wave-v1.md](C:/FloorConnector/docs/design/scheduling-capability-wave-v1.md)
- [docs/design/field-mobile-capability-wave-v1.md](C:/FloorConnector/docs/design/field-mobile-capability-wave-v1.md)
- [docs/design/portal-capability-wave-v1.md](C:/FloorConnector/docs/design/portal-capability-wave-v1.md)

## Implementation Order

1. Project Workspace
2. Scheduling
3. Field/Mobile
4. Portal

## Why This Order Matters

Project Workspace should land first because it is the contractor-side
readiness and continuity hub. It should clarify current stage, blockers,
linked records, financial readiness, field continuity, and schedule/job
handoffs before downstream work expands.

Scheduling should follow because CrewBoard extends canonical `jobs` and
`job_assignments`. It depends on clean project readiness and should mature
derived queues, resource-load warnings, selected-job actions, and QA without
inventing a dispatch subsystem.

Field/Mobile should follow Scheduling because field execution is downstream of
scheduled and assigned canonical jobs. Mobile field work should make current
day execution easier to scan and capture through jobs, Daily Logs, Field Notes,
execution attachments, people, vendors, and time records without creating a
separate field app source of truth.

Portal should follow the contractor-side truth. It is a customer-facing
read/action surface over scoped canonical records, so it should not expose or
promise schedule, field, payment, document, or project state before the
contractor-owned source of truth is stable and customer-safe.

## Shared Canonical Rules

- Do not create duplicate business models.
- Project remains the readiness and continuity hub.
- Scheduling extends canonical `jobs` and `job_assignments`.
- Field/Mobile extends canonical `jobs`, `daily_logs`, `field_notes`,
  `execution_attachments`, `people`, `vendors`, and time records.
- Portal is a scoped read/action surface over canonical records, not the owner
  of operational state.
- Keep the canonical lifecycle intact:
  `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`.
- Keep Quick-Create and universal create canonical-first: create or select the
  real record, then route into the owning workspace.

## Cross-Stream Hotspot Map

Project detail/workspace files:

- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/lib/projects/operational-workspace.ts`
- `apps/web/lib/projects/readiness.ts`
- `apps/web/lib/projects/cues.ts`
- `apps/web/lib/projects/timeline.ts`
- `apps/web/lib/projects/evidence-continuity.ts`

Schedule page, read model, warnings, and action panel:

- `apps/web/app/(app)/schedule/page.tsx`
- `apps/web/lib/schedule/read-model.ts`
- `apps/web/lib/schedule/warnings.ts`
- `apps/web/lib/schedule/links.ts`
- `apps/web/lib/schedule/move.ts`
- `apps/web/lib/schedule/proposed-move.ts`
- `apps/web/components/ready-to-schedule-action-panel.tsx`
- `apps/web/components/schedule-job-form.tsx`
- `apps/web/components/schedule-crew-assignment-form.tsx`

Jobs data/actions:

- `apps/web/app/(app)/jobs/page.tsx`
- `apps/web/app/(app)/jobs/[jobId]/page.tsx`
- `apps/web/lib/jobs/data.ts`
- `apps/web/lib/jobs/actions.ts`
- `apps/web/lib/jobs/manager-read-model.ts`

Daily Logs, Field Notes, execution attachments, and time:

- `apps/web/app/(app)/daily-logs/page.tsx`
- `apps/web/app/(app)/daily-logs/[dailyLogId]/page.tsx`
- `apps/web/lib/daily-logs/data.ts`
- `apps/web/lib/daily-logs/actions.ts`
- `apps/web/lib/field-notes/data.ts`
- `apps/web/lib/field-notes/schemas.ts`
- `apps/web/lib/execution-attachments/data.ts`
- `apps/web/lib/execution-attachments/storage.ts`
- `apps/web/lib/execution-attachments/preview.ts`
- `apps/web/lib/time/data.ts`
- `apps/web/lib/time/actions.ts`

Portal loaders, routes, and access grants:

- `apps/web/app/(portal)/portal/page.tsx`
- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
- `apps/web/app/(portal)/portal/estimates/[estimateId]/page.tsx`
- `apps/web/app/(portal)/portal/contracts/[contractId]/page.tsx`
- `apps/web/app/(portal)/portal/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(portal)/portal/change-orders/[changeOrderId]/page.tsx`
- `apps/web/lib/portal/data.ts`
- `apps/web/lib/portal/next-step.ts`
- `apps/web/lib/portal/project-status-window.ts`
- `apps/web/lib/portal-access/data.ts`
- `apps/web/lib/portal-access/actions.ts`
- `apps/web/lib/portal-evidence-grants/data.ts`
- `apps/web/lib/portal-evidence-grants/actions.ts`

E2E specs:

- `e2e/project-detail-ui.spec.js`
- `e2e/schedule-ready-handoff.spec.js`
- `e2e/portal-golden-path.spec.js`
- `e2e/portal-invite-acceptance.spec.js`
- `e2e/portal-estimate-actions.spec.js`
- `e2e/portal-contract-actions.spec.js`
- `e2e/portal-invoice-checkout-start.spec.js`
- `e2e/portal-change-order-actions.spec.js`

## Merge Conflict Risks And Ownership Recommendations

- Assign one owner to `apps/web/app/(app)/projects/[projectId]/page.tsx`
  during Project Workspace extraction.
- Assign one owner to `apps/web/app/(app)/schedule/page.tsx`; componentize it
  before adding more scheduling UI.
- Land schedule read-model and warning changes before broad CrewBoard UI
  changes.
- Keep `apps/web/lib/jobs/data.ts` and `apps/web/lib/jobs/actions.ts` narrow
  and avoid concurrent edits unless a server-action slice is explicitly
  approved.
- Keep portal loader changes in `apps/web/lib/portal/data.ts` behind explicit
  customer-safe field review.
- Keep E2E fixture changes separate from page/component refactors so failures
  can be attributed cleanly.

## Recommended First Implementation Slices Across Streams

- Project Workspace: extract and stabilize a read-only Project Readiness +
  Next Action panel over existing project helpers.
- Scheduling: decompose the CrewBoard read model and queue types before
  changing `/schedule` presentation.
- Field/Mobile: audit existing job, assignment, Daily Log, Field Note,
  execution attachment, work item, people/vendor, and time helpers for a
  mobile today/assigned-work queue.
- Portal: audit scoped portal loaders and access checks, then polish
  customer-safe next-action copy over already loaded data.

These are sequential starts, not parallel implementation permission.

Post-reconciliation note: the portal stream has now completed its first
read-model/customer-safe next-action polish and a follow-up QA hardening pass.
Further portal work should wait for merge/reconcile review and focused QA
unless a later slice is explicitly scoped. This does not change the planning
status of this coordination doc or authorize schedule, field, billing,
document, message, or payment state ownership inside the portal.

## Combined Validation Plan

For docs-only reconciliation:

- `git diff --check`
- `git diff --cached --check`
- Prettier check or write for changed Markdown files if available

For future implementation slices:

- targeted unit tests for touched pure helpers
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- focused Playwright specs for the touched surface
- desktop and 390px authenticated browser smoke when protected auth is healthy
- honest blocker reporting for stale auth, missing fixtures, or Supabase Auth
  rate limits

## Out-Of-Scope Guardrails

- No schema, migrations, RLS, or database type changes from this coordination
  plan.
- No route changes, server-action changes, UI behavior changes, package
  changes, dependency installs, or test rewrites from this docs-only pass.
- No fake dashboards, local-only persistence, seed logic, portal-only state, or
  mock business workflows.
- No claim that these four waves are implemented.
- No implementation order that implies all four streams should build at the
  same time.

## Do Not Build Yet

- scheduling or dispatch tables separate from `jobs` and `job_assignments`
- mobile-only job, field issue, blocker, punchlist, attachment, or time models
- portal-owned project, schedule, field, document, message, billing, contract,
  invoice, change-order, payment, or evidence records
- customer self-scheduling
- customer-visible Daily Log bodies, Job Notes, internal blockers, Work Item
  instructions, unshared evidence, or contractor-only readiness details
- autonomous AI scheduling, field, payment, signature, portal, or customer-send
  actions
- broad offline sync, geofencing, payroll, route optimization, external
  calendar sync, provider sends, stored PDFs, or document repository behavior
  without separate approved plans
