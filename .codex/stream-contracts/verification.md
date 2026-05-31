# Verification Stream Contract

## Owns

- Golden workflow QA, Playwright smoke, fixture readiness, auth-state recovery,
  merge-gate validation, and verification docs.

## May Touch With Caution

- E2E specs, test helpers, validation checklists, Playwright config, and
  non-mutating fixture discovery helpers.

## May Not Touch Without Control Approval

- Product feature behavior, schema/migrations, auth/RLS policy changes,
  financial math, payment/signature state, portal grants, or fake QA data.

## Validation Expectations

- Targeted helper tests.
- Focused route smoke only when auth/env is ready.
- `pnpm --filter @floorconnector/web typecheck` and lint when touched files
  require it.
- `git diff --check`.

## Docs Expectations

- Record what was actually verified, skipped, or blocked.
- Do not claim protected-route success when redirected to login or blocked by
  stale auth.

## Example Safe Slice

Add a skip-aware golden workflow smoke spec that reports missing fixture IDs.

## Example Unsafe Slice

Bypass portal access checks so a smoke test can reach a page.
