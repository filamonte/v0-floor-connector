# Financials Reporting Review Checklist

## Owned Files / Modules

- `/financials`
- `/financials/accounts-receivable`
- `/invoices`
- `/payments`
- `apps/web/lib` helpers for invoice, payment, AR, and reporting summaries.

## Common Risks

- Casual invoice or payment math drift.
- Mutable payment events.
- Separate portal billing or ledger models.
- Accounting-provider truth replacing FloorConnector canonical records.

## Required Validations

- Prettier on changed files.
- Targeted invoice/payment tests for state or math changes.
- Route smoke or E2E when protected financial workflows change.

## Out Of Scope

- Duplicate ledgers.
- Provider posting/sync unless explicitly scoped.
- Payment completion, checkout, or webhook changes without focused tests.

## Merge Readiness Notes

- Payment events stay immutable.
- No separate portal billing model.
- Keep PR as draft until financial validation is complete.

## Human Review Expectations

- Confirm math and payment state are unchanged or fully validated.
- Confirm rollback notes are realistic for financial surfaces.
