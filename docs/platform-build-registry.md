# Platform Build Registry

Status: Active
Doc Type: Roadmap

This registry is FloorConnector's strategic build-priority map. It is not Jira, not a sprint plan, and not implemented truth.

Use it to remember major platform expansion areas, sequence them deliberately, and prevent attractive future systems from being built before their leverage points are ready. For implemented reality, use [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

Related documents:

- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md): broad platform maturity sequencing
- [docs/platform-maturity-model.md](C:/FloorConnector/docs/platform-maturity-model.md): stage discipline
- [docs/communications-layer.md](C:/FloorConnector/docs/communications-layer.md): future communications strategy
- [docs/reporting-and-metrics.md](C:/FloorConnector/docs/reporting-and-metrics.md): canonical reporting and metrics strategy
- [docs/automation-layer.md](C:/FloorConnector/docs/automation-layer.md): future automation strategy
- [docs/intelligence-layer.md](C:/FloorConnector/docs/intelligence-layer.md): future intelligence strategy
- [docs/agentic-operations-layer.md](C:/FloorConnector/docs/agentic-operations-layer.md): future governed AI operating-layer strategy
- [docs/build-sequence.md](C:/FloorConnector/docs/build-sequence.md): practical near-term build-order rules
- [docs/future-feature-coverage-map.md](C:/FloorConnector/docs/future-feature-coverage-map.md): broad feature coverage map

## Registry Rules

- Preserve the canonical lifecycle: `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`.
- Treat `docs/current-state.md` as implemented truth.
- Prefer one meaningful guarded slice over scattered polish.
- Do not create duplicate business models or module-local systems.
- Do not promote target architecture to current capability.
- Revisit dependencies before starting any high-priority system.
- Update this registry when a major planned system changes priority, maturity, dependency, or strategic rationale.

## Strategic Build Stack

| Tier   | Focus                             | Current Discipline                                                                                                           |
| ------ | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Tier 1 | Operational Core Completion       | Strengthen the existing canonical workflow and Project Workspace continuity.                                                 |
| Tier 2 | Scheduling And Communications     | Deepen dispatch, readiness, customer communication, and delivery proof over shared records.                                  |
| Tier 3 | Reporting And Workflow Automation | Build explainable metrics, deterministic guidance, and human-confirmed automation from canonical evidence.                   |
| Tier 4 | Intelligence Layer                | Add tenant-scoped operational intelligence and later opt-in benchmark products.                                              |
| Tier 5 | Predictive AI                     | Add forecasting and AI recommendations after clean telemetry and review queues exist.                                        |
| Tier 6 | Ecosystem And Marketplace         | Add network, marketplace, and broader ecosystem behavior only after permissions, ownership, and trust boundaries are mature. |

## Capability Registry

| System                                     | Priority | Depends On                                                                                                          | Status                        | Strategic Rationale                                                                                                                                                               |
| ------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project Workspace maturity                 | Critical | Canonical records and current workspace shell                                                                       | Active / ongoing              | Project is the continuity hub for readiness, handoff, field execution, billing, service, warranty, and closeout context.                                                          |
| Scheduling and dispatch depth              | Critical | Jobs, readiness, people/crew, equipment, schedule handoff                                                           | Foundation / planned depth    | Dispatch is the daily operating surface where job readiness turns into production execution.                                                                                      |
| Communications Layer                       | Critical | Communication threads/messages, portal access, notification foundations, provider boundaries                        | Foundation / planned depth    | Customer and internal communication must attach to operational context before AI, reminders, delivery proof, or unified inbox depth.                                              |
| Reporting and Metrics Layer                | High     | Canonical records, financial lineage, schedule/job state, deterministic cues                                        | Foundation / planned depth    | Trusted operational intelligence requires explainable metrics before broad dashboards, benchmarking, forecasting, or automation.                                                  |
| Automation Layer                           | High     | Deterministic cues, work items, notifications, approval gates, canonical metrics                                    | Foundation / planned depth    | Automation should reinforce canonical workflows with human review before provider-backed, predictive, or autonomous actions.                                                      |
| Intelligence Layer                         | High     | Reporting maturity, communications continuity, operational telemetry, privacy governance                            | Planned                       | This is the future operational intelligence system: contractor intelligence, opt-in network benchmarks, and later predictive guidance.                                            |
| Agentic Operations Layer                   | Later    | Operational core maturity, communications continuity, reporting, deterministic automation, action/audit governance  | Target direction              | Governed AI agents should operate through canonical records, permissions, server-owned actions, events, and audit trails only after the foundations can support them.             |
| Portal maturity                            | High     | Shared portal records, permissions, delivery proof, customer-safe actions                                           | Foundation / planned depth    | The portal must remain a customer-facing surface over shared canonical records, not a separate customer system.                                                                   |
| Materials and catalog depth                | High     | Catalog items, system templates, estimate/invoice lineage, inventory foundations                                    | Foundation / planned depth    | Specialty contractors need pricing, production, materials, and system logic to flow into estimates, jobs, invoices, and closeout.                                                 |
| Business documents source                  | Medium   | Shared templates, documents bucket, signature architecture, canonical record subjects                               | Planned / partial foundations | Estimates, contracts, invoices, warranties, work orders, and SOW output should share governed template/document behavior.                                                         |
| OSHA, safety, and compliance reporting     | Medium   | Incidents, trainings, compliance records, field evidence                                                            | Planned                       | Compliance reporting should derive from field and workforce evidence, not manual parallel logs.                                                                                   |
| Accounting and tax integrations            | Medium   | Financial event history, invoice/payment truth, export posture                                                      | Planned                       | External accounting should sync from FloorConnector financial truth through adapters.                                                                                             |
| AI-assisted takeoff and scope intelligence | Medium   | Catalog/system templates, document/file evidence, human review queues                                               | Planned                       | AI or takeoff inputs should produce reviewed quantities and scope suggestions, not bypass estimate workflow.                                                                      |
| Contractor websites and acquisition        | Medium   | Opportunity intake, source attribution, public forms, tenant-owned content boundaries                               | Planned                       | Public acquisition should feed canonical opportunities instead of becoming a separate website-builder database.                                                                   |
| Contractor Collaboration Network           | Later    | Project Workspace maturity, permissions/RLS design, Communications Layer, scheduling maturity, compliance readiness | Future / not implemented      | Future approved-partner and project/job-scoped collaboration must avoid duplicate jobs/projects, public marketplace behavior, and external partner financial mutation by default. |
| Networked work and marketplace             | Later    | Contractor Collaboration Network, compliance, financial ownership, benchmark governance                             | Deferred                      | Network behavior should start invite-based and record-scoped before any broad marketplace or revenue-network product.                                                             |
| Predictive AI and autonomous orchestration | Later    | Intelligence Layer, telemetry quality, approval queues, safety policy                                               | Deferred                      | Predictive and autonomous behavior should wait until signals, review paths, and risk boundaries are proven.                                                                       |

## Build Order Discipline

The near-term leverage remains:

1. Project workspace maturity.
2. Scheduling and dispatch.
3. Communications continuity.
4. Reporting foundations.
5. Workflow automation.
6. Portal maturity.
7. Intelligence Layer.

Avoid jumping ahead into marketplace behavior, agentic operations, advanced AI
agents, giant integration ecosystems, or overexpanded modules before the
current operational chain is trustworthy enough to support them.

## Updating The Registry

When a major capability changes, update:

- priority: Critical, High, Medium, Later
- dependency: the prerequisite platform truth
- status: Current Truth, Active, Foundation, Planned, Deferred
- rationale: why it matters strategically

If a capability becomes implemented, update [docs/current-state.md](C:/FloorConnector/docs/current-state.md) and any relevant status docs. This registry alone must never be used as proof that a system is built.
