# Google Stitch UI Adoption - Phase 6 Manager Pages and Global Queue Visual Alignment

## 1. Docs read

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
- `docs/design/stitch/phase-2-token-dashboard-audit.md`
- `docs/design/stitch/phase-3-dashboard-refresh.md`
- `docs/design/stitch/phase-4-project-workspace-visual-maturity.md`
- `docs/design/stitch/phase-5-commercial-detail-visual-maturity.md`

## 2. Files inspected

- `apps/web/components/contractor-workspace-page.tsx`
- `apps/web/components/workspace-command-bar.tsx`
- `apps/web/components/manager-dashboard-card.tsx`
- `apps/web/components/quick-create-form-shell.tsx`
- `apps/web/components/surface-page.tsx`
- `apps/web/components/app-empty-state.tsx`
- `apps/web/components/action-hierarchy.tsx`
- `apps/web/components/dashboard/dashboard-surface-primitives.ts`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/components/commercial-document-command-band.tsx`
- `apps/web/app/(app)/leads/page.tsx`
- `apps/web/app/(app)/customers/page.tsx`
- `apps/web/app/(app)/projects/page.tsx`
- `apps/web/app/(app)/estimates/page.tsx`
- `apps/web/app/(app)/contracts/page.tsx`
- `apps/web/app/(app)/invoices/page.tsx`
- `apps/web/app/(app)/payments/page.tsx`
- `apps/web/app/(app)/jobs/page.tsx`
- `apps/web/app/(app)/schedule/page.tsx`
- `apps/web/app/(app)/daily-logs/page.tsx`
- `apps/web/app/(app)/people/page.tsx`
- `apps/web/app/(app)/vendors/page.tsx`
- `apps/web/app/(app)/time/page.tsx`
- `apps/web/app/(app)/change-orders/page.tsx`
- `apps/web/app/(app)/appointments/page.tsx`
- `apps/web/app/(app)/equipment/page.tsx`
- `apps/web/app/(app)/progress-billing/page.tsx`
- `apps/web/app/(app)/financials/page.tsx`
- `apps/web/app/(app)/financials/accounts-receivable/page.tsx`
- `apps/web/app/(app)/service-tickets/page.tsx`

## 3. Manager/global queue surfaces reviewed

The manager-page family already has a strong shared wrapper through `ContractorWorkspacePage`. Most contractor list/queue pages use it for page identity, summary content, command bars, and the main queue workspace. This includes leads, customers, projects, estimates, contracts, invoices, payments, jobs, schedule, daily logs, people, vendors, time, change orders, appointments, equipment, financials, progress billing, and service tickets.

`/schedule` remains the canonical jobs-based scheduling receiver and should not be redesigned as a separate dispatch subsystem. The manager and queue pages should continue routing users into canonical records, Project Workspaces, Invoice Workspaces, Job Workspaces, and existing quick-create flows.

## 4. Shared primitives found or missing

Found shared primitives:

- `ContractorWorkspacePage` for manager page identity and optional summary band.
- `WorkspaceCommandBar` for search, filters, support copy, and page actions.
- `ManagerDashboardCard` for repeated manager summary cards and queue previews.
- `QuickCreateFormShell` for canonical quick-create composer framing.
- `AppEmptyState`, `ActionHierarchy`, and status helpers for narrower shared treatment.

Missing or deferred primitives:

- A dedicated table/list shell for manager pages is still mostly route-local.
- Row-level action hierarchy remains page-specific.
- Empty-state text is mostly page-specific and should be reviewed route by route.
- Schedule, time, and field execution have dense custom layouts that deserve a separate Phase 7 pass.

## 5. Visual changes made

- Refined `ContractorWorkspacePage` with a consistent rounded command-header shell, subtle elevation, Graphite structural rule, Copper eyebrow emphasis, and a stronger dark-header variant.
- Refined `WorkspaceCommandBar` into a calmer white command surface with support copy in a Copper-left operational note block.
- Refined `ManagerDashboardCard` with a Graphite top rule, gradient header, Copper action treatment, stronger row rhythm, and a clearer dashed empty state.
- Refined `QuickCreateFormShell` with a Copper-accented command header and 8px-radius footer treatment so quick-create flows feel aligned with manager pages without changing behavior.

These changes are centralized shared-primitive updates. No manager page data loaders, route links, search/filter form fields, quick-create actions, or record destinations were changed.

## 6. Data/workflow behavior explicitly untouched

This pass did not change schema, migrations, RLS, Supabase query logic, route protection, auth, server actions, quick-create behavior, payment logic, signature logic, estimate math, invoice math, job readiness gates, workflow gates, portal grants, tenant scoping, or canonical workflow relationships.

The manager pages remain entry surfaces into canonical records and project-centered workflows rather than independent module worlds.

## 7. Manager pages still needing follow-up

- Route-local table/list shells on projects, estimates, contracts, invoices, jobs, and schedule can be aligned next without changing data.
- Schedule and time have dense field/execution layouts and should be handled together in Phase 7.
- Daily logs, punchlists, appointments, and service tickets should get field-execution-friendly empty states and row affordances after the schedule/time pass.
- Directory and communications have broader surface-specific UX questions and should remain out of a generic manager-page sweep.

## 8. Recommended next prompt title

`Google Stitch UI Adoption - Phase 7 Field Schedule and Execution Visual Alignment`
