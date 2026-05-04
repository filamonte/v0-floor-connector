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

## Decision-First UI Refactor Final Documentation Phase 14

Phase 14 completed as documentation and safe cleanup for the implemented decision-first UI refactor. No UI redesign, backend, schema, auth, RLS, server-action, data-model, route, or workflow changes were made.

Docs changed:
- `docs/current-state.md`
- `docs/ui-patterns.md`
- `docs/chat-handoff.md`
- `packages/ui/README.md`

Cleanup performed:
- Updated `docs/current-state.md` only where implemented UI behavior materially changed, replacing the stale latest UI direction note that still described unresolved clarity gaps.
- Created `docs/ui-patterns.md` as the current pattern guide for decision-first page structure, `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, status color semantics, the orange CTA rule, Manager/List Page guidance, and portal/super-admin differences.
- Added `packages/ui/README.md` to document exported decision-first components, shared status helpers, theme exports, and package guardrails.
- Added this final Phase 1-14 summary to `docs/chat-handoff.md`.
- No docs or components were removed; the export/reference inventory did not show a clearly obsolete component that was safe to delete.

Validation:
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings.
- `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test --list` passed and listed 19 tests.
- Targeted decision-first primitive Playwright test passed: `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/ui-primitives.spec.js --project=chromium-public`.
- Protected detail smoke tests were not rerun in Phase 14 because localhost was not running and this phase changed documentation/package docs only; the Phase 13 authenticated targeted run remains the latest protected decision-first smoke evidence.

Final Phase 1-14 summary:
- Phase 1 established shared `@floorconnector/ui` foundation pieces: theme constants, `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, `PrimarySection`, `SecondarySection`, and shared semantic status helpers.
- Phase 2 added contractor layout section wrappers for core workflow, execution, and support sections.
- Phase 3 captured the pre-refactor audit in `docs/ui-refactor-audit.md`.
- Phases 4-9 refactored the main contractor decision surfaces: dashboard, Project Workspace, Estimate Workspace, Invoice Workspace, Job Workspace, and Contract Workspace.
- Phase 10 cleaned up Projects, Estimates, Invoices, Jobs, Contracts, and Customers Manager Pages without changing their actions, filters, search, quick-create, or workflows.
- Phase 11 polished shared contractor UI components so cards, badges, headings, list rows, and orange CTA usage are more consistent.
- Phase 12 audited and then safely cleaned up portal/super-admin UI consistency without copying contractor ActionBar/WorkflowBar patterns or touching access/permission/workflow behavior.
- Phase 13 added targeted Playwright smoke coverage for shared primitives, dashboard PriorityStrip, and project/estimate/invoice/job/contract decision-first fixtures.
- Phase 14 documented the implemented UI baseline and package exports.

Deferred items:
- No broad visual snapshot suite was added.
- No mutation workflow tests were added for approve/send/sign/schedule/payment flows.
- No portal/super-admin structural redesign was started.
- No target IA or architecture docs were changed because their guidance was not materially stale.

## UI Refactor Testing Expansion Phase 13

Phase 13 completed as a tests-only expansion for the decision-first UI system. No UI redesign, backend, schema, auth, RLS, server-action, data-model, route, or workflow changes were made.

Files changed:
- `e2e/ui-primitives.spec.js`
- `e2e/detail-workspace-ui.spec.js`
- `e2e/dashboard-ui.spec.js`
- `playwright.config.js`
- `docs/chat-handoff.md`

Tests added or updated:
- Added isolated public Playwright coverage for shared UI primitives: `ActionBar`, `WorkflowBar`, and `ProjectStateSummary`, including console error capture.
- Added authenticated dashboard smoke coverage for the PriorityStrip surface.
- Added authenticated project detail and estimate detail smoke coverage for decision-first regions.
- Added authenticated invoice detail smoke coverage for:
  - `/invoices/7598e4ef-f875-4543-93fb-d2d846896ed7`
  - `/invoices/c9131b30-dea7-45a5-b476-8ba2bf3fc502`
  - `/invoices/894d1e3a-c3f2-4572-869b-545f00aef027`
- Added authenticated job detail smoke coverage for:
  - `/jobs/acd2daf7-0d02-4196-99d2-1a4164095886`
  - `/jobs/7a99c1a5-b658-4f46-8328-e73a8f5966c4`
  - `/jobs/e1fff7e6-7823-4a9a-80f3-358ea16f5e80`
- Added authenticated contract detail smoke coverage for:
  - draft `/contracts/a0ce5ce7-a305-48f8-bda3-d6e8e5a171c8`
  - sent `/contracts/7d7b34bd-872a-4831-846b-6c99f500211f`
  - signed `/contracts/d31947d6-8879-4d91-a0c5-bc45165c47a4`
- Updated dashboard smoke coverage to assert the projects navigation entry is visible without relying on a brittle broad-text click.
- Updated Playwright project matching so public primitive tests stay public and protected decision-first smoke tests run only under authenticated protected coverage.

Fixtures required:
- Invoice, job, and contract fixtures listed above.
- Project detail fallback: `/projects/797ec5b1-4417-4a36-934e-e82498efef5a`, overrideable with `FLOORCONNECTOR_E2E_PROJECT_DETAIL_PATH`.
- Estimate detail fallback: `/estimates/a58c10b5-9b3b-4c1a-a03b-44e3cdaa1c5e`, overrideable with `FLOORCONNECTOR_E2E_ESTIMATE_DETAIL_PATH`.
- Authenticated Playwright storage from `e2e/auth.setup.js` using the existing `FLOORCONNECTOR_E2E_EMAIL` and `FLOORCONNECTOR_E2E_PASSWORD` credentials.

Validation:
- `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test --list` passed; 19 tests listed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm e2e:auth` passed.
- Targeted Phase 13 Playwright run passed: `PLAYWRIGHT_BASE_URL=http://localhost:3000 PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test e2e/ui-primitives.spec.js e2e/dashboard-ui.spec.js e2e/project-detail-ui.spec.js e2e/detail-workspace-ui.spec.js --project=chromium-public --project=chromium-protected --no-deps` reported 14 passed.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings.

Deferred coverage:
- Mutation workflows remain intentionally out of scope: approve/send/sign/schedule/unschedule/payment actions were not exercised.
- Portal and super-admin test expansion remains deferred.
- Visual snapshot and style-only assertions remain deferred; Phase 13 uses resilient role/text checks and console/error capture.

## Portal And Super-Admin UI Consistency Cleanup Phase 12B

Phase 12B completed as a UI-only cleanup limited to the `safe now` items from [docs/portal-superadmin-ui-audit.md](C:/FloorConnector/docs/portal-superadmin-ui-audit.md).

Files changed:
- `apps/web/app/(portal)/portal/page.tsx`
- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
- `apps/web/app/(portal)/portal/estimates/[estimateId]/page.tsx`
- `apps/web/app/(portal)/portal/contracts/[contractId]/page.tsx`
- `apps/web/app/(portal)/portal/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(portal)/portal/change-orders/[changeOrderId]/page.tsx`
- `apps/web/app/(super-admin)/super-admin/layout.tsx`
- `apps/web/app/(super-admin)/super-admin/page.tsx`
- `apps/web/app/(super-admin)/super-admin/platform/page.tsx`
- `apps/web/app/(super-admin)/super-admin/templates/page.tsx`
- `apps/web/app/(super-admin)/super-admin/catalogs/page.tsx`
- `apps/web/app/(super-admin)/super-admin/modules/page.tsx`
- `apps/web/app/(super-admin)/super-admin/admin/page.tsx`
- `apps/web/components/detail-panel.tsx`
- `apps/web/components/portal-review-ui.tsx`
- `apps/web/components/settings-nav.tsx`
- `apps/web/components/settings-overview-card.tsx`
- `apps/web/components/settings-section-card.tsx`
- `apps/web/components/settings-surface-layout.tsx`
- `docs/chat-handoff.md`

Exact cleanup:
- Added neutral visual variants to shared settings shell/card/nav components and applied them only to the super-admin surface, preserving the existing warm defaults for contractor settings.
- Added a neutral `DetailPanel` variant and applied it to super-admin configuration panels where dense admin forms benefit from flatter card chrome.
- Added small shared portal review UI helpers for hero panels, state panels, inset panels, action boxes, secondary links, document panels, and status badges.
- Reduced portal hero/state card radius, glass/shadow weight, gradient panel usage, and passive brand-accent section labels on portal home, project, estimate, contract, invoice, and change-order review surfaces.
- Replaced several neutral portal status pills with shared semantic status badge styling while keeping metadata chips neutral.
- Quieted portal secondary return/review links so approve/sign/pay actions remain the clearest customer CTAs.

QA results:
- authenticated Playwright smoke QA used `playwright/.auth/local-user.json` against `http://localhost:3000`
- `/portal` loaded with status 200, stayed on `/portal`, rendered `Customer Portal`, and produced no console errors, page errors, or 500 responses
- `/super-admin` loaded with status 200, stayed on `/super-admin`, rendered `Platform Admin`, and produced no console errors, page errors, or 500 responses

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:
- portal visual language/density decisions remain deferred beyond this safe cleanup
- deeper portal semantic color policy remains deferred beyond conservative shared badge use
- no contractor ActionBar/WorkflowBar pattern was copied into portal or super-admin
- no auth, portal access, record loader, super-admin permission, route, schema, backend, RLS, server-action, or workflow changes were made

## Portal And Super-Admin UI Consistency Audit Phase 12A

Audit-only Phase 12A completed. No application implementation changes were made.

Files changed:
- `docs/portal-superadmin-ui-audit.md`
- `docs/chat-handoff.md`

Audit summary:
- Portal is correctly customer-facing and project-scoped, but uses repeated large rounded/glassy cards, gradients, passive brand-accent eyebrows, and neutral status chips that make some review/sign/pay states harder to scan.
- Portal primary actions are generally clear (`Approve`, `Sign`, `Continue to checkout`), but secondary return/open links often use pill styling similar to status chips.
- Super-admin should not copy contractor orange CTA behavior; its slate/black primary save/admin actions fit platform governance.
- Super-admin still carries older settings beige/orange shell chrome through shared settings components such as `SettingsSurfaceLayout`, `SettingsOverviewCard`, and `SettingsSectionCard`.
- Shared semantic status helper adoption is a safe candidate where statuses are truly statuses; metadata chips should stay neutral.
- Contractor patterns that should not be copied directly: Manager Page command bars, Quick-Create/universal-create behavior, contractor operational ActionBar/WorkflowBar assumptions, project-readiness/crew/schedule internals, and orange contractor CTA language.

Recommended phases:
- safe now: neutralize super-admin settings shell chrome, normalize portal/super-admin card radius and border language, apply shared status helpers where purely presentational, and quiet secondary portal links.
- needs design decision: portal softness/density, portal semantic color policy, and whether super-admin remains settings-shell based or gets a dedicated platform-admin shell later.
- defer: portal access/auth/RLS/sign/pay/approval workflow changes, super-admin permissions/tenant lifecycle/module-policy/data-loader changes, route changes, and blanket ActionBar/WorkflowBar rollout.

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:
- no auth, portal access, record loader, super-admin permission, route, schema, backend, RLS, workflow logic, or application UI implementation changes were made

## Decision-First UI Refactor Phase 11

Global component polish completed as a UI-only shared contractor-component pass. Scope stayed on shared contractor UI primitives and small consistency fixes affecting the already-refactored contractor pages.

Files changed:
- `apps/web/components/app-empty-state.tsx`
- `apps/web/components/contractor-workspace-page.tsx`
- `apps/web/components/detail-page-header.tsx`
- `apps/web/components/linked-record-card.tsx`
- `apps/web/components/manager-dashboard-card.tsx`
- `apps/web/components/universal-create-menu.tsx`
- `apps/web/components/workspace-command-bar.tsx`
- `apps/web/components/workspace-composer-sheet.tsx`
- `packages/ui/src/components/action-bar.tsx`
- `packages/ui/src/components/workflow-bar.tsx`
- `packages/ui/src/components/project-state-summary.tsx`
- `packages/ui/src/components/primary-section.tsx`
- `packages/ui/src/components/secondary-section.tsx`
- `docs/chat-handoff.md`

Inventory before editing:
- Shared workflow/detail primitives already used `rounded-lg` shells and semantic status helpers.
- `ManagerDashboardCard` already had shared status badge support from the manager-page cleanup.
- Remaining reusable drift was concentrated in warm beige/orange shell chrome: manager headers, command bars, empty states, linked record cards, detail headers, quick-create sheets, and the universal-create menu.
- Orange appeared in several passive eyebrow/header/link treatments, not only primary CTAs.

Exact polish made:
- Neutralized shared contractor manager headers, command bars, empty states, linked record cards, detail headers, quick-create sheet chrome, and universal-create menu panels to white/gray system surfaces.
- Kept orange on actual primary create/CTA buttons; removed orange from passive eyebrows, menu group labels, back links, empty-state chrome, and hover-only card emphasis.
- Standardized shared contractor cards and rows around `rounded-lg`, `#e2e5e9` borders, white backgrounds, `#f8fafc` hover/empty surfaces, and gray secondary text.
- Aligned `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, `PrimarySection`, and `SecondarySection` typography/colors with the black/gray decision-first system.
- Removed the heavier primary-section shadow so shared workflow sections feel more consistent with ActionBar/WorkflowBar/summary cards.
- Preserved existing component props, links, forms, conditionals, and status-helper behavior.

QA results:
- authenticated Playwright browser QA ran against `http://localhost:3000` using `playwright/.auth/local-user.json`
- `/dashboard` loaded with status 200 and no console errors, page errors, or 500 responses
- `/projects` and project detail `/projects/797ec5b1-4417-4a36-934e-e82498efef5a` loaded with status 200 and no console errors, page errors, or 500 responses
- `/estimates` and estimate detail `/estimates/a58c10b5-9b3b-4c1a-a03b-44e3cdaa1c5e` loaded with status 200 and no console errors, page errors, or 500 responses
- `/invoices` and invoice detail `/invoices/7598e4ef-f875-4543-93fb-d2d846896ed7` loaded with status 200 and no console errors, page errors, or 500 responses
- `/jobs` and job detail `/jobs/acd2daf7-0d02-4196-99d2-1a4164095886` loaded with status 200 and no console errors, page errors, or 500 responses
- `/contracts` and contract detail `/contracts/a0ce5ce7-a305-48f8-bda3-d6e8e5a171c8` loaded with status 200 and no console errors, page errors, or 500 responses
- `/customers` loaded with status 200; opened customer detail `/customers/a0ab94ab-d7c6-4397-a98e-0b38af96707d` from the customer list path with status 200 and no console errors, page errors, or 500 responses

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:
- no portal, super-admin, settings, new page layouts, or broader app-shell navigation polish was attempted
- no mutation QA was performed because this phase was visual/component-only
- no backend, schema, auth, RLS, server-action, data-model, route, or workflow changes were made

## Decision-First UI Refactor Phase 10C

Customers list/manager page cleanup completed as a UI-only contractor-app pass. Scope stayed on `/customers` only.

Files changed:
- `apps/web/app/(app)/customers/page.tsx`
- `docs/chat-handoff.md`

Inventory before editing:
- Customers manager preserved existing search, `New customer` quick-create link, success/error messages, queue card links, recent-record customer links, empty-state create path, `WorkspaceComposerSheet`, `CustomerQuickCreateForm`, and `quickCreateCustomerAction`.
- Existing loaded customer, project, and financial-settings data only was used; no invoice/balance data was introduced because the page does not currently load customer balance context.
- No new filters, server actions, routes, data fetches, workflow states, or mutation paths were introduced.

Exact UI changes:
- Customers summary tiles were normalized to the same compact neutral-card treatment used by the other decision-first manager pages.
- Customer queue cards now use semantic badges for action-oriented records such as missing contact/address and project-linked customers.
- A linked-project count map now supports existing-data project continuity cues without changing data loading.
- Recent customer rows now include a `Continuity` column that shows next cues from existing contact/address/project-link data: add direct contact, add address, linked project count, or ready for first project.
- Financial defaults now use the shared semantic badge helper for taxable/tax-exempt display, with retainage kept secondary.
- The primary `New customer` action, search behavior, quick-create overlay, and empty-state create path remain unchanged.

QA results:
- authenticated Playwright browser QA ran against `http://localhost:3000` using `playwright/.auth/local-user.json`
- `/customers` loaded with status 200, `New customer` was visible, customer detail links were present, continuity cues rendered, and no console errors or bad responses were captured
- opened customer detail from the list candidate `/customers/a0ab94ab-d7c6-4397-a98e-0b38af96707d`; it loaded authenticated with status 200 and no console errors or bad responses

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:
- no customer detail, portal, super-admin, settings, or other manager page changes were made
- no backend, schema, auth, RLS, server-action, data-model, route, workflow, balance logic, portal-access logic, or customer-create behavior changes were made
- no mutation QA was performed for customer creation or customer editing in this UI-only phase

## Decision-First UI Refactor Phase 10B

Invoices, Jobs, and Contracts list/manager page cleanup completed as a UI-only contractor-app pass. Scope stayed on `/invoices`, `/jobs`, `/contracts`, and the invoice records panel used by the Invoices manager.

Files changed:
- `apps/web/app/(app)/invoices/page.tsx`
- `apps/web/app/(app)/jobs/page.tsx`
- `apps/web/app/(app)/contracts/page.tsx`
- `apps/web/components/invoices/invoice-records-panel.tsx`
- `docs/chat-handoff.md`

Inventory before editing:
- Invoices manager preserved existing search, invoice status filters, context hidden inputs, rows-per-view control, `New invoice` quick-create link, queue card links, paid-context links, scoped-context clear link, `WorkspaceComposerSheet`, `InvoiceQuickCreateForm`, and `quickCreateInvoiceAction`.
- Jobs manager preserved existing search, job view filters, project scoping, `New job` quick-create link, queue card links, recent-record job links, empty states, `WorkspaceComposerSheet`, `JobQuickCreateForm`, and `quickCreateJobAction`.
- Contracts manager preserved existing search, status filters, `New contract` quick-create link, snapshot-repair estimate link, queue card links, recent-record contract links, empty states, `WorkspaceComposerSheet`, `ContractQuickCreateForm`, and `quickCreateContractFromEstimateAction`.
- Existing loaded data only was used for continuity cues; no new data fetches, filters, server actions, routes, workflow states, or mutation paths were introduced.

Exact UI changes:
- Invoices manager summary, command filters, billing posture, scoped-context notice, paid queue, and invoice records panel were neutralized to reduce passive beige/orange noise while leaving `New invoice` as the clear primary action.
- Invoice records now use shared `getStatusBadgeClassName()` status badges and show a light continuity cue such as finish billing detail, collect payment, settled, or voided from existing status/due-date data.
- Invoice queue cards now use semantic invoice status badges and balance-focused continuity copy while preserving existing balance-due calculations.
- Jobs manager summary tiles were normalized to the same compact neutral-card treatment used by the other decision-first manager pages.
- Jobs queue cards now show semantic dispatch-status badges; the recent records table now uses shared status badges and a `Schedule / crew` column with cues for scheduling, crew vendor, crew assignments, active work, or closeout from existing job/assignment data.
- Contracts manager summary tiles were normalized to the compact neutral-card treatment.
- Contract queue cards and recent records now use shared status badges and signature-readiness cues derived from existing status, readiness, customer signature, contractor countersign, and signed timestamps.
- Contracts keep green/completed styling limited to `signed` records; sent/viewed/readiness states remain warning/neutral/info rather than completed.

QA results:
- authenticated Playwright browser QA ran against `http://localhost:3000` using `playwright/.auth/local-user.json`
- `/invoices` loaded with status 200, `New invoice` was visible, a real invoice detail/edit link was present, continuity cues rendered, and no console errors were captured
- `/jobs` loaded with status 200, `New job` was visible, real job detail links were present, schedule/crew cues rendered, and no console errors were captured
- `/contracts` loaded with status 200, `New contract` was visible, real contract detail links were present, signature cues rendered, and no console errors were captured
- opened invoice detail from the list candidate `/invoices/7598e4ef-f875-4543-93fb-d2d846896ed7`; it loaded authenticated with status 200 and no console errors
- opened job detail from the list candidate `/jobs/acd2daf7-0d02-4196-99d2-1a4164095886`; it loaded authenticated with status 200 and no console errors
- opened contract detail from the list candidate `/contracts/a0ce5ce7-a305-48f8-bda3-d6e8e5a171c8`; it loaded authenticated with status 200 and no console errors
- note: the initially running dev server had stale dynamic chunks that produced 404 console noise for jobs/contracts; restarting the local dev server cleared the stale chunk state, and the final QA run had no console errors or bad responses

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed after removing one obsolete invoice helper
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:
- no customers, portal, super-admin, settings, or detail-page refactors were made
- no backend, schema, auth, RLS, server-action, data-model, route, workflow, balance logic, scheduling logic, crew logic, or signature logic changes were made
- no mutation QA was performed for invoice creation, job creation, contract generation, scheduling, crew assignment, payment, send, sign, or countersign flows in this UI-only phase

## Decision-First UI Refactor Phase 10A

Projects and Estimates list/manager page cleanup completed as a UI-only contractor-app pass. Scope stayed on `/projects`, `/estimates`, and the estimate records panel used by the Estimates manager.

Files changed:
- `apps/web/app/(app)/projects/page.tsx`
- `apps/web/app/(app)/estimates/page.tsx`
- `apps/web/components/estimates/estimate-records-panel.tsx`
- `docs/chat-handoff.md`

Inventory before editing:
- Projects manager preserved existing search form, status filters, `New project` quick-create link, queue-card links, recent-record detail links, empty-state create link, `WorkspaceComposerSheet`, `ProjectQuickCreateForm`, and `quickCreateProjectAction`.
- Estimates manager preserved existing search form, status filters, rows-per-view control, `Add estimate` quick-create link, estimate detail/edit links, queue cards, status breakdown links, empty-state create path, `WorkspaceComposerSheet`, `EstimateQuickCreateForm`, `quickCreateEstimateAction`, and inline customer quick-create action.
- Existing loaded data only was used for continuity cues; no new data fetches, actions, filters, routes, or workflow states were introduced.

Exact UI changes:
- Projects manager summary tiles were lightly normalized with the same compact rounded neutral-card treatment used by the decision-first manager direction.
- Projects workflow queue cards now show semantic status/finance badges through the existing `ManagerDashboardCard` status-badge path and use existing project readiness/status fields for concise continuity cues.
- Projects recent records now use shared `getStatusBadgeClassName()` status badges and replace the plain commercial-state column with a clearer continuity column derived from existing readiness/status fields.
- Estimates summary tiles and status breakdown were neutralized to reduce passive beige/orange noise while leaving the orange `Add estimate` action as the primary create CTA.
- Estimates status breakdown now uses shared status badge classes for draft/sent/approved/rejected scan consistency.
- Estimate records panel now uses shared status badge classes, neutral table chrome, tighter hover/divider treatment, and a light `Next:` continuity line derived from existing estimate status/customer-view fields.

QA results:
- authenticated Playwright browser QA ran against `http://localhost:3001` using `playwright/.auth/local-user.json`
- `/projects` loaded authenticated, `New project` quick-create entry was visible, real project detail links were present, and no browser console errors were captured
- opened real project detail `/projects/797ec5b1-4417-4a36-934e-e82498efef5a` from the list-link set; it loaded authenticated with expected project-detail content and no browser console errors
- `/estimates` loaded authenticated, `Add estimate` quick-create entry was visible, estimate records/detail links were present, new `Next:` continuity copy rendered in row link text, and no browser console errors were captured
- opened real estimate detail `/estimates/a58c10b5-9b3b-4c1a-a03b-44e3cdaa1c5e` from the list-link set; it loaded authenticated with expected estimate-detail content and no browser console errors

Validation:
- `pnpm typecheck` passed after aligning the project continuity helper with the real `CommercialReadinessStatus` enum (`not_ready`, not `not_started`)
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:
- no customer, invoice, job, contract, portal, super-admin, route, workflow, backend, schema, auth, RLS, server-action, or data-model changes were made
- no deeper list-page IA expansion, new ActionBar, new filters, new queues, or mutation QA was added in this phase

## Decision-First UI Refactor Phase 9.1

Contract Detail sent/awaiting fixture setup and QA completed through existing contractor UI/server actions only. No direct contract-state writes or readiness/signer guard bypasses were used.

Files changed:
- `apps/web/app/(app)/contracts/[contractId]/page.tsx`
- `docs/chat-handoff.md`

Fixture setup:
- started from draft contract `/contracts/7d7b34bd-872a-4831-846b-6c99f500211f`
- used the existing Customer Workspace Portal Access invite form for customer `/customers/a0ab94ab-d7c6-4397-a98e-0b38af96707d`
- scoped the existing active local QA login email to project `/projects/797ec5b1-4417-4a36-934e-e82498efef5a` through the normal customer-level portal access path
- returned to Contract Detail, selected the now-eligible customer portal signer through the existing send-for-signature form, and submitted `Send for signature`
- stopped before any customer signature, onsite signature, decline, or contractor countersign action

Sent fixture:
- sent/awaiting contract: `/contracts/7d7b34bd-872a-4831-846b-6c99f500211f`
- state verified: `sent`, `Awaiting customer`, `0/1 signed`, locked because signature activity has started

Exact UI/QA results:
- authenticated Playwright auth setup passed against `http://localhost:3000`
- draft fixture `/contracts/a0ce5ce7-a305-48f8-bda3-d6e8e5a171c8` loaded with no console errors, kept draft send readiness visible, showed no standalone `Sign` action, kept signer routing and recent signature events visible, and had no green/emerald styling
- sent fixture `/contracts/7d7b34bd-872a-4831-846b-6c99f500211f` loaded with no console errors, showed `Await customer signature`, showed no `Send for signature`, showed no standalone `Sign`, showed no contractor countersign action, kept onsite customer signature available as the valid unsigned-customer path, kept sent PDF snapshot visible, kept signer routing and recent signature events visible, and had no green/emerald styling before full signature completion
- signed fixture `/contracts/d31947d6-8879-4d91-a0c5-bc45165c47a4` loaded with no console errors, showed `Signature complete`, kept signer routing and recent signature events visible, showed no send/sign/countersign controls, and was the only tested state with green completed styling
- WorkflowBar remained conservative: the sent fixture showed contract progress as `0/1 signed`, job as not created, invoice as not linked, and payment as not collected
- small UI-only follow-up made during QA: Contract Detail WorkflowBar no longer marks the upstream Estimate step complete/green until the contract itself is fully signed, satisfying the no-green-before-signed rule

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:
- portal customer sign/decline mutation testing remains intentionally unexercised for this pass
- contractor countersign mutation testing remains deferred because this fixture was sent without a required contractor countersigner
- no backend, schema, auth, RLS, server action, data model, route, or workflow changes were made

## Decision-First UI Refactor Phase 9

Contract Detail decision-first refactor completed as a UI-only contractor-app change. Scope stayed on the Contract Review workspace and the contract detail action component used by that workspace.

Files changed:
- `apps/web/app/(app)/contracts/[contractId]/page.tsx`
- `apps/web/components/contract-status-actions.tsx`
- `docs/chat-handoff.md`

Inventory before editing:
- actions/forms preserved: draft edit link, internal approval status updates, send-for-signature customer signer selection, optional contractor countersigner selection, contractor countersign, onsite customer signature modal, void action, and sent PDF snapshot link
- links preserved: contracts manager, source estimate, project readiness hub, customer/project context, project schedule, linked jobs, linked invoices, related conversations, and generated/sent PDF context
- conditional states preserved: draft send readiness, internal approval blockers, signature lock/editability, sent/viewed awaiting customer, declined, void, signed/completed, customer signer routing, optional contractor countersign, signature events/history, and deposit/project-readiness follow-through

Exact UI changes:
- replaced the old agreement identity/next-action summary band with `ActionBar`, `WorkflowBar`, and `ProjectStateSummary`
- made the top `ActionBar` choose the truthful next signature step: edit/review draft readiness, send for signature, await customer, contractor countersign, signature complete, declined, or void
- added a conservative `WorkflowBar` for `Estimate -> Contract -> Job -> Invoice -> Payment`, with green completion only when the existing linked records prove completion
- added a compact `Signature state` summary for contract status, signer progress, signature mode, and edit lock state
- wrapped the agreement body in `PrimarySection` so contract content is the primary review surface
- kept workflow actions, signer routing, schedule handoff, connected workflow links, related conversations, editability/lock details, revisions, and recent signature events visible below the document as supporting context
- changed pre-completion contract action styling so internal approval and contractor countersign states no longer use green; green is reserved for fully signed/completed contract state

QA results:
- authenticated Playwright auth setup passed against `http://localhost:3000`
- draft contract `/contracts/7d7b34bd-872a-4831-846b-6c99f500211f` loaded with no console errors, showed the new `ActionBar`, `Contract workflow`, `Signature state`, and `Contract content`, kept `Edit draft`, draft-only send readiness, workflow actions, signer routing, schedule handoff, connected workflow links, and recent signature events visible, and showed no standalone `Sign` action
- signed contract `/contracts/d31947d6-8879-4d91-a0c5-bc45165c47a4` loaded with no console errors, showed `Signature complete`, conservative downstream workflow state from real linked jobs/invoices/payments, signer progress `1/1 signed`, locked edit state, sent PDF snapshot, signer routing, connected workflow, and recent signature events, with no send, edit, void, sign, or countersign controls visible
- the contracts manager showed 3 visible contracts total: 2 draft ready-to-send contracts and 1 signed contract; it showed 0 sent and 0 viewed contracts
- sent/awaiting browser QA was not exercised because no sent/viewed contract exists locally, and both available draft contracts lacked an eligible customer signer for a safe UI-only send action

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:
- sent/viewed awaiting-customer Contract Detail QA remains pending until a real sent/viewed contract fixture exists or a safe eligible customer signer is available through normal UI setup
- customer portal sign/decline and contractor countersign mutation testing were not performed in this UI-only pass
- no backend, schema, auth, RLS, server action, data model, route, or workflow changes were made

## Decision-First UI Refactor Phase 8

Job Detail decision-first refactor completed as a UI-only contractor-app change. Scope stayed on the Job Workspace only.

Files changed:
- `apps/web/app/(app)/jobs/[jobId]/page.tsx`
- `docs/chat-handoff.md`

Inventory before editing:
- actions/forms preserved: `updateJobAction` status progression, `scheduleJobAction`, `unscheduleJobAction`, `assignCrewAction`, and `unassignCrewAction`
- links preserved: jobs manager, project hub, customer workspace, linked estimate, linked invoice, invoice creation from completed uninvoiced jobs, time cards, punchlists, and daily logs
- conditional states preserved: job dispatch status progression, completed-job invoice handoff, operational blockers for unscheduled/unassigned/uninvoiced-completed jobs, schedule edit visibility, unschedule visibility, crew assignment rows, and empty states for punchlists/daily logs

Exact UI changes:
- replaced the old top summary band with `ActionBar`, `WorkflowBar`, and `ProjectStateSummary`
- made the top story execution-first: current job action, schedule state, crew state, dispatch status, and project context
- promoted `Schedule and crew` to the first primary working section, with schedule save/unschedule and crew assign/unassign controls kept together
- moved project/customer/estimate/invoice context into secondary connected-record areas and removed estimate total emphasis from the job page
- moved job notes into the side rail and kept daily logs, time, punchlists, and connected records visible but secondary
- removed duplicate status/schedule/crew summaries from the side rail

QA results:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- authenticated Playwright auth setup passed against `http://localhost:3000`
- authenticated `/jobs` browser QA reached the Jobs Manager Page with no console errors, but the local contractor account currently has 0 jobs, so unscheduled/scheduled/in-progress/completed Job Workspace QA could not be exercised without creating or mutating data

Deferred items:
- browser QA on real unscheduled, scheduled, in-progress, and completed Job Workspace records remains pending until local QA data includes jobs
- no mutation testing of schedule, unschedule, crew assignment, crew unassignment, status progression, or invoice creation was performed in this UI-only pass
- no backend, schema, auth, RLS, server action, data model, route, or workflow changes were made

## Decision-First UI Refactor Phase 8.1

Job Detail QA fixture setup and verification completed against the preferred `24 Investor Way` QA chain using existing contractor-app UI and server actions only.

Files changed:
- `apps/web/app/(app)/jobs/[jobId]/page.tsx`
- `docs/chat-handoff.md`

Exact UI change:
- tightened the Job Workspace unschedule visibility guard so `Unschedule job` renders only for `scheduled` jobs, not `unscheduled`, `in_progress`, or `completed` jobs

QA fixtures created or used:
- unscheduled job: `/jobs/acd2daf7-0d02-4196-99d2-1a4164095886`
- scheduled job: `/jobs/7a99c1a5-b658-4f46-8328-e73a8f5966c4`
- in-progress job: `/jobs/e1fff7e6-7823-4a9a-80f3-358ea16f5e80`
- project: `/projects/6922a413-1350-496c-89d9-6b03dcbad0f1`

Exact QA results:
- authenticated Playwright auth setup passed against `http://localhost:3000`
- the unscheduled, scheduled, and in-progress Job Workspace pages all loaded as authenticated protected pages with no browser console errors
- `ActionBar` truthfulness verified: unscheduled shows `Mark scheduled`, scheduled shows `Start work`, in-progress shows `Mark complete`
- `WorkflowBar` did not overstate downstream completion for unscheduled or scheduled jobs, and did not claim field work complete for the in-progress job
- `ProjectStateSummary` showed schedule, crew, status, and project context on each fixture
- schedule visibility verified: unscheduled keeps schedule entry visible without `Unschedule job`; scheduled keeps `Unschedule job`; in-progress hides `Unschedule job`
- crew visibility verified: `Add assignment` remains visible; no assignable person or vendor options were available for the tested in-progress fixture, so no `Unassign` control was expected
- project, customer, daily execution context, time, and invoice context remained visible on all three fixture detail pages

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:
- completed-job fixture QA was not created in this pass; the safe existing UI path was stopped at in-progress
- crew unassignment was not exercised because no assignable crew/person/vendor options were available in the existing assignment UI
- no backend, schema, auth, RLS, server action, data model, route, or workflow changes were made

## Decision-First UI Refactor Phase 8.2

Job Detail polish and regression review completed against the existing Phase 8.1 fixtures. No new job fixtures were created.

Files changed:
- `apps/web/app/(app)/jobs/[jobId]/page.tsx`
- `docs/chat-handoff.md`

Exact polish made:
- changed the schedule form heading to `Set schedule` for unscheduled jobs and `Update schedule` for scheduled or in-progress jobs
- kept unscheduled schedule entry as an explicit `Save schedule` action instead of showing an initial `Saved` state before any schedule exists
- kept the existing schedule save action wiring unchanged for all statuses where schedule updates remain visible
- reduced crew-assignment emphasis when no assignable crew members or labor-provider vendors exist by replacing the empty assignment form/button with a quiet setup note
- preserved the full existing crew assignment form and `assignCrewAction` path when assignable people or labor-provider vendors are available
- left estimate and invoice context in the secondary connected-record area and kept estimate totals out of the job page

QA results:
- authenticated Playwright auth setup passed against `http://localhost:3000`
- unscheduled fixture `/jobs/acd2daf7-0d02-4196-99d2-1a4164095886` loaded with no console errors, showed `Mark scheduled`, showed `Set schedule` with `Save schedule`, did not show `Unschedule job` or `Start work`, kept the conservative workflow/state summary visible, and showed the softened no-crew-options note
- scheduled fixture `/jobs/7a99c1a5-b658-4f46-8328-e73a8f5966c4` loaded with no console errors, showed `Start work`, showed `Update schedule`, showed exactly one `Unschedule job`, kept the WorkflowBar conservative, and showed the softened no-crew-options note
- in-progress fixture `/jobs/e1fff7e6-7823-4a9a-80f3-358ea16f5e80` loaded with no console errors, showed `Mark complete`, showed `Update schedule`, did not show `Unschedule job`, marked execution as in progress without claiming field work complete, and showed the softened no-crew-options note
- all three fixtures kept Job Workspace, Job execution workflow, Job execution state, Schedule and crew, Connected Records, Daily Execution Context, and Labor and Time context visible
- browser QA required refreshing the Playwright storage state before individual fixture checks because the local Supabase session rotated during repeated scratch-script page loads; this did not require any app change or data mutation

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred items:
- completed-job fixture QA remains deferred
- crew assignment and unassignment were not mutation-tested because the existing QA organization has no assignable people or labor-provider vendors available
- no Contract Detail work was started
- no backend, schema, auth, RLS, server action, data model, route, or workflow changes were made

## Contractor UI Cleanup Pass

Focused shared-component UI cleanup completed after the Project Detail decision-first refactor. This was UI-only polish, not a new feature phase or page-layout refactor.

Files changed:
- `packages/ui/src/components/action-bar.tsx`
- `packages/ui/src/components/workflow-bar.tsx`
- `packages/ui/src/components/project-state-summary.tsx`
- `packages/ui/src/components/primary-section.tsx`
- `packages/ui/src/components/secondary-section.tsx`
- `apps/web/components/linked-record-card.tsx`
- `apps/web/components/manager-dashboard-card.tsx`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `docs/chat-handoff.md`

Exact UI cleanup made:
- standardized the new decision-first shells on neutral `8px` radius cards with consistent neutral borders
- changed `WorkflowBar` current/in-progress styling from amber to blue, matching the status-color rule
- split `ProjectStateSummary` tones so active/current can be blue while needs-action/readiness blockers use yellow
- kept non-clickable `ActionBar` next-action labels neutral instead of brand-colored
- removed decorative warm gradients/borders from contractor linked record cards
- calmed contractor manager dashboard cards by neutralizing eyebrow labels, badges, hover states, and secondary action buttons
- updated project detail readiness warning mapping to use the new `needsAction` state summary tone

Behavior preserved:
- no project detail actions, links, forms, guards, server actions, readiness calculations, data loaders, workflow behavior, auth, RLS, route architecture, schema, backend, or data model changed
- dashboard, estimates, invoices, jobs, contracts, portal, super-admin, and list pages were not refactored into new layouts
- the completed Project Detail structure remains intact: `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, and core Estimate/Contract/Job/Invoice workflow grouping remain in place

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- authenticated Playwright QA passed after restarting a stale dev server that was serving a bad client chunk
  - login completed through `/login` using root `.env.local` E2E credentials without printing credential values
  - checked `/dashboard`, real project detail `/projects/797ec5b1-4417-4a36-934e-e82498efef5a`, `/estimates`, and `/invoices`
  - project detail rendered the decision-first stack: Project Workspace, Project readiness workflow, Project state summary, Core Workflow, Estimate, Contract, Job, and Invoice
  - project estimate and invoice links remained visible and did not break authentication during interaction checks
  - no browser console errors were captured on the passing QA run
  - screenshots were saved under `test-results/ui-cleanup-*.png`

Intentionally deferred cleanup:
- no `DetailPanel`, portal, or super-admin card restyling in this pass because those shared surfaces cross the contractor-only scope
- no dashboard, estimate, invoice, job, contract, or list-page layout refactors
- no mutation testing of create/save actions; this pass only verified visibility, navigation/auth continuity, and rendering stability

## Contractor UI System Hardening Pass

Focused post-cleanup hardening completed before the Dashboard phase. This was a UI-only and test-infra-only pass scoped to shared contractor UI components, Project Detail, and protected Playwright setup.

Files changed:
- `packages/ui/src/status.ts`
- `packages/ui/src/components/action-bar.tsx`
- `packages/ui/src/components/workflow-bar.tsx`
- `packages/ui/src/components/project-state-summary.tsx`
- `packages/ui/src/components/primary-section.tsx`
- `packages/ui/src/index.ts`
- `apps/web/components/manager-dashboard-card.tsx`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `e2e/auth.setup.js`
- `e2e/project-detail-ui.spec.js`
- `playwright.config.js`
- `docs/chat-handoff.md`

Exact hardening made:
- added one shared `@floorconnector/ui` status presentation helper for status tone mapping and status badge/connector classes
- centralized semantic status colors for gray neutral/draft/not-started, blue active/current/in-progress, yellow needs-action/waiting/readiness-warning, red blocked/error/failed, and green complete/approved/paid/signed
- updated `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, project detail badges, and contractor manager-card badges to use shared status presentation instead of local status-color strings
- preserved orange for primary CTAs only; project follow-up warning actions now render as neutral secondary actions
- removed the remaining passive `brand-*` current-state styling from project readiness stage cards by routing those through the shared status helper
- made `PrimarySection` slightly stronger than secondary/support sections with neutral border weight and a minimal shadow so the Project Detail core workflow has subtle priority
- inspected Project Detail next-action cases without changing business logic; no misleading display/link target was found that required workflow changes
- fixed `e2e/auth.setup.js` to load root `.env.local`, scope to the email/password form, and click `Log in with email` instead of the Google OAuth submit button
- added `e2e/project-detail-ui.spec.js` to smoke-test the Project Detail `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, and `Core Workflow`

Behavior preserved:
- no backend, schema, auth logic, RLS, route architecture, server action, data loading, readiness calculation, workflow behavior, forms, permissions, or guards changed
- no dashboard, estimate, invoice, job, contract, portal, super-admin, or list-page layout refactor was started
- Project Detail remains the decision-first workflow/readiness hub with `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, and core Estimate/Contract/Job/Invoice grouping intact

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- Playwright auth setup passed against `http://localhost:3000` with `PLAYWRIGHT_SKIP_WEB_SERVER=1`
- protected Playwright Project Detail smoke test passed under the `chromium-protected` project
- authenticated browser QA passed for `/dashboard` and real project detail `/projects/797ec5b1-4417-4a36-934e-e82498efef5a`
- browser QA verified `ActionBar`, `WorkflowBar`, and `ProjectStateSummary` are visible on Project Detail
- safe navigation QA clicked the visible `Review contract` project action and landed on `/contracts/7d7b34bd-872a-4831-846b-6c99f500211f` without redirecting to login
- no browser console errors were captured during the passing QA checks

Intentionally deferred:
- no further global card system changes outside the requested shared components
- no portal/super-admin consistency pass
- no Dashboard phase work or other page-level layout refactors
- no mutation testing of create/save/payment/signature actions

## Decision-First UI Refactor Phase 5

Dashboard decision-center refactor completed as a UI-only contractor-app change. Scope stayed on the contractor dashboard surface and dashboard smoke QA; no estimate, invoice, job, contract, portal, super-admin, or list-page layout refactor was started.

Files changed:
- `apps/web/app/(app)/dashboard/page.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `apps/web/components/dashboard/priority-strip.tsx`
- `e2e/dashboard-ui.spec.js`
- `playwright.config.js`
- `docs/chat-handoff.md`

Inventory before editing:
- visible actions and links included Universal Create, top shortcuts to Projects, Schedule manager, Payments manager, and Cost items database, metric links to Leads, Estimates, Schedule, and Appointments, queue links into attention items, leads, estimates, contracts, projects, jobs, appointments, invoices, payments, and project context links, plus onboarding links to Settings, Customers quick-create, Projects quick-create, and Estimates quick-create
- metrics included leads needing follow-up, estimates awaiting action, jobs needing schedule, appointments today, jobs today/live, role, active projects, open receivables, scheduled appointments, unscheduled jobs, open punchlists, ready progress-billing workspaces, customer count, estimate count, and open receivables
- conditional sections included high-signal attention, onboarding setup guide, commercial queues, operations queues, finance queues, empty states, top shortcut metrics, and quick-create access
- existing data loaders and server actions remained the same: customer, opportunity, estimate, approved-estimate, project, contract, job, appointment, punchlist, invoice, payment, notification, progress-billing, financial settings, workflow settings, and quick-create actions for lead/customer/project/estimate/contract/job/invoice/change order

Exact UI changes:
- added dashboard-only `PriorityStrip` at the top of the dashboard content, derived from existing notification, receivables, estimate, and job queues
- reordered the visible dashboard structure to Priority Strip -> Key Metrics -> Onboarding when needed -> Work Queues
- renamed the metric grid treatment to a clearer key-metrics section: `Pipeline and execution snapshot`
- kept Universal Create in the header as the single orange primary create CTA
- normalized passive dashboard header, onboarding, queue cards, and queue badges toward neutral-first styling
- routed dashboard queue badges and onboarding status badges through the shared `@floorconnector/ui` status helper
- preserved all existing dashboard data sources, links, quick-create action wiring, search, queue filtering, and empty states
- added a protected Playwright dashboard smoke test for the decision-center headings, Universal Create visibility, Projects navigation, and console-error check

Behavior preserved:
- no backend, schema, auth logic, RLS, route architecture, server action, data model, workflow behavior, guards, or data loading changed
- quick-create access remains visible from the dashboard header
- existing dashboard actions and links remain visible where their original conditions apply

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- authenticated Playwright dashboard smoke QA passed against `http://localhost:3000` with `PLAYWRIGHT_SKIP_WEB_SERVER=1`
  - login completed through the existing setup project using root `.env.local` E2E credentials without printing credential values
  - `/dashboard` rendered the new `Decide what needs attention first` priority strip and `Pipeline and execution snapshot` key metrics section
  - Universal Create remained visible
  - the dashboard Projects navigation path worked and landed on `/projects`
  - no browser console errors were captured during the passing dashboard QA run

Intentionally deferred:
- no mutation testing of create/save actions
- no dashboard data-loader or priority algorithm changes beyond existing loaded data
- no refactor of dashboard placeholders or non-rendered quick-create prop plumbing
- no estimates, invoices, jobs, contracts, portal, super-admin, or list-page layout changes

## Phase 5 Dashboard Polish Review

Focused dashboard-only review and polish completed after the Phase 5 decision-center refactor. This remained UI-only and did not expand into other contractor pages or downstream record workspaces.

Files changed:
- `apps/web/components/dashboard/priority-strip.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `docs/chat-handoff.md`

Exact polish made:
- reviewed the Phase 5 dashboard diff for action placement, priority-strip usefulness, metric placement, queue grouping, and passive color noise
- removed the orange CTA from `PriorityStrip` so Universal Create remains the clear primary orange dashboard CTA
- changed `PriorityStrip` count pills from status-colored badges to neutral count markers, reducing duplicate status emphasis above the queues
- kept all PriorityStrip cards clickable to their existing queue/workspace destinations and preserved their action-label guidance as neutral text
- adjusted the priority strip grid to four neutral priority lanes on wide screens so it reads as a compact triage strip instead of a duplicate queue panel
- added a quiet `Work queues` heading before the queue grids so the dashboard clearly transitions from priority and metrics into follow-up lists

Behavior preserved:
- all dashboard data loaders, quick-create server actions, links, filters, search behavior, empty states, and queue destinations were preserved
- no backend, schema, auth, RLS, server action, data model, route, workflow behavior, estimates, invoices, jobs, contracts, portal, super-admin, or list-page behavior changed

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- authenticated Playwright dashboard QA passed against `http://localhost:3000` with `PLAYWRIGHT_SKIP_WEB_SERVER=1`
  - login completed through the existing setup project using root `.env.local` E2E credentials without printing credential values
  - `/dashboard` rendered the priority strip and key metrics
  - Universal Create remained visible
  - the dashboard Projects navigation path worked and landed on `/projects`
  - no browser console errors were captured during the passing dashboard QA run

Deferred:
- no mutation testing of quick-create actions
- no visual polish outside the dashboard
- no additional dashboard data prioritization rules beyond the existing loaded queues

## Decision-First UI Refactor Phase 6

Estimate Detail decision-first refactor completed as a UI-only contractor-app change. Scope stayed on the estimate detail page and preserved the existing editor, estimate calculations, catalog/system insertion, approval states, server actions, and workflow guards.

Files changed:
- `apps/web/app/(app)/estimates/[estimateId]/page.tsx`
- `docs/chat-handoff.md`

Inventory before editing:
- visible actions included Back to estimates, Back to edit, Generate contract for approved estimates, Open project workspace, the preferred next-action link, approved-estimate contract/SOV/snapshot recovery actions, Send estimate, Manage customer portal access, Open customer, Review linked lead, manual estimate status actions, connected project/contract/job/invoice links, schedule links, and communication links
- links included estimates list, estimate editor, project workspace, contracts, invoices, jobs, schedule, customers, leads, and related communications where records exist
- readiness and blocker messages included estimate status meaning, project readiness status, active project blockers, send prerequisites, missing customer email blocker copy, approval/contract-generation snapshot recovery guidance, schedule approval blockers, and customer timeline events
- related-record sections included readonly line items, scope/SOW, reusable terms/inclusions/exclusions, notes, workflow actions, customer timeline, connected workflow, production schedule/schedule handoff, and related conversations
- server actions/forms preserved on the page were `sendEstimateToCustomerAction`, `EstimateStatusActions`, `quickCreateContractFromEstimateAction`, `openOrCreateScheduleOfValuesAction`, and `rebuildApprovedEstimateSnapshotAction`
- conditional rendering preserved approved-only next steps, draft/rejected send actions, customer email prerequisites, manual decision actions, customer/lead blockers, schedule handoff copy, linked downstream records, and empty downstream workflow messaging

Exact UI behavior changed:
- replaced the older top summary band with the shared `ActionBar`, `WorkflowBar`, and `ProjectStateSummary` directly under the estimate header
- made the ActionBar the dominant next-action surface and moved Back to edit/Open project workspace into neutral secondary actions
- added an Estimate -> Contract -> Job -> Invoice WorkflowBar derived from existing linked records and statuses only
- added an Estimate state summary for status, total/subtotal, tax/discount, line item count, and project readiness/blockers
- moved readonly line items ahead of customer/project/support context so the proposal body is the primary workspace
- removed the duplicate lower Pricing Snapshot panel because subtotal, discount, tax, and total are preserved in the state summary and document header
- switched connected workflow badges to the shared status badge helper for consistent neutral/status-only color usage

Behavior preserved:
- no backend, schema, auth, RLS, server action, data model, route architecture, estimate calculation, tax, discount, line item, catalog/system generation, approval, approved-snapshot, or workflow behavior changed
- estimate editor functionality and save behavior were not refactored
- no dashboard, invoice, job, contract, portal, super-admin, or list-page layout work was started

Validation:
- `pnpm typecheck` passed after correcting display-only status assumptions in the new WorkflowBar/state summary mapping
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- authenticated Playwright auth setup passed against `http://localhost:3007` using root `.env.local` E2E credentials without printing credential values
- authenticated browser QA passed on real estimate `/estimates/a58c10b5-9b3b-4c1a-a03b-44e3cdaa1c5e`
  - verified `Estimate workflow`, `Estimate state summary`, and `Line items` render on the detail page
  - verified navigation from estimate detail to `/projects/797ec5b1-4417-4a36-934e-e82498efef5a`
  - verified draft estimate line-item add through existing catalog quick-add, then remove/save returned the editor to `Saved`
  - no browser console errors were captured during the passing QA run
  - screenshot saved at `test-results/estimate-detail-phase-6.png`

Deferred:
- no test file was added in this phase because the existing protected QA flow covered the required real estimate detail and editor smoke checks without introducing a new framework or broad test surface
- no deeper estimate editor layout refactor; this phase kept edits to the estimate detail page
- no mutation testing of send/approval/contract-generation actions beyond visibility and navigation checks

## Phase 6 Estimate Detail Polish Review

Focused estimate-detail-only review and polish completed after the Phase 6 decision-first refactor. This remained UI-only and did not expand into the estimate edit layout, dashboard, invoices, jobs, contracts, portal, super-admin, or list pages.

Files changed:
- `apps/web/app/(app)/estimates/[estimateId]/page.tsx`
- `docs/chat-handoff.md`

Exact polish made:
- reviewed the Phase 6 estimate detail diff for ActionBar placement, WorkflowBar state accuracy, summary duplication, totals/line-item hierarchy, and preserved links/actions
- changed draft estimate ActionBar guidance from approval-oriented copy to `Review and send estimate`, linking to the existing estimate editor instead of the manual decision anchor
- clarified sent estimate ActionBar copy as `Record customer decision`, keeping manual approval/rejection framed for offline/non-portal decisions only
- clarified rejected estimate ActionBar copy as `Revise or resend estimate`, linking to the existing editor
- tightened WorkflowBar downstream state display so Job only becomes current when linked jobs exist or the primary contract is signed, and Invoice only becomes current when linked invoices exist or completed linked jobs justify billing review
- kept downstream WorkflowBar descriptions conservative: unsigned or missing contract now reads as after signed contract/readiness rather than implying scheduling is already ready
- removed the duplicate Status card from `ProjectStateSummary`; status remains visible in the ActionBar, while the summary now focuses on total, tax/discount, line items, and project readiness

Behavior preserved:
- existing estimate detail data loading, send actions, manual decision actions, linked record links, project navigation, approved-estimate next-step panel, readiness messages, line item display, forms, guards, editor handoff, and catalog/system workflow behavior were preserved
- no backend, schema, auth, RLS, server action, data model, route, estimate calculation, tax, discount, approval, catalog, system, or workflow behavior changed

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- `pnpm e2e:auth` passed against `http://localhost:3007` using the root `.env.local` E2E credentials and `playwright/.auth/local-user.json`
- authenticated Playwright QA passed on draft estimate `/estimates/a58c10b5-9b3b-4c1a-a03b-44e3cdaa1c5e`
  - verified ActionBar, WorkflowBar, ProjectStateSummary, totals, and line items render
  - verified draft WorkflowBar keeps Contract after approval, Job after signed contract/readiness, and Invoice after production/billing trigger
  - verified navigation from estimate detail to the linked project still works
  - verified draft editor quick-add from catalog, remove, and save flow still works
- authenticated Playwright QA passed on approved estimate `/estimates/72acf60d-4486-4774-a3dd-2f86f0b1f912`
  - verified approved ActionBar renders one of the existing downstream next actions
  - verified the approved estimate edit surface still shows approved/next-step context
  - no browser console errors were captured during the passing QA run

Deferred:
- no new permanent Playwright spec was added during this polish pass because the existing protected auth setup plus targeted one-off browser QA covered the required draft and approved estimate checks
- no estimate editor visual refactor was attempted
- no mutation testing of send, approval, rejection, contract generation, SOV, or deposit actions beyond existing visibility/navigation checks

## Decision-First UI Refactor Phase 7

Invoice Detail decision-first refactor completed as a UI-only contractor-app change. Scope stayed on the invoice detail page and preserved the existing invoice editor, calculations, line items, tax, retainage, balances, payment recording form/action wiring, statuses, server actions, and workflow guards.

Files changed:
- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `docs/chat-handoff.md`

Inventory before editing:
- visible actions included Back to invoices, Record payment, Open progress billing workspace for AIA progress invoices, Open project readiness hub, continuity links to progress billing or project workspace, the payment recording form, the invoice edit/progress-source panel, linked schedule/job actions, connected-record links, and related-conversation actions
- links included invoices list, project readiness hub, progress billing workspace, customer, estimate, job, schedule, change orders, and related communications where records exist
- readiness and blocker messages included resolved route error/message banners, online payment readiness copy, customer payment/progress copy, recent payment signal copy, void-invoice payment blocking copy, progress billing missing-workspace copy, project readiness metadata, and schedule/job/crew context notices
- related-record sections included invoice review/continuity, line items, billing notes, latest payment activity, totals and billing math, billing configuration, payment recording, edit/progress source, production schedule, connected records, invoice metadata, and related conversations
- server actions/forms preserved on the page were `recordInvoicePaymentAction` through `InvoicePaymentForm` and `updateInvoiceAction` through `InvoiceForm`
- conditional rendering preserved void/draft/sent/partially-paid/paid next-action handling, payment-event messaging, payment recording visibility for non-void invoices, progress-billing workspace handoff, linked job versus project schedule context, connected records, and paid/partially-paid status derivation inside the existing invoice form

Exact UI behavior changed:
- replaced the older top identity/summary band with shared `ActionBar`, `WorkflowBar`, and `ProjectStateSummary` directly below the invoice header
- made the ActionBar the dominant billing next-action surface; sent/partially-paid/open invoices still point at existing payment recording, paid invoices point back to the project hub, void invoices stay review-only, and draft invoices now point to the existing invoice-editing section instead of implying payment collection
- added an Estimate -> Contract -> Job -> Invoice -> Payment WorkflowBar derived only from existing linked records, project readiness snapshot, invoice status, payments, and balance state
- added an Invoice state summary for total, paid, balance due, and retainage held when present, making balance due unmistakable near the top
- moved line items ahead of continuity/support context so billing scope is the primary workspace
- reduced duplicate status/totals emphasis by removing the former invoice identity/current billing state block
- neutralized passive progress-billing and lineage styling so orange remains reserved for the primary CTA
- kept payment activity visible below line items and billing notes as secondary review context

Behavior preserved:
- no backend, schema, auth, RLS, server action, data model, route architecture, invoice calculation, tax, retainage, balance, payment recording, line item, status, readiness, or workflow behavior changed
- no dashboard, estimate, job, contract, portal, super-admin, or list-page layout work was started

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed after removing dead display helpers made obsolete by the top-stack replacement
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- `pnpm e2e:auth` passed against `http://localhost:3000` using the root `.env.local` E2E credentials and `playwright/.auth/local-user.json`
- authenticated browser QA logged in through the app login page and checked `/invoices`, but the authenticated E2E account currently has zero invoice records: Draft 0, Sent 0, Open balance 0, Paid 0, Void 0
- authenticated browser QA also checked real project `/projects/797ec5b1-4417-4a36-934e-e82498efef5a`; no invoice detail links were present on that project
- no browser console errors were captured while checking the authenticated invoice manager/create surface

Deferred:
- no permanent Playwright spec was added during initial implementation because fixture coverage was added later through real authenticated QA invoices

## Phase 7 Invoice Detail Fixture Polish

Focused invoice-detail-only review and polish completed against the new real QA fixtures:
- unpaid: `/invoices/7598e4ef-f875-4543-93fb-d2d846896ed7`
- partial: `/invoices/c9131b30-dea7-45a5-b476-8ba2bf3fc502`
- paid: `/invoices/894d1e3a-c3f2-4572-869b-545f00aef027`

Files changed:
- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `docs/chat-handoff.md`

Exact polish made:
- verified the ActionBar remains truthful for sent/unpaid, partially paid, and paid invoice states
- preserved the `Record payment` primary CTA and existing payment form for unpaid and partially paid invoices
- removed misleading payment-recording prompts from settled/paid invoices by replacing the form area with a secondary `Payment Activity` review state
- changed the paid/settled payment readiness label to `Payment settled`
- kept the WorkflowBar conservative by marking Payment complete only when `invoice.status` is `paid`
- renamed the lower support totals panel from `Totals and billing math` to `Detailed billing math` so the top balance summary remains the primary financial focus
- preserved line items as the primary billing workspace and payment activity as secondary review context

Behavior preserved:
- no backend, schema, auth, RLS, server action, data model, route, invoice calculation, tax, retainage, balance, status, line item, payment recording, or workflow behavior changed
- no dashboard, estimates, jobs, contracts, portal, super-admin, list pages, invoice editor, or payment-provider behavior changed

QA results:
- unpaid fixture showed sent invoice state, ActionBar `Record the next payment`, visible `Record payment` link and form, balance due `$594.59`, Payment step `No payment recorded`, and no console errors
- partial fixture showed partially paid invoice state, ActionBar `Collect the remaining deposit balance`, visible `Record payment` link and form, balance due `$394.59`, Payment step `1 recorded payment`, and no console errors
- paid fixture showed paid invoice state, ActionBar `Billing review is current`, no `Record payment` link or form, balance due `$0.00`, settled payment activity copy, Payment step `1 recorded payment`, and no console errors

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings

Deferred:
- no broader invoice list/editor, dashboard, estimate, job, contract, portal, or super-admin cleanup was attempted
- no permanent Playwright spec was added in this polish pass; coverage remained targeted authenticated browser QA on the three real invoice fixtures

## Snapshot

FloorConnector is a production-first specialty-contractor operating system built on one shared canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Latest Contract Generation Fix

- `/contracts?compose=1` now opens the contract Quick-Create composer consistently, preserves `estimateId` selection context, and displays decoded `error` query blockers inside the composer.
- The missing approved-snapshot blocker now points users back to the estimate recovery path: rebuild the approval snapshot from the approved estimate, then generate the contract again.
- Contract-generation guardrails were not weakened: generation still reads only approved estimate snapshots and still refuses approved estimates with missing snapshot lineage.
- Approval normally creates the required immutable snapshot through the database trigger `snapshot_estimate_on_approval`, which calls `create_estimate_commercial_snapshot` when an estimate status becomes `approved`.
- If an already-approved estimate is missing its approved snapshot, treat it as old/bad data or an environment that missed the snapshot migration. The Estimate Workspace and Estimate Editor now show a warning and expose `Rebuild Approval Snapshot`, which calls the canonical `create_estimate_commercial_snapshot` path only for an approved estimate with no existing snapshot.
- Data-repair note: old approved estimates may need this rebuild action before contract generation. Do not patch a fake snapshot, do not toggle status manually, and do not generate contracts from mutable/current estimate data.
- Backend mismatch fixed after QA: the affected estimate `d5f508a6-61f6-459c-8982-88ef45714472` did have `estimate_commercial_snapshots` row `714f5d9c-407d-45ed-adfc-62e9e4553138` with two `estimate_commercial_snapshot_items`; contract generation was misclassifying it as missing because Supabase returned numeric snapshot fields as JavaScript numbers while the contract snapshot guards only accepted strings.
- Contract generation now accepts string or number numeric values from `estimate_commercial_snapshots` and `estimate_commercial_snapshot_items`, then normalizes them to strings for contract rendering. The rebuild action also verifies the same contract-generation snapshot header and item query before reporting success.
- Follow-up response-shape mismatch fixed after the snapshot guard passed: contract creation inserts and requests `{ id }`, then reloads the full contract record before redirecting. The reload query omitted top-level `contracts.reference_number` even though `isContractRow` requires it, so the helper returned `null` and surfaced `Unexpected contract response after generation`. Contract reloads now use the canonical `contractSelect`, including `reference_number`.
- `workflow_error_events` is now the lightweight tenant-scoped workflow failure log. Contract generation failures are recorded with action `contract.generate_from_estimate`, subject `estimate`, safe metadata, and user context when available. Organization owners/admins can review recent events from `/settings/admin`.
- Approved snapshot rebuild failures are recorded as `estimate.rebuild_approval_snapshot` with safe estimate context only when the recovery action fails.
- Validation run for this fix: `pnpm typecheck` and `pnpm lint` passed. Playwright spec discovery passed with `PLAYWRIGHT_SKIP_WEB_SERVER=1`; a headless `/contracts?compose=1&estimateId=<id>&error=<encoded message>` check reached the local app but redirected to `/login` because no saved contractor auth state or E2E credentials were available in this session.

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
- contractor-side onsite contract signing is implemented and verified on the same canonical contract/signature system as portal signing; QA passed contractor UI send, signer routing, onsite canvas signature, canonical `signer_signed` event, signed contract status, and project readiness sync
- verified onsite signing QA record: contract `c6e12b54-985d-4d2c-9618-5e54657e06f9`, estimate `f11c2eae-338d-4b08-8781-fcdb81b918be`, customer signer `7e3cf4ef-cf79-4801-b775-6eaa1b588abe`, project `cbb32597-59c6-424b-9c3c-77f2b40ba0d0`, organization `29230b6a-a870-4b85-8b7d-4bfed4c8dfad`; validation passed with `pnpm typecheck`, `pnpm lint`, and `git diff --check` reporting CRLF warnings only
- deposit follow-through after signature is conditional on organization workflow settings: required deposits use the existing canonical deposit invoice/payment chain, and no deposit invoice is created when deposit readiness is not required
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

## New Systems Summary

Added systems:

- Incident + OSHA System

- HR System

- Task System

- Progress Billing

- Marketing + Lead Ingestion

- Purchasing + Inventory

- Subcontractor System

- PTO / Workforce Management

- Service Layer

- Mobile-First Requirements

## Architectural Risks

- Duplicate models: Ensure no separate employee or subcontractor entities.

- Silo systems: All extend canonical entities.

- Data ownership: Service layer read-only.

## Built Now

Implemented on the current branch:
- auth, tenant bootstrap, organization-aware access control
- leads, customers, projects, estimates
- first read-only `/directory` workspace over canonical customers, related customer contacts, workforce people, vendors, and leads, with each row routing back into the existing canonical detail page
- canonical `customers` remain the customer/account source of truth for estimate send, invoice recipient, contract customer context, payment/billing context, and project ownership; a future `Directory` view must not replace that with a generic contact model
- customer detail now surfaces canonical related customer contacts beneath the customer account, with contractor-admin add/edit/main-contact management on top of `contacts` and `customer_contacts`
- customer estimate send, portal review, approval, rejection, and estimate email tracking
- approved estimate commercial snapshots as the downstream commercial baseline
- canonical contracts with signer routing, portal signature actions, and contractor-side onsite signature capture
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
- contractor-side Estimate Review now intentionally supports manual/offline customer decisions from draft or sent estimates through the shared estimate status-transition action: `Record customer approval` and `Record rejection` are for paper signature, verbal approval, fake email during testing, non-portal customers, and workflow testing before send-mail and portal delivery are complete; this is not a duplicate approval model
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

## Decision-First UI Refactor Phases 1-3

Decision-first UI refactor foundation is started from `plan/refactor-decision-first-ui-1.md`. The prompt referenced `docs/refactor-decision-first-ui-1.md`, but that exact path was not present; the matching plan was found under `plan/`.

Completed in this staged subset:
- Phase 1 foundation components only: shared theme constants, `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, `PrimarySection`, and `SecondarySection` were added to `@floorconnector/ui`.
- Phase 2 section layout components: contractor app wrappers `CoreWorkflowSection`, `ExecutionSection`, and `SupportSection` were added under `apps/web/components/layout`.
- Phase 3 UI audit: [docs/ui-refactor-audit.md](C:/FloorConnector/docs/ui-refactor-audit.md) records decision-first anti-patterns and page-level risks before visual implementation.

Behavior preserved:
- no major pages were refactored
- no server actions, forms, permissions, workflows, routes, schema, auth, RLS, Supabase policies, data models, calculations, estimate behavior, invoice behavior, contract behavior, job behavior, or portal/super-admin behavior changed
- project detail remains the primary workflow/readiness hub
- the contractor top-nav-first shell and shared Manager Page direction remain intact

Validation for this subset passed:
- `pnpm typecheck`
- `pnpm lint`
- `git diff --check` with exit code 0; it reported only the usual LF-to-CRLF working-copy warning on `packages/ui/src/index.ts`

Follow-up risk:
- Phase 4 should be handled as its own careful project-detail pass because that page carries the densest readiness and workflow sequencing. Preserve all existing project links/actions and server-side readiness logic when adding `ActionBar`, `WorkflowBar`, and `ProjectStateSummary`.

## Decision-First UI Refactor Phase 4

Project Detail refactor completed as a UI-only contractor-app change in `apps/web/app/(app)/projects/[projectId]/page.tsx`.

Files changed:
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `docs/chat-handoff.md`

Inventory before editing:
- visible actions included Create Estimate, Generate contract when an approved estimate exists without a contract, Create appointment, Create deposit invoice when deposit is required and unsatisfied, Create invoice for completed uninvoiced jobs, primary next-action links, secondary next-action links, follow-up action queue links, financing-status save, project edit save, empty-state create links for appointments, punchlists, daily logs, and change orders, plus schedule handoff actions
- links included projects back link, estimates, contracts, appointments, jobs, punchlists, daily logs, change orders, progress billing, invoices, payments, leads, customers, time cards, schedule, and communications
- readiness and blocker messages included project readiness status, ready-to-schedule date, active blocker list, readiness-stage details, `nextAction.blockerCopy`, deposit/financing/readiness copy, scheduling handoff copy, and the financing form note
- related-record sections included estimates, contracts, appointments, estimate attachments, contract PDFs, jobs, punchlists, daily logs, change orders, progress billing, invoices, payments, field/time signal, project context, project continuity, production schedule, and related conversations
- server actions/forms used on the page remained `updateProjectAction` through the financing-status mini form and the existing `ProjectForm`
- conditional rendering included status/readiness badges, approved-estimate contract generation, deposit invoice creation, completed-job invoice creation, blocker/no-blocker state, readiness stages, empty states, schedule focus, related-record lists, and sidebar continuity cards

Exact UI behavior changed:
- `ActionBar` now appears directly under the existing project page header and carries the current primary next action, secondary action, readiness status, blocker copy, and customer/location meta
- `WorkflowBar` now appears below `ActionBar`, mapping the existing readiness-stage data into the project readiness workflow without changing readiness logic
- `ProjectStateSummary` now appears near the top, summarizing project, readiness, financial, and schedule state from existing computed values
- a new `CoreWorkflowSection` appears before the older readiness/execution/support content and prioritizes Estimate, Contract, Job, and Invoice cards with existing links/actions
- the former duplicate top overview/next-action stack was replaced by the new decision-first top stack
- the former Connected Workflow section was narrowed to Coordination appointments because estimate/contract/job/invoice continuity is now covered in the core workflow section
- Documents now uses `SupportSection`; Operations Hub now uses `ExecutionSection`

Behavior preserved:
- no data loading, server actions, forms, route architecture, permissions, readiness calculations, links, workflow guards, schema, auth, RLS, Supabase policy, estimates, contracts, jobs, invoices, portal, super-admin, dashboard, or global list pages changed
- project detail remains the primary workflow/readiness hub
- existing project detail actions and links remain visible where their original conditions apply

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed after removing dead code from the replaced overview stack
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- browser QA attempted against real project `/projects/cbb32597-59c6-424b-9c3c-77f2b40ba0d0` on `localhost:3000` using `playwright/.auth/local-user.json`, but the saved contractor auth session was stale and redirected to `/login?next=%2Fpeople`; no local `FLOORCONNECTOR_E2E_EMAIL` or `FLOORCONNECTOR_E2E_PASSWORD` values were present in `.env.local`, so authenticated project-detail browser QA is intentionally deferred until a fresh real contractor session is available

Intentionally deferred project-detail polish:
- no deeper visual tuning of lower support panels
- no click-through mutation testing of create/save actions without a fresh authenticated QA session
- no dashboard, estimates, invoices, jobs, contracts, portal, super-admin, or list-page changes

## Decision-First UI Refactor Phases 1-4 Review Pass

Full review and refinement pass completed for the Phase 1-4 decision-first UI work. This was a UI-only QA/refinement pass, not a new feature phase.

Files changed:
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `packages/ui/src/components/action-bar.tsx`
- `packages/ui/src/components/workflow-bar.tsx`
- `packages/ui/src/components/project-state-summary.tsx`
- `docs/chat-handoff.md`

Exact UI improvements made:
- Project header actions remain visible, but the duplicate orange `Create Estimate` header CTA was changed to a neutral secondary action so the `ActionBar` owns the dominant next action.
- Duplicate project/readiness status badges were removed from the project header because the same information is now present in `ActionBar` and `ProjectStateSummary`.
- `ActionBar`'s non-clickable next-action label now uses neutral styling instead of orange, preserving orange for the primary CTA.
- `WorkflowBar` current-step styling now uses amber status styling instead of orange primary-action styling.
- `ProjectStateSummary` active tone now uses amber status styling instead of orange primary-action styling.
- Project detail section overview eyebrow styling was neutralized to reduce decorative orange.
- The empty job card's create link now preserves the existing project-scoped jobs handoff path (`/jobs?projectId=...`) instead of introducing a broader query shape.

Behavior preserved:
- existing project detail actions and links remain visible where their original conditions apply
- no data loading, server actions, forms, permissions, route architecture, workflow guards, readiness calculations, schema, auth, RLS, Supabase policy, backend, dashboard, estimates, invoices, jobs, contracts, portal, super-admin, or list pages changed
- project detail remains the primary workflow/readiness hub

Validation:
- `pnpm typecheck` passed
- `pnpm lint` passed after removing one unused readiness badge helper made obsolete by the header cleanup
- `git diff --check` passed with exit code 0; it reported only LF-to-CRLF working-copy warnings
- authenticated Playwright QA passed on real project `/projects/797ec5b1-4417-4a36-934e-e82498efef5a`
  - login was completed through the app `/login` page using `FLOORCONNECTOR_E2E_EMAIL` and `FLOORCONNECTOR_E2E_PASSWORD` from root `.env.local`
  - project detail rendered `ActionBar`, `WorkflowBar`, `ProjectStateSummary`, `Core Workflow`, and the expected execution/support sections
  - `Create Estimate` navigated to the existing estimate manager context URL with project/customer/opportunity context preserved
  - the ActionBar `Review contract` link navigated from project detail to `/contracts/7d7b34bd-872a-4831-846b-6c99f500211f`
  - no browser console errors were captured during the pass
  - screenshot saved locally at `test-results/project-detail-review-pass.png`

Follow-up risks:
- lower project support panels can still receive normal iterative visual polish later, but no structural issue was found in this review
- `e2e/auth.setup.js` currently clicks the first submit button on `/login`, which is the Google flow; protected QA used a focused Playwright login path that targets the email/password submit button instead

## Post Visual System Audit

Documentation + functionality checkpoint completed in [docs/post-visual-system-audit.md](C:/FloorConnector/docs/post-visual-system-audit.md). The audit confirms the canonical lifecycle, `catalog_items` source-of-truth rule, estimate catalog snapshot insertion, invoice readiness guardrails, read-only `/settings/profile`, account menu wiring, and visual/layout passes remain aligned with the current implementation. Audit-only changes were made; no app code, schema, workflow, auth, permission, estimate, invoice, catalog, calculation, styling, or data behavior changed in this pass.

Confirmed follow-up from that audit has now been completed: stale current-state wording around estimate creation context was corrected, and invoice catalog wording now distinguishes implemented invoice-only manual catalog-backed adjustments from forbidden normal-scope catalog-to-invoice billing.

## Audit Documentation Corrections

Post-audit documentation corrections are complete. [docs/current-state.md](C:/FloorConnector/docs/current-state.md) now reflects the implemented estimate creation behavior: project-launched estimates pre-populate and lock the project and derived customer, global estimate creation requires customer plus project selection or creation, and validation preserves entered values. Invoice catalog language was clarified across current-state, developer source of truth, workflows, and the catalog-to-estimate/invoice spec: `catalog_items` remains canonical, estimate catalog insertion is implemented, invoice catalog usage is limited to explicit invoice-only manual catalog-backed adjustments, and free catalog insertion as normal invoice scope remains disallowed.

## Playwright E2E Browser QA Path

Focused Playwright browser QA infrastructure was added for protected contractor flows, starting with Phase B estimate-editor group-targeted catalog insertion. This is test infrastructure only: no app behavior, schema, auth/RLS, workflow, estimate calculation, invoice behavior, or catalog insertion logic changed.

- Playwright config now lives at [playwright.config.js](C:/FloorConnector/playwright.config.js).
- Auth setup lives at [e2e/auth.setup.js](C:/FloorConnector/e2e/auth.setup.js) and uses a real local contractor account through the normal `/login` flow. The setup project requires `FLOORCONNECTOR_E2E_EMAIL` and `FLOORCONNECTOR_E2E_PASSWORD`, saves `playwright/.auth/local-user.json`, and the protected Playwright project reuses that storage state for contractor app specs.
- The focused estimate spec lives at [e2e/estimate-group-catalog-insertion.spec.js](C:/FloorConnector/e2e/estimate-group-catalog-insertion.spec.js). It requires a safe draft estimate id/path and active non-system catalog item names supplied via environment variables.
- The manual estimate approval spec lives at [e2e/estimate-manual-approval-action.spec.js](C:/FloorConnector/e2e/estimate-manual-approval-action.spec.js). It uses the protected project and shared authenticated storage state, then records a real manual approval through the canonical estimate status-transition path.
- Minimal non-user-facing test ids were added to the Estimate Editoror group, group add-item, catalog search/select/add, catalog preview, and line-item row surfaces so browser QA can use DOM selectors instead of fragile coordinate clicks.
- Running instructions live at [docs/e2e-browser-qa.md](C:/FloorConnector/docs/e2e-browser-qa.md).

Dependency repair / validation status:
- The previous install issue was caused by stale running FloorConnector dev-server processes locking native `next` and `turbo` files while pnpm tried to reconcile `node_modules`.
- The local dependency tree was repaired by stopping only those FloorConnector dev-server process trees, removing workspace `node_modules` artifacts, and rerunning `pnpm install --config.offline=false --reporter=append-only`.
- Playwright is installed (`pnpm exec playwright --version` reports 1.59.1), and Chromium was installed with `pnpm exec playwright install chromium`.
- Validation now passes: `pnpm typecheck`, `pnpm lint`, and `git diff --check` all complete successfully. `git diff --check` reports line-ending warnings only.
- Playwright spec discovery works with the web server disabled: `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm exec playwright test --list` lists the setup project, unauthenticated fixture tests, and protected estimate specs.
- Authenticated e2e execution still requires local-only setup: `FLOORCONNECTOR_E2E_EMAIL` / `FLOORCONNECTOR_E2E_PASSWORD`, plus spec-specific data such as `FLOORCONNECTOR_E2E_DRAFT_ESTIMATE_ID` or path, active non-system catalog item names, or `FLOORCONNECTOR_E2E_MANUAL_APPROVAL_ESTIMATE_PATH`.

## Final Documentation Review

Final pre-next-phase documentation consistency review completed. Reviewed, in order: `docs/chat-handoff.md`, `docs/developer-source-of-truth.md`, `docs/current-state.md`, `docs/workflows.md`, `docs/Roadmap.md`, `docs/system-overview.md`, `docs/sales-to-production.md`, `docs/target-ia.md`, `docs/vision.md`, and `README.md`, with `docs/documentation-governance.md` checked for archival rules.

Corrections made were documentation-only:
- `docs/reporting-basics-plan.md` now clearly says the first `/reports` basics surface is implemented and that the plan is retained as guardrail/context, not an unstarted build plan.
- `docs/Roadmap.md` now identifies the current Phase B focus as validation and foundation hardening instead of implying first-pass scheduling, communications, reporting, and automation UI are still future work.
- `docs/system-overview.md` now distinguishes implemented first-pass `/communications`, `/schedule`, `/reports`, and Sales Tax Summary foundations from deeper target-only communication, dispatch, and analytics work.

Known remaining doc risks:
- several detailed implementation plans remain active because they still provide useful guardrails; they should be archived only after the next validation pass confirms they no longer prevent drift.
- no broad link rewrite was done; active source-of-truth docs still use absolute `C:/FloorConnector/...` links by convention.
- the next build phase should remain validation-first: run and record seed-free Phase B validation before adding feature breadth.

## System Rules

Keep these short rules in mind:
- no duplicate business models
- no portal-only copies of shared records
- no module-local silos
- workflow, lifecycle, creation-logic, or canonical-relationship changes must update relevant docs in the same change set, as applicable: `docs/developer-source-of-truth.md`, `docs/current-state.md`, and/or `docs/workflows.md`
- dashboards must point back into the shared chain
- Quick-Create must hand off into full workspaces
- project / shared record continuity stays more important than module completeness
