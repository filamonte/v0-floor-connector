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

## Fidelity And Deviations

Close to approved direction:

- Lighter work surfaces and warmer neutral background.
- Deep blue primary action system.
- Charcoal/zinc app chrome.
- Reduced orange/copper dominance through shared aliases and primary CTAs.
- Harder borders, lower shadows, and restrained radii.
- Inter typography and tabular numeric rendering.

Intentional deviations:

- The Stitch fixed desktop sidebar was not implemented as global navigation.
  The production decision for this slice preserves FloorConnector's
  top/header-based desktop navigation and interprets left rails as contextual
  workspace navigation only.
- No page-specific 70/30 rewrites were performed. Existing workspace wrappers
  were refined instead, because broad page layout changes would increase
  workflow risk.
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
