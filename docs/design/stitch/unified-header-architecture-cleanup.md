# Unified Header Architecture Cleanup

Date: 2026-05-21

## Problem Statement

The Stitch-informed Graphite / Copper adoption improved many app surfaces, but some routes began to feel like the new command bands were stacked underneath existing app, workspace, and record headers. The result was a duplicated-header feel: global app navigation, page header, command band, and record summary all competing for the same page identity.

This cleanup keeps the visual system and the new components, but reduces the second-header effect. The target hierarchy is:

1. Global app navigation/header
2. One dominant page or record identity area
3. Supporting summary/action panels where useful
4. Main content

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/target-ia.md`
- `docs/chat-handoff.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`
- `docs/design/stitch/phase-10-visual-qa-sweep-and-consolidation.md`
- `docs/design/stitch/browser-demo-qa-2026-05-21.md`

## Files Inspected

- `apps/web/app/(app)/layout.tsx`
- `apps/web/components/contractor-app-shell.tsx`
- `apps/web/components/protected-app-top-nav.tsx`
- `apps/web/components/protected-app-workspace-band.tsx`
- `apps/web/components/contractor-workspace-page.tsx`
- `apps/web/components/workspace-command-bar.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/components/commercial-document-command-band.tsx`
- `apps/web/components/field-execution-command-band.tsx`
- `apps/web/components/portal-review-ui.tsx`
- `apps/web/components/settings-surface-layout.tsx`
- `apps/web/components/settings-section-card.tsx`
- `apps/web/components/super-admin-console.tsx`
- Detail pages using the commercial, field, and portal review components

## Header / Chrome Hierarchy Before Cleanup

- Manager/list pages used `ContractorWorkspacePage` for page identity, then rendered `WorkspaceCommandBar` as a separate card immediately below it.
- Estimate, Contract, and Invoice detail pages had existing `DetailPageHeader` identity areas and then a strong dark `CommercialDocumentCommandBand` below them.
- Job and Daily Log detail pages had existing `DetailPageHeader` identity areas and then a strong dark `FieldExecutionCommandBand` below them.
- Project Workspace had an existing project identity/readiness header and then a dark `OperationalCommandCenter` that read like a second project command header.
- Portal pages had customer-safe page headers and a dark `PortalTrustStrip`, which could compete with the page identity on home and review routes.

## Cleanup Changes Made

- `ContractorWorkspacePage` now embeds `WorkspaceCommandBar` inside the page header when a command bar is provided, separated by a compact divider instead of rendering it as a separate header card.
- `WorkspaceCommandBar` now supports an `embedded` mode so shared manager controls can live inside the unified page header without an additional shadowed shell.
- `CommercialDocumentCommandBand` was demoted from a dark command-header surface to a lighter document workflow summary panel beneath the existing detail header.
- Estimate, Contract, and Invoice detail copy now says workflow/payment summary instead of review command.
- `FieldExecutionCommandBand` was demoted from a dark execution-header surface to a lighter execution summary panel beneath the existing detail header.
- Job and Daily Log detail copy now says execution summary instead of execution command.
- Project Workspace `OperationalCommandCenter` was softened into an operational continuity summary instead of a second dark command center.
- `PortalTrustStrip` was softened into a compact customer-safe context panel instead of a dark second portal header.

## Routes / Surfaces Improved

- Manager/global queue pages using `ContractorWorkspacePage`
- `/projects/[projectId]`
- `/estimates/[estimateId]`
- `/contracts/[contractId]`
- `/invoices/[invoiceId]`
- `/jobs/[jobId]`
- `/daily-logs/[dailyLogId]`
- Portal home, portal project, and portal review pages using `PortalTrustStrip`

## Behavior / Data / Workflow Logic Untouched

This pass changed UI structure, styling, and copy only. It did not change schema, migrations, RLS, Supabase logic, route protection, auth, server actions, payments, signatures, estimate math, invoice math, job readiness gates, portal grants, settings behavior, platform-admin logic, tenant scoping, data loaders, action handlers, or canonical workflow relationships.

## Remaining Visual Follow-Ups

- Browser-check representative manager/detail/portal/settings routes for visible duplicated chrome and responsive overflow.
- If any route still appears to have multiple competing page crowns, prefer reducing copy/weight in the lower summary panel before adding new components.
- Future UI work should preserve the rule: one dominant page or record identity area per route; command bands should either be the page header or supporting summaries, not both.
