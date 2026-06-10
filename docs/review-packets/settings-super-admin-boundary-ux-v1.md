# Settings Super Admin Boundary UX V1

Status: Implementation stream
Date: 2026-06-10
Branch: `stream/settings-super-admin-boundary-ux-v1`
Worktree: `C:\FC-worktrees\settings-super-admin-boundary-ux-v1`
Wave: `ux-beta-readiness-v1`

## Scope

Clarify the UX boundary between contractor Settings / Company Controls and
Super Admin / Platform Control Room before beta.

This stream is presentation-only. It improves labels, page descriptions,
boundary copy, and shared admin help patterns over existing implemented
settings and platform-admin behavior.

## Ownership Area

- Contractor Settings / Company Controls: company-owned configuration,
  workflow defaults, templates, company documents, catalogs, financial defaults,
  team access, data export, and company feature overrides.
- Super Admin / Platform Control Room: platform starter settings, starter
  templates/catalogs, feature policy, tenant lifecycle oversight, SaaS billing
  operations, packages, and operator controls.
- Dashboard and workspaces still route to Settings only when configuration
  blocks work.

## Dependencies

- UX Beta Readiness V1 packet.
- UX Architecture Audit V1 packet from the audit worktree because the packet is
  not present in this `main` snapshot.
- UX Design System Foundation V1.
- MCP Tool Readiness V1.
- Visual QA Route Smoke V1.
- Design-system governance, Graphite/Copper UI system, UI patterns, product
  operating model, current-state truth, developer source of truth, target IA,
  active waves, active worktrees, and active stream plan.

## Surfaces Touched

- Contractor Settings layout and overview.
- Contractor Settings Company Admin.
- Contractor Settings Company Feature Controls.
- Super Admin layout and overview.
- Super Admin Platform Feature Policy.
- Super Admin Platform Admin Access / Tenant Oversight.
- Super Admin Platform Billing Operations.
- Settings and Super Admin navigation labels.
- Shared `SettingsBoundaryNotice` presentational component.
- Current-state and UI pattern documentation.
- Active wave/worktree/stream registries.

## Before / After Summary

Before:

- Settings and Super Admin already had separate route shells, but some labels
  such as Admin, Feature Controls, and Billing could read as ambiguous.
- Settings described company-owned controls, but the not-here boundary for
  platform controls and workflow action was not visible on the overview.
- Super Admin described platform controls, but the not-contractor-workspace
  boundary was not visible on the overview.

After:

- Contractor Settings presents as Company Controls and names company-owned
  settings versus platform-owned controls.
- Super Admin presents as Platform Control Room and names platform-owned
  controls versus contractor-owned settings.
- Company feature overrides and platform feature policy use distinct labels.
- Company admin access and platform admin access are explicitly separate.
- Platform billing operations clarify that contractor invoice/payment action
  stays in Financials and Invoice Workspaces.

## Boundary Decisions

- Contractor Settings may configure company defaults and company overrides, but
  it does not mutate platform policy or operate contractor workflows.
- Super Admin may govern starter records, platform policy, tenant lifecycle,
  SaaS billing readiness, and operator oversight, but it does not become a
  contractor workflow workspace.
- Workflow actions stay in owning workspaces: estimates, contracts, invoices,
  schedules, jobs, Financials, and Field.
- Company feature overrides remain tenant-scoped and constrained by platform
  feature policy.

## Shared Primitives Reused

- `SettingsSurfaceLayout`
- `SettingsOverviewCard`
- `SettingsSectionCard`
- `DetailPanel`
- `SuperAdminTopTabs`
- `ScopeLegend`
- New `SettingsBoundaryNotice` for reusable company/platform boundary copy.

## Non-Goals

- no schema/data changes
- no migrations
- no Supabase changes
- no business logic changes
- no new canonical records
- no duplicate settings models
- no platform/admin state moved into contractor Settings
- no contractor workflow actions moved into Super Admin
- no role-specific data models
- no personalization engine
- no fake persistence
- no billing/provider mutations
- no payment/signature/scheduling behavior changes
- no AIA
- no customer self-service
- no AI automation

## MCP / Tool Usage Notes

- No external MCP tools were used for implementation.
- Repo docs and current code remained the source of truth.
- Memory was used only to recall the standing operational ownership doctrine:
  Dashboard prioritizes, owning workspaces act, Settings owns tenant/company
  configuration, Super Admin owns platform policy, and Portal stays
  customer-safe.

## Validation Results

- `pnpm.cmd --filter @floorconnector/web typecheck`: passed.
- `pnpm.cmd --filter @floorconnector/web lint`: passed.
- `pnpm.cmd fc:preflight:fast`: passed.
- `git diff --check`: passed.
- `git diff --cached --check`: passed after staging.
- `pnpm.cmd worktree:doctor`: passed, 20 checks.

Authenticated route smoke for touched Settings / Super Admin routes is noted as
best-effort only because the existing smoke targets contractor protected UX
Beta routes and does not yet include platform-admin role coverage.

Focused helper tests were not added because this stream introduced no pure
helpers or business logic; `SettingsBoundaryNotice` is a presentational copy
component.
