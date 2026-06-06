# Sales To Production Readiness V1 Review Packet

Status: Integration Review / Jeff Review Required
Doc Type: Review Packet
Review date: 2026-06-06
Review source: live Git/worktree inspection from `C:\FloorConnector` on `main`
after `git fetch origin`, required main preflight checks, stream worktree
inspection, and diff review.

This packet does not merge branches, open PRs, approve implementation, start a
new wave, modify schema, or mark Jeff approval as granted.

## Executive Summary

`sales-to-production-readiness-v1` is structurally sound and aligned with the
Operational Command Center model, but the three implementation streams are not
merge-ready as-is because `origin/main` moved after their commits. They are
clean and still contain their committed slices, but each is now `1 ahead / 2
behind` `origin/main`.

The verification stream is clean, contains its reported verification commit,
and is `1 ahead / 0 behind` `origin/main`. It should still merge last and should
be rerun after the implementation streams are rebased and reconciled, because
the verification evidence is intended to protect the final combined
sales-to-production handoff.

Overall recommendation: do not approve immediate merges yet. Approve rebase and
revalidation of the three implementation streams first, then run the final
verification validation against the reconciled merge order.

## Main Branch Preflight

| Check                                       | Result                  |
| ------------------------------------------- | ----------------------- |
| Working directory                           | `C:\FloorConnector`     |
| Branch                                      | `main`                  |
| `git status --short --branch` before review | `## main...origin/main` |
| `git fetch origin`                          | Passed                  |
| Ahead / behind `origin/main`                | `0 ahead / 0 behind`    |
| Repo root                                   | `C:/FloorConnector`     |
| `pnpm.cmd worktree:doctor`                  | Passed, `PASS: 20`      |
| `pnpm.cmd tooling:baseline -CommandsOnly`   | Passed                  |

`pnpm.cmd tooling:baseline -CommandsOnly` returned:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd devtools:link
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
```

## Streams Completed

| Stream                              | Branch                                       | Worktree                                              | Live state                                | Readiness decision                                      |
| ----------------------------------- | -------------------------------------------- | ----------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------- |
| Sales Readiness Command V1          | `stream/sales-readiness-command-v1`          | `C:\FC-worktrees\sales-readiness-command-v1`          | Clean, `1 ahead / 2 behind` `origin/main` | Ready after rebase                                      |
| Estimate Contract Readiness V1      | `stream/estimate-contract-readiness-v1`      | `C:\FC-worktrees\estimate-contract-readiness-v1`      | Clean, `1 ahead / 2 behind` `origin/main` | Ready after rebase                                      |
| Schedule Readiness Handoff V1       | `stream/schedule-readiness-handoff-v1`       | `C:\FC-worktrees\schedule-readiness-handoff-v1`       | Clean, `1 ahead / 2 behind` `origin/main` | Ready after rebase                                      |
| Verification Sales To Production V1 | `stream/verification-sales-to-production-v1` | `C:\FC-worktrees\verification-sales-to-production-v1` | Clean, `1 ahead / 0 behind` `origin/main` | Ready after implementation rebases and final validation |

All four worktrees exist, are on the expected branch, are clean, and contain the
reported committed slice. Required governance/tooling docs exist in each
worktree:

- `docs/automation-tooling-baseline.md`
- `docs/parallel-development-governance.md`
- `docs/operational-architecture-v1.md`
- `active-waves.md`
- `active-worktrees.md`
- `.codex/active-stream-plan.md`

Registry reconciliation remains required after the wave is accepted: the active
registries on `main` still describe these streams as Approved / Not Started,
while the stream worktrees now contain completed commits.

## Commits By Stream

| Stream                              | Commit                                     | Message                                       |
| ----------------------------------- | ------------------------------------------ | --------------------------------------------- |
| Sales Readiness Command V1          | `75f89ef1`                                 | `feat: clarify sales readiness command`       |
| Estimate Contract Readiness V1      | `15d1fe41`                                 | `feat: clarify estimate contract readiness`   |
| Schedule Readiness Handoff V1       | `24f3d93e`                                 | `feat: clarify schedule readiness handoff`    |
| Verification Sales To Production V1 | `80a90c3a5cdd4f3d420fe9e9c0a0623ebeaf9cb3` | `test: protect sales to production readiness` |

## Files Changed By Stream

### Sales Readiness Command V1

- `apps/web/app/(app)/leads/[leadId]/page.tsx`
- `apps/web/lib/opportunities/follow-up-read-model.test.ts`
- `apps/web/lib/opportunities/follow-up-read-model.ts`

### Estimate Contract Readiness V1

- `apps/web/app/(app)/estimates/[estimateId]/page.tsx`
- `apps/web/lib/document-readiness/readiness.test.ts`
- `apps/web/lib/document-readiness/readiness.ts`

### Schedule Readiness Handoff V1

- `apps/web/app/(app)/schedule/page.tsx`
- `apps/web/components/schedule-crewboard-presentational.tsx`
- `apps/web/lib/schedule/dispatch-board.test.ts`
- `apps/web/lib/schedule/dispatch-board.ts`
- `apps/web/lib/schedule/read-model.test.ts`
- `apps/web/lib/schedule/read-model.ts`

### Verification Sales To Production V1

- `apps/web/lib/verification/sales-to-production-readiness.test.ts`
- `apps/web/lib/verification/sales-to-production-readiness.ts`
- `docs/golden-workflow-verification-matrix.md`

## Product Capabilities Added

- Sales readiness now derives whether an opportunity has enough canonical
  customer, project, site assessment, requirements, measurement, observation,
  attachment, and estimate-owner context to move into estimating.
- Estimate-to-contract readiness now clarifies whether the estimate is blocked,
  waiting on customer approval, ready for contract generation, blocked by
  deposit, or should be reviewed from the Project readiness hub.
- Schedule and Field handoff now carry clearer readiness handoff labels,
  blocker links, and Project-owned blocker routing before scheduling or field
  action proceeds.
- Verification now has a pure sales-to-production readiness helper that composes
  existing workflow, readiness, and operational ownership checks with
  wave-specific boundary evidence.

## Workflow Improvements

- Strengthens the intended handoff from sales intake to estimating without
  creating a second intake or CRM model.
- Makes estimate approval, contract generation, signature readiness, deposit
  readiness, and schedule handoff easier to scan without mutating source
  records.
- Keeps blocked scheduling work visible while routing commercial blockers back
  to the owning canonical source record.
- Adds verification evidence for the canonical chain:
  `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`.

## User-Facing Changes

- Lead Workspace shows a Site Visit / Scope Intake / Estimate Plan readiness
  panel with blockers and recommended next action.
- Estimate Workspace shows an Estimate to Contract Readiness panel with
  blockers, recommended next action, and a Settings workflow-default link.
- Schedule / CrewBoard field command views show readiness handoff labels and
  avoid presenting readiness-blocked jobs as schedule/crew actions.
- No portal route, Dashboard route, schema, migration, payment, signature, or
  provider behavior change was found in the reviewed diffs.

## Docs Updated

The verification stream updates:

- `docs/golden-workflow-verification-matrix.md`

This review task adds:

- `docs/review-packets/sales-to-production-readiness-v1.md`

## Validation Results

Reported stream validation:

| Stream                              | Reported validation                                                                                                                                                                                                                                            |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sales Readiness Command V1          | Focused tests passed, typecheck passed, lint passed, `fc:preflight:fast` passed, diff checks passed                                                                                                                                                            |
| Estimate Contract Readiness V1      | Focused tests passed, typecheck passed, lint passed, `fc:preflight:fast` passed, diff checks passed                                                                                                                                                            |
| Schedule Readiness Handoff V1       | Focused tests passed, typecheck passed, lint passed, `fc:preflight:fast` passed, diff checks passed                                                                                                                                                            |
| Verification Sales To Production V1 | New verification helper tests: 12 passed; opportunities + document readiness: 12 passed; schedule read model + dispatch board: 20 passed; project next actions: 6 passed; typecheck passed; lint passed; `fc:preflight:fast` passed; `git diff --check` passed |

Current review-task validation is recorded in the final report for this task.

## Governance Review

The wave aligns with the governing Operational Command Center rule:

- Dashboard prioritizes; no Dashboard files changed.
- Project remains diagnostic; schedule blockers route back to Project or the
  owning source record.
- Owning workspaces act; Lead, Estimate, Schedule, and Field-facing schedule
  surfaces each clarify their own bounded next step.
- Settings owns configuration; Estimate links workflow defaults to
  `/settings/workflows` instead of adding settings mutation to the Estimate
  Workspace.
- Field owns scheduling/action handoff; Field command-center scheduling views
  use canonical jobs and readiness context without creating a new dispatch
  model.
- Portal remains customer-safe and unchanged; no portal files changed.
- Super Admin and platform policy were not touched.

No governance drift was found in the reviewed diffs.

## Ownership Conflict Result

No ownership conflict was found.

- Sales readiness stays in the Lead / Opportunity Workspace and existing
  opportunity read model.
- Estimate-contract readiness stays in Estimate Workspace and existing document
  readiness helpers.
- Schedule readiness handoff stays on Schedule / CrewBoard and existing
  schedule read models.
- Verification stays in pure verification helpers and the golden workflow
  matrix.

The only coordination issue is lifecycle documentation: `active-waves.md`,
`active-worktrees.md`, and `.codex/active-stream-plan.md` still show the wave
as Approved / Not Started on `main`. That is a registry reconciliation
follow-up, not a product-code correction.

## Duplicate Model Check

No duplicate model or unauthorized schema change was found.

| Risk area                                     | Result                                                |
| --------------------------------------------- | ----------------------------------------------------- |
| Duplicate opportunity / intake model          | Not found                                             |
| Duplicate customer / project model            | Not found                                             |
| Duplicate estimate / contract readiness model | Not found; helper extends existing document readiness |
| Duplicate contract / signature model          | Not found                                             |
| Duplicate invoice / payment readiness model   | Not found                                             |
| Duplicate schedule / dispatch model           | Not found                                             |
| Portal-owned operational state                | Not found                                             |
| Schema or migration changes                   | Not found                                             |
| Provider/customer-facing mutation             | Not found                                             |
| Local-only persistence                        | Not found                                             |

## IA / Workflow Drift Check

No IA or workflow drift was found.

- No dashboard sprawl was introduced.
- No settings mutation controls were placed on operational pages.
- Project was not turned into an action silo.
- Field was not turned into duplicate project diagnosis.
- The sales-to-production handoff was strengthened by making readiness and
  source-record ownership more explicit.
- Readiness summaries are connected to existing record workspaces and do not
  create disconnected summaries.

## Merge Order Recommendation

Recommended order remains:

1. Sales Readiness Command V1
2. Estimate Contract Readiness V1
3. Schedule Readiness Handoff V1
4. Verification Sales To Production V1

Rationale:

- Sales readiness establishes upstream estimate handoff clarity first.
- Estimate-contract readiness depends on clearer upstream commercial context.
- Schedule readiness should land after commercial and contract/deposit
  readiness language is current.
- Verification should merge last after implementation streams are rebased,
  validated, and reconciled.

## Minimum Required Validation After Final Rebase

Run in each implementation stream after rebase onto current `origin/main`:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd devtools:link
pnpm.cmd --filter @floorconnector/web exec tsx --test lib/opportunities/follow-up-read-model.test.ts
pnpm.cmd --filter @floorconnector/web exec tsx --test lib/document-readiness/readiness.test.ts
pnpm.cmd --filter @floorconnector/web exec tsx --test lib/schedule/read-model.test.ts lib/schedule/dispatch-board.test.ts
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
git diff --cached --check
```

Run in the verification stream after implementation streams are rebased and the
candidate merge order is fixed:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd devtools:link
pnpm.cmd --filter @floorconnector/web exec tsx --test lib/verification/sales-to-production-readiness.test.ts
pnpm.cmd --filter @floorconnector/web exec tsx --test lib/opportunities/follow-up-read-model.test.ts lib/document-readiness/readiness.test.ts
pnpm.cmd --filter @floorconnector/web exec tsx --test lib/schedule/read-model.test.ts lib/schedule/dispatch-board.test.ts
pnpm.cmd --filter @floorconnector/web exec tsx --test lib/projects/next-actions.test.ts
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
git diff --cached --check
```

Optional but recommended before Jeff approves final merges:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd fc:preflight:fast
```

on `main` after the candidate sequence is merged locally or in the final
integration branch.

## Risks / Follow-Ups

- Required: rebase the three implementation streams because they are each
  behind `origin/main` by two commits.
- Required: rerun focused and full validation after those rebases.
- Required: keep `C:\FC-worktrees\project-next-actions` untouched unless Jeff
  explicitly scopes it.
- Required after acceptance: reconcile active registries so stream lifecycle
  status matches completed work and any approved merge state.
- Recommended: rerun verification after implementation streams are reconciled,
  because the verification stream should prove the final combined behavior.
- Watch item: any future portal-facing readiness copy must remain
  customer-safe and must not expose contractor-only readiness internals.

## Next Recommended Wave Options

Do not start another wave from this packet. If Jeff later approves continuation
after this wave merges, the next options to consider are:

- Field execution depth over canonical jobs, Daily Logs, work items, and field
  evidence.
- Customer portal trust / customer-safe status clarity after internal
  readiness signals are trusted.
- Reporting and intelligence over the strengthened sales-to-production handoff.
- Integration/provider readiness only after internal source-record gates and
  approval boundaries remain stable.

## Jeff Review Decision Options

Jeff may choose one of:

- Approve rebase and final validation before merge approval.
- Request correction on a specific stream.
- Defer one or more streams.
- Continue to next wave only after this wave is merged and explicitly approved.

Jeff approval to merge is not recorded in this packet.
