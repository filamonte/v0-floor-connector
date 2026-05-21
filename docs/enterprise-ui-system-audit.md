# Enterprise UI System Audit

Status: Active
Doc Type: UI / QA Audit

This note records the 2026-05-15 enterprise visual-system audit pass. It is a presentation-layer audit only. It does not authorize schema changes, RLS changes, auth changes, payment/signature behavior changes, portal access changes, document-storage changes, or new business workflows.

## Baseline

Estimates remain the tuning fork for the secured contractor app:

- proposal-first record clarity
- compact headers and dense manager rhythm
- shared `DetailPageHeader`, `DetailPanel`, `LinkedRecordCard`, `ManagerDashboardCard`, `StandardWorkspaceLayout`, `ActionBar`, `WorkflowBar`, and shared status helpers
- Graphite / Copper / white / warm-neutral surfaces
- copper for primary action emphasis, not passive status
- green only for accepted/complete/paid/signed outcomes
- red only for destructive, error, blocked, declined, rejected, or void states
- amber for warning, waiting, prerequisite, or attention states
- neutral graphite/warm gray for draft, metadata, in-progress utility, current, already assigned, advisory, and read-only review states

## Route Classification

Classification is based on repo inspection and the current shared UI pattern docs. Authenticated browser QA must still confirm protected rendering before a route is counted as manually reviewed.

| Surface                     | Routes                                                                                                                                                                                                                                                                                                                   | Classification                             | Notes                                                                                                                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Contractor manager spine    | `/dashboard`, `/leads`, `/customers`, `/projects`, `/estimates`, `/contracts`, `/invoices`, `/payments`, `/jobs`, `/schedule`, `/people`                                                                                                                                                                                 | matches estimate-led system                | Current implementation uses shared manager/workspace rhythm closely enough to remain the baseline.                                                                                                                       |
| Contractor detail spine     | `/leads/[leadId]`, `/customers/[customerId]`, `/projects/[projectId]`, `/estimates/[estimateId]`, `/contracts/[contractId]`, `/invoices/[invoiceId]`, `/jobs/[jobId]`                                                                                                                                                    | matches estimate-led system                | Detail pages share compact headers, semantic badges, connected-record cards, context rails, and progressive disclosure. Contract/change-order local status helpers were normalized to the shared UI helper in this pass. |
| Estimate Editor             | `/estimates/[estimateId]/edit`                                                                                                                                                                                                                                                                                           | matches estimate-led system                | Uses `StandardWorkspaceLayout`, compact copper save/action treatment, and shared status helpers.                                                                                                                         |
| Change orders               | `/change-orders`, `/change-orders/[changeOrderId]`                                                                                                                                                                                                                                                                       | minor visual drift fixed                   | Local status badge helpers duplicated the shared badge system; replaced with `@floorconnector/ui` helper.                                                                                                                |
| Settings                    | `/settings` plus `/settings/admin`, `/settings/automation`, `/settings/catalogs`, `/settings/financial`, `/settings/modules`, `/settings/operational-intelligence`, `/settings/organization`, `/settings/profile`, `/settings/selected-systems`, `/settings/system-layers`, `/settings/templates`, `/settings/workflows` | matches with minor watch items             | Settings use shared settings cards/layout. Keep admin/config panels compact and avoid route-local color systems.                                                                                                         |
| Setup                       | `/setup/company`, `/setup/billing`, `/setup/pending-activation`                                                                                                                                                                                                                                                          | matches with minor watch items             | Setup remains a real onboarding flow, not a marketing surface. Stripe/setup controls must stay honest and non-mutating unless explicitly scoped.                                                                         |
| Directory                   | `/directory`                                                                                                                                                                                                                                                                                                             | minor visual drift                         | Route intentionally reads as an index and already uses warm graphite/copper tones; future polish should reduce remaining hardcoded color literals by folding into shared tokens.                                         |
| Cost Items Database         | `/cost-items-database` and subroutes                                                                                                                                                                                                                                                                                     | matches with minor watch items             | Uses workspace pattern; keep as operational workspace and avoid a separate module shell.                                                                                                                                 |
| Super-admin home/governance | `/super-admin`, `/super-admin/admin`, `/super-admin/platform`, `/super-admin/modules`, `/super-admin/catalogs`, `/super-admin/templates`, `/super-admin/packages` and package detail routes                                                                                                                              | matches with minor drift fixed             | Super-admin keeps slate/black administrative hierarchy. Generic sky/indigo informational badges in package assignment details were normalized to neutral graphite treatment.                                             |
| Super-admin early access    | `/super-admin/early-access`                                                                                                                                                                                                                                                                                              | matches with minor watch items             | Must remain founder readiness/activation review, not the durable billing console.                                                                                                                                        |
| Super-admin billing         | `/super-admin/billing`                                                                                                                                                                                                                                                                                                   | matches estimate-compatible admin system   | Billing Operations is a durable operator console. Keep manual evidence, Stripe references, webhook health, and activation separation visually distinct.                                                                  |
| Super-admin groups          | `/super-admin/groups`                                                                                                                                                                                                                                                                                                    | minor visual drift fixed                   | Generic sky/violet review states and blue information panels were normalized to neutral graphite/amber semantics.                                                                                                        |
| Portal home/project/review  | `/portal`, `/portal/projects/[projectId]`, `/portal/estimates/[estimateId]`, `/portal/contracts/[contractId]`, `/portal/invoices/[invoiceId]`, `/portal/change-orders/[changeOrderId]`                                                                                                                                   | matches with minor watch items             | Portal is customer-safe and simpler than contractor pages. Existing portal review components use shared status badges and warm-neutral panels.                                                                           |
| Portal invite               | `/portal/invite`                                                                                                                                                                                                                                                                                                         | matches with auth-sensitive QA requirement | Must be reviewed without exposing invite tokens. Do not count unauthenticated redirects as portal review success unless the route intentionally tests invite onboarding.                                                 |
| Print/save documents        | contractor `/estimates/:id/pdf`, `/contracts/:id/pdf`, `/invoices/:id/pdf`; portal `/portal/estimates/:id/pdf`, `/portal/contracts/:id/pdf`, `/portal/invoices/:id/pdf`                                                                                                                                                  | matches                                    | Browser print/save views use canonical records and shared customer document presentation. Keep branded, customer-facing, and non-storage-source-of-truth.                                                                |
| Public/auth-adjacent        | `/login`, `/signup`, `/forgot-password`, `/update-password`, marketing root                                                                                                                                                                                                                                              | out of scope/deferred                      | These are adjacent surfaces. They should stay brand-aligned but are not secured app workspace surfaces.                                                                                                                  |

## Drift Sources Found

- Local status badge helpers in contract and change-order workspaces duplicated the shared status helper.
- Super-admin package/group review surfaces used sky/indigo/violet as generic information colors.
- Some older routes still contain hardcoded warm color literals; most are compatible with Graphite/Copper but should migrate to shared variables opportunistically.
- Portal pages still have some large `rounded-2xl` card treatment. This is acceptable for customer-facing review today, but should not spread into dense contractor manager/admin surfaces.
- Global decorative gradients remain in `globals.css` from the accepted Graphite & Copper shell. Do not add new route-local gradients unless a future visual system doc explicitly approves them.

## Fixes Applied In This Pass

- Replaced local contract and change-order status helpers with `getStatusBadgeClassName` from `@floorconnector/ui`.
- Replaced generic sky/indigo/violet informational styling in super-admin package/group proposal surfaces with neutral graphite/warm-gray treatment or amber when metadata is missing.
- Preserved semantic green/red/amber usage where it represents success, blocked/error, or warning/prerequisite states.

## Remaining Visual Watch List

- Continue migrating hardcoded warm hex colors in Directory and older workspace utilities to shared variables when those files are next touched.
- Consider a later small portal density pass if authenticated customer QA shows cards feeling oversized on mobile.
- Keep setup and billing pages visually calm and honest; do not make Stripe readiness controls look like customer payment success.
- Keep super-admin pages dense and scannable; do not turn platform governance into contractor workflow chrome.

## 2026-05-16 Shared Polish Addendum

This pass reviewed the existing secured-app audit against the current shared UI primitives and applied a presentation-only cleanup to the reusable components that shape many protected routes.

Pattern issues grouped by system area:

- Manager and module command surfaces still had a few older cool-gray literals and square command-strip treatment that felt less aligned with the current Graphite/Copper workspace system.
- Summary bands and empty states were mostly consistent, but had uneven spacing, older warm hex literals, and weaker wrapping/focus behavior on compact screens.
- Detail panels were slightly roomier than the current enterprise density target and used wider uppercase tracking than surrounding workspace headings.
- Portal review cards were intentionally customer-facing, but the larger rounded-card treatment could feel more consumer than enterprise when repeated across review surfaces.
- Protected surface headers needed safer wrapping for long authenticated email addresses.

Presentation-only cleanup applied:

- Re-centered `WorkspaceCommandBar`, `WorkspaceSummaryBand`, `AppEmptyState`, `DetailPanel`, `ManagerDashboardCard`, `ProtectedSurfaceHeader`, and portal review class constants on shared CSS variables, tighter enterprise density, safer wrapping, and explicit focus-visible treatment where useful.
- Reduced portal review panel rounding and padding slightly while preserving customer-safe review language and action hierarchy.
- Kept the existing top-nav contractor shell, Manager Page rhythm, Record Workspace grammar, portal access model, and super-admin separation unchanged.

No schema, migration, RLS, auth, route protection, server-action contract, financial calculation, payment, signature, readiness, portal-access, or canonical lifecycle behavior changed in this pass.

## 2026-05-16 Page-Level Polish Addendum

Phase 2 reviewed representative secured routes that consume the shared primitives from the prior pass and made targeted presentation-only page improvements where route-local markup still drifted from the Graphite/Copper enterprise rhythm.

Surfaces reviewed in code:

- Contractor app: `/projects`, project detail component usage, `/settings/admin`, `/settings/financial`, and shared app module placeholders used by unavailable module surfaces.
- Portal: `/portal` and `/portal/projects/[projectId]`, with follow-through against the shared portal review primitives.
- Super-admin: `/super-admin` and module-control surface patterns.

Page-level issues found:

- `/projects` still had older hardcoded border, graphite, table header, and filter-chip styling even though it already used the shared manager page shell.
- Portal home/project pages consumed the shared primitives but overrode summary-band and metric cards with larger slate `rounded-2xl` treatment, making the customer workspace feel slightly separate from the refreshed portal review system.
- Settings admin and financial pages still had older large-radius slate cards, broad focus rings, and local hex table/form styling that felt less like the current admin console.
- Super-admin overview summary cards were already tokenized but still used the larger rounded-card language from earlier settings surfaces.

Presentation-only cleanup applied:

- Re-centered `/projects` summary cards, filters, primary action, and recent-record table on shared warm borders, graphite action treatment, and highlight table headers.
- Added a portal metric panel class and moved portal home/project summary consumers away from route-local slate cards and custom summary-band overrides.
- Tightened settings admin membership cards, workflow-error panels, role controls, and financial tax-code controls/tables to the same compact admin-console rhythm.
- Reduced shared app module placeholder chrome so unavailable module surfaces inherit the refined `AppEmptyState` instead of wrapping it in a larger decorative shell.
- Normalized super-admin overview internal metric cards from large rounded panels to compact platform-console cards.

Deferred polish queue:

- `/schedule` remains the largest route-local visual-drift surface and should receive its own focused pass because it is a large operational workspace with many calendar, crew, appointment, and job sections.
- Deeper settings subroutes such as organization, operational intelligence, catalogs, modules, and selected systems still contain older slate form classes and should be migrated opportunistically.
- Portal estimate, contract, invoice, and change-order review pages already benefit from the shared portal constants, but authenticated visual QA should confirm whether any review-specific sections still feel oversized.
- Older adjacent routes like appointments, daily logs, punchlists, directory, and vendor/people utilities still contain local hardcoded classes and should follow after the strategic buyer-demo surfaces.

No schema, migration, RLS, auth, route protection, tenant-boundary, server-action contract, financial calculation, payment, signature, readiness, portal-access, or canonical lifecycle behavior changed in this pass.

## 2026-05-16 Phase 3 Schedule / Settings Polish Addendum

Phase 3 focused on the remaining drift surfaces called out after the page-level pass: `/schedule`, deeper contractor settings subroutes, and unavailable-module treatment. The pass stayed presentation-only and did not alter scheduling behavior, server actions, form payloads, feature-policy persistence, or settings validation.

Surfaces reviewed in code:

- Contractor schedule: `/schedule`, including summary cards, command filters, active-filter context, schedule-control queues, calendar planner, schedule list, and the inline schedule/crew action panel.
- Contractor settings: `/settings/organization`, `/settings/modules`, and `/settings/operational-intelligence`.
- Shared placeholder: `AppModulePlaceholder` was re-checked and left unchanged because the Phase 2 treatment already aligns unavailable modules with the enterprise empty-state system.

Page-level issues found:

- `/schedule` still carried the most route-local visual drift: hardcoded graphite/copper hex values, cool-blue appointment surfaces, large inconsistent panel separators, older filter-chip treatment, and action-panel cards that felt less deliberate than the newer manager/detail rhythm.
- Schedule day/week/board views were behaviorally correct, but their visual hierarchy made unscheduled work, today/upcoming work, crew state, appointment metadata, and continuity links feel more like adjacent lists than one dispatch-manager surface.
- `/settings/organization` still used older large-radius form fields, broad brand focus rings, and slate notice treatment.
- `/settings/modules` had tenant override controls with older rounded/slate treatment that felt softer than the platform-policy boundary it represents.
- `/settings/operational-intelligence` used large floating cards and slate form panels, which made deterministic guidance controls feel more decorative than admin-console-like.

Presentation-only cleanup applied:

- Added route-local schedule class constants for primary/secondary/muted actions, panels, panel headers, inset panels, and search fields so the large schedule route now follows the Graphite/Copper rhythm without a one-off color system.
- Normalized schedule filters, active-filter panels, schedule-control queues, planner sections, appointment/job cards, visible-work list headers, and the selected-job action panel to warm borders, compact rounded corners, neutral highlight surfaces, and graphite primary actions.
- Preserved existing inline schedule and crew-assignment action behavior, links, query params, hidden inputs, server actions, and job/appointment read-model usage.
- Tightened organization profile settings fields and notices to compact admin-console form treatment while preserving all field names and submitted values.
- Refined module override cards and operational-intelligence rule/default cards with compact borders, shared token colors, and calmer warnings about guidance-only behavior.

Remaining polish queue:

- `/schedule` is now aligned enough for the current enterprise system, but a future visual QA pass should inspect real seeded data across day/week/board modes to catch density edge cases in long crew/vendor names.
- Settings subroutes still worth a later opportunistic pass: `/settings/catalogs`, `/settings/selected-systems`, `/settings/templates`, `/settings/workflows`, `/settings/profile`, and `/settings/automation`.
- Adjacent operational surfaces still on the later queue: appointments, daily logs, punchlists, directory, vendors/people utilities, and older cost-item utility screens.
- Portal estimate/contract/invoice/change-order review pages still benefit from shared portal primitives, but authenticated visual QA should confirm no review-specific sections remain oversized.

No schema, migration, RLS, auth, route protection, tenant-boundary, server-action contract, form-payload, financial calculation, payment, signature, readiness, scheduling behavior, portal-access, or canonical lifecycle behavior changed in this pass.

## 2026-05-16 Phase 4 Settings Completion Addendum

Phase 4 completed the highest-drift settings queue from Phase 3 and kept the change set focused on tenant admin-console polish. The pass stayed presentation-only and did not alter catalog, template, selected-system, workflow-default, organization-profile, automation-planning, server-action, validation, persistence, entitlement, or lifecycle behavior.

Surfaces reviewed in code:

- Settings catalogs: `/settings/catalogs`, `CostItemsSettingsContent`, and catalog item settings cards.
- Settings templates: `/settings/templates` and shared document template settings cards.
- Settings workflows: `/settings/workflows`.
- Settings profile: `/settings/profile`.
- Settings selected systems: `/settings/selected-systems`.
- Settings automation: `/settings/automation`.

Page-level issues found:

- Catalog and template editors still used oversized rounded form panels, broad brand focus rings, and softer slate shells that felt older than the current Graphite/Copper admin-console rhythm.
- `/settings/workflows` mixed compact settings content with older large-radius controls and notice panels, which weakened the hierarchy between enforceable preferences and explanatory guidance.
- `/settings/profile` still carried route-local warm hex styling instead of shared CSS variables, making account context feel visually separate from the rest of settings.
- `/settings/selected-systems` had the right admin-only boundaries, but selected-system records, create panels, metadata rows, and form controls used older hardcoded border/action classes.
- `/settings/automation` was honest about manual notification-only behavior, but its planning cards, warning panels, run-log cards, and preference controls were more decorative and rounded than the refined admin-console system.

Presentation-only cleanup applied:

- Added compact local settings constants in the catalog, template, workflow, selected-systems, profile, and automation settings consumers so repeated forms/cards now share warm borders, graphite primary actions, copper-hover secondary actions, tighter corners, and consistent focus-visible rings.
- Tightened catalog item and document template edit/adoption panels while preserving every hidden input, form name, action target, archive/default/adoption behavior, and starter-versus-organization-owned distinction.
- Normalized workflow defaults, guidance choices, AI preference placeholders, estimate-default notices, and numbering fields to compact admin panels without changing enforcement or saved preference semantics.
- Reworked profile account/context cards onto shared variables and retained the read-only profile-editing warning.
- Refined selected-system details, create panels, status/primary controls, and metadata blocks while preserving admin-only selected-system validation and all linked canonical record fields.
- Reduced automation planning, manual-run, preview, preference, eligibility, and category cards to calmer enterprise panels while keeping manual notification-only and future-planning language explicit.

Remaining polish queue:

- Settings is now largely aligned enough for the current enterprise system. Future work should be seeded visual QA rather than another broad settings sweep.
- Adjacent operational utility surfaces remain the next visual queue: appointments, daily logs, punchlists, directory, vendors/people utilities, older cost-item utility screens, and any unavailable-module surfaces discovered during route QA.
- Portal estimate/contract/invoice/change-order review pages still need authenticated visual QA with real grants to confirm no review-specific section remains oversized.
- `/schedule` should get seeded browser QA for long crew/vendor/customer/project names, but no further code polish was needed in this phase.

No schema, migration, RLS, auth, route protection, tenant-boundary, server-action contract, form-payload, validation, entitlement, settings persistence, catalog, template, selected-system, workflow, financial, payment, signature, readiness, scheduling behavior, portal-access, fake-unavailable-module, or canonical lifecycle behavior changed in this pass.

## 2026-05-16 Phase 5 Graphite / Copper Lock-In Addendum

Phase 5 stopped the rolling page-polish sequence and locked the current enterprise UI language into a durable implementation reference: [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md). This pass was documentation-first and did not perform another route-by-route redesign.

Design-system audit summary:

- Stable system areas: top-nav-first contractor shell, Manager Page rhythm, Record Workspace grammar, compact settings/admin panels, customer-safe portal review panels, platform-console super-admin treatment, unavailable-module empty states, warm borders, graphite primary/admin actions, copper action emphasis, semantic status colors, and authenticated QA rules.
- Repeated patterns identified: admin field, panel, inset, notice, primary action, secondary action, portal review/metric panel, schedule panel/action, and muted status class patterns.
- Centralization decision: no code constants were centralized in this pass because the existing local constants vary slightly by surface, and a helper extraction would create broad churn across an already active visual branch. The patterns are documented first so future refactors can consolidate narrowly when the helper boundary is obvious.
- Documentation added: purpose, product posture, app-area distinctions, shared primitives, layout patterns, action hierarchy, card/panel hierarchy, status rules, copy rules, implementation rules, centralization guidance, and future PR checklist.

Remaining visual queue:

- Treat Graphite / Copper as the baseline for future UI work rather than reopening broad normalization decisions.
- Use seeded authenticated visual QA for `/schedule`, portal review pages, and operational utility screens before any new broad polish pass.
- Future optional helper extraction should be small and presentation-only, likely starting with admin field/action/panel class constants if several settings routes are touched again.

No schema, migration, RLS, auth, route protection, tenant-boundary, server-action contract, form-payload, validation, entitlement, settings persistence, catalog, template, selected-system, workflow, automation, financial, payment, signature, readiness, scheduling behavior, portal-access, fake-unavailable-module, or canonical lifecycle behavior changed in this pass.

## Authenticated QA Requirement

Protected visual QA is not complete unless each route is loaded with the correct role:

- contractor app routes: contractor auth storage state
- super-admin routes: platform-admin/super-admin auth storage state
- portal routes: portal customer auth storage state plus canonical portal grants

Routes that land on `/login`, access denied, setup gates, or missing-fixture pages must be reported as inaccessible or skipped for that role instead of counted as reviewed.
