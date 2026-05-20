# Future Feature Coverage Map

Status: Active
Doc Type: Roadmap / Product Direction

This document is a broad product coverage map for future AI/Codex sessions. It exists so major contractor operating needs are not lost while keeping [docs/current-state.md](C:/FloorConnector/docs/current-state.md) focused on implemented truth.

This is not a status claim. For current implementation status, use [docs/current-state.md](C:/FloorConnector/docs/current-state.md), [docs/module-status.md](C:/FloorConnector/docs/module-status.md), [docs/known-gaps.md](C:/FloorConnector/docs/known-gaps.md), and [docs/floorconnector-full-capability-audit.md](C:/FloorConnector/docs/floorconnector-full-capability-audit.md).

Canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Coverage Principles

- Contractor Foreman is a baseline reference for expected contractor-system breadth, not FloorConnector's destination.
- FloorConnector should cover core contractor operations and go deeper for specialty flooring, coatings, polishing, resinous flooring, and surface-prep contractors.
- Future workflow stages extend canonical records instead of creating module-local silos.
- Financial, signature, payment, field, document, equipment, procurement, warranty, and AI layers attach to the same shared record chain.
- Data should be entered once and flow forward.
- AI is an operating layer over canonical records, not a separate system.
- Tasks and follow-ups should be tied to records, modules, or business functions, not a detached generic to-do silo.

## Sales / CRM / Bid Management

Current state summary: Opportunities/leads, intake, appointments, customer/project handoff, and estimate handoff are implemented foundations.

Target direction: Add bid/RFP management for commercial contractors: bid packages, scopes, invitations, responses, subcontractor/vendor context, bid documents, communications, and estimate handoff.

Must-preserve data philosophy: Bid work must attach to opportunities, customers, projects, estimates, vendors/subcontractors, documents, and communications.

Recommended next slices: Bid/RFP planning doc; bid package data model review; opportunity-to-bid-to-estimate UX map.

Not-now / deferred: Detached bid tracker, separate CRM, autonomous AI bid acceptance.

## Project / Operational Hub

Current state summary: Project Workspace is the implemented continuity hub with readiness, connected lanes, and operational command-center context.

Target direction: Deepen project memory with activity, evidence, documents, equipment, materials, warranty, service, inspections, punchlists, and job costing context.

Must-preserve data philosophy: Project coordinates the work but does not replace estimates, contracts, jobs, invoices, payments, or specialized event records.

Recommended next slices: Project activity/evidence map; project service/warranty continuity slice; project materials/equipment readiness slice.

Not-now / deferred: Project-owned duplicate balances, copied child records, or a separate project-only workflow engine.

## Estimates / Takeoff / Catalogs / Systems

Current state summary: Catalog-first estimate authoring, line items, reusable system foundations, manual measurement generation, and approved snapshots exist.

Target direction: Add flooring-specific takeoff, plan storage, measurement extraction, system templates, product/spec context, AI-assisted takeoff, and estimate quantity generation with contractor approval.

Must-preserve data philosophy: Takeoff creates reviewable quantity inputs that feed canonical estimates and catalog/system items; it does not own pricing or create a second estimate truth.

Recommended next slices: Takeoff architecture plan; plan/document storage boundaries; system template generation hardening; source-traceable estimate line origin.

Not-now / deferred: Direct AI-to-customer estimate, direct takeoff-to-invoice, or live-linked estimate pricing that mutates approved snapshots.

## Contracts / Change Orders

Current state summary: Contracts, signature workflow, signature events, portal review/signing, change orders, portal approval, and commercial snapshots exist.

Target direction: Add external e-sign provider adapters, deeper change-order operational clarity, subcontractor contract/subcontract support, and delivery proof.

Must-preserve data philosophy: Signature and approval events extend canonical contract/change-order records; provider systems do not become source of truth.

Recommended next slices: External e-sign adapter plan; change-order workspace maturity; subcontract contract boundary plan.

Not-now / deferred: Separate signed-document model, provider-owned signature truth, portal-only contract copies.

## Scheduling / Dispatch / Weather

Current state summary: `/schedule` is a good-enough command center over canonical jobs and job assignments, with readiness and crew-assignment foundations. Daily logs have weather snapshot fields. Equipment assignment/readiness foundation is now implemented as advisory Job/Schedule/Project/Dashboard equipment warnings; deeper dispatch-grade equipment capacity remains future work.

Target direction: Add dispatch-grade scheduling, broader conflict/capacity checks, equipment/resource availability, weather-aware guidance, route optimization later, and human-confirmed schedule changes.

Must-preserve data philosophy: Schedule extends canonical jobs, appointments, people, assignments, equipment, and project readiness.

Recommended next slices: weather-aware schedule guidance plan; dispatch board/capacity planning slice; richer equipment capacity planning only after current warning behavior is stable.

Not-now / deferred: Auto-rescheduling without human confirmation, AI-only calendar, disconnected dispatch model.

## Field / Daily Logs / Inspections / Punchlists

Current state summary: Jobs, daily logs, field notes, time summaries, execution attachments, punchlist foundations, and schedule handoffs exist.

Target direction: Add flooring-specific inspections/checklists for substrate condition, moisture testing, prep, QC, final walkthrough, safety, punch, warranty/service inspection, and closeout.

Must-preserve data philosophy: Field evidence attaches to projects, jobs, daily logs, field notes, photos, warranty, and readiness.

Recommended next slices: Flooring inspection/checklist taxonomy; punchlist closeout UX; field evidence/document linkage plan.

Not-now / deferred: Generic form-builder-first approach before flooring workflows are clear.

## Time / Workforce / Subcontractors

Current state summary: People, vendors, compliance, time punch events, time cards, and job assignments exist. `/time` now provides a clocking center with project/job attribution before clock-in, optional service/warranty ticket attribution, state-aware clock-in/start-break/end-break/clock-out actions, current session visibility, recent punch-event audit visibility, crew clock-in, derived exception queues, and derived time-card review visibility. Time Card Workspace supports manager approve/reject review state without replacing punch events. Manager pages use focused read models.

Target direction: Mature time tracking into real clocking/time cards, subcontractor company and worker management, compliance, assignments, bid invites, project access, downstream billing, and payroll/export/reporting later.

Must-preserve data philosophy: Subcontractors extend people/vendors/compliance/jobs/projects/contracts/change orders/invoices/documents; time remains canonical through people, jobs, projects, punch events, and time cards.

Recommended next slices: The clocking/time-card architecture now lives in [docs/clocking-system-plan.md](C:/FloorConnector/docs/clocking-system-plan.md). The next clocking slice should add explicit admin correction events/UI, crew break/clock-out bulk actions, overtime/pay-period review, and deeper manager queues before GPS, payroll export, or job costing. Subcontractor management model review and compliance renewal queues remain separate follow-ups.

Not-now / deferred: GPS verification before clocking basics; parallel subcontractor identity system.

## Equipment / Assets / Maintenance

Current state summary: The equipment registry foundation is implemented through tenant-scoped `equipment_assets`, `/equipment`, and `/equipment/:id`. It tracks asset identity, ownership/rental status, optional vendor linkage, operational status, purchase/rental fields, notes, and active state. The first assignment/readiness foundation is implemented through `job_equipment_requirements`, `equipment_assignments`, Job Workspace equipment forms/warnings, Schedule selected-job warnings, Project Workspace summary warnings, Dashboard Operational Cockpit read-only warnings, and Equipment Detail recent assignment visibility. Maintenance, utilization, job costing, procurement/AP, portal visibility, warranty/service behavior, AI automation, autonomous rescheduling, dashboard-owned equipment cue state, and hard equipment readiness blocks are not implemented. The broader planning architecture lives in [docs/equipment-management-plan.md](C:/FloorConnector/docs/equipment-management-plan.md), and the assignment/readiness architecture lives in [docs/equipment-assignment-readiness-plan.md](C:/FloorConnector/docs/equipment-assignment-readiness-plan.md).

Target direction: Track owned/rented equipment, grinders, vacs, polishers, sprayers, vehicles, trailers, tooling, assignments, maintenance, utilization, job readiness, rental windows, documents, and service history.

Must-preserve data philosophy: Equipment attaches to vendors, people, jobs, projects, schedule, time, maintenance/compliance, warranty/service, and job costing.

Recommended next slices: Maintenance/utilization/costing input architecture now lives in [docs/equipment-maintenance-utilization-plan.md](C:/FloorConnector/docs/equipment-maintenance-utilization-plan.md). The next equipment depth slice should add maintenance records, downtime/rental-return handling, and usage-entry foundations after assignment rules are stable. Protected browser smoke for Job/Schedule/Project/Dashboard equipment warning fixtures remains useful when stable data exists; dashboard-owned acknowledgement/cue-state rules should wait for explicit design.

Not-now / deferred: Standalone asset silo or equipment accounting before operational readiness is defined.

## Materials / Procurement / Inventory / POs

Current state summary: `catalog_items`, inventory foundations, materials route alias, system components, and estimate sourcing exist; purchasing, reservations, and job material planning remain gaps.

Target direction: Add materials planning, inventory reservation/issue/return, POs, vendor ordering, receiving, supplier continuity, documents, and job costing.

Must-preserve data philosophy: Procurement attaches to vendors, projects, jobs, estimates, materials, equipment where relevant, invoices/bills, and job costing.

Recommended next slices: Materials/procurement workflow plan; PO boundary plan; job material reservation slice.

Not-now / deferred: Supplier marketplace before core purchasing and job-material lineage.

## Financials / Invoices / Payments / Bills / Job Costing / Earned Value

Current state summary: Invoices, payments, payment events, retainage fields, SOV/progress billing foundations, financial manager pages, and payment read models exist. AP/bills and full job costing are not built.

Target direction: Add bills/expenses/AP, budget vs actual, job costing, production/cost reporting, retainage release depth, and earned value later.

Must-preserve data philosophy: Canonical invoices and payments remain financial truth; job costing derives from estimate snapshots, labor time, materials, equipment, POs, bills/expenses, change orders, invoices, payments, and progress billing.

Recommended next slices: Job costing input map; AP/bills plan; progress billing tests and UX clarity; accounting export plan.

Not-now / deferred: Earned value before inputs mature; accounting integration that replaces FloorConnector financial truth.

## Documents / Submittals / Spec Sheets / Photos / Files

Current state summary: Document templates, shared storage bucket, estimate attachments, contract snapshots, print/save views, and execution attachments exist as foundations.

Target direction: Build centralized record-linked document management for financials, system sheets, submittals, product/spec sheets, estimate attachments, contracts, invoices, photos, warranties, compliance, and project documents.

Must-preserve data philosophy: Documents attach to canonical records and can be linked across contexts; document management is not a Dropbox clone.

Recommended next slices: Document management architecture; submittal/spec packet workflow; multi-record file/evidence model.

Not-now / deferred: Disconnected file islands or document records that compete with canonical contracts/invoices/estimates.

## Service / Warranty

Current state summary: The first internal service/warranty continuity foundation is implemented through tenant-scoped `service_tickets`, `/service-tickets`, and `/service-tickets/:id`. It supports canonical customer, optional project, and optional original job linkage; source/type/status/priority classification; warranty dates/basis; description/resolution notes; manager/admin/owner mutation; active-member read access; and same-company relationship validation. Warranty document foundation is now implemented through warranty `document_templates`, default platform warranty seed adoption, tenant-owned warranty template editing in `/settings/templates`, canonical `warranty_documents`, `/warranty-documents/:id`, and `/warranty-documents/:id/print`. Generic signature groundwork now exists through `document_signers` and immutable `document_signature_events`, constrained to `warranty_document` subjects only, and Warranty Document detail now supports internal signer management plus request-signature audit events. Project, Customer, and Job Workspaces now show compact read-only continuity panels for linked service tickets, warranty documents, warranty date ranges, signer/request/signed counts, latest signature event summary, and links back to canonical records. Service/warranty time now uses the canonical clocking foundation through optional `service_ticket_id` attribution on punch events and derived time cards, with Service Ticket detail showing linked time and routing to `/time` for capture. Portal requests, outbound sends, portal signatures, service visit scheduling, billing/manufacturer claims, job-costing mutation, and equipment/material usage automation remain future work.

Target direction: Manage individual job warranties, service tickets, warranty time, service visits, field notes, photos, materials, equipment, installed system/product context, and warranty status.

Must-preserve data philosophy: Warranty connects to the original project, customer, job, invoice/payment, installed product/system, daily logs, field notes, materials, equipment, and time.

Recommended next slices: Service/warranty architecture now lives in [docs/service-warranty-plan.md](C:/FloorConnector/docs/service-warranty-plan.md). Warranty document/signature architecture now lives in [docs/warranty-document-system-plan.md](C:/FloorConnector/docs/warranty-document-system-plan.md), with generalized send/signature findings in [docs/document-send-signature-architecture.md](C:/FloorConnector/docs/document-send-signature-architecture.md). Next, add service ticket scheduling/service visit workflow on the canonical schedule/job foundation, then plan customer portal warranty review/signing after scoped portal access and delivery-proof rules are designed.

Not-now / deferred: Detached helpdesk or customer support system outside the project chain.

## Communications / Delivery Proof

Current state summary: Communication threads/messages, notifications, safe reply, notification deliveries, and delivery-related foundations exist.

Target direction: Record-tied communications and delivery proof across project, estimate, contract, invoice, job, daily log, change order, service/warranty, document request, email, SMS, portal, app, and manual logs.

Must-preserve data philosophy: Delivery/audit logging is platform-level evidence attached to canonical records, not provider-only telemetry.

Recommended next slices: Delivery-proof architecture; record-tied communication workflows; provider adapter boundaries.

Not-now / deferred: Free-floating inbox disconnected from records.

## Portal / Customer Experience

Current state summary: Portal access, project visibility, estimate/contract/change-order/invoice review, contract signing, and payment initiation/completion foundations exist.

Target direction: Add richer customer-safe project status, documents, service/warranty, communication, quote request, and closeout experiences without creating portal-only records.

Must-preserve data philosophy: Portal constrains visibility over shared records. It does not redefine customer, project, commercial, signature, payment, or warranty truth.

Recommended next slices: Customer document center plan; portal service/warranty review plan; portal communication scope.

Not-now / deferred: Customer-admin self-service before permissions and contact ownership are ready.

## Reporting / Analytics

Current state summary: Dashboard, financial surfaces, reports route, Sales Tax Summary foundation, and read-model performance improvements exist.

Target direction: Guided operational reports for collections, production, profitability, tax, crew productivity, conversion, project health, job costing, equipment utilization, warranty, and materials.

Must-preserve data philosophy: Reports read canonical records; dashboards and reports do not own business truth.

Recommended next slices: First guided job-costing report plan; collections report; production/labor utilization report.

Not-now / deferred: Generic drag-and-drop report builder before canonical report definitions.

## Integrations

Current state summary: Supabase is core, Stripe payment/SaaS foundations exist, integration package boundaries exist, and broader providers are future.

Target direction: Add QuickBooks/accounting later, external e-sign, tax, email/SMS, calendar, file/photo providers, supplier integrations, and payment reconciliation through adapters.

Must-preserve data philosophy: Providers enrich, sync, or deliver; FloorConnector canonical records remain source of truth.

Recommended next slices: QuickBooks export/sync plan; e-sign provider adapter plan; calendar sync boundary plan.

Not-now / deferred: Live provider mutation without staging proof, provider-owned billing/signature/document truth.

## AI / Automation

Current state summary: Deterministic operational cues, guidance modes, cue states, and planning docs exist. Broad AI and autonomous automation are not implemented.

Target direction: AI should draft, summarize, classify, explain blockers, suggest schedules, assist takeoff, support onboarding, and prepare approval queues over canonical records.

Must-preserve data philosophy: AI is an operating layer over canonical records. Customer-facing, financial, legal, billing, scheduling, permission, and compliance actions require human confirmation and validated server workflows.

Recommended next slices: AI draft/read-only summary plan; deterministic cue expansion; AI approval queue design after communication audit.

Not-now / deferred: AI-owned leads/projects/estimates/invoices, autonomous customer sends, AI-only calendars, or AI-only communication logs.
