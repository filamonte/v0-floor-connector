# Operational Architecture V1

Status: Active
Doc Type: Operational

This document defines the operating architecture FloorConnector should preserve
as it expands through AI-native parallel development. It is not an implemented
feature inventory. For current branch reality, use
[docs/current-state.md](C:/FloorConnector/docs/current-state.md).

## Purpose

FloorConnector should evolve as one specialty contractor operating command
center. The contractor app, portal, super-admin tools, future public
acquisition surfaces, communications, scheduling, reporting, AI, and
integrations are all surfaces around one shared operational system.

The permanent product test is:

> Does this make FloorConnector feel more like one operational command center
> and less like a collection of disconnected modules?

## Operating Spine

The canonical lifecycle remains:

```text
opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment
```

All modules, surfaces, streams, and future automations must strengthen this
chain. They may project, summarize, constrain, or guide canonical records, but
they must not fork business truth.

## Operational Command Center Principle

FloorConnector's product direction is not "more modules." It is clearer
operational continuity across the shared lifecycle.

Future work should improve at least one of these outcomes:

- teams know what needs attention now
- teams know which canonical record owns the next action
- customers act on the same shared record truth
- financial, signature, scheduling, field, and communication signals point back
  to source records
- Project Workspace becomes more useful as the operational hub
- global Manager Pages stay useful as queues without becoming separate product
  worlds
- AI, reporting, and automation explain or prepare work without owning truth

## Product Operating Layers

| Layer             | Responsibility                                                                                      | Boundary                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Canonical Records | Durable business truth for the lifecycle.                                                           | No duplicates per module, portal, provider, report, or AI layer.                         |
| Workflows         | Server-validated transitions, readiness gates, signature, payment, scheduling, and field execution. | No bypass around readiness, tenant, financial, signature, portal, or payment controls.   |
| Workspaces        | Contractor and portal surfaces that expose current context and next actions.                        | Workspaces project canonical truth; they do not create private truth.                    |
| Manager Pages     | Cross-record queues and operating lists.                                                            | They route to record workspaces and canonical actions.                                   |
| Intelligence      | Deterministic summaries, reports, cues, and future AI recommendations.                              | Intelligence must be explainable from source records and review-first for risky actions. |
| Integrations      | Provider adapters for delivery, payment, signature, accounting, calendar, and future services.      | Providers are telemetry or execution adapters, not business source of truth.             |
| Governance        | Stream lifecycle, ownership, verification, docs truth, and merge sequencing.                        | Governance does not implement features.                                                  |

## Program Operating Model

Long-running platform initiatives are coordinated through Programs before they
become waves or streams:

```text
Program -> Wave -> Stream -> PR -> Verification -> Merge
```

Programs group multiple waves around measurable contractor business outcomes.
They do not create branches, create worktrees, approve implementation, or change
implemented truth by themselves. The permanent Program model is defined in
[docs/program-architecture.md](C:/FloorConnector/docs/program-architecture.md).

Initial Programs:

- Program A: Assessment Intelligence, focused on site assessment and
  project-capture excellence.
- Program B: Operational Work Management, focused on accountability across
  sales, estimating, project management, field, and accounting.
- Program C: Communications OS, focused on unified contractor communication and
  continuity.
- Program D: Field OS, focused on making FloorConnector the primary execution
  platform for field teams.

## Permanent Planning Functions

### Jeff

Jeff owns product direction, acceptance, and final review. AI-native development
should reduce coordination burden, not remove human product judgment.

### Product Director

The Product Director function reviews current-state, roadmap, active waves, and
market/product leverage. It proposes future waves and prevents feature sprawl.

It asks:

- What is the highest-leverage next capability?
- Which operational gap creates the most friction?
- Does the proposed wave deepen the command center or add a disconnected module?
- Which streams should wait because prerequisites are not ready?

### Architecture Coordination

Architecture Coordination converts product direction into safe stream topology.
It owns lifecycle approval, stream boundaries, dependency mapping, duplicate
capability detection, UX/IA review, canonical model review, merge sequencing,
documentation synchronization, and AI prompt governance.

It never owns feature work.

Before any wave begins, Architecture Coordination must confirm stream
ownership, dependency mapping, conflict review, UX / IA impact, verification
scope, merge order, registry updates, and Jeff approval. Local worktree
existence alone is not approval to begin a stream.

### Strategic Research

Strategic Research is a permanent planning function for competitor analysis,
industry trend analysis, contractor workflow analysis, AI and automation
opportunity analysis, and quarterly capability recommendations. It informs
Program and wave selection but does not approve implementation.

### Product Council

Product Council prioritizes Programs, evaluates contractor value, prevents
feature sprawl, and ensures operational depth remains the primary objective. It
decides whether a candidate wave advances an existing Program or requires a new
Program proposal. Jeff approval and Architecture Coordination gates still apply.

### Feature Streams

Feature streams implement approved slices only. They must have defined
ownership, dependencies, forbidden scope, verification strategy, and merge
criteria before work begins.

### Verification

Verification validates source-record continuity, workflow behavior, canonical
model integrity, regressions, readiness, docs claims, and merge recommendation.

## Stream Operating Structure

The target AI-native operating loop is:

```text
Jeff
  -> Product Council / Product Director
  -> Program Planning
  -> Architecture Coordination
  -> Wave Planning
  -> Feature Streams
  -> Verification
  -> Integration Review
  -> Jeff Review
  -> Continue
```

This loop should make parallel work safer by putting ownership and verification
before merge, not by allowing more uncoordinated feature branches.

## Automated Development Readiness

Current status: Ready With Human Review Gate.

This means AI agents may prepare plans, create scoped implementation slices,
run validation, draft review packets, and recommend merge order after the
governance gate is satisfied. It does not allow autonomous merging, automatic
stream continuation, customer-facing provider actions, financial or signature
state mutation, tenant-access changes, destructive cleanup, or indefinite
development loops without Jeff review.

The review loop remains:

```text
Jeff Review
  -> Product Director Recommendation
  -> Architecture Coordination Approval
  -> Wave Proposal
  -> Stream Creation
  -> Parallel Feature Work
  -> Verification
  -> Integration Review Packet
  -> Jeff Approval
  -> Continue
```

## Information Architecture Guardrails

Target IA work must preserve these ownership rules:

- Project owns operational continuity.
- Customers own account and relationship context.
- People owns workforce, contact, access, and responsibility context.
- Financials owns cross-project billing, payment, AR, and future AP/job-costing
  review over canonical financial records.
- Field owns cross-project execution surfaces over canonical jobs, schedules,
  daily logs, work items, evidence, equipment, and service/warranty records.
- Communications owns record-linked communication continuity, not a disconnected
  inbox.
- Documents should become shared evidence/document access, not a duplicate file
  truth per module.
- Portal is customer-safe access to shared records, not a customer-owned copy.
- AI appears contextually around canonical records and review queues, not as a
  parallel operating system.

## Canonical Model Guardrails

Before approving a stream, Architecture Coordination must confirm:

- the stream uses existing canonical records when they exist
- any new model has a clear owner and does not duplicate an existing concept
- tenant ownership is explicit
- portal visibility is scoped through existing grant/access patterns or an
  approved extension
- provider state is adapter metadata or event evidence, not source-of-truth
  replacement
- AI output is guidance, draft, summary, or reviewed proposal unless explicitly
  approved otherwise

## Verification Architecture

Verification must map each stream to evidence:

- docs-only governance changes: `git diff --check`, link existence, and no app
  code/schema changes
- helper/read-model changes: targeted unit tests and typecheck where relevant
- user-facing route changes: protected route smoke or exact auth/data blocker
- portal changes: real portal auth, grants, project access, or expected denial
- financial changes: lineage/math/payment-state tests before merge
- signature/payment/provider changes: idempotency, event, and negative tests
- workflow changes: readiness, role, tenant, and canonical handoff checks

Blocked checks should be reported as blocked, not converted into success.

## Release Coordination

Release coordination should happen after verification and before final review:

- confirm merge order
- confirm docs truth
- confirm no active stream owns a conflicting area
- confirm follow-up dependencies
- confirm risky provider, AI, financial, signature, portal, tenant, and
  workflow behavior has a rollback or disable posture where relevant

## What This V1 Establishes

Operational Architecture V1 establishes:

- Operational Command Center as a governing architecture principle
- Product Director as a planning layer above feature streams
- Architecture Coordination as permanent governance
- Verification as a merge-readiness function
- stream lifecycle as mandatory
- source-record continuity as the acceptance standard
- review-driven development as the target AI-native organization model

It does not establish autonomous merging, autonomous provider action,
autonomous customer communication, autonomous financial action, new schema, new
runtime behavior, or a new product subsystem.
