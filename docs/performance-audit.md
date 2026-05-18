# FloorConnector Performance Audit

Status: Active
Doc Type: Audit
Date: 2026-05-17

## Scope

This audit reviewed the protected contractor app shell, dashboard, high-traffic Manager Pages, schedule, payments, portal read paths at a high level, Supabase query patterns, client/render behavior, and bundle risks.

Required source docs read first:

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/chat-handoff.md`
- `docs/README.md`

Guardrails preserved:

- No schema, migration, RLS, auth, payment, signature, readiness-gate, financial-calculation, or canonical record relationship changes were made.
- `docs/current-state.md` remains implemented truth.
- Performance recommendations stay on the existing canonical model and do not propose portal-only copies, duplicate caches, or disconnected read models.

## Summary Of Likely Root Causes

The app is likely slow for both development-only and production-impacting reasons.

The highest-impact production issues are:

1. The dashboard loads many full tenant-scoped record lists in one render, then performs repeated in-memory filtering, sorting, and cross-record derivation.
2. Several Manager Pages fetch full tenant tables before search, status filtering, counting, and pagination-like display truncation.
3. Some shell/page code repeats auth, organization, bootstrap, and notification reads that can be reused safely within the same request.
4. Schedule builds a rich planner from all jobs, appointments, opportunities, people, vendors, and job assignments before applying view-specific filters.
5. Global search fetches full tables across many modules and scores in memory once the user types, which will become expensive as tenant data grows.

Dev-only contributors are also likely:

- Next.js App Router dev mode, React server component rendering, local Supabase latency, and source maps can make these broad query/render paths feel worse locally.
- `dynamic = "force-dynamic"` on the protected layout is appropriate for authenticated app state, but it means protected pages do not benefit from static rendering.

## Prioritized Issue List

### P0: Dashboard Loads The World

Impacted files:

- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/lib/projects/readiness.ts`
- list loaders in `apps/web/lib/*/data.ts`

Evidence:

- Dashboard concurrently loads customers, opportunities, estimates, approved estimates, projects, contracts, jobs, appointments, lead follow-up, people, punchlists, invoices, payments, notifications, progress billing, settings, billing state, field notes, and operational cues.
- After that, it computes project readiness by mapping every active project through `getProjectFinancialReadinessSnapshot(...)`.
- It then repeatedly filters estimates, contracts, invoices, jobs, and field notes by project inside each active project cue calculation.

Why it matters:

- This is the most likely slow first screen because it combines many network round trips, broad data payloads, and O(projects \* child-records) local derivation.
- React `cache(...)` reduces duplicate loaders within one request, but it does not make broad table reads cheap.

Safe first improvements:

- Add a dashboard-specific read model that fetches only counts, top N queues, and the specific fields needed by widgets.
- Replace per-project readiness snapshots with a batched readiness summary query/RPC or a narrowly scoped dashboard readiness helper.
- Pre-group child lists by project id before deriving project cues if the broad lists remain temporarily.

Do not change yet:

- Do not weaken readiness semantics or skip `assertProjectReadinessGate`.
- Do not persist dashboard-specific workflow state.

### P0: Manager Pages Fetch Full Lists Then Filter Locally

Impacted routes:

- `/projects`
- `/customers`
- `/estimates`
- `/contracts`
- `/invoices`
- `/jobs`
- `/payments`

Evidence:

- Shared loaders such as `listCustomers`, `listProjects`, `listEstimates`, `listContracts`, `listInvoices`, `listJobs`, `listPayments`, `listPaymentEvents`, `listAppointments`, `listPeople`, `listPunchlistItems`, and `listFieldNotes` order full tenant-scoped result sets without limits.
- Page components then apply search/status/perspective filters, counts, queue slices, and recent-table slices in memory.
- Examples:
  - Customers loads all customers and all projects, then computes project counts and customer quality queues locally.
  - Estimates loads all estimates plus opportunities, customers, projects, workflow settings, and financial settings before filtering.
  - Invoices loads all invoices, projects, estimates, jobs, change orders, and settings before filtering.
  - Payments loads all payments, all payment events, and all invoices before local summaries.

Why it matters:

- This is acceptable with small fixture data but degrades linearly with each tenant's growth.
- Search boxes and status filters do not reduce database work today.

Safe first improvements:

- Introduce route-specific list loaders with server-side `eq`, `or`, `ilike`, status filters, `range`, and count summaries.
- Keep the current canonical list loaders for detail pages and small option pickers only where they are actually bounded.
- Add explicit top-N queue loaders for dashboard cards instead of loading the full manager dataset.

Do not change yet:

- Do not add disconnected materialized caches unless a later phase designs invalidation and tenant safety.
- Do not change workflow counts to approximate values unless the UI labels them as approximate.

### P1: Protected Shell Notification Loading Repeated Auth/Org Work

Impacted files:

- `apps/web/app/(app)/layout.tsx`
- `apps/web/components/contractor-app-shell.tsx`
- `apps/web/lib/notifications/data.ts`
- `apps/web/app/(app)/dashboard/page.tsx`

Evidence:

- The protected layout already runs `requireAuthenticatedUser()` and `getActiveOrganizationContext(user.id)`.
- The notification loader previously called `requireAuthenticatedUser("/dashboard")` and `getActiveOrganizationContext(user.id)` again before querying notifications.
- Dashboard also asked for notifications while the shell did the same work.

Fix implemented:

- Added `listContractorNotificationsForContext(userId, organizationId)`.
- Updated the shell and dashboard to use the already-resolved user and organization context.
- Kept the original `listContractorNotifications()` wrapper for other callers.
- The notification query still filters by `company_id`, `user_id`, `is_read = false`, and `limit(50)`.

Expected impact:

- Removes redundant auth/bootstrap/org lookup from shell/dashboard notification reads.
- Allows React cache to dedupe shell and dashboard notification queries by explicit user/org arguments in the same render.

### P1: Schedule Builds Too Much Before Filtering

Impacted files:

- `apps/web/app/(app)/schedule/page.tsx`
- `apps/web/lib/jobs/data.ts`
- `apps/web/lib/schedule/read-model.ts`

Evidence:

- Schedule loads all jobs, appointments, opportunities, people, and vendors, then loads assignments for every loaded job id.
- It builds `jobsWithAssignments`, then applies project/view/crew/search filters locally.
- It calls `buildScheduleItems(...)` more than once over visible jobs and appointments.
- Rendering later uses `visibleJobs.find(...)` for each schedule item, which can become O(items \* jobs).

Safe first improvements:

- Add schedule-specific loaders for the selected view/date range/project, especially `unscheduled`, `today`, `upcoming`, and selected `jobId`.
- Load people/vendors only when the action panel is open or when crew assignment controls are visible.
- Build a `Map` of visible jobs by id before rendering list items.

Do not change yet:

- Do not introduce schedule-only records or a separate dispatch model.
- Do not remove the current job-assignment chain.

### P1: Global Search Fetches Full Tables For Every Search

Impacted files:

- `apps/web/components/global-search.tsx`
- `apps/web/lib/global-search/data.ts`

Evidence:

- The client debounces input, which is good.
- The server search fans out to opportunities, customers, projects, appointments, estimates, contracts, invoices, jobs, punchlists, payments, people, and vendors.
- Each query orders tenant records but does not apply text filters or limits before returning rows to the server process for scoring.

Safe first improvements:

- Add database-side `ilike`/`or` filters per table and per-group limits.
- Keep grouping/scoring server-side after a bounded candidate set.
- Consider a dedicated tenant-safe search index later, but not as a first fix.

Do not change yet:

- Do not create a search-only source-of-truth table without a clear sync/invalidation design.

### P2: Client Bundle And Rendering Risks

Impacted areas:

- Shared shell client components
- Quick-create/composer components
- Estimate and invoice record panels
- Global search dialog

Evidence:

- `GlobalSearch` is a client component mounted in the shell for every protected route, though it only fetches when opened.
- Rows-per-view and dense record panels are client-side where interactivity requires it.
- Quick-create forms are imported by Manager Pages even when composer sheets are closed.

Safe first improvements:

- Use dynamic imports for heavy create forms or low-frequency composer content after confirming no server-action binding regressions.
- Keep server components for read-only cards and summaries.
- Memoize only expensive pure transforms inside client components after measuring render cost.

Do not change yet:

- Do not move server-action forms across client/server boundaries casually.
- Do not lazy-load critical first-action controls if it makes the app feel slower for the primary workflow.

## Quick Wins

Implemented in this pass:

- Reused protected layout user/org context for notification reads via `listContractorNotificationsForContext(...)`.

Recommended next quick wins:

- Pre-group dashboard child records by project id before project cue derivation.
- Add a `Map` lookup for schedule item -> visible job rendering.
- Add server-side limits/ranges to global search candidates.
- Add route-specific top-N loaders for dashboard queues.
- Add count-only helpers for Manager Page status tabs.

## Follow-Up Slice 1

Chosen slice:

- Dashboard in-memory derivation cleanup.

Why chosen:

- The audit identified `/dashboard` as the highest-impact first screen because it loads many tenant-scoped record lists, computes readiness for active projects, and derives project guidance from linked child records.
- The safest follow-up was the lowest-risk dashboard quick win from this audit: pre-group already-loaded child records by `projectId` before building project cues and ready-to-schedule project queues.
- This keeps the existing canonical loaders, readiness semantics, record relationships, and dashboard UI behavior intact while removing repeated full-list scans during one render.

Files changed:

- `apps/web/app/(app)/dashboard/page.tsx`
- `docs/performance-audit.md`

Before/after behavior:

- Before: each active project re-filtered the full estimates, contracts, invoices, jobs, and field-notes arrays for project cue derivation, and ready-to-schedule project detection re-filtered the full jobs array per project.
- After: dashboard builds one `Map` per child record type keyed by `projectId`, then reuses those project-scoped arrays for cue derivation and ready-to-schedule detection.
- User-visible behavior is intended to stay equivalent: same dashboard sections, counts, links, readiness checks, quick-create options, and canonical record relationships.

Remaining risks:

- This does not reduce the number of Supabase reads or the size of dashboard payloads yet.
- Per-project readiness snapshots still fan out across active projects.
- Dashboard quick-create option lists still receive broad record arrays because narrowing those contracts needs a separate careful pass.

Next recommended slice:

- Add a dashboard-specific summary/read model that returns bounded top-N queues and counts with explicit selected columns, then batch or narrow readiness summary work without weakening readiness rules.

## Batched Dashboard Readiness Summary

Implemented follow-up:

- Added a dashboard-specific batched readiness helper that preserves `getProjectFinancialReadinessSnapshot(...)` semantics while loading project readiness inputs for all active dashboard projects in one grouped pass.
- Replaced the dashboard's per-active-project readiness fan-out with the batched helper.

Behavior preserved:

- The helper still uses explicit `company_id` tenant filters, explicit selected columns, the same workflow settings, and the same `computeCommercialReadiness(...)` inputs.
- Preferred estimate selection remains approved estimate first, then latest estimate.
- Contract selection remains signed contract first, then latest contract.
- Deposit readiness remains paid deposit invoice first, then latest deposit invoice.
- Opportunity readiness remains the latest project-linked opportunity by `updated_at`.
- The dashboard still uses readiness only for existing project cues and ready-project-without-job previews; no schema, persistence, lifecycle, signature, payment, invoice, or readiness-gate behavior changed.

Expected impact:

- Active project readiness now uses a bounded set of batched Supabase reads instead of one project/opportunity/estimate/contract/invoice/settings fan-out per active project.
- Remaining dashboard cost still includes broad canonical list loaders that feed existing widgets and quick-create options.

## Follow-Up Slice 2

Chosen dashboard reads:

- Dashboard punchlist shortcut count.
- Dashboard project-cue field-note inputs.

Before/after loading behavior:

- Before: `/dashboard` loaded full punchlist rows, related projects, related jobs, assignee people, details, due dates, and audit fields just to calculate the active punchlist shortcut metric.
- After: `/dashboard` uses `countOpenPunchlistItemsForDashboard()`, an exact count-only tenant-scoped query for `open` and `in_progress` punchlist items.
- Before: `/dashboard` loaded full field-note rows plus daily-log, project, job, person, and time-card joins, then project cue derivation only used open blocker/issue note id, daily-log id, project id, type, title, and status.
- After: `/dashboard` uses `listDashboardProjectCueFieldNotes()`, a tenant-scoped field-note cue loader that selects only the columns needed for project cue derivation and filters to open `blocker` / `issue` notes in the database.

Files changed:

- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/lib/field-notes/data.ts`
- `apps/web/lib/punchlists/data.ts`
- `docs/performance-audit.md`

Remaining dashboard bottlenecks:

- Dashboard still loads broad customers, opportunities, estimates, approved estimates, projects, contracts, jobs, appointments, invoices, payments, people, progress-billing workspaces, and operational cue data.
- Per-project readiness snapshots still fan out across active projects.
- Quick-create option arrays still use broad canonical lists so the launcher remains visually equivalent.
- Project cue derivation still needs broad project/estimate/contract/invoice/job context until a fuller dashboard read model or batched readiness helper is introduced.

Next recommended performance slice:

- Add bounded dashboard queue loaders for one high-cardinality commercial or finance set, such as unpaid/overdue invoices or recent payments, while preserving exact counts and quick-create option behavior.

## Follow-Up Slice 3

Chosen read target:

- Dashboard recent payment activity preview.

Before/after loading behavior:

- Before: `/dashboard` loaded the full tenant-scoped payments list with invoice/customer/project summary joins, then filtered out `void` payments in memory and displayed the first five rows.
- After: `/dashboard` uses `listDashboardRecentPayments(5)`, a tenant-scoped dashboard loader that filters out `void` payments in the database, preserves the existing payment-date/created-at ordering, selects only the fields needed by the recent payment widget, and limits the preview to five rows.

Files changed:

- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/lib/payments/data.ts`
- `docs/performance-audit.md`

Behavior preserved:

- The recent payment widget still shows the same kind of five most recent non-void payment records, with invoice, customer, project, status, source, method, amount, and links back to canonical invoice/project records.
- Payment status, invoice balance, payment event, gateway, portal checkout, webhook, and financial calculation behavior were not changed.
- Tenant scoping still uses the existing authenticated payments scope and `company_id` filter.

Remaining dashboard bottlenecks:

- Dashboard still loads broad customers, opportunities, estimates, approved estimates, projects, contracts, jobs, appointments, invoices, people, progress-billing workspaces, and operational cue data.

## Follow-Up Slice 4

Chosen read targets:

- Dashboard customer, opportunity, approved-estimate, appointment, and current-user-person reads.
- Dashboard quick-create option payload.

Before/after loading behavior:

- Before: `/dashboard` loaded full customer rows only to show the Customers shortcut count and feed an unused quick-create option prop.
- After: `/dashboard` uses an exact customer count query in the dashboard overview read model.
- Before: `/dashboard` loaded full opportunity rows only to show the lifecycle rail opportunity total and feed an unused quick-create option prop.
- After: `/dashboard` uses an exact opportunity count query while the existing lead follow-up queue continues to provide the visible follow-up preview.
- Before: `/dashboard` loaded approved estimate contract options only for an approved-estimate count and unused quick-create options.
- After: `/dashboard` uses an exact approved-estimate count query; the cockpit read model still provides bounded approved-estimate handoff previews.
- Before: `/dashboard` loaded all appointments, then filtered upcoming assigned/company appointments, appointment follow-ups, scheduled count, and today's count in memory.
- After: `/dashboard` uses exact appointment count queries plus bounded upcoming/follow-up appointment preview loaders with explicit selected columns.
- Before: `/dashboard` loaded all people to find the active Person linked to the current app user.
- After: `/dashboard` loads only the active current-user Person row needed for My Work routing and appointment assignment fallback.
- Before: `/dashboard` built a large `quickCreate` prop containing option arrays and server actions, but the dashboard surface rendered the link-based `UniversalCreateMenu` instead.
- After: the unused quick-create option/action prop was removed from the dashboard surface and page. Visible create behavior remains the same link-based menu.

Files changed:

- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/lib/dashboard/operational-cockpit-read-model.ts`
- `docs/performance-audit.md`
- `docs/chat-handoff.md`
- `docs/ai-guided-system-plan.md`

Behavior preserved:

- Visible dashboard counts, appointment previews, lead follow-up previews, cockpit previews, readiness cues, project handoffs, and link-based create menu behavior remain tied to existing canonical routes and records.
- No quick-create server action, canonical record behavior, readiness gate, financial calculation, payment/signature behavior, schema, migration, cache table, or lifecycle behavior changed.

Remaining dashboard bottlenecks:

- Closed in the follow-up project-cue input loader slice: dashboard project, estimate, contract, invoice, and job legacy widgets no longer use the broad canonical list loaders.
- Progress-billing workspace and operational cue loaders remain separate broad deterministic read paths.

Next recommended slice:

- Keep moving on the remaining broad deterministic dashboard helpers: progress-billing workspace loading and operational cue loading.

## Dashboard Project Cue Input Loader

Chosen read targets:

- Active project cue derivation.
- Ready-project-without-job previews.
- Project continuity preview.
- Estimates awaiting action preview.
- Contracts awaiting action preview.
- Jobs needing scheduling preview.
- Jobs today / in-progress preview.
- Invoice/open receivables preview and counts.

Before/after loading behavior:

- Before: `/dashboard` loaded full tenant-scoped project, estimate, contract, invoice, and job list projections through `listProjects()`, `listEstimates()`, `listContracts()`, `listInvoices()`, and `listJobs()`, then filtered and sliced them in memory for project cues, legacy dashboard widgets, onboarding steps, shortcuts, lifecycle rail values, and receivable summaries.
- After: `/dashboard` uses `getDashboardProjectCueInputReadModel(...)`, a dashboard-specific tenant-scoped read model with explicit selected columns for active projects, cue-relevant estimates/contracts/invoices/jobs, top-N preview queues, exact count-only totals, and a narrow open-receivable balance projection.
- Exact project cue derivation still receives all active-project child rows needed by `buildProjectCues(...)`; the helper only removes detail fields and unrelated tenant records from the dashboard path.
- Open invoice and overdue invoice labels now use exact count-only queries, while the finance widgets render bounded preview rows. Open receivables still sums exact open invoice balances from a narrow balance-only projection.

Files changed:

- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/lib/dashboard/project-cue-input-read-model.ts`
- `docs/performance-audit.md`
- `docs/chat-handoff.md`
- `docs/ai-guided-system-plan.md`

Behavior preserved:

- The dashboard continues to derive `approved-estimate-missing-contract`, unpaid deposit invoice, open blocker field notes, signed-contract-no-job, and ready-unscheduled-job cues through `buildProjectCues(...)` and the existing batched readiness summary.
- Project readiness, cue-state suppression, payment state, signature state, estimate status, contract status, invoice status, job status, schedule links, lifecycle rules, and link-based create behavior were not changed.
- No schema, migration, persisted dashboard state, cache table, financial calculation, payment/signature behavior, readiness gate, or canonical lifecycle behavior changed.

Remaining dashboard bottlenecks:

- Progress-billing workspace loading remains a broad deterministic read path for dashboard status.
- Operational cue dashboard loading remains a separate deterministic read path; a follow-up narrowed disabled-rule and already-discarded candidate reads without changing cue semantics.
- Open receivable total is exact and narrow, but still scans open invoice balance rows until a future database aggregate/RPC or carefully scoped summary strategy is approved.

Next recommended slice:

- Narrow dashboard progress-billing workspace reads with the same rule: explicit selected columns, count-only totals where possible, top-N preview queues, and no persisted dashboard state.

## Dashboard Operational Cue Read Path

Chosen read target:

- Operational cue dashboard loading used by `/dashboard` My Work queue modes.

Before/after loading behavior:

- Before: the operational cue loader always queried estimate, contract, invoice, and job candidate rows for dashboard scope when those subject types applied, even when the tenant's enabled rule set could not produce cues for one or more subjects.
- After: `loadOperationalCues(...)` checks the enabled tenant rule set before each subject query. Disabled estimate, contract, invoice, or job rule families skip their corresponding canonical candidate reads.
- Before: invoice cue queries loaded open invoice candidates and let derivation discard zero-balance rows, missing due dates for overdue-only evaluation, and non-deposit invoices for deposit-only evaluation.
- After: invoice cue queries keep the same explicit selected columns and candidate limits, but push those already-existing discard conditions into Supabase where the active rule set makes it safe.
- Before: job cue queries loaded both unscheduled and scheduled candidates whenever job cues were in scope.
- After: job cue queries select only the dispatch statuses that correspond to enabled job cue rules, while assignment counts remain exact for the selected candidate jobs.

Files changed:

- `apps/web/lib/operational-cues/data.ts`
- `docs/performance-audit.md`
- `docs/chat-handoff.md`

Behavior preserved:

- Cue derivation still runs through `deriveOperationalCues(...)`, and dashboard grouping still uses the visible cues after `workflow_cue_states` suppression.
- Cue identity, fingerprint, version, dismiss, snooze, and company/user suppression behavior were not changed.
- Existing dashboard candidate limits, explicit selected columns, rule thresholds, responsibility defaults, routes, cue labels, and My Work counts remain governed by the same deterministic cue objects.
- No schema, cache table, migration, readiness gate, financial calculation, payment/signature behavior, workflow behavior, or canonical record relationship changed.

Remaining dashboard bottlenecks:

- The operational cue dashboard still intentionally derives from bounded canonical candidate rows instead of persisted cue instances.
- Assignment counts for scheduled-job missing-crew cues still require reading `job_assignments.job_id` for candidate jobs.
- Closed in the dashboard progress-billing summary slice: dashboard progress-billing status no longer loads full SOV workspaces.

Next recommended slice:

- Continue with the remaining cross-route broad reads outside the dashboard, especially Manager Page server-side filtering and global-search database-side candidate filters.

## Dashboard Progress Billing Summary

Chosen slice:

- Dashboard progress-billing shortcut status.

Before/after loading behavior:

- Before: `/dashboard` used `listProgressBillingWorkspaces()`, which loaded full SOV headers with project/customer/estimate labels, all SOV item detail fields, all progress invoices, and progress invoice line links, then derived every workspace just to count `ready_to_bill`.
- After: `/dashboard` uses `getDashboardProgressBillingSummaryReadModel(...)`, which selects only SOV ids/estimate ids, SOV item percent/value fields, progress invoice ids/estimate/status, and invoice line links needed to derive the same `ready_to_bill` count.

Behavior preserved:

- The dashboard status still derives from the existing SOV/progress-invoice semantics: billed invoice statuses are `sent`, `partially_paid`, and `paid`; percent complete is raised to the already-billed minimum when needed; current billable and balance-to-finish totals are rounded with the same two-decimal money rule; and `ready_to_bill` still means current billable amount exists before the SOV is fully billed.
- Full progress-billing Manager Page and SOV Workspace loaders remain unchanged.
- No SOV mutation, invoice creation, retainage policy, payment behavior, AIA/export behavior, schema, migration, cache table, readiness gate, or canonical lifecycle behavior changed.

Remaining dashboard bottlenecks:

- The dashboard still intentionally derives deterministic project, readiness, cue, finance, and cockpit summaries from canonical records rather than persisted dashboard state.
- Open receivable total is exact and narrow, but still scans open invoice balance rows until a future database aggregate/RPC or carefully scoped summary strategy is approved.

Next recommended slice:

- Move beyond dashboard cleanup into Manager Page server-side filtering/counts or add database-side candidate filters for high-cardinality global search entities.

## Projects Manager Read Model

Chosen slice:

- `/projects` Manager Page list, status counts, workflow queue cards, and quick-create option loading.

Before/after loading behavior:

- Before: `/projects` loaded every tenant project through `listProjects()` and every tenant customer through `listCustomers()` on every render, then filtered search/status, counted status tabs, built queue cards, and sliced the recent table in memory.
- After: `/projects` uses `getProjectsManagerReadModel(...)`, a Projects-manager-specific read model with explicit selected columns for the fields rendered by the list/table/cards. It pushes status filters, project-name/location search, customer-name/company search lookup, ordering, and top-N limits into Supabase where safe.
- Status summary and filter counts now use exact count-only project queries.
- Queue cards are bounded to the four rows they render for lead, estimating, approved, and ready-to-schedule project queues.
- The recent table is bounded to the same twenty visible rows it already displayed.
- Customer options for project quick-create now load only when the composer is open or prefilled by customer context; when the composer is closed, the Projects Manager no longer loads the broad customer option list.

Behavior preserved:

- Project links, customer labels, status pills, continuity cues, location display, empty states, filter tabs, search form, and Project Quick-Create action semantics remain the same.
- Project creation/update behavior remains on the existing project server actions and canonical project/customer relationship.
- Project Workspace remains the operational hub; this pass only narrows the Manager Page read path.
- No schema, migration, cache table, readiness calculation, project lifecycle behavior, quick-create mutation behavior, auth/RLS behavior, or canonical relationship changed.

Remaining bottlenecks:

- The Projects Manager still uses multiple count/top-N queries rather than a single aggregate/RPC because no schema or database function was added in this safe slice.
- Search by customer name/company performs an id-only customer lookup before the bounded project query so the visible search meaning is preserved without loading full customer records.
- Remaining Manager Page broad-list patterns are now concentrated in Contracts and Payments; Invoices, Jobs, and Customers have follow-up read-model slices documented below.

Next recommended slice:

- Apply the same Manager Page read-model pattern to Invoices next, because it is a high-traffic financial queue and still combines broad invoice, project, estimate, job, change-order, payment, and settings reads before local filtering.

## Estimates Manager Read Model

Chosen slice:

- `/estimates` Manager Page list, status counts, proposal queues, recent client-response preview, and Quick-Create option loading.

Before/after loading behavior:

- Before: `/estimates` loaded full tenant-scoped estimates, opportunities, customers, and projects before applying perspective, status, search, counts, queues, recent-response previews, and composer option mapping in memory.
- After: `/estimates` uses `apps/web/lib/estimates/manager-read-model.ts` for exact status counts, exact narrow pipeline-value inputs, server-side perspective/status/search filtering, bounded top-N proposal queues, and a narrow recent-response preview.
- Before: global `/estimates` route entry loaded Quick-Create opportunity/customer/project options even when the composer was closed.
- After: Quick-Create options load only when the composer is open or context/error parameters require it, and they select only the fields the existing composer renders.

Behavior preserved:

- Proposal-first labels, links, empty states, row/card actions, perspective semantics, estimate status meaning, customer response preview meaning, and Rows Per View behavior remain unchanged.
- The main estimate list intentionally remains unbounded after server-side filters because the current UI still supports `Show All`; capping it would hide valid records and change visible behavior.
- Estimate totals, approval/rejection flow, revision behavior, project/customer/opportunity relationships, downstream contract/job/invoice behavior, schema, migrations, readiness gates, and Quick-Create server actions were not changed.

Remaining bottlenecks:

- The Estimates Manager still uses multiple count/top-N queries and a narrow exact pipeline-value scan rather than a database aggregate/RPC because no schema or database function was added.
- Search by linked customer, project, and opportunity labels performs id-only related lookups before the estimate query so the visible search meaning is preserved without loading broad related records.
- Remaining Manager Page broad-list patterns are now concentrated in Contracts and Payments; Invoices, Jobs, and Customers have follow-up read-model slices documented below.

Next recommended slice:

- Invoices is the next Manager Page slice and is documented below.

## Invoices Manager Read Model

Chosen slice:

- `/invoices` Manager Page list, status counts, billing queues, context-prefill lookup, and Quick-Create option loading.

Before/after loading behavior:

- Before: `/invoices` loaded full tenant-scoped invoices, projects, estimates, jobs, and change orders on every render before applying perspective, source-context filters, status/search filtering, count derivation, queue slicing, and composer option mapping in memory.
- After: `/invoices` uses `apps/web/lib/invoices/manager-read-model.ts` for exact count-only invoice status totals, server-side perspective/source-context/status/search filtering, explicit selected columns for manager rows, and bounded top-N billing queues for awaiting payment, overdue, draft, and paid previews.
- Before: invoice context prefill used full canonical estimate/job/change-order loaders, and the route loaded Quick-Create project/estimate/job/change-order option arrays even when the composer was closed.
- After: context prefill uses narrow id/name/source lookups, and Quick-Create options load only when the composer is open or error/context parameters require it. The option queries still preserve the existing valid-create semantics: all projects, approved estimates, completed jobs, and approved unbilled change orders whose latest commercial snapshot has billable items remain available.

Behavior preserved:

- Billing review-first labels, links, empty states, row/card actions, perspective semantics, invoice status meaning, source-context scoping, and Rows Per View behavior remain unchanged.
- The main invoice list intentionally remains unbounded after server-side filters because the current UI still supports `Show All`; capping it would hide valid financial records and change visible behavior.
- Invoice totals, tax, retainage, balance due, payment state, progress-billing behavior, change-order impact, invoice status transitions, project/customer/estimate/job/payment relationships, schema, migrations, readiness gates, and Quick-Create server actions were not changed.

Remaining bottlenecks:

- The Invoices Manager still uses multiple count/top-N queries rather than a database aggregate/RPC because no schema or database function was added.
- Search by linked customer and project labels performs id-only related lookups before the invoice query so the visible search meaning is preserved without loading broad related records.
- Quick-Create option lists remain intentionally broad where correctness requires showing all valid project/source choices; they are now lazy and column-narrow rather than always-loaded full canonical records.

Next recommended slice:

- Jobs is the next Manager Page slice and is documented below.

## Jobs Manager Read Model

Chosen slice:

- `/jobs` Manager Page list, status counts, production queues, project-context banner, assignment-count cues, and Quick-Create ready-project options.

Before/after loading behavior:

- Before: `/jobs` loaded full tenant-scoped jobs and projects on every render, then loaded job assignments for every loaded job before applying project filters, status views, search, count derivation, queue slicing, recent-row slicing, and ready-project option mapping in memory.
- After: `/jobs` uses `apps/web/lib/jobs/manager-read-model.ts` for exact count-only job status totals, server-side project/status/search filtering, explicit selected columns for manager rows, bounded top-N production queues, a narrow project-context lookup, and assignment-count reads scoped to the visible recent jobs plus scheduled jobs needed for the "without assignments" queue.
- Before: Job Quick-Create project options came from the full project list even when the composer was closed.
- After: Job Quick-Create project options load only when the composer is open or error state requires it, and select only ready-to-schedule project labels plus customer labels needed by the existing form.

Behavior preserved:

- Production-first labels, links, empty states, schedule handoff URLs, action hierarchy, status tab meaning, project scoping, search fields, quick-create initial project/estimate/contract context, and selected-job schedule-panel handoff semantics remain unchanged.
- Job creation, scheduling, unscheduling, crew assignment, canonical `jobs`, canonical `job_assignments`, project/customer/estimate relationships, readiness gates, status transitions, schema, migrations, and server actions were not changed.

Remaining bottlenecks:

- The Jobs Manager still uses multiple count/top-N queries rather than a database aggregate/RPC because no schema or database function was added.
- Search by linked customer, project, and estimate labels performs id-only related lookups before the job query so the visible search meaning is preserved without loading broad related records.
- The "scheduled without assignments" preview remains exact by loading narrow scheduled-job rows and assignment job ids for that scoped set; it is no longer full job/assignment payload loading, but it can still be the largest remaining Jobs Manager read for tenants with many scheduled jobs.

Next recommended slice:

- Customers is the next Manager Page slice and is documented below.

## Customers Manager Read Model

Chosen slice:

- `/customers` Manager Page account counts, account-quality queues, linked-project summary, and recent customer list.

Before/after loading behavior:

- Before: `/customers` loaded full tenant-scoped customers and full tenant-scoped projects on every render, then searched customers, counted tax/contact/address summaries, derived missing-info queues, counted linked projects per customer, and sliced the recent table in memory.
- After: `/customers` uses `apps/web/lib/customers/manager-read-model.ts` for exact count-only customer totals, server-side customer search, explicit selected columns for manager rows, bounded top-N tax-exempt/missing-contact/missing-address/linked-project queues, and a narrow project `customer_id` projection for linked-project counts.
- Customer Quick-Create still does not need customer/project option arrays; it continues to load only the organization financial setting needed for default retainage.

Behavior preserved:

- Account-first labels, links, empty states, search fields, financial-default display, missing contact/address cues, linked-project continuity copy, and Quick-Create behavior remain unchanged.
- Customer creation/update, primary-contact creation/linking, portal access grants, customer contacts, project relationships, invoice/payment/tax/retainage behavior, schema, migrations, and server actions were not changed.

Remaining bottlenecks:

- The Customers Manager still uses multiple count/top-N queries rather than a database aggregate/RPC because no schema or database function was added.
- Linked-project counts are exact from a narrow project `customer_id` scan. This avoids full project payloads, but a future aggregate/RPC or indexed reporting projection could reduce that scan for very large tenants.

Next recommended slice:

- Contracts is the next Manager Page slice and is documented below.

## Contracts Manager Read Model

Chosen slice:

- `/contracts` Manager Page status counts, approval/signature queues, recent contract list, approved-estimate count, and Quick-Create approved-estimate options.

Before/after loading behavior:

- Before: `/contracts` loaded the full tenant-scoped contract list through `listContracts()`, including rendered contract content/PDF fields and signed-url resolution potential, then filtered status/search, counted status tabs, built approval/signature queues, and sliced recent rows in memory.
- After: `/contracts` uses `apps/web/lib/contracts/manager-read-model.ts` for exact count-only status totals, server-side status/search filtering, explicit selected columns for manager rows, and bounded top-N pending-approval, ready-to-send, sent, and viewed queues.
- Before: contract Quick-Create loaded approved estimates through broad `listEstimates()` on every route render.
- After: Quick-Create approved-estimate options load only when the composer/error/estimate context requires them, and select only approved estimate id/reference/project label. The closed-page empty state uses an exact approved-estimate count.

Behavior preserved:

- Contract/signature labels, links, empty states, send-ready action hierarchy, status tab meaning, approval queue meaning, and estimate-to-contract generation entry points remain unchanged.
- Contract generation, internal approval transitions, send-for-signature, customer signature, decline, onsite signature, countersign, void, portal review/access, readiness sync, signature events/history, schema, migrations, and server actions were not changed.

Remaining bottlenecks:

- The Contracts Manager still uses multiple count/top-N queries rather than a database aggregate/RPC because no schema or database function was added.
- Search by linked customer/project/estimate/template labels performs id-only related lookups before the contract query to preserve visible search meaning without loading broad related records.
- Quick-Create approved-estimate options remain intentionally unbounded when composer opens so every valid approved estimate remains selectable; they are lazy and column-narrow instead of always-loaded broad estimate records.

Next recommended slice:

- Payments is the next Manager Page slice and is documented below.

## Payments Manager Read Model

Chosen slice:

- `/payments` Manager Page payment counts, recorded/pending totals, open-receivables summary, collections queues, failed-payment event queue, and recent payment list.

Before/after loading behavior:

- Before: `/payments` loaded full tenant-scoped payments, full payment events, and full invoices on every render, then counted payment statuses, summed recorded/pending totals, calculated open receivables/overdue invoices, filtered search/status locally, and sliced queues in memory.
- After: `/payments` uses `apps/web/lib/payments/manager-read-model.ts` for exact count-only payment status totals, server-side payment status/search filtering, explicit selected payment columns, bounded recent payment rows, bounded recorded-payment and failed-payment queues, and a narrow open-invoice projection for exact receivable totals and overdue counts.
- Failed-payment visibility now reads only recent `payment_failed` event rows with invoice/customer/project labels needed by the exception card instead of loading the full immutable payment-event stream.

Behavior preserved:

- Payment activity labels, status tabs, collections summary cards, open/overdue invoice previews, failed-payment previews, recent payment list, empty states, and links to invoice/project/customer context remain unchanged.
- Payment recording, portal checkout start, webhook/finalization, void/failure handling, invoice balance updates, event immutability, provider/gateway metadata semantics, reconciliation behavior, status transitions, schema, migrations, and server actions were not changed.

Remaining bottlenecks:

- The Payments Manager still uses multiple count/top-N queries rather than a database aggregate/RPC because no schema or database function was added.
- Recorded and pending totals still require a narrow payment amount/status scan so totals remain exact.
- Open receivables and overdue counts still require a narrow open-invoice balance/due-date projection so financial totals remain exact without changing invoice math or adding summary state.
- Search by invoice/customer/project labels performs id-only related lookups before the payment query to preserve visible search meaning without loading broad related records.

Next recommended slice:

- Continue with the next high-traffic manager surface after Change Orders; Materials/Catalog or People are likely candidates depending on production usage.

## Change Orders Manager Read Model

Chosen slice:

- `/change-orders` Manager Page status counts, status/search-filtered visible rows, linked project/customer/contract/invoice labels, portal-review/invoice-impact row indicators, and Quick-Create option data.

Before/after loading behavior:

- Before: `/change-orders` loaded the full tenant-scoped change-order list, full contract list, full invoice list, and broad project options on every render, then counted statuses and searched/filtered locally.
- After: `/change-orders` uses `apps/web/lib/change-orders/manager-read-model.ts` for exact count-only status totals, server-side status/search filtering, explicit selected change-order columns, bounded recent visible rows, and narrow linked-record label fields.
- Quick-Create project/contract/invoice options now load only when the composer is open, reopened after validation, or deep-linked with context; when loaded they use explicit option-only columns and remain unbounded so every valid canonical project/contract/invoice remains selectable.

Behavior preserved:

- Change-order labels, status tabs, search fields, empty states, links, portal-viewed copy, approved invoice-line impact copy, and Quick-Create form behavior remain unchanged.
- Approval/rejection, portal review, commercial snapshots, invoice impact, applied invoice-line behavior, financial calculations, schema, migrations, and server actions were not changed.

Remaining bottlenecks:

- The Change Orders Manager still uses multiple count/top-N queries rather than a database aggregate/RPC because no schema or database function was added.
- Search by linked customer/project/contract/invoice labels performs id-only related lookups before the change-order query to preserve visible search meaning without loading broad related records.
- Quick-Create options remain intentionally unbounded when the composer opens so valid linked records are not hidden from create flows.

Next recommended slice:

- Continue with the next high-traffic surface that still does broad tenant reads, likely Materials/Catalog or Vendors.

## People Manager Read Model

Chosen slice:

- `/people` Manager Page workforce counts, status/type/search-filtered visible rows, compliance count badges, composer member/vendor options, and customer-access console support reads.

Before/after loading behavior:

- Before: `/people` loaded full tenant-scoped people, vendors, compliance records, organization members, customer contacts, portal access grants, projects, then fanned out per customer for stored portal permissions and per grant for project visibility.
- After: `/people` uses `apps/web/lib/people/manager-read-model.ts` for exact count-only workforce totals, server-side type/active/search filtering, explicit selected people columns, a bounded 20-row workforce list, narrow compliance person-count inputs, and lazy column-narrow composer member/vendor options.
- Portal access console support reads now batch stored customer-contact portal permissions and portal project visibility for the organization instead of issuing one query per customer and one query per grant. Project labels for portal visibility use a narrow project id/customer/name/status projection.
- Customer contacts and portal access grants intentionally continue through the existing canonical loaders because the visible access console and invite-delivery status rely on their full current semantics.

Behavior preserved:

- Workforce/contact labels, status tabs, search fields, empty states, person links, vendor labels, compliance badge meaning, customer-access console rows, portal invite delivery status, project visibility controls, and Quick-Create behavior remain unchanged.
- Person creation/update, vendor linkage validation, assignability, compliance behavior, portal access behavior, job assignment behavior, time tracking, workforce identity, schema, migrations, and server actions were not changed.

Remaining bottlenecks:

- The People Manager still uses multiple count/top-N queries rather than a database aggregate/RPC because no schema or database function was added.
- Customer contacts and portal access grants remain intentionally broad canonical reads for the access console so contact/profile, grant, auth-link, temp-credential, invite-delivery, and management-panel semantics stay intact.
- Search by vendor label performs an id-only vendor lookup before the people query to preserve visible search meaning without loading broad vendor records.

Next recommended slice:

- Closed in the Vendors Manager read-model slice below. Vendor-linked worker counts, compliance counts, and labor-provider filtering now use a vendor-specific manager read path.

## Vendors Manager Read Model

Chosen slice:

- `/vendors` Manager Page list, summary counts, linked-worker badges, and compliance-count badges.

Before/after loading behavior:

- Before: `/vendors` loaded every tenant vendor through `listVendors()`, every tenant person through `listPeople()`, and every tenant compliance record through `listComplianceRecords()`, then filtered views/search, counted labor-provider/active vendors, and derived linked-worker/compliance badges in memory.
- After: `/vendors` uses `apps/web/lib/vendors/manager-read-model.ts` for exact vendor count-only totals, server-side labor-provider/active/search filtering, explicit selected vendor columns, a bounded visible vendor list, narrow `people.vendor_id` linked-worker count inputs, and narrow vendor-only `compliance_records.subject_id` count inputs.
- The vendor create composer remains the existing `VendorForm` and server action; no option payload or quick-create semantics changed.

Behavior preserved:

- Vendor/labor-provider labels, active filtering, search fields, row links, empty states, linked-worker counts, and compliance-record counts retain the same visible meaning.
- Vendor creation/update behavior, labor-provider flag behavior, linked-worker behavior, compliance behavior, job assignment behavior, time tracking, workforce identity, tenant scoping, schema, migrations, and canonical relationships were not changed.

Remaining bottlenecks:

- The Vendors Manager still uses multiple count/top-N queries rather than a single aggregate/RPC because no schema or database function was added.
- Linked-worker and vendor-compliance badges still count narrow tenant-scoped rows in application code; a future aggregate helper or RPC could reduce row transfer after query shapes are proven.
- Job assignment summaries are not loaded on `/vendors` because the current manager page does not display assignment queues or counts. Assignment behavior remains owned by jobs/schedule surfaces.

Next recommended slice:

- Move to a high-cardinality supporting surface such as Directory or Global Search, or return to `/schedule` for a view-aware/date-window loader once selected-record and count semantics are designed.

## Operational Cockpit Read Model

Chosen slice:

- Dashboard Operational Cockpit preview loading.

Before/after loading behavior:

- Before: the new dashboard Operational Cockpit reused broad dashboard lists for contracts, estimates, invoices, jobs, and appointments, then sliced those arrays to render the `Needs attention`, `Ready to move`, `Waiting`, and `Field / production` buckets.
- After: `apps/web/lib/dashboard/operational-cockpit-read-model.ts` loads bounded cockpit previews with explicit selected columns for approved-estimate contract handoffs, waiting contracts, sent estimates, open/overdue invoices, unscheduled jobs, today/in-progress jobs, and appointment follow-up.
- The ready-project-without-job portion intentionally still uses the existing project readiness snapshots and job grouping because readiness must remain exact and this pass did not introduce a batched readiness helper or schema-backed cache.

Behavior preserved:

- Bucket names, labels, links, why copy, and canonical route handoffs stay the same.
- Project readiness, cue-state suppression, payment state, signature state, invoice status, estimate status, job status, schedule links, and lifecycle rules were not changed.
- The dashboard still uses broad canonical lists where other existing widgets and Quick-Create option arrays need them, so this slice narrows the cockpit read path without pretending the whole dashboard is fully read-modelled.

Remaining dashboard bottlenecks:

- Broad dashboard lists still support Quick-Create options, lifecycle metrics, finance widgets, appointment widgets, and project readiness derivation.
- Per-project readiness snapshots still fan out across active projects.
- Approved-estimate handoff detection now selects only contract `estimate_id` links plus bounded approved estimate previews, but a future anti-join/RPC or batched readiness read may be cleaner at larger tenant sizes.

Next recommended slice:

- Design a batched dashboard readiness summary that preserves `getProjectFinancialReadinessSnapshot(...)` semantics exactly, then let ready-project and project-cue previews stop fanning out per active project.

## Schedule Slice 1

Bottleneck identified:

- `/schedule` loaded the full tenant-scoped opportunity list through `listOpportunities()`, including broad commercial/contact/address/follow-up fields and primary-contact hydration, then filtered in memory to the small subset of `site_assessment_scheduled` opportunities with `siteAssessmentScheduledAt`.
- The schedule surface only uses those opportunity rows as appointment-style schedule cards and only needs id, customer/project context, title/site name, status, scheduled assessment timestamp, and primary-contact display label.

Chosen optimization:

- Replace the full opportunity read on `/schedule` with `listScheduleOpportunityAssessments()`, a schedule-specific tenant-scoped loader that selects only schedule-visible lead assessment fields, filters to scheduled assessments in Supabase, orders by assessment time, and hydrates primary contacts only for the reduced result set.

Before/after loading behavior:

- Before: `/schedule` loaded every opportunity visible to the tenant, hydrated contacts for all of those rows, and then kept only scheduled site-assessment rows not already represented by scheduled site-visit appointments.
- After: `/schedule` loads only scheduled lead assessment rows with explicit columns, then keeps the existing de-duplication against scheduled site-visit appointments.

Files changed:

- `apps/web/app/(app)/schedule/page.tsx`
- `apps/web/lib/opportunities/data.ts`
- `docs/performance-audit.md`

Behavior preserved:

- Scheduled lead assessments still render as appointment-style schedule items, link back to the Lead Workspace, participate in project/view/crew/search filters, and are still suppressed when a scheduled site-visit appointment already represents the same opportunity.
- Canonical opportunities, appointments, jobs, job assignments, tenant scoping, RLS assumptions, readiness gates, scheduling actions, and crew assignment behavior were not changed.

Remaining schedule bottlenecks:

- `/schedule` still loads broad jobs, appointments, people, vendors, and assignments for every loaded job before applying selected view/date/project filters.
- Job assignment loading still fans out across all loaded job ids.
- Active assignable people and labor-provider vendors are still filtered in memory after broad roster/vendor reads.
- The main list still builds schedule items more than once and still uses some linear lookups during rendering.

Next recommended slice:

- Add schedule-specific crew option loaders for active assignable people and active labor-provider vendors, or add a schedule job summary loader that narrows job card projections before broader date-window filtering.

## Schedule Slice 2

Chosen slice:

- Active crew/vendor option narrowing for `/schedule`.

Before/after loading behavior:

- Before: `/schedule` loaded the full tenant-scoped people list with workforce details, linked vendor, and linked user fields, then filtered in memory to active assignable people before passing only id and display name into the crew assignment form.
- Before: `/schedule` loaded the full tenant-scoped vendor list with contact, address, tax, notes, active, and labor-provider fields, then filtered in memory to active labor-provider vendors before passing only id and name into the crew assignment form.
- After: `/schedule` uses `listScheduleAssignablePeople()` and `listScheduleLaborVendors()`, which apply active/assignable/labor-provider filters in Supabase and select only the dropdown fields needed by the schedule crew assignment panel.

Files changed:

- `apps/web/app/(app)/schedule/page.tsx`
- `apps/web/lib/people/data.ts`
- `apps/web/lib/vendors/data.ts`
- `docs/performance-audit.md`

Behavior preserved:

- The crew assignment form still offers the same valid active assignable people and active labor-provider vendors that the previous schedule page allowed after in-memory filtering.
- Assignment creation, unassignment, job updates, canonical `people`, canonical `vendors`, canonical `jobs`, `job_assignments`, readiness gates, tenant scoping, and server-side validation behavior were not changed.

Remaining schedule bottlenecks:

- `/schedule` still loads broad jobs and appointments before view/date/project filtering.
- Job assignment loading still fetches assignment rows for every loaded job id.
- Schedule job cards still use full job list data and repeated local grouping/filtering.
- The main list still builds schedule items more than once.

Next recommended slice:

- Add a schedule-specific job summary loader or assignment summary loader so `/schedule` can stop loading full job payloads and broad assignment rows for fields that are not rendered on schedule cards.

## Schedule Slice 3

Chosen slice:

- Schedule-specific job summary loader for `/schedule`.

Before/after loading behavior:

- Before: `/schedule` used `listJobs()`, which selects the full job list payload including detail-only `notes` and the canonical list projection intended for broader jobs surfaces.
- After: `/schedule` uses `listScheduleJobs()`, a tenant-scoped schedule projection that selects only job identity, customer/project/estimate links and labels, dispatch status, schedule date/time/notes, crew vendor label, and timestamps needed for schedule sorting, cards, filters, search, links, and action panels.

Files changed:

- `apps/web/app/(app)/schedule/page.tsx`
- `apps/web/lib/jobs/data.ts`
- `apps/web/lib/schedule/read-model.ts`
- `docs/performance-audit.md`

Behavior preserved:

- The Schedule Manager still groups unscheduled, today, upcoming, in-progress, assigned, and missing-crew jobs from canonical `jobs`.
- Search, project filtering, schedule/action links, selected job panels, scheduling form defaults, crew assignment handoff, and job/project/customer workspace links continue to use the same displayed fields.
- Job creation, scheduling, unscheduling, assignment mutations, readiness gates, lifecycle rules, tenant scoping, RLS assumptions, and server-side validation were not changed.

Remaining schedule bottlenecks:

- `/schedule` still loads broad appointments before view/date/project filtering.
- Job assignment loading still fetches assignment rows for every schedule job id.
- Schedule jobs are still loaded tenant-wide before local view/date filtering; a future date-window or selected-view loader could reduce row count further.
- The main list still builds schedule items more than once and still has some linear lookups during rendering.

Next recommended slice:

- Add a schedule-specific appointment projection/date-window loader or narrow `job_assignments` into a schedule assignment summary projection, depending on which payload is larger in production-like data.

## Schedule Slice 4

Chosen slice:

- Schedule-specific job assignment summary loader for `/schedule`.

Before/after loading behavior:

- Before: `/schedule` used `listJobAssignmentsByJobIds(...)`, which selects the canonical assignment list projection for every loaded schedule job, including organization/timestamp fields and person/vendor availability flags that the schedule surface does not render.
- After: `/schedule` uses `listScheduleJobAssignmentsByJobIds(...)`, which keeps the same tenant `company_id` filter and job-id scoping but selects only assignment id, job id, assignee ids, role, assignment window, and person/vendor display labels needed for crew chips, crew queues, search, and the selected job action panel.

Files changed:

- `apps/web/app/(app)/schedule/page.tsx`
- `apps/web/lib/jobs/data.ts`
- `apps/web/lib/schedule/read-model.ts`
- `docs/performance-audit.md`

Behavior preserved:

- Crew counts, crew summary labels, lead labels, assigned/unassigned filters, schedule search, selected job crew state, and the crew assignment form continue to use the same visible assignment meaning.
- Assignment creation, unassignment, canonical `job_assignments`, canonical `jobs`, readiness gates, scheduling lifecycle rules, tenant scoping, RLS assumptions, and server-side validation were not changed.

Remaining schedule bottlenecks:

- `/schedule` still loads broad appointments before view/date/project filtering.
- Schedule jobs and their assignment summaries are still loaded tenant-wide before local view/date filtering.
- The planner still builds schedule items more than once and still has some linear item-to-job lookups during rendering.

Next recommended slice:

- Add a schedule-specific appointment projection/date-window loader, or introduce a safe visible-range job loader once the schedule route's selected job and cross-view counts can be preserved without changing behavior.

## Schedule Slice 5

Chosen slice:

- Schedule-specific appointment summary loader for `/schedule`.

Before/after loading behavior:

- Before: `/schedule` used `listAppointments()`, which selects the broader appointment list projection including notes, customer/internal notes, creator/updater ids, created timestamp, and assigned-person active/membership fields.
- After: `/schedule` uses `listScheduleAppointments()`, a tenant-scoped appointment projection that selects only appointment identity, linked opportunity/customer/project ids and labels, assigned-person display label, date/time fields, status, type, location, customer visibility, and updated timestamp needed for schedule cards, grouping, filters, search, and links.
- No date-window filter was added in this slice because the current route still uses appointment records for all-view counts, project filtering, search, and a broad list range; narrowing the row set would risk hiding valid records.

Files changed:

- `apps/web/app/(app)/schedule/page.tsx`
- `apps/web/lib/appointments/data.ts`
- `apps/web/lib/schedule/read-model.ts`
- `docs/performance-audit.md`

Behavior preserved:

- Appointment cards, day/week planner grouping, appointment/job item filtering, assigned/unassigned crew filter behavior, project/customer/lead context links, customer-visible badges, search fields, and site-visit de-duplication with scheduled opportunity assessments continue to use the same displayed meaning.
- Canonical appointments, appointment mutations, scheduling lifecycle rules, readiness gates, job behavior, tenant scoping, and RLS assumptions were not changed.

Remaining schedule bottlenecks:

- Schedule jobs, appointment summaries, and assignment summaries are still loaded tenant-wide before local view/date filtering.
- The planner still builds schedule items more than once and still has some linear item-to-job lookups during rendering.
- Global schedule counts and selected-job behavior still make date-window filtering a larger follow-up rather than a safe one-line change.

Next recommended slice:

- Add low-risk in-memory render improvements such as a visible job map for schedule item rendering, then design a view-aware/date-window loader separately so it preserves all current counts, filters, selected job handoffs, and search behavior.

## Schedule Slice 6

Repeated render work found:

- `/schedule` rendered job list rows by calling `visibleJobs.find(...)` for each schedule item, turning a mixed item list into repeated linear job lookups.
- The planner grouped visible scheduled jobs and visible appointment items by filtering the full visible arrays once per planner day.

Cleanup made:

- Added a `visibleJobsById` map after the existing visible job filters and reused it when rendering job rows from schedule items.
- Added date-key maps for visible scheduled jobs and visible planner appointments before building `scheduledBoardGroups`, replacing per-day `.filter(...)` scans with map lookups.

Files changed:

- `apps/web/app/(app)/schedule/page.tsx`
- `docs/performance-audit.md`

Behavior preserved:

- The same tenant-wide schedule summary arrays are still loaded, and the same local filters, search behavior, day/week planner range, item ordering, cards, action links, selected-job behavior, and appointment/job visibility rules remain in place.
- No data-loader scope, schema, lifecycle, readiness, job, appointment, tenant, RLS, or UI hierarchy behavior changed.

Remaining schedule bottlenecks:

- Schedule jobs, appointments, and assignment summaries are still loaded tenant-wide before local view/date filtering.
- The route still builds schedule items more than once for planner and broad list ranges.
- Date-window loading remains the biggest follow-up, but it needs a careful design to avoid hiding valid records used by counts, search, all-view behavior, and selected job handoffs.

Next recommended slice:

- Design a view-aware/date-window schedule loader that preserves current count/search/selected-record semantics, or first consolidate the repeated `buildScheduleItems(...)` calls if a smaller render-only pass is preferred.

## Global Search Slice 1

Bottleneck found:

- Global search already skips empty and one-character searches on both the client and server, and it already trims each visible result group to five results after scoring.
- The server still fanned out to twelve tenant-scoped module queries without database result limits, then ranked and discarded most rows in memory.

Optimization made:

- Added a shared `perEntityCandidateLimit` of 50 to each global-search module query before merging and scoring.
- Kept the existing explicit select projections, tenant `company_id` filters, group labels, result scoring, visible per-group limit, and canonical destination links.

Files changed:

- `apps/web/lib/global-search/data.ts`
- `docs/performance-audit.md`

Behavior preserved:

- Global search still searches the same categories, returns the same result shape, keeps up to five visible results per category, and links to the same canonical Manager Pages and Workspaces.
- Tenant scoping, auth/org lookup, canonical record relationships, and the shell search dialog behavior were not changed.

Remaining search bottlenecks:

- Search still filters and scores in the server process after fetching recent candidates instead of pushing text predicates into Supabase.
- The candidate bound favors each module's existing ordering, so older matching records outside the recent candidate window may still require the next database-side filtering slice.
- Related-record search fields still come through nested joins; the next pass should add safe table-specific `or`/`ilike` predicates where they do not drop valid related-record matches.

Next recommended slice:

- Closed in the Global Search Database Filtering slice below for entities where direct or safely resolved related fields could be filtered without changing result categories, scoring, links, or tenant scoping.

## Global Search Database Filtering

Chosen slice:

- Shell-level global search candidate filtering in `apps/web/lib/global-search/data.ts`.

Before/after loading behavior:

- Before: global search fanned out to all current search groups, capped each entity at 50 recent rows, and then relied on in-process scoring to discard non-matching rows.
- After: global search keeps the 50-row per-entity candidate cap, but adds Supabase-side `.or(...ilike...)` candidate filters for direct scoring fields on opportunities, customers, projects, appointments, estimates, contracts, invoices, jobs, punchlist items, people, and vendors.
- Related-label search is preserved where safe by resolving bounded related ids first: customer ids, project ids, opportunity ids, vendor ids, person ids, and estimate ids can feed `customer_id`, `project_id`, `opportunity_id`, `vendor_id`, `assigned_person_id`, and `estimate_id` filters on downstream records.
- Server-side scoring still runs after database filtering, so token matching, score ordering, visible group labels, result shape, canonical links, and the five-result group cap remain unchanged.

Behavior preserved:

- Empty and one-character searches still short-circuit before database work.
- Search still uses existing tenant `company_id` filters and canonical links.
- No full-text search, schema change, index migration, search cache, search-only table, result category change, or client dialog behavior change was added.

Entities intentionally left unchanged:

- Payments keep the previous bounded candidate behavior because visible payment results are primarily invoice/customer/project lineage. Filtering only direct payment fields such as method, source, payer email, or reference would drop valid invoice/customer/project label matches. A future payment-specific related-invoice candidate helper can narrow this safely.
- Change orders are not part of the current global search category set, so this pass did not add a new category or change visible search coverage.

Remaining bottlenecks:

- The related-id prelookups are still separate queries before the main fan-out. They are bounded, but a future search architecture could consolidate them or move to a tenant-safe search index after query shapes and indexes are proven.
- `ilike` predicates may need index review after production-like profiling, but no migration was added in this safe slice.

Next recommended slice:

- Profile global search with production-like tenant data and then either add a payment-specific related-invoice filter or move to Directory read-model narrowing, depending on observed payload shape.

## Index Review Follow-Up

Follow-up artifact:

- Added [docs/performance-index-review.md](C:/FloorConnector/docs/performance-index-review.md) as the evidence ledger for the recent dashboard, schedule, manager read-model, and global-search query shapes.

Findings:

- The current migration inventory already includes many tenant/link/status indexes for the canonical tables touched by the recent read-model work.
- The most likely remaining index opportunities are composite ordering indexes for repeated `company_id + status + updated_at/due_date/payment_date/schedule` preview queries, plus carefully chosen trigram search indexes only after global-search `ilike` behavior is profiled with production-like data.
- No migrations were added in this review because the strongest candidates still need `EXPLAIN (ANALYZE, BUFFERS)` and realistic row counts before adding write overhead to hot operational tables.

Recommended first profiling targets:

- Invoices: `company_id + status + due_date + updated_at` billing queues.
- Jobs: `company_id + dispatch_status + scheduled_start_at/scheduled_date + updated_at` scheduling queues.
- Payments: `company_id + status + payment_date + created_at` collection previews.
- Estimates/contracts: `company_id + status + updated_at` proposal/signature queues.
- Global search: high-cardinality direct-label `ilike` fields before considering trigram indexes.

## Larger Follow-Up Recommendations

1. Build dedicated read models for dashboard and Manager Pages.
   - Return counts plus top-N records instead of full lists.
   - Keep each read model tenant-scoped through the active organization context.

2. Move list filtering into Supabase queries.
   - Use `eq`, `in`, date ranges, `or`/`ilike`, and pagination.
   - Return total counts separately where the UI needs tab counts.

3. Batch readiness reads.
   - Replace per-project readiness snapshot fan-out with a batch helper or RPC.
   - Preserve the existing readiness rules exactly.

4. Profile production-like pages.
   - Use a production build locally or staging instrumentation before broad changes.
   - Compare dashboard, projects, invoices, schedule, payments, and portal home.

5. Consider indexes only after query shape is narrowed.
   - Likely candidates to verify with `EXPLAIN`: tenant/status/date sort patterns on `jobs`, `invoices`, `payments`, `contracts`, `estimates`, `appointments`, and `notification` lookups.
   - Do not create migrations until the exact query pattern and current index coverage are verified.

## Dev Vs Production Distinction

Likely dev-only:

- Next.js dev server compilation and RSC dev overhead.
- Local Supabase/network latency.
- Source maps and unminified bundles.

Likely production-impacting:

- Full tenant list reads on dashboard and Manager Pages.
- Per-project readiness snapshot fan-out.
- In-memory filtering/counting/search over growing tenant data.
- Global search table fan-out without database-side candidate narrowing.
- Schedule loading all supporting entities before applying selected view filters.

Likely both:

- Duplicate auth/org/bootstrap-style work in shell/page helpers.
- Large payload serialization from server components to client components.

## Files Changed In This Pass

- `apps/web/lib/notifications/data.ts`
- `apps/web/components/contractor-app-shell.tsx`
- `apps/web/app/(app)/dashboard/page.tsx`
- `docs/performance-audit.md`

## Required Env Vars

No environment variables changed.

## Follow-Up Task Dependencies

- Before adding index migrations, inspect current Supabase indexes and run `EXPLAIN` against the narrowed query shapes.
- Before introducing dashboard or manager read models, preserve tenant scoping, canonical record links, and current status semantics.
- Before dynamic-importing create forms, verify server-action submission and initial error-message behavior.
