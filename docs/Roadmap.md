# FloorConnector Roadmap

Status: Active
Doc Type: Roadmap

This roadmap frames FloorConnector around platform maturity, not early startup build timing. It is sequencing guidance only.

For implemented truth, use [docs/current-state.md](C:/FloorConnector/docs/current-state.md). For concise maturity status, use [docs/platform-maturity.md](C:/FloorConnector/docs/platform-maturity.md), [docs/module-status.md](C:/FloorConnector/docs/module-status.md), and [docs/known-gaps.md](C:/FloorConnector/docs/known-gaps.md). For strategic sequencing, use [docs/platform-build-registry.md](C:/FloorConnector/docs/platform-build-registry.md) and [docs/platform-maturity-model.md](C:/FloorConnector/docs/platform-maturity-model.md). For strategic layer doctrine, use [docs/communications-layer.md](C:/FloorConnector/docs/communications-layer.md), [docs/reporting-and-metrics.md](C:/FloorConnector/docs/reporting-and-metrics.md), [docs/automation-layer.md](C:/FloorConnector/docs/automation-layer.md), and [docs/intelligence-layer.md](C:/FloorConnector/docs/intelligence-layer.md).

## Roadmap Principles

- No roadmap section claims implementation by itself.
- No roadmap section introduces a parallel workflow.
- Future work must preserve the canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

- Public acquisition, communications, integrations, AI, marketplace, reporting, and materials work must attach to the same canonical system.
- Communications must attach to operational context rather than become a disconnected inbox or chat product.
- Reporting and metrics must derive from canonical records rather than duplicate reporting truth.
- Automation must extend the canonical workflow chain through deterministic evidence, readiness awareness, and approval boundaries before autonomous behavior.
- Intelligence work must be canonical-first: no duplicate reporting truth, disconnected BI silo, manual metric-entry chain, or AI-only operational truth.
- GateKeeper communications, operational memory, workflow reinforcement, and AI assistance are future platform layers over canonical records, not standalone products.
- Dates, week counts, and early-build timing are intentionally omitted.

## Strategic Build Stack

Current recommended build-order discipline:

| Tier   | Focus                             |
| ------ | --------------------------------- |
| Tier 1 | Operational Core Completion       |
| Tier 2 | Scheduling And Communications     |
| Tier 3 | Reporting And Workflow Automation |
| Tier 4 | Intelligence Layer                |
| Tier 5 | Predictive AI                     |
| Tier 6 | Ecosystem And Marketplace         |

Use [docs/platform-build-registry.md](C:/FloorConnector/docs/platform-build-registry.md) as the living strategic coordination map for major planned systems, priorities, dependencies, maturity, status, and rationale. Use [docs/platform-maturity-model.md](C:/FloorConnector/docs/platform-maturity-model.md) to prevent foundation-level systems from being treated as ready for intelligence, predictive, or autonomous behavior too early.

## Feature Coverage Direction

FloorConnector should use Contractor Foreman as a baseline reference for common contractor-system coverage, not as the destination. The product should cover core contractor operating needs while going deeper for specialty flooring, resinous flooring, polished concrete, epoxy, coatings, and other surface contractors.

Future coverage decisions are tracked in:

- [docs/contractor-foreman-gap-decision-list.md](C:/FloorConnector/docs/contractor-foreman-gap-decision-list.md)
- [docs/future-feature-coverage-map.md](C:/FloorConnector/docs/future-feature-coverage-map.md)

Roadmap sequencing should account for these future areas without turning them into date promises:

- equipment management for tools, machines, vehicles, trailers, maintenance, utilization, job readiness, and costing, with the next maintenance/utilization path documented in [docs/equipment-maintenance-utilization-plan.md](C:/FloorConnector/docs/equipment-maintenance-utilization-plan.md)
- real clocking/time-card system before GPS verification, documented in [docs/clocking-system-plan.md](C:/FloorConnector/docs/clocking-system-plan.md)
- bid/RFP management connected to opportunities, estimates, subcontractors, documents, and communications
- subcontractor management through people, vendors, compliance, jobs, contracts, change orders, invoices, and documents
- service/warranty depth connected to original project, installed system/product, field evidence, time, materials, equipment, and billing context; the first internal `service_tickets` manager/detail foundation now exists, with deeper architecture documented in [docs/service-warranty-plan.md](C:/FloorConnector/docs/service-warranty-plan.md)
- service visit scheduling now begins on canonical jobs through optional `jobs.service_ticket_id`, keeping service/warranty visits on the existing Schedule, Job Workspace, crew, equipment-readiness, daily-log, and time foundations rather than a detached service calendar
- warranty document/PDF/signature lifecycle connected to project/job/customer history; the first warranty template, canonical warranty document, print/save, portal review/sign, delivery-evidence, and guarded provider-backed warranty email send foundations now exist, with callbacks, countersign, provider e-sign, stored versions, and broader document sends still planned in [docs/warranty-document-system-plan.md](C:/FloorConnector/docs/warranty-document-system-plan.md)
- weather-aware dashboard and schedule guidance, with human-confirmed schedule changes
- record-linked document, submittal, spec-sheet, photo, warranty, compliance, and closeout management
- procurement, materials, POs, bills/expenses, AP, job costing, and budget vs actual after canonical materials/financial inputs mature
- earned value later, after job costing, progress billing, production tracking, and budget inputs are reliable
- mobile/offline field UX later, after responsive web field workflows and sync boundaries are stable
- QuickBooks/accounting integration later, as sync/export from FloorConnector financial truth
- AI-assisted takeoff and workflow intelligence later, with human approval and no AI-only records

The field-operations connection map now lives in [docs/field-operations-architecture-map.md](C:/FloorConnector/docs/field-operations-architecture-map.md). The equipment depth layer is planned in [docs/equipment-management-plan.md](C:/FloorConnector/docs/equipment-management-plan.md), with maintenance/utilization/costing detail in [docs/equipment-maintenance-utilization-plan.md](C:/FloorConnector/docs/equipment-maintenance-utilization-plan.md). The registry and assignment/readiness foundations now exist; the intended next equipment sequence is maintenance, utilization, rental-return, and job-costing inputs. Equipment must remain attached to vendors, people, projects, jobs, schedule, time, warranty/service, documents, and future job costing.

## 1. Operational Core: Substantially Implemented

The operational core is already real on the current branch. Current-state owns the exact details, but the implemented foundation includes:

- Supabase-backed auth and tenancy
- opportunities/leads, customers, and projects
- estimates, line items, catalog-backed authoring, and approved snapshots
- contracts, portal signing, contractor onsite signing, and signature events
- change orders
- jobs, readiness gates, scheduling foundations, and field execution foundations
- invoices, invoice line items, payments, payment events, and portal payment foundations
- portal access and project-scoped customer surfaces
- people, vendors, compliance, time, daily logs, field notes, and execution attachments
- settings and super-admin foundations
- normalized contractor UI shell, Manager Pages, Quick-Create, and Record Workspace patterns
- CrewBoard Phase 1/2 on `/schedule`, including job-centered scheduling
  visibility, date/layout context, source-record handoffs, and advisory
  schedule warnings
- Project Workspace operating layers: ProjectPulse, FieldTrail, MessageCenter,
  CloseoutTrail, and Proof Center over existing canonical records
- Reports Phase 1 on `/reports` for read-only operations and collections
  visibility
- Send Trail Phase 1 on estimate, contract, and invoice source workspaces for
  existing document delivery proof visibility

This does not mean every surface is production-complete. It means the platform has a connected operating-system foundation rather than an unstarted product.

## 2. Workflow Tightening And Operational Entry Surfaces

Next maturity focus:

- strengthen project as the operational hub
- keep global Manager Pages as queues and work surfaces
- improve readiness, blockers, and next-best-action guidance
- deepen module dashboards without turning them into separate module apps
- continue context-aware creation and canonical full-workspace handoff
- preserve top-nav-first contractor shell and current UI baseline
- continue the customer/contact/access/review ownership cleanup in [docs/enterprise-ux-consolidation.md](C:/FloorConnector/docs/enterprise-ux-consolidation.md): People owns access management, Customer summarizes account context, Project owns operational state, and Portal stays customer-safe

## 3. Scheduling And Dispatch Expansion

Current status: Good-enough release on the canonical job/job-assignment foundation. CrewBoard Phase 1 and Phase 2 now exist on `/schedule`; remaining scheduling work should add depth rather than reframe scheduling as unbuilt.

Implemented good-enough scope:

- `/schedule` command-center summary for unscheduled, today, upcoming, in-progress, and blocked/not-ready work
- Ready work queue and Scheduled timeline over canonical jobs plus appointment read-model context
- selected job action panel for schedule/reschedule context and crew assignment
- project/job handoff query parameters into the schedule action panel where safe
- date navigation across day, week, and board layouts
- schedule-note previews and read-only schedule warnings for missing crew,
  missing end time, and overlapping same-day crew windows

Future depth:

- dispatch-grade schedule board/calendar behavior
- drag-and-drop rescheduling
- crew/resource coordination
- capacity and conflict detection
- route optimization where appropriate
- external calendar adapters after ownership/reconciliation boundaries are designed
- AI scheduling suggestions only with human approval for risky actions

Scheduling must stay on canonical jobs, appointments, and job assignments. Do not invent a disconnected dispatch subsystem.

## 4. Materials, Catalog, And Document Depth

Current status: Foundation.

Future depth:

- document generation, PDF/export controls, stored versions, and retrieval
  depth for estimates, contracts, invoices, warranties, closeout, and proof
  packages
- equipment/resource readiness on top of the implemented canonical equipment asset foundation, before assignment or schedule conflict logic expands further
- richer materials and inventory workflows
- purchasing, reservation, issue, return, and job material planning
- deeper reusable catalog/cost item management
- advanced System Templates, formulas, optional components, and versioning
- richer document-template and output controls
- shared file/evidence layer with multi-record links
- Takeoff & Scope Intelligence as project-scoped, human-reviewed estimate input

Catalog, materials, systems, takeoff, and documents must feed canonical estimates, contracts, jobs, invoices, and closeout evidence rather than become separate estimating or file silos. The founder-demo rehearsal path now lives in [docs/founder-demo-readiness.md](C:/FloorConnector/docs/founder-demo-readiness.md), the first prospect-facing script lives in [docs/founder-prospect-demo-script.md](C:/FloorConnector/docs/founder-prospect-demo-script.md), and the structured worksheet lives in [docs/founder-prospect-feedback.md](C:/FloorConnector/docs/founder-prospect-feedback.md). Use those docs to decide whether the next product slice should be estimate/catalog/materials depth, scheduling/dispatch depth, manager/mobile polish, import/export readiness, reporting/dashboard depth, live billing readiness controls, or onboarding/marketing polish after explicit release decisions.

## 5. Financial, Reporting, And Integration Expansion

Current status: Active core with foundation-level depth in several areas.

Implemented foundation now includes a read-only Financials Home plus Accounts
Receivable collections lens over canonical invoices, payments, and immutable
payment events. It adds aging, open receivable, pending checkout, and
failed/voided/in-progress event visibility without adding a duplicate ledger or
provider sync workflow. Invoice Workspace and Payments Manager now also include
read-only payment evidence and reconciliation visibility over the same canonical
`invoice -> payment -> payment_events` chain, with compact provider references
where already stored and no new reconciliation execution model.

Reports Phase 1 also exists at `/reports` as a read-only operations and
collections visibility workspace. It derives project, schedule, crew,
signature, receivable, payment, field, closeout, and proof attention from
existing source records only and routes users back to canonical workspaces.

Future depth:

- reporting depth beyond the first operations/collections lens, including
  richer report filters, exports, forms, and eventually analytics once source
  data is mature
- export-first data portability is now started through `/settings/export`, with small metadata-only export history, validation-only customer/contact CSV import dry run, tenant-scoped saved import review batches, and a read-only batch review shell; future import/write depth should build on editable row decisions, create/link-only first phase, dedicated audit, rollback, duplicate resolution, backups, and explicit approval rather than raw database imports
- AIA/progress billing UX, exports, and draw-management depth
- deeper payment reconciliation execution beyond read-only event visibility, retries, refunds, disputes, and provider sync
- subscription/billing governance only after explicit security and release gates
- paid early-access infrastructure should follow [docs/paid-early-access-plan.md](C:/FloorConnector/docs/paid-early-access-plan.md); the current Phase 2.5 foundation covers founder setup/activation visibility, platform-admin-entered billing evidence, a durable `/super-admin/billing` Billing Operations console, test-mode-only Product/recurring Price setup, a test-mode-only FloorConnector SaaS subscription Checkout Session bridge, and signed SaaS-only webhook reconciliation, while live Stripe Billing launch, entitlement enforcement, public self-serve launch, Customer Portal, and live provider mutation remain separate approved phases
- live SaaS billing launch policy should follow [docs/saas-billing-live-launch-plan.md](C:/FloorConnector/docs/saas-billing-live-launch-plan.md) before any live Stripe resource creation, Customer Portal work, dunning/cancellation automation, entitlement enforcement, waiver controls, or production release gate implementation; the next safe implementation slice is read-only live-mode readiness indicators, not live provider mutation
- external e-sign provider integration on canonical contracts
- tax and accounting adapters
- package/billing governance beyond current read-only foundations

Financial work must preserve canonical invoices, payments, line-item lineage, approved snapshots, and append-only/effectively immutable event history.

## 6. Communications, Automation, And AI Assistance

Current status: Foundation for communications/notifications and a closed deterministic Operational Intelligence / Intelligent Follow-Up foundation; GateKeeper and broad AI remain planned.

Strategic references:

- [docs/communications-layer.md](C:/FloorConnector/docs/communications-layer.md)
- [docs/reporting-and-metrics.md](C:/FloorConnector/docs/reporting-and-metrics.md)
- [docs/automation-layer.md](C:/FloorConnector/docs/automation-layer.md)

Planning reference: [docs/ai/intelligent-follow-up-engine.md](C:/FloorConnector/docs/ai/intelligent-follow-up-engine.md) defines the follow-up intelligence model, starting from deterministic evidence-backed cues over canonical records before AI summaries, drafts, or controlled automation.

GateKeeper doctrine lives in [docs/gatekeeper-system-vision.md](C:/FloorConnector/docs/gatekeeper-system-vision.md). It frames the future communications, operational memory, workflow reinforcement, human approval queue, voice, success, and multi-agent direction as one system layer over the canonical lifecycle. It is planning direction only and does not mean voice AI, unified inbox, autonomous agents, operational health scores, or predictive intelligence are implemented.

Implemented deterministic foundation:

- operational cue derivation from canonical estimates, contracts, invoices, jobs, projects, and organization rule settings
- record and project workspace cue surfaces with safe canonical workflow routing
- user-confirmed work-item prefill for approved cue contexts only
- user-scoped dismiss/snooze through `workflow_cue_states`
- admin-facing built-in cue-rule guidance at `/settings/operational-intelligence`
- dashboard awareness surfaces without cue mutation controls

Deferred:

- company-scoped cue resolve or mark-handled
- dashboard dismiss/snooze controls
- AI summaries and draft assistance
- autonomous or provider-backed AI actions
- controlled automation beyond existing guarded notification-only foundations

Future depth:

- GateKeeper operational memory foundation: communication timelines, transcript/summary linkage, task extraction, workflow extraction, and human review queues over canonical records
- provider-backed customer messaging and delivery proof
- broader unified communications across website, email, SMS, portal, app, manual logs, calls, and voice where scoped
- manual and later controlled automation over canonical records
- canonical reporting and metrics that explain operational, financial, sales, production, labor, workflow timing, readiness, and communication signals
- AI drafting, summaries, classification, scheduling suggestions, project summaries, collections assistance, onboarding help, and support triage
- human approval queues for customer-facing, commercial, legal, billing, scheduling, permission, or compliance actions

Communications must stay workflow-connected, reporting must stay canonical-record-derived, and automation must stay deterministic and approval-aware before predictive or autonomous behavior. AI is an operating layer over canonical records, not a parallel system with its own business truth.

## 7. Intelligence Layer

Current status: Planned, with communications continuity, canonical reporting/metrics, deterministic operational-cue foundations, and automation governance as prerequisites.

Strategic reference: [docs/intelligence-layer.md](C:/FloorConnector/docs/intelligence-layer.md).

Future direction:

- tenant-scoped Contractor Intelligence over canonical records
- opt-in anonymized Network Intelligence after privacy and benchmark governance are explicit
- predictive and AI intelligence after clean operational telemetry exists
- workflow-aware recommendations that route to existing Manager Pages, Record Workspaces, or approved actions
- explainable metrics that can be traced back to canonical workflow evidence

This is not a separate reporting module. Intelligence must derive from the same lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Do not add a separate BI source of truth, duplicate metric-entry workflow, AI-only data chain, or cross-tenant benchmarking behavior before opt-in, aggregation, authorization, and privacy rules are designed.

## 8. Ecosystem And Marketplace Expansion

Current status: Planned / Deferred.

Future direction:

- contractor-owned websites and public acquisition surfaces
- marketing/lead capture depth
- review/reputation/testimonial/gallery workflows
- distributor/manufacturer/product ecosystems
- scoped subcontractor/vendor/partner collaboration
- invite-based networked work before any broader marketplace behavior
- controlled marketplace behavior only after permissions, compliance, ownership, and tenant isolation are designed
- Contractor Collaboration Network / Trusted Contractor Network planning for
  approved partner relationships, Certified FloorConnector Service Providers,
  and project/job-scoped collaboration grants after operational core,
  scheduling, communications, reporting, automation, permissions/RLS, and
  compliance readiness are mature

These layers must reinforce the same lifecycle and must not create a second CRM, website database, marketplace truth, or AI memory system.

The contractor collaboration network is a later ecosystem/platform expansion,
not a near-term implementation priority. It must remain canonical-record-safe:
no duplicate jobs/projects, no public bidding exchange, no lead resale, and no
external partner financial mutation by default. See
[docs/contractor-collaboration-network.md](C:/FloorConnector/docs/contractor-collaboration-network.md).

## Cross-Cutting Governance

Every future roadmap item must consider:

- [docs/documentation-standards.md](C:/FloorConnector/docs/documentation-standards.md)
- [docs/architecture-principles.md](C:/FloorConnector/docs/architecture-principles.md)
- [docs/canonical-lifecycle.md](C:/FloorConnector/docs/canonical-lifecycle.md)
- [docs/adr/README.md](C:/FloorConnector/docs/adr/README.md)
- [docs/diagrams/README.md](C:/FloorConnector/docs/diagrams/README.md)
- [docs/ai/README.md](C:/FloorConnector/docs/ai/README.md)

Architecture-impacting roadmap changes should create or update ADRs and diagrams in the same change set.
