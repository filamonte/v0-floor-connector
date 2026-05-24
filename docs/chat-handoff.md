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
- Company Documents Starter Adoption QA is documented in
  [docs/design/company-documents-starter-adoption-qa-checkpoint.md](C:/FloorConnector/docs/design/company-documents-starter-adoption-qa-checkpoint.md).
  The checkpoint confirmed code-defined starter safety, server-owned adoption
  data, existing owner/admin/manager manage scope, visible disclaimer copy, and
  protected-route browser visibility with saved local contractor auth. Adoption
  submit was intentionally not exercised to avoid creating a real draft row in
  the configured development data source.
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
- Mobile Field Phase 2 is implemented in
  [docs/design/mobile-field-phase-2-quick-job-notes-evidence.md](C:/FloorConnector/docs/design/mobile-field-phase-2-quick-job-notes-evidence.md).
  It adds Job Workspace quick actions for Job Notes, blockers, Daily Job Log
  open/start, and field evidence; Daily Job Log section anchors for Job Notes
  and Field Evidence; and FieldTrail Next Move routing to those anchors. It
  reuses Daily Job Logs, Job Notes, execution attachments, jobs, projects, and
  time context only.
- Mobile Field Phase 2 QA is documented in
  [docs/design/mobile-field-phase-2-qa-checkpoint.md](C:/FloorConnector/docs/design/mobile-field-phase-2-qa-checkpoint.md).
  Static QA confirmed no new field subsystem, duplicate note model, schema,
  upload/storage behavior, portal exposure, or automation. Mobile browser smoke
  loaded `/daily-logs`, `/jobs`, and `/schedule` with saved contractor auth;
  Daily Log and Job detail checks were blocked by local Supabase Auth
  `over_request_rate_limit` and should be retried only after auth cooldown.
- Mobile Field Phase 3 evidence upload planning is documented in
  [docs/design/mobile-field-phase-3-evidence-upload-proof-flow.md](C:/FloorConnector/docs/design/mobile-field-phase-3-evidence-upload-proof-flow.md).
  The plan confirms current `execution_attachments` are Daily Log / Job Note
  metadata references, not uploads, and recommends Phase 3A storage readiness
  before adding field evidence file upload, previews, signed URLs, or customer
  sharing.
- Mobile Field Phase 3A storage readiness is documented in
  [docs/design/mobile-field-phase-3a-evidence-storage-readiness.md](C:/FloorConnector/docs/design/mobile-field-phase-3a-evidence-storage-readiness.md).
  The audit recommends reusing the private `documents` bucket with a dedicated
  project/Daily Log field-evidence prefix, server-generated paths, server-side
  upload first, contractor-only signed URL resolution, and no portal/customer
  field evidence exposure.
- Mobile Field Phase 3C evidence upload foundation is documented in
  [docs/design/mobile-field-phase-3c-evidence-upload-foundation.md](C:/FloorConnector/docs/design/mobile-field-phase-3c-evidence-upload-foundation.md).
  Daily Log detail now uploads JPG, PNG, WebP, or PDF field evidence to the
  private `documents` bucket through server-generated organization/project/Daily
  Log paths, then creates the existing `execution_attachments` metadata row.
  This is contractor-only and intentionally does not add previews, signed URL
  downloads, delete/archive, portal/customer exposure, schema, migrations,
  public URLs, AI, notifications, automation, or provider behavior.
- Mobile Field Phase 3C QA is documented in
  [docs/design/mobile-field-phase-3c-qa-checkpoint.md](C:/FloorConnector/docs/design/mobile-field-phase-3c-qa-checkpoint.md).
  The checkpoint confirmed private `documents` bucket upload boundaries,
  server-generated paths, upload-before-metadata sequencing, file validation,
  Daily Log / Job Note parent validation, existing FieldTrail / Proof Center /
  CloseoutTrail metadata integration, and portal exclusion. It also replaced raw
  private storage path display on Daily Log detail with contractor-facing stored
  evidence status text. No real upload was submitted in browser QA.
- CrewBoard Phase 3 drag/drop dispatch planning is documented in
  [docs/design/crewboard-phase-3-drag-drop-dispatch-spec.md](C:/FloorConnector/docs/design/crewboard-phase-3-drag-drop-dispatch-spec.md).
  The recommended path is confirmation-first: add pure move helpers and
  keyboard/manual scheduling around the existing selected-job action panel
  before any pointer drag/drop package. Drag/drop should create a proposed move
  only, then save through existing schedule actions after confirmation.
- CrewBoard Phase 3A is documented in
  [docs/design/crewboard-phase-3a-confirmed-schedule-move.md](C:/FloorConnector/docs/design/crewboard-phase-3a-confirmed-schedule-move.md).
  `/schedule` now has a selected-job `Move schedule` review flow backed by pure
  move helpers and the existing schedule action. Pointer drag/drop, new
  schedule records, packages, routes, and schema changes remain intentionally
  out of scope.
- CrewBoard Phase 3A QA is documented in
  [docs/design/crewboard-phase-3a-qa-checkpoint.md](C:/FloorConnector/docs/design/crewboard-phase-3a-qa-checkpoint.md).
  Static QA confirmed the move helper coverage, existing schedule action path,
  Ready Check / GateKeeper preservation, advisory warning preservation, and no
  schema/package/route/server-action expansion. Browser QA loaded `/schedule`
  at mobile width with saved contractor auth and no horizontal overflow; deeper
  selected-job action checks were blocked by local Supabase Auth
  `over_request_rate_limit`.
- CrewBoard Phase 3B pointer drag/drop planning is documented in
  [docs/design/crewboard-phase-3b-drag-drop-technical-spike.md](C:/FloorConnector/docs/design/crewboard-phase-3b-drag-drop-technical-spike.md).
  Recommendation: start 3B-A with no package by proving proposed-move state and
  drop-target abstractions, then install `@dnd-kit/core` only if approved for
  actual pointer drag/drop. Drag/drop must prepare the existing Move schedule
  confirmation flow and never mutate on drop.
- CrewBoard Phase 3B-A is implemented and documented in
  [docs/design/crewboard-phase-3b-a-proposed-move-abstractions.md](C:/FloorConnector/docs/design/crewboard-phase-3b-a-proposed-move-abstractions.md).
  `/schedule` now has pure proposed-move helpers, URL-backed prepared move
  state, inert CrewBoard target metadata, and a compact `Prepare move` preview
  that fills the existing `Move schedule` confirmation form. Pointer drag/drop,
  packages, schema, routes, server actions, and automatic mutation remain out of
  scope.
- CrewBoard Phase 3B-A QA is documented in
  [docs/design/crewboard-phase-3b-a-qa-checkpoint.md](C:/FloorConnector/docs/design/crewboard-phase-3b-a-qa-checkpoint.md).
  Static QA confirmed no pointer handlers, no drag/drop package, no new
  schedule write path, URL state guarded by selected-job presence, inert target
  metadata, and manual `Move schedule` preservation. Protected browser QA
  remains blocked until local Supabase Auth cooldown clears.
- CrewBoard Phase 3B-B pre-implementation readiness is documented in
  [docs/design/crewboard-phase-3b-b-pointer-drag-drop-checklist.md](C:/FloorConnector/docs/design/crewboard-phase-3b-b-pointer-drag-drop-checklist.md).
  Recommendation: install `@dnd-kit/core` only when actual pointer drag/drop is
  approved, then use it only to prepare the existing `Move schedule`
  confirmation flow from a drop. Do not mutate on drop, add schedule records,
  add server actions, or make drag/drop required on mobile.
- CrewBoard Phase 3B-B pointer drag/drop preview is implemented and documented
  in
  [docs/design/crewboard-phase-3b-b-pointer-drag-drop-preview.md](C:/FloorConnector/docs/design/crewboard-phase-3b-b-pointer-drag-drop-preview.md).
  `/schedule` now uses a small `@dnd-kit/core` client boundary to let job cards
  prepare existing Move schedule URL state when dropped on date or time-bucket
  targets. Drop does not save; the existing Move schedule confirmation and
  server-side Ready Check / GateKeeper path remain authoritative.
- CrewBoard Phase 3B-B QA is documented in
  [docs/design/crewboard-phase-3b-b-qa-checkpoint.md](C:/FloorConnector/docs/design/crewboard-phase-3b-b-qa-checkpoint.md).
  Static QA confirmed no drag/drop server action calls, no schedule mutation on
  drop, no package sprawl beyond `@dnd-kit/core`, and preserved manual Move
  schedule fallback. Browser smoke loaded `/schedule` on desktop and mobile with
  saved contractor auth and no horizontal overflow, but did not claim full drag
  execution because the loaded data/layout lacked both a visible draggable card
  and visible drop target pair.
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
  The dry-run path does not create a Supabase client, read `.env.local`, write
  data, call providers, create auth users, create payment/signature/email
  events, or print portal invite tokens.
- [docs/demo/staging-demo-seed-write-mode-design.md](C:/FloorConnector/docs/demo/staging-demo-seed-write-mode-design.md)
  defines the owner gates, future script modes, write-mode refusal rules,
  idempotency strategy, provider-dark policy, portal token policy, post-write
  validation plan, and cleanup boundary.
- `pnpm demo:data:seed:validate-target -- --supabase-url <staging-supabase-url>
--service-role-key-env SUPABASE_SERVICE_ROLE_KEY --organization-id <uuid>
--owner-user-id <uuid> --owner-email <owner@example.test>
--portal-customer-email <customer@example.test> --environment staging` runs the
  Phase 2A read-only target validation. It uses explicit target inputs, hides
  service-role values, runs select-only checks, and prints passed/warned/failed
  readiness. It does not write data, seed records, apply migrations, create
  auth users, create portal invites, create payment/signature/email events, or
  call providers.
- [docs/design/staging-demo-seed-phase-2a-qa-checkpoint.md](C:/FloorConnector/docs/design/staging-demo-seed-phase-2a-qa-checkpoint.md)
  records the Phase 2A QA checkpoint: dry-run remains no-connection/no-write,
  validate-target remains explicit/read-only, script safety checks found no
  write verbs or provider/auth-admin paths in the seed script, and write mode
  remains future owner-approved work.
- [docs/design/supabase-staging-target-discovery.md](C:/FloorConnector/docs/design/supabase-staging-target-discovery.md)
  records the May 24, 2026 read-only Supabase connector discovery. The
  connector could see one organization, `FloorConnectoor`
  (`cvkfudwshnfsftnnwrro`, free plan), but returned zero visible projects. No
  staging project candidate was identified, and no project details, migrations,
  tables, SQL, auth settings, RLS, data, providers, or app behavior were
  touched. The next staging action is owner/account access resolution so the
  intended Supabase project is visible before Phase 2A validation.

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
- Mobile field work must keep Job Notes and field evidence under Daily Job Logs
  until a separate shared evidence/storage plan is approved.
- CrewBoard drag/drop work must stay on canonical jobs and job assignments,
  preserve existing schedule actions, and keep GateKeeper / Ready Check server
  enforcement authoritative.
- Long-term direction now includes the Agentic Operations Layer documented in
  [docs/agentic-operations-layer.md](C:/FloorConnector/docs/agentic-operations-layer.md).
  AI must stay canonical-record-first, permissioned, auditable, and governed by
  human approval for risky actions. It must not become a parallel CRM,
  scheduler, inbox, payment system, workflow engine, or assistant memory source
  of truth. Current priority remains operational core maturity before
  autonomous AI.
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

- If staging/demo is next, have the owner resolve Supabase project visibility
  first. The current connector discovery sees `FloorConnectoor` but no
  projects, so there is no confirmed staging Supabase target yet. After the
  intended project is visible, have the owner run
  `pnpm demo:data:seed:validate-target` against that target and review warnings
  before considering any write-mode prompt. Keep write mode deferred until
  read-only target validation is clean and owner approval is explicit.
- If continuing Mobile Field, run a focused
  `Mobile Field Phase 3D - Evidence Preview And Download QA` slice from
  [docs/design/mobile-field-phase-3c-evidence-upload-foundation.md](C:/FloorConnector/docs/design/mobile-field-phase-3c-evidence-upload-foundation.md).
  Add contractor-only signed URL resolution by attachment id and portal-negative
  tests before thumbnail previews or delete/archive behavior.
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
- If continuing CrewBoard, checkpoint Phase 3B-B with browser QA when protected
  auth is healthy, then decide whether to add stable Playwright drag/drop
  coverage, refine a drag handle, or keep drag-to-unscheduled manual-only.
- For the broader drag/drop plan, use
  [docs/design/crewboard-phase-3-drag-drop-dispatch-spec.md](C:/FloorConnector/docs/design/crewboard-phase-3-drag-drop-dispatch-spec.md)
  as the scope boundary.
- Run a real-record operating-core demo rehearsal using
  [docs/demo/operating-core-demo-path.md](C:/FloorConnector/docs/demo/operating-core-demo-path.md)
  and record blockers honestly.
- Pick one guarded non-finance product polish item found during the demo
  walkthrough.

Avoid broad accounting sync, provider posting, AI automation, reminders, stored
billing packets, customer billing-center settings, or live staging/provider
actions until the relevant approval and boundary docs are explicit.
