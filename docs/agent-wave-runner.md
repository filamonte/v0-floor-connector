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
- Dirty stream worktree: inspect it; use `--resume` only when the dirty state is
  intentional.
- Missing prompt: fix the manifest or add the prompt.
- Validation failure: repair the stream, rerun validation, then regenerate the
  report.
- Merge conflict: resolve in the stream or integration branch manually; the
  runner will not auto-resolve.
- Missing agent command: use manual-agent mode.

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
