# Parallel Development Governance

Status: Active
Doc Type: Governance

This document defines the permanent governance model for AI-native parallel
development in FloorConnector. It is an operating-control document for streams,
waves, verification, and merge sequencing. It does not implement product
features, schema, routes, UI, runtime behavior, or autonomous merge behavior.

Use this with:

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/ai-native-development-architecture.md](C:/FloorConnector/docs/ai-native-development-architecture.md)
- [docs/operational-architecture-v1.md](C:/FloorConnector/docs/operational-architecture-v1.md)
- [active-worktrees.md](C:/FloorConnector/active-worktrees.md)
- [active-waves.md](C:/FloorConnector/active-waves.md)
- [.codex/active-stream-plan.md](C:/FloorConnector/.codex/active-stream-plan.md)

## Governing Principle

All future development must answer this question before approval:

> Does this make FloorConnector feel more like one operational command center
> and less like a collection of disconnected modules?

If the answer is unclear, the stream stays in architecture review until
ownership, workflow impact, information architecture impact, canonical model
impact, and verification strategy are explicit.

## Stream Lifecycle

Every stream must move through the same lifecycle:

1. Proposed
2. Architecture Review
3. Approved
4. Active
5. Verification
6. Merged
7. Retired

No stream may bypass lifecycle stages. A stream may return to an earlier stage
when review finds ownership conflict, dependency conflict, verification gaps, or
canonical model drift.

| Stage               | Meaning                                                                                              | Exit requirement                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Proposed            | A product or operations need has been identified.                                                    | Ownership area and business capability are written down.                      |
| Architecture Review | Architecture Coordination reviews scope, dependencies, IA, UX, canonical model impact, and hotspots. | All stream creation conditions are satisfied.                                 |
| Approved            | Stream is allowed to exist, with branch/worktree naming and merge expectations recorded.             | Registry entries exist before implementation begins.                          |
| Active              | Stream performs bounded work in its assigned branch/worktree.                                        | Slice is complete, committed, and ready for verification.                     |
| Verification        | Verifier reviews acceptance evidence, regressions, docs claims, and merge readiness.                 | Merge recommendation is explicit.                                             |
| Merged              | Human-reviewed work has landed on `main`.                                                            | Post-merge registry and docs are updated.                                     |
| Retired             | Worktree/branch is no longer an active development surface.                                          | Unique work is preserved or deliberately abandoned, then cleanup is recorded. |

## Stream Creation Rule

A new stream may only be created when all conditions are satisfied:

1. Ownership Area Defined
   - Business capability is clearly identified.
   - The stream names what it owns and what it must not own.

2. Dependency Analysis Complete
   - Upstream dependencies are documented.
   - Downstream consumers are documented.
   - Required merge order is named when applicable.

3. Ownership Conflict Check Complete
   - No active stream already owns the same responsibility.
   - Shared hotspots are assigned to one owner.
   - If overlap is intentional, the coordination plan states who edits first.

4. UX / IA Review Complete
   - Navigation impact is reviewed.
   - Workflow ownership impact is reviewed.
   - Project Workspace, Manager Page, portal, field, financial, and settings
     boundaries are preserved.

5. Canonical Model Review Complete
   - No duplicate records, workflows, source-of-truth tables, provider-owned
     truth, portal-only copies, AI-only copies, or module-local models are
     introduced.
   - The stream explains how it strengthens the canonical lifecycle:
     `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`.

6. Verification Strategy Defined
   - Acceptance criteria are written before implementation.
   - Targeted tests, type/lint/build checks, browser smoke, route checks, or
     accepted blockers are named.
   - Merge criteria and forbidden behavior are explicit.

7. Architecture Coordination Approval
   - Ownership is recorded in:
     - [active-worktrees.md](C:/FloorConnector/active-worktrees.md)
     - [active-waves.md](C:/FloorConnector/active-waves.md)
     - [.codex/active-stream-plan.md](C:/FloorConnector/.codex/active-stream-plan.md)

If any condition is not met, the stream remains Proposed or Architecture Review.

## Permanent Architecture Coordination Stream

Architecture Coordination is a permanent governance stream. It never owns
feature implementation.

Responsibilities:

- stream ownership governance
- dependency mapping
- duplicate capability detection
- duplicate workflow detection
- duplicate data-model detection
- navigation drift detection
- UX consistency review
- documentation synchronization
- merge sequencing
- release coordination
- AI prompt governance
- registry, wave, prompt-template, and stream-tooling stewardship

Architecture Coordination may update governance docs, active stream registries,
wave plans, prompt templates, review checklists, and coordination scripts when
that work is explicitly scoped. It must not use that ownership to implement
feature behavior, add schema, alter runtime workflow, or bypass verification.

## Product Director Function

The Product Director function sits above feature streams and below Jeff's final
direction. It is a planning and prioritization layer, not a code-ownership
stream.

Responsibilities:

- review current-state truth
- review roadmap direction
- review active waves
- identify highest-leverage opportunities
- prevent feature sprawl
- maintain the Operational Command Center vision
- generate future waves
- ensure feature proposals improve continuity instead of adding disconnected
  modules

The Product Director function creates or updates wave proposals. Architecture
Coordination decides whether a proposed stream is structurally safe to run.

## Verification Stream Responsibilities

Verification is a first-class stream and merge gate.

Responsibilities:

- cross-stream validation
- workflow validation
- canonical model validation
- regression checks
- readiness review
- merge recommendation
- docs-claim review against code and current-state truth
- protected route, portal, financial, signature, payment, auth, tenant, and
  workflow-boundary checks where relevant

Verification may recommend one of four outcomes:

- Merge: evidence satisfies acceptance criteria.
- Merge with caveats: non-blocking caveats are documented.
- Hold: missing evidence or unresolved risk requires another pass.
- Reject/reshape: stream violates ownership, canonical model, security,
  financial, portal, or workflow boundaries.

## Future AI-Native Development Model

The target operating structure is:

```text
Jeff
  -> Product Director
  -> Architecture Coordination
  -> Wave Planning
  -> Feature Streams
  -> Verification
  -> Integration Review
  -> Jeff Review
  -> Continue
```

The goal is a review-driven development organization where human involvement is
focused on product direction, acceptance, and risk decisions rather than
feature implementation coordination.

This is governed automation, not autonomous product control. AI systems may
prepare plans, implement scoped slices, verify evidence, and propose merge
order. Human review remains required for stream approval, sensitive product
decisions, risky workflow behavior, and final acceptance.

## Integration Review

Integration Review happens after Verification and before Jeff Review.

It checks:

- all intended files are staged and committed
- no unrelated files are included
- `main` is current or merge conflicts are understood
- active registries reflect the true lifecycle state
- docs separate implemented truth from planning direction
- validation output is reported accurately
- follow-up dependencies are named

Integration Review does not replace human review or automated CI.

## Required Stream Brief Fields

Every approved stream brief must include:

- stream name
- lifecycle stage
- owning business capability
- branch and worktree
- owner role
- allowed scope
- forbidden scope
- upstream dependencies
- downstream dependencies
- hotspot files or areas
- UX / IA impact
- canonical model impact
- verification strategy
- merge criteria
- docs to update
- retirement condition

## Non-Negotiable Stop Conditions

Stop and return to Architecture Review when a stream would:

- create duplicate customers, projects, estimates, contracts, jobs, invoices,
  payments, schedules, communications, documents, portal records, or AI memory
- create a portal-only copy of canonical records
- create detached financial, signature, payment, schedule, field, or document
  truth
- weaken tenant isolation, RLS, auth, role, portal-grant, payment, signature,
  readiness, or workflow gates
- change financial math without targeted tests
- add provider-backed behavior without adapter boundaries and approval
- introduce autonomous AI actions outside explicit human-reviewed scope
- make target, planned, or future behavior look implemented

## Operating Cadence

Before starting stream work:

```powershell
git status
git fetch origin
pnpm worktree:doctor
pnpm worktree:audit
pnpm worktree:reconcile
```

During active waves:

- Architecture Coordination maintains stream ownership and merge order.
- Product Director refreshes next-wave candidates from current-state and
  roadmap truth.
- Feature streams stay within approved scope.
- Verification validates before merge.
- Integration Review confirms no unrelated changes or lifecycle drift.

After merge:

- update active stream registries
- update handoff docs only with durable guidance
- retire completed worktrees when approved
- carry unresolved risks into the next wave brief
