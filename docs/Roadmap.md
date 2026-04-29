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
- [docs/documentation-governance.md](C:/FloorConnector/docs/documentation-governance.md): documentation maintenance and archival rules

This document is sequencing guidance, not a claim that a later phase is already implemented. If status and plan conflict, trust [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for current reality.

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
- contract signature foundation and customer-facing signature workflow on canonical contracts
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

**Current phase: operational depth, scheduling, and communication UI**

Planned focus:
- align docs, navigation, route protection, and workflow messaging with the already-built system
- tighten project-centered workflow guidance across leads, projects, estimates, contracts, jobs, and invoices
- improve dashboard and queue truthfulness
- deepen the new scheduling foundation without creating a disconnected dispatch subsystem
- build user-facing communication UI on top of the already-implemented notification and communication foundations
- harden the new modular settings and super-admin architecture with clearer enforcement, permissions, and rollout rules
- deepen module controls and entitlement behavior beyond the current configuration foundation
- keep contractor admin and super-admin responsibilities clearly separated as more modules plug into settings
- reduce route and UI inconsistencies before expanding new domains

## Phase 3

**Next: project workspace**

Planned focus:
- make project the primary operational workspace
- connect estimates, contracts, jobs, invoices, files, and activity more clearly inside the project context
- strengthen project-scoped site info, plan/photo/file inputs, and scope summary foundations that can later support Takeoff & Scope Intelligence
- strengthen readiness, blockers, and next-action guidance
- add tasks and richer role-based queue behavior on top of the existing notification foundation
- add file attachments and shared activity foundations where needed

## Phase 4

**Next: scheduling**

Planned focus:
- scheduling and schedule-readiness workflows
- crew assignment
- calendar and board views
- deeper execution planning and operational scheduling on top of the already-implemented time and daily-log foundations

## Phase 5

**Next: materials and reusable catalogs**

Planned focus:
- reusable item and materials catalog management
- seeded organization-owned defaults beyond the current settings foundation
- shared catalog support directly inside estimating, invoicing, contracts, and future execution workflows
- catalog/cost item design that can define reusable cost, markup, pricing, production, and tax behavior, while still allowing estimate-level overrides that remain internal in edit mode
- Estimate Builder work in this phase should follow [docs/estimate-builder-build-plan.md](C:/FloorConnector/docs/estimate-builder-build-plan.md), with current execution constrained by [docs/estimate-builder-v1-scope.md](C:/FloorConnector/docs/estimate-builder-v1-scope.md)
- planned manual measurement-driven estimating foundations where length x width, direct floor area, direct linear footage, counts, and optional room/zone detail can produce quantities for reviewed estimate generation
- planned System Template foundations where reusable estimating systems bundle catalog/cost items, formulas, grouping rules, optional components, and required inputs
- planned on-screen Takeoff & Scope Intelligence foundations where project-scoped plan/PDF/drawing measurement can produce quantities, map through System Templates and reusable catalog/cost items, and generate reviewed estimate line items
- richer shared template and document editing capability
- broader document workflow refinement

Takeoff work in this phase would be planned direction only. Manual measurements are not takeoff; they are contractor-entered quantities or dimensions. Takeoff means plan, PDF, or drawing-based measurement. Both input paths should support the canonical estimate workflow instead of becoming separate estimating apps. Takeoff and measurement quantities may eventually inform material requirements, labor estimation, production readiness, and job planning, but they should flow through reviewed estimates before contracts, jobs, invoices, or payments.

## Phase 6

**Next: external integrations**

Planned focus:
- e-sign integration on top of canonical contracts
- external payment gateway support on top of canonical payments
- PDF generation and document delivery
- external tax provider integration
- accounting and adjacent third-party integrations behind shared adapters

## Phase 7

**Later: portal, communications, and scoped collaboration expansion**

Planned focus:
- broader customer portal workflows beyond the current access, review, and contract-signature foundation
- customer-facing online payment UI and richer post-review customer actions
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
