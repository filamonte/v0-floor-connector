# Contractor Workflow Spec

This document defines the primary contractor workflow FloorConnector should optimize for next.

It does not replace the target platform architecture or the current implementation record. It should be read alongside:
- [docs/Architecture.md](C:/FloorConnector/docs/Architecture.md): target platform architecture
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md): target contractor app information architecture
- [docs/sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md): broader business workflow intent
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md): source of truth for what is implemented today

## Purpose

The current foundation has strong canonical records, but the working experience still exposes too much module structure too early.

This document defines:
- the primary happy path contractors should follow
- where guidance should be stronger than raw record creation
- what the system should auto-derive versus ask users to decide
- how the product should move from module-centered foundations toward outcome-centered workflow

## Workflow Principles

### 1. One Guided Journey

Contractors do not think in isolated modules first. They think in outcomes:
- win the job
- get it ready
- schedule the work
- complete the work
- get paid

The product should optimize for this journey, not for record navigation alone.

### 2. Project Is The Operational Root

Projects should become the main workspace once a piece of work is real enough to deliver.

Customers remain the relationship root.
Projects remain the execution root.

### 3. Standalone Routes Are Queues, Not The Primary Mental Model

Global routes such as `/estimates`, `/contracts`, `/invoices`, and `/jobs` should still exist, but mainly for:
- cross-project review
- approvals
- finance work
- scheduling work
- exception handling

The primary workflow should still pull users back into project context.

### 4. Creation Should Follow Readiness

The system should prefer:
- guided progression
- explicit blockers
- clearly recommended next actions

over:
- many equally prominent creation buttons
- requiring users to infer what should happen next
- letting every team invent its own process

### 5. Keep Canonical Data Flow Intact

Every step should continue to use the same shared entities:
- opportunity
- customer
- project
- estimate
- contract
- invoice
- payment
- job

No step should fork into disconnected "document-only" or "finance-only" records.

### 6. Configuration Must Respect Platform Boundaries

Workflow behavior should now be understood through two settings layers:
- super admin defines platform-wide defaults and rollout policy
- contractor organizations own their adopted copies and tenant-scoped workflow preferences

That means workflow guidance can be configurable without collapsing tenant-owned records into one global mutable configuration model.

## Primary Contractor Journey

The target primary path should be:

`Opportunity / Intake -> Customer -> Project -> Estimate -> Contract -> Financial Readiness -> Job / Schedule -> Invoice -> Payment`

This does not mean every step needs a large standalone module immediately. It means the system should orient around this progression.

## Target Workflow Stages

### 1. Opportunity / Intake

Purpose:
- capture initial interest
- preserve qualification context
- avoid creating full operational records too early

Should capture:
- lead/contact identity
- address or job location
- service interest
- source
- rough notes
- qualification state

### 2. Customer

Purpose:
- establish the canonical customer relationship record

Should answer:
- who the customer is
- how to contact them
- whether they are tax exempt
- what their retainage defaults are
- what work history exists with them

Customer creation should happen when the opportunity is qualified enough to justify a shared relationship record.

### 3. Project

Purpose:
- create the operational home for a real piece of work

Should answer:
- what is being delivered
- where it is located
- what stage it is in
- what blockers exist
- what records are attached to it

Project should be the main workspace once sales activity is moving into real scoping, proposal, contracting, or delivery.

### 4. Estimate

Purpose:
- define scope, pricing, and commercial offer

Should support:
- reusable catalogs and assemblies later
- line-item pricing
- tax-aware totals
- notes and assumptions
- customer-facing proposal review

Estimate should be the primary source for:
- contract generation
- future schedule-of-values seeding
- future AIA/progress billing readiness

### 5. Contract

Purpose:
- formalize the sold work from the approved estimate

Should support:
- generation from approved estimate and project context
- shared template rendering
- practical pre-sign edits
- lock after signature activity begins

Contract should be the canonical commercial commitment record, not a detached document.

### 6. Financial Readiness

Purpose:
- determine whether work is financially ready to move into operations

This stage should support:
- deposit-required logic later
- financing-required logic later
- retainage-aware downstream billing
- readiness-to-schedule gating

The important concept is not "did an invoice exist," but "is this sold work actually ready for production scheduling."

### 7. Job / Scheduling

Purpose:
- convert sold and ready work into operational execution

Should support:
- job/work order creation
- scheduling readiness
- future crew assignment
- future calendar and field operations

Job creation should be guided by workflow readiness, not just available as a generic button everywhere.

### 8. Invoice

Purpose:
- bill completed or billable work against the same canonical customer/project workflow

Should stay connected to:
- project
- customer
- optional estimate
- optional job
- future contract context where needed

Invoice should remain canonical and finance-aware, including:
- tax
- exemption snapshots
- retainage
- future AIA/progress billing extension points

### 9. Payment

Purpose:
- record money received against canonical invoices

Should support:
- partial and full payment tracking
- balance due updates
- future online payment extension

Payment should remain invoice-linked and organization-scoped.

## Primary vs Secondary Actions

The system should distinguish between:
- the primary path
- valid but secondary fallback actions

### Primary Actions

Examples:
- approved estimate -> generate contract
- signed contract + financial readiness -> ready to schedule
- ready work -> create job / place on schedule
- billable work -> create invoice
- invoice -> record payment

### Secondary Actions

Examples:
- direct invoice creation from project
- direct job creation from project
- finance users opening invoices from global lists
- operations users opening jobs from global lists

Secondary actions can remain available, but they should not compete visually with the main path.

## Next Best Action Model

The system should evolve toward showing one or two strong recommended actions at a time instead of exposing many equal options.

Examples:
- send estimate
- revise estimate
- generate contract
- send contract
- waiting on signature
- waiting on deposit
- ready to schedule
- create first invoice
- follow up on overdue invoice

This model should be powered by canonical status plus blockers, not by ad hoc page copy.

## Role Perspective

The same workflow should present differently by role.

### Sales

Primary focus:
- intake
- qualification
- estimate progression
- contract progression
- customer follow-up

### Operations

Primary focus:
- readiness to schedule
- jobs
- schedule
- field execution

### Finance

Primary focus:
- invoice review
- tax treatment
- payment recording
- collections
- retainage and later AIA/progress workflows

The workflow itself should stay shared; only the queues and emphasis should vary by role.

## Guidance For Implementation

Implementation should move in this order:
1. define the primary workflow path clearly
2. define blockers and readiness rules
3. make project the main operational workspace
4. keep standalone routes as global queues
5. add role-aware next-action and handoff behavior

## Current Implementation Note

Today the app still exposes more direct module-style navigation and record creation than this workflow spec recommends.

That is acceptable for the current foundation phase. This document defines the next product-direction layer so implementation can become more guided without discarding the existing canonical model.
