# Automation Tooling Baseline

Status: Active
Doc Type: Developer Operations

This document records the local automation/tooling baseline for governed
FloorConnector work. It is not product runtime behavior and does not authorize a
feature wave.

## Audit Snapshot

Snapshot date: 2026-06-05 from `C:\FloorConnector` on `main`.

Required tool status:

- Node: available, `v24.15.0`; repo engine requires Node `>=20.0.0`.
- pnpm: available, `9.12.3`; `package.json` pins `pnpm@9.12.3`.
- Corepack: available through `pnpm worktree:doctor`.
- Workspace dependencies: root `node_modules` and workspace package
  `node_modules` are repo-local and linked into worktrees by
  `pnpm.cmd devtools:link`.
- Turbo: repo-local, available through `pnpm.cmd exec turbo --version`.
- ESLint: repo-local, available through `pnpm.cmd exec eslint --version`.
- Prettier: repo-local, available through `pnpm.cmd exec prettier --version`.
- TypeScript: repo-local, available through `pnpm.cmd exec tsc --version`.
- Playwright package: repo-local, available through
  `pnpm.cmd exec playwright --version`.
- Playwright Chromium browser: installed locally under the Playwright browser
  cache during this audit.
- Worktree scripts: available through `pnpm.cmd worktree:*`.
- Fast preflight: available through `pnpm.cmd fc:preflight:fast`.

Optional tool status:

- GitHub CLI: available and authenticated during this audit. Use
  `pnpm.cmd setup:gh` for install/auth guidance when it is missing.
- Supabase CLI: available during this audit. Treat as optional unless a task
  explicitly scopes Supabase CLI work.
- Vercel CLI: not available on PATH during this audit. Treat as optional unless
  a task explicitly scopes Vercel deployment, Vercel diagnostics, or Vercel
  project configuration work.

## Repo-Local Command Preference

Prefer repo-local package scripts and `pnpm.cmd exec` over global PATH tools:

```powershell
pnpm.cmd tooling:baseline
pnpm.cmd worktree:doctor
pnpm.cmd devtools:link
pnpm.cmd exec prettier --version
pnpm.cmd exec playwright --version
pnpm.cmd exec turbo --version
```

Use global CLIs only when the workflow actually depends on that service:

- `gh` for GitHub auth, PRs, and repo operations.
- `supabase` for explicitly scoped Supabase CLI checks.
- `vercel` for explicitly scoped Vercel deployment or diagnostics.

## Standard Validation

Feature stream validation starts with:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd devtools:link
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
```

Docs-only streams use the narrower path unless the doc changes alter setup,
workflow, or validation guidance:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd exec prettier --check <changed-docs>
git diff --check
```

Post-merge checks on `main` use:

```powershell
git fetch origin
git status --short --branch
git rev-list --left-right --count main...origin/main
pnpm.cmd worktree:doctor
pnpm.cmd fc:preflight:fast
```

If parallel typecheck/lint times out, rerun the narrower package commands before
treating the failure as a product problem:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
```

Run focused tests when a helper, read model, action, script, or financial/auth
boundary changes. Run Playwright when protected route behavior, portal behavior,
auth state, UI navigation, or route smoke is part of the acceptance evidence.

## Playwright

Confirm Playwright package availability with:

```powershell
pnpm.cmd exec playwright --version
```

Confirm Chromium browser availability with:

```powershell
node -e "const { chromium } = require('@playwright/test'); const fs = require('node:fs'); const p = chromium.executablePath(); console.log(p); console.log(fs.existsSync(p) ? 'browser-present' : 'browser-missing');"
```

Install browsers only when a scoped browser test requires them:

```powershell
pnpm.cmd exec playwright install chromium
```

Do not make Playwright a blanket requirement for docs-only or pure script
changes.

## Worktree Repair

Use the existing shared dev-tool link strategy:

```powershell
pnpm.cmd devtools:link
pnpm.cmd devtools:link:fix
pnpm.cmd worktree:doctor
```

`devtools:link` verifies or creates links for `.env.local`, root
`node_modules`, workspace `node_modules`, `.turbo`, and `playwright\.auth`.
Build outputs such as `.next`, `dist`, `coverage`, and `test-results` must stay
local to each worktree.

Dirty out-of-scope worktrees do not block automation startup by themselves when
their shared tool links are healthy. They do block a wave only when the wave
would touch the same branch/files, when the runner refuses dirty stream state,
or when a human explicitly asks for cleanup/reconciliation.

## Behind Main

Before starting or resuming a stream:

```powershell
git fetch origin
git status --short --branch
git rev-list --left-right --count HEAD...origin/main
```

If a worktree is behind `origin/main`, rebase or recreate it before starting new
work. If governance docs changed on `main`, refresh the stream before editing
prompt, registry, or review-packet files. This prevents the rebase/docs-commit
loop where a stream finishes against old governance and then needs another docs
commit only to learn the current rules.

## Optional CLI Handling

Missing optional CLIs are not automatic validation failures:

- Missing Vercel CLI: report it as optional unless the task requires Vercel.
  Prefer repo-local staging/preflight checks when the task is not deployment
  work.
- Missing GitHub CLI: run `pnpm.cmd setup:gh` for guidance. PR creation or auth
  checks need `gh`; local docs/tooling validation does not.
- Missing Supabase CLI: report it as optional unless the task requires Supabase
  CLI inspection or migration workflow.

## Current Command Helper

Use this non-mutating helper for a compact local baseline:

```powershell
pnpm.cmd tooling:baseline
```

Use this for the standard feature-stream command list without running it:

```powershell
pnpm.cmd tooling:baseline -CommandsOnly
```
