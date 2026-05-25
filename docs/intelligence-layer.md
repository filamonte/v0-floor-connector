# FloorConnector Intelligence Layer

Status: Planned
Doc Type: Roadmap

This document defines FloorConnector's future Intelligence Layer. It is strategy and sequencing guidance only. It does not claim analytics, benchmarking, predictive AI, or autonomous optimization are implemented unless [docs/current-state.md](C:/FloorConnector/docs/current-state.md) says so.

Related documents:

- [docs/vision.md](C:/FloorConnector/docs/vision.md): long-term platform thesis
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): maturity sequencing
- [docs/platform-build-registry.md](C:/FloorConnector/docs/platform-build-registry.md): strategic build-priority registry
- [docs/platform-maturity-model.md](C:/FloorConnector/docs/platform-maturity-model.md): stage model for build discipline
- [docs/ai/README.md](C:/FloorConnector/docs/ai/README.md): AI-readable implementation boundaries
- [docs/security-threat-model.md](C:/FloorConnector/docs/security-threat-model.md): tenant, privacy, provider, and service-role risk framing

## Strategic Position

The Intelligence Layer is not a reporting module.

Reporting is mostly historical, passive, and descriptive. FloorConnector intelligence should become operational, comparative, predictive, workflow-aware, and decision-oriented.

The strategic opportunity exists because FloorConnector preserves the same canonical record chain across sales, operations, finance, customer review, field execution, and payment:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Most contractor systems fragment that chain. FloorConnector should use the continuity of its canonical records as the foundation for future operational intelligence.

## Core Rule

Intelligence must be canonical-first.

That means:

- analytics derive from canonical workflow records
- canonical records remain the source of truth
- no duplicate reporting database becomes business truth
- no disconnected BI silo owns metrics
- no manual metric entry replaces workflow evidence
- no AI-only data chain owns contractor operations
- all tenant-owned intelligence preserves organization boundaries

Metric surfaces may eventually use projections, summaries, warehouses, or derived models for performance. Those projections must remain downstream of canonical FloorConnector records, auditable back to source records, and clearly separated from business truth.

## Intelligence Families

### Contractor Intelligence

Contractor Intelligence is private, tenant-scoped operational intelligence for a single contractor organization.

Future examples:

- close rates
- estimator performance
- lead-source performance
- production metrics
- profitability metrics
- collections metrics
- workflow bottlenecks
- operational forecasting
- readiness intelligence
- margin analysis
- labor efficiency
- schedule performance

This family should mature after the operational and reporting foundations are trustworthy enough to compute metrics from real workflow evidence.

### Network Intelligence

Network Intelligence is opt-in, anonymized, aggregated benchmarking across the contractor network.

Future examples:

- regional pricing trends
- close-rate benchmarking
- lead-source benchmarking
- workflow benchmarking
- labor efficiency trends
- product and system popularity
- operational timing benchmarks
- margin benchmarking
- seasonal trends
- industry intelligence reports

Network Intelligence must never expose another contractor's tenant data. It requires explicit opt-in posture, aggregation thresholds, privacy review, governance documentation, and clear separation between tenant-owned analytics and platform-level benchmark products.

### Predictive And AI Intelligence

Predictive and AI Intelligence should come after clean operational telemetry exists.

Future examples:

- predictive close likelihood
- risk forecasting
- payment-delay prediction
- crew-performance prediction
- recommended next actions
- AI operational guidance
- workflow optimization suggestions

AI outputs should be explanations, recommendations, drafts, or approval-ready proposals until a later approved automation workflow adds tightly governed execution. Customer-facing, financial, legal, scheduling, permission, or compliance actions require human confirmation unless a future policy explicitly allows low-risk automation.

## Governance Boundaries

The Intelligence Layer must preserve:

- tenant isolation
- role-aware authorization
- canonical lifecycle continuity
- portal and contractor shared-record boundaries
- provider adapter boundaries
- privacy and consent requirements
- auditability for important financial, compliance, and customer-facing signals

The Intelligence Layer must not introduce:

- duplicate lead, customer, project, job, invoice, payment, communication, or task models
- AI-owned workflow truth
- provider-owned metric truth
- cross-tenant leakage
- opt-out benchmarking by default
- rankings or public comparisons before governance is explicit
- autonomous actions before deterministic evidence, review queues, and approval paths are mature

## Metric Philosophy

Metrics should be explainable from the record chain.

Every important metric should answer:

- Which canonical records generated this value?
- Which tenant and permission boundary applies?
- Is this implemented data, derived data, or target-only planning?
- Is the metric private to one contractor or part of an anonymized platform benchmark?
- Is the metric descriptive, operational, predictive, or recommended action?
- Can a user drill from the metric to the underlying workflow evidence?

Early intelligence should prefer a smaller number of trusted metrics over broad dashboards that look complete but cannot be explained.

## Sequencing

Recommended order:

1. Operational core completion and project-centered continuity.
2. Scheduling, dispatch, communications, and field execution depth.
3. Reporting foundations with explainable canonical metrics.
4. Contractor Intelligence over tenant-owned workflow evidence.
5. Opt-in Network Intelligence with anonymization and governance.
6. Predictive and AI Intelligence with human-governed recommendations.
7. Controlled automation only after signals, reviews, and approvals are proven.

Do not build advanced AI, benchmarking, marketplace intelligence, or autonomous optimization before the underlying workflow data is reliable.

## Current Boundary

The first implemented bridge into this strategy is the deterministic
[AI Operational Copilot Foundation](C:/FloorConnector/docs/ai-operational-copilot-foundation.md).
It derives project-level summaries, recommended next actions, digest grouping,
communication-assistance draft text, field summaries, and structured
review-first draft actions from existing canonical project read models.
Those draft actions now have a bounded `/communications` handoff: users can move
a Copilot draft into existing thread review/prefill context, edit it, and
explicitly save it as an internal canonical communication message only when a
thread already exists. Missing communication threads remain copy/review only.

The alignment hierarchy is:

`canonical records -> deterministic workflow/readiness signals -> intelligence derivation layer -> Copilot summaries/recommendations -> review-first operational draft actions -> communications review handoff -> dashboard operational digest -> future provider-backed enhancement -> future orchestration/automation later`

Copilot is therefore the user-facing presentation and action-composer layer over
deterministic intelligence signals. It is not a parallel cue, readiness,
recommendation, memory, or orchestration system. It does not add schema,
migrations, provider AI calls, persisted AI outputs, predictive scoring, billing
behavior, portal behavior, auth/RLS changes, or autonomous action behavior.

The first dashboard rollup now extends the same hierarchy into an AI
Operational Digest on the contractor dashboard. That digest aggregates bounded
dashboard/project signals into attention, ready-to-move, financial, signature,
field/execution, and suggested-draft sections. It is a company-level entry
surface into canonical project, contract, invoice, job, schedule, and equipment
workspaces, not a reporting warehouse, BI truth layer, AI memory system, or
automation runner.

The provider-ready slice adds governance without changing that boundary.
Organization workflow settings can enable or suppress Copilot summaries, draft
actions, dashboard digest visibility, and future provider-backed enhancement.
The provider facade currently has no live model integration and falls back to
deterministic canonical-context output when provider enhancement is enabled but
unavailable. Future model calls must use that facade or a successor internal
adapter rather than scattering provider SDK logic through pages or components.

Everything beyond that foundation remains strategic platform guidance only.
