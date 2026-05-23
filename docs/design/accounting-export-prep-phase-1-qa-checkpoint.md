# Accounting Export Prep Phase 1 QA Checkpoint

## Purpose

This checkpoint reviews Accounting Export Prep Phase 1 after the first
copy/download CSV affordances landed on Accounting Readiness. It confirms the
export remains a read-only spreadsheet-review helper over existing Accounting
Readiness rows, not accounting sync, ledger behavior, stored export files, or
financial record mutation.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/target-ia.md`
- `docs/vision.md`
- `docs/Roadmap.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/reporting-and-metrics.md`
- `docs/design/financial-control-phase-1-collections-payment-attention.md`
- `docs/design/financial-control-phase-1-qa-checkpoint.md`
- `docs/design/accounting-readiness-phase-1-export-reconciliation-prep.md`
- `docs/design/accounting-export-prep-phase-1.md`
- `docs/local-auth-qa-recovery.md`
- `docs/operating-core-validation-checklist.md`

## Files Inspected

- `apps/web/lib/financials/accounting-export.ts`
- `apps/web/lib/financials/accounting-export.test.ts`
- `apps/web/components/accounting-export-actions.tsx`
- `apps/web/app/(app)/financials/accounting-readiness/page.tsx`
- `apps/web/app/(app)/financials/accounts-receivable/page.tsx`
- `apps/web/lib/financials/accounting-readiness.ts`
- `apps/web/lib/financials/accounting-readiness-read-model.ts`
- `apps/web/lib/financials/collections-summary.ts`
- `apps/web/lib/reports/operations-summary.ts`
- `docs/design/accounting-export-prep-phase-1.md`
- `docs/design/financial-control-phase-1-qa-checkpoint.md`

## Tests Run

- focused Accounting Export tests
- focused Accounting Readiness tests
- focused Financial Control collections-summary tests
- focused Reports operations-summary tests
- web typecheck
- web lint
- focused Prettier write/check on touched files
- `git diff --check`

## Browser Routes Checked Or Skipped

Browser QA was attempted against the local app without refreshing Supabase Auth
or hammering login. Saved contractor auth was not available in this session, so
protected routes were blocked by login content and protected UI rendering was
not counted as verified.

Routes attempted:

- `/financials/accounting-readiness`
- `/financials`
- `/financials/accounts-receivable`
- `/reports`

Copy CSV and Download CSV were not counted as browser-verified because the
protected Accounting Readiness workspace did not load with authenticated local
state.

## CSV And Export Behavior Findings

- The CSV helper consumes existing Accounting Readiness `invoiceRows` and
  `paymentRows` only.
- CSV escaping covers commas, quotes, newlines, carriage returns, and empty
  values.
- Column order is stable and covered by focused tests.
- Filename generation is deterministic and date-stamped as
  `floorconnector-accounting-readiness-YYYY-MM-DD.csv`.
- Export metadata reports row count, column count, empty-state availability, and
  the review-only export notice without touching financial records.
- Copy and download actions are client-side only. They do not call a server
  action, write a database row, create Send Trail evidence, store files, or
  start accounting sync.
- The UI states that the export is for accounting review only and does not sync
  accounting software or change invoice/payment status.

## Financial Math And Behavior Boundaries Confirmed

This QA and hardening pass did not change:

- schema or migrations
- invoice math, tax, discount, retainage, balance, or payment calculations
- payment processing, Stripe, webhooks, provider behavior, or finalization
- auth, RLS, tenant logic, portal grants, settings, or platform-admin behavior
- server-action mutation behavior
- Send Trail events, export audit events, stored files, ledgers, provider sync,
  journal entries, or accounting-provider records

## Follow-Up Candidates

- Run authenticated browser QA after local contractor auth state is refreshed.
- Add date/status filters before export if accounting review workflows need
  scoped extracts.
- Consider a server-generated CSV route only after route-level export governance
  is approved.
- Document accounting-provider mapping policy before any QuickBooks or Xero
  integration work.
