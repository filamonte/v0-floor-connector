# Project Handoff Alignment V1

Status: Proposed
Doc Type: Stream Review Packet

Stream id: `project-handoff-alignment-v1`

## Purpose

Plan Project creation and sales-to-operations handoff alignment with the target
operating model while preserving current compatibility and downstream
continuity.

## Owner Area

Project creation timing, approved estimate / contract / readiness transitions,
Assessment Package context flow into Project after sale, and safe transition
from current project-first flows.

## Dependencies

- `payment-schedule-readiness-v1` for Financial Readiness semantics.
- `opportunity-assessment-package-v1` and active Program A streams for
  Assessment Package ownership decisions.
- Existing opportunity, customer, project, estimate, contract, job, invoice, and
  payment chain.
- Current context-aware creation rules.
- Sales-to-production readiness helpers and Project Workspace readiness
  surfaces.

## Non-Goals

- no scheduling board implementation
- no duplicate project model
- no automatic project creation policy without explicit readiness rules
- no data migration that rewrites existing projects unless separately approved
- no portal-owned project state
- no module-local handoff state
- no workflow bypass around signature, financial readiness, scheduling, or
  production readiness

## Records / Pages Likely Affected

Likely records:

- `opportunities`
- `customers`
- `projects`
- `estimates`
- `contracts`
- `jobs`
- `invoices`
- `payments`
- `assessment_packages`
- `assessment_spaces`

Likely pages/components:

- Opportunity / Lead Workspace
- Estimate Workspace
- Contract Workspace
- Project Workspace
- Schedule / CrewBoard readiness handoff
- Dashboard / My Work cues, if later scoped as presentation only

## Data Model Impact Expectation

The stream may need schema only if Project creation must reference a new
handoff state, Opportunity-owned Assessment Package link, or explicit readiness
transition record. Prefer existing canonical records and derived readiness where
possible.

Any migration must preserve tenant isolation, current project-first
compatibility, and source-record lineage.

## UX Impact Expectation

UX should make it clear when work is pre-sale versus operational, why a Project
exists, what source records created or linked it, and where the next action
belongs. Project Workspace should become the operational root without becoming
a holding place for unsold opportunities.

## Anti-Silo Checks

- Project is operational root after sale, not a duplicate lead/opportunity.
- Assessment context flows forward; it is not copied into a new project-local
  truth.
- Estimate, contract, invoice, job, and payment records remain canonical.
- Dashboard and Manager Pages route to owning workspaces rather than creating
  hidden handoff state.

## Acceptance Criteria

- Project creation timing options are evaluated against current compatibility.
- Required source records and readiness requirements are named.
- Transition from project-first current flows is safe and incremental.
- Assessment Package continuity into Project is documented.
- Downstream schedule/job/invoice continuity remains intact.
- No duplicate model or module-local handoff state is introduced.

## Validation Plan

Future implementation should include focused tests for project creation or link
helpers, readiness/handoff read models, context-aware creation preservation, and
golden workflow handoff continuity.

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

- Must wait for payment schedule readiness and assessment ownership clarity.
- Must not start while active assessment streams own the same source-record
  relationship decisions.
- Must preserve current workflows until a verified transition is ready.

## Parallel Eligibility

Should not run in parallel with broad payment or assessment ownership changes.
It can begin only as a read-only audit/planning stream until upstream decisions
are recorded.
