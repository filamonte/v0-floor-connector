# Sales To Production Readiness V1 Live Status

Status date: 2026-06-06

Status source: live Git/worktree inspection from `C:\FloorConnector` on `main`
after `git push origin main`, `git fetch origin`, implementation-stream rebases
onto current `origin/main`, verification-stream rebase, focused validation,
typecheck, lint, fast preflight, and diff checks.

## Wave Status

`sales-to-production-readiness-v1` rebase/revalidation is complete.

The three implementation streams were each rebased onto current `origin/main`
with no conflicts. Each implementation stream is clean, has one implementation
commit ahead of `origin/main`, has no schema/migration changes, and has current
focused/full validation evidence.

The verification stream was then rebased onto current `origin/main` with no
conflicts. It is clean, has one verification commit ahead of `origin/main`, and
has current verification/focused/full validation evidence.

`main` status after fetch:

- Branch: `main`
- Clean: yes
- Ahead/behind `origin/main`: `0 ahead / 0 behind`
- Latest pushed review-packet commit:
  `9679a280 docs: add sales to production readiness review packet`

No merges, PRs, new waves, schema changes, migration edits, production-code
changes from `main`, or work in `C:\FC-worktrees\project-next-actions` occurred
as part of this rebase/revalidation pass.

## Stream Status Table

| Stream                                | Worktree exists | Branch                                       | Clean / dirty | Ahead / behind `origin/main` | Updated head                                           | Rebase result        | Merge readiness   |
| ------------------------------------- | --------------- | -------------------------------------------- | ------------- | ---------------------------- | ------------------------------------------------------ | -------------------- | ----------------- |
| `sales-readiness-command-v1`          | Yes             | `stream/sales-readiness-command-v1`          | Clean         | `1 ahead / 0 behind`         | `70c7251c feat: clarify sales readiness command`       | Passed, no conflicts | Ready             |
| `estimate-contract-readiness-v1`      | Yes             | `stream/estimate-contract-readiness-v1`      | Clean         | `1 ahead / 0 behind`         | `cdd7e2f8 feat: clarify estimate contract readiness`   | Passed, no conflicts | Ready             |
| `schedule-readiness-handoff-v1`       | Yes             | `stream/schedule-readiness-handoff-v1`       | Clean         | `1 ahead / 0 behind`         | `efd81835 feat: clarify schedule readiness handoff`    | Passed, no conflicts | Ready             |
| `verification-sales-to-production-v1` | Yes             | `stream/verification-sales-to-production-v1` | Clean         | `1 ahead / 0 behind`         | `aee909e5 test: protect sales to production readiness` | Passed, no conflicts | Ready, merge last |

## Updated Commits By Stream

| Stream                                | Commit hash                                | Commit message                                |
| ------------------------------------- | ------------------------------------------ | --------------------------------------------- |
| `sales-readiness-command-v1`          | `70c7251c031a367be70fea49b6ae4c060fe87fe9` | `feat: clarify sales readiness command`       |
| `estimate-contract-readiness-v1`      | `cdd7e2f8e42cc9df26adbc63baf722b582a4d2a6` | `feat: clarify estimate contract readiness`   |
| `schedule-readiness-handoff-v1`       | `efd81835a9f66724b954e65b48b487a8d2d7f5cc` | `feat: clarify schedule readiness handoff`    |
| `verification-sales-to-production-v1` | `aee909e55d8241eb57ad3a498ed5031362fd2c66` | `test: protect sales to production readiness` |

## Files Changed By Stream

### `sales-readiness-command-v1`

- `apps/web/app/(app)/leads/[leadId]/page.tsx`
- `apps/web/lib/opportunities/follow-up-read-model.test.ts`
- `apps/web/lib/opportunities/follow-up-read-model.ts`

### `estimate-contract-readiness-v1`

- `apps/web/app/(app)/estimates/[estimateId]/page.tsx`
- `apps/web/lib/document-readiness/readiness.test.ts`
- `apps/web/lib/document-readiness/readiness.ts`

### `schedule-readiness-handoff-v1`

- `apps/web/app/(app)/schedule/page.tsx`
- `apps/web/components/schedule-crewboard-presentational.tsx`
- `apps/web/lib/schedule/dispatch-board.test.ts`
- `apps/web/lib/schedule/dispatch-board.ts`
- `apps/web/lib/schedule/read-model.test.ts`
- `apps/web/lib/schedule/read-model.ts`

### `verification-sales-to-production-v1`

- `apps/web/lib/verification/sales-to-production-readiness.test.ts`
- `apps/web/lib/verification/sales-to-production-readiness.ts`
- `docs/golden-workflow-verification-matrix.md`

## Validation By Stream

| Stream                                | Validation results                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sales-readiness-command-v1`          | Passed: `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/opportunities/follow-up-read-model.test.ts` (7 tests); `pnpm.cmd --filter @floorconnector/web typecheck`; `pnpm.cmd --filter @floorconnector/web lint`; `pnpm.cmd fc:preflight:fast`; `git diff --check`                                                                                                                                                                                            |
| `estimate-contract-readiness-v1`      | Passed: `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/document-readiness/readiness.test.ts` (11 tests); `pnpm.cmd --filter @floorconnector/web typecheck`; `pnpm.cmd --filter @floorconnector/web lint`; `pnpm.cmd fc:preflight:fast`; `git diff --check`                                                                                                                                                                                                 |
| `schedule-readiness-handoff-v1`       | Passed: `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/schedule/read-model.test.ts lib/schedule/dispatch-board.test.ts` (23 tests); `pnpm.cmd --filter @floorconnector/web typecheck`; `pnpm.cmd --filter @floorconnector/web lint`; `pnpm.cmd fc:preflight:fast`; `git diff --check`                                                                                                                                                                      |
| `verification-sales-to-production-v1` | Passed: `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/verification/sales-to-production-readiness.test.ts` (3 tests); opportunities + document readiness focused tests (12 tests); schedule read model + dispatch board focused tests (20 tests); `lib/projects/project-next-actions.test.ts` (6 tests); `pnpm.cmd --filter @floorconnector/web typecheck`; `pnpm.cmd --filter @floorconnector/web lint`; `pnpm.cmd fc:preflight:fast`; `git diff --check` |

Validation note: `lib/projects/next-actions.test.ts` was a stale path in the
earlier review-packet recommendation. The existing test path is
`lib/projects/project-next-actions.test.ts`, and that test passed with 6 tests.

## Schema And Migration Check

No schema or migration files changed in any stream after rebase.

## Merge Readiness

All four streams are now merge-ready from the Integration Coordinator view.

Recommended merge order:

1. `sales-readiness-command-v1`
2. `estimate-contract-readiness-v1`
3. `schedule-readiness-handoff-v1`
4. `verification-sales-to-production-v1`

Rationale:

- Sales readiness should land before estimate-contract handoff language depends
  on upstream sales/estimate context.
- Estimate-contract readiness should land before schedule handoff depends on
  contract/signature/deposit readiness language.
- Schedule readiness handoff should land before verification locks the final
  cross-surface model.
- Verification should merge last because it documents and tests the combined
  sales-to-production readiness boundary.

Jeff can approve the merge order now. Jeff approval to merge is not recorded in
this packet, and no merge has occurred.

## Dirty And Out-Of-Scope Worktrees

`C:\FC-worktrees\project-next-actions` remains out of scope and was not touched.

## Blockers

No rebase or validation blockers remain for this wave.

## Next Recommended Action

Do not start another wave.

Recommended next action: Jeff review and, if approved, run the controlled merge
prompt using the merge order above.
