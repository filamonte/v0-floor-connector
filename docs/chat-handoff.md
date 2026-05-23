# Chat Handoff

Status: Active
Doc Type: Operational

This is a compact handoff for future Codex sessions. It is not a competing
source of truth.

## Required First Reads

Read these before implementation or documentation work:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/product-language.md](C:/FloorConnector/docs/product-language.md)
- [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md)
- [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)

## Current Branch Reality

FloorConnector is a production-first SaaS operating system for specialty
flooring contractors. It is built around one connected workflow:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

The current branch has a real operating foundation: auth, tenancy,
opportunities/leads, customers, projects, estimates, contracts, change orders,
jobs, invoices, payments, portal foundations, workforce/time/field foundations,
settings, super admin, and normalized contractor UI patterns.

Latest remote-verified implementation/test commit before Portal Maturity Phase 2:

`599d3878 chore: checkpoint Portal Customer Next Step QA`

`git push origin main` pushed the Portal Customer Next Step QA checkpoint from
local `main` to `origin/main`, and the branch then showed `main...origin/main`
before the Portal Maturity Phase 2 implementation pass.

## Latest Operating Core

Recent completed layers:

- CrewBoard Phase 1/2 on `/schedule` for job-centered scheduling visibility,
  date/layout context, selected-job handoff, and advisory schedule warnings.
- FieldTrail Phase 1 on Project Workspace and Job Workspace for execution
  history over Daily Job Logs, Job Notes, execution attachments, time cards,
  and jobs.
- Mobile Field Phase 1 improves Daily Job Log capture for phone-sized field
  work using existing Daily Logs, Job Notes, Job Workspace, CrewBoard, and
  FieldTrail fast paths.
- [docs/design/mobile-field-phase-1-qa-checkpoint.md](C:/FloorConnector/docs/design/mobile-field-phase-1-qa-checkpoint.md)
  records the focused Mobile Field QA evidence, including Daily Logs and
  CrewBoard mobile route checks plus skipped protected detail route discovery.
- MessageCenter Phase 1 on Project Workspace for project communication,
  Send Trail, Signature Trail, Payment Trail, and Customer Access context.
- ProjectPulse Phase 1 on Project Workspace for deterministic project health
  and Next Move summary.
- CloseoutTrail Phase 1 on Project Workspace for closeout readiness and proof
  summary.
- Proof Center Phase 1 on Project Workspace for project document/evidence/proof
  indexing.
- Warranty Service Phase 1 adds a shared Service Center summary/Next Move layer
  across existing service tickets, warranty documents, service jobs, project
  proof context, and closeout handoff without adding service records, portal
  service requests, claim automation, or provider behavior.
- Service Center QA checkpoint and Portal Maturity Phase 1 added docs for the
  warranty/service QA review and customer portal maturity audit. The portal
  Project Workspace now uses a pure Customer Next Step helper over existing
  portal records to route customers toward a sent estimate, in-motion contract,
  sent change order, open invoice, or no-action status without changing portal
  access, auth, RLS, tenant logic, server actions, payments, signatures, or
  math.
- [docs/design/portal-customer-next-step-qa-checkpoint.md](C:/FloorConnector/docs/design/portal-customer-next-step-qa-checkpoint.md)
  records the focused Portal Customer Next Step QA evidence, including helper
  priority tests, nearby portal visibility tests, saved-session browser checks,
  and the preserved portal access/loader boundary.
- Portal Maturity Phase 2 adds a read-only Project Status Window to the portal
  Project Workspace. The new helper derives project status, shared-record rows,
  attention items, completed items, and no-action-needed states from existing
  portal project estimates, contracts, invoices, change orders, and the
  Customer Next Step helper. Portal home now shows a simple `What matters now`
  line per project using existing list fields only. This remains customer-safe
  visibility and does not add portal-only records, loader permission widening,
  route changes, schema, migrations, server actions, portal grant behavior,
  auth/RLS, tenant logic, payment/signature behavior, estimate math, invoice
  math, AI, automation, notifications, FieldTrail exposure, Proof Center
  exposure, service requests, or closeout package downloads.
- Portal Maturity Phase 3 adds a read-only Project Timeline to the portal
  Project Workspace. The new helper derives customer-safe timeline items from
  existing project summary, shared estimates, contracts, invoices, change
  orders, customer-visible appointments, and portal-visible warranty documents.
  The timeline marks customer-facing actions as `Waiting on you` and links only
  to existing portal review routes. This remains customer-safe visibility and
  does not add portal-only records, loader permission widening, route changes,
  schema, migrations, server actions, portal grant behavior, auth/RLS, tenant
  logic, payment/signature behavior, estimate math, invoice math, AI,
  automation, notifications, FieldTrail exposure, Proof Center exposure,
  internal communication details, service requests, provider delivery timeline
  details, or closeout package downloads.
- Portal Maturity Phase 4 adds a read-only Shared Documents section to the
  portal Project Workspace. The new helper derives customer-safe document rows
  from existing shared estimates, contracts, invoices, and change orders, links
  to existing portal review routes, and adds `Print / Save PDF` links only for
  existing portal estimate, contract, and invoice print routes. This remains
  customer-safe visibility and does not add portal-only records, loader
  permission widening, route changes, schema, migrations, server actions,
  portal grant behavior, auth/RLS, tenant logic, storage, stored PDFs, provider
  sending, Send Trail events, payment/signature behavior, estimate math,
  invoice math, AI, automation, notifications, FieldTrail exposure, Proof
  Center exposure, service requests, provider delivery timeline details, or
  closeout package downloads.
- The Portal Maturity Phase 4 QA checkpoint confirms the portal Project
  Workspace now reads as a coherent Customer Project Window: Customer Next Step
  first, then Project Status, Project Timeline, Shared Documents, and existing
  shared commercial records. The pass only aligned small portal-home labels to
  `Your next step` / `Project to review` language and documented that a portal
  home shared-document count remains deferred until the home loader is
  explicitly allowed to expose safe per-project counts.
- Financial Control Phase 1 improves `/financials` and
  `/financials/accounts-receivable` with a pure collections/payment-attention
  helper over existing invoices, payments, payment events, customers, and
  projects. The Financials Home now shows open receivables, overdue amount,
  pending payment count, payment attention, project collection attention,
  invoice attention, and a deterministic owner Next Move. AR now shows
  invoice-level Next Move labels, project links, project collection attention,
  and Payment Trail attention. This remains read-only visibility/navigation and
  does not change payment processing, Stripe/webhook behavior, invoice math,
  payment finalization, accounting sync, provider sends, schema, migrations,
  routes, server actions, auth/RLS, tenant logic, portal grants, settings, or
  platform-admin behavior.
- Accounting Readiness Phase 1 adds `/financials/accounting-readiness` as a
  read-only export and reconciliation prep surface over existing invoices,
  payments, payment events, customers, projects, invoice tax reporting entries,
  and invoice retainage snapshots. The page surfaces accounting review rows,
  payment review rows, reconciliation attention, tax/retainage snapshot totals,
  and export-ready column mapping, with links back to source Invoice, Customer,
  Project, Financials, AR, and Reports surfaces. It does not add QuickBooks/Xero
  sync, ledgers, journal entries, export files, provider reconciliation posting,
  schema, migrations, server actions, invoice/payment math changes, payment
  finalization changes, auth/RLS changes, tenant logic changes, portal grants,
  settings, or platform-admin behavior.
- Accounting Export Prep Phase 1 adds in-browser Copy CSV / Download CSV
  affordances to `/financials/accounting-readiness` using the already loaded
  Accounting Readiness invoice/payment rows. The export is spreadsheet-ready
  review output only: no new route, server action, stored file, export audit
  event, provider integration, accounting sync, ledger, invoice/payment copy, or
  source financial mutation.
- Accounting Export Prep QA hardens the CSV experience with pure filename and
  export metadata helpers, row/column count copy, accessible Copy CSV and
  Download CSV labels, disabled-state feedback, and explicit review-only export
  notice text. Protected browser QA remains blocked until local contractor auth
  state is refreshed.
- Business Documents Phase 1 was evaluated as a plan-only Company Document
  Library foundation. Current `document_templates` support estimate, invoice,
  contract, and warranty templates only, while `warranty_documents` are tied to
  project/customer/job/service-ticket context. The safe decision is not to
  overload those models or add schema casually; the recommended next slice is an
  explicit `company_documents` model and `/settings/company-documents` surface
  after category/status/access rules are approved.
- Company Documents Schema Readiness confirms the future build should start
  with an explicit `company_documents` table, contractor-only RLS, and a
  `/settings/company-documents` Company Controls surface. The audit keeps
  `document_templates`, `warranty_documents`, `execution_attachments`,
  `compliance_records`, portal access, Document Engine, Proof Center, Send
  Trail, Service Center, and storage boundaries separate until explicit later
  associations are approved.
- Company Documents Migration Readiness confirms the future migration should
  follow the repo's timestamped SQL pattern, use text check constraints for
  early taxonomy flexibility, force RLS, allow active members to view, gate
  create/update to owner/admin/manager, omit delete and portal policies in
  Phase 1A, and defer storage, starter adoption, version tables,
  acknowledgements, e-sign, provider sends, and AI drafting.
- Operating Core Demo Readiness adds
  [docs/demo/operating-core-demo-path.md](C:/FloorConnector/docs/demo/operating-core-demo-path.md)
  as the current route-by-route demo script for Command Center, Reports,
  Project Workspace, CrewBoard, FieldTrail, MessageCenter, CloseoutTrail, Proof
  Center, Send Trail, Document Engine, Portal Customer Window, Service Center,
  Financial Control, Accounting Readiness, Accounting Export Prep, and Mobile
  Daily Job Log capture. It is a docs/QA asset only and uses real
  database-backed records; it does not add features, routes, schema, fake data,
  provider behavior, AI, automation, payment/signature changes, portal access
  changes, accounting sync, or workflow rule changes.
- Reports Phase 1 on `/reports` for read-only operations and collections
  visibility.
- Send Trail Phase 1 on estimate, contract, and invoice source workspaces for
  existing document delivery proof visibility.
- Document Engine Phase 1 centralizes existing estimate, contract, and invoice
  print/save PDF route helpers and clarifies that browser print/save exports are
  generated artifacts, not delivery proof or a separate document source.
- Document Engine Phase 2 planning recommends a contractor-side Project
  Closeout Package HTML/print route first, with portal downloads, stored
  artifacts, and server-generated PDFs deferred until visibility and versioning
  policy are explicit.
- Document Engine Phase 2A implements the contractor-only Project Closeout
  Package print/save route at `/projects/:id/closeout-package/pdf`, generated
  from current project source records and summary helpers.
- Project Workspace browser QA now follows current product language and verifies
  the closeout package print route from a valid project detail link.
- [docs/design/document-engine-qa-checkpoint.md](C:/FloorConnector/docs/design/document-engine-qa-checkpoint.md)
  records the focused print/export QA evidence after Document Engine Phase 1,
  Phase 2A, and the browser QA maintenance pass.
- [docs/design/operating-core-runtime-qa-checkpoint.md](C:/FloorConnector/docs/design/operating-core-runtime-qa-checkpoint.md)
  records the operating-core runtime QA pass: local `main` push completed,
  focused helper tests passed, stale protected E2E fixed IDs were replaced with
  authenticated index-page discovery, a duplicate React key warning in manager
  dashboard cards was fixed, and broader protected browser QA remains blocked
  until Supabase Auth rate limits cool down.

These layers are read-only summaries, source-record handoffs, copy/hierarchy
improvements, or existing-action presentation around canonical records. They did
not add schema, migrations, routes, data models, provider integrations, AI,
automation, notifications, payment/signature behavior, estimate math, invoice
math, job readiness gates, portal grants, auth/RLS, tenant logic, settings, or
platform-admin behavior.

## What Is Not Built

Do not describe these as implemented unless `docs/current-state.md` changes:

- drag/drop scheduling or automated dispatch
- external calendar sync or route optimization
- AI summaries, AI recommendations, or autonomous actions
- full document management, stored document/version lifecycle, stored generated
  closeout packages, or portal closeout downloads
- provider retry lifecycle or automated reminders
- standalone Proof Center route
- customer-facing field sharing
- native app, offline field mode, GPS/geofencing, or mobile-specific duplicate
  field records
- full analytics/report builder
- live SaaS billing launch or entitlement enforcement

## QA Caveat

Protected-route browser QA can be blocked by local Supabase Auth rate limits,
stale Playwright storage state, base-URL mismatch, or stale fixed fixture IDs.
Use [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)
before assuming a protected-route browser failure is product behavior.

## Next Recommended Direction

Use [docs/demo/operating-core-demo-path.md](C:/FloorConnector/docs/demo/operating-core-demo-path.md)
for the current route-based operating-core walkthrough, and
[docs/design/company-documents-schema-readiness-audit.md](C:/FloorConnector/docs/design/company-documents-schema-readiness-audit.md)
and
[docs/design/company-documents-migration-readiness-audit.md](C:/FloorConnector/docs/design/company-documents-migration-readiness-audit.md)
for the future Company Documents schema/migration and Phase 1A implementation
boundary.

Recommended next build: one guarded non-finance slice after the demo path is
rehearsed against real records. Good candidates are Company Document Library
model approval, demo data readiness through approved fixture tooling, or a
small project/workflow polish item found during the walkthrough. Do not add
accounting sync, provider posting, AI automation, reminders, stored billing
packets, or customer billing center settings until their approval, provider,
and data-boundary policies are explicit.
