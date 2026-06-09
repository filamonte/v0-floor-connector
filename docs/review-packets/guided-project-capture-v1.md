# Guided Project Capture v1 Review Packet

Status: Merged / Pending Cleanup
Wave: `guided-project-capture-v1`
Date: 2026-06-08

## Executive Summary

Guided Project Capture v1 is complete across four implementation streams plus
one verification stream. The wave adds deterministic, review-first helpers for
project-owned assessment package context, guided capture checklist/readiness,
customer-safe portal assessment prompts, and estimator handoff continuity.

The implementation stays inside helper/read-model and test boundaries. It does
not add schema, migrations, routes, server actions, provider calls, autonomous
AI behavior, estimate line generation, direct pricing, or duplicate business
models.

Jeff approved the controlled merge. The streams landed on `main` in the
recommended order, all post-merge validation passed, and completed worktrees and
branches are retained pending explicit retirement approval. No next wave is
approved by this merge.

## Streams Completed

| Stream                                   | Branch                                          | Worktree                                                 | Status                                                   |
| ---------------------------------------- | ----------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| `assessment-package-model-v1`            | `stream/assessment-package-model-v1`            | `C:\FC-worktrees\assessment-package-model-v1`            | Merged to `main` as `7ca9d14a`; retained pending cleanup |
| `guided-capture-workspace-v1`            | `stream/guided-capture-workspace-v1`            | `C:\FC-worktrees\guided-capture-workspace-v1`            | Merged to `main` as `ab7acd0b`; retained pending cleanup |
| `customer-assessment-capture-v1`         | `stream/customer-assessment-capture-v1`         | `C:\FC-worktrees\customer-assessment-capture-v1`         | Merged to `main` as `d14c1854`; retained pending cleanup |
| `assessment-to-estimate-handoff-v1`      | `stream/assessment-to-estimate-handoff-v1`      | `C:\FC-worktrees\assessment-to-estimate-handoff-v1`      | Merged to `main` as `73dfc3f2`; retained pending cleanup |
| `verification-guided-project-capture-v1` | `stream/verification-guided-project-capture-v1` | `C:\FC-worktrees\verification-guided-project-capture-v1` | Merged to `main` as `6cba7bda`; retained pending cleanup |

## Commits By Stream

| Stream                                   | Commit     | Message                                            |
| ---------------------------------------- | ---------- | -------------------------------------------------- |
| `assessment-package-model-v1`            | `e40b7c3a` | `feat: add assessment package model`               |
| `guided-capture-workspace-v1`            | `f42f4918` | `feat: add guided capture workspace`               |
| `customer-assessment-capture-v1`         | `e7f31352` | `feat: add customer assessment capture`            |
| `assessment-to-estimate-handoff-v1`      | `e94d726b` | `feat: add assessment estimate handoff`            |
| `verification-guided-project-capture-v1` | `4077a90d` | `test: update guided project capture verification` |

## Merge Commits On Main

| Stream                                   | Merge commit | Message                                              |
| ---------------------------------------- | ------------ | ---------------------------------------------------- |
| `assessment-package-model-v1`            | `7ca9d14a`   | `feat: merge assessment package model v1`            |
| `guided-capture-workspace-v1`            | `ab7acd0b`   | `feat: merge guided capture workspace v1`            |
| `customer-assessment-capture-v1`         | `d14c1854`   | `feat: merge customer assessment capture v1`         |
| `assessment-to-estimate-handoff-v1`      | `73dfc3f2`   | `feat: merge assessment estimate handoff v1`         |
| `verification-guided-project-capture-v1` | `6cba7bda`   | `test: merge verification guided project capture v1` |

## Files Changed By Stream

### `assessment-package-model-v1`

- `apps/web/lib/projects/assessment-package.ts`
- `apps/web/lib/projects/assessment-package.test.ts`

### `guided-capture-workspace-v1`

- `apps/web/lib/projects/guided-capture-workspace.ts`
- `apps/web/lib/projects/guided-capture-workspace.test.ts`

### `customer-assessment-capture-v1`

- `apps/web/lib/portal/assessment-capture.ts`
- `apps/web/lib/portal/assessment-capture.test.ts`

### `assessment-to-estimate-handoff-v1`

- `apps/web/lib/estimates/assessment-handoff.ts`
- `apps/web/lib/estimates/assessment-handoff.test.ts`

### `verification-guided-project-capture-v1`

- `apps/web/lib/verification/guided-project-capture.ts`
- `apps/web/lib/verification/guided-project-capture.test.ts`

## Capabilities Added

- Project assessment package read model over existing project, customer,
  opportunity/lead, measurement, observation, attachment, and estimate context.
- Guided capture workspace summary with checklist status, missing-information
  guidance, risk prompts, and explicit no-autonomous-action boundary copy.
- Portal assessment capture summary that exposes only customer-safe requested
  prompts when portal project access exists.
- Assessment-to-estimate handoff summary that prepares human estimator review
  without generating prices, estimate lines, or customer approval state.
- Verification helper that guards stream evidence, commit identity, file
  boundaries, schema/migration drift, duplicate-model drift, task/workflow drift,
  autonomous approval, and direct pricing or estimate-line generation.

## Workflow Improvements

The wave strengthens the pre-estimate path:

`Customer / Site / Scope / Photos / Measurements -> Assessment Package -> Guided Capture Review -> Estimate Handoff -> Estimate`

The new helpers make missing context visible before estimating, surface risk
signals such as high-severity observations, and preserve continuity from
project-owned context into estimator review.

## User-Facing Changes

- Contractor-facing project review can now be supported by assessment package
  readiness, missing input, source links, and risk signals.
- Estimators get clearer handoff signals before creating customer-facing
  estimate content.
- Portal customers can be shown safe assessment requests and status copy without
  seeing internal blockers, estimator notes, pricing logic, or contractor-only
  proof.

These are helper/read-model additions only. Route integration remains a future
approved implementation step unless already handled in a later stream.

## Docs Updated

- `docs/review-packets/guided-project-capture-v1-plan.md`
- `docs/review-packets/guided-project-capture-v1-live-status.md`
- `docs/review-packets/next-portfolio-recommendation-v5.md`
- `docs/review-packets/guided-project-capture-v1.md`

`docs/current-state.md` should not be updated until Jeff approves merge and the
wave is actually merged into `main` as implemented truth.

## Validation Results

### Stream Validation Reported Complete

- `assessment-package-model-v1`: focused assessment package tests, typecheck,
  lint, `fc:preflight:fast`, `git diff --check`, and `git diff --cached --check`
  passed.
- `guided-capture-workspace-v1`: focused guided capture workspace tests,
  typecheck, lint, `fc:preflight:fast`, `git diff --check`, and
  `git diff --cached --check` passed.
- `customer-assessment-capture-v1`: focused portal assessment capture tests,
  typecheck, lint, `fc:preflight:fast`, `git diff --check`, and
  `git diff --cached --check` passed.
- `assessment-to-estimate-handoff-v1`: focused assessment handoff tests,
  typecheck, lint, `fc:preflight:fast`, `git diff --check`, and
  `git diff --cached --check` passed.
- `verification-guided-project-capture-v1`: guided project capture verification,
  operational ownership, golden workflow checks, all four implementation
  focused tests, typecheck, lint, `fc:preflight:fast`, `git diff --check`, and
  `git diff --cached --check` passed.

### Main Preflight For This Review

- `git status`: clean on `main` after live-status push.
- `git fetch origin`: completed.
- `main` parity: `0 ahead / 0 behind` before creating this packet.
- `pnpm.cmd worktree:doctor`: PASS.
- `pnpm.cmd tooling:baseline -CommandsOnly`: PASS.

### Current-Main Validation Refresh

Main was pushed with the review packet and confirmed clean/even with
`origin/main` before stream rebases. `pnpm.cmd worktree:doctor` passed with
`PASS: 20`, and `pnpm.cmd tooling:baseline -CommandsOnly` returned the expected
repo-local command set.

| Stream                                   | Updated head | Ahead / behind | Focused tests                                                                                                              | Typecheck | Lint   | `fc:preflight:fast`             | `git diff --check` |
| ---------------------------------------- | ------------ | -------------- | -------------------------------------------------------------------------------------------------------------------------- | --------- | ------ | ------------------------------- | ------------------ |
| `assessment-package-model-v1`            | `e40b7c3a`   | `1 / 0`        | `lib/projects/assessment-package.test.ts` passed, 2 tests                                                                  | Passed    | Passed | Passed                          | Passed             |
| `guided-capture-workspace-v1`            | `f42f4918`   | `1 / 0`        | `lib/projects/guided-capture-workspace.test.ts` passed, 2 tests                                                            | Passed    | Passed | Passed                          | Passed             |
| `customer-assessment-capture-v1`         | `e7f31352`   | `1 / 0`        | `lib/portal/assessment-capture.test.ts` passed, 2 tests                                                                    | Passed    | Passed | Passed                          | Passed             |
| `assessment-to-estimate-handoff-v1`      | `e94d726b`   | `1 / 0`        | `lib/estimates/assessment-handoff.test.ts` passed, 2 tests                                                                 | Passed    | Passed | Passed                          | Passed             |
| `verification-guided-project-capture-v1` | `4077a90d`   | `2 / 0`        | Guided capture verification passed, 5 tests; operational ownership passed, 4 tests; golden workflow checks passed, 5 tests | Passed    | Passed | Passed after formatting refresh | Passed             |

### Controlled Merge Validation

After each merge, the required validation passed:

| Merge commit | Stream                                   | Typecheck | Lint   | `fc:preflight:fast` | `git diff --check` |
| ------------ | ---------------------------------------- | --------- | ------ | ------------------- | ------------------ |
| `7ca9d14a`   | `assessment-package-model-v1`            | Passed    | Passed | Passed              | Passed             |
| `ab7acd0b`   | `guided-capture-workspace-v1`            | Passed    | Passed | Passed              | Passed             |
| `d14c1854`   | `customer-assessment-capture-v1`         | Passed    | Passed | Passed              | Passed             |
| `73dfc3f2`   | `assessment-to-estimate-handoff-v1`      | Passed    | Passed | Passed              | Passed             |
| `6cba7bda`   | `verification-guided-project-capture-v1` | Passed    | Passed | Passed              | Passed             |

Final targeted tests passed:

- `lib/projects/assessment-package.test.ts`: 2 passed.
- `lib/projects/guided-capture-workspace.test.ts`: 2 passed.
- `lib/portal/assessment-capture.test.ts`: 2 passed.
- `lib/estimates/assessment-handoff.test.ts`: 2 passed.
- `lib/verification/guided-project-capture.test.ts`: 5 passed.
- `lib/verification/operational-ownership.test.ts`: 4 passed.
- `lib/verification/golden-workflow-checks.test.ts`: 5 passed.

Final validation passed: typecheck, lint, `pnpm.cmd fc:preflight:fast`,
`git diff --check`, and `git diff --cached --check`.

No stream has schema or migration file changes after rebase. The reviewed file
sets remain inside the expected project, portal, estimate, and verification
helper/test boundaries.

## Governance Review

- Controlled merge completed under Jeff's explicit approval.
- No PR opened.
- No new wave started.
- No feature work added from `main`.
- No production code modified from `main`.
- No schemas or migrations modified.
- All reviewed implementation files are helper/test additions inside expected
  project, portal, estimate, and verification library boundaries.
- Active registry docs now record the merge; cleanup still requires explicit
  approval.

## Ownership Review

| Guardrail                                 | Finding                                                                                                                |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Project owns canonical assessment context | Pass. Assessment package and guided workspace helpers frame context as project-owned.                                  |
| Estimate consumes approved context        | Pass. Estimate handoff prepares estimator review and links to estimates without owning assessment context.             |
| Portal remains customer-safe              | Pass. Portal helper filters all requested items behind portal project access and hides internal/pricing/proof context. |
| AI is review/assist only                  | Pass. Boundary copy explicitly disallows autonomous AI.                                                                |
| No autonomous approval                    | Pass. No helper creates approval state or customer-facing acceptance.                                                  |
| No duplicate project model                | Pass. No project model, table, or schema path added.                                                                   |
| No duplicate estimate model               | Pass. Estimate handoff uses references only and creates no estimate model.                                             |
| No duplicate attachment model             | Pass. Helpers read existing attachment-like evidence only.                                                             |
| No duplicate task/workflow model          | Pass. Guided workspace does not create tasks or workflow engine state.                                                 |
| No schema or migration changes            | Pass. No migration, database, or schema files changed.                                                                 |

## Guided Capture Review

Assessment Package Model:

- Derives readiness from linked opportunity, measurements, observations, photos,
  customer, project, and estimate references.
- Separates readiness state from estimate ownership.
- Reports missing scope, measurements, observations, photos, and incomplete site
  assessment as review signals.

Guided Capture Workspace:

- Produces a checklist for scope summary, site assessment, measurements, surface
  observations, and photos/files.
- Assigns ownership labels to Project, Estimator, or Customer for guidance
  without creating task state.
- Keeps high-risk observations as review prompts before pricing.

Customer Assessment Capture:

- Shows requested prompts only when portal project access exists.
- Uses safe customer copy and counts.
- Keeps internal blockers, estimator notes, pricing logic, and contractor-only
  proof hidden.

Assessment To Estimate Handoff:

- Converts assessment readiness into human estimator review prompts.
- Highlights missing scope, measured areas, photos, and risk signals before
  pricing work.
- Explicitly avoids estimate-line generation, price generation, and customer
  approval.

No ownership or workflow concern blocks controlled merge after Jeff approval.

## Workflow Review

The reviewed implementation preserves the intended path:

`Customer / Site / Scope / Photos / Measurements -> Assessment Package -> Guided Capture Review -> Estimate Handoff -> Estimate`

The Assessment Package remains a project-owned read model over existing
canonical source context. Guided Capture Review makes readiness and missing
information visible. Estimate Handoff prepares human estimator review. Estimate
remains the commercial/pricing surface.

The wave does not create a parallel intake system, detached customer portal
model, alternate estimate model, alternate attachment model, workflow engine, or
direct pricing path.

## Merge Order Recommendation

Recommended controlled merge sequence:

1. `assessment-package-model-v1`
2. `guided-capture-workspace-v1`
3. `customer-assessment-capture-v1`
4. `assessment-to-estimate-handoff-v1`
5. `verification-guided-project-capture-v1`

Rationale:

- The assessment package model is the foundation.
- Guided capture workspace builds on the project-owned assessment concept.
- Portal capture stays independently customer-safe but should land after the
  core package language exists.
- Estimate handoff should land after package/readiness language is present.
- Verification should land last after implementation commits have been rebased
  and refreshed.

Controlled merge result:

- all five streams merged to `main` in the recommended order;
- all post-merge validation and final targeted tests passed;
- completed worktrees and branches are retained pending explicit cleanup
  approval;
- no next wave is approved by this merge.

## Risks And Follow-Ups

- No current-main rebase caveat remains after the validation refresh.
- Route/UI integration should remain explicit future scope where not already
  handled.
- Cleanup should retire the five wave worktrees and reconcile active registries
  only after explicit approval.
- Later waves should decide whether to continue with Workforce & Labor
  Visibility, Document Proof Closeout Package, or Communication Automation
  Readiness.

## Next Recommended Wave Options

Top follow-on options after merge and cleanup:

| Option                                  | Why It Matters                                                                                 |
| --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `workforce-and-labor-visibility-v1`     | Turns staffing, labor visibility, and accountability into a stronger owner/PM operating layer. |
| `document-proof-closeout-package-v1`    | Strengthens closeout, proof, warranty, customer trust, and final handoff value.                |
| `communication-automation-readiness-v1` | Prepares communications for safer reminder, follow-up, and provider-backed automation later.   |
| `ai-assistant-review-layer-v1`          | Builds on deterministic review/assist boundaries after more operational evidence is connected. |

Do not start a next wave until Guided Project Capture cleanup is explicitly
approved and completed.

## Jeff Decision Options

- Approve cleanup: authorize retirement of the five completed worktrees and
  eligible branches.
- Request correction: hold cleanup if any merge or validation evidence needs
  review.
- Defer cleanup: leave merged worktrees in place temporarily.
- Continue to next wave: only after cleanup is explicitly approved and
  completed.

Jeff approval for merge was granted by prompt and executed. Jeff approval for
cleanup or next-wave continuation is not granted by this packet.
