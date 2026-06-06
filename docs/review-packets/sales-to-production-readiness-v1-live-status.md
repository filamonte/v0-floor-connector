# Sales To Production Readiness V1 Live Status

Status date: 2026-06-06

Status source: live Git/worktree inspection from `C:\FloorConnector` on `main`
after `git push origin main`, `git fetch origin`, implementation-stream rebases
onto current `origin/main`, verification-stream rebase, focused validation,
typecheck, lint, fast preflight, and diff checks.

## Wave Status

`sales-to-production-readiness-v1` controlled merge is complete.

The three implementation streams landed on `main` in the approved order. Each
stream kept its reviewed candidate changes, introduced no schema/migration
changes, and passed required post-merge validation before the next stream
merged.

The verification stream landed last and passed required post-merge validation.

`main` status at merge preflight:

- Branch: `main`
- Clean: yes
- Ahead/behind `origin/main`: `0 ahead / 0 behind`
- Latest merged stream commit: `f4e31baf test: protect sales to production readiness`

Local `main` is ahead of `origin/main` after the controlled local merge and
governance closeout until Jeff pushes the completed sequence.

No PRs, new waves, schema changes, migration edits, worktree/branch deletion, or
work in `C:\FC-worktrees\project-next-actions` occurred as part of this
controlled merge pass.

## Stream Status Table

| Stream                                | Worktree exists | Branch                                       | Clean / dirty | Ahead / behind `origin/main` | Updated head                                           | Rebase result        | Merge readiness |
| ------------------------------------- | --------------- | -------------------------------------------- | ------------- | ---------------------------- | ------------------------------------------------------ | -------------------- | --------------- |
| `sales-readiness-command-v1`          | Yes             | `stream/sales-readiness-command-v1`          | Clean         | `1 ahead / 1 behind`         | `70c7251c feat: clarify sales readiness command`       | Merged as `89275554` | Merged          |
| `estimate-contract-readiness-v1`      | Yes             | `stream/estimate-contract-readiness-v1`      | Clean         | `1 ahead / 1 behind`         | `cdd7e2f8 feat: clarify estimate contract readiness`   | Merged as `b28fb457` | Merged          |
| `schedule-readiness-handoff-v1`       | Yes             | `stream/schedule-readiness-handoff-v1`       | Clean         | `1 ahead / 1 behind`         | `efd81835 feat: clarify schedule readiness handoff`    | Merged as `09942b0b` | Merged          |
| `verification-sales-to-production-v1` | Yes             | `stream/verification-sales-to-production-v1` | Clean         | `1 ahead / 1 behind`         | `aee909e5 test: protect sales to production readiness` | Merged as `f4e31baf` | Merged          |

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

## Merge Result

All four streams merged to `main` under Jeff's controlled merge approval.

Actual merge order:

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

Jeff approval to merge was satisfied for this wave only. No next-wave approval,
worktree retirement, branch deletion, PR creation, schema change, or migration
change occurred.

## Dirty And Out-Of-Scope Worktrees

`C:\FC-worktrees\project-next-actions` remains out of scope and was not touched.

## Blockers

No merge or validation blockers remain for this wave.

## Next Recommended Action

Do not start another wave.

Recommended next action: push `main` after governance closeout review, then
retire completed worktrees/branches only if Jeff explicitly approves cleanup.
