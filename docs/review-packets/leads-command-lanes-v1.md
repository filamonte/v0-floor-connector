# Leads Command Lanes V1

Status: Merged via PR #44 as `c7e38a915a543133f20303f20c028ba013df159b`
Date: 2026-06-13
Branch: `stream/leads-command-lanes-v1`
Worktree: `C:\FC-worktrees\leads-command-lanes-v1`
Base: `origin/main` at `ddf9e2bd`

Merge: PR #44, `style: organize leads command lanes`, squash merged to `main`
as `c7e38a915a543133f20303f20c028ba013df159b`.

## Purpose

Make `/leads` feel like Sales Command / Opportunity Intake instead of a
table-heavy manager, while keeping the table available and preserving existing
routes and data ownership.

## Scope

- `/leads` first viewport.
- Qualification, follow-up, site visit, estimate waiting, and missing-info
  lanes using existing real opportunity/lead data only.
- Lead detail only if a small shared improvement is obvious and does not
  collide with mobile workspace compression.

## Forbidden Scope

No schema, migrations, route renames, duplicate Lead or Opportunity model,
fake records, fake statuses, fake KPIs, fake queues/counts, local-only
persistence, auth/tenant changes, portal/admin guard changes,
payment/signature/scheduling logic changes, or removal of real actions.

## Required Startup Docs

- `AGENTS.md`
- `.codex/prompt-snippets/floorconnector-codex-baseline.md`
- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/system-overview.md`
- `docs/workflows.md`
- `docs/target-ia.md`
- `docs/chat-handoff.md`
- `docs/review-packets/figma-fidelity-refactor-v1.md`

## Figma References

Use `https://www.figma.com/design/N0tVE3uKWpHZc4dlF6ytgn` through Figma MCP
where relevant. Record exact frames inspected during implementation.

## Data Sources

Existing `/leads` loader data, opportunity statuses, filters, quick-create
actions, and canonical links only. Lanes must be derived presentation over real
data, not persisted workflow state.

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
```

Browser checks: `/leads`, one Opportunity Workspace if touched, `/dashboard`,
`/settings`, `/projects`, `/portal`, and
`/dashboard?capture=1#universal-capture` at `1366px` and `390px`.

## Completion Notes

Files changed:

- `apps/web/app/(app)/leads/page.tsx`
- `docs/review-packets/leads-command-lanes-v1.md`

Figma frames used:

- `28:8` - `APPROVED / Opportunity-adjacent Sales Manager / Desktop`

Visual improvements:

- `/leads` now leads with five command lanes derived from existing opportunity
  and follow-up data: Qualification, Follow-up, Site visit, Estimate, and
  Missing info.
- The full opportunity table remains directly below the lanes for direct record
  access and filtering.
- The lower support region now keeps the real opportunity stage funnel and real
  scheduled sales activity from existing appointments and site assessment
  fields.
- The mobile KPI band uses two columns so command controls and lane entry arrive
  sooner in the opening viewport.

Deviations from Figma:

- The approved Figma frame uses a fixed left app sidebar; FloorConnector keeps
  the current top/header app shell per product governance.
- The Figma frame shows a compact table-first sales manager. This slice keeps
  table access but prioritizes command lanes first because the stream scope
  explicitly called for qualification, follow-up, site visit, estimate waiting,
  and missing-info lanes.

No-data-silo confirmation:

- The lanes are derived presentation over existing `listOpportunities()`,
  `listAppointments()`, and `listLeadFollowUpQueue()` data.
- No schema, migrations, loaders, routes, statuses, fake records, persisted
  queues, local storage, or duplicate lead/opportunity models were added.

Production safety confirmation:

- No auth, tenant, RLS, server action, portal, payment, signature, scheduling,
  provider, or workflow mutation behavior changed.
- Existing Quick-Create and table action links remain available.

Remaining visual debt:

- `/leads` mobile still has a tall dark command header because it preserves the
  shared Manager Page shell and full search/filter controls.
- The table remains intentionally dense below the command lanes to preserve
  current direct-record access.

Validation results:

- `pnpm.cmd --filter @floorconnector/web typecheck` - passed
- `pnpm.cmd --filter @floorconnector/web lint` - passed
- `pnpm.cmd --filter @floorconnector/ui test` - passed
- `pnpm.cmd fc:preflight:fast` - passed
- `pnpm.cmd e2e:smoke:auth` - passed, 11 passed
- `git diff --check` - passed
- `pnpm.cmd worktree:doctor` - passed with expected no-upstream warning

Browser checks:

- Dedicated local server: `http://localhost:3112`
- Checked at `1366px` and `390px`: `/leads`, one Opportunity Workspace
  (`/leads/1b441af7-2ef0-491c-8a52-dc1ed32660d3`), `/dashboard`, `/settings`,
  `/projects`, `/portal`, and `/dashboard?capture=1#universal-capture`.
- Result: no auth redirects, no console/page errors, no horizontal overflow,
  and protected route content rendered at both widths.

Post-merge gate note:

- Before PR #44 merge, stale local Playwright contractor auth state caused
  intermittent no-active-organization and `/login` redirects on unrelated
  protected routes. Auth was refreshed with the project-supported
  `pnpm.cmd e2e:auth:setup` path against the same local origin used for smoke
  checks.
- Rerun `pnpm.cmd e2e:smoke:auth` passed 11/11.
- Browser matrix at `1366px` and `390px` passed for `/leads`, a real
  Opportunity Workspace, `/dashboard`, `/projects`, a real Project Workspace,
  `/settings`, `/portal`, `/schedule`, `/daily-logs`, and
  `/dashboard?capture=1#universal-capture`.
- The obsolete `Vercel - v0-floor-connector` / `tfc-saas` check was ignored
  under the permanent Vercel rule; active `Vercel - lkjlkjlsdf` was the
  relevant Vercel context.

Final git status, ahead/behind count, and commit SHA:

- Branch: `stream/leads-command-lanes-v1`
- Worktree: `C:\FC-worktrees\leads-command-lanes-v1`
- Final status before amend: clean
- Ahead/behind vs `origin/main`: `2 0`
- Commit SHA: reported from `git log` in the stream completion response after
  the final packet amend.
