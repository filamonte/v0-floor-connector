# Chat: Verification Golden Workflow V1

Worktree: `C:\FC-worktrees\verification`
Branch: `stream/verification`
Stream: `verification`

Use `.codex/prompt-templates/verification-wave.md` as the execution template.

You are operating as FloorConnector's standing verification stream. This wave
does not target one unnamed PR. It verifies that the active development
conveyor belt, current stream hygiene, and production-readiness checks are
healthy enough for continued human-reviewed wave delivery.

## Required Docs

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `.codex/worktree-rules.md`
- `.codex/active-stream-plan.md`
- `.codex/pr-review-instructions.md`
- `.codex/review-checklists/verification.md`
- `docs/operating-core-validation-checklist.md`
- `docs/golden-workflow-verification-matrix.md`
- `docs/golden-workflow-health-report.md`
- `docs/e2e-browser-qa.md`
- `scripts/README.md`

## Standing Objective

Produce a merge-readiness style platform health report for the active
FloorConnector development conveyor belt. The report should answer whether the
current `main` branch, active stream worktrees, draft-PR guardrails, GitHub CLI
access, baseline app checks, and current golden/project/financial verification
tests are healthy, drifting, or blocked.

This wave must be executable anytime without the user providing a PR number.

## Scope

1. Confirm `main` is clean and current with `origin/main`.
2. Confirm active streams are discoverable and clean, or report exact drift:
   - `project-workspace`
   - `scheduling`
   - `communications`
   - `financials-reporting`
   - `verification`
   - `architecture-coordination`
3. Confirm GitHub CLI is available and authenticated, or report the exact
   blocker and fallback confidence.
4. Confirm wave tooling works:
   - `pnpm worktree:reconcile`
   - `pnpm worktree:audit`
   - `pnpm wave:status`
5. Confirm no active PR drift warnings are present. If drift exists, report the
   stream, PR number, local head, PR head, and why it blocks readiness.
6. Confirm merged PRs `#5`, `#6`, and `#7` are reflected on `main` if practical.
   Prefer GitHub CLI metadata plus local `origin/main` ancestry checks. If
   history or auth prevents confirmation, report that as unknown rather than
   inferred.
7. Run baseline app validation:
   - `pnpm.cmd --filter @floorconnector/web typecheck`
   - `pnpm.cmd --filter @floorconnector/web lint`
8. Run the current targeted verification tests where practical:
   - `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/verification/golden-workflow-checks.test.ts`
   - `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/ai-operational-copilot/summary.test.ts lib/projects/timeline.test.ts lib/projects/operational-workspace.test.ts`
   - `pnpm.cmd exec tsx --test apps/web/lib/financials/collections-command-center.test.ts apps/web/lib/financials/collections-core.test.ts apps/web/lib/financials/collections-summary.test.ts`
9. Run browser-level proof only when protected auth, local dev server, and
   fixtures are healthy:
   - `pnpm.cmd exec playwright test e2e/golden-workflow-verification.spec.js --project=chromium-protected`
   - `pnpm.cmd exec playwright test e2e/project-detail-ui.spec.js --project=chromium-protected`
10. Document skipped checks honestly, especially Supabase auth, saved storage
    state, fixed fixture, local dev server, or environment limitations.

## Required Procedure

1. Start with:

   ```powershell
   git status --short --branch
   git rev-parse --abbrev-ref HEAD
   git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}'
   git rev-list --left-right --count HEAD...'@{upstream}'
   ```

   If the stream has no upstream, report that explicitly and continue with
   local-only branch status.

2. Fetch read-only refs:

   ```powershell
   git fetch origin
   ```

3. Check `main` from the canonical workspace:

   ```powershell
   git -C C:\FloorConnector status --short --branch
   git -C C:\FloorConnector rev-list --left-right --count main...origin/main
   ```

4. Check GitHub CLI:

   ```powershell
   gh --version
   gh auth status
   ```

5. Run conveyor-belt tooling:

   ```powershell
   pnpm worktree:reconcile
   pnpm worktree:audit
   pnpm wave:status
   ```

6. Confirm merged PR reflection when practical:

   ```powershell
   gh pr view 5 --json number,state,mergedAt,mergeCommit,headRefName,headRefOid,baseRefName,url
   gh pr view 6 --json number,state,mergedAt,mergeCommit,headRefName,headRefOid,baseRefName,url
   gh pr view 7 --json number,state,mergedAt,mergeCommit,headRefName,headRefOid,baseRefName,url
   git merge-base --is-ancestor <merge-or-head-sha> origin/main
   ```

7. Run baseline and targeted validations from this worktree. Use the commands
   listed in the scope section.

8. Finish with:

   ```powershell
   git diff --check
   git diff --cached --check
   git status --short --branch
   ```

## Readiness Rules

- `PASS`: main is current, active streams are visible, no unexpected dirty
  worktrees or PR drift warnings exist, GitHub CLI is authenticated, baseline
  validation passes, and targeted tests either pass or are skipped for a
  concrete non-product blocker.
- `CONCERNS`: checks are mostly healthy, but there is non-blocking stream drift,
  missing optional browser coverage, GitHub metadata uncertainty, or a known
  fixture/auth limitation.
- `BLOCK`: main is dirty or behind, conveyor-belt tooling fails, active streams
  are missing, PR drift warnings are unresolved, baseline typecheck/lint fails,
  or canonical workflow tests fail.

## Out Of Scope

- Feature implementation.
- Schema, route, auth, or business-logic changes.
- Fake QA data or local-only persistence.
- Opening PRs, marking PRs ready, merging PRs, pushing branches, deleting
  branches, or deleting worktrees.
- Treating redirects, 404s, or missing fixtures as successful QA unless they
  are the expected negative case.

## Final Report

Include:

- Verification conclusion: `PASS`, `CONCERNS`, or `BLOCK`.
- Branch, upstream, ahead/behind state, and final git status.
- Main cleanliness/currentness result.
- Active stream health summary.
- GitHub CLI/auth result.
- Wave tooling results.
- PR drift result.
- PR `#5`, `#6`, and `#7` main-reflection result.
- Baseline validation results.
- Targeted golden/project/financial test results.
- Browser/E2E results or exact skip reasons.
- Architecture and workflow safety conclusion.
- Remaining risks and recommended next Verification slice.
