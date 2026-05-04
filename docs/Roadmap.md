# FloorConnector Roadmap

Status: phased implementation plan.

This document describes the **phased implementation plan** for FloorConnector.

It tracks delivery sequence and major platform milestones. It should be read alongside:
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): source of truth for implemented status
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): target system design
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md): target sales and commercial workflow direction
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md): target contractor app information architecture
- [docs/estimate-builder-build-plan.md](C:/FloorConnector/docs/estimate-builder-build-plan.md): long-term Estimate Builder blueprint
- [docs/estimate-builder-v1-scope.md](C:/FloorConnector/docs/estimate-builder-v1-scope.md): constrained Estimate Builder V1 scope
- [docs/ui-data-model-alignment-backlog.md](C:/FloorConnector/docs/ui-data-model-alignment-backlog.md): UI, directory/contact, tax, Estimate Editoror, workflow-guidance, project-address, and configurable-view alignment backlog
- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md): documentation maintenance and archival rules

This document is sequencing guidance, not a claim that a later phase is already implemented. If status and plan conflict, trust [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for current reality.

## Canonical Lifecycle Alignment

All roadmap phases extend and refine the same canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

No phase introduces a parallel workflow or replaces this chain. Later phases deepen, connect, and improve clarity within the same system.

## Phase 1

**Current implemented foundation**

Phase 1 established the production-oriented core system. The branch already contains the shared architecture, tenant model, Supabase integration, and first connected business workflows. It does **not** mean every surface is fully polished, but the canonical operational backbone is in place.

Included in Phase 1:
- auth
- organizations and memberships
- opportunities / leads
- customers
- projects
- estimates and estimate line items
- approved estimate snapshots and customer portal approval flow
- shared templates
- change orders and approved change-order snapshots
- contracts
- contract signature foundation, customer-facing portal signing, and contractor-side onsite signing on canonical contracts
- jobs
- invoices and invoice line items
- snapshot-based invoice lineage and schedule-of-values lineage
- payments
- customer-facing payment foundation on canonical invoices and payments
- notifications, notification deliveries, and communications foundations
- people, vendors, and compliance foundations
- time tracking foundations
- daily logs and field-execution foundations
- customer portal access, review, and contract-signature foundations
- tax, retainage, and AIA-ready financial scaffolding

## Phase 2

**Current phase: Phase B validation and foundation hardening**

Current reality:
- first-pass operational depth, schedule, communications, reporting, Sales Tax Summary, manual notification-only automation, onboarding readiness, and contractor UI normalization foundations are implemented on the current branch
- `/schedule` has first-pass planner/board and crew-assignment continuity on canonical jobs and `job_assignments`
- `/communications` has a first contractor-side review surface, URL-driven filtering, safe replies on existing canonical threads, and notification triage without provider sends or automation execution
- `/reports` has narrow read-only internal-beta summaries over canonical records, including Sales Tax Summary

Current focus:
- run and record seed-free Phase B validation before contractor beta
- verify reporting and Sales Tax Summary accuracy against canonical invoices, payments, opportunities, estimates, projects, and tax snapshots
- validate the manual automation runner's duplicate guard and recipient behavior
- complete internal beta support/release checklist, onboarding runbook, beta candidate criteria, and bug triage process
- fix validation-blocking defects without expanding into unrelated feature breadth
- keep contractor admin and super-admin responsibilities clearly separated as more modules plug into settings

## Phase C: Operational Depth Systems

Planned focus:

- HR + OSHA / Safety System: Introduce incident entity, extend people, compliance_records, time tracking, projects/jobs for HR and safety management.

- Unified Task System: Define Task as canonical entity attaching to any record for assignable, lifecycle-tracked tasks.

- Progress Billing / AIA System: Extend ScheduleOfValues, invoices for % complete, G702/G703, retainage.

- Website + Lead Ingestion + Marketing Layer: Add public ingestion layer for leads into opportunities.

- Purchasing + Inventory System: Extend catalog_items, inventory_items for purchase orders, stock tracking.

- Subcontractor System: Extend vendors, people, compliance_records for onboarding and compliance.

- PTO / Workforce Management: Add PTO accrual, requests, approval on people, time tracking.

- Service Layer: Define AI, call intelligence, takeoffs, marketplace, marketing automation, forecasting as read-only enrichments.

- Mobile-First Field Workflows: Ensure all field workflows support mobile for time tracking, incident capture, photos, tasks, daily logs, safety checklists.

- Canonical Entity Cleanup: Clarify entities, remove Deal, ensure EmployeeProfile extends people.

## Phase 3

**Next: project workspace**

Planned focus:
- make project the primary operational workspace
- connect estimates, contracts, jobs, invoices, files, and activity more clearly inside the project context
- align project/service address display with the planned structured address direction while keeping it distinct from customer billing/contact address
- strengthen project-scoped site info, plan/photo/file inputs, and scope summary foundations that can later support Takeoff & Scope Intelligence
- strengthen readiness, blockers, and next-action guidance
- add tasks and richer role-based queue behavior on top of the existing notification foundation
- add file attachments and shared activity foundations where needed

## Phase 4

**Next: deeper scheduling and dispatch**

Planned focus:
- dispatch-grade scheduling and schedule-readiness workflows beyond the current first-pass planner/board foundation
- deeper crew coordination and assignment automation beyond current canonical `job_assignments` review/assignment
- richer calendar, dispatch board, rescheduling, and operational planning controls
- deeper execution planning and operational scheduling on top of the already-implemented time and daily-log foundations

## Phase 5

**Next: materials and reusable catalogs**

Current reality and planned focus:
- reusable catalog foundation already exists on canonical `catalog_items`
- estimate-side catalog insertion has begun: active non-system catalog items can be added to estimate line items as server-owned snapshots, while archived items are blocked and systems still use the existing expansion flow
- deepen reusable item and materials catalog management on top of the existing `catalog_items` foundation
- seeded organization-owned defaults beyond the current starter catalog/settings foundation
- deeper shared catalog support inside estimating, invoicing, contracts, and future execution workflows, with snapshot behavior preserved where commercial records are created
- future invoice catalog usage remains deferred and should stay conservative, favoring approved estimate, SOV, change-order, and invoice-only lineage instead of live catalog billing shortcuts
- richer materials workflows, inventory quantity/reservation/issue/return workflows, and job material planning remain future work
- assemblies/systems still need deeper formula, optional component, versioning, and regeneration policy work beyond the current system expansion foundation
- SOV/progress billing depth remains future work and should continue to use approved commercial snapshot lineage, not live catalog prices
- catalog/cost item behavior that can define reusable cost, markup, pricing, production, and tax defaults while still allowing intentional estimate-level overrides that remain internal in edit mode
- Estimate Builder work in this phase should follow [docs/estimate-builder-build-plan.md](C:/FloorConnector/docs/estimate-builder-build-plan.md), with current execution constrained by [docs/estimate-builder-v1-scope.md](C:/FloorConnector/docs/estimate-builder-v1-scope.md)
- planned manual measurement-driven estimating foundations where length x width, direct floor area, direct linear footage, counts, and optional room/zone detail can produce quantities for reviewed estimate generation
- planned System Template foundations where reusable estimating systems extend `catalog_items` and catalog-backed components with formulas, grouping rules, optional components, and required inputs
- planned Templates & Systems settings/admin area for document templates, System Templates, add-ons/options, and sharing/review settings instead of scattering those controls across estimate, invoice, and contract modules
- planned add-on/option foundations for catalog-backed optional scope modifiers such as integrated cove base, vinyl cove base, control joints, crack repair, coating removal, moisture mitigation, extra topcoat, mobilization/setup, and future labor adjustments
- planned template sharing loop where contractor-created templates/systems/add-ons can be marked shareable, reviewed by super admin, stripped or anonymized for private cost/markup/margin/internal notes, and promoted as platform defaults without silently updating contractor local copies
- planned on-screen Takeoff & Scope Intelligence foundations where project-scoped plan/PDF/drawing measurement can produce quantities, map through System Templates and reusable catalog/cost items, and generate reviewed estimate line items
- richer shared template and document editing capability
- broader document workflow refinement

Takeoff work in this phase would be planned direction only. Manual measurements are not takeoff; they are contractor-entered quantities or dimensions. Takeoff means plan, PDF, or drawing-based measurement. Both input paths should support the canonical estimate workflow and the existing `catalog_items` cost item database instead of becoming separate estimating apps. Takeoff and measurement quantities may eventually inform material requirements, labor estimation, production readiness, and job planning, but they should flow through reviewed estimates before contracts, jobs, invoices, or payments.

Document-template work in this phase should preserve the existing copied-template model: platform defaults seed contractor-owned templates, contractors can edit local copies and switch templates per estimate, invoice, or contract where supported, and future proposal/SOW or work order templates should extend the same shared template foundation instead of creating module-specific template silos.

## Phase 6

**Next: external integrations**

Planned focus:
- e-sign integration on top of canonical contracts
- deeper payment-provider support, reconciliation, retry, and provider lifecycle tooling on top of canonical payments
- deeper PDF generation, document delivery, and provider lifecycle tooling beyond the current canonical contract PDF snapshot foundation
- external tax provider integration
- accounting and adjacent third-party integrations behind shared adapters

## Phase 7

**Later: portal, communications, and scoped collaboration expansion**

Planned focus:
- broader customer portal workflows beyond the current access, review, and contract-signature foundation
- richer customer-facing payment self-service and post-review actions beyond the current portal invoice/payment handoff
- record-based communication tied to projects, jobs, change orders, invoices, daily logs, field notes, and other canonical workflow records
- scoped subcontractor/vendor/project partner collaboration where invited external participants can access only explicitly shared project or job workrooms
- project/job workrooms for limited status updates, photo uploads, field notes, files, and record-tied communication

This is planned direction only. It does not mean contractor network collaboration, subcontractor portal access, or contractor-to-contractor messaging is currently implemented.

## Phase 8

**Later: broader platform expansion**

Planned focus:
- growth and marketing engine
- AI Capture and AI-assisted Takeoff & Scope Intelligence suggestions on top of project-scoped plans, photos, site data, measurements, System Templates, catalog mapping, and human-reviewed estimate generation
- contractor network / networked work expansion for trusted partner contractors, specialty subcontractors, vendors, overflow work sharing, and regional coverage
- private referral or overflow work sharing where it extends the same canonical project/job/payment chain
- controlled marketplace or vetted network behavior only after scoped collaboration, permissions, compliance signals, and tenant isolation are designed
- broader ecosystem expansion

Open marketplace behavior is a later-phase platform direction, not a current implementation target.
AI-assisted takeoff is also a later platform direction, not a current implementation target.
AI Capture may eventually suggest measurements, areas, systems, cost-item mappings, and estimate drafts, but customer-facing estimate content should remain reviewable, manually approved, and auditable.
