# FloorConnector Control Tower

Read this before acting in the FloorConnector repo.

## Mission

Move FloorConnector quickly while preserving one canonical contractor operating
system:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Highest-Priority Anti-Drift Rules

- No duplicate business models.
- No portal-owned operational truth.
- No disconnected invoices, payments, contracts, jobs, schedules,
  communications, reports, or AI memory.
- No docs that describe planned work as implemented.
- No unrelated formatting churn.
- No widening existing PRs with unrelated local commits.

## Required Start Checks

```powershell
git status --short --branch
git branch --show-current
git fetch origin
```

Identify dirty/untracked files before editing. Treat unrelated work as
user-owned.

## Stream Ownership Rule

Work in the correct worktree and follow the matching
`.codex/stream-contracts/*.md` file. If the task touches another stream's owned
files, call that out before editing.

## Shared-Risk File Rule

Shared-risk files include registry docs, prompt templates, worktree scripts,
package scripts, GitHub workflows, schema/migrations, auth/RLS, payment,
signature, portal access, provider, and readiness-gate files. Touch them only
when explicitly in scope.

## Validation Expectations

- Run the narrowest meaningful checks.
- Run formatting checks on changed supported files.
- Run lint/typecheck/tests when relevant and safe.
- Run `git diff --check`.
- Report skipped checks and why.

## Completion Report

Report:

- starting branch/status
- final branch/status
- changed files
- commit hash/message if committed
- validation commands and results
- skipped commands and why
- blockers or follow-up

## Hard Stops

- No auto-merge.
- No production environment changes.
- No secrets.
- No remote Supabase migrations.
- No force-push.
- No provider sends or autonomous customer-facing actions.
