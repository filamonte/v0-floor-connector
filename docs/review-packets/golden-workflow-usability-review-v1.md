# Golden Workflow Usability Review V1

Status: Complete
Doc Type: Review Packet
Wave: `visual-ux-review-contractor-usability-v1`
Stream: `golden-workflow-usability-review-v1`

## Scope

This stream reviewed the contractor workflow for understandability across:

`Lead / opportunity -> Project -> Estimate -> Contract -> Readiness -> Schedule -> Field -> Closeout -> Invoice -> Payment -> Reports`

The implementation stays presentation-only. It does not add schema, migrations,
new source records, workflow state, provider behavior, customer-facing sends,
financial mutation, payment mutation, signature mutation, scheduling mutation,
portal-owned state, or dashboard ownership.

## Usability Findings

| Stage              | Current clarity finding                                                                                          | Stream decision                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Lead / opportunity | Lead Workspace already explains qualification, site visit, estimate handoff, and no duplicate customer/project.  | Preserve route behavior; include the stage in the owner-facing route map.                             |
| Project            | Project Workspace is the diagnostic hub, but the full lead-to-cash journey can be hard to hold in memory.        | Preserve Project as diagnostic; use Reports to show the end-to-end ownership map.                     |
| Estimate           | Estimate Workspace already has next-action and workflow-summary grammar.                                         | Preserve Estimate as proposal-first reference pattern.                                                |
| Contract           | Contract Workspace owns signature progression and downstream handoff context.                                    | Preserve Contract as signature/action owner.                                                          |
| Readiness          | Readiness is intentionally project-diagnostic and routes action to owning workspaces.                            | Label readiness as a Project diagnosis stage, not a separate workflow model.                          |
| Schedule           | CrewBoard owns job placement and crew gaps over canonical jobs and assignments.                                  | Route Schedule stage to `/schedule`.                                                                  |
| Field              | Field execution spans Daily Logs, jobs, field notes, work items, and evidence.                                   | Route the primary Field stage to `/daily-logs` as the day-of-work execution surface.                  |
| Closeout           | Closeout context is currently reviewed from Project evidence, proof, field, warranty, and customer-safe records. | Route Closeout back to Project Workspace to avoid inventing a closeout subsystem.                     |
| Invoice            | Invoice Workspace owns billable source lineage and invoice review.                                               | Route Invoice stage to `/invoices`.                                                                   |
| Payment            | Payments and AR own collection/payment-event continuity.                                                         | Route Payment stage to `/payments` and keep collections action in Financials/payments.                |
| Reports            | Reports already summarizes and routes, but it did not provide a compact full-journey ownership map.              | Add a read-only lead-to-cash route map inside Reports so owners can see where each next action lives. |

## Implemented Change

- Added a pure route-map helper at
  `apps/web/lib/workflow-usability/golden-workflow-route-map.ts`.
- Added a compact "Lead-to-cash route map" section to `/reports` using that
  helper.
- Added focused helper coverage for the approved stage order and the
  summarize-and-route Reports boundary.

## Ownership Boundaries Preserved

| Surface           | Preserved responsibility                                               |
| ----------------- | ---------------------------------------------------------------------- |
| Dashboard         | Prioritizes work and attention; no Dashboard file changed.             |
| Project Workspace | Diagnoses readiness and linked-record continuity.                      |
| Owning workspaces | Act on estimates, contracts, jobs, field work, invoices, and payments. |
| Reports           | Summarizes portfolio pressure and routes back to owners.               |
| Settings          | Continues to own tenant configuration.                                 |
| Portal            | No customer-facing portal behavior changed.                            |

## Validation Plan

Validation for this stream should include:

- focused helper test for `golden-workflow-route-map`;
- `pnpm.cmd --filter @floorconnector/web typecheck`;
- `pnpm.cmd --filter @floorconnector/web lint`;
- `pnpm.cmd fc:preflight:fast`;
- `git diff --check`;
- `git diff --cached --check` after staging.

## Follow-Up For Later Streams

- `workspace-density-polish-v1`: use this route map when deciding whether
  Project, Estimate, Contract, Invoice, Job, and Customer workspaces have too
  much duplicate summary density.
- `manager-page-ownership-polish-v1`: verify Dashboard, Reports, Field,
  Financials, and Communications still answer different user questions.
- `portal-customer-clarity-polish-v1`: keep portal language customer-safe and
  do not copy this internal ownership map directly into portal routes.
- `verification-ux-ia-ownership-v1`: protect the route map's stage order,
  Reports summarize-and-route boundary, and no schema/migration drift.
