# Portal Industrial Rail V1

Status: Complete
Date: 2026-06-13
Branch: `stream/portal-industrial-rail-v1`
Worktree: `C:\FC-worktrees\portal-industrial-rail-v1`
Base: `origin/main` at `ddf9e2bd`

## Purpose

Move the customer portal closer to the approved portal frame while preserving
customer-safe boundaries and existing canonical project, estimate, contract,
invoice, signature, and payment records.

## Scope

- `/portal`
- Customer portal review UI.
- Portal project detail if present and safe.
- Dark/light rail alignment only when customer-safe and responsive.

## Forbidden Scope

No internal-only data exposure, schema, migrations, route renames, portal grant
changes, auth changes, tenant changes, payment/signature behavior changes,
provider behavior changes, duplicate portal records, portal-owned project
state, fake statuses, fake KPIs, fake queues, or customer self-service claims
not backed by current implementation.

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

Existing portal loaders, portal grants, project access, customer-safe record
links, and review actions only. The portal remains a surface over canonical
records, not a separate customer project system.

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

Browser checks: `/portal`, any touched portal project/review routes,
`/dashboard`, `/settings`, `/leads`, `/projects`, and
`/dashboard?capture=1#universal-capture` at `1366px` and `390px`. Portal checks
must verify customer-safe content boundaries.

## Completion Notes

### Files Changed

- `apps/web/app/(portal)/portal/layout.tsx`
- `apps/web/app/(portal)/portal/page.tsx`
- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
- `docs/review-packets/portal-industrial-rail-v1.md`

### Figma Frames Used

- File `N0tVE3uKWpHZc4dlF6ytgn`, node `28:28`,
  `APPROVED / Portal / Desktop`.
- File `N0tVE3uKWpHZc4dlF6ytgn`, node `28:32`,
  `APPROVED / Portal / Mobile`.

### Visual Improvements

- Added a customer-safe portal shell with a desktop dark rail, compact portal
  top bar, and mobile bottom navigation aligned to the approved portal frames.
- Replaced the generic protected-surface portal header with a portal-specific
  customer workspace frame while preserving the existing authenticated portal
  session and sign-out behavior.
- Added stable in-page anchors for customer action, projects, documents, and
  billing sections on `/portal`.
- Added matching customer-action, document, and billing anchors on the portal
  project detail route so shell links remain useful without creating routes or
  new state.

### Deviations From Figma

- The rail uses existing `/portal` routes and section anchors only; it does not
  introduce fake Financials, Projects, Schedule, Tasks, or Profile routes.
- The mobile frame keeps the existing customer-safe portal content instead of
  inventing task counts, file counts, photos, or chat state that are not backed
  by the current implementation.
- Existing page cards and portal read models were retained; this slice aligned
  the shell/rail and navigation posture rather than rewriting portal business
  surfaces.

### Production Safety

- No schema, migrations, loaders, server actions, route renames, portal grants,
  auth, tenant boundaries, payment/signature behavior, provider behavior,
  duplicate portal records, portal-owned project state, fake statuses, fake
  KPIs, or customer self-service claims were added.
- Portal remains a customer-facing surface over existing canonical project,
  estimate, contract, invoice, signature, payment, appointment, warranty, and
  shared-evidence records.
- The rail links only to existing portal routes and page sections.

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
that `stream/portal-industrial-rail-v1` has no upstream configured.

### Browser Checks

Dev server: `http://localhost:3114`.

Portal project route used for detail proof:

- `/portal/projects/db77b765-4d6e-47d4-8c38-e91c041868f1`

Playwright screenshot/overflow matrix passed at `1366px` and `390px` for:

- `/portal` with portal-user auth
- `/portal/projects/db77b765-4d6e-47d4-8c38-e91c041868f1` with portal-user auth
- `/dashboard` with contractor auth
- `/settings` with contractor auth
- `/leads` with contractor auth
- `/projects` with contractor auth
- `/dashboard?capture=1#universal-capture` with contractor auth

All checked routes returned HTTP 200, avoided `/login` redirects, avoided
server/runtime error text, and had `0px` horizontal overflow.

Portal customer-safety text checks confirmed required shared project/customer
portal language and blocked contractor-admin/internal-system leakage terms:
`Company Admin`, `Operations Monitor`, `work_items`, `Supabase`, `RLS`,
`internal-only`, and `admin controls`.

Screenshots were written under
`test-results/manual-responsive-proof/portal-industrial-rail-v1/`.

### Remaining Visual Debt

- Portal project detail remains very long on mobile because it exposes the
  existing full shared-record history; collapsing lower-frequency history would
  be a separate customer portal organization slice.
- The rail uses text abbreviations instead of icon assets to avoid adding a new
  icon dependency or fake route semantics in this slice.

### Final Git State

- Final status: clean after commit.
- Ahead/behind: `2 0` against `origin/main`.
- Commit SHA: see stream completion report.
