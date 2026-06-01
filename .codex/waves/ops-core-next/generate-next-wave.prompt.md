# Generate Next FloorConnector Wave

Use the context bundle:

`C:\FloorConnector\.codex\waves\ops-core-next\generator-context.md`

Use the JSON schema:

`C:\FloorConnector\.codex\waves\templates\next-wave.schema.json`

Write only JSON matching the schema to:

`C:\FloorConnector\.codex\waves\ops-core-next\generated-next-wave.json`

Rules:

- Propose a product-outcome wave, not random tasks.
- Prefer 3 to 5 bounded streams.
- Keep streams mergeable and reviewable.
- Respect FloorConnector canonical lifecycle guardrails.
- Do not propose blocked work.
- Do not propose schema, migrations, auth, RLS, payment math, provider behavior, env var, route-protection, or production mutation tasks unless the stream is high risk and explicitly justified.
- Include runnable Codex prompt bodies with required docs, boundaries, implementation requirements, validation, git completion, and final response requirements.
- Include validation and git completion requirements in every promptBody.
- Avoid cosmetic-only crumbs.
- Do not approve, run, merge, push, or activate the generated wave.

Current wave: ops-core-next
