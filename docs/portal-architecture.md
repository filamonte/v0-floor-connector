# Portal Architecture

Status: Active
Doc Type: Operational

The customer portal is a surface on canonical FloorConnector records. It is not a separate product with duplicate records.

Use [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for implemented portal status and [docs/workflows.md](C:/FloorConnector/docs/workflows.md) for workflow rules.

## Portal Rules

- Portal access is granted explicitly.
- Project visibility is scoped.
- Portal users act on shared estimates, contracts, invoices, payments, and project records.
- Portal actions update contractor-visible canonical truth.
- Portal must not create portal-specific copies of customers, projects, contracts, invoices, payments, signatures, or files.

## Shared Record Behavior

Implemented and future portal workflows should use the same canonical records as the contractor app:
- estimate review and approval
- contract review, signature, decline, and signature events
- invoice review
- payment initiation and payment-state continuity
- project-scoped visibility

## Anti-Drift Rules

- Do not add portal-only customer records.
- Do not add portal-only contract records.
- Do not add portal-only invoice/payment records.
- Do not let portal permissions become separate module-local access systems.
- Do not expose records outside the granted project/customer visibility boundary.

