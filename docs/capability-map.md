# Capability Map

Status: Active
Doc Type: Governance

This map is the strategic navigation layer for FloorConnector capabilities. It
connects each capability to its Program, Waves, Streams, dependencies, and next
expansion opportunities.

Use this document with
[docs/capability-registry.md](C:/FloorConnector/docs/capability-registry.md)
for maturity tracking,
[docs/program-architecture.md](C:/FloorConnector/docs/program-architecture.md)
for Program structure,
[active-waves.md](C:/FloorConnector/active-waves.md) for Wave status, and
[.codex/active-stream-plan.md](C:/FloorConnector/.codex/active-stream-plan.md)
plus [active-worktrees.md](C:/FloorConnector/active-worktrees.md) for Stream
and worktree status.

This document does not replace
[docs/current-state.md](C:/FloorConnector/docs/current-state.md) for
implemented truth and does not approve new Waves, Streams, branches, worktrees,
PRs, schema changes, provider actions, or merges.

## Purpose

This map answers:

- What capabilities exist?
- Which Program owns each capability?
- Which Waves and Streams moved or may move the capability?
- Which documents are authoritative for planning and execution?
- What dependencies must remain intact?
- What should be built next after governance/documentation work freezes?

The governed planning chain remains:

```text
Capability -> Program -> Wave -> Stream -> PR -> Verification -> Merge
```

Capability maturity is tracked in
[docs/capability-registry.md](C:/FloorConnector/docs/capability-registry.md).
Program, Wave, Stream, PR, and commit counts are activity measures, not success
metrics.

No Program, Wave, or Stream may be created without direct linkage to a
registered capability. Every proposal must state Capability, Current Capability
Maturity, Target Capability Maturity, Business Outcome, and Success Criteria.
Capability maturity advancement is the primary progress metric.

## Capability Index

| Capability                  | Status  | Maturity            | Owning Program                         | Linked Waves                                                                             | Linked Active Streams                                                              |
| --------------------------- | ------- | ------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Assessment Intelligence     | Active  | Foundation, 9 / 100 | Program A: Assessment Intelligence     | `guided-project-capture-v1` merged; `assessment-foundation-a1` Batch 1 in implementation | `assessment-package-depth-v1`, `area-space-model-v1`, prior guided capture streams |
| Operational Work Management | Planned | Foundation, 0 / 100 | Program B: Operational Work Management | None approved                                                                            | None approved                                                                      |
| Communications OS           | Planned | Foundation, 0 / 100 | Program C: Communications OS           | None approved                                                                            | None approved                                                                      |
| Field OS                    | Planned | Foundation, 0 / 100 | Program D: Field OS                    | None approved                                                                            | None approved                                                                      |

## Assessment Intelligence

Purpose: create a project-owned pre-estimate assessment, capture, review, and
handoff capability so contractors miss fewer details, reduce estimator rework,
and reuse site/scope context downstream.

Status: Active.

Maturity: Foundation, 9 / 100. The first guided project capture Wave has merged
to `main`; `assessment-package-depth-v1` adds the first schema-backed
project-owned Assessment Package foundation. Area/space modeling, guided
capture depth, photo capture, AI risk detection, and estimate handoff depth
still require later approved work.

Owning Program:

- Program A: Assessment Intelligence.

Linked documentation:

- [docs/capability-registry.md](C:/FloorConnector/docs/capability-registry.md)
- [docs/program-architecture.md](C:/FloorConnector/docs/program-architecture.md)
- [docs/guided-project-capture-vision.md](C:/FloorConnector/docs/guided-project-capture-vision.md)
- [docs/review-packets/guided-project-capture-v1-plan.md](C:/FloorConnector/docs/review-packets/guided-project-capture-v1-plan.md)
- [docs/review-packets/guided-project-capture-v1.md](C:/FloorConnector/docs/review-packets/guided-project-capture-v1.md)
- [docs/review-packets/program-a-assessment-foundation-a1-plan.md](C:/FloorConnector/docs/review-packets/program-a-assessment-foundation-a1-plan.md)
- [active-waves.md](C:/FloorConnector/active-waves.md)
- [.codex/active-stream-plan.md](C:/FloorConnector/.codex/active-stream-plan.md)

Linked active or recently merged Waves:

- `guided-project-capture-v1`: merged to `main`; completed worktrees and
  branches are retained pending explicit retirement approval.
- `assessment-foundation-a1`: Batch 1 is in implementation.
  `assessment-package-depth-v1` adds canonical Assessment Package persistence
  and minimal Project Workspace access. `area-space-model-v1` remains separate
  and must not be modified by this stream.

Linked active, approved, or recently merged Streams:

- `assessment-package-depth-v1`
- `area-space-model-v1`
- `assessment-package-model-v1`
- `guided-capture-workspace-v1`
- `customer-assessment-capture-v1`
- `assessment-to-estimate-handoff-v1`
- `verification-guided-project-capture-v1`

Dependencies:

- canonical Project ownership of assessment context
- Estimate consumption of reviewed assessment context
- customer-safe Portal input without portal-owned operational truth
- existing documents, photos, attachments, opportunities, customers, projects,
  estimates, Work Items, and communication foundations
- AI review/assist boundaries with no autonomous approval, pricing, or mutation

Future expansion opportunities:

- Assessment Packages
- Guided Project Capture
- Area / Space Modeling
- Photo Capture
- Site Conditions
- Risk Detection
- Estimate Handoff
- missing-information review
- customer mobile web capture
- human-reviewed AI observations

Recommended next implementation areas:

1. Assessment Package depth over project-owned source context.
2. Guided Project Capture workflow depth for internal capture and review.
3. Area / Space Modeling for rooms, zones, measurements, and conditions.
4. Photo Capture tied to project assessment context and downstream estimate
   review.
5. Site Conditions and Risk Detection as review-first signals.
6. Estimate Handoff that prepares estimator review without auto-pricing or
   direct estimate-line generation.

## Operational Work Management

Purpose: mature accountable work ownership across sales, estimating, project
management, field, and accounting so contractor teams know who owns work, what
is late, and what needs action.

Status: Planned.

Maturity: Foundation, 0 / 100 in the capability registry.

Owning Program:

- Program B: Operational Work Management.

Linked documentation:

- [docs/capability-registry.md](C:/FloorConnector/docs/capability-registry.md)
- [docs/program-architecture.md](C:/FloorConnector/docs/program-architecture.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [active-waves.md](C:/FloorConnector/active-waves.md)

Linked active Waves:

- None approved.

Linked active Streams:

- None approved.

Dependencies:

- canonical Work Items
- People, memberships, assignments, and role ownership
- Projects, Jobs, time/labor, Financials, Field, and Communications ownership
- existing operational command-center principle: Dashboard prioritizes, Project
  diagnoses, owning workspace acts

Future expansion opportunities:

- Work Item depth
- assignment and due-date visibility
- escalation and handoff queues
- labor and workload visibility
- role-aware ownership queues
- owner/manager exception review that routes action to owning workspaces

## Communications OS

Purpose: build unified record-linked communication continuity across customer
and contractor workflows so follow-ups are not lost across portal, email, calls,
internal notes, and project handoffs.

Status: Planned.

Maturity: Foundation, 0 / 100 in the capability registry.

Owning Program:

- Program C: Communications OS.

Linked documentation:

- [docs/capability-registry.md](C:/FloorConnector/docs/capability-registry.md)
- [docs/program-architecture.md](C:/FloorConnector/docs/program-architecture.md)
- [docs/communications-layer.md](C:/FloorConnector/docs/communications-layer.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [active-waves.md](C:/FloorConnector/active-waves.md)

Linked active Waves:

- None approved.

Linked active Streams:

- None approved.

Dependencies:

- canonical `communication_threads` and `communication_messages`
- customer-visible/internal message boundaries
- portal safety and explicit source-record access
- provider adapters as integration boundaries, not business truth
- review-first AI drafting and summarization boundaries

Future expansion opportunities:

- unified communication queue
- record-linked follow-up memory
- provider-backed delivery proof after separate approval
- customer-safe portal communication continuity
- communication health signals
- AI summaries and drafts under human review

## Field OS

Purpose: make FloorConnector the primary field execution platform for jobs,
schedules, field packets, daily execution, blockers, proof, and closeout.

Status: Planned.

Maturity: Foundation, 0 / 100 in the capability registry.

Owning Program:

- Program D: Field OS.

Linked documentation:

- [docs/capability-registry.md](C:/FloorConnector/docs/capability-registry.md)
- [docs/program-architecture.md](C:/FloorConnector/docs/program-architecture.md)
- [docs/field-operations-architecture-map.md](C:/FloorConnector/docs/field-operations-architecture-map.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [active-waves.md](C:/FloorConnector/active-waves.md)

Linked active Waves:

- None approved.

Linked active Streams:

- None approved.

Dependencies:

- canonical Jobs, schedule, job assignments, People, vendors, and time records
- Daily Logs, field notes, execution attachments, and Work Items
- project closeout, proof, communications, and billing readiness continuity
- portal-safe sharing rules and no customer exposure of internal field truth by
  default

Future expansion opportunities:

- mobile-first field workflows
- field handoff packets
- daily execution command depth
- blocker, issue, and punch handling
- closeout proof and warranty handoff
- inspections and safety workflows
- offline posture only after sync boundaries are explicitly approved

## Program A Execution Readiness

Assessment Intelligence is ready for continued execution after documentation
architecture freeze because:

- the Program and capability are defined
- `guided-project-capture-v1` has merged
- the merged streams establish the first project-owned assessment foundation
- the review packet records validation and boundary evidence
- the remaining work is product capability depth rather than governance system
  design

Recommended first execution wave candidates after this documentation pass:

- `assessment-foundation-a1`
- `assessment-package-depth-v1`
- `guided-project-capture-workflow-v1`
- `area-space-model-v1`
- `photo-capture-foundation-v1`
- `site-conditions-risk-detection-v1`
- `estimate-handoff-depth-v1`

The proposed `assessment-foundation-a1` packet targets Program A maturity
movement from 5 / 100 to 20 / 100 after verified delivery. It uses
conflict-safe successor stream names where earlier Program A names are already
merged or reserved.

No candidate is approved by this map. Each candidate still requires Product
Council prioritization, Architecture Coordination approval, dependency review,
active registry update, verification strategy, merge-order planning, and Jeff
approval before stream creation.

## Governance Notes

Capability Maps are strategic navigation. They should stay short enough to
answer where work belongs and which documents own detail.

Do not turn this file into:

- implemented truth
- a second capability registry
- a second roadmap
- a Wave approval record
- a worktree registry
- a historical merge log

When detail grows, update the authoritative owner document and link from this
map instead of expanding the map into another source of truth.
