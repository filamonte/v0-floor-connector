# Google Stitch UI Adoption - Phase 7 Field Schedule and Execution Visual Alignment

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
- `docs/design/stitch/phase-6-manager-pages-global-queue-visual-alignment.md`

## 2. Files inspected

- `apps/web/app/(app)/schedule/page.tsx`
- `apps/web/app/(app)/jobs/page.tsx`
- `apps/web/app/(app)/jobs/[jobId]/page.tsx`
- `apps/web/app/(app)/daily-logs/page.tsx`
- `apps/web/app/(app)/daily-logs/[dailyLogId]/page.tsx`
- `apps/web/app/(app)/time/page.tsx`
- `apps/web/app/(app)/time-cards/[timeCardId]/page.tsx`
- `apps/web/components/contractor-workspace-page.tsx`
- `apps/web/components/workspace-command-bar.tsx`
- `apps/web/components/manager-dashboard-card.tsx`
- `apps/web/components/quick-create-form-shell.tsx`
- `apps/web/components/detail-page-header.tsx`
- `apps/web/components/detail-panel.tsx`
- `apps/web/components/workspace-summary-band.tsx`
- `apps/web/components/job-equipment-panel.tsx`
- `apps/web/components/schedule-job-form.tsx`
- `apps/web/components/schedule-crew-assignment-form.tsx`
- `apps/web/components/daily-log-form.tsx`
- `apps/web/components/field-note-form.tsx`
- `apps/web/components/execution-attachment-form.tsx`
- `apps/web/components/time-punch-form.tsx`
- `apps/web/lib/jobs/*`
- `apps/web/lib/schedule/*`
- `apps/web/lib/daily-logs/*`
- `apps/web/lib/field-notes/*`
- `apps/web/lib/time/*`
- `apps/web/lib/execution-attachments/*`

## 3. Field/schedule/execution surfaces reviewed

- `/schedule` remains the canonical scheduling receiver over jobs and job assignments. It should continue to show ready work, scheduled timelines, and selected job actions without becoming a separate dispatch subsystem.
- `/jobs` is already covered by the shared Phase 6 manager-page primitives and still routes into canonical Job Workspaces.
- `/jobs/[jobId]` is the primary execution record workspace for schedule, crew, equipment readiness, daily logs, punchlist continuity, time cards, service/warranty continuity, and billing handoff.
- `/daily-logs` is already covered by the shared Phase 6 manager-page primitives and still routes into canonical Daily Log Workspaces.
- `/daily-logs/[dailyLogId]` is the primary project-day execution workspace for daily narrative, field notes, field-note attachments, daily-log attachments, labor/time continuity, and project/job handoff.
- `/time` and `/time-cards/[timeCardId]` preserve the existing punch-event and derived time-card model. A deeper time visual pass should not change derivation or review transitions.

## 4. Shared primitives found or missing

Found:

- Phase 6 `ContractorWorkspacePage`, `WorkspaceCommandBar`, `ManagerDashboardCard`, and `QuickCreateFormShell` already cover manager and quick-create surfaces.
- `DetailPageHeader`, `DetailPanel`, `WorkspaceSummaryBand`, `LinkedRecordCard`, and `AppEmptyState` already provide common record workspace grammar.
- Job and daily-log detail pages already include project/job/labor/evidence continuity through existing data-backed sections.

Added:

- `apps/web/components/field-execution-command-band.tsx` provides a small reusable Graphite/Copper execution command band for field-adjacent record workspaces.

Missing or deferred:

- A dedicated schedule board/list shell remains route-local.
- Time capture and time-card review could use a dedicated field-labor command band later.
- Field-note and attachment cards remain mostly daily-log local.

## 5. Visual changes made

- Added `FieldExecutionCommandBand` and `fieldExecutionHeaderShellClassName` for field/schedule/execution record headers.
- Applied the execution command band to Job Workspace, summarizing schedule, crew, field evidence, and billing handoff using existing job, assignment, daily-log, time-card, punchlist, and invoice data.
- Applied the execution command band to Daily Log Workspace, summarizing project day, field notes/attachments, labor continuity, and linked job context using existing daily-log, field-note, attachment, and time-card data.
- Replaced the previous job and daily-log header shells with the shared field-execution shell while preserving their existing detail headers, notices, action bars, workflow bars, summary bands, forms, and supporting panels.

## 6. Data/workflow behavior explicitly untouched

This pass did not change schema, migrations, RLS, Supabase query logic, route protection, auth, server actions, job scheduling, crew assignment, project readiness gates, job readiness gates, daily-log create/update behavior, daily-log project/date uniqueness, field-note parent/validation rules, execution-attachment behavior, time punch events, derived time cards, time-card review behavior, payment logic, signature logic, estimate math, invoice math, portal grants, tenant scoping, or canonical workflow relationships.

Field/schedule/execution surfaces remain views over canonical project, job, daily-log, field-note, attachment, punch-event, and time-card records rather than a detached field app or dispatch module.

## 7. Field/schedule/execution surfaces still needing follow-up

- `/schedule` should receive a dedicated schedule board/list visual polish pass after this record-workspace pass.
- `/time` and `/time-cards/[timeCardId]` should receive a focused labor/time review visual pass without changing punch-event derivation or review transitions.
- Daily-log field-note and attachment cards can be further aligned with a small local card primitive if repeated in more field surfaces.
- Schedule selected-job actions and job detail schedule forms should be reviewed together if Phase 7 follow-up expands beyond command headers.

## 8. Recommended next prompt title

`Google Stitch UI Adoption - Phase 8 Portal and Customer-Facing Visual Alignment`
