# Stitch Full System Redesign Foundation

Status: Active
Doc Type: Design Implementation Note

## Source Note

This pass could not call a live Stitch MCP tool from the current Codex session. The available design tooling exposed Figma and Canva capabilities, but no Stitch project inspection or Stitch generation tool was callable.

FloorConnector already has a prior Stitch-inspired adoption trail in this folder. This foundation therefore uses the existing Stitch adoption docs as the reviewed design source instead of inventing new unreviewed mockups.

Primary design references:

- [docs/design/stitch/README.md](C:/FloorConnector/docs/design/stitch/README.md)
- [docs/design/stitch/industrial-contrast-DESIGN.md](C:/FloorConnector/docs/design/stitch/industrial-contrast-DESIGN.md)
- [docs/design/stitch/phase-3-dashboard-refresh.md](C:/FloorConnector/docs/design/stitch/phase-3-dashboard-refresh.md)
- [docs/design/stitch/phase-4-project-workspace-visual-maturity.md](C:/FloorConnector/docs/design/stitch/phase-4-project-workspace-visual-maturity.md)
- [docs/design/stitch/phase-5-commercial-detail-visual-maturity.md](C:/FloorConnector/docs/design/stitch/phase-5-commercial-detail-visual-maturity.md)
- [docs/design/stitch/phase-6-manager-pages-global-queue-visual-alignment.md](C:/FloorConnector/docs/design/stitch/phase-6-manager-pages-global-queue-visual-alignment.md)
- [docs/design/stitch/phase-7-field-schedule-execution-visual-alignment.md](C:/FloorConnector/docs/design/stitch/phase-7-field-schedule-execution-visual-alignment.md)
- [docs/design/stitch/phase-8-portal-customer-facing-visual-alignment.md](C:/FloorConnector/docs/design/stitch/phase-8-portal-customer-facing-visual-alignment.md)
- [docs/design/stitch/phase-9-settings-super-admin-platform-control-visual-alignment.md](C:/FloorConnector/docs/design/stitch/phase-9-settings-super-admin-platform-control-visual-alignment.md)
- [docs/design/stitch/phase-10-visual-qa-sweep-and-consolidation.md](C:/FloorConnector/docs/design/stitch/phase-10-visual-qa-sweep-and-consolidation.md)
- [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md)

## System-Wide Design DNA

FloorConnector should read as a connected contractor operating system:

- Graphite anchors shell, command surfaces, and high-trust workspace structure.
- Copper is reserved for primary action emphasis and important workflow handoffs.
- White and warm-neutral working surfaces preserve readability for dense records.
- Manager Pages stay compact, queue-oriented, and top-nav-first.
- Record Workspaces stay review-first, with next action, readiness, and linked-record continuity visible before supporting detail.
- Portal pages remain calmer customer windows over the same canonical records.
- Settings and super-admin stay operational and explicit about control boundaries.

## Screen Family Direction

Dashboard:

- Keep the command-center posture already established in Phase 3.
- Use high-contrast summary areas for company attention, ready-to-move work, finance follow-up, and canonical quick-create entry.

Projects:

- Treat the Projects Manager Page as the global queue into Project Workspaces.
- Reinforce Project Workspace as the readiness and continuity hub.
- Keep project status, customer context, latest movement, and workflow continuity scannable without creating a separate project analytics model.

Estimate Workspace:

- Preserve the estimate-led record workspace pattern.
- Keep customer-facing scope/pricing primary and internal cost/markup behavior out of customer-facing emphasis.

Contract Workspace:

- Keep signature readiness, signer state, and contract handoff visible on the canonical contract record.
- Do not imply a separate signing subsystem.

Invoice / Payments:

- Keep invoice review, balance, payment state, Payment Trail, and collection follow-through on the canonical invoice/payment chain.
- Do not make payment attempts look like completed payments.

Schedule / Field:

- Keep CrewBoard and field execution on canonical jobs, job assignments, Daily Logs, Job Notes, and execution attachments.
- Drag/drop and scheduling enhancements must prepare or confirm existing actions, not mutate on visual interaction alone.

Customer Portal:

- Keep customer-facing copy simple and safe.
- Show review, sign, pay, print/save, and project status actions clearly without exposing contractor-only readiness internals.

## Implementation Plan

Safe first slice:

- Polish the Projects Manager Page header and summary treatment so it visually matches the dark command-center language already established on the Dashboard.
- Keep existing project read models, search, filters, status links, quick-create composer, table rows, and Project Workspace destinations unchanged.
- Do not change schema, migrations, RLS, auth, route structure, server actions, project status logic, readiness logic, or canonical workflow behavior.

Follow-up slices:

- Capture browser screenshots for Dashboard and Projects after saved contractor auth is healthy.
- Apply any future visual refinements route-by-route from real QA findings, not from broad redesign drift.
- Use live Stitch MCP only when the tool is actually available; otherwise keep Stitch work grounded in committed design artifacts.
