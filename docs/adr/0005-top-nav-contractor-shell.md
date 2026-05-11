# ADR 0005: Top-Nav Contractor Shell

Status: Accepted
Doc Type: ADR

## Context

The contractor app moved away from an older full-time left-sidebar layout toward a calmer, wider, top-nav-first shell with Manager Page rhythm and contextual workspace patterns.

Related docs: [ui system](C:/FloorConnector/docs/ui-system.md), [target IA](C:/FloorConnector/docs/target-ia.md), [current state](C:/FloorConnector/docs/current-state.md).

## Decision

Use a top-nav-first contractor shell and Manager Page rhythm instead of a full-time left sidebar as the primary navigation model.

## Consequences

- New contractor pages should start from the current shell and manager/workspace patterns.
- Left rails are reserved for contextual deeper-screen navigation where useful.
- Future UI work should preserve dashboard/Manager Page visual continuity and avoid reopening the shell decision without an explicit architecture reason.

