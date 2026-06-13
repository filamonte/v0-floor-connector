# Figma Fidelity Refactor V1

Status: Review gate complete
Date: 2026-06-13
Branch: `stream/figma-fidelity-refactor-v1`
Worktree: `C:\FC-worktrees\figma-fidelity-refactor-v1`
Base: `origin/main` at `377e18e2`

## Purpose

Move the merged Industrial OS Visual System V1 foundation closer to the
approved Figma Industrial OS V2 direction across the protected shell, Projects,
Leads / Opportunity, Project Workspace, Settings, Universal Capture, and Portal
surfaces without changing real FloorConnector workflow behavior.

This is presentation-only. It does not change schema, migrations, route files,
loaders, server actions, auth, tenant isolation, portal grants, financial math,
signature behavior, scheduling behavior, or canonical data ownership.

## Figma References Used

Source file: `https://www.figma.com/design/N0tVE3uKWpHZc4dlF6ytgn`

Frames inspected through Figma MCP:

- `28:4` - `APPROVED / Dashboard / Desktop`
- `28:8` - `APPROVED / Opportunity-adjacent Sales Manager / Desktop`
- `28:12` - `APPROVED / Settings / Desktop`
- `28:16` - `APPROVED / Universal Capture / Desktop`
- `28:20` - `APPROVED / Dashboard / Mobile`
- `28:24` - `APPROVED / Universal Capture / Mobile`
- `28:28` - `APPROVED / Portal / Desktop`
- `28:32` - `APPROVED / Portal / Mobile`

The Figma board did not expose separate approved Project / Job detail frames in
the metadata available to this run, so Project Workspace changes adapt the
approved command rail, hard-border panel, and action-first mobile patterns from
the Dashboard, Settings, Opportunity-adjacent, and Portal references.

## Gaps Addressed

- Protected shell now exposes a richer Projects command menu using existing
  routes only.
- Projects list reads more like a Project Command surface, with a stronger
  first table region and clearer real status filters.
- Leads list now uses the same dark command deck posture as Projects, with a
  tighter KPI band and a clearer Sales Command surface.
- Shared workspace layout now uses a stronger 70/30 header composition on
  desktop.
- Project and Opportunity Workspace command rails move before detail content on
  mobile, matching the Figma action-first mobile direction.
- Settings organization defaults use the blue `#005EB8` palette instead of
  the older copper placeholder.
- Shared Industrial OS primitives have slightly tighter borders, command deck,
  KPI band, and command rail helpers for later page-family slices.

## Review Verdict

This branch is directionally ready for PR as a presentation-only visual
foundation pass. The hard review did not find critical regressions requiring
code changes before PR.

The review rechecked the approved Figma frames through Figma MCP and browser
tested the implemented app at `1366px` and `390px` on a dedicated local server
for this worktree. Header consistency, Projects command-menu behavior,
Dashboard lens behavior, Universal Capture entry, local active states,
protected-route rendering, portal customer-safe copy, favicon status, and
horizontal overflow all passed.

## Issues Found

- Projects, Leads, Project Workspace, Opportunity Workspace, and Settings are
  materially closer to the approved Industrial OS direction, but mobile still
  carries large dark header zones and long record titles that consume much of
  the opening viewport.
- Leads Manager is now a Sales Command surface, but the opportunity table still
  appears in the first viewport on desktop because the real dataset is large
  and the current route still needs direct record access.
- Portal is customer-safe and aligned to the hard-border / action-first
  pattern, but it does not yet match the approved portal frame's dark left rail
  composition.
- The protected header is consistent across tested routes. On non-project
  routes, the Projects command displays the existing recent-project launcher
  label when session state is present; this preserves current behavior while
  adding the command menu.

## Fixes Made During Review

No app-code fixes were made during the review gate. The only post-review change
was this review-packet update.

## Production Safety

- No new fake KPIs, statuses, AI claims, queues, persistence, or source tables.
- No duplicate customer, opportunity, project, estimate, contract, job,
  invoice, payment, portal, communication, scheduling, or AI models.
- Protected shell changes use only existing route links and existing session
  recent-project state.
- Projects and Leads pages still consume the existing read models, loaders,
  quick-create actions, filters, and canonical links.
- Settings organization form still posts to the existing
  `updateOrganizationProfileAction`.
- Universal Capture and Portal were inspected against Figma but left largely on
  their existing Industrial OS primitives because PR #41 already aligned them
  and this pass did not need new behavior.

## Deviations

- Figma uses a fixed left app sidebar. FloorConnector intentionally keeps the
  existing top/header global shell and contextual rails only, per product
  governance and the current app architecture.
- Figma references include visual AI/contextual assistant language. This pass
  does not add fake AI surfaces or AI-owned state; existing deterministic
  guidance remains unchanged.
- Project / Job detail fidelity is adapted from adjacent approved command
  patterns because no separate Project / Job Figma frames were available in the
  inspected board metadata.
- This pass does not expand Schedule / CrewBoard, Invoice Review, Estimate
  Review, Assessment Workspace, or Estimate Workspace beyond smoke coverage.
- Mobile headers remain taller than the approved mobile references where real
  FloorConnector record names are long. Compressing those titles should be a
  focused mobile refinement rather than an incidental change in this review
  gate.
- The portal keeps the current customer-safe portal architecture instead of the
  approved frame's full dark left-rail shell. A portal-specific slice should
  own that composition change.

## Remaining Gaps

- Schedule / CrewBoard still needs a dedicated Industrial OS calendar and crew
  command slice.
- Invoice Review and Estimate Review need their own Figma-driven commercial
  document workspace pass.
- Assessment Workspace needs a focused mobile-first capture and estimator
  handoff pass.
- The global shell can later add real recent-project data when a safe header
  loader exists; this pass intentionally stayed with the existing
  session-backed recent project and static links.
- Mobile command headers for Project and Opportunity workspaces should get a
  title-compression pass.
- Leads Manager should get a follow-up pass that makes qualification,
  follow-up, site-visit, and estimate-handoff lanes more visible before the
  full table.

## Browser Review Evidence

Dedicated review server: `http://localhost:3111`

Discovered real records used for detail smoke:

- Lead detail: `/leads/1b441af7-2ef0-491c-8a52-dc1ed32660d3`
- Project detail: `/projects/fe0ba4e8-97c2-4765-9259-c6de6344d82c`
- Invoice detail: `/invoices/12be9e05-2171-428e-a280-8fe6aeb9e035`

Routes checked at `1366px` and `390px`:

- `/dashboard`
- `/dashboard?capture=1#universal-capture`
- `/projects`
- one Project Workspace route
- `/leads`
- one Opportunity Workspace route
- `/settings`
- `/settings/organization`
- `/portal`
- `/schedule`
- one Invoice Workspace route

Browser results:

- HTTP 200 on all tested routes.
- No login redirects after saved-auth warmup.
- No `ChunkLoadError`.
- No console or page errors.
- No favicon errors; `/favicon.ico` returned 200.
- No horizontal overflow at either tested width.
- Dashboard lenses were present and clickable for Today, Needs Attention,
  Sales, Projects, Field, Money, and Follow-ups.
- Universal Capture opened from `/dashboard?capture=1#universal-capture`.
- Projects command menu opened on desktop and used existing routes only.
- Local active states rendered on Projects, Project Workspace, Leads,
  Opportunity Workspace, Settings, Settings Organization, Schedule, and Invoice
  routes.
- Portal stayed customer-safe and scoped to explicitly shared records.

## No Data Loss / No Silo Confirmation

This review confirmed the branch remains presentation-only over existing
FloorConnector data and actions. It adds no schema, migrations, route renames,
loaders, server actions, tenant/auth behavior, portal grants, payment/signature
logic, scheduling behavior, provider mutation, fake records, fake statuses,
fake KPIs, fake AI claims, local-only workflow persistence, dashboard-owned
state, lead-owned project state, or duplicate invoice/project models.

## Next Recommendation

Run the next slice on Schedule / CrewBoard, then Invoice Review and Estimate
Review. Those surfaces have distinct workflow density and should not be folded
into this broad shell/list/workspace refactor.
