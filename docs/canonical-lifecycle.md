# Canonical Lifecycle

Status: Stable
Doc Type: Philosophy

FloorConnector's canonical lifecycle is:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

This is the shared record chain for sales, operations, customer actions, execution, finance, and closeout.

## How To Read The Lifecycle

- `opportunity` is the canonical pre-customer commercial record, even when UI copy says lead or intake.
- `customer` is the commercial/account relationship.
- `project` is the operational hub over time.
- `estimate` defines proposed commercial scope.
- `contract` defines committed customer agreement and signature state.
- `change order` appends approved scope changes without rewriting prior approved truth.
- `job` represents execution work.
- `invoice` represents money owed.
- `payment` represents money collected.

## Supporting Stages

Not every operational stage needs a separate canonical business model. Site assessment, scope intake, readiness, delivery proof, communication, files, AI suggestions, and future takeoff can support the lifecycle without replacing it.

## Lineage Rules

- Records flow forward.
- Downstream records preserve upstream lineage.
- Approved commercial snapshots must not be replaced by live mutable estimate rows.
- Provider, portal, AI, or public website data must attach to canonical records instead of becoming the new truth.

