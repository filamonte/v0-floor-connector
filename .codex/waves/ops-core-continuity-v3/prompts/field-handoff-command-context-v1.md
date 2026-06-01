Chat: Field Handoff Command Context

Start by checking git status, current branch, and ahead/behind state.
Run git fetch origin.
Avoid staging unrelated changes.

Read the required FloorConnector docs first:

- docs/developer-source-of-truth.md
- docs/current-state.md
- docs/workflows.md
- docs/chat-handoff.md
- .codex/worktree-rules.md
- .codex/active-stream-plan.md

Product outcome: Make field handoff context clearer by connecting scheduled jobs, assigned work, Daily Logs, and open field blockers into one read-only command view.

Work inside the existing field/schedule/daily-log surfaces and shared read models. Use canonical jobs, job_assignments, Daily Logs, field notes, project readiness, and existing route links. Prefer extending apps/web/lib/schedule/field-handoff-read-model.ts and the focused component/page seams already used by Schedule, Daily Log, and Field execution surfaces.

Acceptance criteria:

- The command view separates ready-to-work, needs-attention, and recent field activity states.
- Links go to existing Schedule, Daily Log, Project, and Field Work Item routes.
- Empty states remain customer-safe and do not imply missing persistence.
- Tests cover the derived grouping and empty-state rules.

Boundaries:

- Use existing canonical records.
- Do not create duplicate business models.
- Do not change schema, migrations, Supabase policies, RLS, auth, env vars, route protection, payment math, provider behavior, or business logic outside the named product outcome.
- Do not add new field persistence, scheduling state, assignment mutation paths, or local-only storage.

Validation:

- pnpm --filter @floorconnector/web exec tsx lib/schedule/field-handoff-read-model.test.ts
- pnpm --filter @floorconnector/web typecheck
- pnpm --filter @floorconnector/web lint
- git diff --check

Run git diff --check.
Stage only intended files.
Commit the completed slice.
Final response requirements: Report branch name, starting status, final status, commit hash and message, files changed, validation results, and limitations.
