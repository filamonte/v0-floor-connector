# Accounting Readiness Phase 1 - Export And Reconciliation Prep

## Purpose

Accounting Readiness Phase 1 adds a contractor-side, read-only review surface for
invoice, payment, tax, retainage, customer, project, and Payment Trail context
before accounting export or reconciliation work.

This is not a QuickBooks or Xero integration. It does not create a ledger,
journal entries, provider reconciliation posting, accounting sync, stored export
files, or duplicate financial records.

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
- `docs/design/reporting-phase-1-operations-collections-visibility.md`
- `docs/design/proof-center-phase-1-project-document-evidence-index.md`
- `docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md`
- `docs/design/document-engine-phase-1-pdf-export-foundations.md`
- `docs/design/document-engine-phase-2a-closeout-package-print-route.md`
- `docs/local-auth-qa-recovery.md`
- `docs/operating-core-validation-checklist.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`

## Existing Data Used

The phase uses existing tenant-scoped source records only:

- `invoices`
- `payments`
- `payment_events`
- `customers`
- `projects`
- `invoice_tax_reporting_entries`

Invoice rows use existing invoice snapshot fields for subtotal, tax, tax
collected, retainage held, total, and balance due. Payment rows use existing
payment amount, status, method, source, date, reference, and invoice context.
Payment attention uses existing Payment Trail event types.

## Route And Surface Changed

Implemented route:

- `/financials/accounting-readiness`

Linked from:

- `/financials`
- `/reports`
- invoice detail overflow actions

The route uses `getAccountingReadinessReadModel`, which loads existing financial
records and passes them into the pure helper
`buildAccountingReadiness`.

## Accounting Review Data Implemented

The Accounting Readiness page includes:

- total invoiced
- total paid
- total open
- paid/open invoice counts
- payments needing review
- tax snapshot total when existing tax snapshots are available
- retainage-held total from invoice snapshots
- invoice accounting review rows
- payment review rows
- reconciliation attention list
- export-ready column map

Invoice rows link back to the canonical Invoice Workspace. Customer and project
context links use existing `/customers/:id` and `/projects/:id` routes when the
source record has that context.

## Export Prep Behavior

Phase 1 exposes a consistent export-ready column map and review table. It does
not generate or download a CSV file.

Deferred export file generation avoids introducing export storage, accounting
file contracts, provider-specific mappings, or a false sense of accounting sync.

## Behavior Preserved

This pass did not change:

- schema or migrations
- invoice math
- payment math
- payment finalization
- Stripe, webhook, or provider behavior
- server actions
- auth, RLS, tenant logic, or portal grants
- settings or platform-admin behavior
- financial record ownership
- reports source-record semantics

The implementation is read-only visibility and navigation over existing records.

## Intentionally Not Implemented

- QuickBooks integration
- Xero integration
- journal entries
- chart of accounts mapping
- automated reconciliation
- bank feeds
- refunds or disputes
- subscription billing
- payroll or labor costing
- accounting export file generation
- tax filing reports
- AIA/pay app export
- accounting provider sync

## Follow-Up Candidates

- Add an explicit CSV download once export file ownership, columns, and audit
  policy are approved.
- Add filters for issue date, paid date, invoice status, and payment status.
- Add a print-friendly accounting review route if teams need a browser-save
  packet.
- Add accounting mapping policy docs before any provider-specific integration.
- Add invoice-detail accounting readiness facts if more record-level depth is
  needed.

## Browser QA Limitations

Protected contractor routes require saved local auth. If local auth redirects to
login, browser QA should record the exact redirect and rely on static validation
and focused tests rather than inventing protected-route results.
