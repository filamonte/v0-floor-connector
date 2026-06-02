Chat: Field Execution Readiness Brief

Start by checking git status, current branch, and ahead/behind state.
Run git fetch origin.
Avoid staging unrelated changes.

Read the required FloorConnector docs first: docs/developer-source-of-truth.md, docs/current-state.md, docs/workflows.md, docs/chat-handoff.md, .codex/worktree-rules.md, and .codex/active-stream-plan.md.

Product outcome: Add a read-only field execution readiness brief that helps crews and dispatchers understand job readiness, assigned work, Daily Log coverage, blockers, and project/customer context from existing canonical records.

Use existing canonical records. Do not create duplicate business models. Do not change schema, migrations, Supabase policies, RLS, auth, env vars, route protection, payment math, provider behavior, or business logic outside the named product outcome.

Scope the work to existing field/schedule/project helpers and the field work-items experience. Prefer helper composition and focused tests over new abstractions. Do not add new field workflow state, local-only persistence, dispatch mutation, or readiness override behavior.

Acceptance criteria: the field work-items surface shows a compact readiness brief derived from existing jobs, assignments, projects, customers, Daily Logs, and field blockers; the brief links or labels source context without creating new persistence; focused tests cover ready, blocked, and missing-log/readiness-context cases; docs update implemented truth only if visible behavior changes.

Validation to run: pnpm --filter @floorconnector/web exec tsx lib/field/assigned-work-read-model.test.ts; pnpm --filter @floorconnector/web typecheck; pnpm --filter @floorconnector/web lint; Run git diff --check.

Stage only intended files.
Commit the completed slice.
Final response requirements: Report branch name, starting status, final status, commit hash and message, files changed, validation results, and limitations.
