# Reporting And Metrics

Status: Planned
Doc Type: Roadmap

This document defines FloorConnector's canonical reporting and metrics philosophy. It is strategic architecture guidance only. It does not add reports, dashboards, schema, migrations, routes, APIs, AI behavior, providers, or runtime metric behavior.

For implemented truth, use [docs/current-state.md](C:/FloorConnector/docs/current-state.md). For the future Intelligence Layer, use [docs/intelligence-layer.md](C:/FloorConnector/docs/intelligence-layer.md).

Implemented note: Reporting Phase 1 now exists on `/reports` as a read-only operations and collections visibility workspace over existing source records. Financial Control Phase 1 now deepens `/financials` and `/financials/accounts-receivable` with read-only collections/payment attention and Next Move routing over existing invoices, payments, and payment events. Collections Follow-Up Intelligence now adds deterministic AR follow-up categories and review-first Copilot draft handoffs on `/financials/accounts-receivable` without sending reminders, creating communication threads, creating notifications, calling providers, or mutating invoice/payment state. Accounting Readiness Phase 1 now adds `/financials/accounting-readiness` as read-only export and reconciliation prep over existing invoices, payments, payment events, customers, projects, invoice tax reporting entries, and retainage snapshots. Accounting Export Prep Phase 1 adds in-browser Copy CSV / Download CSV review output from the already loaded Accounting Readiness rows. These do not change the broader planned reporting doctrine in this document; deeper analytics, report-wide file exports, profitability, forecasting, benchmarks, accounting sync, reconciliation posting, and provider-backed intelligence remain future work unless separately implemented and recorded in `docs/current-state.md`.

Related documents:

- [docs/intelligence-layer.md](C:/FloorConnector/docs/intelligence-layer.md): future operational intelligence strategy
- [docs/agentic-operations-layer.md](C:/FloorConnector/docs/agentic-operations-layer.md): future governed AI operating-layer strategy
- [docs/automation-layer.md](C:/FloorConnector/docs/automation-layer.md): future workflow automation philosophy
- [docs/communications-layer.md](C:/FloorConnector/docs/communications-layer.md): future workflow-connected communication philosophy
- [docs/financial-architecture.md](C:/FloorConnector/docs/financial-architecture.md): financial record and event guardrails
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): maturity sequencing

## Purpose

Reporting and metrics are the foundation for future dashboards, operational analytics, contractor intelligence, anonymized benchmarking, predictive systems, and workflow optimization.

Metrics must derive from canonical operational records. Reporting must be continuity-aware. Analytics should emerge from workflow continuity, not from disconnected manual entry or module-local scorekeeping.

The practical metric spine is:

`lead -> estimate -> contract -> job -> invoice -> payment`

In implementation language, that spine must still preserve the canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Canonical Metrics Philosophy

Metrics should be downstream of business truth.

That means:

- opportunities, customers, projects, estimates, contracts, jobs, invoices, payments, time, communications, and field records remain authoritative
- reports derive from those records or approved downstream projections
- projections may exist for performance, but they must not become business truth
- metrics should be traceable back to source records
- dashboards should explain status and action, not create hidden state
- manual metric entry should not replace workflow evidence

No report should require a duplicate customer, project, invoice, payment, job, communication, or AI-only record chain.

## Why Workflow Continuity Matters

Contractor metrics become meaningful only when the workflow chain stays connected.

Examples:

- close rate needs opportunity, estimate, and contract continuity
- lead-source ROI needs source attribution, estimate value, contract status, invoice value, and payment collection
- profitability needs estimate scope, job execution, labor/material input, invoices, and payments
- schedule performance needs project readiness, job scheduling, crew assignment, and execution history
- collections performance needs invoice, payment, delivery, and communication evidence

Disconnected reports can describe fragments. Canonical reporting can explain the whole operating path.

## Operational Reporting

Operational reporting should help contractors answer:

- What is ready?
- What is blocked?
- What is aging?
- What needs follow-up?
- What work is scheduled, unscheduled, in progress, or complete?
- What projects are commercially ready but not yet converted into jobs?
- What field, service, warranty, equipment, or workforce signals need attention?

Operational reports should route back to Project Workspace, Manager Pages, Record Workspaces, or approved action surfaces. They should not become separate workflow systems.

## Financial Reporting

Financial reporting must derive from canonical invoices, invoice line items, payments, payment events, approved estimate snapshots, change-order snapshots, schedule-of-values lineage, and relevant financial settings.

Implemented Financial Control is currently a read-only collections and payment
attention layer. Collections Follow-Up Intelligence categorizes invoice/payment
follow-up from canonical AR evidence and can hand off editable Copilot drafts to
the communications composer when AI drafting controls allow it. It routes owners
to invoice, project, AR, communications review, and Payment Trail surfaces; it
does not post reconciliation, send reminders, create threads, create
notifications, change payment behavior, or create a ledger.

Implemented Accounting Export Prep is currently limited to in-browser CSV copy
and download output from already loaded Accounting Readiness rows. It does not
store files, create export audit events, add provider sync, post accounting
entries, or change invoice/payment records.

Future financial reporting may include:

- accounts receivable
- overdue invoices
- open balances
- payment timing
- deposits
- retainage
- tax summaries
- progress billing
- revenue by project, customer, system, estimator, or source
- margin and profitability after cost and job-costing inputs mature

Financial reports must preserve invoice/payment truth. Do not create parallel balance systems on projects, estimates, contracts, or reporting tables.

## Sales And Conversion Metrics

Sales and conversion metrics should derive from the connected pre-sale and commercial chain.

Future metrics may include:

- opportunity to estimate conversion
- estimate sent to approval conversion
- estimate approval to contract conversion
- contract sent to signature conversion
- lead source performance
- estimator performance
- average estimate value
- average contract value
- sales cycle time
- customer type or service-line performance

These metrics should use canonical opportunity, customer, project, estimate, contract, and source-attribution evidence. They should not use a separate CRM score table as business truth.

## Production Metrics

Production metrics should derive from jobs, schedules, daily logs, field notes, time, equipment, materials, punchlists, service/warranty records, and closeout evidence as those foundations mature.

Future metrics may include:

- schedule adherence
- job duration vs planned duration
- readiness blockers
- production rate
- rework or punchlist frequency
- service/warranty follow-up rate
- equipment availability and utilization
- material usage once inventory/job-costing inputs mature

Production metrics should strengthen project and job continuity rather than become a disconnected production dashboard.

## Labor Metrics

Labor metrics should derive from canonical people, punch events, time cards, job assignments, and future payroll/job-costing boundaries.

Future metrics may include:

- hours by project or job
- hours by worker or crew
- overtime risk
- labor efficiency
- utilization
- missed punch or exception rate
- service/warranty labor time
- labor cost after approved costing inputs mature

Labor metrics must not bypass time-card review, payroll boundaries, tenant isolation, or worker privacy considerations.

## Workflow Timing Metrics

Workflow timing metrics should measure movement through the canonical chain.

Future examples:

- inquiry to qualified opportunity
- opportunity to estimate sent
- estimate sent to viewed
- estimate viewed to approved or declined
- approval to contract sent
- contract sent to signed
- signed contract to scheduled job
- scheduled job to start
- completion to invoice
- invoice sent to paid

Timing metrics are valuable because they expose bottlenecks. They should not silently redefine workflow statuses or imply work is complete when canonical records disagree.

## Readiness Metrics

Readiness metrics should derive from existing readiness gates, project state, commercial state, financial state, job state, equipment signals, workforce signals, and field evidence.

Future metrics may include:

- ready to schedule
- blocked by contract
- blocked by deposit
- blocked by financing
- missing crew
- missing equipment
- missing field evidence
- missing billing trigger
- aging readiness blocker

Readiness metrics should explain the blocker and route to the relevant workspace. They must not bypass readiness gates or create module-local readiness truth.

## Benchmarking Foundations

Benchmarking should come after tenant-scoped metrics are reliable.

Future anonymized benchmarking may compare:

- close rates
- lead-source conversion
- average job size
- schedule timing
- labor efficiency
- regional pricing
- margin ranges
- payment timing
- seasonality
- system or product popularity

Benchmarking requires opt-in posture, aggregation thresholds, privacy review, and clear platform governance. It must never expose another contractor's tenant data.

## Future Intelligence Metrics

The Intelligence Layer depends on reliable metrics.

Future intelligence may use metrics to support:

- risk forecasting
- close-likelihood prediction
- payment-delay prediction
- crew-performance signals
- recommended next actions
- workflow optimization suggestions
- contractor health scoring
- anonymized industry reporting

These outputs should be explainable and advisory until the related automation policy is approved.

Future agentic operations should use reporting and metrics as explainable
evidence, not as hidden business truth. AI recommendations, approvals, and any
later autonomy must be traceable back to canonical records and workflow events.

## Reporting Governance

Reporting must preserve:

- canonical source-of-truth ownership
- tenant isolation
- role-aware authorization
- financial lineage
- portal visibility boundaries
- privacy and aggregation rules
- current vs planned capability labels
- drill-through to source records where practical

Every important metric should answer:

- What records produced this number?
- Is this tenant-private or aggregated benchmark data?
- Is this implemented, foundation-level, planned, or predictive?
- What caveats apply?
- What action should the user take next?

## What FloorConnector Avoids

FloorConnector should avoid:

- manual metric systems
- disconnected BI silos
- duplicate reporting databases as business truth
- fake AI metrics
- isolated module analytics
- provider dashboards treated as FloorConnector truth
- vanity dashboards without drill-through or workflow meaning
- cross-tenant comparisons without opt-in and aggregation safeguards

## Relationship To Intelligence Layer

Reporting describes and measures. Intelligence interprets, compares, predicts, and recommends.

The Intelligence Layer should be built on top of reliable reporting foundations. If a metric cannot be explained from canonical records, it should not become a predictive input, benchmark, operational health score, or AI recommendation.

The AI Operational Digest is the first dashboard-level Copilot rollup over
existing operational signals. It is not a reporting warehouse, reporting
source-of-truth, or metric engine. It groups current attention and handoff
signals from canonical records so users can route back to project, contract,
invoice, job, schedule, and equipment workspaces.

## Relationship To Automation Layer

Automation should use metrics as evidence, not as a hidden source of action.

Examples:

- overdue invoice metrics can support collections follow-up prompts
- schedule readiness metrics can support scheduling handoff prompts
- stale estimate timing can support estimator follow-up prompts
- delivery failure metrics can support communication follow-up prompts

Automated action should still route through canonical workflows, approval boundaries, and audit.

## Summary

Reporting and metrics are how FloorConnector measures the connected contractor operating system. The goal is not more charts. The goal is trustworthy operational visibility that derives from canonical records, exposes bottlenecks, supports contractor decisions, and creates the foundation for future intelligence without fragmenting the product into competing data truths.
