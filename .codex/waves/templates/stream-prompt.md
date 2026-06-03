# Chat: Example Stream V1

Branch: `stream/example-stream-v1`
Worktree: `C:\FC-worktrees\example-stream`

## Goal

Describe the bounded product outcome.

## Required Docs

Read these before implementation:

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `.codex/worktree-rules.md`
- `.codex/active-stream-plan.md`

## FloorConnector Codex Prompt Baseline Safeguards

- Session/chat name: start the prompt with `# Chat: <bounded stream name>`.
- Git start: check git status, current branch, and ahead/behind state; fetch
  origin before editing; preserve unrelated dirty files; stage only intended
  files.
- Scope: implement only the named stream outcome; keep changes small,
  reviewable, and inside expected file boundaries.
- Architecture safety: use existing canonical records, tenant-safe
  loaders/actions, and shared read models; do not add schema, migrations, new
  tables, new columns, Supabase policies, RLS, auth, env vars, route
  protection, payment math, provider behavior, duplicate persistence,
  portal-only copies, dispatch-only systems, disconnected communication models,
  disconnected scheduling models, disconnected financial models, or AI-only
  operational truth unless explicitly approved.
- Human approval: do not send customer-facing messages, request signatures,
  start payments, mutate invoices/payments/signatures/jobs/schedules, call
  providers, or expose new portal data without explicit human-reviewed workflow
  support.
- Dependencies: state whether the stream is independent, depends on another
  stream, or should merge after another stream; avoid shared readiness/helper
  rewrites unless this stream owns them.
- Validation: run `pnpm.cmd --filter @floorconnector/web typecheck`,
  `pnpm.cmd --filter @floorconnector/web lint`,
  `pnpm.cmd fc:preflight:fast`, `git diff --check`, and focused
  unit/read-model tests when business shaping logic changes; if no tests are
  added, explain why existing coverage or presentation-only scope is sufficient.
- Commit/reporting: commit the completed slice, keep PRs draft unless
  explicitly instructed otherwise, do not auto-merge, and report branch,
  worktree, starting status, final status, ahead/behind, commit hash/message,
  changed files, validation results, tests added or why none,
  schema/migration confirmation, canonical/no-silo confirmation,
  customer-facing/human-approval confirmation, dependency status, risks, and
  follow-ups.

## Boundaries

- Do not change schema, migrations, Supabase policies, RLS, auth, env vars,
  payment math, route protection, or provider behavior unless explicitly
  approved.
- Do not create duplicate business models.
- Use existing canonical records and routes.
- Keep the slice small, testable, and reviewable.

## Required Git And Validation Workflow

- Start by checking git status, current branch, and ahead/behind state.
- Run git fetch origin.
- Avoid staging unrelated changes.
- Run git diff --check.
- Stage only intended files.
- Commit the completed slice.

## Implementation Requirements

- Confirm the branch and worktree match this prompt.
- Preserve repo conventions.
- Stay inside expected file boundaries and do not sweep unrelated files.
- Keep PRs draft by default; do not mark ready for review, auto-merge, push, or
  merge unless explicitly requested and approved.
- Update docs only when behavior changes or the prompt requires it.

## Validation

Run the narrowest meaningful checks, including:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
```

If using `pnpm --filter @floorconnector/web exec`, pass package-relative paths
from `apps/web`, for example `lib/schedule/example.test.ts`, not
`apps/web/lib/schedule/example.test.ts`.

## Final Response Requirements

Report branch name, starting status, final status, commit hash and message,
files changed, validation results, and limitations. Also report skipped checks,
assumptions, and follow-up dependencies when applicable.
