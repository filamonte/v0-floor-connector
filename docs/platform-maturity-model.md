# Platform Maturity Model

Status: Active
Doc Type: Roadmap

This document defines FloorConnector's maturity stages for build sequencing. It is future-facing discipline, not a current-implementation scorecard.

For current implementation status, use [docs/current-state.md](C:/FloorConnector/docs/current-state.md), [docs/platform-maturity.md](C:/FloorConnector/docs/platform-maturity.md), [docs/module-status.md](C:/FloorConnector/docs/module-status.md), and [docs/known-gaps.md](C:/FloorConnector/docs/known-gaps.md).

Related documents:

- [docs/platform-build-registry.md](C:/FloorConnector/docs/platform-build-registry.md): strategic build-priority registry
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): roadmap sequencing
- [docs/communications-layer.md](C:/FloorConnector/docs/communications-layer.md): future communications strategy
- [docs/reporting-and-metrics.md](C:/FloorConnector/docs/reporting-and-metrics.md): canonical reporting and metrics strategy
- [docs/automation-layer.md](C:/FloorConnector/docs/automation-layer.md): future automation strategy
- [docs/intelligence-layer.md](C:/FloorConnector/docs/intelligence-layer.md): future intelligence strategy
- [docs/agentic-operations-layer.md](C:/FloorConnector/docs/agentic-operations-layer.md): future governed AI operating-layer strategy
- [docs/build-sequence.md](C:/FloorConnector/docs/build-sequence.md): practical build-order guidance

## Stage Model

| Stage        | Meaning                                                      | Build Rule                                                                                                                |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Foundation   | Canonical model, route, schema, or read model exists.        | Do not pretend the workflow is complete; deepen the real path before layering advanced behavior.                          |
| Operational  | Daily workflow is viable for a real contractor user.         | Improve handoffs, readiness, permissions, and edge states before broadening into intelligence or automation.              |
| Intelligence | Analytics and optimization emerge from canonical records.    | Metrics must be explainable, tenant-scoped, and drillable back to workflow evidence.                                      |
| Predictive   | Forecasting and AI recommendations use clean telemetry.      | Predictions must be reviewable and must not bypass canonical workflows or human approval for risky actions.               |
| Autonomous   | Approved automation can act within narrow policy boundaries. | Autonomous behavior requires audit, idempotency, rollback/void posture where applicable, role gates, and explicit policy. |

Later ecosystem/network maturity belongs after the operational, communications,
reporting, automation, permissions, and compliance foundations are reliable. The
future Contractor Collaboration Network is not a core-completion requirement; it
is a later maturity layer for vetted/approved partner collaboration over scoped
canonical projects and jobs.

## Why This Exists

The maturity model prevents:

- building AI before the workflow evidence is reliable
- treating agentic operations as ready before action, approval, and audit
  governance are mature
- building ecosystem or marketplace behavior before permissions and ownership are mature
- confusing foundation-level routes with production-complete workflows
- scattering feature ideas across disconnected docs and chats
- creating parallel reporting, automation, or AI truth outside the canonical record chain

## Canonical Stage Gate

Every system should be evaluated against the canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Before a system moves upward in maturity, confirm:

- it uses shared canonical records
- communications attach to operational context where messages or notifications are involved
- metrics derive from canonical evidence where reporting or dashboards are involved
- automation uses deterministic evidence and approval boundaries where workflow progression is involved
- tenant boundaries are explicit
- server-side validation exists where data mutates
- UI handoffs route to full workspaces or approved actions
- downstream records preserve lineage
- customer-facing, financial, legal, scheduling, permission, and compliance actions have appropriate approval controls

## Stage Advancement Guidance

Foundation to Operational:

- prove real create/read/update workflows
- close obvious handoff gaps
- add focused validation and tenant/RLS protections
- make the primary user path clear

Operational to Intelligence:

- define metrics from canonical evidence
- keep communication and notification evidence attached to canonical records
- prove deterministic workflow cues before predictive recommendations
- document metric ownership and caveats
- provide drill-through to source records where practical
- avoid vanity dashboards with unclear data provenance

Intelligence to Predictive:

- accumulate clean telemetry
- define model inputs and excluded data
- validate bias, privacy, tenant isolation, and explainability risks
- keep predictions advisory until action policy is approved

Predictive to Autonomous:

- require explicit owner-approved policy
- require idempotency and audit history
- require safe failure behavior
- require human review for risky categories unless a later policy narrows the exception

## Current Use

Use this model with [docs/platform-build-registry.md](C:/FloorConnector/docs/platform-build-registry.md) before starting a major platform expansion. If a proposed slice skips stages, either reduce the slice to the next maturity step or document why the dependency is already satisfied.

The AI Operational Copilot Foundation is a Foundation-stage intelligence slice:
it derives review-first summaries, recommendations, and operational draft
actions from current canonical project summaries and now rolls bounded dashboard
signals into a company-level operational digest. It does not add
live provider-backed AI, persisted AI output, predictive scoring, autonomous
actions, dashboard-owned workflow records, or new source-of-truth records. The
provider abstraction and organization controls are governance foundation only:
deterministic output remains the active path when provider enhancement is
disabled, unavailable, or not yet implemented. It must advance through
operational usage, communication composer review flows, and explicit governance
before any predictive or autonomous behavior is considered.

This document does not add schema, migrations, routes, UI, tests, provider integrations, AI behavior, reporting behavior, auth/RLS changes, or env requirements.
