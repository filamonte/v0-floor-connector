# Chat Handoff

Status: Active
Doc Type: Operational

This is a compact handoff for future Codex sessions. It is not a competing
source of truth. Use it to orient quickly, then verify implementation truth in
`docs/current-state.md`.

## Required First Reads

Read these before implementation or documentation work:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/product-language.md](C:/FloorConnector/docs/product-language.md)
- [docs/README.md](C:/FloorConnector/docs/README.md)
- [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)

## Current Operating Core Snapshot

FloorConnector is a production-first SaaS operating system for specialty
flooring contractors. The canonical lifecycle remains:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

The current branch has real Supabase-backed auth, tenancy, opportunities,
customers, projects, estimates, contracts, change orders, jobs, invoices,
payments, portal access, workforce/time/field foundations, settings,
super-admin foundations, and normalized contractor UI patterns.

Current operating-core surfaces include:

- Command Center dashboard with source-record attention groups and deterministic
  next moves.
- Project Workspace as the main continuity hub with ProjectPulse, FieldTrail,
  MessageCenter, CloseoutTrail, Proof Center, Send Trail context,
  service/warranty continuity, customer access, and closeout package handoff.
- CrewBoard on `/schedule` over canonical jobs, appointments, job assignments,
  people, vendors, projects, and customers.
- Portal Customer Window with Customer Next Step, Project Status Window,
  Project Timeline, Shared Documents, and existing portal review/print routes.
- Reports, Financial Control, Accounting Readiness, and Accounting Export Prep
  as read-only review/export-prep surfaces over source financial and
  operational records.
- Document Engine print/save routes for source-record exports, including the
  contractor-side project closeout package route.
- Service Center and warranty document foundations tied to customer, project,
  job, proof, and warranty context.
- Company Documents Phase 1C-A under `/settings/company-documents`, backed by the
  tenant-owned `company_documents` table, with contractor-side read and
  browser print/save routes for company administration documents. A small
  code-defined Starter Documents catalog now lets owner/admin/manager users
  preview and adopt starter examples into editable draft Company Documents;
  view-only members can preview only. Adoption creates a new draft copy from
  server-owned starter content and does not add schema, platform-admin starter
  management, live coupling, distribution, AI, legal advice, e-sign, storage,
  provider sending, public links, or delivery proof.
- Company Documents Phase 1 QA checkpoint is documented in
  [docs/design/company-documents-phase-1-qa-checkpoint.md](C:/FloorConnector/docs/design/company-documents-phase-1-qa-checkpoint.md).
  Static QA confirmed the Phase 1A/1B schema, RLS, scoped helpers, routes, and
  Document Engine print boundary; authenticated browser QA still needs a
  known-good local contractor session.
- Company Documents Phase 1C Starter Documents planning is documented in
  [docs/design/company-documents-phase-1c-starter-documents-plan.md](C:/FloorConnector/docs/design/company-documents-phase-1c-starter-documents-plan.md).
  The implemented Phase 1C-A starter adoption checkpoint is documented in
  [docs/design/company-documents-phase-1c-a-starter-adoption.md](C:/FloorConnector/docs/design/company-documents-phase-1c-a-starter-adoption.md).
  Later persisted platform starter management should wait until
  provenance/version governance is approved.
- Next-build priority checkpoint is documented in
  [docs/design/next-build-priority-checkpoint.md](C:/FloorConnector/docs/design/next-build-priority-checkpoint.md).
  Recommended order is Company Documents Phase 1C-A Starter Document Adoption,
  Staging Demo Seed Phase 2 owner-approved write-mode design, then Mobile Field
  Phase 2 quick Job Notes/evidence capture. If an external demo is the immediate
  goal, swap the first two.
- Global search hardening for tenant-scoped canonical records.

These layers are summaries, source-record handoffs, copy/hierarchy
improvements, or existing-action presentation around canonical records. They do
not create duplicate models or change core workflow behavior.

## Staging And Demo Status

Recent staging/demo work is docs-first and no-write:

- [docs/demo/operating-core-demo-path.md](C:/FloorConnector/docs/demo/operating-core-demo-path.md)
  is the current route-based demo path over real database-backed records.
- [docs/staging-deployment-readiness-audit.md](C:/FloorConnector/docs/staging-deployment-readiness-audit.md)
  inventories staging build commands, env names, Supabase/auth/provider risks,
  operating-core demo checks, and owner actions.
- [docs/staging-owner-runbook.md](C:/FloorConnector/docs/staging-owner-runbook.md)
  is the owner-controlled staging setup checklist.
- `pnpm staging:preflight` is local-only and checks repo structure, scripts,
  key docs/files, Node/pnpm, and `.env.example` variable names. It does not read
  `.env.local`, deploy, call providers, call Supabase, or mutate remote state.
- [docs/demo/staging-demo-data-plan.md](C:/FloorConnector/docs/demo/staging-demo-data-plan.md)
  defines the ideal canonical demo dataset and recommends owner-controlled
  auth/org setup plus a future dry-run-first seed script.
- [docs/demo/staging-demo-seed-script-spec.md](C:/FloorConnector/docs/demo/staging-demo-seed-script-spec.md)
  specifies the seed script safety boundary.
- `pnpm demo:data:seed:dry-run -- --organization-id <uuid> --owner-user-id
<uuid> --owner-email <owner@example.test> --portal-customer-email
<customer@example.test> --environment staging` runs the Phase 1 dry-run-only
  planner. It validates explicit inputs and prints planned dataset groups,
  idempotency notes, provider safety, portal safety, and future route checks.
  It does not import Supabase clients, read `.env.local`, write data, call
  providers, create auth users, create payment/signature/email events, or print
  portal invite tokens.

## Guardrails

- `docs/current-state.md` owns implemented truth.
- `docs/Roadmap.md`, `docs/vision.md`, `docs/target-ia.md`, and feature plans
  are direction unless current-state and code confirm implementation.
- Do not add fake dashboards, demo-only protected data, local-only persistence,
  portal-only copies, duplicate jobs/projects, or module-local record models.
- Do not weaken auth, RLS, tenant checks, portal grants, payment/signature
  state, estimate math, invoice math, readiness gates, settings, or
  platform-admin boundaries for QA or demo convenience.
- Company Documents is a settings library with contractor-side read,
  browser print/save, and code-defined Starter Documents adoption only; do not
  add AI drafting, legal advice, e-sign,
  portal/employee distribution, public links, provider sends,
  file upload/storage, persisted platform starter management, generated files,
  or delivery proof without a separate approved slice.
- Staging/demo data work must stay owner-approved, tenant-scoped, dry-run-first,
  provider-dark, and invite-token safe.
- Customer portal copy should be simpler and customer-safe; do not expose
  contractor-only FieldTrail, Proof Center, internal blockers, provider
  details, or internal Job Notes as portal capability.

## QA Caveats

Protected-route browser QA can be blocked by local Supabase Auth rate limits,
stale Playwright storage state, base-URL mismatch, or stale fixed fixture IDs.
Use [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)
before treating a protected-route redirect or fixture miss as product failure.

For current operating-core focused tests and route checks, use
[docs/operating-core-validation-checklist.md](C:/FloorConnector/docs/operating-core-validation-checklist.md).

## Recommended Next Build Options

Good next moves:

- Review the dry-run seed planner output with owner-approved staging
  identifiers before designing any future write-capable seed mode.
- If continuing Company Documents, use the Phase 1C-A Starter Document Adoption
  prompt from
  [docs/design/company-documents-phase-1c-starter-documents-plan.md](C:/FloorConnector/docs/design/company-documents-phase-1c-starter-documents-plan.md).
  Keep adoption contractor-owned and separate from AI drafting, legal advice,
  e-sign, acknowledgements, portal sharing, storage, delivery proof, and
  platform-admin management.
- If choosing the next pillar, use
  [docs/design/next-build-priority-checkpoint.md](C:/FloorConnector/docs/design/next-build-priority-checkpoint.md)
  to decide between product momentum, demo/staging credibility, and mobile field
  stickiness.
- Run a real-record operating-core demo rehearsal using
  [docs/demo/operating-core-demo-path.md](C:/FloorConnector/docs/demo/operating-core-demo-path.md)
  and record blockers honestly.
- Pick one guarded non-finance product polish item found during the demo
  walkthrough.

Avoid broad accounting sync, provider posting, AI automation, reminders, stored
billing packets, customer billing-center settings, or live staging/provider
actions until the relevant approval and boundary docs are explicit.
