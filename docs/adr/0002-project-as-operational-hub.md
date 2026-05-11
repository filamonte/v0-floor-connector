# ADR 0002: Project As Operational Hub

Status: Accepted
Doc Type: ADR

## Context

Flooring contractor work becomes operationally meaningful around the project: scope, estimate, contract, scheduling, execution, files, invoices, payments, and closeout all need shared context.

Related docs: [target IA](C:/FloorConnector/docs/target-ia.md), [workflows](C:/FloorConnector/docs/workflows.md), [ui system](C:/FloorConnector/docs/ui-system.md).

## Decision

Project detail becomes the main readiness and workflow hub over time. Global routes remain useful as queues, manager pages, and cross-project work surfaces.

## Consequences

- Project workspaces should surface linked estimate, contract, invoice, job, field, and financial context.
- Global routes such as `/estimates`, `/jobs`, `/invoices`, and `/schedule` remain valid.
- Future UX work should increase project-centered continuity without removing useful global queues prematurely.

