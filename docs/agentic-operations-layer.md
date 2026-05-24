# Agentic Operations Layer

Status: Target strategic direction
Doc Type: Roadmap

This document defines FloorConnector's future Agentic Operations Layer. It is
not implemented current-state truth. It exists to prevent future architecture
drift while the product is still being built.

For implemented status, use [docs/current-state.md](C:/FloorConnector/docs/current-state.md).
For sequencing, use [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md),
[docs/platform-build-registry.md](C:/FloorConnector/docs/platform-build-registry.md),
and [docs/platform-maturity-model.md](C:/FloorConnector/docs/platform-maturity-model.md).

## Relationship To Other Docs

This document is the umbrella for long-term strategic AI and agentic direction.
It does not replace:

- [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for
  implemented truth.
- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
  for day-to-day implementation guardrails.
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md),
  [docs/platform-build-registry.md](C:/FloorConnector/docs/platform-build-registry.md),
  and
  [docs/platform-maturity-model.md](C:/FloorConnector/docs/platform-maturity-model.md)
  for sequencing and maturity discipline.
- [docs/automation-layer.md](C:/FloorConnector/docs/automation-layer.md) for
  deterministic triggers, reminders, queues, readiness cues, and rule-based
  automation.
- [docs/communications-layer.md](C:/FloorConnector/docs/communications-layer.md)
  for the canonical communication substrate future AI must use.
- [docs/reporting-and-metrics.md](C:/FloorConnector/docs/reporting-and-metrics.md)
  for canonical metrics and visibility that future insights agents may read or
  summarize.
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md),
  [docs/workflow-state-machine.md](C:/FloorConnector/docs/workflow-state-machine.md),
  and [docs/workflow-spec.md](C:/FloorConnector/docs/workflow-spec.md) for
  canonical workflow behavior, gates, blockers, and transitions AI must
  respect.
- GateKeeper and AI-focused workflow docs for narrower source-adapter, memory,
  review queue, follow-up, intake, scheduling, or assistant planning details.

## Status / Purpose

The Agentic Operations Layer is target strategic direction only. It does not
mean full autonomous AI operations, AI agents, provider-backed AI execution, or
broad AI-controlled workflows are built today.

This document gives future AI work a disciplined operating boundary. It should
help FloorConnector add AI assistance later without creating duplicate business
truth, disconnected assistant memory, module-local automation, or a chatbot
bolted beside the real product.

## Strategic Thesis

FloorConnector should eventually become an AI-operable contractor operating
system. The future AI layer should be an operational participant that works
through FloorConnector's canonical records, permissions, workflows, events, and
audit trails.

Contractors should eventually be able to interact by email, text, voice, portal
messages, or app UI and have the assistant coordinate real work through
FloorConnector. The assistant should not be a detached chat widget. It should
read operational context, prepare work, explain evidence, and route approved
actions through the same system humans use.

AI is not a separate product surface that owns business truth. It is a governed
operating layer that reads from and acts through FloorConnector's canonical
workflow.

## Core Principle

AI must extend the canonical operational chain rather than introduce parallel
systems, shadow workflows, or disconnected automation models.

The canonical lifecycle remains:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Canonical Operating Boundary

Future AI actions must operate through existing or future canonical entities and
evidence records, including:

- opportunities
- customers
- projects
- estimates
- contracts
- change orders
- jobs
- invoices
- payments
- people
- vendors
- daily logs
- field notes
- communications
- documents
- workflow events
- payment events
- signature events

AI must not create AI-only opportunities, customers, projects, estimates,
contracts, calendars, invoices, payments, communication logs, documents, or
workflow engines that compete with those records.

## What The Future Assistant May Eventually Do

Future capabilities may include:

- respond to inbound customer emails or texts
- qualify leads and identify missing intake details
- book onsite visits after approval and availability checks
- create or update opportunities through approved actions
- draft estimates for review
- suggest floor systems, scope, exclusions, or prep assumptions
- prepare contracts or business documents for review
- send approved communications through governed send workflows
- request deposits or payments through canonical invoice/payment flows
- follow up on overdue invoices with approved collection messages
- schedule or reschedule jobs after confirmation
- notify crews, customers, vendors, or internal owners
- help with field logs, daily documentation, and evidence summaries
- summarize project health, blockers, and readiness gaps
- identify missing prerequisites before scheduling, billing, or closeout
- assist with materials, purchasing, and production-readiness workflows
- generate business or admin documents where applicable

These are future possibilities, not current branch capability claims.

## Agent Families

### Intake Agent

Responsibility: qualify inbound inquiries, extract customer and site context,
identify missing details, and prepare opportunity or appointment actions.

Canonical records: opportunities, customers, projects, people, communications,
documents, workflow events.

### Scheduling / Dispatch Agent

Responsibility: suggest site visit or job schedule options, explain conflicts,
prepare reschedule proposals, and coordinate crew/customer/vendor notifications.

Canonical records: appointments, jobs, job assignments, people, vendors,
projects, customers, communications, workflow events.

### Communications Agent

Responsibility: classify inbound messages, summarize threads, draft replies,
route messages to the right record, and prepare approval-ready outbound
communications.

Canonical records: communications, opportunities, customers, projects,
estimates, contracts, change orders, jobs, invoices, payments, documents,
workflow events.

### Collections / AR Agent

Responsibility: identify overdue or failed-payment situations, summarize payment
history, draft follow-up, and prepare approved payment-request actions.

Canonical records: invoices, payments, payment events, customers, projects,
communications, workflow events.

### Workflow / Readiness Agent

Responsibility: explain blockers, detect missing prerequisites, prepare next
actions, and keep work moving through the canonical chain.

Canonical records: opportunities, projects, estimates, contracts, change orders,
jobs, invoices, payments, workflow events, signature events, payment events.

### Estimating / Scope Agent

Responsibility: draft scope language, suggest system/template/cost-item mapping,
summarize site information, and prepare estimate content for human review.

Canonical records: opportunities, projects, estimates, catalog/cost items,
documents, field notes, communications, workflow events.

### Documentation Agent

Responsibility: draft, summarize, classify, and assemble business, customer,
field, closeout, warranty, and internal documents for review.

Canonical records: documents, estimates, contracts, change orders, invoices,
projects, jobs, daily logs, field notes, communications, signature events.

### Field Operations Agent

Responsibility: help crews capture daily logs, field notes, blockers, evidence,
punch items, service/warranty context, and closeout readiness.

Canonical records: jobs, projects, daily logs, field notes, people, vendors,
documents, communications, workflow events.

### Reporting / Insights Agent

Responsibility: summarize operational, financial, schedule, production,
collections, and communication signals from canonical evidence.

Canonical records: opportunities, projects, estimates, contracts, jobs,
invoices, payments, payment events, communications, daily logs, field notes,
workflow events.

### Admin / Compliance Agent

Responsibility: assist with organization settings, document readiness,
compliance follow-up, onboarding, controlled import/export review, and
policy-aware administrative tasks.

Canonical records: organizations, memberships, people, vendors, compliance
records, documents, settings, workflow events, audit logs.

## Authority Model

Future AI authority should be staged:

- Observe: summarize and read only.
- Recommend: suggest next actions with evidence.
- Draft: prepare changes, messages, documents, or form values for review.
- Assisted Execute: human approves before execution.
- Low-Risk Autonomy: safe repetitive actions allowed under explicit policy.
- High-Trust Autonomy: future only, tightly governed, and limited by role,
  workflow, dollar amount, customer impact, and risk.

Actions that should generally require approval include:

- sending legally binding contracts
- collecting or refunding payments
- changing invoice amounts
- deleting, archiving, voiding, or reversing important records
- rescheduling active jobs with crews or customers
- approving change orders
- placing material orders
- communicating sensitive financial, legal, compliance, or customer-commitment matters

## Governance And Safety Requirements

Long-term requirements include:

- role-aware AI permissions
- tenant-aware access and strict organization scoping
- action approval thresholds
- human-in-the-loop review
- audit trail for every AI-proposed and AI-executed action
- immutable event logging for high-risk actions
- explainability for "why did AI suggest this?"
- rollback, correction, void, or compensating workflows where possible
- confidence thresholds
- escalation rules
- customer-safe communication boundaries
- no autonomous action outside enabled modules or features
- strict separation between contractor organization settings and platform
  super-admin policy

## Action And Event Architecture Direction

Future business operations should increasingly be expressible as
permission-aware actions. Those actions should be typed, validated,
tenant-scoped, auditable, and owned by the server.

AI should call the same server-owned workflows humans use. It should not write
around them or mutate canonical records from a detached agent runtime.

Action results should write canonical events where appropriate. Event history
should support debugging, review, replay where safe, and operational trust.
Exact schema, event families, and action contracts remain future exploration
unless a later implementation plan scopes them.

## AI Memory Philosophy

AI memory should be grounded in canonical records, communication history,
workflow state, settings, and user-approved preferences.

Disconnected assistant memory must not become operational truth. User and
organization preferences may exist, but they must be tenant-scoped, governed,
inspectable, and overrideable.

Project and customer facts should be read from canonical records, not invented
or stored separately as private assistant truth.

## Communications Dependency

The communications layer is a prerequisite for powerful AI.

Email, SMS, portal messages, internal notes, manual logs, and future call or
voice artifacts should attach to canonical records. AI should not keep separate
message stores. Inbound messages may become workflow triggers only through
approved, tenant-scoped, auditable workflows. Outbound messages should be
logged, permissioned, visible in record context, and governed by approval
requirements where customer commitments or sensitive topics are involved.

## Current / Near-Term / Long-Term Separation

### Current

- deterministic workflow cues and readiness guidance
- canonical commercial, payment, signature, workflow, and communication records
- early automation-friendly architecture
- review-first GateKeeper memory and suggestion foundations where current-state
  records them

### Near-Term

- stronger project readiness and next-action clarity
- scheduling board and dispatch maturity
- communications layer maturity
- reporting and metrics maturity
- deterministic workflow automation foundations

### Later

- AI drafts, summaries, and recommendations
- AI-assisted actions with human approval
- approval queues for risky AI-prepared work

### Long-Term

- governed agentic operations across intake, scheduling, communications,
  billing, field, reporting, admin, onboarding, and support

## What This Is Not

The Agentic Operations Layer is not:

- a disconnected chatbot
- an AI-only CRM
- a second workflow engine
- a payment provider replacement
- an accounting replacement
- a system that bypasses permissions, audit rules, tenant isolation, financial
  controls, or human approval
- a reason to delay current operational core maturity

## Implementation Readiness Checklist

Future prerequisites include:

- canonical action layer
- mature communications layer
- event and audit layer
- permissions and entitlements
- workflow state machine maturity
- scheduling and dispatch maturity
- reliable payment and invoice workflows
- document generation and delivery foundation
- AI provider abstraction
- observability, testing, and evaluation
- admin settings for AI enablement
- per-organization mode controls: Guided / Flexible / Manual and AI assistance
  toggles

Until these foundations are mature, agentic AI should remain planning,
guidance, drafting, summarization, and human-approved assistance rather than
autonomous operation.
