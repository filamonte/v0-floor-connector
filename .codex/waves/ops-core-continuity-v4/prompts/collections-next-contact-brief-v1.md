Chat: Collections Next Contact Brief

Start by checking git status, current branch, and ahead/behind state.
Run git fetch origin.
Avoid staging unrelated changes.

Read the required FloorConnector docs first: docs/developer-source-of-truth.md, docs/current-state.md, docs/workflows.md, docs/chat-handoff.md, .codex/worktree-rules.md, and .codex/active-stream-plan.md.

Product outcome: Improve the AR follow-up surface with a next-contact brief that summarizes customer, project, invoice, payment, aging, last activity, and source-record context from existing financial read models.

Use existing canonical records. Do not create duplicate business models. Do not change schema, migrations, Supabase policies, RLS, auth, env vars, route protection, payment math, provider behavior, or business logic outside the named product outcome.

Scope the work to existing collections helpers and the Accounts Receivable surface. Keep this read-only: no collection tasks, communication sends, provider calls, payment mutations, invoice math changes, aging rule changes, or local-only follow-up state.

Acceptance criteria: Accounts Receivable exposes a next-contact brief for follow-up candidates using existing invoice, payment, customer, project, and last activity context; the brief explains follow-up context without changing financial truth; focused tests cover overdue, partially paid, recently active, and no-recent-activity scenarios; docs update implemented truth only if visible behavior changes.

Validation to run: pnpm --filter @floorconnector/web exec tsx lib/financials/collections-follow-up-intelligence.test.ts; pnpm --filter @floorconnector/web exec tsx lib/financials/collections-command-center.test.ts; pnpm --filter @floorconnector/web typecheck; pnpm --filter @floorconnector/web lint; Run git diff --check.

Stage only intended files.
Commit the completed slice.
Final response requirements: Report branch name, starting status, final status, commit hash and message, files changed, validation results, and limitations.
