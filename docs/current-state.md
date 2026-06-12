# Current State

Status: Active
Doc Type: Current Truth

This document summarizes the current implemented architecture and feature foundation in the FloorConnector monorepo.

## How To Use This Doc

Use this document when you need current branch reality. For concise status maps, see [docs/platform-maturity.md](C:/FloorConnector/docs/platform-maturity.md), [docs/module-status.md](C:/FloorConnector/docs/module-status.md), [docs/known-gaps.md](C:/FloorConnector/docs/known-gaps.md), and [docs/system-status-review.md](C:/FloorConnector/docs/system-status-review.md). For current risk framing, use [docs/system-risk-register.md](C:/FloorConnector/docs/system-risk-register.md). For workflow rules, use [docs/workflows.md](C:/FloorConnector/docs/workflows.md). For future direction, use [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md) and [docs/future-platform-expansion.md](C:/FloorConnector/docs/future-platform-expansion.md).

Use [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md) as the primary developer entry point. Use this document for implemented truth after that first orientation.

Use [docs/document-map.md](C:/FloorConnector/docs/document-map.md) for
documentation authority and navigation. Use
[docs/product-operating-model.md](C:/FloorConnector/docs/product-operating-model.md)
for target Product + UX operating-model direction and
[docs/design-system-governance.md](C:/FloorConnector/docs/design-system-governance.md)
for UX governance. Those docs do not replace this document for implemented
truth.
Use
[docs/capability-registry.md](C:/FloorConnector/docs/capability-registry.md)
for capability maturity and Capability -> Program -> Wave -> Stream progress;
use [docs/capability-map.md](C:/FloorConnector/docs/capability-map.md) for
strategic capability navigation. The capability registry and capability map do
not replace this document for implemented truth.

Use these docs together:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md): primary development entry point and implementation guardrails
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): implemented truth and current branch reality
- [docs/platform-maturity.md](C:/FloorConnector/docs/platform-maturity.md): concise maturity framing
- [docs/module-status.md](C:/FloorConnector/docs/module-status.md): concise module status map
- [docs/known-gaps.md](C:/FloorConnector/docs/known-gaps.md): important depth gaps around the implemented core
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): target platform architecture
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): platform maturity roadmap
- [docs/capability-map.md](C:/FloorConnector/docs/capability-map.md): strategic Capability -> Program -> Wave -> Stream navigation
- [docs/future-platform-expansion.md](C:/FloorConnector/docs/future-platform-expansion.md): future expansion direction
- [docs/architecture-principles.md](C:/FloorConnector/docs/architecture-principles.md): stable architecture principles
- [docs/canonical-lifecycle.md](C:/FloorConnector/docs/canonical-lifecycle.md): canonical lifecycle and lineage rules
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md): target sales and commercial workflow direction
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md): target contractor app information architecture
- [docs/site-visit-scope-intake-plan.md](C:/FloorConnector/docs/site-visit-scope-intake-plan.md): Scope Intake planning guardrails between site visit and estimate planning
- [docs/estimate-builder-build-plan.md](C:/FloorConnector/docs/estimate-builder-build-plan.md): long-term Estimate Builder blueprint
- [docs/estimate-builder-v1-scope.md](C:/FloorConnector/docs/estimate-builder-v1-scope.md): constrained Estimate Builder V1 scope
- [docs/estimate-builder-system-generation-spec.md](C:/FloorConnector/docs/estimate-builder-system-generation-spec.md): future system-generation planning detail
- [docs/starter-pack-provisioning-plan.md](C:/FloorConnector/docs/starter-pack-provisioning-plan.md): starter-pack provisioning safety model, execution guardrails, and future void planning
- [docs/starter-pack-provisioning-execution-readiness.md](C:/FloorConnector/docs/starter-pack-provisioning-execution-readiness.md): starter-pack provisioning execution readiness, field mapping, lineage, and void-readiness notes
- [docs/starter-pack-provisioning-review.md](C:/FloorConnector/docs/starter-pack-provisioning-review.md): consolidated architecture/operator readiness review before any real void action
- [docs/ui-data-model-alignment-backlog.md](C:/FloorConnector/docs/ui-data-model-alignment-backlog.md): future/planned UI, directory/contact, tax, Estimate Editor, project-address, and workflow-guidance alignment backlog
- [docs/ui-patterns.md](C:/FloorConnector/docs/ui-patterns.md): implemented decision-first UI patterns for contractor workspaces, Manager Pages, status color semantics, and portal/super-admin differences
- [docs/enterprise-ui-system-audit.md](C:/FloorConnector/docs/enterprise-ui-system-audit.md): latest enterprise visual-system route audit, drift sources, and authenticated QA rules
- [docs/golden-workflow-demo-path.md](C:/FloorConnector/docs/golden-workflow-demo-path.md): repeatable Phase 1 route-by-route demo and QA spine for the existing canonical workflow
- [docs/founder-demo-readiness.md](C:/FloorConnector/docs/founder-demo-readiness.md): rehearsal script for the current founder-demo path from setup through portal and print/save documents
- [docs/paid-early-access-plan.md](C:/FloorConnector/docs/paid-early-access-plan.md): Phase 2 paid early-access readiness plan and billing/activation boundaries
- [docs/stripe-saas-billing-runbook.md](C:/FloorConnector/docs/stripe-saas-billing-runbook.md): test-mode FloorConnector SaaS billing webhook setup, replay, verification, and recovery boundaries
- [docs/saas-billing-live-launch-plan.md](C:/FloorConnector/docs/saas-billing-live-launch-plan.md): live SaaS billing policy, entitlement, Customer Portal, dunning/support, rollback, and release-gate planning before live controls; this is planning only and does not implement live billing, automatic activation, Customer Portal, entitlement enforcement, or billing-state runtime gates
- [docs/import-export-readiness.md](C:/FloorConnector/docs/import-export-readiness.md): implemented export-first data portability foundation plus import-readiness/no-mutation boundaries
- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md): documentation maintenance and archival rules
- [docs/documentation-standards.md](C:/FloorConnector/docs/documentation-standards.md): documentation layers, metadata, and AI-readability rules
- [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md): mandatory UI and module implementation rules

All future UI and module work must follow `docs/floorconnector-ui-build-rules.md` before implementation.
That includes all future module workspace standardization work, which should align to the shared `StandardWorkspaceLayout` and the documented workspace/sidebar rules there.

If this document conflicts with a planning, target-design, or historical document, trust this document for implemented status.

Estimate Builder planning docs are planning docs only. V1 estimate builder/system generation is not implemented unless this file and the codebase explicitly say it is. The existing reusable catalog, cost item database, and estimate foundations remain the current implemented baseline.

Current canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Implemented surfaces may still use lead or intake language where the UI is describing pre-sale work, but implementation status and data-model language should preserve the canonical `opportunity` record and avoid duplicate lead/customer/project models.

Agentic operations note: full autonomous or agentic AI operations are not
implemented. The current branch may include deterministic guidance,
readiness/cue foundations, and review-first planning or memory surfaces where
this document explicitly records them, but those are not full agentic AI. Future
AI work must preserve canonical records, tenant boundaries, permissions,
workflow state, communications, events, and audit/governance controls. The
strategic target direction lives in [docs/agentic-operations-layer.md](C:/FloorConnector/docs/agentic-operations-layer.md).

AI Operational Copilot Foundation is now implemented as a deterministic,
review-first intelligence layer over existing canonical project summaries. The
Project Workspace shows an AI Operational Copilot panel after ProjectPulse,
deriving project summary, readiness/financial/schedule/execution state,
recommended next actions, draft-assistance text, field summary, and structured
review-first draft actions from ProjectPulse, Ready Check, FieldTrail,
MessageCenter, and CloseoutTrail. The action composer can produce deterministic
customer follow-up, contract/signature reminder, deposit/payment reminder,
scheduling coordination, field progress update, internal PM summary,
stalled-project follow-up, and blocker/escalation drafts. The foundation lives in
[apps/web/lib/ai-operational-copilot/summary.ts](C:/FloorConnector/apps/web/lib/ai-operational-copilot/summary.ts)
and is documented in
[docs/ai-operational-copilot-foundation.md](C:/FloorConnector/docs/ai-operational-copilot-foundation.md).
Copilot draft actions now include a review-first handoff into the existing
contractor-side `/communications` workspace. The handoff preserves the draft
action type, audience, subject, body, project/customer context, reason, and
source workflow signals, prefills the selected canonical thread composer when a
thread already exists, and otherwise shows the draft as copy/review context
without creating a thread. Saving from the prefilled composer writes only an
explicit user-submitted internal message on the existing canonical
`communication_messages` chain with Copilot metadata in message payload. It
does not send customer email/SMS, create autonomous communication workflows, call
a provider, create notifications, create AI-only communication records, or
auto-create new communication threads. It adds no schema, migrations, provider
calls, persisted AI records, chatbot memory, autonomous workflow execution,
customer-facing send behavior, financial mutation, signature mutation,
scheduling mutation, or portal-specific AI copies.
Project Workspace now also includes a compact Project Command Timeline derived
from existing canonical records and read models. The timeline groups the latest
and highest-priority project movement across project/opportunity context,
estimates, contracts and signature state, invoices, payments, jobs/schedule,
Daily Logs, field blockers, document/proof readiness, MessageCenter, Send
Trail, Signature Trail, Payment Trail, and project-scoped portal visibility.
It is a deterministic read model in
[apps/web/lib/projects/timeline.ts](C:/FloorConnector/apps/web/lib/projects/timeline.ts)
and a presentation section in the Project Workspace. It does not add an
activity table, audit/event system, duplicate project history model, provider
calls, autonomous actions, customer-facing internal field-note exposure, or any
payment/signature/job/invoice mutation.
Project Workspace command-center polish now adds a compact top-level command
map and reorders the main project intelligence stack so current status,
ProjectPulse, Project Command Timeline, Copilot synthesis, workflow snapshot,
and connected record lanes have clearer jobs. Timeline is framed as what
happened and where the source record lives; Copilot is framed as review-first
interpretation and draft preparation. This is presentation-only over existing
read models and routes, with no schema, migrations, provider calls, autonomous
actions, fake/demo data, duplicate activity storage, or payment, signature,
job, invoice, or document mutation.
Project Workspace Maturity v2 adds a shared operational workspace summary in
[apps/web/lib/projects/operational-workspace.ts](C:/FloorConnector/apps/web/lib/projects/operational-workspace.ts).
The Project Workspace now shows one derived Operational Intelligence section
for high-signal attention, financial continuity, dispatch/schedule continuity,
execution continuity, and change-order impact. The helper derives contract
value, approved change-order impact, invoiced amount, paid amount, outstanding
balance, overdue exposure, unpaid deposits, retainage held, progress-billing
exposure, ready-unscheduled jobs, missing crew, latest Daily Log, open field
blockers, and open change-order review from existing project-linked records.
It does not create a project-financial subsystem, schedule model, field model,
portal copy, activity table, fake records, schema, migrations, provider calls,
autonomous actions, or payment/signature/job/invoice/field-note mutation.
Project Evidence / Documents / Closeout Continuity v1 adds a shared
[apps/web/lib/projects/evidence-continuity.ts](C:/FloorConnector/apps/web/lib/projects/evidence-continuity.ts)
read model and a Project Evidence section in the Project Workspace. The helper
derives active field evidence, archived evidence metadata, Daily Job Logs, Job
Notes, customer-safe commercial documents, internal-only proof, warranty/service
handoff, office-review items, and a lightweight proof trail from existing
project-linked records. Project Detail now loads archived execution attachment
metadata for this read model while keeping FieldTrail, Proof Center, and
CloseoutTrail active-proof counts active-only. Field evidence remains
contractor-only; customer-safe visibility is limited to existing portal-safe
estimate, contract, invoice, and change-order records when explicit project
access exists. This adds no document system, attachment model, portal copies,
schema, migrations, storage policy changes, destructive storage delete, fake
files, provider calls, customer-facing field evidence exposure, or source-record
mutation.
Accounts Receivable now also uses a deterministic Collections Follow-Up
Intelligence helper over canonical invoices, payments, and Payment Trail events
to categorize overdue invoices, unpaid deposits, sent-unpaid balances,
partially paid balances, checkout/payment-in-progress signals, failed/voided
payment attempts, and internal-review cases. The `/financials/accounts-receivable`
workspace shows those items with invoice/project/customer links, amount due,
payment state, reason, latest activity context, recommended next step, and
review-first Copilot draft handoffs when AI drafting controls allow them. Each
follow-up row now includes a read-only next-contact brief summarizing customer,
project, invoice, payment, aging, last-activity, and source-record context from
the same existing financial read models. The AR command-center Payment Trail
lane now keeps failed/voided/in-progress/stale
pending exceptions separate from recently settled recorded-payment activity
while preserving Invoice Workspace, Project Workspace, and customer/project
links. These drafts use the existing communications composer handoff; they do
not send reminders, create
communication threads, create notification events, mutate invoices/payments, add
provider calls, or create duplicate billing/payment records.
The dashboard now also includes a compact AI Operational Digest panel derived
from existing dashboard/project signals, operational cockpit previews, Ready
Check handoffs, contracts, invoices, jobs, equipment readiness, and project
cues. It groups what needs attention, ready-to-move handoffs, financial
follow-up, field/execution review, and suggested draft-action availability while
linking back to canonical workspaces. The digest does not create dashboard-owned
workflow records, send messages, create tasks, persist AI output, call provider
AI, or mutate projects, invoices, contracts, jobs, payments, messages, or tasks.
The AI foundation now also has organization-level workflow controls for AI
summaries, drafting, dashboard digest visibility, and future provider-backed
enhancement. Those controls live in the existing workflow guidance preferences
JSON, so this slice adds no schema or migration. The provider abstraction is a
no-provider deterministic fallback today; live model calls remain future work.

## Repository Shape

- Monorepo managed with `pnpm` and `turbo`
- Active product surface: `apps/web`
- Background/integration app reserved: `apps/worker`
- Shared packages currently used for config, types, domain logic, UI, database access, and integrations
- Supabase migrations live in `supabase/migrations`

## Implemented Route Notes

These high-value route notes exist to prevent target-vs-current drift:

- `/reports` is the current implemented reporting entry surface; no `/reports/tax` route exists today.
- `/document-writer` is the current implemented document-writing route; `/documents` remains target IA language only and is not an implemented route today.
- Good-enough customer-facing print/PDF views now exist for canonical estimate, contract, and invoice records at `/estimates/:id/pdf`, `/contracts/:id/pdf`, `/invoices/:id/pdf`, plus portal-scoped equivalents at `/portal/estimates/:id/pdf`, `/portal/contracts/:id/pdf`, and `/portal/invoices/:id/pdf`. Warranty documents now have contractor-side print/save at `/warranty-documents/:id/print` and portal-scoped print/save at `/portal/warranty-documents/:id/print`. These are browser print/save renderings of canonical records, not stored document records or a document source of truth. Portal print routes now use the same safe organization branding fields already stored on the contractor company after portal record access is scoped.
- Document Engine Phase 2A now adds a contractor-only Project Closeout Package
  print/save route at `/projects/:id/closeout-package/pdf`. It renders a
  browser-printable project packet from current ProjectPulse, CloseoutTrail,
  Proof Center, FieldTrail, MessageCenter, Send Trail, Signature Trail, Payment
  Trail, commercial, billing, field, warranty, and service source-record
  context. It is not a stored PDF, document-management subsystem, delivery
  proof, generated artifact record, or customer/portal download route.
- `/materials`, `/forms-checklists`, `/directory`, and `/cost-items-database` exist as current contractor routes/foundations, but their deeper production workflows are not complete. `/materials` is currently an intentional route alias that redirects to `/cost-items-database/items`.
- Project Workspace and Lead Workspace now share the first schema-backed
  Assessment Package foundation through tenant-scoped `assessment_packages`
  records. Assessment packages can be owned by a canonical Opportunity before
  a Project exists through nullable `opportunity_id`, and can remain linked to
  a canonical Project through nullable `project_id` for operational continuity
  after sale. The Project detail page shows a compact Assessment Package
  panel, can create a package for the current project, and links to a nested
  detail route at
  `/projects/:projectId/assessment-packages/:assessmentPackageId` for
  summary-level site contact, access, parking, site notes, customer goals,
  current conditions, recommended system, risk, and estimate handoff notes.
  The Lead detail page can create and list Opportunity-owned pre-estimate
  assessment packages without creating a Project. RLS and relationship
  validation keep packages scoped to the active organization and require each
  package to have Opportunity or Project ownership. This is not customer
  self-service, guided capture, mobile capture, AI risk detection, material
  takeoff, estimate-line generation, Project creation timing refactor,
  sales-lifecycle route rename, broad workspace redesign, portal-owned
  assessment truth, or duplicate customer/project/estimate/job/field/material/
  workflow truth.
- Lead Workspace now has the first Workspace Framework V2 presentation slice.
  `/leads/:leadId` uses focused query-param workspace views for Overview,
  Qualification, Site Visit, Assessment Package, Estimate Plan, Work Items,
  Communication, and Activity instead of same-page section jump navigation.
  The slice adds a reusable workspace support-column extension and shared
  Workspace Framework V2 view vocabulary in `@floorconnector/ui`, while keeping
  existing Lead/Opportunity data loading, server actions, route names,
  assessment package ownership, work item behavior, tenant checks, schema, and
  Supabase migrations unchanged.
- The Lead / Opportunity UI now applies the sales lifecycle naming decision in
  presentation: `/leads` reads as `Leads & Opportunities`, `/leads/:leadId`
  reads as `Opportunity Workspace`, and the detail support column exposes a
  compact status control over the existing canonical opportunity status enum.
  This keeps `/leads`, `/leads/:leadId`, the `/opportunities` alias,
  `opportunities` schema, assessment ownership, tenant checks, and Supabase
  behavior unchanged.
- Project Workspace now also uses Workspace Framework V2 presentation views.
  `/projects/:projectId` preserves the same route while using `?view=` focused
  views for Overview, Readiness, Scope / Context, Estimates / Contracts, Jobs /
  Schedule, Invoices / Payments, and Activity / Notes. The Project page still
  derives readiness, blockers, ProjectPulse, operational intelligence,
  assessment package context, commercial records, jobs/schedule, financial
  continuity, field/proof/evidence, work items, and communications from the
  existing canonical loaders and read models. This slice is presentation-only:
  it does not change Project data loading, server actions, tenant scoping,
  Supabase schema, migrations, route names, readiness calculations, financial
  math, payment/signature state, scheduling mutation, provider behavior, portal
  access, or owning-workspace boundaries.
- Assessment Package detail now has a first schema-backed Area / Space
  foundation through tenant-scoped `assessment_spaces` records owned by the
  parent Assessment Package and denormalized to the same canonical Project for
  scoped queries. Areas/spaces capture name, type, floor level, dimensions,
  calculated or explicit square feet and perimeter, substrate, current flooring,
  condition summary, prep notes, moisture notes, access notes, and sort order.
  The package detail page can create, list, summarize, and edit these records.
  Relationship validation requires each area/space to match the package
  organization and project. This is not photo capture, AI risk detection,
  estimate generation, material takeoff, guided capture wizard behavior, portal
  contribution, detached room truth, duplicate project truth, duplicate
  estimate truth, or duplicate material/catalog truth.
- Product operating-model direction now treats Assessment Package as
  first-class pre-estimate knowledge capture between Opportunity and Estimate,
  with target Project creation later in the sale-to-operations handoff. The
  Opportunity-owned Assessment Package foundation is implemented; the full
  sales-to-operations Project creation timing refactor remains future work.
- `/equipment` and `/equipment/:id` now exist as the equipment asset registry foundation. They create and edit tenant-scoped canonical equipment assets, and the first job equipment foundation now adds job equipment requirements, equipment-to-job assignments, and derived advisory readiness warnings. Maintenance, utilization, job costing, procurement/AP, portal exposure, warranty/service behavior, AI automation, autonomous rescheduling, and hard equipment readiness blocks remain future work.
- `/service-tickets` and `/service-tickets/:id` now exist as the first internal service/warranty continuity foundation. They create, list, search, filter, update, and status-manage tenant-scoped service tickets tied to canonical customers, optional projects, and optional original jobs. Service ticket detail now shows linked punch-derived time and routes users to the shared `/time` composer with service/warranty context prefilled. This is not a detached helpdesk: same-company customer/project/job validation, RLS, and manager/admin/owner mutation policies keep the records on the canonical lifecycle. Portal service-ticket requests/status, outbound warranty sends, delivery proof, billing/manufacturer claims, job-costing mutation, equipment/material automation, and AI automation remain future work.
- Service tickets can now create linked unscheduled service jobs on the canonical `jobs` table when a ticket has project context. These jobs carry optional `service_ticket_id`, appear on the existing Schedule and Job surfaces, and keep schedule, crew, equipment readiness, daily logs, and time clocking on the same job foundation instead of creating a service-only calendar.
- `/warranty-documents/:id`, `/warranty-documents/:id/print`, `/portal/warranty-documents/:id`, and `/portal/warranty-documents/:id/print` now exist as the first warranty document foundation. Warranty documents are canonical tenant-scoped records tied to customer/project/job/service-ticket context and rendered from the shared `document_templates` system with a new `warranty` template type. The print routes are browser print/save renderings of the canonical warranty document; they are not detached PDF stores or provider e-sign integrations. Warranty documents now have delivery history through immutable `document_delivery_events` for manual/internal/print proof plus the first guarded provider-backed warranty review/sign email send. Provider-backed warranty send creates notification intent, notification delivery telemetry, and `send_requested` / `sent` / `failed` document delivery evidence; it does not process provider callbacks, auto-complete signatures, or mutate payments/jobs/service tickets.
- `/settings/company-documents` now exists as Company Documents Phase 1C-A: a contractor-owned Document Library for company administration documents such as SOPs, policies, agreements, safety plans, onboarding, training, and internal operations content. It is backed by the tenant-scoped `company_documents` table with forced RLS, active-member read access, owner/admin/manager mutation scope, archive/restore behavior, settings-only create/edit forms, a contractor-side readable detail route at `/settings/company-documents/:id`, and a browser print/save route at `/settings/company-documents/:id/pdf`. The route now also shows a small code-defined Starter Documents catalog; owner/admin/manager users can preview and adopt a starter into a new editable draft `company_documents` copy, while view-only members can preview only. Adoption uses server-owned starter content and does not live-link adopted drafts back to starters. This is not `document_templates`, legal advice, AI drafting, e-sign, employee/customer portal distribution, storage upload, provider sending, public links, delivery proof, persisted platform starter management, or platform-admin management.
- `/estimates/:id`, `/invoices/:id`, and `/contracts/:id` now also show evidence-only Delivery History panels backed by the same immutable `document_delivery_events` foundation. Contractor users can record internal/manual/print delivery evidence for estimates, invoices, and contracts. Estimates now also support guarded provider-backed portal review-link email from draft/rejected estimates to active project-scoped portal recipients. Invoices now support guarded provider-backed portal review/payment-link email for sent or partially paid invoices with an open balance and active project-scoped portal recipients; the send writes notification delivery telemetry and `send_requested` / `sent` / `failed` document delivery evidence without starting checkout, creating payments, changing invoice status, or writing payment events. Contract send-for-signature now attempts provider-backed email delivery to the customer signer after the existing contract signature workflow succeeds; the provider result writes delivery evidence only and does not mark signers signed, create signed/declined/countersign events, replace `contract_signature_events`, start payment, update payment events, or create portal-visible proof.
- Contractor `/invoices/:id` now presents Invoice Review as a review-first billing workspace over the same canonical invoice, line item, payment, Payment Trail, document readiness, delivery, work item, and connected-record data. The page prioritizes invoice identity, existing readiness checks, issue cues, line item review, totals review, payment/event continuity, and guarded customer-send/payment actions before lower-priority editing, support work items, schedule context, connected records, metadata, related conversations, and revision history. This is presentation-only: it does not change routes, schema, loaders, server actions, tax math, retainage math, payment behavior, provider behavior, tenant scoping, or portal access.
- A generic document signature foundation now exists through tenant-scoped `document_signers` and immutable `document_signature_events`, initially constrained to `warranty_document` subjects only. Warranty Document detail has internal signer management and request-signature audit events. Portal warranty review/signing now uses project-scoped portal access, requires project-linked issued/sent/viewed/signed warranty documents, requires the authenticated portal user's email to match a customer signer row for sign/decline actions, appends immutable generic signature events, updates signer status/timestamps, and marks the warranty document `signed` only when all active customer signers are signed. It does not migrate contracts, send email, add countersign workflow, use provider e-sign, expose service tickets to the portal, or mutate invoices/payments/jobs/service tickets.
- Project Workspace, Customer Workspace, and Job Workspace now include compact read-only Service & Warranty continuity panels. These panels show bounded linked service tickets, warranty documents, warranty date ranges, signer/request counts, signed counts, latest signature event summaries, and links to the canonical service ticket, warranty document, and print/save surfaces. They do not edit service tickets, send/sign warranty documents, mutate jobs, mutate billing, create dashboard-owned state, or expose portal behavior.
- Dashboard Operational Cockpit now includes bounded read-only service/warranty signals: high-priority open tickets, stale open tickets, tickets missing linked service jobs, unscheduled/upcoming/in-progress linked service jobs, and warranty documents needing internal signer/request attention. These items route to Service Ticket, Warranty Document, Job, Schedule, and Project Workspaces only; they do not create dashboard-owned persistence, mutate service tickets/jobs/signatures/time/billing, send email, expose portal links, or add signing behavior.
- Portal Project Workspace now has a read-only Customer Next Step helper that
  derives one customer-facing action from already-loaded portal project records:
  sent estimates, in-motion contracts, sent change orders, open invoices, or no
  action needed. This improves customer guidance only; it does not change portal
  loaders, route structure, grants, project-scope enforcement, auth/RLS, tenant
  logic, service-ticket visibility, payment/checkout behavior, signature
  behavior, estimate math, invoice math, or server actions.
- Portal Maturity Phase 2 adds a read-only Project Status Window to the portal
  Project Workspace. It derives customer-safe project status, shared-record
  rows, attention items, completed items, and no-action-needed states from the
  existing portal project estimates, contracts, invoices, change orders, and
  Customer Next Step helper. Portal home now shows a simple per-project `What
matters now` line from existing list fields only. This does not add portal
  models, loader permissions, route changes, schema, migrations, server actions,
  portal grants, auth/RLS, tenant logic, service requests, FieldTrail/Proof
  Center exposure, AI, automation, notifications, payment/signature behavior, or
  estimate/invoice math changes.
- Portal Maturity Phase 3 adds a read-only Project Timeline to the portal
  Project Workspace. It derives customer-safe timeline items from the project
  summary, shared estimates, contracts, invoices, change orders,
  customer-visible appointments, and portal-visible warranty documents already
  loaded by the route. Timeline items link to existing portal review routes and
  mark customer-facing actions as `Waiting on you`. This does not add portal
  models, loader permissions, route changes, schema, migrations, server actions,
  portal grants, auth/RLS, tenant logic, service requests, FieldTrail/Proof
  Center exposure, internal communication details, AI, automation,
  notifications, payment/signature behavior, or estimate/invoice math changes.
- Portal Maturity Phase 4 adds a read-only Shared Documents section to the
  portal Project Workspace. It derives customer-safe document rows from the
  existing shared estimates, contracts, invoices, and change orders already
  loaded by the route, and links to existing portal review pages. It adds
  `Print / Save PDF` links only for existing portal estimate, contract, and
  invoice print routes. This does not add portal models, loader permissions,
  route changes, schema, migrations, server actions, portal grants, auth/RLS,
  tenant logic, storage, stored PDFs, provider sending, Send Trail events,
  payment/signature behavior, estimate math, invoice math, AI, automation,
  notifications, FieldTrail exposure, Proof Center exposure, service requests,
  or closeout package downloads.
- Portal Customer Hub Polish v2 makes `/portal` and the portal Project
  Workspace read more like a customer project hub. Portal home project cards now
  show customer-safe project status, direct estimate/contract/invoice review
  cues, and a clear project hub action; the Project Workspace now includes a
  Customer Action Hub that summarizes the next customer step and the most
  relevant shared records before the deeper status/timeline/document sections.
  Portal invoice payment activity now uses customer-safe payment wording instead
  of provider/gateway metadata. This is presentation-only over existing portal
  loaders, canonical projects, estimates, contracts, invoices, payments,
  change orders, schedule state, and scoped portal access. It does not add
  schema, migrations, portal-only records, access rules, server actions,
  customer messaging, provider integrations, notifications, payment/signature
  mutation beyond existing explicit portal actions, or contractor-only
  intelligence exposure.
- Customer Portal Organization V1 makes `/portal` action-first across existing
  shared project summaries: Needs Your Attention, Active Projects, Documents /
  Approvals, Invoices / Payments, Upcoming Appointments, and History /
  Completed. The portal Project Workspace now prioritizes Needs Your Attention,
  Documents / Approvals, Invoices / Payments, and Project Updates before
  completion records, communication, evidence, timeline, appointments, and full
  record history. This is presentation and deterministic helper organization
  only; it does not add schema, migrations, route renames, portal-only records,
  fake records, access-rule changes, new portal writes, provider behavior, or
  payment/signature/change-order behavior changes.
- Portal financial visibility now adds a deterministic
  [apps/web/lib/portal/financial-visibility.ts](C:/FloorConnector/apps/web/lib/portal/financial-visibility.ts)
  explanation layer to the portal Project Workspace and portal invoice review.
  It summarizes shared invoice count, outstanding balance, payment history,
  latest customer-safe payment activity, and billing readiness from canonical
  invoices, recorded payments, immutable payment events, and the existing
  payment workflow gate. It does not add schema, migrations, duplicate invoice
  or payment models, new financial math, payment mutation, provider sends, or
  portal-owned billing truth.
- Customer-Safe Closeout Package + Portal Handoff v1 adds a shared portal
  closeout handoff read model in
  [apps/web/lib/portal/closeout-handoff.ts](C:/FloorConnector/apps/web/lib/portal/closeout-handoff.ts).
  The portal Project Workspace now shows a customer-safe Closeout Handoff
  section that derives closeout status, next customer action, contract/change
  order/payment/warranty progress, a document package summary, payment status,
  warranty handoff status, a closeout confidence thread, and a clear
  internal-evidence boundary from the same portal-scoped canonical records
  already visible to the customer:
  estimates, contracts, change orders, invoices/payment events, project
  summary, schedule context, portal-visible warranty documents, and explicit
  portal evidence receipt rollups. It does not
  create portal-only closeout records, expose FieldTrail, Proof Center, Daily
  Job Log details, Job Notes, execution attachments, internal blockers, raw
  provider metadata, service-ticket internals, stored PDFs, delivery proof,
  schema, migrations, server actions, access rules, payment/signature mutation,
  provider calls, automation, AI, or customer-facing field evidence.
- Explicit Shared File Visibility + Portal Evidence Grants v1 adds the first
  contractor-controlled sharing policy layer for selected field evidence. The
  canonical `portal_evidence_grants` table is tenant-scoped, project-scoped,
  constrained to `execution_attachment` subjects, and records shared/revoked
  state with actor and timestamp metadata plus optional customer-safe title/note.
  Contractor Project Workspace now labels field evidence as internal-only,
  shared, revoked, or archived-ineligible and lets owner/admin/manager users
  explicitly share or revoke eligible active evidence. Portal Project Workspace
  now shows a Shared Project Evidence section that lists only active, explicitly
  shared evidence for projects already visible through active
  `portal_project_access`; it resolves short-lived signed URLs server-side
  without exposing raw storage paths. The slice does not expose FieldTrail,
  Proof Center, Daily Log bodies, Job Notes, internal field-note contents,
  archived evidence, unshared evidence counts/details, portal-only file copies,
  broad document management, storage deletes, provider calls, AI, or automation.
- Shared Evidence Delivery Proof + Customer Acknowledgement v1 adds an
  append-only proof layer on top of active portal evidence grants. The new
  `portal_evidence_delivery_events` table records `shared`, `viewed`,
  `downloaded`, `acknowledged`, and `revoked` events for explicit
  `execution_attachment` grants only, with tenant/project scope, active portal
  access validation, forced RLS, immutable update/delete triggers, and
  customer-safe metadata. Contractor Project Workspace now summarizes shared
  evidence proof with shared/revoked timing, portal view counts, download
  request counts, and customer acknowledgement state. Portal Project Workspace
  now routes shared file opens through a project/grant-scoped download route
  that records a `downloaded` event only after access validation and signed URL
  issuance, and it offers an explicit acknowledgement action with copy that
  receipt acknowledgement is not a signature and does not change scope, price,
  schedule, or payment terms. The slice does not expose unshared or archived
  evidence, FieldTrail, Proof Center internals, Daily Log bodies, Job Notes,
  raw storage paths, provider metadata, email/open-pixel tracking, legal
  delivery certification, file copies, duplicate portal records, broad document
  management, storage deletes, AI, or automation.
- Shared Evidence Receipt Rollups + Customer Record Export v1 adds a no-schema
  read-model layer in
  [apps/web/lib/portal-evidence-grants/receipt-rollup.ts](C:/FloorConnector/apps/web/lib/portal-evidence-grants/receipt-rollup.ts).
  It rolls explicit `portal_evidence_grants` and append-only
  `portal_evidence_delivery_events` into project-level receipt status,
  active-shared, viewed, downloaded, acknowledged, revoked, and outstanding
  acknowledgement counts, plus contractor and customer-safe receipt rows.
  Contractor Project Workspace now shows a customer receipt history summary in
  the Project Evidence area and exposes a print/save receipt route at
  `/projects/:id/evidence/receipt`. Portal Project Workspace and Closeout
  Handoff now show customer-safe evidence receipt status, acknowledgement
  progress, and a portal print/save receipt route at
  `/portal/projects/:id/evidence/receipt`. These print routes are browser
  renderings of current canonical sharing grants and proof events; they do not
  create stored PDFs, file artifacts, portal-only records, legal delivery
  certification, new schema, storage behavior, provider calls, automation, or
  source attachment mutation.
- Portal Project Workspace and portal home now use deterministic portal-safe
  customer status explanations derived from canonical project, estimate,
  contract, change-order, invoice/payment, and scoped schedule state. The
  explanation returns a customer-safe headline, short explanation, optional
  portal action link, tone, source category, and safe next step for states such
  as contract review, payment requested, payment in progress, ready for
  scheduling, scheduled work, work in progress, and no current customer action.
  Schedule context is limited to project-grant-scoped job dispatch/date fields.
  This does not add provider AI, Copilot exposure, AR pressure language,
  internal blockers, field notes, readiness internals, portal-only status
  records, portal access rule changes, schema, migrations, payment mutation,
  signature mutation, automated sends, notifications, or customer-facing field
  evidence.
- package/billing governance lives under `/super-admin/packages`, including read-only detail routes for package definitions, assignments, provider mappings, and support reviews.

## Current Architecture

FloorConnector is currently implemented as a modular monolith on a shared multi-tenant foundation.

Core architectural characteristics:

- Next.js App Router in `apps/web`
- Supabase for authentication, database access, and row-level-security-backed tenant isolation
- shared canonical business entities across modules
- organization-aware authorization and membership-based access
- server actions plus server-side data utilities for protected business workflows

Current shared canonical model includes:

- users/profile extension
- organizations
- memberships
- platform user roles
- people
- vendors
- equipment assets
- compliance records
- time punch events
- time cards
- daily logs
- punchlist items
- appointments
- opportunities
- platform financial defaults
- platform workflow defaults
- organization financial settings
- organization workflow settings
- organization operational cue rules
- platform template seeds
- platform catalog item seeds
- document templates
- catalog items / reusable cost items
- finish products / manufacturer-product-spec metadata foundation
- floor system templates and template components
- estimate system snapshots / contract system snapshots schema foundation
- customers
- projects
- estimates
- estimate line items
- record revisions for first-pass immutable snapshots on estimates, invoices, contracts, and change orders
- change orders
- schedule of values
- schedule of value items
- jobs
- contracts
- invoices
- invoice line items
- estimate customer events
- notification events
- notifications
- notification deliveries
- communication threads
- communication messages
- GateKeeper memory artifacts
- GateKeeper action suggestions
- GateKeeper execution attempts
- communication preferences
- work items
- workflow error events
- payments
- document delivery events

Equipment asset registry foundation is implemented through tenant-scoped
`equipment_assets`, `/equipment`, and `/equipment/:id`. This first slice tracks
asset identity, ownership/rental status, optional same-tenant vendor linkage,
operational status, purchase/rental fields, notes, active state, and created/updated
user metadata.

Equipment assignment/readiness foundation is implemented through tenant-scoped
`job_equipment_requirements` and `equipment_assignments`. Job Workspace can add
equipment requirements, assign/cancel equipment assets, and show derived warnings
for missing required/optional equipment, unavailable assigned assets, rental-window
mismatches, and overlapping active equipment assignments. Schedule selected-job
context, Project Workspace, and the Dashboard Operational Cockpit show compact
equipment warnings. Dashboard visibility is read-only and uses a bounded
dashboard read model over the same derived warning helper. These warnings are
advisory only: they do not change project readiness gates, job status transitions,
scheduling server actions, crew assignments, invoices, payments, signatures, portal
access, or lifecycle behavior.
The warning derivation now has focused utility tests for missing equipment,
unavailable assigned assets, rental-window mismatches, overlapping active
assignments, inactive assignment statuses, and no-requirement cases; migration
assertion tests cover the same-company trigger/RLS shape.

Maintenance records, utilization, job costing, procurement/AP, portal visibility,
warranty/service equipment behavior, AI automation, autonomous rescheduling, dashboard-owned
equipment cue state, and hard equipment readiness blocks are not implemented.

## Service/Warranty Continuity Foundation

The first service/warranty MVP is implemented through the canonical
`service_tickets` table and protected contractor routes at `/service-tickets`
and `/service-tickets/:id`.

Implemented behavior:

- tenant-scoped `service_tickets` records with customer, optional project, and
  optional original-job relationships
- source, type, status, priority, reported date, warranty start/end dates,
  warranty basis, description, resolution summary, resolved timestamp, and
  closed timestamp fields
- database relationship validation requiring the selected customer, project, and
  job to belong to the same company and project/customer chain
- RLS allowing active company members to read service tickets and
  owner/admin/manager users to create or update them
- protected manager page with exact status/type/priority counts, server-side
  search, status/type/priority filters, bounded ticket rows, and create composer
- protected detail workspace with status actions, editable internal ticket
  fields, linked customer/project/job cards, and explicit planned-later
  placeholders
- compact read-only Project, Customer, and Job Workspace continuity panels that
  show linked service/warranty tickets, linked service jobs, and route back to
  the canonical ticket/job detail workspaces without creating a helpdesk surface
- optional `jobs.service_ticket_id` linkage for follow-up service/warranty jobs,
  with same-company/project validation and no service-only schedule table
- Service Ticket detail can create an unscheduled service job from ticket
  context, list linked service jobs, link to the existing Schedule action panel,
  and prefill `/time` against the linked service job and ticket
- Service Center summary helpers now derive deterministic service/warranty Next
  Moves from existing tickets, warranty documents, service jobs, Proof Center
  context, and CloseoutTrail handoff state. Project Workspace,
  `/service-tickets`, and `/service-tickets/:id` show this as read-only
  continuity guidance without adding service records or changing ticket,
  warranty, job, portal, billing, or provider behavior.
- focused migration assertion tests for the canonical table, relationship/RLS
  guardrails, and excluded deferred systems

Not implemented in this slice:

- customer portal service request intake or portal-safe service status
- outbound warranty document sends, portal-visible delivery proof, contractor
  countersign, or stored portal-only warranty document versions
- warranty/service time clocking context
- dispatch-grade service visit scheduling depth beyond the first linked service
  job foundation
- billing automation, manufacturer claims, invoice/payment mutation, or
  job-costing mutation
- equipment/material usage automation or AI automation

## Warranty Document Foundation

The first warranty document foundation is implemented through the canonical
`warranty_documents` table, shared warranty document templates, protected
contractor detail route `/warranty-documents/:id`, and print/save route
`/warranty-documents/:id/print`.

Implemented behavior:

- `document_templates` now supports the `warranty` template type.
- `platform_template_seeds` includes a default specialty flooring warranty
  template seed that can be copied into contractor organizations as an editable
  tenant-owned template.
- `/settings/templates` now includes warranty templates alongside estimate,
  invoice, and contract templates.
- `warranty_documents` records store tenant scope, customer, optional project,
  optional job, optional service ticket, selected warranty template, status,
  title, warranty start/end dates, warranty basis, rendered content, issue/void
  timestamps, and audit users/timestamps.
- Database validation keeps customer/project/job/service-ticket/template
  relationships inside the same company and requires selected templates to be
  warranty templates.
- Active company members can read warranty documents; owner/admin/manager users
  can create or update them.
- Service Ticket detail can create a warranty document from the ticket context,
  select a warranty template or use the default, list linked warranty documents,
  and route into the warranty document workspace.
- Warranty Document detail lets managers review rendered content, edit draft
  title/date/basis fields, re-render from the saved warranty template, issue a
  draft, void a document, and open the print/save rendering.
- `/warranty-documents/:id/print` renders a customer-facing browser print/save
  view from the canonical warranty document record. The print route remains a
  rendering surface over the canonical record, not stored PDF truth or provider
  delivery proof.
- `document_signers` and `document_signature_events` now provide a generic,
  tenant-scoped signature groundwork for warranty documents only. The tables
  validate same-company `warranty_documents` ownership, keep events immutable,
  and allow active-member read access with owner/admin/manager mutation scope.
- Warranty Document detail now includes internal signer management: add/update
  signer name, email, and customer/contractor role; void unsigned signer
  routing; record `signature_requested` audit events; and review recent
  signature events.
- Requesting signature updates the signer to `requested` where valid and appends
  an immutable event. It does not send email, expose a portal link, change
  warranty document status to signed, or create delivery proof.
- `document_delivery_events` now provides immutable evidence-only delivery
  history for warranty documents, estimates, invoices, and contracts. The table
  validates same-company subject ownership, allows active-member read access and
  owner/admin/manager insert access, supports manual/internal/print evidence
  recording from the supported document workspaces, and can store provider
  metadata for future phases without treating provider data as document truth.
- Warranty Document detail now includes a Delivery History panel and a small
  internal form to record manual evidence such as printed/shared/notified
  activity. Recording delivery evidence does not send email, update warranty
  document status, update signer/signature state, mutate payments, or touch
  contract signature behavior.
- Warranty Document detail now also supports the first provider-backed warranty
  review/sign email action for requested customer signers. The action requires a
  project-linked, customer-visible warranty document, active portal project
  access for the signer email, owner/admin/manager access, active organization
  membership, and an enabled provider/activation path before a real email can be
  sent. It creates `notification_events` communication intent,
  `notification_deliveries` provider-attempt telemetry, and
  `document_delivery_events.send_requested` evidence before delivery. It records
  `sent` evidence when Postmark accepts the email and `failed` evidence when
  activation/config/provider checks block or fail delivery.
- Provider-backed warranty email sends a customer-safe portal
  `/portal/warranty-documents/:id` review/sign link. If Postmark is not
  configured or the organization is locked for production sends, the action
  records failed/no-send telemetry and does not pretend the email was sent.
  Email delivery does not update warranty document status, signer status,
  signature events, invoices, payments, jobs, service tickets, or contract
  signature behavior.
- Estimate Workspace now supports the same guarded provider-backed review-link
  email pattern for draft or rejected estimates with project-scoped portal
  recipients. The action creates `notification_events` communication intent,
  `notification_deliveries` provider-attempt telemetry, and
  `document_delivery_events.send_requested` evidence before delivery. It records
  `sent` evidence when Postmark accepts the email and records `failed` evidence
  when activation/config/provider checks block or fail delivery. Provider email
  delivery does not approve/reject the estimate, create contracts, create
  invoices, mutate payments, or touch contract/warranty signature state.
- Project, Customer, and Job Workspaces now show compact read-only warranty
  document summaries with warranty date ranges, signer counts, requested/signed
  counts, latest signature event type/date, and links to the canonical warranty
  document and print/save route. These summaries do not load rendered document
  content into workspace panels.
- Portal Project Workspace now shows customer-safe issued/sent/viewed/signed
  warranty documents linked to the accessible project. It links to
  `/portal/warranty-documents/:id`, shows the current portal user's signer
  status where available, and keeps internal service-ticket details hidden.
- `/portal/warranty-documents/:id` lets an authorized portal customer review
  the canonical warranty document, see customer-safe project/warranty context,
  print/save, and sign or decline only when their authenticated portal email
  matches an eligible customer signer. Sign/decline actions append immutable
  `document_signature_events`, update `document_signers`, and set
  `warranty_documents.status = signed` only after all active customer signers
  are signed. Decline records signer state and an event but does not void the
  warranty document.
- Focused tests cover warranty template rendering, HTML escaping, migration
  shape, relationship/RLS guardrails, signer input validation, signer status
  transitions, signer summary mapping, and excluded deferred systems.

Not implemented in this slice:

- customer portal service request flow or customer-safe service-ticket status
- provider callbacks, open/click/bounce reconciliation, resend/retry
  orchestration, portal-visible delivery proof, contractor countersign, or
  provider e-sign
- stored generated PDF files as document truth
- billing automation, manufacturer claims, invoice/payment mutation, or
  job-costing mutation
- warranty document signing does not mutate service/warranty time, payroll, or
  job costing
- AI drafting or automation

## Estimate / Invoice / Contract Delivery Evidence

The first cross-document delivery evidence expansion is implemented for
estimates, invoices, and contracts. Contracts now support both manual evidence
and the guarded provider-backed send-for-signature email path, while still
keeping delivery evidence separate from the existing contract signature
workflow.

Implemented behavior:

- `document_delivery_events.subject_type` supports `warranty_document`,
  `estimate`, `invoice`, and `contract`.
- Database validation requires estimate, invoice, and contract subjects to
  belong to the same company as the event.
- Estimate Workspace, Invoice Workspace, and Contract Workspace show bounded
  Delivery History panels that list event type, recipient, channel, note, and
  created date.
- Owner/admin/manager users can record manual/internal/print evidence from the
  supported document workspaces.
- Estimate Workspace can send a provider-backed customer portal review link to
  an active project-scoped portal recipient. That send appends
  `send_requested`, then `sent` or `failed` delivery evidence, and uses the
  existing estimate customer-event/portal tracking path only after provider
  acceptance.
- Invoice Workspace can send a provider-backed customer portal review/payment
  link for sent or partially paid invoices with an open balance and active
  project-scoped portal recipients. That send appends `send_requested`, then
  `sent` or `failed` delivery evidence, but it does not start checkout, create
  payments, write `payment_events`, mark invoices paid/partially paid, or change
  invoice status.
- Contract send-for-signature now attempts provider-backed email delivery to the
  customer signer after the existing contract signature workflow succeeds. It
  appends `send_requested`, then `sent` or `failed` delivery evidence, while
  `contract_signature_events`, `contract_signers`, and existing contract
  status/readiness fields remain the signature workflow source of truth.
- Delivery evidence remains append-only and evidence-only.
- Contract provider delivery evidence does not mark signers signed, create
  signed/declined/countersign events, update readiness beyond the existing
  send-for-signature path, or mirror portal view/sign/decline/countersign
  behavior.

Not implemented:

- automatic contract signature-event mirroring or contract signature migration
- provider callbacks/webhooks
- resend/retry orchestration
- estimate/invoice/contract status automation
- portal approval mutation, payment mutation, payment event mutation, or
  signature mutation
- stored PDF generation or portal-visible delivery proof

## Canonical Revision Snapshots

First-pass canonical revision infrastructure is implemented through `record_revisions`.

Implemented behavior:

- supported subjects are `estimate`, `invoice`, `contract`, and `change_order`
- each revision is an immutable JSON snapshot attached to the existing canonical record
- revisions store tenant/company scope, subject type, subject id, revision number, current-revision marker, revision kind, optional reason, actor, and timestamp
- only one current revision is allowed per subject, and revision numbers are unique per tenant-scoped subject
- new revisions are created through an authenticated, tenant-scoped database RPC that locks the company/subject, demotes the previous current revision, and inserts the next revision atomically while preserving RLS
- estimate, invoice, contract, and change-order workspaces show a secondary revision timeline
- existing records lazily receive an initial `system_snapshot` revision when a supported workspace loads
- create/edit/send/status-change/payment-sensitive mutation paths create new snapshots where the contractor app has a safe authenticated mutation hook

This infrastructure does not clone business records. It does not add rollback, restore, branching, merging, advanced diffing, or event-sourcing behavior. Existing approved-estimate commercial snapshots, change-order commercial snapshots, contract draft edit revisions, signature events, payment events, and notification events remain their existing specialized workflow evidence; `record_revisions` is the shared record-level timeline foundation beside those systems.

## Perspective Views

First-pass perspective switching is implemented on the estimates manager, invoices manager, and leads manager.

Implemented behavior:

- supported URL values are `?view=my` and `?view=company`
- `Company` shows organization-scoped records the current user can already access
- `My Work` filters estimates and invoices using existing creator/updater/sender user fields only
- `My Work` on leads uses the existing appointment assigned-person membership linkage
- perspective filtering combines with existing search, status, source, and follow-up filters
- estimates and invoices also expose URL-backed sorting controls on their Manager Pages, and their interactive row/card regions open the detail record while nested actions remain separate

No new permissions model, saved views, AI prioritization, team routing, or broad dashboard redesign is implemented by this pass.

## Authentication

Authentication is real and already implemented with Supabase Auth.

Implemented auth capabilities:

- Google OAuth
- email/password signup
- email/password login
- sign out
- auth callback handling
- middleware-backed protected route enforcement
- authenticated redirect handling

Current auth routes:

- `/login`
- `/signup`
- `/forgot-password`
- `/update-password`
- `/auth/callback`

Compatibility aliases still exist:

- `/sign-in`
- `/sign-up`

Protected post-auth landing:

- safe internal `next` values are respected, except `/super-admin` still requires the explicit platform role
- platform admins with no `next` land on `/super-admin`
- contractor users with completed company setup land on `/dashboard`
- authenticated contractor users without completed company setup land on `/setup/company`

Early-access setup routes:

- `/setup/company`
- `/setup/billing`
- `/setup/pending-activation`

## Multi-Tenant Foundation

Tenant isolation is already part of the working system.

Implemented tenant foundation:

- authenticated users bootstrap into the app data model on first entry
- first-time users receive:
  - profile record
  - organization/company record
  - owner membership
- repeat logins do not duplicate profile/org/membership records
- tenant-owned tables use Supabase RLS
- protected app queries are scoped to the active organization membership
- authenticated customer portal users with active portal grants but no contractor membership are treated as portal-only and are returned to `/portal` instead of being bootstrapped into contractor workspace ownership when they try contractor routes
- `/setup/company` now provides a first company setup step after signup:
  - writes legal name, display name, logo URL/reference, company phone, company email, website URL, primary trade/service type, brand/accent color, and time zone to the existing `companies` organization record
  - writes the primary address to the existing primary `locations` record, creating that location if needed
  - does not create a company-registration table or duplicate tenant/company model
  - logo upload remains deferred; the current setup stores only a safe hosted logo URL or storage reference
- `/setup/billing` is an early-access billing setup shell:
  - inspects existing Stripe env configuration and the current `companies` organization row
  - creates or reuses a Stripe customer for the active organization and stores only the `stripe_customer_id` reference on `companies`
  - creates a Stripe SetupIntent with automatic payment methods for secure Stripe Elements card collection
  - confirms the SetupIntent client-side without charging the card or creating a subscription
  - verifies the completed SetupIntent server-side, sets the saved payment method as the Stripe customer default, and stores only the `stripe_payment_method_id` reference on `companies`
  - does not store raw card data, create local Stripe-object copies, or charge the user during early access
  - when Stripe is not configured or card collection fails, shows a safe fallback that lets the user continue to pending activation and finish billing later before activation
  - includes a separate FloorConnector SaaS subscription checkout launcher only when matching Stripe test-mode keys and either `platform_billing_settings.stripe_price_id` or `STRIPE_FOUNDER_PLAN_PRICE_ID` are configured
  - creates Stripe Checkout Sessions in `subscription` mode from the server with `company_id`, `billing_domain=floorconnector_saas`, and environment metadata for the Checkout Session and Subscription
  - exposes a separate signed SaaS billing webhook endpoint at `/api/stripe/saas-billing-webhook` that verifies the Stripe signature with `STRIPE_WEBHOOK_SECRET`, processes only `floorconnector_saas` metadata events, and reconciles safe Stripe subscription references/status onto `companies` / `company_subscriptions`
  - the SaaS webhook handles `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, and `invoice.payment_failed` for subscription-state reconciliation only
  - SaaS webhook reconciliation stores only references such as Stripe customer id, subscription id, price id, checkout session id, current period end, last event id, and last webhook time, plus a safe `stripe_saas_billing_webhook_events` idempotency ledger for processed Stripe event ids; it does not store raw webhook payloads or payment details
  - requires the authenticated organization owner/admin role, returns to `/setup/billing`, and never activates the tenant from checkout return
  - checkout return and webhook reconciliation do not activate the tenant
  - does not touch contractor-customer invoice/payment checkout, portal payment state, invoice rows, payment rows, payment events, signature rows, or activation state
- `/setup/pending-activation` reuses existing `companies.tenant_status` and `companies.lifecycle_state` as the pending/active activation state and lets early users enter the real dashboard for safe app exploration
- founder billing evidence is stored on the existing `companies` row for platform-admin tracking only:
  - plan label, expected monthly amount, evidence status, collection method, external reference, notes, evidence timestamp, follow-up timestamp, and updater metadata
  - evidence fields do not create Stripe products, prices, customers, Payment Links, subscriptions, invoices, charges, entitlements, or tenant activation
- the public homepage now includes `Log in`, `Start early access`, and optional `Request Early Access` entry points; requests write to existing canonical `contacts` plus `opportunities` with `opportunities.source = 'early_access'` and `source_detail = 'homepage_request'`
  - in production, `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` must point to the existing company that owns public intake leads; when it is missing, public request submission fails with user-friendly fallback copy instead of silently writing to an arbitrary tenant
  - in non-production only, the form falls back to the oldest existing company if no explicit intake company is configured
- a shared server-side activation guard now uses the same existing company status/lifecycle fields to block irreversible external production actions for pending/trial organizations while leaving setup, dashboard access, and internal canonical record creation available
- guarded production actions currently include estimate customer send, contract send-for-signature, portal checkout/payment processing, and provider-backed notification email delivery
- early-access UX now consistently explains that users can keep building real records while external sends and payment processing remain locked until activation:
  - dashboard shows an early-access status banner with links to finish setup and view `/setup/pending-activation`
  - dashboard redirects users with no completed company profile fields back to `/setup/company`
  - when Stripe is configured and the company has no saved payment method, the dashboard setup banner points users to `/setup/billing`; when Stripe is not configured, billing remains non-blocking
  - estimate send, contract send-for-signature, and portal checkout/payment surfaces show the same "Locked during early access" message when the active organization is pending/trial
  - `/setup/pending-activation` explicitly says users may enter the dashboard, create real projects/estimates/contracts/invoices/jobs, and wait for activation before external sends or payment processing
  - protected contractor routes now include a lightweight `Send Feedback` floating entry that opens a modal and writes feedback to the existing tenant-scoped `workflow_error_events` log with `action = 'early_access.feedback'`; setup pages include a dashboard escape hatch with `Finish setup to unlock full access` guidance
  - `/setup/billing` lets users retry secure billing or continue setup and add billing later if SetupIntent creation, network access, or Stripe card confirmation fails

Membership roles currently supported:

- `owner`
- `admin`
- `manager`
- `member`

## Protected App Shell

The protected contractor app shell is implemented and organization-aware.

Current shell behavior:

- shared protected layout for authenticated app routes
- top-level navigation is now the primary contractor app navigation
- sign out action
- current organization display
- tenant-configurable logo and brand-accent support on the shared organization profile, with contractor-shell brand navigation now returning to `/dashboard`
- organization-aware breadcrumbs
- role-aware navigation visibility
- wider main workspace and calmer dashboard-first shell framing
- flattened shell/header chrome with one shared contractor header system instead of competing stacked header layers
- shared breadcrumb and page-context continuity now live inside the unified top header structure instead of a separate colored band beneath navigation
- the contractor shell and shared Manager Page wrappers now use the accepted Graphite & Copper visual-token foundation instead of the older blue-heavy overview styling
- shared contractor Manager Page wrapper and command-bar pattern now drive the main overview surfaces
- the always-on left sidebar is no longer the primary navigation pattern
- left-side navigation is now reserved for contextual workspace use where needed inside deeper screens
- the v0 / Graphite & Copper visual hardening pass is closed and validated; the current top-nav-first shell and shared Manager Page / Record Workspace patterns remain the active UI baseline
- dashboard, projects, leads, invoices, contracts, customers, estimates, appointments, daily logs, time, people, vendors, and jobs now follow the shared contractor manager rhythm closely enough that it should be treated as the active UI baseline
- a first shared universal-create launcher now exists in the shell and dashboard, routing into the existing module Quick-Create managers so new canonical records can be started broadly without creating a second creation system. Universal Capture now adds a launcher handoff into `/dashboard?capture=1#universal-capture`, where a compact dashboard composer accepts plain-language intent, deterministically classifies site visit, follow-up, estimate, and contract wording, and either routes/prefills an existing safe workflow or creates an internal Work Item through the existing `createWorkItemAction` path after contractor submission.
- `/schedule` now surfaces canonical appointments beside scheduled jobs in internal contractor schedule views through a discriminated read model; jobs still read from canonical job/job-assignment scheduling data and appointments still read from canonical `appointments`
- the good-enough `/schedule` release now presents scheduling as a cross-project command center with a Ready work queue, Scheduled timeline, and selected job action panel for schedule/reschedule context and crew assignment on canonical jobs; dashboard, Jobs, and Job Workspace handoffs route unscheduled jobs into that selected action panel, while ready projects without jobs still route through Project Workspace or canonical job creation first; fixture-backed dashboard coverage now covers both ready-project/job-creation and existing-unscheduled-job/schedule-panel handoffs; the Schedule action panel copy now states the no-job-selected, unscheduled-job, and crew-not-assigned states more directly; it does not create schedule-only records, duplicate jobs, route optimization, or automated dispatch behavior
- CrewBoard Phase 2 improves `/schedule` dispatch usability on the same canonical job/job-assignment foundation: date navigation remains URL-backed for day, week, and board layouts; job cards show schedule-note previews and clearer Project Workspace handoffs; and read-only schedule warnings flag missing crew, missing end times, time overlaps, and capacity/load issues from existing job timing and assignment data. CrewBoard now displays those advisory warnings with compact card badges/counts and selected-job detail copy using contractor-friendly labels such as Missing crew, Missing end time, Time overlap, Capacity warning, and Readiness blocked when existing project readiness data says scheduling should wait. These warnings are advisory only and do not add schema, migrations, dispatch tables, crew tables, server actions, new enforcement rules, automation, drag/drop, calendar sync, notifications, route optimization, auth/RLS changes, tenant-boundary changes, payment/signature behavior, estimate math, invoice math, portal grants, settings behavior, or platform-admin behavior.
- CrewBoard Phase 3B-A adds no-package proposed-move groundwork: pure helpers can turn a CrewBoard date/time target into the existing Phase 3A move payload and summary, `/schedule` can carry a prepared target in URL state, and the selected-job panel can preview a target into the existing `Move schedule` confirmation form. This does not add pointer drag/drop, packages, schema, migrations, routes, server actions, dispatch tables, automatic schedule mutation, auth/RLS changes, tenant-boundary changes, payment/signature behavior, estimate math, invoice math, portal grants, settings behavior, or platform-admin behavior.
- CrewBoard Phase 3B-B adds pointer drag/drop preview with `@dnd-kit/core` as a progressive enhancement on `/schedule`: dragging a job card to a CrewBoard date or time-bucket target prepares the existing Move schedule confirmation flow through URL-backed proposed-move state. Dropping does not save, call a server action, or mutate schedule data; confirmation still runs through the existing schedule action and Ready Check / GateKeeper enforcement. Manual Move schedule controls remain the fallback. This does not add schema, migrations, route paths, dispatch tables, new schedule write paths, route optimization, calendar sync, notifications, automation, auth/RLS changes, tenant-boundary changes, payment/signature behavior, estimate math, invoice math, portal grants, settings behavior, or platform-admin behavior.
- Scheduling Board Depth v2 deepens `/schedule` as a daily/weekly operating board on the same canonical job/job-assignment foundation. The reusable read model now separates Today, Tomorrow, This week, Later scheduled, Ready to schedule, Needs readiness review, Missing Crew, In progress, and recently done lanes; `/schedule` surfaces clearer readiness badges, crew-assignment copy, project/job links, and mobile-wrapping action hierarchy while preserving the existing selected-job action panel and confirmation-first Move schedule flow. It does not add schema, migrations, dispatch tables, duplicate schedule records, new server actions, route optimization, autonomous scheduling, external calendar sync, notifications, provider integrations, fake/demo data, Project Command Timeline mutation, payment/signature/document mutation, or new readiness enforcement.
- Scheduling Board v1 maturity now makes CrewBoard readiness-aware without creating a dispatch subsystem. `/schedule` loads existing project commercial readiness snapshots for visible jobs, separates ready unscheduled jobs from blocked/not-ready unscheduled jobs, adds blocked and overdue-scheduling metrics, shows blocker indicators linking back to the canonical estimate, contract, deposit invoice, opportunity/site assessment, or Project Workspace where possible, and keeps Daily Job Log, missing-crew, warning, project, and job handoffs on the same board cards and selected-job panel. Scheduling and crew mutations still use the existing canonical job and `job_assignments` actions with Ready Check / GateKeeper server enforcement.
- Scheduling + Dispatch v1 adds an ordered Attention Desk to `/schedule` from the same reusable read model. It prioritizes readiness-blocked jobs, past scheduled jobs not completed, scheduled or active jobs missing crew, crew overlap or same-day capacity warnings, aging ready-to-schedule jobs, and in-progress jobs. CrewBoard now also derives compact Triage, Plan, and Dispatch operating-mode summaries from the same canonical job queues so dispatchers can clear blockers, build the upcoming plan, and watch today without changing write paths. Same-day capacity warnings are derived from existing `jobs`, `job_assignments`, people, and vendor assignments when a shared crew resource appears on multiple jobs for the same date and timing is not precise enough to prove a clean window. These signals are advisory and link back to existing Job Workspace, Project Workspace, schedule, and crew-assignment actions; they do not create dispatch records, capacity tables, route optimization, map integrations, notifications, automation, portal schedule promises, new server actions, schema, migrations, or new readiness enforcement.
- CrewBoard now also surfaces explicit project role-slot context for dispatch coordination. Schedule cards and the selected-job panel can show Onsite Rep and Relationship Owner chips when those project role slots resolve to existing active assignable People, linking back to Project Workspace. This is read-only visibility over canonical project role metadata; it does not infer crew assignment, mutate `job_assignments`, expose Sales Credit Owner in dispatch, calculate commission/payroll, send notifications, create schedule records, or add portal behavior.
- Schedule Dispatch Board V1 adds a focused pure section helper for `/schedule`
  that groups Today, Upcoming, Unscheduled / Needs Dispatch, and In Progress
  operational lanes from the existing CrewBoard read model. The UI uses those
  sections for the daily dispatch cards while preserving crew summaries,
  schedule warnings, canonical Job / Project links, and existing schedule/crew
  actions. This adds no schema, migrations, dispatch tables, duplicate
  scheduling records, route optimization, automated dispatching, AI scheduling,
  portal schedule promises, or new schedule write paths.
- CrewBoard / Schedule Calendar MVP keeps `/schedule` on the same canonical
  job and `job_assignments` foundation while making the primary planner modes
  explicit: Day, Week, Crew, and Unscheduled. Day and Week render dated jobs
  and appointments; Crew groups existing operational timing, crew-gap,
  readiness, and execution lanes; Unscheduled shows ready and blocked jobs that
  still need a real date commitment. Existing `layout=board` links normalize to
  Crew. This is presentation and URL-state refinement only; it does not add
  schema, migrations, routes, dispatch tables, calendar-event persistence,
  drag/drop save behavior, route optimization, notifications, portal schedule
  promises, or new schedule write paths.
- Scheduling / Field handoff visibility adds a read-only Field handoff layer to `/schedule`. The schedule page now derives crew assignment state, scheduled-day Daily Log presence, open field blocker/issue counts, field-note counts, same-day time-card counts, open time-card counts, latest field activity, and canonical Job / Project / Daily Log / Field queue links from existing `jobs`, `job_assignments`, `daily_logs`, `field_notes`, and `time_cards`. CrewBoard selected-job context now also shows a compact Field Handoff Packet with job status/schedule/crew, project/customer scope context, linked estimate/contract readiness context where available, schedule-warning/readiness summary, role-slot owner context for Onsite Rep, Relationship Owner, and Follow-Up Owner, field-note/Daily Log state, and canonical source links. Missing estimate, contract, owner, schedule-note, Daily Log, and field-activity context is labeled truthfully. This is visibility only and does not add schema, migrations, dispatch records, field-packet rows, mobile-only state, field task/issue tables, notifications, portal exposure, server actions, or schedule/field mutations.
- schedule views can filter between all items, jobs, and appointments, and appointment entries link to appointment detail plus lead/customer/project context where present
- dashboard appointment visibility now uses the existing `people.membership_user_id` linkage to show `My upcoming appointments` when the current user has an active person record, with a safe company-upcoming fallback when that mapping is unavailable or has no assigned upcoming appointments
- dashboard now includes an internal lead follow-up queue derived from canonical `opportunities.next_follow_up_at`, recent opportunity communication thread timestamps, and existing lead status; it prioritizes overdue and due-today follow-ups without sending reminders or creating a task/reminder table
- the lead manager now surfaces follow-up filters and badges for due, overdue, upcoming, and no-follow-up opportunity states using the same internal read model
- dashboard lead follow-up cues and lead-manager follow-up rows now include explicit manual bridge links into the lead workspace work-item form; those links prefill an internal opportunity-linked work item for human confirmation but do not auto-create work, mutate follow-up fields, or change lead status
- dashboard appointment cues now link into appointment work-item creation with appointment prep or follow-up defaults for human confirmation; completing or dismissing those work items does not change appointment status or schedule state
- project workspaces now include a deterministic `Suggested project actions` panel that reads existing project context only and links into existing human-confirmed workflows for approved-estimate-to-contract, deposit invoice review, open blocker field-note review, signed-contract-to-job quick-create, and ready-project scheduling follow-through; the panel separates canonical workflow actions from human follow-up actions. Canonical next-step cues route to existing contract, invoice, job, or schedule actions, while only human coordination cues such as open blocker field-note follow-up can prefill the existing internal work-item form with project source-locked context for human submission. These cues do not call external AI, auto-create records, or mutate readiness, financial, contract, job, schedule, or field-note state
- project workspaces now include a compact linked-record recency summary that sorts already-loaded estimates, contracts, jobs, invoices, change orders, daily logs, and field-note context by their existing timestamps and highlights the linked record driving the next step when it is present. This is presentation-only breadcrumbing over canonical records, not a new activity feed, event model, automation layer, or fake metric source.
- Project Workspace now includes the first read-only FieldTrail execution timeline inside the Operations Hub. It summarizes existing Daily Job Logs, Job Notes, open blockers/issues, execution attachments/photos, project time-card labor totals, and a Next Move link back into the latest Daily Job Log, current Job Workspace, or CrewBoard. Job Workspace includes a compact job-specific FieldTrail panel. This does not add schema, migrations, routes, field-reporting tables, activity/event tables, document/file subsystems, customer-facing field visibility, server actions, automation, notifications, daily-log uniqueness changes, field-note validation changes, execution attachment behavior changes, time punch/time-card behavior changes, auth/RLS changes, tenant-boundary changes, payment/signature behavior, estimate math, invoice math, portal grants, settings behavior, or platform-admin behavior.
- Mobile Field Phase 1 improves fast Daily Job Log capture using existing
  records and routes. Daily Logs now accept project/job/day prefill for the
  existing quick-create sheet, Daily Job Log editing is grouped for phone-sized
  field capture, Job Workspace opens today's existing Daily Job Log or starts
  today's log, CrewBoard exposes a Daily Job Log handoff, and FieldTrail's
  missing-log Next Move starts a Daily Job Log from the job context. This does
  not add a native app, offline mode, GPS/geofencing, upload mechanics, schema,
  migrations, duplicate field records, time-card derivation changes,
  daily-log uniqueness changes, field-note validation changes, readiness gate
  changes, auth/RLS changes, tenant-boundary changes, portal behavior,
  payment/signature behavior, estimate math, invoice math, settings behavior,
  or platform-admin behavior.
- Mobile Field Phase 2 improves quick Job Notes and field evidence capture
  without changing the data model. Job Workspace now offers quick actions for
  Add Job Note, Add blocker, opening or starting today's Daily Job Log, and Add
  field evidence. Daily Job Log Workspace now has section anchors for Job Notes
  and Field Evidence, and FieldTrail routes blocker or missing-evidence Next
  Moves to those sections when a Daily Job Log exists. This does not add schema,
  migrations, routes beyond anchors, server actions, upload/storage mechanics,
  duplicate field records, customer/portal exposure, AI, automation,
  notifications, auth/RLS changes, tenant-boundary changes, payment/signature
  behavior, estimate math, invoice math, settings behavior, or platform-admin
  behavior.
- Mobile Field Phase 2 QA is documented in
  [docs/design/mobile-field-phase-2-qa-checkpoint.md](C:/FloorConnector/docs/design/mobile-field-phase-2-qa-checkpoint.md).
  Static validation and focused helper tests passed. Mobile browser smoke loaded
  `/daily-logs`, `/jobs`, and `/schedule` with saved contractor auth; protected
  Daily Log and Job detail route checks were blocked by Supabase Auth rate
  limiting and should be retried after auth cooldown rather than counted as
  product failure.
- Mobile Field Phase 3C adds the first contractor-side field evidence upload
  foundation using existing Daily Job Logs, Job Notes, `execution_attachments`,
  and the private `documents` bucket. Daily Log detail evidence forms now accept
  JPG, PNG, WebP, and PDF files up to 10 MB, generate organization/project/Daily
  Log-scoped storage paths server-side, upload to the private bucket, and create
  metadata only after upload succeeds. This does not add schema, migrations,
  public URLs, portal/customer exposure, previews/thumbnails, delete/archive
  behavior, offline mode, GPS/geofencing, AI, notifications, automation,
  provider calls, auth/RLS changes, tenant-boundary changes, payment/signature
  behavior, estimate math, invoice math, settings behavior, or platform-admin
  behavior.
- Mobile Field Phase 3D-A adds contractor-only preview/open links for uploaded
  Daily Log and Job Note field evidence. Daily Log detail resolves one-hour
  signed URLs from the private `documents` bucket by execution attachment id
  after server-side parent validation, then shows `Open image`, `Open PDF`, or
  `Open file` actions without rendering raw storage paths. This does not add
  thumbnails, delete/archive behavior, schema, migrations, storage policy
  changes, public URLs, portal/customer exposure, closeout package file
  embedding, AI, notifications, automation, provider calls, auth/RLS changes,
  tenant-boundary changes, payment/signature behavior, estimate math, invoice
  math, settings behavior, or platform-admin behavior.
- Mobile Field Phase 3E-A adds contractor-side metadata archive/restore for
  Daily Log and Job Note field evidence. `execution_attachments` now records
  archive/restore timestamps, actors, and optional reasons; default attachment
  list helpers exclude archived evidence so active Daily Log rows, FieldTrail,
  Proof Center, CloseoutTrail, Job Workspace, Project Workspace, closeout
  package context, and Reports counts use active evidence only. Daily Log detail
  exposes modest owner/admin/manager archive and restore controls, makes clear
  that archive hides evidence from active workflow views while keeping the
  stored file, and does not sign archived evidence by default. This does not
  delete storage objects, change storage bucket policies, implement hard-delete,
  add provider behavior, create a separate document/file subsystem, create
  portal-only copies, expose field evidence to portal/customer users, add
  thumbnails, add AI summaries, add notifications/automation, or change
  payments/signatures/settings/platform-admin behavior.
- Field Execution Mobile Polish tightens the existing Daily Log Workspace for
  phone-sized field use. Daily Log detail now gives crews a compact blocker,
  issue, unresolved-note, and evidence snapshot near the top of the workspace;
  the Add blocker quick action preselects the existing blocker Job Note type;
  Job Workspace uses the same preselected blocker handoff when today's Daily
  Job Log already exists; and Job Note cards make type/status easier to scan.
  This is UI/linking polish only on existing `daily_logs`, `field_notes`,
  `execution_attachments`, jobs, projects, and time-card context. It does not
  add schema, migrations, routes, server actions, duplicate issue/blocker/punch
  models, attachment models, customer/portal field visibility, AI behavior,
  provider calls, notifications, payroll/time changes, auth/RLS changes,
  tenant-boundary changes, payment/signature behavior, estimate math, invoice
  math, settings behavior, or platform-admin behavior.
- Project Workspace now includes the first read-only MessageCenter communication timeline inside the Operations Hub. It summarizes existing project and related-record communication threads/messages, document Send Trail events, contract Signature Trail events, invoice Payment Trail events, and Customer Access visibility context with a Next Move link into the existing communication or source-record workspace. This does not add schema, migrations, routes, message/thread/notification/delivery tables, duplicate portal message records, provider sending behavior, email/SMS changes, webhooks, server actions, automation, AI drafting, auth/RLS changes, tenant-boundary changes, payment/signature behavior, estimate math, invoice math, portal grants, settings behavior, or platform-admin behavior.
- Project Workspace now includes the first read-only ProjectPulse health and Next Move summary near the top of the workspace. It combines existing Ready Check / GateKeeper readiness, contract/signature, CrewBoard scheduling, FieldTrail blocker/log/evidence, MessageCenter communication, and invoice/payment signals into deterministic health copy, signal cards, linked counts, and a Next Move link. This does not add schema, migrations, routes, project-health/status tables, activity/event tables, server actions, automation, AI recommendations, auth/RLS changes, tenant-boundary changes, payment/signature behavior, estimate math, invoice math, portal grants, settings behavior, or platform-admin behavior.
- Project Workspace now includes the first read-only CloseoutTrail closeout readiness section after the execution history and before the Financial Hub. It summarizes existing jobs, Daily Job Logs, Job Notes, field evidence, change orders, contracts / Signature Trail, invoices / Payment Trail, Customer Access, warranty documents, and service tickets into a closeout checklist, proof counts, and a deterministic closeout Next Move. This does not add schema, migrations, routes, closeout/warranty/document/payment/field tables, duplicate closeout records, server actions, automation, AI summaries, customer-facing field sharing, auth/RLS changes, tenant-boundary changes, payment/signature behavior, estimate math, invoice math, portal grants, settings behavior, or platform-admin behavior.
- Project Workspace lifecycle QA now confirms ProjectPulse as the top-level Next Move owner while FieldTrail, MessageCenter, and CloseoutTrail remain supporting sections with scoped Next Move labels. The page was lightly tightened for density without adding new product panels or changing workflow behavior.
- Project Workspace now uses the same grouped lifecycle language as the dashboard rail for its workflow overview and supporting copy: opportunity, customer/project, estimate/contract, job/schedule, and invoice/payment. This is read-only presentation over existing linked records and readiness data; it does not change readiness enforcement, routing, workflow state, or downstream action permissions.
- Schedule Manager empty states and ready-work guidance now explain whether missing work belongs in Schedule as a job/date/crew issue or upstream in the Project Workspace readiness chain. The guidance still reads canonical jobs, appointments, assignments, and project filters only; it does not create schedule-only records or bypass project readiness.
- dashboard now includes a compact `Project guidance` preview of the highest-priority project cues, linking back to the project cue panel and preserving existing canonical workflow links instead of exposing dashboard-level work-item creation, dismiss/snooze controls, or a separate AI dashboard, task queue, or automation surface
- dashboard now includes a linked canonical lifecycle rail over opportunity, customer/project, estimate/contract, job/schedule, and invoice/payment continuity; it is a read-only summary over existing records and routes users back into current Manager Pages or workspaces rather than creating a dashboard-owned workflow state
- dashboard now includes a lightweight `My Work` Operational Intelligence section. It derives review-only estimate, contract, invoice, and job cues server-side from canonical records plus tenant-owned `organization_operational_cue_rules`; each cue includes compact explanation/source/threshold details and a derived responsibility result so users can see why it appears and which built-in role lane owns the follow-up. Organization-level responsibility defaults can now resolve starter role strategies to active, assignable People records, with a linked app user derived from `people.membership_user_id` when present. Dashboard `My Work` has display-only queue modes for Company, Mine, and Unresolved: Company remains the all-cues organization safety net, Mine filters already-derived cues resolved to the current app user or linked Person, and Unresolved filters strategy-only, organization-queue, and unavailable record-owner fallbacks. Dashboard cue previews respect user-scoped cue suppression but do not expose mutation controls. It does not persist cue instances as business records, auto-create work items, send notifications, run AI, create assignment state, or introduce a standalone task app.
- the first deterministic follow-up cue slice is computed only: stale sent estimates, past-due invoices with open balances, ready unscheduled jobs/projects, and scheduled jobs missing crew derive from canonical records and existing rules, then route users to the matching estimate, invoice, job, project, or schedule surface for human action.
- project, estimate, contract, invoice, and job detail workspaces now include compact record-level `Needs Attention` panels that reuse the same derived Operational Intelligence cues and show the cue explanation/source and responsibility context. Project detail can surface linked estimate, contract, invoice, and job cues while remaining the workflow/readiness hub.
- record and project workspace cue surfaces now support V1 user-scoped cue-state controls for approved deterministic cue identities: supported cues can be dismissed or snoozed for the current user, dismissed/snoozed rows suppress only matching cue fingerprints, expired snoozes reappear, and changed fingerprints reappear. The `workflow_cue_states` table stores response/visibility handling only; absence of a row means active/visible, and cue state does not mark canonical records complete.
- estimate and invoice workspaces can bridge selected record-level operational cues into the existing internal work-item form: stale sent-estimate cues can prefill an estimate source-locked follow-up, and past-due invoice cues can prefill an invoice source-locked collection follow-up. These are cue-to-work-item prefill drafts only; the contractor must submit the existing form, and the bridge does not auto-create work items, send messages, or mutate estimate, invoice, payment, readiness, financial, or workflow status.
- a first real contractor-side global search now exists at the shared shell level:
  - one shared search entry point for contractor users
  - rendered in the shared contractor shell footer instead of the top header
- tenant-safe search across canonical opportunities, customers, projects, appointments, estimates, contracts, invoices, jobs, punchlist items, payments, people, and vendors
  - grouped result sets that route straight into the existing Record Workspaces or linked Invoice Workspace for payment activity
  - status-like search terms are handled without pattern matching enum/status
    columns, and exact date terms use equality rather than `ilike`
- a first real contractor-side notifications layer now exists in the shared shell and dashboard:
  - derived from canonical jobs, invoices, contracts, appointments, punchlists, progress billing, estimate customer activity, and communication activity
  - backed by stored `notification_events`, per-user `notifications`, and channel-aware `notification_deliveries`
  - routes into real downstream workspaces instead of introducing duplicate business records
- shared detail-page/workspace pattern is now implemented across the main contractor record pages:
  - project detail is the reference workflow and readiness hub
  - dashboard and Project Workspace now distinguish projects that are commercially ready but still need canonical job creation before Schedule can take over
  - project, estimate, contract, invoice, and job detail use the decision-first top stack: a truthful `ActionBar`, a conservative `WorkflowBar` where applicable, and a compact state summary before lower-priority detail panels
  - estimate, contract, invoice, and job detail now broadly follow the same shared page language and point back to the project hub when broader handoff state matters
  - contract detail distinguishes draft, sent/awaiting, partially signed, signed/completed, declined, and void states without showing green completion before the contract is fully signed
  - invoice detail treats billing review, balance due, and payment recording as the primary story while keeping line items and payment activity visible
  - job detail treats schedule, crew, status, and project execution state as the primary story while keeping daily logs, time, field, invoice, and support links visible but secondary
  - remaining UI issues are now iterative polish items rather than structural layout breaks
- first-login onboarding readiness has been polished without adding schema or duplicate workflow tracking:
  - dashboard now shows a dismissible `Start here` guide until the first project, estimate, contract, and optional invoice or job are present
  - guide dismissal uses localStorage only for UI preference state, not business workflow state
  - zero-project companies always see Start Here so the first project action stays obvious
  - companies with a project but no estimate are guided toward creating the first estimate next
  - dashboard links now route to the current canonical `/leads` and `/appointments` surfaces
  - first-empty states on leads, customers, projects, estimates, contracts, and invoices include clearer canonical-workflow guidance and one primary first-action path
  - Quick-Create remains the existing canonical-record-first path and still hands off into the full workspace

### Contractor UI System

Implemented contractor UI direction now includes:

- top-nav-first navigation as the default contractor app model
- one flattened shell/header system with breadcrumb and page context folded into the same top header instead of a permanent left-nav-plus-header stack
- thinner command/search strips beneath page identity on Manager Page surfaces
- dashboard as a denser and more curated operational command-center surface with modular queue widgets, stronger Quick-Create entry, and continuity back into shared records instead of a loose summary page
- dashboard validation polish now promotes canonical attention items, open estimates, unpaid invoices, upcoming appointments, leads, active projects, internal work items, and today/live jobs near the top of the home board without introducing fake dashboard data
- dashboard now has smoke-tested PriorityStrip coverage for the decision-first attention area
- early module-dashboard direction on top of the same shared Manager Page system, with estimates and invoices now reading more like operational entry surfaces than plain lists
- Manager Pages built around:
  - page identity
  - command bar
  - overview/list workspace
- Projects, Estimates, Invoices, Jobs, Contracts, and Customers Manager Pages now use more uniform list/card hierarchy, semantic status badges, clearer primary create actions, and light next-action or continuity cues derived only from existing loaded data
- shared composer-sheet pattern for create flows on the main contractor Manager Pages instead of permanently open create forms
- Quick-Create overlays are now the default contractor manager create behavior where appropriate:
  - collect minimum required fields only
  - create the canonical record first
  - route directly into the full Record Workspace for complete editing
- estimate Quick-Create now starts from customer/account and project context; optional opportunity selection is treated as upstream continuity, and project-launched handoff derives the customer before creating the estimate
- lead and project estimate handoff links now preserve an existing linked opportunity id when available so Add Estimate can reuse upstream continuity instead of creating duplicate opportunity context
- estimate Quick-Create now also reuses an existing opportunity already linked to the selected customer project when `/estimates` starts from a customer/project selection without an explicit opportunity, preventing duplicate upstream opportunity context for the same project
- seed-free estimate QA tightened the Customer Workspace so related contacts and portal access reads degrade safely against older local schema caches, and customer detail now shows connected estimate rows in addition to the estimate count
- the shell and dashboard now expose a shared universal-create launcher that deep-links into those existing Quick-Create overlays across the canonical workflow and into the dashboard Manual Universal Capture composer for internal Work Item follow-ups

Current contractor UI design notes:

- Industrial OS Visual System V1 now updates the shared visual foundation toward
  the approved Industrial OS V2 direction. The implementation keeps the
  top-nav-first shell and existing route/workspace architecture, but changes
  shared tokens, Inter typography, primary action/focus color, shell chrome,
  workspace wrappers, status helpers, quick-create chrome, and reusable section
  primitives toward warm white/slate surfaces, charcoal/zinc framing, deep blue
  `#005EB8` primary actions, subtler borders, lower shadow, and restrained
  radii. This is presentation-only and adds no routes, schema, migrations,
  loaders, server actions, duplicate data models, auth/tenant/portal/admin rule
  changes, or workflow behavior changes.
- the dashboard and Estimates reference pass now anchor the accepted Graphite & Copper contractor-app visual foundation without authorizing a broad shell redesign
- existing canonical-record edit forms now use a shared save-state pattern: unchanged records show `Saved`, edits switch the control to `Save`, saving shows `Saving...`, and successful saves reset the dirty baseline to the persisted values
- the dashboard now reads more like a contractor home base than a light summary page:
  - compact priority metrics
  - modular commercial, operations, and finance queues
  - local Quick-Create studio using canonical short-form create flows
  - stronger Graphite/Copper contractor styling scoped to the dashboard surface
- that dashboard/header direction is now pushed more broadly through the protected contractor app:
  - shared Manager Page headers and command bars
  - shared Quick-Create/composer surfaces
  - shared settings and linked-record cards
  - shared overview/detail typography and surface treatment
- the active contractor-app theme direction is now:
  - charcoal/zinc for primary chrome, headers, and strong navigation
  - deep blue `#005EB8` for primary CTAs, save actions, active action emphasis,
    and focus treatment; legacy Graphite/Copper token names remain compatibility
    aliases during the Industrial OS migration
  - semantic status colors through shared helpers: neutral/Graphite tones for draft/not-started/active/current/in-progress utility states, amber/yellow for waiting or needs-action states, red for blocked/error/failed, and green only for complete/approved/paid/signed states
  - white or light-neutral surfaces for primary reading and work areas
  - tighter, more practical spacing and typography across manager screens
- customer portal and super-admin surfaces received only safe visual consistency cleanup after the contractor system stabilized:
  - portal keeps customer-review simplicity and does not copy contractor ActionBar/WorkflowBar patterns wholesale
  - super-admin keeps slate/black administrative CTA hierarchy rather than contractor Copper primary actions
  - both surfaces use calmer card/border/status treatment where safe without changing auth, access, permissions, loaders, routes, schema, backend, RLS, or workflow logic
- the contractor header is now also the shared home for global record search, so search should be treated as shell-level continuity into canonical records rather than as a dashboard-only or module-local widget
- overview pages should read as operational manager screens rather than dense admin tables or stacked forms
- deeper record pages may still use contextual side navigation where it helps, but overview navigation should remain top-nav-first
- dashboards should act as entry surfaces into the shared lifecycle, not as separate module worlds
- the current contractor UI direction should now be treated as implemented truth, not as an experimental branch of the product
- the contractor UI normalization phase is now complete enough to stop; future contractor UI work should start from this baseline instead of reopening the core shell and Manager Page system
- the contractor-facing app is now coherent enough for broader testing, with remaining issues understood as polish and density work rather than structural UI drift

Current protected routes include:

- Dashboard (`/dashboard`)
- Financials Home (`/financials`)
- Leads Manager Page (`/leads`)
- Customers Manager Page (`/customers`)
- Projects Manager Page (`/projects`)
- Estimates Manager Page (`/estimates`)
- Change Orders Manager Page (`/change-orders`)
- Contracts Manager Page (`/contracts`)
- Invoices Manager Page (`/invoices`)
- Payments Manager Page (`/payments`)
- Reports Home (`/reports`)
- Progress Billing Manager Page (`/progress-billing`)
- Schedule Manager Page (`/schedule`)
- Communications Manager Page (`/communications`)
- Appointments Manager Page (`/appointments`)
- Jobs Manager Page (`/jobs`)
- Punchlists Manager Page (`/punchlists`)
- Daily Logs Manager Page (`/daily-logs`)
- Directory Workspace (`/directory`)
- People Manager Page (`/people`)
- Vendors Manager Page (`/vendors`)
- Time Manager Page (`/time`)
- Materials Manager Page (`/materials`)
- Settings (`/settings`)

Current route-language note:

- `/people` is now the intended contractor-side management home for people identity across workforce records, related customer contacts, portal invite state, contact-permission readiness, and project visibility administration
- `/directory` remains the read-only unified contractor-facing scan-and-jump view over canonical customers, related customer contacts, people, vendors, and opportunities, while editable ownership stays on canonical workspaces
- this People management direction does not introduce a duplicate portal user, contact, customer, or permissions model
- `/directory` now exists as a read-only unified contractor-facing view over canonical customers, related customer contacts, people, vendors, and opportunities, while each row still routes into its existing canonical workspace
- the customer, person, vendor, and lead detail pages now include compact Directory-context handoff cards so users can jump back to the read-only index without weakening those canonical detail workspaces as the editing and workflow homes
- Directory customer-contact rows now describe linked portal grants and contact-level permissions as managed on the parent customer detail page instead of presenting portal linkage as future-only

### Module Home Standard

Implemented now:

- major sections can introduce a canonical Module Home route that acts as the control-panel entry point for the domain without creating a second app shell
- `/financials` is now the implemented Financials Home route
- Financials Home is intentionally summary-first and routing-first:
  - open receivables and overdue receivable amount
  - deposit receivables, retained amount, pending payment count, and payment attention count
  - deterministic Financial Control Next Move
  - command-center signals for overdue AR, unpaid deposits, Payment Trail review,
    retained amounts, and open progress-billing balances
  - continuity-map links into Accounts Receivable, Payments, Invoices,
    Projects, Customers, and Progress Billing using the same read-only
    Financial Control and Collections Command Center signals
  - overdue invoices, pending checkout activity, project collection attention,
    and Payment Trail attention
  - collection-opportunity links into canonical Invoice Workspaces
- Financials Home now uses the shared Financial Control read model to surface a
  contractor finance command-center layer across AR, deposits, retained amounts,
  SOV/progress-billing invoices, pending payment activity, failed/voided payment
  events, project collection pressure, customer exposure, and customer-facing
  collection signals. These are read-only derived signals over canonical
  invoices, payments, and payment events; each route returns the user to the
  owning Invoice, Payments, Progress Billing, AR, Project, Customer, or
  Accounting Readiness workspace.
- Financials Home now more explicitly owns cross-project finance action lanes
  for open AR, overdue pressure, deposits/readiness invoices, payment exceptions
  and pending events, and partial balances. Dashboard remains prioritization,
  Project Workspace remains context/diagnosis, and Financials is the action
  workspace. Tax, retainage, invoice templates, numbering, deposit, and workflow
  defaults link back to Settings instead of becoming editable configuration on
  invoice or collections action surfaces.
- `/financials/accounts-receivable` is now a read-only AR Control Room over
  canonical invoices, payments, and immutable payment events, with
  command-center summary cards for open AR balance, urgent/attention count,
  active deposits, Payment Trail issues, and recent successful payment activity;
  invoice status counts; operational continuity lanes for open balances,
  collection attention, deposit readiness, payment-in-progress,
  payment-event review, and recently settled continuity; a scored priority queue
  grouped into urgent, attention, and monitoring bands with invoice status,
  workflow role, due/balance context, customer/project links, and compact latest
  Payment Trail signal context; a deposit continuity lane that distinguishes
  open, in-progress, settled, and void deposit-role invoices without creating a
  separate deposit model; customer exposure rollups; aging buckets; collection
  queues; invoice-level Next Move labels; project links; pending checkout
  visibility; stale pending-payment visibility; recent recorded-payment
  continuity; and failed/voided/in-progress/success Payment Trail review
- Collections Follow-Up Intelligence now deepens
  `/financials/accounts-receivable` with a deterministic read model over those
  same canonical invoices, payments, and payment events. It categorizes overdue
  invoices, unpaid deposits, sent-unpaid balances, partially paid balances,
  payment-in-progress states, failed/voided payment attempts, and
  internal-review cases; shows source-record reasons, latest activity context,
  payment state, amount due, recommended next step, and canonical
  invoice/project/customer links; adds a read-only next-contact brief with
  customer, project, invoice, payment, aging, last-activity, and source-record
  context; separates open payment exceptions from recent settled activity; and
  exposes review-first Copilot draft handoffs only when AI drafting controls
  allow them.
- The AR Collections Command Center priority engine is derived only from
  canonical receivable balances, due dates, workflow roles, Payment Trail
  events, pending/recorded payments, retainage snapshots, progress-billing
  markers, stale activity, and customer-level outstanding totals. It does not
  create a customer financial model, AR ledger, collection task table, payment
  retry, provider sync, reminder automation, or accounting workflow.
- `/financials/accounting-readiness` is now a read-only Accounting Readiness workspace over canonical invoices, payments, payment events, customers, projects, invoice tax reporting entries, and invoice retainage snapshots, with accounting review rows, payment review rows, reconciliation attention, tax/retainage snapshot totals, export-ready column mapping, and in-browser Copy CSV / Download CSV export prep generated from the already loaded accounting review rows
- Invoice Workspace now includes a read-only payment evidence timeline derived from the existing immutable `payment_events` stream, with plain-language settled/pending/failed/voided/review status, compact provider/session references where already stored, and no raw provider payload exposure
- Payments Manager now includes a read-only reconciliation visibility section over recent immutable payment events, including failed, voided, requested, checkout-started, succeeded, and provider-sync evidence linked back to the canonical Invoice Workspace
- Estimate, Contract, and Invoice Workspaces now label their document delivery evidence as Send Trail and show compact read-only proof summaries for send events, viewed/acted evidence, pending/failed attention, and the next source-record review move
- Accounts Receivable does not create a separate AR ledger, accounting subsystem, provider operation, automatic reminder workflow, collection-note model, invoice copy, payment copy, communication thread, notification event, or portal-only billing record
- Accounting Readiness does not create a ledger, accounting tables, provider sync, export storage, export audit events, journal entries, reconciliation postings, invoice copies, payment copies, or accounting-provider records
- The payment evidence and reconciliation visibility slice does not create reconciliation records, mutate invoices/payments/payment events, call providers, add retries/refunds/disputes, or alter invoice/payment math
- The Financials command-center signals do not create ledger rows, accounting
  entries, collection tasks, payment retries, provider sync, retainage-release
  workflow, pay applications, or duplicate finance records.
- Send Trail visibility does not create delivery tables, send actions, provider integrations, webhook behavior, portal-only copies, fake events, AI summaries, automation, or payment/signature/estimate/invoice behavior changes
- `/financials/accounts-payable` remains a module-home placeholder only
- the Financials routes use a shared tenant-scoped collections read model over existing canonical records and do not introduce a new finance data model
- `/reports` now exists as the first internal-beta reporting basics surface
- Reports Home is read-only and intentionally narrow:
  - operations and collections visibility across existing projects, jobs, job assignments, schedule warnings, contracts, invoices, payments, Daily Job Logs, Job Notes, execution attachments, and the Financials collections read model
  - company-level attention cards for open projects, Ready Check attention, scheduling gaps, missing crew, field blockers, waiting signature, open receivables, payment attention, and closeout attention
  - short attention and execution-to-cash lanes linking readiness, schedule, field execution, invoices, payments, and recent movement back to source Project, Schedule, Invoice, Contract, Job, Payment, and Daily Log surfaces
  - lead pipeline summary by canonical opportunity status
  - estimate summary by canonical estimate status
  - invoice summary and aging from canonical invoice balances and due dates
  - recent payment activity from canonical payment records
  - project readiness blocker visibility from canonical project readiness fields
  - Sales Tax Summary from canonical invoice tax reporting snapshots
- the route uses server-side tenant-scoped loaders over `opportunities`, `estimates`, `invoices`, `payments`, `projects`, `jobs`, `job_assignments`, `contracts`, `daily_logs`, `field_notes`, `execution_attachments`, the Financials collections read model, and `invoice_tax_reporting_entries`
- Sales Tax Summary uses invoice issue-date filtering, reports taxable sales, exempt sales, tax collected, invoice count, invoice/payment status context, and customer exemption snapshot visibility, with every row linking back to the canonical invoice
- `/reports` does not create reporting tables, snapshots, exports, charts, mutations, filing workflows, tax-provider integrations, or a separate analytics model
- `/settings/export` now provides the first tenant-scoped Data Export surface for organization owners/admins:
  - exports are read-only downloads over canonical records for customers, customer contacts, projects, estimates, estimate line items, invoices, invoice line items, payments, jobs, and job assignments
  - downloads are module-by-module through `/settings/export/[module]?format=csv|json`
  - CSV exports use contractor-readable field names, stable ids, and relationship labels where safe
  - JSON exports include export metadata, tenant/company context, schema version, field definitions, relationship notes, row count, and rows
  - export data comes from the active authenticated organization membership plus explicit `company_id` filters; there is no raw unrestricted Supabase export
  - payment exports include canonical payment rows only and exclude card/bank details, gateway payment intent references, checkout session references, raw provider payloads, webhook data, and payment secrets
  - portal invite tokens, token hashes, auth sessions, temporary passwords, raw invite links, service-role keys, Stripe keys, webhook secrets, Checkout URLs, and Customer Portal URLs are not exported
  - estimate and invoice line-item exports include customer-facing commercial fields and exclude internal cost, hidden markup, and markup fields in this first foundation
  - export attempts write small `data_export_events` metadata rows after the audit migration is applied, recording who exported, when, module, format, status, record count, schema version, and filename; no exported rows or file contents are stored
  - the same page now includes a validation-only customer/contact CSV import dry run: uploaded CSV text is parsed for column mapping, required-field checks, row-level warnings/errors, and tenant-scoped duplicate signals against existing customers/customer contacts
  - a successful dry run can be saved as a tenant-scoped import review batch in `data_import_batches` / `data_import_rows`; the batch stores normalized preview rows, validation status, duplicate summaries, counts, mapping/schema version, filename metadata, and review-only proposed decisions
  - `/settings/export` lists recent import review batches separately from export history, and `/settings/export/imports/[batchId]` shows a read-only approval shell with row previews, validation states, duplicate notes, and disabled future-approval messaging
  - import remains no-mutation: there is no create/update/delete/merge write path, stored upload, background job, rollback tool, row-decision editing, or preview-to-import commit control
  - future customer/contact import writes still require explicit owner/admin approval behavior, duplicate-resolution UX, create/link-only execution, dedicated import audit completion evidence, export-before-import backup recommendation, and created-only rollback rules before any canonical record mutation is built

Defined but still foundation-only:

- `/financials/accounts-payable` exists as a purpose-defined placeholder for future vendor-bill and outgoing-payment workflows
- AP is a structure/spec route only in this pass:
  - no new schema
  - no payable-side ledger or reporting engine

Additional protected surfaces beyond the contractor app:

- `/portal` now has a real customer-facing shell and project-centered workspace foundation on top of canonical customer-anchored access control, with branded header navigation returning to `/portal`
- `/super-admin` now has a real modular configuration foundation

## Business Objects Implemented

### Leads / Opportunities

Implemented:

- organization-scoped opportunity schema
- create/list/read/update flows
- protected leads list page
- lead detail page
- site assessment scheduled/completed date capture on the canonical opportunity record
- requirements-summary capture on the canonical opportunity record
- next follow-up timestamp and optional internal follow-up note fields on the canonical opportunity record, with contractor-side lead workspace controls to set, update, or clear them
- manual opportunity communication logging from the lead workspace before customer/project conversion through canonical communication threads/messages, including explicit internal versus customer-visible visibility
- lightweight lead workspace Scope Intake capture for manual measurements and structured observations
- canonical lead-to-estimate conversion flow that creates or links the downstream customer and project records as needed

Opportunity statuses currently implemented:

- `new`
- `contacted`
- `qualified`
- `site_assessment_scheduled`
- `site_assessment_complete`
- `estimating`
- `proposal_sent`
- `won`
- `lost`
- `converted`

Opportunities currently link to:

- optional customer
- optional project

Current opportunity design notes:

- opportunities are the canonical pre-project commercial record
- the protected leads surface now starts the contractor revenue path before a full project exists
- starting the estimate flow from an opportunity creates or links the canonical customer and project chain instead of introducing duplicate intake-specific entities
- site-assessment status and timestamps now live on the canonical opportunity record as upstream commercial-readiness foundation data
- requirements capture now lives on the same canonical opportunity and can seed project estimating context during handoff
- linked project readiness now refreshes when opportunity assessment state or requirements capture changes on an opportunity that is already connected to a project
- opportunity-to-estimate and opportunity-to-customer/project handoff now links the opportunity's primary person to the resulting canonical customer as the primary `customer_contacts` relationship when person details exist

### Customers

Implemented:

- organization-scoped customer schema
- create/list/read/update flows
- protected customers list page
- customer detail page
- direct customer creation now preserves the canonical customer/account fields and also creates or links the first captured person as a primary customer contact through existing `contacts` and `customer_contacts`
- project inline new-customer creation now creates the canonical customer account and primary customer contact together instead of leaving the person only in customer-level email/phone fields
- customer detail now includes a compact `Contacts` management section over canonical `contacts` and `customer_contacts`
- contractor admins can now add related customer contacts, edit their basic contact details, and designate one main contact through the shared customer-contact actions; customer detail is the customer-specific home for contact and portal access setup, while People remains the cross-customer identity/access administration view
- `/directory` now also surfaces those related customer contacts as read-only `Customer Contact` entries that route back to the parent customer detail page
- customer detail and Directory now also show portal-readiness and permission context for related customer contacts:
  - whether the contact has an email
  - whether the contact is the main contact
  - whether a linked-contact portal grant has stored permission flags available for enforced actions
- People portal access management now shows whether an existing grant is still customer-level or linked to one canonical related customer contact
- linked-contact portal grants now also store customer-contact portal permissions and allow contractor-admin editing from the People customer-access section using the same canonical actions
- linked-contact portal grants now also enforce stored permissions for portal estimate approve/reject, change-order approve/reject, and contract sign/decline actions
- null-contact customer-level grants still continue to use legacy portal behavior during this first enforcement rollout

Current customer-account guardrails:

- `customers` remain the canonical customer/account records for commercial and financial workflows
- customer entries that later appear inside a unified contractor `Directory` should still be those full canonical customer/account records, not lightweight contact cards
- the first person captured during lead, customer, or inline project customer intake should become the primary related customer contact when enough person detail exists; historical customer-level email/phone values remain fallback fields and may still need non-destructive cleanup reporting
- estimate send, invoice recipient, contract customer context, payment/billing context, and project ownership should continue to use canonical customer/account context, with portal-ready related contacts selected where existing access data supports it
- additional customer contacts are related contacts beneath the canonical customer/account and do not replace it
- `customers.email` remains the account-level fallback for estimate, contract, and invoice recipient continuity when a more specific portal-ready related contact is not selected

Starter fields include:

- name
- company name
- phone
- email
- address fields
- tax exemption status and metadata
- default retainage percentage
- notes
- timestamps

### Projects

Implemented:

- organization-scoped project schema
- create/list/read/update flows
- project-to-customer relationship
- protected projects list page
- project creation now supports either selecting an existing canonical customer or creating a new canonical customer inline from the same project flow
- project detail page
- project detail now surfaces linked lead assessment and requirements context when a canonical opportunity is connected
- project commercial-readiness sync foundation derived from contract, invoice, payment, financing, and workflow-setting state
- stored project readiness fields now refresh from upstream opportunity and estimate mutations instead of waiting for later downstream changes to resync them
- project detail now acts as the upstream sales-to-production readiness hub with blocker visibility, next-best-action guidance, and a derived ready-to-schedule handoff state
- project detail now adds an `Operational command center` summary and compact `Connected record lanes` for Sales / Estimate, Contract / Signature, Change Orders, Billing / Payments, Job / Schedule, Field / Daily Logs, and Customer Access. These lanes summarize existing canonical records and link to the focused workspaces; they do not introduce a new project, activity, schedule, billing, contact, payment, or signature model.
- project and signed contract detail now surface a ready-to-schedule action panel only when the existing project readiness snapshot is clear, guiding users from signed contract into canonical job Quick-Create and the shared project-filtered schedule surface; where an approved estimate is available, the handoff preserves that estimate context so the created job stays linked to the upstream commercial lineage, when exactly one unscheduled job exists the schedule handoff opens the focused scheduling action for that canonical job, and when project jobs already exist without unscheduled work the primary follow-through opens the shared schedule for review instead of pushing another job first
- project readiness is now enforced server-side through a centralized readiness gate before job creation, scheduling, and execution workflows can proceed
- project detail next-action guidance now distinguishes draft/sent/rejected/approved estimate states, contract draft/signature states, deposit readiness, pending change orders, job scheduling, completed-work invoicing, and open invoice/payment follow-up using existing canonical records only
- project detail completed-job invoice actions now preserve the canonical `jobId` when handing off to invoice Quick-Create, and active job follow-up routes through `/jobs?projectId=...` so the project context is not lost
- estimate, contract, and invoice detail pages now point users back to the project readiness hub when the upstream handoff state matters
- the contractor app now has a defined reusable Record Workspace direction: header, workflow summary, primary workspace, context rail, and lower-priority secondary sections
- project, estimate, contract, invoice, and job detail now all use that shared workspace pattern closely enough that the first major UI layout-system polish pass is considered complete
- dashboard, leads, estimate detail, and project detail now normalize the phase-one lead-to-invoice CTA vocabulary around `Start estimate`, `Send estimate`, `Approve estimate`, `Generate contract`, `Open progress billing`, and `Create invoice` without changing workflow logic
- project detail now surfaces linked appointments so project-facing visits and customer coordination stay visible on the same operational root without becoming a second scheduler
- project detail now also includes a compact production-schedule context card derived from canonical jobs and job assignments, surfacing scheduled, unscheduled, and in-progress counts plus next schedule continuity while handing calendar work back to `/schedule`
- customer detail now also includes a compact production-schedule context card derived from canonical customer projects, jobs, and job assignments, surfacing customer-level job counts, next scheduled continuity, crew-state visibility, and project-aware handoff back into `/schedule`
- estimate detail now also includes a compact schedule-handoff context card that stays blocked for non-approved estimates and, once approved, derives project-level production counts, next scheduled continuity, and crew-state visibility only from canonical estimate `projectId`, project jobs, and job assignments
- contract detail now also includes a compact schedule-handoff context card derived only from canonical contract `projectId` plus canonical jobs and job assignments, surfacing project-level production counts, next scheduled continuity, and crew-state visibility without changing contract workflow or creating a contract-schedule bridge model
- invoice detail now also includes a compact linked-schedule context card derived only from canonical invoice `projectId` / optional `jobId` links plus canonical jobs and job assignments, surfacing linked-job or project-level production state without changing billing lineage

Starter fields include:

- name
- customer
- status
- commercial readiness status
- financing status
- ready-to-schedule timestamp foundation
- description
- location fields
- timestamps

### Portal Access

Implemented:

- organization-scoped canonical `portal_access_grants` foundation
- nullable `portal_access_grants.customer_contact_id` support for optionally linking a grant to one canonical `customer_contacts` row
- tenant-scoped canonical `customer_contact_portal_permissions` foundation attached to linked `customer_contacts`
- organization-scoped canonical `portal_project_access` foundation beneath the customer-level grant
- tenant-safe data access foundation for contractor-side portal access management
- authenticated-user portal access lookup foundation for customer-facing record loaders
- tenant-safe portal record loaders for canonical project, estimate, contract, invoice, change-order, and customer-visible appointment review data
- lightweight `portal_record_views` audit foundation for customer-facing record visibility events
- contractor-side portal access remains contact-centered: customer surfaces show recommended-contact and access-summary context, while People remains the cross-customer administration view for granting, linking, reviewing, revoking, and project-scoping customer portal access
- contractor-side portal invite creation now requires a selected customer contact for new invites and supports pending project-scoped invites for customer/contact emails that do not yet belong to an authenticated FloorConnector user
- `/portal/invite?token=...` validates a hashed invite token, shows customer-safe customer/project context, and guides unauthenticated contacts into signup, sign-in, or password reset with the invited email and safe `next` return path preserved
- accepting the invite activates the canonical portal grant only when the authenticated email matches the invite; the activated user can return to `/portal` later through normal Supabase Auth
- portal-bound auth redirects avoid contractor tenant bootstrap so portal-only customer contacts do not receive accidental contractor company owner memberships
- current portal invite creation and resend use app-managed invite links, do not call Supabase Auth admin invite, do not create a Supabase Auth user for the customer, and send branded provider-backed email only when Postmark delivery is configured and activation guard allows external sends
- pending portal invite send/resend prepares a fresh token/hash, returns the fresh copy-link fallback immediately, and records successful or failed provider attempts through `notification_events` plus `notification_deliveries` without storing raw invite tokens
- if the invited email already belongs to an existing canonical app user, portal access activates immediately and no invite token is created
- People customer-access administration now uses a focused portal access console: access-state summaries, customer/contact/status filters, compact contact rows, and one selected contact/grant management panel for invite status, temporary login help, stored permissions, and per-project visibility
- People exposes an explicit copy-access preset from the primary contact to another linked customer contact grant; it only adds or reactivates projects already active for the primary contact and does not silently grant all customer projects
- Project Workspace shows read-only customer contact portal visibility for that project and links back to People for management
- customer detail now also shows stored linked-contact permission readiness, including the supported customer-facing permission set
- customer detail now also stores and edits linked-contact portal permissions, with first-pass enforcement active for estimate approve/reject, change-order approve/reject, and contract sign/decline actions
- customer detail now clearly labels customer-level grants versus linked contact grants and provides cleanup guidance for gradually attaching legacy customer-level grants to existing related customer contacts

Starter fields include:

- canonical customer anchor
- authenticated user linkage
- invited email metadata
- hashed invite-token metadata for pending contractor-created invites
- invited, active, and revoked state
- invite expiration and acceptance timestamps
- activation and revocation timestamps
- explicit project visibility beneath the customer grant

Current portal access design notes:

- portal access is anchored to the canonical customer record instead of inventing a separate portal-customer model
- normal contractor workflow now starts customer portal access from a contractor-created customer/project invite, not from customer self-registration before anything is shared
- portal users set passwords through the normal Supabase-backed signup/password-reset routes; invite-driven signup, login, and reset keep the customer on the app-managed invite path, and contractors do not set or see portal passwords
- contractor-side temporary portal credential issuance is now implemented as a support-only owner/admin action on linked customer-contact portal grants; it uses server-side Supabase Auth Admin APIs to create or update the real Auth user, shows the generated temporary password only once, stores only audit/status fields, and marks the account/grant so password login redirects to `/update-password` before portal continuation
- portal invite email delivery is activation-gated and configuration-aware; if provider email is locked or missing configuration, the UI says no email was sent and preserves the fresh copy-link fallback
- null `customer_contact_id` still represents the existing customer-level portal grant behavior as a legacy compatibility fallback, not the preferred create path
- existing customer-level grants are not migrated, revoked, or altered automatically; they continue to work as legacy account-level portal access
- contractor admins can attach an existing customer-level grant to an existing related customer contact from customer detail or People when they are ready to use contact-level permissions, and the create path now auto-links a reused same-email legacy grant to the selected contact when safe
- linked-contact grants now identify which canonical related customer contact a login represents without changing project visibility behavior
- linked-contact grants now also show stored permission readiness and temporary-credential change-required state in People and contextual customer surfaces
- linked-contact grants now also persist stored permission flags for estimate visibility/approval, contract signing, change-order approval, invoice view/pay, and quote-request readiness
- project visibility is explicitly granted beneath that customer access instead of exposing all tenant projects automatically
- project visibility remains contact-scoped; additional customer contacts do not inherit the primary contact's project list unless a contractor admin intentionally uses an explicit preset/action
- portal read access now flows through the same canonical project, appointment, estimate, contract, change-order, and invoice records instead of portal-specific copies
- contractor admins now manage portal access from People on top of canonical customer, customer-contact, portal-grant, and project-access records rather than a disconnected portal-contact subsystem
- contact-specific permission gating is now active for linked-contact estimate approval/rejection, change-order approval/rejection, and contract sign/decline actions only
- estimate send lookup can now select an existing portal-ready related contact when project access already exists; contract send labels the signer selection as contact selection; contract viewing, contractor countersign, invoice/payment behavior, and null-contact customer-level grants remain unchanged
- a future Directory customer-account workspace may expose dedicated tabs such as `Overview`, `Contacts`, `Projects`, `Portal Access`, and optional `Billing` / `Financial`, but that is a wording and UX direction rather than a current route or schema change
- the customer-facing portal now has a real protected shell, portal home workspace, and project-detail workspace built on that same scoped read layer
- customer-facing estimate, contract, and invoice review pages now exist inside the portal on top of the same tenant-safe canonical record loaders
- portal home and project workspaces now show customer-visible project appointments from canonical `appointments` when `customer_visible = true`, using only customer-safe appointment fields: title/type, date/time, status, location, and `customer_notes`
- portal review remains customer-safe and canonical-record-based in this pass, with contract signing now live on the shared contract record and portal invoice review now able to start customer payment activity on the same canonical invoice and payment chain without introducing a duplicate portal billing model

See [docs/portal-identity-review.md](C:/FloorConnector/docs/portal-identity-review.md) for the current identity/contact/access map, invite behavior trace, and enterprise repair path.

- portal home and Project Workspaces now reflect payment-requested, payment-in-progress, partially-paid, and paid outcomes as part of the same shared project workflow guidance

### Change Orders

Implemented:

- organization-scoped canonical change order schema
- change order linkage to the shared project record and optional linkage to the shared contract and invoice records
- contractor-side change-order Manager Page using the shared Manager Page and command-bar pattern
- contractor-side Quick-Create overlay that captures minimum required fields before routing into the full workspace
- contractor-side change-order detail/workspace page for draft editing, send-for-review, and review-state visibility
- customer-facing portal review page for viewing, approving, and rejecting sent change orders
- immutable approved change-order commercial snapshot creation on approval
- append into schedule-of-values or invoice workflows from approved change-order snapshot lineage
- portal-view audit foundation on the shared `portal_record_views` model using `change_order` as a canonical subject type
- project, invoice, and portal-project continuity sections now surface linked change orders on the same shared workflow chain
- approved change-order snapshots can now create canonical invoice line items or append into canonical SOV rows on the same billing chain

Change order statuses currently implemented:

- `draft`
- `sent`
- `approved`
- `rejected`

Change orders currently link to:

- project
- customer
- optional contract
- optional invoice
- optional applied invoice line item

Current change-order design notes:

- change orders are canonical shared records, not report-only records and not a portal-specific approval object
- change orders extend the existing project, contract, and invoice chain instead of creating a separate scope-change subsystem
- contractor-side Quick-Create captures only the minimum project, title, price-adjustment, and optional linked-record context before handing off to the full change-order workspace
- customer approval and rejection now happen against the same canonical change-order record through the scoped portal surface
- approved change orders create immutable downstream billing lineage instead of mutating prior approved estimate scope
- approved change-order snapshots are append-only and can extend SOV or invoice workflows from the same canonical record chain
- this first version keeps project impact intentionally continuity-based:
  - approved change orders are surfaced through project continuity and downstream billing context
  - deeper schedule, production, and messaging propagation is not implemented yet

### People

Implemented:

- organization-scoped workforce person foundation
- shared canonical `people` model for internal employees and vendor-linked subcontractor workers
- tenant-safe list/read/create/update data access foundation
- optional linked application user foundation for workforce people who also have a platform login
- protected people list/create page
- protected person detail/edit page
- basic compliance visibility on people surfaces

Starter fields include:

- display name
- first and last name
- email
- phone
- person type
- job title
- trade
- classification
- vendor linkage for subcontractor workers
- assignable flag foundation
- active/inactive state
- notes
- timestamps

Current people design notes:

- employees and subcontractor workers now share one canonical people foundation instead of parallel employee and subcontractor person tables
- subcontractor workers link to vendor companies through `people.vendor_id`
- people surfaces now use the same protected CRUD pattern as other canonical admin records, with organization-member linkage and labor-provider vendor selection available in the form flow
- this remains the canonical workforce identity foundation, and it now supports first-pass crew assignment on jobs without introducing a separate crew model

### Vendors

Implemented:

- organization-scoped vendor and subcontractor company foundation
- tenant-safe list/read/create/update data access foundation
- labor-provider flag foundation for future subcontract labor assignment and time attribution
- protected vendors list/create page
- protected vendor detail/edit page
- basic linked-worker and compliance visibility on vendor surfaces

Starter fields include:

- name
- vendor type
- labor-provider flag
- primary contact name
- email
- phone
- address fields
- tax identifier last four
- active/inactive state
- notes
- timestamps

Current vendor design notes:

- vendor companies remain separate from people records
- subcontract labor can now be modeled as vendor company plus vendor-linked workforce people
- vendor detail now shows linked workforce people from the shared people model instead of inventing a vendor-specific worker table
- this is a canonical external company foundation, not a separate payroll or accounts-payable subsystem

### Compliance Records

Implemented:

- organization-scoped shared compliance and credential foundation
- shared canonical `compliance_records` model attachable to either workforce people or vendor companies
- tenant-safe list/read/create/update data access foundation
- future document-linkage hook on the compliance record without introducing a separate compliance-file subsystem yet

Supported record categories currently include:

- `license`
- `insurance`
- `certification`
- `training`
- `background_check`
- `other`

Starter fields include:

- subject type
- subject id
- name
- issuing authority
- reference number
- issued on
- expires on
- status
- optional future document file id hook
- notes
- timestamps

Compliance statuses currently implemented:

- `valid`
- `expiring`
- `expired`
- `missing_information`

Current compliance design notes:

- people and vendors are now the only canonical compliance attachment points for workforce participants and external companies
- insurance, certification, license, and training records extend the same shared compliance model instead of separate per-category silos
- subject existence is validated against the canonical people and vendors foundations in the tenant-scoped server data layer
- this is a shared tracking foundation only; alerts, renewal workflows, OCR, and jurisdiction-specific rule engines are not implemented yet

### Time Tracking

Implemented:

- organization-scoped canonical `time_punch_events` foundation
- organization-scoped derived `time_cards` foundation
- tenant-safe list/read/create data access foundation for time punches and derived time cards
- centralized time-card derivation utility built from punch events
- active-person validation and project or job consistency enforcement in the server data layer
- future-ready location capture hooks on punch events
- protected time capture page now behaves as a clocking center with worker selection, project/job attribution, current punch state, state-aware clock-in, start-break, end-break, and clock-out actions
- current session summary for the selected person, including person, project, job, active clock-in time, and break state when an open session exists
- recent punch-event audit visibility on the time page
- protected time-card review list and detail flow with manager review state
- manager approve/reject actions for derived time cards, with rejection notes and preserved punch-event audit truth
- derived time-review exception visibility for old open sessions, unended breaks, missing prior-day clock-outs, flagged event sequences, and rejected cards needing correction
- crew clock-in support that records one canonical punch-in event per selected available person against the same project/job context
- optional service/warranty ticket attribution on canonical punch events and derived time cards, with same-company/project/job validation
- `/time` can select a Service/Warranty context for individual or crew clock-in without making service tickets required for normal production time
- service ticket detail shows recent linked punch events and time cards, plus a prefilled handoff to the shared time composer
- project and job detail pages now surface basic linked labor and time context
- project/date time-card query helpers now support field-execution labor continuity without duplicating time persistence
- project-attributed time punches are blocked server-side unless the connected project passes the centralized readiness gate

Supported punch event types currently include:

- `punch_in`
- `punch_out`
- `break_start`
- `break_end`

Starter attribution and location fields include:

- person
- project
- optional job
- optional service/warranty ticket
- occurred at
- source
- latitude
- longitude
- accuracy meters
- location capture method
- optional geofence snapshot
- optional superseded event linkage

Current time tracking design notes:

- punch events are the canonical source of truth for workforce time capture
- time cards are derived operational summaries and not the authoritative audit source
- time-card review state is manager workflow state on the derived summary; it does not replace or mutate the punch-event audit log
- punch recording currently enforces active-person constraints before time can be captured
- clock-in requires project or job attribution; break and clock-out actions reuse the active open-session attribution
- time punch transitions are validated so workers cannot clock in twice, clock out before clocking in, start duplicate breaks, end breaks that are not active, or clock out while a break is open
- crew clock-in reuses the same per-person punch validation and does not create a crew model or detached timesheet model
- when a job is supplied, it must belong to the selected project; if only a job is supplied, the project attribution is normalized from the job
- when service/warranty ticket context is supplied, it must belong to the same company and stay consistent with any linked project/job context; no separate service time entries or service timesheet model exists
- contractor-side time capture remains operational and auditable, focused on daily clocking and review rather than payroll, job costing, or financial posting
- geofencing, background location tracking, payroll/export, admin correction events/UI, equipment usage automation, offline mode, billing automation, job-costing mutation, and financial mutations are not implemented

### Daily Logs

Implemented:

- organization-scoped canonical `daily_logs` foundation
- project-level daily execution record with optional dominant job linkage
- tenant-safe list/read/create/update data access foundation
- project/date uniqueness foundation so one canonical log exists per project per day
- practical execution-summary fields for work completed, planned next, blockers, safety notes, and weather snapshot starter fields
- derived daily-log labor summary utilities built from canonical `time_cards` by project/date
- protected daily-log list/create page
- protected daily-log detail/edit page using the shared contractor workspace pattern
- project and job detail surfaces now show linked daily execution context where useful
- lightweight execution-attachment visibility on the daily-log detail workflow
- daily-log creation is blocked server-side unless the connected project passes the centralized readiness gate

Daily log statuses currently implemented:

- `draft`
- `finalized`

Starter fields currently include:

- project
- optional job
- log date
- summary
- work completed
- work planned next
- delays or blockers
- safety notes
- weather summary
- weather conditions
- temperature high and low
- created by / updated by
- timestamps

Current daily log design notes:

- daily logs are project-centered execution records and not a separate field-report subsystem
- one canonical daily log currently exists per project and date, with optional job context when one job dominates the day
- job linkage is validated against the selected project in the tenant-scoped server data layer
- labor continuity now reads through canonical time cards for the same project and log date instead of persisting a second daily-log labor-entry model
- contractor-side daily-log UX now keeps create, review, editing, and note entry on the same protected workflow instead of splitting execution observations into separate modules
- daily-log detail now includes mobile-oriented summary counts for blockers,
  issues, unresolved Job Notes, and field evidence, plus quick actions into
  the existing Job Note and evidence sections
- daily logs remain project-day narrative execution records even now that durable punchlist items exist on the same broader execution chain
- daily-log execution attachments are now lightweight subject-scoped references for photos or files, not a full document-management system
- field evidence archive/restore is metadata-only: active workflows hide
  archived attachments and keep private `documents` bucket objects intact for
  record review

### Field Notes

Implemented:

- organization-scoped canonical `field_notes` foundation
- field notes now require a canonical parent `daily_log`
- tenant-safe list/read/create/update data access foundation
- optional linkage to project-related execution context such as job, workforce person, and time card
- structured note type and simple status foundation for blockers, issues, and punch-list-ready observations without separate subsystem tables
- field-note create and edit UX inside the daily-log detail workflow
- field-note type/status display is now easier to scan in the daily-log
  workspace, with blockers and issues highlighted while preserving the same
  internal-only `field_notes` model
- field-note attachment visibility and add-attachment flow inside the same daily-log workflow
- field-note creation is blocked server-side unless the connected project passes the centralized readiness gate

Supported field note types currently include:

- `general`
- `labor`
- `material`
- `equipment`
- `blocker`
- `issue`
- `punch_list`

Field note statuses currently implemented:

- `open`
- `noted`
- `resolved`

Field note visibility currently implemented:

- `internal`

Starter fields currently include:

- daily log
- project
- optional job
- optional person
- optional time card
- note type
- title
- body
- status
- visibility
- created by / updated by
- timestamps

Current field note design notes:

- field notes are the canonical execution observation model under daily logs for project-day issues, blockers, and supporting observations
- field note project linkage must match the selected daily log, and optional job linkage must belong to the same project
- optional time card linkage is validated against the same project and log date, and also respects selected person/job linkage when provided
- optional person and time-card linkage now works as the intended bridge between field observations and canonical labor records when execution notes need that context
- field notes stay inside the daily-log workflow, while durable corrective and closeout items can now live on canonical punchlist records without overloading the project-day note stream
- field-note attachments use the same shared execution-attachment foundation as daily-log attachments instead of spawning note-specific file models
- customer-facing field note visibility and broader execution workflows remain future work

### Execution Attachments

Implemented:

- organization-scoped canonical `execution_attachments` foundation
- shared attachment linkage limited to:
  - `daily_log`
  - `field_note`
- tenant-safe list/create data access foundation
- protected daily-log and field-note attachment visibility inside the daily-log workspace
- execution-attachment creation is blocked server-side unless the connected project passes the centralized readiness gate

Supported attachment subject types currently include:

- `daily_log`
- `field_note`

Supported attachment types currently include:

- `photo`
- `file`

Starter fields currently include:

- subject type
- subject id
- attachment type
- storage path / file reference
- file name
- mime type
- optional caption
- uploaded by
- timestamps

Current execution attachment design notes:

- execution attachments are lightweight subject-scoped references for field evidence and context, not a full managed file subsystem
- attachments currently hang directly off canonical daily logs or field notes instead of separate issue, blocker, or punch-list entities
- customer-facing sharing, markup, and broad file-management workflows are not implemented in this pass

Financing statuses currently implemented:

- `not_applicable`
- `offered`
- `prequalified`
- `pending`
- `approved`
- `declined`

### Estimates

Implemented:

- organization-scoped estimate schema
- create/list/read/update flows
- project-to-estimate relationship
- customer derived from project
- proposal-style estimate detail page
- dedicated Estimate Editor page
- status transition actions
- estimate detail now surfaces project-level readiness context and a clearer preferred next action instead of implying older parallel downstream shortcuts
- contractor-side customer send flow for estimates
- contractor-side estimate send can target an existing portal-ready customer contact when project-scoped portal access already exists, otherwise it clearly points recipient/access management back to People instead of owning that setup on the estimate page
- customer-facing portal estimate review and approval or rejection
- customer-facing estimate print/save PDF view from the canonical estimate record in contractor and portal scopes
- immutable approved estimate commercial snapshot creation on approval
- approved estimates that are missing their approval snapshot now show a recovery warning on estimate detail/edit and can rebuild the canonical approved commercial snapshot before contract generation
- canonical `estimate_customer_events` audit trail for send, view, comment, approval, and rejection activity
- estimate email tracking for sent, opened, clicked, and viewed states tied to portal review links

Estimate statuses currently implemented:

- `draft`
- `sent`
- `approved`
- `rejected`

#### Estimate System (Current Behavior)

Quick reference:

- catalog-first only; new user-facing manual estimate rows are intentionally disabled
- `catalog_items` is the canonical reusable cost item database and the source for reusable estimate items
- `catalog_system_components` drives reusable systems on top of `catalog_items`
- `estimate_line_items` is the only authoritative pricing truth; `estimates.content.itemRows` is legacy-only
- approved estimates create immutable commercial snapshots for downstream contract, SOV, and invoice lineage
- already-approved estimates with missing snapshot lineage can rebuild the canonical approval snapshot through the estimate recovery action; contract generation still refuses to read mutable/current estimate data
- customer approval is canonical portal behavior for portal customers; contractor-side manual/offline approval requires approver, method, date/time, and evidence/notes, then uses the same canonical estimate status-transition and customer-event trail rather than a duplicate approval model
- Estimate Editor users can create a new catalog/cost item inline and add it through the same catalog-to-estimate insertion flow
- Estimate Editor users can add existing active non-system catalog items as current-estimate snapshots
- catalog-backed estimate item names are clickable for editing the reusable catalog item from the estimate
- editing from the Estimate Editor updates the reusable `catalog_items` row and only the current estimate line-item snapshot; other estimates do not silently update
- approved estimate snapshot editing is blocked
- systems expand from reviewable area, perimeter, count, or fixed-quantity inputs using shared logic before becoming canonical estimate line items
- linked lead Scope Intake measurements can prefill those reviewable system inputs as Source assessment context, but generated output still requires contractor review before save
- defaults apply only on initial load when estimate content is effectively empty
- explicit Estimate Editor save submission validates before persisting and includes conflict protection against stale overwrites
- estimate attachments use one shared `documents` bucket with organization-first pathing
- global search is shell-level and rendered at the bottom only

Planned but not implemented in the current estimate system:

- advanced measurement-driven estimate generation beyond the current reviewable V1 Source assessment prefill, including multiple rooms/zones, irregular geometry, optional component rules, and advanced quantity review
- full System Template estimate generation with formulas, grouping rules, optional components, required inputs, and quick/detailed build modes
- AI Capture or AI-generated estimate draft workflows
- plan/PDF/drawing-based takeoff

### Estimate Line Items

Implemented:

- estimate line item schema
- line-item-based Estimate Editor
- catalog-first add/edit/remove behavior for draft estimate line items
- inline catalog/cost item creation from the Estimate Editor, followed by server-owned estimate line-item snapshot insertion
- click-to-edit for catalog-backed estimate item names; edits update the reusable catalog item and the current estimate snapshot only
- database-calculated subtotal and total logic
- tax and discount support
- approved-estimate-triggered commercial snapshot and schedule-of-values seeding foundation

Estimate totals are currently derived from:

- line item totals
- tax amount
- discount amount

### Jobs

Implemented:

- organization-scoped jobs/work orders schema
- create/list/read/update flows
- protected jobs list page
- job detail page
- create-job flow from project
- create-job flow from approved estimate
- create-job enforcement now requires the connected project to be ready to schedule before downstream work can be created
- job reassignment now applies the same ready-to-schedule gate before an existing job can be moved onto a different project
- scheduling actions now require project readiness before server-side schedule changes are accepted
- job updates that move work into scheduled or execution states are blocked unless the connected project passes the centralized readiness gate
- first-pass scheduling fields on the canonical `jobs` record:
  - `scheduled_date`
  - optional `scheduled_start_at`
  - optional `scheduled_end_at`
  - `schedule_notes`
  - optional `crew_vendor_id`
- first-pass crew assignment through canonical `job_assignments`
- protected server actions for schedule, unschedule, assign crew, unassign crew, list scheduled jobs by date, and list unscheduled jobs
- job detail scheduling workspace for schedule state, assigned crew, and vendor visibility/editing

Job statuses currently implemented:

- `unscheduled`
- `scheduled`
- `in_progress`
- `completed`

Jobs currently link to:

- project
- customer
- optional approved estimate
- optional crew vendor
- optional job assignments to people or vendors

Current job design notes:

- scheduling now extends the canonical job record instead of creating a second dispatch model
- crew assignment now extends the same job through `job_assignments` so time, daily logs, and downstream records can continue pointing at one execution record
- this is intentionally a first scheduling pass only; there is still no route optimization or broader dispatch automation

### Invoices

Implemented:

- organization-scoped invoice schema
- create/list/read/update flows
- protected invoices list page
- invoice detail page
- create-invoice flow from project
- create-invoice flow from approved estimate
- create-invoice flow from job
- line-item-based Invoice Editor
- invoice-linked payment recording foundation
- org financial setting aware tax and retainage scaffolding
- reporting-ready taxable/exempt/tax-collected foundations
- shared template reference foundation
- canonical invoice workflow roles for standard billing and upstream deposit-readiness requests
- canonical contract-owned payment requirements through `contract_payment_requirements` for Financial Readiness terms such as no upfront payment, net terms, due on completion, deposit before scheduling, 50/50, thirds, milestone placeholder, and future progress-billing placeholder. These requirements are tenant-scoped and linked to canonical contracts, projects, customers, optional estimates, and optional invoice evidence. Readiness derives satisfaction from canonical invoice/payment evidence, evaluates fixed and percentage thresholds against linked invoice/payment amounts where configured, and falls back to the existing deposit-invoice workflow when no contract payment requirements exist.
- snapshot-based invoice source system with explicit lineage per invoice line
- invoice creation from approved estimate snapshots, selected SOV rows, approved change-order snapshot rows, or invoice-only adjustments

Invoice statuses currently implemented:

- `draft`
- `sent`
- `partially_paid`
- `paid`
- `void`

Invoices currently link to:

- project
- customer
- optional approved estimate
- optional job

Current invoice design notes:

- invoices remain canonical financial records rather than an isolated module model
- customer and project context stay linked through existing shared entities
- `billing_model` is included so future AIA/progress billing can extend the same canonical invoice header without replacing v1
- `workflow_role` is now included so deposit-readiness and standard invoicing can extend the same canonical invoice record
- deposit requests stay on the same canonical invoice and payment chain rather than becoming a separate deposit model
- standard invoices without downstream job context are now blocked until the project completes contract, signature, and deposit or financing readiness through the commercial handoff
- invoice tax, exemption, and retainage values are snapshotted on the invoice so later customer/org setting changes do not break reporting history
- downstream invoice rows now use one explicit lineage path only: approved estimate snapshot item, selected SOV item, approved change-order snapshot item, or invoice-only adjustment
- limited catalog-backed invoice usage exists only inside invoice-only adjustments / manual catalog-backed rows, where the catalog item is used as a starting snapshot for an explicit adjustment
- free catalog insertion as normal invoice scope is not implemented or allowed; approved estimate, SOV, approved change-order, or explicit invoice-only adjustment lineage must remain the billing source
- downstream billing must not read directly from `estimate_line_items`; those rows remain estimate authoring state only
- contractor-side invoice manager Quick-Create now captures only the minimum project and workflow-role context, creates the canonical draft invoice, and routes into the full Invoice Workspace for complete editing
- contractor-side project, customer, lead, contract, and daily-log managers now also use Quick-Create overlays that capture only minimum required fields before handing off to the full Record Workspace
- invoice overview now follows the early module-dashboard direction: summary, actionable queues, and continuity back into the shared project and billing chain
- invoice manager now preserves project, estimate, job, and deposit workflow context in URL-driven handoffs so project/job invoice Quick-Create stays anchored to the same canonical chain
- a dedicated payments Manager Page now exists as a finance-side module dashboard:
  - review-first summary of recorded, pending, failed, and open collection activity
  - continuity back into the same canonical invoice, customer, and project chain
  - immutable payment-event visibility without replacing invoice detail as billing truth
- a first contractor-side CrewBoard scheduling workspace now exists on the existing `/schedule` route on top of the canonical job model:
  - review-first summary of Ready to schedule, Today, Tomorrow, This week, in-progress, Needs readiness review, Missing Crew, later scheduled work, and recently done work
  - reusable schedule board read model in `apps/web/lib/schedule/read-model.ts` deriving operating queues from canonical jobs, job assignments, and advisory warning summaries
  - dashboard-style readiness review queue for scheduled or active job records needing human review before the day runs cleanly, including missing crew, missing end time, and schedule warnings
  - explicit schedule-view and crew-filter state normalization on the same `/schedule` surface
  - optional `projectId` URL filtering for project-scoped schedule handoff, applied directly against canonical `jobs.project_id` while still allowing `q` text search to narrow the same result set
  - optional `jobId` plus `action=schedule|assign` URL context for opening the existing schedule action panel on a canonical job, with project-scoped single-job inference for older ready-to-schedule handoffs that arrive without `jobId`
  - optional `projectId` URL filtering on `/jobs`, applied directly against canonical `jobs.project_id` while preserving view, search, and Quick-Create handoff state
  - compact active-filter banner on `/schedule` for project, search, crew, and selected job/action handoff state, with per-filter clear links that preserve the remaining query context
  - Next Move guidance for jobs that need scheduling, crew assignment, immediate attention, upcoming review, or completed-job closeout handoff
  - cross-job visibility into crew assignment state using canonical `job_assignments`
  - clearer distinction between unscheduled work, scheduled work, and scheduled jobs that still need crew
  - CrewBoard planner depth on the same `/schedule` surface:
    - bounded week planner
    - day focus view
    - board layout grouped into operational timing lanes for Ready to schedule, today, tomorrow, this week, later scheduled work, in-progress jobs, Missing Crew, and Completed / Recently Done
  - scheduled jobs render from the same canonical job scheduling fields without introducing a separate scheduling model
- inline schedule and crew-assignment action panel that reuses the existing job scheduling and assignment server actions
- crew assignment can now be reviewed and unassigned directly from the same `/schedule` action panel, without leaving the canonical job and `job_assignments` chain
- the `/schedule` action panel now blocks crew attachment until the job has a real date commitment and points users back to people, vendors, job, and Project Workspaces when the next prerequisite is elsewhere
- quick links back into the same canonical job and Project Workspaces instead of a separate dispatch subsystem
- CrewBoard Phase 1 is documented in [docs/design/crewboard-phase-1.md](C:/FloorConnector/docs/design/crewboard-phase-1.md); drag/drop, route optimization, external calendar sync, automated dispatch, notifications, AI scheduling, and map views remain future work

### Appointments

Implemented:

- canonical appointment schema linked to required organization plus optional opportunity, customer, and project continuity
- optional assigned-person linkage to the shared people model
- contractor-side appointments manager/list page using the shared Manager Page pattern
- contractor-side Quick-Create overlay that captures minimum visit or meeting context before routing into the full workspace
- contractor-side appointment detail/workspace page for timing, linked-record continuity, assignment, notes, and status progression
- explicit appointment customer-visibility foundation with `customer_visible`, `customer_notes`, and `internal_notes`; existing `notes` remain internal/legacy contractor notes
- dashboard shortcut and priority visibility replacing the old appointment-management placeholder
- lead, customer, and project continuity links into the same appointment workflow

Appointment types currently implemented:

- `site_visit`
- `customer_meeting`
- `estimate_appointment`
- `follow_up`
- `internal`

Appointment statuses currently implemented:

- `scheduled`
- `completed`
- `canceled`
- `no_show`

Appointments currently link to:

- optional opportunity
- optional customer
- optional project
- optional assigned person

Current appointment design notes:

- appointments are canonical visit, meeting, and planning-block records, not a second execution scheduler
- customer-visible appointment storage and first customer portal display are implemented for project-linked appointments where `customer_visible = true`
- portal appointment display is read-only and project-scoped through existing portal access; it does not support customer self-scheduling, rescheduling, confirmation actions, reminders, or provider-backed calendar sync
- portal appointment loaders expose only customer-safe fields and must not return `internal_notes`, legacy `notes`, assignment internals, or internal communication messages
- internal appointment notes and legacy notes must not be exposed through portal/customer loaders; customer-facing views should use `customer_notes` only when `customer_visible` is true
- jobs remain the execution source of truth for crew scheduling, field delivery, and work-state progression
- appointments may support the same project/customer/opportunity chain, but they should not replace jobs or create schedule-only records

Invoice workflow roles currently implemented:

- `standard`
- `deposit`

### Invoice Line Items

Implemented:

- invoice line item schema
- add/edit/remove line item UI inside invoice create and detail flows
- database-calculated invoice subtotal and total logic
- explicit `lineage_type` support for `estimate_snapshot_item`, `sov_item`, `change_order_snapshot_item`, and `invoice_only_adjustment`

Invoice totals are currently derived from:

- line item totals
- org tax defaults plus customer exemption snapshots
- discount amount
- retainage held amount

### Payments

Implemented:

- canonical payment schema linked directly to invoices
- basic payment recording flow from invoice detail
- automatic invoice balance due updates from recorded payments
- automatic `partially_paid` and `paid` invoice status handling
- canonical online-payment foundation on `payments`, including pending checkout records for real customer-portal and gateway-backed payment actions
- immutable `payment_events` audit foundation for payment request, checkout, success, failure, void, and provider-sync lifecycle events
- reconciliation-ready gateway/session metadata on canonical `payments` and immutable `payment_events` so future provider callbacks can finalize the same payment chain idempotently
- tenant-safe payment workflow helpers for payment request, checkout start, payment success, payment failure, and payment voiding on the same canonical invoice/payment chain
- successful customer-facing payment workflow events now create or finalize canonical `payments` rows instead of introducing a second checkout or portal-payment model
- verified Stripe webhook/callback handling now finalizes or voids the same canonical pending payment rows idempotently using provider event identifiers and canonical payment references
- project commercial-readiness sync continues to flow from canonical invoice/payment status after successful payment finalization or payment voiding
- contractor-side invoice detail now surfaces online-payment readiness, recent payment-event signals, and customer-facing payment continuity without leaving the canonical Invoice Workspace
- contractor-side invoice detail now includes a read-only payment evidence timeline over immutable payment events, with compact provider/session references where stored and no raw provider payload exposure
- Payments Manager now includes a read-only payment evidence review and reconciliation attention queue over recent immutable payment events, linked back to canonical Invoice Workspaces
- contractor-side project detail now reflects deposit and invoice payment outcomes more clearly in readiness guidance and linked invoice summaries
- portal invoice review now surfaces customer-safe payment state, recent immutable payment activity, and a real customer-facing checkout-session handoff on the same canonical invoice/payment chain
- portal home and portal Project Workspaces now carry forward the latest canonical invoice payment progress so payment requests, in-progress checkout, partial payment, and settled outcomes read as part of one connected customer-facing workflow
- customer-facing invoice print/save PDF view now renders canonical invoice line items, totals, balance, and safe payment activity in contractor and portal scopes without mutating invoice/payment state
- contractor and portal payment guidance now distinguish real provider-backed completion, failure, void, pending, partial, and paid outcomes without introducing any separate billing model or checkout record

Payment design notes:

- payment records remain invoice-linked and organization-scoped
- future online payments extend the canonical payment record rather than create a second payment model
- in-progress checkout sessions now attach to canonical `payments` as pending rows rather than a separate pending-payment or checkout-attempt table
- provider-specific transaction references now belong primarily on canonical `payments` and immutable `payment_events`, not on a duplicate portal billing model and not as broad duplicated invoice fields
- provider event identifiers and gateway references are now stored on canonical payment records and immutable payment events in preparation for idempotent webhook processing on the same financial chain
- provider callback processing now stays server-owned, signature-verified, and idempotent so only canonical completed payment states affect invoice paid totals and downstream readiness
- recorded payments on deposit-role invoices can now feed project commercial-readiness status through shared readiness utilities

### Punchlists

Implemented:

- canonical punchlist item schema linked to the shared project record and optional shared job record
- optional assignee linkage to the shared people model
- contractor-side punchlist manager/list page using the shared Manager Page pattern
- contractor-side Quick-Create overlay that captures minimum required closeout context before routing into the full workspace
- contractor-side punchlist detail/workspace page for details, due date, assignee, and status progression
- project and job continuity sections now surface linked punchlist items on the same shared execution chain

Punchlist statuses currently implemented:

- `open`
- `in_progress`
- `resolved`
- `closed`

Punchlists currently link to:

- project
- optional job
- optional assignee person

Current punchlist design notes:

- punchlists are canonical durable closeout records, not dashboard-only artifacts and not a project copy
- punchlists coexist with daily logs and field notes instead of replacing them:
  - daily logs and field notes remain project-day narrative execution records
  - punchlists carry corrective and closeout items that need to survive beyond a single project day
- punchlists stay on the same project/job execution chain instead of becoming a separate field module worldview

### Financial Settings, Tax, And AIA Scaffolding

Implemented:

- organization-level financial settings foundation for default tax rate and tax behavior
- organization-level retainage baseline used to prefill new customer defaults
- customer-level tax exemption and exemption metadata
- customer-level retainage default
- invoice tax reporting view foundation for taxable sales, exempt sales, tax collected, and reporting-period grouping
- schedule-of-values foundation derived from approved estimate commercial snapshots
- contractor-side progress-billing manager and workspace on top of canonical schedule-of-values records
- contractor-side percent-complete review of schedule-of-values items with derived previously billed, current billing, retainage-held, and balance-to-finish math
- canonical progress invoice draft creation and update from real schedule-of-values item state, with invoice line items now optionally linked back to their canonical schedule-of-values rows
- `schedule_of_value_items` lineage support for `estimate_snapshot_item` and `change_order_snapshot_item`
- append-only change-order commercial snapshots that can extend SOV and invoice billing without mutating prior approved scope
- project and invoice continuity links back into the same progress-billing workspace so approved scope, billing review, and invoice continuity stay connected
- Financials Home at `/financials` now serves as the section control panel for cross-project billing, collections, pending-payment, and payment-event visibility without replacing the invoice, payment, or progress-billing managers
- Financial Control Phase 1 adds a pure collections/payment-attention helper for open receivables, overdue invoices, pending payment count, failed/payment-request attention, project collection attention, invoice attention, and deterministic owner Next Move routing from existing invoices, payments, and payment events
- Accounts Receivable at `/financials/accounts-receivable` is now a real read-only collections workspace over canonical invoice balances, invoice status counts, payments, and immutable payment events; Accounts Payable remains a placeholder only
- Invoice Workspace and Payments Manager now deepen read-only reconciliation visibility over the same immutable payment-event stream without adding a reconciliation table, provider sync execution, or new payment state

Current design notes:

- external tax providers are not integrated yet, but the organization financial settings model includes extension points for them
- estimate tax is now derived from organization defaults, customer tax-exempt state, and line-item taxable flags; there is no manual estimate tax override path
- estimate and invoice commercial pricing is now server-owned:
  - `catalog_items` is the enforced pricing source of truth
  - stored estimate and invoice line items act as immutable commercial snapshots
  - browser-sent pricing, hidden markup, taxability, and cost code inputs are rejected on save
- approved estimate snapshots are now the canonical downstream financial source for contracts, SOV, and direct estimate-based invoicing
- the approved-snapshot recovery path only repairs missing snapshot lineage for already-approved estimates and does not change contract or invoice source rules
- schedule-of-values records stay linked to approved estimate or approved change-order snapshot items instead of creating disconnected AIA-only source data
- progress billing now uses the existing SOV layer as the contractor-side billing workspace instead of a disconnected pay-app model
- canonical invoices remain the financial source of truth; progress billing prepares or updates those invoices rather than replacing them
- approved change orders append new immutable snapshot lineage; they do not rewrite the approved estimate snapshot or previously billed rows
- percent complete, prior billed, current billed, retainage held, and retainage release still leave room for deeper pay-application and AIA export workflows later
- full contractor-ready AIA / progress billing remains future maturity. Current
  scaffolding includes SOV, retainage-aware invoice/payment continuity, and
  progress-invoice foundations; it does not include formal AIA-style pay
  applications, continuation sheets, billing periods, GC/architect approval
  workflow, retainage release workflow, document generation/export, or
  accounting/reconciliation maturity.

### Notifications And Communications

Implemented:

- immutable `notification_events` stream for cross-module workflow activity
- per-user `notifications` records for in-app unread and read state
- channel-aware `notification_deliveries` ledger for in-app and email delivery tracking, with future SMS support reserved in the same model; delivery rows can now optionally link back to the canonical `communication_messages` row they attempted to deliver
- canonical `communication_threads` attached to shared customer, project, and subject records
- immutable `communication_messages` inside canonical threads
- GateKeeper memory foundation over the same canonical communication layer:
  - `communication_threads` now have provider-neutral thread category, channel kind, and thread status fields for future memory/review surfaces
  - `communication_messages` now have provider-neutral direction, source kind, channel kind, and occurrence timestamp fields for future timelines
  - `gatekeeper_artifacts` stores tenant-scoped, reviewable memory artifacts such as call summaries, transcript placeholders, extracted requirements, commitments, risk signals, workflow observations, and onboarding notes
  - `gatekeeper_action_suggestions` stores tenant-scoped proposed actions requiring human review, with no execution behavior
  - `gatekeeper_execution_attempts` stores tenant-scoped controlled execution ledger rows for execution requests, attempts, idempotency, result linkage, and failure/audit metadata; the first implemented execution path is limited to reviewed `create_opportunity` requests through the Opportunities-owned creation boundary
  - lightweight server-side utilities can list/create/review GateKeeper artifacts and suggestions against canonical subjects, threads, and messages
- first contractor-side GateKeeper review queue at `/gatekeeper`
  - shows tenant-scoped memory artifacts and action suggestions from the canonical GateKeeper tables
  - includes summary counts for proposed, accepted/reviewed, rejected, and dismissed review states
  - links review items back to canonical subjects where a subject type/id is stored
  - allows accept/reject/dismiss on artifacts and approve-review/reject/dismiss on suggestions
  - approval is review state only and does not create tasks, send messages, schedule work, update canonical records, call providers, run AI, or execute the proposed payload
  - includes a manual GateKeeper intake simulation form that can seed provider-neutral memory artifacts and proposed action suggestions from contractor-entered call/chat/voicemail/internal-note summaries
  - includes deterministic demo examples for new flooring inquiries, existing-customer scheduling requests, missed-call/voicemail follow-up, and internal workflow notes so the review flow can be exercised repeatedly without inventing manual content each time
  - manual simulation uses deterministic form-field mapping only; it does not call AI, transcription, VoIP, SMS, email, call recording, workers, or provider services
  - manual simulation now flows through the first concrete provider-neutral GateKeeper source adapter before persistence; the adapter normalizes source family, channel, direction, participant hints, raw text, optional subject link, idempotency key, and review-only artifact/suggestion drafts
  - demo fixtures are static demo-only payloads over the same manual source adapter path and produce reviewable GateKeeper artifacts/suggestions only
  - when a safe existing opportunity/customer/project subject link is provided, manual simulation can attach the source text to the canonical communication thread/message foundation; otherwise it seeds GateKeeper review data without inventing a thread or business record
  - GateKeeper operational memory panels now appear on Project, Customer, and Lead/Opportunity workspaces; they show linked artifacts, action suggestions, and communication evidence for the current canonical subject, with links back to `/gatekeeper` for review
  - those subject memory panels now include an internal GateKeeper note form that sends contractor-entered notes through the provider-neutral internal-note adapter, creates internal communication evidence where supported, creates a reviewable `workflow_observation` artifact, and creates optional review-only suggestions only for explicit follow-up, estimate, invoice, contract, or scheduling concern note types
  - action suggestion cards include a focused review-detail drawer that shows suggestion identity, source references, linked subject context, rationale, future-action preview details, blockers, validation requirements, and display-only proposed payload content
  - `create_opportunity` suggestions now get a specialized opportunity draft preview in that drawer, showing safely extracted contact, service, contact method, location, notes, requested visit text, missing recommended fields, future validation requirements, and blocked creation status
  - `create_opportunity` suggestions now also include a confirmation preview panel that lets the contractor inspect and edit a future opportunity draft, see read-only duplicate warnings, see missing recommended fields, and save/request execution state before the final controlled action appears
  - the confirmation panel can explicitly save a `confirmation_started` draft to `gatekeeper_execution_attempts`; this ledger write stores the original proposed payload snapshot, the edited draft payload as ledger-only preflight data, preflight warnings, idempotency metadata, and source suggestion/artifact/thread/message references only
  - saving that confirmation draft does not call opportunity actions, does not execute the suggestion, and does not create or update contacts/opportunities/customers/projects/estimates/tasks/schedules/messages
  - saved `create_opportunity` confirmation drafts now reload into a preflight summary in the suggestion drawer; the preflight uses the saved ledger draft, reruns duplicate warnings against that saved draft, reports missing fields, names Leads/Opportunities validation, and only becomes executable from an `execution_requested` ledger row
  - an approved `create_opportunity` suggestion with a saved draft that passes required-field preflight and has no high-confidence duplicate warning can now be explicitly marked as `execution_requested` in `gatekeeper_execution_attempts`; this updates only the GateKeeper ledger request fields and still does not call Opportunities actions or create/update contacts/opportunities/customers/projects/estimates/tasks/schedules/messages
  - an eligible `execution_requested` `create_opportunity` ledger row can now run the first controlled GateKeeper execution action: the server rechecks the approved suggestion, saved draft, required fields, and duplicate warnings, maps only allowed draft fields, calls the Opportunities-owned typed creation helper, creates exactly one canonical opportunity through the existing opportunity workflow, and then updates the ledger to `executed` with `result_subject_type = 'opportunity'` and the created opportunity id
  - failed canonical opportunity creation updates the same ledger row to `failed` with a safe error message; if the opportunity is created but the post-create ledger linkage fails, the action reports that partial-linkage risk and does not retry creation
  - executed and failed `create_opportunity` ledger rows now surface back into `/gatekeeper`: suggestion cards show compact result badges, the suggestion detail drawer/preflight panel shows executed/failed state, created opportunity links point to the canonical lead/opportunity workspace, failed rows show safe error copy, and executed/failed rows do not show the final create action again
  - GateKeeper subject memory panels now include read-only execution-result context for linked suggestions or result subjects when ledger rows are executed or failed; this is a company-scoped ledger read model only and does not create new timeline/event records
  - the duplicate preview for `create_opportunity` checks bounded tenant-scoped opportunities, customers, contacts, and prior GateKeeper execution-attempt ledger rows by exact email, normalized phone, name, and service/location context; matches are warnings only and do not merge, link, or create records, though high-confidence warnings block the ledger-only execution-request transition until reviewed in a later slice
  - the Phase 1 `/gatekeeper` copy is now frozen around the implemented state ladder: review approval is not execution, saving a confirmation draft is ledger-only, requesting future execution still creates no opportunity, and `Create opportunity` appears only for the final controlled `create_opportunity` execution state
  - `schedule_site_assessment` suggestions now get a specialized site assessment scheduling preview in that drawer, showing safely extracted contact, service, contact method, location, requested timing text, scheduling notes, linked subject context, missing recommended fields, future validation requirements, and blocked scheduling status
  - [docs/gatekeeper-schedule-site-assessment-controlled-execution-plan.md](C:/FloorConnector/docs/gatekeeper-schedule-site-assessment-controlled-execution-plan.md) is a planning-only note for future `schedule_site_assessment` execution; runtime behavior remains preview-only, and the plan recommends an Opportunities-owned opportunity assessment scheduled-state update before any appointment/job/schedule/message behavior is added
- GateKeeper source adapter planning foundation:
  - [docs/gatekeeper-source-adapters.md](C:/FloorConnector/docs/gatekeeper-source-adapters.md) defines the future provider-neutral ingestion boundary for manual, phone, voice-agent, transcription, chat, SMS, email, portal, internal-note, and support/onboarding sources
  - [docs/gatekeeper-controlled-action-bridge.md](C:/FloorConnector/docs/gatekeeper-controlled-action-bridge.md) defines the future safety boundary between reviewable suggestions and explicit canonical workflow execution
  - `apps/web/lib/gatekeeper/source-adapters.ts` defines planning-only source-family/channel/direction/event/result types and a pure adapter-result helper
  - `apps/web/lib/gatekeeper/manual-source-adapter.ts` implements the first safe manual adapter pattern over the same contract, but it still only prepares provider-neutral communication context, GateKeeper artifacts, and GateKeeper action suggestions for review
  - `apps/web/lib/gatekeeper/internal-note-adapter.ts` implements a provider-neutral internal-note adapter for contractor-entered operational notes on project/customer/opportunity records
  - `apps/web/lib/gatekeeper/action-bridge.ts` defines risk/owner/preview-policy helpers for controlled action planning; `create_opportunity` is the only suggestion type marked execution-capable in the current slice, and it still requires an approved suggestion plus an `execution_requested` ledger row
  - `apps/web/lib/gatekeeper/execution-preview.ts` builds non-mutating future-action previews for GateKeeper suggestions, including owner, risk tier, validation requirements, blocked/request-required execution status, and display-only proposed payload previews
  - `apps/web/lib/gatekeeper/execution-ledger.ts` builds pure non-persisting execution ledger draft objects and idempotency keys for future controlled execution attempts
  - `apps/web/lib/gatekeeper/create-opportunity-confirmation.ts` builds the pure display model for the `create_opportunity` confirmation preview; the display helper is draft/readiness presentation only, while the explicit save action writes only the GateKeeper execution ledger and never writes canonical records
  - `apps/web/lib/gatekeeper/create-opportunity-execution-draft.ts` builds the ledger-only `create_opportunity` confirmation draft payload and preflight warnings used by the explicit save action
  - `apps/web/lib/gatekeeper/create-opportunity-preflight.ts` and `apps/web/lib/gatekeeper/create-opportunity-preflight-data.ts` build and load preflight summaries from saved ledger drafts; they read `gatekeeper_execution_attempts` plus duplicate-warning context only, build executed/failed result display state, and do not mutate canonical records
  - `apps/web/lib/gatekeeper/create-opportunity-execution-request.ts` defines the pure eligibility and ledger-update shape for the `create_opportunity` execution-request status transition; the server action updates only `gatekeeper_execution_attempts.status`, `requested_by`, `requested_at`, and updater metadata
  - `apps/web/lib/gatekeeper/create-opportunity-execution.ts` defines the controlled execution eligibility, allowed-field mapper, safe ledger success/failure updates, and error sanitization for the first real `create_opportunity` execution path
  - `apps/web/lib/gatekeeper/create-opportunity-duplicates.ts` and `apps/web/lib/gatekeeper/create-opportunity-duplicates-data.ts` build and load the read-only `create_opportunity` duplicate preview; they query existing tenant records for warning context only and do not import mutation actions
  - `apps/web/lib/opportunities/create-opportunity-service.ts` is the Opportunities-owned typed creation boundary used by GateKeeper execution; it validates with `opportunityInputSchema` and calls the existing `createOpportunity` flow instead of exposing the FormData/redirect action
  - this adapter layer does not call providers, call AI, create webhooks, add credentials, add schema, send communications, or execute suggestions
- first contractor-side communication review surface at `/communications`
  - review-first queue over canonical threads and unread notifications
  - Communications v1 now adds a shared record-linked workspace read model in `apps/web/lib/communications/workspace-summary.ts`, deriving lane counts, follow-up signals, customer-visible/internal thread counts, finance context, closeout/evidence context, latest activity, and delivery/evidence attention from existing canonical communication, notification, document-delivery, and portal-evidence proof rows
  - the `/communications` workspace now opens with a communication control-room summary over customer conversations, project threads, commercial records, finance/collections context, closeout/evidence activity, and internal coordination without creating a disconnected inbox product
  - Delivery Proof V1 clarifies existing document-delivery and shared-evidence context in `/communications` with read-only proof state, proof source, and boundary labels such as customer-facing, provider-derived, internal evidence, delivery proof available, customer activity, send requested, and needs review; it does not add delivery behavior or new state
  - Delivery Proof V2 groups existing proof context by canonical source record inside `/communications`, showing compact read-only record groups with source-record links, communications review links, latest proof state, proof counts, proof source/boundary labels, customer/internal labels, and review-needed ordering where failed, bounced, or revoked evidence exists
  - Delivery Proof Review V1 adds a compact read-only review summary over those grouped proof records so contractors can see whether any canonical source record has failed, bounced, revoked, or review-needed proof before treating the communications lane as quiet
  - Delivery Proof Review V1 now counts all review-needed proof items in the `/communications` follow-up status, including warning-level shared-evidence revocation, instead of counting only critical delivery failures
  - document delivery events and explicit portal evidence delivery events appear as context only; they are not copied into message rows, do not send email/SMS, do not create provider calls, and do not mutate source documents, evidence grants, payments, signatures, or closeout state
  - thread preview and continuity links back to canonical customer, project, estimate, contract, invoice, change-order, and payment records where available
  - selected-thread review now renders a clearer chronological history from canonical `communication_messages`, with actor labels, timestamps, empty-state handling, and compact source-record context on the same thread panel
  - direct thread links now stay explicit: if a requested thread is unavailable in the current filters, the page shows unavailable-thread guidance instead of silently selecting another thread
  - project and customer detail pages now expose compact communication-continuity handoff cards derived from canonical thread summaries, with customer-visible/internal/open counts, latest-thread preview, and direct links back into `/communications`
  - contract, invoice, change-order, and estimate detail pages now expose the same compact communication-continuity handoff pattern from canonical thread summaries, without embedding inbox behavior on those workspaces
  - Job Workspace now exposes a compact project-linked communication-continuity panel that points to the existing `/communications` workspace for full project/thread context; jobs still do not create job-owned message state or a job-local inbox
  - first safe contractor-side reply composer now exists on existing thread preview/detail and supports explicit internal-note versus customer-visible message visibility
  - contractor replies reuse the canonical posting helper and write new rows to `communication_messages` on the existing `communication_threads` record
  - project and customer workspaces now include a compact record-linked composer that creates or reuses the canonical project/customer thread, then saves an internal note or customer-visible portal-history message without external delivery
  - reply and triage forms now preserve the all-sources filter safely and explain that replies do not send email/SMS or execute automation
  - first safe contractor-side notification triage now exists for communication unread state
  - contractor users can mark selected-thread or all communication notifications read by updating canonical per-user `notifications` records only

Current design notes:

- notifications are now implemented as stored canonical workflow signals rather than ephemeral shell-only state
- notification deliveries track sent, delivered, opened, clicked, and failed channel outcomes without creating duplicate estimate, invoice, or change-order records
- communication threads stay attached to the same canonical customer/project chain instead of creating module-specific inboxes
- communication threads can now attach directly to canonical opportunities for pre-conversion lead communication without creating a duplicate lead-activity table
- communication messages now include durable message kind, explicit visibility (`internal` or `customer_visible`), and logging/delivery status fields; the lead workspace can log manual calls, email notes, text notes, voicemails, appointment notes, and internal notes, and manual opportunity logs default internal unless deliberately marked customer-visible
- communication threads/messages can now attach to canonical appointments for contractor-side appointment confirmation history; appointment confirmation logs use `message_kind = 'appointment_confirmation'`, `visibility = 'customer_visible'`, and `delivery_status = 'logged'` only after explicit server-side logging, while `appointment_reminder` exists as a future classification and does not schedule or send reminders
- a server-side appointment confirmation preview utility builds customer-safe confirmation copy from canonical appointment fields only: title/type, date/time, status, safe location, `customer_notes`, safe customer/project context, and company name; it must not include `internal_notes`, legacy `notes`, internal communication, work items, or assignment internals
- appointment workspaces now include a contractor-only Customer Confirmation panel that shows eligibility blockers, renders editable customer-safe confirmation copy, lists eligible email recipients, lets the contractor manually log the confirmation, and can manually send an email confirmation after explicit human confirmation
- server-side appointment confirmation email utilities can resolve eligible email recipients from active project-scoped portal access, customer contacts, and canonical customer email fallback, then send customer-safe confirmation content through the existing Postmark-backed notification email path after an explicit server call
- appointment confirmation email delivery uses the canonical `communication_messages` row as communication history and `notification_deliveries.communication_message_id` as provider-attempt audit linkage; `communication_messages.delivery_status` is marked `sent` only after the provider send succeeds, and failed provider attempts leave the message unsent while recording a failed delivery
- `communication_preferences` now provide an organization-scoped, RLS-protected foundation for customer/contact communication preferences across email and future SMS categories; V1 utilities support customer and customer-contact preference validation for appointment reminder readiness and manual email reminder sends, and customer detail exposes contractor-admin email appointment-reminder preference management with no portal preference UI
- server-side appointment reminder utilities can build customer-safe reminder previews, resolve email reminder recipients from the existing appointment confirmation recipient path, and filter recipients through explicit `allowed`, `opted_out`, or `suppressed` appointment-reminder preferences; missing email appointment-reminder preferences default to allowed
- manual server-side appointment reminder email sending can create or reuse an appointment-linked `communication_messages` row with `message_kind = 'appointment_reminder'`, send customer-safe reminder content through the existing Postmark-backed notification email path, link the provider attempt through `notification_deliveries.communication_message_id`, and mark the message `sent` only after provider success
- appointment reminder sending suppresses non-customer-visible appointments, missing customer/project context, canceled/no-show/completed appointments, missing start times, missing eligible email recipients, opted-out/suppressed recipients, and duplicate successful reminder emails to the same recipient for the same appointment; failed provider attempts are recorded without marking the message sent
- appointment workspaces now include a contractor-only Customer Reminder panel that shows reminder readiness blockers, renders editable customer-safe reminder copy, lists preference-filtered eligible email recipients, links to customer preference management when filtering leaves no eligible recipient, manually sends one reminder email after explicit human confirmation, and shows recent reminder communication/delivery history
- appointment reminder utilities and UI do not create reminder schedules, automate sends, use SMS, mutate appointment status/notes, or expose anything to customers
- communication messages are immutable and extend shared workflow continuity rather than replacing estimate, contract, invoice, or change-order records
- GateKeeper artifacts and action suggestions extend canonical communication memory without creating a disconnected AI memory silo, duplicate CRM, autonomous workflow engine, provider-specific table set, or portal-only communication copy
- approved GateKeeper action suggestions are review state only; approval still does not execute tasks, send messages, schedule appointments, update projects, mutate estimates/contracts/invoices, call providers, run AI, or create opportunities
- the `/gatekeeper` route is contractor-only review surface over the GateKeeper memory foundation; it is not a customer portal, AI assistant runtime, provider inbox, or automation queue
- GateKeeper manual simulation creates reviewable memory and proposed suggestion rows only; suggestions remain `proposed` until reviewed and there is no execution path behind the seed form. The manual path is now the first source-adapter implementation, but it remains deterministic, human-entered, provider-free, and review-only.
- GateKeeper demo fixtures are QA/demo scaffolding only; they reuse the manual source adapter and do not add live data ingestion, fake customers, fake projects, fake schedules, or automatic execution
- GateKeeper source adapters are currently limited to manual simulation and internal-note implementations plus provider-neutral contracts/documentation; future providers must enter through normalized events and still land in canonical communication messages, memory artifacts, and proposed action suggestions
- GateKeeper subject memory panels can now create contractor-only internal notes, but they do not review suggestions inline, execute proposed payloads, send messages, schedule work, create tasks or business records, mutate canonical workflow state, run AI, call providers, or expose anything to the portal
- GateKeeper controlled action bridge helpers classify suggestion risk and owner modules, and `/gatekeeper` can show non-mutating future-action previews for suggestions in the queue and detail drawer. `create_opportunity` is now the only controlled execution-capable action, and only after a separate confirmation draft, duplicate/preflight pass, approved review, and `execution_requested` ledger state; review approval remains review state only.
- GateKeeper execution attempts are ledger/audit infrastructure for controlled execution state. They separate execution state from suggestion review state, record `create_opportunity` confirmation drafts, reload saved drafts into preflight, accept an explicit `execution_requested` transition, link a successful controlled create to the canonical opportunity id, and surface executed/failed results in the GateKeeper queue, drawer, and subject memory panel. GateKeeper still does not create customers, projects, estimates, tasks, jobs, schedules, invoices, contracts, payments, messages, portal records, provider calls, or AI output from those ledger rows.
- portal/customer access to opportunity communication is not implemented; the new customer-visible flag is stored for future safe display and RLS blocks internal message reads from portal users
- internal lead follow-up visibility is implemented as a contractor-side read model over canonical opportunities and opportunity communication recency; it does not send customer reminders, auto-create work items, or expose internal follow-up notes to portal users
- appointment create/edit surfaces now expose explicit customer-visible appointment controls plus separate internal appointment notes and customer-visible appointment notes; portal home and project workspaces can now display project-linked customer-visible appointments using only customer-safe fields
- the current appointment workspace UI can manually send email appointment confirmations through the existing Postmark-backed notification path when the appointment is eligible, an email recipient is selected, and the organization is allowed to send externally; it still does not send SMS/voice/chat, schedule reminders, expose portal confirmation actions, or trigger automation
- appointment confirmation logging and email delivery do not mutate appointment status, `customer_visible`, `customer_notes`, `internal_notes`, legacy `notes`, portal visibility, automation runs, work items, or external calendar state
- internal `/schedule` and dashboard views now display canonical appointments, including opportunity-linked appointments, alongside job scheduling context without creating a separate calendar/event table; contractor users may see internal appointment notes on contractor-only surfaces, while customer-visible appointment notes remain explicitly labeled for future portal use
- dashboard appointment visibility now labels today/tomorrow appointments and can include recent canceled/no-show appointments as internal follow-up cues only; it does not send reminders or expose contractor-only appointment context externally
- internal `work_items` now provide a small organization-scoped action layer for contractor work ownership, due dates, assignment, completion, and dismissal; they are internal-only, RLS-protected, manually created through server utilities and contractor UI, and source-linked back to canonical records without replacing opportunity follow-up fields, appointment statuses, notifications, automation runs, workflow error events, or canonical workflow state
- dashboard now shows a compact internal work-item card. It prefers open work items assigned to the current user's linked active `people` record when that mapping exists and has work, and safely falls back to open company work items with assignee context when no linked-person queue is available.
- lead workspaces now show opportunity-linked internal work items, allow explicit manual or lead-follow-up work-item creation against the current opportunity, and allow open linked work items to be completed or dismissed. Completing or dismissing a work item does not mutate `opportunities.next_follow_up_at`, lead status, communication visibility, or appointment state.
- appointment workspaces now show appointment-linked internal work items, allow explicit manual appointment prep/follow-up work-item creation against the current appointment, and allow open linked work items to be completed or dismissed. Completing or dismissing a work item does not mutate appointment status, schedule fields, customer-visible appointment notes, reminders, portal visibility, or external calendar sync.
- the contractor communication surface still stays on the same canonical review queue, but selected existing threads and project/customer record composers can now accept safe contractor-authored messages without introducing a second inbox, portal-specific copy, or new message model
- communication triage on the contractor surface updates only the user's canonical `notifications.is_read` and `read_at` fields for communication-category records; it does not mutate `notification_events`, messages, or add message-local read state
- communication baseline hardening is limited to queue clarity, selected-thread handling, unsupported-source copy, reply validation, and read-state feedback; provider sends and automation execution remain intentionally off
- `/communications` now also supports compact URL-driven queue filtering by status grouping and supported source record type, plus text search across loaded customer, project, source-record, and preview labels from the same canonical thread list
  - status grouping and source-record filtering now shape the server-side communications loader where safe, using the same canonical `communication_threads` foundation plus per-user communication notifications for unread and needs-response queue state
  - supported source filters are currently limited to lead/opportunity, customer, project, estimate, contract, invoice, change order, and payment; unsupported source queries such as `source=job` now render an explicit help state instead of implying unsupported communication coverage
  - text search currently stays as a client-side fallback over the loaded canonical thread labels and preview text so existing URL search behavior remains unchanged without introducing new indexing, shadow fields, or external search infrastructure
  - Portal-Safe Replies v1 now lets authenticated portal customers reply to existing customer-visible, project-scoped communication threads from the portal Project Workspace. Replies write one canonical `communication_messages` row with `sender_type = portal_user`, `visibility = customer_visible`, `direction = inbound`, `channel_kind = portal`, and `delivery_status = logged`, then update the canonical thread summary so contractor `/communications` and Project MessageCenter can see the latest customer reply. Portal replies require active customer portal access plus active project visibility, only load customer-visible messages, and cannot create internal notes, portal-only message copies, provider email/SMS sends, notification/delivery events, automation, or fake communication data.
  - Portal Communication Trust v1 now adds a portal Project Workspace trust summary over those same customer-visible project conversations. The summary derives waiting-on-you counts, contractor-review state, latest visible activity, per-conversation status labels, and portal-safe boundary copy from existing canonical `communication_threads` and `communication_messages` only. It does not add schema, migrations, duplicate communication records, provider/customer-facing sends, autonomous messaging, AI customer communication, notification events, or portal-only message truth.

### Shared Templates

Implemented:

- shared organization-scoped `document_templates` foundation for estimate, invoice, contract, and warranty workflows
- platform-managed template seed definitions that can be copied into contractor organizations as editable tenant-owned templates
- contractor-side settings UI for adopting, editing, archiving, and defaulting organization-owned estimate, invoice, contract, and warranty templates
- shared merge-data preparation utilities for organization, customer, project, estimate, invoice, contract-generation, and warranty contexts
- default-template resolution helpers for estimate, invoice, contract, and warranty workflows

Current design notes:

- organization templates are editable copies and do not stay coupled to a mutable global platform template record
- estimate and invoice records now support optional shared template references instead of module-specific template models
- contract template generation is shared through the same template and merge-data foundation
- warranty document generation is shared through the same template and merge-data foundation
- these are document templates, not future System Templates for measurement-driven estimating
- the implemented settings surfaces do not yet provide one dedicated Templates & Systems administration area; that future area should organize document templates, System Templates, add-ons/options, and sharing/review controls without moving them into separate module-specific silos
- proposal/SOW templates and future work order templates are planned document-template categories, not implemented template categories today
- flexible customer-facing display modes such as clean grouped view, detailed line-item view, SOW plus price view, and custom per-record template switching beyond the implemented estimate/invoice/contract template references remain future work

### Catalogs And Reusable Items

Implemented:

- platform-scoped starter catalog item seeds for materials, labor, services, equipment, and systems
- organization-scoped reusable catalog item records
- `catalog_items` now act as the canonical reusable cost item database for commercial pricing foundations and optional inventory tracking
- Cost Items Database now exists as a first-class contractor module with routes for dashboard, items, systems, inventory, and settings
- contractor-side adoption of platform starter items into organization-owned copies
- organization-side editing, defaulting, and archiving of reusable catalog items
- reusable catalog item commercial fields for cost, price, taxable flag, vendor, category, and item status
- optional linked inventory tracking on catalog items through `inventory_items`
- linked inventory tracking now exposes quantity on hand, reorder point, default location, manual adjustments, and recent transaction history from the same cost item workflow
- canonical `catalog_system_components` foundation for system / assembly rows attached to `catalog_items`
- tenant-owned `finish_products` foundation for manufacturer/product/spec proof metadata
- tenant-owned `floor_system_templates` and `floor_system_template_components` foundation for future floor system templates backed by `catalog_items`
- tenant-owned `selected_floor_systems` foundation for chosen or proposed finish/service systems linked to real tenant workflow records
- tenant-owned `estimate_system_snapshots` and `contract_system_snapshots` schema foundation for future selected-system/spec proof at customer-facing estimate and contract review/signature boundaries
- contractor-side System Layers settings at `/settings/system-layers` for admin-only list, create, edit, status progression, archive, and component maintenance over `finish_products`, `floor_system_templates`, and `floor_system_template_components`
- contractor-side Selected Systems settings at `/settings/selected-systems` for admin-only list, create, edit, status changes, retraction/voiding, and project-primary validation over tenant-owned `selected_floor_systems`
- estimate line item authoring can add active non-system `catalog_items` from the Estimate Editor Catalog Items panel, with server-owned snapshot creation
- estimate users can create new catalog/cost items inline from the Estimate Editor, with the saved catalog item inserted into the current estimate through the same server-owned snapshot path
- catalog-backed estimate item names can be clicked from the Estimate Editor to edit the reusable catalog item and refresh only the current estimate line snapshot
- catalog edits made from one estimate do not mutate other estimates that already snapshotted the same catalog item
- approved estimates block catalog-backed estimate snapshot editing
- archived catalog items remain visible for review in the Estimate Editor panel but are blocked from insertion and rejected server-side
- system catalog items continue to use the existing system expansion flow instead of direct single-line catalog insertion
- sqft-expanded systems continue to generate normal canonical estimate line item snapshots through the existing system flow
- organization-scoped reusable `estimate_content_blocks` foundation for scope, inclusion, exclusion, and terms snippets

Current design notes:

- organizations do not depend on one mutable global starter item after adoption
- reusable items stay on the same canonical foundation instead of spawning module-specific catalog silos
- `catalog_items` is the shared commercial item master and the only canonical cost item model; there is no second cost item table
- catalog items are the current Phase 1 foundation for reusable item pricing, cost fields, taxable behavior, optional inventory links, and future production/markup behavior
- `finish_products` are metadata/proof records only; they do not own cost, pricing, quantity basis, estimate expansion, invoice behavior, or reusable item behavior
- `floor_system_template_components` require `catalog_items` for cost/pricing/quantity/estimate expansion and may optionally reference `finish_products` only for product/spec proof
- `selected_floor_systems` rows are tenant-owned through required `company_id`; they are not public/pre-auth visualizer rows and they require at least one canonical workflow anchor such as opportunity, customer, project, estimate, contract, or job
- `estimate_system_snapshots` and `contract_system_snapshots` now exist as schema foundation only; no estimate workflow, contract workflow, UI, server action, Estimate Builder path, or contract generation path writes these snapshot rows yet
- system snapshot rows are designed as future proof/approval records: they use status values instead of normal delete/soft-delete behavior, preserve frozen selected-system/product/component metadata, and restrict updates to status/metadata/audit fields
- `/settings/selected-systems` maintains selected-system records only; it validates same-company template, finish product, and workflow anchors, and automatically unsets other project-primary rows when a selected system is marked primary
- `/settings/system-layers` and `/settings/selected-systems` are admin/data-access surfaces only; no estimate generation, contract generation, job integration, system snapshot writes, files/file links, delivery proof, activity timeline, visualizer, or downstream selected-system workflow is implemented yet
- estimate workflows now reuse and snapshot active non-system catalog item data through canonical `estimate_line_items`; future invoice and materials workflows should extend the same shared model instead of creating module-specific item silos
- inventory is now an optional operational extension of the same catalog item instead of a separate primary inventory workflow
- inventory availability is now controlled through the shared platform / organization feature policy key `inventory_enabled`
- linked inventory rows currently use the default location in the contractor UI, while the schema allows additional locations later without splitting the item master
- item-level tax UX is intentionally simplified to a taxable on or off checkbox, with tax rates remaining in organization and platform financial settings and optional `tax_code_id` retained as advanced infrastructure
- estimate item sourcing snapshots from `catalog_items` for active non-system catalog items through the Estimate Editor panel; general-purpose invoice catalog insertion and materials execution workflows remain future work
- limited invoice-only manual catalog-backed rows may use `catalog_items` as a starting snapshot for explicit invoice-only adjustments, but they do not create approved-scope invoice billing from live catalog rows
- invoice pricing remains snapshot-based through approved estimate, SOV, change-order, or invoice-only lineage; inventory quantity is operational context only and does not drive pricing
- catalog-first estimate authoring does not change schema, downstream invoice behavior, contract behavior, SOV behavior, payment behavior, or approved-snapshot billing lineage
- `system` remains the canonical reusable assembly concept, with component rows designed to scale immediately by sqft in estimates
- current systems are reusable catalog assemblies, and the new floor system template tables are schema foundation only; they are not yet active estimate/contract behavior, required-input workflows, formulas beyond current sqft expansion, grouping rules, Quick Build, Detailed Build, or share-back review
- current catalog management is still foundation-first; future work should deepen reuse across estimating, invoicing, and execution without replacing the shared catalog and line-item chain
- planned add-ons/options should be catalog-backed optional scope modifiers, not a second pricing model; examples include cove base, control joints, crack repair, coating removal, moisture mitigation, extra topcoat, prevailing wage labor adjustment, and mobilization/setup
- cove base is currently best treated as a catalog item and optional system/add-on component; it is not a full floor system by itself
- long-term labor should become an internal catalog/cost item component with crew size, production rate, minimum site time, markup, and condition/access multipliers, while near-term labor may remain baked into system or item pricing
- internal cost, markup, margin, private notes, and production math should remain hidden from customer-facing templates unless intentionally configured for customer scope language

### Contracts

Implemented:

- organization-scoped contract schema
- contract generation from approved estimate and project context
- contract Quick-Create opens from `/contracts?compose=1`, preserves `estimateId` selection context, and shows returned generation blockers inside the composer
- organization-scoped approved-estimate contract template assignment in contractor settings
- protected contracts list page
- contractor-side contract detail/review page
- lightweight draft contract editing flow
- shared-template-backed rendered contract content
- canonical contract status lifecycle scaffolding
- contract revision snapshot foundation for pre-sign edits
- signature-started lock behavior scaffold
- internal approval actions and send-readiness enforcement on canonical contract drafts
- canonical contract signature-state foundation fields on the existing `contracts` record
- supporting `contract_signers` workflow foundation for signer-role modeling
- supporting immutable `contract_signature_events` audit foundation for signature lifecycle history
- tenant-safe server-side signature workflow helpers for send, customer-viewed, customer-signed, customer-declined, optional contractor countersign, and signature void/completion state updates on the same canonical contract
- contractor-side onsite customer signature capture for sent/viewed contracts, using a canvas signature pad and the same canonical signer/event workflow

Contract statuses currently implemented:

- `draft`
- `sent`
- `viewed`
- `signed`
- `void`

Contracts currently link to:

- project
- customer
- optional approved estimate
- shared document template

Current contract design notes:

- contracts are canonical records, not detached documents
- contract rendering is generated from the shared template system and canonical merge data
- contractor organizations can now set an approved-estimate contract template preference without forking a separate contract-template silo
- signed contracts remain connected to the same estimate and project context used for downstream billing workflows
- contract content may be lightly edited while still in draft
- once signature activity begins, unrestricted editing is locked on the canonical contract record
- contract internal-approval status and signature-readiness status now live on the canonical contract record as upstream commercial-readiness foundation data
- when internal approval is required, draft edits reset the contract back to pending approval before send
- contractor-side send progression is now blocked until required internal approval is complete
- contract signature foundation now extends the same canonical contract record with customer-view, customer-sign, countersign, decline, and void timestamps instead of creating a second signed-document model
- signer-role routing now lives in supporting `contract_signers` rows, while the canonical `contracts` row remains the business-truth record for workflow and readiness
- immutable signature history now lives in supporting `contract_signature_events` rows attached to the same contract
- send-for-signature now creates signer routing and immutable signature-request events instead of relying only on manual status changes
- customer view, sign, decline, and optional contractor countersign now progress through signer-state validation and immutable signature events before the canonical contract reaches final `signed` state
- contractor-side contract detail now includes explicit send-for-signature controls with customer portal signer selection and optional contractor countersigner assignment
- contractor-side contract detail can capture the next unsigned customer signer onsite without creating a separate signed-document model; onsite capture records a `signer_signed` event with structured canvas-capture metadata on `contract_signature_events`
- contractor-side contract detail now surfaces canonical signature-state timestamps, signer routing/status visibility, and recent immutable signature events inside the existing Contract Workspace
- contractor-side countersign now has a dedicated workspace action when the signed customer contract is waiting on the assigned organization signer
- portal contract review now supports customer-facing signature-state visibility, signer visibility, and customer sign/decline actions on the same canonical contract record through tenant-safe portal scope
- customer-facing contract print/save PDF view now renders the canonical contract body and signer summary in contractor and portal scopes without replacing the signature workflow or creating a second signed-document model
- linked-contact customer-contact portal permissions now enforce estimate, change-order, and contract decision authority in the following limited first-pass ways:
  - estimate approve/reject requires stored `can_approve_estimates`
  - change-order approve/reject requires stored `can_approve_change_orders`
  - contract sign/decline requires stored `can_sign_contracts` for linked-contact grants only
  - contractor-side customer signer options now exclude linked-contact portal users who do not have stored contract-signing permission
  - linked-contact permission enforcement still does not yet apply to estimate view, contract view, invoice/payment, or quote-request actions
  - contractor countersign behavior is unchanged
  - null-contact customer-level grants continue to use legacy behavior in this first pass
- project readiness and portal project continuity now react to canonical signed-contract outcomes so signature completion changes the next visible commercial step instead of staying isolated on the contract page
- contractor project detail now surfaces latest contract signature handoff summary alongside the readiness hub
- portal Project Workspace now reflects signed-contract completion in project guidance and contract summaries before later payment work is introduced
- future e-sign integrations are expected to attach provider metadata and provider lifecycle events to the same contract foundation rather than creating a separate signed-document silo

## Current Workflow Coverage

The implemented canonical flow currently spans:

- opportunities or leads -> customers -> projects -> estimates -> contracts -> change orders -> jobs -> invoices -> payments

The current implemented workflow foundation supports:

- user authentication into a protected contractor app
- automatic first-user tenant bootstrap
- lead and opportunity intake
- site assessment scheduling/completion capture on the canonical opportunity
- lead Scope Intake capture for manual measurements and structured observations before estimate handoff
- requirements capture on the canonical opportunity before estimate handoff
- canonical lead-to-estimate handoff through customer and project creation/linking
- seeding project estimating context from opportunity requirements when the estimate flow starts
- customer management
- project management
- estimate authoring with line items and totals
- estimate line items are now the authoritative estimate item-row source of truth; `estimates.content.itemRows` remains legacy read/migration-only
- Estimate Workspace item sourcing is now catalog/cost-item-first, using active catalog items and sqft-scaled system expansion into canonical estimate line items
- Estimate Builder V1 quick system generation is now implemented inside the existing Estimate Editor:
  - linked lead Scope Intake measurements and requirements surface as Source assessment context inside the Estimate Editor; contractors can prefill reviewable direct system inputs from captured area, linear footage, and count values before previewing or generating system rows
  - contractors can add active non-system catalog items from the Estimate Editor Catalog Items panel; insertion uses the existing server action path to create immutable estimate line-item snapshots for name, description, unit, pricing, taxability, source metadata, and supported cost fields
  - the Estimate Editor Catalog Items panel now supports flooring-friendly discovery filters for epoxy, flake, metallic, quartz, polish, grind-and-seal, prep, and add-ons using existing catalog item type/category/name/description/SKU/cost-code fields
  - contractors can create a new catalog/cost item inline from the Estimate Editor with type, category, unit, cost, price, description, and taxability; saving first creates the organization-scoped `catalog_items` record, then inserts the current estimate line through the same catalog insertion flow
  - catalog-backed estimate item names are clickable in the Estimate Editor; saving an edit updates the reusable `catalog_items` row and the current estimate line-item snapshot only
  - other estimates that previously snapshotted the same catalog item do not silently update when the catalog item is edited from the current estimate
  - approved estimates block catalog-backed snapshot editing from the Estimate Editor
  - archived catalog items are visible in the Catalog Items panel for review but cannot be inserted, and server-side insertion rejects archived/inactive catalog items
  - system catalog items remain routed through the system expansion flow instead of direct single-line catalog insertion
  - contractors can select an existing catalog system, enter length x width or direct area plus linear footage, preview area/perimeter-derived quantities, and append grouped canonical estimate line items
  - existing catalog system components map `sqft`/area basis rows to area, `lf`/perimeter basis rows to linear footage, and count basis rows to count input
  - the Estimate Editor now uses clearer V1 terminology for Catalog Items, Systems, Add-ons / Options, and Document Templates; Add-ons / Options reuse the existing catalog item `category` field instead of introducing a separate schema
  - Catalog Items categorized as Add-ons / Options can be inserted directly or included in Systems with existing `sqft`, `lf`, count/ea, or fixed/project basis behavior; dedicated optional-component toggles remain a future Templates & Systems decision
  - generated lines remain normal editable estimate line items with catalog pricing snapshotted at insertion
  - one-off estimate-line unit price overrides are supported in the existing item table and persist on the estimate line without mutating catalog defaults
  - customer-facing portal estimate review groups line items by the existing generated group snapshot and continues to hide internal cost, markup, hidden markup, and labor/cost internals
- Estimate Editor now groups item insertion into one clearer estimating-tools cluster: `Create new item`, `Add from catalog`, flooring-friendly catalog filters, system generation, and `Import from another estimate`; new estimate items are catalog-first rather than manual freeform rows
- estimate line-item import from another estimate is now live for same-organization source estimates into draft destination estimates only; imported rows are reseeded as new destination `estimate_line_items` and do not create invoice rows, SOV rows, contracts, or payments
- Estimate Editor and detail now use clearer reusable-content language for scope / SOW, project details, terms, inclusions, and exclusions, and they distinguish insertable content blocks from defaults that only prefill empty estimates
- Estimate Editor now also uses one shared reusable-content insertion area for scope / SOW, terms, inclusions, and exclusions, reusing the existing content-block system while preserving append behavior into the live estimate
- reusable content import from another estimate is now live for same-organization source estimates into draft destination estimates only; Scope / SOW, Terms, Inclusions, and Exclusions append into the live destination Estimate Workspace without changing defaults, line items, or downstream billing records
- estimate import now uses one shared source-estimate chooser in the estimating tools area so users pick a source once, then choose `Import line items`, `Import Scope / SOW`, `Import Terms`, `Import Inclusions`, or `Import Exclusions` without changing any import behavior
- Estimate Workspace edits now use the shared explicit save-state pattern with validation, dirty/error state handling, and stale-write conflict protection
- estimate defaults now hydrate only when the estimate content is initially empty, using platform defaults first and organization overrides second
- contractor workflow settings now explain estimate defaults more explicitly: Scope / SOW, Terms, Inclusions, and Exclusions are organization-owned starting defaults for empty estimates only, while reusable blocks append on demand and estimate import copies from a selected prior estimate
- estimate customer send, email tracking, portal review, contractor-side supported manual/offline decision actions, and status progression
- estimate detail, customer portal-access setup, portal project visibility, portal estimate approval, contractor-side supported manual/offline estimate decision actions, and contract Quick-Create now include compact prerequisite guidance for the current send -> approval -> approved-snapshot -> contract generation path without weakening canonical guards
- contractor-side manual estimate approval can be recorded from draft or sent estimates and is intended for paper signature, verbal customer approval, fake email during testing, non-portal customers, and workflow testing before send-mail and portal delivery are complete; it requires who approved, how approval happened, approval date/time, notes/evidence, and stores that evidence on the canonical estimate customer-event trail while using the shared canonical estimate status-transition path rather than a duplicate approval model
- estimate create, update, and status transitions now refresh the linked project's stored commercial-readiness fields, including project reassignment during estimate updates
- approved estimate commercial snapshot creation on approval for downstream lineage
- approved-estimate-to-contract generation and pre-sign contract editing
- required internal contract approval and send-readiness gating on draft contracts
- server-side canonical contract signature workflow progression with signer/event updates on the shared contract model
- contractor-side contract send creates canonical `contract_signers` and `contract_signature_events`, and sent/viewed contracts can capture an eligible unsigned customer signer onsite from the contractor app
- contractor-side onsite signing uses the shared canonical `contracts`, `contract_signers`, and `contract_signature_events` records; canvas signatures are stored as base64 PNG metadata on the canonical signature event payload rather than a separate signed-document model
- contract status reaches `signed` only when all required signers are complete; if contractor countersign is required, onsite customer signing does not complete the contract early
- canonical change-order authoring, send-for-review, and customer portal approval or rejection on the shared project and contract chain
- approved change-order commercial snapshot creation on approval, with append-only downstream SOV and invoice integration
- project-detail readiness hub for the upstream commercial chain with blockers, next action, and ready-to-schedule handoff visibility
- signed contract and project detail now share a post-sign ready-to-schedule action panel that points to existing job Quick-Create and `/schedule` project handoff routes without adding a contract-specific scheduling model; the job Quick-Create handoff preserves approved estimate context when available, and a single unscheduled project job opens directly in the existing `/schedule` scheduling action panel
- downstream job creation now respects the canonical ready-to-schedule gate instead of relying only on estimate approval
- downstream job reassignment now respects the same canonical ready-to-schedule gate instead of allowing a later project move to bypass the handoff rule
- centralized server-side project readiness enforcement now blocks job creation, scheduling, scheduled/execution job transitions, daily logs, field notes, execution attachments, punchlist items, and project-attributed time punches until readiness conditions pass
- appointment creation and review on the same lead, customer, and project chain for site visits, estimate meetings, and follow-up coordination
- conversion of approved or project-based work into jobs/work orders
- job progression through execution states
- invoice creation and maintenance from connected project, estimate, and job records
- standard invoice creation without a job now respects the commercial handoff gate instead of bypassing contract-signature and deposit or financing readiness
- invoice Quick-Create now requires a real billing source before draft creation: completed job, approved estimate scope, approved change order, or explicit deposit role
- approved estimate next steps no longer present full estimate-based invoice creation as a primary action; approval routes users toward contract or project readiness before billing
- progress billing invoice preparation now uses the same invoice commercial readiness guard as standard invoice creation while staying on the approved-estimate -> schedule-of-values -> invoice chain
- snapshot-based invoice lineage across direct estimate billing, SOV billing, approved change-order billing, and invoice-only adjustments
- payment recording with invoice balance and paid-state recalculation
- tax-aware invoice calculation using org defaults and customer exemption state
- retainage-aware invoice balance foundation
- approved-estimate schedule-of-values provisioning from snapshot lineage and progress-billing invoice preparation on the same project, estimate, and invoice chain
- shared template selection and merge-data preparation for estimate, invoice, and contract document workflows
- canonical rendered contract records with revision snapshots and signature-lock scaffolding
- canonical contract signature-state, signer, and immutable signature-event foundation on the shared contract model
- canonical contract signature workflow helpers that keep send, portal or contractor-side onsite customer signature progression, optional countersign, and readiness sync on the same contract record
- stored notification events, per-user notifications, delivery tracking, and canonical communication thread/message foundations
- tenant-scoped `workflow_error_events` foundation for owner/admin review of failed workflow actions, starting with contract-generation failures
- shared commercial-readiness foundation fields across opportunities, projects, contracts, invoices, and organization workflow settings
- project commercial-readiness sync from signed-contract, deposit-readiness, financing-status, and recorded-payment state
- project commercial-readiness sync reacts to contractor-side onsite signing the same way it reacts to portal signing; deposit follow-through remains conditional on organization workflow settings and uses the existing canonical deposit invoice/payment chain when required
- shared plain-numeric customer-facing numbering across estimates, invoices, change orders, and contracts using the existing organization and platform workflow settings tables

## What Exists But Is Still Minimal

These surfaces exist but are still foundational rather than production-complete:

- dashboard command-center surface, including modular queue composition and Quick-Create studio direction
- early module-dashboard pattern on overview pages
- Financials Home control-panel structure, read-only Accounts Receivable collections visibility, deterministic collections follow-up intelligence with review-first draft handoff, and read-only invoice/payment-event reconciliation visibility; AP is still defined only as a placeholder
- payments manager surface on the same shared Manager Page system, now with read-only payment evidence review over canonical payment events
- first universal-create launcher foundation in the shared shell and dashboard
- broader contractor-app theming consistency is now established through shared shell and Manager Page components, but page-level cleanup still remains iterative on some deeper or lower-traffic surfaces
- materials
- jobs/work-order execution UX
- proposal review/share UX
- Project Workspace structure
- customer portal review workflows

### Contractor Settings / Admin

Implemented:

- modular contractor-side organization settings surface with sections for:
  - organization profile/settings
  - document templates
  - catalogs/master data
  - system layers
  - financial defaults
  - workflow defaults
  - automation visibility
  - organization admin
  - module controls
- `/settings/profile` includes a narrow personal estimate-template preference for active contractor users:
  - users can choose an active organization-owned estimate document template as their own preferred default
  - users can reset the preference to the company default
  - the preference is stored separately from organization defaults and does not mutate company template defaults
  - new estimate Quick-Create records created by that user store the preferred template on the existing estimate `template_id` when a valid active preference exists
  - existing estimates, approved snapshots, contracts, invoices, tax behavior, payroll behavior, entitlement behavior, module controls, and workflow enforcement are unchanged
- organization-scoped tax behavior and tax rate management
- organization-scoped retainage baseline for new customer creation and lead conversion
- contractor-side workflow defaults for approved-estimate contract template assignment
- stored contractor preferences for internal contract approval, signed-contract readiness, deposit-before-scheduling readiness, and financing-approval readiness
- first organization-owned workflow guidance preferences on the existing `organization_workflow_settings` row:
  - supports Guided, Flexible, and Manual workflow modes
  - stores separate display preferences for next-best-action visibility, readiness guidance visibility, strict blocker presentation, shortcut cleanup prompts, and workflow explanation copy
  - stores separate AI-assistance intent flags for suggestions, summaries, drafting, form-prefill suggestions, and work-item recommendations, with human confirmation still required
  - Project Workspace now uses these preferences to reduce or show next-best-action and readiness guidance panels without changing readiness enforcement
  - one-off/direct invoice shortcuts remain planned only; no direct invoice shortcut is exposed yet and invoices still must stay linked to canonical customer/project/invoice/payment records
- organization-scoped reusable catalog item management
- `/settings/catalogs` now renders the same contractor cost item settings component used by `/cost-items-database/settings`
- `/settings/system-layers` now provides the first admin/data access layer for finish products, floor system templates, and catalog-backed template components
- `/settings` now links the existing Document Templates, Catalog Items, Systems, Add-ons / Options, System Layers, and Selected Systems surfaces while leaving deeper Templates & Systems workflows deferred
- organization member role management
- organization-level feature override storage within the shared platform feature policy model
- first contractor-side automation visibility/settings surface at `/settings/automation`
  - automation readiness dashboard over canonical workflow, notification, communication, payments, contracts, estimates, change orders, projects, and scheduling foundations
  - explicitly shows implemented vs foundation vs planned automation concepts, missing dependencies, safe-next-build guidance, and recent canonical samples without claiming background execution exists
  - stores organization-scoped notification-only automation preferences on the existing `organization_workflow_settings` row
  - now includes a manual, tenant-scoped notification-only runner that can be launched from `/settings/automation`
  - the manual runner supports only customer message received, estimate awaiting approval, contract awaiting signature, and invoice overdue triggers
  - executed runs create canonical `notification_events` and per-user in-app `notifications` only
  - run audit/idempotency is stored in the new tenant-owned `automation_runs` table
  - eligibility preview/debug, static template preview, and compact build-plan summaries remain visible for supported categories
  - saved preference fields are limited to category, manual-enable intent, and intended contractor-role recipients
  - no automation path sends email/SMS, creates queues or cron jobs, posts customer messages, or mutates workflow records
- first lightweight workflow error logging foundation:
  - `workflow_error_events` stores tenant-scoped failed workflow actions with action, subject, safe metadata, user context when available, and timestamp
  - contract generation from approved estimates records failures such as missing approved snapshots without weakening the approved-snapshot guard
  - approved estimate snapshot rebuild attempts log to `workflow_error_events` only when the recovery action fails
  - `/settings/admin` shows recent workflow error events to organization owners/admins
- first lightweight internal work-item foundation:
  - `work_items` stores tenant-scoped internal contractor action items with title, description/instructions, due date, priority, kind, optional assigned person, optional canonical source link, optional customer/project context, internal visibility, safe metadata, and completion/dismissal timestamps
  - active organization members can read, create, and update internal work items through RLS; no portal/customer access policies exist
  - server utilities validate assigned people as active and assignable within the active organization, validate source records before source-linked creation, and keep completed/dismissed items closed in V1
  - dashboard, lead workspace, appointment workspace, project workspace, job workspace, estimate workspace, and invoice workspace UI can now create, list, complete, and dismiss manually created internal work items without adding a dedicated work-items manager route
  - Sales Handoff / Estimate Work Queue foundation now reuses those existing internal Work Items from the Lead Workspace. The Estimate Plan card can prefill an opportunity-linked estimate handoff item from real site-assessment state, requirements, notes, measurements, observations, and attachment counts, while detecting an existing open estimate handoff for the same opportunity/project/estimate context and routing users back to that existing Work Item instead of preloading a duplicate draft. The prefill stores safe metadata for estimate work type (`generate_estimate`, `review_estimate`, `request_missing_info`, `approve_send`, or `follow_up_customer`), source opportunity, linked project/estimate ids when available, source owner only when the opportunity creator maps to an existing Person, next action, site-assessment packet counts, explicit role-slot metadata context where available, and planned send-as context. The item is not created until a contractor submits the form.
  - The Sales Handoff / Estimate Work Queue mini-wave checkpoint is captured in [docs/design/sales-handoff-estimate-work-queue-checkpoint.md](C:/FloorConnector/docs/design/sales-handoff-estimate-work-queue-checkpoint.md).
  - `apps/web/lib/work-items/read-model.ts` now includes pure estimate-work queue selectors for assigned estimate work, waiting-on-me, ready-for-review, blocked estimates, and follow-ups due. Dashboard `My Work` consumes those selectors as explicit estimate handoff widgets, with rows showing the Work Item title, source link when available, assigned owner, requester when the creating user maps to an existing Person, due-state nudge (`Overdue`, `Due today`, `Due soon`, `Later`, or `No due date`), blocker reason, and next action metadata when it exists. Estimate Workspace also shows a compact Estimate Work panel for open estimate-production Work Items connected by estimate, project, or linked opportunity context; it can mark the existing Work Item in progress, mark eligible estimate-production work ready for internal review through `metadata.estimateWorkStatus = ready_for_review`, update the existing row's next action through `metadata.nextAction`, set or clear the existing `work_items.due_at` field, save a blocker reason, complete the Work Item through existing assignee-or-manager Work Item actions, or use a compact Reassign control that updates only the existing tenant-scoped `work_items.assigned_person_id` value for an active assignable Person. Its rows distinguish assigned owner, requester, due-state nudge, and waiting/blocked/review state from existing Work Item context only. The same panel has Request Missing Info and Request Review shortcuts that prefill the existing internal Work Item creation form with source-locked estimate context and `estimateWorkType` metadata; nothing is created until a contractor submits the form. Estimate Workspace now also shows a read-only Estimate Handoff Packet derived from the linked opportunity's site-assessment state, requirements, notes, reviewed measurement groups, observations, attachments, customer, project, and estimate links so estimate production can see what is captured and what is missing without adding persistence; source owner is shown only when the linked opportunity creator maps to an existing Person. Project Workspace now shows read-only estimate handoff continuity for open estimate-production Work Items connected to the project, its estimates, or linked opportunity; it summarizes open, blocked, ready-for-review, follow-up-due, next-most-urgent work, compact due-state nudge, and assigned-owner/requester context, and routes back to the canonical Work Item, estimate, or source record. These are lenses/actions over existing `work_items` and opportunity/project/estimate records; they do not add schema, migrations, enum values, persisted workflow state, dashboard-owned records, project-owned task records, automatic work-item creation, duplicate task creation, estimate status mutation, customer sends, notifications, reminders, portal behavior, payroll behavior, or commission calculation.
  - Role Slots Foundation V1 now adds internal ownership metadata on canonical opportunity/project/estimate records, documented in [docs/design/role-slots-foundation-v1.md](C:/FloorConnector/docs/design/role-slots-foundation-v1.md). Lead Detail can set Onsite Rep and Relationship Owner; Project Workspace can set Onsite Rep, Relationship Owner, Follow-Up Owner, and Sales Credit Owner; Estimate Workspace can set Estimate Writer while showing Relationship Owner and Sales Credit Owner from the linked project. Lead Detail also exposes a direct "Assign Estimate Writer" estimating handoff that creates or reassigns the existing opportunity-linked estimate Work Item owner until an actual estimate exists with its own Estimate Writer role slot. Role slots reference existing tenant-scoped active assignable People, use truthful empty states, and stay separate from `work_items.assigned_person_id`, `estimates.status`, send behavior, notifications, portal exposure, AI inference, commission calculation, payroll, payout, wage, and ledger behavior.
  - Context-Rich Work Items v1 reuses the existing `description` field for instructions/job notes and `metadata.measurementNotes` for measurement context; the shared work-item list now displays instructions, measurement notes, assignee, due/overdue state, priority, linked customer/project context, and attachment count only when real metadata exists
  - Work Item Photo / Evidence Attachment Support now extends `execution_attachments` with `subject_type = 'work_item'` so project/job-linked work items can carry internal photos/files through the private `documents` bucket, server-generated organization/project storage paths, attachment-id signed URL previews, and the existing active/archived metadata lifecycle
  - Project Workspace and Job Workspace now show Work Item evidence counts, contractor-only preview/open links, and upload controls for JPG/PNG/WebP/PDF files up to 10 MB with the boundary copy "Internal evidence. Not visible to customer portal."
  - Work Item evidence requires same-organization project context; job-linked work-item evidence validates that the job belongs to the same project before upload or preview
  - Work Item evidence is not portal-visible by default. Existing `portal_evidence_grants` remain explicit and are still limited to eligible active Daily Log / Job Note `execution_attachment` evidence; Work Item attachments are rejected as portal-share subjects unless a later explicit sharing policy is approved
  - `/field/work-items` is the first mobile-friendly assignee Work Item view. It loads the current user's active assignable `people.membership_user_id` record, shows only that person's assigned Work Items grouped by blocked, overdue, today, upcoming, and recently completed, and links to `/field/work-items/[workItemId]` for field detail. The same surface also shows a compact read-only field execution readiness brief for assigned jobs, deriving project/customer context, commercial readiness, Daily Log coverage, open field blockers/issues, and source links from existing jobs, assignments, projects, customers, Daily Logs, and field notes without adding persistence or dispatch mutation.
  - Universal Capture Intent V1 reuses existing Work Items and existing Quick-Create destinations rather than adding `capture_items`: the shell Create menu links to `/dashboard?capture=1#universal-capture`, the dashboard shows a compact capture composer only for that handoff, and a deterministic local parser recognizes site visit, follow-up, estimate, and contract intent from contractor-entered text. Contractors can attach existing Sales Opportunity, customer, and project context. Site-visit intent with enough context and date/time detail can route into the existing appointment Quick-Create sheet with appointment type, timing, title, and internal notes prefilled; no appointment is created until the contractor submits that existing form. Follow-up and unresolved intent still create internal Work Items through the existing action after contractor submission, with title, note, due/review date, assignee, priority, existing Work Item kind mapping, source/customer/project context when selected, and safe metadata marking the capture source and parser result. Saved Work Items surface through the existing dashboard and Work Item queues.
  - The Intent V1 capture composer does not add schema, migrations, unresolved capture persistence, route/geographic grouping, assistant action staging, external AI/provider calls, reminders, automatic bookings, customer-facing sends, portal visibility, or mutations to customer/project/opportunity/job/invoice/communication/source records before a contractor submits an existing owning workflow.
  - The field detail view shows instructions, measurement notes, customer/project/source context, due date, priority, assignee, internal evidence previews through the existing attachment-id signed URL flow, and clear internal-only evidence copy. It does not add upload from the assignee view.
  - Field status updates stay schema-free in V1: `metadata.fieldState` tracks not started/in progress/blocked while `status = 'open'`; completion uses the existing `status = 'completed'`, `completed_at`, and `completed_by` columns and can store a completion note in `metadata.completionNote` without overwriting the original instructions.
  - Assigned Work Item field actions are server-validated for the linked assignee person or owner/admin/manager membership and do not mutate jobs, Daily Logs, Job Notes, invoices, contracts, portal grants, or source records.
  - Job Workspace can create and list job-linked work items with `source_type = 'job'`, `source_id` set to the job, and existing customer/project links preserved; Project Workspace continues to surface project-linked and job-linked items through the canonical project relationship
  - project and dashboard cue panels can suggest next actions from existing project, estimate, contract, invoice, job, and field-note context; project cues with canonical next steps route to the existing contract, invoice, job Quick-Create, or schedule workflows, while only open blocker field-note human follow-up can prefill the existing internal work-item form with project source lock. The contractor must submit the form manually
  - record-level estimate and invoice Needs Attention panels can prefill the same existing internal work-item form for stale sent-estimate follow-up and past-due invoice follow-up; the prefill preserves source type/id, link path, evidence, dedupe key, and safe metadata, but no work item is created until the contractor submits
  - work items do not auto-generate from lead follow-up queues, appointment cues, project guidance cues, operational cues, notifications, automation runs, or workflow errors in this pass
  - Estimate handoff Work Items are internal-only and do not replace canonical opportunity follow-up, estimate status, estimate send state, project readiness, calendar appointments, or future audited commission ownership. Sales credit / commission ownership remains planned commercial metadata until an approved slice adds dedicated canonical owner fields, audit policy, calculation triggers, and legal/payroll boundaries.
  - structured measurement tables, dedicated work-item comments, richer status lifecycles, vendor/team assignment, mobile evidence upload from the assignee view, reminders/notifications, and portal-safe sharing remain planned in [docs/design/context-rich-work-items-and-assignments.md](C:/FloorConnector/docs/design/context-rich-work-items-and-assignments.md)
- first Operational Intelligence cue-rule foundation:
  - `organization_operational_cue_rules` stores tenant-owned rule configuration for enabled state, cue key, subject type, threshold days, urgency, owner strategy, and escalation days
  - `organization_responsibility_role_defaults` stores tenant-owned People-first defaults for the starter responsibility roles `estimator`, `project_manager`, `billing_owner`, and `scheduler`; mappings point to `people.id`, not directly to app users
  - default cue rules are ensured server-side for estimate sent follow-up, unsigned sent/viewed contracts, overdue invoices, unpaid deposit invoices, ready unscheduled jobs, and scheduled jobs missing crew
  - contractor owners/admins can configure the seven built-in operational cue rules and organization-level responsibility defaults from `/settings/operational-intelligence`; cue-rule editable fields are enabled state, threshold days, and urgency, while responsibility defaults choose active assignable people for the starter role set
  - `/settings/operational-intelligence` now explains each built-in cue rule with trigger, impact, surface, safe next action, and visibility notes, and includes read-only guardrail copy explaining that user-scoped dismiss/snooze controls affect cue visibility only and do not complete work, mutate canonical records, create work items, bypass readiness gates, or add dashboard mutation controls
  - active organization members may read cue rules for derived My Work visibility, but cue-rule insert/update is restricted to owner/admin membership by server action checks and RLS
  - active organization members may read responsibility defaults, while insert/update/delete is restricted to owner/admin membership by server action checks and RLS
  - derived cue results are calculated at request time from canonical estimates, contracts, invoices, jobs, projects, and job assignments, then shown in the dashboard `My Work` groups for estimates, contracts, invoices, and jobs
  - dashboard `My Work` supports display-only Company, Mine, and Unresolved queue modes. Company includes all derived cues visible to the organization, Mine includes cues resolved to the current app user or linked Person, and Unresolved includes `strategy_only`, `organization_queue`, and `record_owner_unavailable` responsibility fallbacks. Owners, admins, and managers default to Company; members default to Mine; all modes remain accessible without adding permissions.
  - derived cue results include user-facing explanation/source metadata such as the canonical date or status used, the configured rule threshold, and timing text; fallback timestamp use is described in cue copy instead of hidden
  - derived cue results include read-only responsible role strategy metadata using the starter strategy set `estimator`, `project_manager`, `billing_owner`, and `scheduler`; `sales_owner` and `field_lead` are intentionally deferred until lead ownership and field execution responsibility are consistently wired
  - derived cue results also include a responsibility resolution shape that distinguishes starter role defaults resolved to People, linked app users when `people.membership_user_id` exists, the organization queue, strategy-only fallback, and the legacy unavailable record-owner fallback
  - project, estimate, contract, invoice, and job detail workspaces show compact `Needs Attention` panels using those same derived results and explanation/source details; project detail aggregates linked child-record cues by project id and applies user-scoped cue-state suppression after derivation
  - `workflow_cue_states` stores tenant-scoped response state for deterministic cue identities, with user-scoped dismiss/snooze exposed on record/project cue surfaces only. It does not store active cue instances, replace computed derivation, create work items, mark canonical records complete, or expose broad resolve in V1
  - project-level overrides, record-level overrides, assignment actions, cue instances, task records, dashboard dismiss/snooze controls, notification delivery, AI feedback, custom expression rules, and persisted queue selection are not implemented in this pass

Current design notes:

- this is a contractor organization settings surface, separate from platform super-admin controls
- shared templates remain on one canonical template system across estimates, invoices, and contracts
- contract approval, signature, deposit, and financing readiness preferences are stored canonically now even though deeper enforcement UX is still future work
- workflow guidance preferences tune contractor coaching visibility only; they do not change server-side readiness gates, invoice/payment truth, signature history, tenant isolation, portal access, financial calculations, or canonical record requirements
- AI assistance preferences are stored separately from workflow guidance, but broad AI summaries, drafting, recommendations, autonomous actions, provider sends, and customer-facing AI actions are still not implemented
- Operational Intelligence settings tune built-in My Work and record-level Needs Attention cue rules plus People-first organization responsibility defaults only; they are not a generic automation builder, assignment surface, project override surface, record override surface, or cue/task creation system
- automation readiness reads real canonical foundations only, while the manual runner is tenant-scoped and guarded by `automation_runs` idempotency before notification creation
- the notification-template preview on `/settings/automation` is static application copy only; it is not editable, does not save template records, and does not send customer messages
- the automation build plan on `/settings/automation` merges saved preferences, eligibility output, and static template definitions without saving planner rows or mutating canonical records
- contractor organizations adopt platform defaults into tenant-owned copies or tenant-scoped settings where applicable

### Super Admin

Implemented:

- modular super-admin surface with sections for:
  - overview
  - platform defaults
  - starter templates
  - starter catalogs
  - module controls
  - operations / system health
  - platform admin and tenant oversight
- platform-level financial defaults
- platform-level workflow defaults
- platform-owned starter template management
- platform-owned starter catalog seed management
- platform-owned starter pack governance:
  - `platform_starter_packs` stores platform-managed bundle metadata and draft/published/archived status
  - `platform_starter_pack_items` groups existing `platform_template_seeds` and `platform_catalog_item_seeds`
  - `platform_starter_pack_assignments` stores planning-only assignment intent for all organizations, a specific organization, onboarding profile, region/state, trade segment, plan tier, or a contractor group key
  - `contractor_groups` and `contractor_group_memberships` store platform-managed contractor segmentation metadata and manual organization assignments for onboarding targeting, starter-pack targeting previews, rollout cohorts, beta programs, regional/trade segmentation, and future platform packaging; `contractor_group_audit_events` provides durable platform-admin-only audit/history storage for group lifecycle and assignment events written through transaction-aware server-side RPCs; these are not tenant roles and do not enforce contractor permissions
  - `platform_starter_pack_provisioning_runs` and `platform_starter_pack_provisioning_run_items` provide the audit/run schema for approved dry-run snapshots, idempotency keys, actor references, target organization, item-level source lineage, destination references, and void/failure state
  - `/super-admin/templates` includes a `Starter Packs` tab/section for creating packs, editing metadata/status, adding existing template/catalog seeds, removing pack items, and managing assignment intent
  - `/super-admin/templates` also includes a read-only Targeting Preview that explains why assignment intent would match, not match, or remain unavailable for a selected organization using existing organization metadata and explicit contractor group memberships only
  - `/super-admin/templates` also includes a read-only Provisioning Dry Run that previews which starter-pack template/catalog seeds would create organization-owned document template or catalog item copies, which items already appear adopted by source linkage or conservative normalized match, and which seed references are blocked/unavailable
  - the Provisioning Dry Run area can create a platform-admin-only approval draft from a fresh server-side dry run when the selected starter pack is published and the dry run has no blocked/unavailable rows; this writes only `platform_starter_pack_provisioning_runs` and `platform_starter_pack_provisioning_run_items` audit rows with status `draft`
  - the Provisioning Dry Run area also shows a read-only provisioning audit observability panel for recent draft/run rows, status filters, item outcome counts, destination-link counts, safe failed-run messages, and live review blockers when a run is selected; draft review flags stale already-existing destination match drift and raises a blocking issue when the current recomputed dry run has source availability blockers
  - recent draft audit runs can be reviewed in place against a fresh server-side dry run; the review reports fresh/stale/invalid/unavailable status, issue severity, and item-level unchanged/changed/missing/added/invalid comparisons before any audit approval is allowed
  - fresh, non-blocking draft reviews can be marked `approved` through an audit-only approval gate after typing `APPROVE DRY RUN ONLY`; approval updates only the provisioning run header audit fields (`status`, `approved_by`, `approved_at`, and `confirmation_text`)
  - approved, fresh, non-blocking provisioning runs can be executed by a platform admin after typing `EXECUTE STARTER PACK`; execution calls a server-only service-role path backed by a private Postgres function, creates only missing organization-owned `document_templates` and `catalog_items` from the approved starter-pack audit items, stores source-seed lineage, sets destination ids on audit items, and completes the audit run
  - completed provisioning run review shows completed status, requested/approval/start/completion timestamps when available, destination counts, item outcome totals, and item-level audit destination ids where the run item has a created or skipped destination reference; completed runs do not show the execute control
  - completed provisioning run review now includes a read-only usage/void-readiness check for linked destination templates/catalog items; it counts known references from estimates, invoices, contracts, approved estimate snapshots, organization workflow settings, user estimate-template preferences, estimate/invoice lines, catalog/system components, floor-system components, inventory, and active defaults, but it does not provide any void, rollback, archive, delete, detach, or mutation control
  - completed provisioning run review now also shows a read-only audit-only void eligibility model; it can report eligible, blocked, already voided, or unavailable status, requires future metadata such as reason and readiness snapshot, and keeps archive/delete/detach strategies clearly future-only
  - provisioning run audit rows now include audit-only void metadata fields for future actor, reason, strategy, and readiness snapshot evidence; `/super-admin/templates` displays this metadata foundation read-only, and no void action writes it yet
  - `/super-admin/templates` now also shows read-only operation-attempt visibility for rejected, blocked, failed-before-execution, and already-completed no-op provisioning execution attempts; these attempt rows store safe operator messages only and do not retry, roll back, void, copy, or provision anything
  - executed starter-pack copies are active contractor-owned records with `is_default = false`; execution does not change organization defaults, estimate creation behavior, catalog behavior, entitlements, tax, payroll, financial calculations, invoice/contract generation, user preferences, or existing contractor-owned templates/catalog items
  - `docs/starter-pack-provisioning-plan.md` defines the provisioning safety model, including approved-run preconditions, platform-admin/server-only actor requirements, RPC/transaction boundaries, copy rules, audit item updates, idempotency/replay protection, conflict handling, observability, QA gates, and void strategy; rollback/void remains future work
  - `docs/starter-pack-provisioning-review.md` records the Phase 5T consolidated architecture/operator readiness review for starter-pack provisioning before any real void action; it is documentation-only and does not add void, rollback, archive/delete/detach, assignment enforcement, or new provisioning behavior
  - starter packs, starter-pack assignments, targeting previews, provisioning dry runs, approval drafts, audit approvals, and provisioning execution remain operator-controlled governance/audit workflows only; they do not auto-provision contractor organizations, affect estimate creation, alter defaults, enforce entitlements, or provide assignment-based runtime enforcement
- platform-level feature policy management
- `/super-admin/groups` manages platform-owned contractor groups and manual organization assignments with explicit copy that groups are segmentation metadata only; create/update/archive/assign/remove actions append durable audit events through server-side RPCs, a metadata-capable service-role-only assignment RPC/helper exists for proposal-review audit evidence, and a proposal-specific server action can apply one recomputed, high/medium-confidence, human-confirmed proposal through that metadata RPC when invoked server-side. Eligible proposal rows now expose a single-row expandable manual assignment form that requires an operator reason and exact `ASSIGN GROUP MANUALLY` confirmation, submits the complete proposal fingerprint/context for stale-detection, and invokes the audited proposal apply server action. The page includes read-only observability for group counts, status/type filters, multi-group/no-group organizations, recent membership assignments, organization-centric group inspection, conservative assignment proposals from current organization metadata, proposal filters by organization/status/confidence/group type, selected-organization proposal summaries, proposal row display for manual-review readiness labels/explanations, stable reason codes, evidence items, caveat items with severity, manual-apply preview, a pure proposal-to-manual-assignment readiness helper, and a server-readiness utility that recomputes one organization/group proposal from current server data for manual-apply eligibility/status/audit-metadata checks, `runtimeEffect: "none"`, `actionAvailable: false`, proposal manual-review checklists, future starter-pack assignment references labeled as read-only/non-provisioning impact context, assignment audit-readiness inferred from current group/membership timestamps, durable audit-history rows, audit event type/source summaries, group/organization activity summaries, metadata coverage, missing context warnings when present, and operator copy that audit export/retention tooling is planned while audit events should be treated as platform evidence; the proposal UI writes only one contractor group membership and one audit event after server recomputation succeeds. The structured audit metadata includes safe proposal source, confidence, status, reason code, recomputation status, operator-reason-present flag, group key/type/status, blocked-state check flag, and a scalar proposal fingerprint. Already-assigned recomputation returns a no-duplicate readback instead of creating a second membership. A controlled live QA pass applied one deliberate eligible proposal, verified one membership and one assignment audit event with metadata, confirmed the repeated view moved to already-assigned/no form, removed the QA membership, and archived the QA group. There is no bulk apply, Apply all, auto assign, proposal dismissal/approval state, starter-pack provisioning, entitlement behavior, pricing behavior, permission behavior, document-template/catalog mutation, tenant-default mutation, or contractor runtime workflow effect.
- platform module controls now include the inventory default policy used by the Cost Items Database module
- `/super-admin` now presents the platform console with left-side super-admin navigation plus target-area top tabs, explicit platform-default / contractor-owned-copy / future-override / future-preference labels, save-state feedback on platform settings forms, grouped starter-template and starter-catalog administration, and a module policy matrix over the existing feature policy records
- `/super-admin/platform` now includes a read-only Resolution Preview backed by a typed server-side configuration resolution read model for existing platform financial/workflow defaults, selected contractor-owned financial/workflow settings, organization-owned default document templates, adopted platform template seeds, adopted platform catalog items, and inspectable platform starter packs with planning-only assignment counts
- `/super-admin/packages` is a platform-admin-only, read-only Package / Billing Plan Governance foundation. It builds a server-side read model from existing `companies`, `company_subscriptions`, and linked `subscription_plans` records, plus safe Stripe configuration-presence checks from the existing env helper. The page also includes a read-only Package Definition Catalog backed by the platform-owned `platform_package_definitions` and `platform_package_definition_versions` tables; a read-only Contractor Package Assignments section backed by `contractor_package_assignments` and `contractor_package_assignment_audit_events`; a read-only Billing / Provider Mapping Readiness section backed by `contractor_package_billing_mappings` and `contractor_package_billing_mapping_audit_events`; and a read-only Billing / Provider Support Review Readiness section backed by `contractor_package_billing_support_reviews` and `contractor_package_billing_support_review_events`. Those package definition tables store stable package keys, display labels, lifecycle/status, intended audience/segment summaries, version numbers/labels, safe JSON intent snapshots, and publication/deprecation/archive timestamps for future governance review only. The contractor assignment tables store future assignment lifecycle/timing references, package definition/version references, safe assignment/billing/entitlement/starter-pack snapshot summaries, supersession/cancellation context, and assignment audit evidence for inspection only. The provider mapping tables store internal assignment/company/package references, provider/environment reference labels, billing and reconciliation states, safe expected/observed/mapping JSON summaries, mismatch summaries, verification timestamps, and provider mapping audit evidence for reconciliation inspection only. The support review tables store future support-review status/category/environment labels, linked mapping/assignment/company/package references, safe provider-reference/reconciliation/webhook/operator/rollback evidence summaries, blocked/escalation/support summaries, and support-review event evidence for inspection only. RLS is enabled and forced on all eight package-governance tables, broad `public`/`anon`/`authenticated` grants are revoked, and the current app exposes only platform-admin server-side reads. The page renders package/billing overview cards, contractor plan state, billing setup readiness, early-access/activation status, not-yet-governed future package controls, the static Future Package Definition Model planning panel, Package Definition Catalog, Package Versions, Catalog Readiness, Contractor Package Assignments, Assignment Readiness, Assignment Audit Evidence, Billing / Provider Mapping Readiness, Provider Reconciliation Inspection, Provider Mapping Audit Evidence, Billing / Provider Support Review Readiness, Support Review Evidence, and Manual Resolution Readiness. The planning, assignment, provider-mapping, and support-review helpers still report read-only/no-behavior flags; package mutation, package assignment activation, billing/subscription behavior, Stripe operations, provider API calls, corrective-action execution, entitlement enforcement, module/runtime gates, and contractor permission changes do not exist in this slice. It shows only safe presence/readiness labels, planning labels, catalog labels, assignment labels, provider-reference labels, support-review labels, snapshot/evidence-presence summaries, empty states, mismatch caveats, support-review caveats, and audit caveats; it does not call Stripe, inspect or print secret values, store raw provider payloads or payment method data, create subscriptions, create invoices, charge cards, execute corrective actions, enforce entitlements, gate modules, change packages/pricing, change contractor permissions, change billing setup, create/approve/schedule/activate/cancel package assignments, mutate tenant records, or affect runtime behavior.
- `/super-admin/packages/[packageDefinitionId]` provides platform-admin-only, read-only inspection for one persisted package definition, its version rows, package definition audit evidence, and future lifecycle readiness. The detail read model loads a single `platform_package_definitions` row, matching `platform_package_definition_versions`, and matching `platform_package_definition_audit_events`; derives version lifecycle/status counts, audit event-type counts, future transition readiness for definition/version lifecycle states, no-version, no-published-version, missing-audit-evidence, intent-only dependency, and unavailable-state caveats; and summarizes JSON intent/snapshot/metadata fields by top-level keys without dumping raw values. Unknown ids render a safe unavailable state rather than database/provider errors. The audit table is an append-only evidence foundation with forced RLS, revoked broad `public`/`anon`/`authenticated` grants, service-role-only reads, constrained package definition/version event types, object-only JSON snapshots/metadata, and indexes for definition timelines and recent audit review. The lifecycle readiness panel is pure read-only inspection for future transitions such as draft to internal review, internal review to draft/approved/archive, approved evidence to published, published to deprecated/superseded, and deprecated to archived; every readiness row reports no action, mutation, runtime, billing, entitlement, or package-assignment effect. The detail route has no forms, no package create/edit/approve/publish/deprecate/archive controls, no lifecycle or approval mutation controls, no package assignment behavior, no billing/Stripe/subscription behavior, no entitlement/module/runtime behavior, no contractor permission changes, and no starter-pack provisioning changes.
- `/super-admin/packages/assignments/[assignmentId]` provides platform-admin-only, read-only inspection for one contractor package assignment, that assignment's audit evidence, and future assignment activation readiness. The detail read model loads a single `contractor_package_assignments` row, linked company/package/version labels when available, same-company assignment rows for active-conflict inspection, and matching `contractor_package_assignment_audit_events`; derives assignment lifecycle/status, timing, supersession, cancellation/archive metadata, safe assignment/billing/entitlement-module/starter-pack snapshot summaries, audit timeline rows, future transition readiness for draft/pending-review/approved/scheduled/active/canceled/superseded/archive states, no-audit-evidence, missing company/package/version, invalid package-version, missing effective/scheduled date, active-conflict, canceled/superseded/archived, and unavailable-state caveats. Unknown ids render a safe unavailable state rather than database/provider errors. The activation readiness panel is pure read-only inspection for future transitions such as draft to pending review, pending review to draft/approved, approved to scheduled/active, scheduled to active, active to superseded/canceled, and canceled/superseded to archived; every readiness row reports no action, mutation, runtime, billing, entitlement, contractor-permission, or package-assignment-write effect. The route has no forms, no assignment create/approve/schedule/activate/cancel controls, no package assignment activation behavior, no package mutation controls, no billing/Stripe/subscription behavior, no entitlement/module/runtime behavior, no contractor permission changes, no reporting/export behavior, no automation/AI behavior, and no starter-pack provisioning changes.
- `/super-admin/packages/provider-mappings/[mappingId]` provides platform-admin-only, read-only inspection for one package billing/provider mapping, that mapping's audit evidence, and linked support-review evidence. The detail read model loads a single `contractor_package_billing_mappings` row, matching `contractor_package_billing_mapping_audit_events`, linked support-review rows/events, and linked assignment/company/package/version labels when safely available; derives billing/reconciliation state, provider reference labels, expected/observed/mapping snapshot summaries by top-level keys, mismatch caveats, support-review caveats, no-audit-evidence caveats, archived/unavailable-state caveats, and safe operator guidance. Unknown ids render a safe unavailable state rather than database/provider errors. Provider references and support-review evidence are labeled as references/review evidence only, not business truth, payment-method storage, raw provider payloads, secrets, corrective-action authority, or billing execution instructions. The route has no forms, no Stripe/provider call controls, no subscription/billing execution controls, no corrective-action execution controls, no package assignment mutation controls, no package lifecycle controls, no entitlement/module/runtime behavior, no contractor permission changes, no reporting/export behavior, no automation/AI behavior, and no starter-pack provisioning changes.
- `/super-admin/packages/support-reviews/[supportReviewId]` provides platform-admin-only, read-only inspection for one billing/provider support review and its event evidence. The detail read model loads a single `contractor_package_billing_support_reviews` row, matching `contractor_package_billing_support_review_events`, linked provider mapping/assignment/company/package/version labels when safely available, review status/category/environment, safe provider-reference/reconciliation/webhook/operator/rollback evidence summaries, blocked/escalation caveats, no-event-evidence caveats, archived/unavailable-state caveats, and safe operator guidance. Unknown ids render a safe unavailable state rather than database/provider errors. The Packages support-review rows and provider-mapping detail support-review rows link to this detail route only when rows exist. No support-review records are seeded by this surface; populated support-review detail browser QA remains blocked in empty environments until real support-review rows exist. The route has no forms, no support-review mutation controls, no corrective-action execution, no Stripe/provider call controls, no subscription/billing execution controls, no package assignment mutation controls, no package lifecycle controls, no entitlement/module/runtime behavior, no contractor permission changes, no reporting/export behavior, no automation/AI behavior, and no starter-pack provisioning changes.
- `/super-admin/billing` is the durable platform-admin-only Billing Operations console for FloorConnector SaaS billing readiness. It shows names-only Stripe SaaS configuration health for `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_FOUNDER_PLAN_PRICE_ID`, the app-managed platform billing price reference, and `STRIPE_WEBHOOK_SECRET`; the SaaS checkout and webhook route paths; default/founder plan reference status; test-checkout readiness; supported SaaS webhook events; last reconciled webhook time from existing subscription rows; tenant billing status across existing `companies` and `company_subscriptions`; manual founder billing evidence status; safe provider-reference presence labels; subscription status/current period end; activation status; and operator next-action labels. Credential readiness is classified by safe prefix only: Product/Price setup requires `STRIPE_SECRET_KEY` to start with `sk_test_`, local test Checkout expects `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to start with `pk_test_`, live keys are refused, and other configured values are shown as mode-not-verified. It can create or discover the FloorConnector SaaS test-mode Stripe Product and recurring Price only when the secret key is safely identified as test mode, then stores only non-secret Product/Price references in `platform_billing_settings`. Webhook signing secrets remain env/provider-managed from Stripe CLI or the Stripe Dashboard endpoint and are not stored in FloorConnector tables. The page does not create live Stripe resources, customers, subscriptions, Checkout Sessions, Customer Portal sessions, payment links, invoices, live charges, webhook endpoints, fake subscriptions, env values, activation records, package assignments, entitlements, contractor-customer invoice payments, portal payment state, RLS policy weakening, or tenant-isolation changes. Billing Operations is the long-term billing IA; early access is treated as a temporary commercial state inside that billing model.
- `platform_billing_settings` is the platform-admin/service-role-only singleton table for non-secret SaaS billing settings such as plan label, Stripe Product id, Stripe Price id, currency, recurring amount/interval, mode, and sync timestamps. RLS is enabled and forced, broad `public` / `anon` / `authenticated` grants are revoked, and secrets such as Stripe API keys or webhook signing secrets remain in env/provider configuration.
- The 2026-05-15 local SaaS billing replay follow-up confirmed the implemented Billing Operations and setup routes load with authenticated contractor and platform-admin state, but the proof run remains safely blocked: local Stripe key prefixes are not safely recognizable as test mode, `platform_billing_settings` has no stored Stripe Product/Price reference, `STRIPE_FOUNDER_PLAN_PRICE_ID` is missing, and `STRIPE_WEBHOOK_SECRET` is blank. No Stripe Product/Price action, Checkout Session, webhook forwarding/replay, tenant activation, contractor-customer payment, portal payment, schema, RLS, or tenant-isolation change was performed.
- A subsequent credentials-first retry revalidated the same stop condition with prefix-only env checks and sanitized database reads: no Product/Price reference is stored, SaaS webhook/subscription replay evidence is empty in the checked environment, and no Stripe/provider mutation was attempted.
- After the local Stripe env fix, the 2026-05-15 proof run advanced through test-mode Product/Price setup and test-mode subscription Checkout. `platform_billing_settings` now has non-secret test Product/Price references in the checked environment, Billing Operations reports test checkout readiness, and `/setup/billing` sees Billing Operations as the plan source. Full webhook reconciliation is not complete: Stripe CLI listener processes were present but did not deliver the Checkout events to the local app, and a signed replay of real Stripe test-mode SaaS events returned the existing safe error `No subscription plan exists for SaaS billing reconciliation.` because the checked environment has no `subscription_plans` rows. No tenant activation, contractor-customer payment, portal payment, schema, RLS, or tenant-isolation change was performed.
- A same-day follow-up confirmed the Stripe env prefix gate, webhook secret presence, stored Product/Price reference, SaaS webhook listener processes, and authenticated Billing Operations/setup routes are ready, but repeat Checkout and real SaaS event replay remain intentionally blocked until `subscription_plans` has an active canonical SaaS plan. The wrong-domain signed webhook safety check still leaves SaaS subscription rows, contractor payment rows, and payment-event rows unchanged.
- The 2026-05-15 replay closeout added an idempotent `founder-default` seed for the platform-wide `subscription_plans` catalog and applied it through Supabase migration history. Signed real Stripe test-mode SaaS events then reconciled through `/api/stripe/saas-billing-webhook`: the webhook created the current `company_subscriptions` row, recorded processed event ids in `stripe_saas_billing_webhook_events`, set the subscription status to active, recorded the current period end from the invoice event, and treated duplicate replay idempotently. Tenant activation remained `trialing` / `trial`, contractor `payments` and `payment_events` counts did not change, and the signed wrong-domain webhook event stayed ignored.
- [docs/saas-billing-live-launch-plan.md](C:/FloorConnector/docs/saas-billing-live-launch-plan.md) now records planning-only live billing policy and release gates. It recommends keeping activation manual, using billing status as support/activation evidence, and initially gating only irreversible external-production actions. This is documentation only and does not implement live Stripe resources, live Checkout, Customer Portal, automatic activation, entitlement enforcement, dunning automation, cancellation controls, contractor-customer payment changes, portal payment changes, RLS changes, tenant-isolation changes, invoice/signature/payment state changes, or fake subscription state.
- `/super-admin/operations` is a platform-admin-only, read-only Platform Operations / System Health foundation. It builds a server-side read model from existing sources only: tenant status counts from `companies`, recent `workflow_error_events`, recent starter-pack provisioning runs/items, recent `platform_starter_pack_provisioning_attempts`, recent `contractor_group_audit_events`, `contractor_group_memberships` count, and `platform_starter_pack_assignments` count. The page renders `Platform Health Summary`, `Recent Operational Activity`, `Attention Needed`, `Audit Sources`, and `Not Yet Monitored / Future Operations`. Operational labels, workflow/error/activity summaries, starter-pack run errors, starter-pack attempt messages, and source caveats are sanitized and capped before display so raw SQL/provider details, stack traces, secret-like values, unsafe payload blobs, and unbounded error text are not shown. It has no forms or page-scoped buttons/inputs for remediation, retry, fix, resolve, archive, delete, provision, assign, entitlement, pricing/package, runtime, sync, or backfill controls; it does not mutate tenant records, create logs, trigger automation, execute provisioning, enforce entitlements, change runtime behavior, add AI behavior, or expose service-role credentials to the browser.
- platform admin assignment foundation backed by `platform_user_roles`
- `/super-admin` and nested super-admin routes require an explicit platform role assignment; contractor organization owner/admin/manager/member roles do not grant super-admin access
- first-platform-admin setup is explicit through the local/operator helper (`pnpm platform-admin grant <email>` or `PLATFORM_SUPER_ADMIN_EMAIL`), not automatic on first visit
- focused Playwright regression coverage exists for platform-admin access, contractor-only denial, and contractor route continuity when real platform and contractor test credentials are configured
- tenant lifecycle/status administration foundation
- `/super-admin/early-access` provides a minimal onboarding visibility view over existing `companies` and canonical workflow records:
  - links to `/super-admin/billing` for durable Billing Operations; early access remains focused on founder readiness, workflow progress, and manual activation rather than long-term billing operations
  - company name, created date, tenant status, lifecycle state, and saved-payment-method presence derived from `companies.stripe_payment_method_id`
  - operator summary buckets for pending setup, pending activation, active founder access, and suspended/blocked tenants derived from existing company status/profile/billing-reference fields
  - per-tenant operating-state labels and follow-up guidance that separate activation review from billing setup evidence
  - platform-admin editable founder billing evidence fields for plan label, expected amount, status, collection method, external reference, evidence timestamp, follow-up timestamp, and platform-only notes
  - project, estimate, contract, and invoice counts derived from existing canonical tables
  - first workflow, estimate-stage, and contract-stage progress derived from those counts
  - light early-user signals derived from existing records only: recent login based on `company_memberships.last_active_at` / `users.last_sign_in_at`, reached-estimate from estimate counts, and reached-contract from contract counts
  - feedback indicators and recent-feedback drill-in derived from existing `workflow_error_events` rows where `action = 'early_access.feedback'`
  - mark-active action using existing `companies.tenant_status` and `companies.lifecycle_state`
  - mark-active includes a confirmation step and returns the concise success feedback `Company activated`
  - SetupIntent billing labels on this page mean saved payment-method reference presence only; founder billing evidence fields are platform-admin notes/references only; stored Stripe customer/subscription/status references are displayed separately and do not indicate verified live subscription state, entitlement state, or automatic activation
  - in non-production environments only, platform admins can run a clearly labeled `DEV / TEST ONLY` onboarding reset for a selected company; the reset is tenant-scoped, clears project/estimate/contract/invoice workflow test records and related dependent workflow rows, clears `companies.stripe_payment_method_id`, and returns the company to `tenant_status = trialing` / `lifecycle_state = trial`
  - the dev reset intentionally keeps `companies.stripe_customer_id` in place and fails safely if insert-only binding system snapshots exist, because those records are canonical and cannot be deleted through a lightweight QA utility
- non-production contractor app sessions can show a subtle `DEV MODE` badge with `Reset session` when `FLOORCONNECTOR_SHOW_DEV_QA_TOOLS=1`; the reset action signs out through the real auth action after clearing browser local/session storage
- non-production `/dashboard?fresh=true` forces the existing Start Here onboarding card visible and ignores the localStorage dismissal state without creating fake data or bypassing canonical record reads
- non-production `/setup/billing` shows a small Stripe status indicator for test-mode, missing, mixed, or live key configuration

Current design notes:

- super admin is the source of truth for platform-wide defaults and system controls
- contractor organizations remain isolated and own their copies after adoption
- platform admin uses a separate platform-role assignment layer instead of piggybacking on tenant membership roles
- `jfilamonte@gmail.com` is intended to remain a normal contractor owner/test account and is not granted platform admin by default
- tenant activation continues to use the existing tenant lifecycle/status administration foundation on `companies.tenant_status` and `companies.lifecycle_state`; no separate activation/account-status model has been added
- platform workflow defaults now include signature-readiness and financing-readiness baselines that tenant workflow settings can inherit
- the super-admin surface is now implemented as a real configuration foundation with an inspectable read model for current platform default, contractor-owned, platform starter packs, and the one active user-preference layer for preferred estimate templates; deeper enforcement, entitlements, other user preferences, organization override registries, and broader platform governance workflows are still future work
- starter packs are implemented as platform-governed grouping records with planning-only assignment intent, a read-only targeting explainer, a read-only provisioning dry-run report, draft audit/run capture, stale-draft review, audit approval, the first guarded approved-run execution slice for creating missing contractor-owned template/catalog copies, and safe rejected-attempt/no-op operation logging; automatic starter-pack rollout, entitlement targeting, runtime enforcement, and rollback/void workflows remain future capabilities
- contractor groups are implemented only as platform-owned segmentation/read-model metadata with manual organization membership, durable audit-history storage/read-only visibility, and platform-admin observability; they are not tenant roles, entitlements, pricing packages, module gates, starter-pack auto-provisioning triggers, or contractor-side permission groups
- visible placeholders for template assignments, entitlements, and tax profiles are labeled as future capabilities only; they do not add enforcement, billing behavior, or duplicate configuration models. Platform package/billing governance and platform operations now have first read-only foundations, but billing enforcement, Stripe subscription management, entitlement enforcement, package/module gating, remediation, alerting, escalation queues, retry controls, and broader operations workflows remain future work.
- visible Resolution Preview placeholders for organization override registry, other user preferences, and record snapshots remain non-functional; the only implemented user preference is preferred estimate template selection for new estimate Quick-Create preselection/storage, with no entitlement enforcement, tax logic, payroll logic, invoice/contract behavior changes, or runtime configuration enforcement

## What Is Not Implemented Yet

Not implemented yet:

- full dispatch-grade scheduling system
- drag-and-drop rescheduling, dispatch optimization, and deeper crew-calendar coordination
- automated dispatching and external notifications
- automated work-item generation, customer-facing reminders, provider-backed reminder delivery, and portal task visibility
- contractor website generation, tenant-owned domain hosting, public acquisition pages, SEO/service/location-page infrastructure, landing-page generation, marketing attribution, public AI intake, AI-generated website/content workflows, review/reputation flows, testimonials, and before/after gallery generation
- a full dedicated Templates & Systems settings/admin area that unifies document templates, System Templates, add-ons/options, sharing/review settings, platform promotion, and downstream generation workflows
- full document-template coverage for proposal/SOW and future work order templates
- full per-record display-template switching across estimates, invoices, contracts, SOW output, and custom document layouts beyond the currently implemented shared template references
- contractor shareable template/system/add-on opt-in settings, super-admin review/import/promotion, anonymization review, or promoted platform defaults for other contractors to adopt
- Takeoff & Scope Intelligence
- pre-lead visual/product/finish selection or room visualizer handoff
- active selected-system/spec workflow for sold and installed finish systems beyond the tenant-owned `selected_floor_systems` admin/data-access foundation
- product images, spec sheets, visualizer renders, and downstream customer proof beyond the `finish_products` metadata and `selected_floor_systems` foundations
- shared file/evidence layer with multi-record links across projects, opportunities, estimates, contracts, jobs, invoices, payments, change orders, daily logs, field notes, selected systems/specs, and finish products
- canonical delivery attempts/events for estimate, contract, invoice, change-order, portal-invite, or payment-request sends beyond the currently implemented notification delivery foundation
- provider-backed delivery telemetry lifecycle for queued, sent, delivered, opened, clicked, deferred, bounced, blocked, dropped, or failed delivery states across customer-facing commercial sends
- company-brain activity timelines over project/customer/record chains
- automated Scope Intake to Estimate Plan or estimate-line generation
- detailed measurement-driven estimate generation with multiple rooms/zones, irregular geometry, optional components, or advanced quantity review
- full System Template estimate generation beyond the schema foundation, including active estimate/contract integration, Detailed Build, advanced formula-driven required inputs, optional components, defaults, and template share-back/review workflows
- System Template adoption/promotion/versioning workflows beyond the current catalog system, document-template foundations, and first floor-system-template tables
- dedicated add-ons/options management for sqft, lf, each/count, project/flat-price, or future labor/multiplier based modifiers
- full internal labor modeling as catalog/cost item components with crew size, production rate, minimum site time, markup, and condition/access multipliers
- AI Capture, AI-assisted takeoff, AI-suggested measurements, AI-suggested system/cost-item mapping, and AI-generated estimate drafts
- on-screen plan/PDF/image takeoff, scale calibration, plan measurement, takeoff-to-cost-item mapping, and automated takeoff-based estimate generation
- takeoff source traceability, takeoff-estimate out-of-sync review state, and takeoff-driven material/labor/production planning
- contractor network collaboration, contractor-to-contractor chat, marketplace behavior, and subcontractor/vendor portal collaboration
- scoped external project/job workrooms for subcontractors, vendors, or partner contractors
- broad module-dashboard coverage across the contractor app
- external e-sign provider integration
- deeper PDF/email delivery, stored document/version management, and external e-sign provider lifecycle integration
- deeper gateway-backed reconciliation, retry, and provider-sync workflows
- live billing/subscriptions
- Stripe Customer Portal for FloorConnector SaaS subscription management
- deeper gateway-backed customer-facing payment completion and reconciliation workflows
- advanced permissions UI, including broader project-by-project role enforcement beyond the currently stored linked-contact flags
- platform-admin temporary portal credential issuance beyond the active-tenant contractor owner/admin UI
- deeper AIA/pay-application UX, export/reporting forms, and richer SOV draw management
- external tax provider integration
- rich template editing UI
- external e-sign integration workflows on top of the canonical contract record
- broader alignment from [docs/ui-data-model-alignment-backlog.md](C:/FloorConnector/docs/ui-data-model-alignment-backlog.md), including stronger module-page UI consistency, directory/contact unification, Estimate Editor navigation/review improvements, line taxable-toggle planning, structured project/service address display, configurable tax-rate direction, and fuller workflow-guidance states

Future-looking note:

- the public homepage and early-access intake are implemented for FloorConnector onboarding, but contractor-owned websites, tenant-owned domains, SEO/service/location pages, landing pages, marketing attribution, generated marketing content, public AI intake, reviews/reputation, testimonials, and before/after galleries are target platform direction only; they should eventually feed the same canonical opportunity/customer/project workflow rather than becoming a separate website, CRM, marketing-contact, or AI knowledge system.
- future GateKeeper/communications planning now explicitly supports multi-line and role-based number strategy as target architecture only: company main lines, owner lines, sales rep/account manager/estimator/admin/team lines, after-hours assistant lines, campaign/tracking numbers, branch/location numbers, forwarding, port-in, and per-number port-out should all feed the same canonical communications and GateKeeper memory layer rather than creating per-user phone silos, campaign-number silos, or separate CRM inboxes.
- the current vendors, people, compliance, jobs, daily logs, time, communication, notification, and portal access foundations could support future scoped collaboration, but no contractor network, marketplace, open contractor chat, or external subcontractor/vendor collaboration surface is implemented today.
- the current projects, estimates, estimate line items, reusable catalog item foundations, platform starter catalog foundations, organization-owned catalog items, document-template/settings foundations, selected-system schema foundation, files/attachments foundations, site-assessment fields, communication/notification foundations, and customer/project workflow could support future visual/product/finish selection, selected-system/spec workflows, shared file/evidence linking, delivery proof, activity timelines, measurement-driven estimating, System Template generation, add-ons/options, Templates & Systems administration, Takeoff & Scope Intelligence, and AI Capture.
- the current lead Scope Intake fields can now prefill reviewable Estimate Editor system inputs from captured measurements, but they do not automatically generate estimate lines, SOW, labor plans, material plans, takeoff records, AI suggestions, invoices, or customer-facing commercial scope.
- no `visualizer_sessions` table, pre-lead visualizer handoff, estimate/contract selected-system integration, UI/server-action writes into system snapshots, shared multi-record file/evidence layer, delivery-proof lifecycle for commercial sends, company-brain timeline, advanced measurement-driven estimate generation beyond the current reviewable V1 Source assessment prefill, full System Template estimate generation, System Template sharing, dedicated Templates & Systems admin module, add-on/option management workflow, on-screen takeoff, AI Capture, AI takeoff, plan measurement, takeoff-to-cost-item mapping, source traceability, out-of-sync review state, or automated estimate generation exists today.
- future takeoff must stay separate from implemented truth: Measurements are manual quantity inputs; Takeoff means plan/PDF/drawing-based measurement; AI Capture is a future photo/app/AI-derived input method. Takeoff and measurements would produce quantities, catalog/cost items would define reusable cost, pricing, production, markup, and tax behavior, System Templates would map quantities to grouped estimate content, and estimates would define customer-facing pricing and commercial scope.

## UI Direction Update (Latest)

The decision-first contractor UI refactor is implemented across the main contractor dashboard, Manager Pages, and core Record Workspaces.
Estimates now serve as the contractor app's UI/workflow reference pattern because they concentrate proposal review, commercial context, customer trust, and downstream handoff in one workspace.
The Phase 1 Golden Workflow Demo Path is now documented as the repeatable QA spine through the existing route chain from dashboard and opportunity review into customer, project, estimate, contract, invoice/payment, job, schedule, and daily-log surfaces.
The Founder Demo Readiness script is now documented in [docs/founder-demo-readiness.md](C:/FloorConnector/docs/founder-demo-readiness.md). It packages the current setup, billing, operating workflow, portal, print/save document, and super-admin early-access checkpoints into one rehearsal path without adding demo-only data, stored PDFs, live billing launch, payment mutation, signature mutation, schema changes, or workflow changes.
Phase 1.1 adds portal/customer Playwright fixture infrastructure for that same spine: `pnpm e2e:portal-auth` can create a local portal customer storage state from real portal E2E credentials, and `pnpm e2e:portal` smokes the customer-facing portal home, project workspace, and shared estimate/contract/invoice review routes where canonical portal access grants and fixture records exist. Phase 1.2 adds `pnpm e2e:portal-fixture` as a validation-first helper for that customer-side fixture; write mode is explicitly gated by `FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1` and creates only canonical dev/test customer, contact, project, access-grant, estimate, contract, signer, and invoice records for the contractor E2E organization.
The paid early-access planning boundary is documented in [docs/paid-early-access-plan.md](C:/FloorConnector/docs/paid-early-access-plan.md). The current branch implements no-charge billing setup, a test-mode-only FloorConnector SaaS subscription Checkout Session bridge, signed SaaS-only webhook reconciliation for `floorconnector_saas` subscription status/reference updates, manual/platform-admin activation controls, the Phase 2.1 early-access operating/evidence layer, and read-only package/provider governance only; live SaaS subscription launch, automatic activation, entitlement enforcement, and Stripe Customer Portal remain future focused work.

Implemented UI behavior now:

- Project remains the primary workflow and readiness hub.
- Project Workspace now carries the first operating-core visibility stack:
  ProjectPulse, FieldTrail, MessageCenter, CloseoutTrail, and Proof Center.
  These are read-only layers over existing project, job, field, communication,
  commercial, invoice, payment, warranty/service, and customer-access records.
  They do not create separate subsystems, duplicate business records, AI
  summaries, automation, schema, migrations, route changes, or workflow
  mutations.
- Dashboard emphasizes high-signal priorities before passive metrics.
- Dashboard now includes an Operational Cockpit section that groups existing notifications, deterministic project cues, approved-estimate handoffs, ready-project/job handoffs, service/warranty ticket and service-job attention, warranty document signature-request visibility, customer/signature/payment waiting states, and field/production follow-up into `Needs attention`, `Ready to move`, `Waiting on customer/payment/signature`, and `Field/production follow-up` buckets. The buckets are presentation-only over existing records and links.
- Project, Estimate, Contract, Invoice, and Job Workspaces lead with next-action and workflow-state context before supporting panels.
- Project Workspace now includes a compact workflow summary that names current stage, blocker, next action, and the related linked record or Project Workspace fallback driving the next step. Its command summary now also shows the current lifecycle position, and a dedicated Readiness + Blockers panel links commercial, deposit/payment, schedule, invoice, progress-billing, and field blockers to the canonical estimate, contract, invoice/payment, job/schedule, Daily Log, or project record that can resolve them where available. Connected record lanes now separate invoices, payments, field/Daily Logs, and time/labor summaries while remaining derived from existing canonical records. This reuses existing readiness snapshots, workflow guidance preferences, linked-record recency, time cards, payment events, and next-action calculations without changing readiness behavior.
- Project Workspace now includes Proof Center Phase 1, a read-only project document/evidence/proof index below CloseoutTrail. It groups existing estimates, contracts, change orders, Signature Trail, Send Trail, Customer Access, invoices, Payment Trail, Daily Job Logs, Job Notes, field evidence, warranty documents, and service tickets into source-record links and a deterministic Proof Next Move. It does not add document management, uploads, schema, migrations, route changes, portal-only copies, provider sends, AI summaries, automation, or payment/signature/field/portal behavior changes.
- Estimate, Contract, and Invoice Workspaces now present existing document
  delivery evidence as Send Trail. Send Trail summarizes send events,
  viewed/acted evidence, pending/failed attention, and source-record review
  moves without changing provider sends, signatures, payments, estimate math,
  invoice math, portal grants, or document storage behavior.
- Document Engine Phase 1 now centralizes the existing estimate, contract, and
  invoice print/save PDF route helpers and copy. Contractor and portal
  estimate/contract/invoice print routes remain browser print/save HTML views
  over current source records; they now make explicit that printing or saving
  does not send the document, create delivery proof, create a separate document
  record, or change approval, signature, payment, or delivery state.
- Estimate, Contract, and Invoice Workspaces now include a contractor-side
  Document Readiness summary derived from the same canonical source record,
  customer/project context, template/rendering availability, signature or
  payment state where relevant, line/scope presence, and portal contact
  availability. The summary clarifies whether the document is ready for preview,
  customer review/signature/payment request, already complete, or blocked by
  missing context. It does not create stored PDFs, document records, portal-only
  copies, provider calls, autonomous sends, payment mutations, signature
  mutations, schema, migrations, or portal-facing readiness copy.
- `/communications` now shows Customer Communication Send Readiness for Copilot
  draft handoffs. The summary is derived from the draft audience/action,
  selected canonical thread/source record, customer context, and document
  readiness when supplied. It labels ready/needs-review/blocked state, missing
  requirements, safe subject/body framing, customer-safety warnings, and the
  explicit "nothing is sent automatically" boundary. It does not send email/SMS,
  call providers, create delivery events, create notifications, create threads,
  add a draft table, mutate source records, or expose the draft to the customer.
- `/communications` now also has Communications v1 record-linked workspace
  intelligence. It derives operating lanes, follow-up signals,
  customer-visible/internal boundaries, finance context, closeout/evidence
  context, and recent delivery/evidence activity from canonical
  `communication_threads`, `communication_messages`, per-user communication
  notifications, `document_delivery_events`, and
  `portal_evidence_delivery_events`. It is a contractor-side control-room read
  model with a conservative contractor write path. Existing thread replies and
  project/customer record composers can now save explicit internal notes or
  customer-visible portal-history messages to canonical
  `communication_messages`. Customer-visible means stored FloorConnector
  history only in this slice; it does not send email/SMS, create provider
  attempts, create delivery proof, create portal-only message copies, expose
  internal notes to the portal, add schema, or run automation.
- Communications Record Continuity v1 now projects that same canonical
  communication context back into Project, Customer, Invoice, and Contract
  Workspaces through compact Related Communications panels. The panels filter
  existing `communication_threads` by tenant and source record, show recent
  stored thread snippets, thread status, customer-visible/internal boundary
  labels, and links back to `/communications`; Project Workspace includes
  project-linked commercial/billing record threads from MessageCenter context.
  It adds no communication tables, message persistence model, fake messages,
  provider sends, notification automation, AI summaries, portal-only copies,
  schema, or migrations.
- Communication Reply Triage v1 adds a no-schema contractor-side unread/triage
  layer for portal customer replies. The shared
  `apps/web/lib/communications/reply-triage.ts` helper derives needs-response
  state from canonical `communication_messages` and `communication_threads`:
  an inbound portal customer-visible reply after the latest contractor
  customer-visible response is treated as waiting on the contractor, while
  internal notes do not clear it. `/communications` now uses that derived state
  for the Needs response lane and follow-up intelligence, and Project
  MessageCenter highlights the latest customer reply needing follow-up. Existing
  notification read-state still uses `notifications`; this slice does not add
  schema, persisted reviewed/handled state, notification events, provider sends,
  reminders, automation, portal-visible triage state, or message-history
  mutation.
- `/schedule` now presents as CrewBoard on the existing route. CrewBoard uses
  canonical jobs, appointments, job assignments, people, vendors, projects, and
  customers for scheduling visibility, URL-backed date/layout context,
  advisory schedule warnings, daily/weekly readiness grouping, a dispatch
  Attention Desk, and project/job handoffs. The selected-job panel now includes
  a confirmation-first `Move schedule` flow backed by pure move summary helpers
  and the existing schedule action, so keyboard/manual movement is available
  before pointer drag/drop. The reusable schedule read model now also orders
  readiness-blocked jobs, past scheduled incomplete jobs, missing-crew jobs,
  same-day capacity or overlap warnings, aging ready jobs, and in-progress jobs
  for dispatch review. Phase 3B-A also adds proposed-move target helpers,
  URL-backed prepared move state, inert drop-target metadata on board sections,
  and a compact `Prepare move` preview that fills the same `Move schedule`
  form. It does not implement automated dispatch, route optimization,
  notifications, external calendar sync, portal schedule sharing, or new
  schedule/dispatch records.
- `/reports` now includes Reports Phase 1, a read-only operations and
  collections visibility workspace over existing projects, jobs, schedule
  warnings, contracts, invoices, payments, Daily Job Logs, Job Notes, field
  evidence, closeout, and proof signals. The operations view now separates
  attention, ready-to-move handoffs, execution-to-cash continuity, AR exposure,
  field execution, and recent source-record movement while linking rows back to
  Project Workspace, CrewBoard, Invoice Workspace, Contract Workspace, Job
  Workspace, Payment surfaces, or Daily Logs. Reports now also includes a compact
  lead-to-cash route map that names each golden workflow stage, the owning
  workspace, and the handoff question so owner review can understand where the
  next action lives without moving action ownership into Reports. It does not
  add an analytics warehouse, report builder, fake metrics,
  export system, automation, AI, schema, migrations, reporting persistence, or
  payment/signature behavior.
- Estimate, Contract, Invoice, Job, and Project Workspaces share the same baseline grammar: compact header band, semantic status pill, next-action card, workflow summary, state facts, primary record surface, context rail, connected records, and internal follow-through sections.
- The UX Design System Foundation adds shared `@floorconnector/ui` primitives
  for status badges, readiness badges, compact readiness summaries, action
  hierarchy class names, and empty-state copy variants. Representative shared
  Dashboard, Project, and Schedule components now consume the shared status
  badge primitive where low-risk. This is a foundation only; it does not mean
  every route has been redesigned or that readiness, scheduling, financial,
  workflow, schema, RLS, tenant, portal, provider, payment, or signature
  behavior changed.
- Dashboard command-center cleanup now makes the existing dashboard action
  queues the primary attention layer when they are available, keeps the older
  priority strip as fallback, and reuses shared status badge, action hierarchy,
  and empty-state primitives in the dashboard queue surfaces. The dashboard
  remains a prioritization and routing surface over existing read models and
  canonical records; it does not create dashboard-owned workflow state,
  duplicate queues, role-specific persistence, schema changes, migrations,
  financial/schedule/readiness truth changes, provider behavior, AI, AIA, or
  customer self-service.
- Record Workspace rhythm now has a shared presentation contract in
  `@floorconnector/ui` plus a reusable `RecordWorkspaceSection` primitive.
  Estimate, Contract, Invoice, and Job command bands use shared status badges,
  and representative Project linked-context panels use the shared section
  shell. This standardizes the identity -> state/next action -> primary work ->
  linked context -> details/history reading order without changing business
  logic, data models, schemas, readiness calculations, payment/signature/
  scheduling behavior, or canonical ownership.
- Financial, Schedule, and Production Readiness now have shared UI lane copy in
  `@floorconnector/ui`. The Project Readiness + Blockers panel, Ready to
  Schedule handoff, Project Financial Hub overview, Project Production Hub
  overview, and Schedule Field Handoff readiness packet use that language to
  clarify which owning workspace acts next. This is presentation-only over
  existing read models and does not change readiness calculations, financial
  state, schedule fields, production/field records, schema, migrations,
  Supabase, payment behavior, signature behavior, scheduling mutation, or
  canonical ownership.
- Mobile Field Beta Pass V1 adds presentation-only mobile scanability polish to
  the Lead Assessment Package panel, Schedule Field Handoff panel, Daily Logs
  manager, and `/field/work-items` assigned field queue. It reuses shared
  status/readiness badges where safe, improves narrow-screen ordering, touch
  targets, wrapping, and field action visibility, and keeps all actions linked
  to existing canonical Lead/Opportunity, Project, Job, Daily Log, Field Work,
  and Communication surfaces. It does not add schema, migrations, Supabase
  changes, mobile-only/offline persistence, duplicate field queues, duplicate
  schedule/readiness truth, customer self-service, AI, or business logic.
- Authenticated Route Smoke V1 adds focused Playwright coverage for protected
  UX Beta Readiness routes at desktop and mobile widths. The smoke runs through
  the existing contractor auth setup project, rejects `/login` redirects and the
  generic app error page, checks for route-specific protected content, and
  stores screenshots as ignored Playwright artifacts. This is local QA/test
  infrastructure only and does not change auth, RLS, schema, Supabase data,
  business logic, route behavior, dashboard/workspace design, customer
  self-service, AI, or AIA.
- Contractor authenticated browser smoke now has an explicit local storage-state
  setup path. `pnpm e2e:auth:setup` uses real
  `FLOORCONNECTOR_E2E_EMAIL` / `FLOORCONNECTOR_E2E_PASSWORD` credentials to log
  in through `/login` and save local-only state to `PLAYWRIGHT_STORAGE_STATE` or
  `.playwright/.auth/contractor.json`, while still reusing legacy
  `playwright/.auth/local-user.json` when present. `pnpm e2e:smoke:auth`
  reuses existing state, generates it when credentials are available, and skips
  with a clear prerequisite message when neither state nor credentials exist.
  This is test infrastructure only and does not change runtime auth, route
  protection, RLS, Supabase schema, tenant membership, or credentials handling.
- Settings / Super Admin Boundary UX V1 clarifies the presentation boundary
  between contractor Company Controls and the Platform Control Room. Contractor
  Settings now identifies company-owned configuration, workflow defaults,
  templates, billing defaults, team access, exports, and company feature
  overrides as tenant/company controls, while Super Admin identifies platform
  starter settings, feature policy, tenant lifecycle oversight, SaaS billing
  operations, packages, and operator controls as platform-owned. This is
  presentation-only; it does not change schema, migrations, Supabase data,
  business logic, settings persistence, provider/billing mutation, payment,
  signature, scheduling, tenant activation, role models, customer self-service,
  AI, or AIA.
- Settings Company Controls V2 makes the contractor Settings overview a setup
  health and owner-section routing surface instead of a configuration dump.
  `/settings` now summarizes existing tenant status, lifecycle state, missing
  company setup fields, next setup actions, and links into Company, Team &
  Access, Sales / Workflow, Operations, Financials, Documents / Templates /
  Catalogs, and Integrations / Modules sections. The Settings side navigation
  uses those owner groups while preserving existing routes. The company profile
  accepts plain contractor website domains and normalizes them to usable HTTPS
  URLs, and the brand accent control is clarified as the protected app header
  accent preview. Workflow error events inside company admin are relabeled as
  an Operations Monitor preview for troubleshooting only. This does not change
  schema, migrations, Supabase data access, settings persistence contracts,
  tenant activation, route names, workflow action ownership, platform policy,
  provider behavior, payment, signature, scheduling, customer self-service, AI,
  or AIA.
- Dashboard, Project, Schedule, Contract, Invoice, Job, and Daily Log surfaces now share grouped lifecycle language around `opportunity -> customer/project -> estimate/contract -> job/schedule -> invoice/payment`. Contract Workspace clarifies draft, approval, signature, decline, countersign, deposit, and downstream handoff context; Invoice Workspace clarifies draft, sent/open, partial, paid, void, billing-source, collection, payment, and upstream-readiness context; Job Workspace clarifies schedule, crew, field evidence, closeout, and downstream billing handoff; Daily Log Workspace clarifies project-day narrative, field notes, labor/time continuity, attachments, and upstream Project Workspace resolution. This is presentation-only and does not change signature, readiness, scheduling, time-card, billing, payment, portal, schema, RLS, or server-action behavior.
- Projects, Estimates, Invoices, Jobs, Contracts, and Customers Manager Pages use the shared Manager Page rhythm with clearer status scanning, primary create actions, and compact continuity cues.
- Portal and super-admin received only safe consistency cleanup; they do not copy contractor operational patterns wholesale.
- Portal/customer smoke coverage is test infrastructure only. It does not create portal-only records, fake payments, fake signatures, new portal access rules, or duplicate customer/project/commercial records.
- The enterprise UX consolidation pass records the customer/contact/access/review ownership map in [docs/enterprise-ux-consolidation.md](C:/FloorConnector/docs/enterprise-ux-consolidation.md). Current implementation now uses summary-first Customer Workspace framing, People-owned access administration, compact project-specific contact visibility, collapsed secondary management forms, and customer-safe portal review copy without changing schema, RLS, financial calculations, payment state, signature state, or portal access rules.
- Customer Workspace portal access now shows a recommended portal contact from the existing primary customer contact when an email is available, summarizes no-invite/pending/active/revoked grant state plus shared project counts, preselects the recommended contact for explicit portal invites, and requires confirmation before revoking grant or project visibility. This is UI/read-model cleanup over existing `portal_access_grants` and `portal_project_access`; it does not add a contractor default-access setting, customer-admin portal management, schema, RLS, auth identity creation, or new access rules.
- The second enterprise UX consolidation pass narrows the record-workspace right rails: Project, Estimate, Contract, and Invoice Workspaces keep primary context visible while extra linked records, revision history, invoice editing, payment recording, metadata, and lower-frequency activity use progressive disclosure. Portal copy was further simplified for customer review without changing checkout, signature, payment, billing, access, schema, RLS, or tenant behavior.
- The third enterprise UX consolidation pass adds responsive QA and mobile-density polish: shared detail headers, linked-record cards, detail panels, manager cards, project forms, and customer pickers wrap safely at mobile widths so contractor detail pages and portal review routes avoid page-level horizontal overflow. This remains presentation-only and does not change workflow, access, payment, billing, signature, schema, RLS, or tenant behavior.
- The public marketing surface now tells the current operating-core story more
  directly: FloorConnector is positioned as connected operating software for
  specialty surface contractors, with Project Workspace, CrewBoard, FieldTrail,
  MessageCenter, Proof Center, Customer Portal, Financial Control, Document
  Engine, Accounting Readiness, mobile Daily Job Log capture, and global search
  framed as demo-ready surfaces where current implementation supports them.
  Later capabilities such as drag/drop dispatch, accounting sync, stored PDFs,
  customer service requests, customer-facing field evidence, AI, and external
  integrations are clearly labeled as later direction. This remains
  presentation/copy polish only and does not change public intake persistence,
  auth routing, setup billing, activation, subscription behavior, schema, RLS,
  or protected app workflow.
- The Phase 2 authenticated visual audit added a route-matrix smoke harness at `scripts/visual-audit-phase2.cjs` and verified the protected contractor, setup, detail, and super-admin routes against local authenticated Playwright state. Manager/workspace headers now expose the actual route title as the semantic `h1`, reusable detail panels use heading semantics, `/setup/pending-activation` wraps safely without page-level horizontal overflow, and `/super-admin/billing` contains long Stripe/env/CLI strings without widening the viewport. This remains presentation-only and does not change schema, auth, RLS, tenant boundaries, portal grants, server actions, financial calculations, payment state, signature state, readiness gates, activation, or canonical workflow behavior.
- The Phase 3 authenticated visual closeout adds `scripts/visual-audit-phase3.cjs` for focused setup, materials, and portal evidence. The local May 16, 2026 run checked focused rows with real portal auth state, confirmed `/materials -> /cost-items-database/items`, verified portal desktop/mobile route identity for home/project/estimate/contract/invoice review routes, and found no missing headings, console/page errors, or horizontal overflow. Phase 4 extends the stable portal fixture and golden-path smoke to include a sent canonical change-order review route on the same shared project chain; the focused visual matrix now checks portal change-order review on desktop and mobile with screenshot/DOM evidence. This remains presentation/test-infrastructure only and does not change canonical models, auth, RLS, tenant boundaries, portal grants, financial calculations, payment state, signature state, readiness gates, activation, or workflow behavior.
- Reset-safe portal change-order action coverage now verifies approve/reject submissions against disposable canonical `change_orders` records without mutating the stable golden review fixture. The tests confirm approved/rejected canonical DB state, decision notes, timestamps, non-reviewable action hiding, and unauthorized-project denial. The action path continues to require authenticated portal scope, active portal grant, active project access, and linked-contact `can_approve_change_orders` permission; stored linked-contact permission is loaded after scope validation through the server admin client so portal-user RLS does not hide the permission row from the server action.
- Reset-safe portal estimate action coverage now verifies approve/reject submissions against disposable canonical `estimates` records without mutating the stable golden estimate fixture. The tests confirm approved/rejected canonical DB state, decision timestamps, portal decision user, non-reviewable action hiding, unauthorized-project denial, and unchanged fixture subtotal/tax/discount/total. The action path continues to require authenticated portal scope, active portal grant, active project access, and linked-contact `can_approve_estimates` permission through the same scoped portal permission helper used by change-order decisions.
- Reset-safe portal contract signature coverage now verifies sign/decline submissions against disposable canonical `contracts` and `contract_signers` records without mutating the stable golden contract fixture. The tests confirm signed/declined canonical contract state, signer state, hidden terminal actions, unauthorized-project denial, and appended immutable `contract_signature_events`. Portal contract review now reads signer routing with the server admin client after project-scoped portal access is validated, preventing portal-user RLS from hiding canonical signer rows from the customer-facing review page.
- Reset-safe portal invoice payment-boundary coverage now verifies open, paid, and unauthorized-project invoice review against disposable canonical `invoices` and `invoice_line_items` without mutating the stable golden invoice fixture. Paid-state coverage uses canonical recorded `payments` and `payment_events`, and the tests confirm render does not create additional payments or payment events, invoice totals/balance remain unchanged, checkout is not clicked, and unauthorized invoice details do not leak. Portal invoice review now reads `payment_events` with the server admin client after project-scoped portal access is validated, preventing membership-only RLS from hiding payment activity from the customer-facing invoice page.
- Provider-isolated portal invoice checkout-start coverage now verifies the real portal payment-start form against a disposable canonical invoice using the existing `local_manual` gateway adapter through the non-production-only `FLOORCONNECTOR_E2E_PAYMENT_GATEWAY=local_manual` Playwright override. The spec temporarily activates the E2E organization for the production-action guard, restores its previous activation state afterward, and confirms checkout start creates/reuses the canonical pending `payments` row and writes `payment_requested` plus `checkout_started` events while leaving invoice totals, balance, and status unchanged. It does not create Stripe sessions, charges, webhook events, payment completion, duplicate billing models, or portal-only payment records.
- Synthetic Stripe payment webhook reconciliation coverage now verifies the contractor-customer payment webhook route with locally signed synthetic Stripe payloads against disposable canonical invoices and pending `payments` rows. The test uses the same signature verification path as production, finalizes a canonical payment for `checkout.session.completed`, records one provider `payment_succeeded` event with the provider event id, updates invoice balance/status through canonical payment state, and confirms duplicate success delivery is idempotent without adding another payment or event. It also verifies `checkout.session.expired` voids the pending canonical payment, records one provider `payment_voided` event, leaves invoice status/balance unchanged, writes no success event, and treats duplicate expired delivery as idempotent. It now verifies `checkout.session.async_payment_failed` records one provider `payment_failed` event, attaches checkout and PaymentIntent failure references to the pending canonical payment, leaves invoice status/balance unchanged, writes no success event, and treats duplicate async-failure delivery as idempotent. It verifies `payment_intent.payment_failed` records one provider `payment_failed` event, attaches the PaymentIntent failure status to the pending canonical payment, leaves invoice status/balance unchanged, writes no success event, and treats duplicate failure delivery as idempotent. It also verifies `payment_intent.canceled` voids the pending canonical payment, records one provider `payment_voided` event, leaves invoice status/balance unchanged, writes no success event, and treats duplicate canceled delivery as idempotent. Negative coverage verifies invalid signatures are rejected before mutation, signed events missing canonical metadata do not mutate records, signed events with an explicit unknown `payment_id` do not create fallback payments, same-tenant cross-invoice signed events cannot apply one invoice's payment to another invoice, signed cross-tenant events cannot apply tenant B's real payment id to tenant A's real invoice, and unsupported signed event types are ignored safely. It does not call Stripe, create Checkout Sessions or charges, run webhook forwarding, touch SaaS subscription webhooks, mutate golden fixtures, or add duplicate/portal-only payment state. A write-gated second-tenant fixture seam exists at `pnpm e2e:second-tenant-fixture`; it creates/resets a disposable tenant B company/customer/project/invoice/line-item/payment chain for cross-tenant webhook mismatch tests, does not create tenant B memberships, and does not make tenant B active/default for UI auth.
- Payment QA commands are consolidated as `pnpm e2e:payments:portal`, `pnpm e2e:payments:webhook`, and `pnpm e2e:payments`, with Tenant B reset exposed as the explicitly write-gated `pnpm e2e:second-tenant-fixture:write`. These are test-harness and documentation affordances only; they do not add payment behavior, Stripe provider calls, schema, auth, RLS, tenant, portal grant, invoice math, or webhook reconciliation changes.

Context-aware creation remains unchanged:

- Project context: downstream records are auto-linked to the project and derived customer.
- Customer context: the customer is prefilled, and a project must be selected or created.
- Global context: both customer and project must be selected explicitly.
- Applies to estimates, jobs, contracts, and invoices.

Constraints preserved:

- No changes to data model.
- No workflow changes.
- No calculation changes.
- No auth, RLS, route, server-action, or backend behavior changes.
- No one-off/direct invoice shortcut, demo-only state, portal-only copy, or duplicate lifecycle was introduced by the Golden Workflow Demo Path documentation.

For implementation guidance on the current UI baseline, use [docs/ui-patterns.md](C:/FloorConnector/docs/ui-patterns.md).
