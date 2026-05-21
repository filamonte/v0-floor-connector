# ADR 0001: Canonical Record Chain

Status: Accepted
Doc Type: ADR

## Context

FloorConnector connects sales, operations, execution, finance, portal actions, and future growth layers for specialty contractors. Disconnected module data models would create duplicate entry, broken handoffs, and unreliable financial lineage.

Related docs: [canonical lifecycle](C:/FloorConnector/docs/canonical-lifecycle.md), [architecture principles](C:/FloorConnector/docs/architecture-principles.md), [current state](C:/FloorConnector/docs/current-state.md).

## Decision

Use one shared canonical lifecycle rather than disconnected module data models:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Supporting stages may exist, but they must feed or extend this chain.

## Consequences

- New modules must reuse canonical records where they already exist.
- Portal, AI, public acquisition, communications, and provider integrations must not create duplicate business truth.
- Downstream records must preserve upstream lineage.
- Planning docs must clearly label future supporting stages so they are not mistaken for separate implemented systems.

