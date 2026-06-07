# Financial Closeout Collections V1 Review Packet

Status: Review Packet
Doc Type: Merge Readiness
Wave: financial-closeout-collections-v1
Prepared From: main

## Executive Summary

The approved financial closeout collections wave completed four streams:
Billing Readiness Command V1, Collections Priority V1, Payment Continuity V1,
and Verification Financial Closeout V1.

Review found the stream commits are merge-ready from the current `origin/main`
base. The implementation slices improve contractor visibility across completed
work, invoice readiness, receivable priority, payment events, partial balances,
and settled payment continuity. The work remains read-only guidance and routing
over canonical invoices, payments, payment events, completed jobs, customers,
and projects.

No stream introduces an accounting replacement, payment gateway/provider
behavior, duplicate financial persistence model, schema change, or migration.
Jeff approval is not granted by this packet; the decision options are listed at
the end.

## Streams Completed

| Stream                             | Worktree                                             | Branch                                      | Commit                                                  | Current Readiness |
| ---------------------------------- | ---------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------- | ----------------- |
| Billing Readiness Command V1       | `C:\FC-worktrees\billing-readiness-command-v1`       | `stream/billing-readiness-command-v1`       | `75435d99 feat: improve billing readiness command`      | Ready             |
| Collections Priority V1            | `C:\FC-worktrees\collections-priority-v1`            | `stream/collections-priority-v1`            | `471bc481 feat: improve collections priority`           | Ready             |
| Payment Continuity V1              | `C:\FC-worktrees\payment-continuity-v1`              | `stream/payment-continuity-v1`              | `3240c503 feat: improve payment continuity`             | Ready             |
| Verification Financial Closeout V1 | `C:\FC-worktrees\verification-financial-closeout-v1` | `stream/verification-financial-closeout-v1` | `03557da5 test: protect financial closeout collections` | Ready             |

All four worktrees exist, are clean, are one commit ahead and zero commits
behind `origin/main`, and still contain the named committed slice.

## Commits By Stream

| Stream                             | Commit     | Summary                                                                                                                                                            |
| ---------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Billing Readiness Command V1       | `75435d99` | Adds billing readiness command helper, tests, Financials Home readiness surface, and read-model loading for completed jobs.                                        |
| Collections Priority V1            | `471bc481` | Adds collections command center helper, tests, and AR workspace priority/status/payment-event lanes.                                                               |
| Payment Continuity V1              | `3240c503` | Adds payment continuity command helper, tests, Payments Manager visibility, and payment-event read-model wiring.                                                   |
| Verification Financial Closeout V1 | `03557da5` | Adds verification helper and tests for canonical source coverage, duplicate model protection, schema drift, provider drift, and accounting replacement boundaries. |

## Files Changed By Stream

### Billing Readiness Command V1

- `apps/web/app/(app)/financials/page.tsx`
- `apps/web/lib/financials/billing-readiness-command.test.ts`
- `apps/web/lib/financials/billing-readiness-command.ts`
- `apps/web/lib/financials/collections-read-model.ts`

### Collections Priority V1

- `apps/web/app/(app)/financials/accounts-receivable/page.tsx`
- `apps/web/lib/financials/collections-command-center.test.ts`
- `apps/web/lib/financials/collections-command-center.ts`

### Payment Continuity V1

- `apps/web/app/(app)/payments/page.tsx`
- `apps/web/lib/payments/manager-read-model.ts`
- `apps/web/lib/payments/payment-continuity-command.test.ts`
- `apps/web/lib/payments/payment-continuity-command.ts`

### Verification Financial Closeout V1

- `apps/web/lib/verification/financial-closeout-collections.test.ts`
- `apps/web/lib/verification/financial-closeout-collections.ts`

## Capabilities Added

- Completed jobs now surface billing readiness from canonical job, customer,
  project, estimate, and invoice context.
- Financials Home now shows completed-work-to-invoice readiness alongside AR,
  payment exception, deposit, project handoff, and settings-boundary routing.
- Accounts Receivable now ranks open invoices by overdue state, failed/voided
  payment evidence, pending checkout/payment state, unpaid deposit state,
  partial balances, retainage, progress billing markers, stale activity, and
  customer exposure.
- Payments Manager now summarizes failed/voided events, pending outcomes,
  partial balances, and settled outcomes from canonical payments, invoices, and
  immutable payment events.
- Verification helper now protects the wave boundary against missing canonical
  invoice/payment/event sources, duplicate financial models, schema drift,
  provider changes, and accounting replacement modules.

## Workflow Improvements

The wave shortens the path from completed work to cash visibility without
creating new financial state:

`Field Complete -> Billing Readiness -> Invoice -> Payment Event -> Collection Priority -> Cash Visibility`

The contractor can now see when completed jobs are ready for invoice review,
when billing prerequisites are missing, which open invoices deserve collection
attention first, and whether payment events explain the current cash outcome.

## User-Facing Changes

- Financials Home adds a Billing Readiness section for completed work moving
  toward invoices.
- Financials Home strengthens continuity links into AR, Payments, Invoices,
  Projects, Customers, Progress Billing, and Settings.
- Accounts Receivable adds AR status lanes, priority groups, payment exception
  review, deposit continuity, customer exposure, and recent settled payment
  separation.
- Payments Manager adds an invoice-to-payment outcome panel for failed, pending,
  partial, and settled payment continuity.

## Docs Updated

The implementation and verification streams did not update docs. This review
packet is the docs artifact for merge readiness.

## Validation Results

Preflight on `main`:

- `git status`: clean, `main` tracking `origin/main`
- `git fetch origin`: completed
- `git rev-list --left-right --count HEAD...origin/main`: `0 0`
- `pnpm.cmd worktree:doctor`: passed
- `pnpm.cmd tooling:baseline -CommandsOnly`: passed

Stream validation reported by the completed wave:

| Stream                             | Validation                                                                                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Billing Readiness Command V1       | Focused helper test passed; `@floorconnector/web` typecheck passed; lint passed; `pnpm.cmd fc:preflight:fast` passed; `git diff --check` passed.       |
| Collections Priority V1            | Focused helper test passed; `@floorconnector/web` typecheck passed; lint passed; `pnpm.cmd fc:preflight:fast` passed; `git diff --check` passed.       |
| Payment Continuity V1              | Focused helper test passed; `@floorconnector/web` typecheck passed; lint passed; `pnpm.cmd fc:preflight:fast` passed; `git diff --check` passed.       |
| Verification Financial Closeout V1 | Focused verification test passed; `@floorconnector/web` typecheck passed; lint passed; `pnpm.cmd fc:preflight:fast` passed; `git diff --check` passed. |

Review packet validation:

- Pending until this packet is formatted and committed:
  `pnpm.cmd exec prettier --check docs/review-packets/financial-closeout-collections-v1.md`
- Pending until this packet is formatted and committed: `git diff --check`
- Pending until this packet is staged: `git diff --cached --check`

## Governance Review

- No merge was performed.
- No PR was opened.
- No next wave was started.
- No implementation feature work was added on `main`.
- No schemas or migrations were modified.
- No production code from `main` was modified by this review-packet task.
- Verification stream was reviewed last and remains a boundary-protection slice,
  not a feature expansion.

## Ownership Review

| Boundary                                      | Finding                                                                                                                                |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Financials owns billing and collection action | Pass. Billing readiness, AR priority, payment event review, and collection routing live in Financials/Invoices/Payments surfaces.      |
| Project remains diagnostic                    | Pass. Project links are continuity and handoff links; Project does not take ownership of billing or collection action.                 |
| Field remains execution owner                 | Pass. Completed jobs are read as execution outcomes; no field execution state is mutated.                                              |
| Communications owns communication action      | Pass. The reviewed streams route financial review only and do not send messages, create threads, or take over communication workflows. |
| Portal remains customer-safe                  | Pass. No portal routes or portal customer-facing financial behavior changed.                                                           |
| Settings owns configuration                   | Pass. Financials Home explicitly routes tax, retainage, numbering, deposit, workflow, and template configuration back to Settings.     |
| Dashboard remains prioritization only         | Pass. No Dashboard ownership or new dashboard financial action was added.                                                              |
| No accounting replacement behavior            | Pass. No ledger, journal, chart-of-accounts, or accounting-sync execution behavior was added.                                          |
| No provider/gateway behavior changes          | Pass. Provider/gateway references are read-only evidence labels only.                                                                  |
| No schema or migration changes                | Pass. No migration, schema, or Supabase type file appears in the reviewed commit file lists.                                           |

## Duplicate Model Review

| Model Risk                          | Finding                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Duplicate invoice model             | None found. The streams read canonical `invoices`.                                                     |
| Duplicate payment model             | None found. The streams read canonical `payments`.                                                     |
| Duplicate payment-event model       | None found. The streams read canonical `payment_events`.                                               |
| Duplicate AR model                  | None found. AR priority is a derived read model, not a persisted AR table.                             |
| Duplicate collection workflow model | None found. Collection priority is derived guidance and routing only.                                  |
| Duplicate accounting model          | None found. No ledger/accounting replacement module was introduced.                                    |
| Duplicate billing readiness model   | None found. Billing readiness is a helper over completed jobs and invoices, not durable billing state. |

## Financial Correctness Review

Invoice balance logic remains canonical. The helpers display or rank
`balance_due_amount`, `total_amount`, and status from existing invoice rows and
format values for presentation. They do not recalculate invoice balances, write
payments, or mutate invoice status.

Paid, partially paid, and overdue handling is visibility-only. Paid and void
invoices are excluded from collection priority rows. Partially paid invoices are
kept in attention lanes when canonical balances remain open. Overdue status is
derived from due dates and the review date, while no due date remains a distinct
aging state.

Payment event interpretation remains event-based. Failed and voided events are
treated as review warnings, payment requests and checkout starts are treated as
pending outcomes, and succeeded/recorded payment evidence is separated from
open exceptions.

Partial payment interpretation is conservative. A recorded payment with a
remaining canonical invoice balance creates a partial-balance attention item;
settled or zero-balance invoices are treated as settled outcomes.

Failure, void, and payment-event continuity remains read-only. The wave does
not retry payments, void payments, finalize payments, call providers, or change
gateway behavior.

Risk assessment: no material math drift, status drift, or payment-state drift
was found in the reviewed commits. Residual risk is sequencing-related: after
each ordered merge advances `main`, the next stream should be refreshed and the
normal validation stack rerun before final approval or merge.

## Workflow Review

The reviewed streams preserve the intended workflow:

1. Field Complete: completed canonical jobs are read as source evidence.
2. Billing Readiness: completed jobs are checked for customer, project,
   estimate, and existing invoice context.
3. Invoice: action links route to canonical Invoice Workspace or invoice
   creation review.
4. Payment Event: immutable `payment_events` provide request, checkout,
   success, failure, void, and provider-sync evidence.
5. Collection Priority: AR priority is derived from canonical invoice balances,
   due dates, workflow roles, payments, events, retainage, and customer
   exposure.
6. Cash Visibility: Payments Manager separates failed, pending, partial, and
   settled outcomes without creating a separate cash ledger.

The chain stays connected to canonical invoices, payments, and payment events.

## Merge Order Recommendation

Recommended merge order:

1. Billing Readiness Command V1
2. Collections Priority V1
3. Payment Continuity V1
4. Verification Financial Closeout V1

Current readiness is `Ready` for all streams from the current `origin/main`
base. During the actual ordered merge process, refresh each later stream against
the newly advanced `main` before merging it. No correction is expected from this
review, but post-refresh validation should still be treated as required.

## Risks And Follow-Ups

- Rerun the normal validation stack after each ordered merge or rebase because
  later streams were reviewed as independent one-commit branches from the same
  current base.
- Keep collection actions manual/review-first until a separate approved wave
  scopes messaging, reminders, or provider-backed collection behavior.
- Keep accounting export/sync and reconciliation execution as future approved
  work; this wave intentionally stops at visibility and guidance.
- Consider a later post-merge docs update to current-state only after merged
  implementation truth exists on `main`.

## Next Recommended Wave Options

- Accounting readiness/export follow-through over canonical invoices, payments,
  tax, retainage, customers, and projects.
- Invoice Workspace closeout refinement that links billing readiness, AR
  priority, and payment evidence into one record-level review surface.
- Communications-approved collection follow-up drafting that routes through the
  existing communications composer without autonomous sends.
- Reports financial closeout rollup that derives cash, AR, overdue, and payment
  exception visibility from the same canonical chain.

## Jeff Decision Options

- Approve merge.
- Request correction.
- Defer stream.
- Continue to next wave.
