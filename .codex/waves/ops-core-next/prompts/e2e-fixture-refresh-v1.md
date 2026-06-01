# Chat: E2E Fixture Refresh V1

Branch: `stream/e2e-fixture-refresh-v1`
Worktree: `C:\FC-worktrees\e2e-fixture-refresh`

## Goal

Fix stale protected smoke fixture discovery so browser validation proves real
detail pages without hard-coded dead IDs.

## Required Docs

Read these before implementation:

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `docs/local-auth-qa-recovery.md`
- `.codex/worktree-rules.md`
- `.codex/active-stream-plan.md`

## Boundaries

- Do not change product runtime behavior.
- Do not change schema, migrations, Supabase policies, RLS, auth, env vars,
  route protection, payment math, provider behavior, portal grants, or business
  logic.
- Do not create fake QA data, local-only persistence, or hard-coded dead
  fixture IDs.
- Do not mutate remote Supabase unless a separate owner-approved write mode is
  explicitly requested.

## Implementation Requirements

- Start with `git status --short --branch`, current branch confirmation, and
  `git fetch origin`.
- Improve fixture discovery or smoke setup so protected route checks can find
  real canonical records when available.
- Keep the helper skip-aware: missing auth, missing records, redirects, or
  Supabase Auth rate limits must be reported as skipped or blocked, not passed.
- Prefer repo-local Playwright and existing auth recovery patterns.
- Update docs only for changed QA workflow behavior.

## Validation

Run:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
```

Run only the focused smoke or helper command touched by this slice. Keep route
sets narrow and non-mutating.

## Git Completion Requirements

- Stage only intended files.
- Commit the completed slice.
- Do not push unless asked.

## Final Response Requirements

Report branch, starting status, final status, commit hash/message, files
changed, validation results, skipped checks, assumptions, and follow-up
dependencies.
