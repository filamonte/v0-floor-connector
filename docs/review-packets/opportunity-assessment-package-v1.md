# Opportunity Assessment Package V1

Status: Implemented in stream
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

Implemented migration `20260609231500_opportunity_assessment_package_alignment`
extends the existing canonical `assessment_packages` and `assessment_spaces`
tables instead of creating a separate pre-sale package model:

- `assessment_packages.opportunity_id` is nullable and references canonical
  `opportunities`.
- `assessment_packages.project_id` is nullable so an Opportunity-owned package
  can exist before Project creation.
- `assessment_packages_owner_check` requires Opportunity or Project ownership.
- tenant relationship validation checks Opportunity and Project company scope.
- `assessment_spaces.opportunity_id` is denormalized from the parent package
  for scoped Opportunity queries while spaces remain owned by the package.

The implementation preserves current Project-attached package compatibility and
does not create customer, portal, estimate, job, material, field, workflow, or
AI-owned assessment truth.

## UX Impact Expectation

UX should support mobile-first onsite capture for measurements, areas, spaces,
photos/attachments, conditions, product selections, timeline, financing
interest, and notes. It must make estimator handoff clear without making
Assessment Package an Estimate or a Project junk drawer.

Implemented V1 adds a bounded Lead Workspace Assessment Package panel that can
create and list Opportunity-owned packages before a Project exists. Project
detail and Project Assessment Package detail remain the existing continuity
surfaces. Mobile-first capture, customer self-service, AI assistance, and
Project handoff timing remain future work.

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

## Implementation Summary

- Added Opportunity ownership to the existing Assessment Package foundation.
- Kept Project ownership nullable for continuity instead of duplicating package
  records during pre-sale work.
- Added opportunity-scoped package list/create helpers and Lead Workspace
  surface.
- Carried Opportunity ownership into Assessment Spaces from their parent
  package.
- Added targeted package, space, and migration regression coverage.

No customer self-service, AI automation, full mobile capture, estimate-line
generation, Project creation alignment, scheduling board, AIA, dashboard
redesign, provider behavior, or duplicate assessment source of truth was added.

## Implementation Validation

Focused validation added for:

- Opportunity-owned package creation before Project creation.
- package ownership requires Opportunity or Project.
- Opportunity scope rejects cross-tenant or cross-opportunity packages.
- ownership stage distinguishes pre-sale from Project continuity.
- Opportunity-owned spaces carry parent package Opportunity ownership.
- migration adds Opportunity ownership, nullable Project linkage, owner check,
  tenant validation, and space denormalization.

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
