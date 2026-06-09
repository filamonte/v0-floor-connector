# Capability Registry

Status: Active
Doc Type: Current Truth

This registry tracks FloorConnector capability maturity across Programs, Waves,
and Streams. It is the preferred progress layer for long-running product
capabilities. It does not replace implemented truth in
[docs/current-state.md](C:/FloorConnector/docs/current-state.md), roadmap
sequencing in [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md), or stream
approval in [active-waves.md](C:/FloorConnector/active-waves.md) and
[.codex/active-stream-plan.md](C:/FloorConnector/.codex/active-stream-plan.md).

Use this registry with
[docs/capability-map.md](C:/FloorConnector/docs/capability-map.md),
[docs/document-map.md](C:/FloorConnector/docs/document-map.md),
[docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md),
[docs/program-architecture.md](C:/FloorConnector/docs/program-architecture.md),
and [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md).

Use [docs/capability-map.md](C:/FloorConnector/docs/capability-map.md) when
you need strategic Capability -> Program -> Wave -> Stream navigation. Use this
registry when you need maturity, status, dependencies, success metrics, and
quarterly capability review inputs.

## Purpose

Capability maturity is the durable measure of progress. Program count, wave
count, stream count, pull request count, and commit count are activity measures;
they are not contractor success metrics.

This registry answers:

- Which contractor capabilities are being matured?
- Which Program owns each capability?
- Which Waves and Streams are moving the capability?
- What dependencies must stay intact?
- What contractor outcomes prove maturity?

## Hierarchy

The governed planning hierarchy is:

```text
Capability -> Program -> Wave -> Stream
```

Definitions:

- Capability: a contractor business outcome FloorConnector must become strong
  at over time.
- Program: a long-running strategic initiative that owns the capability
  direction.
- Wave: a bounded delivery portfolio inside a Program.
- Stream: the smallest independently owned implementation, verification,
  documentation, or governance slice.

For now, the initial capabilities map one-to-one with the initial Programs.
Later capabilities may span more than one Program, but no Wave may begin without
an explicit Capability and Program mapping.

## Status Vocabulary

| Status         | Meaning                                                                      |
| -------------- | ---------------------------------------------------------------------------- |
| `Planned`      | Capability is defined but no active or recently merged Wave is moving it.    |
| `Active`       | Capability has an active or recently merged Wave and remains open for depth. |
| `Verification` | Implementation is complete for a Wave and evidence is under review.          |
| `Complete`     | Intended capability outcome is delivered and no further Waves are required.  |

## Maturity Model

| Score range | Stage             | Meaning                                                                    |
| ----------- | ----------------- | -------------------------------------------------------------------------- |
| 0-20        | Foundation        | Basic structures, first read models, or first workflow surfaces exist.     |
| 20-40       | Early Operational | Users can start relying on the capability in bounded situations.           |
| 40-60       | Usable            | The capability supports repeated real workflows with known gaps.           |
| 60-80       | Production Ready  | The capability is broadly usable, verified, and operationally durable.     |
| 80-100      | Platform Strength | The capability is a differentiated platform strength with measurable lift. |

Maturity scores should change only after verified implementation, completed
review packets, meaningful evidence, or quarterly capability review. A proposed
Wave by itself does not increase maturity.

## Registry

| Capability                  | Purpose                                                                                   | Business Outcome                                                                                      | Status  | Maturity Score | Owning Program                         | Active Waves                                                                           | Dependencies                                                                                                   | Success Metrics                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------- | -------------- | -------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Assessment Intelligence     | Project-owned pre-estimate assessment, capture, review, and handoff context.              | Fewer missed details, faster estimator review, better downstream reuse of site and scope context.     | Active  | 5              | Program A: Assessment Intelligence     | Recent: `guided-project-capture-v1` merged; future assessment depth requires approval. | Canonical Project context; Estimate approved-context consumption; customer-safe Portal input; review-only AI.  | Assessment completeness, missing-info reduction, estimate rework reduction, handoff speed, source-record reuse.    |
| Operational Work Management | Accountability, work ownership, labor visibility, and cross-role operating queues.        | Office, PM, field, and accounting teams know who owns work, what is late, and what needs action.      | Planned | 0              | Program B: Operational Work Management | None.                                                                                  | Canonical Work Items, People, Projects, Jobs, time/labor data, Financials, Field, Communications ownership.    | Unowned-work reduction, assignment clarity, overdue-work reduction, labor visibility, handoff latency.             |
| Communications OS           | Unified record-linked communication continuity across customer and contractor workflows.  | Contractors stop losing follow-ups across email, phone, portal, internal notes, and project handoffs. | Planned | 0              | Program C: Communications OS           | None.                                                                                  | `communication_threads`, `communication_messages`, portal safety, provider adapters, review-only AI.           | Response latency, unlinked-message reduction, follow-up completion, customer-safe continuity, send-proof coverage. |
| Field OS                    | Mobile and field execution workflows tied to project, job, schedule, proof, and closeout. | Field teams receive clearer work packets, capture execution proof, and move projects toward closeout. | Planned | 0              | Program D: Field OS                    | None.                                                                                  | Jobs, schedule, daily logs, field notes, execution attachments, Work Items, People, equipment, closeout proof. | Daily-log completion, blocker closure, field-proof completeness, closeout readiness, schedule-to-field continuity. |

## Capability Details

### Assessment Intelligence

Current posture: Foundation, active at 5 percent maturity.

Program A owns the direction for project-owned Assessment Packages, guided
capture review, customer-safe capture input, risk signal visibility, missing
information guidance, and estimate handoff continuity.

Allowed direction:

- keep Assessment Packages owned by Projects
- let Estimates consume approved assessment context
- keep customer portal capture customer-safe
- keep AI in review, assist, observation, and draft-preparation mode
- reuse canonical customers, projects, estimates, documents, attachments, and
  workflow records

Forbidden direction:

- duplicate project, estimate, attachment, task, workflow, or pricing models
- direct pricing generation
- direct estimate-line generation
- autonomous approval
- portal-owned assessment truth
- schema or migration changes without explicit separate approval

### Operational Work Management

Current posture: Planned, 0 percent maturity in this registry.

Program B owns future work around workforce and labor visibility, Work Item
depth, assignment clarity, due-date visibility, escalation, role-aware ownership
queues, and accountability across sales, estimating, project management, field,
and accounting.

Allowed direction:

- deepen canonical Work Items instead of inventing disconnected tasks
- connect ownership to existing records and workspaces
- expose labor visibility through canonical people, assignments, time, jobs, and
  projects

Forbidden direction:

- disconnected task applications
- local-only reminders
- separate labor or crew truth
- office-only or field-only copies of canonical work

### Communications OS

Current posture: Planned, 0 percent maturity in this registry.

Program C owns future record-linked communication continuity, contractor inbox
discipline, follow-up capture, customer-safe communication surfaces, delivery
proof, provider-backed communication when separately approved, and AI-assisted
drafting under human review.

Allowed direction:

- link communication to canonical customers, opportunities, projects, estimates,
  contracts, invoices, jobs, and Work Items
- preserve customer-visible/internal boundaries
- route messages and follow-ups into reviewable work

Forbidden direction:

- detached inboxes that become the real CRM
- provider-owned communication truth
- AI-only customer commitments
- portal-only communication copies

### Field OS

Current posture: Planned, 0 percent maturity in this registry.

Program D owns future mobile field depth, field packets, job execution
visibility, blocker and issue handling, closeout proof, inspections, punchlists,
and field-to-office continuity.

Allowed direction:

- keep field work attached to Projects, Jobs, Daily Logs, field notes,
  execution attachments, People, and Work Items
- connect field evidence to closeout and billing readiness
- use mobile surfaces as workflow views over canonical records

Forbidden direction:

- mobile-only job truth
- duplicate field task models
- detached closeout proof stores
- field-only customer communication state

## Ownership

| Responsibility            | Owner                                     | Rule                                                                |
| ------------------------- | ----------------------------------------- | ------------------------------------------------------------------- |
| Capability priority       | Product Council                           | Decides which capability deserves the next recommendation.          |
| Capability boundary       | Architecture Coordination                 | Confirms canonical ownership, dependencies, and forbidden areas.    |
| Capability maturity score | Product Council + Verification            | Changes only after evidence-backed review.                          |
| Program alignment         | Program owner + Architecture Coordination | Ensures Waves belong to the right Program and capability.           |
| Wave recommendation       | Product Director                          | Recommends options; does not approve implementation.                |
| Stream approval           | Architecture Coordination + Jeff          | Stream/worktree creation requires explicit approval.                |
| Implemented truth         | Architecture Coordination                 | `docs/current-state.md` remains the implementation source of truth. |

## Update Triggers

Update this registry when:

- a Wave is approved, enters Verification, merges, or is explicitly deferred
- a review packet changes the maturity evidence for a capability
- a new Capability or Program is approved for planning
- quarterly Capability Review identifies maturity, dependency, or metric drift

Do not update maturity for:

- speculation
- PR count
- stream count
- commits without verified contractor outcome
- future vision language without current-state support

## Review Cadence

Quarterly reviews:

- Capability Review: reassess maturity scores, outcomes, dependencies, and next
  candidate Waves.
- Program Review: confirm Programs still map to meaningful contractor outcomes.
- Documentation Review: confirm the registry still matches the document map,
  roadmap, active registries, and handoff.
- Archive Review: identify old capability proposals or packets that should be
  moved only after explicit owner approval.
