# Stitch Phase 2 Token And Dashboard Audit

Status: Active
Doc Type: UI Audit

## Purpose

This pass audits the current FloorConnector UI token, primitive, shell, and dashboard implementation before any larger Stitch-informed dashboard refresh.

It preserves the current Graphite / Copper system, top-nav-first contractor shell, canonical workflow, and real data-backed dashboard structure.

## 1. Files Inspected

Documentation read:

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/target-ia.md`
- `docs/vision.md`
- `docs/Roadmap.md`
- `docs/chat-handoff.md`
- `docs/README.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/stitch/README.md`
- `docs/design/stitch/industrial-contrast-DESIGN.md`
- `docs/design/floorconnector-visual-system-evolution.md`

Implementation inspected:

- `apps/web/app/globals.css`
- `apps/web/tailwind.config.ts`
- `apps/web/app/(app)/layout.tsx`
- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/components/contractor-app-shell.tsx`
- `apps/web/components/protected-app-shell.tsx`
- `apps/web/components/protected-app-top-nav.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/components/dashboard/priority-strip.tsx`
- `apps/web/components/action-hierarchy.tsx`
- `apps/web/components/app-empty-state.tsx`
- `apps/web/components/detail-panel.tsx`
- `apps/web/components/manager-dashboard-card.tsx`
- `apps/web/components/protected-surface-header.tsx`
- `apps/web/components/workspace-command-bar.tsx`
- `apps/web/components/workspace-summary-band.tsx`
- `apps/web/components/workspace/standard-workspace-layout.tsx`
- `packages/ui/src/status.ts`
- `apps/web/lib/dashboard/operational-cockpit-read-model.ts`
- `apps/web/lib/dashboard/progress-billing-summary-read-model.ts`
- `apps/web/lib/dashboard/project-cue-input-read-model.ts`
- `apps/web/lib/dashboard/project-cue-preview.ts`

## 2. Current Token And Theme Findings

Colors are defined in two main places:

- `apps/web/app/globals.css` defines runtime CSS variables, including `--graphite`, `--graphite-light`, `--graphite-dark`, `--copper`, `--copper-light`, `--cream`, `--highlight`, `--border-warm`, `--border-medium`, `--border-dark`, and semantic text/status colors.
- `apps/web/tailwind.config.ts` extends Tailwind with `brand`, `graphite`, and `copper` color families.

Typography and global styling live primarily in `apps/web/app/globals.css`. The app uses CSS variables for `--font-body` and `--font-display`, plus global body background and utility classes such as `fc-shell`, `fc-panel`, `fc-text-muted`, and `fc-rule`.

Buttons and actions are partially centralized:

- `apps/web/components/action-hierarchy.tsx` owns primary, secondary, overflow, and overflow-menu action classes.
- Several route and surface components still use local class strings where the control shape is specific.

Cards, panels, and workspace primitives are partially centralized:

- `DetailPanel`, `ManagerDashboardCard`, `WorkspaceCommandBar`, `WorkspaceSummaryBand`, `ProtectedSurfaceHeader`, `AppEmptyState`, `StandardWorkspaceLayout`, portal review primitives, and settings components provide most shared surface grammar.
- Dashboard-specific cards were still local to `ContractorDashboardSurface` and `PriorityStrip` before this pass.

Badges and status chips are centralized through `packages/ui/src/status.ts` with `getStatusBadgeClassName`, `getStatusTone`, and semantic status tone maps.

The implementation is a hybrid of centralized primitives plus inline Tailwind utility strings. That is appropriate for the current phase, but repeated surface-level patterns should be centralized only where the boundary is obvious.

Repeated class patterns worth future centralization:

- dashboard panel shell
- dashboard section header treatment
- dashboard action link treatment
- dashboard grid divider treatment
- compact alert/readiness blocks
- manager-page stat card shell
- mobile record-review card shell

## 3. Current Dashboard Structure

`apps/web/app/(app)/dashboard/page.tsx` is a server component that loads dashboard data from existing canonical records and passes shaped props into `ContractorDashboardSurface`.

Important loaders and read models include:

- `getDashboardOperationalCockpitReadModel`
- `getDashboardOverviewReadModel`
- `getDashboardProgressBillingSummaryReadModel`
- `getDashboardProjectCueInputReadModel`
- `mapProjectCuesToDashboardPreviewItems`
- `getDashboardProjectFinancialReadinessSummaries`
- `listDashboardProjectCueFieldNotes`
- `listLeadFollowUpQueue`
- `getOperationalCueDashboard`
- `listDashboardRecentPayments`
- `listDashboardWorkItems`
- `listContractorNotificationsForContext`

Dashboard rendering is split mainly across:

- `ContractorDashboardSurface` for the full dashboard layout, search filtering, lifecycle rail, key metrics, work queues, finance tables, and dashboard-local navigation links.
- `PriorityStrip` for the highest-signal attention band.
- `OperationalGuidanceSection` for the operational cockpit buckets.
- `StartHereCard` for guided onboarding.
- `UniversalCreateMenu` for canonical Quick-Create entry.

What should be preserved:

- real server-side loaders and canonical read models
- search over real dashboard queue data
- Quick-Create -> canonical record -> full Workspace handoff
- links into Project, Estimate, Contract, Invoice, Job, Schedule, Payments, and Cost Items routes
- dashboard as an entry and prioritization surface rather than a separate module world
- work-item form actions and hidden inputs
- existing status helpers and semantic state meanings

Where the dashboard can improve later:

- stronger first-screen visual hierarchy between priority strip, cockpit, lifecycle rail, and key metrics
- clearer dark/graphite structural depth without changing the top-nav shell
- more consistent card header and action treatment across dashboard sections
- better mobile grouping of queue cards and finance rows
- sharper distinction between attention, ready-to-move, waiting, and execution states

## 4. Shared Primitive Opportunities

Current and future candidates:

- Card shell: dashboard-level panel shell now has a small shared class primitive.
- Stat card: key metrics still render inline in `ContractorDashboardSurface`; a later dashboard refresh can extract this if the visual layout changes.
- Status badge: already centralized through `@floorconnector/ui`.
- Action panel: action classes exist globally; dashboard section action links now use a dashboard-level shared class.
- Command bar: `WorkspaceCommandBar` is centralized and should remain the manager/workspace default.
- Page band: `ProtectedSurfaceHeader`, `StandardWorkspaceLayout`, and dashboard header sections cover different scopes; no new page-band primitive was added.
- Manager-page wrapper: existing Manager Page rhythm should remain. No wrapper changes were made.
- Empty state: `AppEmptyState` is centralized. Dashboard-specific empty rows remain local because they live inside queue/table cards.
- Alert/readiness block: good future candidate, but current alert/readiness blocks vary by workflow risk.
- Mobile card pattern: present in portal review and dashboard queues, but not centralized enough for a safe cross-app primitive yet.

## 5. Low-Risk Changes Made In This Pass

Created `apps/web/components/dashboard/dashboard-surface-primitives.ts` with dashboard-scoped class constants for:

- dashboard panel shell
- dashboard panel header
- dashboard section action
- dashboard grid divider

Updated:

- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/components/dashboard/priority-strip.tsx`

The visual change is intentionally narrow:

- dashboard panels now share a slightly stronger Industrial Contrast shell
- dashboard section headers share a subtle white-to-highlight surface
- dashboard action links use one dashboard-level action class with copper focus/hover treatment
- dashboard grid dividers share one class constant

No data loader, prop contract, route, link target, server action, hidden input, auth behavior, tenant scope, or canonical workflow behavior changed.

## 6. Recommended Next Implementation Slice

Recommended next prompt title:

`Google Stitch UI Adoption - Phase 3 Dashboard Visual Refresh`

Recommended scope:

- keep `apps/web/app/(app)/dashboard/page.tsx` loaders unchanged
- keep `ContractorDashboardSurface` as the main client renderer
- use the new dashboard surface primitives as the first visual grammar
- refresh dashboard composition and hierarchy using real canonical data
- avoid route, schema, auth, payment, signature, estimate, invoice, job, schedule, portal, or server-action changes
