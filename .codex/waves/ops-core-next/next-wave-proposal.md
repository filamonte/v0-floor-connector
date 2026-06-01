# Next Wave Proposal

Status: Generated
Source Wave: ops-core-next
Generated: 2026-06-01T16:28:55.150Z

## Current Wave Goal

Make FloorConnector more operationally useful for field execution and collections follow-up without schema changes.

## Stream Notes

- field-execution-command-v1: validation not_run; merge-check not_run; follow-up should preserve Make daily logs, open field notes, blockers, and today's job execution easier to act on from existing project/job/daily-log context.
- collections-follow-up-context-v1: validation not_run; merge-check not_run; follow-up should preserve Extend AR Collections with read-only follow-up context and clearer invoice/customer/project continuity using existing records only.
- portal-trust-continuity-v1: validation not_run; merge-check not_run; follow-up should preserve Improve customer portal project/invoice/contract continuity so customer-facing state reflects the same operational loop more clearly.
- e2e-fixture-refresh-v1: validation not_run; merge-check not_run; follow-up should preserve Fix stale protected smoke fixture discovery so browser validation proves real detail pages without hard-coded dead IDs.

## Proposed Next Wave

Name: ops-core-next-follow-up

Goal: Continue the strongest validated product outcomes from ops-core-next, with one integration-safe follow-up per stream after human review.

## Guardrails For Generated Prompts

- Read the required FloorConnector docs first.
- Start with git status, current branch, and fetch.
- Use existing canonical data and routes.
- Do not add schema, migrations, auth, RLS, payment math, provider behavior, env vars, or route protection unless explicitly approved.
- Keep changes bounded to the named stream outcome.
- Run targeted validation, Prettier on changed supported files, and git diff --check.
- Commit only the completed slice.

## Suggested Follow-Up Prompts

### field-execution-command-v1-follow-up

Refine only after reviewing the field-execution-command-v1 run output. Preserve the original outcome:

Make daily logs, open field notes, blockers, and today's job execution easier to act on from existing project/job/daily-log context.

Focus on validation gaps, integration clarity, and product usefulness. Do not expand into unrelated feature work.

### collections-follow-up-context-v1-follow-up

Refine only after reviewing the collections-follow-up-context-v1 run output. Preserve the original outcome:

Extend AR Collections with read-only follow-up context and clearer invoice/customer/project continuity using existing records only.

Focus on validation gaps, integration clarity, and product usefulness. Do not expand into unrelated feature work.

### portal-trust-continuity-v1-follow-up

Refine only after reviewing the portal-trust-continuity-v1 run output. Preserve the original outcome:

Improve customer portal project/invoice/contract continuity so customer-facing state reflects the same operational loop more clearly.

Focus on validation gaps, integration clarity, and product usefulness. Do not expand into unrelated feature work.

### e2e-fixture-refresh-v1-follow-up

Refine only after reviewing the e2e-fixture-refresh-v1 run output. Preserve the original outcome:

Fix stale protected smoke fixture discovery so browser validation proves real detail pages without hard-coded dead IDs.

Focus on validation gaps, integration clarity, and product usefulness. Do not expand into unrelated feature work.
