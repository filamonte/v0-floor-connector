Status: Active
Doc Type: Design Implementation Note

# Google Stitch UI Adoption - Phase 3 Dashboard Refresh

## 1. Docs Read

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)
- [docs/vision.md](C:/FloorConnector/docs/vision.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/README.md](C:/FloorConnector/docs/README.md)
- [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md)
- [docs/design/stitch/README.md](C:/FloorConnector/docs/design/stitch/README.md)
- [docs/design/stitch/industrial-contrast-DESIGN.md](C:/FloorConnector/docs/design/stitch/industrial-contrast-DESIGN.md)
- [docs/design/floorconnector-visual-system-evolution.md](C:/FloorConnector/docs/design/floorconnector-visual-system-evolution.md)
- [docs/design/stitch/phase-2-token-dashboard-audit.md](C:/FloorConnector/docs/design/stitch/phase-2-token-dashboard-audit.md)

## 2. Files Inspected

- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/app/(app)/layout.tsx`
- `apps/web/components/contractor-app-shell.tsx`
- `apps/web/components/protected-app-top-nav.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/components/dashboard/dashboard-surface-primitives.ts`
- `apps/web/components/dashboard/priority-strip.tsx`
- `apps/web/components/operational-guidance-section.tsx`
- `apps/web/components/universal-create-menu.tsx`
- `apps/web/components/onboarding/start-here-card.tsx`
- `apps/web/lib/dashboard/operational-cockpit-read-model.ts`
- `apps/web/lib/dashboard/project-cue-input-read-model.ts`
- `apps/web/lib/dashboard/project-cue-preview.ts`
- `apps/web/lib/dashboard/progress-billing-summary-read-model.ts`
- `apps/web/tailwind.config.ts`
- `apps/web/app/globals.css`

## 3. Existing Dashboard Sections Preserved

This pass preserved the dashboard route, server component loader, dashboard read models, search filtering, Universal Create behavior, priority links, lifecycle links, operational cockpit buckets, Project Cue queue, Work Items queue, My Work queue modes, onboarding card, and work-queue widget destinations.

The dashboard still uses the existing canonical read-model inputs from `/dashboard`; no static Stitch mockups, demo records, sample project names, fake metrics, or replacement query layer were introduced.

## 4. Visual Changes Made

- Reframed the dashboard top summary as a Graphite command surface with Copper emphasis, readable white text, and the existing organization, role, active-project, receivables, search, Universal Create, and shortcut data.
- Added dashboard-local command-surface, command-stat, and metric-card primitive class constants in `dashboard-surface-primitives.ts` so the styling remains scoped and reusable inside the dashboard.
- Tightened the priority strip by applying existing status badge semantics to the priority count markers, adding stronger focus treatment, and making the action label read as a clearer link affordance.
- Grouped the canonical lifecycle rail and key metrics into one responsive operational-summary band, keeping lifecycle continuity and pipeline/execution metrics adjacent without changing their data.
- Improved metric-card hierarchy with a stronger value treatment and small Copper accent marker while preserving every metric link destination.
- Kept downstream queue cards, forms, hidden inputs, server actions, and route handoffs intact.

## 5. Data / Workflow Behavior Explicitly Untouched

This pass did not change schema, migrations, RLS, Supabase query logic, route protection, auth, server actions, payments, signatures, estimate math, invoice math, workflow gates, portal grants, tenant scoping, canonical relationships, dashboard read models, or dashboard action destinations.

The dashboard remains an entry surface into the canonical chain:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## 6. Known Follow-Up Opportunities

- Refresh the Project Workspace with the same command-summary and connected-record hierarchy, keeping project detail as the readiness and continuity hub.
- Consider a later dashboard-only empty-state pass for low-data organizations after the Project Workspace visual maturity pass.
- If future dashboard work expands the operational cockpit cards, keep those cards read-model-backed and linked to existing workspaces rather than creating separate dashboard-only workflows.

## 7. Recommended Next Prompt Title

`Google Stitch UI Adoption - Phase 4 Project Workspace Visual Maturity`
