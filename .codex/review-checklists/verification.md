# Verification Review Checklist

## Owned Files / Modules

- E2E specs.
- Smoke scripts.
- QA checkpoint docs.
- Merge-readiness reports.

## Common Risks

- Treating redirects, 404s, login pages, or missing fixtures as successful QA.
- Adding fake QA data or local-only persistence.
- Expanding verification work into feature implementation.

## Required Validations

- `pnpm worktree:doctor`
- `pnpm worktree:audit` for merge-readiness reviews.
- Targeted smoke or E2E checks tied to the reviewed slice.
- Prettier on changed docs/specs.

## Out Of Scope

- Product feature implementation.
- Schema, auth, RLS, route, or business-logic changes unless explicitly
  approved as a fix.

## Merge Readiness Notes

- Verification should report blockers honestly.
- Keep PRs as draft until validation evidence and human review are complete.

## Human Review Expectations

- Confirm validation matches the risk area.
- Confirm any skipped checks include a concrete blocker.
