# ADR 0004: Append-Only Financial Events

Status: Accepted
Doc Type: ADR

## Context

Invoices, payments, signature activity, provider callbacks, and financial state transitions need auditability. Rewriting history would weaken billing, support, reconciliation, and customer trust.

Related docs: [financial architecture](C:/FloorConnector/docs/financial-architecture.md), [current state](C:/FloorConnector/docs/current-state.md), [workflows](C:/FloorConnector/docs/workflows.md).

## Decision

Financial, payment, and signature lifecycle events should preserve audit history and extend canonical records. Event rows should be append-only or effectively immutable when they represent history.

## Consequences

- Provider data is evidence or telemetry, not the business source of truth.
- Historical financial and signature activity should be preserved rather than overwritten.
- Future refunds, disputes, retries, reconciliation, subscriptions, and external e-sign integrations must attach back to canonical records and event history.

