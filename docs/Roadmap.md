# FloorConnector Roadmap

This document describes the **phased implementation plan** for FloorConnector.

It tracks delivery sequence and major platform milestones. It should be read alongside:
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): target system design
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): source of truth for implemented status

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
- shared templates
- contracts
- jobs
- invoices and invoice line items
- payments
- tax, retainage, and AIA-ready financial scaffolding

## Phase 2

**Next: system alignment**

Planned focus:
- align docs, navigation, route protection, and workflow messaging with the already-built system
- tighten project-centered workflow guidance across leads, projects, estimates, contracts, jobs, and invoices
- improve dashboard and queue truthfulness
- make settings and organization-admin surfaces match the real multi-tenant system
- clarify module controls and entitlement foundations
- reduce super-admin and contractor-surface ambiguity
- reduce route and UI inconsistencies before expanding new domains

## Phase 3

**Next: project workspace**

Planned focus:
- make project the primary operational workspace
- connect estimates, contracts, jobs, invoices, files, and activity more clearly inside the project context
- strengthen readiness, blockers, and next-action guidance
- add notifications, tasks, and role-based queue foundations
- add file attachments and shared activity foundations where needed

## Phase 4

**Next: scheduling**

Planned focus:
- scheduling and schedule-readiness workflows
- field execution depth
- crew assignment
- time tracking foundations
- daily logs
- calendar and board views

## Phase 5

**Next: materials and reusable catalogs**

Planned focus:
- reusable item and materials catalog management
- seeded organization-owned defaults
- shared catalog support across estimating, invoicing, and contracts
- richer shared template and document editing capability
- broader document workflow refinement

## Phase 6

**Next: external integrations**

Planned focus:
- e-sign integration on top of canonical contracts
- external payment gateway support on top of canonical payments
- PDF generation and document delivery
- external tax provider integration
- accounting and adjacent third-party integrations behind shared adapters

## Phase 7

**Later: portal and communications**

Planned focus:
- customer portal workflows
- communication system
- customer-facing approvals, signatures, and payment surfaces

## Phase 8

**Later: broader platform expansion**

Planned focus:
- people system
- subcontractor system
- growth and marketing engine
- marketplace
- broader ecosystem expansion
