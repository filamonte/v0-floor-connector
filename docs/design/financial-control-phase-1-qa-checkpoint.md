# Financial Control Phase 1 QA Checkpoint

## Purpose

This checkpoint reviews Financial Control Phase 1 after the collections and
payment-attention workspace landed. It confirms the implementation remains a
read-only owner/manager visibility layer over existing invoices, payments,
payment events, customers, and projects.

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
- `docs/product-language-audit.md`
- `docs/reporting-and-metrics.md`
- `docs/design/financial-control-phase-1-collections-payment-attention.md`
- `docs/design/accounting-readiness-phase-1-export-reconciliation-prep.md`
- `docs/design/reporting-phase-1-operations-collections-visibility.md`
- `docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md`
- `docs/design/proof-center-phase-1-project-document-evidence-index.md`
- `docs/design/document-engine-phase-1-pdf-export-foundations.md`
- `docs/design/document-engine-phase-2a-closeout-package-print-route.md`
- `docs/local-auth-qa-recovery.md`
- `docs/operating-core-validation-checklist.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`

## Files Inspected

- `apps/web/lib/financials/collections-summary.ts`
- `apps/web/lib/financials/collections-summary.test.ts`
- `apps/web/lib/financials/collections-read-model.ts`
- `apps/web/lib/financials/accounting-readiness.ts`
- `apps/web/lib/financials/accounting-readiness.test.ts`
- `apps/web/lib/financials/accounting-readiness-read-model.ts`
- `apps/web/app/(app)/financials/page.tsx`
- `apps/web/app/(app)/financials/accounts-receivable/page.tsx`
- `apps/web/app/(app)/financials/accounting-readiness/page.tsx`
- `apps/web/app/(app)/reports/page.tsx`
- `apps/web/app/(app)/invoices/page.tsx`
- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(app)/payments/page.tsx`
- `apps/web/lib/reports/*`
- `apps/web/lib/invoices/*`
- `apps/web/lib/payments/*`

## Tests Run

- focused Accounting Readiness tests
- focused Accounting Export tests
- focused Financial Control collections-summary tests
- focused collections-core tests
- focused reports operations-summary tests
- web typecheck
- web lint
- focused Prettier write/check on touched files
- `git diff --check`

## Browser Routes Checked Or Skipped

Protected contractor routes were checked through the local dev server. The app
responded, but saved contractor auth was not available and protected routes
returned login content instead of the protected workspace.

Routes attempted:

- `/financials`
- `/financials/accounts-receivable`
- `/financials/accounting-readiness`
- `/reports`
- `/invoices`

Because the routes rendered login content, protected route rendering was not
counted as verified. No browser result was invented.

## Financial Control Findings

- Financial Control summary uses existing invoice, payment, and payment-event
  data from the tenant-scoped collections read model.
- Collections visibility does not duplicate invoice, payment, project, customer,
  ledger, or accounting records.
- Payment attention labels route back to source Invoice Workspace or Payments
  surfaces where existing links are available.
- `/financials` and `/financials/accounts-receivable` remain owner-friendly and
  avoid accounting-provider-specific wording.
- Payment behavior, provider behavior, payment finalization, and invoice math
  were not changed.
- No fake financial data or placeholder business rows were introduced.

## Behavior Preserved

This checkpoint confirms no changes to:

- schema or migrations
- invoice math, tax, discount, retainage, balance, or payment calculations
- payment processing, Stripe, webhooks, provider behavior, or finalization
- auth, RLS, tenant logic, portal grants, settings, or platform-admin behavior
- server-action mutation behavior
- AI, automation, emails, reminders, refunds, disputes, subscriptions, or
  accounting sync

## Follow-Up Candidates

- Add date/status filters to Accounting Readiness after the export workflow is
  stable.
- Add accounting mapping policy docs before provider-specific integration work.
- Add an authenticated browser QA pass once local contractor auth state is
  refreshed.
- Consider a future export-history policy only after storage/audit boundaries
  are explicitly approved.
