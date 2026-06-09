# Program Architecture

Status: Active
Doc Type: Governance

This document defines the permanent Program layer above FloorConnector waves
and streams. It is a planning and coordination model only. It does not
implement application behavior, approve a wave, create a stream, create a
worktree, modify schema, open a PR, or authorize a merge.

For implemented truth, use
[docs/current-state.md](C:/FloorConnector/docs/current-state.md). For stream,
worktree, verification, and merge rules, use
[docs/parallel-development-governance.md](C:/FloorConnector/docs/parallel-development-governance.md),
[active-worktrees.md](C:/FloorConnector/active-worktrees.md), and
[.codex/active-stream-plan.md](C:/FloorConnector/.codex/active-stream-plan.md).

## Execution Model

The permanent governed execution chain is:

```text
Program -> Wave -> Stream -> PR -> Verification -> Merge
```

A Program is a long-running strategic initiative that produces a major
contractor business capability across multiple waves. A Wave is a bounded
delivery portfolio inside one Program. A Stream is the smallest independently
owned implementation, verification, documentation, or governance slice.

Program approval does not authorize implementation. A wave still needs Product
Council prioritization, Architecture Coordination approval, dependency review,
active registry updates, verification strategy, merge-order planning, and Jeff
approval before any stream or worktree is created.

## Program Definition

Every Program must record:

- program id and name
- designated owner
- strategic goal
- measurable contractor business outcomes
- active and planned waves
- upstream and downstream dependencies
- cross-wave coordination needs
- cross-stream ownership risks
- verification posture
- health status

Allowed Program health statuses:

- `Planned`: defined but not active.
- `Active`: one or more approved or recently merged waves are moving the
  Program forward.
- `Blocked`: blocked by unresolved ownership, dependency, validation, product,
  or external decision.
- `Verification`: implementation is complete for an active wave and Program
  evidence is being reviewed.
- `Complete`: intended Program outcome is delivered and no additional waves are
  required for the stated goal.

## Initial Programs

| Program | Name                        | Owner                    | Goal                                                                                                     | Health  | Current wave posture                                                                                    |
| ------- | --------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| A       | Assessment Intelligence     | Guided Capture Product   | Become the contractor industry's best site-assessment and project-capture platform.                      | Active  | `guided-project-capture-v1` is merged; future assessment depth requires separate approval.              |
| B       | Operational Work Management | Operations Product       | Complete operational accountability across sales, estimating, project management, field, and accounting. | Planned | Candidate future waves may cover workforce, labor visibility, work-item depth, and ownership queues.    |
| C       | Communications OS           | Communications Product   | Build a unified contractor communication and continuity system.                                          | Planned | Candidate future waves may cover unified inbox, record-linked follow-up, provider delivery, and memory. |
| D       | Field OS                    | Field Operations Product | Make FloorConnector the primary execution platform for field teams.                                      | Planned | Candidate future waves may cover mobile field depth, field packets, closeout, inspections, and proof.   |

## Program A: Assessment Intelligence

Strategic goal: become the contractor industry's best site-assessment and
project-capture platform before estimate work begins.

Contractor outcomes:

- fewer missed site details before estimating
- clearer customer, site, scope, photo, and measurement context
- faster estimator review
- fewer estimate revisions caused by missing pre-estimate information
- better continuity from customer input to internal assessment to estimate
  handoff

Primary capability areas:

- project-owned Assessment Packages
- customer-safe assessment capture
- internal guided capture workspace
- missing-information guidance
- risk signal visibility
- estimator handoff continuity
- future human-reviewed AI observations

Boundary: Project owns assessment context. Estimate consumes approved context.
Portal may contribute customer-safe input but must not own operational truth.
AI remains review/assist only.

## Program B: Operational Work Management

Strategic goal: complete operational accountability across sales, estimating,
project management, field, and accounting.

Contractor outcomes:

- clearer ownership of work and follow-up
- fewer stalled handoffs between departments
- better labor and workload visibility
- stronger owner/manager exception review
- less duplicated task tracking outside FloorConnector

Primary capability areas:

- work-item depth over canonical records
- assignment, due-date, escalation, and workload visibility
- labor and workforce operating views
- sales, estimating, PM, field, and accounting accountability
- manager queues that route action back to owning workspaces

Boundary: Work management must extend canonical projects, jobs, people, time,
communications, invoices, and work items. It must not create a separate task,
workflow, workforce, or reporting system.

## Program C: Communications OS

Strategic goal: build a unified contractor communication and continuity system.

Contractor outcomes:

- fewer missed customer follow-ups
- less context switching across email, portal, project notes, and calls
- clearer communication history tied to source records
- better handoff continuity between office, field, and customer
- stronger future AI drafting and summarization foundations

Primary capability areas:

- record-linked conversations
- unified communication queues
- customer-safe portal communication continuity
- provider delivery and delivery proof when separately approved
- follow-up memory and communication health
- future AI summaries and drafts with human review

Boundary: Communications owns record-linked communication continuity. Providers
are adapters, not source of truth. AI must not send, approve, or mutate
customer-facing commitments without explicit human-reviewed workflow approval.

## Program D: Field OS

Strategic goal: make FloorConnector the primary execution platform for field
teams.

Contractor outcomes:

- faster day-of-work execution
- better crew context before arriving onsite
- clearer field evidence and closeout proof
- stronger office-to-field and field-to-office continuity
- fewer missing photos, notes, blockers, and closeout artifacts

Primary capability areas:

- mobile-first field workflows
- field handoff packets
- Daily Log, Job Note, blocker, and evidence depth
- closeout readiness and proof package continuity
- field communication handoff
- future inspections, punch, safety, and offline posture when separately
  approved

Boundary: Field work must extend canonical jobs, schedules, daily logs, field
notes, execution attachments, work items, projects, and people. It must not
create duplicate job, schedule, field report, attachment, closeout, or task
truth.

## Capability-Based Planning

Future planning should start from contractor outcomes, not page or module
names. A Program defines the capability objective. A Wave chooses the smallest
portfolio that materially advances that Program. Streams then divide the wave
by ownership, dependencies, hotspots, and verification boundaries.

Capability proposals must answer:

- Which contractor role benefits?
- Which canonical records carry the work?
- Which existing workspace owns the action?
- Which Program outcome improves?
- Which wave dependencies must land first?
- Which stream owns each hotspot?
- Which verification evidence protects the boundary?

## Dependency Management

Program dependencies must be tracked at three levels:

- Program dependency: a strategic capability needs another Program or platform
  foundation to mature first.
- Wave dependency: a bounded delivery portfolio must land before another wave
  can safely start.
- Stream dependency: an implementation slice must merge before another stream
  can validate or consume it.

Dependency maps must preserve the canonical lifecycle:

```text
opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment
```

If a dependency would require duplicate records, portal-owned state, provider
truth, AI-owned state, or schema drift outside approval, the wave must return
to Architecture Coordination before stream creation.

## Cross-Wave Coordination

Architecture Coordination owns cross-wave coordination. It must review:

- whether a wave advances an existing Program or needs a new Program
- whether a prior wave created prerequisites or caveats
- whether completed waves left worktrees, branches, or docs requiring cleanup
- whether current-state truth supports any implemented claims
- whether future wave proposals stay inside Program boundaries

Program docs may name future wave candidates, but only active wave registries
and Jeff approval authorize stream creation.

## Cross-Stream Ownership

Streams remain one branch and one worktree per stream. Programs do not get
branches or worktrees.

Cross-stream ownership rules:

- shared hotspots require a named first editor and merge order
- verification streams land after implementation stream commits exist
- ownership labels must name the canonical record or workspace owner
- no stream may create duplicate project, estimate, attachment, workflow, task,
  communication, field, financial, portal, provider, or AI truth
- no stream may hide future behavior as implemented status

## Strategic Research Function

Strategic Research is a permanent planning function. It does not implement
features or approve streams.

Responsibilities:

- competitor analysis
- industry trend analysis
- contractor workflow analysis
- AI and automation opportunity analysis
- quarterly capability recommendations

Outputs:

- Program opportunity notes
- wave candidate rankings
- contractor value hypotheses
- dependency and risk observations
- recommended research questions for Jeff or Product Council

Strategic Research must distinguish market opportunity from implemented truth.

## Product Council Function

Product Council is a permanent prioritization function above wave planning. It
does not bypass Jeff approval or Architecture Coordination.

Responsibilities:

- prioritize Programs
- evaluate contractor value
- prevent feature sprawl
- ensure operational depth remains the primary objective
- decide whether a candidate belongs in an existing Program or needs a new
  Program
- maintain the Operational Command Center principle

Product Council outputs wave recommendations and decision options. It does not
approve implementation by itself.

## Program Health Reporting

Program health reports should include:

- Program health status
- active wave, if any
- completed waves
- candidate next waves
- dependency changes
- ownership risks
- verification posture
- contractor value evidence
- blocker list
- recommended Product Council decision

Health reporting should use the allowed statuses: `Planned`, `Active`,
`Blocked`, `Verification`, and `Complete`.

## Governance Preservation

This Program model preserves existing governance:

- stream lifecycle remains mandatory
- worktrees remain stream-scoped
- verification remains required before merge
- controlled merge remains human-approved
- schemas and migrations require explicit approval
- provider/customer-facing actions require explicit approval
- AI remains review/assist only unless a later approved workflow narrows that
  constraint
- `docs/current-state.md` remains implemented truth

Programs coordinate long-running platform initiatives. They do not weaken the
stream creation rule, worktree governance, verification requirements, merge
requirements, or architectural guardrails.
