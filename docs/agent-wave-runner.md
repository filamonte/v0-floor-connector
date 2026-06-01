# Agent Wave Runner

Status: Active
Doc Type: Developer Operations

The Agent Wave Runner is local development tooling for starting and reviewing
bounded FloorConnector product-outcome waves. It does not change product runtime
behavior and must not be used to bypass human review.

## Why This Exists

FloorConnector now has enough connected operational surface area that future
work should move in outcome-linked waves instead of disconnected crumbs. The
runner coordinates those waves by reading a manifest, preparing isolated
worktrees and branches, validating each stream, dry-checking merge conflicts,
generating one review report, and stopping before merge or push.

The runner is workflow infrastructure only. It does not apply migrations, mutate
Supabase, edit env files, store secrets, store auth state, send provider calls,
or change product behavior by itself.

## Safety Model

The runner is intentionally conservative:

- refuses to run from a dirty `main`
- starts from the manifest base, normally `origin/main`
- refuses dirty stream worktrees unless `--resume` is provided
- validates every prompt file before preparing worktrees
- refuses `blocked` streams
- supports `low` and `medium` risk by default
- requires `--allow-high-risk` for any high-risk stream
- refuses more than one high-risk stream per wave
- never force-pushes
- never deletes stream branches automatically
- never auto-resolves merge conflicts
- refuses merge without `--approved`
- refuses push unless approval was created with push approval and merge is run
  with `--approved --push`

High-risk work includes schema, migrations, auth, RLS, payment math, provider
behavior, env, or route-protection changes. Those are not appropriate for the
default runner path.

## One-Command Run Flow

```powershell
pnpm fc:wave --wave ops-core-next
```

The `run` command:

1. Fetches `origin`.
2. Confirms `main` is clean.
3. Reads `.codex/waves/<wave>/wave.json`.
4. Creates or attaches stream worktrees and branches.
5. Verifies stream prompt files.
6. Runs `FLOORCONNECTOR_AGENT_COMMAND` per stream when configured.
7. Falls back to manual-agent instructions when no agent command is configured.
8. Runs stream validation where worktrees exist.
9. Creates a scratch integration worktree for dry merge checks.
10. Generates `.codex/waves/<wave>/run-report.md`.
11. Generates `.codex/waves/<wave>/next-wave-proposal.md`.
12. Stops before merge.

Do not configure an agent command unless you want stream agents to run.

## Manifest Format

Wave manifests live at:

```text
.codex/waves/<wave>/wave.json
```

The manifest describes the base ref, worktree root, validation commands,
product-stride criteria, and streams:

```json
{
  "name": "ops-core-next",
  "goal": "Make FloorConnector more operationally useful without schema changes.",
  "base": "origin/main",
  "worktreeRoot": "C:/FC-worktrees",
  "maxConcurrency": 2,
  "mainValidation": [
    "pnpm.cmd --filter @floorconnector/web typecheck",
    "pnpm.cmd --filter @floorconnector/web lint",
    "pnpm.cmd fc:preflight:fast",
    "git diff --check"
  ],
  "productStrideCriteria": [
    "Improves daily contractor operations",
    "Connects to canonical workflow records",
    "Reduces manual decision friction",
    "Creates visible user-facing capability",
    "Avoids duplicate models and module silos"
  ],
  "streams": []
}
```

Each stream includes `name`, `branch`, `worktree`, `prompt`, `risk`,
`productOutcome`, `expectedFiles`, and `validation`.

## Agent Command Configuration

The runner uses `FLOORCONNECTOR_AGENT_COMMAND` so it does not depend on one
Codex CLI shape.

Example:

```powershell
$env:FLOORCONNECTOR_AGENT_COMMAND = "codex exec --cd {worktree} --prompt-file {promptFile}"
pnpm fc:wave --wave ops-core-next
```

Supported placeholders:

- `{wave}`
- `{stream}`
- `{branch}`
- `{worktree}`
- `{promptFile}`

If the variable is missing, the runner does not fail. It records each stream as
`manual_agent_required` and prints copy-ready manual guidance in status output
and reports.

## Manual-Agent Mode

Manual mode is the default safe path for V1:

```powershell
pnpm fc:wave:prepare --wave ops-core-next
pnpm fc:wave:status --wave ops-core-next
```

Then open each stream worktree and run the matching prompt manually. After
stream work is committed:

```powershell
pnpm fc:wave:validate --wave ops-core-next
pnpm fc:wave:merge-check --wave ops-core-next
pnpm fc:wave:report --wave ops-core-next
```

## Product Stride Review

The run report includes a Product Stride Review for every stream:

- Product impact: `low`, `medium`, or `high`
- User-visible improvement: `yes` or `no`
- Canonical workflow alignment: `yes` or `needs review`
- Operational value: `low`, `medium`, or `high`
- Risk level
- Recommended action: `merge`, `revise`, `reject`, or `needs human review`

The runner marks a stream for human review when validation did not run, the
risk/product value tradeoff is unclear, the file count is broad, or the stream
does not clearly preserve canonical workflow boundaries.

## Next Prompt Generation

Reports create:

```text
.codex/waves/<wave>/next-wave-proposal.md
```

V1 generation is template-driven. It uses the current wave goal, stream
outcomes, validation state, merge-check state, FloorConnector roadmap direction,
and the recently landed operational loop. It does not call AI automatically.

Generated prompts preserve the FloorConnector guardrails: read required docs
first, start with git status and fetch, use existing canonical records, avoid
schema unless explicitly approved, run validation, commit only the completed
slice, and report final status honestly.

## AI-Driven Generation

Wave Runner V1.5 adds a separate proposed-wave generator:

```powershell
pnpm fc:wave:generate --wave ops-core-next
```

The generator reads the current manifest, `run-report.md`,
`stream-status.json`, recent git history, and current roadmap/status docs, then
creates attempt-local scratch files first:

```text
.codex/waves/<current-wave>/.tmp/generation/<timestamp>/generator-context.md
.codex/waves/<current-wave>/.tmp/generation/<timestamp>/generate-next-wave.prompt.md
.codex/waves/<current-wave>/.tmp/generation/<timestamp>/generated-next-wave.raw.txt
.codex/waves/<current-wave>/.tmp/generation/<timestamp>/generated-next-wave.json
.codex/waves/<current-wave>/.tmp/generation/<timestamp>/generation-status.json
.codex/waves/<current-wave>/.tmp/generation/<timestamp>/stdout.txt
.codex/waves/<current-wave>/.tmp/generation/<timestamp>/stderr.txt
```

If `FLOORCONNECTOR_WAVE_GENERATOR_COMMAND` is configured, the runner invokes it
and validates the resulting JSON before writing any tracked current-wave or
proposed-wave files. Failed attempts stay under the ignored `.tmp` scratch path
and do not update `generator-context.md`, `generate-next-wave.prompt.md`,
`generation-status.json`, `stream-status.json`, `run-report.md`,
`next-wave-proposal.md`, or the proposed wave directory. Generated proposal JSON
stays in the scratch attempt as `generated-next-wave.json`; it is not promoted
into the tracked current-wave folder.

Example:

```powershell
$env:FLOORCONNECTOR_WAVE_GENERATOR_COMMAND = 'powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Content -Raw ''{generatorPromptFile}'' | codex -c windows.sandbox=''unelevated'' exec --cd ''{repo}'' --output-schema ''{schemaFile}'' -o ''{outputFile}'' -"'
pnpm fc:wave:generate --wave ops-core-next
```

Supported placeholders:

- `{repo}`
- `{wave}`
- `{currentWave}`
- `{nextWave}`
- `{generatorPromptFile}`
- `{contextFile}`
- `{schemaFile}`
- `{outputFile}`

The generator should write JSON to `{outputFile}`. If it does not, the runner
attempts to parse JSON from stdout/stderr. The runner never treats arbitrary AI
text as trusted instructions.

On Windows, the recommended Codex command keeps the CLI in an unelevated
sandbox:

```powershell
$env:FLOORCONNECTOR_WAVE_GENERATOR_COMMAND = 'powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Content -Raw ''{generatorPromptFile}'' | codex -c windows.sandbox=''unelevated'' exec --cd ''{repo}'' --output-schema ''{schemaFile}'' -o ''{outputFile}'' -"'
pnpm fc:wave:generate --wave ops-core-next
```

If Codex fails before repo commands can run with the known Windows sandbox
`spawn setup refresh` issue, the runner reports:

```text
Codex Windows sandbox failed before repo commands could run.
```

The scratch attempt path is printed so the stdout/stderr diagnostics can be
inspected without dirtying `main`.

## Structured Schema Safety

AI output must match:

```text
.codex/waves/templates/next-wave.schema.json
```

The runner also applies additional local validation:

- valid JSON only
- 3 to 5 streams
- product-outcome streams only
- no meta/debug/tooling-only streams
- no streams named or themed around blocked file writes, docs reading, cleanup
  checks, validation-only work, or sandbox diagnostics
- no `blocked` streams
- at most one high-risk stream
- high-risk output requires `--allow-high-risk`
- stream names, branches, worktrees, and prompt paths must be safe
- stream branches must be `stream/<kebab-case-name>`
- stream worktrees must be under `C:/FC-worktrees/<kebab-case-name>`
- prompt files must be inside `.codex/waves/<next-wave>/prompts/`
- env files, secrets, tokens, credentials, and service-role references are
  rejected
- schema, migrations, auth, RLS, payment math, provider, webhook, env, and
  route-protection tasks are rejected unless the stream is high risk and high
  risk was explicitly allowed
- every stream must include a clear product outcome, acceptance criteria,
  validation commands, and git completion requirements in `promptBody`
- every `promptBody` must include the exact git and validation guardrails:
  `Start by checking git status, current branch, and ahead/behind state.`,
  `Run git fetch origin.`, `Avoid staging unrelated changes.`,
  `Run git diff --check.`, `Stage only intended files.`, and
  `Commit the completed slice.`
- every `promptBody` must require the final response to report branch name,
  starting status, final status, commit hash and message, files changed,
  validation results, and limitations

Before rejecting generated output, the runner only performs narrow safe
normalization: it trims whitespace, normalizes `promptFile` to
`.codex/waves/<next-wave>/prompts/<stream-name>.md` when the wave and stream
names are already safe, and may inject a `## Required Git And Validation
Workflow` block into otherwise-valid product stream prompts that used
equivalent wording but missed the exact required sentences.

The guardrail injection is not a safety repair. The runner still refuses
blocked streams, high-risk streams without `--allow-high-risk`, unsafe branch
names, unsafe worktree paths, prompt paths outside the proposed wave, missing
product outcomes, missing acceptance criteria, schema-invalid structures,
meta/debug/tooling-only streams, secret references, and schema/auth/RLS/payment
math/provider/env/route-protection work without explicit high-risk approval.
Failed attempts stay under the ignored scratch attempt path and do not promote
tracked wave files.

## Template Fallback Mode

If `FLOORCONNECTOR_WAVE_GENERATOR_COMMAND` is not set,
`pnpm fc:wave:generate` exits safely and writes a template fallback proposed
wave plus manual generator files. The generation status is marked
`manual_ai_required` so the user can inspect the context/prompt or rerun with a
configured generator command.

Fallback mode does not run agents and does not approve the proposed wave.

## Generated Wave Approval

Generated waves are written with:

```json
{
  "state": "proposed"
}
```

The runner refuses to `run`, `prepare`, `validate`, `merge-check`, or `merge`
a proposed wave. A human must review the manifest, prompt files,
`PROPOSED.md`, and the current wave's `ai-next-wave-review.md`, then activate:

```powershell
pnpm fc:wave:approve --wave <generated-wave-name> --proposal
```

This changes the generated manifest to `state: "active"` and writes
`proposal-approved.json`. Activation is not stream approval and does not merge
or push anything. Stream merge approval still uses the normal approval and merge
gate after the wave has actually run.

## Recommended AI Generation Workflow

```powershell
pnpm fc:wave:validate --wave ops-core-next
pnpm fc:wave:merge-check --wave ops-core-next
pnpm fc:wave:report --wave ops-core-next
pnpm fc:wave:generate --wave ops-core-next
pnpm fc:wave:status --wave ops-core-next
```

Then inspect:

```text
.codex/waves/ops-core-next/ai-next-wave-review.md
.codex/waves/ops-core-next/generation-status.json
.codex/waves/ops-core-next/.tmp/generation/<timestamp>/generated-next-wave.json
.codex/waves/<generated-wave>/PROPOSED.md
.codex/waves/<generated-wave>/wave.json
.codex/waves/<generated-wave>/prompts/
```

Only after review:

```powershell
pnpm fc:wave:approve --wave <generated-wave> --proposal
pnpm fc:wave:prepare --wave <generated-wave>
```

## Generator Boundaries

The generator is allowed to propose product-outcome wave manifests and prompt
files. It must never approve, run, merge, push, mutate product code, apply
migrations, edit env files, call Supabase, call providers, store secrets, or
claim planned capabilities are implemented.

## Merge And Push

Approval and merge are separate:

```powershell
pnpm fc:wave:approve --wave ops-core-next
pnpm fc:wave:merge --wave ops-core-next --approved
```

Push requires explicit push approval and the merge command flag:

```powershell
pnpm fc:wave:approve --wave ops-core-next --push
pnpm fc:wave:merge --wave ops-core-next --approved --push
```

The merge command fetches `origin`, requires clean up-to-date `main`, merges
approved stream branches one by one with `--no-ff`, runs manifest main
validation, stops on conflict or validation failure, and never pushes unless
`--push` is supplied.

## Handling Failures

- Dirty `main`: commit, stash, or move unrelated changes before running.
- Invalid AI proposal: the runner prints `AI generated an invalid wave
proposal.`, lists the invalid stream names and exact reasons, and prints the
  ignored scratch path under `.codex/waves/<wave>/.tmp/generation/<timestamp>/`.
- Dirty stream worktree: inspect it; use `--resume` only when the dirty state is
  intentional.
- Missing prompt: fix the manifest or add the prompt.
- Validation failure: repair the stream, rerun validation, then regenerate the
  report.
- Merge conflict: resolve in the stream or integration branch manually; the
  runner will not auto-resolve.
- Missing agent command: use manual-agent mode.

To inspect a failed generator attempt:

```powershell
Get-ChildItem .codex/waves/ops-core-next/.tmp/generation
Get-Content .codex/waves/ops-core-next/.tmp/generation/<timestamp>/generation-status.json
Get-Content .codex/waves/ops-core-next/.tmp/generation/<timestamp>/generated-next-wave.raw.txt
Get-Content .codex/waves/ops-core-next/.tmp/generation/<timestamp>/stdout.txt
Get-Content .codex/waves/ops-core-next/.tmp/generation/<timestamp>/stderr.txt
```

After reviewing the scratch diagnostics, fix the generator command or prompt
inputs and rerun:

```powershell
pnpm fc:wave:generate --wave ops-core-next
```

## Resume

Use:

```powershell
pnpm fc:wave:status --wave ops-core-next
pnpm fc:wave:prepare --wave ops-core-next --resume
pnpm fc:wave:validate --wave ops-core-next
pnpm fc:wave:report --wave ops-core-next
```

`--resume` only relaxes the dirty stream-worktree refusal. It does not relax
dirty `main`, approval, merge, push, blocked-risk, or validation behavior.

## What Not To Automate

Do not automate:

- schema or migration application
- Supabase remote mutation
- provider sends or webhook replay
- auth state creation
- payment, signature, invoice, or estimate state changes
- production env edits
- force pushes
- branch deletion
- worktree retirement
- conflict resolution
- final merge or push without explicit approval

## Recommended Wave Sizing

- 3 to 6 streams
- low or medium risk by default
- at most one high-risk stream, only with `--allow-high-risk`
- streams should be outcome-linked
- each stream should produce visible product progress or unblock reliable
  validation
- avoid tiny cosmetic-only tasks unless they directly unblock validation or
  review
