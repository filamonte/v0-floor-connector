# UI System

Status: Active
Doc Type: Operational

This document captures current contractor UI guardrails. Use [docs/current-state.md](C:/FloorConnector/docs/current-state.md) for implemented detail and [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md) for future IA direction.

## Current UI Guardrails

- Top-nav-first contractor shell is the current baseline.
- Do not return to the old full-time left-sidebar pattern as primary navigation.
- Dashboard is the visual reference for broader contractor surfaces.
- Manager Pages should use the shared page identity, thin context band, command bar, overview/list workspace, and practical density.
- Quick-create overlays should collect minimum required fields, create canonical records first, then route to full workspaces.
- Record Workspaces should carry workflow/readiness context and link back to project continuity.
- Contextual side rails are useful on deeper record screens only when they help the user navigate related record context.
- Project, estimate, contract, invoice, and job workspaces should continue converging on one shared record-workspace language.
- Portal and super-admin should remain intentionally different where their audiences and permissions differ.

## UI Anti-Drift Rules

- Do not make Manager Pages into isolated mini-apps.
- Do not create local-only draft systems for canonical record creation.
- Do not hide project/shared-record continuity behind module-local queues.
- Do not reintroduce blue-heavy contractor chrome or unrelated visual systems on new contractor pages.
- Do not use in-app feature-explanation copy to compensate for unclear workflows; improve the workflow surface itself.

