# Opportunity Assessment Package V1

Status: Proposed
Doc Type: Stream Review Packet

Stream id: `opportunity-assessment-package-v1`

## Purpose

Plan Assessment Package as the first-class pre-estimate knowledge-capture layer
owned by Opportunity/Assessment before Project creation, while preserving
current Project-attached implementation compatibility and avoiding data
duplication.

## Owner Area

Opportunity-owned assessment package flow, onsite rep / inspector capture,
estimator handoff, and transition from pre-sale assessment context into Project
continuity after sale.

## Dependencies

- Active Program A Assessment Intelligence work:
  `assessment-package-depth-v1` and `area-space-model-v1`.
- Existing Project-attached `assessment_packages` and `assessment_spaces`
  foundations recorded in current-state.
- Canonical opportunities, customers, projects, estimates, documents,
  execution attachments, Work Items, communications, and portal access rules.
- Product operating-model target boundary for Opportunity before Project.

## Non-Goals

- no portal-owned assessment truth
- no customer/homeowner silo
- no duplicate lead/customer/project/estimate records
- no direct estimate-line generation
- no pricing automation
- no autonomous AI approval
- no customer self-service implementation in this stream
- no replacement of active Program A streams

## Records / Pages Likely Affected

Likely records:

- `opportunities`
- `customers`
- `contacts`
- `projects`
- `assessment_packages`
- `assessment_spaces`
- `estimates`
- `documents`
- `execution_attachments`
- `work_items`
- `communication_threads`
- `communication_messages`

Likely pages/components:

- Opportunity / Lead Workspace
- Project Workspace assessment continuity panels
- Assessment Package detail routes
- Estimate Workspace handoff panels
- Field/mobile capture surfaces if later scoped

## Data Model Impact Expectation

Likely migration needs exist if `assessment_packages` must become
opportunity-owned before Project exists. The transition must either support a
nullable/project-link-later model or an explicit source-record relationship
without duplicating package rows.

Any schema change must preserve organization tenancy, RLS, forward links into
Project after sale, and compatibility with current Project-attached packages.

## UX Impact Expectation

UX should support mobile-first onsite capture for measurements, areas, spaces,
photos/attachments, conditions, product selections, timeline, financing
interest, and notes. It must make estimator handoff clear without making
Assessment Package an Estimate or a Project junk drawer.

## Anti-Silo Checks

- Assessment Package is collected once and reused downstream.
- Opportunity owns pre-sale context in the target model.
- Project inherits/surfaces linked assessment context after sale.
- Portal/customer input is contribution only and must not own operational truth.
- Estimator handoff consumes source context without cloning it.

## Acceptance Criteria

- Ownership transition from Opportunity to Project is documented.
- Current Project-attached implementation compatibility is preserved.
- Active Program A overlap is resolved before implementation starts.
- Capture fields and handoff consumers are named.
- Migration/RLS implications are explicit.
- Future self-service compatibility is planned without building customer
  self-service now.

## Validation Plan

Future implementation should include targeted tests for ownership links,
tenant/RLS behavior, project-link transition, estimator handoff read models, and
portal safety if customer contribution is later scoped.

Expected implementation validation:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
git diff --cached --check
pnpm.cmd worktree:doctor
```

## Merge / Readiness Gates

- Must pass Architecture Coordination conflict review against current Program A
  streams before branch/worktree activation.
- Must not implement downstream handoff logic owned by
  `project-handoff-alignment-v1`.
- Must not update capability maturity without verified implementation evidence.

## Parallel Eligibility

Can run in parallel only if narrowed to ownership planning or non-overlapping
pre-sale assessment surfaces. It must wait if it would edit the same schema,
routes, helpers, or review packets as active Program A assessment work.
