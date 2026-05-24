# Automation Layer

Status: Planned
Doc Type: Roadmap

This document defines FloorConnector's long-term automation philosophy. It is strategic architecture guidance only. It does not add automation runtime behavior, background jobs, providers, AI agents, routes, schema, migrations, notifications, or workflow mutations.

For implemented truth, use [docs/current-state.md](C:/FloorConnector/docs/current-state.md). For strategic sequencing, use [docs/platform-maturity-model.md](C:/FloorConnector/docs/platform-maturity-model.md) and [docs/platform-build-registry.md](C:/FloorConnector/docs/platform-build-registry.md).

Related documents:

- [docs/communications-layer.md](C:/FloorConnector/docs/communications-layer.md): future workflow-connected communication philosophy
- [docs/reporting-and-metrics.md](C:/FloorConnector/docs/reporting-and-metrics.md): canonical metric philosophy
- [docs/intelligence-layer.md](C:/FloorConnector/docs/intelligence-layer.md): future operational intelligence strategy
- [docs/agentic-operations-layer.md](C:/FloorConnector/docs/agentic-operations-layer.md): future governed agentic AI operating-layer strategy
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): platform maturity sequencing
- [docs/ai/README.md](C:/FloorConnector/docs/ai/README.md): AI-readable boundaries

## Purpose

Automation should extend the canonical workflow chain.

The long-term goal is not "AI agents everywhere." The goal is safe workflow progression over real FloorConnector records, with deterministic evidence first, human approval where risk exists, and tightly governed autonomy only after the operational data, metrics, and review paths are mature.

The canonical lifecycle remains:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Automation must reinforce project continuity, operational readiness, workflow progression, communications continuity, and financial integrity.

## Automation Vs Agentic AI

Automation in this document means deterministic, rule/workflow-based behavior:
triggers, reminders, queues, server-owned actions, eligibility checks, and
readiness-driven operational follow-up. It is not the same thing as autonomous
or agentic AI.

This layer is a prerequisite and bridge for later agentic operations because it
can produce reliable actions and audit-friendly events that future AI may
recommend or invoke under governance. It must continue to preserve canonical
records, permissions, tenant boundaries, and auditability.

## Why Automation Matters

Specialty contractors lose time and money when work stalls between records:

- estimates are sent but not followed up
- contracts are signed but deposits or scheduling do not happen
- jobs are ready but not assigned
- invoices age without collections follow-through
- customer communication is disconnected from operational next steps

Automation should reduce these handoff gaps without creating a second workflow engine. The first valuable automation is often simple, deterministic, and explainable: surface the right cue, route to the right workspace, prefill the right action, and require a person to confirm before the system changes customer-facing, financial, legal, scheduling, permission, or compliance state.

## Canonical Workflow Automation

Automation must act around canonical FloorConnector subjects:

- opportunity
- customer
- project
- estimate
- contract
- change order
- job
- invoice
- payment
- communication
- work item
- field evidence

Automation should move users through the existing Manager Pages, Record Workspaces, Project Workspace, portal-safe actions, and approved server-side workflows. It must not create duplicate lead, customer, project, task, invoice, payment, schedule, message, or AI-only action chains.

## Event-Driven Philosophy

Future automation should be workflow-event-driven.

Useful event families include:

- estimate sent, viewed, approved, declined, or stale
- contract sent, viewed, signed, declined, or awaiting countersign
- change order sent, approved, or rejected
- project readiness changed
- job scheduled, unscheduled, started, blocked, or completed
- invoice sent, due, overdue, paid, failed, voided, or partially paid
- payment requested, initiated, succeeded, failed, or reconciled
- communication received, bounced, unanswered, or customer-replied
- field note, daily log, punchlist, equipment, incident, or service event created

Provider events may enrich this model, but providers are not business sources of truth. Automation should normalize external signals into canonical evidence before proposing or executing workflow action.

## Deterministic Vs AI Automation

Deterministic automation comes first.

Examples:

- derive a cue from an overdue invoice
- route a signed-and-ready project to job creation or scheduling
- remind a user that a sent estimate crossed a configured threshold
- prefill a work item from a supported canonical cue
- create internal notification evidence for a manual, tenant-scoped run

AI automation comes later and should start as assistance:

- summarize evidence
- draft a message
- explain a blocker
- propose a next action
- classify communication
- prepare an approval-ready action package

AI should not be the first detector for critical workflow state. AI outputs are drafts, explanations, recommendations, or proposals until deterministic evidence, approval paths, audit, and risk policy are mature.

## Safe Automation Boundaries

Automation must preserve:

- tenant isolation
- role-aware authorization
- project readiness gates
- server-side validation
- financial lineage and event history
- portal and contractor shared-record boundaries
- provider adapter boundaries
- auditability and idempotency

Automation must not:

- bypass pricing, approvals, contracts, signatures, invoices, payments, scheduling readiness, permissions, or compliance
- create fake or local-only records
- mutate financial state without an approved workflow path
- send customer-facing messages without consent, eligibility, and review rules
- execute provider actions from disconnected module-local logic
- hide workflow state in opaque background behavior

## Human Approval Requirements

Human approval is required for risky categories:

- customer-facing communication
- price, scope, estimate, contract, or change-order changes
- invoice, payment, refund, dispute, tax, retainage, or reconciliation actions
- scheduling commitments or rescheduling that affects crews/customers
- permission, portal access, or customer-identity actions
- legal, compliance, OSHA, safety, or warranty commitments
- provider actions that create external obligations

Low-risk internal automation may become configurable later, but only after the relevant deterministic evidence, authorization checks, audit trail, and rollback or void posture are designed.

## Workflow Triggers

Future workflow triggers should be narrow and named.

Candidate trigger families:

- commercial: estimate sent, estimate stale, customer approved, contract needed
- signature: contract sent, customer viewed, signer completed, countersign needed
- readiness: contract signed, deposit required, deposit paid, project ready
- scheduling: job created, job unscheduled, crew missing, conflict detected
- production: job started, daily log missing, punchlist open, equipment unavailable
- financial: invoice sent, invoice due, invoice overdue, payment failed, payment posted
- communication: customer replied, delivery failed, unanswered thread, portal action received

Triggers should produce explainable eligibility and proposed next action. They should not become a generic expression-builder free-for-all before built-in workflow automation proves the model.

## Future AI Orchestration

Future AI orchestration should sit above deterministic automation, not replace it.

AI may eventually coordinate:

- evidence summaries
- action recommendations
- communication drafts
- schedule options
- collections suggestions
- risk explanations
- approval queue preparation

AI orchestration must route accepted actions through canonical FloorConnector workflows. It must not own a separate workflow graph, lead list, communication log, calendar, billing state, project memory, or task system.

The later Agentic Operations Layer should be treated as governed automation
plus intelligence over canonical actions, permissions, and audit trails. It is
not permission to create autonomous agents before communications, reporting,
deterministic automation, approval queues, and operational core maturity are
ready.

## What FloorConnector Avoids

FloorConnector should avoid:

- black-box automation
- disconnected bots
- siloed automation engines
- module-local automations
- unsafe autonomous financial behavior
- provider-specific workflow logic scattered across pages
- customer-facing auto-sends without review and consent posture
- AI agents that create duplicate business truth
- automation dashboards that cannot explain the source records behind an action

## Relationship To Intelligence Layer

Intelligence explains what is happening and recommends what may happen next. Automation prepares or performs the next step.

The right sequence is:

1. canonical workflow evidence
2. reliable reporting and metrics
3. deterministic cues and recommendations
4. human-confirmed automation
5. predictive guidance
6. narrowly governed autonomous behavior

Automation should not outrun the Intelligence Layer. Predictive or benchmark-driven automation should wait until metrics, privacy, governance, and approval boundaries are explicit.

## Relationship To Communications Layer

Many automations will start or end with communication, but communication must stay attached to operational context.

Automation may eventually:

- remind an internal owner about a stalled customer response
- prepare a follow-up draft from an estimate cue
- route a portal reply to the relevant project or invoice
- suggest a scheduling update after customer confirmation
- produce delivery-failure follow-through

It must not create a standalone messaging workflow disconnected from the project, estimate, contract, job, invoice, or payment that caused the need.

## Maturity Sequencing

Automation follows the platform maturity model:

| Stage        | Automation Interpretation                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| Foundation   | Canonical event sources, cue settings, work items, notification foundations, and audit ledgers exist.           |
| Operational  | Daily workflows can use deterministic cues, safe routing, prefilled actions, and explicit user confirmation.    |
| Intelligence | Metrics and evidence explain why automation is recommended and how it affects the workflow.                     |
| Predictive   | Forecasts and AI suggestions prepare action proposals, still reviewable by humans.                              |
| Autonomous   | Narrow approved policies allow low-risk actions with audit, idempotency, role gates, and safe failure behavior. |

## Summary

The Automation Layer should make FloorConnector feel like a connected operating system without hiding control from the contractor. It should advance the canonical workflow, protect financial and customer commitments, and mature from deterministic evidence to reviewed intelligence before any autonomous behavior is allowed.
