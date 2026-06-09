# Payment Schedule Readiness V1

Status: Proposed
Doc Type: Stream Review Packet

Stream id: `payment-schedule-readiness-v1`

## Purpose

Plan the foundation for contract payment schedules and Financial Readiness
rules without creating a duplicate financial chain or implementing behavior in
this planning task.

## Owner Area

Contract payment terms, payment schedule templates or terms, readiness
requirements, and the Financial Readiness bridge into Project readiness,
scheduling, and production readiness.

## Dependencies

- Canonical contracts, invoices, payments, payment events, approved estimate
  snapshots, SOV/progress-billing scaffolding, and retainage foundations.
- Existing contract signature and deposit readiness behavior.
- `docs/product-operating-model.md` payment-schedule doctrine.
- `docs/aia-progress-billing-plan.md` for future AIA boundaries.
- Project handoff and scheduling readiness consumers.

## Non-Goals

- no full AIA implementation
- no accounting integration
- no provider or Stripe behavior changes
- no payment completion, retry, refund, dispute, or webhook changes
- no detached checkout/payment model
- no duplicate ledger or payment schedule silo
- no invoice math changes without later targeted tests

## Records / Pages Likely Affected

Likely records:

- `contracts`
- `contract_signers`
- `invoices`
- `invoice_line_items`
- `payments`
- `payment_events`
- `projects`
- `jobs`
- `schedule_of_values`
- `schedule_of_value_items`

Likely pages/components:

- Contract Workspace
- Project Workspace readiness panels
- Invoice Workspace and Payment Trail surfaces
- Financials / Accounts Receivable
- Schedule / CrewBoard readiness handoff
- Settings workflow or financial defaults, only if a later approved stream
  scopes configuration

## Data Model Impact Expectation

Likely migration needs exist if payment schedules become persisted contract
terms, payment schedule templates, or due-event requirements. Any migration must
preserve tenant ownership, RLS, indexes for common query paths, and canonical
invoice/payment continuity.

If implementation can begin with read-model planning or existing fields, the
stream should prove that before adding schema.

## UX Impact Expectation

UX should clarify which payment requirement applies now, why it is required,
what source record proves satisfaction, and which owning workspace acts. It
must avoid making Financial Readiness look like a generic deposit flag.

## Anti-Silo Checks

- Payment schedules are contract/business terms, not a second billing system.
- Financial Readiness derives from contract terms plus canonical invoice/payment
  evidence.
- AIA/progress billing extends the SOV -> invoice -> payment chain.
- Portal payment visibility remains customer-safe over canonical invoices and
  payments.

## Acceptance Criteria

- Supported due-event model is defined for contract signing, mobilization,
  completion, net terms, milestone, and future progress/AIA placeholders.
- Readiness calculation inputs and outputs are named.
- Required source records for each readiness state are named.
- Project readiness and scheduling consumers are identified.
- Migration need and RLS impact are explicitly accepted or deferred.
- Targeted validation requirements are recorded before implementation.

## Validation Plan

Future implementation should include focused tests for payment-schedule
readiness helpers, financial readiness edge cases, invoice/payment continuity,
and any migration/RLS behavior if schema changes are approved.

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

- Starts first after wave review.
- Must not merge with financial math or schema changes unless targeted tests
  and RLS review pass.
- Must document whether `project-handoff-alignment-v1` can consume the readiness
  result.

## Parallel Eligibility

Can start first or run in parallel with a narrowed assessment planning stream.
It is an upstream dependency for `project-handoff-alignment-v1`.
