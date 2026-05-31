# Codex Cloud Setup

Status: Active
Doc Type: Developer Operations

## Purpose

Codex Cloud can help FloorConnector run background implementation slices and
open pull requests. It should complement local Codex CLI work, not replace
human review, local validation, or merge decisions.

## Connect GitHub

1. Connect the canonical GitHub repository to Codex Cloud:
   `https://github.com/filamonte/v0-floor-connector.git`.
2. Confirm Codex Cloud opens branches and PRs against `main`.
3. Keep repository secrets out of prompts. Do not ask Codex Cloud to print or
   create secrets.

## Delegation Flow

- Use GitHub issues or Codex web tasks for background slices.
- Start from `.codex/prompts/cloud-task.md`.
- Require Codex Cloud to open a PR, not merge it.
- Keep the PR draft unless the human owner marks it ready.
- Ask the cloud task to report changed files, validation, skipped checks, and
  product boundaries in the PR body.

## Recommended Cloud Task Types

- Documentation scaffolding and cleanup.
- Small component extractions with clear ownership.
- Focused helper/test additions.
- CI failure triage that maps failures to files.
- PR summary generation.
- Non-mutating status or audit scripts.

## Not Safe For Cloud Yet

- Remote Supabase migrations or database writes.
- Production environment changes.
- Secrets management.
- Payment, signature, portal access, auth, or RLS changes without explicit
  human-approved scope.
- Provider sends, customer-facing automation, autonomous AI, or scheduling
  mutation.
- Large cross-stream refactors.

## Reporting Back

Cloud work should report through the PR:

- stream and branch
- summary
- user-visible change
- technical change
- validation run
- skipped commands and why
- docs updated
- not included
- merge notes

After merge, update `docs/product-change-ledger.md` with the final PR and commit
hash.

## Local And Cloud Responsibility Split

- Local Codex CLI owns worktree hygiene, local validation, protected-route smoke,
  and any task that depends on local auth or local environment state.
- Codex Cloud owns bounded background slices that can be reviewed through a PR.
- ChatGPT remains the planning, audit, and product-owner coordination layer.
- Human owner approves merges, risky actions, production changes, and database
  actions.
