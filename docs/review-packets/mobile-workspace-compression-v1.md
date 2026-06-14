# Mobile Workspace Compression V1

Status: Merged via PR #43 as `ce28bdb8c48dd94cdaf47776285e38b2711a9b5c`
Date: 2026-06-13
Branch: `stream/mobile-workspace-compression-v1`
Worktree: `C:\FC-worktrees\mobile-workspace-compression-v1`
Base: `origin/main` at `ddf9e2bd`

## Purpose

Compress the mobile opening viewport for Project Workspace and Opportunity
Workspace so mobile users reach current status and primary actions faster.

## Scope

- Shared workspace layout mobile behavior.
- Project Workspace mobile header and opening viewport.
- Opportunity Workspace mobile header and opening viewport.
- Minimal desktop adjustment only when required by shared layout safety.

## Forbidden Scope

No schema, migrations, route renames, canonical model changes, fake records,
fake statuses, fake KPIs, fake queues, local-only persistence, auth/tenant
changes, portal/admin guard changes, payment/signature/scheduling logic
changes, or global permanent desktop sidebar changes.

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

Existing Project and Opportunity Workspace loaders, read models, links, and
actions only. Do not introduce new persistence or derived fake state.

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

Browser checks: Project Workspace, Opportunity Workspace, `/dashboard`,
`/settings`, `/leads`, `/projects`, `/portal`, and
`/dashboard?capture=1#universal-capture` at `1366px` and `390px`.

## Completion Notes

Merged to `main` via PR #43, `style: compress mobile workspace headers`, as
`ce28bdb8c48dd94cdaf47776285e38b2711a9b5c`.

The stream compressed mobile Project and Opportunity Workspace opening
viewports while preserving record identity, real actions, desktop behavior, and
canonical data ownership.

Validation passed before merge:

- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- `pnpm.cmd --filter @floorconnector/ui test`
- `pnpm.cmd fc:preflight:fast`
- `pnpm.cmd e2e:smoke:auth`
- `git diff --check`
- `git diff --cached --check`
- `pnpm.cmd worktree:doctor`

Browser checks passed at `390px` and `1366px` with no ChunkLoadError,
console/page errors, favicon/static errors, auth redirect regressions, or
horizontal overflow. The obsolete `Vercel - v0-floor-connector` / `tfc-saas`
check was ignored under the permanent Vercel rule; active
`Vercel - lkjlkjlsdf` was the relevant Vercel context.
