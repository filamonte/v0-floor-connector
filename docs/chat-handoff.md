## REQUIRED FIRST STEP

Before doing anything, developers must read:

docs/developer-source-of-truth.md

`docs/developer-source-of-truth.md` defines:
- system rules
- canonical lifecycle
- workflow constraints
- implementation guardrails

Do not proceed without it. This chat handoff is only a launcher and compact operational orientation; it is not a competing source of truth.

# Chat Handoff

Status: compact operational handoff for the current branch.

Use this file for fast orientation after reading [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md). For exact implemented truth, defer to [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

For stronger implementation control on new tasks, also use:
- [docs/product-brain.md](C:/FloorConnector/docs/product-brain.md)
- [docs/decisions.md](C:/FloorConnector/docs/decisions.md)
- [docs/build-sequence.md](C:/FloorConnector/docs/build-sequence.md)
- [docs/codex-workflow.md](C:/FloorConnector/docs/codex-workflow.md)
- [docs/floorconnector-ui-build-rules.md](C:/FloorConnector/docs/floorconnector-ui-build-rules.md)
- [docs/internal-qa-workflow-checklist.md](C:/FloorConnector/docs/internal-qa-workflow-checklist.md)
- [docs/phase-a-completion-and-phase-b-readiness.md](C:/FloorConnector/docs/phase-a-completion-and-phase-b-readiness.md)
- [docs/phase-b-progress-checkpoint.md](C:/FloorConnector/docs/phase-b-progress-checkpoint.md)
- [docs/phase-b-internal-validation-runbook.md](C:/FloorConnector/docs/phase-b-internal-validation-runbook.md)
- [docs/local-qa-auth-session-note.md](C:/FloorConnector/docs/local-qa-auth-session-note.md)
- [docs/qa-estimate-send-approval-contract-prerequisites.md](C:/FloorConnector/docs/qa-estimate-send-approval-contract-prerequisites.md)

## Snapshot

FloorConnector is a production-first specialty-contractor operating system built on one shared canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

Current stage:
- Phase B first-pass foundations are now implemented for onboarding readiness polish, reporting basics, Sales Tax Summary, and manual notification-only automation
- Inventory / Cost Item Database Phase 1 audit is recorded in [docs/inventory-cost-item-database-plan.md](C:/FloorConnector/docs/inventory-cost-item-database-plan.md). The safe implementation decision is to keep `catalog_items` as the canonical reusable cost item database, with optional stock tracking through linked `inventory_items` and audited `inventory_transactions`; no new `contractor_cost_items` table was added.
- Catalog item hardening follow-up is documented in [docs/catalog-items-hardening-test-plan.md](C:/FloorConnector/docs/catalog-items-hardening-test-plan.md), and a read-only duplicate-name report lives at [scripts/catalog-items-duplicate-normalized-name-report.sql](C:/FloorConnector/scripts/catalog-items-duplicate-normalized-name-report.sql). No automated test harness exists yet, so no new framework was introduced.
- Cost Items Database UI was safely tightened on the existing catalog item grid: rows now surface type/category, unit, default cost, default price behavior, taxable state, active/archived state, and the default item marker; duplicate name/SKU save errors now return clearer organization-scoped guidance.
- Documentation is now aligned that `catalog_items` is the canonical cost item database and Phase 1 inventory/cost item foundation; deeper estimate/invoice integration is intentionally deferred to future workflow work and should preserve snapshot lineage.
- Catalog-to-estimate/invoice integration is now designed in [docs/catalog-to-estimate-invoice-integration-spec.md](C:/FloorConnector/docs/catalog-to-estimate-invoice-integration-spec.md). It is planning plus current-status alignment: catalog items provide reusable defaults, estimate and invoice line items must snapshot selected values, custom one-off lines remain valid, invoice billing should continue to prefer approved estimate/SOV/change-order lineage, and direct catalog use in invoices is limited to explicit invoice-only manual catalog-backed adjustments.
- Estimate Editor includes a `Catalog Items` panel on the Items workspace. It lists organization-scoped `catalog_items`, supports name search plus type/category filters, shows unit, default price, taxable state, and active/archived status, and previews selected items before insertion.
- Estimate Catalog Selection Phase 2B is now implemented from the Estimate Editoror Catalog Items panel. Active non-system catalog items can be previewed and added to estimates through the existing `insertCatalogItemToEstimateAction` path, creating server-owned estimate line-item snapshots. Archived items remain visible for review but are disabled in the panel and rejected server-side; systems still use the existing system expansion flow. No migrations, invoice behavior, or estimate calculation formulas were changed.
- Phase 2B estimate catalog insertion QA checklist now lives at [docs/qa-estimate-catalog-item-insertion.md](C:/FloorConnector/docs/qa-estimate-catalog-item-insertion.md). It covers active insertion, archived blocking, system-flow preservation, snapshot fields, quantity default, editability, catalog-change immutability, custom one-off items, totals, and `pnpm typecheck` / `pnpm lint`.
- Documentation alignment after catalog-to-estimate work is complete across current-state, developer source of truth, roadmap, workflows, and supporting catalog docs. Current truth: `catalog_items` remains canonical, estimate catalog insertion is implemented for active non-system items with server-owned snapshots, the manual QA checklist exists, and invoice catalog usage is intentionally limited to explicit invoice-only manual catalog-backed adjustments rather than free catalog insertion as normal invoice scope.
- current recommendation is to pause feature expansion and run internal validation before contractor beta; use [docs/phase-b-internal-validation-runbook.md](C:/FloorConnector/docs/phase-b-internal-validation-runbook.md)
- contractor UI system is stabilized and normalized
- contractor app and portal both run on shared canonical records
- the product now has its implemented financial engine and notification foundation in place
- remaining Phase B gaps are support/release checklist, onboarding runbook, beta candidate criteria, bug triage process, and recorded validation results
- `/people` is still the implemented workforce-oriented route today, while `/directory` now provides the first read-only contractor-facing account/contact workspace over canonical records
- customer, person, vendor, and lead detail pages now include compact Directory-context handoff cards so users can jump back to the read-only index while those canonical record pages remain the editing/workflow homes
- customer detail now also includes a compact related-contacts management section over canonical `contacts` and `customer_contacts`, with contractor-admin add/edit/main-contact controls while canonical `customers.email` still drives estimate/contract/invoice recipient continuity
- `/directory` now also shows related customer contacts as read-only `Customer Contact` rows that point back to the parent customer detail workspace for management
- customer detail now also supports contact-linked portal grants on canonical `portal_access_grants.customer_contact_id`, while null-contact grants still remain valid customer-level access; Directory remains read-only
- customer detail now also stores and edits linked-contact portal permissions on canonical `customer_contact_portal_permissions`
- customer detail now clearly labels customer-level versus linked-contact portal grants and guides admins to attach legacy customer-level grants to existing related contacts when they are ready
- linked-contact grants now enforce stored permissions for portal estimate approve/reject, change-order approve/reject, and contract sign/decline actions
- contractor-side customer signer options now filter out linked-contact portal users when `canSignContracts` is off
- null-contact customer-level grants still keep legacy behavior, and contract view/countersign, invoice/payment, estimate send, and broader portal view behavior are unchanged
- seed-free internal QA workflow checklist now lives at [docs/internal-qa-workflow-checklist.md](C:/FloorConnector/docs/internal-qa-workflow-checklist.md) for repeatable Phase A manual testing
- local browser QA auth/session setup now lives at [docs/local-qa-auth-session-note.md](C:/FloorConnector/docs/local-qa-auth-session-note.md); use it when protected routes redirect to `/login` from an expired local Supabase session
- estimate send, portal approval, and contract-generation QA prerequisites now live at [docs/qa-estimate-send-approval-contract-prerequisites.md](C:/FloorConnector/docs/qa-estimate-send-approval-contract-prerequisites.md); use it to prepare customer email, portal project access, portal approval, and approved snapshot lineage without bypassing canonical guards
- contractor-initiated portal invites are now implemented on top of canonical `portal_access_grants` and `portal_project_access`: customer detail can create a pending project-scoped invite for a customer/contact email, show a one-time local invite URL, and `/portal/invite?token=...` validates the hashed token before existing login/signup activates the grant for a matching authenticated email
- Phase B validation created a fresh lead -> customer -> project -> draft estimate chain and dedicated customer contacts for portal QA. The previous blocker that portal grants required an already-authenticated portal user is addressed by the contractor-initiated invite/account-bootstrap flow.
- Follow-up portal QA confirmed `jfilamonte@gmail.com` is the contractor owner/admin identity and `filamontej@gmail.com` is the clean customer portal identity. `filamontej@gmail.com` was added as a related contact through the customer UI. The customer-page render blocker was fixed by removing the ambiguous stored-permission relationship embed, and the contractor UI now creates a pending linked-contact portal grant for `filamontej@gmail.com`, creates active project access for the Phase B project, and displays the one-time local invite URL after creation. Do not store raw invite tokens in docs. Resume with clean-session invite acceptance as `filamontej@gmail.com`, portal isolation, estimate send, portal approval, approved snapshot verification, and contract generation.
- internal QA integrity pass tightened context preservation: `/jobs?projectId=...` now actually filters canonical jobs, project completed-job invoice actions carry the `jobId` into invoice Quick-Create, `/invoices` preserves project/estimate/job/deposit context through filters, and Directory copy now reflects implemented linked-contact portal permissions
- Phase A completion report and Phase B readiness checklist now live at [docs/phase-a-completion-and-phase-b-readiness.md](C:/FloorConnector/docs/phase-a-completion-and-phase-b-readiness.md)
- contractor onboarding readiness polish is now live: dashboard shows a lightweight `Start here` guide for settings, first customer, first project, and first estimate; leads/customers/projects/estimates empty states include direct Quick-Create actions; no schema, model, or lifecycle logic changed
- Phase B progress checkpoint now lives at [docs/phase-b-progress-checkpoint.md](C:/FloorConnector/docs/phase-b-progress-checkpoint.md), and recommends internal validation before more feature breadth
- Phase B internal validation runbook now lives at [docs/phase-b-internal-validation-runbook.md](C:/FloorConnector/docs/phase-b-internal-validation-runbook.md), with ordered passes for core workflow, portal permissions, reports, Sales Tax Summary, automation runner, communications, and onboarding/empty states

## Built Now

Implemented on the current branch:
- auth, tenant bootstrap, organization-aware access control
- leads, customers, projects, estimates
- first read-only `/directory` workspace over canonical customers, related customer contacts, workforce people, vendors, and leads, with each row routing back into the existing canonical detail page
- canonical `customers` remain the customer/account source of truth for estimate send, invoice recipient, contract customer context, payment/billing context, and project ownership; a future `Directory` view must not replace that with a generic contact model
- customer detail now surfaces canonical related customer contacts beneath the customer account, with contractor-admin add/edit/main-contact management on top of `contacts` and `customer_contacts`
- customer estimate send, portal review, approval, rejection, and estimate email tracking
- approved estimate commercial snapshots as the downstream commercial baseline
- canonical contracts with signer routing and portal signature actions
- canonical change orders with contractor + portal workflow, immutable approved snapshots, and SOV or invoice integration
- server-side Project Readiness Gate is implemented
- jobs, scheduling, and execution workflows are blocked until readiness conditions are met
- canonical jobs with first-pass scheduling fields and crew assignment foundation
- canonical appointments for site visits, estimate meetings, follow-up visits, and internal coordination on the same lead/customer/project chain
- invoices, payments, immutable payment events, and portal payment initiation
- snapshot-based invoice lineage across approved estimate snapshots, SOV rows, approved change-order snapshots, and invoice-only adjustments
- real contractor-side progress billing / schedule-of-values workflow on the canonical approved-estimate snapshot and invoice chain
- first read-only `/reports` surface for internal beta reporting basics:
  - lead pipeline, estimate status, invoice summary/aging, recent payment activity, and project readiness blockers
  - server-side tenant-scoped summaries over canonical `opportunities`, `estimates`, `invoices`, `payments`, and `projects`
  - Sales Tax Summary over canonical `invoice_tax_reporting_entries` / invoice tax snapshots, using invoice issue-date filtering, taxable sales, exempt sales, tax collected, invoice/payment status context, and customer exemption snapshot visibility
  - no reporting tables, exports, BI layer, mutations, tax filing, or tax-provider integration
- notification events, notifications, notification deliveries, and canonical communication threads/messages
- first shared universal-create launcher in the contractor shell and dashboard, routed through canonical Quick-Create flows
- first-login dashboard setup guidance and first-record empty-state actions for the lead -> customer -> project -> estimate startup path
- first real contractor-side global search in the protected header, grouped across canonical records and routing into the existing workspaces
- first real contractor-side notifications layer in the shared shell and dashboard, backed by stored canonical notification records and routing into real downstream workspaces
- seed-free internal QA workflow checklist for opportunity -> payment testing, linked-contact permission checks, communications checks, schedule filter checks, and canonical lineage regression watchlist
- first contractor-side communications surface at `/communications`, reading canonical threads/messages and stored unread notifications with a small safe reply composer plus safe read-triage on canonical per-user communication notifications
- `/communications` now also supports URL-driven filtering for status groups and supported source record types, plus text search over the loaded canonical thread labels and preview text
  - status and source filters now shape the server-side communications loader where safe, while text search remains the safe client-side fallback so URL behavior stays unchanged
  - supported source filters are currently customer, project, estimate, contract, invoice, change order, and payment only; unsupported queries such as `source=job` now show a small help state so job communications are not implied
  - selected threads now show a clearer chronological canonical message history with actor labels, timestamps, compact source context, and a stronger empty state
  - direct thread links now show unavailable-thread guidance when the requested thread is not visible in the current queue instead of silently falling back to another thread
  - reply and notification triage forms now handle the all-sources view safely and clarify that replies do not send email/SMS or trigger automation
- project and customer detail pages now include compact communication-context handoff cards that summarize canonical related threads and deep-link back into `/communications`
- project detail now also includes a compact production-schedule handoff card derived from canonical jobs and job assignments, surfacing schedule counts and next scheduled continuity while leaving scheduling actions in `/schedule`
- project detail next-action guidance now reads more like the operating hub: it uses existing estimate, contract, change-order, job, invoice/payment, and readiness state to surface the next supported action plus clearer blocker copy
- customer detail now also includes a compact production-schedule handoff card derived from canonical customer projects, jobs, and job assignments, surfacing customer-level schedule counts, next scheduled continuity, and project-aware handoff back into `/schedule`
- estimate detail now also includes a compact schedule-handoff card that stays blocked for draft/sent/rejected estimates and, once approved, derives project-level production counts, next scheduled continuity, and crew-state visibility only from canonical estimate `projectId`, project jobs, and job_assignments
- contract detail now also includes a compact schedule-handoff card derived only from canonical contract `projectId` plus canonical jobs and job_assignments, surfacing project-level production counts, next scheduled continuity, and crew-state visibility without introducing a contract/schedule bridge model
- invoice detail now also includes a compact linked-schedule handoff card derived only from canonical invoice `projectId` / optional `jobId` links plus canonical jobs and job assignments, so billed work can be read against current production state without introducing a billing-schedule bridge model
- phase-one lead-to-invoice CTA normalization is now live on dashboard, leads, estimate detail, and project detail; prefer the canonical labels `Start estimate`, `Send estimate`, `Approve estimate`, `Generate contract`, `Open progress billing`, and `Create invoice` in follow-up passes
- phase-two estimate-builder UI polish is now live on Estimate Editoror: the existing item-entry area is grouped into one clearer estimating-tools cluster, catalog insertion is more visible, manual item wording now clearly means catalog-backed estimate items, and import-from-another-estimate now supports real line-item import for same-organization source estimates into draft destination estimates only
- reusable estimate-content UI polish is now live across Estimate Editoror/detail and the existing defaults/block surfaces: scope / SOW, project details, terms, inclusions, and exclusions now read more clearly as reusable estimating content, defaults are framed as empty-state starting content only, and project-detail/content import is still called out honestly as later work
- reusable-content insertion is now unified inside Estimate Editoror with one shared inserter for Scope / SOW, Terms, Inclusion, and Exclusion blocks; it still uses the current content-block system, still appends into the active estimate, and still does not implement estimate-import or project-details import
- reusable-content import from another estimate is now also live for draft destination estimates only; Scope / SOW, Terms, Inclusions, and Exclusions append into the active estimate from same-organization source estimates only, while project-details/context import still remains out of scope
- estimate import UX now uses one shared source-estimate chooser in the estimating tools area; users pick a source once and then choose line-item or reusable-content import actions from the same compact panel, while all import guardrails and append-only behavior stay unchanged
- `/settings/workflows` now explains estimate defaults more clearly: Scope / SOW, Terms, Inclusions, and Exclusions are starting defaults for empty estimates only, reusable blocks still append on demand, estimate import still copies from a selected prior estimate, and contractor settings are framed as organization-owned defaults even when they began from platform starter defaults
- `/schedule` now also accepts an optional `projectId` query for project-detail handoff, filtering the same canonical jobs list by `jobs.project_id` while keeping existing `q`, crew, view, and action behavior intact
- `/schedule` now also shows a compact active-filter banner for project, search, crew, and selected job/action handoff state, with clear links that drop only that filter while preserving the rest of the current query context
- `/jobs` now also accepts and applies an optional `projectId` query, preserving project-scoped job handoff across status filters, search, and Quick-Create
- `/invoices` now preserves project, estimate, job, and deposit workflow query context across invoice filters/search so invoice creation from project or completed-job context stays tied to the same canonical source
- contract, invoice, change-order, and estimate detail pages now include the same compact communication-context handoff cards over canonical thread summaries
- first contractor-side automation readiness surface at `/settings/automation`, documenting automation concepts against real canonical settings, notifications, communications, scheduling, contracts, estimates, change orders, and payment foundations with readiness summary, missing dependencies, safe-next-build guidance, and recent canonical samples
- `/settings/automation` now saves notification-only automation preferences on the existing organization workflow settings row and includes a manual tenant-scoped runner:
  - supported triggers are customer message received, estimate awaiting approval, contract awaiting signature, and invoice overdue
  - eligible runs create canonical `notification_events` and per-user in-app `notifications`
  - `automation_runs` stores the audit/idempotency ledger for executed, blocked, skipped, and failed outcomes
  - no email/SMS/provider send, customer-facing message, queue/cron, or workflow mutation is performed
- `/settings/automation` now also shows a read-only eligibility preview/debug view so saved preferences can be compared against sample canonical event or record context
- `/settings/automation` now also shows static preview-only notification copy templates for supported future automation categories
  - intended recipients, trigger source, sample subject/body copy, and required canonical context fields are visible for planning
  - templates are not editable, not saved separately, and do not send anything
- `/settings/automation` now also shows a compact read-only automation build plan per category
  - each plan combines saved future preferences, one eligibility sample, and the static preview template definition
  - the plan does not save planner output or mutate canonical workflow records
- contractor dashboard now works as a denser command-center surface with operational metrics, modular queues, dashboard-local Quick-Create, and shortcuts back into shared Manager Pages
- Phase B validation found and fixed CF-parity blockers on dashboard and estimates:
  - contractor dashboard now promotes canonical open estimates, unpaid/overdue invoices, upcoming appointments, leads, active projects, and today/live jobs higher in the board
  - Estimates Manager Page (`/estimates`) now reads more like a CF-style estimating module landing page with recent client responses, pending approval, status breakdown, draft/approved/revision queues, and a denser estimate register
  - Add Estimate now starts from customer/account, then existing-or-new project, then estimate basics, with optional linked opportunity as upstream context only
  - project-launched estimate creation now derives the customer/project context before submit, linked lead/project handoffs preserve existing opportunity context, and create validation errors render inside the Add Estimate sheet instead of on the background page
  - direct `/estimates` creation with an existing customer project now reuses an opportunity already linked to that project when present, instead of creating duplicate upstream opportunity context
  - seed-free estimate QA fixed customer-detail blockers from older schema caches around related contacts/contact permissions and now shows connected estimates on the Customer Workspace
- contractor shell/header now carry breadcrumb and page-context continuity inside the unified top header instead of a separate blue-style page band
- shared contractor shell, Manager Page wrappers, Quick-Create surfaces, and common overview cards now broadly follow the newer black/gray/orange/white contractor theme instead of the older blue-heavy manager styling
- first real contractor-side module dashboards for payments and schedule on top of the shared Manager Page system
- the schedule manager now includes review-first summary metrics, next actions, crew-state continuity, and a real week/day/board calendar-planner layer on the same canonical jobs
- the board layout now groups the filtered canonical job set into operational timing lanes: unscheduled ready work, today, tomorrow, next 7 days, later scheduled, and in progress
- the `/schedule` action panel can now review and unassign crew directly on canonical `job_assignments`, and it blocks crew attachment until the job has a real schedule commitment
- first real contractor-side punchlist system on the shared project/job execution chain
- people, vendors, compliance, time tracking, daily logs, field notes, execution attachments
- contractor settings and super-admin foundations
- Cost Items Database Phase 1 foundation is present on the current branch:
  - `catalog_items` is the organization-scoped reusable cost item master for materials, labor, equipment, subcontractors, other items, and systems
  - no duplicate cost item table should be created; future workflows should extend or snapshot canonical `catalog_items`
  - `inventory_items` is optional stock tracking linked to catalog items where needed
  - `inventory_transactions` records auditable quantity movements
  - `/cost-items-database`, `/cost-items-database/items`, `/cost-items-database/inventory`, `/cost-items-database/systems`, and `/settings/catalogs` are the implemented contractor/admin surfaces
  - estimate and invoice calculations were intentionally left unchanged; line items continue to snapshot selected item data and historical estimates/invoices must not mutate when catalog items change
  - duplicate normalized catalog item name hardening is currently covered by server-helper checks plus a documented test plan and read-only duplicate report script, not automated tests
  - the existing item grid is the safe admin surface for catalog management; it now includes clearer reusable-cost-item empty-state copy without wiring the database into new estimate or invoice behavior

Current Directory-direction reminder:
- a future `Directory` workspace should unify contractor-facing account and contact browsing over canonical records
- customer entries in that future Directory remain full canonical customer/account records
- additional customer contacts remain related contacts beneath the canonical customer/account
- workforce people remain operational `people` records
- vendors remain vendor/company records, with vendor contacts as later related-contact work
- super admin remains platform-only and outside contractor Directory

## Stable Baseline

Treat these as current implementation guardrails:
- top-nav-first contractor shell
- shared Manager Page pattern
- shared Record Workspace pattern for detail pages; do not invent new page structures
- reuse existing context-card patterns and make every workflow page answer "What do I do next?"
- dashboard/header visual direction is now the styling reference point for the broader contractor app
- black/gray/orange/white contractor theme across shared shell and Manager Page surfaces; orange is the default primary action/active accent, blue is not a default contractor-app accent, and green/emerald is reserved for semantic statuses
- global search now lives at the shell level instead of as a dashboard placeholder
- punchlists are now real canonical execution records, not a dashboard placeholder
- appointments are now real canonical coordination records, not a dashboard placeholder
- progress billing / SOV is now real contractor-side billing workflow, not a dashboard placeholder
- Quick-Create -> canonical record -> full workspace
- project detail as the main readiness and continuity hub
- contractor and portal as two surfaces on the same system

## Product Direction

FloorConnector is not a collection of module apps.

Direction now locked in:
- one shared lifecycle system
- continuity over module silos
- dashboards are entry surfaces, not separate product worlds
- Quick-Create should be available broadly, but must always create canonical records

## Not Built Yet

Still intentionally not implemented:
- full dispatch-grade scheduling system
- deeper dispatch automation
- a fully finished page-by-page contractor reskin on every lower-traffic surface
- deeper AIA/pay-app export and reporting workflows beyond the current canonical progress-billing surface
- broader contractor-side send/reply UX on top of the canonical thread/message foundation
- broader contractor-side communications workflow depth beyond the first safe reply composer on `/communications`
- broader automation workflows beyond the first manual notification-only runner
- broader reporting / analytics beyond the first read-only `/reports` basics surface
- broad redesign work

## Next Build Phase

Primary focus for the next phase:
- run and record seed-free Phase B validation from [docs/phase-b-internal-validation-runbook.md](C:/FloorConnector/docs/phase-b-internal-validation-runbook.md)
- reporting and Sales Tax Summary accuracy checks
- manual automation duplicate-guard and recipient validation
- internal beta support/release checklist
- contractor onboarding runbook and beta candidate criteria

Goal:
- prove the current foundation before contractor beta, then fix only validation-blocking defects before adding more breadth

## Estimate Editoror Group-First Planning

Long-term Estimate Editoror workflow planning now lives at [docs/estimate-editor-group-first-refactor-plan.md](C:/FloorConnector/docs/estimate-editor-group-first-refactor-plan.md). This is planning only: no code, schema, invoice behavior, or estimate calculations changed. Current findings: the editor already has workspace `itemGroups`, line-level `group_name`, grouped customer-facing output, catalog insertion, system expansion, and previous-estimate import; however, catalog/system/import insertion does not yet target a selected group directly. Recommended direction is to make groups the primary authoring surface, move the permanent Catalog Items panel into a group-scoped Add Item drawer, and phase work through UI-only regrouping, group-level catalog add, group-level system/template add, previous-estimate reuse, and a later larger design/v0 pass.

## v0 UI Cleanup Brief

The next header/project/estimate UI cleanup brief now lives at [docs/v0-ui-cleanup-brief-header-project-estimate.md](C:/FloorConnector/docs/v0-ui-cleanup-brief-header-project-estimate.md). This is design/documentation only: no code, schema, estimate calculation, invoice behavior, catalog insertion behavior, or workflow changes. The brief covers responsive top-nav overflow while preserving the top-nav-first shell, searchable project Quick-Create customer selection, project detail contextual workspace navigation with financing status in readiness/financial context, context-aware estimate creation, long-term group-first Estimate Editoror direction, input formatting guidance, a ready-to-use v0 prompt, non-goals, and follow-up Codex implementation phases after design approval.

## Header Rollback Note

The attempted Phase 1 header/navigation implementation was rolled back because the result was not acceptable. The rollback removed the new inline primary-tabs/overflow behavior in `apps/web/components/protected-app-top-nav.tsx` and removed the added `Customers` item from `apps/web/lib/navigation/navigation-config.ts`, restoring the prior header menu behavior as closely as possible.

The rollback intentionally preserved the non-header Phase 1 improvements: project detail sectioning and readiness/financial placement, project Quick-Create searchable customer picker and validation-preservation, estimate Quick-Create context cleanup and create-new handoff, country combobox, phone helper copy, and `ZIP / postal code` labels. No schema, workflow, estimate calculation, invoice logic, or catalog behavior changed.

## v0 Visual Redesign Implementation Pass

The protected contractor app has a visual-only CF-inspired v0 pass implemented across the shared app shell, shared Manager Page primitives, leads/opportunities, estimates, invoices, Quick-Create sheets, and shared record/workspace chrome. The pass keeps the top-nav-first architecture, uses the grouped header menu instead of a permanent global sidebar, widens the working canvas, and moves the active visual language toward black/dark-gray framing, orange primary actions, white work surfaces, warm-neutral borders, flatter panels, denser registers, and calmer table/list styling.

Behavior intentionally unchanged: routes, data loading, auth, permissions, create/update actions, opportunity/customer/project/estimate/invoice workflow rules, estimate calculations, invoice calculations, catalog insertion logic, schemas, migrations, and persistence. Existing Quick-Create flows still create canonical records first and hand off into full workspaces.

Non-visual follow-up items discovered: several lower-traffic Manager Pages still contain older blue-accent utility styling and should be visually normalized in a separate scoped pass; no new behavior should be added to close that gap.

## Visual Bugfix Review Follow-Ups

Latest v0/CF-inspired visual review pass stayed visual/UI-only. No schema, migration, auth, workflow, estimate calculation, invoice calculation, or catalog insertion behavior was changed.

Directory visual audit completed:
- `/directory` render path was traced to `apps/web/app/(app)/directory/page.tsx`, `apps/web/components/contractor-workspace-page.tsx`, `apps/web/components/workspace-command-bar.tsx`, and the empty-state fallback in `apps/web/components/app-empty-state.tsx`.
- `/directory` now opts into the shared workspace header's dark FloorConnector/CF-inspired header tone, keeps the page read-only, and uses existing customer, related-contact, workforce, vendor, and opportunity data only.
- Confirmed stale accent cleanup in the active Directory render path: `AppEmptyState` no longer uses the older `brand-*` empty-state accent when Directory filters return no records.
- Directory search, filters, summary panels, helper panels, status badges, and register rows were visually tightened with warm neutral, black/gray, and orange accents. No routes, actions, permissions, data loading, workflows, or canonical models changed.

Confirmed non-visual follow-up:
- Invoice creation can still be blocked by the existing commercial-readiness guard when the project does not have the required signed-contract and deposit/financing readiness state. This is expected business behavior, not a visual regression. Next validation should use a project that has completed the signed-contract/readiness prerequisites, then verify deposit, completed-job, approved-estimate, and approved-change-order invoice creation paths end to end.

Confirmed behavior issue addressed in this pass:
- Change-order invoice Quick-Create context could be lost when entering `/invoices` with only `changeOrderId` or while moving through invoice manager filters. The UI now resolves the change order's project context and preserves `changeOrderId` across the invoice create sheet and manager links.

## Account Menu / Profile Settings Follow-Up

Profile / Account Settings surface added:
- `/settings/profile` now provides a protected personal account settings surface using the existing Supabase auth user, canonical `public.users` profile extension, and active organization membership context.
- The top-right account menu now links to `Profile / Account settings` while preserving Organization settings, Settings home, and the existing sign-out action.
- The profile page is read-only because this pass found the canonical profile table and self-update RLS, but no existing app-level personal profile update action/helper wired for safe editing.
- Existing organization settings remain admin-gated; the settings layout can render the personal profile page for active members, and admin-only settings pages continue to require organization owner/admin scope.

Confirmed non-visual follow-up:
- Add an explicit personal profile update action only after the intended editable fields, validation rules, and auth/profile sync behavior are approved.

## Black / Gray / Orange Palette Direction

Visual-only contractor-app palette update completed:
- FloorConnector's preferred contractor-app palette is black / gray / orange / white.
- Shared brand tokens now point to the warm orange action palette instead of green/teal, so existing `brand-*` buttons, links, checkboxes, and focus rings resolve to the approved accent direction.
- Shared shell, workspace/sidebar chrome, settings navigation, empty states, and manager headings were normalized away from prior dark-green and bluish heading values.
- Blue remains disallowed as a default contractor-app accent. Green/emerald remains allowed only for semantic success, approved, paid, or completed statuses.
- This pass was visual-only: no workflow, route, schema, auth, permission, estimate, invoice, catalog, calculation, or persistence behavior changed.

## System-Wide Palette Standardization

Visual-only system-wide palette standardization completed:
- Official contractor-app palette is black / gray / orange / white.
- Shared contractor shell, top navigation, workspace/page wrappers, command bars, manager cards, tables/registers, composer sheets, settings surfaces, forms, inputs, empty states, and document rendering styles were audited for stale blue/green/teal/violet utility accents.
- Confirmed non-semantic blue, sky, cyan, indigo, teal, violet, navy, and blue-tinted neutral accents were removed from the protected app/shared contractor component scan.
- Orange is the default primary action, active, highlight, and focus accent. Near-black/dark gray drives chrome and strong headings. White/off-white and warm gray drive work surfaces, borders, and dividers.
- Green/emerald is reserved for semantic success, approved, paid, or completed states. Red/rose remains destructive/error/blocked. Amber remains warning/pending/prerequisite-needed.
- This pass was visual-only: no workflow, route, schema, auth, permission, estimate, invoice, catalog, calculation, or persistence behavior changed.

## Post Visual System Audit

Documentation + functionality checkpoint completed in [docs/post-visual-system-audit.md](C:/FloorConnector/docs/post-visual-system-audit.md). The audit confirms the canonical lifecycle, `catalog_items` source-of-truth rule, estimate catalog snapshot insertion, invoice readiness guardrails, read-only `/settings/profile`, account menu wiring, and visual/layout passes remain aligned with the current implementation. Audit-only changes were made; no app code, schema, workflow, auth, permission, estimate, invoice, catalog, calculation, styling, or data behavior changed in this pass.

Confirmed follow-up from that audit has now been completed: stale current-state wording around estimate creation context was corrected, and invoice catalog wording now distinguishes implemented invoice-only manual catalog-backed adjustments from forbidden normal-scope catalog-to-invoice billing.

## Audit Documentation Corrections

Post-audit documentation corrections are complete. [docs/current-state.md](C:/FloorConnector/docs/current-state.md) now reflects the implemented estimate creation behavior: project-launched estimates pre-populate and lock the project and derived customer, global estimate creation requires customer plus project selection or creation, and validation preserves entered values. Invoice catalog language was clarified across current-state, developer source of truth, workflows, and the catalog-to-estimate/invoice spec: `catalog_items` remains canonical, estimate catalog insertion is implemented, invoice catalog usage is limited to explicit invoice-only manual catalog-backed adjustments, and free catalog insertion as normal invoice scope remains disallowed.

## Playwright E2E Browser QA Path

Focused Playwright browser QA infrastructure was added for protected contractor flows, starting with Phase B estimate-editor group-targeted catalog insertion. This is test infrastructure only: no app behavior, schema, auth/RLS, workflow, estimate calculation, invoice behavior, or catalog insertion logic changed.

- Playwright config now lives at [playwright.config.js](C:/FloorConnector/playwright.config.js).
- Auth setup lives at [e2e/auth.setup.js](C:/FloorConnector/e2e/auth.setup.js) and uses a real local contractor account through the normal `/login` flow when `FLOORCONNECTOR_E2E_EMAIL` and `FLOORCONNECTOR_E2E_PASSWORD` are provided. Credentials are not hardcoded.
- The focused estimate spec lives at [e2e/estimate-group-catalog-insertion.spec.js](C:/FloorConnector/e2e/estimate-group-catalog-insertion.spec.js). It requires a safe draft estimate id/path and active non-system catalog item names supplied via environment variables.
- Minimal non-user-facing test ids were added to the Estimate Editoror group, group add-item, catalog search/select/add, catalog preview, and line-item row surfaces so browser QA can use DOM selectors instead of fragile coordinate clicks.
- Running instructions live at [docs/e2e-browser-qa.md](C:/FloorConnector/docs/e2e-browser-qa.md).

Dependency repair / validation status:
- The previous install issue was caused by stale running FloorConnector dev-server processes locking native `next` and `turbo` files while pnpm tried to reconcile `node_modules`.
- The local dependency tree was repaired by stopping only those FloorConnector dev-server process trees, removing workspace `node_modules` artifacts, and rerunning `pnpm install --config.offline=false --reporter=append-only`.
- Playwright is installed (`pnpm exec playwright --version` reports 1.59.1), and Chromium was installed with `pnpm exec playwright install chromium`.
- Validation now passes: `pnpm typecheck`, `pnpm lint`, and `git diff --check` all complete successfully. `git diff --check` reports line-ending warnings only.
- Playwright spec discovery works with the web server disabled: `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test --list` lists the two focused estimate group-catalog tests.
- Authenticated e2e execution still requires local-only setup: saved auth state or `FLOORCONNECTOR_E2E_EMAIL` / `FLOORCONNECTOR_E2E_PASSWORD`, plus `FLOORCONNECTOR_E2E_DRAFT_ESTIMATE_ID` or path and active non-system catalog item names.

## System Rules

Keep these short rules in mind:
- no duplicate business models
- no portal-only copies of shared records
- no module-local silos
- workflow, lifecycle, creation-logic, or canonical-relationship changes must update relevant docs in the same change set, as applicable: `docs/developer-source-of-truth.md`, `docs/current-state.md`, and/or `docs/workflows.md`
- dashboards must point back into the shared chain
- Quick-Create must hand off into full workspaces
- project / shared record continuity stays more important than module completeness
