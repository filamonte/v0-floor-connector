# Reporting Phase 1 - Operations And Collections Visibility

Status: Implemented

Reporting Phase 1 expands the existing `/reports` route into a read-only
operations and collections visibility workspace. It gives contractor owners and
managers company-level attention signals from existing source records without
creating a separate analytics warehouse, reporting table, or workflow system.

## Purpose

Reports Phase 1 helps answer:

- what work needs scheduling or crew attention?
- which projects need the next operational move?
- where are Ready Check, schedule, field, billing, payment, closeout, or proof
  signals accumulating?
- which invoices need collection attention?
- which contracts are waiting on signature?
- where should the contractor open the source record?

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/target-ia.md`
- `docs/vision.md`
- `docs/Roadmap.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/product-language-audit.md`
- `docs/reporting-and-metrics.md`
- `docs/design/crewboard-phase-1.md`
- `docs/design/crewboard-phase-2-dispatch-usability.md`
- `docs/design/fieldtrail-phase-1-project-execution-timeline.md`
- `docs/design/messagecenter-phase-1-project-communication-timeline.md`
- `docs/design/projectpulse-phase-1-project-health-summary.md`
- `docs/design/closeouttrail-phase-1-project-closeout-workspace.md`
- `docs/design/proof-center-phase-1-project-document-evidence-index.md`
- `docs/local-auth-qa-recovery.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`

## Existing Data Used

The reporting summary reads existing tenant-scoped source records and helpers:

- projects and project Ready Check fields
- jobs and job assignments
- CrewBoard schedule warnings
- contracts
- invoices
- Financials collections read model over invoices, payments, and payment events
- Daily Job Logs
- Job Notes
- execution attachments

No reporting warehouse, reporting table, analytics snapshot, duplicate invoice,
duplicate payment, duplicate project, or duplicate job model was added.

## Route And Surface Changed

The existing `/reports` route remains the Reporting Home. It now starts with a
Reports workspace section before the existing pipeline, estimate, invoice,
payment, readiness, and sales-tax reporting basics.

No route paths were changed and no new route was created.

## Report Sections Implemented

The Reports workspace now includes:

- Operations Snapshot
- CrewBoard / Scheduling signals through schedule and crew metrics
- Project Health through project attention and Ready Check counts
- FieldTrail / Field Execution signals through Daily Job Log and Job Note gaps
- Billing and Collections through open receivables, overdue invoices, and
  payment attention
- Closeout / Proof Center attention through closeout and proof-gap signals

MessageCenter-specific communication attention remains a follow-up because the
Phase 1 helper does not yet load communication threads, messages, or delivery
events.

## Metrics Implemented

Top-level cards show:

- Open Projects
- Ready Check Attention
- Needs Scheduling
- Missing Crew
- Field Blockers
- Waiting Signature
- Open Receivables
- Payment Attention
- Closeout Attention

The supporting stat strip shows:

- jobs scheduled today
- upcoming jobs
- in-progress jobs
- overdue invoices

## Links And Actions Provided

Attention lists link back to source surfaces:

- projects needing Next Move -> Project Workspace
- jobs needing scheduling or crew -> Schedule
- invoices needing collection -> Invoice Workspace
- contracts waiting signature -> Contract Workspace
- field blockers -> Project Workspace
- closeout and proof attention -> Project Workspace

Reports does not create new workflow actions. It routes contractors to the
existing source record or workspace.

## Behavior Preserved

This slice preserves:

- schema and migrations
- route paths
- server actions and mutation behavior
- auth, tenant, and RLS behavior
- payment behavior and payment math
- signature behavior
- estimate and invoice math
- schedule behavior
- field behavior
- portal grants and Customer Access behavior
- settings and platform-admin behavior

The reports helper is deterministic and read-only. It does not call providers,
send messages, generate documents, refresh payments, retry checkout, change
status, or mark proof complete.

## Intentionally Not Implemented Yet

Phase 1 intentionally does not implement:

- full analytics dashboards
- charting library
- exportable reports
- AI insights
- forecasting
- profitability analytics
- payroll or labor costing
- accounting sync
- automated reminders
- custom report builder
- cross-tenant benchmarks
- standalone warehouse or materialized analytics model
- MessageCenter delivery or communication attention rollups

## Follow-Up Candidates

Good follow-up slices:

- add MessageCenter communication, Send Trail, Signature Trail, and Payment Trail
  attention once the loader can reuse those signals cleanly
- add a narrow Accounts Receivable drilldown from Reports into Financials
- add project-to-closeout rollups once closeout readiness needs company-level
  queueing
- add report export only after source-record coverage and permission rules are
  stable
