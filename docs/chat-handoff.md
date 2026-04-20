# This file is the first document to read when starting a new chat or session. - Also known as chat hand off

Status: compact operational handoff for the current branch.

Use this file for fast orientation. For exact implemented truth, defer to [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

## Snapshot

FloorConnector is a production-first specialty-contractor operating system built on one shared canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Current stage:
- contractor UI system is stabilized and normalized
- contractor app and portal both run on shared canonical records
- the product is moving from foundational workflow coverage into denser operational entry surfaces

## Built Now

Implemented on the current branch:
- auth, tenant bootstrap, organization-aware access control
- leads, customers, projects, estimates
- canonical contracts with signer routing and portal signature actions
- canonical change orders with contractor + portal workflow and first-pass positive invoice impact
- canonical jobs with first-pass scheduling fields and crew assignment foundation
- invoices, payments, immutable payment events, and portal payment initiation
- first shared universal-create launcher in the contractor shell and dashboard, routed through canonical quick-create flows
- first real contractor-side module dashboards for payments and schedule on top of the shared manager-page system
- the schedule manager now includes review-first summary metrics, next actions, crew-state continuity, and a lightweight near-term scheduled-work board on the same canonical jobs
- people, vendors, compliance, time tracking, daily logs, field notes, execution attachments
- contractor settings and super-admin foundations

## Stable Baseline

Treat these as current implementation guardrails:
- top-nav-first contractor shell
- shared manager-page pattern
- quick-create -> canonical record -> full workspace
- project detail as the main readiness and continuity hub
- contractor and portal as two surfaces on the same system

## Product Direction

FloorConnector is not a collection of module apps.

Direction now locked in:
- one shared lifecycle system
- continuity over module silos
- dashboards are entry surfaces, not separate product worlds
- quick create should be available broadly, but must always create canonical records

## Not Built Yet

Still intentionally not implemented:
- full scheduling calendar / board UI
- deeper dispatch automation
- broad module-dashboard coverage across the app
- broader reporting / analytics
- broad redesign work

## Next Build Phase

Primary focus for the next phase:
- broader module-dashboard coverage
- expand universal create coverage and context handoff
- scheduling UI layer beyond the review-first manager surface

Goal:
- add operational depth and create access without drifting into Contractor Foreman-style module silos

## System Rules

Keep these short rules in mind:
- no duplicate business models
- no portal-only copies of shared records
- no module-local silos
- dashboards must point back into the shared chain
- quick create must hand off into full workspaces
- project / shared record continuity stays more important than module completeness
