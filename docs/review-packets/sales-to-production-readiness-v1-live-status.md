# Sales To Production Readiness V1 Live Status

Status date: 2026-06-06

Status source: live Git/worktree inspection from `C:\FloorConnector` on `main`
after `git fetch origin`, `git push origin main`, stream rebase onto current
`origin/main`, implementation recovery, and validation.

## Wave Status

`sales-to-production-readiness-v1` implementation recovery is complete for the
three approved implementation streams.

The streams were rebased onto current `origin/main` after `origin/main` advanced
to `e47cd029 docs: harden AI operational governance`. Each implementation
stream is clean, has one implementation commit ahead of `origin/main`, and has
current validation evidence. The wave verification stream has not started and
should be rebased before work begins.

`main` status after fetch:

- Branch: `main`
- Clean: yes
- Ahead/behind `origin/main`: `0 ahead / 0 behind`
- Latest `main` commit: `e47cd029 docs: harden AI operational governance`

## Stream Status Table

| Stream                                | Worktree exists | Branch                                       | Clean / dirty | Ahead / behind `origin/main` | Latest commit                                               | Implementation appears complete                                | Final report found                                          | Verification should start                                          |
| ------------------------------------- | --------------- | -------------------------------------------- | ------------- | ---------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------ |
| `sales-readiness-command-v1`          | Yes             | `stream/sales-readiness-command-v1`          | Clean         | `1 ahead / 0 behind`         | `75f89ef1 feat: clarify sales readiness command`            | Yes; sales estimate-readiness helper, tests, and lead UI added | No separate stream final report found                       | Yes, as part of wave verification after verification stream rebase |
| `estimate-contract-readiness-v1`      | Yes             | `stream/estimate-contract-readiness-v1`      | Clean         | `1 ahead / 0 behind`         | `15d1fe41 feat: clarify estimate contract readiness`        | Yes; estimate-to-contract handoff helper, tests, and UI added  | No separate stream final report found                       | Yes, as part of wave verification after verification stream rebase |
| `schedule-readiness-handoff-v1`       | Yes             | `stream/schedule-readiness-handoff-v1`       | Clean         | `1 ahead / 0 behind`         | `24f3d93e feat: clarify schedule readiness handoff`         | Yes; committed schedule readiness handoff slice remains clean  | No separate stream final report found in accessible history | Yes, as part of wave verification after verification stream rebase |
| `verification-sales-to-production-v1` | Yes             | `stream/verification-sales-to-production-v1` | Clean         | `0 ahead / 4 behind`         | `226b9a3b docs: approve sales to production readiness wave` | Not started; intentionally held until implementation completed | Not applicable; verification has not started                | Yes; rebase onto `origin/main` first, then start verification only |

## Implementation Completion Status

- `sales-readiness-command-v1`: complete. The lead workspace now derives a
  sales-to-estimate readiness summary from existing opportunity, customer,
  project, site-assessment, scope, attachment, and estimate-owner context.
- `estimate-contract-readiness-v1`: complete. The estimate workspace now
  derives estimate-to-contract handoff readiness from the canonical estimate
  and project readiness state, and routes workflow-default review back to
  Settings.
- `schedule-readiness-handoff-v1`: complete. The existing committed slice was
  rebased and revalidated; it clarifies ready-to-schedule ownership and Field
  handoff without adding duplicate schedule/job records.
- `verification-sales-to-production-v1`: not started. It is now eligible to
  start after rebasing onto current `origin/main`.

Overall implementation status: complete for the three approved implementation
streams. Verification is ready to start as the next wave action after rebasing
the verification worktree.

## Commits By Stream

| Stream                           | Commit hash                                | Commit message                              |
| -------------------------------- | ------------------------------------------ | ------------------------------------------- |
| `sales-readiness-command-v1`     | `75f89ef1841772061911073c1c5426a3799aecbb` | `feat: clarify sales readiness command`     |
| `estimate-contract-readiness-v1` | `15d1fe4109d91d49a8b23c80156b30e72c5a1453` | `feat: clarify estimate contract readiness` |
| `schedule-readiness-handoff-v1`  | `24f3d93eb796e85469ac84714f5faefc9189b57a` | `feat: clarify schedule readiness handoff`  |

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

No files changed. Verification has not started.

## Validations By Stream

| Stream                           | Validation results                                                                                                                                                                                                                                                                                                     |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sales-readiness-command-v1`     | Passed: `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/opportunities/follow-up-read-model.test.ts` (7 tests); `pnpm.cmd --filter @floorconnector/web typecheck`; `pnpm.cmd --filter @floorconnector/web lint`; `pnpm.cmd fc:preflight:fast`; `git diff --check`; `git diff --cached --check` before commit |
| `estimate-contract-readiness-v1` | Passed: `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/document-readiness/readiness.test.ts` (11 tests); `pnpm.cmd --filter @floorconnector/web typecheck`; `pnpm.cmd --filter @floorconnector/web lint`; `pnpm.cmd fc:preflight:fast`; `git diff --check`; `git diff --cached --check` before commit      |
| `schedule-readiness-handoff-v1`  | Passed: `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/schedule/read-model.test.ts lib/schedule/dispatch-board.test.ts` (23 tests); `pnpm.cmd --filter @floorconnector/web typecheck`; `pnpm.cmd --filter @floorconnector/web lint`; `pnpm.cmd fc:preflight:fast`; `git diff --check`                      |

All three implementation streams were revalidated after rebasing onto current
`origin/main`.

## Dirty And Out-Of-Scope Worktrees

`C:\FC-worktrees\project-next-actions` exists and remains dirty/out of scope.
It was inspected for status only and not modified.

Dirty files in `project-next-actions`:

- `apps/web/app/(app)/contracts/[contractId]/page.tsx`
- `apps/web/app/(app)/customers/[customerId]/page.tsx`
- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/components/related-conversations-card.tsx`
- `apps/web/lib/communications/record-continuity.test.ts`
- `apps/web/lib/communications/record-continuity.ts`
- `docs/current-state.md`

No active `sales-to-production-readiness-v1` implementation stream touches the
same files as the dirty `project-next-actions` worktree.

## Blockers

- No implementation blockers remain for the three approved implementation
  streams.
- `verification-sales-to-production-v1` is clean but `0 ahead / 4 behind`; it
  must be rebased onto current `origin/main` before verification starts.
- `project-next-actions` remains dirty and out of scope; it should remain
  untouched unless Jeff explicitly scopes it.

## Human Attention Needed

Human attention is needed to decide whether to start the verification stream
now. The implementation prerequisites are met, but no merges or PRs should
occur until verification is complete and Jeff explicitly approves the next
step.

## Verification Readiness

Verification is ready to start as the next action for the wave.

Required first step: rebase `C:\FC-worktrees\verification-sales-to-production-v1`
onto current `origin/main`, then run the verification-only pass against the
three implementation commits listed above.

## Next Recommended Action

Do not merge, open PRs, or start another wave.

Recommended next action: start `verification-sales-to-production-v1` only,
after rebasing that verification worktree onto current `origin/main`.
