# Financial Control Phase 1 - Collections And Payment Attention

Status: Implemented

Financial Control Phase 1 improves contractor-side collections visibility on
the existing Financials and Accounts Receivable routes. It uses existing
invoices, payments, payment events, customers, and projects to answer what money
is open, what is overdue, which payment signals need review, and where the owner
or manager should click next.

## Purpose

This phase helps answer:

- what money is open?
- what is overdue?
- what payment requests or checkout starts are pending?
- what payment failures or voids need review?
- which invoices and projects need collection attention?
- what is the next financial move?

The work is read-only financial visibility and workflow navigation. It does not
change payment processing, invoice math, provider behavior, or accounting
posting.

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
- `docs/design/reporting-phase-1-operations-collections-visibility.md`
- `docs/design/proof-center-phase-1-project-document-evidence-index.md`
- `docs/design/messagecenter-phase-1-project-communication-timeline.md`
- `docs/design/sendtrail-phase-1-document-delivery-proof-visibility.md`
- `docs/design/portal-maturity-phase-4-shared-documents.md`
- `docs/design/portal-maturity-phase-4-qa-customer-window.md`
- `docs/local-auth-qa-recovery.md`
- `docs/operating-core-validation-checklist.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`

## Existing Data Used

The implementation reuses the existing Financials collections read model over:

- invoices
- payments
- payment events
- customers
- projects
- estimate/job references already present on invoice rows

The new helper builds UI-friendly attention lists from the data already loaded
by `getFinancialCollectionsReadModel`. It does not add loader permissions,
schema, migrations, routes, or new financial records.

## Financial Surfaces Changed

- `/financials` now presents Financial Control as an owner-friendly summary with
  open receivables, overdue amount, pending payment count, payment attention,
  a deterministic Next Move, project collection attention, and invoice
  attention.
- `/financials/accounts-receivable` now adds the same Next Move, project
  attention, invoice-level Next Move labels, project links, and Payment Trail
  attention language.
- Invoice detail was inspected and already contains invoice payment summary,
  Payment Trail, recording, send-link, and connected-record context. No invoice
  action behavior was changed in this phase.
- `/reports` was left on its existing Phase 1 collections cards and remains
  aligned through the same Financials read model.

## Metrics And Lists Implemented

The `buildFinancialControlSummary` helper returns:

- `openReceivablesAmount`
- `overdueAmount`
- `openInvoiceCount`
- `overdueInvoiceCount`
- `pendingPaymentCount`
- `failedPaymentCount`
- `paymentRequestedCount`
- `partiallyPaidCount`
- `paidRecentlyCount`
- `invoicesNeedingAttention`
- `paymentEventsNeedingReview`
- `projectCollectionAttention`
- `nextMove`

The helper keeps totals derived from the existing collections core helper so
Financial Control does not introduce a second balance calculation.

## Next Move Rules

Next Move selection is deterministic:

1. failed or voided payment events route to `Review Payment Trail`
2. overdue invoices route to `Follow up on payment`
3. payment requested or checkout-started events route to
   `Follow up on payment`
4. other open invoices route to `Review invoice`
5. empty state routes to `Review accounts receivable`

These are navigation labels only. They do not create payments, send reminders,
retry checkout, or change invoice state.

## Behavior Preserved

This phase preserves:

- schema and migrations
- route paths
- server actions and mutation behavior
- payment provider behavior
- Stripe and webhook behavior
- payment finalization
- invoice totals, tax, discount, retainage, balance, and payment math
- auth, tenant, and RLS behavior
- portal grants and Customer Access behavior
- settings and platform-admin behavior

No refunds, disputes, subscriptions, accounting sync, collections reminders,
AI summaries, automations, emails, fake financial data, duplicate ledgers, or
portal-only payment records were added.

## Intentionally Not Implemented

Future work still not implemented:

- refunds
- disputes
- subscriptions
- retry automation
- provider reconciliation posting
- accounting integration
- QuickBooks sync
- collections reminders
- payment plans
- aging report export
- customer billing center settings
- dunning automation
- cash-flow forecasting

## Follow-Up Candidates

- add a deeper aging report export after export governance is defined
- add a collections reminder workflow only after notification and approval
  boundaries are implemented
- add accounting-sync visibility only after provider adapter boundaries are
  implemented
- let Reports consume the richer Financial Control helper if Reports later
  needs project-level collection attention

## Browser QA Limitations

Protected-route browser QA should use saved contractor auth only. If local auth
redirects to login or storage state is stale, record the blocked routes without
inventing browser verification.
