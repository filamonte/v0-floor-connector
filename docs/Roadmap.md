# FloorConnector Roadmap

Status: Active
Doc Type: Roadmap

This roadmap frames FloorConnector around platform maturity, not early startup build timing. It is sequencing guidance only.

For implemented truth, use [docs/current-state.md](C:/FloorConnector/docs/current-state.md). For the founder/product-owner build list, immediate build order, and horizon-based completion timeline, use [docs/floorconnector-build-list-and-completion-timeline.md](C:/FloorConnector/docs/floorconnector-build-list-and-completion-timeline.md). For concise maturity status, use [docs/platform-maturity.md](C:/FloorConnector/docs/platform-maturity.md), [docs/module-status.md](C:/FloorConnector/docs/module-status.md), and [docs/known-gaps.md](C:/FloorConnector/docs/known-gaps.md). For strategic sequencing, use [docs/platform-build-registry.md](C:/FloorConnector/docs/platform-build-registry.md) and [docs/platform-maturity-model.md](C:/FloorConnector/docs/platform-maturity-model.md). For strategic layer doctrine, use [docs/communications-layer.md](C:/FloorConnector/docs/communications-layer.md), [docs/reporting-and-metrics.md](C:/FloorConnector/docs/reporting-and-metrics.md), [docs/automation-layer.md](C:/FloorConnector/docs/automation-layer.md), [docs/intelligence-layer.md](C:/FloorConnector/docs/intelligence-layer.md), [docs/agentic-operations-layer.md](C:/FloorConnector/docs/agentic-operations-layer.md), and [docs/contractor-success-platform.md](C:/FloorConnector/docs/contractor-success-platform.md).

For program-level execution planning, use
[docs/program-architecture.md](C:/FloorConnector/docs/program-architecture.md).
Roadmap items should now be framed as Capability -> Program -> Wave -> Stream
-> PR -> Verification -> Merge when they become governed delivery candidates.

For capability maturity, use
[docs/capability-registry.md](C:/FloorConnector/docs/capability-registry.md).
For strategic Capability -> Program -> Wave -> Stream navigation, use
[docs/capability-map.md](C:/FloorConnector/docs/capability-map.md).
For documentation authority and navigation, use
[docs/document-map.md](C:/FloorConnector/docs/document-map.md). Roadmap
sequencing does not replace capability maturity scores or implemented truth.

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
- The long-term Specialty Contractor Success Platform vision is future-only
  direction. Contractor technology services, maturity-model tooling, and
  managed offerings must not become disconnected service silos or near-term
  scope by implication.
- Dates, week counts, and early-build timing are intentionally omitted.

## Strategic Build Stack

Current recommended build-order discipline:

| Tier   | Focus                                         |
| ------ | --------------------------------------------- |
| Tier 1 | Operational Core Completion                   |
| Tier 2 | Scheduling And Communications                 |
| Tier 3 | Reporting And Workflow Automation             |
| Tier 4 | Intelligence Layer                            |
| Tier 5 | Predictive AI And Agentic Assistance          |
| Tier 6 | Governed Autonomy, Ecosystem, And Marketplace |

## Strategic Programs

The current Program portfolio organizes major multi-wave initiatives without
claiming implementation or authorizing streams:

| Program | Focus                       | Roadmap relationship                                                                       |
| ------- | --------------------------- | ------------------------------------------------------------------------------------------ |
| A       | Assessment Intelligence     | Deepens pre-estimate assessment, project capture, and estimator handoff capability.        |
| B       | Operational Work Management | Deepens accountability, work ownership, labor visibility, and cross-role execution.        |
| C       | Communications OS           | Deepens record-linked communication continuity, follow-up, and future provider/AI support. |
| D       | Field OS                    | Deepens mobile field execution, field packets, closeout proof, and crew workflows.         |

Program planning does not override roadmap principles, current-state truth, or
the wave/stream approval gate. Capability maturity is tracked in
[docs/capability-registry.md](C:/FloorConnector/docs/capability-registry.md);
Program, Wave, Stream, PR, and commit counts are activity measures, not success
metrics. Each Program may produce multiple waves, and each wave must still
preserve the canonical lifecycle and operational command center model.

Use [docs/platform-build-registry.md](C:/FloorConnector/docs/platform-build-registry.md) as the living strategic coordination map for major planned systems, priorities, dependencies, maturity, status, and rationale. Use [docs/platform-maturity-model.md](C:/FloorConnector/docs/platform-maturity-model.md) to prevent foundation-level systems from being treated as ready for intelligence, predictive, or autonomous behavior too early.

Use [docs/floorconnector-build-list-and-completion-timeline.md](C:/FloorConnector/docs/floorconnector-build-list-and-completion-timeline.md)
when a prompt needs the complete product-area build list, realistic completion
horizons, and next 10-15 build slices. Its current sequencing keeps Phase 0 as
source-of-truth cleanup, Phase 1 as operational core completion, Phase 2 as
scheduling/communications/reporting density, Phase 3 as portal/mobile/financial
depth, Phase 4 as integrations and automation maturity, Phase 5 as AI/growth
platform work, and Phase 6 as ecosystem/network planning.

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
- context-rich Work Items now have a first internal implementation over the
  existing `work_items` foundation: project/job/customer context, instructions,
  measurement notes, assignee, due/overdue, priority, and status render in
  shared work-item surfaces without a disconnected task app. Work Item Photo /
  Evidence Attachment Support now extends `execution_attachments` with
  internal `work_item` subjects so current-condition photos/files and
  completion evidence can stay attached to the assignment through the private
  documents bucket and signed contractor previews. Mobile Assignee Work Item
  View v1 now adds `/field/work-items` as a linked-person field queue with
  detail pages for instructions, measurement notes, internal evidence previews,
  safe field-state metadata, and completion notes without source-record or
  portal mutation. Sales Handoff / Estimate Work Queue V1 now reuses the same
  Work Item foundation for opportunity-linked estimate handoff items and pure
  estimate-work queue selectors without schema, estimate mutation, customer
  sends, or commission calculation; see
  [docs/design/sales-handoff-estimate-work-queue-v1.md](C:/FloorConnector/docs/design/sales-handoff-estimate-work-queue-v1.md).
  Comments, richer statuses, assignee-side uploads, reminders,
  portal-safe sharing, and audited commission ownership remain future depth documented in
  [docs/design/context-rich-work-items-and-assignments.md](C:/FloorConnector/docs/design/context-rich-work-items-and-assignments.md)
- Universal Capture + Assistant Action Layer as future operational continuity
  infrastructure: users should eventually capture callbacks, reminders,
  follow-ups, site-visit intent, estimate scheduling needs, and route/geographic
  grouping intent from anywhere, then attach that intent to canonical
  customers, opportunities, projects, jobs, work items, communications, and
  schedule context where possible. This is not implemented and must not become
  a disconnected task app, duplicate customer/project/opportunity model, or
  autonomous customer-facing assistant. Manual capture model design lives in
  [docs/design/universal-capture-model-design.md](C:/FloorConnector/docs/design/universal-capture-model-design.md),
  and the planned quick-capture interaction model lives in
  [docs/design/universal-capture-ui-blueprint.md](C:/FloorConnector/docs/design/universal-capture-ui-blueprint.md)
- QuickBooks/accounting integration later, as sync/export from FloorConnector financial truth
- AI-assisted takeoff and workflow intelligence later, with human approval and no AI-only records
- Guided Project Capture and project-owned Assessment Packages before estimate
  creation, with customer mobile web capture before native applications

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
- mobile-first field execution polish on the existing Daily Log / Job Note /
  field evidence chain, including clearer blocker/issue scanning and project/job
  handoffs without new field subsystems
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

Current status: Good-enough release on the canonical job/job-assignment foundation. CrewBoard now exists on `/schedule` with daily/weekly operating-board depth; remaining scheduling work should add dispatch depth rather than reframe scheduling as unbuilt.

Implemented good-enough scope:

- `/schedule` command-center summary for ready-to-schedule, today, tomorrow,
  this-week, in-progress, missing-crew, and blocked/not-ready work
- reusable schedule board read model for canonical job operating queues,
  grouped timing lanes, crew assignment gaps, and schedule readiness review
- Ready work queue and Scheduled timeline over canonical jobs plus appointment read-model context
- selected job action panel for schedule/reschedule context and crew assignment
- project/job handoff query parameters into the schedule action panel where safe
- date navigation across day, week, and board layouts
- schedule-note previews and read-only schedule warnings for missing crew,
  missing end time, and overlapping same-day crew windows
- confirmed manual/keyboard `Move schedule` review flow through the existing
  schedule action

Current planning checkpoint:

- pointer drag/drop remains planned as a progressive enhancement only. The
  recommended next slice is proposed-move/drop-target state with no package,
  followed by `@dnd-kit/core` only if actual pointer drag/drop is approved.
  Dropping a card should open confirmation and must not mutate schedule data.

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

Current status: Foundation. A first contractor-side Document Readiness summary
now exists on Estimate, Contract, and Invoice Workspaces to clarify whether the
current canonical record is ready for preview, review/signature/payment request,
or needs missing context before delivery. Stored PDF/version management,
provider retry lifecycle, and a broad document manager remain future depth.

Future depth:

- document generation, PDF/export controls, stored versions, and retrieval
  depth for estimates, contracts, invoices, warranties, closeout, and proof
  packages
- Company Documents / Document Library now has Phase 1A schema/settings, Phase
  1B contractor detail and browser print/save, and a Phase 1C Starter Documents
  adoption plan. Future depth should add Starter Documents, versioning, storage,
  or acknowledgements as separate approved slices and must not overload current
  estimate/contract/invoice/warranty template categories.
- equipment/resource readiness on top of the implemented canonical equipment asset foundation, before assignment or schedule conflict logic expands further
- richer materials and inventory workflows
- purchasing, reservation, issue, return, and job material planning
- deeper reusable catalog/cost item management
- advanced System Templates, formulas, optional components, and versioning
- richer document-template and output controls
- shared file/evidence layer with multi-record links
- Takeoff & Scope Intelligence as project-scoped, human-reviewed estimate input
- Guided Project Capture as a project-scoped pre-estimate workflow for
  Assessment Packages, Area / Space Modeling, customer mobile web capture,
  qualification signals, financing interest, confidence scoring, and
  human-reviewed AI observations

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

Current status: Foundation for communications/notifications, a closed
deterministic Operational Intelligence / Intelligent Follow-Up foundation, and
the first AI Operational Copilot Foundation. GateKeeper and broad autonomous AI
remain planned.

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
- AI Operational Copilot deterministic summary helpers and Project Workspace
  panel deriving review-first project intelligence, recommended next actions,
  communication-assistance draft text, and field summaries from ProjectPulse,
  Ready Check, FieldTrail, MessageCenter, and CloseoutTrail; dashboard digest
  rollup and organization-level AI controls now exist, with provider-ready
  deterministic fallback but no live provider calls, persisted AI records, or
  autonomous mutation

Deferred:

- company-scoped cue resolve or mark-handled
- dashboard dismiss/snooze controls
- live provider-backed AI summaries and draft assistance through the existing
  internal provider facade
- autonomous or provider-backed AI actions
- controlled automation beyond existing guarded notification-only foundations

Future depth:

- Universal Capture + Assistant Action Layer over Quick-Create, Work Items,
  communications, scheduling, and project/customer/opportunity continuity. The
  manual path should create or prepare canonical records from lightweight
  intent; the assistant path may find/link records, suggest site visits or
  grouped estimate windows, draft communication, and prepare actions, but it
  must require contractor confirmation before external sends, bookings, or
  customer-facing commitments. Start from
  [docs/design/universal-capture-model-design.md](C:/FloorConnector/docs/design/universal-capture-model-design.md)
  and
  [docs/design/universal-capture-ui-blueprint.md](C:/FloorConnector/docs/design/universal-capture-ui-blueprint.md)
  before any build slice.
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

## 8. Agentic Operations Layer

Current status: Target strategic direction only. Full autonomous or agentic AI
operations are not implemented.

Strategic reference: [docs/agentic-operations-layer.md](C:/FloorConnector/docs/agentic-operations-layer.md).

Agentic operations is a later-stage roadmap direction after operational core,
scheduling, communications, automation, reporting, and integration foundations
are mature enough to support governed action. Initial AI should begin as
guidance, drafting, summarization, explanation, and recommendation around
canonical evidence. AI-assisted actions should require human approval before
they affect customer communications, pricing, contracts, billing, payments,
scheduling, permissions, legal state, or compliance.

Long-term governed autonomy may eventually coordinate intake, scheduling,
communications, collections, field documentation, reporting, and admin work,
but only through canonical records, server-owned actions, permissions,
workflow state, events, and audit logs.

AI must not become a disconnected chatbot, AI-only CRM, second workflow engine,
payment replacement, accounting replacement, or separate operational memory
store. It must extend the same lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## 9. Ecosystem And Marketplace Expansion

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

## 10. Specialty Contractor Success Platform

Current status: Long-term platform vision only.

Strategic reference: [docs/contractor-success-platform.md](C:/FloorConnector/docs/contractor-success-platform.md).

Future direction:

- help contractors mature from paper, spreadsheet, and email-driven operations
  into digitized, connected, managed, and intelligent businesses
- expand communications into workflow-connected intake, classification, work
  item creation, and project continuity instead of a detached inbox
- consider contractor technology services such as workspace integration, email
  and domain provisioning assistance, websites, SEO, VoIP, SMS, AI
  receptionist, MDM, fleet, camera/security, hardware, consulting, onboarding,
  and training only where they strengthen contractor success
- keep future revenue layers optional and long-term: software subscriptions,
  communications services, AI services, onboarding/training, technology setup,
  workspace provisioning, website services, phone services, and future managed
  offerings

This is not a near-term implementation roadmap. It does not authorize provider
integrations, managed services, infrastructure, schema, packages, routes, APIs,
or business-model changes without a separate approved slice.

## Long-Term Roadmap Horizon

Near-term horizon:

- project continuity
- scheduling
- communications hub
- workflow automation
- operational visibility

Mid-term horizon:

- communication integrations
- Google Workspace integration
- voice intake
- contractor technology integrations

Long-term horizon:

- contractor success platform
- technology services ecosystem
- maturity model tooling
- intelligent contractor platform

## Cross-Cutting Governance

Every future roadmap item must consider:

- [docs/documentation-standards.md](C:/FloorConnector/docs/documentation-standards.md)
- [docs/architecture-principles.md](C:/FloorConnector/docs/architecture-principles.md)
- [docs/canonical-lifecycle.md](C:/FloorConnector/docs/canonical-lifecycle.md)
- [docs/adr/README.md](C:/FloorConnector/docs/adr/README.md)
- [docs/diagrams/README.md](C:/FloorConnector/docs/diagrams/README.md)
- [docs/ai/README.md](C:/FloorConnector/docs/ai/README.md)

Architecture-impacting roadmap changes should create or update ADRs and diagrams in the same change set.
