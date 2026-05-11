# ADR 0003: Shared Portal Records

Status: Accepted
Doc Type: ADR

## Context

Customers need to review estimates, sign contracts, view invoices, and make payments. If the portal owns separate copies of those records, contractor truth and customer truth drift.

Related docs: [portal architecture](C:/FloorConnector/docs/portal-architecture.md), [current state](C:/FloorConnector/docs/current-state.md), [workflows](C:/FloorConnector/docs/workflows.md).

## Decision

The portal reads and acts on canonical records instead of using portal-specific copies.

## Consequences

- Portal access constrains visibility; it does not redefine business objects.
- Customer actions update contractor-visible canonical truth.
- Portal workflows must not introduce portal-only customers, contracts, invoices, payments, signatures, or files.

