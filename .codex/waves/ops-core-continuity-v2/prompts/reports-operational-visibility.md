Chat: Reports Operational Visibility

Start by checking git status, current branch, and ahead/behind state.
Run git fetch origin.
Read the required FloorConnector docs first: docs/developer-source-of-truth.md, docs/current-state.md, docs/workflows.md, docs/chat-handoff.md, .codex/worktree-rules.md, and .codex/active-stream-plan.md.

Goal: make Reports a stronger read-only operating snapshot by tying field execution, schedule readiness, collections exposure, communication follow-up, and project continuity back to canonical source workspaces.

Use existing canonical records. Do not create duplicate business models. Do not change schema, migrations, Supabase policies, RLS, auth, env vars, route protection, payment math, provider behavior, or business logic outside the named product outcome. Do not add analytics warehouse behavior, stored report snapshots, report-builder persistence, exports, automated alerts, provider calls, AI summaries, or production mutation behavior. Avoid staging unrelated changes.

Run Prettier on changed supported files, targeted reports tests for changed helpers or surfaces, and git diff --check. Stage only intended files. Commit the completed slice. Final response requirements: branch, status, commit hash, files changed, validation results, and limitations.

## Required Git And Validation Workflow

- Start by checking git status, current branch, and ahead/behind state.
- Run git fetch origin.
- Avoid staging unrelated changes.
- Run git diff --check.
- Stage only intended files.
- Commit the completed slice.

## Required Final Response

Report branch name, starting status, final status, commit hash and message, files changed, validation results, and limitations.
