# UX Governance Beta Cleanup V1

Status: Proposed
Doc Type: Stream Review Packet

Stream id: `ux-governance-beta-cleanup-v1`

## Purpose

Plan beta-blocking UX consistency cleanup under the merged Design System
Governance doc without changing business logic, canonical ownership, schema, or
workflow behavior.

## Owner Area

Dashboard duplication, invoice/payment dashboard overlap, status/color
consistency, action hierarchy, manager page consistency, workspace consistency,
and command center versus dashboard versus workspace responsibilities.

## Dependencies

- `docs/design-system-governance.md`
- `docs/graphite-copper-ui-system.md`
- `docs/ui-patterns.md`
- Current contractor shell, Manager Page, Record Workspace, Portal, Settings,
  and Super Admin patterns.
- Existing operational ownership rule: Dashboard prioritizes, Project
  diagnoses, owning workspaces act.

## Non-Goals

- no business logic changes
- no schema or migrations
- no role-specific data models
- no dashboard-owned workflow records
- no route rewrites or major redesign
- no new protected workflow behavior
- no portal exposure of contractor-only language
- no settings/super-admin boundary drift

## Records / Pages Likely Affected

Likely pages/components:

- Dashboard
- Financials Home
- Invoices Manager Page
- Payments Manager Page
- Accounts Receivable
- Project Workspace
- Manager Pages
- Record Workspaces
- Settings
- Super Admin
- Portal review surfaces only if customer-safe copy drift is found

Records should not be changed by this stream except through existing read-only
queries already used by the affected pages.

## Data Model Impact Expectation

No schema or migration impact expected. If a proposed cleanup needs new data,
it must return to Architecture Review instead of adding fields or persistence.

## UX Impact Expectation

The stream should improve scanability, status consistency, page responsibility,
action hierarchy, and beta usability. It should reduce duplicated summaries and
make source-record handoffs clearer while preserving current routes and
behavior.

## Anti-Silo Checks

- Dashboard remains prioritization, not action ownership.
- Financials owns cross-project billing/payment review, not a duplicate ledger.
- Project Workspace diagnoses operational state; owning workspaces act.
- Role-aware dashboard targets remain presentation only.
- Status colors follow governance semantics and Copper remains action emphasis.

## Acceptance Criteria

- Dashboard duplication and financial dashboard overlap are inventoried before
  implementation.
- Color/status inconsistencies are mapped to semantic fixes.
- Primary/secondary/destructive/unavailable action hierarchy is checked.
- Manager Page and Record Workspace inconsistencies are scoped narrowly.
- Portal, Settings, and Super Admin boundaries remain intact.
- No business logic, schema, migration, or provider behavior changes occur.

## Validation Plan

Future implementation should include Prettier, typecheck, lint, `git diff
--check`, and protected route smoke for changed pages where practical. Browser
smoke should report auth/data blockers honestly.

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

- Can run in parallel only if it stays UI/read-model presentation-only.
- Must not change payment math, readiness gates, auth, RLS, portal grants,
  signature state, schedule state, or provider behavior.
- Must use existing data only unless a later Architecture Review expands scope.

## Parallel Eligibility

Can run in parallel with the operating-core streams because it should not touch
business logic. If it needs to edit shared readiness helpers or financial
helpers, it must stop and coordinate with the owning implementation stream.
