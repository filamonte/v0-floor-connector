Status: Active
Doc Type: Design Implementation Note

# Google Stitch UI Adoption - Phase 4 Project Workspace Visual Maturity

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
- [docs/design/stitch/phase-3-dashboard-refresh.md](C:/FloorConnector/docs/design/stitch/phase-3-dashboard-refresh.md)

## 2. Files Inspected

- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/lib/projects/data.ts`
- `apps/web/lib/projects/actions.ts`
- `apps/web/lib/projects/readiness.ts`
- `apps/web/lib/projects/cues.ts`
- `apps/web/components/detail-page-header.tsx`
- `apps/web/components/detail-panel.tsx`
- `apps/web/components/action-hierarchy.tsx`
- `apps/web/components/operational-guidance-section.tsx`
- `apps/web/components/ready-to-schedule-action-panel.tsx`
- `apps/web/components/schedule-context-card.tsx`
- `apps/web/components/service-warranty-continuity-panel.tsx`
- `apps/web/components/work-items/work-item-create-form.tsx`
- `apps/web/components/work-items/work-item-list.tsx`
- `apps/web/components/dashboard/dashboard-surface-primitives.ts`
- `apps/web/components/workspace-summary-band.tsx`
- `apps/web/components/workspace-command-bar.tsx`
- `apps/web/components/record-workspace-shell.tsx`

## 3. Existing Project Workspace Sections Preserved

This pass preserved the existing project detail route, header actions, search-parameter notices, ActionBar next-step guidance, workflow bar, project state summary, operational command center, project workflow summary, connected record lanes, linked-record recency, service/warranty continuity, Needs Attention panel, suggested project actions, internal work items, project edit form, linked commercial/execution/financial/supporting panels, schedule context, related conversations, and GateKeeper subject memory panel.

The project workspace still reads and routes through existing canonical data only: project, customer, opportunity, estimates, contracts, change orders, jobs, schedule context, invoices, payments, daily logs, field notes, portal access, service/warranty records, operational cues, and work items.

## 4. Visual Changes Made

- Added project-workspace-local panel, panel-header, command-surface, and command-inset class constants so the visual refresh stays scoped to the project page.
- Reframed the existing Operational Command Center as a Graphite command surface with Copper emphasis, readable white text, an inset readiness summary, and clearer separation between next move, attention state, and operational summary cards.
- Kept the same next action and blocker copy while improving the hierarchy so readiness, blockers, and next action read as the first operational decision band.
- Refined the neutral summary-card treatment to use existing Graphite/Copper tokens instead of slate-only styling.
- Restyled Connected Record Lanes with the same shared project panel shell and header treatment, then used a tighter divided grid so lifecycle-linked records read as one connected workspace rather than separate loose cards.
- Applied the shared panel shell to the top project header card without changing header content or actions.

## 5. Data / Workflow Behavior Explicitly Untouched

This pass did not change schema, migrations, RLS, Supabase query logic, route protection, auth, server actions, payments, signatures, estimate math, invoice math, job readiness gates, portal grants, tenant scoping, readiness calculations, workflow gates, project data loaders, or link/action destinations.

The project workspace remains the continuity hub for the canonical chain:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## 6. Known Follow-Up Opportunities

- Carry the same command-summary and review-first hierarchy into Estimate, Contract, and Invoice detail pages as a grouped commercial-document maturity pass.
- Consider extracting a shared record-workspace command-surface primitive only after the estimate/contract/invoice pass proves the pattern repeats cleanly.
- Review lower-priority supporting panels later for consistent section headers and empty states, after the commercial document chain is visually aligned.

## 7. Recommended Next Prompt Title

`Google Stitch UI Adoption - Phase 5 Estimate Contract Invoice Detail Visual Maturity`
