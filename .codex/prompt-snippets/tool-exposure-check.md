# Tool Exposure Check

Use this snippet near the start of FloorConnector Codex prompts when tool,
connector, or plugin availability may affect the work.

## Required Check

Before implementation, inspect the current Codex run and report external tools,
connectors, plugins, or MCP-backed capabilities that are exposed in the session.
Do not rely on a fixed list.

Report two groups:

1. Exposed tools/connectors available in this run.
2. Expected or user-selected tools/connectors that appear to be missing, if the
   runtime can determine that.

For each exposed tool relevant to the task, report:

- tool or connector name
- whether it will be used
- what it will be used for

If a tool is missing:

- say so clearly
- do not claim it was used
- continue only if the task can be completed safely from local repo files,
  docs, scripts, tests, and git
- stop only if the missing tool is truly required for safety or correctness

## Tool Rules

- Supabase: use only if exposed and the task requires remote database
  inspection, advisors, logs, migrations, generated types, auth/provider
  debugging, or live database validation. If Supabase is not exposed and no
  database/schema change is required, continue from local migrations, generated
  types, current docs, and tests.
- Figma/Stitch/design tools: use only if exposed and the task needs design
  context, node inspection, design sync, screenshots, or design implementation
  guidance. Otherwise continue from local docs, screenshots, and handoff notes.
- Vercel: use only if exposed and the task requires deployment, preview URL
  inspection, runtime logs, build logs, or Vercel docs. Otherwise continue
  locally.
- Linear/Notion: use only if exposed and the task requires issue, project, or
  doc tracking there. Otherwise keep planning in repo docs.
- GitHub: use only if exposed and the task requires PR, issue, review, or CI
  inspection beyond local git and GitHub CLI. If the connector is not exposed
  but `gh` works locally, use `gh`.
- Stripe: use only if exposed and the task requires Stripe account objects,
  docs, integration planning, payment links, invoices, refunds, disputes, or
  live payment-provider inspection. Do not use Stripe for ordinary local
  invoice UI work unless provider behavior is involved.
- OpenAI Platform: use only if exposed and the task requires OpenAI API key
  setup or OpenAI Platform configuration. Do not create or request API keys
  unless the task explicitly requires it.
- Superpowers: use if exposed for repo or project acceleration. If it is not
  exposed, continue with normal local repository inspection and commands. Do not
  block solely because Superpowers is unavailable.

## End-Of-Task Report

Include a `Tool exposure` section listing:

- tools/connectors Codex detected as exposed
- which exposed tools were used
- which expected tools were missing
- whether any missing tool changed the result
