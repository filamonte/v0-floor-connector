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

Inspected through Figma MCP:

- `28:4` `APPROVED / Dashboard / Desktop`
- `28:8` `APPROVED / Opportunity-adjacent Sales Manager / Desktop`
- `28:20` `APPROVED / Dashboard / Mobile`

No direct Assessment Package, Assessment Workspace, or Estimate Workspace frame
exists on the approved board. This stream adapts the approved command-center
and sales-manager patterns: hard-border panels, compact metrics, blue
`#005EB8` primary/active signal, warm neutral working surfaces, first-viewport
handoff clarity, and stacked mobile scan order.

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

## Implementation Notes

Files changed:

- `apps/web/app/(app)/projects/[projectId]/assessment-packages/[assessmentPackageId]/page.tsx`
- `apps/web/components/estimate-form.tsx`
- `docs/review-packets/assessment-estimate-workspace-industrial-os-v1.md`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Assessment improvements:

- Adds `#assessment-workspace-command` above the dense edit grid.
- Summarizes stored package status, captured fields, area/space count,
  measured spaces, square footage, perimeter footage, and missing context.
- Keeps full assessment notes, status update, canonical links, and area/space
  edit forms in place below the command layer.
- Uses only existing assessment package fields and
  `deriveAssessmentSpacePackageSummary`; no area/space calculation logic was
  changed.

Estimate Workspace improvements:

- Adds `#estimate-workspace-command` inside the existing Estimate Editor shell.
- Summarizes current editor state from existing client state: estimate status,
  line-item count, catalog-backed line count, scope item count, scope summary
  presence, source assessment measurement groups, reusable content counts,
  attachment counts, project/opportunity continuity, subtotal, and total.
- Preserves all existing Estimate Workspace tabs, save behavior, line item
  editing, catalog insertion, system expansion, tax derivation, approval
  orchestration, and customer-facing review link.
- Does not touch Stream 3 invoice detail work. Estimate detail/review files are
  intentionally untouched; this stream only touches the Estimate Editor
  workspace component.

Data sources used:

- Assessment package fields already loaded by the assessment package detail
  route.
- Existing assessment space summary helper.
- Existing Estimate Editor state, line-item state, source-assessment context,
  active reusable content blocks, retained/pending attachments, and existing
  pricing preview labels.

Mobile behavior:

- Command sections stack before dense form/table content at narrow widths.
- Metrics use fixed hard-border panels and wrapping text so long project,
  opportunity, or customer labels do not force horizontal overflow.
- Primary actions remain visible before detailed form controls.

Figma deviations:

- The approved board has Dashboard, Sales Manager, Settings, Universal Capture,
  and Portal references only. No direct Assessment or Estimate Workspace frame
  exists, so this implementation maps the approved command-center rhythm to
  current repo components instead of copying a generated layout.
- Existing global shell, route structure, Estimate Editor tab model, form
  controls, and action ownership are preserved to avoid route or business
  behavior drift.

Production safety confirmation:

- No schema, migrations, data models, routes, loaders, server actions,
  auth/tenant guards, portal behavior, area/space calculation logic, estimate
  pricing, catalog/template behavior, proposal behavior, work item behavior,
  revision lineage, readiness gates, payment/signature/scheduling behavior, or
  business logic changed.

No-data-silo confirmation:

- Assessment Package remains the owner of captured site/space/measurement
  information.
- Estimate Workspace remains the owner of estimate writing preparation.
- Estimate detail/review remains the owner of customer-facing proposal review.
- Work Items remain the owner of handoff/follow-up tasks.
- The new command sections are read-only presentation over existing records and
  client state; they add no visual-only records, local persistence, duplicate
  assessment/estimate/work item/project/customer/proposal model, fake counts,
  fake measurements, fake readiness score, fake AI summary, or dashboard-owned
  queue.

Remaining visual debt:

- Assessment Package editing remains a dense all-fields form below the command
  summary. A future approved slice could progressively disclose lower-frequency
  note fields without changing data ownership.
- Estimate Editor still has a large item table by design. This stream improves
  first-viewport orientation but does not redesign the catalog/line-item table.

## Browser Checks

Completed with Playwright against local dev server
`http://localhost:3130` using `playwright/.auth/local-user.json`.

Discovered fixture routes:

- Project: `/projects/fe0ba4e8-97c2-4765-9259-c6de6344d82c`
- Estimate detail: `/estimates/f0fac6c8-0769-4962-9a7a-09f2f7f827c8`
- Estimate workspace/editor:
  `/estimates/f0fac6c8-0769-4962-9a7a-09f2f7f827c8/edit`
- Lead detail: `/leads/1b441af7-2ef0-491c-8a52-dc1ed32660d3`
- Invoice detail: `/invoices/c3b636bf-78e7-40a8-ad32-31f4568b961f`

Checked at `1366px` and `390px`:

- estimate workspace/editor route with `#estimate-workspace-command`
- `/estimates`
- one estimate detail
- `/dashboard`
- `/projects`
- one project detail
- `/leads`
- one lead detail
- `/settings`
- `/portal`
- `/schedule`
- `/invoices`
- one invoice detail
- `/dashboard?capture=1#universal-capture`

All checked routes returned `200`, avoided `/login` redirects, rendered without
`ChunkLoadError`, page errors, favicon failures, app-error text, or horizontal
overflow, and Universal Capture opened with `#universal-capture`.

Assessment package browser caveat:

- A broader read-only scan across the first 12 visible Project Workspace links
  found no rendered assessment package links, so no real assessment-package
  fixture route was available for protected browser smoke in this run. The
  route compiles and typechecks, and this packet records the browser target as
  fixture-blocked rather than passed.

## Validation Results

- `node .\node_modules\prettier\bin\prettier.cjs --write ...`: passed.
- `pnpm.cmd --filter @floorconnector/web typecheck`: passed.
- `pnpm.cmd --filter @floorconnector/web lint`: passed.
- `pnpm.cmd --filter @floorconnector/ui test`: passed.
- `git diff --check`: passed with Windows CRLF working-copy warnings only.
- `pnpm.cmd fc:preflight:fast`: passed.
- `pnpm.cmd e2e:smoke:auth`: passed, 11 tests.
- `git diff --cached --check`: passed.
- `pnpm.cmd worktree:doctor`: startup passed with expected no-upstream warning
  before first push; clean-branch run also passed with the same expected
  pre-push no-upstream warning.
- `pnpm.cmd wave:status`: passed; stream clean with no upstream before first
  push.
- `pnpm.cmd wave:review`: passed with `PASS: 274`, `WARNING: 25`; warnings are
  existing no-upstream registry branches plus this stream before first push.
