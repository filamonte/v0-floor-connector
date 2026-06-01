# Generate Next FloorConnector Wave

Use the context bundle:

`C:\FloorConnector\.codex\waves\ops-core-next\.tmp\generation\20260601T221905\generator-context.md`

Use the JSON schema:

`C:\FloorConnector\.codex\waves\templates\next-wave.schema.json`

Write only JSON matching the schema to:

`C:\FloorConnector\.codex\waves\ops-core-next\.tmp\generation\20260601T221905\generated-next-wave.json`

Output contract:

- Output only JSON matching the schema.
- Do not include Markdown, commentary, logs, analysis, or follow-up text.

Wave rules:

- Generate 3 to 5 product-outcome streams only.
- Do not generate meta/debug/tooling-only streams.
- Do not generate streams named or themed around blocked file writes, docs reading, cleanup checks, validation-only, or sandbox diagnostics.
- Every stream must materially advance FloorConnector using existing canonical records.
- Avoid cosmetic-only crumbs.
- Prefer operational product areas:
  - Field execution command
  - Collections follow-up context
  - Portal trust continuity
  - E2E fixture refresh
  - Reporting/operational visibility
  - Customer/project continuity
- Keep streams mergeable and reviewable.
- Respect FloorConnector canonical lifecycle guardrails.
- Do not propose schema, migrations, auth, RLS, payment math, provider behavior, env vars, route protection, or production mutation tasks.
- No blocked streams.
- Every stream risk must be low or medium unless explicitly allowed by the runner.
- No high-risk streams unless --allow-high-risk is explicitly being used.
- Every stream branch must be stream/<kebab-case-name>.
- Every stream worktree should be under C:/FC-worktrees/<kebab-case-name-without-stream-prefix>.
- Every promptFile must be .codex/waves/<next-wave-name>/prompts/<stream-name>.md.
- Do not approve, run, merge, push, or activate the generated wave.

Every promptBody must include:

- Chat: <stream title>
- Start by checking git status, current branch, and ahead/behind state.
- Run git fetch origin.
- Avoid staging unrelated changes.
- Run git diff --check.
- Stage only intended files.
- Commit the completed slice.
- Final response requirements: Report branch name, starting status, final status, commit hash and message, files changed, validation results, and limitations.

Required promptBody boundaries:

- Read the required FloorConnector docs first.
- Use existing canonical records.
- Do not create duplicate business models.
- Do not change schema, migrations, Supabase policies, RLS, auth, env vars, route protection, payment math, provider behavior, or business logic outside the named product outcome.

Current wave: ops-core-next
