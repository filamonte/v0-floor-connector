# Accounting Export Prep Phase 1

## Purpose

Accounting Export Prep Phase 1 adds copy/download CSV affordances to Accounting
Readiness without creating an accounting integration.

The feature helps contractors move existing accounting review rows into a
spreadsheet for review. It does not sync to accounting software, create a
ledger, store export files, create audit/export events, or change source
financial records.

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

## Existing Data Used

The export uses only the Accounting Readiness page data already loaded from:

- invoices
- payments
- payment events
- customers
- projects
- invoice tax reporting entries
- invoice retainage snapshots

The export helper consumes `invoiceRows` and `paymentRows` from the existing
Accounting Readiness helper output. It does not fetch additional data and does
not recalculate invoice/payment truth differently.

## Export Prep Approach Chosen

Chosen approach: client-side copy/download CSV generated from server-rendered
Accounting Readiness data.

Reason:

- no new route is required
- no server action is required
- no database write is required
- no stored export file is created
- no Send Trail or export audit event is created
- the contractor can still copy or download a spreadsheet-ready CSV

The implementation uses:

- `apps/web/lib/financials/accounting-export.ts`
- `apps/web/components/accounting-export-actions.tsx`

## Columns Included

- Invoice reference
- Invoice status
- Customer
- Project
- Invoice date
- Due date
- Subtotal
- Tax
- Retainage
- Total
- Paid
- Balance due
- Payment status
- Latest payment date
- Payment method/source
- Payment attention
- Invoice link
- Project link

CSV escaping covers commas, quotes, and newlines.

## UI Changes

`/financials/accounting-readiness` now includes a compact Export-ready columns
section with:

- Copy CSV
- Download CSV
- a plain notice that the export does not sync accounting software, store a
  file, or change invoice/payment status
- the included column map

`/financials/accounts-receivable` also links to Accounting Readiness so AR users
can move from collections review into export prep without cluttering navigation.

## Behavior Preserved

This pass does not change:

- schema or migrations
- invoice math, tax, discount, retainage, balance, or payment calculations
- payment finalization
- Stripe, webhook, provider, or payment behavior
- auth, RLS, tenant logic, portal grants, settings, or platform-admin behavior
- server actions
- Send Trail events
- data export history or stored files

The CSV is an in-browser generated artifact from currently loaded rows.

## Intentionally Not Implemented Yet

- QuickBooks integration
- Xero integration
- journal entries
- chart of accounts mapping
- automated reconciliation
- bank feeds
- refunds or disputes
- subscription billing
- payroll or labor costing
- tax filing reports
- AIA/pay app export
- accounting sync status
- export history or audit log
- stored export files

## Follow-Up Candidates

- Add filters before export once accounting review workflows need them.
- Add server-generated CSV only if route-level export governance is approved.
- Add mapping presets only after accounting-provider policy is documented.
- Add export history only after storage/audit policy is explicitly approved.

## Browser QA Limitations

Protected contractor routes require a valid local contractor auth session. In
this pass, protected routes returned login content; the implementation
therefore relies on static validation and focused tests until saved local auth
is refreshed.
