# Chrome Collapse Dashboard Header Cleanup

## Problem Screenshot Diagnosis

The post-Stitch header cleanup still left the contractor dashboard with three header-like regions:

- a dark global app navigation/header
- a large white workspace band with FloorConnector identity, project/menu selectors, Quick Create, Attention, and account controls
- a large dark dashboard command summary repeating organization identity, search, Universal Create, and shortcut navigation

This made the Graphite / Copper system feel layered onto the app instead of integrated into the app shell.

## Docs Read

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md)
- [docs/design/floorconnector-visual-system-evolution.md](C:/FloorConnector/docs/design/floorconnector-visual-system-evolution.md)
- [docs/design/stitch/unified-header-architecture-cleanup.md](C:/FloorConnector/docs/design/stitch/unified-header-architecture-cleanup.md)

## Components Responsible For Stacked Chrome

- `apps/web/components/protected-app-top-nav.tsx` rendered the large white workspace band between the dark top nav and page content.
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx` rendered the dark dashboard command card that repeated shell identity, search, Universal Create, and shortcut actions.

## Before Hierarchy

1. Dark global top navigation/header.
2. White workspace/page band with duplicated identity and controls.
3. Dark dashboard command summary card.
4. Dashboard priority, lifecycle, metrics, cockpit, and queue content.

## After Hierarchy

1. Single graphite contractor app header.
2. Compact functional header row for project selection, menu, Quick Create, Attention, and account access.
3. Dashboard content beginning with activation state, priority strip, lifecycle, metrics, cockpit, and queues.

## Changes Made

- Removed the full-width white workspace band from the contractor app shell.
- Kept project selection, menu, Quick Create, Attention, and account access in the unified graphite shell.
- Removed duplicate FloorConnector logo/org identity from the intermediate workspace band.
- Removed the duplicate dashboard command card.
- Moved dashboard search into the Work Queues section as a local queue filter.
- Kept dashboard priority, lifecycle, metrics, operational cockpit, onboarding, and queue sections backed by existing dashboard data.

## Controls Preserved

- Project selector remains in the unified contractor header.
- Menu selector remains in the unified contractor header.
- Quick Create remains in the unified contractor header as the single primary create entry.
- Attention remains in the unified contractor header.
- Account/profile/settings/sign-out controls remain in the unified contractor header account menu.
- Dashboard queue filtering remains available inside the Work Queues section.

## Dashboard Duplicate Elements Removed Or Demoted

- Removed repeated organization name from the dashboard command card.
- Removed repeated dashboard-local Universal Create.
- Removed repeated dashboard shortcut row for Projects, Schedule, Payments, and Cost Items Database.
- Removed the dashboard-local command-search placement and kept search only as a queue filter.

## Behavior / Data / Workflow Logic Untouched

This pass changed contractor shell and dashboard visual structure only. It did not change schema, migrations, RLS, Supabase logic, auth, route protection, server actions, payment logic, signature logic, estimate math, invoice math, job readiness gates, portal grants, settings behavior, platform-admin logic, data loaders, or canonical workflow relationships.

## Remaining Header / Chrome Follow-Ups

- Browser QA should confirm the dashboard no longer presents three competing header regions.
- Record detail pages should continue to be checked opportunistically for local duplicate title/action bands, but this pass intentionally focused on the shell and dashboard chrome shown in the screenshot.
