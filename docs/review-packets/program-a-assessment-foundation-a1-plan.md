# Program A Assessment Foundation A1 Plan

Status: Proposed / Planning Only

Doc Type: Review Packet / Program and Wave Plan

Program: Program A: Assessment Intelligence

Capability: Assessment Intelligence

Wave: Wave A1: Assessment Foundation

Wave id: `assessment-foundation-a1`

Current Capability Maturity: 5 / 100

Target Capability Maturity After Verified Wave Delivery: 20 / 100

Business Outcome: structured site assessments and complete project context flow
into estimating without losing or recreating work.

This packet prepares Program A for execution under the governed
Capability -> Program -> Wave -> Stream model. It does not approve application
code, schema, migrations, implementation, branches, worktrees, PRs, provider
behavior, portal-owned state, autonomous AI, or merge.

## Program Plan

Program A owns Assessment Intelligence: project-owned pre-estimate assessment,
capture, review, and estimator handoff context.

The Program goal for this phase is to move Assessment Intelligence from a first
foundation at 5 percent maturity to a stronger foundation at 20 percent maturity
by making contractor site assessment context structured enough to carry forward
into estimating without re-entry or loss of ownership.

Program A must preserve these boundaries:

- Project owns assessment context.
- Estimate consumes reviewed assessment context.
- Portal may contribute customer-safe input but must not own operational truth.
- AI may summarize, classify, and prepare only under human review.
- Canonical customers, opportunities, projects, estimates, attachments,
  documents, work items, and communications remain the source records.

## Wave Plan

Wave A1: Assessment Foundation establishes the canonical planning foundation
for contractor site assessment and project capture.

Wave A1 should prepare implementation slices that define:

- Assessment Package ownership and relationships.
- Guided project capture workflow across contractor mobile, office, and
  estimating usage.
- Area and space modeling for rooms, zones, measurements, surface types, and
  future material relationships.
- Assessment-to-estimate handoff requirements, ownership transitions, and
  continuity requirements.
- Verification coverage for workflow integrity, canonical ownership,
  dependency compliance, and governance boundaries.

## Stream Definition Notes

Two requested stream labels already have registry meaning:

| Requested label                         | Registry finding                                        | Recommended Wave A1 id                  |
| --------------------------------------- | ------------------------------------------------------- | --------------------------------------- |
| `assessment-package-model-v1`           | Merged Program A stream retained pending cleanup.       | `assessment-package-depth-v1`           |
| `guided-project-capture-v1`             | Merged Program A wave name.                             | `guided-project-capture-workflow-v1`    |
| `area-space-model-v1`                   | No direct conflict found in active registry.            | `area-space-model-v1`                   |
| `estimate-handoff-v1`                   | No direct conflict found; distinct from merged handoff. | `estimate-handoff-v1`                   |
| `verification-assessment-foundation-v1` | No direct conflict found in active registry.            | `verification-assessment-foundation-v1` |

The recommended stream ids preserve the requested objectives while avoiding
branch, worktree, and registry ambiguity.

## Stream Definitions

### assessment-package-depth-v1

- Capability: Assessment Intelligence
- Current maturity: 5 / 100
- Target contribution: define enough Assessment Package depth to support Wave
  A1 maturity movement toward 20 / 100 after verified delivery.
- Ownership: Project-owned Assessment Package context.
- Objective: define Assessment Package ownership, canonical relationships,
  project linkage, source-record reuse, and future expansion points.
- Success criteria: assessment context is explicitly project-owned, can link to
  customer/opportunity/project/attachment/observation/estimate context, and does
  not duplicate project, estimate, workflow, task, attachment, or pricing truth.
- Non-goals: no schema, migrations, duplicate package persistence, pricing, AI
  approval, portal-owned state, or estimate-line generation unless separately
  approved later.

### guided-project-capture-workflow-v1

- Capability: Assessment Intelligence
- Current maturity: 5 / 100
- Target contribution: define contractor workflow depth needed for Wave A1
  maturity movement toward 20 / 100 after verified delivery.
- Ownership: guided capture workflow across contractor users.
- Objective: define contractor workflow, mobile workflow, office workflow, and
  estimating workflow for gathering and reviewing site assessment context.
- Success criteria: capture steps are role-aware, project-owned, mobile-web
  compatible, office-reviewable, estimator-consumable, and bounded by human
  review.
- Non-goals: no native mobile app, autonomous AI, detached task system, workflow
  engine, portal-owned operational truth, schema, or migrations.

### area-space-model-v1

- Capability: Assessment Intelligence
- Current maturity: 5 / 100
- Target contribution: define area/space modeling needed for Wave A1 maturity
  movement toward 20 / 100 after verified delivery.
- Ownership: project-scoped areas, rooms, measurements, surface types, and
  future material relationships.
- Objective: define how areas and spaces relate to projects, Assessment
  Packages, measurements, surfaces, observations, photos, and future material or
  system-template relationships.
- Success criteria: area and space context supports estimator review without
  creating duplicate projects, estimates, rooms disconnected from the project,
  field-only truth, or material truth before approval.
- Non-goals: no takeoff automation, autonomous measurements, material pricing,
  schema, migrations, or estimate-line generation.

### estimate-handoff-v1

- Capability: Assessment Intelligence
- Current maturity: 5 / 100
- Target contribution: define estimator handoff depth needed for Wave A1
  maturity movement toward 20 / 100 after verified delivery.
- Ownership: Assessment -> Estimate continuity.
- Objective: define the required information, readiness criteria, source links,
  missing-context signals, ownership transitions, and continuity requirements
  for handoff into estimating.
- Success criteria: estimators can see what assessment context is ready, what is
  missing, which source records support it, and where human review is required
  before estimate authoring.
- Non-goals: no pricing automation, no direct estimate-line generation, no
  quote publishing, no customer-facing commitment, no schema, and no migrations.

### verification-assessment-foundation-v1

- Capability: Assessment Intelligence
- Current maturity: 5 / 100
- Target contribution: verify that Wave A1 delivery can credibly support a
  maturity update to 20 / 100.
- Ownership: validation strategy, workflow verification, and governance
  compliance.
- Objective: verify project ownership, estimate-consumer boundaries,
  portal-safety boundaries, duplicate-model prevention, no schema/migration
  drift unless separately approved, and capability maturity evidence.
- Success criteria: verification runs last after implementation commits exist,
  records evidence, confirms success metrics, and blocks maturity change if
  contractor outcome evidence is missing.
- Non-goals: no feature work, UI redesign, schema, migrations, implementation
  shortcuts, or loosening existing tests.

## Capability Advancement Impact

Current maturity remains 5 / 100 until verified implementation and review
evidence exists.

Expected maturity after Wave A1: 20 / 100, if the wave lands verified evidence
that FloorConnector can structure assessment context, capture site/area detail,
and hand that context to estimating without re-entry or ownership drift.

The maturity movement is justified only by contractor outcome evidence, not by
the number of streams, branches, commits, PRs, or files changed.

## Success Metrics

- Assessment completeness increases for project assessment context.
- Missing information is visible before estimate work begins.
- Estimator handoff includes source links, readiness, and missing-context
  signals.
- Area/space context can be reviewed without duplicate project or estimate
  truth.
- Customer-safe input remains contribution only, not operational authority.
- No schema, migration, provider, pricing, or AI-autonomy drift occurs without
  separate approval.

## Dependencies

- Existing project-owned Assessment Package foundation from
  `guided-project-capture-v1`.
- Canonical opportunity, customer, project, estimate, attachment, document, Work
  Item, and communication records.
- Existing portal safety rules and customer/project access boundaries.
- Existing estimate authoring and review boundaries.
- Existing verification helpers around operational ownership and golden
  workflow checks.

## Recommended Worktree Structure

Do not create these worktrees until Jeff explicitly approves Wave A1 stream
creation.

| Stream id                               | Branch                                         | Worktree                                                |
| --------------------------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| `assessment-package-depth-v1`           | `stream/assessment-package-depth-v1`           | `C:\FC-worktrees\assessment-package-depth-v1`           |
| `guided-project-capture-workflow-v1`    | `stream/guided-project-capture-workflow-v1`    | `C:\FC-worktrees\guided-project-capture-workflow-v1`    |
| `area-space-model-v1`                   | `stream/area-space-model-v1`                   | `C:\FC-worktrees\area-space-model-v1`                   |
| `estimate-handoff-v1`                   | `stream/estimate-handoff-v1`                   | `C:\FC-worktrees\estimate-handoff-v1`                   |
| `verification-assessment-foundation-v1` | `stream/verification-assessment-foundation-v1` | `C:\FC-worktrees\verification-assessment-foundation-v1` |

## Recommended Merge Order

1. `assessment-package-depth-v1`
2. `guided-project-capture-workflow-v1`
3. `area-space-model-v1`
4. `estimate-handoff-v1`
5. `verification-assessment-foundation-v1`

Assessment Package depth should land first because it defines project ownership
and source-record relationships. Guided workflow and area/space work can then
consume the package model. Estimate handoff should land after enough context
exists to consume. Verification lands last.

## Verification Strategy

Before any future stream starts:

```powershell
git status --short --branch
git fetch origin
git rev-list --left-right --count HEAD...origin/main
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline -CommandsOnly
```

Implementation validation should include targeted tests for changed helpers,
read models, route surfaces, ownership links, project assessment context,
area/space context, portal-safe input, and estimator handoff behavior, followed
by:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
git diff --cached --check
```

Governance validation for this planning packet:

- Governance review: confirms the packet does not authorize implementation.
- Capability review: confirms Program A and Assessment Intelligence linkage,
  current maturity, target maturity, outcome, and success criteria.
- Dependency review: confirms canonical Project, Estimate, Portal, attachment,
  document, Work Item, communication, and AI-review boundaries.
- Documentation consistency review: confirms planning claims do not update
  `docs/current-state.md` or pretend future behavior is implemented.
