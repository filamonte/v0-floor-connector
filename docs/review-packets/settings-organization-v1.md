# Settings Organization V1

Status: Merged via PR #45 as `c55809efcad596baf2d2f1f32eb7fb72a475cc2f`
Date: 2026-06-13
Branch: `stream/settings-organization-v1`
Worktree: `C:\FC-worktrees\settings-organization-v1`
Base: `origin/main` at `ddf9e2bd`

Merge: PR #45, `style: simplify settings organization`, squash merged to
`main` as `c55809efcad596baf2d2f1f32eb7fb72a475cc2f`.

## Purpose

Make Settings clearer, lighter, and better organized without changing settings
routes, settings actions, persistence contracts, platform policy, or tenant
configuration ownership.

## Scope

- `/settings`
- `/settings/organization`
- Settings overview cards.
- Grouping into Company Controls, Workflow Defaults, Sales / Estimate,
  Financial, Templates, Users / Access, and Portal / Admin boundaries.

## Forbidden Scope

No schema, migrations, route/action changes, settings persistence changes,
platform policy changes, duplicate settings model, fake health score, fake KPI,
auth/tenant changes, provider/billing mutation, payment/signature/scheduling
logic changes, or portal/admin guard changes.

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

Existing Settings and organization data/actions only. Configuration grouping is
presentation and routing clarity, not new settings state.

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

Browser checks: `/settings`, `/settings/organization`, `/dashboard`, `/leads`,
`/projects`, `/portal`, and `/dashboard?capture=1#universal-capture` at
`1366px` and `390px`.

## Completion Notes

### Files Changed

- `apps/web/app/(app)/settings/page.tsx`
- `apps/web/app/(app)/settings/organization/page.tsx`
- `apps/web/components/settings-nav.tsx`
- `apps/web/lib/settings/navigation.ts`
- `docs/review-packets/settings-organization-v1.md`

### Figma Frames Used

- File `N0tVE3uKWpHZc4dlF6ytgn`, node `28:12`,
  `APPROVED / Settings / Desktop`.

### Visual Improvements

- Reorganized contractor Settings navigation around the requested groups:
  Company Controls, Workflow Defaults, Sales / Estimate, Financial, Templates,
  Users / Access, and Portal / Admin boundaries.
- Updated `/settings` overview cards to match those owner groups while keeping
  all displayed facts derived from existing organization, member, workflow,
  financial, template, catalog, selected-system, company-document, and feature
  override reads.
- Split `/settings/organization` into clearer form bands for company identity,
  public contact, and app presentation, with a compact live-record summary
  strip above the existing profile form.
- Tightened Settings nav active-state handling so `/settings` no longer appears
  active on nested Settings routes.

### Deviations From Figma

- Kept the existing protected app shell and Settings component system instead
  of recreating the static Figma screenshot exactly.
- Preserved current route structure, existing card primitives, and live data
  reads; the Figma reference was used for hierarchy, blue accent posture, and
  organization-control framing.

### Production Safety

- No schema, migration, route, server action, persistence, auth, tenant guard,
  provider, billing, payment, signature, scheduling, portal-access, or workflow
  gate changes.
- No duplicate settings model or data silo was introduced.
- No fake setup score or KPI was introduced; setup status remains derived from
  existing records only.

### Validation Results

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd --filter @floorconnector/ui test
pnpm.cmd fc:preflight:fast
pnpm.cmd e2e:smoke:auth
git diff --check
pnpm.cmd worktree:doctor
```

Results: all passed. `pnpm.cmd worktree:doctor` reported the expected warning
that `stream/settings-organization-v1` has no upstream configured.

### Browser Checks

Dev server: `http://localhost:3113`.

Playwright screenshot/overflow matrix passed at `1366px` and `390px` for:

- `/settings`
- `/settings/organization`
- `/dashboard`
- `/leads`
- `/projects`
- `/portal`
- `/dashboard?capture=1#universal-capture`

All checked routes returned HTTP 200, avoided `/login` redirects, avoided
server/runtime error text, and had `0px` horizontal overflow.

Screenshots were written under
`test-results/manual-responsive-proof/settings-organization-v1/`.

### Remaining Visual Debt

- The Settings side navigation is still long on mobile because it exposes the
  existing full Settings route inventory; this stream only reorganized the
  inventory and did not introduce new navigation disclosure behavior.

### Final Git State

- Final status: clean after commit.
- Ahead/behind: `2 0` against `origin/main`.
- Commit SHA: see stream completion report.
