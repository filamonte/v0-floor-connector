# Next Wave Proposal

Status: Generated
Source Wave: ops-core-continuity-v3
Generated: 2026-06-01T23:04:43.714Z

## Current Wave Goal

Tighten operational continuity across field execution, collections follow-up, portal trust, and reporting using existing canonical records only.

## Stream Notes

- field-handoff-command-context-v1: validation failed; merge-check passed; follow-up should preserve Make field handoff context clearer by connecting scheduled jobs, assigned work, Daily Logs, and open field blockers into one read-only command view.
- collections-customer-project-continuity-v1: validation failed; merge-check passed; follow-up should preserve Improve AR follow-up context by showing invoice, payment, customer, project, and last activity continuity from existing financial records.
- portal-project-trust-thread-v1: validation failed; merge-check passed; follow-up should preserve Make the portal project view show a clearer customer-safe trust thread across project status, contract, invoice, shared documents, and field evidence visibility.
- reports-operations-continuity-v1: validation failed; merge-check passed; follow-up should preserve Strengthen the Reports operations view with clearer cross-record continuity for project readiness, field execution, schedule attention, AR exposure, and recent movement.

## Proposed Next Wave

Name: ops-core-continuity-v3-follow-up

Goal: Continue the strongest validated product outcomes from ops-core-continuity-v3, with one integration-safe follow-up per stream after human review.

## Guardrails For Generated Prompts

- Read the required FloorConnector docs first.
- Start with git status, current branch, and fetch.
- Use existing canonical data and routes.
- Do not add schema, migrations, auth, RLS, payment math, provider behavior, env vars, or route protection unless explicitly approved.
- Keep changes bounded to the named stream outcome.
- Run targeted validation, Prettier on changed supported files, and git diff --check.
- Commit only the completed slice.

## Suggested Follow-Up Prompts

### field-handoff-command-context-v1-follow-up

Refine only after reviewing the field-handoff-command-context-v1 run output. Preserve the original outcome:

Make field handoff context clearer by connecting scheduled jobs, assigned work, Daily Logs, and open field blockers into one read-only command view.

Focus on validation gaps, integration clarity, and product usefulness. Do not expand into unrelated feature work.

### collections-customer-project-continuity-v1-follow-up

Refine only after reviewing the collections-customer-project-continuity-v1 run output. Preserve the original outcome:

Improve AR follow-up context by showing invoice, payment, customer, project, and last activity continuity from existing financial records.

Focus on validation gaps, integration clarity, and product usefulness. Do not expand into unrelated feature work.

### portal-project-trust-thread-v1-follow-up

Refine only after reviewing the portal-project-trust-thread-v1 run output. Preserve the original outcome:

Make the portal project view show a clearer customer-safe trust thread across project status, contract, invoice, shared documents, and field evidence visibility.

Focus on validation gaps, integration clarity, and product usefulness. Do not expand into unrelated feature work.

### reports-operations-continuity-v1-follow-up

Refine only after reviewing the reports-operations-continuity-v1 run output. Preserve the original outcome:

Strengthen the Reports operations view with clearer cross-record continuity for project readiness, field execution, schedule attention, AR exposure, and recent movement.

Focus on validation gaps, integration clarity, and product usefulness. Do not expand into unrelated feature work.
