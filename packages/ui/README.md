# @floorconnector/ui

Shared UI primitives for FloorConnector.

This package currently exposes the decision-first contractor UI primitives and shared status helpers used by the web app. Components are presentational and must not own workflow, auth, tenant, data-loader, or server-action logic.

## Decision-First Components

Exports:
- `ActionBar`
- `WorkflowBar`
- `ProjectStateSummary`
- `PrimarySection`
- `SecondarySection`

Usage expectations:
- `ActionBar` belongs near the top of workflow Record Workspaces when the page has a truthful next action or waiting state.
- `WorkflowBar` shows conservative progress through an existing workflow and must not overstate downstream readiness.
- `ProjectStateSummary` renders compact state facts that support the next decision.
- `PrimarySection` and `SecondarySection` provide consistent section chrome for core workflow content and lower-priority support context.

## Status Helpers

Exports:
- `getStatusTone()`
- `getStatusToneClassName()`
- `getStatusBadgeClassName()`
- `getStatusConnectorClassName()`
- `normalizeStatusLabel()`
- `statusToneClasses`
- `statusConnectorClasses`
- `StatusTone`

Status semantics:
- gray: neutral, draft, not started, metadata
- blue: active, current, in progress
- amber/yellow: waiting, pending, needs action, warning
- red: blocked, failed, declined, void, error
- green: complete, approved, paid, signed

Orange is not a status color. Keep orange for primary contractor CTAs.

## Theme

Exports:
- `floorConnectorTheme`
- `FloorConnectorTheme`

The theme provides shared color, typography, radius, shadow, and spacing constants for the current contractor UI baseline. Prefer these constants and status helpers over one-off local color systems when building shared contractor UI.

## Guardrails

- Do not add backend, route, auth, RLS, schema, server-action, or workflow behavior to this package.
- Do not encode record-specific business rules in presentational components.
- Derive record state in the app layer, then pass plain labels, tones, links, and actions into the shared components.
- Keep portal and super-admin usage intentional; they should not automatically inherit contractor ActionBar/WorkflowBar patterns.

See [docs/ui-patterns.md](C:/FloorConnector/docs/ui-patterns.md) for the implemented pattern guide.
