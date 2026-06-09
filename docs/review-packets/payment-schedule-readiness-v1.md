# Payment Schedule Readiness V1

Status: Implementation Complete
Doc Type: Stream Review Packet

Stream id: `payment-schedule-readiness-v1`

## Purpose

Implement the foundation for contract-owned payment requirements and Financial
Readiness rules without creating a duplicate financial chain.

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
- no project creation timing refactor
- no scheduling board implementation
- no UX dashboard cleanup

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

Implemented migration:

- `supabase/migrations/20260609143000_contract_payment_requirements.sql`

The migration adds tenant-scoped `contract_payment_requirements` rows linked to
canonical contracts, projects, customers, optional estimates, and optional
canonical invoice evidence. It adds due-basis, amount-mode, schedule-type,
schedule-blocking, label/notes, sort-order, timestamps, RLS, indexes, and a
scope-validation trigger. The row describes contractual payment terms; it does
not store paid state, replace invoices, replace payments, start checkout,
create pay applications, or create an AIA-only chain.

## UX Impact Expectation

UX change in this stream is minimal. Existing readiness consumers continue to
receive the legacy deposit fields for compatibility, while optional payment
requirement context is now available on the project readiness snapshot for
future focused UI cleanup.

## Anti-Silo Checks

- Payment schedules are contract/business terms, not a second billing system.
- Financial Readiness derives from contract terms plus canonical invoice/payment
  evidence.
- AIA/progress billing extends the SOV -> invoice -> payment chain.
- Portal payment visibility remains customer-safe over canonical invoices and
  payments.
- Contract payment requirements do not create portal-owned payment state,
  checkout state, paid state, or a separate ledger.

## Acceptance Criteria

- Supported due-event model is implemented for contract signing, before
  scheduling, mobilization, completion, net terms, milestone, and future
  progress/AIA placeholders.
- Supported schedule types are implemented for no upfront payment required, net
  terms, due on completion, deposit before scheduling, 50/50, thirds, milestone
  placeholder, and progress-billing placeholder.
- Project Financial Readiness inspects contract payment requirements when they
  exist and falls back to the legacy organization deposit invoice behavior when
  they do not.
- Schedule-blocking requirements block readiness until canonical
  invoice/payment evidence satisfies the requirement.
- Non-blocking net terms, due-on-completion, milestone placeholder, and
  progress-billing placeholder rows do not pretend billing is complete.
- Targeted readiness and migration-boundary tests cover the implemented rules.

## Validation Plan

Implemented focused tests:

- `apps/web/lib/projects/payment-schedule-readiness.test.ts`
- `apps/web/lib/projects/payment-schedule-readiness-migration.test.ts`

The tests cover no-upfront, net terms, due-on-completion, deposit-required,
partial payment, 50/50 percentage threshold, 50/50 first-blocking-event, thirds
percentage threshold, thirds first-blocking-event, missing invoice-total
percentage guards, milestone placeholder, progress/AIA placeholder, canonical
evidence, legacy deposit compatibility, tenant-scoped migration structure, RLS
posture, invoice evidence reuse, and no full AIA/pay-application fields.

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

- Stream implementation is ready for review after validation passes.
- Merge requires targeted tests, web typecheck/lint, fast preflight,
  `git diff --check`, staged diff check, and `worktree:doctor`.
- `project-handoff-alignment-v1` can consume the readiness result after this
  stream merges, but it must not change Project creation timing inside this
  stream.

## Parallel Eligibility

This stream can run in parallel with `ux-governance-beta-cleanup-v1` because UX
cleanup must avoid business logic. It coordinates with
`opportunity-assessment-package-v1` only where future financing/payment-interest
signals may feed contract terms. It blocks `project-handoff-alignment-v1` from
final readiness assumptions until merged.

## Implementation Summary

- Added canonical `contract_payment_requirements` schema, enums, RLS, indexes,
  comments, and tenant/record scope validation.
- Added shared payment schedule / requirement types and domain constants.
- Updated `computeCommercialReadiness` so payment requirements drive Financial
  Readiness when present.
- Updated Project Financial Readiness loading so requirements are read from the
  contract/project chain and satisfaction comes from canonical invoice/payment
  evidence.
- Preserved legacy deposit invoice behavior as the fallback path when no
  contract payment requirements exist.

## Review Blocker Correction

Review found that percentage payment requirements were modeled in the migration,
types, and domain constants, but readiness satisfaction only evaluated fixed
amounts or paid / zero-balance invoice evidence.

Correction made:

- Percentage requirements now calculate the required threshold from linked
  invoice total and configured percentage.
- Canonical recorded payment amount must meet or exceed the computed threshold
  unless the linked invoice is already marked paid.
- 50/50 and thirds remain limited to the first schedule-blocking requirement in
  this slice.
- Tests now cover below-threshold and at-threshold 50/50 and thirds behavior,
  plus percentage requirements without linked invoice total.
- No full AIA, milestone automation, provider behavior, checkout behavior,
  invoice generation, or new financial silo was added.
