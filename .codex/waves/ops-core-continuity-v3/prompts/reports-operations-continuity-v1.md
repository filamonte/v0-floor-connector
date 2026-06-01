Chat: Reports Operations Continuity

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

Product outcome: Strengthen the Reports operations view with clearer cross-record continuity for project readiness, field execution, schedule attention, AR exposure, and recent movement.

Work inside the existing Reports route and operations-summary read model. Reports must remain a read-only company-level visibility surface that summarizes canonical source records and routes back to Project Workspace, CrewBoard/Schedule, Invoice Workspace, Daily Logs, or Field Work Items.

Acceptance criteria:

- Reports distinguish attention, ready-to-move, AR exposure, field execution, and recent movement without becoming a separate workflow system.
- Source links route users back to canonical record surfaces.
- Empty states and partial data states are deterministic.
- Tests cover summary counts, source links, empty states, and mixed attention/recent movement scenarios.
- docs/current-state.md is updated only if the implemented Reports behavior materially changes.

Boundaries:

- Use existing canonical records.
- Do not create duplicate business models.
- Do not change schema, migrations, Supabase policies, RLS, auth, env vars, route protection, payment math, provider behavior, or business logic outside the named product outcome.
- Do not add report-only persistence, metric-entry workflows, BI-style disconnected truth, new operational status enums, or financial math changes.

Validation:

- pnpm --filter @floorconnector/web exec tsx lib/reports/operations-summary.test.ts
- pnpm --filter @floorconnector/web typecheck
- pnpm --filter @floorconnector/web lint
- pnpm exec prettier --check docs/current-state.md
- git diff --check

Run git diff --check.
Stage only intended files.
Commit the completed slice.
Final response requirements: Report branch name, starting status, final status, commit hash and message, files changed, validation results, and limitations.
