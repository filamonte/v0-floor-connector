# ADR 0006: Universal Create Pattern

Status: Accepted
Doc Type: ADR

## Context

FloorConnector needs fast creation across modules without creating local-only drafts or disconnected records. Creation must preserve context and route into the canonical workflow.

Related docs: [developer source of truth](C:/FloorConnector/docs/developer-source-of-truth.md), [ui system](C:/FloorConnector/docs/ui-system.md), [canonical lifecycle](C:/FloorConnector/docs/canonical-lifecycle.md).

## Decision

Quick create captures minimum fields, creates the canonical record first, then routes into the full workspace. Creation must be context-aware:

- project context auto-links the project and derived customer
- customer context requires selecting or creating a project
- global context requires both customer and project selection when downstream records need them

## Consequences

- Quick create must not become a separate draft system.
- Manager Pages should not attempt full record authoring inside overlays.
- Downstream records must preserve canonical context from creation onward.

