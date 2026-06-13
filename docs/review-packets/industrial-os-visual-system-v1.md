# Industrial OS Visual System V1

Status: Implementation slice
Date: 2026-06-12
Branch: `stream/industrial-os-visual-system-v1`
Worktree: `C:\FC-worktrees\industrial-os-visual-system-v1`
Base: `origin/main` at `b52a2d57`

## Purpose

Apply the first production-safe Industrial OS V2 visual-system layer through
shared tokens, shell chrome, workspace wrappers, action primitives, and status
helpers.

This is a presentation-only slice. It does not redesign workflows, rename
routes, change schema, add migrations, alter loaders, change server actions,
change auth or tenant rules, mutate portal access, or create new business data.

## Design Sources Reviewed

- `C:\Users\jfila\Downloads\floorconnector_industrial_os_v2_project_brief.md`
- `C:\Users\jfila\Downloads\stitch_industrial_os_v2_design_system (3).zip`
- `C:\Users\jfila\Downloads\stitch_industrial_os_v2_design_system (2).zip`
- `C:\Users\jfila\Downloads\stitch_industrial_os_v2_design_system (1).zip`

Zip (3) supplied the production handoff. Zip (2) supplied severity notes for
estimates, financials/invoicing, invoice review, and cost items. Zip (1) was
available for earlier references but was not needed for implementation
decisions.

## Approved Visual Decisions Applied

- Inter is now the production UI font.
- Deep blue `#005EB8` is the primary action and active-state token.
- The existing `--copper` variable is preserved as a compatibility alias but
  now resolves to the Industrial OS primary blue.
- Warm white, slate, zinc, and charcoal tokens replace the previous
  copper-heavy theme values.
- Semantic green, amber, red, and blue remain reserved for actual status
  meaning.
- Shared card, action, workspace, and overlay primitives moved toward restrained
  `4px` to `6px` radii, one-pixel borders, and minimal shadows.
- The global navigation model remains top/header-based. Contextual workspace
  rails remain local workspace navigation only.

## Token Direction

The implementation uses the existing FloorConnector token surface so the change
propagates through current components without duplicating styling systems:

- `apps/web/app/globals.css`
- `apps/web/tailwind.config.ts`
- `packages/ui/src/theme.ts`
- `packages/ui/src/status.ts`

The legacy Graphite/Copper names are intentionally left in place as migration
aliases because many shared components already reference them. Their values now
map to Industrial OS V2 charcoal/slate/blue decisions.

## Visual Changes Made

- Replaced Manrope/Prata with Inter in the root app layout.
- Removed decorative radial background treatment from the global body surface.
- Shifted global background to warm white/stone/slate.
- Updated primary action, focus, active, and Tailwind brand colors to
  `#005EB8`.
- Reworked contractor top nav treatment to charcoal/zinc with blue active
  states and lower-noise utility links.
- Updated shared workspace wrappers, summary bands, command bars, quick-create
  chrome, status badges, and reusable sections to use sharper borders, lower
  shadow, calmer surfaces, and less rounded chrome.
- Updated portal and settings chrome to inherit the Industrial OS foundation
  while preserving their existing ownership boundaries.
- Updated Universal Create to use the shared primary token instead of hardcoded
  orange.

## Follow-Up Intensification Pass

After the first technical pass, the local app still read too much like a light
admin surface. The follow-up pass stayed on the same branch/worktree and made
the dashboard entry materially more distinct without changing workflow behavior:

- First-login `/dashboard` ownership and operating-health bands now use a
  deep-blue/charcoal command surface instead of white cards.
- Dashboard metrics use stronger numeric scale, cooler blue markers, and a
  darker first-viewport hierarchy.
- Shared dashboard panels and manager cards use lighter white surfaces,
  subtler borders, lower shadows, and cooler action links.
- Shared status pills and action primitives moved closer to the approved
  deep-blue/neutral system, reducing amber/orange dominance outside explicit
  semantic alerts.
- The Stitch direction is interpreted through FloorConnector's existing
  top-nav-first architecture rather than copied pixel-for-pixel.

## Same-Branch Composition Correction Pass

The user review after the intensification pass found that the app still felt
too heavy and insufficiently organized. This same-branch correction focused on
composition, local navigation behavior, and representative manager/workspace
organization while preserving the same routes, data, loaders, actions, schema,
and canonical workflow boundaries.

Implemented Stitch / Industrial OS layout ideas:

- Workspace Framework pages now use a 280px contextual section rail on desktop,
  matching the approved local-nav intent without turning it into global app
  navigation.
- Workspace section navigation stays route/query-backed where the workspace
  already uses `?view=` patterns. Active view state is visible and exposed via
  `aria-current` / `data-active` markers for browser checks.
- Mobile workspace navigation now appears as labeled horizontal section tabs
  instead of tiny icon-only left navigation.
- Shared workspace headers use clearer document-like title hierarchy, more
  whitespace, and fewer rounded/shadowed card effects.
- Sales Manager composition is cooler and more tabular: blue primary action,
  blue-neutral filters/statuses, slate table headers, and reduced warm/copper
  treatment.
- Dashboard action queues no longer compress into five narrow columns at
  laptop width; the layout wraps into wider, more readable queue panels before
  expanding at very wide desktop sizes.

Intentionally not implemented:

- The Stitch global fixed desktop sidebar remains excluded. FloorConnector keeps
  its approved top/header-based global navigation; left rails are contextual
  only.
- Invoice Review was not rebuilt into the full 900px document plus persistent
  HUD pattern in this pass. That remains a higher-risk dedicated follow-up.
- Schedule/CrewBoard was not structurally rewritten. It needs a focused
  calendar/workboard composition pass to safely preserve scheduling behavior.

## Fidelity And Deviations

Close to approved direction:

- Lighter work surfaces and warmer neutral background.
- Deep blue primary action system.
- Charcoal/zinc app chrome.
- Reduced orange/copper dominance through shared aliases and primary CTAs.
- Harder borders, lower shadows, and restrained radii.
- Inter typography and tabular numeric rendering.
- Contextual workspace section rail and mobile section tabs now align more
  closely with the Stitch workspace composition.
- Manager surfaces are less warm, less card-heavy, and closer to the
  high-density table direction.

Intentional deviations:

- The Stitch fixed desktop sidebar was not implemented as global navigation.
  The production decision for this slice preserves FloorConnector's
  top/header-based desktop navigation and interprets left rails as contextual
  workspace navigation only.
- Only representative 70/30 workspace composition was applied through shared
  `StandardWorkspaceLayout`. Broader page-family rewrites are deferred where
  they would increase workflow risk.
- Existing `--copper` variable names remain as aliases to avoid churn across a
  broad codebase.

## No-Data-Silo Confirmation

No duplicate data structures, duplicate workflow records, visual-only models,
fake summaries, fake statuses, schema changes, migrations, or local-only
persistence were added. The slice changes presentation over existing canonical
records only.

## Production-Safety Review

- Route architecture changed: no.
- Schema or migration changed: no.
- Duplicate data model or visual-only data source created: no.
- Action handlers or server actions changed: no.
- Auth, tenant, portal, admin, or super-admin guards changed: no.
- Destructive/protected actions made more prominent: no new destructive action
  treatment was introduced.
- Customer portal internal-data exposure risk: no loader or portal visibility
  changes were made.
- Horizontal overflow at checked widths: none found on checked routes at
  `1366px` or `390px`.
- Console/runtime errors on checked pages: none captured.
- Validation status: passed targeted validation listed below.
- Conveyor/automation usage: `pnpm.cmd worktree:create` created the stream and
  ran `devtools:link` plus `worktree:doctor`; repo-local Prettier/validation
  commands are used for this slice.

## Product Potential Issues Found

- Some page-specific surfaces still contain older hardcoded orange values and
  large radii. This slice reduces the dominant shared system color but does not
  manually restyle every route.
- Estimate and invoice review still need deeper page-family layout work to
  reach the approved technical-document and billing-HUD targets.
- Cost items still need a search-first, mobile list-card follow-up if the next
  visual slice focuses on catalog usability.
- CrewBoard still needs a dedicated workboard/calendar composition pass; this
  correction preserves scheduling behavior and does not reorganize the schedule
  data model or action panel.
- Settings is closer to the approved owner-section model, but still needs a
  dedicated cleanup if the team wants the full Stitch settings composition.
- The Graphite/Copper variable names are now compatibility aliases. A later
  cleanup can rename tokens after visual stabilization, but this slice avoided
  broad churn.

## Tools Used And Unavailable

Used:

- Local PowerShell, git, rg, repo docs, repo scripts, and repo-local Prettier.
- Browser plugin capability via Node/Playwright path for local browser checks.
- Local design files from Downloads and temp extraction for Stitch handoff
  review.

Exposed but not used:

- Figma capture tools were exposed, but no Figma file key was provided and no
  code-to-Figma artifact was required.
- Supabase, Stripe, Vercel, Linear, Slack, Notion, GitHub connector, Chrome,
  Computer Use, Render, Codex Security, OpenAI Developers, HyperFrames, and
  Responsive were available or selected by the user, but this slice did not need
  remote system mutation or external resource inspection.

## Three-Page Fidelity Proof Pass

The strategy changed from broad polishing to three high-fidelity reference
implementations. This pass keeps the same branch and worktree and treats these
routes as the reference candidates for later app-wide refactor:

- `/dashboard` as the Command Center pattern.
- `/leads/[leadId]` as the Opportunity Workspace pattern.
- `/settings` and `/settings/organization` as the Company Controls /
  Configuration pattern.

### Dashboard Reference Implementation

Stitch reference used:

- `contractor_dashboard_industrial_os_v2/screen.png`
- `contractor_dashboard_industrial_os_v2/code.html`
- `industrial_os_v2_production_handoff.md`

Current problem addressed:

- The prior dashboard had improved colors but still opened as stacked admin
  cards instead of an operational command deck.

Implemented:

- A single first-viewport `Command Center` deck with dark industrial shell,
  operating posture, four real KPI tiles, action lanes, and a `Needs attention`
  rail.
- KPI values continue to come from the existing dashboard header, metrics, and
  priority read models.
- Action lanes continue to come from existing dashboard action queues.
- First-login `StartHereCard` remains real and appears inside the command deck
  only when the existing onboarding data requires it.
- Lower dashboard operational queues remain available below the command deck.

Could not safely implement:

- The Stitch fixed global desktop sidebar was not implemented. FloorConnector's
  approved global navigation remains top/header based.

Deviation from Stitch:

- The composition uses the Stitch command-center hierarchy and 70/30 attention
  rail, but keeps FC top navigation and existing route/action ownership.

Ready as pattern:

- Yes for the command-center first viewport. Broader dashboard queue
  rationalization should wait for visual approval.

### Opportunity Workspace Reference Implementation

Stitch reference used:

- `sales_manager_industrial_os_v2/screen.png`
- `job_detail_industrial_os_v2_codex_ready/screen.png`
- `industrial_os_v2_production_handoff.md`

Current problem addressed:

- The lead detail route had real Workspace Framework V2 navigation, but still
  read as stacked cards and duplicated the guided next action above the
  workspace.

Implemented:

- Added an opt-in `industrial-reference` variant to
  `StandardWorkspaceLayout`.
- Applied that variant only to `/leads/[leadId]`.
- The page now uses a dark workspace header, query-backed contextual section
  rail, mobile horizontal section tabs, and a stronger support rail.
- The guided next action now lives in the contextual rail instead of duplicated
  in a large summary band.
- Opportunity status, site assessment state, estimate handoff, work items, and
  directory context remain backed by existing lead data and actions.

Could not safely implement:

- No separate Opportunity Workspace screenshot was present in the local Stitch
  zip files. The implementation used Sales Manager plus Job Detail / Workspace
  references as the closest available local Stitch sources.

Deviation from Stitch:

- The route preserves the existing FC section list and forms. The shell is
  closer to Stitch, but the internal cards remain production forms/actions from
  the current app.

Ready as pattern:

- Directionally yes for complex workspaces. The opt-in layout variant should
  remain limited to reviewed pages until the user approves the reference.

### Settings Reference Implementation

Stitch reference used:

- `settings_industrial_os_v2_desktop/screen.png`
- `settings_industrial_os_v2_desktop/code.html`
- `industrial_os_v2_production_handoff.md`

Current problem addressed:

- Settings had real setup health, but still felt too warm, dense, and
  settings-index-like.

Implemented:

- Settings now uses the neutral Company Controls shell with blue context
  marker.
- The setup health and next setup actions compose as a 70/30 control panel
  using existing tenant, organization, membership, template, catalog, team, and
  workflow data.
- Owner sections are lighter, sharper, and less warm.
- The existing settings local navigation remains route-backed and contextual.

Could not safely implement:

- No fake setup score, fake integration state, or fake module readiness was
  added. Stitch elements without a real FC source were omitted.

Deviation from Stitch:

- FC keeps its top global navigation and existing settings routes. The Stitch
  fixed sidebar is interpreted as contextual settings navigation only.

Ready as pattern:

- Yes for Company Controls overview and settings local-nav structure, pending
  visual approval.

### Fidelity, Safety, And Refactor Recommendation

- Real FC data, loaders, actions, auth, tenant checks, routes, portal
  boundaries, and workflow ownership were preserved.
- No schema, migration, route, loader, server action, auth, tenant, portal,
  payment, signature, scheduling, or workflow behavior changed.
- No duplicate models, fake summaries, fake statuses, visual-only records, or
  parallel workflow state were introduced.
- The local browser check initially reproduced a stale `settings/layout`
  ChunkLoadError after the layout edit. Clearing only `apps/web/.next` and
  restarting the dev server resolved it; the rerun passed without ChunkLoadError
  or console/page errors.
- Recommendation: do not refactor the rest of the app yet. Review these three
  reference pages first, then apply the approved page-family patterns in a
  separate implementation slice.

Unavailable or skipped:

- No Stitch MCP/browser node was needed because the local handoff zip files were
  available and sufficient.
- No Supabase inspection was run because schema/data access did not change.
- No Vercel preview inspection was run because no PR/preview was created in
  this local implementation slice.

## Files Changed

Application and shared UI:

- `apps/web/app/layout.tsx`
- `apps/web/app/globals.css`
- `apps/web/tailwind.config.ts`
- `apps/web/app/(portal)/portal/layout.tsx`
- `apps/web/components/contractor-app-shell.tsx`
- `apps/web/components/protected-app-top-nav.tsx`
- `apps/web/app/(app)/leads/page.tsx`
- `apps/web/components/contractor-workspace-page.tsx`
- `apps/web/components/manager-dashboard-card.tsx`
- `apps/web/components/organization-brand-link.tsx`
- `apps/web/components/quick-create-form-shell.tsx`
- `apps/web/components/record-workspace-shell.tsx`
- `apps/web/components/settings-surface-layout.tsx`
- `apps/web/components/sign-out-form.tsx`
- `apps/web/components/universal-create-menu.tsx`
- `apps/web/components/workspace-command-bar.tsx`
- `apps/web/components/workspace-summary-band.tsx`
- `apps/web/components/workspace/standard-workspace-layout.tsx`
- `apps/web/components/dashboard/contractor-dashboard-surface.tsx`
- `packages/ui/src/theme.ts`
- `packages/ui/src/status.ts`
- `packages/ui/src/components/action-bar.tsx`
- `packages/ui/src/components/app-shell.tsx`
- `packages/ui/src/components/primary-section.tsx`
- `packages/ui/src/components/secondary-section.tsx`

Docs:

- `docs/review-packets/industrial-os-visual-system-v1.md`
- `docs/chat-handoff.md`
- `docs/current-state.md`

## Screens Checked

Browser checks ran against the local dev server at `http://localhost:3004` with
saved Playwright auth states.

Desktop `1366px` and mobile `390px`:

- `/dashboard`
- `/leads`
- `/leads/b497db9d-9f4d-4cd0-ac72-43817cabb308`
- `/projects`
- `/projects/fe0ba4e8-97c2-4765-9259-c6de6344d82c`
- `/invoices/c3b636bf-78e7-40a8-ad32-31f4568b961f`
- `/schedule`
- `/settings`
- `/dashboard?capture=1#universal-capture`
- `/portal`

Results:

- HTTP 200 on all checked routes.
- No horizontal overflow at `1366px` or `390px`.
- No console warnings/errors captured.
- No page errors captured.
- Screenshots saved under
  `test-results/industrial-os-visual-system-v1/`.

## Validation

Passed:

- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- `pnpm.cmd fc:preflight:fast`
- `pnpm.cmd e2e:smoke:auth`
- `pnpm.cmd --filter @floorconnector/ui test`
- `node .\node_modules\prettier\bin\prettier.cjs --write <changed files>`
- `git diff --check`
- browser checks at `1366px` and `390px` on the listed routes

## Remaining Gaps

- Deeper Estimate Review and Invoice Review layout-family work remains a
  follow-up slice.
- Cost Items search-first/mobile card treatment remains a follow-up slice.
- Older hardcoded route-local orange/focus values remain outside the shared
  system layer.
- A later token-name cleanup can rename `--copper` after the product settles on
  Industrial OS V2 naming.

## Recommended Next Visual Slice

Run a focused `industrial-os-review-screens-v1` slice for Estimate Review and
Invoice Review. Keep it presentation-only over existing estimate, invoice,
payment, and document-readiness data, and target the 900px technical document
container plus 70/30 billing/status HUD pattern described in the production
handoff.

## Direct Stitch Composition Fidelity Pass

Date: 2026-06-12

Branch/worktree:

- Branch: `stream/industrial-os-visual-system-v1`
- Worktree: `C:\FC-worktrees\industrial-os-visual-system-v1`

### Scope

This pass tightened the already-stabilized Industrial OS branch toward the
Stitch production handoff composition without changing routes, loaders,
server actions, auth, tenant guards, portal visibility, schema, migrations, or
business workflows.

Pages and shared surfaces changed:

- Dashboard / first-login command center
- Sales / Leads Manager
- Opportunity Workspace / Lead detail
- Project Workspace / Project detail
- Settings layout and settings nav
- Universal Capture surface styling
- Shared manager/workspace card, summary, and command primitives

### Page Composition Changes

- Dashboard now uses a cooler neutral app background, a darker command-metric
  band, lighter hard-border panels, blue-led focus/action states, and places
  the existing onboarding `StartHereCard` immediately after operating health so
  first-login or forced onboarding states read as a distinct setup moment.
- Leads Manager keeps the existing `/leads` route, filters, query parameters,
  quick-create sheet, and canonical opportunity records while making the page
  read more like a dense manager table: white KPI cells, hard borders,
  blue-led filters/actions, and less warm card treatment.
- Opportunity Workspace keeps the existing `/leads/[leadId]` route and
  `?view=` behavior while renaming contextual sections toward the approved
  workflow language: `Qualification / Intake`, `Assessment`,
  `Estimate Handoff`, and `Work Items / Follow-up`.
- Project Workspace keeps the existing `/projects/[projectId]` route and
  `?view=` behavior while aligning the contextual section label
  `Assessment / Scope` with the target project-workspace language.
- Settings keeps the existing settings layout/loader/nav items while shifting
  the shell to the Stitch dark header, blue active nav, 272px contextual rail,
  and lighter white configuration cards.
- Universal Capture keeps the existing Work Item-only fallback and appointment
  prefill routing while removing warm focus states and heavy shadow treatment.

### Local Nav Behavior

- No global desktop sidebar was added. Desktop global navigation remains the
  existing top/header app shell.
- No mobile left rail was added. Mobile workspace navigation remains compact,
  horizontally scrollable contextual section controls inside the workspace.
- Workspace and settings left rails remain contextual only. They use existing
  route/query/path-backed active state and are not decorative duplicates of
  global navigation.
- Browser checks confirmed active contextual nav state on one project detail
  route, one lead detail route, and settings at `1366px` and `390px`.

### Stitch Fidelity Notes By Page

- Dashboard: closer to Stitch command-center structure through the dark
  operating canvas, hard metric grid, and immediate action queues. Deviation:
  the existing FloorConnector global top nav is preserved instead of the Stitch
  fixed desktop sidebar.
- Leads Manager: closer to Stitch manager table density with neutral surfaces,
  hard borders, and blue filter/action emphasis. Deviation: existing
  FloorConnector command bar and PerspectiveSwitcher are reused to preserve
  query behavior and role/perspective semantics.
- Opportunity Workspace: closer to Stitch guided workspace taxonomy through
  contextual section language and the shared workspace shell. Deviation: no new
  decorative process rail or duplicate sales workflow data was added.
- Project Workspace: closer to Stitch 70/30 workspace behavior through the
  shared shell and context rail. Deviation: existing project readiness,
  commercial, production, financial, and activity sections remain the owning
  implementation surfaces.
- Settings: closer to Stitch settings composition through the dark control
  header, contextual left nav, and hard white configuration cards. Deviation:
  existing nav groups and admin filtering remain unchanged.
- Universal Capture: closer to Stitch overlay tone through lighter hard-border
  styling and blue focus states. Deviation: the existing inline dashboard
  capture section is preserved because changing overlay mechanics would touch
  interaction behavior beyond this visual slice.

### No-Data-Silo Confirmation

This pass added no fake data, local-only persistence, duplicate lead/project/
invoice/payment records, schema changes, migrations, loaders, actions, auth
changes, tenant changes, portal-only copies, or workflow silos. All changed
surfaces continue to render existing canonical records and existing action
targets.

### Production Safety Confirmation

- Route changes: none.
- Schema/migration changes: none.
- Loader/server-action changes: none.
- Auth/tenant/portal/admin guard changes: none.
- Payment/signature/scheduling behavior changes: none.
- Fake/demo data additions: none.
- Universal Capture persistence behavior changes: none.

### Screens Checked

Browser checks used the restarted local dev server at
`http://localhost:3004` with saved authenticated Playwright state.

Desktop `1366px` and mobile `390px`:

- `/dashboard`
- `/projects`
- `/projects/fe0ba4e8-97c2-4765-9259-c6de6344d82c`
- `/settings`
- `/leads`
- `/leads/b497db9d-9f4d-4cd0-ac72-43817cabb308`
- `/invoices/c3b636bf-78e7-40a8-ad32-31f4568b961f`
- `/schedule`
- `/portal`
- `/dashboard?capture=1#universal-capture`

Results:

- HTTP 200 on all checked routes.
- No `ChunkLoadError`, loading-chunk text, or runtime error text.
- No console/page errors captured.
- No horizontal overflow at either viewport.
- Local nav active state present on lead detail, project detail, and settings.

Screenshots saved under
`test-results/industrial-os-visual-pass/`.

## Opportunity Workspace Figma Fidelity Pass

Date: 2026-06-13

Figma reference:

- Board:
  `https://www.figma.com/design/N0tVE3uKWpHZc4dlF6ytgn`
- Frame used: `REVIEW / Opportunity Workspace / Desktop` on
  `03 Side-by-Side Gap Review`

### Gaps Addressed

- Collapsed the duplicate Opportunity identity zone. The record title and
  primary route actions now live in the top workspace header only.
- Replaced the repeated overview title panel with a compact guided sales
  workflow surface that links to Qualification / Intake, Assessment, and
  Estimate Handoff using the existing `?view=` query model.
- Converted the right support stack toward a command rail: the status control
  now uses the blue token set, the next-action panel is labeled as the command
  rail, and the rail stays separate from record identity.
- Tightened the first viewport by expanding the summary band to real status,
  inspection, estimate-writer, and linked-work signals.
- Updated `StandardWorkspaceLayout` so contextual workspace navigation is
  sticky on mobile and desktop, query-backed, and still local to the workspace
  rather than a global nav replacement.

### Production Safety

- No schema, migration, loader, server-action, auth, tenant, portal, payment,
  signature, scheduling, or route behavior changed.
- No fake data or duplicate opportunity/customer/project/estimate/work-item
  structures were introduced.
- The route remains `/leads/[leadId]`, and Opportunity Workspace section
  switching remains backed by the existing `?view=` query parameter.

### Deviations

- The approved Stitch sales reference is denser and more table-led than the
  live FloorConnector opportunity route. This pass preserves existing section
  ownership and forms instead of replacing them with a decorative process rail.
- Some deeper page-local cards still use older large radii. Those are left for
  a broader component-normalization pass so this slice stays focused on the
  first-viewport and command-rail mismatch.

### Remaining Gaps

- The deeper Qualification, Assessment Package, Communication, Work Items, and
  Activity views still contain older local card rhythm in places.
- Mobile should be rechecked after the next protected-route screenshot pass to
  confirm the sticky contextual tabs remain comfortable with live data density.

### Next Target Recommendation

Dashboard was selected as the next Figma fidelity target before Settings
because the board showed Settings was already close to the approved
control-room pattern, while Dashboard still had the larger first-viewport
command deck and queue-density composition gap.

## Dashboard Figma Fidelity Pass

Date: 2026-06-13

Figma references:

- Board:
  `https://www.figma.com/design/N0tVE3uKWpHZc4dlF6ytgn`
- Frames used on `03 Side-by-Side Gap Review`:
  `REVIEW / Dashboard / Desktop`, `APPROVED / Dashboard / Desktop`,
  `CURRENT / Dashboard / Desktop`, `REVIEW / Dashboard / Mobile`,
  `APPROVED / Dashboard / Mobile`, and `CURRENT / Dashboard / Mobile`.

### Gaps Addressed

- Strengthened the first-screen Command Center composition without changing
  dashboard data sources.
- Reworked the top dashboard command deck into a clearer desktop 70/30 layout:
  existing action lanes and KPI cards on the main side, isolated Needs
  Attention rail on the right.
- Tightened the KPI/action band by moving it into the command deck instead of
  leaving it as a separate passive strip above the action lanes.
- Isolated the Needs Attention rail with a white rail treatment and blue
  `#005EB8` command accent.
- Reduced first-viewport clutter by limiting the top command deck to the
  highest-signal two action lanes and two attention records; the broader queues
  continue to render lower on the page from the same real records.
- Moved passive ownership and utility cards below the main operating blocks so
  lower-priority sections no longer compete with the opening command deck.
- Shortened the mobile opening viewport by using a compact account-status link
  and placing Needs Attention plus the action queue before passive metric and
  utility content.

### Production Safety

- No schema, migration, route, loader, server-action, auth, tenant, portal,
  admin, payment, signature, scheduling, or business-logic behavior changed.
- No fake KPIs, fake AI, fake health scores, fake statuses, demo cards,
  duplicate queues, local persistence, or dashboard-owned records were added.
- Early access/account status remains present in the command center; Universal
  Capture remains controlled by the existing `/dashboard?capture=1` entry.

### Deviations

- The approved Stitch desktop reference uses a fixed-rail app shell. The live
  FloorConnector app preserves the existing top/header global navigation, per
  stream scope.
- The mobile command deck still contains real queue cards rather than a
  bespoke mobile-only queue component. This preserves existing dashboard links
  and source-record actions while making the opening viewport action-first.
- The full dashboard still renders deeper operating blocks, lifecycle,
  Operational Cockpit, My Work, and workflow queues below the command deck
  because those sections are real current dashboard surfaces.

### Remaining Gaps

- Further mobile compression could move the first two action lanes into a
  dedicated compact list component, but that would be a broader dashboard
  component pass.
- Some lower dashboard sections still use older card rhythm and can be
  normalized during a future shared dashboard/manager primitive pass.
- The top/header global navigation remains visually different from the
  fixed-rail approved Stitch reference by design.

### Next Target Recommendation

Run `industrial-os-review-screens-v1` next for Estimate Review and Invoice
Review. After that, run a CrewBoard/schedule-board composition slice so the
schedule workboard catches up to the command-center and workspace patterns.

### Validation

Passed:

- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- `pnpm.cmd --filter @floorconnector/ui test`
- `pnpm.cmd fc:preflight:fast`
- `pnpm.cmd e2e:smoke:auth`
- `git diff --check`
- `git diff --cached --check`
- `pnpm.cmd worktree:doctor`
- Browser matrix at `1366px` and `390px`

### Remaining Gaps

- Invoice Review and Estimate Review still need the dedicated review-screen
  page-family slice.
- CrewBoard and schedule-board composition still need a future dedicated
  workboard/calendar slice.
- Some older page-local large radii remain in deeper nested route content where
  changing them broadly would increase review surface.

### Recommended Next Page-Family Slice

Run `industrial-os-review-screens-v1` next for Estimate Review and Invoice
Review. Keep it presentation-only over existing canonical estimate, invoice,
payment, and document-readiness records, and target the Stitch 900px document
review container plus 70/30 billing/status HUD pattern.
