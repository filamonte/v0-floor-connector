# This file is the first document to read when starting a new chat or session. - Also known as chat hand off

Status: compact operational handoff for the current branch.

Use this file for fast orientation. For exact implemented truth, defer to [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

For stronger implementation control on new tasks, also use:
- [docs/product-brain.md](C:/FloorConnector/docs/product-brain.md)
- [docs/decisions.md](C:/FloorConnector/docs/decisions.md)
- [docs/build-sequence.md](C:/FloorConnector/docs/build-sequence.md)
- [docs/codex-workflow.md](C:/FloorConnector/docs/codex-workflow.md)

## Snapshot

FloorConnector is a production-first specialty-contractor operating system built on one shared canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Current stage:
- contractor UI system is stabilized and normalized
- contractor app and portal both run on shared canonical records
- the product now has its implemented financial engine and notification foundation in place
- the next phase is operational depth, scheduling, communication UI, and automation

## Built Now

Implemented on the current branch:
- auth, tenant bootstrap, organization-aware access control
- leads, customers, projects, estimates
- customer estimate send, portal review, approval, rejection, and estimate email tracking
- approved estimate commercial snapshots as the downstream commercial baseline
- canonical contracts with signer routing and portal signature actions
- canonical change orders with contractor + portal workflow, immutable approved snapshots, and SOV or invoice integration
- canonical jobs with first-pass scheduling fields and crew assignment foundation
- canonical appointments for site visits, estimate meetings, follow-up visits, and internal coordination on the same lead/customer/project chain
- invoices, payments, immutable payment events, and portal payment initiation
- snapshot-based invoice lineage across approved estimate snapshots, SOV rows, approved change-order snapshots, and invoice-only adjustments
- real contractor-side progress billing / schedule-of-values workflow on the canonical approved-estimate snapshot and invoice chain
- notification events, notifications, notification deliveries, and canonical communication threads/messages
- first shared universal-create launcher in the contractor shell and dashboard, routed through canonical quick-create flows
- first real contractor-side global search in the protected header, grouped across canonical records and routing into the existing workspaces
- first real contractor-side notifications layer in the shared shell and dashboard, backed by stored canonical notification records and routing into real downstream workspaces
- contractor dashboard now works as a denser command-center surface with operational metrics, modular queues, dashboard-local quick create, and shortcuts back into shared manager pages
- contractor shell/header now carry breadcrumb and page-context continuity inside the unified top header instead of a separate blue-style page band
- shared contractor shell, manager-page wrappers, quick-create surfaces, and common overview cards now broadly follow the newer charcoal/orange/light-neutral contractor theme instead of the older blue-heavy manager styling
- first real contractor-side module dashboards for payments and schedule on top of the shared manager-page system
- the schedule manager now includes review-first summary metrics, next actions, crew-state continuity, and a real week/day/board calendar-planner layer on the same canonical jobs
- first real contractor-side punchlist system on the shared project/job execution chain
- people, vendors, compliance, time tracking, daily logs, field notes, execution attachments
- contractor settings and super-admin foundations

## Stable Baseline

Treat these as current implementation guardrails:
- top-nav-first contractor shell
- shared manager-page pattern
- dashboard/header visual direction is now the styling reference point for the broader contractor app
- charcoal/orange/light-neutral contractor theme across shared shell and manager surfaces
- global search now lives at the shell level instead of as a dashboard placeholder
- punchlists are now real canonical execution records, not a dashboard placeholder
- appointments are now real canonical coordination records, not a dashboard placeholder
- progress billing / SOV is now real contractor-side billing workflow, not a dashboard placeholder
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
- full dispatch-grade scheduling system
- deeper dispatch automation
- a fully finished page-by-page contractor reskin on every lower-traffic surface
- deeper AIA/pay-app export and reporting workflows beyond the current canonical progress-billing surface
- broader communication UI on top of the new thread/message foundation
- broader automation workflows on top of the new notification and communication foundations
- broader reporting / analytics
- broad redesign work

## Next Build Phase

Primary focus for the next phase:
- scheduling polish beyond the first shared calendar planner layer
- communication UI on top of the canonical threads/messages and notification system
- automation on top of the canonical notification and workflow event foundations

Goal:
- add operational depth without drifting into Contractor Foreman-style module silos

## System Rules

Keep these short rules in mind:
- no duplicate business models
- no portal-only copies of shared records
- no module-local silos
- dashboards must point back into the shared chain
- quick create must hand off into full workspaces
- project / shared record continuity stays more important than module completeness
