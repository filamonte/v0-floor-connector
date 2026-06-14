# Assessment Estimate Workspace Industrial OS V1

Status: Active
Date: 2026-06-14
Branch: `stream/assessment-estimate-workspace-industrial-os-v1`
Worktree: `C:\FC-worktrees\assessment-estimate-workspace-industrial-os-v1`
Base: `origin/main` at setup

## Purpose

Refactor Assessment Package / Assessment Workspace and Estimate Workspace for
clarity and lower density.

## Scope

- assessment package/detail/workspace pages
- estimate workspace pages
- area/space/measurement cards if present
- estimate handoff/work item panels if directly used
- this review packet

## Product Intent

Assessment/Estimate Workspace should answer what information has been
captured, what measurements/areas/spaces exist, what is missing, what is ready
for estimate writing, and what work item or handoff is next.

## Forbidden Scope

Do not change area/space calculation logic, estimate pricing, catalog,
templates, customer-visible proposal logic, assessment data ownership, schema,
migrations, routes, auth/tenant behavior, provider behavior, or portal access.

## Figma References

Use `https://www.figma.com/design/N0tVE3uKWpHZc4dlF6ytgn` through Figma MCP
where relevant. Record exact frames inspected during implementation.

## Data Sources

Existing assessment package, assessment area/space/measurement, estimate,
project, opportunity, customer, handoff, and work-item read models only.

## Validation Plan

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd --filter @floorconnector/ui test
pnpm.cmd fc:preflight:fast
pnpm.cmd e2e:smoke:auth
git diff --check
git diff --cached --check
pnpm.cmd worktree:doctor
pnpm.cmd wave:status
```

Browser checks at `1366px` and `390px`: assessment package/detail route,
estimate workspace/detail route if it exists, `/dashboard`, `/projects`, one
Project Workspace, `/leads`, one Opportunity Workspace, `/settings`, `/portal`,
`/schedule`, and `/dashboard?capture=1#universal-capture`.

## Completion Notes

Figma frames inspected, target pages, files changed, data sources used, visual
improvements, mobile behavior, deviations from Figma, no-data-silo
confirmation, production safety confirmation, remaining visual debt, browser
checks, and validation results are pending implementation.
