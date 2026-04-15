# FloorConnector Roadmap

This document describes the **phased implementation plan** for FloorConnector.

It tracks delivery sequence and major platform milestones. It should be read alongside:
- [docs/architecture.md](C:/FloorConnector/docs/architecture.md): target system design
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): source of truth for implemented status

## Phase 1

**Foundation-complete**

Phase 1 establishes the production-oriented core foundation. It means the shared architecture, tenant model, and first business objects exist and work end to end. It does **not** mean every feature in this phase is already polished or production-complete from a workflow or UX perspective.

Included in Phase 1:
- auth
- orgs
- customers
- projects
- estimates
- jobs

## Phase 2

**Next**

Planned focus:
- invoice system
- invoice line items and total calculation
- tax-aware and AIA-ready invoice foundation
- reusable item/template/catalog management as shared workflow foundation
- project workspace
- file attachments

## Phase 3

Planned focus:
- people system
- subcontractor system
- time tracking

## Phase 4

Planned focus:
- field execution
- daily logs
- scheduling

## Phase 5

Planned focus:
- payments
- contracts + e-sign v1 on top of approved-estimate contract generation
- AIA billing expansion
- shared template/document editing capability for estimates, invoices, and contracts
- platform-seeded default catalogs/templates that provision into organization-owned copies

## Phase 6

Planned focus:
- customer portal
- communication system

## Phase 7

Planned focus:
- growth system

## Phase 8

Planned focus:
- marketplace
