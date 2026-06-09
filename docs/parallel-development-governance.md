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
- [docs/document-map.md](C:/FloorConnector/docs/document-map.md)
- [docs/capability-registry.md](C:/FloorConnector/docs/capability-registry.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/program-architecture.md](C:/FloorConnector/docs/program-architecture.md)
- [docs/ai-native-development-architecture.md](C:/FloorConnector/docs/ai-native-development-architecture.md)
- [docs/operational-architecture-v1.md](C:/FloorConnector/docs/operational-architecture-v1.md)
- [docs/automation-tooling-baseline.md](C:/FloorConnector/docs/automation-tooling-baseline.md)
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

## Program Layer

FloorConnector planning now uses the permanent execution chain:

```text
Capability -> Program -> Wave -> Stream -> PR -> Verification -> Merge
```

Capabilities are the contractor business outcomes being matured. Programs are
long-running strategic initiatives that group multiple waves around those
outcomes. Capability maturity is tracked in
[docs/capability-registry.md](C:/FloorConnector/docs/capability-registry.md);
Programs are defined in
[docs/program-architecture.md](C:/FloorConnector/docs/program-architecture.md).

Program planning does not approve implementation. A Program may recommend or
sequence waves, but branches and worktrees remain stream-scoped, and every wave
still must pass Product Council prioritization, Architecture Coordination
approval, dependency review, stream creation governance, verification planning,
registry updates, merge-order planning, and Jeff approval before work begins.

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

## Wave Proposal Gate

No wave may begin until all gate items are recorded:

1. Capability and Program mapping is recorded, including the Capability maturity
   objective, the Program outcome the wave advances, or the reason the wave is
   governance-only.
2. Product Council confirms contractor value and priority.
3. Architecture Coordination approves stream ownership.
4. Upstream and downstream dependencies are documented.
5. Ownership conflicts are checked.
6. UX / IA impact is reviewed.
7. Verification scope is defined.
8. Merge order is proposed.
9. Active wave registry is updated.
10. Jeff approval gate is recorded.
11. Tooling baseline is checked with `pnpm.cmd worktree:doctor` and any required
    worktree dev-tool links are repaired before stream work begins.

If any item is missing, the wave remains a proposal. Agents may draft the wave,
stream brief, and review packet requirements, but they may not create or activate
the stream worktree until the gate is complete.

## Current Stream Governance Audit

Audit date: 2026-06-04.

This audit records the local stream topology visible from `main`. It is
governance truth, not implemented product truth. A local worktree directory does
not make a stream active; active status requires registry approval in
[active-worktrees.md](C:/FloorConnector/active-worktrees.md),
[active-waves.md](C:/FloorConnector/active-waves.md), and
[.codex/active-stream-plan.md](C:/FloorConnector/.codex/active-stream-plan.md).

| Stream                         | Worktree                                       | Branch                                | Ownership area                                                 | Upstream dependencies                                     | Downstream dependencies                              | UX / IA impact                                            | Canonical model risk                                                                     | Overlap / conflict check                                                                                                                         | Verification expectations                                                            | Merge readiness gate                                                                                     | Lifecycle status                                                                         |
| ------------------------------ | ---------------------------------------------- | ------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `ux-architecture`              | `C:\FC-worktrees\ux-architecture`              | `stream/ux-architecture`              | Product architecture, IA ownership, governance references      | Current `main`, current-state, roadmap, target IA         | All proposed feature streams                         | High; owns IA and UX ownership review                     | Medium if it rewrites implemented truth or treats target IA as built                     | Replaces or absorbs most future-facing architecture-coordination responsibilities when explicitly approved                                       | Docs validation, link checks, registry consistency, no product runtime diff          | Jeff and Architecture Coordination approve replacement of current governance cleanup stream              | Architecture Review; local clean worktree exists, not yet registered as active on `main` |
| `project-workspace-v2`         | `C:\FC-worktrees\project-workspace-v2`         | `stream/project-workspace-v2`         | Project Workspace continuity and next-action depth             | UX architecture approval, current Project Workspace truth | Field, communications, financial, portal continuity  | High; Project remains operational root                    | High if it creates project-local activity, task, financial, or AI truth                  | Must not conflict with field-command, communications, financial, or portal ownership                                                             | Focused read-model tests, typecheck/lint, protected Project Workspace smoke          | UX ownership, canonical model review, and verification-v2 evidence complete                              | Architecture Review; local clean worktree exists, not yet registered as active on `main` |
| `field-command-center-v1`      | `C:\FC-worktrees\field-command-center-v1`      | `stream/field-command-center-v1`      | Field execution command layer over jobs, daily logs, evidence  | Project Workspace v2 ownership, scheduling/job context    | Portal closeout, reports, verification               | Medium/high; Field surfaces must remain execution-focused | High if it forks jobs, daily logs, execution attachments, work items, or portal evidence | Must coordinate with project-workspace-v2 and portal before exposing customer-safe proof                                                         | Focused helper/action tests, typecheck/lint, field route smoke when UI changes       | Field data ownership and portal-safe evidence boundaries explicitly approved                             | Architecture Review; local clean worktree exists, not yet registered as active on `main` |
| `communications-continuity-v2` | `C:\FC-worktrees\communications-continuity-v2` | `stream/communications-continuity-v2` | Record-linked communication continuity and follow-up review    | UX architecture, current communications v1 truth          | Project, financial, portal, AI draft handoffs        | Medium; communications must stay record-linked            | High if it creates disconnected inboxes, provider truth, or AI-only message memory       | Must coordinate with project-workspace-v2, financial-command-center-v1, and portal customer-safe scope                                           | Focused communication helper/action tests, typecheck/lint, route smoke where changed | Provider-dark or adapter-reviewed behavior, no autonomous send, no portal leakage                        | Architecture Review; local clean worktree exists, not yet registered as active on `main` |
| `financial-command-center-v1`  | `C:\FC-worktrees\financial-command-center-v1`  | `stream/financial-command-center-v1`  | AR, collections, billing command-center continuity             | UX architecture, current financial/AR truth               | Reports, communications follow-up, Project Workspace | Medium/high; Financials owns cross-project billing review | Very high if it changes invoice math, payment state, ledgers, or provider reconciliation | Must coordinate with communications and project-workspace-v2 for follow-up handoffs                                                              | Financial lineage/math/payment-state tests, typecheck/lint, protected route smoke    | Targeted financial tests pass and no detached ledger/payment truth is introduced                         | Architecture Review; local clean worktree exists, not yet registered as active on `main` |
| `verification-v2`              | `C:\FC-worktrees\verification-v2`              | `stream/verification-v2`              | Verification framework, review packets, merge-gate evidence    | Governance docs, active stream briefs, current QA rules   | Every feature stream and integration review          | Medium; owns QA method, not product IA                    | Medium if it mutates fixtures or claims unauthenticated smoke as success                 | Must remain independent of feature implementation and must not manufacture QA data                                                               | Docs checks, targeted smoke harness checks, saved-auth guardrails, honest blockers   | Review-packet standard adopted and stream-specific evidence requirements are explicit                    | Architecture Review; local clean worktree exists, not yet registered as active on `main` |
| `architecture-coordination`    | `C:\FC-worktrees\architecture-coordination`    | `stream/architecture-coordination`    | Current permanent governance cleanup, registries, prompt rules | Current `main`, active registries                         | Proposed `ux-architecture` replacement/continuation  | High; owns governance and IA drift detection              | Medium if it edits product truth or creates feature behavior                             | Current registry lists this as the only active cleanup stream; future governance may be represented by `ux-architecture` after explicit approval | Docs validation, registry consistency, no app code/schema/runtime changes            | Either merge/retire current cleanup stream or explicitly replace it with `ux-architecture` in registries | Active cleanup stream in current `main` registry                                         |

Any stream with missing ownership, dependency, UX / IA, canonical model, or
verification detail stays in Architecture Review. The next-generation stream
names above are allowed to appear in planning docs and review packets, but they
are not active feature authorization until the wave proposal gate is complete.

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

### Product Director Planning Loop

Before proposing a next wave, the Product Director must review:

- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)
- [docs/operational-architecture-v1.md](C:/FloorConnector/docs/operational-architecture-v1.md)
- [active-waves.md](C:/FloorConnector/active-waves.md)
- [active-worktrees.md](C:/FloorConnector/active-worktrees.md)
- recent completed review packets
- Jeff feedback from the current thread or recorded handoff

The recommendation must pass these tests:

- Does this improve daily contractor operations?
- Does this strengthen the Operational Command Center?
- Does this reduce workflow friction?
- Does this deepen canonical lifecycle continuity?
- Does this avoid module sprawl?
- Does this preserve project-centered workflow?
- Does this avoid duplicate models?
- Does this have a clear verification path?

The output is a wave proposal, not implementation authorization. Architecture
Coordination still owns stream approval and conflict review.

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

## Automated Review Packet Standard

Every completed wave must produce a review packet before Jeff review. The
packet must include:

- executive summary
- streams completed
- commits by stream
- files changed by stream
- product capabilities added
- workflow improvements
- user-facing changes
- docs updated
- validation results
- governance review
- ownership conflict result
- duplicate model check
- IA / navigation drift check
- merge order recommendation
- risks / follow-ups
- next recommended wave
- Jeff review decision options:
  - approve merge
  - request correction
  - defer stream
  - continue to next wave

Review packets must separate implemented behavior from planning direction. They
must not claim route, schema, provider, AI, portal, financial, signature, or
payment behavior is implemented unless the current branch and
[docs/current-state.md](C:/FloorConnector/docs/current-state.md) support that
claim.

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

## Stream Proposal Template

Use this template before creating or approving a stream:

```markdown
# Stream Proposal: <stream name>

- Stream name:
- Branch name:
- Worktree path:
- Problem being solved:
- Ownership area:
- Explicit non-goals:
- Upstream dependencies:
- Downstream dependencies:
- Touched routes/components/docs:
- Forbidden areas:
- UX / IA impact:
- Canonical model impact:
- Ownership conflict check:
- Validation commands:
- Expected commit/report format:
- Lifecycle status:
- Architecture Coordination approval:
- Jeff approval:
```

## Wave Plan Template

Use this template before beginning a wave:

```markdown
# Wave Plan: <wave name>

- Goal:
- Rationale:
- Base branch:
- Streams:
- Dependencies:
- Merge order:
- Validation plan:
- Governance checklist:
- Review packet requirements:
- Rollback / correction plan:
- Architecture Coordination approval:
- Jeff approval:
```

## Automation Readiness

Status: Ready With Human Review Gate.

FloorConnector is ready for governed automated parallel development only when
the wave proposal gate is complete. Agents may plan, build scoped slices,
validate, prepare review packets, and recommend merge order. Agents may not
auto-merge, mark PRs ready without review, continue indefinitely, bypass Jeff
approval, or perform destructive cleanup without explicit approval.

The allowed readiness statuses are:

- Not Ready
- Partially Ready
- Ready With Human Review Gate
- Fully Autonomous Not Allowed

`Fully Autonomous Not Allowed` is a permanent constraint for merge, provider,
customer-facing, financial, signature, tenant-access, destructive cleanup, and
other risky product decisions unless Jeff explicitly approves a narrower
human-reviewed automation policy later.

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
pnpm.cmd worktree:doctor
pnpm.cmd worktree:audit
pnpm.cmd worktree:reconcile
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
