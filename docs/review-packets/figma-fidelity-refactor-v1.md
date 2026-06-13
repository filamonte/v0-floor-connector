# Figma Fidelity Refactor V1

Status: Implementation slice
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

## Next Recommendation

Run the next slice on Schedule / CrewBoard, then Invoice Review and Estimate
Review. Those surfaces have distinct workflow density and should not be folded
into this broad shell/list/workspace refactor.
