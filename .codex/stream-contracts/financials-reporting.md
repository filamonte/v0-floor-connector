# Financials Reporting Stream Contract

## Owns

- AR Control Room, collections visibility, payment evidence, reports over
  invoices/payments/payment events, and financial-readiness summaries.

## May Touch With Caution

- AR/reporting pages, read-only invoice/payment helpers, payment-event
  visibility, financial docs, and focused tests.

## May Not Touch Without Control Approval

- Invoice math, payment-state transitions, provider reconciliation, webhooks,
  accounting sync, duplicate ledgers, schema/migrations, or portal-owned billing
  records.

## Validation Expectations

- Focused financial helper tests.
- Typecheck and lint for runtime changes.
- Payment tests only when explicitly scoped.
- `git diff --check`.

## Docs Expectations

- Keep financial reporting read-only unless a separate approved slice changes
  financial behavior.

## Example Safe Slice

Add a collections visibility bucket derived from canonical invoice/payment
state.

## Example Unsafe Slice

Change invoice balance calculation while improving AR presentation.
